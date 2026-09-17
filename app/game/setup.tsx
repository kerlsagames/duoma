import { LookPanel, PrefSection, SettingsCog } from "@/components/hub/AppSettings";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import {
  DEFAULT_STAGE_COUNTS,
  SIMPLE_STAGE_COUNTS,
  SIMPLE_STAGE_ORDER,
  STAGE_META,
  STAGE_ORDER,
} from "@/games/get-spicy/engine";
import {
  ALL_FLAVOR_TAG_IDS,
  defaultEnabledFlavorTags,
  flavorTagsForStage,
  summarizeFlavorSelection,
} from "@/games/get-spicy/flavor-tags";
import { useAppLook } from "@/lib/app-prefs";
import { personalizeCard, resolveCardGenders, resolveCardNames } from "@/lib/personalize";
import { useApp } from "@/lib/store";
import type { CardStage, SpicyPace, StageCounts } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

const SETUP_RULES = [
  {
    title: "Deal three",
    body: "Detailed: on your turn the app deals three cards. Tap one to play. Then it is your partner’s turn.",
  },
  {
    title: "Shuffle",
    body: "Detailed only. Do not like the three you got? Shuffle redraws your hand. Setup sets how many shuffles each of you gets, or unlimited.",
  },
  {
    title: "Pass",
    body: "Detailed only. You cannot pass your own card. If your partner played something you do not want to do, Pass, I don’t participate. They deal again.",
  },
  {
    title: "Daytime pause",
    body: "Detailed: pre-foreplay is daytime tease. Those cards stay hidden from your partner until you both tap We are ready to move on.",
  },
  {
    title: "Keep it simple",
    body: "One phone in the middle. Cards alternate — one of you does a card, then the other — so you get both sides, not only things one of you would do to F. Skip swaps a card you don’t want. No passes or shuffles. Finish Off still tags F, M, or both. After an F-cums card, tap Next Card, F has cum — that deals the M cums card. Afterglow waits until he has finished too.",
  },
  {
    title: "Finish Off",
    body: "Before Finish Off and Afterglow, a reveal picks who chooses Finish Off. The other person chooses Afterglow. Finish Off deals her climax first, or both together. If the card is F-only, the next hand is only M cums cards. Defaults are one finish sequence.",
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
  const { game, configureGame, endGame, bestCards, user, partner } = useApp();
  const [passLimit, setPassLimit] = useState(1);
  const [shuffleLimit, setShuffleLimit] = useState(3);
  const [counts, setCounts] = useState<StageCounts>({ ...DEFAULT_STAGE_COUNTS });
  const [flavorTags, setFlavorTags] = useState<string[]>(defaultEnabledFlavorTags());
  const [openFlavorStage, setOpenFlavorStage] = useState<CardStage | null>(null);
  const [loading, setLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const look = useAppLook("get-spicy", "#FF007F", {
    remember: true,
    hideRules: false,
    dealPace: "simple",
  });
  const [pace, setPace] = useState<SpicyPace>("simple");

  useEffect(() => {
    if (!game) {
      router.replace("/(tabs)");
      return;
    }
    if (game.status === "selecting" || game.status === "playing") {
      router.replace("/game/play");
    }
  }, [game, router]);

  useEffect(() => {
    if (!look.ready) return;
    if (look.prefs.dealPace === "simple" || look.prefs.dealPace === "detailed") {
      setPace(look.prefs.dealPace);
    }
  }, [look.prefs.dealPace, look.ready]);

  const choosePace = (next: SpicyPace) => {
    setPace(next);
    look.patch({ dealPace: next });
  };

  const bump = (stage: keyof StageCounts, delta: number) => {
    setCounts((current) => ({
      ...current,
      [stage]: Math.max(0, Math.min(5, current[stage] + delta)),
    }));
  };

  const enabledSet = useMemo(() => new Set(flavorTags), [flavorTags]);
  const allOn = flavorTags.length === ALL_FLAVOR_TAG_IDS.length;
  const flavorStages = pace === "simple" ? SIMPLE_STAGE_ORDER : STAGE_ORDER;

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
        blockLimit: pace === "simple" ? 0 : passLimit,
        shuffleLimit: pace === "simple" ? 0 : shuffleLimit,
        stageCounts: pace === "simple" ? SIMPLE_STAGE_COUNTS : counts,
        flavorTags,
        pace,
      });
      router.replace("/game/play");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <View className="pt-4 pb-8">
        <BackButton style={{ marginBottom: 12 }} />
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-[12px] font-semibold uppercase tracking-[3px]"
              style={{ color: look.accent }}
            >
              Get Spicy
            </Text>
            <Text className="mt-2 text-[32px] font-bold text-mist">Setup</Text>
          </View>
          <View className="mt-1 flex-row items-center gap-2">
            {look.prefs.hideRules ? null : (
              <Pressable
                onPress={() => setRulesOpen(true)}
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2"
              >
                <Text className="text-[13px] font-semibold text-mist">Rules</Text>
              </Pressable>
            )}
            <SettingsCog
              accent={look.accent}
              open={settingsOpen}
              onToggle={() => setSettingsOpen((open) => !open)}
              label="Get Spicy"
            />
          </View>
        </View>
        {settingsOpen ? (
          <LookPanel
            look={look}
            ink="#F4F4F6"
            muted="rgba(244,244,246,0.6)"
            pageColor="#0B0B0E"
            toggles={[
              {
                key: "remember",
                label: "Remember last setup",
                hint: "Keeps your stage counts and tags next time.",
              },
              {
                key: "hideRules",
                label: "Hide the Rules button",
                hint: "You already know the deal-three dance.",
              },
            ]}
          >
            <PrefSection
              label="Cards"
              hint="The deck and the ones you both rated high."
              ink="#F4F4F6"
              muted="rgba(244,244,246,0.6)"
            >
              <Pressable
                onPress={() => router.push("/(tabs)/cards" as Href)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: "#F4F4F6", fontSize: 15, fontWeight: "700" }}>
                    Card Bank
                  </Text>
                  <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.5)", fontSize: 12 }}>
                    Toggle rotation. Write custom cards with your names.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(244,244,246,0.4)" />
              </Pressable>
              <View style={{ marginTop: 12 }}>
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.4,
                    color: "rgba(244,244,246,0.45)",
                  }}
                >
                  BEST CARDS
                </Text>
                {bestCards.length === 0 ? (
                  <Text
                    style={{
                      marginTop: 6,
                      color: "rgba(244,244,246,0.5)",
                      fontSize: 13,
                      lineHeight: 18,
                    }}
                  >
                    After a night, rate what you played. Keepers show up here.
                  </Text>
                ) : (
                  bestCards.slice(0, 6).map((row) => {
                    const copy = personalizeCard(
                      row.card,
                      resolveCardNames({
                        userName: user?.displayName,
                        partnerName: partner?.displayName,
                      }),
                      resolveCardGenders({
                        userGender: user?.gender,
                        partnerGender: partner?.gender,
                      })
                    );
                    return (
                      <View key={row.card.id} style={{ marginTop: 8 }}>
                        <Text style={{ color: "#FF007F", fontSize: 12 }}>
                          {row.average.toFixed(1)}/10
                        </Text>
                        <Text
                          style={{
                            marginTop: 2,
                            color: "#F4F4F6",
                            fontSize: 14,
                            lineHeight: 20,
                          }}
                        >
                          {copy.body}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            </PrefSection>
          </LookPanel>
        ) : null}

        <View className="mt-6 flex-row gap-2">
          {(
            [
              {
                id: "simple" as const,
                label: "Keep it simple",
                hint: "One phone. Cards swap sides. F then M.",
              },
              {
                id: "detailed" as const,
                label: "Detailed",
                hint: "All five stages. You set how many cards.",
              },
            ] as const
          ).map((option) => {
            const on = pace === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => choosePace(option.id)}
                className={`flex-1 rounded-2xl border px-3 py-3 ${
                  on ? "border-neon bg-neon/15" : "border-white/12 bg-white/5"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text className="text-center text-[15px] font-bold text-mist">
                  {option.label}
                </Text>
                <Text className="mt-1 text-center text-[11px] leading-4 text-mist/55">
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {pace === "detailed" ? (
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
        ) : null}

        {pace === "detailed" ? (
          <>
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
                    {stage === "finish_off"
                      ? "One sequence. F first, or both on one card."
                      : "Default 1"}
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
          </>
        ) : null}

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

        <View className="mt-4 gap-2">
          {flavorStages.map((stage) => {
            const tags = flavorTagsForStage(stage);
            const stageIds = tags.map((row) => row.id);
            const onCount = stageIds.filter((id) => enabledSet.has(id)).length;
            const stageOn = onCount === stageIds.length && stageIds.length > 0;
            const expanded = openFlavorStage === stage;
            return (
              <View
                key={stage}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <Pressable
                  onPress={() =>
                    setOpenFlavorStage((current) => (current === stage ? null : stage))
                  }
                  className="flex-row items-center justify-between px-4 py-3.5"
                  accessibilityRole="button"
                  accessibilityLabel={`${STAGE_META[stage].label}. ${onCount} of ${stageIds.length} on.`}
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-[15px] font-semibold text-mist">
                      {STAGE_META[stage].label}
                    </Text>
                    <Text className="mt-0.5 text-[12px] text-mist/45">
                      {onCount}/{stageIds.length} on
                    </Text>
                  </View>
                  <Text className="text-[13px] font-semibold text-neon">
                    {expanded ? "Hide" : "Show"}
                  </Text>
                </Pressable>
                {expanded ? (
                  <View className="border-t border-white/10 px-4 pb-4 pt-3">
                    <Pressable
                      onPress={() => setStageTags(stage, !stageOn)}
                      hitSlop={8}
                      className="mb-2 self-end"
                    >
                      <Text className="text-[12px] font-semibold text-neon">
                        {stageOn ? "None" : "All"}
                      </Text>
                    </Pressable>
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
                ) : null}
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
