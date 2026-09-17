import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

const DROPS = [
  "💧",
  "💦",
  "💧",
  "💦",
  "💦",
  "💧",
  "💦",
  "💧",
  "💦",
  "💧",
  "💧",
  "💦",
  "💧",
  "💦",
  "💦",
  "💦",
  "💧",
  "💦",
  "💧",
  "💦",
  "💧",
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
        left: 4 + ((i * 13 + 7) % 90),
        delay: (i * 70) % 520,
        drift: ((i * 11) % 56) - 28,
        size: 26 + (i % 5) * 8,
        duration: 2200 + (i % 5) * 280,
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
      const hold = Math.min(720, drop.duration * 0.28);
      return Animated.sequence([
        Animated.delay(drop.delay),
        Animated.parallel([
          Animated.timing(lifts[i]!, {
            toValue: 1,
            duration: drop.duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(fades[i]!, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.delay(hold),
            Animated.timing(fades[i]!, {
              toValue: 0,
              duration: drop.duration - hold - 180,
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
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: 40,
      }}
    >
      {drops.map((drop, i) => {
        const translateY = lifts[i]!.interpolate({
          inputRange: [0, 1],
          outputRange: [80, -520],
        });
        const translateX = lifts[i]!.interpolate({
          inputRange: [0, 1],
          outputRange: [0, drop.drift],
        });
        const rotate = lifts[i]!.interpolate({
          inputRange: [0, 1],
          outputRange: ["-16deg", "22deg"],
        });
        return (
          <Animated.View
            key={`${playKey}-${i}`}
            style={{
              position: "absolute",
              left: `${drop.left}%`,
              bottom: 24,
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
