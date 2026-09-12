import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import {
  LOVEBETZ_DISPLAY as DISPLAY,
  LOVEBETZ_SANS as SANS,
  LOVEBETZ_SCRIPT as SCRIPT,
  LOVEBETZ_TONE as T,
} from "@/lib/app-themes";
import {
  BET_PROMPT_CATEGORIES,
  BET_PROMPTS,
  BET_STAKE_CATEGORIES,
  BET_STAKES,
  betPromptsIn,
  betStakesIn,
  pickRandomPrompt,
  pickRandomStake,
  type BetKind,
  type BetPrompt,
  type BetPromptCategory,
  type BetStakeCategory,
} from "@/lib/bets";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { Prediction } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

type ViewMode =
  | "home"
  | "prompts"
  | "prompt-list"
  | "stakes"
  | "stake-list"
  | "slip"
  | "custom";

export default function PredictionScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [view, setView] = useState<ViewMode>("home");
  const [promptCat, setPromptCat] = useState<BetPromptCategory | null>(null);
  const [stakeCat, setStakeCat] = useState<BetStakeCategory | null>(null);
  const [pickedPrompt, setPickedPrompt] = useState<BetPrompt | null>(null);
  const [title, setTitle] = useState("");
  const [stake, setStake] = useState("");
  const [kind, setKind] = useState<BetKind>("will");
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const me = user?.displayName || "You";
  const tape = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(tape, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [tape]);

  const incoming = data.predictions.filter(
    (row) => row.status === "offered" && user && row.toUserId === user.id
  );
  const outgoing = data.predictions.filter(
    (row) => row.status === "offered" && user && row.fromUserId === user.id
  );
  const live = data.predictions.filter((row) => row.status === "accepted");
  const closed = data.predictions.filter(
    (row) => row.status === "settled" || row.status === "declined"
  );
  const ticker =
    [...incoming, ...outgoing, ...live, ...closed]
      .map((row) => `${row.title} — winner gets ${row.stake}`)
      .join("   ·   ") || "SEND A SLIP   ·   THEY TAKE THE OTHER SIDE   ·   WINNER GETS THE STAKE";

  const promptRows = useMemo(
    () => (promptCat ? betPromptsIn(promptCat) : []),
    [promptCat]
  );
  const stakeRows = useMemo(
    () => (stakeCat ? betStakesIn(stakeCat) : []),
    [stakeCat]
  );

  useEffect(() => {
    if (!ready || !user || !partner?.isDemo || !partner.id) return;
    const waiting = data.predictions.filter(
      (row) =>
        row.status === "offered" &&
        row.fromUserId === user.id &&
        row.toUserId === partner.id
    );
    if (waiting.length === 0) return;
    const timer = setTimeout(() => {
      const ids = new Set(waiting.map((row) => row.id));
      void patch((state) => ({
        ...state,
        predictions: state.predictions.map((row) =>
          ids.has(row.id) && row.status === "offered" ? acceptSlip(row) : row
        ),
      }));
      setFlash(`${them} took the other side.`);
    }, 1600);
    return () => clearTimeout(timer);
  }, [ready, user, partner, data.predictions, patch, them]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 3200);
    return () => clearTimeout(timer);
  }, [flash]);

  const goHome = () => {
    setView("home");
    setPromptCat(null);
    setStakeCat(null);
    setPickedPrompt(null);
    setError(null);
  };

  const startFromPrompt = (prompt: BetPrompt) => {
    setPickedPrompt(prompt);
    setTitle(prompt.text);
    setKind(prompt.kind);
    setStake("");
    setStakeCat(null);
    setSide("yes");
    setView("stakes");
    setError(null);
  };

  const openSlip = (nextTitle: string, nextStake: string, nextKind: BetKind) => {
    setTitle(nextTitle);
    setStake(nextStake);
    setKind(nextKind);
    setSide("yes");
    setView("slip");
    setError(null);
  };

  const sendSlip = async (
    nextTitle: string,
    nextStake: string,
    nextKind: BetKind,
    nextSide: "yes" | "no"
  ) => {
    if (!user) return;
    if (!partner?.id) {
      setError("Pair up first. LoveBetz needs someone on the other side.");
      return;
    }
    if (!nextTitle.trim()) {
      setError("Name the market first.");
      return;
    }
    if (!nextStake.trim()) {
      setError("Name what the winner collects.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      predictions: [
        {
          id: createId(),
          title: nextTitle.trim(),
          stake: nextStake.trim(),
          kind: nextKind,
          createdBy: user.id,
          fromUserId: user.id,
          toUserId: partner.id,
          side: nextSide,
          yesVoters: [],
          noVoters: [],
          status: "offered",
          resolved: null,
          createdAt: nowIso(),
          answeredAt: null,
        },
        ...state.predictions,
      ],
    }));
    setTitle("");
    setStake("");
    setPickedPrompt(null);
    setFlash(`Slip sent to ${them}. Waiting for them to take the other side.`);
    goHome();
  };

  const answerSlip = async (id: string, accept: boolean) => {
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) => {
        if (row.id !== id || row.status !== "offered") return row;
        if (!accept) {
          return { ...row, status: "declined" as const, answeredAt: nowIso() };
        }
        return acceptSlip(row);
      }),
    }));
    setFlash(accept ? "You're on. If you're right, you collect the stake." : "Passed. Slip is void.");
  };

  const voidSlip = async (id: string) => {
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) =>
        row.id === id && row.status === "offered"
          ? { ...row, status: "declined" as const, answeredAt: nowIso() }
          : row
      ),
    }));
    setFlash("Slip pulled. Void.");
  };

  const settle = async (id: string, result: "yes" | "no") => {
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) =>
        row.id === id && row.status === "accepted"
          ? { ...row, resolved: result, status: "settled" as const }
          : row
      ),
    }));
  };

  const goBack = () => {
    if (view === "prompt-list") setView("prompts");
    else if (view === "stake-list") setView("stakes");
    else if (view === "stakes") setView("prompts");
    else if (view === "slip") {
      if (pickedPrompt && stakeCat) setView("stake-list");
      else if (pickedPrompt) setView("stakes");
      else setView("custom");
    } else goHome();
  };

  return (
    <Screen scroll background={T.background}>
      <Stage background={T.background} fallback={"/hub/play" as Href} accent={T.pink}>
        <View
          style={{
            backgroundColor: T.pink,
            paddingVertical: 9,
            overflow: "hidden",
          }}
        >
          <Animated.Text
            style={{
              color: T.onPink,
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 0.4,
              width: 1400,
              transform: [
                {
                  translateX: tape.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -560],
                  }),
                },
              ],
            }}
          >
            {ticker}   ·   {ticker}
          </Animated.Text>
        </View>

        {view !== "home" ? (
          <Pressable
            onPress={goBack}
            style={{ marginTop: 14, flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="chevron-back" size={18} color={T.pink} />
            <Text
              style={{
                marginLeft: 4,
                fontFamily: DISPLAY,
                fontSize: 15,
                letterSpacing: 1.2,
                color: T.pink,
              }}
            >
              BACK
            </Text>
          </Pressable>
        ) : null}

        {view === "home" ? (
          <View>
            <View
              style={{
                marginTop: 12,
                backgroundColor: T.surface,
                borderWidth: 1,
                borderColor: T.border,
                overflow: "hidden",
              }}
            >
              <View style={{ height: 6, backgroundColor: T.gold }} />
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={kicker}>COUPLES BOOK</Text>
                  <Text style={[kicker, { color: T.gold }]}>WINNER TAKES THE STAKE</Text>
                </View>
                <View
                  style={{
                    marginTop: 4,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: SCRIPT,
                      fontSize: 52,
                      lineHeight: 60,
                      color: T.pink,
                    }}
                  >
                    Love
                  </Text>
                  <Text
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 36,
                      lineHeight: 44,
                      color: T.ink,
                      letterSpacing: 1,
                      paddingBottom: 6,
                    }}
                  >
                    BETZ
                  </Text>
                </View>
                <Text
                  style={{
                    marginTop: 2,
                    color: T.ink,
                    fontFamily: SANS,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  Send {them} a slip. They take the other side, or pass. Whoever is
                  right collects the stake.
                </Text>
                <View
                  style={{
                    marginTop: 14,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <Badge label={`${BET_PROMPTS.length} markets`} />
                  <Badge label={`${BET_STAKES.length} stakes`} tone="gold" />
                  <Badge
                    label={
                      incoming.length
                        ? `${incoming.length} to accept`
                        : live.length
                          ? `${live.length} live`
                          : "book open"
                    }
                  />
                </View>
              </View>
            </View>

            {flash ? (
              <View
                style={{
                  marginTop: 12,
                  borderWidth: 1,
                  borderColor: T.gold,
                  backgroundColor: T.goldSoft,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: T.ink, fontFamily: SANS, fontSize: 14 }}>
                  {flash}
                </Text>
              </View>
            ) : null}

            {incoming.length > 0 ? (
              <Section label={`${them} wants a piece`}>
                {incoming.map((row) => (
                  <IncomingSlip
                    key={row.id}
                    row={row}
                    them={them}
                    onAccept={() => void answerSlip(row.id, true)}
                    onDecline={() => void answerSlip(row.id, false)}
                  />
                ))}
              </Section>
            ) : null}

            <View style={{ marginTop: 16, gap: 10 }}>
              <Door
                kicker="PLACE A BET"
                title="Pick a market"
                detail="Everyday, AFL, TV, or a challenge"
                onPress={() => setView("prompts")}
              />
              <Door
                kicker="WRITE IN"
                title="Write your own"
                detail="Name the future. Name what the winner collects."
                onPress={() => {
                  setTitle("");
                  setStake("");
                  setKind("will");
                  setSide("yes");
                  setPickedPrompt(null);
                  setView("custom");
                }}
              />
              <Pressable
                onPress={() => {
                  const prompt = pickRandomPrompt();
                  const prize = pickRandomStake();
                  setPickedPrompt(prompt);
                  openSlip(prompt.text, prize.text, prompt.kind);
                }}
                style={tile}
              >
                <Text style={[kicker, { color: T.pink }]}>LUCKY DIP</Text>
                <Text style={titleMd}>Surprise slip</Text>
                <Text style={detail}>
                  Random market. Random stake. You still pick a side.
                </Text>
              </Pressable>
            </View>

            <Section label={`Waiting on ${them}`}>
              {!ready || outgoing.length === 0 ? (
                <Empty line={`No open slips. Send ${them} something petty.`} />
              ) : (
                outgoing.map((row) => (
                  <PendingCard
                    key={row.id}
                    row={row}
                    me={me}
                    them={them}
                    mine
                    onVoid={() => void voidSlip(row.id)}
                  />
                ))
              )}
            </Section>

            <Section label="Live">
              {live.length === 0 ? (
                <Empty line="Nothing live until they take the other side." />
              ) : (
                live.map((row) => (
                  <LiveCard
                    key={row.id}
                    row={row}
                    userId={user?.id}
                    me={me}
                    them={them}
                    onSettle={(result) => void settle(row.id, result)}
                  />
                ))
              )}
            </Section>

            {closed.length > 0 ? (
              <Section label="Results">
                {closed.slice(0, 8).map((row) => (
                  <ResultCard
                    key={row.id}
                    row={row}
                    userId={user?.id}
                    me={me}
                    them={them}
                  />
                ))}
              </Section>
            ) : null}
          </View>
        ) : null}

        {view === "prompts" ? (
          <Catalog
            heading="Markets"
            sub={`${BET_PROMPTS.length} lines. Then you pick the stake the winner collects.`}
            tiles={BET_PROMPT_CATEGORIES.map((cat) => ({
              id: cat.id,
              label: cat.label,
              detail: `${cat.detail} · ${betPromptsIn(cat.id).length}`,
              onPress: () => {
                setPromptCat(cat.id);
                setView("prompt-list");
              },
            }))}
          />
        ) : null}

        {view === "prompt-list" && promptCat ? (
          <ListPane
            heading={
              BET_PROMPT_CATEGORIES.find((row) => row.id === promptCat)?.label ??
              "Markets"
            }
            rows={promptRows.map((row) => ({
              id: row.id,
              label: row.text,
              onPress: () => startFromPrompt(row),
            }))}
          />
        ) : null}

        {view === "stakes" && pickedPrompt ? (
          <View>
            <Text style={{ marginTop: 12, ...kicker, color: T.pink }}>THE STAKE</Text>
            <Text style={{ marginTop: 6, ...titleLg }}>{pickedPrompt.text}</Text>
            <Text style={{ marginTop: 8, ...detail }}>
              Whoever is right collects this. The loser owes it.
            </Text>
            <View style={{ marginTop: 14, gap: 10 }}>
              {BET_STAKE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setStakeCat(cat.id);
                    setView("stake-list");
                  }}
                  style={tile}
                >
                  <Text style={titleMd}>{cat.label}</Text>
                  <Text style={detail}>
                    {cat.detail} · {betStakesIn(cat.id).length}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() =>
                  openSlip(pickedPrompt.text, pickRandomStake().text, pickedPrompt.kind)
                }
                style={tile}
              >
                <Text style={[titleMd, { color: T.pink }]}>Shuffle a stake</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {view === "stake-list" && pickedPrompt && stakeCat ? (
          <ListPane
            heading={
              BET_STAKE_CATEGORIES.find((row) => row.id === stakeCat)?.label ??
              "Stakes"
            }
            hint="Winner collects"
            rows={stakeRows.map((row) => ({
              id: row.id,
              label: row.text,
              onPress: () => openSlip(pickedPrompt.text, row.text, pickedPrompt.kind),
            }))}
          />
        ) : null}

        {view === "slip" ? (
          <SlipBuilder
            title={title}
            stake={stake}
            kind={kind}
            side={side}
            them={them}
            error={error}
            onSide={setSide}
            onSend={() => void sendSlip(title, stake, kind, side)}
          />
        ) : null}

        {view === "custom" ? (
          <View
            style={{
              marginTop: 16,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.surface,
              padding: 14,
            }}
          >
            <Text style={kicker}>WRITE-IN SLIP</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="We'll use the nice plates"
              placeholderTextColor={T.dim}
              style={term}
            />
            <TextInput
              value={stake}
              onChangeText={setStake}
              placeholder="What the winner collects"
              placeholderTextColor={T.dim}
              style={term}
            />
            <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
              <Chip label="WILL IT" active={kind === "will"} onPress={() => setKind("will")} />
              <Chip label="WHO WILL" active={kind === "who"} onPress={() => setKind("who")} />
            </View>
            <Text style={{ marginTop: 16, ...kicker, color: T.pink }}>YOUR SIDE</Text>
            <SidePicker
              kind={kind}
              side={side}
              them={them}
              stake={stake || "the stake"}
              onSide={setSide}
            />
            <Pressable
              onPress={() => void sendSlip(title, stake || "Bragging rights", kind, side)}
              style={pinkBtn}
            >
              <Text style={pinkBtnText}>SEND TO {them.toUpperCase()}</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: T.pink }}>{error}</Text> : null}
          </View>
        ) : null}

        {error && view !== "custom" && view !== "slip" ? (
          <Text style={{ marginTop: 12, color: T.pink, fontFamily: SANS }}>{error}</Text>
        ) : null}
      </Stage>
    </Screen>
  );
}

function acceptSlip(row: Prediction): Prediction {
  return {
    ...row,
    status: "accepted",
    answeredAt: nowIso(),
    yesVoters: row.side === "yes" ? [row.fromUserId] : [row.toUserId],
    noVoters: row.side === "no" ? [row.fromUserId] : [row.toUserId],
  };
}

function sideWord(kind: BetKind | undefined, pick: "yes" | "no", them: string) {
  if (kind === "who") return pick === "yes" ? "Me" : them;
  return pick === "yes" ? "Yes" : "No";
}

function myPick(
  row: Prediction,
  userId: string | undefined,
  me: string,
  them: string
) {
  if (!userId) return sideWord(row.kind, row.side, them);
  const proposer = row.fromUserId === userId;
  const pick = proposer ? row.side : row.side === "yes" ? "no" : "yes";
  if (row.kind === "who") {
    if (pick === "yes") return proposer ? me : them;
    return proposer ? them : me;
  }
  return pick === "yes" ? "Yes" : "No";
}

function personName(
  id: string,
  userId: string | undefined,
  me: string,
  them: string
) {
  return id && id === userId ? me : them;
}

function winnerName(row: Prediction, me: string, them: string, userId?: string) {
  if (row.status === "declined") return "Void";
  if (!row.resolved) return "Open";
  const winnerId = row.resolved === row.side ? row.fromUserId : row.toUserId;
  return personName(winnerId, userId, me, them);
}

function IncomingSlip({
  row,
  them,
  onAccept,
  onDecline,
}: {
  row: Prediction;
  them: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const theirSide =
    row.kind === "who" ? (row.side === "yes" ? them : "you") : row.side === "yes" ? "Yes" : "No";
  const yourSide =
    row.kind === "who" ? (row.side === "yes" ? "you" : them) : row.side === "yes" ? "No" : "Yes";
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: T.pink,
        backgroundColor: T.surface,
        padding: 14,
      }}
    >
      <Text style={[kicker, { color: T.pink }]}>SLIP FROM {them.toUpperCase()}</Text>
      <Text style={{ marginTop: 8, ...titleLg }}>{row.title}</Text>
      <PrizeStrip stake={row.stake} />
      <Text style={{ marginTop: 8, ...detail }}>
        They took {theirSide}. Accept and you are on {yourSide}.
      </Text>
      <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={onDecline}
          style={{
            flex: 1,
            height: 46,
            borderWidth: 1,
            borderColor: T.pink,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: T.pink,
              fontFamily: DISPLAY,
              fontSize: 16,
              letterSpacing: 1,
            }}
          >
            PASS
          </Text>
        </Pressable>
        <Pressable onPress={onAccept} style={[pinkBtn, { flex: 1, marginTop: 0 }]}>
          <Text style={pinkBtnText}>TAKE {yourSide.toUpperCase()}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PendingCard({
  row,
  me,
  them,
  mine,
  onVoid,
}: {
  row: Prediction;
  me: string;
  them: string;
  mine?: boolean;
  onVoid?: () => void;
}) {
  return (
    <View style={card}>
      <Text style={kicker}>WAITING ON {them.toUpperCase()}</Text>
      <Text style={{ marginTop: 6, ...titleMd }}>{row.title}</Text>
      <PrizeStrip stake={row.stake} />
      <Text style={{ marginTop: 8, ...detail }}>
        You took {myPick(row, row.fromUserId, me, them)}. They still have to take the
        other side.
      </Text>
      {mine && onVoid ? (
        <Pressable onPress={onVoid} style={{ marginTop: 10 }}>
          <Text style={{ fontFamily: SANS, fontSize: 13, color: T.pink }}>
            Pull this slip
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function LiveCard({
  row,
  userId,
  me,
  them,
  onSettle,
}: {
  row: Prediction;
  userId?: string;
  me: string;
  them: string;
  onSettle: (result: "yes" | "no") => void;
}) {
  const who = row.kind === "who";
  const yesName = personName(row.fromUserId, userId, me, them);
  const noName = personName(row.toUserId, userId, me, them);
  return (
    <View style={card}>
      <Text style={kicker}>LIVE</Text>
      <Text style={{ marginTop: 6, ...titleLg }}>{row.title}</Text>
      <PrizeStrip stake={row.stake} />
      <Text style={{ marginTop: 8, ...detail }}>
        You are on {myPick(row, userId, me, them)}. If you are right, you collect.
      </Text>
      <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
        <Pressable onPress={() => onSettle("yes")} style={settleBtn(T.gold)}>
          <Text style={{ color: T.gold, fontFamily: DISPLAY, fontSize: 13, letterSpacing: 0.6 }}>
            {who ? `IT WAS ${yesName.toUpperCase()}` : "IT WAS YES"}
          </Text>
        </Pressable>
        <Pressable onPress={() => onSettle("no")} style={settleBtn(T.pink)}>
          <Text style={{ color: T.pink, fontFamily: DISPLAY, fontSize: 13, letterSpacing: 0.6 }}>
            {who ? `IT WAS ${noName.toUpperCase()}` : "IT WAS NO"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ResultCard({
  row,
  userId,
  me,
  them,
}: {
  row: Prediction;
  userId?: string;
  me: string;
  them: string;
}) {
  const voided = row.status === "declined";
  const name = winnerName(row, me, them, userId);
  return (
    <View style={[card, { opacity: 0.92 }]}>
      <Text style={[kicker, { color: voided ? T.dim : T.gold }]}>
        {voided ? "VOID" : `${name.toUpperCase()} COLLECTS`}
      </Text>
      <Text style={{ marginTop: 6, ...titleMd }}>{row.title}</Text>
      <Text style={{ marginTop: 6, ...detail }}>
        {voided ? `${them} passed.` : row.stake}
      </Text>
    </View>
  );
}

function SlipBuilder({
  title,
  stake,
  kind,
  side,
  them,
  error,
  onSide,
  onSend,
}: {
  title: string;
  stake: string;
  kind: BetKind;
  side: "yes" | "no";
  them: string;
  error: string | null;
  onSide: (side: "yes" | "no") => void;
  onSend: () => void;
}) {
  return (
    <View
      style={{
        marginTop: 16,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surface,
        overflow: "hidden",
      }}
    >
      <View style={{ height: 6, backgroundColor: T.gold }} />
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={kicker}>BETTING SLIP</Text>
          <Text style={[kicker, { color: T.pink }]}>LOVEBETZ</Text>
        </View>
        <Text style={{ marginTop: 10, ...titleLg }}>{title}</Text>
        <PrizeStrip stake={stake} />
        <Text style={{ marginTop: 16, ...kicker, color: T.pink }}>PICK YOUR SIDE</Text>
        <SidePicker kind={kind} side={side} them={them} stake={stake} onSide={onSide} />
        <Text style={{ marginTop: 10, ...detail, lineHeight: 20 }}>
          {them} is offered the other side. Same stake either way. If they pass, nothing
          is owed.
        </Text>
        <Pressable onPress={onSend} style={pinkBtn}>
          <Text style={pinkBtnText}>SEND SLIP TO {them.toUpperCase()}</Text>
        </Pressable>
        {error ? <Text style={{ marginTop: 8, color: T.pink }}>{error}</Text> : null}
      </View>
    </View>
  );
}

function SidePicker({
  kind,
  side,
  them,
  stake,
  onSide,
}: {
  kind: BetKind;
  side: "yes" | "no";
  them: string;
  stake: string;
  onSide: (side: "yes" | "no") => void;
}) {
  const left = kind === "who" ? "Me" : "Yes";
  const right = kind === "who" ? them : "No";
  return (
    <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
      <SideTile
        label={left}
        stake={stake}
        active={side === "yes"}
        onPress={() => onSide("yes")}
      />
      <SideTile
        label={right}
        stake={stake}
        active={side === "no"}
        onPress={() => onSide("no")}
      />
    </View>
  );
}

function SideTile({
  label,
  stake,
  active,
  onPress,
}: {
  label: string;
  stake: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 88,
        borderWidth: 1.5,
        borderColor: active ? T.pink : T.border,
        backgroundColor: active ? T.pink : T.paper,
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
      }}
    >
      <Text
        style={{
          fontFamily: DISPLAY,
          fontSize: 20,
          letterSpacing: 0.4,
          color: active ? T.onPink : T.ink,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SANS,
          fontSize: 11,
          color: active ? "rgba(255,247,242,0.78)" : T.muted,
        }}
      >
        Winner gets
      </Text>
      <Text
        numberOfLines={2}
        style={{
          marginTop: 2,
          fontFamily: SANS,
          fontSize: 13,
          lineHeight: 17,
          fontWeight: "700",
          color: active ? T.onPink : T.ink,
        }}
      >
        {stake}
      </Text>
    </Pressable>
  );
}

function PrizeStrip({ stake }: { stake: string }) {
  return (
    <View
      style={{
        marginTop: 10,
        backgroundColor: T.goldSoft,
        borderLeftWidth: 3,
        borderLeftColor: T.gold,
        paddingVertical: 8,
        paddingHorizontal: 10,
      }}
    >
      <Text style={{ fontFamily: SANS, fontSize: 11, color: T.gold }}>Winner gets</Text>
      <Text style={{ marginTop: 2, fontFamily: SANS, fontSize: 15, color: T.ink, fontWeight: "700" }}>
        {stake}
      </Text>
    </View>
  );
}

function Door({
  kicker: kickerLabel,
  title,
  detail: line,
  onPress,
}: {
  kicker: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={tile}>
      <Text style={kicker}>{kickerLabel}</Text>
      <Text style={[titleMd, { marginTop: 4 }]}>{title}</Text>
      <Text style={[detail, { marginTop: 4 }]}>{line}</Text>
    </Pressable>
  );
}

function Catalog({
  heading,
  sub,
  tiles,
}: {
  heading: string;
  sub: string;
  tiles: { id: string; label: string; detail: string; onPress: () => void }[];
}) {
  return (
    <View>
      <Text style={{ marginTop: 12, ...headingXl }}>{heading}</Text>
      <Text style={{ marginTop: 6, ...detail, lineHeight: 20 }}>{sub}</Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        {tiles.map((tileItem) => (
          <Pressable key={tileItem.id} onPress={tileItem.onPress} style={tile}>
            <Text style={titleMd}>{tileItem.label}</Text>
            <Text style={detail}>{tileItem.detail}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ListPane({
  heading,
  hint,
  rows,
}: {
  heading: string;
  hint?: string;
  rows: { id: string; label: string; onPress: () => void }[];
}) {
  return (
    <View>
      <Text style={{ marginTop: 12, ...headingXl }}>{heading}</Text>
      <View style={{ marginTop: 12, gap: 8 }}>
        {rows.map((row) => (
          <Pressable key={row.id} onPress={row.onPress} style={tile}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: SANS,
                  fontSize: 16,
                  lineHeight: 22,
                  color: T.ink,
                }}
              >
                {row.label}
              </Text>
              <Text
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 12,
                  color: T.gold,
                  marginTop: 3,
                }}
              >
                {hint ?? "→"}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ marginBottom: 10, ...kicker }}>{label.toUpperCase()}</Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function Empty({ line }: { line: string }) {
  return <Text style={{ color: T.dim, fontFamily: SANS, fontSize: 14, lineHeight: 20 }}>{line}</Text>;
}

function Badge({
  label,
  tone = "pink",
}: {
  label: string;
  tone?: "pink" | "gold";
}) {
  const color = tone === "gold" ? T.gold : T.pink;
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: color,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontFamily: DISPLAY,
          fontSize: 12,
          letterSpacing: 0.8,
          color,
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: T.pink,
        backgroundColor: active ? T.pink : "transparent",
      }}
    >
      <Text
        style={{
          fontFamily: DISPLAY,
          fontSize: 13,
          letterSpacing: 0.8,
          color: active ? T.onPink : T.pink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const kicker = {
  fontFamily: DISPLAY,
  fontSize: 12,
  letterSpacing: 1.3,
  color: T.gold,
} as const;

const headingXl = {
  fontFamily: DISPLAY,
  fontSize: 30,
  color: T.ink,
} as const;

const titleLg = {
  fontFamily: SANS,
  fontSize: 22,
  lineHeight: 28,
  fontWeight: "700" as const,
  color: T.ink,
};

const titleMd = {
  fontFamily: SANS,
  fontSize: 20,
  lineHeight: 26,
  fontWeight: "700" as const,
  color: T.ink,
};

const detail = {
  fontFamily: SANS,
  fontSize: 14,
  color: T.muted,
};

const tile = {
  borderWidth: 1,
  borderColor: T.border,
  paddingVertical: 16,
  paddingHorizontal: 14,
  backgroundColor: T.surface,
} as const;

const card = {
  borderWidth: 1,
  borderColor: T.border,
  padding: 14,
  backgroundColor: T.surface,
} as const;

const term = {
  marginTop: 10,
  color: T.ink,
  fontFamily: SANS,
  fontSize: 16,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(227,27,93,0.28)",
  paddingVertical: 8,
} as const;

const pinkBtn = {
  marginTop: 14,
  height: 46,
  backgroundColor: T.pink,
  justifyContent: "center" as const,
};

const pinkBtnText = {
  textAlign: "center" as const,
  color: T.onPink,
  fontFamily: DISPLAY,
  fontSize: 16,
  letterSpacing: 1,
};

function settleBtn(color: string) {
  return {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: color,
    alignItems: "center" as const,
  };
}
