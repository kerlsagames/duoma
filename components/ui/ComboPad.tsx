import { Pressable, Text, View } from "react-native";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "spacer", "0", "back"] as const;

type Props = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  accent?: string;
  ink?: string;
  keyBg?: string;
  keyBorder?: string;
  /** Filled dots only — never a text field the OS can save. */
  masked?: boolean;
};

export function ComboPad({
  value,
  onChange,
  maxLength = 6,
  accent = "#C5D0DA",
  ink = "#C5D0DA",
  keyBg = "#151C22",
  keyBorder = "rgba(197,208,218,0.28)",
  masked = true,
}: Props) {
  const digits = value.replace(/\D/g, "").slice(0, maxLength);
  const slots = Math.max(4, digits.length > 4 ? 6 : 4);

  const press = (key: "back" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9") => {
    if (key === "back") {
      onChange(digits.slice(0, -1));
      return;
    }
    if (digits.length >= maxLength) return;
    onChange(digits + key);
  };

  return (
    <View style={{ width: "100%", maxWidth: 280, alignSelf: "center", marginTop: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 10,
          marginBottom: 16,
          minHeight: 18,
        }}
      >
        {Array.from({ length: slots }, (_, i) => {
          const on = i < digits.length;
          return (
            <View
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: on ? accent : "rgba(197,208,218,0.28)",
                backgroundColor: on ? accent : "transparent",
              }}
            />
          );
        })}
      </View>
      {!masked && digits ? (
        <Text
          style={{
            textAlign: "center",
            color: ink,
            letterSpacing: 8,
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 10,
          }}
        >
          {digits}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
        {KEYS.map((key) => {
          if (key === "spacer") {
            return <View key={key} style={{ width: "31%", aspectRatio: 1.15, margin: "1.1%" }} />;
          }
          const label = key === "back" ? "⌫" : key;
          return (
            <Pressable
              key={key}
              onPress={() => press(key)}
              accessibilityRole="button"
              accessibilityLabel={key === "back" ? "Delete last digit" : `Digit ${key}`}
              style={{
                width: "31%",
                aspectRatio: 1.15,
                margin: "1.1%",
                borderRadius: 16,
                backgroundColor: keyBg,
                borderWidth: 1,
                borderColor: keyBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: ink,
                  fontSize: key === "back" ? 22 : 24,
                  fontWeight: "800",
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
