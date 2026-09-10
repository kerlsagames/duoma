import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  foilLabel: string;
  revealed: boolean;
  title?: string;
  body?: string;
  onReveal: () => void;
};

export function FoilScratch({ foilLabel, revealed, title, body, onReveal }: Props) {
  const [taps, setTaps] = useState(0);
  const needed = 4;
  const progress = revealed ? needed : taps;

  const tap = () => {
    if (revealed) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= needed) onReveal();
  };

  return (
    <Pressable
      onPress={tap}
      className="min-h-[220px] overflow-hidden rounded-[28px] border border-neon/40"
    >
      {revealed ? (
        <View className="flex-1 justify-center bg-white/5 p-6">
          <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
            Revealed
          </Text>
          <Text className="mt-3 text-[26px] font-bold text-mist">{title}</Text>
          <Text className="mt-3 text-[16px] leading-6 text-mist/75">{body}</Text>
        </View>
      ) : (
        <View
          className="flex-1 items-center justify-center p-6"
          style={{
            backgroundColor: `rgba(230, 0, 57, ${0.55 + (needed - progress) * 0.1})`,
          }}
        >
          <Text className="text-center text-[13px] font-semibold uppercase tracking-[3px] text-mist/80">
            Scratch-off
          </Text>
          <Text className="mt-4 text-center text-[22px] font-bold text-mist">
            {foilLabel}
          </Text>
          <Text className="mt-3 text-center text-[14px] text-mist/70">
            Tap {needed - progress} more{" "}
            {needed - progress === 1 ? "time" : "times"} to break the foil.
          </Text>
        </View>
      )}
    </Pressable>
  );
}
