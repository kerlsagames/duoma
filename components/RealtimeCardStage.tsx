import { STAGE_META } from "@/games/get-spicy/engine";
import type { Card, CardStage, DeckCard } from "@/lib/types";
import { Text, View } from "react-native";

type Props = {
  stage: CardStage | null;
  active: DeckCard | null;
  card: Card | undefined;
  progressLabel: string;
  emptyTitle: string;
  emptyBody: string;
};

export function RealtimeCardStage({
  stage,
  active,
  card,
  progressLabel,
  emptyTitle,
  emptyBody,
}: Props) {
  const meta = stage ? STAGE_META[stage] : null;

  return (
    <View className="flex-1">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
          {meta ? `${meta.heat} · ${meta.label}` : "Shared stage"}
        </Text>
        <Text className="text-[12px] text-mist/50">{progressLabel}</Text>
      </View>

      <View className="flex-1 justify-center">
        <View className="min-h-[280px] rounded-[28px] border border-neon/30 bg-white/5 p-7">
          {active && card ? (
            <>
              <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
                Live card
              </Text>
              <Text className="mt-5 text-[28px] font-bold leading-8 text-mist">
                {card.title}
              </Text>
              <Text className="mt-4 text-[17px] leading-7 text-mist/80">
                {card.body}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-mist/40">
                Face down
              </Text>
              <Text className="mt-5 text-[26px] font-bold leading-8 text-mist">
                {emptyTitle}
              </Text>
              <Text className="mt-4 text-[16px] leading-7 text-mist/65">
                {emptyBody}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
