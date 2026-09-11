import type { SexPosition } from "@/lib/sex-positions";
import { Image, type ImageSourcePropType, View } from "react-native";

/** Male cue color for the Positions legend. */
export const POSITION_M_COLOR = "#6E9CFF";
/** Female cue color for the Positions legend. */
export const POSITION_F_COLOR = "#FF7FA8";

/**
 * Flat editorial cut-paper illustrations (pink F / blue M).
 * Static map so Metro can bundle every pose.
 */
const IMAGES: Record<string, ImageSourcePropType> = {
  missionary: require("../../assets/images/positions/missionary.png"),
  lotus: require("../../assets/images/positions/lotus.png"),
  cowgirl: require("../../assets/images/positions/cowgirl.png"),
  folded: require("../../assets/images/positions/folded.png"),
  embrace: require("../../assets/images/positions/embrace.png"),
  legsup: require("../../assets/images/positions/legsup.png"),
  doggy: require("../../assets/images/positions/doggy.png"),
  spoon: require("../../assets/images/positions/spoon.png"),
  prone: require("../../assets/images/positions/prone.png"),
  kneel: require("../../assets/images/positions/kneel.png"),
  edgerear: require("../../assets/images/positions/edgerear.png"),
  standdog: require("../../assets/images/positions/standdog.png"),
  chair: require("../../assets/images/positions/chair.png"),
  straddle: require("../../assets/images/positions/straddle.png"),
  throne: require("../../assets/images/positions/throne.png"),
  couch: require("../../assets/images/positions/couch.png"),
  counter: require("../../assets/images/positions/counter.png"),
  wall: require("../../assets/images/positions/wall.png"),
  lift: require("../../assets/images/positions/lift.png"),
  bentstand: require("../../assets/images/positions/bentstand.png"),
  shower: require("../../assets/images/positions/shower.png"),
  "oral-kneel": require("../../assets/images/positions/oral-kneel.png"),
  facesit: require("../../assets/images/positions/facesit.png"),
  sixtynine: require("../../assets/images/positions/sixtynine.png"),
  edgeoral: require("../../assets/images/positions/edgeoral.png"),
  scissors: require("../../assets/images/positions/scissors.png"),
  cross: require("../../assets/images/positions/cross.png"),
  bridge: require("../../assets/images/positions/bridge.png"),
  table: require("../../assets/images/positions/table.png"),
  butterfly: require("../../assets/images/positions/butterfly.png"),
  foldedpress: require("../../assets/images/positions/foldedpress.png"),
};

export function PositionArt({
  position,
  size = 260,
}: {
  position: SexPosition;
  size?: number;
}) {
  const source = IMAGES[position.art];
  return (
    <View
      style={{
        width: size,
        height: size,
        alignSelf: "center",
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
      }}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="cover"
          accessibilityLabel={position.name}
        />
      ) : null}
    </View>
  );
}
