import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { sectionAccent } from "@/lib/hub-theme";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { type AudioFolder, type AudioNote } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import {
  abandonRecorder,
  canRecordAudio,
  defaultVoiceTitle,
  deleteVoiceClip,
  explainMicError,
  formatTapeTime,
  MAX_VOICE_SECONDS,
  persistVoiceClip,
  resolveVoiceSrc,
  startVoiceRecorder,
  stopVoiceRecorder,
} from "@/lib/voice-notes";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";

const BG = "#12080C";
const rose = () => sectionAccent("connect", "#E8A0B0");
const FOLDERS: { id: AudioFolder; label: string; tape: string }[] = [
  { id: "sweet", label: "Side A · sweet", tape: "#E8A0B0" },
  { id: "bedtime", label: "Side B · sleep", tape: "#8FA8C8" },
  { id: "spicy", label: "After dark", tape: "#FF4D6A" },
  { id: "voice", label: "Field notes", tape: "#F0C75E" },
];

function Reel({ spinning, x }: { spinning: boolean; x: number }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spinning) {
      rot.setValue(0);
      return;
    }
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
  const look = useAppLook("audio-vault", rose(), {
    autoplay: false,
    hideSpicy: false,
  });
  const [title, setTitle] = useState("");
  const [playing, setPlaying] = useState<AudioNote | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const notes = useMemo(
    () => data.audioNotes.filter((row) => row.folder === folder && row.hasAudio),
    [data.audioNotes, folder]
  );
  const tape = FOLDERS.find((row) => row.id === folder)?.tape ?? rose();
  const recRef = useRef<{
    stream: MediaStream;
    recorder: MediaRecorder;
    chunks: Blob[];
    startedAt: number;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const recTick = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlayback = () => {
    const node = audioRef.current;
    if (node) {
      node.pause();
      node.removeAttribute("src");
      node.load();
      audioRef.current = null;
    }
    if (objectUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPlaying(null);
    setProgress(0);
    setElapsed(0);
  };

  useEffect(() => {
    return () => {
      if (recTick.current) clearInterval(recTick.current);
      const live = recRef.current;
      if (live) abandonRecorder(live.stream, live.recorder);
      recRef.current = null;
      const node = audioRef.current;
      if (node) {
        node.pause();
        audioRef.current = null;
      }
      if (objectUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const playNote = async (note: AudioNote) => {
    if (playing?.id === note.id) {
      stopPlayback();
      return;
    }
    stopPlayback();
    setError(null);
    try {
      const src = await resolveVoiceSrc(note.id, note.uri);
      if (!src) {
        setError("That take is missing its audio. Record it again.");
        return;
      }
      objectUrlRef.current = src.startsWith("blob:") ? src : null;
      const AudioCtor = typeof window !== "undefined" ? window.Audio : null;
      if (!AudioCtor) {
        setError("This browser cannot play audio.");
        return;
      }
      const node = new AudioCtor(src);
      audioRef.current = node;
      node.onended = () => stopPlayback();
      node.onerror = () => {
        setError("Could not play that take.");
        stopPlayback();
      };
      node.ontimeupdate = () => {
        const duration = node.duration && Number.isFinite(node.duration) ? node.duration : note.seconds;
        setElapsed(node.currentTime);
        setProgress(duration > 0 ? Math.min(1, node.currentTime / duration) : 0);
      };
      setPlaying(note);
      await node.play();
    } catch (err) {
      setError(explainMicError(err));
      stopPlayback();
    }
  };

  const finishRecording = async () => {
    const live = recRef.current;
    recRef.current = null;
    if (recTick.current) {
      clearInterval(recTick.current);
      recTick.current = null;
    }
    setRecording(false);
    if (!live || !user) return;
    setBusy(true);
    try {
      const blob = await stopVoiceRecorder(live.stream, live.recorder, live.chunks);
      const seconds = Math.max(
        1,
        Math.round((Date.now() - live.startedAt) / 1000)
      );
      const id = createId();
      const stored = await persistVoiceClip(id, blob);
      const nextTitle = title.trim() || defaultVoiceTitle();
      await patch((state) => ({
        ...state,
        audioNotes: [
          {
            id,
            fromId: user.id,
            folder,
            title: nextTitle,
            body: "",
            seconds,
            createdAt: nowIso(),
            hasAudio: true,
            mimeType: stored.mimeType,
            uri: stored.uri,
          },
          ...state.audioNotes,
        ],
      }));
      setTitle("");
      setError(null);
    } catch (err) {
      abandonRecorder(live.stream, live.recorder);
      setError(explainMicError(err));
    } finally {
      setBusy(false);
      setElapsed(0);
      setProgress(0);
    }
  };

  const toggleRecord = async () => {
    if (busy) return;
    if (recording) {
      await finishRecording();
      return;
    }
    if (!user) {
      setError("Sign in first, then record.");
      return;
    }
    if (!canRecordAudio()) {
      setError("This browser cannot record audio. Try Chrome or Safari on a phone or laptop.");
      return;
    }
    stopPlayback();
    setError(null);
    setBusy(true);
    try {
      const session = await startVoiceRecorder();
      recRef.current = { ...session, startedAt: Date.now() };
      setRecording(true);
      setElapsed(0);
      setProgress(0);
      recTick.current = setInterval(() => {
        const live = recRef.current;
        if (!live) return;
        const seconds = (Date.now() - live.startedAt) / 1000;
        setElapsed(seconds);
        setProgress(Math.min(1, seconds / MAX_VOICE_SECONDS));
        if (seconds >= MAX_VOICE_SECONDS) {
          void finishRecording();
        }
      }, 80);
    } catch (err) {
      setError(explainMicError(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = async () => {
    const id = removeId;
    setRemoveId(null);
    if (!id) return;
    if (playing?.id === id) stopPlayback();
    await deleteVoiceClip(id);
    await patch((state) => ({
      ...state,
      audioNotes: state.audioNotes.filter((row) => row.id !== id),
    }));
  };

  const spinning = recording || Boolean(playing);
  const deckCopy = recording
    ? "Recording — say it like they are in the next room."
    : playing
      ? `Playing ${playing.title}`
      : "Press record. This captures your microphone.";
  const clock = recording || playing ? formatTapeTime(elapsed) : "0:00";

  return (
    <Screen scroll background={BG} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <Stage
        background={BG}
        fallback={"/hub/connect" as Href}
        accent={look.accent}
        settingsLabel="Audio notes"
        settings={
          <LookPanel
            look={look}
            ink="#F6E7DC"
            muted="rgba(246,231,220,0.6)"
            toggles={[
              {
                key: "autoplay",
                label: "Play the newest tape",
                hint: "When you open a folder, start the latest note.",
              },
              {
                key: "hideSpicy",
                label: "Hide After dark",
                hint: "Keep the mixtape on sweet, sleep, and field notes.",
              },
            ]}
          />
        }
      >
        <Text
          style={{
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: rose(),
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
            <Rect
              x={24}
              y={118}
              width={280 * (spinning ? Math.max(0.08, progress) : 0.12)}
              height={18}
              rx={4}
              fill={tape}
            />
          </Svg>
          <Reel spinning={spinning} x={36} />
          <Reel spinning={spinning} x={168} />
          <Text
            style={{
              position: "absolute",
              right: 16,
              top: 18,
              fontFamily: "SpaceMono",
              color: recording ? "#FF6B7A" : "#7CFFB2",
              fontSize: 12,
            }}
          >
            {recording ? "REC " : ""}
            {clock}
          </Text>
        </View>

        <View
          style={{
            marginTop: 14,
            minHeight: 88,
            backgroundColor: "#1A1012",
            borderRadius: 12,
            padding: 14,
            borderLeftWidth: 4,
            borderLeftColor: tape,
          }}
        >
          <Text
            style={{
              fontFamily: HANDWRITING,
              fontSize: 20,
              color: recording ? rose() : "rgba(248,232,238,0.7)",
            }}
          >
            {deckCopy}
          </Text>
        </View>

        <View style={{ marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(look.prefs.hideSpicy
            ? FOLDERS.filter((row) => row.id !== "spicy")
            : FOLDERS
          ).map((row) => (
            <Pressable
              key={row.id}
              onPress={() => {
                if (!recording) setFolder(row.id);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: folder === row.id ? row.tape : "#1A1012",
                borderRadius: 4,
                opacity: recording && folder !== row.id ? 0.45 : 1,
                transform: [{ rotate: folder === row.id ? "-2deg" : "0deg" }],
              }}
            >
              <Text
                style={{
                  color: folder === row.id ? "#1A0810" : rose(),
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                }}
              >
                {row.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ marginTop: 20, fontFamily: HANDWRITING, fontSize: 22, color: rose() }}>
          Record onto the tape
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Track title (optional)"
          placeholderTextColor="rgba(248,232,238,0.3)"
          editable={!recording}
          style={inputStyle}
        />
        <Pressable
          onPress={() => void toggleRecord()}
          disabled={busy}
          style={{
            marginTop: 10,
            height: 52,
            backgroundColor: recording ? "#FF4D6A" : rose(),
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            opacity: busy ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#1A0810", fontWeight: "800" }}>
            {recording ? "Stop & save" : busy ? "Starting mic…" : "Press record"}
          </Text>
        </Pressable>
        <Text
          style={{
            marginTop: 8,
            color: "rgba(248,232,238,0.4)",
            fontFamily: "SpaceMono",
            fontSize: 11,
          }}
        >
          Up to {MAX_VOICE_SECONDS}s. The browser will ask for the microphone once.
        </Text>
        {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}

        <View style={{ marginTop: 18, gap: 8 }}>
          {!ready ? (
            <Text style={{ color: "rgba(248,232,238,0.4)", fontFamily: SERIF }}>
              Loading the tape…
            </Text>
          ) : notes.length === 0 ? (
            <Text style={{ color: "rgba(248,232,238,0.4)", fontFamily: SERIF }}>
              This side of the tape is blank. Record a note they can actually hear.
            </Text>
          ) : (
            notes.map((note, i) => (
              <View
                key={note.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.06)",
                }}
              >
                <Pressable
                  onPress={() => void playNote(note)}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <Text style={{ color: tape, fontFamily: "SpaceMono", width: 28 }}>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#F8E8EE", fontFamily: SERIF, fontSize: 18 }}>
                      {note.title}
                    </Text>
                    <Text style={{ color: "rgba(248,232,238,0.4)", fontSize: 12 }}>
                      your voice · {formatTapeTime(note.seconds)}
                      {note.fromId === user?.id ? " · you" : partner ? ` · ${them}` : ""}
                    </Text>
                  </View>
                  <Text style={{ color: tape }}>{playing?.id === note.id ? "■" : "▶"}</Text>
                </Pressable>
                <Pressable onPress={() => setRemoveId(note.id)} hitSlop={8}>
                  <Text style={{ color: "rgba(248,232,238,0.35)", fontFamily: "SpaceMono", fontSize: 11 }}>
                    del
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </Stage>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Erase this track?"
        body="The recording is removed from this phone. You cannot undo it."
        confirmLabel="Erase track"
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveId(null)}
      />
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
