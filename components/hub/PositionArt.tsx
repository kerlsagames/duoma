import type { SexPosition } from "@/lib/sex-positions";
import { Text, View } from "react-native";

/** Male cue color for the Positions legend. */
export const POSITION_M_COLOR = "#6E9CFF";
/** Female cue color for the Positions legend. */
export const POSITION_F_COLOR = "#FF7FA8";

/**
 * Illustration placeholder — AI / silhouette art was removed until we have
 * a direction that isn't creepy or unclear. Text + legend carry the pose.
 */
export function PositionArt({
  position,
  size = 260,
}: {
  position: SexPosition;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: Math.min(size, 160),
        alignSelf: "center",
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#140A12",
        borderWidth: 1,
        borderColor: "rgba(255,127,168,0.28)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: POSITION_M_COLOR,
          }}
        />
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: POSITION_F_COLOR,
          }}
        />
      </View>
      <Text
        style={{
          color: "rgba(244,244,246,0.55)",
          fontSize: 13,
          textAlign: "center",
          lineHeight: 18,
        }}
      >
        Pose guide art coming later — for now, follow the name and notes
        for {position.name}.
      </Text>
    </View>
  );
}
