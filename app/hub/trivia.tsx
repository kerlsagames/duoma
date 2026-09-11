import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import {
  DEMO_KNOW_ME_PACKS,
  KNOW_ME_PACKS,
  KNOW_ME_WIN,
  demoAnswersForPack,
  latestGuess,
  scoreKnowMe,
  sheetFor,
  tallyKnowMeGuesses,
  type KnowMePack,
} from "@/lib/know-me";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG = "#08060C";
const NEON = "#F6E27A";
const PINK = "#FF3D8B";
const MUTED = "rgba(255,246,216,0.58)";

type ViewMode = "hub" | "answer-packs" | "answer" | "guess-packs" | "guess" | "result";

export default function TriviaScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const scrollRef = useRef<ScrollView>(null);
  const you = user?.displayName || "You";
  const them = partner?.displayName || "them";

  const [view, setView] = useState<ViewMode>("hub");
  const [packId, setPackId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [result, setResult] = useState<{
    pack: KnowMePack;
    guesses: number[];
    answers: number[];
    score: number;
  } | null>(null);

  const sheets = data.knowMeSheets;
  const guesses = data.knowMeGuesses;

  const pack = packId ? KNOW_ME_PACKS.find((row) => row.id === packId) ?? null : null;
  const myStats = useMemo(() => tallyKnowMeGuesses(guesses, user?.id), [guesses, user?.id]);
  const theirStats = useMemo(
    () => tallyKnowMeGuesses(guesses, partner?.id),
    [guesses, partner?.id]
  );
  const mySheets = useMemo(
    () => sheets.filter((row) => row.userId === user?.id),
    [sheets, user?.id]
  );
  const theirSheets = useMemo(
    () => sheets.filter((row) => row.userId === partner?.id),
    [sheets, partner?.id]
  );
  const waitingGuesses = theirSheets.filter(
    (sheet) => !latestGuess(guesses, sheet.packId, sheet.userId, user?.id ?? "")
  ).length;

  const go = useCallback((next: ViewMode) => {
    setView(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  useEffect(() => {
    if (!ready || !partner?.isDemo || !partner.id) return;
    const missing = DEMO_KNOW_ME_PACKS.filter(
      (id) => !sheets.some((row) => row.userId === partner.id && row.packId === id)
    );
    if (!missing.length) return;
    void patch((state) => ({
      ...state,
      knowMeSheets: [
        ...state.knowMeSheets,
        ...missing.map((id) => ({
          id: createId(),
          packId: id,
          userId: partner.id,
          answers: demoAnswersForPack(id),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        })),
      ],
    }));
  }, [ready, partner, sheets, patch]);

  const openAnswer = (id: string) => {
    const existing = sheetFor(sheets, user?.id, id);
    setPackId(id);
    setCursor(0);
    setPicks(existing ? [...existing.answers] : []);
    setResult(null);
    go("answer");
  };

  const openGuess = (id: string) => {
    setPackId(id);
    setCursor(0);
    setPicks([]);
    setResult(null);
    go("guess");
  };

  const pickOption = (index: number) => {
    const next = [...picks];
    next[cursor] = index;
    setPicks(next);
  };

  const saveAnswers = async () => {
    if (!user || !pack) return;
    if (picks.length < pack.questions.length || picks.some((n) => n < 0 || n == null)) return;
    const existing = sheetFor(sheets, user.id, pack.id);
    const now = nowIso();
    await patch((state) => ({
      ...state,
      knowMeSheets: existing
        ? state.knowMeSheets.map((row) =>
            row.id === existing.id
              ? { ...row, answers: [...picks], updatedAt: now }
              : row
          )
        : [
            {
              id: createId(),
              packId: pack.id,
              userId: user.id,
              answers: [...picks],
              createdAt: now,
              updatedAt: now,
            },
            ...state.knowMeSheets,
          ],
    }));
    setPackId(null);
    go("answer-packs");
  };

  const saveGuess = async () => {
    if (!user || !partner || !pack) return;
    const sheet = sheetFor(sheets, partner.id, pack.id);
    if (!sheet) return;
    if (picks.length < pack.questions.length || picks.some((n) => n < 0 || n == null)) return;
    const score = scoreKnowMe(sheet.answers, picks);
    await patch((state) => ({
      ...state,
      knowMeGuesses: [
        {
          id: createId(),
          packId: pack.id,
          ownerId: partner.id,
          guesserId: user.id,
          guesses: [...picks],
          score,
          createdAt: nowIso(),
        },
        ...state.knowMeGuesses,
      ],
    }));
    setResult({ pack, guesses: [...picks], answers: [...sheet.answers], score });
    go("result");
  };

  const current = pack?.questions[cursor] ?? null;
  const selected = current ? picks[cursor] : undefined;
  const quizMode = view === "answer" || view === "guess";
  const lastQuestion = pack ? cursor >= pack.questions.length - 1 : false;
  const canAdvance = typeof selected === "number";

  const advance = () => {
    if (!pack || !canAdvance) return;
    if (!lastQuestion) {
      setCursor(cursor + 1);
      return;
    }
    if (view === "answer") void saveAnswers();
    else void saveGuess();
  };

  return (
    <Screen scroll background={BG} scrollRef={scrollRef}>
      <Stage background={BG} fallback={"/hub/play" as Href} accent={NEON}>
        {view !== "hub" ? (
          <Pressable
            onPress={() => {
              if (view === "answer") go("answer-packs");
              else if (view === "guess") go("guess-packs");
              else if (view === "result") go("hub");
              else {
                setPackId(null);
                go("hub");
              }
            }}
            className="mb-3 flex-row items-center"
          >
            <Ionicons name="chevron-back" size={18} color={NEON} />
            <Text
              style={{
                marginLeft: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: NEON,
              }}
            >
              {view === "answer"
                ? "All packs"
                : view === "guess"
                  ? "Guess packs"
                  : view === "result"
                    ? "Scoreboard"
                    : "Scoreboard"}
            </Text>
          </Pressable>
        ) : null}

        {view === "hub" ? (
          <HubHome
            you={you}
            them={them}
            myStats={myStats}
            theirStats={theirStats}
            myPacks={mySheets.length}
            theirPacks={theirSheets.length}
            waitingGuesses={waitingGuesses}
            onAnswer={() => go("answer-packs")}
            onGuess={() => go("guess-packs")}
          />
        ) : null}

        {view === "answer-packs" ? (
          <PackGrid
            title="Answer my questions"
            subtitle="Lock in a pack so they can guess the real you."
            packs={KNOW_ME_PACKS}
            statusFor={(id) => {
              const mine = sheetFor(sheets, user?.id, id);
              return mine ? "Answered" : "10 questions";
            }}
            doneFor={(id) => Boolean(sheetFor(sheets, user?.id, id))}
            onPick={openAnswer}
          />
        ) : null}

        {view === "guess-packs" ? (
          theirSheets.length ? (
            <PackGrid
              title={`Guess ${them}`}
              subtitle={`${theirSheets.length} pack${theirSheets.length === 1 ? "" : "s"} ready. Seven or more is a win.`}
              packs={KNOW_ME_PACKS}
              statusFor={(id) => {
                const theirs = sheetFor(sheets, partner?.id, id);
                if (!theirs) return "Not answered yet";
                const last = user
                  ? latestGuess(guesses, id, theirs.userId, user.id)
                  : null;
                return last ? `${last.score}/10 last time` : "Ready";
              }}
              doneFor={(id) => Boolean(sheetFor(sheets, partner?.id, id))}
              lockedFor={(id) => !sheetFor(sheets, partner?.id, id)}
              onPick={(id) => {
                if (!sheetFor(sheets, partner?.id, id)) return;
                openGuess(id);
              }}
            />
          ) : (
            <View>
              <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 34, color: NEON }}>
                Guess {them}
              </Text>
              <View
                style={{
                  marginTop: 18,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "rgba(246,226,122,0.28)",
                  backgroundColor: "#140C18",
                  padding: 20,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 26, color: "#FFF6D8" }}>
                  Nothing to guess yet.
                </Text>
                <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 21, color: MUTED }}>
                  They need to lock in a pack first. Nudge them to answer theirs.
                </Text>
              </View>
            </View>
          )
        ) : null}

        {quizMode && pack && current ? (
          <View>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: PINK,
              }}
            >
              {pack.title} · {cursor + 1} / {pack.questions.length}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 26,
                lineHeight: 32,
                color: "#FFF6D8",
              }}
            >
              {current.prompt}
            </Text>
            <View style={{ marginTop: 16, gap: 8 }}>
              {current.options.map((opt, i) => {
                const on = selected === i;
                return (
                  <Pressable
                    key={`${current.id}-${opt}`}
                    onPress={() => pickOption(i)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: 16,
                      backgroundColor: on ? PINK : "#16101C",
                      borderWidth: 2,
                      borderColor: on ? NEON : "#2A2030",
                    }}
                  >
                    <Text style={{ color: on ? "#FFF" : "#EDE4F4", fontWeight: "700" }}>
                      {String.fromCharCode(65 + i)}  {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="mt-5 flex-row" style={{ gap: 10 }}>
              {cursor > 0 ? (
                <Pressable
                  onPress={() => setCursor(cursor - 1)}
                  style={{
                    flex: 1,
                    height: 52,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "rgba(246,226,122,0.35)",
                  }}
                >
                  <Text style={{ color: NEON, fontWeight: "700" }}>Back</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={advance}
                disabled={!canAdvance}
                style={{
                  flex: 2,
                  height: 52,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  backgroundColor: canAdvance ? NEON : "#2A2030",
                  opacity: canAdvance ? 1 : 0.55,
                }}
              >
                <Text style={{ color: "#1A1008", fontWeight: "900", letterSpacing: 0.6 }}>
                  {lastQuestion
                    ? view === "answer"
                      ? "Lock this pack in"
                      : "See my score"
                    : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {view === "result" && result ? (
          <ResultBoard
            them={them}
            result={result}
            onHub={() => {
              setPackId(null);
              setResult(null);
              go("hub");
            }}
            onAgain={() => go("guess-packs")}
          />
        ) : null}
      </Stage>
    </Screen>
  );
}

function HubHome({
  you,
  them,
  myStats,
  theirStats,
  myPacks,
  theirPacks,
  waitingGuesses,
  onAnswer,
  onGuess,
}: {
  you: string;
  them: string;
  myStats: ReturnType<typeof tallyKnowMeGuesses>;
  theirStats: ReturnType<typeof tallyKnowMeGuesses>;
  myPacks: number;
  theirPacks: number;
  waitingGuesses: number;
  onAnswer: () => void;
  onGuess: () => void;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2.4,
          textTransform: "uppercase",
          color: NEON,
        }}
      >
        How well do you know me
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 34,
          lineHeight: 40,
          color: NEON,
        }}
      >
        Scoreboard
      </Text>
      <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 16, lineHeight: 24, color: MUTED }}>
        Ten packs. Ten questions each. Seven right is a win.
      </Text>

      <View
        style={{
          marginTop: 18,
          borderRadius: 8,
          borderWidth: 3,
          borderColor: NEON,
          backgroundColor: "#140C18",
          padding: 16,
        }}
      >
        <StatRow
          label={`${you} know ${them}`}
          stats={myStats}
          empty={
            theirPacks
              ? `${theirPacks} pack${theirPacks === 1 ? "" : "s"} waiting`
              : "They haven't locked a pack in yet"
          }
        />
        <View style={{ height: 1, backgroundColor: "rgba(246,226,122,0.18)", marginVertical: 14 }} />
        <StatRow
          label={`${them} know you`}
          stats={theirStats}
          empty={
            myPacks
              ? `${myPacks} of your packs are ready for them`
              : "Answer a pack so they can guess"
          }
        />
      </View>

      <View style={{ marginTop: 16, gap: 12 }}>
        <Door
          icon="create-outline"
          title="Answer my questions"
          detail={
            myPacks
              ? `${myPacks} of 10 packs locked in`
              : "Pick a pack and tell the truth"
          }
          onPress={onAnswer}
        />
        <Door
          icon="help-circle-outline"
          title={`Guess ${them}`}
          detail={
            waitingGuesses
              ? `${waitingGuesses} pack${waitingGuesses === 1 ? "" : "s"} waiting on you`
              : theirPacks
                ? `${theirPacks} pack${theirPacks === 1 ? "" : "s"} ready`
                : "Waiting on them to answer"
          }
          hot
          badge={waitingGuesses || undefined}
          onPress={onGuess}
        />
      </View>
    </View>
  );
}

function StatRow({
  label,
  stats,
  empty,
}: {
  label: string;
  stats: ReturnType<typeof tallyKnowMeGuesses>;
  empty: string;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: PINK,
        }}
      >
        {label}
      </Text>
      {stats.asked ? (
        <>
          <Text style={{ marginTop: 6, fontFamily: SERIF, fontSize: 40, color: NEON }}>
            {stats.correct}
            <Text style={{ fontSize: 22, color: MUTED }}> / {stats.asked}</Text>
          </Text>
          <Text style={{ marginTop: 2, color: MUTED, fontSize: 13 }}>
            {stats.guesses} pack{stats.guesses === 1 ? "" : "s"} · {stats.wins} win
            {stats.wins === 1 ? "" : "s"}
          </Text>
        </>
      ) : (
        <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 16, lineHeight: 22, color: MUTED }}>
          {empty}
        </Text>
      )}
    </View>
  );
}

function Door({
  icon,
  title,
  detail,
  hot,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  hot?: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const accent = hot ? PINK : NEON;
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: hot ? "rgba(255,61,139,0.45)" : "rgba(246,226,122,0.28)",
        backgroundColor: "#140C18",
        paddingVertical: 18,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: hot ? "rgba(255,61,139,0.14)" : "rgba(246,226,122,0.12)",
          borderWidth: 1,
          borderColor: hot ? "rgba(255,61,139,0.4)" : "rgba(246,226,122,0.28)",
        }}
      >
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View className="ml-3 flex-1">
        <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#FFF6D8" }}>{title}</Text>
        <Text style={{ marginTop: 4, fontSize: 13, lineHeight: 19, color: MUTED }}>{detail}</Text>
      </View>
      {badge ? (
        <View
          style={{
            minWidth: 28,
            height: 28,
            paddingHorizontal: 8,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: PINK,
            marginLeft: 8,
          }}
        >
          <Text style={{ fontFamily: "SpaceMono", fontSize: 12, color: "#FFF6D8" }}>{badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={MUTED} />
      )}
    </Pressable>
  );
}

function PackGrid({
  title,
  subtitle,
  packs,
  statusFor,
  doneFor,
  lockedFor,
  onPick,
}: {
  title: string;
  subtitle: string;
  packs: KnowMePack[];
  statusFor: (id: string) => string;
  doneFor?: (id: string) => boolean;
  lockedFor?: (id: string) => boolean;
  onPick: (id: string) => void;
}) {
  return (
    <View>
      <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 34, color: NEON }}>{title}</Text>
      <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 15, lineHeight: 22, color: MUTED }}>
        {subtitle}
      </Text>
      <View className="mt-5 flex-row flex-wrap justify-between">
        {packs.map((item) => {
          const locked = lockedFor?.(item.id) ?? false;
          const done = doneFor?.(item.id) ?? false;
          return (
            <Pressable
              key={item.id}
              onPress={() => onPick(item.id)}
              style={{
                width: "48%",
                marginBottom: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: done ? item.accent : "rgba(246,226,122,0.18)",
                backgroundColor: "#140C18",
                paddingVertical: 16,
                paddingHorizontal: 12,
                opacity: locked ? 0.45 : 1,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: item.accent,
                  marginBottom: 10,
                }}
              />
              <Text style={{ fontFamily: SERIF, fontSize: 18, color: "#FFF6D8" }}>
                {item.title}
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, lineHeight: 17, color: MUTED }}>
                {locked ? "Waiting on them" : item.blurb}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: "SpaceMono",
                  fontSize: 10,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: item.accent,
                }}
              >
                {statusFor(item.id)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ResultBoard({
  them,
  result,
  onHub,
  onAgain,
}: {
  them: string;
  result: { pack: KnowMePack; guesses: number[]; answers: number[]; score: number };
  onHub: () => void;
  onAgain: () => void;
}) {
  const win = result.score >= KNOW_ME_WIN;
  const line =
    result.score === 10
      ? "Dangerously well. Leave a mystery."
      : win
        ? `You live here. That's a win.`
        : result.score >= 4
          ? "The booth is still guessing."
          : "Cute. Wrong. Try another pack.";

  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: PINK,
        }}
      >
        {result.pack.title} · vs {them}
      </Text>
      <Text style={{ marginTop: 6, fontFamily: SERIF, fontSize: 22, color: MUTED }}>
        Final score
      </Text>
      <Text style={{ fontFamily: SERIF, fontSize: 84, lineHeight: 90, color: NEON }}>
        {result.score}
        <Text style={{ fontSize: 28, color: MUTED }}>/10</Text>
      </Text>
      <Text style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 28, color: PINK }}>{line}</Text>

      <View style={{ marginTop: 18, gap: 8 }}>
        {result.pack.questions.map((q, i) => {
          const ok = result.guesses[i] === result.answers[i];
          return (
            <View
              key={q.id}
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: ok ? "rgba(246,226,122,0.35)" : "rgba(255,61,139,0.28)",
                backgroundColor: "#140C18",
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 13, lineHeight: 18, color: MUTED }}>{q.prompt}</Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 15,
                  color: ok ? NEON : PINK,
                }}
              >
                {ok ? "You got it — " : "They said — "}
                {q.options[result.answers[i]]}
              </Text>
              {!ok ? (
                <Text style={{ marginTop: 2, fontSize: 13, color: MUTED }}>
                  You picked {q.options[result.guesses[i]]}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={onAgain}
        style={{
          marginTop: 18,
          height: 52,
          borderRadius: 14,
          backgroundColor: NEON,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#1A1008", fontWeight: "900" }}>Guess another pack</Text>
      </Pressable>
      <Pressable onPress={onHub} style={{ marginTop: 12, alignItems: "center", padding: 10 }}>
        <Text style={{ color: NEON, fontFamily: "SpaceMono", fontSize: 12, letterSpacing: 1 }}>
          BACK TO THE SCOREBOARD
        </Text>
      </Pressable>
    </View>
  );
}
