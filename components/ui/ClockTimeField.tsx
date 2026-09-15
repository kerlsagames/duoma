import { createElement } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ink?: string;
  muted?: string;
  accent?: string;
  background?: string;
  allowClear?: boolean;
};

/** Native clock on web (same as calendar notes). Stores `HH:mm`. */
export function ClockTimeField({
  label,
  value,
  onChange,
  ink = "#E8EEF4",
  muted = "rgba(232,238,244,0.55)",
  accent = "#3D8BDB",
  background = "#0F1822",
  allowClear = true,
}: Props) {
  const clock = toClockInput(value);

  return (
    <View style={{ marginTop: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
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
        {allowClear && clock ? (
          <Pressable onPress={() => onChange("")} hitSlop={8}>
            <Text style={{ fontSize: 12, color: accent, fontWeight: "700" }}>
              No time
            </Text>
          </Pressable>
        ) : null}
      </View>
      {Platform.OS === "web" ? (
        createElement("input", {
          type: "time",
          value: clock,
          onChange: (event: { target: { value: string } }) =>
            onChange(event.target.value),
          style: {
            height: 48,
            width: "100%",
            boxSizing: "border-box",
            borderRadius: 12,
            border: "1px solid rgba(232,238,244,0.12)",
            background,
            paddingLeft: 14,
            paddingRight: 14,
            fontSize: 16,
            color: ink,
            outline: "none",
            colorScheme: "dark",
          },
        })
      ) : (
        <TextInput
          value={clock}
          onChangeText={onChange}
          placeholder="09:00"
          placeholderTextColor={muted}
          keyboardType="numbers-and-punctuation"
          style={{
            height: 48,
            borderRadius: 12,
            paddingHorizontal: 14,
            backgroundColor: background,
            color: ink,
            fontSize: 16,
          }}
        />
      )}
    </View>
  );
}

export function toClockInput(time: string): string {
  const trimmed = time.trim();
  if (!trimmed) return "";
  const twentyFour = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (twentyFour) {
    const hour = Number(twentyFour[1]);
    const minute = Number(twentyFour[2]);
    if (hour > 23 || minute > 59) return "";
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  const twelve = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(trimmed);
  if (!twelve) return "";
  let hour = Number(twelve[1]);
  const minute = Number(twelve[2] ?? "0");
  const ampm = twelve[3]!.toUpperCase();
  if (hour < 1 || hour > 12 || minute > 59) return "";
  if (ampm === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatClockLabel(time: string): string {
  const clock = toClockInput(time);
  if (!clock) return time.trim();
  const [hourText, minuteText] = clock.split(":");
  let hour = Number(hourText);
  const minute = Number(minuteText);
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;
}
