import { roleplayArtSource } from "@/lib/roleplay-art";
import type { RoleplayCategoryId } from "@/lib/roleplays";
import { Image, View } from "react-native";

export function RoleplayArt({
  roleplayId,
  category,
}: {
  roleplayId: string;
  category: RoleplayCategoryId;
}) {
  return (
    <View
      style={{
        marginTop: 16,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#1A0C12",
      }}
    >
      <Image
        source={roleplayArtSource(roleplayId, category)}
        style={{ width: "100%", aspectRatio: 4 / 3 }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
