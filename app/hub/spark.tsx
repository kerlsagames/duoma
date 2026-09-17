import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { FavoriteHeart, favoriteHeartCorner } from "@/components/ui/FavoriteHeart";
import { SPARK_TONE as T, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { useMiniApps } from "@/lib/mini-apps";
import {
  SPARK_CATEGORIES,
  categoryMeta,
  emptySparkState,
  filterSparks,
  intensityLabel,
  locationLabel,
  markSparkDone,
  pickSpark,
  sparkById,
  toggleFavorite,
  type SparkCard,
  type SparkCategoryId,
  type SparkLocation,
} from "@/lib/spark";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";

type Place = "all" | SparkLocation;
type Pane = "deck" | "saved";

export default function SparkScreen() {
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

  const shown = card && pool.some((row) => row.id === card.id) ? card : pool[0] ?? null;
  const fav = shown ? spark.favorites.includes(shown.id) : false;
  const done = shown ? spark.doneIds.includes(shown.id) : false;

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
    const already = spark.doneIds.includes(shown.id);
    await patch((state) => ({ ...state, spark: markSparkDone(state.spark, shown.id) }));
    setNote(already ? "Back in the mix." : "Completed. The night still has room.");
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
          Some inspiration for you to start setting the mood
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
          {(
            [
              ["deck", "Deck"],
              ["saved", `Favourited · ${saved.length}`],
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
                Nothing favourited yet. Tap the heart on a spark you want to keep.
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
                    paddingTop: 20,
                    minHeight: 240,
                  }}
                >
                  <FavoriteHeart
                    on={fav}
                    color={T.ember}
                    onToggle={() => void onFavorite()}
                    style={favoriteHeartCorner}
                  />
                  <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 28 }}>
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

                <Pressable
                  onPress={() => void onDidThis()}
                  accessibilityLabel={done ? "Undo completed" : "Completed"}
                  style={{
                    marginTop: 10,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: done ? T.gold : T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: done ? T.gold : T.border,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={done ? "checkmark-circle" : "checkmark-circle-outline"}
                    size={16}
                    color={done ? T.onGold : T.ink}
                  />
                  <Text
                    style={{
                      color: done ? T.onGold : T.ink,
                      fontWeight: "800",
                      fontSize: 14,
                    }}
                  >
                    Completed
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </>
        )}

        {note ? (
          <Text style={{ marginTop: 14, color: T.gold, fontSize: 13, lineHeight: 18 }}>
            {note}
          </Text>
        ) : null}
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
