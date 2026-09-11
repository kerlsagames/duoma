import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import {
  AUDIO_WHISPERS,
  secondsForText,
  type AudioFolder,
  type AudioNote,
} from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";

const BG = "#0B0710";
const ROSE = "#FF8FA3";
const FOLDERS: { id: AudioFolder; label: string }[] = [
  { id: "sweet", label: "Sweet" },
  { id: "bedtime", label: "Bedtime" },
  { id: "spicy", label: "After dark" },
  { id: "voice", label: "Voice memos" },
];

function Wave({ playing }: { playing: boolean }) {
  const bars = useRef(
    Array.from({ length: 18 }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (!playing) {
      bars.forEach((bar) => bar.setValue(0.28));
      return;
    }
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 0.3 + ((i * 17) % 70) / 100,
            duration: 280 + (i % 5) * 90,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 0.2,
            duration: 260 + (i % 4) * 80,
            useNativeDriver: false,
          }),
        ])
      )
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [bars, playing]);

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 48 }}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            borderRadius: 4,
            backgroundColor: ROSE,
            height: bar.interpolate({
              inputRange: [0, 1],
              outputRange: [6, 48],
            }),
          }}
        />
      ))}
    </View>
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
      setError("Give it a title and something to hear.");
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

  const visibleText = playing
    ? playing.body.slice(0, Math.max(12, Math.floor(playing.body.length * progress)))
    : "";

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={ROSE}
        fallback={"/hub/desire" as Href}
        kicker="Desire · vault"
        title="Voice notes"
        body={`Whispers, bedtime stories, and the thing you meant to say in the kitchen. Played as a private reading — for ${them} or for later-you.`}
        ready={ready}
      >
        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 22,
            backgroundColor: "#160E16",
            borderWidth: 1,
            borderColor: "rgba(255,143,163,0.28)",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: ROSE, fontFamily: "SpaceMono", fontSize: 11 }}>
              {playing ? "PLAYING" : "CASSETTE"}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 12 }}>
              {playing ? `${Math.round(progress * (playing.seconds))}s` : "idle"}
            </Text>
          </View>
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <Wave playing={Boolean(playing)} />
          </View>
          {playing ? (
            <Text
              style={{
                marginTop: 16,
                fontFamily: SERIF,
                fontSize: 18,
                lineHeight: 26,
                color: "#F8E8EE",
              }}
            >
              {visibleText}
              <Text style={{ color: ROSE }}>▌</Text>
            </Text>
          ) : (
            <Text style={{ marginTop: 16, color: "rgba(244,244,246,0.4)", fontFamily: SERIF }}>
              Press play on a note. It reads in their voice, in yours — whichever you saved.
            </Text>
          )}
        </View>

        <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {FOLDERS.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setFolder(row.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: folder === row.id ? `${ROSE}33` : "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: folder === row.id ? ROSE : "#F4F4F6", fontSize: 13 }}>
                {row.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {notes.length === 0 ? (
          <EmptyHint text="This folder is quiet. Record a whisper, or drop in a bedtime story from the library below." />
        ) : (
          <View style={{ marginTop: 14, gap: 8 }}>
            {notes.map((note) => (
              <Pressable
                key={note.id}
                onPress={() => setPlaying(note)}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: "#151018",
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={playing?.id === note.id ? "pause" : "play"}
                  size={20}
                  color={ROSE}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#F4F4F6", fontWeight: "700" }}>{note.title}</Text>
                  <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
                    {note.seconds}s · {note.fromId === user?.id ? "You" : them}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <Text
          style={{
            marginTop: 24,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(255,143,163,0.7)",
          }}
        >
          RECORD A WHISPER
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="rgba(244,244,246,0.3)"
          style={inputStyle}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="What should they hear?"
          placeholderTextColor="rgba(244,244,246,0.3)"
          multiline
          style={[inputStyle, { minHeight: 90 }]}
        />
        <Pressable
          onPress={() => void save()}
          style={{
            height: 48,
            borderRadius: 14,
            backgroundColor: ROSE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A0810", fontWeight: "800" }}>Lock in the vault</Text>
        </Pressable>
        {error ? <Text style={{ color: "#FF8A8A" }}>{error}</Text> : null}

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(255,143,163,0.7)",
          }}
        >
          LIBRARY
        </Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          {AUDIO_WHISPERS.map((row) => (
            <Pressable
              key={row.title}
              onPress={() => void save(row)}
              style={{
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,143,163,0.2)",
              }}
            >
              <Text style={{ color: ROSE, fontSize: 12 }}>{row.folder}</Text>
              <Text style={{ color: "#F4F4F6", fontFamily: SERIF, fontSize: 18 }}>
                {row.title}
              </Text>
              <Text
                numberOfLines={2}
                style={{ marginTop: 4, color: "rgba(244,244,246,0.5)", fontSize: 13 }}
              >
                {row.body}
              </Text>
            </Pressable>
          ))}
        </View>
      </MiniChrome>
    </Screen>
  );
}

const inputStyle = {
  marginTop: 8,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: "#151018",
  color: "#F4F4F6",
} as const;
