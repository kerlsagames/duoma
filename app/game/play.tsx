import { RealtimeCardStage } from "@/components/RealtimeCardStage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { STAGE_ORDER } from "@/games/get-spicy/engine";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

export default function PlayScreen() {
  const router = useRouter();
  const {
    game,
    cards,
    deck,
    playCard,
    blockCard,
    endGame,
    myBlocksRemaining,
    partnerBlocksRemaining,
    partner,
  } = useApp();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!game) router.replace("/(tabs)");
  }, [game, router]);

  const active = deck.find((item) => item.status === "active") ?? null;
  const card = cards.find((item) => item.id === active?.cardId);
  const resolved = deck.filter((item) =>
    ["played", "blocked", "active"].includes(item.status)
  ).length;
  const remaining = deck.filter((item) => item.status === "queued").length;
  const completed = game?.status === "completed" || (!active && remaining === 0 && deck.length > 0);

  const progressLabel = useMemo(() => {
    if (!deck.length) return "No cards dealt";
    return `${Math.max(resolved, active ? 1 : 0)} / ${deck.length}`;
  }, [active, deck.length, resolved]);

  const onPlay = async () => {
    setError(null);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // native-only
    }
    await playCard();
  };

  const onBlock = async () => {
    setError(null);
    try {
      await blockCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not block");
    }
  };

  if (completed) {
    return (
      <Screen>
        <View className="flex-1 justify-center">
          <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
            Afterglow
          </Text>
          <Text className="mt-3 text-[36px] font-bold text-mist">You made it.</Text>
          <Text className="mt-3 text-[16px] leading-6 text-mist/70">
            Every stage is closed. Stay close. The deck is done for tonight.
          </Text>
          <View className="mt-8">
            <PrimaryButton
              label="Back home"
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

  return (
    <Screen>
      <View className="flex-1 py-3">
        <View className="mb-2 flex-row justify-between">
          {STAGE_ORDER.map((stage) => {
            const on = game?.currentStage === stage;
            return (
              <View
                key={stage}
                className={`h-1.5 flex-1 mx-0.5 rounded-full ${
                  on ? "bg-neon" : "bg-white/15"
                }`}
              />
            );
          })}
        </View>

        <RealtimeCardStage
          stage={active?.stage ?? game?.currentStage ?? null}
          active={active}
          card={card}
          progressLabel={progressLabel}
          emptyTitle={deck.length ? "Ready when you are" : "No live card yet"}
          emptyBody={
            deck.length
              ? "Either of you can hit Play Card. It flips on both phones at the same time."
              : "The deck is empty. Head back and deal again."
          }
        />

        <View className="mt-4 flex-row justify-between">
          <Text className="text-[13px] text-mist/50">
            Your blocks · {myBlocksRemaining}
          </Text>
          <Text className="text-[13px] text-mist/50">
            {partner?.displayName ?? "Partner"} · {partnerBlocksRemaining}
          </Text>
        </View>

        {error ? <Text className="mt-2 text-[13px] text-crimson">{error}</Text> : null}

        <View className="mt-4 gap-3 pb-3">
          <PrimaryButton
            label={active ? "Play next card" : "Play card"}
            onPress={() => void onPlay()}
          />
          <PrimaryButton
            label="Block / Skip"
            tone="danger"
            disabled={myBlocksRemaining <= 0 || !active}
            onPress={() => void onBlock()}
          />
          <PrimaryButton
            label="End session"
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
