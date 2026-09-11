import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C0A12";
const GOLD = "#E4C37A";

export default function SecretSignalsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [emoji, setEmoji] = useState("🕯️");
  const [phrase, setPhrase] = useState("");
  const [meaning, setMeaning] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "your person";

  const lastFlash = data.flashes[0] ?? null;
  const lastCode = useMemo(
    () => data.signals.find((row) => row.id === lastFlash?.codeId) ?? null,
    [data.signals, lastFlash]
  );

  const addCode = async () => {
    if (!phrase.trim() || !meaning.trim()) {
      setError("Phrase and meaning required.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      signals: [
        {
          id: createId(),
          emoji: emoji.trim() || "✦",
          phrase: phrase.trim(),
          meaning: meaning.trim(),
        },
        ...state.signals,
      ],
    }));
    setPhrase("");
    setMeaning("");
  };

  const send = async (codeId: string) => {
    if (!user) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* web */
    }
    const code = data.signals.find((row) => row.id === codeId);
    await patch((state) => ({
      ...state,
      flashes: [
        { id: createId(), codeId, fromId: user.id, createdAt: nowIso() },
        ...state.flashes,
      ].slice(0, 30),
    }));
    setFlash(code ? `${code.emoji}  ${code.phrase}` : "Sent.");
    setTimeout(() => setFlash(null), 2200);
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={GOLD}
        fallback={"/hub/desire" as Href}
        kicker="Desire · cipher"
        title="Secret signals"
        body={`A private language only you and ${them} can read. Flash a code across a crowded room — or from the other sofa.`}
        ready={ready}
      >
        {flash ? (
          <View
            style={{
              marginTop: 18,
              paddingVertical: 28,
              borderRadius: 20,
              backgroundColor: "#1A1610",
              borderWidth: 1,
              borderColor: GOLD,
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 28, color: GOLD }}>
              {flash}
            </Text>
            <Text style={{ marginTop: 6, color: "rgba(228,195,122,0.7)" }}>
              flashed to {them}
            </Text>
          </View>
        ) : null}

        {lastFlash && lastCode && lastFlash.fromId !== user?.id ? (
          <View
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 16,
              backgroundColor: "rgba(228,195,122,0.1)",
            }}
          >
            <Text style={{ color: GOLD, fontSize: 12, letterSpacing: 1 }}>
              INCOMING
            </Text>
            <Text style={{ marginTop: 6, fontFamily: SERIF, fontSize: 22, color: "#F4F4F6" }}>
              {lastCode.emoji}  {lastCode.phrase}
            </Text>
            <Text style={{ marginTop: 4, color: "rgba(244,244,246,0.6)" }}>
              {lastCode.meaning}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 20, gap: 10 }}>
          {data.signals.map((code) => (
            <Pressable
              key={code.id}
              onPress={() => void send(code.id)}
              style={{
                flexDirection: "row",
                gap: 12,
                padding: 14,
                borderRadius: 16,
                backgroundColor: "#16131C",
                borderWidth: 1,
                borderColor: "rgba(228,195,122,0.22)",
              }}
            >
              <Text style={{ fontSize: 28, width: 40, textAlign: "center" }}>
                {code.emoji}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: GOLD, fontFamily: SERIF, fontSize: 18 }}>
                  {code.phrase}
                </Text>
                <Text style={{ marginTop: 4, color: "rgba(244,244,246,0.6)", fontSize: 13 }}>
                  {code.meaning}
                </Text>
              </View>
              <Ionicons name="radio" size={18} color={GOLD} />
            </Pressable>
          ))}
        </View>

        <Text
          style={{
            marginTop: 26,
            fontFamily: "SpaceMono",
            letterSpacing: 2,
            fontSize: 11,
            color: "rgba(228,195,122,0.7)",
          }}
        >
          ADD A CODE
        </Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          <TextInput
            value={emoji}
            onChangeText={setEmoji}
            placeholder="Emoji"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={inputStyle}
          />
          <TextInput
            value={phrase}
            onChangeText={setPhrase}
            placeholder="Cover phrase (what you say out loud)"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={inputStyle}
          />
          <TextInput
            value={meaning}
            onChangeText={setMeaning}
            placeholder="Real meaning"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={[inputStyle, { minHeight: 64 }]}
            multiline
          />
          <Pressable
            onPress={() => void addCode()}
            style={{
              height: 48,
              borderRadius: 14,
              backgroundColor: GOLD,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#1A1408", fontWeight: "800" }}>Seal into the book</Text>
          </Pressable>
          {error ? (
            <Text style={{ color: "#FF8A8A", fontSize: 13 }}>{error}</Text>
          ) : null}
        </View>
        <EmptyHint text="Tap a code to flash it. In a room full of people, that's a whole conversation." />
      </MiniChrome>
    </Screen>
  );
}

const inputStyle = {
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: "#16131C",
  color: "#F4F4F6",
  borderWidth: 1,
  borderColor: "rgba(228,195,122,0.2)",
} as const;
