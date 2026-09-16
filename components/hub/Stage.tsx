import { SettingsCog } from "@/components/hub/AppSettings";
import { BackButton } from "@/components/ui/BackButton";
import { SERIF } from "@/lib/app-themes";
import { tintCanvas } from "@/lib/color-paint";
import type { Href } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

/** Unique page shell: no shared “kicker + serif title” chrome. */
export function Stage({
  background,
  fallback,
  accent,
  right,
  settings,
  settingsLabel,
  children,
}: {
  background: string;
  fallback: Href;
  accent: string;
  right?: ReactNode;
  settings?: ReactNode;
  settingsLabel?: string;
  children: ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canvas = tintCanvas(background, accent, 0.28);
  const cog = settings ? (
    <SettingsCog
      accent={accent}
      open={settingsOpen}
      onToggle={() => setSettingsOpen((open) => !open)}
      label={settingsLabel ?? "App"}
    />
  ) : null;
  const trailing = cog && right ? (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {right}
      {cog}
    </View>
  ) : cog ?? right ?? null;

  return (
    <View className="pt-3 pb-14" style={{ backgroundColor: canvas }}>
      {trailing ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <BackButton color={accent} fallback={fallback} />
          {trailing}
        </View>
      ) : (
        <BackButton color={accent} fallback={fallback} style={{ marginBottom: 8 }} />
      )}
      {settingsOpen && settings ? settings : children}
    </View>
  );
}

export function TwinkleSky({ count = 28 }: { count?: number }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      left: (i * 37 + 11) % 94,
      top: (i * 19 + 6) % 88,
      size: 1.5 + (i % 4),
      delay: (i * 113) % 1800,
      opacity: new Animated.Value(0.2 + (i % 5) * 0.1),
    }))
  ).current;

  useEffect(() => {
    const loops = stars.map((star) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: 1,
            duration: 700 + star.delay / 4,
            delay: star.delay,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 0.15,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [stars]);

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      {stars.map((star, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: `${star.left}%` as `${number}%`,
            top: `${star.top}%` as `${number}%`,
            width: star.size,
            height: star.size,
            borderRadius: 9,
            backgroundColor: "#FFF6E0",
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}

export function Marquee({
  text,
  color,
}: {
  text: string;
  color: string;
}) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const tx = x.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -220],
  });
  return (
    <View style={{ overflow: "hidden", height: 28 }}>
      <Animated.Text
        style={{
          transform: [{ translateX: tx }],
          color,
          fontFamily: "SpaceMono",
          fontSize: 12,
          letterSpacing: 3,
          width: 640,
        }}
      >
        {`${text}   ★   ${text}   ★   ${text}   ★   ${text}`}
      </Animated.Text>
    </View>
  );
}

export function PosterTitle({
  title,
  color,
  rotate = "-3deg",
}: {
  title: string;
  color: string;
  rotate?: string;
}) {
  return (
    <Text
      style={{
        fontFamily: SERIF,
        fontSize: 42,
        lineHeight: 46,
        color,
        transform: [{ rotate }],
      }}
    >
      {title}
    </Text>
  );
}
