import { useAppLook } from "@/lib/app-prefs";
import { tickerLine } from "@/lib/countdown-ticker";
import { useApp } from "@/lib/store";
import { useRouter, type Href } from "expo-router";
import { createElement, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

const GAP = "   ·   ";
const PINK = "#FF8AB8";

function ensureTickerKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("duoma-ticker-kf")) return;
  const style = document.createElement("style");
  style.id = "duoma-ticker-kf";
  style.textContent = `
    @keyframes duomaTicker {
      from { transform: translate3d(0,0,0); }
      to { transform: translate3d(-50%,0,0); }
    }
  `;
  document.head.appendChild(style);
}

function WebMarquee({
  piece,
  label,
  onPress,
}: {
  piece: string;
  label: string;
  onPress: () => void;
}) {
  const copyRef = useRef<HTMLSpanElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    ensureTickerKeyframes();
  }, []);

  useEffect(() => {
    const node = copyRef.current;
    if (!node) return;
    const measure = () => setWidth(node.offsetWidth);
    measure();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    ro?.observe(node);
    return () => ro?.disconnect();
  }, [piece]);

  const duration = Math.max(8, width > 0 ? width / 55 : 12);
  const copyStyle = {
    color: PINK,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    fontFamily: "system-ui, sans-serif",
  };

  return createElement(
    "div",
    {
      role: "button",
      tabIndex: 0,
      "aria-label": `Countdown ticker. ${label}`,
      onClick: onPress,
      onKeyDown: (event: { key: string }) => {
        if (event.key === "Enter" || event.key === " ") onPress();
      },
      style: {
        height: 28,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 6,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      },
    },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          width: "max-content",
          animation: `duomaTicker ${duration}s linear infinite`,
          willChange: "transform",
        },
      },
      createElement(
        "span",
        {
          ref: copyRef,
          style: copyStyle,
        },
        piece
      ),
      createElement("span", { style: copyStyle }, piece)
    )
  );
}

export function HomeCountdownTicker() {
  const router = useRouter();
  const { milestones, couple } = useApp();
  const look = useAppLook("milestones", "#FF007F", {
    hidePast: false,
    asWeeks: false,
    tickerAll: false,
  });
  const line = useMemo(
    () =>
      tickerLine(milestones, {
        tickerAll: look.prefs.tickerAll,
        asWeeks: look.prefs.asWeeks,
      }),
    [look.prefs.asWeeks, look.prefs.tickerAll, milestones]
  );
  const piece = line ? `${line}${GAP}` : "";
  const [copyWidth, setCopyWidth] = useState(0);
  const translate = useRef(new Animated.Value(0)).current;
  const running = useRef(false);

  useEffect(() => {
    setCopyWidth(0);
  }, [piece]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    running.current = true;
    translate.stopAnimation();
    if (!piece || copyWidth <= 0) {
      translate.setValue(0);
      return;
    }
    const from = 0;
    const to = -copyWidth;
    translate.setValue(from);
    const duration = Math.max(8000, Math.round(copyWidth * 16));
    const tick = () => {
      if (!running.current) return;
      translate.setValue(from);
      Animated.timing(translate, {
        toValue: to,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && running.current) tick();
      });
    };
    tick();
    return () => {
      running.current = false;
      translate.stopAnimation();
    };
  }, [copyWidth, piece, translate]);

  if (!couple || !line) return null;

  const open = () => router.push("/hub/milestones" as Href);

  if (Platform.OS === "web") {
    return <WebMarquee piece={piece} label={line} onPress={open} />;
  }

  const copies = [0, 1].map((copy) => (
    <View
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
      style={{ flexDirection: "row", flexShrink: 0, alignItems: "center" }}
    >
      <Text
        style={{
          color: PINK,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.3,
          flexShrink: 0,
        }}
      >
        {piece}
      </Text>
    </View>
  ));

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Countdown ticker. ${line}`}
      style={{
        height: 28,
        marginHorizontal: 10,
        marginBottom: 6,
        overflow: "hidden",
        justifyContent: "center",
      }}
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
    </Pressable>
  );
}
