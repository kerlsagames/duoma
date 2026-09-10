import type { Card, CardStage, DefaultCardSeed, StageCounts } from "@/lib/types";
import { shuffle } from "@/lib/ids";
import { cardAllowedByFlavorTags } from "@/games/get-spicy/flavor-tags";

export const STAGE_ORDER: CardStage[] = [
  "pre_foreplay",
  "foreplay",
  "step_it_up",
  "finish_off",
  "afterglow",
];

export const STAGE_META: Record<
  CardStage,
  { label: string; short: string; heat: string }
> = {
  pre_foreplay: { label: "Pre-Foreplay", short: "Tease", heat: "Stage 1" },
  foreplay: { label: "Foreplay", short: "Warm", heat: "Stage 2" },
  step_it_up: { label: "Step It Up", short: "Heat", heat: "Stage 3" },
  finish_off: { label: "Finish Off", short: "Finish", heat: "Stage 4" },
  afterglow: { label: "Afterglow", short: "Glow", heat: "Stage 5" },
};

export const DEFAULT_STAGE_COUNTS: StageCounts = {
  pre_foreplay: 2,
  foreplay: 2,
  step_it_up: 2,
  finish_off: 1,
  afterglow: 1,
};

export function normalizeStageCounts(
  counts?: Partial<StageCounts> | null
): StageCounts {
  return { ...DEFAULT_STAGE_COUNTS, ...(counts ?? {}) };
}

export function totalCards(counts: StageCounts): number {
  return STAGE_ORDER.reduce((sum, stage) => sum + counts[stage], 0);
}

export function pickRandomFromBank(
  bank: Card[],
  stage: CardStage,
  count: number,
  excludeIds: Set<string> = new Set(),
  enabledFlavorTags?: string[] | null
): Card[] {
  const pool = bank.filter(
    (card) =>
      card.stage === stage &&
      card.isActive &&
      !excludeIds.has(card.id) &&
      cardAllowedByFlavorTags(card, enabledFlavorTags ?? null)
  );
  return shuffle(pool).slice(0, Math.max(0, count));
}

export function buildRandomDeck(
  bank: Card[],
  counts: StageCounts,
  enabledFlavorTags?: string[] | null
): Card[] {
  const picked: Card[] = [];
  const used = new Set<string>();
  for (const stage of STAGE_ORDER) {
    const next = pickRandomFromBank(
      bank,
      stage,
      counts[stage],
      used,
      enabledFlavorTags
    );
    next.forEach((card) => used.add(card.id));
    picked.push(...next);
  }
  return picked;
}

export function replacementCard(
  bank: Card[],
  stage: CardStage,
  usedIds: Set<string>,
  enabledFlavorTags?: string[] | null
): Card | null {
  return pickRandomFromBank(bank, stage, 1, usedIds, enabledFlavorTags)[0] ?? null;
}

export function seedToPreview(seed: DefaultCardSeed) {
  return {
    stage: seed.category,
    title: seed.title,
    body: seed.description,
  };
}
