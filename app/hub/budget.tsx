import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C1210";
const GOLD = "#E4C37A";

export default function BudgetScreen() {
  const { data, ready, patch } = useMiniApps();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("500");
  const [addAmt, setAddAmt] = useState("20");
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    const n = Number(target);
    if (!title.trim() || !Number.isFinite(n) || n <= 0) {
      setError("Need a name and a real target.");
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
      <MiniChrome
        accent={GOLD}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · jars"
        title="Shared goals"
        body="Glass jars, filling. Not a bank — a picture of the weekend, the couch, the dinner that hurts a little."
        ready={ready}
      >
        <View style={{ marginTop: 16, gap: 14 }}>
          {data.goals.map((goal) => {
            const pct = Math.min(1, goal.saved / Math.max(1, goal.target));
            return (
              <View
                key={goal.id}
                style={{
                  padding: 14,
                  borderRadius: 20,
                  backgroundColor: "#141A16",
                  borderWidth: 1,
                  borderColor: `${goal.color}55`,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 22, color: goal.color }}>
                  {goal.title}
                </Text>
                <Text style={{ marginTop: 4, color: "rgba(244,244,246,0.55)" }}>
                  ${Math.round(goal.saved)} / ${goal.target}
                </Text>
                <View
                  style={{
                    marginTop: 12,
                    height: 88,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: goal.color,
                    overflow: "hidden",
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <View
                    style={{
                      height: `${pct * 100}%`,
                      backgroundColor: `${goal.color}99`,
                    }}
                  />
                </View>
                <Pressable
                  onPress={() => void contribute(goal.id)}
                  style={{ marginTop: 10, alignSelf: "flex-start" }}
                >
                  <Text style={{ color: goal.color, fontWeight: "700" }}>
                    Drop in ${addAmt}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
        <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
          {["10", "20", "50", "100"].map((n) => (
            <Pressable
              key={n}
              onPress={() => setAddAmt(n)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: addAmt === n ? `${GOLD}33` : "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: GOLD }}>${n}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="New jar name"
          placeholderTextColor="rgba(244,244,246,0.3)"
          style={inputStyle}
        />
        <TextInput
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
          placeholder="Target"
          placeholderTextColor="rgba(244,244,246,0.3)"
          style={inputStyle}
        />
        <Pressable
          onPress={() => void create()}
          style={{
            marginTop: 10,
            height: 48,
            borderRadius: 14,
            backgroundColor: GOLD,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A1408", fontWeight: "800" }}>Start a jar</Text>
        </Pressable>
        {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
      </MiniChrome>
    </Screen>
  );
}

const inputStyle = {
  marginTop: 8,
  borderRadius: 12,
  padding: 12,
  backgroundColor: "#141A16",
  color: "#F4F4F6",
} as const;
