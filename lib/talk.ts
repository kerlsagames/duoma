import {
  LETS_TALK_DECK,
  categoryById,
  type CategoryId,
  type Question,
} from "@/lib/promptsData";
import { SPICY_DARES, isSpicyDareDeck } from "@/lib/spicy-dares";
import type { TalkDeckState, TalkDraw, TalkVaultEntry } from "@/lib/types";
import { localDateKey } from "@/lib/dates";

export { LETS_TALK_DECK, categoryById };
export type { CategoryId, Question };

export function freshQueue(categoryId: string): string[] {
  if (isSpicyDareDeck(categoryId)) {
    return SPICY_DARES.map((dare) => dare.id);
  }
  const category = categoryById(categoryId);
  return category.questions.map((question) => question.id);
}

export function questionById(
  categoryId: string,
  questionId: string
): Question | null {
  if (isSpicyDareDeck(categoryId)) {
    const dare = SPICY_DARES.find((row) => row.id === questionId);
    return dare
      ? {
          id: dare.id,
          text: dare.text,
          status: dare.status === "played" ? "played" : "unplayed",
          tags: [...dare.categories],
        }
      : null;
  }
  return (
    categoryById(categoryId).questions.find((row) => row.id === questionId) ??
    null
  );
}

export function ensureDeck(
  existing: TalkDeckState | undefined,
  input: { id: string; coupleId: string; userId: string; categoryId: string }
): TalkDeckState {
  const expected = freshQueue(input.categoryId);
  if (!existing) {
    return {
      ...input,
      queue: expected,
      played: [],
    };
  }
  const known = new Set(expected);
  const kept = existing.queue.filter((id) => known.has(id));
  const missing = expected.filter((id) => !kept.includes(id));
  const played = existing.played.filter((id) => known.has(id));
  return {
    ...existing,
    queue: [...kept, ...missing],
    played,
  };
}

/** Permanent "already told" mark for Talk — does not recycle. */
export function markPlayed(
  deck: TalkDeckState,
  questionId: string
): TalkDeckState {
  if (deck.played.includes(questionId)) return deck;
  return { ...deck, played: [...deck.played, questionId] };
}

/**
 * Up for it still cycles the deck. Talk uses markPlayed + vault instead.
 */
export function rotatePlayed(
  deck: TalkDeckState,
  questionId: string
): TalkDeckState {
  const without = deck.queue.filter((id) => id !== questionId);
  const queue = [...without, questionId];
  const played = deck.played.includes(questionId)
    ? deck.played
    : [...deck.played, questionId];
  const complete = played.length >= queue.length && queue.length > 0;
  return {
    ...deck,
    queue,
    played: complete ? [] : played,
  };
}

export function vaultQuestionIds(
  vault: TalkVaultEntry[],
  input: { coupleId: string; categoryId?: string }
): Set<string> {
  return new Set(
    vault
      .filter(
        (row) =>
          row.coupleId === input.coupleId &&
          (!input.categoryId || row.categoryId === input.categoryId)
      )
      .map((row) => row.questionId)
  );
}

export function nextQuestionId(
  deck: TalkDeckState,
  excludeIds: Iterable<string> = []
): string | null {
  const blocked = new Set([...deck.played, ...excludeIds]);
  const pick = deck.queue.find((id) => !blocked.has(id));
  return pick ?? null;
}

export function todaysDraw(
  draws: TalkDraw[],
  input: { userId: string; categoryId: string; date?: string }
): TalkDraw | undefined {
  const date = input.date ?? localDateKey();
  return draws.find(
    (row) =>
      row.userId === input.userId &&
      row.categoryId === input.categoryId &&
      row.date === date &&
      !isSpicyDareDeck(row.categoryId)
  );
}

/** The single topic this player already chose today (if any). */
export function todaysPick(
  draws: TalkDraw[],
  userId: string,
  date = localDateKey()
): TalkDraw | undefined {
  return draws.find(
    (row) =>
      row.userId === userId &&
      row.date === date &&
      !isSpicyDareDeck(row.categoryId)
  );
}

export function categoryLockedToday(
  draws: TalkDraw[],
  input: { userId: string; categoryId: string; date?: string }
): boolean {
  const date = input.date ?? localDateKey();
  const pick = todaysPick(draws, input.userId, date);
  if (!pick) return false;
  return pick.categoryId !== input.categoryId;
}

/** 1 if they have not picked a topic yet today, else 0. */
export function remainingToday(
  draws: TalkDraw[],
  userId: string,
  date = localDateKey()
): number {
  return todaysPick(draws, userId, date) ? 0 : 1;
}

export function canShuffleDraw(draw: TalkDraw | undefined): boolean {
  return Boolean(draw && !draw.answeredAt && !draw.shuffledToday);
}
