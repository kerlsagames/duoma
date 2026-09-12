import type { CalendarMark } from "@/lib/calendar-activity";
import { Pressable, Text, View } from "react-native";

type Cell = { date: string; day: number } | null;

type Props = {
  cells: Cell[];
  marks: Record<string, CalendarMark[]>;
  selected?: string | null;
  today?: string | null;
  onSelect: (date: string) => void;
  /** Tighter cells for the split layout. */
  compact?: boolean;
};

const MARK_COLOR: Record<CalendarMark, string> = {
  play: "#C23B55",
  checkin: "#3D7EA6",
  milestone: "#B8860B",
  date: "#2F8F6B",
  ritual: "#6B5B95",
  talk: "#C2784A",
  list: "#4A6FA5",
  dare: "#C23B55",
  coupon: "#B8860B",
  jar: "#8B5A2B",
  curiosity: "#3D7EA6",
  custom: "#16181D",
  scratch: "#2F8F6B",
  birthday: "#E07A8A",
  trip: "#1E4D8C",
  job: "#C4A574",
};

export function MonthGrid({
  cells,
  marks,
  selected,
  today,
  onSelect,
  compact = false,
}: Props) {
  const cellMin = compact ? 40 : 58;
  const daySize = compact ? 22 : 28;
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "rgba(22,24,29,0.14)",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(22,24,29,0.14)",
          backgroundColor: "#EEF1F5",
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <Text
            key={`${label}-${index}`}
            style={{
              flex: 1,
              textAlign: "center",
              paddingVertical: compact ? 6 : 10,
              fontSize: compact ? 10 : 11,
              fontWeight: "700",
              letterSpacing: 1,
              color: "rgba(22,24,29,0.45)",
            }}
          >
            {label}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((cell, index) => {
          const isLastCol = index % 7 === 6;
          const row = Math.floor(index / 7);
          const rows = Math.ceil(cells.length / 7);
          const isLastRow = row === rows - 1;
          if (!cell) {
            return (
              <View
                key={`empty-${index}`}
                style={{
                  width: "14.2857%",
                  minHeight: cellMin,
                  borderRightWidth: isLastCol ? 0 : 1,
                  borderBottomWidth: isLastRow ? 0 : 1,
                  borderColor: "rgba(22,24,29,0.12)",
                  backgroundColor: "#F7F8FA",
                }}
              />
            );
          }
          const kinds = marks[cell.date] ?? [];
          const on = selected === cell.date;
          const isToday = today === cell.date;
          return (
            <Pressable
              key={cell.date}
              onPress={() => onSelect(cell.date)}
              style={{
                width: "14.2857%",
                minHeight: cellMin,
                borderRightWidth: isLastCol ? 0 : 1,
                borderBottomWidth: isLastRow ? 0 : 1,
                borderColor: "rgba(22,24,29,0.12)",
                backgroundColor: on
                  ? "rgba(194,59,85,0.12)"
                  : isToday
                    ? "rgba(61,126,166,0.08)"
                    : "#FFFFFF",
                paddingTop: compact ? 4 : 8,
                paddingBottom: compact ? 4 : 6,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: daySize,
                  height: daySize,
                  borderRadius: daySize / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: on ? "#C23B55" : "transparent",
                  borderWidth: !on && isToday ? 1.5 : 0,
                  borderColor: "#3D7EA6",
                }}
              >
                <Text
                  style={{
                    fontSize: compact ? 12 : 14,
                    fontWeight: "600",
                    color: on ? "#FFFFFF" : "#16181D",
                  }}
                >
                  {cell.day}
                </Text>
              </View>
              <View
                style={{
                  marginTop: compact ? 2 : 4,
                  height: compact ? 6 : 8,
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
                      backgroundColor: MARK_COLOR[kind] ?? "#16181D",
                    }}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
