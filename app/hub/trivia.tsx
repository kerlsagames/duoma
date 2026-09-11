import { Marquee, Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { TRIVIA_PROMPTS } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const BG = "#08060C";
const NEON = "#F6E27A";
const PINK = "#FF3D8B";

type Mode = "write" | "play" | "done";

export default function TriviaScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "YOU";
  const them = partner?.displayName || "THEM";
  const mine = data.triviaQuestions.filter((row) => row.authorId === user?.id);
  const [mode, setMode] = useState<Mode>(mine.length >= 6 ? "play" : "write");
  const [cursor, setCursor] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [draft, setDraft] = useState<number[]>(Array(TRIVIA_PROMPTS.length).fill(-1));
  const [error, setError] = useState<string | null>(null);
  const quiz = mine;
  const current = quiz[cursor] ?? null;
  const last = data.triviaAttempts.filter((row) => row.quizOwnerId === user?.id)[0];
  const unanswered = useMemo(() => draft.filter((n) => n < 0).length, [draft]);

  const saveAnswers = async () => {
    if (!user) return;
    if (draft.some((n) => n < 0)) {
      setError("Every light on the board has to be on.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      triviaQuestions: [
        ...TRIVIA_PROMPTS.map((prompt, i) => ({
          id: createId(),
          prompt: prompt.prompt,
          options: prompt.options,
          answerIndex: draft[i] ?? 0,
          authorId: user.id,
        })),
        ...state.triviaQuestions.filter((row) => row.authorId !== user.id),
      ],
    }));
    setMode("play");
    setCursor(0);
    setPicks([]);
  };

  const guess = async (index: number) => {
    if (!current || !user) return;
    const next = [...picks, index];
    setPicks(next);
    if (cursor + 1 < quiz.length) {
      setCursor(cursor + 1);
      return;
    }
    const score = quiz.reduce((sum, q, i) => sum + (q.answerIndex === next[i] ? 1 : 0), 0);
    await patch((state) => ({
      ...state,
      triviaAttempts: [
        {
          id: createId(),
          quizOwnerId: user.id,
          guesserId: user.id,
          answers: next,
          score,
          createdAt: nowIso(),
        },
        ...state.triviaAttempts,
      ],
    }));
    setMode("done");
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/play" as Href} accent={NEON}>
        <LinearGradient
          colors={["#2A1030", "#08060C"]}
          style={{
            borderRadius: 8,
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderWidth: 3,
            borderColor: NEON,
          }}
        >
          <Marquee text="HOW WELL DO YOU KNOW ME" color={NEON} />
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 36,
              color: NEON,
            }}
          >
            {you.toUpperCase()}
          </Text>
          <Text style={{ textAlign: "center", color: PINK, fontFamily: "SpaceMono", fontSize: 11 }}>
            LIVE FROM THE COUCH · {them.toUpperCase()} IN THE BOOTH
          </Text>
        </LinearGradient>

        {mode === "write" ? (
          <View style={{ marginTop: 16, gap: 14 }}>
            {TRIVIA_PROMPTS.map((prompt, qi) => (
              <View key={prompt.prompt}>
                <Text style={{ color: NEON, fontFamily: SERIF, fontSize: 20 }}>
                  {qi + 1}. {prompt.prompt}
                </Text>
                <View style={{ marginTop: 8, gap: 6 }}>
                  {prompt.options.map((opt, oi) => {
                    const on = draft[qi] === oi;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => {
                          const next = [...draft];
                          next[qi] = oi;
                          setDraft(next);
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 6,
                          backgroundColor: on ? PINK : "#16101C",
                          borderWidth: 2,
                          borderColor: on ? NEON : "#2A2030",
                        }}
                      >
                        <Text style={{ color: on ? "#FFF" : "#EDE4F4", fontWeight: "700" }}>
                          {String.fromCharCode(65 + oi)}  {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            <Pressable
              onPress={() => void saveAnswers()}
              style={{
                height: 56,
                backgroundColor: NEON,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#1A1008", fontWeight: "900", letterSpacing: 1 }}>
                LOCK IN · {TRIVIA_PROMPTS.length - unanswered} LIT
              </Text>
            </Pressable>
            {error ? <Text style={{ color: PINK }}>{error}</Text> : null}
          </View>
        ) : null}

        {mode === "play" && current && ready ? (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: PINK, fontFamily: "SpaceMono" }}>
              BUZZER {cursor + 1} / {quiz.length}
            </Text>
            <View
              style={{
                marginTop: 10,
                padding: 18,
                backgroundColor: "#140C18",
                borderRadius: 80,
                borderWidth: 2,
                borderColor: NEON,
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  lineHeight: 30,
                  color: "#FFF6D8",
                  textAlign: "center",
                }}
              >
                {current.prompt}
              </Text>
            </View>
            <View style={{ marginTop: 14, gap: 8 }}>
              {current.options.map((opt, i) => (
                <Pressable
                  key={opt}
                  onPress={() => void guess(i)}
                  style={{
                    padding: 14,
                    backgroundColor: i % 2 === 0 ? "#1C1230" : "#201018",
                    borderWidth: 2,
                    borderColor: i % 2 === 0 ? "#7C5CFF" : PINK,
                  }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "800" }}>
                    {String.fromCharCode(65 + i)} · {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {mode === "done" ? (
          <View style={{ marginTop: 24, alignItems: "center" }}>
            <Text style={{ color: NEON, fontFamily: "SpaceMono" }}>FINAL SCORE</Text>
            <Text style={{ fontFamily: SERIF, fontSize: 84, color: NEON }}>
              {last?.score ?? 0}
            </Text>
            <Text style={{ color: PINK, fontFamily: SERIF, fontSize: 20 }}>
              {(last?.score ?? 0) >= quiz.length - 1
                ? "Dangerously well. Leave a mystery."
                : "The booth is still guessing."}
            </Text>
            <Pressable
              onPress={() => {
                setMode("play");
                setCursor(0);
                setPicks([]);
              }}
              style={{ marginTop: 16 }}
            >
              <Text style={{ color: NEON }}>PLAY AGAIN</Text>
            </Pressable>
          </View>
        ) : null}
      </Stage>
    </Screen>
  );
}
