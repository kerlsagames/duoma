import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { LOVEBETZ_TONE as T, SERIF } from "@/lib/app-themes";
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
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const ODDS = "1.90";

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
      .map((row) => row.title)
      .join("   ·   ") || "MARKETS OPEN   ·   SEND A SLIP   ·   EVEN MONEY";

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
      setError("Name what the loser owes.");
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
    setFlash(`Slip sent to ${them}. Waiting for them to accept.`);
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
    setFlash(accept ? "You're on. Book is live." : "Slip declined. Void.");
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
      <Stage background={T.background} fallback={"/hub/play" as Href} accent={T.gold}>
        <View
          style={{
            backgroundColor: "#07040C",
            paddingVertical: 8,
            overflow: "hidden",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(245,197,24,0.28)",
          }}
        >
          <Animated.Text
            style={{
              color: T.gold,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.2,
              width: 1100,
              transform: [
                {
                  translateX: tape.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -520],
                  }),
                },
              ],
            }}
          >
            {ticker.toUpperCase()}   ·   {ticker.toUpperCase()}
          </Animated.Text>
        </View>

        {view !== "home" ? (
          <Pressable
            onPress={goBack}
            style={{ marginTop: 14, flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="chevron-back" size={18} color={T.gold} />
            <Text
              style={{
                marginLeft: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: T.gold,
              }}
            >
              BACK
            </Text>
          </Pressable>
        ) : null}

        {view === "home" ? (
          <View>
            <LinearGradient
              colors={["#1A0A28", "#12081C", "#0A0612"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: T.border,
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 16,
              }}
            >
              <View
                style={{
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
                    color: T.dim,
                  }}
                >
                  18+  ·  PLAY FOR FAVORS
                </Text>
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 10,
                    letterSpacing: 1.6,
                    color: T.gold,
                  }}
                >
                  EVEN MONEY
                </Text>
              </View>
              <View style={{ marginTop: 10, flexDirection: "row", alignItems: "baseline" }}>
                <Text
                  style={{
                    color: T.pink,
                    fontSize: 40,
                    lineHeight: 42,
                    fontWeight: "900",
                    fontStyle: "italic",
                    letterSpacing: -1.2,
                  }}
                >
                  LOVE
                </Text>
                <Text
                  style={{
                    color: T.gold,
                    fontSize: 40,
                    lineHeight: 42,
                    fontWeight: "900",
                    letterSpacing: -1,
                  }}
                >
                  BETZ
                </Text>
              </View>
              <Text
                style={{
                  marginTop: 6,
                  color: T.cream,
                  fontFamily: SERIF,
                  fontSize: 16,
                  lineHeight: 22,
                }}
              >
                The couples book. You send a slip. {them} has to take it or pass.
              </Text>
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <Badge
                  label={`${BET_PROMPTS.length} MARKETS`}
                  color={T.gold}
                />
                <Badge
                  label={`${BET_STAKES.length} STAKES`}
                  color={T.pink}
                />
                <Badge
                  label={
                    incoming.length
                      ? `${incoming.length} TO ACCEPT`
                      : live.length
                        ? `${live.length} LIVE`
                        : "BOOK OPEN"
                  }
                  color={incoming.length ? T.pink : T.cream}
                />
              </View>
            </LinearGradient>

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
                <Text style={{ color: T.gold, fontFamily: "SpaceMono", fontSize: 12 }}>
                  {flash.toUpperCase()}
                </Text>
              </View>
            ) : null}

            {incoming.length > 0 ? (
              <Section label={`Incoming · ${them} wants a piece`}>
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
                detail="Name the future. Name the forfeit."
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
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 10,
                    letterSpacing: 1.6,
                    color: T.pink,
                  }}
                >
                  LUCKY DIP
                </Text>
                <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 20, color: T.cream }}>
                  Surprise slip
                </Text>
                <Text style={{ marginTop: 3, fontSize: 13, color: T.muted }}>
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

            <Section label="Live book">
              {live.length === 0 ? (
                <Empty line="Nothing live until a slip is accepted." />
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
            sub={`${BET_PROMPTS.length} lines. Then you pick the stake and your side.`}
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
            <Text
              style={{
                marginTop: 12,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: T.gold,
              }}
            >
              STAKE
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontSize: 24,
                lineHeight: 30,
                color: T.cream,
              }}
            >
              {pickedPrompt.text}
            </Text>
            <Text style={{ marginTop: 8, color: T.muted, fontSize: 14 }}>
              What does the loser owe?
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
                  <Text style={{ fontFamily: SERIF, fontSize: 20, color: T.cream }}>
                    {cat.label}
                  </Text>
                  <Text style={{ marginTop: 4, color: T.muted, fontSize: 13 }}>
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
                <Text style={{ fontFamily: SERIF, fontSize: 18, color: T.gold }}>
                  Shuffle a stake
                </Text>
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
            <Text
              style={{
                color: T.gold,
                fontFamily: "SpaceMono",
                fontSize: 10,
                letterSpacing: 1.6,
              }}
            >
              WRITE-IN SLIP
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="We'll use the nice plates"
              placeholderTextColor="rgba(255,246,232,0.28)"
              style={term}
            />
            <TextInput
              value={stake}
              onChangeText={setStake}
              placeholder="What the loser owes"
              placeholderTextColor="rgba(255,246,232,0.28)"
              style={term}
            />
            <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
              <Chip
                label="WILL IT"
                active={kind === "will"}
                onPress={() => setKind("will")}
              />
              <Chip
                label="WHO WILL"
                active={kind === "who"}
                onPress={() => setKind("who")}
              />
            </View>
            <Text
              style={{
                marginTop: 16,
                fontFamily: "SpaceMono",
                fontSize: 10,
                letterSpacing: 1.6,
                color: T.gold,
              }}
            >
              YOUR SIDE
            </Text>
            <SidePicker kind={kind} side={side} them={them} onSide={setSide} />
            <Pressable
              onPress={() => void sendSlip(title, stake || "Bragging rights", kind, side)}
              style={goldBtn}
            >
              <Text style={goldBtnText}>SEND TO {them.toUpperCase()}</Text>
            </Pressable>
            {error ? (
              <Text style={{ marginTop: 8, color: T.pink }}>{error}</Text>
            ) : null}
          </View>
        ) : null}

        {error && view !== "custom" && view !== "slip" ? (
          <Text style={{ marginTop: 12, color: T.pink }}>{error}</Text>
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
        backgroundColor: T.surfaceRaised,
        padding: 14,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.6,
          color: T.pink,
        }}
      >
        SLIP FROM {them.toUpperCase()}  ·  {ODDS}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 22,
          lineHeight: 28,
          color: T.cream,
        }}
      >
        {row.title}
      </Text>
      <Text style={{ marginTop: 8, color: T.muted, fontSize: 13 }}>
        Stake · {row.stake}
      </Text>
      <Text style={{ marginTop: 4, color: T.cream, fontSize: 13 }}>
        They took {theirSide}. Accept and you are on {yourSide}.
      </Text>
      <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={onDecline}
          style={{
            flex: 1,
            height: 44,
            borderWidth: 1,
            borderColor: T.pink,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: T.pink,
              fontWeight: "800",
              letterSpacing: 1,
            }}
          >
            DECLINE
          </Text>
        </Pressable>
        <Pressable onPress={onAccept} style={[goldBtn, { flex: 1, marginTop: 0 }]}>
          <Text style={goldBtnText}>ACCEPT {ODDS}</Text>
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
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.6,
          color: T.gold,
        }}
      >
        PENDING  ·  STAKE {row.stake.toUpperCase()}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 20,
          lineHeight: 26,
          color: T.cream,
        }}
      >
        {row.title}
      </Text>
      <Text style={{ marginTop: 8, color: T.muted, fontSize: 13 }}>
        You took {myPick(row, row.fromUserId, me, them)}. Waiting on {them}.
      </Text>
      {mine && onVoid ? (
        <Pressable onPress={onVoid} style={{ marginTop: 10 }}>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.2,
              color: T.pink,
            }}
          >
            PULL THIS SLIP
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
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.6,
            color: T.gold,
          }}
        >
          LIVE  ·  {ODDS}
        </Text>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.2,
            color: T.pink,
          }}
        >
          STAKE {row.stake.toUpperCase()}
        </Text>
      </View>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 22,
          lineHeight: 28,
          color: T.cream,
        }}
      >
        {row.title}
      </Text>
      <Text style={{ marginTop: 8, color: T.muted, fontSize: 13 }}>
        You are on {myPick(row, userId, me, them)}.
      </Text>
      <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
        <Pressable onPress={() => onSettle("yes")} style={settleBtn(T.gold)}>
          <Text style={{ color: T.gold, fontFamily: "SpaceMono", fontSize: 11 }}>
            {who ? `SETTLE ${yesName.toUpperCase()}` : "SETTLE YES"}
          </Text>
        </Pressable>
        <Pressable onPress={() => onSettle("no")} style={settleBtn(T.pink)}>
          <Text style={{ color: T.pink, fontFamily: "SpaceMono", fontSize: 11 }}>
            {who ? `SETTLE ${noName.toUpperCase()}` : "SETTLE NO"}
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
    <View style={[card, { opacity: 0.88 }]}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.6,
          color: voided ? T.dim : T.gold,
        }}
      >
        {voided ? "VOID" : `PAID  ·  ${name.toUpperCase()}`}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 18,
          lineHeight: 24,
          color: T.cream,
        }}
      >
        {row.title}
      </Text>
      <Text style={{ marginTop: 6, color: T.muted, fontSize: 13 }}>
        {voided ? `${them} passed.` : `Stake · ${row.stake}`}
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
        borderColor: T.gold,
        backgroundColor: T.surfaceRaised,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.6,
            color: T.gold,
          }}
        >
          BETTING SLIP
        </Text>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.6,
            color: T.pink,
          }}
        >
          LOVEBETZ
        </Text>
      </View>
      <Text
        style={{
          marginTop: 10,
          fontFamily: SERIF,
          fontSize: 24,
          lineHeight: 30,
          color: T.cream,
        }}
      >
        {title}
      </Text>
      <Text style={{ marginTop: 8, color: T.muted, fontSize: 14 }}>
        Stake · {stake}
      </Text>
      <Text
        style={{
          marginTop: 16,
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.6,
          color: T.gold,
        }}
      >
        PICK YOUR SIDE
      </Text>
      <SidePicker kind={kind} side={side} them={them} onSide={onSide} />
      <Text style={{ marginTop: 10, color: T.muted, fontSize: 13, lineHeight: 18 }}>
        {them} gets the other side if they accept. If they pass, the slip is void.
      </Text>
      <Pressable onPress={onSend} style={goldBtn}>
        <Text style={goldBtnText}>SEND SLIP TO {them.toUpperCase()}</Text>
      </Pressable>
      {error ? <Text style={{ marginTop: 8, color: T.pink }}>{error}</Text> : null}
    </View>
  );
}

function SidePicker({
  kind,
  side,
  them,
  onSide,
}: {
  kind: BetKind;
  side: "yes" | "no";
  them: string;
  onSide: (side: "yes" | "no") => void;
}) {
  const left = kind === "who" ? "ME" : "YES";
  const right = kind === "who" ? them.toUpperCase() : "NO";
  return (
    <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
      <OddsButton
        label={left}
        active={side === "yes"}
        tone="gold"
        onPress={() => onSide("yes")}
      />
      <OddsButton
        label={right}
        active={side === "no"}
        tone="pink"
        onPress={() => onSide("no")}
      />
    </View>
  );
}

function OddsButton({
  label,
  active,
  tone,
  onPress,
}: {
  label: string;
  active: boolean;
  tone: "gold" | "pink";
  onPress: () => void;
}) {
  const color = tone === "gold" ? T.gold : T.pink;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 72,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: active ? (tone === "gold" ? T.gold : T.pink) : "transparent",
        justifyContent: "center",
        paddingHorizontal: 10,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          fontFamily: "SpaceMono",
          fontSize: 12,
          letterSpacing: 1.2,
          color: active ? T.ink : color,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginTop: 4,
          textAlign: "center",
          fontSize: 22,
          fontWeight: "800",
          color: active ? T.ink : T.cream,
        }}
      >
        {ODDS}
      </Text>
    </Pressable>
  );
}

function Door({
  kicker,
  title,
  detail,
  onPress,
}: {
  kicker: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={tile}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.6,
          color: T.gold,
        }}
      >
        {kicker}
      </Text>
      <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 22, color: T.cream }}>
        {title}
      </Text>
      <Text style={{ marginTop: 4, color: T.muted, fontSize: 13 }}>{detail}</Text>
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
      <Text style={{ marginTop: 12, fontFamily: SERIF, fontSize: 28, color: T.gold }}>
        {heading}
      </Text>
      <Text style={{ marginTop: 6, color: T.muted, fontSize: 14, lineHeight: 20 }}>
        {sub}
      </Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        {tiles.map((tileItem) => (
          <Pressable key={tileItem.id} onPress={tileItem.onPress} style={tile}>
            <Text style={{ fontFamily: SERIF, fontSize: 20, color: T.cream }}>
              {tileItem.label}
            </Text>
            <Text style={{ marginTop: 4, color: T.muted, fontSize: 13 }}>
              {tileItem.detail}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ListPane({
  heading,
  rows,
}: {
  heading: string;
  rows: { id: string; label: string; onPress: () => void }[];
}) {
  return (
    <View>
      <Text style={{ marginTop: 12, fontFamily: SERIF, fontSize: 26, color: T.gold }}>
        {heading}
      </Text>
      <View style={{ marginTop: 12, gap: 8 }}>
        {rows.map((row) => (
          <Pressable key={row.id} onPress={row.onPress} style={tile}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: SERIF,
                  fontSize: 16,
                  lineHeight: 22,
                  color: T.cream,
                }}
              >
                {row.label}
              </Text>
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 12,
                  color: T.gold,
                  marginTop: 2,
                }}
              >
                {ODDS}
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
      <Text
        style={{
          marginBottom: 10,
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          color: T.gold,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function Empty({ line }: { line: string }) {
  return (
    <Text style={{ color: T.dim, fontFamily: "SpaceMono", fontSize: 12, lineHeight: 18 }}>
      {line}
    </Text>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
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
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.2,
          color,
        }}
      >
        {label}
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
        borderColor: T.gold,
        backgroundColor: active ? T.gold : "transparent",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.2,
          color: active ? T.ink : T.gold,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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
  color: T.cream,
  fontFamily: "SpaceMono",
  borderBottomWidth: 1,
  borderBottomColor: "rgba(245,197,24,0.28)",
  paddingVertical: 8,
} as const;

const goldBtn = {
  marginTop: 14,
  height: 46,
  backgroundColor: T.gold,
  justifyContent: "center" as const,
};

const goldBtnText = {
  textAlign: "center" as const,
  color: T.ink,
  fontWeight: "900" as const,
  letterSpacing: 1.1,
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
