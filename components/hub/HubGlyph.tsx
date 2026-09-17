import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Platform, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function HubGlyph({
  icon,
  emoji,
  size,
  color,
}: {
  icon: IconName;
  emoji?: string;
  size: number;
  color: string;
}) {
  if (emoji) {
    return (
      <View
        style={{
          width: size + 4,
          height: size + 4,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          ...(Platform.OS === "web" ? ({ isolation: "isolate" } as const) : null),
        }}
      >
        <Text
          style={{
            fontSize: size,
            lineHeight: size + 4,
            textAlign: "center",
            ...(Platform.OS === "web"
              ? ({ filter: "grayscale(1) contrast(1.25) brightness(1.05)" } as const)
              : null),
          }}
        >
          {emoji}
        </Text>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: color,
            mixBlendMode: "color",
          }}
        />
      </View>
    );
  }
  return <Ionicons name={icon} size={size} color={color} />;
}
