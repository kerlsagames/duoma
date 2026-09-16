import type { Card, CardStage, DefaultCardSeed, StageCounts } from "@/lib/types";
import { shuffle } from "@/lib/ids";
import { cardAllowedByFlavorTags } from "@/games/get-spicy/flavor-tags";
import {
  finishCardFitsBeat,
} from "@/games/get-spicy/finish-climax";
import type { GenderPair } from "@/lib/personalize";

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
  pre_foreplay: 4,
  foreplay: 4,
  step_it_up: 4,
  finish_off: 1,
  afterglow: 1,
};

export const SIMPLE_STAGE_ORDER: CardStage[] = [
  "foreplay",
  "step_it_up",
  "finish_off",
];

/** Counts only mark a stage as in-play. Foreplay and Step it up stay open until Ready to move on. */
export const SIMPLE_STAGE_COUNTS: StageCounts = {
  pre_foreplay: 0,
  foreplay: 1,
  step_it_up: 1,
  finish_off: 1,
  afterglow: 0,
};

export function isSimpleOpenStage(
  pace: string | null | undefined,
  stage: CardStage | null | undefined
): boolean {
  return (
    pace === "simple" &&
    (stage === "foreplay" || stage === "step_it_up")
  );
}

export function stagesForPace(pace: string | null | undefined): CardStage[] {
  return pace === "simple" ? SIMPLE_STAGE_ORDER : STAGE_ORDER;
}

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

export const HAND_SIZE = 3;

/** Passes ("I don't participate"): 0–5. */
export function normalizePassLimit(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(5, Math.max(0, Math.round(value)));
}

/** Shuffles: 0–10, or -1 for unlimited. */
export function normalizeShuffleLimit(value: number): number {
  if (!Number.isFinite(value)) return 3;
  const rounded = Math.round(value);
  if (rounded < 0) return -1;
  return Math.min(10, rounded);
}

export function firstActiveStage(counts: StageCounts): CardStage | null {
  for (const stage of STAGE_ORDER) {
    if (counts[stage] > 0) return stage;
  }
  return null;
}

export function nextActiveStage(
  counts: StageCounts,
  from: CardStage
): CardStage | null {
  const index = STAGE_ORDER.indexOf(from);
  if (index < 0) return firstActiveStage(counts);
  for (let i = index + 1; i < STAGE_ORDER.length; i += 1) {
    const stage = STAGE_ORDER[i];
    if (counts[stage] > 0) return stage;
  }
  return null;
}

export function playedCountForStage(
  deck: { stage: CardStage; status: string }[],
  stage: CardStage
): number {
  return deck.filter(
    (item) => item.stage === stage && item.status === "played"
  ).length;
}

export function dealHandFromBank(
  bank: Card[],
  stage: CardStage,
  excludeIds: Set<string>,
  enabledFlavorTags?: string[] | null,
  count: number = HAND_SIZE
): Card[] {
  return pickRandomFromBank(bank, stage, count, excludeIds, enabledFlavorTags);
}

/** Finish Off: first hand is F or FM; after an F-only card, deal M-only. */
export function dealFinishHandFromBank(
  bank: Card[],
  excludeIds: Set<string>,
  enabledFlavorTags: string[] | null | undefined,
  beat: "F" | "M",
  genders: GenderPair | null | undefined,
  count: number = HAND_SIZE
): Card[] {
  const fits = (ignoreFlavor: boolean) =>
    bank.filter(
      (card) =>
        card.stage === "finish_off" &&
        card.isActive &&
        !excludeIds.has(card.id) &&
        (ignoreFlavor ||
          cardAllowedByFlavorTags(card, enabledFlavorTags ?? null)) &&
        finishCardFitsBeat(card, beat, genders)
    );
  const picked = shuffle(fits(false)).slice(0, Math.max(0, count));
  if (picked.length > 0) return picked;
  const wider = shuffle(fits(true)).slice(0, Math.max(0, count));
  if (wider.length > 0) return wider;
  if (beat === "M") return [];
  return pickRandomFromBank(
    bank,
    "finish_off",
    count,
    excludeIds,
    enabledFlavorTags
  );
}
