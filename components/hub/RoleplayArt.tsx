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
        marginTop: 12,
        height: 148,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#1A0C12",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={roleplayArtSource(roleplayId, category)}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
