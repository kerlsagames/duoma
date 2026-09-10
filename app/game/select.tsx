import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { STAGE_META, STAGE_ORDER } from "@/games/get-spicy/engine";
import { personalizeCard, resolveCardNames } from "@/lib/personalize";
import { useApp } from "@/lib/store";
import type { CardStage } from "@/lib/types";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function SelectScreen() {
  const router = useRouter();
  const { game, cards, deck, toggleDeckPick, fillPicksRandomly, lockInPicks, user, partner } =
    useApp();
  const [stage, setStage] = useState<CardStage>("pre_foreplay");

  useEffect(() => {
    if (!game) router.replace("/(tabs)");
    else if (game.status === "playing" || game.status === "rating")
      router.replace("/game/play");
    else if (game.status === "setup") router.replace("/game/setup");
  }, [game, router]);

  const selectedIds = useMemo(
    () => new Set(deck.map((item) => item.cardId)),
    [deck]
  );
  const stageCards = cards.filter((card) => card.stage === stage && card.isActive);
  const selectedInStage = deck.filter((item) => item.stage === stage).length;
  const limit = game?.stageCounts[stage] ?? 0;
  const filled = STAGE_ORDER.every(
    (key) =>
      deck.filter((item) => item.stage === key).length ===
      (game?.stageCounts[key] ?? 0)
  );
  const names = resolveCardNames({
    userName: user?.displayName,
    partnerName: partner?.displayName,
  });

  return (
    <Screen scroll>
      <View className="pt-4 pb-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Pick your own
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">Build the deck</Text>
        <Text className="mt-2 text-[15px] leading-6 text-mist/65">
          Both of you see the same bank, already filled in with your names. The
          person who later plays a card is named first. Tap up to the limit for
          each stage.
        </Text>

        <View className="mt-5 flex-row flex-wrap gap-2">
          {STAGE_ORDER.map((key) => {
            const have = deck.filter((item) => item.stage === key).length;
            const need = game?.stageCounts[key] ?? 0;
            return (
              <Pressable
                key={key}
                onPress={() => setStage(key)}
                className={`rounded-full px-3 py-2 ${
                  stage === key ? "bg-neon" : "bg-white/10"
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold ${
                    stage === key ? "text-night" : "text-mist/70"
                  }`}
                >
                  {STAGE_META[key].short} {have}/{need}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-5 text-[13px] text-mist/50">
          {STAGE_META[stage].label} · {selectedInStage} of {limit} selected
        </Text>

        <View className="mt-3 gap-3">
          {stageCards.map((card) => {
            const on = selectedIds.has(card.id);
            const copy = personalizeCard(card, names);
            return (
              <Pressable
                key={card.id}
                onPress={() => void toggleDeckPick(card.id)}
                className={`rounded-3xl border p-4 ${
                  on ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"
                }`}
              >
                <Text className="text-[15px] font-semibold text-mist/70">
                  {copy.title}
                </Text>
                <Text className="mt-1 text-[15px] leading-6 text-mist">
                  {copy.body}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="Fill the rest at random"
            tone="ghost"
            onPress={() => void fillPicksRandomly()}
          />
          <PrimaryButton
            label="Lock in & play"
            disabled={!filled && deck.length === 0}
            onPress={() => void lockInPicks()}
          />
        </View>
      </View>
    </Screen>
  );
}
