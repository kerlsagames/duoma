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
};

/** Built-in couple lists — seeded once per couple. */
export const STARTER_LISTS: StarterListDef[] = [
  {
    key: "movies",
    title: "Movies to watch",
    emoji: "🎬",
    accent: "#FF6B4A",
    hint: "Date-night films, rewatches, cinema picks",
  },
  {
    key: "places_eat",
    title: "Places to eat",
    emoji: "🍜",
    accent: "#FFB020",
    hint: "Restaurants, food trucks, that bakery you keep meaning to try",
  },
  {
    key: "places_visit",
    title: "Places to visit",
    emoji: "🗺️",
    accent: "#2EC4B6",
    hint: "Day trips, cities, viewpoints, weekend escapes",
  },
  {
    key: "activities",
    title: "Activities to try",
    emoji: "🎯",
    accent: "#5B8CFF",
    hint: "Classes, hobbies, adventures, spontaneous plans",
  },
  {
    key: "tv",
    title: "TV shows to watch",
    emoji: "📺",
    accent: "#C084FC",
    hint: "Series to binge together, one episode at a time",
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

export function starterDef(key: string | null | undefined) {
  if (!key) return null;
  return STARTER_LISTS.find((row) => row.key === key) ?? null;
}

export function averageStars(ratings: { stars: number }[]) {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, row) => acc + row.stars, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function starsLabel(value: number | null) {
  if (value == null) return "Unrated";
  if (Number.isInteger(value)) return `${value}★`;
  return `${value.toFixed(1)}★`;
}
