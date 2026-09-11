import { defaultHappenedAt } from "@/lib/calendar-activity";
import { HUB_TONES } from "@/lib/app-themes";
import { formatLongDate } from "@/lib/dates";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui/Screen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = HUB_TONES.calendar;

export default function CalendarAddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const date =
    typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : null;
  const { addCalendarEvent } = useApp();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
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
        happenedAt: defaultHappenedAt(date),
      });
      router.replace(
        `/hub/calendar-item?kind=custom&id=${encodeURIComponent(row.id)}` as Href
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
          Your own entry
        </Text>
        <Text style={{ marginTop: 8, fontSize: 15, color: T.muted }}>
          {date
            ? `Lands on ${formatLongDate(date)}. Dates, reminders, wins — anything you want on the shared month.`
            : "Pick a day from the calendar first."}
        </Text>

        <Text
          style={{
            marginTop: 24,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(22,24,29,0.4)",
          }}
        >
          Title
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Date night at home"
          placeholderTextColor="rgba(22,24,29,0.35)"
          style={{
            marginTop: 8,
            height: 48,
            borderWidth: 1,
            borderColor: "rgba(22,24,29,0.14)",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            fontSize: 16,
            color: T.ink,
          }}
        />

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
          Notes
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional details"
          placeholderTextColor="rgba(22,24,29,0.35)"
          multiline
          style={{
            marginTop: 8,
            minHeight: 110,
            borderWidth: 1,
            borderColor: "rgba(22,24,29,0.14)",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 14,
            paddingTop: 12,
            fontSize: 16,
            color: T.ink,
            textAlignVertical: "top",
          }}
        />

        {error ? (
          <Text style={{ marginTop: 12, fontSize: 14, color: T.accent }}>
            {error}
          </Text>
        ) : null}

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={saving ? "Saving…" : "Add to day"}
            onPress={() => void save()}
            disabled={saving || !date}
          />
        </View>
      </View>
    </Screen>
  );
}
