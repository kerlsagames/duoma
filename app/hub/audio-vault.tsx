import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import {
  AUDIO_WHISPERS,
  secondsForText,
  type AudioFolder,
  type AudioNote,
} from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";

const BG = "#12080C";
const ROSE = "#E8A0B0";
const FOLDERS: { id: AudioFolder; label: string; tape: string }[] = [
  { id: "sweet", label: "Side A · sweet", tape: "#E8A0B0" },
  { id: "bedtime", label: "Side B · sleep", tape: "#8FA8C8" },
  { id: "spicy", label: "After dark", tape: "#FF4D6A" },
  { id: "voice", label: "Field notes", tape: "#F0C75E" },
];

function Reel({ spinning, x }: { spinning: boolean; x: number }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spinning) return;
    const loop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      rot.setValue(0);
    };
  }, [rot, spinning]);
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View style={{ position: "absolute", left: x, top: 28, transform: [{ rotate: spin }] }}>
      <Svg width={72} height={72}>
        <Circle cx={36} cy={36} r={34} fill="#2A1A16" stroke="#C4A484" strokeWidth={3} />
        <Circle cx={36} cy={36} r={10} fill="#C4A484" />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <Circle
              key={deg}
              cx={36 + Math.cos(rad) * 18}
              cy={36 + Math.sin(rad) * 18}
              r={4}
              fill="#8B6A4A"
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

export default function AudioVaultScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [folder, setFolder] = useState<AudioFolder>("sweet");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [playing, setPlaying] = useState<AudioNote | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const notes = useMemo(
    () => data.audioNotes.filter((row) => row.folder === folder),
    [data.audioNotes, folder]
  );
  const tape = FOLDERS.find((row) => row.id === folder)?.tape ?? ROSE;

  useEffect(() => {
    if (!playing) return;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(1, (Date.now() - start) / (playing.seconds * 1000));
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(tick);
        setPlaying(null);
      }
    }, 80);
    return () => clearInterval(tick);
  }, [playing]);

  const save = async (preset?: { title: string; body: string; folder: AudioFolder }) => {
    if (!user) return;
    const nextTitle = (preset?.title ?? title).trim();
    const nextBody = (preset?.body ?? body).trim();
    const nextFolder = preset?.folder ?? folder;
    if (!nextTitle || !nextBody) {
      setError("A tape needs a title and something to hear.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      audioNotes: [
        {
          id: createId(),
          fromId: user.id,
          folder: nextFolder,
          title: nextTitle,
          body: nextBody,
          seconds: secondsForText(nextBody),
          createdAt: nowIso(),
        },
        ...state.audioNotes,
      ],
    }));
    if (!preset) {
      setTitle("");
      setBody("");
    }
  };

  const visible = playing
    ? playing.body.slice(0, Math.max(8, Math.floor(playing.body.length * progress)))
    : "";

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/desire" as Href} accent={ROSE}>
        <Text
          style={{
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: ROSE,
            textAlign: "center",
          }}
        >
          mixtape for {them}
        </Text>
        <View
          style={{
            marginTop: 10,
            height: 168,
            borderRadius: 18,
            backgroundColor: "#2A1614",
            borderWidth: 3,
            borderColor: "#C4A484",
            overflow: "hidden",
          }}
        >
          <Svg width="100%" height="168">
            <Rect x={0} y={0} width={400} height={168} fill="#2A1614" />
            <Rect x={24} y={118} width={280} height={18} rx={4} fill="#1A0C0C" />
            <Rect x={24} y={118} width={280 * (playing ? progress : 0.12)} height={18} rx={4} fill={tape} />
          </Svg>
          <Reel spinning={Boolean(playing)} x={36} />
          <Reel spinning={Boolean(playing)} x={168} />
          <Text
            style={{
              position: "absolute",
              right: 16,
              top: 18,
              fontFamily: "SpaceMono",
              color: "#7CFFB2",
              fontSize: 12,
            }}
          >
            {playing ? String(Math.floor(progress * playing.seconds)).padStart(3, "0") : "000"}
          </Text>
        </View>

        <View
          style={{
            marginTop: 14,
            minHeight: 110,
            backgroundColor: "#1A1012",
            borderRadius: 12,
            padding: 14,
            borderLeftWidth: 4,
            borderLeftColor: tape,
          }}
        >
          {playing ? (
            <Text style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 26, color: "#F8E8EE" }}>
              {visible}
              <Text style={{ color: tape }}>▍</Text>
            </Text>
          ) : (
            <Text style={{ fontFamily: HANDWRITING, fontSize: 20, color: "rgba(248,232,238,0.45)" }}>
              Press a track. The deck reads it in your voice — slowly, like a late-night radio.
            </Text>
          )}
        </View>

        <View style={{ marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {FOLDERS.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setFolder(row.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: folder === row.id ? row.tape : "#1A1012",
                borderRadius: 4,
                transform: [{ rotate: folder === row.id ? "-2deg" : "0deg" }],
              }}
            >
              <Text
                style={{
                  color: folder === row.id ? "#1A0810" : ROSE,
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                }}
              >
                {row.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 12, gap: 8 }}>
          {!ready || notes.length === 0 ? (
            <Text style={{ color: "rgba(248,232,238,0.4)", fontFamily: SERIF }}>
              This side of the tape is blank. Record a whisper, or drop a library story in.
            </Text>
          ) : (
            notes.map((note, i) => (
              <Pressable
                key={note.id}
                onPress={() => setPlaying(note)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.06)",
                }}
              >
                <Text style={{ color: tape, fontFamily: "SpaceMono", width: 28 }}>
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#F8E8EE", fontFamily: SERIF, fontSize: 18 }}>
                    {note.title}
                  </Text>
                  <Text style={{ color: "rgba(248,232,238,0.4)", fontSize: 12 }}>
                    {note.seconds}s
                  </Text>
                </View>
                <Text style={{ color: tape }}>{playing?.id === note.id ? "■" : "▶"}</Text>
              </Pressable>
            ))
          )}
        </View>

        <Text style={{ marginTop: 20, fontFamily: HANDWRITING, fontSize: 22, color: ROSE }}>
          Record onto the tape
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Track title"
          placeholderTextColor="rgba(248,232,238,0.3)"
          style={inputStyle}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="What should they hear in the dark?"
          placeholderTextColor="rgba(248,232,238,0.3)"
          multiline
          style={[inputStyle, { minHeight: 80 }]}
        />
        <Pressable
          onPress={() => void save()}
          style={{
            marginTop: 8,
            height: 48,
            backgroundColor: ROSE,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#1A0810", fontWeight: "800" }}>Press record</Text>
        </Pressable>
        {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}

        <View style={{ marginTop: 20, gap: 8 }}>
          {AUDIO_WHISPERS.map((row) => (
            <Pressable
              key={row.title}
              onPress={() => void save(row)}
              style={{
                padding: 12,
                backgroundColor: "#1A1012",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: ROSE, fontFamily: "SpaceMono", fontSize: 10 }}>
                LIBRARY · {row.folder}
              </Text>
              <Text style={{ fontFamily: SERIF, fontSize: 18, color: "#F8E8EE" }}>{row.title}</Text>
            </Pressable>
          ))}
        </View>
      </Stage>
    </Screen>
  );
}

const inputStyle = {
  marginTop: 8,
  borderRadius: 6,
  padding: 12,
  backgroundColor: "#1A1012",
  color: "#F8E8EE",
} as const;
