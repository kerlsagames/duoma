import { createElement, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const SPEED = 36;

type Props = {
  text: string;
  color: string;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "700" | "800" | "600";
  letterSpacing?: number;
  backgroundColor?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

function copyCount(clip: number, copy: number) {
  if (copy <= 0) return 4;
  return Math.max(4, Math.ceil(clip / copy) + 2);
}

function webBoxStyle(style: StyleProp<ViewStyle> | undefined) {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  if (flat.marginHorizontal != null) {
    flat.marginLeft = flat.marginHorizontal;
    flat.marginRight = flat.marginHorizontal;
    delete flat.marginHorizontal;
  }
  if (flat.paddingHorizontal != null) {
    flat.paddingLeft = flat.paddingHorizontal;
    flat.paddingRight = flat.paddingHorizontal;
    delete flat.paddingHorizontal;
  }
  return flat;
}

function WebTape({
  text,
  color,
  height = 28,
  fontSize = 12,
  fontFamily,
  fontWeight = "700",
  letterSpacing = 0.3,
  backgroundColor,
  onPress,
  accessibilityLabel,
  style,
}: Props) {
  const clipRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLSpanElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef(0);
  const last = useRef(0);
  const copyW = useRef(0);
  const clipW = useRef(0);
  const [copies, setCopies] = useState(4);

  useEffect(() => {
    const clip = clipRef.current;
    const copy = copyRef.current;
    if (!clip || !copy) return;

    const measure = () => {
      const nextClip = clip.offsetWidth;
      const nextCopy = copy.offsetWidth;
      if (nextClip > 0) clipW.current = nextClip;
      if (nextCopy > 0) copyW.current = nextCopy;
      if (nextClip > 0 && nextCopy > 0) {
        const n = copyCount(nextClip, nextCopy);
        setCopies((current) => (current === n ? current : n));
      }
    };
    measure();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(clip);
    ro?.observe(copy);
    return () => ro?.disconnect();
  }, [text]);

  useEffect(() => {
    pos.current = 0;
  }, [text]);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const prev = last.current || now;
      last.current = now;
      const dt = Math.min(0.05, (now - prev) / 1000);
      const unit = copyW.current;
      const track = trackRef.current;
      if (unit > 0 && track) {
        pos.current -= SPEED * dt;
        while (pos.current <= -unit) pos.current += unit;
        track.style.transform = `translate3d(${pos.current}px,0,0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const copyStyle = {
    color,
    fontSize,
    fontWeight,
    letterSpacing,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    lineHeight: `${height}px`,
    fontFamily: fontFamily || "system-ui, sans-serif",
    display: "inline-block",
  };

  return createElement(
    "div",
    {
      ref: clipRef,
      role: onPress ? "button" : undefined,
      tabIndex: onPress ? 0 : undefined,
      "aria-label": accessibilityLabel,
      onClick: onPress,
      onKeyDown: onPress
        ? (event: { key: string }) => {
            if (event.key === "Enter" || event.key === " ") onPress();
          }
        : undefined,
      style: {
        height,
        backgroundColor,
        cursor: onPress ? "pointer" : "default",
        display: "block",
        position: "relative",
        boxSizing: "border-box",
        ...webBoxStyle(style),
        overflow: "hidden",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
      },
    },
    createElement(
      "div",
      {
        ref: trackRef,
        style: {
          display: "inline-flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          width: "max-content",
          minWidth: "max-content",
          whiteSpace: "nowrap",
          willChange: "transform",
          userSelect: "none",
        },
      },
      Array.from({ length: copies }, (_, i) =>
        createElement(
          "span",
          {
            key: i,
            ref: i === 0 ? copyRef : undefined,
            "aria-hidden": i > 0 ? true : undefined,
            style: copyStyle,
          },
          text
        )
      )
    )
  );
}

export function FlowingTape(props: Props) {
  const {
    text,
    color,
    height = 28,
    fontSize = 12,
    fontFamily,
    fontWeight = "700",
    letterSpacing = 0.3,
    backgroundColor,
    onPress,
    accessibilityLabel,
    style,
  } = props;

  const [copyWidth, setCopyWidth] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const translate = useRef(new Animated.Value(0)).current;
  const running = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    running.current = true;
    translate.stopAnimation();
    if (!text || copyWidth <= 0 || boxWidth <= 0) {
      translate.setValue(0);
      return;
    }
    const loopTo = -copyWidth;
    translate.setValue(0);
    const loopMs = Math.max(2500, Math.round(copyWidth * (1000 / SPEED)));
    const loopShift = () => {
      if (!running.current) return;
      translate.setValue(0);
      Animated.timing(translate, {
        toValue: loopTo,
        duration: loopMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && running.current) loopShift();
      });
    };
    loopShift();
    return () => {
      running.current = false;
      translate.stopAnimation();
    };
  }, [boxWidth, copyWidth, text, translate]);

  if (Platform.OS === "web") {
    return <WebTape {...props} />;
  }

  const n = copyCount(boxWidth, copyWidth);
  const copies = Array.from({ length: n }, (_, copy) => (
    <Text
      key={copy}
      onLayout={
        copy === 0
          ? (event) => {
              const width = event.nativeEvent.layout.width;
              if (width > 0 && Math.abs(width - copyWidth) > 1) {
                setCopyWidth(width);
              }
            }
          : undefined
      }
      style={{
        color,
        fontSize,
        fontFamily,
        fontWeight,
        letterSpacing,
        lineHeight: height,
        flexShrink: 0,
      }}
    >
      {text}
    </Text>
  ));

  const body = (
    <View
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        if (width > 0 && Math.abs(width - boxWidth) > 1) setBoxWidth(width);
      }}
      style={[
        {
          height,
          overflow: "hidden",
          backgroundColor,
          justifyContent: "center",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          alignSelf: "stretch",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          transform: [{ translateX: translate }],
        }}
      >
        {copies}
      </Animated.View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {body}
    </Pressable>
  );
}
