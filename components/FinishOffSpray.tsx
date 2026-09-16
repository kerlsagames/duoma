import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform, Text, View } from "react-native";

const DROPS = [
  "💧",
  "💦",
  "💧",
  "🌊",
  "💦",
  "💧",
  "💦",
  "💧",
  "💦",
  "🌊",
  "💧",
  "💦",
  "💧",
  "💦",
  "🌊",
  "💦",
  "💧",
  "💦",
] as const;

type Props = {
  playKey: number;
};

export function FinishOffSpray({ playKey }: Props) {
  const drops = useMemo(
    () =>
      DROPS.map((emoji, i) => ({
        emoji,
        left: 6 + ((i * 17 + 9) % 88),
        delay: (i * 38) % 260,
        drift: ((i * 11) % 48) - 24,
        size: 20 + (i % 5) * 7,
        duration: 980 + (i % 5) * 160,
      })),
    []
  );
  const lifts = useRef(drops.map(() => new Animated.Value(0))).current;
  const fades = useRef(drops.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!playKey) return;
    const loops = drops.map((drop, i) => {
      lifts[i]!.setValue(0);
      fades[i]!.setValue(0);
      return Animated.sequence([
        Animated.delay(drop.delay),
        Animated.parallel([
          Animated.timing(lifts[i]!, {
            toValue: 1,
            duration: drop.duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(fades[i]!, {
              toValue: 1,
              duration: 140,
              useNativeDriver: true,
            }),
            Animated.timing(fades[i]!, {
              toValue: 0,
              duration: drop.duration - 140,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);
    });
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [drops, fades, lifts, playKey]);

  if (!playKey) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: 40,
        ...(Platform.OS === "web"
          ? ({ position: "fixed" } as object)
          : { position: "absolute" }),
      }}
    >
      {drops.map((drop, i) => {
        const translateY = lifts[i]!.interpolate({
          inputRange: [0, 1],
          outputRange: [40, -420],
        });
        const translateX = lifts[i]!.interpolate({
          inputRange: [0, 1],
          outputRange: [0, drop.drift],
        });
        const rotate = lifts[i]!.interpolate({
          inputRange: [0, 1],
          outputRange: ["-12deg", "18deg"],
        });
        return (
          <Animated.View
            key={`${playKey}-${i}`}
            style={{
              position: "absolute",
              left: `${drop.left}%`,
              bottom: 72,
              opacity: fades[i],
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          >
            <Text style={{ fontSize: drop.size }}>{drop.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
