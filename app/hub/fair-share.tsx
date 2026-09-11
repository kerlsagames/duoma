import { FortuneWheel } from "@/components/hub/FortuneWheel";
import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

const BG = "#0C1412";
const MINT = "#3ECFBF";

export default function FairShareScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "You";
  const them = partner?.displayName || "Them";
  const [choreId, setChoreId] = useState(data.chores[0]?.id ?? "");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const angle = useRef(0);

  const people = useMemo(
    () => [
      { id: user?.id ?? "you", label: you, color: "#3ECFBF" },
      { id: partner?.id ?? "them", label: them, color: "#F0C75E" },
    ],
    [partner?.id, them, user?.id, you]
  );

  const chore = data.chores.find((row) => row.id === choreId) ?? data.chores[0];

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const spin of data.fairSpins) {
      map[spin.winnerId] = (map[spin.winnerId] ?? 0) + 1;
    }
    return map;
  }, [data.fairSpins]);

  const spin = () => {
    if (spinning || !chore || !user) return;
    setSpinning(true);
    setWinner(null);
    const extra = 360 * 7 + Math.random() * 360;
    const next = angle.current + extra;
    angle.current = next;
    Animated.timing(rotation, {
      toValue: next,
      duration: 2800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const slice = 180;
      const deg = (360 - (next % 360)) % 360;
      const index = Math.floor(deg / slice) % 2;
      const person = people[index]!;
      setWinner(person.label);
      setSpinning(false);
      void patch((state) => ({
        ...state,
        fairSpins: [
          {
            id: createId(),
            choreId: chore.id,
            winnerId: person.id,
            createdAt: nowIso(),
          },
          ...state.fairSpins,
        ].slice(0, 40),
      }));
    });
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={MINT}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · justice"
        title="Fair-share wheel"
        body="Pick a chore. Spin. Fate assigns the victim. The chart keeps you honest over time."
        ready={ready}
      >
        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {data.chores.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setChoreId(row.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: chore?.id === row.id ? `${MINT}33` : "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: chore?.id === row.id ? MINT : "#F4F4F6" }}>{row.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: 8 }}>
          <FortuneWheel
            slices={people.map((p) => ({ label: p.label, color: p.color }))}
            rotation={rotation}
            size={260}
          />
        </View>
        <Pressable
          onPress={spin}
          disabled={spinning}
          style={{
            height: 52,
            borderRadius: 16,
            backgroundColor: MINT,
            alignItems: "center",
            justifyContent: "center",
            opacity: spinning ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#06201C", fontWeight: "800" }}>
            {spinning ? "Deciding…" : `Spin for ${chore?.label ?? "a chore"}`}
          </Text>
        </Pressable>
        {winner ? (
          <Text
            style={{
              marginTop: 14,
              fontFamily: SERIF,
              fontSize: 24,
              color: MINT,
              textAlign: "center",
            }}
          >
            {winner} does {chore?.label.toLowerCase()}.
          </Text>
        ) : null}

        <View style={{ marginTop: 20, gap: 8 }}>
          {people.map((person) => {
            const n = counts[person.id] ?? 0;
            const total = Math.max(1, data.fairSpins.length);
            return (
              <View key={person.id}>
                <Text style={{ color: person.color }}>
                  {person.label} · {n} spins
                </Text>
                <View
                  style={{
                    marginTop: 4,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <View
                    style={{
                      width: `${(n / total) * 100}%`,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: person.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </MiniChrome>
    </Screen>
  );
}
