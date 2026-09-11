import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  label?: string;
  color?: string;
  fallback?: Href;
  style?: StyleProp<ViewStyle>;
};

export function BackButton({
  label = "Back",
  color = "#FF007F",
  fallback = "/",
  style,
}: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace(fallback);
      }}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          gap: 2,
          paddingVertical: 2,
        },
        style,
      ]}
    >
      <Ionicons name="chevron-back" size={20} color={color} />
      <Text style={{ fontSize: 15, fontWeight: "600", color }}>{label}</Text>
    </Pressable>
  );
}
