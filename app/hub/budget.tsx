import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#1A140E";
const CREAM = "#F3E2C0";

export default function BudgetScreen() {
  const { data, ready, patch } = useMiniApps();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("500");
  const [addAmt, setAddAmt] = useState("20");
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    const n = Number(target);
    if (!title.trim() || !Number.isFinite(n) || n <= 0) {
      setError("A jar needs a name and a number.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      goals: [
        ...state.goals,
        {
          id: createId(),
          title: title.trim(),
          target: n,
          saved: 0,
          color: ["#FF6B9A", "#3ECFBF", "#F0C75E", "#C9A0DC"][state.goals.length % 4]!,
        },
      ],
    }));
    setTitle("");
  };

  const contribute = async (id: string) => {
    const n = Number(addAmt);
    if (!Number.isFinite(n) || n === 0) return;
    await patch((state) => ({
      ...state,
      goals: state.goals.map((row) =>
        row.id === id
          ? { ...row, saved: Math.max(0, Math.min(row.target, row.saved + n)) }
          : row
      ),
    }));
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent={CREAM}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 22,
            color: CREAM,
          }}
        >
          the shelf
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 34,
            color: CREAM,
          }}
        >
          Glass jars
        </Text>
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {data.goals.map((goal) => {
            const pct = Math.min(1, goal.saved / Math.max(1, goal.target));
            return (
              <Pressable
                key={goal.id}
                onPress={() => void contribute(goal.id)}
                style={{ width: 140, alignItems: "center" }}
              >
                <View
                  style={{
                    width: 92,
                    height: 140,
                    borderRadius: 46,
                    borderWidth: 3,
                    borderColor: "rgba(243,226,192,0.45)",
                    overflow: "hidden",
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <View
                    style={{
                      height: `${Math.max(8, pct * 100)}%`,
                      backgroundColor: goal.color,
                      opacity: 0.85,
                    }}
                  />
                </View>
                <View
                  style={{
                    marginTop: -8,
                    width: 40,
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: "#8B6A3A",
                  }}
                />
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: HANDWRITING,
                    fontSize: 18,
                    color: CREAM,
                    textAlign: "center",
                  }}
                >
                  {goal.title}
                </Text>
                <Text style={{ color: goal.color, fontFamily: "SpaceMono", fontSize: 11 }}>
                  ${Math.round(goal.saved)} / ${goal.target}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text
          style={{
            marginTop: 16,
            textAlign: "center",
            fontFamily: HANDWRITING,
            color: "rgba(243,226,192,0.6)",
          }}
        >
          tap a jar to drop ${addAmt}
        </Text>
        <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {["10", "20", "50", "100"].map((n) => (
            <Pressable key={n} onPress={() => setAddAmt(n)}>
              <Text style={{ color: addAmt === n ? "#F0C75E" : CREAM, fontFamily: "SpaceMono" }}>
                ${n}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="new jar"
          placeholderTextColor="rgba(243,226,192,0.3)"
          style={field}
        />
        <TextInput
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
          placeholder="target"
          placeholderTextColor="rgba(243,226,192,0.3)"
          style={field}
        />
        <Pressable onPress={() => void create()} style={{ marginTop: 10 }}>
          <Text style={{ textAlign: "center", color: "#F0C75E", fontFamily: HANDWRITING, fontSize: 20 }}>
            set a new jar on the shelf
          </Text>
        </Pressable>
        {error ? <Text style={{ textAlign: "center", color: "#FF8A8A" }}>{error}</Text> : null}
        {!ready ? <Text style={{ color: CREAM }}>Wiping the glass…</Text> : null}
      </Stage>
    </Screen>
  );
}

const field = {
  marginTop: 8,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(243,226,192,0.3)",
  color: CREAM,
  fontFamily: HANDWRITING,
  fontSize: 18,
  paddingVertical: 6,
} as const;
