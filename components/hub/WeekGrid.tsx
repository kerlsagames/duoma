import type { CalendarMark } from "@/lib/calendar-activity";
import { CALENDAR_MARK_COLOR } from "@/components/hub/MonthGrid";
import { Pressable, Text, View } from "react-native";

type Day = { date: string; day: number };

type Props = {
  days: Day[];
  marks: Record<string, CalendarMark[]>;
  selected: string;
  today: string;
  onSelect: (date: string) => void;
  compact?: boolean;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeekGrid({ days, marks, selected, today, onSelect, compact = false }: Props) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "rgba(22,24,29,0.14)",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        flexDirection: "row",
      }}
    >
      {days.map((cell, index) => {
        const kinds = marks[cell.date] ?? [];
        const on = selected === cell.date;
        const isToday = today === cell.date;
        const isLast = index === days.length - 1;
        return (
          <Pressable
            key={cell.date}
            onPress={() => onSelect(cell.date)}
            style={{
              flex: 1,
              minHeight: compact ? 64 : 96,
              borderRightWidth: isLast ? 0 : 1,
              borderColor: "rgba(22,24,29,0.12)",
              backgroundColor: on
                ? "rgba(194,59,85,0.12)"
                : isToday
                  ? "rgba(61,126,166,0.08)"
                  : "#FFFFFF",
              paddingTop: 8,
              paddingBottom: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 0.6,
                color: on ? "#C23B55" : "rgba(22,24,29,0.45)",
              }}
            >
              {WEEKDAYS[index]}
            </Text>
            <View
              style={{
                marginTop: 6,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? "#C23B55" : "transparent",
                borderWidth: !on && isToday ? 1.5 : 0,
                borderColor: "#3D7EA6",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: on ? "#FFFFFF" : "#16181D",
                }}
              >
                {cell.day}
              </Text>
            </View>
            <View
              style={{
                marginTop: 8,
                height: 8,
                flexDirection: "row",
                gap: 3,
                alignItems: "center",
              }}
            >
              {kinds.slice(0, 4).map((kind) => (
                <View
                  key={kind}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: CALENDAR_MARK_COLOR[kind] ?? "#16181D",
                  }}
                />
              ))}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
