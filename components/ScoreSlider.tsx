import { useCallback, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { clampScore } from "@/lib/lists";

type Props = {
  value: number;
  onChange: (value: number) => void;
  accent?: string;
  track?: string;
  labelColor?: string;
};

/**
 * 0–10 score slider with one-decimal precision (e.g. 7.6).
 * Works on native + web without an extra dependency.
 */
export function ScoreSlider({
  value,
  onChange,
  accent = "#FF6B4A",
  track = "rgba(243,255,251,0.18)",
  labelColor = "#F3FFFB",
}: Props) {
  const widthRef = useRef(0);
  const [width, setWidth] = useState(0);
  const score = clampScore(value);

  const setFromX = useCallback(
    (x: number) => {
      const w = widthRef.current;
      if (w <= 0) return;
      const ratio = Math.max(0, Math.min(1, x / w));
      onChange(clampScore(ratio * 10));
    },
    [onChange]
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    widthRef.current = next;
    setWidth(next);
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          setFromX(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          setFromX(event.nativeEvent.locationX);
        },
      }),
    [setFromX]
  );

  const fill = width > 0 ? (score / 10) * width : 0;
  const thumb = Math.max(0, Math.min(width - 22, fill - 11));

  return (
    <View>
      <Text
        style={{
          textAlign: "center",
          fontSize: 36,
          fontWeight: "700",
          color: labelColor,
          fontVariant: ["tabular-nums"],
        }}
      >
        {score.toFixed(1)}
        <Text style={{ fontSize: 18, color: "rgba(243,255,251,0.55)" }}> / 10</Text>
      </Text>

      <View
        onLayout={onLayout}
        {...pan.panHandlers}
        style={{
          marginTop: 16,
          height: 36,
          justifyContent: "center",
          ...(Platform.OS === "web" ? { cursor: "pointer" as const } : null),
        }}
        accessibilityRole="adjustable"
      >
        <View
          style={{
            height: 10,
            borderRadius: 999,
            backgroundColor: track,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: fill,
              height: 10,
              borderRadius: 999,
              backgroundColor: accent,
            }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: thumb,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: labelColor,
            borderWidth: 3,
            borderColor: accent,
            shadowColor: "#000",
            shadowOpacity: 0.35,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        />
      </View>

      <View
        style={{
          marginTop: 8,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "rgba(243,255,251,0.45)", fontSize: 12 }}>0</Text>
        <Text style={{ color: "rgba(243,255,251,0.45)", fontSize: 12 }}>5</Text>
        <Text style={{ color: "rgba(243,255,251,0.45)", fontSize: 12 }}>10</Text>
      </View>
    </View>
  );
}
