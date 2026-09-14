import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { KNOW_ME_DISPLAY, KNOW_ME_TONE, SERIF } from "@/lib/app-themes";
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

const T = KNOW_ME_TONE;

type ViewMode =
  | "hub"
  | "answer-packs"
  | "answer"
  | "guess-packs"
  | "guess"
  | "result";

function Marquee() {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
        paddingHorizontal: 2,
      }}
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i % 2 === 0 ? T.gold : T.magenta,
            opacity: i % 3 === 0 ? 1 : 0.45,
          }}
        />
      ))}
    </View>
  );
}

function StudioFrame({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        borderRadius: 6,
        borderWidth: 3,
        borderColor: T.gold,
        backgroundColor: T.stage,
        padding: 16,
        shadowColor: T.magenta,
        shadowOpacity: 0.25,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      {children}
    </View>
  );
}

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

  const pack = packId
    ? (KNOW_ME_PACKS.find((row) => row.id === packId) ?? null)
    : null;
  const myStats = useMemo(
    () => tallyKnowMeGuesses(guesses, user?.id),
    [guesses, user?.id]
  );
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
    (sheet) =>
      !latestGuess(guesses, sheet.packId, sheet.userId, user?.id ?? "")
  ).length;

  const go = useCallback((next: ViewMode) => {
    setView(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  useEffect(() => {
    if (!ready || !partner?.isDemo || !partner.id) return;
    const missing = DEMO_KNOW_ME_PACKS.filter(
      (id) =>
        !sheets.some((row) => row.userId === partner.id && row.packId === id)
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
    if (
      picks.length < pack.questions.length ||
      picks.some((n) => n < 0 || n == null)
    )
      return;
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
    if (
      picks.length < pack.questions.length ||
      picks.some((n) => n < 0 || n == null)
    )
      return;
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
    setResult({
      pack,
      guesses: [...picks],
      answers: [...sheet.answers],
      score,
    });
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
    <Screen scroll background={T.background} scrollRef={scrollRef}>
      <Stage
        background={T.background}
        fallback={"/hub/play" as Href}
        accent={T.gold}
      >
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
            <Ionicons name="chevron-back" size={18} color={T.cyan} />
            <Text
              style={{
                marginLeft: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: T.cyan,
              }}
            >
              {view === "answer"
                ? "All packs"
                : view === "guess"
                  ? "Guess packs"
                  : view === "result"
                    ? "Studio"
                    : "Studio"}
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
            title="YOUR ANSWERS"
            subtitle="Lock a pack so they can play contestant."
            packs={KNOW_ME_PACKS}
            statusFor={(id) => {
              const mine = sheetFor(sheets, user?.id, id);
              return mine ? "LOCKED IN" : "10 Qs";
            }}
            doneFor={(id) => Boolean(sheetFor(sheets, user?.id, id))}
            onPick={openAnswer}
          />
        ) : null}

        {view === "guess-packs" ? (
          theirSheets.length ? (
            <PackGrid
              title={`GUESS ${them.toUpperCase()}`}
              subtitle={`${theirSheets.length} pack${
                theirSheets.length === 1 ? "" : "s"
              } ready. ${KNOW_ME_WIN}+ correct wins the round.`}
              packs={KNOW_ME_PACKS}
              statusFor={(id) => {
                const theirs = sheetFor(sheets, partner?.id, id);
                if (!theirs) return "NOT READY";
                const last = user
                  ? latestGuess(guesses, id, theirs.userId, user.id)
                  : null;
                return last ? `${last.score}/10 LAST` : "READY";
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
              <Marquee />
              <Text
                style={{
                  fontFamily: KNOW_ME_DISPLAY,
                  fontSize: 34,
                  lineHeight: 38,
                  color: T.gold,
                  letterSpacing: 1,
                }}
              >
                GUESS {them.toUpperCase()}
              </Text>
              <StudioFrame>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 20,
                    lineHeight: 28,
                    color: T.ink,
                  }}
                >
                  No packs on stage yet.
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    lineHeight: 21,
                    color: T.muted,
                  }}
                >
                  They need to lock in answers first. Nudge your contestant.
                </Text>
              </StudioFrame>
            </View>
          )
        ) : null}

        {quizMode && pack && current ? (
          <View>
            <Marquee />
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: T.magenta,
              }}
            >
              {view === "answer" ? "Contestant booth" : "Guessing booth"} ·{" "}
              {pack.title}
            </Text>
            <View
              style={{
                marginTop: 10,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 4,
                backgroundColor: T.goldSoft,
                borderWidth: 1,
                borderColor: T.gold,
              }}
            >
              <Text
                style={{
                  fontFamily: KNOW_ME_DISPLAY,
                  fontSize: 16,
                  letterSpacing: 1.2,
                  color: T.gold,
                }}
              >
                Q {cursor + 1} / {pack.questions.length}
              </Text>
            </View>
            <Text
              style={{
                marginTop: 14,
                fontFamily: SERIF,
                fontSize: 26,
                lineHeight: 32,
                color: T.ink,
              }}
            >
              {current.prompt}
            </Text>
            <View style={{ marginTop: 16, gap: 10 }}>
              {current.options.map((opt, i) => {
                const on = selected === i;
                const letter = String.fromCharCode(65 + i);
                return (
                  <Pressable
                    key={`${current.id}-${opt}`}
                    onPress={() => pickOption(i)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                      backgroundColor: on ? T.magenta : T.panel,
                      borderWidth: 2,
                      borderColor: on ? T.gold : "rgba(255,229,102,0.18)",
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 4,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: on
                          ? "rgba(5,4,10,0.35)"
                          : T.panelRaised,
                        borderWidth: 1,
                        borderColor: on ? T.gold : T.cyan,
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: KNOW_ME_DISPLAY,
                          fontSize: 18,
                          color: on ? T.gold : T.cyan,
                          fontWeight: "800",
                        }}
                      >
                        {letter}
                      </Text>
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        color: on ? "#FFF" : T.ink,
                        fontWeight: "700",
                        fontSize: 15,
                        lineHeight: 20,
                      }}
                    >
                      {opt}
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
                    height: 56,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: T.cyan,
                  }}
                >
                  <Text
                    style={{
                      color: T.cyan,
                      fontFamily: KNOW_ME_DISPLAY,
                      fontSize: 16,
                      letterSpacing: 1,
                    }}
                  >
                    BACK
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={advance}
                disabled={!canAdvance}
                style={{
                  flex: 2,
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  backgroundColor: canAdvance ? T.gold : T.panelRaised,
                  opacity: canAdvance ? 1 : 0.55,
                }}
              >
                <Text
                  style={{
                    color: "#14080C",
                    fontFamily: KNOW_ME_DISPLAY,
                    fontSize: 18,
                    letterSpacing: 1.4,
                    fontWeight: "900",
                  }}
                >
                  {lastQuestion
                    ? view === "answer"
                      ? "LOCK THIS PACK"
                      : "LOCK IN SCORE"
                    : "NEXT"}
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
      <Marquee />
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2.6,
          textTransform: "uppercase",
          color: T.cyan,
        }}
      >
        Live from the booth
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 40,
          lineHeight: 44,
          color: T.gold,
          letterSpacing: 0.5,
        }}
      >
        HOW WELL DO YOU KNOW ME?
      </Text>
      <Text
        style={{
          marginTop: 10,
          fontFamily: SERIF,
          fontSize: 16,
          lineHeight: 24,
          color: T.muted,
        }}
      >
        Ten packs. Ten questions. Hit {KNOW_ME_WIN} or more and you win the
        round.
      </Text>

      <View style={{ marginTop: 18 }}>
        <StudioFrame>
          <View className="flex-row" style={{ gap: 12 }}>
            <Podium
              label={`YOU · ${you}`}
              accent={T.cyan}
              stats={myStats}
              empty={
                theirPacks
                  ? `${theirPacks} pack${theirPacks === 1 ? "" : "s"} waiting`
                  : "They haven't locked a pack"
              }
            />
            <View
              style={{
                width: 2,
                backgroundColor: "rgba(255,229,102,0.22)",
              }}
            />
            <Podium
              label={`${them.toUpperCase()}`}
              accent={T.magenta}
              stats={theirStats}
              empty={
                myPacks
                  ? `${myPacks} of your packs ready`
                  : "Answer a pack for them"
              }
            />
          </View>
        </StudioFrame>
      </View>

      <View style={{ marginTop: 16, gap: 12 }}>
        <Door
          kicker="BOOTH A"
          title="Answer my questions"
          detail={
            myPacks
              ? `${myPacks} of 10 packs locked in`
              : "Pick a pack and tell the truth"
          }
          onPress={onAnswer}
        />
        <Door
          kicker="BOOTH B"
          title={`Guess ${them}`}
          detail={
            waitingGuesses
              ? `${waitingGuesses} pack${
                  waitingGuesses === 1 ? "" : "s"
                } waiting on you`
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

function Podium({
  label,
  accent,
  stats,
  empty,
}: {
  label: string;
  accent: string;
  stats: ReturnType<typeof tallyKnowMeGuesses>;
  empty: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {label}
      </Text>
      {stats.asked ? (
        <>
          <Text
            style={{
              marginTop: 8,
              fontFamily: KNOW_ME_DISPLAY,
              fontSize: 36,
              color: T.gold,
            }}
          >
            {stats.correct}
            <Text style={{ fontSize: 18, color: T.dim }}>/{stats.asked}</Text>
          </Text>
          <Text style={{ marginTop: 2, color: T.muted, fontSize: 12 }}>
            {stats.guesses} pack{stats.guesses === 1 ? "" : "s"} · {stats.wins}{" "}
            win{stats.wins === 1 ? "" : "s"}
          </Text>
        </>
      ) : (
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 14,
            lineHeight: 20,
            color: T.muted,
          }}
        >
          {empty}
        </Text>
      )}
    </View>
  );
}

function Door({
  kicker,
  title,
  detail,
  hot,
  badge,
  onPress,
}: {
  kicker: string;
  title: string;
  detail: string;
  hot?: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const accent = hot ? T.magenta : T.cyan;
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 6,
        borderWidth: 2,
        borderColor: hot ? T.magenta : T.gold,
        backgroundColor: T.panel,
        paddingVertical: 16,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: hot ? T.magentaSoft : T.goldSoft,
          borderWidth: 1,
          borderColor: accent,
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontFamily: KNOW_ME_DISPLAY,
            fontSize: 12,
            letterSpacing: 0.8,
            color: accent,
            textAlign: "center",
          }}
        >
          {kicker}
        </Text>
      </View>
      <View className="flex-1">
        <Text
          style={{
            fontFamily: KNOW_ME_DISPLAY,
            fontSize: 20,
            color: T.ink,
            letterSpacing: 0.4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{ marginTop: 4, fontSize: 13, lineHeight: 18, color: T.muted }}
        >
          {detail}
        </Text>
      </View>
      {badge ? (
        <View
          style={{
            minWidth: 28,
            height: 28,
            paddingHorizontal: 8,
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: T.magenta,
            marginLeft: 8,
          }}
        >
          <Text
            style={{ fontFamily: "SpaceMono", fontSize: 12, color: T.ink }}
          >
            {badge}
          </Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={T.dim} />
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
      <Marquee />
      <Text
        style={{
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 32,
          lineHeight: 36,
          color: T.gold,
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 15,
          lineHeight: 22,
          color: T.muted,
        }}
      >
        {subtitle}
      </Text>
      <View className="mt-5 flex-row flex-wrap justify-between">
        {packs.map((item, index) => {
          const locked = lockedFor?.(item.id) ?? false;
          const done = doneFor?.(item.id) ?? false;
          const doorColor = index % 2 === 0 ? T.cyan : T.magenta;
          return (
            <Pressable
              key={item.id}
              onPress={() => onPick(item.id)}
              style={{
                width: "48%",
                marginBottom: 12,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: done ? item.accent : doorColor,
                backgroundColor: T.panel,
                paddingVertical: 14,
                paddingHorizontal: 12,
                opacity: locked ? 0.45 : 1,
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 10,
                  letterSpacing: 1.2,
                  color: doorColor,
                }}
              >
                DOOR {index + 1}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: KNOW_ME_DISPLAY,
                  fontSize: 18,
                  color: T.ink,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  lineHeight: 17,
                  color: T.muted,
                }}
              >
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
  result: {
    pack: KnowMePack;
    guesses: number[];
    answers: number[];
    score: number;
  };
  onHub: () => void;
  onAgain: () => void;
}) {
  const win = result.score >= KNOW_ME_WIN;
  const line =
    result.score === 10
      ? "PERFECT ROUND. Leave a little mystery."
      : win
        ? "YOU WIN. You live here."
        : result.score >= 4
          ? "CLOSE. The booth wants another try."
          : "BUZZED OUT. Pick another pack.";

  return (
    <View>
      <Marquee />
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.8,
          textTransform: "uppercase",
          color: T.magenta,
        }}
      >
        {result.pack.title} · vs {them}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 22,
          color: T.dim,
          letterSpacing: 1,
        }}
      >
        FINAL SCORE
      </Text>
      <Text
        style={{
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 92,
          lineHeight: 96,
          color: win ? T.win : T.gold,
        }}
      >
        {result.score}
        <Text style={{ fontSize: 28, color: T.dim }}>/10</Text>
      </Text>
      <Text
        style={{
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 20,
          lineHeight: 26,
          color: win ? T.cyan : T.magenta,
          letterSpacing: 0.6,
        }}
      >
        {line}
      </Text>

      <View style={{ marginTop: 18, gap: 8 }}>
        {result.pack.questions.map((q, i) => {
          const ok = result.guesses[i] === result.answers[i];
          return (
            <View
              key={q.id}
              style={{
                borderRadius: 6,
                borderWidth: 1,
                borderColor: ok ? T.win : T.miss,
                backgroundColor: T.panel,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 13, lineHeight: 18, color: T.muted }}>
                {q.prompt}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 15,
                  color: ok ? T.win : T.miss,
                }}
              >
                {ok ? "Correct — " : "They said — "}
                {q.options[result.answers[i]]}
              </Text>
              {!ok ? (
                <Text style={{ marginTop: 2, fontSize: 13, color: T.dim }}>
                  You buzzed {q.options[result.guesses[i]]}
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
          height: 56,
          borderRadius: 6,
          backgroundColor: T.gold,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#14080C",
            fontFamily: KNOW_ME_DISPLAY,
            fontSize: 18,
            letterSpacing: 1.2,
            fontWeight: "900",
          }}
        >
          PLAY ANOTHER PACK
        </Text>
      </Pressable>
      <Pressable
        onPress={onHub}
        style={{ marginTop: 12, alignItems: "center", padding: 10 }}
      >
        <Text
          style={{
            color: T.cyan,
            fontFamily: "SpaceMono",
            fontSize: 12,
            letterSpacing: 1.4,
          }}
        >
          BACK TO THE STUDIO
        </Text>
      </Pressable>
    </View>
  );
}
