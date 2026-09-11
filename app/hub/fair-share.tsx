import { CarnivalWheel } from "@/components/hub/CarnivalWheel";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C1410";
const PINK = "#FF6B9A";
const BLUE = "#5B8CFF";

function sliceColor(
  gender: string | null | undefined,
  fallback: string
) {
  if (gender === "female") return PINK;
  if (gender === "male") return BLUE;
  return fallback;
}

export default function FairShareScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "You";
  const them = partner?.displayName || "Them";
  const [choreId, setChoreId] = useState("");
  const [draft, setDraft] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const angle = useRef(0);
  const people = useMemo(() => {
    const youColor = sliceColor(user?.gender, PINK);
    const themColor = sliceColor(partner?.gender, youColor === PINK ? BLUE : PINK);
    return [
      { id: user?.id ?? "you", label: you, color: youColor },
      { id: partner?.id ?? "them", label: them, color: themColor === youColor ? BLUE : themColor },
    ];
  }, [partner?.gender, partner?.id, them, user?.gender, user?.id, you]);
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
    const extra = 360 * 8 + Math.random() * 360;
    const next = angle.current + extra;
    angle.current = next;
    Animated.timing(rotation, {
      toValue: next,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const deg = (360 - (next % 360)) % 360;
      const index = Math.floor(deg / 180) % 2;
      const person = people[index]!;
      setWinner(person.label);
      setSpinning(false);
      void patch((state) => ({
        ...state,
        fairSpins: [
          { id: createId(), choreId: chore.id, winnerId: person.id, createdAt: nowIso() },
          ...state.fairSpins,
        ].slice(0, 40),
      }));
    });
  };

  const addChore = async () => {
    const label = draft.trim();
    if (!label) return;
    const id = createId();
    await patch((state) => ({
      ...state,
      chores: [...state.chores, { id, label }],
    }));
    setChoreId(id);
    setDraft("");
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent={PINK}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 18,
            color: "#F0C75E",
          }}
        >
          TONIGHT ONLY
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 40,
            color: "#E8FFF8",
          }}
        >
          {you}  vs  {them}
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: "#3ECFBF",
          }}
        >
          the wheel assigns the victim
        </Text>

        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a chore"
            placeholderTextColor="rgba(232,255,248,0.35)"
            onSubmitEditing={() => void addChore()}
            returnKeyType="done"
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,107,154,0.35)",
              backgroundColor: "#16241E",
              paddingHorizontal: 14,
              color: "#E8FFF8",
              fontSize: 16,
            }}
          />
          <Pressable
            onPress={() => void addChore()}
            disabled={!draft.trim()}
            style={{
              height: 48,
              paddingHorizontal: 16,
              borderRadius: 14,
              backgroundColor: PINK,
              alignItems: "center",
              justifyContent: "center",
              opacity: draft.trim() ? 1 : 0.45,
            }}
          >
            <Text style={{ color: "#1A0508", fontWeight: "800" }}>Add</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {data.chores.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setChoreId(row.id)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: chore?.id === row.id ? "#3ECFBF" : "#16241E",
              }}
            >
              <Text style={{ color: chore?.id === row.id ? "#062016" : "#E8FFF8" }}>
                {row.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: 8 }}>
          <CarnivalWheel
            slices={people.map((p) => ({ label: p.label, color: p.color }))}
            rotation={rotation}
            size={300}
            bulbColor={PINK}
            labelFontSize={22}
            maxChars={16}
            firstWordOnly={false}
          />
        </View>
        <Pressable
          onPress={spin}
          disabled={spinning}
          style={{
            height: 52,
            backgroundColor: "#3ECFBF",
            alignItems: "center",
            justifyContent: "center",
            opacity: spinning ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#062016", fontWeight: "900" }}>
            {spinning ? "fate is thinking…" : `spin for ${chore?.label ?? "a chore"}`}
          </Text>
        </Pressable>
        {winner ? (
          <Text
            style={{
              marginTop: 14,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 26,
              color: "#F0C75E",
            }}
          >
            {winner} does {chore?.label.toLowerCase()}.
          </Text>
        ) : null}
        <View style={{ marginTop: 18, gap: 8 }}>
          {people.map((person) => {
            const n = counts[person.id] ?? 0;
            const total = Math.max(1, data.fairSpins.length);
            return (
              <View key={person.id}>
                <Text style={{ color: person.color, fontFamily: "SpaceMono" }}>
                  {person.label} · {n}
                </Text>
                <View style={{ height: 10, backgroundColor: "#16241E" }}>
                  <View
                    style={{
                      width: `${(n / total) * 100}%`,
                      height: 10,
                      backgroundColor: person.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
        {!ready ? <Text style={{ color: "#3ECFBF" }}>Oiling the wheel…</Text> : null}
      </Stage>
    </Screen>
  );
}
