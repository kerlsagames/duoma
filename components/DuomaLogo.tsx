import { Image, Text, View } from "react-native";

type Props = {
  size?: number;
};

/** Tight crop of the flaming D; width / height of duoma-d.png */
const MARK_ASPECT = 598 / 656;

export function DuomaLogo({ size = 44 }: Props) {
  const height = Math.round(size * 1.04);
  const width = Math.round(height * MARK_ASPECT);
  const wordSize = Math.round(size * 1.08);

  return (
    <View
      className="flex-row items-center justify-center"
      accessibilityRole="header"
      accessibilityLabel="Duoma"
    >
      <Image
        source={require("@/assets/images/duoma-d.png")}
        style={{
          width,
          height,
          marginRight: Math.round(size * 0.01),
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontFamily: "GreatVibes",
          fontSize: wordSize,
          lineHeight: height,
          color: "#F4F4F6",
          marginTop: Math.round(size * 0.12),
          letterSpacing: 0.5,
          textShadowColor: "rgba(255,0,127,0.45)",
          textShadowRadius: 10,
          textShadowOffset: { width: 0, height: 0 },
        }}
      >
        uoma
      </Text>
    </View>
  );
}
