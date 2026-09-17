import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { PokeThem } from "@/components/ui/PokeThem";
import { SPARK_TONE as T, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import {
  SPARK_CATEGORIES,
  categoryMeta,
  emptySparkState,
  filterSparks,
  intensityLabel,
  locationLabel,
  markSparkDone,
  pickSpark,
  sendSparkAsk,
  shareCopy,
  sparkById,
  toggleFavorite,
  type SparkCard,
  type SparkCategoryId,
  type SparkLocation,
} from "@/lib/spark";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Share,
  Text,
  View,
} from "react-native";

type Place = "all" | SparkLocation;
type Pane = "deck" | "saved" | "inbox";

export default function SparkScreen() {
  const { user, partner } = useApp();
  const { data, patch } = useMiniApps();
  const look = useAppLook("spark", T.gold, { hideDone: false });
  const spark = data.spark ?? emptySparkState();
  const [place, setPlace] = useState<Place>("all");
  const [category, setCategory] = useState<SparkCategoryId | null>(null);
  const [pane, setPane] = useState<Pane>("deck");
  const [card, setCard] = useState<SparkCard | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(1)).current;

  const pool = useMemo(
    () =>
      filterSparks({ location: place, category }).filter((row) =>
        look.prefs.hideDone ? !spark.doneIds.includes(row.id) : true
      ),
    [place, category, look.prefs.hideDone, spark.doneIds]
  );
  const visibleCategories = useMemo(
    () =>
      SPARK_CATEGORIES.filter(
        (row) => place === "all" || row.location === place
      ),
    [place]
  );
  const saved = useMemo(
    () =>
      spark.favorites
        .map((id) => sparkById(id))
        .filter((row): row is SparkCard => Boolean(row)),
    [spark.favorites]
  );
  const incoming = useMemo(
    () =>
      spark.asks
        .filter((row) => row.toUserId === user?.id && row.status === "offered")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [spark.asks, user?.id]
  );
  const outgoing = useMemo(
    () =>
      spark.asks.filter(
        (row) =>
          row.fromUserId === user?.id &&
          row.status === "offered" &&
          row.cardId === card?.id
      ),
    [spark.asks, user?.id, card?.id]
  );

  const shown = card && pool.some((row) => row.id === card.id) ? card : pool[0] ?? null;
  const fav = shown ? spark.favorites.includes(shown.id) : false;
  const done = shown ? spark.doneIds.includes(shown.id) : false;
  const them = partner?.displayName || "them";

  const flipTo = (next: SparkCard | null) => {
    Animated.timing(fade, {
      toValue: 0,
      duration: 90,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setCard(next);
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const shuffle = async () => {
    setNote(null);
    const next = pickSpark(pool, shown?.id);
    if (!next) {
      setNote("Nothing in this mix. Loosen a filter.");
      return;
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* web */
    }
    flipTo(next);
  };

  const onFavorite = async () => {
    if (!shown) return;
    await patch((state) => ({ ...state, spark: toggleFavorite(state.spark, shown.id) }));
  };

  const onDidThis = async () => {
    if (!shown) return;
    await patch((state) => ({ ...state, spark: markSparkDone(state.spark, shown.id) }));
    setNote("Marked. The night still has room.");
  };

  const onSend = async () => {
    if (!shown || !user || !partner) {
      setNote("Pair first — then you can send this to them.");
      return;
    }
    await patch((state) => ({
      ...state,
      spark: sendSparkAsk(state.spark, {
        cardId: shown.id,
        fromUserId: user.id,
        toUserId: partner.id,
      }),
    }));
    const message = shareCopy(shown);
    try {
      await Share.share({ message, title: shown.title });
    } catch {
      await Clipboard.setStringAsync(message);
    }
    setNote(`Sent to ${them}. Copied if they live in another chat.`);
  };

  const onCopy = async () => {
    if (!shown) return;
    await Clipboard.setStringAsync(shareCopy(shown));
    setNote("Copied. Paste it wherever they already are.");
  };

  const openAsk = (cardId: string) => {
    const next = sparkById(cardId);
    if (!next) return;
    setPlace(next.location);
    setCategory(next.category);
    setPane("deck");
    setCard(next);
  };

  return (
    <Screen
      scroll
      background={T.background}
      density={look.prefs.density}
      typeface={look.prefs.typeface}
      wash={look.wash}
    >
      <Stage
        background={T.background}
        fallback={"/hub/desire" as Href}
        accent={look.accent}
        settingsLabel="Spark"
        settings={
          <LookPanel
            look={look}
            ink={T.ink}
            muted={T.muted}
            pageColor={T.background}
            toggles={[
              {
                key: "hideDone",
                label: "Hide sparks you already did",
                hint: "Keeps the shuffle in unused cards.",
              },
            ]}
          />
        }
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: T.gold,
          }}
        >
          Desire · Spark
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 40,
            color: T.ink,
          }}
        >
          Spark
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: T.muted,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          Two hundred slow burns. From across town, or in the same room — hours
          before anyone undresses.
        </Text>

        {incoming.length ? (
          <Pressable
            onPress={() => setPane("inbox")}
            style={{
              marginTop: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: T.gold,
              backgroundColor: T.goldSoft,
              padding: 12,
            }}
          >
            <Text style={{ color: T.gold, fontWeight: "800", fontSize: 13 }}>
              {incoming.length === 1
                ? `${them} sent you a spark`
                : `${them} sent ${incoming.length} sparks`}
            </Text>
            <Text style={{ marginTop: 4, color: T.muted, fontSize: 13 }}>
              Open the inbox to read what they want in motion.
            </Text>
          </Pressable>
        ) : null}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
          {(
            [
              ["deck", "Deck"],
              ["saved", `Saved · ${saved.length}`],
              ["inbox", incoming.length ? `From them · ${incoming.length}` : "From them"],
            ] as const
          ).map(([id, label]) => {
            const on = pane === id;
            return (
              <Pressable
                key={id}
                onPress={() => setPane(id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 999,
                  alignItems: "center",
                  backgroundColor: on ? T.gold : T.surface,
                  borderWidth: 1,
                  borderColor: on ? T.gold : T.border,
                }}
              >
                <Text
                  style={{
                    color: on ? T.onGold : T.ink,
                    fontWeight: "800",
                    fontSize: 12,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {pane === "saved" ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            {saved.length === 0 ? (
              <Text style={{ color: T.dim, fontFamily: SERIF, fontSize: 18, lineHeight: 26 }}>
                Nothing bookmarked yet. Heart a card you want to keep.
              </Text>
            ) : (
              saved.map((row) => (
                <SparkRow
                  key={row.id}
                  card={row}
                  done={spark.doneIds.includes(row.id)}
                  onPress={() => openAsk(row.id)}
                />
              ))
            )}
          </View>
        ) : pane === "inbox" ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            {incoming.length === 0 ? (
              <Text style={{ color: T.dim, fontFamily: SERIF, fontSize: 18, lineHeight: 26 }}>
                Quiet. When they send a spark, it lands here — not in the shuffle.
              </Text>
            ) : (
              incoming.map((ask) => {
                const row = sparkById(ask.cardId);
                if (!row) return null;
                return (
                  <SparkRow
                    key={ask.id}
                    card={row}
                    done={false}
                    kicker="They sent this"
                    onPress={() => openAsk(row.id)}
                  />
                );
              })
            )}
          </View>
        ) : (
          <>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              {(
                [
                  ["all", "All"],
                  ["from_afar", "From afar"],
                  ["at_home", "At home"],
                ] as const
              ).map(([id, label]) => {
                const on = place === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => {
                      setPlace(id);
                      setCategory(null);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 14,
                      alignItems: "center",
                      backgroundColor: on ? T.ember : T.surface,
                      borderWidth: 1,
                      borderColor: on ? T.ember : T.border,
                    }}
                  >
                    <Text
                      style={{
                        color: on ? T.onGold : T.ink,
                        fontWeight: "800",
                        fontSize: 13,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 12,
              }}
            >
              {visibleCategories.map((row) => {
                const on = category === row.id;
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => setCategory(on ? null : row.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      backgroundColor: on ? T.goldSoft : T.surfaceRaised,
                      borderWidth: 1,
                      borderColor: on ? T.gold : T.border,
                    }}
                  >
                    <Text style={{ color: on ? T.gold : T.muted, fontSize: 12, fontWeight: "700" }}>
                      {row.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {!shown ? (
              <Text
                style={{
                  marginTop: 28,
                  color: T.dim,
                  fontFamily: SERIF,
                  fontSize: 20,
                  lineHeight: 28,
                }}
              >
                Nothing matches this mix. Clear a chip, or show the ones you already did.
              </Text>
            ) : (
              <Animated.View
                style={{
                  marginTop: 18,
                  opacity: fade,
                  transform: [
                    {
                      translateY: fade.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={{
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: T.gold,
                    backgroundColor: T.velvet,
                    padding: 18,
                    minHeight: 240,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        letterSpacing: 1.4,
                        textTransform: "uppercase",
                        color: T.ember,
                      }}
                    >
                      {locationLabel(shown.location)} · {categoryMeta(shown.category).label}
                    </Text>
                    <Pressable
                      onPress={() => void onFavorite()}
                      hitSlop={10}
                      accessibilityLabel={fav ? "Remove bookmark" : "Bookmark"}
                    >
                      <Ionicons
                        name={fav ? "heart" : "heart-outline"}
                        size={22}
                        color={fav ? T.ember : T.gold}
                      />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: "row", gap: 5, marginTop: 10 }}>
                    {[1, 2, 3].map((n) => (
                      <Ionicons
                        key={n}
                        name="flame"
                        size={14}
                        color={n <= shown.intensity ? T.ember : "rgba(210,175,55,0.22)"}
                      />
                    ))}
                    <Text style={{ marginLeft: 4, color: T.dim, fontSize: 11 }}>
                      {intensityLabel(shown.intensity)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      marginTop: 14,
                      fontFamily: SERIF,
                      fontSize: 26,
                      lineHeight: 32,
                      color: T.ink,
                    }}
                  >
                    {shown.title}
                  </Text>
                  <Text
                    style={{
                      marginTop: 10,
                      color: T.muted,
                      fontSize: 16,
                      lineHeight: 24,
                    }}
                  >
                    {shown.prompt}
                  </Text>
                  {done ? (
                    <Text style={{ marginTop: 12, color: T.gold, fontSize: 13, fontWeight: "700" }}>
                      You already did this one.
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => void shuffle()}
                  accessibilityLabel="Give me a spark"
                  style={{
                    marginTop: 14,
                    height: 54,
                    borderRadius: 18,
                    backgroundColor: T.gold,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Ionicons name="shuffle" size={20} color={T.onGold} />
                  <Text style={{ color: T.onGold, fontWeight: "800", fontSize: 16 }}>
                    Give me a spark
                  </Text>
                </Pressable>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <Pressable
                    onPress={() => void onSend()}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: T.gold,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: T.gold, fontWeight: "800", fontSize: 14 }}>
                      Send to {them}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void onCopy()}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: T.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    accessibilityLabel="Copy spark"
                  >
                    <Ionicons name="copy-outline" size={18} color={T.gold} />
                  </Pressable>
                  <Pressable
                    onPress={() => void onDidThis()}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: T.surfaceRaised,
                      borderWidth: 1,
                      borderColor: T.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: T.ink, fontWeight: "800", fontSize: 14 }}>
                      I did this
                    </Text>
                  </Pressable>
                </View>
                {outgoing[0] ? (
                  <PokeThem appId="spark" targetId={outgoing[0].id} color={T.gold} />
                ) : null}
              </Animated.View>
            )}
          </>
        )}

        {note ? (
          <Text style={{ marginTop: 14, color: T.gold, fontSize: 13, lineHeight: 18 }}>
            {note}
          </Text>
        ) : null}
        <Text
          style={{
            marginTop: 18,
            color: T.dim,
            fontSize: 12,
          }}
        >
          {pool.length} in this mix · {spark.doneIds.length} done
        </Text>
      </Stage>
    </Screen>
  );
}

function SparkRow({
  card,
  done,
  kicker,
  onPress,
}: {
  card: SparkCard;
  done: boolean;
  kicker?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surface,
      }}
    >
      {kicker ? (
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: T.gold,
            marginBottom: 4,
          }}
        >
          {kicker}
        </Text>
      ) : null}
      <Text style={{ color: T.ink, fontWeight: "800", fontSize: 16 }}>{card.title}</Text>
      <Text style={{ marginTop: 4, color: T.muted, fontSize: 13 }} numberOfLines={2}>
        {card.prompt}
      </Text>
      <Text style={{ marginTop: 6, color: T.dim, fontSize: 11 }}>
        {locationLabel(card.location)}
        {done ? " · done" : ""}
      </Text>
    </Pressable>
  );
}
