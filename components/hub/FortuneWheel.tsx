import { SERIF } from "@/lib/app-themes";
import { useMemo } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

export type WheelSlice = {
  label: string;
  color: string;
};

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

export function FortuneWheel({
  slices,
  rotation,
  size = 280,
}: {
  slices: WheelSlice[];
  rotation: Animated.Value;
  size?: number;
}) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const angle = 360 / Math.max(slices.length, 1);

  const labels = useMemo(() => slices, [slices]);

  const spin = rotation.interpolate({
    inputRange: [0, 36000],
    outputRange: ["0deg", "36000deg"],
  });

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 10,
          borderRightWidth: 10,
          borderTopWidth: 18,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#F4F4F6",
          zIndex: 2,
          marginBottom: -8,
        }}
      />
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size}>
          <G>
            {labels.map((slice, index) => {
              const start = index * angle;
              const end = start + angle;
              const mid = start + angle / 2;
              const textPos = polar(cx, cy, r * 0.62, mid);
              const short =
                slice.label.length > 16 ? `${slice.label.slice(0, 14)}…` : slice.label;
              return (
                <G key={`${slice.label}-${index}`}>
                  <Path
                    d={slicePath(cx, cy, r, start, end)}
                    fill={slice.color}
                    opacity={0.92}
                  />
                  <SvgText
                    x={textPos.x}
                    y={textPos.y}
                    fill="#120C10"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {short}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </Animated.View>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          color: "rgba(244,244,246,0.4)",
          fontSize: 12,
        }}
      >
        pointer at the top decides
      </Text>
    </View>
  );
}
