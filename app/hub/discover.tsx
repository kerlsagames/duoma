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
  TextInput,
  View,
} from "react-native";

const T = DISCOVER_TONE;
const SWIPE_THRESHOLD = 110;
const SCREEN_W = Dimensions.get("window").width;
const CATS_KEY = "duoma:discover-cats-v2";

type Tab = "deck" | "vault" | "passed";

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
  } = useApp();

  const [tab, setTab] = useState<Tab>("deck");
  const [enabled, setEnabled] = useState<DiscoverCategoryId[]>([
    ...ALL_DISCOVER_CATEGORY_IDS,
  ]);
  const [catsOpen, setCatsOpen] = useState(false);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const current = remaining[0] ?? null;
  const nextPeek = remaining[1] ?? null;

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
    setBusy(true);
    setError(null);
    try {
      await skipDiscover(current.id);
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

  const flyOff = (talk: boolean) => {
    if (!current || busy) return;
    Animated.timing(pan, {
      toValue: { x: talk ? SCREEN_W * 1.2 : -SCREEN_W * 1.2, y: 40 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (talk) {
        resetCard();
        setDraft("");
        setAnswerOpen(true);
      } else {
        void commitSkip();
      }
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

  const saveAnswer = async () => {
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      await submitDiscoverAnswer(current.id, draft);
      setAnswerOpen(false);
      setDraft("");
      resetCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const partnerLabel = partner?.displayName ?? "your partner";
  const catalogCount = DISCOVER_QUESTION_COUNT;

  return (
    <Screen scroll background={T.background}>
      <View style={{ paddingBottom: 28, paddingTop: 4 }}>
        <BackButton color={T.accent} fallback="/hub/connect" />

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
          Connect · Discover
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
          Swipe a question
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
          Shuffled cards, as many as you want today. Right = discuss it. Left =
          skip. Answers live in the vault — yours and {partnerLabel}’s, side by
          side.
        </Text>

        <View
          style={{
            marginTop: 18,
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
          <View style={{ marginTop: 8 }}>
            <Pressable
              onPress={() => setCatsOpen(true)}
              style={{
                alignSelf: "center",
                paddingHorizontal: 14,
                paddingVertical: 8,
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
                marginTop: 14,
                marginBottom: 12,
                fontSize: 12,
                color: T.muted,
                textAlign: "center",
              }}
            >
              {remaining.length
                ? `${remaining.length} left in these filters · ${catalogCount} in the whole deck`
                : seen.length
                  ? "Nothing left in these categories"
                  : `${catalogCount} questions ready`}
            </Text>

            <View style={{ height: 430, alignItems: "center" }}>
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
                    shadowColor: "#C084D4",
                    shadowOpacity: 0.22,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 10 },
                  }}
                >
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 22,
                      left: 22,
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
                      top: 22,
                      right: 22,
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
                      paddingHorizontal: 12,
                      paddingVertical: 5,
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
                      marginTop: 22,
                      fontFamily: SERIF,
                      fontSize: current.prompt.length > 110 ? 22 : 26,
                      lineHeight: current.prompt.length > 110 ? 28 : 32,
                      color: T.ink,
                    }}
                  >
                    {current.prompt}
                  </Text>
                  <Text
                    style={{
                      marginTop: "auto",
                      fontSize: 12,
                      color: T.muted,
                    }}
                  >
                    Right to discuss · left to skip
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
                  <Ionicons name="sparkles" size={42} color={T.accent} />
                  <Text
                    style={{
                      marginTop: 16,
                      fontFamily: SERIF,
                      fontSize: 24,
                      color: T.ink,
                      textAlign: "center",
                    }}
                  >
                    Deck’s quiet
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
                    Toggle more categories, or restore a few from Passed.
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "center",
                gap: 22,
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
                label="Discuss"
              />
            </View>
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
                The vault is empty. Swipe right on a card, write your take, and
                it lands here.
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
                    body={row.mine?.body ?? null}
                    waiting="You haven’t answered this one yet."
                  />
                  <AnswerBlock
                    who={partnerLabel}
                    body={row.theirs?.body ?? null}
                    waiting={`${partnerLabel} hasn’t answered yet.`}
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

      {answerOpen && current ? (
        <SheetOverlay
          kicker="DISCUSS"
          title="Your take"
          onClose={() => {
            setAnswerOpen(false);
            setDraft("");
          }}
          background={T.surface}
          ink={T.ink}
          muted={T.muted}
        >
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 18,
              lineHeight: 24,
              color: T.ink,
            }}
          >
            {current.prompt}
          </Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Say it plain. They’ll see this in the vault."
            placeholderTextColor="rgba(61,46,74,0.32)"
            multiline
            style={{
              marginTop: 14,
              minHeight: 120,
              borderRadius: 16,
              padding: 14,
              backgroundColor: "#F4EEF8",
              color: T.ink,
              fontSize: 16,
              lineHeight: 22,
              textAlignVertical: "top",
            }}
          />
          {error ? (
            <Text style={{ marginTop: 8, color: "#C45C7A" }}>{error}</Text>
          ) : null}
          <Pressable
            onPress={() => void saveAnswer()}
            disabled={busy}
            style={{
              marginTop: 16,
              height: 52,
              borderRadius: 26,
              backgroundColor: T.accent,
              alignItems: "center",
              justifyContent: "center",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Save to vault</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}
    </Screen>
  );
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
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFFBFE",
        borderWidth: 1.5,
        borderColor: color,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Ionicons name={icon} size={26} color={color} />
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
