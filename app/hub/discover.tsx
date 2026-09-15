import { PlayTabs } from "@/components/hub/PlayTabs";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { DISCOVER_TONE, SERIF } from "@/lib/app-themes";
import {
  ALL_DISCOVER_CATEGORY_IDS,
  DISCOVER_FAMILIES,
  DISCOVER_QUESTION_COUNT,
  DISCOVER_QUESTIONS,
  discoverCategoryMeta,
  leftoverDiscover,
  normalizeEnabledCategories,
  seenDiscoverIds,
  vaultEntries,
  type DiscoverCategoryId,
  type DiscoverQuestion,
} from "@/lib/discover";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";

const T = DISCOVER_TONE;
const SWIPE_THRESHOLD = 110;
const SCREEN_W = Dimensions.get("window").width;
const CATS_KEY = "duoma:discover-cats-v2";

type Tab = "deck" | "vault" | "passed";
type LastMove = { type: "talk" | "skip"; questionId: string };

export default function DiscoverScreen() {
  const {
    user,
    partner,
    couple,
    curiosityAnswers,
    curiositySkips,
    submitDiscoverAnswer,
    skipDiscover,
    restoreDiscoverSkip,
    undoDiscover,
  } = useApp();

  const [tab, setTab] = useState<Tab>("deck");
  const [enabled, setEnabled] = useState<DiscoverCategoryId[]>([
    ...ALL_DISCOVER_CATEGORY_IDS,
  ]);
  const [catsOpen, setCatsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [restored, setRestored] = useState<DiscoverQuestion | null>(null);

  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    void AsyncStorage.getItem(CATS_KEY).then((raw) => {
      if (!raw) return;
      try {
        setEnabled(normalizeEnabledCategories(JSON.parse(raw)));
      } catch {
        // keep defaults
      }
    });
  }, []);

  const persistCats = (next: DiscoverCategoryId[]) => {
    const normalized = normalizeEnabledCategories(next);
    setEnabled(normalized);
    void AsyncStorage.setItem(CATS_KEY, JSON.stringify(normalized));
  };

  const seen = useMemo(
    () => seenDiscoverIds(curiosityAnswers, curiositySkips, user?.id),
    [curiosityAnswers, curiositySkips, user?.id]
  );

  const remaining = useMemo(
    () =>
      leftoverDiscover(
        seen,
        enabled,
        `${couple?.id ?? "solo"}:${user?.id ?? "anon"}`
      ),
    [couple?.id, enabled, seen, user?.id]
  );

  const current = restored ?? remaining[0] ?? null;
  const nextPeek = remaining.find((row) => row.id !== current?.id) ?? null;

  const vault = useMemo(
    () => vaultEntries(curiosityAnswers, user?.id, partner?.id),
    [curiosityAnswers, partner?.id, user?.id]
  );

  const mySkips = useMemo(() => {
    const ids = new Set(
      curiositySkips
        .filter((row) => row.userId === user?.id)
        .map((row) => row.questionId)
    );
    return DISCOVER_QUESTIONS.filter((row) => ids.has(row.id));
  }, [curiositySkips, user?.id]);

  const resetCard = () => pan.setValue({ x: 0, y: 0 });

  const commitSkip = async () => {
    if (!current || busy) return;
    const questionId = current.id;
    setBusy(true);
    setError(null);
    try {
      await skipDiscover(questionId);
      setLastMove({ type: "skip", questionId });
      setRestored(null);
      resetCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not skip");
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    } finally {
      setBusy(false);
    }
  };

  const commitTalk = async () => {
    if (!current || busy) return;
    const questionId = current.id;
    setBusy(true);
    setError(null);
    try {
      await submitDiscoverAnswer(questionId);
      setLastMove({ type: "talk", questionId });
      setRestored(null);
      resetCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    } finally {
      setBusy(false);
    }
  };

  const undoLast = async () => {
    if (!lastMove || busy) return;
    setBusy(true);
    setError(null);
    try {
      await undoDiscover(lastMove.questionId);
      const card = DISCOVER_QUESTIONS.find((row) => row.id === lastMove.questionId) ?? null;
      setRestored(card);
      setLastMove(null);
      resetCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not undo");
    } finally {
      setBusy(false);
    }
  };

  const flyOff = (talk: boolean) => {
    if (!current || busy) return;
    Animated.timing(pan, {
      toValue: { x: talk ? SCREEN_W * 1.2 : -SCREEN_W * 1.2, y: 40 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (talk) void commitTalk();
      else void commitSkip();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id, busy]
  );

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });
  const talkOpacity = pan.x.interpolate({
    inputRange: [20, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const skipOpacity = pan.x.interpolate({
    inputRange: [-120, -20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const partnerLabel = partner?.displayName ?? "your partner";
  const catalogCount = DISCOVER_QUESTION_COUNT;
  const onDeck = tab === "deck";
  const promptSize = current && current.prompt.length > 90 ? 18 : 20;

  return (
    <Screen scroll={!onDeck} background={T.background}>
      <View
        style={{
          flex: onDeck ? 1 : undefined,
          paddingBottom: onDeck ? 8 : 28,
          paddingTop: 4,
          minHeight: 0,
        }}
      >
        <BackButton color={T.accent} fallback="/hub/connect" />

        <Text
          style={{
            marginTop: 4,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Connect · Discover
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontSize: 26,
            lineHeight: 30,
            color: T.ink,
          }}
        >
          Swipe a question
        </Text>
        {onDeck ? (
          <Text
            style={{
              marginTop: 4,
              fontSize: 13,
              color: T.muted,
            }}
          >
            Right = talked about it. Left = skip.
          </Text>
        ) : (
          <Text
            style={{
              marginTop: 6,
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 22,
              color: T.muted,
            }}
          >
            Talked cards live in the vault — yours and {partnerLabel}’s, side by
            side.
          </Text>
        )}

        <View
          style={{
            marginTop: 12,
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
                id: "vault",
                label: vault.length ? `Vault · ${vault.length}` : "Vault",
              },
              {
                id: "passed",
                label: mySkips.length ? `Passed · ${mySkips.length}` : "Passed",
              },
            ]}
            current={tab}
            onChange={setTab}
            accent={T.accent}
            ink={T.ink}
          />
        </View>

        {error ? (
          <Text style={{ marginTop: 8, color: "#C45C7A", fontSize: 13 }}>
            {error}
          </Text>
        ) : null}

        {tab === "deck" ? (
          <View style={{ flex: 1, minHeight: 0, marginTop: 8 }}>
            <Pressable
              onPress={() => setCatsOpen(true)}
              style={{
                alignSelf: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: T.accentSoft,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text style={{ color: T.ink, fontWeight: "700", fontSize: 12 }}>
                Categories · {enabled.length} on
              </Text>
            </Pressable>

            <Text
              style={{
                marginTop: 8,
                marginBottom: 8,
                fontSize: 12,
                color: T.muted,
                textAlign: "center",
              }}
            >
              {remaining.length
                ? `${remaining.length} left · ${catalogCount} in the deck`
                : seen.length
                  ? "Nothing left in these categories"
                  : `${catalogCount} questions ready`}
            </Text>

            <View
              style={{
                flex: 1,
                minHeight: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {nextPeek ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    width: "100%",
                    maxWidth: 340,
                    height: "92%",
                    maxHeight: 240,
                    borderRadius: 22,
                    backgroundColor: T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: T.border,
                    transform: [{ scale: 0.96 }, { translateY: 10 }],
                    opacity: 0.7,
                  }}
                />
              ) : null}

              {current ? (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={{
                    width: "100%",
                    maxWidth: 340,
                    height: "92%",
                    maxHeight: 240,
                    borderRadius: 22,
                    backgroundColor: T.surface,
                    borderWidth: 1,
                    borderColor: T.border,
                    padding: 16,
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { rotate },
                    ],
                    shadowColor: "#C084D4",
                    shadowOpacity: 0.18,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 8 },
                  }}
                >
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      opacity: talkOpacity,
                      borderWidth: 3,
                      borderColor: T.talk,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      transform: [{ rotate: "-12deg" }],
                    }}
                  >
                    <Text
                      style={{
                        color: T.talk,
                        fontWeight: "800",
                        letterSpacing: 2,
                      }}
                    >
                      TALK
                    </Text>
                  </Animated.View>
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      opacity: skipOpacity,
                      borderWidth: 3,
                      borderColor: T.skip,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      transform: [{ rotate: "12deg" }],
                    }}
                  >
                    <Text
                      style={{
                        color: T.skip,
                        fontWeight: "800",
                        letterSpacing: 2,
                      }}
                    >
                      SKIP
                    </Text>
                  </Animated.View>

                  <View
                    style={{
                      alignSelf: "flex-start",
                      borderRadius: 999,
                      backgroundColor: `${discoverCategoryMeta(current.category).tint}55`,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: T.ink,
                        fontSize: 11,
                        fontWeight: "700",
                        letterSpacing: 0.6,
                      }}
                    >
                      {discoverCategoryMeta(current.category).label}
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 12,
                      fontFamily: SERIF,
                      fontSize: promptSize,
                      lineHeight: promptSize + 6,
                      color: T.ink,
                    }}
                  >
                    {current.prompt}
                  </Text>
                </Animated.View>
              ) : (
                <View
                  style={{
                    width: "100%",
                    maxWidth: 340,
                    maxHeight: 240,
                    flex: 1,
                    borderRadius: 22,
                    backgroundColor: T.surface,
                    borderWidth: 1,
                    borderColor: T.border,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 22,
                  }}
                >
                  <Ionicons name="sparkles" size={36} color={T.accent} />
                  <Text
                    style={{
                      marginTop: 12,
                      fontFamily: SERIF,
                      fontSize: 22,
                      color: T.ink,
                      textAlign: "center",
                    }}
                  >
                    Deck’s quiet
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      lineHeight: 20,
                      color: T.muted,
                      textAlign: "center",
                    }}
                  >
                    Toggle more categories, or restore a few from Passed.
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <RoundButton
                icon="close"
                color={T.skip}
                onPress={() => flyOff(false)}
                disabled={!current || busy}
                label="Skip"
              />
              <RoundButton
                icon="chatbubbles"
                color={T.talk}
                onPress={() => flyOff(true)}
                disabled={!current || busy}
                label="Talked"
              />
            </View>
            <Pressable
              onPress={() => void undoLast()}
              disabled={!lastMove || busy}
              style={{
                alignSelf: "center",
                marginTop: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
                opacity: lastMove && !busy ? 1 : 0.35,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: T.muted,
                }}
              >
                Undo
              </Text>
            </Pressable>
          </View>
        ) : null}

        {tab === "vault" ? (
          <View style={{ marginTop: 8, gap: 10 }}>
            {vault.length === 0 ? (
              <Text
                style={{
                  marginTop: 24,
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: T.muted,
                  textAlign: "center",
                  lineHeight: 26,
                }}
              >
                The vault is empty. Swipe right when you’ve talked a card
                through — it lands here, no writing.
              </Text>
            ) : (
              vault.map((row) => (
                <View
                  key={row.question.id}
                  style={{
                    backgroundColor: T.surface,
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: T.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: discoverCategoryMeta(row.question.category).tint,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    {discoverCategoryMeta(row.question.category).label}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      fontFamily: SERIF,
                      fontSize: 18,
                      lineHeight: 24,
                      color: T.ink,
                    }}
                  >
                    {row.question.prompt}
                  </Text>
                  <AnswerBlock
                    who="You"
                    body={talkLabel(row.mine?.body)}
                    waiting="You haven’t talked this one yet."
                  />
                  <AnswerBlock
                    who={partnerLabel}
                    body={talkLabel(row.theirs?.body)}
                    waiting={`${partnerLabel} hasn’t talked this one yet.`}
                  />
                </View>
              ))
            )}
          </View>
        ) : null}

        {tab === "passed" ? (
          <View style={{ marginTop: 8, gap: 8 }}>
            {mySkips.length === 0 ? (
              <Text
                style={{
                  marginTop: 24,
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: T.muted,
                  textAlign: "center",
                }}
              >
                No skipped cards. Left-swipe when a question isn’t for tonight.
              </Text>
            ) : (
              mySkips.map((row) => (
                <View
                  key={row.id}
                  style={{
                    backgroundColor: T.surface,
                    borderRadius: 18,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: T.border,
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: T.muted,
                      }}
                    >
                      {discoverCategoryMeta(row.category).label}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        color: T.ink,
                        fontSize: 15,
                        lineHeight: 21,
                      }}
                    >
                      {row.prompt}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => void restoreDiscoverSkip(row.id)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: T.accentSoft,
                    }}
                  >
                    <Text style={{ color: T.ink, fontWeight: "700", fontSize: 12 }}>
                      Restore
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        ) : null}
      </View>

      {catsOpen ? (
        <SheetOverlay
          kicker="FILTERS"
          title="Toggle categories"
          onClose={() => setCatsOpen(false)}
          background={T.surface}
          ink={T.ink}
          muted={T.muted}
        >
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <Chip
              label="All on"
              on={enabled.length === ALL_DISCOVER_CATEGORY_IDS.length}
              onPress={() => persistCats([...ALL_DISCOVER_CATEGORY_IDS])}
            />
            <Chip
              label="All off"
              on={false}
              onPress={() => persistCats([ALL_DISCOVER_CATEGORY_IDS[0]!])}
            />
          </View>
          {DISCOVER_FAMILIES.map((family) => (
            <View key={family.id} style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.4,
                  color: T.muted,
                  marginBottom: 8,
                }}
              >
                {family.label.toUpperCase()}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {family.categories.map((id) => {
                  const meta = discoverCategoryMeta(id);
                  const on = enabled.includes(id);
                  return (
                    <Chip
                      key={id}
                      label={meta.label.replace(/^Have you · |^Last time · /, "")}
                      on={on}
                      tint={meta.tint}
                      onPress={() => {
                        const next = on
                          ? enabled.filter((item) => item !== id)
                          : [...enabled, id];
                        persistCats(next);
                      }}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </SheetOverlay>
      ) : null}
    </Screen>
  );
}

function talkLabel(body: string | null | undefined): string | null {
  if (body == null) return null;
  const trimmed = body.trim();
  return trimmed || "Talked about it.";
}

function RoundButton({
  icon,
  color,
  onPress,
  disabled,
  label,
}: {
  icon: "close" | "chatbubbles";
  color: string;
  onPress: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#FFFBFE",
        borderWidth: 1.5,
        borderColor: color,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

function Chip({
  label,
  on,
  onPress,
  tint,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: on ? tint ?? T.accentSoft : "rgba(61,46,74,0.06)",
        borderWidth: 1,
        borderColor: on ? T.accent : "rgba(61,46,74,0.12)",
      }}
    >
      <Text
        style={{
          color: T.ink,
          fontWeight: "700",
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AnswerBlock({
  who,
  body,
  waiting,
}: {
  who: string;
  body: string | null;
  waiting: string;
}) {
  return (
    <View
      style={{
        marginTop: 12,
        borderRadius: 14,
        backgroundColor: "#F4EEF8",
        padding: 12,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.2,
          color: T.muted,
        }}
      >
        {who.toUpperCase()}
      </Text>
      <Text
        style={{
          marginTop: 4,
          color: body ? T.ink : T.dim,
          fontSize: 15,
          lineHeight: 21,
          fontFamily: body ? SERIF : undefined,
        }}
      >
        {body ?? waiting}
      </Text>
    </View>
  );
}
