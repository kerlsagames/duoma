import { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native";

const ROW = 40;
const VISIBLE = 4;

type ColumnProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  ink?: string;
  muted?: string;
  flex?: number;
};

function WheelColumn({
  options,
  value,
  onChange,
  ink = "#E8EEF4",
  muted = "rgba(232,238,244,0.35)",
  flex = 1,
}: ColumnProps) {
  const ref = useRef<ScrollView>(null);
  const index = Math.max(0, options.indexOf(value));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ref.current?.scrollTo({ y: index * ROW, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [index, options.length]);

  const webScroll: ViewStyle | undefined =
    Platform.OS === "web"
      ? ({
          overflowY: "auto",
          overscrollBehavior: "contain",
          scrollSnapType: "y mandatory",
        } as ViewStyle)
      : undefined;

  return (
    <View
      style={{ flex, height: ROW * VISIBLE }}
      // @ts-expect-error RN web — keep the sheet from stealing the wheel
      onWheel={(event: { stopPropagation?: () => void }) => {
        event.stopPropagation?.();
      }}
    >
      <ScrollView
        ref={ref}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        snapToInterval={ROW}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        style={webScroll}
      >
        {options.map((option) => {
          const on = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={{
                height: ROW,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 8,
                borderRadius: 10,
                backgroundColor: on ? "rgba(232,238,244,0.10)" : "transparent",
                ...(Platform.OS === "web"
                  ? ({ scrollSnapAlign: "start" } as ViewStyle)
                  : null),
              }}
            >
              <Text
                style={{
                  color: on ? ink : muted,
                  fontSize: 16,
                  fontWeight: on ? "700" : "500",
                  fontVariant: ["tabular-nums"],
                }}
                numberOfLines={1}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function FieldLabel({ label, muted }: { label: string; muted: string }) {
  return (
    <Text
      style={{
        fontFamily: "SpaceMono",
        fontSize: 10,
        letterSpacing: 1.2,
        color: muted,
        marginBottom: 6,
      }}
    >
      {label.toUpperCase()}
    </Text>
  );
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseDateKey(
  value: string
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1) return null;
  return { year, month, day };
}

function toDateKey(year: number, month: number, day: number): string {
  const max = daysInMonth(year, month);
  const safeDay = Math.min(day, max);
  return `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

export function ScrollDateField({
  label,
  value,
  onChange,
  ink = "#E8EEF4",
  muted = "rgba(232,238,244,0.55)",
  accent = "#3D8BDB",
  background = "#0F1822",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ink?: string;
  muted?: string;
  accent?: string;
  background?: string;
}) {
  const now = new Date();
  const parsed = parseDateKey(value);
  const year = parsed?.year ?? now.getFullYear();
  const month = parsed?.month ?? now.getMonth() + 1;
  const day = Math.min(parsed?.day ?? now.getDate(), daysInMonth(year, month));

  const years = Array.from({ length: 8 }, (_, i) => String(now.getFullYear() - 1 + i));
  const dayOptions = Array.from({ length: daysInMonth(year, month) }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const set = (nextYear: number, nextMonth: number, nextDay: number) => {
    onChange(toDateKey(nextYear, nextMonth, nextDay));
  };

  return (
    <View style={{ marginTop: 12 }}>
      <FieldLabel label={label} muted={muted} />
      <View
        style={{
          borderRadius: 14,
          backgroundColor: background,
          paddingHorizontal: 6,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "stretch",
          height: ROW * VISIBLE + 12,
          gap: 10,
        }}
      >
        <WheelColumn
          flex={1.4}
          options={MONTHS}
          value={MONTHS[month - 1]!}
          onChange={(labelValue) => {
            const nextMonth = MONTHS.indexOf(labelValue) + 1;
            set(year, nextMonth, day);
          }}
          ink={ink}
          muted={muted}
        />
        <WheelColumn
          flex={0.8}
          options={dayOptions}
          value={String(day).padStart(2, "0")}
          onChange={(next) => set(year, month, Number(next))}
          ink={ink}
          muted={muted}
        />
        <WheelColumn
          flex={1}
          options={years}
          value={String(year)}
          onChange={(next) => set(Number(next), month, day)}
          ink={ink}
          muted={muted}
        />
      </View>
      <PressClear value={value} onClear={() => onChange("")} muted={muted} accent={accent} />
    </View>
  );
}

export function ScrollTimeField({
  label,
  value,
  onChange,
  ink = "#E8EEF4",
  muted = "rgba(232,238,244,0.55)",
  accent = "#3D8BDB",
  background = "#0F1822",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ink?: string;
  muted?: string;
  accent?: string;
  background?: string;
}) {
  const parsed = parseDisplayTime(value) ?? { hour: 12, minute: 0, ampm: "PM" as const };
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
  const ampmOptions = ["AM", "PM"];

  const emit = (hour: number, minute: number, ampm: "AM" | "PM") => {
    onChange(`${hour}:${String(minute).padStart(2, "0")} ${ampm}`);
  };

  const minuteValue = String(
    Math.min(55, Math.max(0, Math.round(parsed.minute / 5) * 5))
  ).padStart(2, "0");

  return (
    <View style={{ marginTop: 12 }}>
      <FieldLabel label={label} muted={muted} />
      <View
        style={{
          borderRadius: 14,
          backgroundColor: background,
          paddingHorizontal: 6,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "stretch",
          height: ROW * VISIBLE + 12,
          gap: 10,
        }}
      >
        <WheelColumn
          options={hours}
          value={String(parsed.hour)}
          onChange={(next) => emit(Number(next), parsed.minute, parsed.ampm)}
          ink={ink}
          muted={muted}
        />
        <WheelColumn
          options={minutes}
          value={minuteValue}
          onChange={(next) => emit(parsed.hour, Number(next), parsed.ampm)}
          ink={ink}
          muted={muted}
        />
        <WheelColumn
          options={ampmOptions}
          value={parsed.ampm}
          onChange={(next) => emit(parsed.hour, parsed.minute, next as "AM" | "PM")}
          ink={ink}
          muted={muted}
        />
      </View>
      <PressClear value={value} onClear={() => onChange("")} muted={muted} accent={accent} />
    </View>
  );
}

function PressClear({
  value,
  onClear,
  muted,
  accent,
}: {
  value: string;
  onClear: () => void;
  muted: string;
  accent: string;
}) {
  if (!value) {
    return (
      <Text style={{ marginTop: 6, color: muted, fontSize: 12 }}>
        Tap a row — leave blank if you want.
      </Text>
    );
  }
  return (
    <Text
      onPress={onClear}
      style={{ marginTop: 6, color: accent, fontSize: 12, fontWeight: "600" }}
    >
      Clear · {value}
    </Text>
  );
}

function parseDisplayTime(
  value: string
): { hour: number; minute: number; ampm: "AM" | "PM" } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match =
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(trimmed) ||
    /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  let ampm: "AM" | "PM" = "AM";
  if (match[3]) {
    ampm = match[3].toUpperCase() as "AM" | "PM";
  } else if (hour === 0) {
    hour = 12;
    ampm = "AM";
  } else if (hour === 12) {
    ampm = "PM";
  } else if (hour > 12) {
    hour -= 12;
    ampm = "PM";
  }
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  return { hour, minute, ampm };
}
