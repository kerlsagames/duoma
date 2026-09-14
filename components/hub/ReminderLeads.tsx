import {
  REMINDER_LEAD_OPTIONS,
  leadsForItem,
  reminderItemKey,
  toggleReminderLead,
  type ReminderLead,
  type ReminderTargetKind,
} from "@/lib/calendar-reminders";
import { useCalendarPrefs } from "@/lib/useCalendarPrefs";
import { Pressable, Text, View } from "react-native";

type Props = {
  value: ReminderLead[];
  onChange: (next: ReminderLead[]) => void;
  allDay?: boolean;
};

export function ReminderLeads({ value, onChange, allDay = true }: Props) {
  return (
    <View style={{ marginTop: 8, gap: 8 }}>
      {REMINDER_LEAD_OPTIONS.map((row) => {
        const on = value.includes(row.id);
        return (
          <Pressable
            key={row.id}
            onPress={() => onChange(toggleReminderLead(value, row.id))}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: on ? "#C23B55" : "rgba(22,24,29,0.1)",
              backgroundColor: on ? "rgba(194,59,85,0.08)" : "#FFFFFF",
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
              {allDay ? row.allDayLabel : row.label}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: on ? "#C23B55" : "rgba(22,24,29,0.35)",
              }}
            >
              {on ? "On" : "Off"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ItemReminders({
  kind,
  id,
  allDay = true,
}: {
  kind: ReminderTargetKind;
  id: string;
  allDay?: boolean;
}) {
  const { prefs, save, ready } = useCalendarPrefs();
  if (!ready) return null;
  const value = leadsForItem(prefs, kind, id);
  return (
    <View style={{ marginTop: 22 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(22,24,29,0.4)",
        }}
      >
        Remind me
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontSize: 13,
          color: "rgba(22,24,29,0.5)",
          lineHeight: 18,
        }}
      >
        {allDay
          ? "All-day items use 9:00 that morning as the time."
          : "Times are on this phone’s clock."}
      </Text>
      <ReminderLeads
        value={value}
        allDay={allDay}
        onChange={(next) =>
          save({
            ...prefs,
            itemLeads: {
              ...prefs.itemLeads,
              [reminderItemKey(kind, id)]: next,
            },
          })
        }
      />
    </View>
  );
}
