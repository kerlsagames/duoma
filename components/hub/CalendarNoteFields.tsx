import {
  CALENDAR_COVERS,
  CALENDAR_REPEATS,
  coversLabel,
  repeatLabel,
  type CalendarCovers,
  type CalendarRepeat,
} from "@/lib/calendar-repeat";
import { Pressable, Text, View } from "react-native";

const ACCENT = "#C23B55";

function Chip({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: on ? ACCENT : "rgba(22,24,29,0.12)",
        backgroundColor: on ? "rgba(194,59,85,0.08)" : "#FFFFFF",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: on ? ACCENT : "#16181D",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Label({ children }: { children: string }) {
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

export function CalendarNoteFields({
  repeat,
  covers,
  onRepeat,
  onCovers,
}: {
  repeat: CalendarRepeat;
  covers: CalendarCovers;
  onRepeat: (value: CalendarRepeat) => void;
  onCovers: (value: CalendarCovers) => void;
}) {
  return (
    <View>
      <Label>Repeats</Label>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {CALENDAR_REPEATS.map((id) => (
          <Chip
            key={id}
            label={id === "none" ? "Once" : repeatLabel(id)}
            on={repeat === id}
            onPress={() => onRepeat(id)}
          />
        ))}
      </View>
      <Label>Who it covers</Label>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {CALENDAR_COVERS.map((id) => (
          <Chip
            key={id}
            label={coversLabel(id)}
            on={covers === id}
            onPress={() => onCovers(id)}
          />
        ))}
      </View>
    </View>
  );
}

export function CoversFilter({
  value,
  onChange,
}: {
  value: CalendarCovers;
  onChange: (value: CalendarCovers) => void;
}) {
  return (
    <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {CALENDAR_COVERS.map((id) => (
        <Chip
          key={id}
          label={coversLabel(id)}
          on={value === id}
          onPress={() => onChange(id)}
        />
      ))}
    </View>
  );
}
