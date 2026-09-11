import { MonthGrid } from "@/components/hub/MonthGrid";
import { HubScreen } from "@/components/hub/HubScreen";
import {
  activitiesForDate,
  buildCalendarActivities,
  marksByDate,
  type CalendarActivityKind,
} from "@/lib/calendar-activity";
import {
  CALENDAR_KIND_OPTIONS,
  defaultCalendarPrefs,
  readCalendarPrefs,
  writeCalendarPrefs,
  type CalendarPrefs,
} from "@/lib/calendar-prefs";
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
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

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

const PREVIEW_COUNT = 4;

export default function CalendarScreen() {
  const now = new Date();
  const today = localDateKey();
  const router = useRouter();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selected, setSelected] = useState(today);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(now.getFullYear());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<CalendarPrefs>(defaultCalendarPrefs);
  const [expanded, setExpanded] = useState(false);
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

  useEffect(() => {
    void readCalendarPrefs().then(setPrefs);
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [selected, prefs.listMode]);

  const savePrefs = (next: CalendarPrefs) => {
    setPrefs(next);
    void writeCalendarPrefs(next);
  };

  const cells = monthGrid(cursor.year, cursor.month);
  const activities = useMemo(() => {
    const all = buildCalendarActivities({
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
    });
    return all.filter((row) => prefs.enabledKinds[row.kind] !== false);
  }, [
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
    prefs.enabledKinds,
  ]);
  const marks = useMemo(() => marksByDate(activities), [activities]);
  const dayItems = useMemo(
    () => activitiesForDate(activities, selected),
    [activities, selected]
  );

  const showAll =
    prefs.listMode === "all" || expanded || dayItems.length <= PREVIEW_COUNT;
  const visibleItems = showAll ? dayItems : dayItems.slice(0, PREVIEW_COUNT);
  const hiddenCount = dayItems.length - visibleItems.length;

  const label = formatMonthYear(cursor.year, cursor.month);
  const selectedIsToday = selected === today;

  const selectDay = (date: string) => {
    setSelected(date);
    const [year, month] = date.split("-").map(Number);
    if (year !== cursor.year || month - 1 !== cursor.month) {
      setCursor({ year, month: month - 1 });
    }
  };

  const toggleKind = (kind: CalendarActivityKind) => {
    savePrefs({
      ...prefs,
      enabledKinds: {
        ...prefs.enabledKinds,
        [kind]: !prefs.enabledKinds[kind],
      },
    });
  };

  return (
    <HubScreen
      tone="calendar"
      kicker="Shared calendar"
      headerRight={
        <Pressable
          onPress={() => setSettingsOpen(true)}
          hitSlop={12}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(22,24,29,0.06)",
          }}
        >
          <Ionicons name="settings-outline" size={20} color="#C23B55" />
        </Pressable>
      }
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
        </Pressable>
        <Pressable
          onPress={() => setCursor(addMonths(cursor.year, cursor.month, 1))}
          hitSlop={12}
          style={{ padding: 8 }}
        >
          <Ionicons name="chevron-forward" size={22} color="#C23B55" />
        </Pressable>
      </View>

      <MonthGrid
        cells={cells}
        marks={marks}
        selected={selected}
        today={today}
        onSelect={selectDay}
      />

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
            flex: 1,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(22,24,29,0.4)",
          }}
        >
          {selectedIsToday ? "Today" : formatLongDate(selected)}
        </Text>
        <Pressable
          onPress={() =>
            router.push(
              `/hub/calendar-add?date=${encodeURIComponent(selected)}` as Href
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
        {dayItems.length === 0 ? (
          <Text style={{ fontSize: 15, color: "rgba(22,24,29,0.5)" }}>
            Nothing on this day yet. Tap + to add your own.
          </Text>
        ) : (
          visibleItems.map((item) => (
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
        {prefs.listMode === "preview" && hiddenCount > 0 ? (
          <Pressable onPress={() => setExpanded(true)}>
            <Text style={{ fontSize: 14, color: "#C23B55", fontWeight: "600" }}>
              See all {dayItems.length} →
            </Text>
          </Pressable>
        ) : null}
        {prefs.listMode === "preview" &&
        expanded &&
        dayItems.length > PREVIEW_COUNT ? (
          <Pressable onPress={() => setExpanded(false)}>
            <Text style={{ fontSize: 14, color: "#C23B55", fontWeight: "600" }}>
              Show less
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
                setSelected(localDateKey(n));
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

      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(22,24,29,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={() => setSettingsOpen(false)}
            accessibilityLabel="Close calendar settings"
          />
          <View
            style={{
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 28,
              borderTopWidth: 1,
              borderColor: "rgba(22,24,29,0.12)",
              maxHeight: "85%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#16181D" }}
              >
                Calendar settings
              </Text>
              <Pressable onPress={() => setSettingsOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color="#16181D" />
              </Pressable>
            </View>

            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "rgba(22,24,29,0.4)",
                  marginBottom: 10,
                }}
              >
                Show on calendar
              </Text>
              <View style={{ gap: 8, marginBottom: 22 }}>
                {CALENDAR_KIND_OPTIONS.map((row) => {
                  const on = prefs.enabledKinds[row.kind] !== false;
                  return (
                    <Pressable
                      key={row.kind}
                      onPress={() => toggleKind(row.kind)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: on ? "#C23B55" : "rgba(22,24,29,0.1)",
                        backgroundColor: on
                          ? "rgba(194,59,85,0.08)"
                          : "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#16181D",
                        }}
                      >
                        {row.label}
                      </Text>
                      <Ionicons
                        name={on ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={on ? "#C23B55" : "rgba(22,24,29,0.35)"}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "rgba(22,24,29,0.4)",
                  marginBottom: 10,
                }}
              >
                Day list
              </Text>
              <View style={{ gap: 8 }}>
                {(
                  [
                    {
                      mode: "all" as const,
                      label: "Show all activities at the bottom",
                    },
                    {
                      mode: "preview" as const,
                      label: "Show first 4, then See all",
                    },
                  ] as const
                ).map((row) => {
                  const on = prefs.listMode === row.mode;
                  return (
                    <Pressable
                      key={row.mode}
                      onPress={() =>
                        savePrefs({ ...prefs, listMode: row.mode })
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: on ? "#C23B55" : "rgba(22,24,29,0.1)",
                        backgroundColor: on
                          ? "rgba(194,59,85,0.08)"
                          : "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#16181D",
                          paddingRight: 12,
                        }}
                      >
                        {row.label}
                      </Text>
                      <Ionicons
                        name={on ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={on ? "#C23B55" : "rgba(22,24,29,0.35)"}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </HubScreen>
  );
}
