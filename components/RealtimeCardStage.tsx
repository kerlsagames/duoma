import { STAGE_META } from "@/games/get-spicy/engine";
import {
  personalizeCard,
  resolveCardNames,
  type GenderPair,
  type NamePair,
} from "@/lib/personalize";
import type { Card, CardStage, DeckCard } from "@/lib/types";
import { Text, View } from "react-native";

type Props = {
  stage: CardStage | null;
  active: DeckCard | null;
  card: Card | undefined;
  names: NamePair;
  genders?: GenderPair | null;
  progressLabel: string;
  emptyTitle: string;
  emptyBody: string;
  actorLabel?: string | null;
};

export function RealtimeCardStage({
  stage,
  active,
  card,
  names,
  genders,
  progressLabel,
  emptyTitle,
  emptyBody,
  actorLabel,
}: Props) {
  const meta = stage ? STAGE_META[stage] : null;
  const copy = card ? personalizeCard(card, names, genders) : null;

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
          {active && copy ? (
            <>
              <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
                {actorLabel ?? "Live card"}
              </Text>
              <Text className="mt-4 text-[15px] font-semibold text-mist/55">
                {copy.title}
              </Text>
              <Text className="mt-3 text-[26px] font-bold leading-8 text-mist">
                {copy.body}
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

export function usePreviewNames(
  userName: string | null | undefined,
  partnerName: string | null | undefined
): NamePair {
  return resolveCardNames({ userName, partnerName });
}
