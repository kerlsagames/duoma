import { BackButton } from "@/components/ui/BackButton";
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
import type { CardStage, StageCounts } from "@/lib/types";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

const SETUP_RULES = [
  {
    title: "Deal three",
    body: "On your turn the app deals three cards. Tap one to play. Then it is your partner’s turn.",
  },
  {
    title: "Shuffle",
    body: "Do not like the three you got? Shuffle redraws your hand. Setup sets how many shuffles each of you gets — or unlimited.",
  },
  {
    title: "Pass",
    body: "You cannot pass your own card. If your partner played something you do not want to do, Pass — I don’t participate. They deal again.",
  },
  {
    title: "Daytime pause",
    body: "Pre-foreplay is daytime tease. Those cards stay hidden from your partner until you both tap We are ready to move on.",
  },
  {
    title: "Finish Off",
    body: "Before Finish Off and Afterglow, a reveal picks who chooses Finish Off. The other person chooses Afterglow. Defaults are one card each.",
  },
];

function Stepper({
  value,
  onChange,
  min,
  max,
  unlimited,
}: {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  unlimited?: boolean;
}) {
  const label = unlimited && value < 0 ? "Unlimited" : String(value);
  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        onPress={() => {
          if (unlimited && value < 0) onChange(max);
          else onChange(Math.max(min, value - 1));
        }}
        className="h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5"
      >
        <Text className="text-[22px] text-mist/70">−</Text>
      </Pressable>
      <Text className="min-w-[72px] text-center text-[18px] font-bold text-mist">
        {label}
      </Text>
      <Pressable
        onPress={() => {
          if (unlimited && value >= max) onChange(-1);
          else if (value < 0) onChange(min);
          else onChange(Math.min(max, value + 1));
        }}
        className="h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5"
      >
        <Text className="text-[22px] text-mist/70">+</Text>
      </Pressable>
    </View>
  );
}

export default function SetupScreen() {
  const router = useRouter();
  const { game, configureGame, endGame } = useApp();
  const [passLimit, setPassLimit] = useState(1);
  const [shuffleLimit, setShuffleLimit] = useState(3);
  const [counts, setCounts] = useState<StageCounts>({ ...DEFAULT_STAGE_COUNTS });
  const [flavorTags, setFlavorTags] = useState<string[]>(defaultEnabledFlavorTags());
  const [loading, setLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    if (!game) {
      router.replace("/(tabs)");
      return;
    }
    if (game.status === "selecting" || game.status === "playing") {
      router.replace("/game/play");
    }
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
        blockLimit: passLimit,
        shuffleLimit,
        stageCounts: counts,
        flavorTags,
      });
      router.replace("/game/play");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-4 pb-8">
        <BackButton style={{ marginBottom: 12 }} />
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
              Get Spicy
            </Text>
            <Text className="mt-2 text-[32px] font-bold text-mist">Setup</Text>
          </View>
          <Pressable
            onPress={() => setRulesOpen(true)}
            className="mt-1 rounded-2xl border border-white/15 bg-white/5 px-3 py-2"
          >
            <Text className="text-[13px] font-semibold text-mist">Rules</Text>
          </Pressable>
        </View>

        <View className="mt-7 flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[12px] font-semibold uppercase tracking-widest text-mist/40">
              Passes each
            </Text>
            <View className="mt-3">
              <Stepper value={passLimit} onChange={setPassLimit} min={0} max={5} />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-[12px] font-semibold uppercase tracking-widest text-mist/40">
              Shuffles each
            </Text>
            <View className="mt-3">
              <Stepper
                value={shuffleLimit}
                onChange={setShuffleLimit}
                min={0}
                max={10}
                unlimited
              />
            </View>
          </View>
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
              <View className="flex-1 pr-3">
                <Text className="text-[15px] font-semibold text-mist">
                  {STAGE_META[stage].label}
                </Text>
                {stage === "finish_off" || stage === "afterglow" ? (
                  <Text className="mt-0.5 text-[12px] text-mist/45">
                    Default 1
                  </Text>
                ) : (
                  <Text className="mt-0.5 text-[12px] text-mist/45">
                    Default 4
                  </Text>
                )}
              </View>
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

        <View className="mt-4 gap-4">
          {STAGE_ORDER.map((stage) => {
            const tags = flavorTagsForStage(stage);
            const stageIds = tags.map((row) => row.id);
            const stageOn = stageIds.every((id) => enabledSet.has(id));
            return (
              <View key={stage}>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[14px] font-semibold text-mist">
                    {STAGE_META[stage].label}
                  </Text>
                  <Pressable onPress={() => setStageTags(stage, !stageOn)} hitSlop={8}>
                    <Text className="text-[12px] font-semibold text-neon">
                      {stageOn ? "None" : "All"}
                    </Text>
                  </Pressable>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {tags.map((tag) => {
                    const on = enabledSet.has(tag.id);
                    return (
                      <Pressable
                        key={tag.id}
                        onPress={() => toggleTag(tag.id)}
                        className={`rounded-full border px-3 py-1.5 ${
                          on
                            ? "border-neon bg-neon/15"
                            : "border-white/12 bg-white/5"
                        }`}
                      >
                        <Text
                          className={`text-[13px] ${on ? "text-mist" : "text-mist/55"}`}
                        >
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

      <Modal
        visible={rulesOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setRulesOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="max-h-[80%] rounded-t-[28px] border border-white/10 bg-night px-5 pb-8 pt-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[22px] font-bold text-mist">Rules</Text>
              <Pressable
                onPress={() => setRulesOpen(false)}
                className="rounded-full border border-white/15 px-3 py-1.5"
              >
                <Text className="text-[13px] font-semibold text-mist/70">Close</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-3 pb-4">
                {SETUP_RULES.map((rule) => (
                  <View
                    key={rule.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <Text className="text-[16px] font-semibold text-mist">
                      {rule.title}
                    </Text>
                    <Text className="mt-2 text-[14px] leading-5 text-mist/65">
                      {rule.body}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
