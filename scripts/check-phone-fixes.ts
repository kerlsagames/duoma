import { nextOrderedCard } from "@/games/get-spicy/engine";
import {
  occurrenceDates,
  coversMatches,
  nextOccurrenceOnOrAfter,
} from "@/lib/calendar-repeat";
import { doodleTeamScore, mergeDoodleBoards, type DoodleBoard, type DoodleRound } from "@/lib/doodle-game";
import { personalize } from "@/lib/personalize";
import type { Card } from "@/lib/types";

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

const names = { player: "Craig", partner: "Sam" };
const genders = { player: "male" as const, partner: "female" as const };
const swapped = { player: "Sam", partner: "Craig" };
const swappedGenders = { player: "female" as const, partner: "male" as const };

const cockCard = personalize(
  "{player}, stroke your {player_cock} in front of {partner}.",
  names,
  genders
);
assert(cockCard === "Craig, stroke your cock in front of Sam.", cockCard);

const herTurn = personalize(
  "{player}, stroke your {player_cock} in front of {partner}.",
  swapped,
  swappedGenders
);
assert(herTurn === "Sam, stroke your pussy in front of Craig.", herTurn);
assert(!herTurn.includes("{"), herTurn);
assert(!herTurn.includes("cock}"), herTurn);

const either = personalize(
  "{player}, hover over {partner}'s {partner_pussy} or {partner_cock}.",
  names,
  genders
);
assert(either === "Craig, hover over Sam's pussy.", either);

const hardcoded = personalize(
  "{player}, slide two fingers into {partner}'s pussy.",
  swapped,
  swappedGenders
);
assert(hardcoded === "Sam, slide two fingers into Craig's cock.", hardcoded);

const finish = personalize(
  "M holds a wand on F's clit while he is inside her.",
  names,
  genders
);
assert(finish.includes("Craig"), finish);
assert(finish.includes("Sam's clit"), finish);
assert(!finish.includes("Craig's clit"), finish);

const weeks = occurrenceDates("2026-10-01", "2week", "2026-10-01", "2026-11-12");
assert(
  weeks.join(",") === "2026-10-01,2026-10-15,2026-10-29,2026-11-12",
  weeks.join(",")
);
assert(nextOccurrenceOnOrAfter("2026-10-01", "2week", "2026-10-16") === "2026-10-29", "next");
assert(coversMatches("both", "m") === true, "both covers m");
assert(coversMatches("kids", "m") === false, "kids not m");
assert(coversMatches("all", "kids") === true, "all covers kids");

const bank: Card[] = ["Alpha", "Middle", "Zulu"].map((title, index) => ({
  id: `c${index}`,
  coupleId: "c",
  stage: "foreplay",
  title,
  body: title,
  isDefault: true,
  isActive: true,
  sortOrder: index,
  createdBy: "u",
  createdAt: "",
}));
assert(nextOrderedCard(bank, "foreplay", new Set(), null, "Alpha")?.title === "Middle", "next");
assert(nextOrderedCard(bank, "foreplay", new Set(["c1"]), null, "Alpha")?.title === "Zulu", "skip used");
assert(nextOrderedCard(bank, "foreplay", new Set(["c2"]), null, "Zulu")?.title === "Alpha", "wrap");

function round(partial: Partial<DoodleRound> & Pick<DoodleRound, "id" | "status" | "createdAt">): DoodleRound {
  return {
    drawerId: "a",
    guesserId: "b",
    options: ["A", "B", "C"],
    prompt: "Cat",
    category: "animals",
    strokes: [],
    guess: null,
    correct: partial.status === "revealed",
    sentAt: null,
    guessedAt: null,
    ...partial,
  };
}

function board(round: DoodleRound | null, history: DoodleRound[] = []): DoodleBoard {
  return {
    strokes: round?.strokes ?? [],
    updatedAt: round?.createdAt ?? "",
    updatedBy: "a",
    enabledCategories: ["animals"],
    round,
    scores: {},
    history,
  };
}

const finished = round({
  id: "r1",
  status: "revealed",
  createdAt: "2026-10-01T00:00:00.000Z",
  correct: true,
});
const nxt = round({
  id: "r2",
  status: "pick",
  createdAt: "2026-10-01T00:05:00.000Z",
  correct: null,
  prompt: null,
});
const merged = mergeDoodleBoards(
  board(nxt, [finished]),
  board(finished, [])
);
assert(merged.round?.id === "r2", `round stuck on ${merged.round?.id}`);
assert(doodleTeamScore(merged.history) === 1, "team score");

console.log("phone fixes ok");
