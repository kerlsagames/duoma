import { biomeLabel, type EdenSnapshot } from "@/lib/eden";
import { SERIF } from "@/lib/app-themes";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

const SKY = {
  dawn: "#F0B8A0",
  day: "#6FA8D4",
  golden: "#E09050",
  night: "#0B1024",
};

export function EdenFallback({
  snapshot,
  onHearth,
}: {
  snapshot: EdenSnapshot;
  onHearth: () => void;
}) {
  const sky = snapshot.dormancy ? "#2A3040" : SKY[snapshot.phase];
  const ink = snapshot.dormancy ? "#8AA0B4" : "#F4F0E8";
  return (
    <Pressable onPress={onHearth} style={{ flex: 1, backgroundColor: sky }}>
      <Svg width="100%" height="100%" viewBox="0 0 360 420">
        <Ellipse
          cx={180}
          cy={268}
          rx={172}
          ry={34}
          fill={snapshot.dormancy ? "#1C2A34" : "#163A52"}
        />
        <Ellipse
          cx={180}
          cy={246}
          rx={148}
          ry={52}
          fill={snapshot.dormancy ? "#3A4A40" : "#2F7A48"}
        />
        <Circle
          cx={180}
          cy={226}
          r={18}
          fill={snapshot.dormancy ? "#6A5040" : "#FF8A3A"}
        />
        <Rect
          x={174}
          y={228}
          width={12}
          height={22}
          rx={2}
          fill={snapshot.dormancy ? "#4A3A30" : "#6A3A22"}
        />
        {snapshot.biomes.meadow ? (
          <>
            <Path d="M62 236 Q88 176 114 236" fill={snapshot.dormancy ? "#355044" : "#3E9A52"} />
            <Path d="M96 240 Q118 188 140 240" fill={snapshot.dormancy ? "#2E4438" : "#4CB05E"} />
            <Circle cx={88} cy={198} r={5} fill={snapshot.dormancy ? "#6A7080" : "#7CFFB2"} />
            <Circle cx={118} cy={208} r={4} fill={snapshot.dormancy ? "#6A7080" : "#F2A0C8"} />
          </>
        ) : null}
        {snapshot.biomes.canopy ? (
          <>
            <Path d="M238 244 L248 168 L258 244 Z" fill={snapshot.dormancy ? "#4A4030" : "#8A5A32"} />
            <Circle cx={248} cy={168} r={22} fill={snapshot.dormancy ? "#3A4840" : "#2E8A4A"} />
            <Circle cx={232} cy={180} r={14} fill={snapshot.dormancy ? "#324038" : "#3E9A52"} />
          </>
        ) : null}
        {snapshot.biomes.crimson ? (
          <>
            <Circle cx={122} cy={206} r={12} fill={snapshot.dormancy ? "#5A3038" : "#C23B4A"} />
            <Circle cx={138} cy={214} r={7} fill={snapshot.dormancy ? "#4A2830" : "#FF6B4A"} />
          </>
        ) : null}
        {snapshot.biomes.lagoon ? (
          <Ellipse cx={268} cy={250} rx={34} ry={12} fill={snapshot.dormancy ? "#2A4858" : "#3ECFBF"} />
        ) : null}
        {snapshot.visuals.rainbow && !snapshot.dormancy ? (
          <Path d="M48 150 Q180 28 312 150" stroke="#F2A0C8" strokeWidth={3} fill="none" />
        ) : null}
        {snapshot.visuals.fireflies && !snapshot.dormancy ? (
          <>
            <Circle cx={150} cy={160} r={2.2} fill="#F0C75E" />
            <Circle cx={210} cy={148} r={1.8} fill="#F0C75E" />
            <Circle cx={190} cy={178} r={2} fill="#FFE28A" />
          </>
        ) : null}
      </Svg>
      <View style={{ position: "absolute", left: 16, right: 16, top: 12 }}>
        <Text style={{ color: ink, fontFamily: SERIF, fontSize: 20 }}>
          {biomeLabel(snapshot)}
        </Text>
        <Text style={{ marginTop: 4, color: "rgba(244,240,232,0.62)", fontSize: 12 }}>
          Pocket Ecosystem — flat view on this phone. The island still grows.
        </Text>
      </View>
    </Pressable>
  );
}

export function canUseWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    return Boolean(gl);
  } catch {
    return false;
  }
}
