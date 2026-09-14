import { createId, nowIso } from "@/lib/ids";

export type DoodlePoint = { x: number; y: number };

export type DoodleStroke = {
  color: string;
  width: number;
  points: DoodlePoint[];
};

export type DoodleCategoryId =
  | "animals"
  | "food"
  | "home"
  | "movies"
  | "objects"
  | "actions"
  | "naughty";

export type DoodleRoundStatus = "pick" | "draw" | "wait" | "revealed";

export type DoodleRound = {
  id: string;
  drawerId: string;
  guesserId: string;
  options: [string, string, string];
  prompt: string | null;
  category: DoodleCategoryId;
  strokes: DoodleStroke[];
  guess: string | null;
  correct: boolean | null;
  status: DoodleRoundStatus;
  createdAt: string;
  sentAt: string | null;
  guessedAt: string | null;
};

export type DoodleBoard = {
  strokes: DoodleStroke[];
  updatedAt: string;
  updatedBy: string | null;
  enabledCategories: DoodleCategoryId[];
  round: DoodleRound | null;
  scores: Record<string, number>;
  history: DoodleRound[];
};

export type DoodleCategory = {
  id: DoodleCategoryId;
  label: string;
  detail: string;
};

export const DOODLE_CATEGORIES: DoodleCategory[] = [
  { id: "animals", label: "Animals", detail: "Creatures, cute and otherwise" },
  { id: "food", label: "Food", detail: "Things you eat" },
  { id: "home", label: "Home", detail: "Around the house" },
  { id: "movies", label: "Movies & TV", detail: "Titles you can mime with a pen" },
  { id: "objects", label: "Objects", detail: "Stuff you can hold" },
  { id: "actions", label: "Actions", detail: "Things people do" },
  { id: "naughty", label: "Naughty", detail: "XXX. Off unless you want it on." },
];

export const DEFAULT_DOODLE_CATEGORIES: DoodleCategoryId[] = [
  "animals",
  "food",
  "home",
  "objects",
  "actions",
];

const PROMPTS: Record<DoodleCategoryId, string[]> = {
  animals: [
    "Elephant",
    "Penguin",
    "Octopus",
    "Giraffe",
    "Sloth",
    "Hedgehog",
    "Flamingo",
    "Kangaroo",
    "Goldfish",
    "Owl",
    "Crocodile",
    "Koala",
    "Shark",
    "Butterfly",
    "Peacock",
    "Hamster",
    "Wolf",
    "Seahorse",
    "Raccoon",
    "Bee",
  ],
  food: [
    "Taco",
    "Avocado toast",
    "Spaghetti",
    "Croissant",
    "Sushi",
    "Pizza slice",
    "Dumpling",
    "Waffle",
    "Ramen",
    "Popcorn",
    "Donut",
    "Burger",
    "Pancake stack",
    "Mango",
    "Ice cream",
    "Hot dog",
    "Cupcake",
    "Cheese board",
    "Smoothie",
    "Fried egg",
  ],
  home: [
    "Unmade bed",
    "Coffee pot",
    "Laundry pile",
    "Remote control",
    "Toothbrush",
    "Couch",
    "Fridge",
    "House keys",
    "Thirsty plant",
    "Lamp",
    "Washing machine",
    "Doormat",
    "Alarm clock",
    "Shower",
    "Mailbox",
    "Broom",
    "Toaster",
    "Sock drawer",
    "Bin",
    "Front door",
  ],
  movies: [
    "Titanic",
    "Star Wars",
    "The Notebook",
    "Jurassic Park",
    "Home Alone",
    "Jaws",
    "The Wizard of Oz",
    "Frozen",
    "Harry Potter",
    "Finding Nemo",
    "The Lion King",
    "Spider-Man",
    "Ghostbusters",
    "Pretty Woman",
    "Shrek",
    "The Crown",
    "Friends",
    "The Office",
    "Bridgerton",
    "Barbie",
  ],
  objects: [
    "Umbrella",
    "Sunglasses",
    "Bicycle",
    "Guitar",
    "Balloon",
    "Lighthouse",
    "Telescope",
    "Skateboard",
    "Camera",
    "Backpack",
    "Crown",
    "Candle",
    "Headphones",
    "Suitcase",
    "Trophy",
    "Compass",
    "Megaphone",
    "Lollipop",
    "Rubber duck",
    "Hourglass",
  ],
  actions: [
    "Dancing",
    "Sneezing",
    "Proposing",
    "Yawning",
    "Juggling",
    "High five",
    "Cooking",
    "Laughing",
    "Sleeping",
    "Running",
    "Whispering",
    "Hugging",
    "Surfing",
    "Painting",
    "Fishing",
    "Bowling",
    "Skiing",
    "Singing",
    "Sneaking",
    "Celebrating",
  ],
  naughty: [
    "Handcuffs",
    "Whipped cream",
    "Blindfold",
    "Shower together",
    "Lingerie on the floor",
    "Ice cube trail",
    "Hotel key",
    "The good drawer",
    "A hickey",
    "Rose petals on the bed",
    "Come here",
    "Don't stop",
    "Tying a tie, slowly",
    "The couch after",
    "A wink",
    "Stockings",
    "Massage oil",
    "The spare toothbrush",
    "Lights off",
    "Bite mark",
  ],
};

export function emptyDoodleBoard(): DoodleBoard {
  return {
    strokes: [],
    updatedAt: nowIso(),
    updatedBy: null,
    enabledCategories: [...DEFAULT_DOODLE_CATEGORIES],
    round: null,
    scores: {},
    history: [],
  };
}

function asStrokes(value: unknown): DoodleStroke[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is DoodleStroke => {
    if (!row || typeof row !== "object") return false;
    const stroke = row as DoodleStroke;
    return Array.isArray(stroke.points);
  });
}

function hydrateRound(raw: unknown): DoodleRound | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<DoodleRound>;
  const options = Array.isArray(row.options)
    ? row.options.filter((item): item is string => typeof item === "string")
    : [];
  if (options.length < 3) return null;
  const status: DoodleRoundStatus =
    row.status === "pick" ||
    row.status === "draw" ||
    row.status === "wait" ||
    row.status === "revealed"
      ? row.status
      : row.sentAt
        ? "wait"
        : row.prompt
          ? "draw"
          : "pick";
  const category = DOODLE_CATEGORIES.some((item) => item.id === row.category)
    ? (row.category as DoodleCategoryId)
    : "objects";
  return {
    id: typeof row.id === "string" ? row.id : createId(),
    drawerId: typeof row.drawerId === "string" ? row.drawerId : "",
    guesserId: typeof row.guesserId === "string" ? row.guesserId : "",
    options: [options[0]!, options[1]!, options[2]!],
    prompt: typeof row.prompt === "string" ? row.prompt : null,
    category,
    strokes: asStrokes(row.strokes),
    guess: typeof row.guess === "string" ? row.guess : null,
    correct: typeof row.correct === "boolean" ? row.correct : null,
    status,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : nowIso(),
    sentAt: typeof row.sentAt === "string" ? row.sentAt : null,
    guessedAt: typeof row.guessedAt === "string" ? row.guessedAt : null,
  };
}

export function hydrateDoodleBoard(raw: unknown): DoodleBoard {
  const base = emptyDoodleBoard();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<DoodleBoard> & { strokes?: unknown };
  const enabled = Array.isArray(row.enabledCategories)
    ? row.enabledCategories.filter((id): id is DoodleCategoryId =>
        DOODLE_CATEGORIES.some((item) => item.id === id)
      )
    : base.enabledCategories;
  const scores =
    row.scores && typeof row.scores === "object" && !Array.isArray(row.scores)
      ? Object.fromEntries(
          Object.entries(row.scores).filter(
            (entry): entry is [string, number] => typeof entry[1] === "number"
          )
        )
      : {};
  return {
    strokes: asStrokes(row.strokes),
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : base.updatedAt,
    updatedBy: typeof row.updatedBy === "string" ? row.updatedBy : null,
    enabledCategories: enabled.length ? enabled : base.enabledCategories,
    round: hydrateRound(row.round),
    scores,
    history: Array.isArray(row.history)
      ? row.history
          .map(hydrateRound)
          .filter((item): item is DoodleRound => Boolean(item))
          .slice(0, 20)
      : [],
  };
}

export function promptsInCategories(ids: DoodleCategoryId[]): {
  text: string;
  category: DoodleCategoryId;
}[] {
  const allowed = ids.length ? ids : DEFAULT_DOODLE_CATEGORIES;
  return allowed.flatMap((id) =>
    (PROMPTS[id] ?? []).map((text) => ({ text, category: id }))
  );
}

export function dealDoodleOptions(
  ids: DoodleCategoryId[],
  avoid: string[] = []
): { options: [string, string, string]; category: DoodleCategoryId } {
  const pool = promptsInCategories(ids).filter((row) => !avoid.includes(row.text));
  const source = pool.length >= 3 ? pool : promptsInCategories(ids);
  const picked: { text: string; category: DoodleCategoryId }[] = [];
  const copy = [...source];
  while (picked.length < 3 && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    const next = copy.splice(i, 1)[0]!;
    if (!picked.some((row) => row.text === next.text)) picked.push(next);
  }
  while (picked.length < 3) {
    picked.push({ text: "Coffee pot", category: "home" });
  }
  return {
    options: [picked[0]!.text, picked[1]!.text, picked[2]!.text],
    category: picked[0]!.category,
  };
}

export function startDoodleRound(
  drawerId: string,
  guesserId: string,
  categories: DoodleCategoryId[],
  avoid: string[] = []
): DoodleRound {
  const deal = dealDoodleOptions(categories, avoid);
  return {
    id: createId(),
    drawerId,
    guesserId,
    options: deal.options,
    prompt: null,
    category: deal.category,
    strokes: [],
    guess: null,
    correct: null,
    status: "pick",
    createdAt: nowIso(),
    sentAt: null,
    guessedAt: null,
  };
}

export function chooseDoodlePrompt(round: DoodleRound, prompt: string): DoodleRound {
  if (!round.options.includes(prompt)) return round;
  return { ...round, prompt, status: "draw" };
}

export function leaveDoodleDrawing(
  round: DoodleRound,
  strokes: DoodleStroke[]
): DoodleRound {
  if (!round.prompt || strokes.length === 0) return round;
  return {
    ...round,
    strokes,
    status: "wait",
    sentAt: nowIso(),
  };
}

function normalizeGuess(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function guessMatches(prompt: string, guess: string): boolean {
  const a = normalizeGuess(prompt);
  const b = normalizeGuess(guess);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) && b.length >= 3) return true;
  if (b.includes(a) && a.length >= 3) return true;
  return false;
}

export function submitDoodleGuess(round: DoodleRound, guess: string): DoodleRound {
  const trimmed = guess.trim();
  if (!round.prompt || !trimmed || round.status !== "wait") return round;
  return {
    ...round,
    guess: trimmed,
    correct: guessMatches(round.prompt, trimmed),
    status: "revealed",
    guessedAt: nowIso(),
  };
}

export function applyDoodleScore(
  scores: Record<string, number>,
  round: DoodleRound
): Record<string, number> {
  if (!round.correct) return scores;
  const next = { ...scores };
  next[round.drawerId] = (next[round.drawerId] ?? 0) + 1;
  next[round.guesserId] = (next[round.guesserId] ?? 0) + 1;
  return next;
}

export function toggleDoodleCategory(
  enabled: DoodleCategoryId[],
  id: DoodleCategoryId
): DoodleCategoryId[] {
  if (enabled.includes(id)) {
    const next = enabled.filter((item) => item !== id);
    return next.length ? next : enabled;
  }
  return [...enabled, id];
}

export function recentPrompts(history: DoodleRound[], round: DoodleRound | null): string[] {
  return [...history, round]
    .filter((item): item is DoodleRound => Boolean(item?.prompt))
    .map((item) => item.prompt as string);
}

export function categoryForPrompt(text: string): DoodleCategoryId | null {
  for (const category of DOODLE_CATEGORIES) {
    if (PROMPTS[category.id].includes(text)) return category.id;
  }
  return null;
}

export function doodleCategoryLabel(id: DoodleCategoryId): string {
  return DOODLE_CATEGORIES.find((item) => item.id === id)?.label ?? id;
}
