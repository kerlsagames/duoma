import { addMonths, formatLongDate, formatMonthYear, localDateKey, monthGrid, parseDateKey } from "@/lib/dates";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ink?: string;
  muted?: string;
  accent?: string;
  background?: string;
  allowClear?: boolean;
  minDate?: string;
};

export function CalendarDateField({
  label,
  value,
  onChange,
  ink = "#E8EEF4",
  muted = "rgba(232,238,244,0.55)",
  accent = "#3D8BDB",
  background = "#0F1822",
  allowClear = true,
  minDate,
}: Props) {
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
  const initial = selected ? parseDateKey(selected) : new Date();
  const [cursor, setCursor] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });
  const today = localDateKey();
  const cells = useMemo(
    () => monthGrid(cursor.year, cursor.month),
    [cursor.month, cursor.year]
  );

  useEffect(() => {
    if (!selected) return;
    const date = parseDateKey(selected);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  }, [selected]);

  return (
    <View style={{ marginTop: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.2,
            color: muted,
          }}
        >
          {label.toUpperCase()}
        </Text>
        {allowClear && selected ? (
          <Pressable onPress={() => onChange("")} hitSlop={8}>
            <Text style={{ fontSize: 12, color: accent, fontWeight: "700" }}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text
        style={{
          marginBottom: 10,
          fontSize: 16,
          fontWeight: "600",
          color: selected ? ink : muted,
        }}
      >
        {selected ? formatLongDate(selected) : "Pick a day"}
      </Text>

      <View
        style={{
          borderRadius: 14,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(232,238,244,0.12)",
          backgroundColor: background,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 6,
            paddingVertical: 6,
          }}
        >
          <Pressable
            onPress={() => setCursor(addMonths(cursor.year, cursor.month, -1))}
            hitSlop={10}
            accessibilityLabel="Previous month"
            style={{ padding: 8 }}
          >
            <Ionicons name="chevron-back" size={18} color={accent} />
          </Pressable>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: ink,
            }}
          >
            {formatMonthYear(cursor.year, cursor.month)}
          </Text>
          <Pressable
            onPress={() => setCursor(addMonths(cursor.year, cursor.month, 1))}
            hitSlop={10}
            accessibilityLabel="Next month"
            style={{ padding: 8 }}
          >
            <Ionicons name="chevron-forward" size={18} color={accent} />
          </Pressable>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderColor: "rgba(232,238,244,0.1)",
          }}
        >
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <Text
              key={`${day}-${index}`}
              style={{
                flex: 1,
                textAlign: "center",
                paddingVertical: 6,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1,
                color: muted,
              }}
            >
              {day}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {cells.map((cell, index) => {
            if (!cell) {
              return (
                <View
                  key={`empty-${index}`}
                  style={{ width: "14.2857%", height: 36 }}
                />
              );
            }
            const on = selected === cell.date;
            const isToday = today === cell.date;
            const tooSoon = Boolean(minDate && cell.date < minDate);
            return (
              <Pressable
                key={cell.date}
                onPress={() => {
                  if (tooSoon) return;
                  onChange(cell.date);
                }}
                disabled={tooSoon}
                accessibilityLabel={formatLongDate(cell.date)}
                style={{
                  width: "14.2857%",
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: tooSoon ? 0.28 : 1,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: on ? accent : "transparent",
                    borderWidth: !on && isToday ? 1.5 : 0,
                    borderColor: accent,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: on ? "#071018" : ink,
                    }}
                  >
                    {cell.day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
