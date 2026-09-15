import {
  DISCOVER_QUESTION_COUNT,
  DISCOVER_QUESTIONS,
  discoverQuestionById,
  type DiscoverCategoryId,
  type DiscoverQuestion,
} from "@/lib/discover-questions";
import type { CuriosityAnswer, CuriositySkip } from "@/lib/types";

export type {
  DiscoverCategoryId,
  DiscoverQuestion,
};
export {
  DISCOVER_QUESTIONS,
  DISCOVER_QUESTION_COUNT,
  discoverQuestionById,
};

export type DiscoverCategory = {
  id: DiscoverCategoryId;
  label: string;
  tint: string;
};

export type DiscoverFamily = {
  id: string;
  label: string;
  categories: DiscoverCategoryId[];
};

export const DISCOVER_CATEGORIES: DiscoverCategory[] = [
  { id: "have-flirty", label: "Have you · flirty", tint: "#E8A0BF" },
  { id: "have-spicy", label: "Have you · spicy", tint: "#E08AA8" },
  { id: "have-funny", label: "Have you · funny", tint: "#F0C07A" },
  { id: "have-bold", label: "Have you · bold", tint: "#C9A0DC" },
  { id: "last-flirty", label: "Last time · flirty", tint: "#F3B6C8" },
  { id: "last-spicy", label: "Last time · spicy", tint: "#D989A8" },
  { id: "last-funny", label: "Last time · funny", tint: "#E8C99A" },
  { id: "last-bold", label: "Last time · bold", tint: "#B8A0DC" },
  { id: "solo", label: "Solo habits", tint: "#C5B4E3" },
  { id: "prefs", label: "Preferences", tint: "#E8A0C0" },
  { id: "taboo", label: "Taboos & thrills", tint: "#D4A0C8" },
  { id: "memory", label: "Memory lane", tint: "#A8C5D8" },
  { id: "would-rather", label: "Would you rather", tint: "#F0B4A0" },
  { id: "dreams", label: "Hidden desires", tint: "#C9B8E8" },
  { id: "fears", label: "Fears", tint: "#B8C8E0" },
  { id: "values", label: "Values", tint: "#A8D5C4" },
  { id: "childhood", label: "Childhood", tint: "#E8D4A8" },
  { id: "habits", label: "Guilty pleasures", tint: "#D8C4E8" },
  { id: "us", label: "Us", tint: "#F3B6C8" },
  { id: "existential", label: "Existential", tint: "#B0C8D8" },
  { id: "body", label: "Body", tint: "#E8A8B8" },
  { id: "kinks", label: "Kinks", tint: "#D89AB8" },
  { id: "solo-tech", label: "Solo & media", tint: "#C8B0DC" },
  { id: "bedroom", label: "Bedroom truths", tint: "#E0A8C0" },
  { id: "risky", label: "Public & risky", tint: "#D8A0B0" },
  { id: "emotion", label: "Vulnerability", tint: "#B8C8E8" },
  { id: "wild", label: "Wild scenarios", tint: "#C9A0DC" },
  { id: "power", label: "Power & control", tint: "#C084C8" },
  { id: "voyeur", label: "Seen & watching", tint: "#E8A8C0" },
  { id: "dirty-talk", label: "Dirty talk", tint: "#D989B8" },
  { id: "sensory", label: "Sensation", tint: "#B8A8DC" },
  { id: "forbidden", label: "Forbidden", tint: "#D4A0B8" },
];

export const DISCOVER_FAMILIES: DiscoverFamily[] = [
  {
    id: "have",
    label: "Have you ever",
    categories: ["have-flirty", "have-spicy", "have-funny", "have-bold"],
  },
  {
    id: "last",
    label: "When was the last time",
    categories: ["last-flirty", "last-spicy", "last-funny", "last-bold"],
  },
  {
    id: "deep",
    label: "Secrets & self",
    categories: [
      "solo",
      "dreams",
      "fears",
      "values",
      "childhood",
      "habits",
      "us",
      "existential",
    ],
  },
  {
    id: "heat",
    label: "Spicy & explicit",
    categories: [
      "prefs",
      "taboo",
      "memory",
      "would-rather",
      "body",
      "kinks",
      "solo-tech",
      "bedroom",
      "risky",
      "emotion",
      "wild",
      "power",
      "voyeur",
      "dirty-talk",
      "sensory",
      "forbidden",
    ],
  },
];

export const ALL_DISCOVER_CATEGORY_IDS: DiscoverCategoryId[] =
  DISCOVER_CATEGORIES.map((row) => row.id);

export function discoverCategoryMeta(id: DiscoverCategoryId): DiscoverCategory {
  return (
    DISCOVER_CATEGORIES.find((row) => row.id === id) ?? {
      id,
      label: id,
      tint: "#C9A0DC",
    }
  );
}

function seededRand(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], rand: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

function shuffledDiscoverDeck(seed: string): DiscoverQuestion[] {
  const rand = seededRand(seed);
  const bag = shuffleInPlace([...DISCOVER_QUESTIONS], rand);
  const mixed: DiscoverQuestion[] = [];
  while (bag.length) {
    const last = mixed[mixed.length - 1]?.category;
    const options = bag
      .map((_, index) => index)
      .filter((index) => bag[index]!.category !== last);
    const pool = options.length > 0 ? options : bag.map((_, index) => index);
    const pick = pool[Math.floor(rand() * pool.length)]!;
    const [next] = bag.splice(pick, 1);
    mixed.push(next!);
  }
  return mixed;
}

/** One shuffled deck per couple+user; leftovers keep that order. */
export function leftoverDiscover(
  seenIds: Iterable<string>,
  enabled: Iterable<DiscoverCategoryId>,
  seed = "deck"
): DiscoverQuestion[] {
  const seen = new Set(seenIds);
  const on = new Set(enabled);
  return shuffledDiscoverDeck(`${seed}:discover-v1`).filter(
    (row) => !seen.has(row.id) && on.has(row.category)
  );
}

export function isDiscoverAnswered(
  row: CuriosityAnswer | null | undefined
): boolean {
  return Boolean(row && discoverQuestionById(row.questionId));
}

export function seenDiscoverIds(
  answers: CuriosityAnswer[],
  skips: CuriositySkip[],
  userId: string | undefined
): string[] {
  const ids: string[] = [];
  for (const row of answers) {
    if (row.userId === userId && isDiscoverAnswered(row)) ids.push(row.questionId);
  }
  for (const row of skips) {
    if (row.userId === userId) ids.push(row.questionId);
  }
  return ids;
}

export function vaultEntries(
  answers: CuriosityAnswer[],
  myId: string | undefined,
  partnerId: string | undefined
): {
  question: DiscoverQuestion;
  mine: CuriosityAnswer | null;
  theirs: CuriosityAnswer | null;
  at: string;
}[] {
  const mineByQ = new Map<string, CuriosityAnswer>();
  const theirsByQ = new Map<string, CuriosityAnswer>();
  for (const row of answers) {
    if (!isDiscoverAnswered(row)) continue;
    if (row.userId === myId) mineByQ.set(row.questionId, row);
    if (partnerId && row.userId === partnerId) theirsByQ.set(row.questionId, row);
  }
  const ids = new Set([...mineByQ.keys(), ...theirsByQ.keys()]);
  const rows = [...ids]
    .map((id) => {
      const question = discoverQuestionById(id);
      if (!question) return null;
      const mine = mineByQ.get(id) ?? null;
      const theirs = theirsByQ.get(id) ?? null;
      const at = [mine?.createdAt, theirs?.createdAt]
        .filter(Boolean)
        .sort()
        .slice(-1)[0] as string;
      return { question, mine, theirs, at };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}

export function normalizeEnabledCategories(
  value: unknown
): DiscoverCategoryId[] {
  const allowed = new Set(ALL_DISCOVER_CATEGORY_IDS);
  if (!Array.isArray(value)) return [...ALL_DISCOVER_CATEGORY_IDS];
  const next = value.filter((id): id is DiscoverCategoryId =>
    allowed.has(id as DiscoverCategoryId)
  );
  return next.length ? next : [...ALL_DISCOVER_CATEGORY_IDS];
}
