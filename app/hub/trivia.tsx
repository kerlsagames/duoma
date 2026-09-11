import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { TRIVIA_PROMPTS } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const BG = "#120E08";
const GOLD = "#F0C75E";

type Mode = "write" | "play" | "done";

export default function TriviaScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "You";
  const them = partner?.displayName || "them";
  const mine = data.triviaQuestions.filter((row) => row.authorId === user?.id);
  const [mode, setMode] = useState<Mode>(mine.length >= 6 ? "play" : "write");
  const [cursor, setCursor] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [draft, setDraft] = useState<number[]>(Array(TRIVIA_PROMPTS.length).fill(-1));
  const [error, setError] = useState<string | null>(null);

  const quiz = mine;
  const current = quiz[cursor] ?? null;
  const last = data.triviaAttempts.filter((row) => row.quizOwnerId === user?.id)[0];

  const unanswered = useMemo(
    () => draft.filter((n) => n < 0).length,
    [draft]
  );

  const saveAnswers = async () => {
    if (!user) return;
    if (draft.some((n) => n < 0)) {
      setError("Answer every question about yourself first.");
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
    const score = quiz.reduce(
      (sum, q, i) => sum + (q.answerIndex === next[i] ? 1 : 0),
      0
    );
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
      <MiniChrome
        accent={GOLD}
        fallback={"/hub/play" as Href}
        kicker="Fun · game show"
        title="How well do you know me?"
        body={`You answer as yourself. Then ${them} (or future-you) tries to guess. Lights, no buzzer, mild humiliation.`}
        ready={ready}
      >
        {mode === "write" ? (
          <View style={{ marginTop: 18, gap: 16 }}>
            {TRIVIA_PROMPTS.map((prompt, qi) => (
              <View
                key={prompt.prompt}
                style={{
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: "#1C160C",
                  borderWidth: 1,
                  borderColor: "rgba(240,199,94,0.22)",
                }}
              >
                <Text style={{ color: GOLD, fontFamily: SERIF, fontSize: 18 }}>
                  {qi + 1}. {prompt.prompt}
                </Text>
                <View style={{ marginTop: 10, gap: 6 }}>
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
                          padding: 10,
                          borderRadius: 12,
                          backgroundColor: on ? `${GOLD}33` : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <Text style={{ color: on ? GOLD : "#F4F4F6" }}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            <Pressable
              onPress={() => void saveAnswers()}
              style={{
                height: 52,
                borderRadius: 16,
                backgroundColor: GOLD,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#1A1405", fontWeight: "800" }}>
                Lock my answers · {TRIVIA_PROMPTS.length - unanswered} / {TRIVIA_PROMPTS.length}
              </Text>
            </Pressable>
            {error ? <Text style={{ color: "#FF8A8A" }}>{error}</Text> : null}
          </View>
        ) : null}

        {mode === "play" && current ? (
          <View style={{ marginTop: 18 }}>
            <Text style={{ color: GOLD, fontFamily: "SpaceMono", fontSize: 12 }}>
              Q{cursor + 1} / {quiz.length} · guessing {you}
            </Text>
            <Text
              style={{
                marginTop: 12,
                fontFamily: SERIF,
                fontSize: 26,
                lineHeight: 32,
                color: "#F7F1E3",
              }}
            >
              {current.prompt}
            </Text>
            <View style={{ marginTop: 16, gap: 8 }}>
              {current.options.map((opt, i) => (
                <Pressable
                  key={opt}
                  onPress={() => void guess(i)}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: "#1C160C",
                    borderWidth: 1,
                    borderColor: "rgba(240,199,94,0.3)",
                  }}
                >
                  <Text style={{ color: "#F4F4F6", fontSize: 16 }}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {mode === "play" && !current ? (
          <EmptyHint text="Write your answers first so there's a quiz to play." />
        ) : null}

        {mode === "done" ? (
          <View
            style={{
              marginTop: 22,
              padding: 22,
              borderRadius: 24,
              backgroundColor: "#1C160C",
              alignItems: "center",
            }}
          >
            <Text style={{ color: GOLD, fontFamily: SERIF, fontSize: 18 }}>Score</Text>
            <Text style={{ fontFamily: SERIF, fontSize: 64, color: GOLD }}>
              {last?.score ?? 0}/{quiz.length}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.6)", textAlign: "center" }}>
              {(last?.score ?? 0) >= quiz.length - 1
                ? "Dangerously well. Keep a little mystery."
                : "Room to be surprised. That's healthy."}
            </Text>
            <Pressable
              onPress={() => {
                setMode("play");
                setCursor(0);
                setPicks([]);
              }}
              style={{ marginTop: 16, padding: 12 }}
            >
              <Text style={{ color: GOLD }}>Play again</Text>
            </Pressable>
            <Pressable onPress={() => setMode("write")}>
              <Text style={{ color: "rgba(244,244,246,0.5)" }}>Rewrite my answers</Text>
            </Pressable>
          </View>
        ) : null}
      </MiniChrome>
    </Screen>
  );
}
