import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text } from "react-native";

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
      <Text
        style={{
          fontSize: size,
          lineHeight: size + 4,
          textAlign: "center",
        }}
      >
        {emoji}
      </Text>
    );
  }
  return <Ionicons name={icon} size={size} color={color} />;
}
