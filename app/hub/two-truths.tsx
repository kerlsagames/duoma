import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";

const FELT = "#0E3B2E";
const GOLD = "#E4C37A";

function PlayingCard({
  index,
  text,
  flipped,
  onFlip,
}: {
  index: number;
  text: string;
  flipped: boolean;
  onFlip: () => void;
}) {
  const rot = useRef(new Animated.Value(flipped ? 1 : 0)).current;
  const flip = () => {
    Animated.spring(rot, { toValue: 1, friction: 7, useNativeDriver: true }).start(() =>
      onFlip()
    );
  };
  const rotateY = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  return (
    <Pressable onPress={flipped ? undefined : flip}>
      <Animated.View
        style={{
          height: 150,
          borderRadius: 12,
          backgroundColor: flipped ? "#F7F1E3" : "#7B1028",
          borderWidth: 3,
          borderColor: GOLD,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          transform: [{ rotateY }, { rotate: index === 1 ? "-2deg" : index === 2 ? "2deg" : "0deg" }],
        }}
      >
        {flipped ? (
          <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#1A140C", textAlign: "center" }}>
            {text}
          </Text>
        ) : (
          <Text style={{ fontFamily: SERIF, fontSize: 42, color: GOLD }}>{index + 1}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function TwoTruthsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [wish, setWish] = useState(2);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const latest = data.twoTruths.filter((row) => row.authorId === user?.id)[0] ?? null;
  const revealed = latest && latest.guessIndex !== null;

  const submit = async () => {
    if (!user) return;
    if (!a.trim() || !b.trim() || !c.trim()) {
      setError("Three cards. Always.");
      return;
    }
    setError(null);
    setFlipped([]);
    await patch((state) => ({
      ...state,
      twoTruths: [
        {
          id: createId(),
          authorId: user.id,
          items: [a.trim(), b.trim(), c.trim()],
          wishIndex: wish,
          guessIndex: null,
          guesserId: null,
          createdAt: nowIso(),
        },
        ...state.twoTruths,
      ],
    }));
    setA("");
    setB("");
    setC("");
  };

  const guess = async (index: number) => {
    if (!latest) return;
    await patch((state) => ({
      ...state,
      twoTruths: state.twoTruths.map((row) =>
        row.id === latest.id
          ? { ...row, guessIndex: index, guesserId: user?.id ?? null }
          : row
      ),
    }));
  };

  return (
    <Screen scroll background={FELT}>
      <Stage background={FELT} fallback={"/hub/play" as Href} accent={GOLD}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 22,
            color: GOLD,
          }}
        >
          felt table · {them} deals
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 34,
            color: "#F4E7C5",
          }}
        >
          Two truths & a wish
        </Text>

        {latest && !revealed ? (
          <View style={{ marginTop: 18, gap: 12 }}>
            <Text style={{ textAlign: "center", color: GOLD }}>
              Flip the cards. Tap the one that hasn't happened yet.
            </Text>
            {latest.items.map((item, i) => (
              <PlayingCard
                key={item}
                index={i}
                text={item}
                flipped={flipped.includes(i)}
                onFlip={() => {
                  setFlipped((prev) => (prev.includes(i) ? prev : [...prev, i]));
                  if (flipped.length >= 2) void guess(i);
                }}
              />
            ))}
          </View>
        ) : null}

        {revealed && latest ? (
          <View
            style={{
              marginTop: 18,
              padding: 18,
              backgroundColor: "#F7F1E3",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 24, color: "#1A140C" }}>
              {latest.guessIndex === latest.wishIndex
                ? "You caught the wish."
                : "Wrong card. The wish is still loose in the deck."}
            </Text>
            <Text style={{ marginTop: 8, fontFamily: HANDWRITING, fontSize: 20, color: "#5A3A20" }}>
              It was: {latest.items[latest.wishIndex]}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            marginTop: 22,
            backgroundColor: "#0A2A22",
            padding: 14,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: GOLD,
          }}
        >
          <Text style={{ color: GOLD, fontFamily: HANDWRITING, fontSize: 20 }}>Deal a new hand</Text>
          {[a, b, c].map((val, i) => (
            <Pressable key={i} onPress={() => setWish(i)} style={{ marginTop: 10 }}>
              <Text style={{ color: wish === i ? GOLD : "rgba(228,195,122,0.45)", fontSize: 12 }}>
                {wish === i ? "◆ the wish" : "truth"}
              </Text>
              <TextInput
                value={val}
                onChangeText={(t) => {
                  if (i === 0) setA(t);
                  if (i === 1) setB(t);
                  if (i === 2) setC(t);
                }}
                placeholder={i === 2 ? "the future, dressed as a fact" : "already true"}
                placeholderTextColor="rgba(244,231,197,0.3)"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: GOLD,
                  color: "#F4E7C5",
                  fontFamily: SERIF,
                  fontSize: 18,
                  paddingVertical: 6,
                }}
              />
            </Pressable>
          ))}
          <Pressable
            onPress={() => void submit()}
            style={{
              marginTop: 14,
              height: 46,
              backgroundColor: GOLD,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#0E3B2E", fontWeight: "900" }}>Lay them down</Text>
          </Pressable>
          {error ? <Text style={{ marginTop: 8, color: "#FFB4B4" }}>{error}</Text> : null}
          {!ready || !latest ? (
            <Text style={{ marginTop: 10, color: "rgba(228,195,122,0.5)" }}>
              Two things that already happened. One you want. Don’t mark it too obviously.
            </Text>
          ) : null}
        </View>
      </Stage>
    </Screen>
  );
}
