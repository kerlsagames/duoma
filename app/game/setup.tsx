import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import {
  DEFAULT_STAGE_COUNTS,
  STAGE_META,
  STAGE_ORDER,
} from "@/games/get-spicy/engine";
import {
  ALL_FLAVOR_TAG_IDS,
  defaultEnabledFlavorTags,
  flavorTagsForStage,
  summarizeFlavorSelection,
} from "@/games/get-spicy/flavor-tags";
import { useApp } from "@/lib/store";
import type { CardStage, GameMode, StageCounts } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function SetupScreen() {
  const router = useRouter();
  const { game, partner, configureGame, endGame } = useApp();
  const [mode, setMode] = useState<GameMode>("random");
  const [blockLimit, setBlockLimit] = useState(1);
  const [counts, setCounts] = useState<StageCounts>({ ...DEFAULT_STAGE_COUNTS });
  const [flavorTags, setFlavorTags] = useState<string[]>(defaultEnabledFlavorTags);
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

  const enabledSet = useMemo(() => new Set(flavorTags), [flavorTags]);
  const allOn = flavorTags.length === ALL_FLAVOR_TAG_IDS.length;

  const toggleTag = (id: string) => {
    setFlavorTags((current) =>
      current.includes(id) ? current.filter((row) => row !== id) : [...current, id]
    );
  };

  const setStageTags = (stage: CardStage, on: boolean) => {
    const ids = flavorTagsForStage(stage).map((row) => row.id);
    setFlavorTags((current) => {
      const without = current.filter((id) => !ids.includes(id));
      return on ? [...without, ...ids] : without;
    });
  };

  const start = async () => {
    if (flavorTags.length === 0) return;
    setLoading(true);
    try {
      await configureGame({
        mode,
        blockLimit,
        stageCounts: counts,
        flavorTags,
      });
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
          Tick the flavors you want in the deck — unchecked ones stay out.
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
                  ? "The app deals live cards across the stages you keep on."
                  : "Set the counts, then both of you choose the exact cards."}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-7 text-[12px] font-semibold uppercase tracking-widest text-mist/40">
          Blocks each — I don't participate
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

        <View className="mt-8 flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold uppercase tracking-widest text-mist/40">
            Flavors in the deck
          </Text>
          <Text className="text-[12px] text-mist/45">
            {summarizeFlavorSelection(flavorTags)}
          </Text>
        </View>
        <View className="mt-3 flex-row gap-2">
          <Pressable
            onPress={() => setFlavorTags(defaultEnabledFlavorTags())}
            className={`flex-1 items-center rounded-2xl border px-3 py-3 ${
              allOn ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"
            }`}
          >
            <Text className="text-[14px] font-semibold text-mist">Check all</Text>
          </Pressable>
          <Pressable
            onPress={() => setFlavorTags([])}
            className="flex-1 items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
          >
            <Text className="text-[14px] font-semibold text-mist">Uncheck all</Text>
          </Pressable>
        </View>

        <View className="mt-4 gap-5">
          {STAGE_ORDER.map((stage) => {
            const tags = flavorTagsForStage(stage);
            const stageIds = tags.map((row) => row.id);
            const stageOn = stageIds.every((id) => enabledSet.has(id));
            const stageSome = stageIds.some((id) => enabledSet.has(id));
            return (
              <View
                key={stage}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-[11px] font-semibold uppercase tracking-widest text-neon">
                      {STAGE_META[stage].heat}
                    </Text>
                    <Text className="mt-1 text-[18px] font-semibold text-mist">
                      {STAGE_META[stage].label}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setStageTags(stage, !stageOn)}
                    className="rounded-full border border-white/15 px-3 py-1.5"
                  >
                    <Text className="text-[12px] font-semibold text-mist/70">
                      {stageOn ? "Uncheck stage" : stageSome ? "Check stage" : "Check stage"}
                    </Text>
                  </Pressable>
                </View>
                <View className="gap-2">
                  {tags.map((tag) => {
                    const on = enabledSet.has(tag.id);
                    return (
                      <Pressable
                        key={tag.id}
                        onPress={() => toggleTag(tag.id)}
                        className={`flex-row items-center rounded-2xl border px-3 py-3 ${
                          on ? "border-neon/50 bg-neon/10" : "border-white/10 bg-night/40"
                        }`}
                      >
                        <View
                          className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${
                            on ? "border-neon bg-neon" : "border-white/25"
                          }`}
                        >
                          {on ? (
                            <Ionicons name="checkmark" size={16} color="#0B0B0E" />
                          ) : null}
                        </View>
                        <Text className="flex-1 text-[15px] leading-5 text-mist">
                          {tag.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {flavorTags.length === 0 ? (
          <Text className="mt-4 text-[14px] text-crimson">
            Tick at least one flavor so the deck has cards to deal.
          </Text>
        ) : null}

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="Start session"
            loading={loading}
            disabled={flavorTags.length === 0}
            onPress={() => void start()}
          />
          <PrimaryButton
            label="Cancel"
            tone="ghost"
            onPress={() => {
              void endGame();
              router.replace("/(tabs)" as Href);
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
