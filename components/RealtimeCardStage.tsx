import { STAGE_META } from "@/games/get-spicy/engine";
import {
  cardFinishClimax,
  climaxLabel,
  maleFollowUpCopy,
} from "@/games/get-spicy/finish-climax";
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
  /** Hide card text (pre-foreplay tease until the night unlocks). */
  conceal?: boolean;
  concealTitle?: string;
  concealBody?: string;
  /** Keep it simple: one shared card, no “Alex played.” */
  shared?: boolean;
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
  conceal = false,
  concealTitle = "Daytime tease",
  concealBody = "They played a card. You will see what it was when the night starts.",
  shared = false,
}: Props) {
  const meta = stage ? STAGE_META[stage] : null;
  const copy = card ? personalizeCard(card, names, genders, shared) : null;
  const showLive = Boolean(active && copy) && !conceal;
  const stageLine = meta
    ? shared
      ? meta.label
      : `${meta.heat} · ${meta.label}`
    : "Shared stage";

  return (
    <View className={shared ? "" : "flex-1"}>
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-[12px] font-semibold uppercase tracking-[2px] text-neon">
          {stageLine}
        </Text>
        <Text className="max-w-[42%] text-right text-[12px] text-mist/50">
          {progressLabel}
        </Text>
      </View>

      <View className={shared ? "" : "flex-1 justify-center"}>
        <View
          className="rounded-[28px] border border-neon/30 bg-white/5 p-6"
          style={{ minHeight: shared ? 220 : 280 }}
        >
          {showLive ? (
            <>
              {shared ? null : (
                <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
                  {actorLabel ?? "Live card"}
                </Text>
              )}
              <Text
                className={`text-[15px] font-semibold text-mist/55 ${shared ? "" : "mt-4"}`}
              >
                {copy!.title}
              </Text>
              {card?.stage === "finish_off" ? (
                <Text className="mt-2 text-[13px] font-extrabold uppercase tracking-[2px] text-crimson">
                  {climaxLabel(cardFinishClimax(card, genders))}
                </Text>
              ) : null}
              <Text className="mt-3 text-[26px] font-bold leading-8 text-mist">
                {copy!.body}
              </Text>
              {card?.stage === "finish_off"
                ? (() => {
                    const follow = maleFollowUpCopy(
                      cardFinishClimax(card, genders)
                    );
                    return follow ? (
                      <Text className="mt-4 text-[18px] font-semibold leading-6 text-neon">
                        {follow}
                      </Text>
                    ) : null;
                  })()
                : null}
            </>
          ) : active && conceal ? (
            <>
              <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
                {actorLabel ?? "Live card"}
              </Text>
              <Text className="mt-4 text-[15px] font-semibold text-mist/55">
                Face down
              </Text>
              <Text className="mt-3 text-[26px] font-bold leading-8 text-mist">
                {concealTitle}
              </Text>
              <Text className="mt-4 text-[16px] leading-7 text-mist/65">
                {concealBody}
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
