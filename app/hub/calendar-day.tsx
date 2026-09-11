import {
  activitiesForDate,
  buildCalendarActivities,
} from "@/lib/calendar-activity";
import { formatClockTime, formatLongDate, parseDateKey } from "@/lib/dates";
import { HUB_TONES } from "@/lib/app-themes";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

const T = HUB_TONES.calendar;

export default function CalendarDayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const date =
    typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : null;

  const {
    nights,
    checkIns,
    milestones,
    bucketItems,
    ritualChecks,
    talkDraws,
    listEntries,
    coupleLists,
    spicyDares,
    coupons,
    jarNotes,
    curiosityAnswers,
    scratches,
    calendarEvents,
    partner,
    user,
  } = useApp();

  const activities = useMemo(
    () =>
      buildCalendarActivities({
        nights,
        checkIns,
        milestones,
        bucketItems,
        ritualChecks,
        talkDraws,
        listEntries,
        coupleLists,
        spicyDares,
        coupons,
        jarNotes,
        curiosityAnswers,
        scratches,
        calendarEvents,
        partner,
        user,
      }),
    [
      nights,
      checkIns,
      milestones,
      bucketItems,
      ritualChecks,
      talkDraws,
      listEntries,
      coupleLists,
      spicyDares,
      coupons,
      jarNotes,
      curiosityAnswers,
      scratches,
      calendarEvents,
      partner,
      user,
    ]
  );

  const dayItems = useMemo(
    () => (date ? activitiesForDate(activities, date) : []),
    [activities, date]
  );

  const title = date
    ? parseDateKey(date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Day";

  return (
    <Screen scroll background={T.background}>
      <View style={{ paddingTop: 8, paddingBottom: 28 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name="chevron-back" size={20} color={T.accent} />
            <Text style={{ fontSize: 15, color: T.accent, fontWeight: "600" }}>
              Calendar
            </Text>
          </Pressable>
          {date ? (
            <Pressable
              onPress={() =>
                router.push(
                  `/hub/calendar-add?date=${encodeURIComponent(date)}` as Href
                )
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: T.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>

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
          Day timeline
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 28,
            fontWeight: "700",
            color: T.ink,
            lineHeight: 34,
          }}
        >
          {title}
        </Text>
        <Text style={{ marginTop: 8, fontSize: 15, color: T.muted }}>
          Everything logged this day — tap any row for details.
        </Text>

        <View style={{ marginTop: 22, gap: 10 }}>
          {!date ? (
            <Text style={{ fontSize: 15, color: T.muted }}>
              Missing date. Go back and pick a day.
            </Text>
          ) : dayItems.length === 0 ? (
            <View
              style={{
                backgroundColor: T.surface,
                borderWidth: 1,
                borderColor: "rgba(22,24,29,0.1)",
                padding: 18,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: T.ink }}>
                Quiet day
              </Text>
              <Text style={{ marginTop: 6, fontSize: 14, color: T.muted }}>
                Nothing here yet. Tap + to add your own note, date, or reminder.
              </Text>
            </View>
          ) : (
            dayItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.href as Href)}
                style={{
                  backgroundColor: T.surface,
                  borderWidth: 1,
                  borderColor: "rgba(22,24,29,0.1)",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  gap: 14,
                }}
              >
                <View style={{ width: 64 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: T.accent,
                    }}
                  >
                    {formatClockTime(item.at) || "—"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: T.ink,
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        lineHeight: 18,
                        color: T.muted,
                      }}
                      numberOfLines={3}
                    >
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(22,24,29,0.35)"
                  style={{ alignSelf: "center" }}
                />
              </Pressable>
            ))
          )}
        </View>

        {date ? (
          <Text
            style={{
              marginTop: 20,
              fontSize: 12,
              color: "rgba(22,24,29,0.4)",
            }}
          >
            {formatLongDate(date)} · {dayItems.length}{" "}
            {dayItems.length === 1 ? "entry" : "entries"}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
