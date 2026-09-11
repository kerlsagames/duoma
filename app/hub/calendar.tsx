import { MonthGrid } from "@/components/hub/MonthGrid";
import { HubScreen } from "@/components/hub/HubScreen";
import {
  activitiesForDate,
  buildCalendarActivities,
  marksByDate,
} from "@/lib/calendar-activity";
import {
  formatClockTime,
  formatLongDate,
  formatMonthYear,
  localDateKey,
  monthGrid,
  addMonths,
} from "@/lib/dates";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarScreen() {
  const now = new Date();
  const today = localDateKey();
  const router = useRouter();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(now.getFullYear());
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

  const cells = monthGrid(cursor.year, cursor.month);
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
  const marks = useMemo(() => marksByDate(activities), [activities]);
  const todayItems = useMemo(
    () => activitiesForDate(activities, today),
    [activities, today]
  );

  const label = formatMonthYear(cursor.year, cursor.month);

  const openDay = (date: string) => {
    router.push(`/hub/calendar-day?date=${encodeURIComponent(date)}` as Href);
  };

  return (
    <HubScreen
      tone="calendar"
      kicker="Shared calendar"
      title="Everything you did together"
      body="Tap a day for the full timeline — Spicy nights, check-ins, lists, dares, and anything you add yourself."
    >
      <View
        style={{
          marginBottom: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => setCursor(addMonths(cursor.year, cursor.month, -1))}
          hitSlop={12}
          style={{ padding: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color="#C23B55" />
        </Pressable>
        <Pressable
          onPress={() => {
            setPickerYear(cursor.year);
            setPickerOpen(true);
          }}
          style={{ paddingHorizontal: 8 }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#16181D",
              textAlign: "center",
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: "rgba(22,24,29,0.45)",
              textAlign: "center",
            }}
          >
            Tap to jump months or years
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setCursor(addMonths(cursor.year, cursor.month, 1))}
          hitSlop={12}
          style={{ padding: 8 }}
        >
          <Ionicons name="chevron-forward" size={22} color="#C23B55" />
        </Pressable>
      </View>

      <MonthGrid cells={cells} marks={marks} today={today} onSelect={openDay} />

      <View
        style={{
          marginTop: 22,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(22,24,29,0.4)",
          }}
        >
          Today · {formatLongDate(today)}
        </Text>
        <Pressable
          onPress={() =>
            router.push(
              `/hub/calendar-add?date=${encodeURIComponent(today)}` as Href
            )
          }
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#C23B55",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        {todayItems.length === 0 ? (
          <Text style={{ fontSize: 15, color: "rgba(22,24,29,0.5)" }}>
            Nothing logged today yet. Play a night or tap + to add your own.
          </Text>
        ) : (
          todayItems.slice(0, 4).map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(item.href as Href)}
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "rgba(22,24,29,0.1)",
                paddingVertical: 12,
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#C23B55" }}
              >
                {formatClockTime(item.at) || "—"}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#16181D",
                }}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    color: "rgba(22,24,29,0.5)",
                  }}
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>
              ) : null}
            </Pressable>
          ))
        )}
        {todayItems.length > 4 ? (
          <Pressable onPress={() => openDay(today)}>
            <Text style={{ fontSize: 14, color: "#C23B55", fontWeight: "600" }}>
              See all {todayItems.length} today →
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(22,24,29,0.45)",
            justifyContent: "center",
            padding: 24,
          }}
          onPress={() => setPickerOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            style={{
              backgroundColor: "#FFFFFF",
              padding: 18,
              borderWidth: 1,
              borderColor: "rgba(22,24,29,0.12)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Pressable
                onPress={() => setPickerYear((y) => y - 1)}
                hitSlop={10}
              >
                <Ionicons name="chevron-back" size={22} color="#16181D" />
              </Pressable>
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: "#16181D" }}
              >
                {pickerYear}
              </Text>
              <Pressable
                onPress={() => setPickerYear((y) => y + 1)}
                hitSlop={10}
              >
                <Ionicons name="chevron-forward" size={22} color="#16181D" />
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {MONTHS.map((name, index) => {
                const active =
                  pickerYear === cursor.year && index === cursor.month;
                return (
                  <Pressable
                    key={name}
                    onPress={() => {
                      setCursor({ year: pickerYear, month: index });
                      setPickerOpen(false);
                    }}
                    style={{
                      width: "30%",
                      flexGrow: 1,
                      paddingVertical: 12,
                      alignItems: "center",
                      backgroundColor: active
                        ? "#C23B55"
                        : "rgba(22,24,29,0.04)",
                      borderWidth: 1,
                      borderColor: active ? "#C23B55" : "rgba(22,24,29,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: active ? "#FFFFFF" : "#16181D",
                      }}
                    >
                      {name.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => {
                const n = new Date();
                setCursor({ year: n.getFullYear(), month: n.getMonth() });
                setPickerYear(n.getFullYear());
                setPickerOpen(false);
              }}
              style={{ marginTop: 16, alignItems: "center" }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#C23B55" }}
              >
                Jump to this month
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </HubScreen>
  );
}
