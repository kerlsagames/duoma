import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const KRAFT = "#C4A574";
const BG = "#3A2A18";
const INK = "#2A1C10";

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return localDateKey(d);
}

export default function ScrapbookScreen() {
  const { user } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState(addDays(30));
  const [error, setError] = useState<string | null>(null);
  const today = localDateKey();
  const sealed = data.capsules.filter((row) => row.unlockAt > today);
  const open = data.capsules.filter((row) => row.unlockAt <= today);
  const presets = useMemo(
    () => [
      { label: "a month", key: addDays(30) },
      { label: "100 days", key: addDays(100) },
      { label: "a year", key: addDays(365) },
    ],
    []
  );

  const daysUntil = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    const target = new Date(y, (m || 1) - 1, d || 1);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - start.getTime()) / 86400000);
  };

  const seal = async () => {
    if (!user) return;
    if (!title.trim() || !body.trim()) {
      setError("An envelope needs a name and a letter.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      capsules: [
        {
          id: createId(),
          title: title.trim(),
          body: body.trim(),
          unlockAt: when,
          createdBy: user.id,
          createdAt: nowIso(),
        },
        ...state.capsules,
      ],
    }));
    setTitle("");
    setBody("");
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/play" as Href} accent={KRAFT}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 22,
            color: "#F3E2C0",
          }}
        >
          washi · stamps · later
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 36,
            color: "#F3E2C0",
          }}
        >
          Time capsules
        </Text>

        <View
          style={{
            marginTop: 16,
            backgroundColor: KRAFT,
            padding: 16,
            transform: [{ rotate: "-1deg" }],
          }}
        >
          <View
            style={{
              height: 14,
              backgroundColor: "#7A2030",
              marginHorizontal: -16,
              marginTop: -16,
              marginBottom: 12,
            }}
          />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="on the envelope"
            style={ink}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="the letter inside"
            multiline
            style={[ink, { minHeight: 80 }]}
          />
          <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
            {presets.map((row) => (
              <Pressable key={row.key} onPress={() => setWhen(row.key)}>
                <Text
                  style={{
                    fontFamily: HANDWRITING,
                    fontSize: 18,
                    color: when === row.key ? "#7A2030" : INK,
                    textDecorationLine: when === row.key ? "underline" : "none",
                  }}
                >
                  {row.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => void seal()}
            style={{
              marginTop: 14,
              alignSelf: "center",
              width: 86,
              height: 86,
              borderRadius: 43,
              backgroundColor: "#7A2030",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#F3E2C0", fontFamily: HANDWRITING, fontSize: 18 }}>seal</Text>
          </Pressable>
          {error ? <Text style={{ marginTop: 8, color: "#7A2030" }}>{error}</Text> : null}
        </View>

        <View style={{ marginTop: 20, gap: 12 }}>
          {!ready || (sealed.length === 0 && open.length === 0) ? (
            <Text style={{ color: "rgba(243,226,192,0.5)", fontFamily: SERIF }}>
              Nothing sealed. Write the thing you’d only say in a year.
            </Text>
          ) : null}
          {sealed.map((row) => (
            <View
              key={row.id}
              style={{
                backgroundColor: "#E8D4A8",
                padding: 14,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: "#7A2030",
              }}
            >
              <Text style={{ fontFamily: SERIF, fontSize: 20, color: INK }}>{row.title}</Text>
              <Text style={{ fontFamily: HANDWRITING, fontSize: 16, color: "#7A2030" }}>
                do not open for {daysUntil(row.unlockAt)} days
              </Text>
              <Text style={{ marginTop: 8, color: "rgba(42,28,16,0.3)" }}>
                ░░░░░ waxed shut ░░░░░
              </Text>
            </View>
          ))}
          {open.map((row) => (
            <View key={row.id} style={{ backgroundColor: "#F6EFE2", padding: 16 }}>
              <Text style={{ fontFamily: SERIF, fontSize: 22, color: INK }}>{row.title}</Text>
              <Text style={{ marginTop: 8, fontFamily: HANDWRITING, fontSize: 20, color: INK }}>
                {row.body}
              </Text>
            </View>
          ))}
        </View>
      </Stage>
    </Screen>
  );
}

const ink = {
  marginTop: 6,
  color: INK,
  fontFamily: HANDWRITING,
  fontSize: 20,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(42,28,16,0.25)",
} as const;
