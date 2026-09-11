import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#140F0C";
const CREAM = "#E8D5A8";

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

  const daysUntil = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    const target = new Date(y, (m || 1) - 1, d || 1);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - start.getTime()) / 86400000);
  };

  const presets = useMemo(
    () => [
      { label: "In a month", key: addDays(30) },
      { label: "In 100 days", key: addDays(100) },
      { label: "Next anniversary-ish", key: addDays(365) },
    ],
    []
  );

  const seal = async () => {
    if (!user) return;
    if (!title.trim() || !body.trim()) {
      setError("A capsule needs a title and a letter.");
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
      <MiniChrome
        accent={CREAM}
        fallback={"/hub/play" as Href}
        kicker="Fun · time capsule"
        title="Virtual scrapbook"
        body="Seal a letter for a future version of you two. It stays shut until the date you pick."
        ready={ready}
      >
        <View
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 20,
            backgroundColor: "#1C1610",
            borderWidth: 1,
            borderColor: "rgba(232,213,168,0.28)",
          }}
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Capsule title"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={inputStyle}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="What should future-you remember?"
            placeholderTextColor="rgba(244,244,246,0.3)"
            multiline
            style={[inputStyle, { minHeight: 90 }]}
          />
          <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {presets.map((row) => (
              <Pressable
                key={row.key}
                onPress={() => setWhen(row.key)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: when === row.key ? `${CREAM}33` : "rgba(255,255,255,0.05)",
                }}
              >
                <Text style={{ color: when === row.key ? CREAM : "#F4F4F6", fontSize: 12 }}>
                  {row.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => void seal()}
            style={{
              marginTop: 12,
              height: 48,
              borderRadius: 14,
              backgroundColor: CREAM,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#1A1408", fontWeight: "800" }}>Seal until {when}</Text>
          </Pressable>
          {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
        </View>

        {sealed.length === 0 && open.length === 0 ? (
          <EmptyHint text="Nothing sealed yet. Write the thing you'd only say to yourselves a year from now." />
        ) : null}

        {sealed.length > 0 ? (
          <View style={{ marginTop: 20, gap: 10 }}>
            <Text style={{ color: CREAM, fontFamily: "SpaceMono", fontSize: 11 }}>SEALED</Text>
            {sealed.map((row) => (
              <View
                key={row.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: "rgba(232,213,168,0.35)",
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 20, color: CREAM }}>{row.title}</Text>
                <Text style={{ marginTop: 4, color: "rgba(244,244,246,0.5)" }}>
                  Opens in {daysUntil(row.unlockAt)} days · {row.unlockAt}
                </Text>
                <Text style={{ marginTop: 8, color: "rgba(244,244,246,0.25)" }}>
                  ████████ the letter is waxed shut ████████
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {open.length > 0 ? (
          <View style={{ marginTop: 20, gap: 10 }}>
            <Text style={{ color: CREAM, fontFamily: "SpaceMono", fontSize: 11 }}>OPEN</Text>
            {open.map((row) => (
              <View
                key={row.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: "#F6EFE2",
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#3A2A18" }}>
                  {row.title}
                </Text>
                <Text style={{ marginTop: 8, color: "#3A2A18", lineHeight: 22 }}>{row.body}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </MiniChrome>
    </Screen>
  );
}

const inputStyle = {
  marginTop: 8,
  borderRadius: 12,
  padding: 12,
  backgroundColor: "#241C14",
  color: "#F4F4F6",
} as const;
