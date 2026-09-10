import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { DEFAULT_STAGE_COUNTS, STAGE_META, STAGE_ORDER } from "@/games/get-spicy/engine";
import { useApp } from "@/lib/store";
import type { GameMode, StageCounts } from "@/lib/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function SetupScreen() {
  const router = useRouter();
  const { game, partner, configureGame, endGame } = useApp();
  const [mode, setMode] = useState<GameMode>("random");
  const [blockLimit, setBlockLimit] = useState(1);
  const [counts, setCounts] = useState<StageCounts>({ ...DEFAULT_STAGE_COUNTS });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!game) {
      router.replace("/(tabs)");
      return;
    }
    if (game.status === "selecting") router.replace("/game/select");
    if (game.status === "playing") router.replace("/game/play");
  }, [game, router]);

  const bump = (stage: keyof StageCounts, delta: number) => {
    setCounts((current) => ({
      ...current,
      [stage]: Math.max(0, Math.min(5, current[stage] + delta)),
    }));
  };

  const start = async () => {
    setLoading(true);
    try {
      await configureGame({ mode, blockLimit, stageCounts: counts });
      router.replace(mode === "random" ? "/game/play" : "/game/select");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-4 pb-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Get Spicy
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">Setup</Text>
        <Text className="mt-2 text-[15px] leading-6 text-mist/65">
          {partner?.displayName ?? "Your partner"} is on this session with you.
          Choose how the deck is built, and how many blocks each of you gets.
        </Text>

        <Text className="mt-7 text-[12px] font-semibold uppercase tracking-widest text-mist/40">
          Mode
        </Text>
        <View className="mt-3 gap-3">
          {(["random", "pick_your_own"] as GameMode[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              className={`rounded-3xl border p-4 ${
                mode === option ? "border-neon bg-neon/10" : "border-white/10 bg-white/5"
              }`}
            >
              <Text className="text-[17px] font-semibold text-mist">
                {option === "random" ? "Random mode" : "Pick your own"}
              </Text>
              <Text className="mt-1 text-[14px] leading-5 text-mist/60">
                {option === "random"
                  ? "The app deals live cards across all four stages."
                  : "Set the counts, then both of you choose the exact cards."}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-7 text-[12px] font-semibold uppercase tracking-widest text-mist/40">
          Block cards each
        </Text>
        <View className="mt-3 flex-row gap-2">
          {[1, 2, 3].map((value) => (
            <Pressable
              key={value}
              onPress={() => setBlockLimit(value)}
              className={`h-12 flex-1 items-center justify-center rounded-2xl border ${
                blockLimit === value
                  ? "border-neon bg-neon/15"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <Text className="text-[16px] font-bold text-mist">{value}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-7 text-[12px] font-semibold uppercase tracking-widest text-mist/40">
          Cards per stage
        </Text>
        <View className="mt-3 gap-2">
          {STAGE_ORDER.map((stage) => (
            <View
              key={stage}
              className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <Text className="text-[15px] font-semibold text-mist">
                {STAGE_META[stage].label}
              </Text>
              <View className="flex-row items-center gap-4">
                <Pressable onPress={() => bump(stage, -1)}>
                  <Text className="text-[22px] text-mist/70">−</Text>
                </Pressable>
                <Text className="w-6 text-center text-[18px] font-bold text-mist">
                  {counts[stage]}
                </Text>
                <Pressable onPress={() => bump(stage, 1)}>
                  <Text className="text-[22px] text-mist/70">+</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-8 gap-3">
          <PrimaryButton
            label={mode === "random" ? "Deal the night" : "Choose cards"}
            loading={loading}
            onPress={() => void start()}
          />
          <PrimaryButton
            label="Cancel session"
            tone="ghost"
            onPress={() => {
              void endGame();
              router.replace("/(tabs)");
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
