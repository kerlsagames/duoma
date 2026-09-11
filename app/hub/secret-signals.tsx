import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

const BG = "#1A100C";
const WAX = "#8B1E2D";
const PAPER = "#E8D7B5";
const INK = "#2A1C12";

export default function SecretSignalsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [emoji, setEmoji] = useState("🕯️");
  const [phrase, setPhrase] = useState("");
  const [meaning, setMeaning] = useState("");
  const [flash, setFlash] = useState<{ emoji: string; phrase: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "your person";

  const addCode = async () => {
    if (!phrase.trim() || !meaning.trim()) {
      setError("A seal needs a cover phrase and a real meaning.");
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
    const code = data.signals.find((row) => row.id === codeId);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* web */
    }
    await patch((state) => ({
      ...state,
      flashes: [
        { id: createId(), codeId, fromId: user.id, createdAt: nowIso() },
        ...state.flashes,
      ].slice(0, 30),
    }));
    if (code) setFlash({ emoji: code.emoji, phrase: code.phrase });
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/desire" as Href} accent={PAPER}>
        <View
          style={{
            backgroundColor: "#2A1A12",
            borderRadius: 8,
            padding: 16,
            borderWidth: 8,
            borderColor: "#4A2C1A",
          }}
        >
          <Text
            style={{
              fontFamily: HANDWRITING,
              fontSize: 20,
              color: PAPER,
              textAlign: "center",
            }}
          >
            The cipher of {them.split(" ")[0]}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: SERIF,
              fontSize: 34,
              color: PAPER,
              textAlign: "center",
            }}
          >
            Secret signals
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: "rgba(232,215,181,0.65)",
              textAlign: "center",
              fontSize: 13,
            }}
          >
            Press a wax seal. The meaning never leaves the book — only the flash does.
          </Text>
        </View>

        <View
          style={{
            marginTop: 16,
            backgroundColor: PAPER,
            borderRadius: 4,
            padding: 16,
            transform: [{ rotate: "-0.6deg" }],
          }}
        >
          {!ready ? (
            <Text style={{ color: INK }}>Opening the book…</Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              {data.signals.map((code) => (
                <Pressable
                  key={code.id}
                  onPress={() => void send(code.id)}
                  style={{ width: 92, alignItems: "center" }}
                >
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: WAX,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOpacity: 0.35,
                      shadowRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{code.emoji}</Text>
                  </View>
                  <Text
                    style={{
                      marginTop: 6,
                      fontFamily: HANDWRITING,
                      fontSize: 14,
                      color: INK,
                      textAlign: "center",
                    }}
                  >
                    {code.phrase}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View
          style={{
            marginTop: 18,
            backgroundColor: "#EFE4C8",
            padding: 14,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontFamily: HANDWRITING, fontSize: 20, color: INK }}>
            Cut a new seal
          </Text>
          <TextInput
            value={emoji}
            onChangeText={setEmoji}
            style={inkInput}
            placeholder="emoji"
          />
          <TextInput
            value={phrase}
            onChangeText={setPhrase}
            style={inkInput}
            placeholder="what you say out loud"
          />
          <TextInput
            value={meaning}
            onChangeText={setMeaning}
            style={[inkInput, { minHeight: 56 }]}
            multiline
            placeholder="what it actually means"
          />
          <Pressable
            onPress={() => void addCode()}
            style={{
              marginTop: 8,
              alignSelf: "flex-start",
              backgroundColor: WAX,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: PAPER, fontWeight: "800" }}>Drip the wax</Text>
          </Pressable>
          {error ? <Text style={{ marginTop: 8, color: WAX }}>{error}</Text> : null}
        </View>
      </Stage>

      <Modal visible={Boolean(flash)} transparent animationType="fade">
        <Pressable
          onPress={() => setFlash(null)}
          style={{
            flex: 1,
            backgroundColor: "#14080A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 88 }}>{flash?.emoji}</Text>
          <Text
            style={{
              marginTop: 12,
              fontFamily: SERIF,
              fontSize: 36,
              color: PAPER,
              textAlign: "center",
            }}
          >
            {flash?.phrase}
          </Text>
          <Text
            style={{
              marginTop: 16,
              fontFamily: HANDWRITING,
              fontSize: 20,
              color: "rgba(232,215,181,0.6)",
            }}
          >
            flashed · tap to fade
          </Text>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const inkInput = {
  marginTop: 8,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(42,28,18,0.25)",
  color: INK,
  fontFamily: HANDWRITING,
  fontSize: 18,
  paddingVertical: 6,
} as const;
