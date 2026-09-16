import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import {
  LOVEBETZ_DISPLAY as DISPLAY,
  LOVEBETZ_SANS as SANS,
  LOVEBETZ_SCRIPT as SCRIPT,
  LOVEBETZ_TONE as T,
} from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import {
  BET_PROMPT_CATEGORIES,
  BET_PROMPTS,
  BET_STAKE_CATEGORIES,
  BET_STAKES,
  betLoserId,
  betPromptsIn,
  betStakesIn,
  betWinnerId,
  buildBetStatement,
  pickRandomPrompt,
  pickRandomStake,
  promptPickMode,
  type BetKind,
  type BetPickMode,
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
import { Animated, Easing, Platform, Pressable, Text, TextInput, View } from "react-native";

type HubTab = "make" | "live" | "finalised";

type ViewMode =
  | "home"
  | "prompts"
  | "prompt-list"
  | "pick"
  | "stakes"
  | "stake-list"
  | "stake-write"
  | "slip"
  | "custom";

const TAPE_COPY = "LOVEBETZ   ·   PLACE A SLIP   ·   WINNER TAKES THE PRIZE   ·   ";
const TAPE_HEIGHT = 22;

export default function PredictionScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [view, setView] = useState<ViewMode>("home");
  const look = useAppLook("prediction", T.pink, {
    hideTape: false,
    compactSlips: false,
  });
  const [hub, setHub] = useState<HubTab>("make");
  const [promptCat, setPromptCat] = useState<BetPromptCategory | null>(null);
  const [stakeCat, setStakeCat] = useState<BetStakeCategory | null>(null);
  const [pickedPrompt, setPickedPrompt] = useState<BetPrompt | null>(null);
  const [title, setTitle] = useState("");
  const [stake, setStake] = useState("");
  const [kind, setKind] = useState<BetKind>("will");
  const [pickMode, setPickMode] = useState<BetPickMode>("yesno");
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const me = user?.displayName || "You";
  const tape = useRef(new Animated.Value(0)).current;
  const [tapeWidth, setTapeWidth] = useState(0);

  useEffect(() => {
    tape.setValue(0);
    const loop = Animated.loop(
      Animated.timing(tape, {
        toValue: 1,
        duration: Math.max(14000, tapeWidth * 18),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [tape, tapeWidth]);

  const incoming = data.predictions.filter(
    (row) => row.status === "offered" && user && row.toUserId === user.id
  );
  const outgoing = data.predictions.filter(
    (row) => row.status === "offered" && user && row.fromUserId === user.id
  );
  const live = data.predictions.filter((row) => row.status === "accepted");
  const owed = data.predictions.filter((row) => row.status === "settled" && !row.paidAt);
  const paidOut = data.predictions.filter((row) => row.status === "settled" && row.paidAt);
  const voided = data.predictions.filter((row) => row.status === "declined");
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
    setSubject("");
    setError(null);
  };

  const startFromPrompt = (prompt: BetPrompt) => {
    setPickedPrompt(prompt);
    setTitle(prompt.text);
    setKind(prompt.kind);
    setPickMode(promptPickMode(prompt));
    setStake("");
    setStakeCat(null);
    setSide("yes");
    setSubject("");
    setView("pick");
    setError(null);
  };

  const statement = buildBetStatement({
    me,
    them,
    gender: user?.gender,
    question: title,
    mode: pickMode,
    side,
    subject,
  });

  const openSlip = (nextTitle: string, nextStake: string, nextKind: BetKind) => {
    setTitle(nextTitle);
    setStake(nextStake);
    setKind(nextKind);
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
    const line = buildBetStatement({
      me,
      them,
      gender: user.gender,
      question: nextTitle,
      mode: pickMode,
      side: nextSide,
      subject,
    });
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
          statement: line,
          subject: pickMode === "name" ? subject.trim() : undefined,
          pickMode,
          yesVoters: [],
          noVoters: [],
          status: "offered",
          resolved: null,
          paidAt: null,
          createdAt: nowIso(),
          answeredAt: null,
        },
        ...state.predictions,
      ],
    }));
    setTitle("");
    setStake("");
    setPickedPrompt(null);
    setSubject("");
    setFlash(`Slip sent to ${them}. Waiting for them to disagree and accept.`);
    goHome();
    setHub("live");
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
    setFlash(
      accept
        ? "You're on. You disagree — if their pick is wrong, you collect."
        : "Passed. Slip is void."
    );
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
    const row = data.predictions.find((item) => item.id === id);
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((item) =>
        item.id === id && item.status === "accepted"
          ? { ...item, resolved: result, status: "settled" as const, paidAt: null }
          : item
      ),
    }));
    if (row) {
      const settled = { ...row, resolved: result };
      const loser = betLoserId(settled);
      const winner = betWinnerId(settled);
      if (loser && winner) {
        setFlash(
          `${personName(loser, user?.id, me, them)} owes ${personName(winner, user?.id, me, them)}: ${row.stake}`
        );
        setHub("finalised");
      }
    }
  };

  const markPaid = async (id: string, paid: boolean) => {
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) =>
        row.id === id && row.status === "settled"
          ? { ...row, paidAt: paid ? nowIso() : null }
          : row
      ),
    }));
    setFlash(paid ? "Marked as paid." : "Back on the owed list.");
  };

  const goBack = () => {
    if (view === "prompt-list") setView("prompts");
    else if (view === "pick") setView("prompt-list");
    else if (view === "stake-list" || view === "stake-write") setView("stakes");
    else if (view === "stakes") setView(pickedPrompt ? "pick" : "custom");
    else if (view === "slip") {
      if (stakeCat) setView("stake-list");
      else setView("stakes");
    } else goHome();
  };

  return (
    <Screen scroll background={T.background} density={look.prefs.density} typeface={look.prefs.typeface} accent={look.accent}>
      <Stage
        background={T.background}
        fallback={"/hub/play" as Href}
        accent={look.accent}
        settingsLabel="LoveBetz"
        settings={
          <LookPanel
            look={look}
            ink={T.ink}
            muted={T.muted}
            toggles={[
              {
                key: "hideTape",
                label: "Hide the ticker tape",
                hint: "A calmer slip desk.",
              },
              {
                key: "compactSlips",
                label: "Compact slips",
                hint: "Less paper between bets.",
              },
            ]}
          />
        }
      >
        {look.prefs.hideTape ? null : (
        <View
          style={{
            marginHorizontal: -20,
            height: TAPE_HEIGHT,
            backgroundColor: look.accent,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={{
              flexDirection: "row",
              flexWrap: "nowrap",
              height: TAPE_HEIGHT,
              alignItems: "center",
              transform: [
                {
                  translateX: tape.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, tapeWidth ? -tapeWidth : -280],
                  }),
                },
              ],
            }}
          >
            {[0, 1].map((copy) => (
              <Text
                key={copy}
                numberOfLines={1}
                onLayout={
                  copy === 0
                    ? (event) => {
                        const next = event.nativeEvent.layout.width;
                        if (next > 0 && Math.abs(next - tapeWidth) > 2) {
                          setTapeWidth(next);
                        }
                      }
                    : undefined
                }
                style={{
                  color: T.onPink,
                  fontFamily: SANS,
                  fontSize: 12,
                  lineHeight: TAPE_HEIGHT,
                  fontWeight: "700",
                  letterSpacing: 0.4,
                  paddingRight: 8,
                  flexShrink: 0,
                  ...(Platform.OS === "web" ? { whiteSpace: "nowrap" as const } : null),
                }}
              >
                {TAPE_COPY}
              </Text>
            ))}
          </Animated.View>
        </View>
        )}

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            gap: 6,
          }}
        >
          {(
            [
              ["make", "Make a bet"],
              ["live", "Live bets"],
              ["finalised", "Finalised bets"],
            ] as const
          ).map(([id, label]) => {
            const on = hub === id;
            return (
              <Pressable
                key={id}
                onPress={() => setHub(id)}
                style={{
                  flex: 1,
                  minHeight: 52,
                  paddingHorizontal: 6,
                  paddingVertical: 8,
                  borderWidth: 1.5,
                  borderColor: T.pink,
                  backgroundColor: on ? T.pink : T.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: DISPLAY,
                    fontSize: 13,
                    lineHeight: 16,
                    letterSpacing: 0.3,
                    color: on ? T.onPink : T.pink,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {hub === "make" && view !== "home" ? (
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

        {hub === "make" && view === "home" ? (
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
                    alignItems: "flex-end",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: SCRIPT,
                      fontSize: 44,
                      lineHeight: 50,
                      color: T.pink,
                    }}
                  >
                    Love
                  </Text>
                  <Text
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 30,
                      lineHeight: 38,
                      color: T.ink,
                      letterSpacing: 1,
                      paddingBottom: 4,
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
                    fontSize: 15,
                    lineHeight: 21,
                  }}
                >
                  Pick a side and a prize. {them} can disagree and accept, or
                  pass. Winner collects.
                </Text>
              </View>
            </View>

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
                detail="Name the future. Then pick a prize, or write one."
                onPress={() => {
                  setTitle("");
                  setStake("");
                  setKind("will");
                  setPickMode("yesno");
                  setSide("yes");
                  setSubject("");
                  setPickedPrompt(null);
                  setView("custom");
                }}
              />
              <Pressable
                onPress={() => {
                  startFromPrompt(pickRandomPrompt());
                }}
                style={tile}
              >
                <Text style={[kicker, { color: T.pink }]}>LUCKY DIP</Text>
                <Text style={titleMd}>Surprise slip</Text>
                <Text style={detail}>
                  Random market. You still pick a side, then the prize.
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {hub === "live" ? (
          <View>
            {incoming.length > 0 ? (
              <Section label={`${them} wants a piece`}>
                {incoming.map((row) => (
                  <IncomingSlip
                    key={row.id}
                    row={row}
                    them={them}
                    me={me}
                    onAccept={() => void answerSlip(row.id, true)}
                    onDecline={() => void answerSlip(row.id, false)}
                  />
                ))}
              </Section>
            ) : null}

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

            <Section label="On">
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
          </View>
        ) : null}

        {hub === "finalised" ? (
          <View>
            <PayoutBoard
              owed={owed}
              paid={paidOut}
              userId={user?.id}
              me={me}
              them={them}
              onPaid={(id, paid) => void markPaid(id, paid)}
            />
            {voided.length > 0 ? (
              <Section label="Voided">
                {voided.slice(0, 12).map((row) => (
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

        {hub === "make" && view === "prompts" ? (
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

        {hub === "make" && view === "prompt-list" && promptCat ? (
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

        {hub === "make" && view === "pick" && pickedPrompt ? (
          <PickPane
            prompt={pickedPrompt}
            mode={pickMode}
            side={side}
            subject={subject}
            me={me}
            them={them}
            statement={statement}
            onSide={setSide}
            onSubject={setSubject}
            onNext={() => {
              if (pickMode === "name" && !subject.trim()) {
                setError("Type who you are backing.");
                return;
              }
              setError(null);
              setView("stakes");
            }}
            error={error}
          />
        ) : null}

        {hub === "make" && view === "stakes" && title ? (
          <View>
            <Text style={{ marginTop: 12, ...kicker, color: T.pink }}>WINNER COLLECTS</Text>
            <Text style={{ marginTop: 6, ...titleLg }}>{title}</Text>
            <Text style={{ marginTop: 8, ...detail }}>
              Pick a suggestion, write your own, or shuffle. The loser owes it.
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
                onPress={() => {
                  setStake("");
                  setStakeCat(null);
                  setView("stake-write");
                }}
                style={tile}
              >
                <Text style={[titleMd, { color: T.pink }]}>Write your own prize</Text>
                <Text style={detail}>Name exactly what the winner collects.</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setStakeCat(null);
                  openSlip(title, pickRandomStake().text, kind);
                }}
                style={tile}
              >
                <Text style={titleMd}>Shuffle a stake</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {hub === "make" && view === "stake-list" && stakeCat && title ? (
          <View>
            <ListPane
              heading={
                BET_STAKE_CATEGORIES.find((row) => row.id === stakeCat)?.label ??
                "Stakes"
              }
              hint="Winner collects"
              rows={stakeRows.map((row) => ({
                id: row.id,
                label: row.text,
                onPress: () => openSlip(title, row.text, kind),
              }))}
            />
            <Pressable
              onPress={() => {
                setStake("");
                setStakeCat(null);
                setView("stake-write");
              }}
              style={[tile, { marginTop: 10 }]}
            >
              <Text style={[titleMd, { color: T.pink }]}>Write your own instead</Text>
            </Pressable>
          </View>
        ) : null}

        {hub === "make" && view === "stake-write" ? (
          <View
            style={{
              marginTop: 16,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.surface,
              padding: 14,
            }}
          >
            <Text style={[kicker, { color: T.pink }]}>WRITE THE PRIZE</Text>
            <Text style={{ marginTop: 8, ...titleLg }}>{title}</Text>
            <Text style={{ marginTop: 8, ...detail }}>
              Whatever you type here is what the loser owes.
            </Text>
            <TextInput
              value={stake}
              onChangeText={(value) => {
                setStake(value);
                setError(null);
              }}
              placeholder="Winner collects…"
              placeholderTextColor={T.dim}
              style={term}
            />
            <Pressable
              onPress={() => {
                if (!stake.trim()) {
                  setError("Name what the winner collects.");
                  return;
                }
                openSlip(title, stake, kind);
              }}
              style={pinkBtn}
            >
              <Text style={pinkBtnText}>USE THIS PRIZE</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: T.pink }}>{error}</Text> : null}
          </View>
        ) : null}

        {hub === "make" && view === "slip" ? (
          <SlipBuilder
            title={title}
            statement={statement}
            stake={stake}
            them={them}
            error={error}
            onSend={() => void sendSlip(title, stake, kind, side)}
          />
        ) : null}

        {hub === "make" && view === "custom" ? (
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
            <Text style={{ marginTop: 6, ...detail }}>
              Write the market here. Next you pick a suggested prize or write your own.
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="We'll use the nice plates"
              placeholderTextColor={T.dim}
              style={term}
            />
            <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Chip
                label="WILL IT"
                active={pickMode === "yesno"}
                onPress={() => {
                  setKind("will");
                  setPickMode("yesno");
                }}
              />
              <Chip
                label="ME OR THEM"
                active={pickMode === "us"}
                onPress={() => {
                  setKind("who");
                  setPickMode("us");
                }}
              />
              <Chip
                label="NAME A PICK"
                active={pickMode === "name"}
                onPress={() => {
                  setKind("who");
                  setPickMode("name");
                }}
              />
            </View>
            <Text style={{ marginTop: 16, ...kicker, color: T.pink }}>YOUR SIDE</Text>
            {pickMode === "name" ? (
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Who are you backing?"
                placeholderTextColor={T.dim}
                style={term}
              />
            ) : (
              <SidePicker mode={pickMode} side={side} them={them} onSide={setSide} />
            )}
            <Text style={{ marginTop: 12, ...detail }}>{statement}</Text>
            <Pressable
              onPress={() => {
                if (!title.trim()) {
                  setError("Name the market first.");
                  return;
                }
                if (pickMode === "name" && !subject.trim()) {
                  setError("Type who you are backing.");
                  return;
                }
                setError(null);
                setStake("");
                setStakeCat(null);
                setView("stakes");
              }}
              style={pinkBtn}
            >
              <Text style={pinkBtnText}>NEXT · WINNER COLLECTS</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: T.pink }}>{error}</Text> : null}
          </View>
        ) : null}

        {hub === "make" && error && view !== "custom" && view !== "slip" && view !== "stake-write" ? (
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
  const winnerId = betWinnerId(row);
  if (!winnerId) return "Open";
  return personName(winnerId, userId, me, them);
}

function IncomingSlip({
  row,
  them,
  me,
  onAccept,
  onDecline,
}: {
  row: Prediction;
  them: string;
  me: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const line =
    row.statement ||
    `${them} bets on “${row.title}”.`;
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
      <Text style={{ marginTop: 8, ...titleLg }}>{line}</Text>
      <Text style={{ marginTop: 10, ...detail }}>
        Do you disagree and accept the bet, {me}?
      </Text>
      <PrizeStrip stake={row.stake} />
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
          <Text style={pinkBtnText}>DISAGREE & ACCEPT</Text>
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
      <Text style={{ marginTop: 6, ...titleMd }}>{row.statement || row.title}</Text>
      <PrizeStrip stake={row.stake} />
      <Text style={{ marginTop: 8, ...detail }}>
        Waiting for {them} to disagree and accept.
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
      <Text style={{ marginTop: 6, ...titleLg }}>{row.statement || row.title}</Text>
      <PrizeStrip stake={row.stake} />
      <Text style={{ marginTop: 8, ...detail }}>
        You are on {myPick(row, userId, me, them)}. If their pick is wrong, you collect.
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

function PayoutBoard({
  owed,
  paid,
  userId,
  me,
  them,
  onPaid,
}: {
  owed: Prediction[];
  paid: Prediction[];
  userId?: string;
  me: string;
  them: string;
  onPaid: (id: string, paid: boolean) => void;
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
        <Text style={kicker}>PAYOUTS</Text>
        <Text style={{ marginTop: 4, ...detail }}>
          Who has to pay the prize, and whether they have.
        </Text>
        {owed.length === 0 && paid.length === 0 ? (
          <Text style={{ marginTop: 12, color: T.dim, fontFamily: SANS, fontSize: 14, lineHeight: 20 }}>
            Nobody owes yet. Settle a live slip and it lands here.
          </Text>
        ) : null}
        {owed.map((row) => (
          <PayoutRow
            key={row.id}
            row={row}
            userId={userId}
            me={me}
            them={them}
            onPaid={onPaid}
          />
        ))}
        {paid.slice(0, 5).map((row) => (
          <PayoutRow
            key={row.id}
            row={row}
            userId={userId}
            me={me}
            them={them}
            onPaid={onPaid}
          />
        ))}
      </View>
    </View>
  );
}

function PayoutRow({
  row,
  userId,
  me,
  them,
  onPaid,
}: {
  row: Prediction;
  userId?: string;
  me: string;
  them: string;
  onPaid: (id: string, paid: boolean) => void;
}) {
  const loserId = betLoserId(row);
  const winnerId = betWinnerId(row);
  const loser = loserId ? personName(loserId, userId, me, them) : "Someone";
  const winner = winnerId ? personName(winnerId, userId, me, them) : "someone";
  const paid = Boolean(row.paidAt);
  const iOwe = Boolean(loserId && userId && loserId === userId);
  const theyOwe = Boolean(winnerId && userId && winnerId === userId);
  const headline = iOwe
    ? `You owe ${winner}`
    : theyOwe
      ? `${loser} owes you`
      : `${loser} owes ${winner}`;
  return (
    <View
      style={{
        marginTop: 12,
        borderWidth: 1,
        borderColor: paid ? T.border : T.pink,
        backgroundColor: paid ? T.paper : T.pinkSoft,
        padding: 12,
      }}
    >
      <Text style={[kicker, { color: paid ? T.gold : T.pink }]}>
        {paid ? "PAID" : "STILL OWED"}
      </Text>
      <Text style={{ marginTop: 6, ...titleMd }}>{headline}</Text>
      <Text style={{ marginTop: 6, fontFamily: SANS, fontSize: 16, color: T.ink }}>
        {row.stake}
      </Text>
      <Text style={{ marginTop: 4, ...detail }}>{row.statement || row.title}</Text>
      <Pressable onPress={() => onPaid(row.id, !paid)} style={{ marginTop: 10 }}>
        <Text style={{ fontFamily: DISPLAY, fontSize: 13, letterSpacing: 0.8, color: T.pink }}>
          {paid ? "MARK UNPAID" : iOwe ? "I PAID UP" : "THEY PAID UP"}
        </Text>
      </Pressable>
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

function PickPane({
  prompt,
  mode,
  side,
  subject,
  me,
  them,
  statement,
  onSide,
  onSubject,
  onNext,
  error,
}: {
  prompt: BetPrompt;
  mode: BetPickMode;
  side: "yes" | "no";
  subject: string;
  me: string;
  them: string;
  statement: string;
  onSide: (side: "yes" | "no") => void;
  onSubject: (value: string) => void;
  onNext: () => void;
  error: string | null;
}) {
  return (
    <View
      style={{
        marginTop: 16,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surface,
        padding: 14,
      }}
    >
      <Text style={[kicker, { color: T.pink }]}>YOUR PICK</Text>
      <Text style={{ marginTop: 8, ...titleLg }}>{prompt.text}</Text>
      {mode === "name" ? (
        <>
          <Text style={{ marginTop: 14, ...detail }}>
            Type who you are backing — a player, a team, a name.
          </Text>
          <TextInput
            value={subject}
            onChangeText={onSubject}
            placeholder="e.g. Nick Daicos"
            placeholderTextColor={T.dim}
            style={term}
          />
        </>
      ) : (
        <SidePicker mode={mode} side={side} them={them} onSide={onSide} />
      )}
      <Text style={{ marginTop: 14, ...detail }}>
        {statement} {them} can disagree. This is {me}’s side.
      </Text>
      <Pressable onPress={onNext} style={pinkBtn}>
        <Text style={pinkBtnText}>NEXT — PICK THE PRIZE</Text>
      </Pressable>
      {error ? <Text style={{ marginTop: 8, color: T.pink }}>{error}</Text> : null}
    </View>
  );
}

function SlipBuilder({
  title,
  statement,
  stake,
  them,
  error,
  onSend,
}: {
  title: string;
  statement: string;
  stake: string;
  them: string;
  error: string | null;
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
        <Text style={{ marginTop: 10, ...titleLg }}>{statement || title}</Text>
        <PrizeStrip stake={stake} />
        <Text style={{ marginTop: 10, ...detail, lineHeight: 20 }}>
          {them} will see this and can disagree and accept, or pass.
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
  mode,
  side,
  them,
  onSide,
}: {
  mode: BetPickMode;
  side: "yes" | "no";
  them: string;
  onSide: (side: "yes" | "no") => void;
}) {
  const left = mode === "us" ? "Me" : "Yes";
  const right = mode === "us" ? "Partner" : "No";
  return (
    <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
      <SideTile
        label={left}
        stake={mode === "us" ? `I think it will be me` : "I think yes"}
        active={side === "yes"}
        onPress={() => onSide("yes")}
      />
      <SideTile
        label={right}
        stake={mode === "us" ? `I think it will be ${them}` : "I think no"}
        onPress={() => onSide("no")}
        active={side === "no"}
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
