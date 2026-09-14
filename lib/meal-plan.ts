import { createId } from "@/lib/ids";
import { MEAL_CATEGORIES, MEAL_IDEAS, type MealCategoryId } from "@/lib/meals";

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type MealPlanSource = "typed" | "regular" | "lucky" | null;

export type MealPlanNote = {
  id: string;
  weekday: number;
  weekIndex: number;
  title: string;
  eaten: boolean;
  source: MealPlanSource;
};

export type MealRegular = {
  id: string;
  title: string;
};

export type MealPlanIdea = {
  id: string;
  title: string;
  category: MealCategoryId;
};

export type MealPlanView = "board" | "list";
export type MealPlanSize = "s" | "m" | "l";
export type MealPlanPalette = "mix" | "yellow" | "pink" | "mint" | "blue" | "white";

export type MealPlanState = {
  notes: MealPlanNote[];
  regulars: MealRegular[];
  ideas: MealPlanIdea[];
  view: MealPlanView;
  size: MealPlanSize;
  palette: MealPlanPalette;
};

export const NOTE_PALETTES: {
  id: MealPlanPalette;
  label: string;
  papers: string[];
}[] = [
  {
    id: "mix",
    label: "Mix",
    papers: ["#FFE566", "#FFB4C8", "#A8E6CF", "#B8D4FF", "#FFD4A3", "#E0C3FC", "#FFF1A8"],
  },
  {
    id: "yellow",
    label: "Yellow",
    papers: ["#FFE566", "#FFF1A8", "#F7D44A", "#FFE566", "#FFF3B0", "#F5C842", "#FFE566"],
  },
  {
    id: "pink",
    label: "Pink",
    papers: ["#FFB4C8", "#FFC9D6", "#F7A1B8", "#FFD6E0", "#FFB4C8", "#F28BA6", "#FFC2D1"],
  },
  {
    id: "mint",
    label: "Mint",
    papers: ["#A8E6CF", "#C4F1DE", "#8FD9BE", "#B8EBD4", "#A8E6CF", "#7FCFB0", "#D2F5E6"],
  },
  {
    id: "blue",
    label: "Blue",
    papers: ["#B8D4FF", "#C9DFFF", "#9EC2F5", "#D6E6FF", "#B8D4FF", "#8BB4F0", "#E4EFFF"],
  },
  {
    id: "white",
    label: "Fridge",
    papers: ["#FFF8E7", "#FFFDF6", "#F4EFE0", "#FFF8E7", "#FAF4E6", "#F7F0DC", "#FFF8E7"],
  },
];

export const NOTE_SIZES: {
  id: MealPlanSize;
  label: string;
  minHeight: number;
  title: number;
  titleLine: number;
}[] = [
  { id: "s", label: "Small", minHeight: 128, title: 18, titleLine: 22 },
  { id: "m", label: "Medium", minHeight: 168, title: 22, titleLine: 26 },
  { id: "l", label: "Large", minHeight: 208, title: 26, titleLine: 30 },
];

export const NOTE_PAPERS = NOTE_PALETTES[0]!.papers;

export const NOTE_TILTS = [-2.4, 1.8, -1.2, 2.1, -1.8, 1.4, -0.8] as const;

const DEFAULT_REGULARS = [
  "Spaghetti bolognese",
  "Chicken burgers",
  "Stir-fry noodles",
  "Tacos",
  "Pizza",
  "Roast chicken",
];

export function weekdayLabel(weekday: number): string {
  return WEEKDAYS[((weekday % 7) + 7) % 7] ?? "Sunday";
}

export function noteHeading(note: MealPlanNote): string {
  const day = weekdayLabel(note.weekday);
  return note.weekIndex > 0 ? `${day} · week ${note.weekIndex + 1}` : day;
}

export function palettePapers(palette: MealPlanPalette): string[] {
  return (
    NOTE_PALETTES.find((row) => row.id === palette)?.papers ?? NOTE_PALETTES[0]!.papers
  );
}

export function notePaper(index: number, palette: MealPlanPalette = "mix"): string {
  const papers = palettePapers(palette);
  return papers[index % papers.length] ?? papers[0] ?? "#FFE566";
}

export function noteSize(size: MealPlanSize) {
  return NOTE_SIZES.find((row) => row.id === size) ?? NOTE_SIZES[1]!;
}

export function noteTilt(index: number): number {
  return NOTE_TILTS[index % NOTE_TILTS.length] ?? 0;
}

export function createWeekNotes(weekIndex: number): MealPlanNote[] {
  return WEEKDAYS.map((_, weekday) => ({
    id: createId(),
    weekday,
    weekIndex,
    title: "",
    eaten: false,
    source: null,
  }));
}

export function defaultIdeas(): MealPlanIdea[] {
  return MEAL_IDEAS.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
  }));
}

export function emptyMealPlan(): MealPlanState {
  return {
    notes: createWeekNotes(0),
    regulars: DEFAULT_REGULARS.map((title) => ({ id: createId(), title })),
    ideas: defaultIdeas(),
    view: "board",
    size: "m",
    palette: "mix",
  };
}

function hydrateNote(raw: unknown): MealPlanNote | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<MealPlanNote>;
  const weekday =
    typeof row.weekday === "number" && Number.isFinite(row.weekday)
      ? Math.max(0, Math.min(6, Math.round(row.weekday)))
      : 0;
  const weekIndex =
    typeof row.weekIndex === "number" && Number.isFinite(row.weekIndex)
      ? Math.max(0, Math.round(row.weekIndex))
      : 0;
  const source =
    row.source === "typed" || row.source === "regular" || row.source === "lucky"
      ? row.source
      : null;
  return {
    id: typeof row.id === "string" ? row.id : createId(),
    weekday,
    weekIndex,
    title: typeof row.title === "string" ? row.title : "",
    eaten: Boolean(row.eaten),
    source,
  };
}

function hydrateRegular(raw: unknown): MealRegular | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<MealRegular>;
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!title) return null;
  return {
    id: typeof row.id === "string" ? row.id : createId(),
    title,
  };
}

function hydrateIdea(raw: unknown): MealPlanIdea | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<MealPlanIdea>;
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!title) return null;
  const known = MEAL_CATEGORIES.some((item) => item.id === row.category);
  return {
    id: typeof row.id === "string" ? row.id : createId(),
    title,
    category: known ? (row.category as MealCategoryId) : "easy",
  };
}

export function hydrateMealPlan(raw: unknown): MealPlanState {
  const base = emptyMealPlan();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<MealPlanState>;
  const notes = Array.isArray(row.notes)
    ? row.notes.map(hydrateNote).filter((item): item is MealPlanNote => Boolean(item))
    : [];
  const regulars = Array.isArray(row.regulars)
    ? row.regulars
        .map(hydrateRegular)
        .filter((item): item is MealRegular => Boolean(item))
    : base.regulars;
  const ideas = Array.isArray(row.ideas)
    ? row.ideas.map(hydrateIdea).filter((item): item is MealPlanIdea => Boolean(item))
    : base.ideas;
  return {
    notes: notes.length ? notes : base.notes,
    regulars,
    ideas: ideas.length ? ideas : base.ideas,
    view: row.view === "list" || row.view === "board" ? row.view : base.view,
    size: row.size === "s" || row.size === "l" || row.size === "m" ? row.size : base.size,
    palette: NOTE_PALETTES.some((item) => item.id === row.palette)
      ? (row.palette as MealPlanPalette)
      : base.palette,
  };
}

export function setNoteMeal(
  notes: MealPlanNote[],
  noteId: string,
  title: string,
  source: MealPlanSource
): MealPlanNote[] {
  const trimmed = title.trim();
  return notes.map((note) =>
    note.id === noteId
      ? { ...note, title: trimmed, eaten: false, source: trimmed ? source : null }
      : note
  );
}

export function toggleNoteEaten(
  notes: MealPlanNote[],
  noteId: string
): MealPlanNote[] {
  return notes.map((note) =>
    note.id === noteId && note.title.trim()
      ? { ...note, eaten: !note.eaten }
      : note
  );
}

export function clearMealNotes(): MealPlanNote[] {
  return createWeekNotes(0);
}

export function addMealWeek(notes: MealPlanNote[]): MealPlanNote[] {
  const last = notes[notes.length - 1];
  const weekIndex = last ? last.weekIndex + (last.weekday === 6 ? 1 : 0) : 0;
  const startWeekday = last ? (last.weekday + 1) % 7 : 0;
  const extra: MealPlanNote[] = [];
  for (let i = 0; i < 7; i += 1) {
    const weekday = (startWeekday + i) % 7;
    const bump = startWeekday + i >= 7 ? 1 : 0;
    extra.push({
      id: createId(),
      weekday,
      weekIndex: weekIndex + bump,
      title: "",
      eaten: false,
      source: null,
    });
  }
  return [...notes, ...extra];
}

export function addRegular(regulars: MealRegular[], title: string): MealRegular[] {
  const trimmed = title.trim();
  if (!trimmed) return regulars;
  if (regulars.some((row) => row.title.toLowerCase() === trimmed.toLowerCase())) {
    return regulars;
  }
  return [...regulars, { id: createId(), title: trimmed }];
}

export function removeRegular(regulars: MealRegular[], id: string): MealRegular[] {
  return regulars.filter((row) => row.id !== id);
}

export function addIdea(
  ideas: MealPlanIdea[],
  title: string,
  category: MealCategoryId
): MealPlanIdea[] {
  const trimmed = title.trim();
  if (!trimmed) return ideas;
  return [...ideas, { id: createId(), title: trimmed, category }];
}

export function updateIdea(
  ideas: MealPlanIdea[],
  id: string,
  patch: Partial<Pick<MealPlanIdea, "title" | "category">>
): MealPlanIdea[] {
  return ideas.map((row) => {
    if (row.id !== id) return row;
    const title = patch.title != null ? patch.title.trim() : row.title;
    return {
      ...row,
      title: title || row.title,
      category: patch.category ?? row.category,
    };
  });
}

export function removeIdea(ideas: MealPlanIdea[], id: string): MealPlanIdea[] {
  return ideas.filter((row) => row.id !== id);
}

export function pickLuckyIdea(
  ideas: MealPlanIdea[],
  avoidId?: string | null
): MealPlanIdea | null {
  if (!ideas.length) return null;
  const pool = avoidId ? ideas.filter((item) => item.id !== avoidId) : ideas;
  const source = pool.length ? pool : ideas;
  return source[Math.floor(Math.random() * source.length)] ?? null;
}

export function ideasInCategory(
  ideas: MealPlanIdea[],
  category: MealCategoryId | "all"
): MealPlanIdea[] {
  if (category === "all") return ideas;
  return ideas.filter((item) => item.category === category);
}
