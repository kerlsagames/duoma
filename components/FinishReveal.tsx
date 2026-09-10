import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

type Props = {
  youName: string;
  partnerName: string;
  onReveal: () => Promise<void> | void;
  revealedName?: string | null;
  afterglowName?: string | null;
};

export function FinishReveal({
  youName,
  partnerName,
  onReveal,
  revealedName,
  afterglowName,
}: Props) {
  const [spinning, setSpinning] = useState(false);
  const [flash, setFlash] = useState(youName);
  const pulse = useRef(new Animated.Value(1)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const run = () => {
    if (spinning || revealedName) return;
    setSpinning(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const names = [youName, partnerName];
    const ticks = 14;
    for (let i = 0; i < ticks; i += 1) {
      const timer = setTimeout(() => {
        setFlash(names[i % 2]);
        if (i === ticks - 1) {
          void Promise.resolve(onReveal()).finally(() => setSpinning(false));
        }
      }, 70 + i * i * 8);
      timers.current.push(timer);
    }
  };

  return (
    <View className="flex-1 justify-center">
      <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
        Climax toss
      </Text>
      <Text className="mt-3 text-[34px] font-bold leading-10 text-mist">
        Who picks Finish Off?
      </Text>
      <Text className="mt-4 text-[16px] leading-7 text-mist/70">
        One of you chooses the Finish Off card. The other chooses Afterglow.
      </Text>

      <Animated.View
        style={{ transform: [{ scale: pulse }] }}
        className="mt-10 items-center rounded-[28px] border border-neon/40 bg-neon/10 px-6 py-10"
      >
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-crimson">
          {revealedName ? "Finish Off goes to" : spinning ? "Choosing…" : "Ready"}
        </Text>
        <Text className="mt-4 text-center text-[36px] font-bold text-mist">
          {revealedName ?? flash}
        </Text>
        {revealedName && afterglowName ? (
          <Text className="mt-4 text-center text-[15px] leading-6 text-mist/65">
            {afterglowName} picks Afterglow.
          </Text>
        ) : null}
      </Animated.View>

      <View className="mt-8">
        {!revealedName ? (
          <PrimaryButton
            label={spinning ? "Spinning…" : "Reveal who picks"}
            loading={spinning}
            disabled={spinning}
            onPress={run}
          />
        ) : (
          <Text className="text-center text-[14px] text-mist/55">
            Dealing the Finish Off hand next…
          </Text>
        )}
      </View>
    </View>
  );
}
