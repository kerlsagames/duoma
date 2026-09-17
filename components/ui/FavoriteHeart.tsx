import { Ionicons } from "@expo/vector-icons";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

export function FavoriteHeart({
  on,
  color,
  onToggle,
  size = 18,
  style,
}: {
  on: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityLabel={on ? "Remove from favourites" : "Save to favourites"}
      accessibilityRole="button"
      style={[
        {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Ionicons name={on ? "heart" : "heart-outline"} size={size} color={color} />
    </Pressable>
  );
}

export const favoriteHeartCorner = {
  position: "absolute" as const,
  top: 6,
  right: 6,
  zIndex: 2,
};
