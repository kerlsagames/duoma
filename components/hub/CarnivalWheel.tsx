import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

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

export function CarnivalWheel({
  slices,
  rotation,
  size = 300,
  bulbColor = "#FFE38A",
}: {
  slices: WheelSlice[];
  rotation: Animated.Value;
  size?: number;
  bulbColor?: string;
}) {
  const r = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;
  const angle = 360 / Math.max(slices.length, 1);
  const blink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 1,
          duration: 280,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  const spin = rotation.interpolate({
    inputRange: [0, 36000],
    outputRange: ["0deg", "36000deg"],
  });

  const bulbs = Array.from({ length: 18 }, (_, i) => {
    const p = polar(cx, cy, size / 2 - 8, i * (360 / 18));
    return { ...p, on: i % 2 === 0 };
  });

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 22,
          height: 28,
          backgroundColor: "#F4E7C5",
          borderRadius: 3,
          zIndex: 3,
          marginBottom: -14,
          borderWidth: 2,
          borderColor: "#C9A24A",
        }}
      />
      <View
        style={{
          padding: 8,
          borderRadius: size,
          backgroundColor: "#2A1A10",
          borderWidth: 6,
          borderColor: "#C9A24A",
        }}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={size} height={size}>
            <Circle cx={cx} cy={cy} r={size / 2 - 2} fill="#1A100C" />
            {slices.map((slice, index) => {
              const start = index * angle;
              const end = start + angle;
              const mid = start + angle / 2;
              const textPos = polar(cx, cy, r * 0.58, mid);
              const short = slice.label.split(" ")[0] ?? slice.label;
              return (
                <G key={`${slice.label}-${index}`}>
                  <Path
                    d={slicePath(cx, cy, r, start, end)}
                    fill={slice.color}
                    stroke="#1A100C"
                    strokeWidth={1.5}
                  />
                  <SvgText
                    x={textPos.x}
                    y={textPos.y}
                    fill="#1A100C"
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {short.slice(0, 9)}
                  </SvgText>
                </G>
              );
            })}
            <Circle cx={cx} cy={cy} r={22} fill="#F4E7C5" stroke="#C9A24A" strokeWidth={4} />
            <Circle cx={cx} cy={cy} r={6} fill="#8B1E1E" />
            {bulbs.map((b, i) => (
              <Circle
                key={i}
                cx={b.x}
                cy={b.y}
                r={4}
                fill={bulbColor}
                opacity={b.on ? 1 : 0.35}
              />
            ))}
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}
