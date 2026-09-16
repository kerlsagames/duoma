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
  const [copyWidth, setCopyWidth] = useState(0);
  const translate = useRef(new Animated.Value(0)).current;
  const running = useRef(false);

  useEffect(() => {
    setCopyWidth(0);
  }, [line]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    running.current = true;
    translate.stopAnimation();
    translate.setValue(0);
    if (!line || copyWidth <= 0) return;

    const duration = Math.max(14000, Math.round(copyWidth * 22));
    const tick = () => {
      if (!running.current) return;
      translate.setValue(0);
      Animated.timing(translate, {
        toValue: -copyWidth,
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
  }, [copyWidth, line, translate]);

  if (!couple || !line) return null;

  const seconds = Math.max(14, Math.round((copyWidth || 280) / 40));
  const copies = (
    <>
      {[0, 1].map((copy) => (
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
          style={{ flexDirection: "row", alignItems: "center", flexShrink: 0 }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: "#FF8AB8",
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 0.3,
              paddingRight: 48,
            }}
          >
            {line}
          </Text>
        </View>
      ))}
    </>
  );

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
      {Platform.OS === "web" ? (
        <View
          className="duoma-ticker-track"
          style={{
            flexDirection: "row",
            flexWrap: "nowrap",
            // RN web: keep the strip scrolling forever.
            animationName: "duoma-ticker-marquee",
            animationDuration: `${seconds}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            ["--duoma-ticker-duration" as never]: `${seconds}s`,
          }}
        >
          {copies}
        </View>
      ) : (
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            transform: [{ translateX: translate }],
          }}
        >
          {copies}
        </Animated.View>
      )}
    </Pressable>
  );
}
