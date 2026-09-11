import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
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
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#04140E";
const GREEN = "#39FF9A";
const RED = "#FF4D4D";
const MUTED = "rgba(57,255,154,0.55)";

type ViewMode =
  | "home"
  | "prompts"
  | "prompt-list"
  | "stakes"
  | "stake-list"
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
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const tape = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(tape, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [tape]);

  const open = data.predictions.filter((row) => !row.resolved);
  const closed = data.predictions.filter((row) => row.resolved);
  const ticker =
    [...open, ...closed].map((row) => row.title).join("   ·   ") ||
    "NO OPEN CONTRACTS   ·   PICK A BET";

  const promptRows = useMemo(
    () => (promptCat ? betPromptsIn(promptCat) : []),
    [promptCat]
  );
  const stakeRows = useMemo(
    () => (stakeCat ? betStakesIn(stakeCat) : []),
    [stakeCat]
  );

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
    setStakeCat(null);
    setView("stakes");
    setError(null);
  };

  const listContract = async (nextTitle: string, nextStake: string, nextKind: BetKind) => {
    if (!user) return;
    if (!nextTitle.trim()) {
      setError("Pick a bet first.");
      return;
    }
    if (!nextStake.trim()) {
      setError("Pick what the loser owes.");
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
          yesVoters: [user.id],
          noVoters: partner?.isDemo && partner.id ? [partner.id] : [],
          resolved: null,
          createdAt: nowIso(),
        },
        ...state.predictions,
      ],
    }));
    setTitle("");
    setStake("");
    setPickedPrompt(null);
    goHome();
  };

  const create = async () => {
    await listContract(title, stake || "Bragging rights", kind);
  };

  const vote = async (id: string, side: "yes" | "no") => {
    if (!user) return;
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) => {
        if (row.id !== id || row.resolved) return row;
        const yes = row.yesVoters.filter((v) => v !== user.id);
        const no = row.noVoters.filter((v) => v !== user.id);
        if (side === "yes") yes.push(user.id);
        else no.push(user.id);
        return { ...row, yesVoters: yes, noVoters: no };
      }),
    }));
  };

  const resolve = async (id: string, result: "yes" | "no") => {
    await patch((state) => ({
      ...state,
      predictions: state.predictions.map((row) =>
        row.id === id ? { ...row, resolved: result } : row
      ),
    }));
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/play" as Href} accent={GREEN}>
        <View style={{ backgroundColor: "#02100A", paddingVertical: 8, overflow: "hidden" }}>
          <Animated.Text
            style={{
              color: GREEN,
              fontFamily: "SpaceMono",
              fontSize: 12,
              width: 900,
              transform: [
                {
                  translateX: tape.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -420],
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
            onPress={() => {
              if (view === "prompt-list") setView("prompts");
              else if (view === "stake-list") setView("stakes");
              else if (view === "stakes") setView("prompts");
              else goHome();
            }}
            style={{ marginTop: 14, flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="chevron-back" size={18} color={GREEN} />
            <Text
              style={{
                marginLeft: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: GREEN,
              }}
            >
              BACK
            </Text>
          </Pressable>
        ) : null}

        {view === "home" ? (
          <View>
            <Text
              style={{
                marginTop: 14,
                fontFamily: "SpaceMono",
                fontSize: 12,
                color: GREEN,
              }}
            >
              DUOMA · FAVORS DESK
            </Text>
            <Text style={{ fontFamily: SERIF, fontSize: 36, color: GREEN, lineHeight: 40 }}>
              Prediction pit
            </Text>
            <Text style={{ marginTop: 6, color: MUTED, fontSize: 13, lineHeight: 20 }}>
              {BET_PROMPTS.length} bets. {BET_STAKES.length} stakes. {them} is the
              other side. Reality settles it.
            </Text>

            <View style={{ marginTop: 16, gap: 10 }}>
              <Door
                title="Pick a bet"
                detail="Everyday, AFL, TV, or a challenge"
                onPress={() => setView("prompts")}
              />
              <Door
                title="Write your own"
                detail="Name the future. Name the forfeit."
                onPress={() => {
                  setTitle("");
                  setStake("");
                  setKind("will");
                  setView("custom");
                }}
              />
              <Pressable
                onPress={() => {
                  const prompt = pickRandomPrompt();
                  const prize = pickRandomStake();
                  void listContract(prompt.text, prize.text, prompt.kind);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(57,255,154,0.28)",
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  backgroundColor: "#062016",
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 18, color: "#E8FFF4" }}>
                  Surprise us
                </Text>
                <Text style={{ marginTop: 3, fontSize: 13, color: MUTED }}>
                  Random prompt. Random stake. Listed.
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {view === "prompts" ? (
          <Catalog
            heading="Pick a bet"
            sub={`${BET_PROMPTS.length} prompts. Then you pick what the loser owes.`}
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
              "Bets"
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
            <Text style={{ marginTop: 12, fontFamily: "SpaceMono", fontSize: 11, color: GREEN }}>
              STAKE
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontSize: 24,
                lineHeight: 30,
                color: "#E8FFF4",
              }}
            >
              {pickedPrompt.text}
            </Text>
            <Text style={{ marginTop: 8, color: MUTED, fontSize: 14 }}>
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
                  <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#E8FFF4" }}>
                    {cat.label}
                  </Text>
                  <Text style={{ marginTop: 4, color: MUTED, fontSize: 13 }}>
                    {cat.detail} · {betStakesIn(cat.id).length}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() =>
                  void listContract(
                    pickedPrompt.text,
                    pickRandomStake().text,
                    pickedPrompt.kind
                  )
                }
                style={tile}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 18, color: GREEN }}>
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
              onPress: () =>
                void listContract(pickedPrompt.text, row.text, pickedPrompt.kind),
            }))}
          />
        ) : null}

        {view === "custom" ? (
          <View
            style={{
              marginTop: 16,
              borderWidth: 1,
              borderColor: GREEN,
              padding: 12,
              backgroundColor: "#062016",
            }}
          >
            <Text style={{ color: GREEN, fontFamily: "SpaceMono", fontSize: 10 }}>
              NEW CONTRACT
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="We'll use the nice plates"
              placeholderTextColor="rgba(57,255,154,0.3)"
              style={term}
            />
            <TextInput
              value={stake}
              onChangeText={setStake}
              placeholder="What the loser owes"
              placeholderTextColor="rgba(57,255,154,0.3)"
              style={term}
            />
            <Pressable
              onPress={() => void create()}
              style={{
                marginTop: 8,
                height: 42,
                backgroundColor: GREEN,
                justifyContent: "center",
              }}
            >
              <Text style={{ textAlign: "center", color: "#04140E", fontWeight: "900" }}>
                LIST IT
              </Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 6, color: RED }}>{error}</Text> : null}
          </View>
        ) : null}

        {view === "home" ? (
          <View style={{ marginTop: 16, gap: 12 }}>
            {!ready || open.length === 0 ? (
              <Text style={{ color: "rgba(57,255,154,0.4)", fontFamily: "SpaceMono" }}>
                // the pit is quiet. list something petty.
              </Text>
            ) : (
              open.map((row) => {
                const yes = row.yesVoters.length;
                const no = row.noVoters.length;
                const total = Math.max(1, yes + no);
                const who = row.kind === "who";
                return (
                  <View
                    key={row.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "rgba(57,255,154,0.35)",
                      padding: 12,
                      backgroundColor: "#062016",
                    }}
                  >
                    <Text style={{ fontFamily: "SpaceMono", color: GREEN, fontSize: 11 }}>
                      OPEN · STAKE {row.stake.toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: SERIF,
                        fontSize: 22,
                        color: "#E8FFF4",
                      }}
                    >
                      {row.title}
                    </Text>
                    <View style={{ marginTop: 10, height: 8, flexDirection: "row" }}>
                      <View
                        style={{ width: `${(yes / total) * 100}%`, backgroundColor: GREEN }}
                      />
                      <View
                        style={{ width: `${(no / total) * 100}%`, backgroundColor: RED }}
                      />
                    </View>
                    <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                      <Pressable onPress={() => void vote(row.id, "yes")} style={btn(GREEN)}>
                        <Text style={{ color: GREEN, fontFamily: "SpaceMono" }}>
                          {who ? `ME ${yes}` : `YES ${yes}`}
                        </Text>
                      </Pressable>
                      <Pressable onPress={() => void vote(row.id, "no")} style={btn(RED)}>
                        <Text style={{ color: RED, fontFamily: "SpaceMono" }}>
                          {who ? `THEM ${no}` : `NO ${no}`}
                        </Text>
                      </Pressable>
                    </View>
                    <View style={{ marginTop: 8, flexDirection: "row", gap: 16 }}>
                      <Pressable onPress={() => void resolve(row.id, "yes")}>
                        <Text style={{ color: GREEN, fontSize: 11 }}>
                          {who ? "SETTLE ME" : "SETTLE YES"}
                        </Text>
                      </Pressable>
                      <Pressable onPress={() => void resolve(row.id, "no")}>
                        <Text style={{ color: RED, fontSize: 11 }}>
                          {who ? "SETTLE THEM" : "SETTLE NO"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : null}

        {error && view !== "custom" ? (
          <Text style={{ marginTop: 12, color: RED }}>{error}</Text>
        ) : null}
      </Stage>
    </Screen>
  );
}

function Door({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={tile}>
      <Text style={{ fontFamily: SERIF, fontSize: 22, color: "#E8FFF4" }}>{title}</Text>
      <Text style={{ marginTop: 4, color: MUTED, fontSize: 13 }}>{detail}</Text>
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
      <Text style={{ marginTop: 12, fontFamily: SERIF, fontSize: 28, color: GREEN }}>
        {heading}
      </Text>
      <Text style={{ marginTop: 6, color: MUTED, fontSize: 14, lineHeight: 20 }}>{sub}</Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        {tiles.map((tileItem) => (
          <Pressable key={tileItem.id} onPress={tileItem.onPress} style={tile}>
            <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#E8FFF4" }}>
              {tileItem.label}
            </Text>
            <Text style={{ marginTop: 4, color: MUTED, fontSize: 13 }}>
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
      <Text style={{ marginTop: 12, fontFamily: SERIF, fontSize: 26, color: GREEN }}>
        {heading}
      </Text>
      <View style={{ marginTop: 12, gap: 8 }}>
        {rows.map((row) => (
          <Pressable
            key={row.id}
            onPress={row.onPress}
            style={{
              borderWidth: 1,
              borderColor: "rgba(57,255,154,0.28)",
              padding: 12,
              backgroundColor: "#062016",
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 22, color: "#E8FFF4" }}>
              {row.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const tile = {
  borderWidth: 1,
  borderColor: "rgba(57,255,154,0.35)",
  paddingVertical: 16,
  paddingHorizontal: 14,
  backgroundColor: "#062016",
} as const;

const term = {
  marginTop: 8,
  color: GREEN,
  fontFamily: "SpaceMono",
  borderBottomWidth: 1,
  borderBottomColor: "rgba(57,255,154,0.3)",
  paddingVertical: 6,
} as const;

function btn(color: string) {
  return {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: color,
  } as const;
}
