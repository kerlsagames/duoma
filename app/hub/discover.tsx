import { LookPanel, SettingsDock } from "@/components/hub/AppSettings";
import { PlayTabs } from "@/components/hub/PlayTabs";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { Screen } from "@/components/ui/Screen";
import { ClearAllBar, SwipeClearRow } from "@/components/ui/SwipeClearRow";
import { useInboxClears } from "@/lib/inbox-clears";
import { DISCOVER_TONE, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { dateKeyFromIso, formatLongDate } from "@/lib/dates";
import {
  ALL_DISCOVER_CATEGORY_IDS,
  DISCOVER_FAMILIES,
  DISCOVER_QUESTION_COUNT,
  DISCOVER_QUESTIONS,
  discoverCategoryMeta,
  leftoverDiscover,
  normalizeEnabledCategories,
  seenDiscoverIds,
  discoverQuestions,
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
type DeckMove = { type: "talk" | "skip"; questionId: string };

export default function DiscoverScreen() {
  const {
    user,
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const look = useAppLook("discover", T.accent, {
    hideHint: false,
    jumbo: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DeckMove[]>([]);
  const [restored, setRestored] = useState<DiscoverQuestion | null>(null);
  const clears = useInboxClears(user?.id);

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
    () => leftoverDiscover(seen, enabled, couple?.id ?? "solo"),
    [couple?.id, enabled, seen]
  );

  const current = restored ?? remaining[0] ?? null;
  const nextPeek = remaining.find((row) => row.id !== current?.id) ?? null;

  const vault = useMemo(
    () => vaultEntries(curiosityAnswers),
    [curiosityAnswers]
  );

  const talkedIds = useMemo(
    () => new Set(vault.map((row) => row.question.id)),
    [vault]
  );

  const mySkips = useMemo(() => {
    const ids = new Set(
      curiositySkips
        .filter((row) => row.userId === user?.id)
        .map((row) => row.questionId)
    );
    return discoverQuestions().filter(
      (row) =>
        ids.has(row.id) && !talkedIds.has(row.id) && !clears.hidden(row.id)
    );
  }, [clears, curiositySkips, talkedIds, user?.id]);

  const resetCard = () => pan.setValue({ x: 0, y: 0 });

  const commitSkip = async () => {
    if (!current || busy) return;
    const questionId = current.id;
    setBusy(true);
    setError(null);
    try {
      await skipDiscover(questionId);
      setHistory((prev) => [...prev, { type: "skip", questionId }]);
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
      setHistory((prev) => [...prev, { type: "talk", questionId }]);
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
    const move = history[history.length - 1];
    if (!move || busy) return;
    setBusy(true);
    setError(null);
    try {
      await undoDiscover(move.questionId);
      const card = discoverQuestions().find((row) => row.id === move.questionId) ?? null;
      setRestored(card);
      setHistory((prev) => prev.slice(0, -1));
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

  const catalogCount = DISCOVER_QUESTION_COUNT;
  const onDeck = tab === "deck";
  const promptSize =
    (current && current.prompt.length > 90 ? 18 : 20) + (look.prefs.jumbo ? 6 : 0);

  return (
    <Screen scroll={!onDeck} background={T.background} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <View
        style={{
          flex: onDeck ? 1 : undefined,
          paddingBottom: onDeck ? 8 : 28,
          paddingTop: 4,
          minHeight: 0,
        }}
      >
        <SettingsDock
          accent={look.accent}
          fallback="/hub/connect"
          open={settingsOpen}
          onToggle={() => setSettingsOpen((open) => !open)}
          label="Flirtatious findings"
        />
        {settingsOpen ? (
          <LookPanel
            look={look}
            ink={T.ink}
            muted={T.muted}
            pageColor={T.background}
            toggles={[
              {
                key: "hideHint",
                label: "Hide swipe hint",
                hint: "You already know: right talks, left skips.",
              },
              {
                key: "jumbo",
                label: "Jumbo cards",
                hint: "Bigger type on the question.",
              },
            ]}
          />
        ) : null}
        {settingsOpen ? null : (
          <>


        <Text
          style={{
            marginTop: 4,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: look.accent,
          }}
        >
          Connect · Flirtatious findings
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
          Flirtatious findings
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: SERIF,
            fontSize: 15,
            lineHeight: 21,
            color: T.muted,
          }}
        >
          Chat about cheeky and taboo things together.
        </Text>
        {onDeck && !look.prefs.hideHint ? (
          <Text
            style={{
              marginTop: 4,
              fontSize: 13,
              color: T.muted,
            }}
          >
            Right = talked about it. Left = skip.
          </Text>
        ) : onDeck ? null : (
          <Text
            style={{
              marginTop: 6,
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 22,
              color: T.muted,
            }}
          >
            Talked cards land in the vault for both of you. These are
            discussion questions, not separate written answers.
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
              disabled={!history.length || busy}
              style={{
                alignSelf: "center",
                marginTop: 10,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 999,
                backgroundColor: history.length ? T.accentSoft : "transparent",
                borderWidth: 1,
                borderColor: history.length ? T.accent : "rgba(61,46,74,0.12)",
                opacity: history.length && !busy ? 1 : 0.4,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: T.ink,
                }}
              >
                {history.length > 1
                  ? `Undo · ${history.length}`
                  : "Undo last card"}
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
                through — it lands here for both of you.
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
                  <Text
                    style={{
                      marginTop: 10,
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 0.6,
                      color: T.muted,
                    }}
                  >
                    Talked together · {formatLongDate(dateKeyFromIso(row.at))}
                  </Text>
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
              <>
                <ClearAllBar
                  count={mySkips.length}
                  ink={T.ink}
                  muted={T.muted}
                  onClear={() => clears.hideAll(mySkips.map((row) => row.id))}
                />
                {mySkips.map((row) => (
                  <SwipeClearRow
                    key={row.id}
                    onClear={() => clears.hide(row.id)}
                    ink={T.ink}
                  >
                    <View
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
                        <Text
                          style={{
                            color: T.ink,
                            fontWeight: "700",
                            fontSize: 12,
                          }}
                        >
                          Restore
                        </Text>
                      </Pressable>
                    </View>
                  </SwipeClearRow>
                ))}
              </>
            )}
          </View>
        ) : null}
      </>
        )}
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
