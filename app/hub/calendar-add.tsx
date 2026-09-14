import { defaultHappenedAt } from "@/lib/calendar-activity";
import { HUB_TONES } from "@/lib/app-themes";
import {
  createBirthday,
  formatBirthdayDate,
  normalizeBirthYear,
  sortBirthdaysList,
  turningAge,
  type BirthdayCircle,
} from "@/lib/birthdays";
import { ReminderLeads } from "@/components/hub/ReminderLeads";
import { isoFromDateAndTime, formatLongDate } from "@/lib/dates";
import { reminderItemKey, type ReminderLead } from "@/lib/calendar-reminders";
import { useCalendarPrefs } from "@/lib/useCalendarPrefs";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui/Screen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { createElement, useMemo, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

const T = HUB_TONES.calendar;

type AddKind = "note" | "birthday";

export default function CalendarAddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const date =
    typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : null;
  const { addCalendarEvent } = useApp();
  const { patch } = useMiniApps();
  const { prefs, save: savePrefs } = useCalendarPrefs();
  const [kind, setKind] = useState<AddKind>("note");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [circle, setCircle] = useState<BirthdayCircle>("family");
  const [yearText, setYearText] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [time, setTime] = useState("09:00");
  const [leads, setLeads] = useState<ReminderLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => {
    if (!date) return null;
    const [year, month, day] = date.split("-").map(Number);
    return { year, month: month - 1, day };
  }, [date]);

  const parsedYear = normalizeBirthYear(
    yearText.trim() ? Number(yearText.trim()) : null
  );
  const previewTurns = turningAge(parsedYear, new Date().getFullYear());
  const targetKind = kind === "birthday" ? "birthday" : "custom";
  const reminderLeads = leads ?? prefs.defaultLeads[targetKind];

  const persistLeads = (id: string, next: ReminderLead[]) => {
    savePrefs({
      ...prefs,
      itemLeads: {
        ...prefs.itemLeads,
        [reminderItemKey(targetKind, id)]: next,
      },
    });
  };

  const saveNote = async () => {
    if (!date) {
      setError("Missing date.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const row = await addCalendarEvent({
        title,
        notes,
        date,
        allDay,
        happenedAt: allDay
          ? defaultHappenedAt(date)
          : isoFromDateAndTime(date, time),
      });
      persistLeads(row.id, reminderLeads);
      router.replace(
        `/hub/calendar-item?kind=custom&id=${encodeURIComponent(row.id)}` as Href
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const saveBirthday = async () => {
    if (!parsed) {
      setError("Missing date.");
      return;
    }
    if (yearText.trim() && parsedYear == null) {
      setError("Birth year should be a real year, or leave it blank.");
      return;
    }
    const row = createBirthday({
      name,
      circle,
      month: parsed.month,
      day: parsed.day,
      year: parsedYear,
    });
    if (!row) {
      setError("Add a name.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await patch((state) => ({
        ...state,
        birthdays: sortBirthdaysList([...state.birthdays, row]),
      }));
      persistLeads(row.id, reminderLeads);
      router.replace(
        `/hub/calendar-item?kind=birthday&id=${encodeURIComponent(row.id)}` as Href
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
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
            Cancel
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
          Add to calendar
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 28,
            fontWeight: "700",
            color: T.ink,
          }}
        >
          {kind === "birthday" ? "Birthday" : "Your own entry"}
        </Text>
        <Text style={{ marginTop: 8, fontSize: 15, color: T.muted }}>
          {date
            ? kind === "birthday" && parsed
              ? `Repeats every year on ${formatBirthdayDate(parsed.month, parsed.day)}. Shows on the General tab.`
              : `Lands on ${formatLongDate(date)}. Dates, reminders, wins — anything you want on the shared month.`
            : "Pick a day from the calendar first."}
        </Text>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            padding: 4,
            backgroundColor: "rgba(22,24,29,0.05)",
            borderWidth: 1,
            borderColor: "rgba(22,24,29,0.1)",
          }}
        >
          {(
            [
              { id: "note" as const, label: "Note" },
              { id: "birthday" as const, label: "Birthday" },
            ] as const
          ).map((tab) => {
            const on = kind === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  setKind(tab.id);
                  setLeads(null);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  backgroundColor: on ? "#C23B55" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: on ? "#FFFFFF" : "#16181D",
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {kind === "note" ? (
          <>
            <FieldLabel>Title</FieldLabel>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Date night at home"
              placeholderTextColor="rgba(22,24,29,0.35)"
              style={inputStyle}
            />

            <FieldLabel>Notes</FieldLabel>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional details"
              placeholderTextColor="rgba(22,24,29,0.35)"
              multiline
              style={{ ...inputStyle, minHeight: 110, paddingTop: 12, textAlignVertical: "top" }}
            />

            <FieldLabel>When</FieldLabel>
            <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
              {(
                [
                  { id: true, label: "All day" },
                  { id: false, label: "Set a time" },
                ] as const
              ).map((row) => {
                const on = allDay === row.id;
                return (
                  <Pressable
                    key={String(row.id)}
                    onPress={() => setAllDay(row.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: on ? "#C23B55" : "rgba(22,24,29,0.12)",
                      backgroundColor: on ? "rgba(194,59,85,0.08)" : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: on ? "#C23B55" : "#16181D",
                      }}
                    >
                      {row.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {allDay ? null : <TimeField value={time} onChange={setTime} />}
          </>
        ) : (
          <>
            <FieldLabel>Name</FieldLabel>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Aunt May"
              placeholderTextColor="rgba(22,24,29,0.35)"
              style={inputStyle}
            />

            <FieldLabel>Circle</FieldLabel>
            <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
              {(
                [
                  { id: "family" as const, label: "Family" },
                  { id: "friends" as const, label: "Friends" },
                ] as const
              ).map((row) => {
                const on = circle === row.id;
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => setCircle(row.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: on ? "#C23B55" : "rgba(22,24,29,0.12)",
                      backgroundColor: on ? "rgba(194,59,85,0.08)" : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: on ? "#C23B55" : "#16181D",
                      }}
                    >
                      {row.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <FieldLabel>Birth year · optional</FieldLabel>
            <TextInput
              value={yearText}
              onChangeText={setYearText}
              placeholder="e.g. 1994"
              placeholderTextColor="rgba(22,24,29,0.35)"
              keyboardType="number-pad"
              style={inputStyle}
            />
            {previewTurns != null ? (
              <Text style={{ marginTop: 8, fontSize: 14, color: T.muted }}>
                Turns {previewTurns} this year
              </Text>
            ) : (
              <Text style={{ marginTop: 8, fontSize: 14, color: T.muted }}>
                Leave blank if you just want the date.
              </Text>
            )}
          </>
        )}

        <FieldLabel>Remind me</FieldLabel>
        <Text style={{ marginTop: 6, fontSize: 13, color: T.muted, lineHeight: 18 }}>
          {kind === "birthday"
            ? "We’ll ping this phone before their day. 1 day before is on by default."
            : "Optional. 15 minutes before needs a time on the note."}
        </Text>
        <ReminderLeads
          value={reminderLeads}
          allDay={kind === "birthday" ? true : allDay}
          onChange={setLeads}
        />

        {error ? (
          <Text style={{ marginTop: 12, fontSize: 14, color: T.accent }}>
            {error}
          </Text>
        ) : null}

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={
              saving
                ? "Saving…"
                : kind === "birthday"
                  ? "Add birthday"
                  : "Add to day"
            }
            onPress={() =>
              void (kind === "birthday" ? saveBirthday() : saveNote())
            }
            disabled={saving || !date}
          />
        </View>
      </View>
    </Screen>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        marginTop: 18,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 2,
        textTransform: "uppercase",
        color: "rgba(22,24,29,0.4)",
      }}
    >
      {children}
    </Text>
  );
}

const inputStyle = {
  marginTop: 8,
  height: 48,
  borderWidth: 1,
  borderColor: "rgba(22,24,29,0.14)",
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 14,
  fontSize: 16,
  color: T.ink,
} as const;

function TimeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  if (Platform.OS === "web") {
    return createElement("input", {
      type: "time",
      value,
      onChange: (event: { target: { value: string } }) =>
        onChange(event.target.value || "09:00"),
      style: {
        ...inputStyle,
        width: "100%",
        boxSizing: "border-box",
        outline: "none",
        colorScheme: "light",
      },
    });
  }
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="09:00"
      placeholderTextColor="rgba(22,24,29,0.35)"
      style={inputStyle}
    />
  );
}
