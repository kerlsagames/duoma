import {
  CURIOSITY_QUESTIONS,
  curiosityQuestionById,
  dailyCuriosityQuestion,
} from "@/lib/curiosityQuestions";
import type { CuriosityAnswer, Profile } from "@/lib/types";

export {
  CURIOSITY_QUESTIONS,
  curiosityQuestionById,
  dailyCuriosityQuestion,
};

/** @deprecated use dailyCuriosityQuestion — kept for older imports */
export function curiosityFor(coupleId: string, date: string) {
  const question = dailyCuriosityQuestion(coupleId, date);
  return { id: question.id, prompt: question.question };
}

export function isCuriosityComplete(row: CuriosityAnswer | null | undefined): boolean {
  return Boolean(
    row &&
      row.answerIndex != null &&
      row.guessIndex != null &&
      row.answerIndex >= 0 &&
      row.guessIndex >= 0
  );
}

export function dayMatchPoints(
  a: CuriosityAnswer | null | undefined,
  b: CuriosityAnswer | null | undefined
): number {
  if (!isCuriosityComplete(a) || !isCuriosityComplete(b)) return 0;
  let points = 0;
  if (a!.guessIndex === b!.answerIndex) points += 1;
  if (b!.guessIndex === a!.answerIndex) points += 1;
  return points;
}

export function curiositySynergy(answers: CuriosityAnswer[]): {
  matchScore: number;
  daysPlayed: number;
  matchRate: number;
} {
  const byDate = new Map<string, CuriosityAnswer[]>();
  for (const row of answers) {
    if (!isCuriosityComplete(row)) continue;
    const list = byDate.get(row.date) ?? [];
    list.push(row);
    byDate.set(row.date, list);
  }
  let matchScore = 0;
  let daysPlayed = 0;
  for (const rows of byDate.values()) {
    const users = [...new Map(rows.map((row) => [row.userId, row])).values()];
    if (users.length < 2) continue;
    matchScore += dayMatchPoints(users[0], users[1]);
    daysPlayed += 1;
  }
  const possible = daysPlayed * 2;
  return {
    matchScore,
    daysPlayed,
    matchRate: possible === 0 ? 0 : Math.round((matchScore / possible) * 100),
  };
}

export function matchHeadline(points: number): { title: string; detail: string } {
  if (points >= 2) {
    return {
      title: "Double Match! +2 pts",
      detail: "You both read each other. Synergy on fire.",
    };
  }
  if (points === 1) {
    return {
      title: "1/2 Match! +1 pt",
      detail: "One of you nailed it. The other stays deliciously mysterious.",
    };
  }
  return {
    title: "0/2 Matches — Total Mystery!",
    detail: "Plot twist energy. Learn each other and come back tomorrow.",
  };
}

export function optionLabel(
  questionId: string,
  index: number | null | undefined
): string {
  if (index == null || index < 0) return "—";
  const question = curiosityQuestionById(questionId);
  return question?.options[index] ?? "—";
}

export function answersForDate(
  answers: CuriosityAnswer[],
  date: string,
  userId?: string,
  partnerId?: string
) {
  const mine = userId
    ? answers.find((row) => row.userId === userId && row.date === date)
    : undefined;
  const theirs = partnerId
    ? answers.find((row) => row.userId === partnerId && row.date === date)
    : undefined;
  return { mine, theirs };
}

export function partnerDisplayName(partner: Profile | null | undefined) {
  return partner?.displayName?.trim() || "your partner";
}
