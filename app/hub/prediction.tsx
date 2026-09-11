import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#07140F";
const GREEN = "#7CFFB2";
const RED = "#FF6B6B";

export default function PredictionScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [title, setTitle] = useState("");
  const [stake, setStake] = useState("Cook dinner on Sunday");
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "them";

  const open = data.predictions.filter((row) => !row.resolved);
  const closed = data.predictions.filter((row) => row.resolved);

  const create = async () => {
    if (!user) return;
    if (!title.trim()) {
      setError("What are we betting on?");
      return;
    }
    setError(null);
    const market = {
      id: createId(),
      title: title.trim(),
      stake: stake.trim() || "Bragging rights",
      createdBy: user.id,
      yesVoters: [user.id],
      noVoters: partner?.isDemo && partner.id ? [partner.id] : [],
      resolved: null,
      createdAt: nowIso(),
    };
    await patch((state) => ({ ...state, predictions: [market, ...state.predictions] }));
    setTitle("");
  };

  const vote = async (id: string, side: "yes" | "no") => {
    if (!user) return;
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) => {
        if (row.id !== id || row.resolved) return row;
        const yes = row.yesVoters.filter((v) => v !== user.id);
        const no = row.noVoters.filter((v) => v !== user.id);
        if (side === "yes") yes.push(user.id);
        else no.push(user.id);
        return { ...row, yesVoters: yes, noVoters: no };
      }),
    }));
  };

  const resolve = async (id: string, result: "yes" | "no") => {
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) =>
        row.id === id ? { ...row, resolved: result } : row
      ),
    }));
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={GREEN}
        fallback={"/hub/play" as Href}
        kicker="Fun · ticker"
        title="Prediction market"
        body={`Bet a favor, not money. ${them} takes the other side. Reality settles the trade.`}
        ready={ready}
      >
        <View
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 16,
            backgroundColor: "#0C1C16",
            borderWidth: 1,
            borderColor: "rgba(124,255,178,0.25)",
          }}
        >
          <Text style={{ color: GREEN, fontFamily: "SpaceMono", fontSize: 11 }}>
            NEW CONTRACT
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="We'll finally use the nice plates this month"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={inputStyle}
          />
          <TextInput
            value={stake}
            onChangeText={setStake}
            placeholder="Stake (a favor)"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={inputStyle}
          />
          <Pressable
            onPress={() => void create()}
            style={{
              marginTop: 10,
              height: 46,
              borderRadius: 12,
              backgroundColor: GREEN,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#062016", fontWeight: "800" }}>List the market</Text>
          </Pressable>
          {error ? <Text style={{ marginTop: 8, color: RED }}>{error}</Text> : null}
        </View>

        {open.length === 0 ? (
          <EmptyHint text="No open markets. Predict something petty and true — weather, in-laws, who falls asleep first." />
        ) : (
          <View style={{ marginTop: 16, gap: 12 }}>
            {open.map((row) => {
              const yes = row.yesVoters.length;
              const no = row.noVoters.length;
              const total = Math.max(1, yes + no);
              return (
                <View
                  key={row.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    backgroundColor: "#0C1C16",
                  }}
                >
                  <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#E8FFF4" }}>
                    {row.title}
                  </Text>
                  <Text style={{ marginTop: 4, color: "rgba(232,255,244,0.5)" }}>
                    Stake: {row.stake}
                  </Text>
                  <View
                    style={{
                      marginTop: 12,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        width: `${(yes / total) * 100}%`,
                        backgroundColor: GREEN,
                      }}
                    />
                    <View
                      style={{
                        width: `${(no / total) * 100}%`,
                        backgroundColor: RED,
                      }}
                    />
                  </View>
                  <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                    <Pressable
                      onPress={() => void vote(row.id, "yes")}
                      style={chip(GREEN)}
                    >
                      <Text style={{ color: GREEN }}>Yes {yes}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void vote(row.id, "no")}
                      style={chip(RED)}
                    >
                      <Text style={{ color: RED }}>No {no}</Text>
                    </Pressable>
                  </View>
                  <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={() => void resolve(row.id, "yes")}>
                      <Text style={{ color: GREEN, fontSize: 12 }}>Settle YES</Text>
                    </Pressable>
                    <Pressable onPress={() => void resolve(row.id, "no")}>
                      <Text style={{ color: RED, fontSize: 12 }}>Settle NO</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {closed.length > 0 ? (
          <View style={{ marginTop: 20, gap: 8 }}>
            <Text style={{ color: "rgba(244,244,246,0.4)", fontFamily: "SpaceMono" }}>
              SETTLED
            </Text>
            {closed.slice(0, 8).map((row) => (
              <Text key={row.id} style={{ color: "rgba(244,244,246,0.55)" }}>
                {row.resolved === "yes" ? "▲" : "▼"} {row.title} · {row.stake}
              </Text>
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
  backgroundColor: "#10241C",
  color: "#F4F4F6",
} as const;

function chip(color: string) {
  return {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color,
  } as const;
}
