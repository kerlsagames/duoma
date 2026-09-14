import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import {
  emptyBirthdays,
  hydrateBirthdays,
  type Birthday,
} from "@/lib/birthdays";
import { emptyWordle, hydrateWordle, type WordleState } from "@/lib/daily-word";
import { emptyDoodleBoard, hydrateDoodleBoard, type DoodleBoard } from "@/lib/doodle-game";
import { createId, nowIso } from "@/lib/ids";
import { emptyPeriodState, hydratePeriodState, type PeriodState } from "@/lib/period";
import {
  emptyMealPlan,
  hydrateMealPlan,
  type MealPlanState,
} from "@/lib/meal-plan";
import { DEFAULT_MAINT_PREFS, hydrateMaintPrefs, type MaintPrefs } from "@/lib/maintenance";
import {
  defaultPhotoPrefs,
  hydratePhotoMemory,
  hydratePhotoPrefs,
  hydratePhotoWeek,
  type PhotoMemory,
  type PhotoPrefs,
  type PhotoWeek,
} from "@/lib/photo-challenge";
import {
  emptyWorldChoice,
  hydrateWorldChoice,
  type WorldChoice,
} from "@/lib/worlds";
import {
  emptySexyVault,
  hydrateSexyVault,
  type SexyVaultItem,
} from "@/lib/sexy-vault";
import {
  defaultGoals,
  emptyBudget,
  hydrateBudget,
  hydrateMoneyGoal,
  type BudgetState,
  type MoneyGoal,
} from "@/lib/money";

export type { BudgetState, MoneyGoal } from "@/lib/money";

export type { SexyVaultItem } from "@/lib/sexy-vault";

export type { PhotoMemory, PhotoWeek } from "@/lib/photo-challenge";
export {
  PHOTO_PROMPTS,
  POLAROID_TINTS,
} from "@/lib/photo-challenge";

export type PingKind =
  | "heart"
  | "kiss"
  | "miss"
  | "laugh"
  | "home"
  | "spicy"
  | "hug";

export type Ping = {
  id: string;
  fromId: string;
  kind: PingKind;
  createdAt: string;
};

export type SignalCode = {
  id: string;
  emoji: string;
  phrase: string;
  meaning: string;
};

export type SignalFlash = {
  id: string;
  codeId: string;
  fromId: string;
  createdAt: string;
};

export type AudioFolder = "sweet" | "bedtime" | "spicy" | "voice";

export const AUDIO_FOLDER_IDS: AudioFolder[] = ["sweet", "bedtime", "spicy", "voice"];

export type AudioNote = {
  id: string;
  fromId: string;
  folder: AudioFolder;
  title: string;
  body: string;
  seconds: number;
  createdAt: string;
  /** True when a real microphone take was stored (IndexedDB or `uri`). */
  hasAudio?: boolean;
  mimeType?: string;
  /** Fallback data URL used only when IndexedDB is unavailable. */
  uri?: string;
};

export function hydrateAudioNote(raw: unknown): AudioNote | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<AudioNote>;
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.fromId !== "string" || !row.fromId) return null;
  const folder = AUDIO_FOLDER_IDS.includes(row.folder as AudioFolder)
    ? (row.folder as AudioFolder)
    : "voice";
  const title =
    typeof row.title === "string" && row.title.trim() ? row.title.trim() : "Voice note";
  const body = typeof row.body === "string" ? row.body : "";
  const seconds =
    typeof row.seconds === "number" && Number.isFinite(row.seconds)
      ? Math.max(1, Math.round(row.seconds))
      : 1;
  const createdAt = typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso();
  const mimeType = typeof row.mimeType === "string" && row.mimeType ? row.mimeType : undefined;
  const uri =
    typeof row.uri === "string" && row.uri.startsWith("data:audio") ? row.uri : undefined;
  return {
    id: row.id,
    fromId: row.fromId,
    folder,
    title,
    body,
    seconds,
    createdAt,
    hasAudio: Boolean(row.hasAudio) || Boolean(uri),
    mimeType,
    uri,
  };
}

export type IntimacyKind =
  | "kiss"
  | "talk"
  | "date"
  | "intimacy"
  | "cuddle"
  | "adventure";

export type IntimacyLog = {
  id: string;
  userId: string;
  kind: IntimacyKind;
  note: string;
  date: string;
  createdAt: string;
};

export type TriviaQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
  authorId: string;
};

export type TriviaAttempt = {
  id: string;
  quizOwnerId: string;
  guesserId: string;
  answers: number[];
  score: number;
  createdAt: string;
};

/** One person's locked-in answers for a How Well Do You Know Me pack. */
export type KnowMeSheet = {
  id: string;
  packId: string;
  userId: string;
  answers: number[];
  createdAt: string;
  updatedAt: string;
};

export type KnowMeGuess = {
  id: string;
  packId: string;
  ownerId: string;
  guesserId: string;
  guesses: number[];
  score: number;
  createdAt: string;
};

export type BetStatus = "offered" | "accepted" | "declined" | "settled";

export type Prediction = {
  id: string;
  title: string;
  stake: string;
  createdBy: string;
  fromUserId: string;
  toUserId: string;
  /** Proposer's pick: yes/me or no/them. */
  side: "yes" | "no";
  kind?: "who" | "will";
  /** Full “Craig bets that…” line. */
  statement?: string;
  /** Typed name for name-pick markets. */
  subject?: string;
  pickMode?: "us" | "name" | "yesno";
  yesVoters: string[];
  noVoters: string[];
  status: BetStatus;
  resolved: "yes" | "no" | null;
  /** When the loser marked the stake as paid. */
  paidAt: string | null;
  createdAt: string;
  answeredAt: string | null;
};

export type TwoTruthsRound = {
  id: string;
  authorId: string;
  items: [string, string, string];
  wishIndex: number;
  guessIndex: number | null;
  guesserId: string | null;
  createdAt: string;
};


export type { DoodleBoard, DoodlePoint, DoodleStroke } from "@/lib/doodle-game";

export type CrosswordSave = {
  puzzleId: string;
  letters: Record<string, string>;
};

export type StoryChapter = {
  id: string;
  authorId: string;
  body: string;
  choiceId: string | null;
  createdAt: string;
};

export type StoryState = {
  trunkId: string;
  chapters: StoryChapter[];
};

export type Capsule = {
  id: string;
  title: string;
  body: string;
  unlockAt: string;
  createdBy: string;
  createdAt: string;
};

export type MealOption = {
  id: string;
  label: string;
  tag: string;
  eliminated: boolean;
};

export type Spot = {
  id: string;
  label: string;
  vibe: string;
  color: string;
};

export type Chore = {
  id: string;
  label: string;
};

export type FairSpin = {
  id: string;
  choreId: string;
  winnerId: string;
  createdAt: string;
};

export type TripStop = {
  id: string;
  title: string;
  detail: string;
  when: string;
  done: boolean;
};

export type PackItem = {
  id: string;
  label: string;
  packed: boolean;
};

export type Trip = {
  id: string;
  title: string;
  where: string;
  start: string;
  end: string;
  stops: TripStop[];
  packing: PackItem[];
};


export type MaintTask = {
  id: string;
  label: string;
  everyDays: number;
  lastDone: string | null;
};

export type VaultEntry = {
  id: string;
  label: string;
  value: string;
  icon: string;
};

export type WhoLast = {
  taskId: string;
  userId: string;
  at: string;
};

export type Cheer = {
  id: string;
  fromId: string;
  label: string;
  createdAt: string;
};

export type MiniState = {
  pings: Ping[];
  signals: SignalCode[];
  flashes: SignalFlash[];
  audioNotes: AudioNote[];
  intimacy: IntimacyLog[];
  triviaQuestions: TriviaQuestion[];
  triviaAttempts: TriviaAttempt[];
  knowMeSheets: KnowMeSheet[];
  knowMeGuesses: KnowMeGuess[];
  predictions: Prediction[];
  twoTruths: TwoTruthsRound[];
  photos: PhotoMemory[];
  photoWeek: PhotoWeek | null;
  photoPrefs: PhotoPrefs;
  doodle: DoodleBoard;
  crossword: CrosswordSave[];
  wordle: WordleState;
  story: StoryState | null;
  capsules: Capsule[];
  meals: MealOption[];
  spots: Spot[];
  chores: Chore[];
  fairSpins: FairSpin[];
  trips: Trip[];
  goals: MoneyGoal[];
  budget: BudgetState;
  maintenance: MaintTask[];
  vault: VaultEntry[];
  vaultPin: string;
  sexyVault: SexyVaultItem[];
  sexyVaultPin: string;
  whoLast: WhoLast[];
  whoTasks: { id: string; label: string }[];
  cheers: Cheer[];
  period: PeriodState;
  birthdays: Birthday[];
  mealPlan: MealPlanState;
  maintPrefs: MaintPrefs;
  worldChoice: WorldChoice;
};

type PingIcon = ComponentProps<typeof Ionicons>["name"];

export const PING_KINDS: {
  id: PingKind;
  label: string;
  emoji: string;
  icon: PingIcon;
  color: string;
  blurb: string;
}[] = [
  {
    id: "heart",
    label: "Thinking of you",
    emoji: "♡",
    icon: "heart",
    color: "#FF6B9A",
    blurb: "A quiet pulse. No reply needed.",
  },
  {
    id: "kiss",
    label: "Kiss incoming",
    emoji: "💋",
    icon: "rose",
    color: "#FF4D6A",
    blurb: "Plant one on their lock screen.",
  },
  {
    id: "miss",
    label: "I miss you",
    emoji: "🌙",
    icon: "moon",
    color: "#8FA8C8",
    blurb: "Soft ache, not a guilt trip.",
  },
  {
    id: "laugh",
    label: "That was funny",
    emoji: "✦",
    icon: "sparkles",
    color: "#F0C75E",
    blurb: "You just remembered a bit.",
  },
  {
    id: "home",
    label: "Come home",
    emoji: "⌂",
    icon: "home",
    color: "#3ECFBF",
    blurb: "The couch is colder without you.",
  },
  {
    id: "spicy",
    label: "Later…",
    emoji: "◆",
    icon: "flame",
    color: "#FF7A45",
    blurb: "A raised eyebrow in haptic form.",
  },
  {
    id: "hug",
    label: "Need a hug",
    emoji: "◎",
    icon: "people",
    color: "#C9A0DC",
    blurb: "Arms-open, no explanation.",
  },
];

export const DEFAULT_SIGNALS: SignalCode[] = [
  {
    id: "sig-taco",
    emoji: "🌮",
    phrase: "taco protocol",
    meaning: "Takeout. No cooking. Do not negotiate.",
  },
  {
    id: "sig-bath",
    emoji: "🛁",
    phrase: "ghost mode",
    meaning: "I need a soak and silence. Come find me in 40.",
  },
  {
    id: "sig-heat",
    emoji: "🌶️",
    phrase: "red light",
    meaning: "Tonight, if you're in. No pressure either way.",
  },
  {
    id: "sig-ice",
    emoji: "🧊",
    phrase: "blue light",
    meaning: "Not tonight. Still yours. Just tired.",
  },
  {
    id: "sig-look",
    emoji: "👀",
    phrase: "look at me",
    meaning: "Across the room, catch my eye. I have a secret.",
  },
  {
    id: "sig-exit",
    emoji: "🚪",
    phrase: "eject",
    meaning: "This party is over for us. Invent an excuse.",
  },
  {
    id: "sig-rescue",
    emoji: "🛟",
    phrase: "save me",
    meaning: "Stuck in a conversation. Please interrupt.",
  },
  {
    id: "sig-yes",
    emoji: "🥂",
    phrase: "we're staying",
    meaning: "I actually like this. One more round.",
  },
];

export const AUDIO_WHISPERS: {
  folder: AudioFolder;
  title: string;
  body: string;
}[] = [
  {
    folder: "sweet",
    title: "The way you make coffee",
    body: "I still think about the first morning you made coffee in my kitchen like you'd always lived there. You hummed off-key. I pretended to be asleep so I could keep it.",
  },
  {
    folder: "bedtime",
    title: "A story about a lighthouse",
    body: "There is a lighthouse that only turns on when two people remember the same joke at the same time. Tonight the beam found our window. Sleep. I'll keep the light.",
  },
  {
    folder: "spicy",
    title: "Leave the hallway light on",
    body: "If you get home before me, leave the hallway light on. I have plans that do not involve talking about the dishwasher.",
  },
  {
    folder: "voice",
    title: "In the car, after the song",
    body: "That silence after our song ended on the drive back — I wanted to say it then. I still do. You make ordinary roads feel like a getaway.",
  },
];

export const INTIMACY_KINDS: {
  id: IntimacyKind;
  label: string;
  color: string;
  icon: string;
}[] = [
  { id: "kiss", label: "Kiss", color: "#FF6B9A", icon: "heart" },
  { id: "cuddle", label: "Cuddle", color: "#C9A0DC", icon: "moon" },
  { id: "talk", label: "Deep talk", color: "#8FA8C8", icon: "chatbubbles" },
  { id: "date", label: "Date night", color: "#F0C75E", icon: "wine" },
  { id: "intimacy", label: "Intimacy", color: "#FF4D6A", icon: "flame" },
  { id: "adventure", label: "Adventure", color: "#3ECFBF", icon: "compass" },
];

export const TRIVIA_PROMPTS: {
  prompt: string;
  options: [string, string, string, string];
}[] = [
  {
    prompt: "My order at a coffee shop if nobody's watching",
    options: [
      "Whatever's strongest",
      "Something sweet with too much foam",
      "Tea, actually",
      "I change it every time",
    ],
  },
  {
    prompt: "The thing that actually makes me feel loved",
    options: [
      "A surprise plan",
      "Being left alone on purpose",
      "A stupid in-joke in public",
      "Help with the boring stuff",
    ],
  },
  {
    prompt: "If we had a free Saturday, I'd pick",
    options: [
      "A long walk with no destination",
      "A project around the house",
      "Staying in with a movie stack",
      "A slightly too-ambitious day trip",
    ],
  },
  {
    prompt: "My secret comfort food",
    options: [
      "Something fried and unholy",
      "Cereal for dinner",
      "A very specific takeout order",
      "Whatever you cook when you're showing off",
    ],
  },
  {
    prompt: "In a fight, I need you to",
    options: [
      "Give me twenty minutes, then come back",
      "Stay in the room even if it's messy",
      "Make a joke, carefully",
      "Name the real issue before I do",
    ],
  },
  {
    prompt: "The vacation that would ruin me (in a good way)",
    options: [
      "Nowhere-small coastal town",
      "A city we've never pronounced right",
      "Cabin, no signal, one good knife",
      "All-inclusive and zero decisions",
    ],
  },
  {
    prompt: "My tell when I want you",
    options: [
      "I get quiet",
      "I pick a fight about nothing",
      "I suddenly remember a song",
      "I stand too close in the kitchen",
    ],
  },
  {
    prompt: "The household job I pretend I don't see",
    options: [
      "The recycling situation",
      "Hair in the drain",
      "The mysterious fridge drawer",
      "Making the bed",
    ],
  },
];

export const DEFAULT_MEALS: { label: string; tag: string }[] = [
  { label: "The usual takeout", tag: "safe" },
  { label: "Something with noodles", tag: "slurp" },
  { label: "A slightly too-fancy recipe", tag: "ambitious" },
  { label: "Breakfast for dinner", tag: "chaos" },
  { label: "The place with the lights", tag: "out" },
  { label: "Whatever's left in the fridge, bravely", tag: "raid" },
  { label: "Pizza, but we pretend it's a ritual", tag: "ritual" },
  { label: "Soup and a movie, no talking required", tag: "soft" },
];

export const DEFAULT_SPOTS: Spot[] = [
  { id: "spot-1", label: "Aimless walk", vibe: "slow", color: "#3ECFBF" },
  { id: "spot-2", label: "Wine bar", vibe: "glow", color: "#FF6B9A" },
  { id: "spot-3", label: "Bookstore", vibe: "paper", color: "#F0C75E" },
  { id: "spot-4", label: "Night market", vibe: "buzz", color: "#FF7A45" },
  { id: "spot-5", label: "Museum linger", vibe: "art", color: "#8FA8C8" },
  { id: "spot-6", label: "Blue-hour view", vibe: "sky", color: "#C9A0DC" },
  { id: "spot-7", label: "Unserious bowling", vibe: "play", color: "#7CFFB2" },
  { id: "spot-8", label: "Stay in nest", vibe: "home", color: "#E4C37A" },
];

export const DEFAULT_CHORES: Chore[] = [
  { id: "chore-dishes", label: "Dishes" },
  { id: "chore-trash", label: "Trash & recycling" },
  { id: "chore-laundry", label: "Laundry mountain" },
  { id: "chore-bath", label: "Bathroom reset" },
  { id: "chore-floors", label: "Floors" },
  { id: "chore-cook", label: "Cook tonight" },
  { id: "chore-cat", label: "Creature duties" },
  { id: "chore-admin", label: "The boring emails" },
];

export const DEFAULT_WHO_TASKS = [
  { id: "who-dishes", label: "Did the dishes" },
  { id: "who-trash", label: "Took the trash" },
  { id: "who-laundry", label: "Started laundry" },
  { id: "who-cook", label: "Made dinner" },
  { id: "who-shop", label: "Did the shop" },
  { id: "who-bed", label: "Made the bed" },
  { id: "who-bills", label: "Paid a bill" },
  { id: "who-car", label: "Filled the tank" },
];

export const DEFAULT_MAINT: { label: string; everyDays: number }[] = [
  { label: "Change HVAC filter", everyDays: 90 },
  { label: "Run washing machine cleaner", everyDays: 60 },
  { label: "Check smoke / CO batteries", everyDays: 180 },
  { label: "Car oil & tires glance", everyDays: 90 },
  { label: "Deep-clean fridge", everyDays: 45 },
  { label: "Descale the kettle / coffee gear", everyDays: 30 },
  { label: "Gutters / outdoor drain peek", everyDays: 120 },
  { label: "Water the neglected plant", everyDays: 7 },
];

export const DEFAULT_VAULT: VaultEntry[] = [
  { id: "v-wifi", label: "Wi-Fi", value: "Network · password in the cookie tin", icon: "wifi" },
  { id: "v-gate", label: "Building / gate code", value: "", icon: "key" },
  { id: "v-insure", label: "Insurance policy nos.", value: "", icon: "shield-checkmark" },
  { id: "v-allergy", label: "Allergies & meds", value: "", icon: "medkit" },
  { id: "v-ice", label: "Emergency contacts", value: "", icon: "call" },
  { id: "v-docs", label: "Where the important papers live", value: "Top drawer, blue folder", icon: "folder" },
  { id: "v-pets", label: "Vet & pet notes", value: "", icon: "paw" },
  { id: "v-util", label: "Utilities login hint", value: "", icon: "flash" },
];


function meal(label: string, tag: string): MealOption {
  return { id: createId(), label, tag, eliminated: false };
}

export function emptyMiniState(): MiniState {
  return {
    pings: [],
    signals: DEFAULT_SIGNALS.map((row) => ({ ...row })),
    flashes: [],
    audioNotes: [],
    intimacy: [],
    triviaQuestions: [],
    triviaAttempts: [],
    knowMeSheets: [],
    knowMeGuesses: [],
    predictions: [],
    twoTruths: [],
    photos: [],
    photoWeek: null,
    photoPrefs: defaultPhotoPrefs(),
    doodle: emptyDoodleBoard(),
    crossword: [],
    wordle: emptyWordle(),
    story: null,
    capsules: [],
    meals: DEFAULT_MEALS.map((row) => meal(row.label, row.tag)),
    spots: DEFAULT_SPOTS.map((row) => ({ ...row })),
    chores: DEFAULT_CHORES.map((row) => ({ ...row })),
    fairSpins: [],
    trips: [],
    goals: defaultGoals(),
    budget: emptyBudget(),
    maintenance: DEFAULT_MAINT.map((row) => ({
      id: createId(),
      label: row.label,
      everyDays: row.everyDays,
      lastDone: null,
    })),
    vault: DEFAULT_VAULT.map((row) => ({ ...row })),
    vaultPin: "",
    sexyVault: emptySexyVault(),
    sexyVaultPin: "",
    whoLast: [],
    whoTasks: DEFAULT_WHO_TASKS.map((row) => ({ ...row })),
    cheers: [],
    period: emptyPeriodState(),
    birthdays: emptyBirthdays(),
    mealPlan: emptyMealPlan(),
    maintPrefs: { ...DEFAULT_MAINT_PREFS },
    worldChoice: emptyWorldChoice(),
  };
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function hydratePrediction(raw: unknown): Prediction {
  const row = (raw && typeof raw === "object" ? raw : {}) as Partial<Prediction>;
  const createdBy = typeof row.createdBy === "string" ? row.createdBy : "";
  const resolved = row.resolved === "yes" || row.resolved === "no" ? row.resolved : null;
  const status: BetStatus =
    row.status === "offered" ||
    row.status === "accepted" ||
    row.status === "declined" ||
    row.status === "settled"
      ? row.status
      : resolved
        ? "settled"
        : "accepted";
  const createdAt = typeof row.createdAt === "string" ? row.createdAt : nowIso();
  return {
    id: typeof row.id === "string" ? row.id : createId(),
    title: typeof row.title === "string" ? row.title : "Untitled bet",
    stake: typeof row.stake === "string" ? row.stake : "Bragging rights",
    createdBy,
    fromUserId:
      typeof row.fromUserId === "string" && row.fromUserId ? row.fromUserId : createdBy,
    toUserId: typeof row.toUserId === "string" ? row.toUserId : "",
    side: row.side === "no" ? "no" : "yes",
    kind: row.kind === "who" ? "who" : "will",
    statement: typeof row.statement === "string" ? row.statement : undefined,
    subject: typeof row.subject === "string" ? row.subject : undefined,
    pickMode:
      row.pickMode === "us" || row.pickMode === "name" || row.pickMode === "yesno"
        ? row.pickMode
        : undefined,
    yesVoters: Array.isArray(row.yesVoters)
      ? row.yesVoters.filter((id): id is string => typeof id === "string")
      : [],
    noVoters: Array.isArray(row.noVoters)
      ? row.noVoters.filter((id): id is string => typeof id === "string")
      : [],
    status,
    resolved,
    paidAt: typeof row.paidAt === "string" ? row.paidAt : null,
    createdAt,
    answeredAt:
      typeof row.answeredAt === "string"
        ? row.answeredAt
        : status === "offered"
          ? null
          : createdAt,
  };
}

export function hydrateMiniState(raw: unknown): MiniState {
  const base = emptyMiniState();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<MiniState>;
  return {
    ...base,
    pings: asArray(row.pings, base.pings),
    signals: asArray(row.signals, base.signals),
    flashes: asArray(row.flashes, base.flashes),
    audioNotes: asArray(row.audioNotes, base.audioNotes)
      .map(hydrateAudioNote)
      .filter((note): note is AudioNote => Boolean(note)),
    intimacy: asArray(row.intimacy, base.intimacy),
    triviaQuestions: asArray(row.triviaQuestions, base.triviaQuestions),
    triviaAttempts: asArray(row.triviaAttempts, base.triviaAttempts),
    knowMeSheets: asArray(row.knowMeSheets, base.knowMeSheets),
    knowMeGuesses: asArray(row.knowMeGuesses, base.knowMeGuesses),
    predictions: asArray(row.predictions, base.predictions).map(hydratePrediction),
    twoTruths: asArray(row.twoTruths, base.twoTruths),
    photos: asArray(row.photos, base.photos)
      .map(hydratePhotoMemory)
      .filter((item): item is PhotoMemory => Boolean(item)),
    photoWeek: hydratePhotoWeek(row.photoWeek),
    photoPrefs: hydratePhotoPrefs(row.photoPrefs),
    doodle: hydrateDoodleBoard(row.doodle),
    crossword: asArray(row.crossword, base.crossword),
    wordle: hydrateWordle(row.wordle),
    story: row.story ?? null,
    capsules: asArray(row.capsules, base.capsules),
    meals: asArray(row.meals, base.meals),
    spots: asArray(row.spots, base.spots),
    chores: asArray(row.chores, base.chores),
    fairSpins: asArray(row.fairSpins, base.fairSpins),
    trips: asArray(row.trips, base.trips),
    goals: asArray(row.goals, base.goals)
      .map(hydrateMoneyGoal)
      .filter((item): item is MoneyGoal => Boolean(item)),
    budget: hydrateBudget(row.budget),
    maintenance: asArray(row.maintenance, base.maintenance),
    vault: asArray(row.vault, base.vault),
    vaultPin: typeof row.vaultPin === "string" ? row.vaultPin : "",
    sexyVault: hydrateSexyVault(row.sexyVault),
    sexyVaultPin: typeof row.sexyVaultPin === "string" ? row.sexyVaultPin : "",
    whoLast: asArray(row.whoLast, base.whoLast),
    whoTasks: asArray(row.whoTasks, base.whoTasks),
    cheers: asArray(row.cheers, base.cheers),
    period: hydratePeriodState(row.period),
    birthdays: hydrateBirthdays(row.birthdays),
    mealPlan: hydrateMealPlan(row.mealPlan),
    maintPrefs: hydrateMaintPrefs(row.maintPrefs),
    worldChoice: hydrateWorldChoice(row.worldChoice),
  };
}

export function secondsForText(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(8, Math.min(90, Math.round(words / 2.4)));
}
