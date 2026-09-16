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
  /** Number beside the track instead of a big score stacked on top. */
  compact?: boolean;
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
  compact = false,
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
  const thumbSize = compact ? 16 : 22;
  const thumb = Math.max(0, Math.min(width - thumbSize, fill - thumbSize / 2));
  const bar = compact ? 6 : 10;

  const scoreLabel = (
    <Text
      style={{
        textAlign: compact ? "right" : "center",
        fontSize: compact ? 18 : 36,
        fontWeight: "700",
        color: labelColor,
        fontVariant: ["tabular-nums"],
        minWidth: compact ? 52 : undefined,
      }}
    >
      {score.toFixed(1)}
      {compact ? null : (
        <Text style={{ fontSize: 18, color: "rgba(243,255,251,0.55)" }}> / 10</Text>
      )}
    </Text>
  );

  const trackBlock = (
    <View
      onLayout={onLayout}
      {...pan.panHandlers}
      style={{
        flex: compact ? 1 : undefined,
        marginTop: compact ? 0 : 16,
        height: compact ? 28 : 36,
        justifyContent: "center",
        ...(Platform.OS === "web" ? { cursor: "pointer" as const } : null),
      }}
      accessibilityRole="adjustable"
    >
      <View
        style={{
          height: bar,
          borderRadius: 999,
          backgroundColor: track,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: fill,
            height: bar,
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
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          backgroundColor: labelColor,
          borderWidth: compact ? 2 : 3,
          borderColor: accent,
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      />
    </View>
  );

  if (compact) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {trackBlock}
        {scoreLabel}
      </View>
    );
  }

  return (
    <View>
      {scoreLabel}
      {trackBlock}
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
