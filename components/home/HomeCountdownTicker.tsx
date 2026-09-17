import { useAppLook } from "@/lib/app-prefs";
import { tickerLine } from "@/lib/countdown-ticker";
import { useApp } from "@/lib/store";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

const GAP = "   ·   ";

function ensureTickerKeyframes() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  if (document.getElementById("duoma-ticker-kf")) return;
  const style = document.createElement("style");
  style.id = "duoma-ticker-kf";
  style.textContent = `
    @keyframes duomaTicker {
      from { transform: translate3d(0,0,0); }
      to { transform: translate3d(-50%,0,0); }
    }
    .duoma-ticker-clip {
      overflow: hidden !important;
      width: 100%;
    }
    .duoma-ticker-track {
      display: flex !important;
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      width: max-content !important;
      will-change: transform;
      animation-name: duomaTicker;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    .duoma-ticker-copy {
      flex: 0 0 auto !important;
      white-space: nowrap !important;
    }
  `;
  document.head.appendChild(style);
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
    ensureTickerKeyframes();
  }, []);

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

  const durationSec = Math.max(8, copyWidth > 0 ? copyWidth / 62 : Math.max(10, piece.length * 0.28));

  const copyStyle = {
    color: "#FF8AB8",
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
    flexShrink: 0,
  };

  const copies = [0, 1].map((copy) => (
    <View
      key={copy}
      className="duoma-ticker-copy"
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
      <Text style={copyStyle}>
        {piece}
      </Text>
    </View>
  ));

  const trackStyle =
    Platform.OS === "web"
      ? ({
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          width: "max-content",
          animationDuration: `${durationSec}s`,
        } as object)
      : {
          flexDirection: "row" as const,
          alignItems: "center" as const,
          flexWrap: "nowrap" as const,
          transform: [{ translateX: translate }],
        };

  return (
    <Pressable
      onPress={() => router.push("/hub/milestones" as Href)}
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
      <View className="duoma-ticker-clip" style={{ overflow: "hidden", width: "100%" }}>
        <Animated.View className="duoma-ticker-track" style={trackStyle}>
          {copies}
        </Animated.View>
      </View>
    </Pressable>
  );
}
