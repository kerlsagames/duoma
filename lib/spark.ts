import { applyOverlay } from "@/lib/catalog-overlay";
import { SPARK_CARDS_SEED } from "@/lib/spark-cards";
import { createId, nowIso } from "@/lib/ids";

export type SparkLocation = "from_afar" | "at_home";
export type SparkIntensity = 1 | 2 | 3;
export type SparkCategoryId =
  | "whispers"
  | "tokens"
  | "remote"
  | "arrival"
  | "sensory"
  | "teasing"
  | "questions"
  | "threshold";

export type SparkCard = {
  id: string;
  location: SparkLocation;
  category: SparkCategoryId;
  intensity: SparkIntensity;
  title: string;
  prompt: string;
};

export type SparkAskStatus = "offered" | "done" | "dismissed";

export type SparkAsk = {
  id: string;
  cardId: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  status: SparkAskStatus;
  answeredAt: string | null;
};

export type SparkState = {
  favorites: string[];
  doneIds: string[];
  asks: SparkAsk[];
};

export const SPARK_CATEGORIES: {
  id: SparkCategoryId;
  label: string;
  location: SparkLocation;
}[] = [
  { id: "whispers", label: "Digital whispers", location: "from_afar" },
  { id: "tokens", label: "Secret tokens", location: "from_afar" },
  { id: "remote", label: "Remote play", location: "from_afar" },
  { id: "arrival", label: "Arrival protocol", location: "from_afar" },
  { id: "sensory", label: "Sensory", location: "at_home" },
  { id: "teasing", label: "Teasing", location: "at_home" },
  { id: "questions", label: "Curiosity", location: "at_home" },
  { id: "threshold", label: "Threshold", location: "at_home" },
];

const CATEGORY_IDS = new Set(SPARK_CATEGORIES.map((row) => row.id));

function asCategory(value: string | undefined): SparkCategoryId {
  return CATEGORY_IDS.has(value as SparkCategoryId)
    ? (value as SparkCategoryId)
    : "whispers";
}

function asLocation(value: string | undefined): SparkLocation {
  return value === "at_home" ? "at_home" : "from_afar";
}

function asIntensity(value: unknown): SparkIntensity {
  if (value === 3 || value === "3") return 3;
  if (value === 1 || value === "1") return 1;
  return 2;
}

export function emptySparkState(): SparkState {
  return { favorites: [], doneIds: [], asks: [] };
}

export function sparkCards(includeHidden = false): SparkCard[] {
  return applyOverlay(
    "spark",
    SPARK_CARDS_SEED,
    (row, edit) => {
      const group = edit.group?.trim() || "";
      const [loc, cat, heat] = group.split(":");
      return {
        ...row,
        title: edit.title?.trim() || row.title,
        prompt: edit.body?.trim() || row.prompt,
        location: group ? asLocation(loc) : row.location,
        category: group ? asCategory(cat) : row.category,
        intensity: heat ? asIntensity(heat) : row.intensity,
      };
    },
    (row) => {
      const [loc, cat, heat] = (row.group || "").split(":");
      return {
        id: row.id,
        title: row.title.trim() || "Untitled spark",
        prompt: row.body.trim() || row.title,
        location: asLocation(loc),
        category: asCategory(cat),
        intensity: asIntensity(heat),
      };
    },
    includeHidden
  );
}

export function sparkById(id: string): SparkCard | null {
  return sparkCards().find((row) => row.id === id) ?? null;
}

export function categoryMeta(id: SparkCategoryId) {
  return SPARK_CATEGORIES.find((row) => row.id === id) ?? SPARK_CATEGORIES[0]!;
}

export function filterSparks(input: {
  location?: SparkLocation | "all";
  category?: SparkCategoryId | null;
}): SparkCard[] {
  const location = input.location ?? "all";
  return sparkCards().filter((row) => {
    if (location !== "all" && row.location !== location) return false;
    if (input.category && row.category !== input.category) return false;
    return true;
  });
}

export function pickSpark(
  pool: SparkCard[],
  excludeId?: string | null
): SparkCard | null {
  if (!pool.length) return null;
  const rest = excludeId ? pool.filter((row) => row.id !== excludeId) : pool;
  const source = rest.length ? rest : pool;
  return source[Math.floor(Math.random() * source.length)] ?? null;
}

export function intensityLabel(level: SparkIntensity) {
  if (level === 3) return "Steamy";
  if (level === 2) return "Teasing";
  return "Subtle";
}

export function locationLabel(location: SparkLocation) {
  return location === "from_afar" ? "From afar" : "At home";
}

export function hydrateSparkState(raw: unknown): SparkState {
  const base = emptySparkState();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<SparkState>;
  const favorites = Array.isArray(row.favorites)
    ? row.favorites.filter((id): id is string => typeof id === "string")
    : base.favorites;
  const doneIds = Array.isArray(row.doneIds)
    ? row.doneIds.filter((id): id is string => typeof id === "string")
    : base.doneIds;
  const asks = Array.isArray(row.asks)
    ? row.asks.map(hydrateAsk).filter((item): item is SparkAsk => Boolean(item))
    : base.asks;
  return { favorites, doneIds, asks };
}

function hydrateAsk(raw: unknown): SparkAsk | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<SparkAsk>;
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.cardId !== "string" || !row.cardId) return null;
  if (typeof row.fromUserId !== "string" || !row.fromUserId) return null;
  if (typeof row.toUserId !== "string" || !row.toUserId) return null;
  const status: SparkAskStatus =
    row.status === "done" || row.status === "dismissed" ? row.status : "offered";
  return {
    id: row.id,
    cardId: row.cardId,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    createdAt: typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso(),
    status,
    answeredAt: typeof row.answeredAt === "string" ? row.answeredAt : null,
  };
}

export function toggleFavorite(state: SparkState, cardId: string): SparkState {
  const on = state.favorites.includes(cardId);
  return {
    ...state,
    favorites: on
      ? state.favorites.filter((id) => id !== cardId)
      : [cardId, ...state.favorites],
  };
}

export function markSparkDone(state: SparkState, cardId: string): SparkState {
  const doneIds = state.doneIds.includes(cardId)
    ? state.doneIds
    : [cardId, ...state.doneIds];
  return {
    ...state,
    doneIds,
    asks: state.asks.map((ask) =>
      ask.cardId === cardId && ask.status === "offered"
        ? { ...ask, status: "done", answeredAt: nowIso() }
        : ask
    ),
  };
}

export function sendSparkAsk(
  state: SparkState,
  input: { cardId: string; fromUserId: string; toUserId: string }
): SparkState {
  const ask: SparkAsk = {
    id: createId(),
    cardId: input.cardId,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    createdAt: nowIso(),
    status: "offered",
    answeredAt: null,
  };
  return { ...state, asks: [ask, ...state.asks].slice(0, 80) };
}

export function shareCopy(card: SparkCard) {
  return `${card.title}\n\n${card.prompt}`;
}
