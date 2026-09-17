import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export function FavoriteHeart({
  on,
  color,
  onToggle,
  size = 22,
}: {
  on: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={10}
      accessibilityLabel={on ? "Remove from favourites" : "Save to favourites"}
      accessibilityRole="button"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={on ? "heart" : "heart-outline"} size={size} color={color} />
    </Pressable>
  );
}
