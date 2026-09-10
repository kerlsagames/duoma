import {
  LETS_TALK_DECK,
  categoryById,
  type CategoryId,
  type Question,
} from "@/lib/promptsData";
import type { TalkDeckState, TalkDraw } from "@/lib/types";
import { localDateKey } from "@/lib/dates";

export { LETS_TALK_DECK, categoryById };
export type { CategoryId, Question };

export function freshQueue(categoryId: string): string[] {
  const category = categoryById(categoryId);
  return category.questions.map((question) => question.id);
}

export function questionById(categoryId: string, questionId: string): Question | null {
  return categoryById(categoryId).questions.find((row) => row.id === questionId) ?? null;
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

export function nextQuestionId(deck: TalkDeckState): string {
  const unplayed = deck.queue.filter((id) => !deck.played.includes(id));
  if (unplayed[0]) return unplayed[0];
  if (deck.queue[0]) return deck.queue[0];
  return freshQueue(deck.categoryId)[0];
}

export function rotatePlayed(deck: TalkDeckState, questionId: string): TalkDeckState {
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

export function todaysDraw(
  draws: TalkDraw[],
  input: { userId: string; categoryId: string; date?: string }
): TalkDraw | undefined {
  const date = input.date ?? localDateKey();
  return draws.find(
    (row) =>
      row.userId === input.userId &&
      row.categoryId === input.categoryId &&
      row.date === date
  );
}

export function categoryLockedToday(
  draws: TalkDraw[],
  input: { userId: string; categoryId: string; date?: string }
): boolean {
  return Boolean(todaysDraw(draws, input));
}

export function remainingToday(
  draws: TalkDraw[],
  userId: string,
  date = localDateKey()
): number {
  const used = new Set(
    draws
      .filter((row) => row.userId === userId && row.date === date)
      .map((row) => row.categoryId)
  );
  return LETS_TALK_DECK.filter((category) => !used.has(category.id)).length;
}
