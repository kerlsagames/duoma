import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { KNOW_ME_DISPLAY, KNOW_ME_TONE, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import {
  KNOW_ME_CARDS,
  KNOW_ME_PACKS,
  KNOW_ME_PACK_COUNT,
  KNOW_ME_WIN,
  demoAnswersForPack,
  knowMePackById,
  laneLabel,
  latestGuess,
  packLane,
  scoreKnowMe,
  sheetFor,
  tallyKnowMeGuesses,
  type KnowMeLane,
  type KnowMePack,
} from "@/lib/know-me";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";

const T = KNOW_ME_TONE;

type ViewMode = "shop" | "rip" | "play" | "result";
type PlayKind = "fill" | "guess";

export default function TriviaScreen() {
  const { user, partner } = useApp();
  const { data, patch } = useMiniApps();
  const scrollRef = useRef<ScrollView>(null);
  const you = user?.displayName || "You";
  const them = partner?.displayName || "them";

  const [view, setView] = useState<ViewMode>("shop");
  const [playKind, setPlayKind] = useState<PlayKind>("fill");
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
  const pack = packId ? knowMePackById(packId) : null;

  const gate = useMemo(
    () => ({
      sheets,
      guesses,
      userId: user?.id,
      partnerId: partner?.id,
    }),
    [guesses, partner?.id, sheets, user?.id]
  );

  const myStats = useMemo(
    () => tallyKnowMeGuesses(guesses, user?.id),
    [guesses, user?.id]
  );

  const go = useCallback((next: ViewMode) => {
    setView(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const openRip = (id: string, kind: PlayKind) => {
    const existing = kind === "fill" ? sheetFor(sheets, user?.id, id) : null;
    setPackId(id);
    setPlayKind(kind);
    setCursor(0);
    setPicks(existing ? [...existing.answers] : []);
    setResult(null);
    go("rip");
  };

  const openResult = (id: string) => {
    const row = knowMePackById(id);
    const theirs = sheetFor(sheets, partner?.id, id);
    const mine = user ? latestGuess(guesses, id, partner?.id, user.id) : null;
    if (!row || !theirs || !mine) return;
    setPackId(id);
    setResult({
      pack: row,
      guesses: [...mine.guesses],
      answers: [...theirs.answers],
      score: mine.score,
    });
    go("result");
  };

  const pickOption = (index: number) => {
    const next = [...picks];
    next[cursor] = index;
    setPicks(next);
  };

  const saveAnswers = async () => {
    if (!user || !pack) return;
    if (picks.length < pack.questions.length || picks.some((n) => n == null)) return;
    const existing = sheetFor(sheets, user.id, pack.id);
    const now = nowIso();
    const mine = {
      id: existing?.id ?? createId(),
      packId: pack.id,
      userId: user.id,
      answers: [...picks],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const extras =
      partner?.isDemo && !sheetFor(sheets, partner.id, pack.id)
        ? [
            {
              id: createId(),
              packId: pack.id,
              userId: partner.id,
              answers: demoAnswersForPack(pack.id),
              createdAt: now,
              updatedAt: now,
            },
          ]
        : [];
    await patch((state) => ({
      ...state,
      knowMeSheets: [
        ...state.knowMeSheets.filter((row) => row.id !== mine.id),
        mine,
        ...extras.filter(
          (row) =>
            !state.knowMeSheets.some(
              (have) => have.userId === row.userId && have.packId === row.packId
            )
        ),
      ],
    }));
    const theirsReady = Boolean(sheetFor(sheets, partner?.id, pack.id)) || extras.length > 0;
    if (theirsReady) {
      setPlayKind("guess");
      setCursor(0);
      setPicks([]);
      go("play");
      return;
    }
    setPackId(null);
    go("shop");
  };

  const saveGuess = async () => {
    if (!user || !partner || !pack) return;
    const sheet = sheetFor(sheets, partner.id, pack.id);
    if (!sheet) return;
    if (picks.length < pack.questions.length || picks.some((n) => n == null)) return;
    const score = scoreKnowMe(sheet.answers, picks);
    const now = nowIso();
    const myGuess = {
      id: createId(),
      packId: pack.id,
      ownerId: partner.id,
      guesserId: user.id,
      guesses: [...picks],
      score,
      createdAt: now,
    };
    const theirSheet = sheetFor(sheets, user.id, pack.id);
    const demoPicks = theirSheet
      ? theirSheet.answers.map((n, i) => (n + 1 + i) % 4)
      : [];
    const demoGuess =
      partner.isDemo && theirSheet && !latestGuess(guesses, pack.id, user.id, partner.id)
        ? [
            {
              id: createId(),
              packId: pack.id,
              ownerId: user.id,
              guesserId: partner.id,
              guesses: demoPicks,
              score: scoreKnowMe(theirSheet.answers, demoPicks),
              createdAt: now,
            },
          ]
        : [];
    await patch((state) => ({
      ...state,
      knowMeGuesses: [myGuess, ...demoGuess, ...state.knowMeGuesses],
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
  const lastQuestion = pack ? cursor >= pack.questions.length - 1 : false;
  const canAdvance = typeof selected === "number";

  const advance = () => {
    if (!pack || !canAdvance) return;
    if (!lastQuestion) {
      setCursor(cursor + 1);
      return;
    }
    if (playKind === "fill") void saveAnswers();
    else void saveGuess();
  };

  const onBack = () => {
    if (view === "play" || view === "rip") {
      setPackId(null);
      go("shop");
      return;
    }
    if (view === "result") {
      setPackId(null);
      setResult(null);
      go("shop");
    }
  };

  return (
    <Screen scroll background={T.background} scrollRef={scrollRef}>
      <Stage background={T.background} fallback={"/hub/play" as Href} accent={T.foil}>
        {view !== "shop" ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Back to the shop"
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
          >
            <Ionicons name="chevron-back" size={18} color={T.foil} />
            <Text
              style={{
                marginLeft: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: T.foil,
              }}
            >
              The shop
            </Text>
          </Pressable>
        ) : null}

        {view === "shop" ? (
          <Shop
            you={you}
            them={them}
            stats={myStats}
            gate={gate}
            onOpen={openRip}
            onResult={openResult}
          />
        ) : null}

        {view === "rip" && pack ? (
          <RipPack
            pack={pack}
            kind={playKind}
            them={them}
            onDone={() => go("play")}
          />
        ) : null}

        {view === "play" && pack && current ? (
          <PlayCard
            pack={pack}
            kind={playKind}
            them={them}
            cursor={cursor}
            current={current}
            selected={selected}
            canAdvance={canAdvance}
            lastQuestion={lastQuestion}
            onPick={pickOption}
            onBackCard={() => setCursor(Math.max(0, cursor - 1))}
            onAdvance={advance}
          />
        ) : null}

        {view === "result" && result ? (
          <ResultBinder
            them={them}
            you={you}
            result={result}
            onShop={() => {
              setPackId(null);
              setResult(null);
              go("shop");
            }}
          />
        ) : null}
      </Stage>
    </Screen>
  );
}

function Shop({
  you,
  them,
  stats,
  gate,
  onOpen,
  onResult,
}: {
  you: string;
  them: string;
  stats: ReturnType<typeof tallyKnowMeGuesses>;
  gate: {
    sheets: { packId: string; userId: string }[];
    guesses: { packId: string; ownerId: string; guesserId: string; createdAt: string }[];
    userId: string | undefined;
    partnerId: string | undefined;
  };
  onOpen: (id: string, kind: PlayKind) => void;
  onResult: (id: string) => void;
}) {
  const finished = KNOW_ME_PACKS.filter((row) => packLane({ ...gate, pack: row }) === "done").length;
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2.4,
          textTransform: "uppercase",
          color: T.foil,
        }}
      >
        Fun · Hobby shop
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 32,
          lineHeight: 36,
          color: T.cream,
        }}
      >
        How well do you know me
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
        Twenty sealed packs. Rip yours, then guess {them}’s. Pack 2 stays
        wrapped until you both finish pack 1.
      </Text>

      <View
        style={{
          marginTop: 16,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <StatChip label="You" value={you} />
        <StatChip
          label="Hits"
          value={stats.asked ? `${stats.correct}/${stats.asked}` : "—"}
        />
        <StatChip label="Binder" value={`${finished}/${KNOW_ME_PACK_COUNT}`} />
      </View>

      <View style={{ marginTop: 18, gap: 14 }}>
        {KNOW_ME_PACKS.map((item) => {
          const lane = packLane({ ...gate, pack: item });
          return (
            <PackSleeve
              key={item.id}
              pack={item}
              lane={lane}
              them={them}
              onPress={() => {
                if (lane === "locked" || lane === "wait" || lane === "waitGuess") return;
                if (lane === "done") {
                  onResult(item.id);
                  return;
                }
                onOpen(item.id, lane === "guess" ? "guess" : "fill");
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: T.felt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: T.border,
        paddingVertical: 10,
        paddingHorizontal: 10,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 9,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: T.dim,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 4,
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 16,
          color: T.cream,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function PackSleeve({
  pack,
  lane,
  them,
  onPress,
}: {
  pack: KnowMePack;
  lane: KnowMeLane;
  them: string;
  onPress: () => void;
}) {
  const locked = lane === "locked";
  const waiting = lane === "wait" || lane === "waitGuess";
  const live = lane === "fill" || lane === "guess";
  return (
    <Pressable
      onPress={onPress}
      disabled={locked || waiting}
      accessibilityLabel={`Pack ${pack.number} ${pack.title}. ${laneLabel(lane, them)}`}
      style={{ opacity: locked ? 0.55 : 1 }}
    >
      <LinearGradient
        colors={[pack.accent, "#1A120C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: live ? pack.foil : lane === "done" ? T.foil : "rgba(246,238,216,0.12)",
          minHeight: 148,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: pack.foil,
            opacity: 0.92,
          }}
        />
        <View
          style={{
            position: "absolute",
            right: -24,
            top: 28,
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 14,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View style={{ padding: 16, paddingTop: 22 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text
                style={{
                  fontFamily: KNOW_ME_DISPLAY,
                  fontSize: 13,
                  letterSpacing: 2,
                  color: pack.foil,
                }}
              >
                PACK {String(pack.number).padStart(2, "0")} · DUOMA SERIES
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: KNOW_ME_DISPLAY,
                  fontSize: 28,
                  lineHeight: 32,
                  color: "#FFF8EC",
                }}
              >
                {pack.title}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 14,
                  lineHeight: 20,
                  color: "rgba(255,248,236,0.78)",
                  maxWidth: 220,
                }}
              >
                {locked
                  ? `Finish pack ${pack.number - 1} together first.`
                  : pack.blurb}
              </Text>
            </View>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(12,8,6,0.35)",
                borderWidth: 2,
                borderColor: pack.foil,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {locked ? (
                <Ionicons name="lock-closed" size={20} color={pack.foil} />
              ) : (
                <Text
                  style={{
                    fontFamily: KNOW_ME_DISPLAY,
                    fontSize: 18,
                    color: pack.foil,
                    fontWeight: "800",
                  }}
                >
                  {KNOW_ME_CARDS}
                </Text>
              )}
            </View>
          </View>
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.1,
                textTransform: "uppercase",
                color: pack.foil,
              }}
            >
              {laneLabel(lane, them)}
            </Text>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 10,
                color: "rgba(255,248,236,0.7)",
              }}
            >
              {KNOW_ME_CARDS} CARDS
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function RipPack({
  pack,
  kind,
  them,
  onDone,
}: {
  pack: KnowMePack;
  kind: PlayKind;
  them: string;
  onDone: () => void;
}) {
  const tear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.timing(tear, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    loop.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => loop.stop();
    // Open once when this sleeve mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const lift = tear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });
  const fade = tear.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });
  return (
    <View style={{ alignItems: "center", paddingTop: 12 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: T.foil,
        }}
      >
        {kind === "fill" ? "Ripping your pack" : `Opening ${them}’s pack`}
      </Text>
      <Text
        style={{
          marginTop: 8,
          marginBottom: 24,
          fontFamily: SERIF,
          fontSize: 22,
          color: T.cream,
        }}
      >
        {pack.title}
      </Text>
      <Animated.View
        style={{
          width: "100%",
          maxWidth: 320,
          transform: [{ translateY: lift }, { rotate: "-4deg" }],
          opacity: fade,
        }}
      >
        <LinearGradient
          colors={[pack.accent, "#120C08"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 280,
            borderRadius: 18,
            borderWidth: 3,
            borderColor: pack.foil,
            padding: 18,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              height: 12,
              backgroundColor: pack.foil,
              borderRadius: 2,
              opacity: 0.9,
            }}
          />
          <View>
            <Text
              style={{
                fontFamily: KNOW_ME_DISPLAY,
                fontSize: 14,
                letterSpacing: 2,
                color: pack.foil,
              }}
            >
              PACK {String(pack.number).padStart(2, "0")}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: KNOW_ME_DISPLAY,
                fontSize: 36,
                color: "#FFF8EC",
              }}
            >
              {pack.title}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              color: pack.foil,
            }}
          >
            {KNOW_ME_CARDS} TRADING CARDS
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function PlayCard({
  pack,
  kind,
  them,
  cursor,
  current,
  selected,
  canAdvance,
  lastQuestion,
  onPick,
  onBackCard,
  onAdvance,
}: {
  pack: KnowMePack;
  kind: PlayKind;
  them: string;
  cursor: number;
  current: KnowMePack["questions"][number];
  selected: number | undefined;
  canAdvance: boolean;
  lastQuestion: boolean;
  onPick: (index: number) => void;
  onBackCard: () => void;
  onAdvance: () => void;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.8,
          textTransform: "uppercase",
          color: pack.foil,
        }}
      >
        {kind === "fill" ? "Your card" : `${them}’s card`} · pack{" "}
        {String(pack.number).padStart(2, "0")}
      </Text>
      <View
        style={{
          marginTop: 12,
          backgroundColor: T.cream,
          borderRadius: 18,
          borderWidth: 3,
          borderColor: pack.foil,
          overflow: "hidden",
          shadowColor: pack.accent,
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        <View style={{ height: 8, backgroundColor: pack.accent }} />
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text
              style={{
                fontFamily: KNOW_ME_DISPLAY,
                fontSize: 13,
                letterSpacing: 1.6,
                color: pack.accent,
              }}
            >
              {pack.title.toUpperCase()}
            </Text>
            <Text
              style={{
                fontFamily: KNOW_ME_DISPLAY,
                fontSize: 13,
                color: T.packInk,
              }}
            >
              {cursor + 1} / {pack.questions.length}
            </Text>
          </View>
          <Text
            style={{
              marginTop: 14,
              fontFamily: SERIF,
              fontSize: 24,
              lineHeight: 30,
              color: T.packInk,
            }}
          >
            {kind === "guess" ? `What would ${them} pick?\n` : ""}
            {current.prompt}
          </Text>
        </View>
        <View style={{ padding: 12, paddingTop: 0, gap: 8 }}>
          {current.options.map((opt, i) => {
            const on = selected === i;
            return (
              <Pressable
                key={`${current.id}-${opt}`}
                onPress={() => onPick(i)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: on ? pack.accent : "rgba(28,20,12,0.05)",
                  borderWidth: 1.5,
                  borderColor: on ? pack.foil : "rgba(28,20,12,0.1)",
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: on ? "rgba(0,0,0,0.2)" : T.cream,
                    marginRight: 10,
                    borderWidth: 1,
                    borderColor: on ? pack.foil : "rgba(28,20,12,0.14)",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: KNOW_ME_DISPLAY,
                      fontSize: 14,
                      color: on ? "#FFF8EC" : T.packInk,
                      fontWeight: "800",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: 16,
                    lineHeight: 22,
                    color: on ? "#FFF8EC" : T.packInk,
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
        {cursor > 0 ? (
          <Pressable
            onPress={onBackCard}
            style={{
              flex: 1,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: T.foil,
            }}
          >
            <Text style={{ color: T.foil, fontFamily: KNOW_ME_DISPLAY, fontSize: 16 }}>
              Back
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onAdvance}
          disabled={!canAdvance}
          style={{
            flex: 2,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor: canAdvance ? T.foil : T.felt,
            opacity: canAdvance ? 1 : 0.55,
          }}
        >
          <Text
            style={{
              color: "#1C140C",
              fontFamily: KNOW_ME_DISPLAY,
              fontSize: 17,
              fontWeight: "800",
              letterSpacing: 0.6,
            }}
          >
            {lastQuestion
              ? playKindLabel(kind)
              : "Next card"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function playKindLabel(kind: PlayKind): string {
  return kind === "fill" ? "Seal your pack" : "Score the pack";
}

function ResultBinder({
  them,
  you,
  result,
  onShop,
}: {
  them: string;
  you: string;
  result: {
    pack: KnowMePack;
    guesses: number[];
    answers: number[];
    score: number;
  };
  onShop: () => void;
}) {
  const win = result.score >= KNOW_ME_WIN;
  const line =
    result.score === result.pack.questions.length
      ? "Foil hit. You live here."
      : win
        ? "That’s a binder-worthy pack."
        : result.score >= 3
          ? "Close. Next pack will tell."
          : "Tough pull. You still learned something.";
  const next = KNOW_ME_PACKS.find((row) => row.number === result.pack.number + 1);
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.8,
          textTransform: "uppercase",
          color: T.foil,
        }}
      >
        Pack {String(result.pack.number).padStart(2, "0")} · {you} vs {them}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 28,
          color: T.cream,
        }}
      >
        {result.pack.title}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 72,
          lineHeight: 76,
          color: win ? T.win : T.foil,
        }}
      >
        {result.score}
        <Text style={{ fontSize: 24, color: T.dim }}>/{result.pack.questions.length}</Text>
      </Text>
      <Text style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 26, color: T.muted }}>
        {line}
      </Text>
      {next ? (
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 15,
            color: T.foil,
          }}
        >
          Pack {String(next.number).padStart(2, "0")} · {next.title} unwraps after
          you both answer this pack and both guess.
        </Text>
      ) : (
        <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 15, color: T.foil }}>
          That’s the set. Twenty packs, all pulled.
        </Text>
      )}

      <View style={{ marginTop: 18, gap: 8 }}>
        {result.pack.questions.map((q, i) => {
          const ok = result.guesses[i] === result.answers[i];
          return (
            <View
              key={q.id}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: ok ? T.win : T.miss,
                backgroundColor: T.felt,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 13, lineHeight: 18, color: T.muted }}>{q.prompt}</Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 15,
                  color: ok ? T.win : T.miss,
                }}
              >
                {ok ? "Hit — " : `${them} said — `}
                {q.options[result.answers[i]]}
              </Text>
              {!ok ? (
                <Text style={{ marginTop: 2, fontSize: 13, color: T.dim }}>
                  You pulled {q.options[result.guesses[i]]}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={onShop}
        style={{
          marginTop: 18,
          height: 54,
          borderRadius: 14,
          backgroundColor: T.foil,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#1C140C",
            fontFamily: KNOW_ME_DISPLAY,
            fontSize: 18,
            fontWeight: "800",
          }}
        >
          Back to the shop
        </Text>
      </Pressable>
    </View>
  );
}
