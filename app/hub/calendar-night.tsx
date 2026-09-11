import { nightCardDetails, stageLabel } from "@/lib/calendar-activity";
import { formatClockTime, formatLongDate } from "@/lib/dates";
import { HUB_TONES } from "@/lib/app-themes";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

const T = HUB_TONES.calendar;

export default function CalendarNightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const { nights, allDeck, cards, ratings, partner, user } = useApp();

  const night = useMemo(
    () => nights.find((row) => row.id === id) ?? null,
    [nights, id]
  );

  const details = useMemo(() => {
    if (!night) return [];
    return nightCardDetails({
      night,
      deck: allDeck,
      cards,
      ratings,
    });
  }, [night, allDeck, cards, ratings]);

  const played = details.filter(
    (row) => row.status === "played" || row.ratings.length > 0
  );
  const title =
    night?.gameKey === "lets-talk" ? "Let's Talk" : "Get Spicy";
  const when = night
    ? formatLongDate(night.playedDate ?? night.updatedAt.slice(0, 10))
    : "";
  const clock = night
    ? formatClockTime(night.completedAt ?? night.updatedAt)
    : "";

  const playerName = (userId: string | null) => {
    if (!userId) return null;
    if (user && userId === user.id) return user.displayName;
    if (partner && userId === partner.id) return partner.displayName;
    return "Partner";
  };

  return (
    <Screen scroll background={T.background}>
      <View style={{ paddingTop: 8, paddingBottom: 32 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Ionicons name="chevron-back" size={20} color={T.accent} />
          <Text style={{ fontSize: 15, color: T.accent, fontWeight: "600" }}>
            Back
          </Text>
        </Pressable>

        <Text
          style={{
            marginTop: 18,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: T.kicker,
          }}
        >
          Night detail
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 30,
            fontWeight: "700",
            color: T.ink,
          }}
        >
          {night ? title : "Night not found"}
        </Text>
        {night ? (
          <Text style={{ marginTop: 8, fontSize: 15, color: T.muted }}>
            {when}
            {clock ? ` · ${clock}` : ""}
            {night.status === "completed"
              ? " · Completed"
              : night.status === "rating"
                ? " · Rating"
                : ` · ${night.status}`}
          </Text>
        ) : (
          <Text style={{ marginTop: 8, fontSize: 15, color: T.muted }}>
            This night may have been cleared from history.
          </Text>
        )}

        {night ? (
          <View style={{ marginTop: 24, gap: 12 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(22,24,29,0.4)",
              }}
            >
              Cards played ({played.length || details.length})
            </Text>

            {(played.length ? played : details).length === 0 ? (
              <View
                style={{
                  backgroundColor: T.surface,
                  borderWidth: 1,
                  borderColor: "rgba(22,24,29,0.1)",
                  padding: 16,
                }}
              >
                <Text style={{ fontSize: 15, color: T.muted }}>
                  No cards were saved for this night yet. Finish a Spicy session
                  and the deck lands here.
                </Text>
              </View>
            ) : (
              (played.length ? played : details).map((card) => (
                <View
                  key={card.deckId}
                  style={{
                    backgroundColor: T.surface,
                    borderWidth: 1,
                    borderColor: "rgba(22,24,29,0.1)",
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: T.accent,
                    }}
                  >
                    {stageLabel(card.stage)}
                    {card.playedBy ? ` · ${playerName(card.playedBy)}` : ""}
                  </Text>
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 17,
                      fontWeight: "700",
                      color: T.ink,
                    }}
                  >
                    {card.title}
                  </Text>
                  {card.body ? (
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 14,
                        lineHeight: 20,
                        color: T.muted,
                      }}
                    >
                      {card.body}
                    </Text>
                  ) : null}
                  {card.ratings.length > 0 ? (
                    <View style={{ marginTop: 10, gap: 4 }}>
                      {card.ratings.map((rating) => (
                        <Text
                          key={`${card.deckId}-${rating.userId}`}
                          style={{ fontSize: 13, color: T.ink }}
                        >
                          {playerName(rating.userId)} rated{" "}
                          <Text style={{ fontWeight: "700" }}>
                            {rating.stars.toFixed(1)}
                          </Text>
                          /10
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
