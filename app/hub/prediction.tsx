import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#04140E";
const GREEN = "#39FF9A";
const RED = "#FF4D4D";

export default function PredictionScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [title, setTitle] = useState("");
  const [stake, setStake] = useState("Cook Sunday");
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const tape = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(tape, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [tape]);

  const open = data.predictions.filter((row) => !row.resolved);
  const closed = data.predictions.filter((row) => row.resolved);
  const ticker = [...open, ...closed].map((row) => row.title).join("   ·   ") || "NO OPEN CONTRACTS   ·   LIST A PETTY FUTURE";

  const create = async () => {
    if (!user) return;
    if (!title.trim()) {
      setError("The pit needs a sentence.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      predictions: [
        {
          id: createId(),
          title: title.trim(),
          stake: stake.trim() || "Bragging rights",
          createdBy: user.id,
          yesVoters: [user.id],
          noVoters: partner?.isDemo && partner.id ? [partner.id] : [],
          resolved: null,
          createdAt: nowIso(),
        },
        ...state.predictions,
      ],
    }));
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
      <Stage background={BG} fallback={"/hub/play" as Href} accent={GREEN}>
        <View style={{ backgroundColor: "#02100A", paddingVertical: 8, overflow: "hidden" }}>
          <Animated.Text
            style={{
              color: GREEN,
              fontFamily: "SpaceMono",
              fontSize: 12,
              width: 900,
              transform: [
                {
                  translateX: tape.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -420],
                  }),
                },
              ],
            }}
          >
            {ticker.toUpperCase()}   ·   {ticker.toUpperCase()}
          </Animated.Text>
        </View>
        <Text
          style={{
            marginTop: 14,
            fontFamily: "SpaceMono",
            fontSize: 12,
            color: GREEN,
          }}
        >
          DUOMA · FAVORS DESK
        </Text>
        <Text style={{ fontFamily: SERIF, fontSize: 36, color: GREEN, lineHeight: 40 }}>
          Prediction pit
        </Text>
        <Text style={{ marginTop: 6, color: "rgba(57,255,154,0.55)", fontSize: 13 }}>
          {them} is the other side of every trade. Reality is the clearing house.
        </Text>

        <View
          style={{
            marginTop: 16,
            borderWidth: 1,
            borderColor: GREEN,
            padding: 12,
            backgroundColor: "#062016",
          }}
        >
          <Text style={{ color: GREEN, fontFamily: "SpaceMono", fontSize: 10 }}>NEW CONTRACT</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="We'll use the nice plates"
            placeholderTextColor="rgba(57,255,154,0.3)"
            style={term}
          />
          <TextInput
            value={stake}
            onChangeText={setStake}
            placeholder="STAKE"
            placeholderTextColor="rgba(57,255,154,0.3)"
            style={term}
          />
          <Pressable
            onPress={() => void create()}
            style={{ marginTop: 8, height: 42, backgroundColor: GREEN, justifyContent: "center" }}
          >
            <Text style={{ textAlign: "center", color: "#04140E", fontWeight: "900" }}>
              LIST IT
            </Text>
          </Pressable>
          {error ? <Text style={{ marginTop: 6, color: RED }}>{error}</Text> : null}
        </View>

        <View style={{ marginTop: 16, gap: 12 }}>
          {!ready || open.length === 0 ? (
            <Text style={{ color: "rgba(57,255,154,0.4)", fontFamily: "SpaceMono" }}>
              // the pit is quiet. list something petty.
            </Text>
          ) : (
            open.map((row) => {
              const yes = row.yesVoters.length;
              const no = row.noVoters.length;
              const total = Math.max(1, yes + no);
              return (
                <View
                  key={row.id}
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(57,255,154,0.35)",
                    padding: 12,
                    backgroundColor: "#062016",
                  }}
                >
                  <Text style={{ fontFamily: "SpaceMono", color: GREEN, fontSize: 11 }}>
                    OPEN · STAKE {row.stake.toUpperCase()}
                  </Text>
                  <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 22, color: "#E8FFF4" }}>
                    {row.title}
                  </Text>
                  <View style={{ marginTop: 10, height: 8, flexDirection: "row" }}>
                    <View style={{ width: `${(yes / total) * 100}%`, backgroundColor: GREEN }} />
                    <View style={{ width: `${(no / total) * 100}%`, backgroundColor: RED }} />
                  </View>
                  <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={() => void vote(row.id, "yes")} style={btn(GREEN)}>
                      <Text style={{ color: GREEN, fontFamily: "SpaceMono" }}>LONG {yes}</Text>
                    </Pressable>
                    <Pressable onPress={() => void vote(row.id, "no")} style={btn(RED)}>
                      <Text style={{ color: RED, fontFamily: "SpaceMono" }}>SHORT {no}</Text>
                    </Pressable>
                  </View>
                  <View style={{ marginTop: 8, flexDirection: "row", gap: 16 }}>
                    <Pressable onPress={() => void resolve(row.id, "yes")}>
                      <Text style={{ color: GREEN, fontSize: 11 }}>SETTLE YES</Text>
                    </Pressable>
                    <Pressable onPress={() => void resolve(row.id, "no")}>
                      <Text style={{ color: RED, fontSize: 11 }}>SETTLE NO</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </Stage>
    </Screen>
  );
}

const term = {
  marginTop: 8,
  color: GREEN,
  fontFamily: "SpaceMono",
  borderBottomWidth: 1,
  borderBottomColor: "rgba(57,255,154,0.3)",
  paddingVertical: 6,
} as const;

function btn(color: string) {
  return {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: color,
  } as const;
}
