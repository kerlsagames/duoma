import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { PokeThem } from "@/components/ui/PokeThem";
import { KNOW_ME_DISPLAY, KNOW_ME_TONE, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
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
  packFaceOff,
  packLane,
  scoreKnowMe,
  scoreLine,
  sheetFor,
  tallyKnowMeGuesses,
  type KnowMeLane,
  type KnowMePack,
  type PackFaceOff,
} from "@/lib/know-me";
import { themLabel, youLabel } from "@/lib/names";
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
  const { user, partner, refreshPair } = useApp();
  const { data, patch } = useMiniApps();
  const scrollRef = useRef<ScrollView>(null);
  const you = youLabel(user);
  const them = themLabel(partner);

  const [view, setView] = useState<ViewMode>("shop");
  const look = useAppLook("trivia", KNOW_ME_TONE.foil, {
    hideScores: false,
    compactPacks: false,
  });
  const [playKind, setPlayKind] = useState<PlayKind>("fill");
  const [packId, setPackId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [result, setResult] = useState<{
    pack: KnowMePack;
    guesses: number[];
    answers: number[];
    score: number;
    theirScore: number | null;
    theirCards: number;
    myAnswers: number[];
    theirGuesses: number[] | null;
  } | null>(null);

  const sheets = data.knowMeSheets;
  const guesses = data.knowMeGuesses;
  const pack = packId ? knowMePackById(packId) : null;
  const waitingOnThem = useMemo(() => {
    if (!user?.id || !partner?.id) return false;
    return KNOW_ME_PACKS.some((row) => {
      const lane = packLane({
        pack: row,
        sheets,
        guesses,
        userId: user.id,
        partnerId: partner.id,
      });
      return lane === "wait" || lane === "waitGuess";
    });
  }, [guesses, partner?.id, sheets, user?.id]);

  useEffect(() => {
    if (!waitingOnThem) return;
    void refreshPair();
    const tick = setInterval(() => void refreshPair(), 4000);
    return () => clearInterval(tick);
  }, [refreshPair, waitingOnThem]);

  const waitingRef = useRef<Set<string>>(new Set());

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
  const theirStats = useMemo(
    () => tallyKnowMeGuesses(guesses, partner?.id),
    [guesses, partner?.id]
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
    const mineSheet = sheetFor(sheets, user?.id, id);
    const mine = user ? latestGuess(guesses, id, partner?.id, user.id) : null;
    const themGuess = latestGuess(guesses, id, user?.id, partner?.id);
    if (!row || !theirs || !mine) return;
    setPackId(id);
    setResult({
      pack: row,
      guesses: [...mine.guesses],
      answers: [...theirs.answers],
      score: scoreKnowMe(theirs.answers, mine.guesses),
      theirScore:
        themGuess && mineSheet
          ? scoreKnowMe(mineSheet.answers, themGuess.guesses)
          : themGuess
            ? themGuess.score
            : null,
      theirCards: themGuess?.guesses.length || row.questions.length,
      myAnswers: mineSheet ? [...mineSheet.answers] : [],
      theirGuesses: themGuess ? [...themGuess.guesses] : null,
    });
    go("result");
  };

  useEffect(() => {
    if (!user?.id || !partner?.id) return;
    let reveal: string | null = null;
    const nextWaiting = new Set<string>();
    for (const row of KNOW_ME_PACKS) {
      const lane = packLane({
        pack: row,
        sheets,
        guesses,
        userId: user.id,
        partnerId: partner.id,
      });
      if (lane === "wait" || lane === "waitGuess") nextWaiting.add(row.id);
      if (lane === "done" && waitingRef.current.has(row.id)) reveal = row.id;
    }
    waitingRef.current = nextWaiting;
    if (!reveal && view === "result" && packId && result && !result.theirGuesses) {
      const arrived = latestGuess(guesses, packId, user.id, partner.id);
      if (arrived) reveal = packId;
    }
    if (!reveal) return;
    if (view === "shop" || view === "result") openResult(reveal);
  }, [guesses, packId, partner?.id, result, sheets, user?.id, view]);

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
    const alreadyGuessed = user
      ? latestGuess(guesses, pack.id, partner?.id, user.id)
      : null;
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
      knowMeGuesses: state.knowMeGuesses.map((row) =>
        row.packId === pack.id && row.ownerId === user.id
          ? { ...row, score: scoreKnowMe(picks, row.guesses) }
          : row
      ),
    }));
    if (alreadyGuessed) {
      setPackId(null);
      go("shop");
      return;
    }
    setPlayKind("guess");
    setCursor(0);
    setPicks([]);
    go("play");
  };

  const saveGuess = async () => {
    if (!user || !partner || !pack) return;
    if (picks.length < pack.questions.length || picks.some((n) => n == null)) return;
    const sheet = sheetFor(sheets, partner.id, pack.id);
    const score = sheet ? scoreKnowMe(sheet.answers, picks) : 0;
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
    if (!sheet) {
      setPackId(null);
      go("shop");
      return;
    }
    setResult({
      pack,
      guesses: [...picks],
      answers: [...sheet.answers],
      score,
      theirScore: demoGuess[0]?.score ?? latestGuess(guesses, pack.id, user.id, partner.id)?.score ?? null,
      theirCards: pack.questions.length,
      myAnswers: theirSheet ? [...theirSheet.answers] : [],
      theirGuesses: demoGuess[0] ? [...demoGuess[0].guesses] : null,
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
    <Screen scroll background={T.background} scrollRef={scrollRef} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <Stage
        background={T.background}
        fallback={"/hub/play" as Href}
        accent={look.accent}
        settingsLabel="How well do you know me"
        settings={
          <LookPanel
            look={look}
            ink={T.ink}
            muted={T.muted}
            pageColor={T.background}
            toggles={[
              {
                key: "hideScores",
                label: "Hide the scoreboard",
                hint: "Play the packs without a running tally.",
              },
              {
                key: "compactPacks",
                label: "Compact packs",
                hint: "Tighter shop cards.",
              },
            ]}
          />
        }
      >
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
            myStats={myStats}
            theirStats={theirStats}
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
  myStats,
  theirStats,
  gate,
  onOpen,
  onResult,
}: {
  you: string;
  them: string;
  myStats: ReturnType<typeof tallyKnowMeGuesses>;
  theirStats: ReturnType<typeof tallyKnowMeGuesses>;
  gate: {
    sheets: { packId: string; userId: string; answers: number[] }[];
    guesses: {
      packId: string;
      ownerId: string;
      guesserId: string;
      createdAt: string;
      score: number;
      guesses: number[];
    }[];
    userId: string | undefined;
    partnerId: string | undefined;
  };
  onOpen: (id: string, kind: PlayKind) => void;
  onResult: (id: string) => void;
}) {
  const finished = KNOW_ME_PACKS.filter((row) => packLane({ ...gate, pack: row }) === "done").length;
  const youAhead = myStats.correct !== theirStats.correct;
  const leader = myStats.correct >= theirStats.correct ? you : them;
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

      <View
        style={{
          marginTop: 16,
          backgroundColor: T.felt,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: T.border,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: T.foil,
            }}
          >
            Leaderboard
          </Text>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 10,
              color: T.dim,
            }}
          >
            Binder {finished}/{KNOW_ME_PACK_COUNT}
          </Text>
        </View>
        <BoardRow
          rank={myStats.correct >= theirStats.correct ? 1 : 2}
          name={you}
          hits={myStats.correct}
          asked={myStats.asked || 0}
          caption={`you guessing ${them}`}
          lead={myStats.correct >= theirStats.correct && myStats.asked > 0}
        />
        <View style={{ height: 1, backgroundColor: "rgba(246,238,216,0.08)", marginHorizontal: 14 }} />
        <BoardRow
          rank={theirStats.correct > myStats.correct ? 1 : 2}
          name={them}
          hits={theirStats.correct}
          asked={theirStats.asked || 0}
          caption={`${them} guessing you`}
          lead={theirStats.correct > myStats.correct && theirStats.asked > 0}
        />
        <Text
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontFamily: SERIF,
            fontSize: 13,
            color: T.muted,
          }}
        >
          {!myStats.asked && !theirStats.asked
            ? "Scores land here as soon as a pack is guessed."
            : youAhead
              ? `${leader} is ahead.`
              : `Tied. ${finished ? "Keep ripping." : "Rip pack 1."}`}
        </Text>
      </View>

      <View style={{ marginTop: 18, gap: 14 }}>
        {KNOW_ME_PACKS.map((item) => {
          const lane = packLane({ ...gate, pack: item });
          const face = packFaceOff(
            gate.guesses,
            item.id,
            gate.userId,
            gate.partnerId,
            gate.sheets
          );
          return (
            <View key={item.id}>
            <PackSleeve
              pack={item}
              lane={lane}
              them={them}
              you={you}
              face={face}
              onPress={() => {
                if (lane === "locked" || lane === "wait") return;
                if (lane === "done" || lane === "waitGuess") {
                  if (face.myScore != null) onResult(item.id);
                  return;
                }
                onOpen(item.id, lane === "guess" ? "guess" : "fill");
              }}
            />
            {lane === "wait" || lane === "waitGuess" ? (
              <PokeThem appId="trivia" targetId={item.id} color={T.foil} />
            ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function BoardRow({
  rank,
  name,
  hits,
  asked,
  caption,
  lead,
}: {
  rank: number;
  name: string;
  hits: number;
  asked: number;
  caption: string;
  lead: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Text
        style={{
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 18,
          width: 22,
          color: lead ? T.foil : T.dim,
        }}
      >
        {rank}
      </Text>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: KNOW_ME_DISPLAY,
            fontSize: 20,
            color: T.cream,
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            marginTop: 2,
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: T.dim,
          }}
        >
          {caption}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 28,
          lineHeight: 32,
          color: lead ? T.foil : T.cream,
        }}
      >
        {asked ? `${hits}` : "—"}
        <Text style={{ fontSize: 16, color: T.dim }}>/{asked || KNOW_ME_CARDS}</Text>
      </Text>
    </View>
  );
}

function PackSleeve({
  pack,
  lane,
  them,
  you,
  face,
  onPress,
}: {
  pack: KnowMePack;
  lane: KnowMeLane;
  them: string;
  you: string;
  face: PackFaceOff;
  onPress: () => void;
}) {
  const locked = lane === "locked";
  const waiting = lane === "wait";
  const live = lane === "fill" || lane === "guess";
  const scored = face.myScore != null || face.theirScore != null;
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
            <View style={{ flex: 1, paddingRight: 8 }}>
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
              ) : scored ? (
                <Text
                  style={{
                    fontFamily: KNOW_ME_DISPLAY,
                    fontSize: 16,
                    color: pack.foil,
                    fontWeight: "800",
                  }}
                >
                  {scoreLine(face.myScore, face.myCards).split("/")[0]}
                </Text>
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
          {scored ? (
            <View
              style={{
                marginTop: 14,
                flexDirection: "row",
                gap: 8,
              }}
            >
              <ScorePill
                label={you}
                detail="guessed them"
                value={scoreLine(face.myScore, face.myCards)}
                foil={pack.foil}
                ahead={
                  face.myScore != null &&
                  (face.theirScore == null || face.myScore >= face.theirScore)
                }
              />
              <ScorePill
                label={them}
                detail="guessed you"
                value={scoreLine(face.theirScore, face.theirCards)}
                foil={pack.foil}
                ahead={
                  face.theirScore != null &&
                  (face.myScore == null || face.theirScore > face.myScore)
                }
              />
            </View>
          ) : (
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
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function ScorePill({
  label,
  detail,
  value,
  foil,
  ahead,
}: {
  label: string;
  detail: string;
  value: string;
  foil: string;
  ahead: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: ahead ? "rgba(12,8,6,0.45)" : "rgba(12,8,6,0.28)",
        borderWidth: 1,
        borderColor: ahead ? foil : "rgba(255,248,236,0.12)",
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "SpaceMono",
          fontSize: 9,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "rgba(255,248,236,0.7)",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontFamily: KNOW_ME_DISPLAY,
          fontSize: 22,
          lineHeight: 26,
          color: "#FFF8EC",
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 9,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: foil,
        }}
      >
        {detail}
      </Text>
    </View>
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
        {kind === "fill" ? "Ripping your pack" : `Guessing ${them}`}
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
        {kind === "fill" ? "Your card" : `What would ${them} pick?`} · pack{" "}
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
            {kind === "guess" ? `Pick the answer you think ${them} would choose.\n` : ""}
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
  return kind === "fill" ? "Seal your pack" : "Lock in guesses";
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
    theirScore: number | null;
    theirCards: number;
    myAnswers: number[];
    theirGuesses: number[] | null;
  };
  onShop: () => void;
}) {
  const [review, setReview] = useState<"you" | "them">("you");
  const cards = result.pack.questions.length;
  const myLine = scoreLine(result.score, cards);
  const theirLine = scoreLine(result.theirScore, result.theirCards);
  const youLead =
    result.theirScore == null || result.score >= result.theirScore;
  const viewingThem = review === "them";
  const partnerReady = Boolean(result.theirGuesses && result.myAnswers.length);
  const line =
    result.theirScore == null
      ? `You guessed ${them} ${myLine}. Waiting on their pull of yours.`
      : result.score === result.theirScore
        ? `Tied ${myLine}. Same read on each other.`
        : result.score > result.theirScore
          ? `You know ${them} better this pack.`
          : `${them} knew you better this pack.`;
  const next = KNOW_ME_PACKS.find((row) => row.number === result.pack.number + 1);
  const rows = result.pack.questions.map((q, i) => {
    if (!viewingThem) {
      const ok = result.guesses[i] === result.answers[i];
      return {
        id: q.id,
        prompt: q.prompt,
        ok,
        truth: q.options[result.answers[i]],
        guess: q.options[result.guesses[i]],
      };
    }
    const theirPick = result.theirGuesses?.[i];
    const mine = result.myAnswers[i];
    const ok = typeof theirPick === "number" && theirPick === mine;
    return {
      id: q.id,
      prompt: q.prompt,
      ok,
      truth: typeof mine === "number" ? q.options[mine] : "—",
      guess:
        typeof theirPick === "number" ? q.options[theirPick] : "Not guessed yet",
    };
  });
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
        Pack {String(result.pack.number).padStart(2, "0")} · leaderboard
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

      <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={() => setReview("you")}
          accessibilityLabel={`You guessed ${them}`}
          style={{
            flex: 1,
            backgroundColor: T.felt,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: review === "you" ? T.foil : youLead ? T.foil : T.border,
            padding: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 9,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: T.dim,
            }}
          >
            {you} guessed {them}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: KNOW_ME_DISPLAY,
              fontSize: 40,
              lineHeight: 44,
              color: youLead ? T.foil : T.cream,
            }}
          >
            {myLine}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: "SpaceMono",
              fontSize: 9,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: review === "you" ? T.foil : T.dim,
            }}
          >
            {review === "you" ? "Showing this" : "Tap to review"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setReview("them")}
          accessibilityLabel={`${them} guessed you`}
          style={{
            flex: 1,
            backgroundColor: T.felt,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: review === "them" ? T.foil : !youLead ? T.foil : T.border,
            padding: 12,
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 9,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: T.dim,
            }}
          >
            {them} guessed {you}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: KNOW_ME_DISPLAY,
              fontSize: 40,
              lineHeight: 44,
              color: !youLead ? T.foil : T.cream,
            }}
          >
            {theirLine}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: "SpaceMono",
              fontSize: 9,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: review === "them" ? T.foil : T.dim,
            }}
          >
            {review === "them" ? "Showing this" : "Tap to review"}
          </Text>
        </Pressable>
      </View>

      <Text
        style={{
          marginTop: 12,
          fontFamily: SERIF,
          fontSize: 18,
          lineHeight: 26,
          color: T.muted,
        }}
      >
        {line}
      </Text>
      {viewingThem && !partnerReady ? (
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 15,
            color: T.foil,
          }}
        >
          {them} hasn’t guessed you on this pack yet.
        </Text>
      ) : null}
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
        {rows.map((row) => (
          <View
            key={row.id}
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: viewingThem && !partnerReady ? T.border : row.ok ? T.win : T.miss,
              backgroundColor: T.felt,
              padding: 12,
            }}
          >
            <Text style={{ fontSize: 13, lineHeight: 18, color: T.muted }}>{row.prompt}</Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontSize: 15,
                color:
                  viewingThem && !partnerReady ? T.cream : row.ok ? T.win : T.miss,
              }}
            >
              {viewingThem
                ? partnerReady
                  ? row.ok
                    ? "They hit — "
                    : "You said — "
                  : "You said — "
                : row.ok
                  ? "Hit — "
                  : `${them} said — `}
              {row.truth}
            </Text>
            {viewingThem && partnerReady && !row.ok ? (
              <Text style={{ marginTop: 2, fontSize: 13, color: T.dim }}>
                They pulled {row.guess}
              </Text>
            ) : null}
            {!viewingThem && !row.ok ? (
              <Text style={{ marginTop: 2, fontSize: 13, color: T.dim }}>
                You pulled {row.guess}
              </Text>
            ) : null}
          </View>
        ))}
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
