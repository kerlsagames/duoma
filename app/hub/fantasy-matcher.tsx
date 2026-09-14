import { PlayTabs } from "@/components/hub/PlayTabs";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { POSITIONS_TONE, SERIF } from "@/lib/app-themes";
import {
  FANTASY_IDEAS,
  fantasyById,
  fantasyCategoryMeta,
  groupFantasiesByCategory,
  leftoverFantasies,
  incomingTonightAsks,
  personalizeFantasyTitle,
  tonightAskForFantasy,
  type FantasyCategoryId,
  type FantasyIdea,
} from "@/lib/fantasy-matcher";
import type { FantasyTonightAsk } from "@/lib/types";
import { roleplayCastNames } from "@/lib/roleplays";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";

const T = POSITIONS_TONE;
const SWIPE_THRESHOLD = 110;
const SCREEN_W = Dimensions.get("window").width;

type Tab = "deck" | "todo" | "done" | "passed";

export default function FantasyMatcherScreen() {
  const {
    user,
    partner,
    couple,
    fantasySwipes,
    fantasyTonightAsks,
    fantasyCompletions,
    swipeFantasy,
    askFantasyTonight,
    respondFantasyTonight,
    completeFantasyMatch,
    reopenFantasyMatch,
  } = useApp();
  const cast = useMemo(
    () => roleplayCastNames(user, partner),
    [user, partner]
  );
  const nameTitle = (idea: FantasyIdea) => personalizeFantasyTitle(idea.title, cast);
  const [tab, setTab] = useState<Tab>("deck");
  const [matchCategory, setMatchCategory] = useState<FantasyCategoryId | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [matchFlash, setMatchFlash] = useState<FantasyIdea | null>(null);
  const [pickedMatch, setPickedMatch] = useState<FantasyIdea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passedWho, setPassedWho] = useState<"you" | "partner">("you");

  const pan = useRef(new Animated.ValueXY()).current;

  const mySwipes = useMemo(
    () => fantasySwipes.filter((row) => row.userId === user?.id),
    [fantasySwipes, user?.id]
  );
  const partnerSwipes = useMemo(
    () => fantasySwipes.filter((row) => row.userId === partner?.id),
    [fantasySwipes, partner?.id]
  );

  const remaining = useMemo(
    () =>
      leftoverFantasies(
        mySwipes.map((row) => row.fantasyId),
        `${couple?.id ?? "solo"}:${user?.id ?? "anon"}`
      ),
    [couple?.id, mySwipes, user?.id]
  );
  const seenCount = mySwipes.length;
  const catalogCount = FANTASY_IDEAS.length;

  const current = remaining[0] ?? null;
  const nextPeek = remaining[1] ?? null;

  const matches = useMemo(() => {
    if (!user || !partner) return [] as FantasyIdea[];
    const myLikes = new Set(
      mySwipes.filter((row) => row.liked).map((row) => row.fantasyId)
    );
    const theirLikes = new Set(
      partnerSwipes.filter((row) => row.liked).map((row) => row.fantasyId)
    );
    return FANTASY_IDEAS.filter(
      (idea) => myLikes.has(idea.id) && theirLikes.has(idea.id)
    );
  }, [mySwipes, partner, partnerSwipes, user]);

  const matchGroups = useMemo(
    () => groupFantasiesByCategory(matches),
    [matches]
  );

  const doneIds = useMemo(
    () => new Set(fantasyCompletions.map((row) => row.fantasyId)),
    [fantasyCompletions]
  );
  const todoMatches = useMemo(
    () => matches.filter((idea) => !doneIds.has(idea.id)),
    [doneIds, matches]
  );
  const doneMatches = useMemo(
    () => matches.filter((idea) => doneIds.has(idea.id)),
    [doneIds, matches]
  );
  const todoGroups = useMemo(
    () => groupFantasiesByCategory(todoMatches),
    [todoMatches]
  );
  const doneGroups = useMemo(
    () => groupFantasiesByCategory(doneMatches),
    [doneMatches]
  );
  const myPasses = useMemo(() => {
    const ids = new Set(
      mySwipes.filter((row) => !row.liked).map((row) => row.fantasyId)
    );
    return FANTASY_IDEAS.filter((idea) => ids.has(idea.id));
  }, [mySwipes]);
  const partnerPasses = useMemo(() => {
    const ids = new Set(
      partnerSwipes.filter((row) => !row.liked).map((row) => row.fantasyId)
    );
    return FANTASY_IDEAS.filter((idea) => ids.has(idea.id));
  }, [partnerSwipes]);
  const passedList = passedWho === "you" ? myPasses : partnerPasses;
  const passedGroups = useMemo(
    () => groupFantasiesByCategory(passedList),
    [passedList]
  );
  const incomingAsks = useMemo(
    () => (user ? incomingTonightAsks(fantasyTonightAsks, user.id) : []),
    [fantasyTonightAsks, user]
  );
  const pickedAsk = pickedMatch
    ? tonightAskForFantasy(fantasyTonightAsks, pickedMatch.id)
    : null;

  const sendTonight = async (idea: FantasyIdea) => {
    setError(null);
    setBusy(true);
    try {
      await askFantasyTonight(idea.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that.");
    } finally {
      setBusy(false);
    }
  };

  const answerTonight = async (
    ask: FantasyTonightAsk,
    status: "accepted" | "declined"
  ) => {
    setError(null);
    setBusy(true);
    try {
      await respondFantasyTonight(ask.id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not answer.");
    } finally {
      setBusy(false);
    }
  };
  const activeGroups =
    tab === "done" ? doneGroups : tab === "passed" ? passedGroups : todoGroups;
  const openMatchGroup = matchCategory
    ? activeGroups.find((row) => row.category.id === matchCategory) ?? null
    : null;

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
  };

  const commitSwipe = async (liked: boolean) => {
    if (!current || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await swipeFantasy(current.id, liked);
      if (result.matched) {
        setMatchFlash(current);
      }
      resetCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save swipe");
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    } finally {
      setBusy(false);
    }
  };

  const flyOff = (liked: boolean) => {
    if (!current || busy) return;
    Animated.timing(pan, {
      toValue: { x: liked ? SCREEN_W * 1.2 : -SCREEN_W * 1.2, y: 40 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      void commitSwipe(liked);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            flyOff(true);
            return;
          }
          if (gesture.dx < -SWIPE_THRESHOLD) {
            flyOff(false);
            return;
          }
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: true,
          }).start();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pan + handlers stable enough for deck
    [current?.id, busy]
  );

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [20, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = pan.x.interpolate({
    inputRange: [-120, -20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const partnerLabel = partner?.displayName ?? "your partner";

  return (
    <Screen scroll background={T.background}>
      <View className="pb-10 pt-4">
        <BackButton color={T.accent} fallback="/hub/desire" />

        <Text
          style={{
            marginTop: 8,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Desire · Fantasy Matcher
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 32,
            lineHeight: 38,
            color: T.ink,
          }}
        >
          Swipe what you’d do
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
          Short fantasies, not whole scenes. Right = yes. Left = pass.
          Mutual yeses land on To-do. Passed shows yours and {partnerLabel}'s
          nos.
        </Text>

        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            borderRadius: 16,
            backgroundColor: T.surface,
            padding: 4,
            borderWidth: 1,
            borderColor: T.border,
          }}
        >
          <PlayTabs
            tabs={[
              { id: "deck", label: "Deck" },
              {
                id: "todo",
                label: todoMatches.length
                  ? `To-do · ${todoMatches.length}`
                  : "To-do",
              },
              { id: "done", label: "Completed" },
              { id: "passed", label: "Passed" },
            ]}
            current={tab}
            onChange={(next) => {
              setTab(next);
              setMatchCategory(null);
            }}
            accent={T.accent}
            ink={T.ink}
          />
        </View>

        {incomingAsks.length ? (
          <View style={{ marginTop: 16, gap: 10 }}>
            {incomingAsks.map((ask) => {
              const idea = fantasyById(ask.fantasyId);
              if (!idea) return null;
              return (
                <View
                  key={ask.id}
                  style={{
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: T.accent,
                    backgroundColor: T.surface,
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: T.accent,
                    }}
                  >
                    {partnerLabel} · try this tonight?
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      fontFamily: SERIF,
                      fontSize: 22,
                      lineHeight: 28,
                      color: T.ink,
                    }}
                  >
                    {nameTitle(idea)}
                  </Text>
                  <View style={{ marginTop: 14, gap: 8 }}>
                    <PrimaryButton
                      label="Yes — tonight"
                      disabled={busy}
                      onPress={() => void answerTonight(ask, "accepted")}
                    />
                    <PrimaryButton
                      label="Not tonight"
                      tone="ghost"
                      disabled={busy}
                      onPress={() => void answerTonight(ask, "declined")}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {tab === "deck" ? (
          <View style={{ marginTop: 22 }}>
            <Text
              style={{
                marginBottom: 12,
                fontSize: 12,
                color: T.muted,
                textAlign: "center",
              }}
            >
              {remaining.length
                ? `${remaining.length} left in your deck · ${catalogCount} short fantasies`
                : seenCount
                  ? `You swiped ${seenCount} of ${catalogCount} — check your matches`
                  : `${catalogCount} short fantasies ready when you are`}
            </Text>

            <View style={{ height: 420, alignItems: "center" }}>
              {nextPeek ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: "100%",
                    maxWidth: 360,
                    height: 360,
                    borderRadius: 28,
                    backgroundColor: T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: T.border,
                    transform: [{ scale: 0.96 }, { translateY: 14 }],
                    opacity: 0.7,
                  }}
                />
              ) : null}

              {current ? (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={{
                    width: "100%",
                    maxWidth: 360,
                    height: 360,
                    borderRadius: 28,
                    backgroundColor: T.surface,
                    borderWidth: 1,
                    borderColor: T.border,
                    padding: 22,
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { rotate },
                    ],
                    shadowColor: "#000",
                    shadowOpacity: 0.35,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 10 },
                  }}
                >
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 22,
                      left: 22,
                      opacity: likeOpacity,
                      borderWidth: 3,
                      borderColor: "#4ADE80",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      transform: [{ rotate: "-12deg" }],
                    }}
                  >
                    <Text
                      style={{
                        color: "#4ADE80",
                        fontWeight: "800",
                        letterSpacing: 2,
                      }}
                    >
                      YES
                    </Text>
                  </Animated.View>
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 22,
                      right: 22,
                      opacity: nopeOpacity,
                      borderWidth: 3,
                      borderColor: "#FB7185",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      transform: [{ rotate: "12deg" }],
                    }}
                  >
                    <Text
                      style={{
                        color: "#FB7185",
                        fontWeight: "800",
                        letterSpacing: 2,
                      }}
                    >
                      NOPE
                    </Text>
                  </Animated.View>

                  <View
                    style={{
                      alignSelf: "flex-start",
                      borderRadius: 999,
                      backgroundColor: fantasyCategoryMeta(current.category)
                        .tint + "33",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: fantasyCategoryMeta(current.category).tint,
                        fontSize: 11,
                        fontWeight: "700",
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                      }}
                    >
                      {fantasyCategoryMeta(current.category).label}
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 28,
                      fontFamily: SERIF,
                      fontSize: 36,
                      lineHeight: 42,
                      color: T.ink,
                    }}
                  >
                    {nameTitle(current)}
                  </Text>
                  <Text
                    style={{
                      marginTop: "auto",
                      fontSize: 12,
                      color: T.muted,
                    }}
                  >
                    Swipe or tap below
                  </Text>
                </Animated.View>
              ) : (
                <View
                  style={{
                    width: "100%",
                    maxWidth: 360,
                    height: 360,
                    borderRadius: 28,
                    backgroundColor: T.surface,
                    borderWidth: 1,
                    borderColor: T.border,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 28,
                  }}
                >
                  <Ionicons name="heart" size={42} color={T.accent} />
                  <Text
                    style={{
                      marginTop: 16,
                      fontFamily: SERIF,
                      fontSize: 24,
                      color: T.ink,
                      textAlign: "center",
                    }}
                  >
                    {remaining.length
                      ? "Keep going"
                      : "You’re caught up"}
                  </Text>
                  <Text
                    style={{
                      marginTop: 10,
                      fontFamily: SERIF,
                      fontSize: 15,
                      lineHeight: 22,
                      color: T.muted,
                      textAlign: "center",
                    }}
                  >
                    {remaining.length
                      ? `${remaining.length} scenario${
                          remaining.length === 1 ? "" : "s"
                        } still waiting in the deck.`
                      : matches.length
                        ? `You have ${todoMatches.length} on to-do. Open To-do to browse them.`
                        : `Every scenario is swiped. When new ones land, they’ll show up here — or wait for ${partnerLabel} to catch up.`}
                  </Text>
                  {matches.length ? (
                    <Pressable
                      onPress={() => setTab("todo")}
                      style={{
                        marginTop: 18,
                        borderRadius: 999,
                        backgroundColor: T.accent,
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "700", color: "#1A0508" }}>
                        Open to-do
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>

            {current ? (
              <View
                style={{
                  marginTop: 8,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 28,
                  alignItems: "center",
                }}
              >
                <Pressable
                  disabled={busy}
                  onPress={() => flyOff(false)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: "#FB7185",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: busy ? 0.5 : 1,
                  }}
                >
                  <Ionicons name="close" size={30} color="#FB7185" />
                </Pressable>
                <Pressable
                  disabled={busy}
                  onPress={() => flyOff(true)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: T.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: busy ? 0.5 : 1,
                  }}
                >
                  <Ionicons name="heart" size={30} color="#1A0508" />
                </Pressable>
              </View>
            ) : null}

            {error ? (
              <Text
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  color: "#FB7185",
                  fontSize: 13,
                }}
              >
                {error}
              </Text>
            ) : null}
          </View>
        ) : tab === "passed" ? (
          <View style={{ marginTop: 18, gap: 12 }}>
            {!partner ? (
              <Text style={{ color: T.muted, fontFamily: SERIF, fontSize: 15 }}>
                Pair up to compare passes.
              </Text>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    borderRadius: 14,
                    backgroundColor: T.surface,
                    padding: 4,
                    borderWidth: 1,
                    borderColor: T.border,
                  }}
                >
                  {(
                    [
                      { id: "you" as const, label: "You" },
                      {
                        id: "partner" as const,
                        label: partnerLabel,
                      },
                    ] as const
                  ).map((item) => {
                    const on = passedWho === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setPassedWho(item.id)}
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          paddingVertical: 10,
                          alignItems: "center",
                          backgroundColor: on ? T.accent : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: on ? "#1A0508" : T.muted,
                          }}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    lineHeight: 20,
                    color: T.muted,
                  }}
                >
                  {passedWho === "you"
                    ? "Fantasies you swiped left on."
                    : `Fantasies ${partnerLabel} swiped left on.`}
                </Text>
                {passedList.length === 0 ? (
                  <View
                    style={{
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: T.border,
                      backgroundColor: T.surface,
                      padding: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: SERIF,
                        fontSize: 20,
                        color: T.ink,
                      }}
                    >
                      No passes yet
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
                      {passedWho === "you"
                        ? "When you swipe left, those cards land here."
                        : `When ${partnerLabel} passes, their nos show up here.`}
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    {passedGroups.map(({ category, items }) => (
                      <View key={category.id} style={{ gap: 8 }}>
                        <Text
                          style={{
                            fontFamily: "SpaceMono",
                            fontSize: 11,
                            letterSpacing: 1.6,
                            textTransform: "uppercase",
                            color: category.tint,
                          }}
                        >
                          {category.label} · {items.length}
                        </Text>
                        {items.map((idea) => (
                          <View
                            key={idea.id}
                            style={{
                              borderRadius: 18,
                              borderWidth: 1,
                              borderColor: T.border,
                              backgroundColor: T.surface,
                              padding: 16,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: SERIF,
                                fontSize: 20,
                                color: T.ink,
                              }}
                            >
                              {nameTitle(idea)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={{ marginTop: 22, gap: 12 }}>
            {!partner ? (
              <Text style={{ color: T.muted, fontFamily: SERIF, fontSize: 15 }}>
                Pair with a partner to start matching.
              </Text>
            ) : (tab === "todo" ? todoMatches : doneMatches).length === 0 ? (
              <View
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: T.border,
                  backgroundColor: T.surface,
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 20,
                    color: T.ink,
                  }}
                >
                  {tab === "todo" ? "To-do is empty" : "Nothing completed yet"}
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
                  {tab === "todo"
                    ? `Mutual yeses with ${partnerLabel} land here until you mark them done.`
                    : "Tick something off To-do after you try it."}
                </Text>
                <PrimaryButton
                  label="Back to deck"
                  tone="ghost"
                  onPress={() => setTab("deck")}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : openMatchGroup ? (
              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={() => setMatchCategory(null)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    alignSelf: "flex-start",
                    paddingVertical: 4,
                  }}
                >
                  <Ionicons name="chevron-back" size={18} color={T.accent} />
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: T.accent,
                    }}
                  >
                    All categories
                  </Text>
                </Pressable>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: openMatchGroup.category.tint + "33",
                    }}
                  >
                    <Ionicons
                      name={openMatchGroup.category.icon}
                      size={22}
                      color={openMatchGroup.category.tint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: SERIF,
                        fontSize: 26,
                        color: T.ink,
                      }}
                    >
                      {openMatchGroup.category.label}
                    </Text>
                    <Text
                      style={{
                        marginTop: 2,
                        fontFamily: SERIF,
                        fontSize: 14,
                        color: T.muted,
                      }}
                    >
                      {openMatchGroup.items.length}{" "}
                      {tab === "todo" ? "to try" : "done"}
                    </Text>
                  </View>
                </View>
                {openMatchGroup.items.map((idea) => (
                  <MatchCard
                    key={idea.id}
                    idea={idea}
                    title={nameTitle(idea)}
                    ask={
                      tab === "todo"
                        ? tonightAskForFantasy(fantasyTonightAsks, idea.id)
                        : null
                    }
                    userId={user?.id ?? ""}
                    mode={tab === "todo" ? "todo" : "done"}
                    busy={busy}
                    onPress={() => setPickedMatch(idea)}
                    onMarkDone={() => void completeFantasyMatch(idea.id)}
                    onReopen={() => void reopenFantasyMatch(idea.id)}
                  />
                ))}
              </View>
            ) : (
              <View>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 15,
                    lineHeight: 22,
                    color: T.muted,
                    marginBottom: 14,
                  }}
                >
                  {tab === "todo"
                    ? "Open a category, then send Try this tonight? or mark one done."
                    : "Fantasies you already tried."}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  {activeGroups.map(({ category, items }) => (
                    <Pressable
                      key={category.id}
                      onPress={() => setMatchCategory(category.id)}
                      style={{
                        width: "48%",
                        marginBottom: 12,
                        borderRadius: 22,
                        borderWidth: 1,
                        borderColor: T.border,
                        backgroundColor: T.surface,
                        paddingVertical: 18,
                        paddingHorizontal: 14,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: category.tint + "33",
                        }}
                      >
                        <Ionicons
                          name={category.icon}
                          size={22}
                          color={category.tint}
                        />
                      </View>
                      <Text
                        style={{
                          marginTop: 12,
                          fontFamily: SERIF,
                          fontSize: 18,
                          color: T.ink,
                        }}
                      >
                        {category.label}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: T.muted,
                        }}
                      >
                        {items.length}{" "}
                        {tab === "todo" ? "to try" : "done"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {pickedMatch ? (
        <Pressable
          onPress={() => setPickedMatch(null)}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(8,4,10,0.88)",
            alignItems: "center",
            justifyContent: "center",
            padding: 28,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            style={{
              width: "100%",
              maxWidth: 340,
              borderRadius: 24,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: fantasyCategoryMeta(pickedMatch.category).tint,
              }}
            >
              {fantasyCategoryMeta(pickedMatch.category).label}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 28,
                lineHeight: 34,
                color: T.ink,
              }}
            >
              {nameTitle(pickedMatch)}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 22,
                color: T.muted,
              }}
            >
              {tonightAskCopy(pickedAsk, user?.id ?? "", partnerLabel)}
            </Text>
            {pickedAsk?.status === "offered" &&
            pickedAsk.toUserId === user?.id ? (
              <View style={{ marginTop: 18, gap: 8 }}>
                <PrimaryButton
                  label="Yes — tonight"
                  disabled={busy}
                  onPress={() => void answerTonight(pickedAsk, "accepted")}
                />
                <PrimaryButton
                  label="Not tonight"
                  tone="ghost"
                  disabled={busy}
                  onPress={() => void answerTonight(pickedAsk, "declined")}
                />
              </View>
            ) : !pickedAsk || pickedAsk.status === "declined" ? (
              <View style={{ marginTop: 18 }}>
                <PrimaryButton
                  label="Try this tonight?"
                  disabled={busy || !partner}
                  onPress={() => void sendTonight(pickedMatch)}
                />
              </View>
            ) : null}
            <PrimaryButton
              label="Close"
              tone="ghost"
              onPress={() => setPickedMatch(null)}
              style={{ marginTop: 8 }}
            />
          </Pressable>
        </Pressable>
      ) : null}

      {matchFlash ? (
        <Pressable
          onPress={() => setMatchFlash(null)}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(8,4,10,0.88)",
            alignItems: "center",
            justifyContent: "center",
            padding: 28,
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              letterSpacing: 3,
              color: T.accent,
              fontSize: 12,
            }}
          >
            IT’S A
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 52,
              color: T.ink,
            }}
          >
            Match!
          </Text>
          <Text
            style={{
              marginTop: 14,
              fontFamily: SERIF,
              fontSize: 22,
              color: T.accent,
              textAlign: "center",
            }}
          >
            {nameTitle(matchFlash)}
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 22,
              color: T.muted,
              textAlign: "center",
            }}
          >
            You and {partnerLabel} both said yes.
          </Text>
          <View style={{ marginTop: 24, width: "100%", maxWidth: 280, gap: 10 }}>
            <PrimaryButton
              label="See matches"
              onPress={() => {
                const category = matchFlash.category;
                setMatchFlash(null);
                setTab("todo");
                setMatchCategory(category);
              }}
            />
            <PrimaryButton
              label="Keep swiping"
              tone="ghost"
              onPress={() => setMatchFlash(null)}
            />
          </View>
        </Pressable>
      ) : null}
    </Screen>
  );
}

function tonightAskCopy(
  ask: FantasyTonightAsk | null,
  userId: string,
  partnerLabel: string
): string {
  if (!ask) {
    return `Send ${partnerLabel} “Try this tonight?” They answer yes or no when they open the app.`;
  }
  if (ask.status === "offered" && ask.fromUserId === userId) {
    return `Sent. Waiting on ${partnerLabel} to say yes or not tonight.`;
  }
  if (ask.status === "offered") {
    return `${partnerLabel} asked. Yes means it’s on tonight. No means not tonight.`;
  }
  if (ask.status === "accepted") {
    return `It’s a go. ${partnerLabel} said yes — tonight’s on.`;
  }
  return ask.fromUserId === userId
    ? `${partnerLabel} said not tonight.`
    : `You said not tonight.`;
}

function MatchCard({
  idea,
  title,
  ask,
  userId,
  mode,
  busy,
  onPress,
  onMarkDone,
  onReopen,
}: {
  idea: FantasyIdea;
  title: string;
  ask: FantasyTonightAsk | null;
  userId: string;
  mode: "todo" | "done";
  busy?: boolean;
  onPress: () => void;
  onMarkDone?: () => void;
  onReopen?: () => void;
}) {
  const cat = fantasyCategoryMeta(idea.category);
  const chip =
    mode === "done"
      ? "Done"
      : ask?.status === "accepted"
        ? "Tonight's on"
        : ask?.status === "declined"
          ? "Not tonight"
          : ask?.status === "offered" && ask.fromUserId === userId
            ? "Waiting"
            : ask?.status === "offered"
              ? "They asked"
              : "Ask";
  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor:
          ask?.status === "accepted"
            ? T.accent
            : ask?.status === "offered"
              ? "rgba(255,255,255,0.22)"
              : T.border,
        backgroundColor: T.surface,
        padding: 18,
      }}
    >
      <Pressable onPress={onPress}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              borderRadius: 999,
              backgroundColor: cat.tint + "33",
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                color: cat.tint,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {cat.label}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons
              name={
                mode === "done"
                  ? "checkmark-circle"
                  : ask?.status === "accepted"
                    ? "moon"
                    : ask?.status === "offered"
                      ? "time-outline"
                      : "heart"
              }
              size={14}
              color={T.accent}
            />
            <Text
              style={{
                color: T.accent,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {chip}
            </Text>
          </View>
        </View>
        <Text
          style={{
            marginTop: 12,
            fontFamily: SERIF,
            fontSize: 24,
            color: T.ink,
          }}
        >
          {title}
        </Text>
      </Pressable>
      {mode === "todo" ? (
        <View style={{ marginTop: 14, gap: 8 }}>
          <PrimaryButton
            label="Try this tonight?"
            onPress={onPress}
            disabled={busy}
          />
          <PrimaryButton
            label="Mark done"
            tone="ghost"
            onPress={onMarkDone}
            disabled={busy}
          />
        </View>
      ) : (
        <View style={{ marginTop: 14 }}>
          <PrimaryButton
            label="Back to to-do"
            tone="ghost"
            onPress={onReopen}
            disabled={busy}
          />
        </View>
      )}
    </View>
  );
}
