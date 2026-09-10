import { Image, Text, View } from "react-native";

type Props = {
  size?: number;
};

/** Tight crop of the flaming D; width / height of duoma-d.png */
const MARK_ASPECT = 598 / 656;

export function DuomaLogo({ size = 44 }: Props) {
  const height = Math.round(size * 1.04);
  const width = Math.round(height * MARK_ASPECT);

  return (
    <View className="flex-row items-center justify-center" accessibilityRole="header">
      <Image
        source={require("@/assets/images/duoma-d.png")}
        style={{
          width,
          height,
          marginRight: Math.round(size * 0.02),
        }}
        resizeMode="contain"
        accessibilityLabel="Duoma"
      />
      <Text
        style={{
          fontSize: size,
          lineHeight: height,
          fontWeight: "900",
          color: "#F4F4F6",
          letterSpacing: -0.8,
          textShadowColor: "rgba(255,0,127,0.75)",
          textShadowRadius: 12,
          textShadowOffset: { width: 0, height: 0 },
        }}
      >
        UOMA
      </Text>
    </View>
  );
}
