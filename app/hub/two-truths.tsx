import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#100C14";
const LILAC = "#C9A0DC";

export default function TwoTruthsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [wish, setWish] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const mine = data.twoTruths.filter((row) => row.authorId === user?.id);
  const latest = mine[0] ?? null;

  const submit = async () => {
    if (!user) return;
    if (!a.trim() || !b.trim() || !c.trim()) {
      setError("Three lines. Two true, one a wish.");
      return;
    }
    setError(null);
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

  const revealed = latest && latest.guessIndex !== null;

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={LILAC}
        fallback={"/hub/play" as Href}
        kicker="Fun · table"
        title="Two truths & a wish"
        body={`Not a lie — a wish. ${them} has to spot the future hiding in the facts.`}
        ready={ready}
      >
        {latest && !revealed ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            <Text style={{ color: LILAC, fontFamily: "SpaceMono", fontSize: 11 }}>
              WHICH ONE IS THE WISH?
            </Text>
            {latest.items.map((item, i) => (
              <Pressable
                key={item}
                onPress={() => void guess(i)}
                style={{
                  padding: 18,
                  borderRadius: 18,
                  backgroundColor: "#1A1422",
                  borderWidth: 1,
                  borderColor: "rgba(201,160,220,0.3)",
                }}
              >
                <Text style={{ color: "rgba(201,160,220,0.7)", fontSize: 12 }}>
                  Card {i + 1}
                </Text>
                <Text style={{ marginTop: 6, fontFamily: SERIF, fontSize: 20, color: "#F4F4F6" }}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {revealed && latest ? (
          <View
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 20,
              backgroundColor: "#1A1422",
            }}
          >
            <Text style={{ color: LILAC, fontFamily: SERIF, fontSize: 22 }}>
              {latest.guessIndex === latest.wishIndex
                ? "Caught. That's the wish."
                : "Wrong card. The wish is still loose."}
            </Text>
            <Text style={{ marginTop: 10, color: "rgba(244,244,246,0.65)" }}>
              The wish was: {latest.items[latest.wishIndex]}
            </Text>
          </View>
        ) : null}

        <Text
          style={{
            marginTop: 24,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(201,160,220,0.7)",
          }}
        >
          DEAL A NEW HAND
        </Text>
        {[a, b, c].map((val, i) => (
          <View key={i} style={{ marginTop: 10 }}>
            <Pressable onPress={() => setWish(i)}>
              <Text style={{ color: wish === i ? LILAC : "rgba(244,244,246,0.4)", fontSize: 12 }}>
                {wish === i ? "◆ this is the wish" : "truth"}
              </Text>
            </Pressable>
            <TextInput
              value={val}
              onChangeText={(t) => {
                if (i === 0) setA(t);
                if (i === 1) setB(t);
                if (i === 2) setC(t);
              }}
              placeholder={i === 2 ? "The wish, disguised as a fact" : "A true thing"}
              placeholderTextColor="rgba(244,244,246,0.3)"
              style={{
                marginTop: 4,
                borderRadius: 14,
                padding: 12,
                backgroundColor: "#1A1422",
                color: "#F4F4F6",
              }}
            />
          </View>
        ))}
        <Pressable
          onPress={() => void submit()}
          style={{
            marginTop: 14,
            height: 50,
            borderRadius: 16,
            backgroundColor: LILAC,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#160C1C", fontWeight: "800" }}>Lay the cards down</Text>
        </Pressable>
        {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
        {!latest ? (
          <EmptyHint text="Write two things that are already true, and one you want to become true. Don't mark it too obviously." />
        ) : null}
      </MiniChrome>
    </Screen>
  );
}
