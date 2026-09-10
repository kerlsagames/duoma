export type StarterListKey =
  | "movies"
  | "places_eat"
  | "places_visit"
  | "activities"
  | "tv";

export type StarterListDef = {
  key: StarterListKey;
  title: string;
  emoji: string;
  accent: string;
  hint: string;
  /** Placeholder for the add field, e.g. "Movie name". */
  itemPlaceholder: string;
  /** Done button + vault verb, e.g. "Watched". */
  doneLabel: string;
  /** Vault folder title, e.g. "Movies watched". */
  vaultTitle: string;
};

/** Built-in couple lists — seeded once per couple. */
export const STARTER_LISTS: StarterListDef[] = [
  {
    key: "movies",
    title: "Movies to watch",
    emoji: "🎬",
    accent: "#FF6B4A",
    hint: "Date-night films, rewatches, cinema picks",
    itemPlaceholder: "Movie name",
    doneLabel: "Watched",
    vaultTitle: "Movies watched",
  },
  {
    key: "places_eat",
    title: "Places to eat",
    emoji: "🍜",
    accent: "#FFB020",
    hint: "Restaurants, food trucks, that bakery you keep meaning to try",
    itemPlaceholder: "Place name",
    doneLabel: "Went",
    vaultTitle: "Places we ate",
  },
  {
    key: "places_visit",
    title: "Places to visit",
    emoji: "🗺️",
    accent: "#2EC4B6",
    hint: "Day trips, cities, viewpoints, weekend escapes",
    itemPlaceholder: "Place name",
    doneLabel: "Visited",
    vaultTitle: "Places visited",
  },
  {
    key: "activities",
    title: "Activities to try",
    emoji: "🎯",
    accent: "#5B8CFF",
    hint: "Classes, hobbies, adventures, spontaneous plans",
    itemPlaceholder: "Activity name",
    doneLabel: "Tried",
    vaultTitle: "Activities tried",
  },
  {
    key: "tv",
    title: "TV shows to watch",
    emoji: "📺",
    accent: "#C084FC",
    hint: "Series to binge together, one episode at a time",
    itemPlaceholder: "Show name",
    doneLabel: "Watched",
    vaultTitle: "Shows watched",
  },
];

export const CUSTOM_LIST_ACCENTS = [
  "#FF6B4A",
  "#FFB020",
  "#2EC4B6",
  "#5B8CFF",
  "#F472B6",
  "#34D399",
  "#FBBF24",
  "#60A5FA",
];

export type ListFieldCopy = {
  itemPlaceholder: string;
  doneLabel: string;
  vaultTitle: string;
};

export function starterDef(key: string | null | undefined) {
  if (!key) return null;
  return STARTER_LISTS.find((row) => row.key === key) ?? null;
}

/** Placeholder + done verb + vault folder title for a list (starter or custom). */
export function listFieldCopy(input: {
  starterKey?: string | null;
  title?: string;
}): ListFieldCopy {
  const starter = starterDef(input.starterKey);
  if (starter) {
    return {
      itemPlaceholder: starter.itemPlaceholder,
      doneLabel: starter.doneLabel,
      vaultTitle: starter.vaultTitle,
    };
  }
  const title = (input.title ?? "").trim();
  const lower = title.toLowerCase();
  if (lower.includes("movie") || lower.includes("film")) {
    return {
      itemPlaceholder: "Movie name",
      doneLabel: "Watched",
      vaultTitle: title ? `${title} · watched` : "Movies watched",
    };
  }
  if (lower.includes("tv") || lower.includes("show")) {
    return {
      itemPlaceholder: "Show name",
      doneLabel: "Watched",
      vaultTitle: title ? `${title} · watched` : "Shows watched",
    };
  }
  if (lower.includes("eat") || lower.includes("food") || lower.includes("restaurant")) {
    return {
      itemPlaceholder: "Place name",
      doneLabel: "Went",
      vaultTitle: title ? `${title} · done` : "Places we ate",
    };
  }
  if (lower.includes("visit") || lower.includes("travel") || lower.includes("trip")) {
    return {
      itemPlaceholder: "Place name",
      doneLabel: "Visited",
      vaultTitle: title ? `${title} · visited` : "Places visited",
    };
  }
  if (lower.includes("activ") || lower.includes("try") || lower.includes("do")) {
    return {
      itemPlaceholder: "Activity name",
      doneLabel: "Tried",
      vaultTitle: title ? `${title} · tried` : "Activities tried",
    };
  }
  return {
    itemPlaceholder: "Name",
    doneLabel: "Done",
    vaultTitle: title ? `${title} · done` : "Done together",
  };
}

/** Clamp a 0–10 score to one decimal place. */
export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  const clamped = Math.max(0, Math.min(10, value));
  return Math.round(clamped * 10) / 10;
}

export function averageScore(ratings: { stars: number }[]) {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, row) => acc + row.stars, 0);
  return clampScore(sum / ratings.length);
}

export function scoreLabel(value: number | null) {
  if (value == null) return "Unrated";
  return Number.isInteger(value) ? `${value}/10` : `${value.toFixed(1)}/10`;
}

/** @deprecated use averageScore */
export function averageStars(ratings: { stars: number }[]) {
  return averageScore(ratings);
}

/** @deprecated use scoreLabel */
export function starsLabel(value: number | null) {
  return scoreLabel(value);
}

export function formatDoneDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
