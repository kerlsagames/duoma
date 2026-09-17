import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import {
  emptyBirthdays,
  emptyBirthdayGroups,
  hydrateBirthdays,
  hydrateBirthdayGroups,
  type Birthday,
  type BirthdayGroup,
} from "@/lib/birthdays";
import { emptyWordle, hydrateWordle, type WordleState } from "@/lib/daily-word";
import { emptyDoodleBoard, hydrateDoodleBoard, type DoodleBoard } from "@/lib/doodle-game";
import { createId, nowIso } from "@/lib/ids";
import { localDateKey } from "@/lib/dates";
import { hydrateTrip } from "@/lib/trips";
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
import { emptyWorldChoice,
  hydrateWorldChoice,
  type WorldChoice,
} from "@/lib/worlds";
import {
  emptySparkState,
  hydrateSparkState,
  type SparkState,
} from "@/lib/spark";
import {
  emptySexyVault,
  hydrateSexyVault,
  type SexyVaultItem,
} from "@/lib/sexy-vault";
import { hydrateVoteIds } from "@/lib/vault-pin";
import {
  defaultGoals,
  emptyBudget,
  hydrateBudget,
  hydrateMoneyGoal,
  type BudgetState,
  type MoneyGoal,
} from "@/lib/money";
import { emptyGifts, hydrateGifts, type GiftItem, type GiftPerson } from "@/lib/gifts";
import {
  emptyHowNotes,
  emptyHowPlainOn,
  emptyHowWords,
  hydrateHowNotes,
  hydrateHowPlainOn,
  hydrateHowWordsOn,
  type HowNote,
} from "@/lib/the-how";
import {
  emptyPadNotes,
  hydratePadNotes,
  type PadNote,
} from "@/lib/notepad";

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
  const hasAudio = Boolean(row.hasAudio) || Boolean(uri);
  if (!hasAudio) return null;
  return {
    id: row.id,
    fromId: row.fromId,
    folder,
    title,
    body,
    seconds,
    createdAt,
    hasAudio: true,
    mimeType,
    uri,
  };
}

export type IntimacyKind =
  | "kiss"
  | "talk"
  | "date"
  | "intimacy"
  | "oral"
  | "sex"
  | "cuddle"
  | "adventure"
  | "dare"
  | "spicy"
  | "ping"
  | "connect";

export type ManualIntimacyKind = Exclude<
  IntimacyKind,
  "dare" | "spicy" | "ping" | "connect"
>;

export type IntimacyLog = {
  id: string;
  userId: string;
  kind: IntimacyKind;
  note: string;
  date: string;
  createdAt: string;
  /** Set for auto-fuel (dares, spicy nights, pings, Connect). Manual logs stay null. */
  sourceId?: string | null;
};

export function hydrateIntimacyLog(raw: unknown): IntimacyLog | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<IntimacyLog>;
  const valid: IntimacyKind[] = [
    "kiss",
    "talk",
    "date",
    "intimacy",
    "oral",
    "sex",
    "cuddle",
    "adventure",
    "dare",
    "spicy",
    "ping",
    "connect",
  ];
  const nextKind = valid.includes(row.kind as IntimacyKind)
    ? (row.kind as IntimacyKind)
    : "intimacy";
  const date = typeof row.date === "string" && row.date ? row.date : localDateKey();
  const createdAt =
    typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso();
  const id = typeof row.id === "string" && row.id ? row.id : `log:${date}:${createdAt}`;
  return {
    id,
    userId: typeof row.userId === "string" && row.userId ? row.userId : "couple",
    kind: nextKind,
    note: typeof row.note === "string" ? row.note : "",
    date,
    createdAt,
    sourceId: typeof row.sourceId === "string" && row.sourceId ? row.sourceId : null,
  };
}

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

export type TripBookingKind =
  | "stay"
  | "flight"
  | "train"
  | "ticket"
  | "car"
  | "other";

export type TripBooking = {
  id: string;
  kind: TripBookingKind;
  title: string;
  /** Booking / confirmation link */
  url: string;
  note: string;
  /** Estimated cost in dollars */
  cost: number;
  /** Optional day this booking belongs to (YYYY-MM-DD) */
  dayDate: string;
  /** Local data URI or remote URL for a ticket/photo */
  fileUri: string;
  fileName: string;
};

export type TripPlanItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  cost: number;
  done: boolean;
  url: string;
};

export type TripDay = {
  id: string;
  /** YYYY-MM-DD when known, else "" */
  date: string;
  title: string;
  items: TripPlanItem[];
};

export type PackItem = {
  id: string;
  label: string;
  packed: boolean;
};

/** @deprecated Kept so older trip saves with stops still parse. */
export type TripStop = {
  id: string;
  title: string;
  detail: string;
  when: string;
  done: boolean;
};

export type Trip = {
  id: string;
  title: string;
  where: string;
  start: string;
  end: string;
  notes: string;
  days: TripDay[];
  bookings: TripBooking[];
  packing: PackItem[];
  createdAt: string;
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
  vaultSkipPin: boolean;
  vaultPinResetVotes: string[];
  sexyVault: SexyVaultItem[];
  sexyVaultPin: string;
  sexyVaultPinResetVotes: string[];
  whoLast: WhoLast[];
  whoTasks: { id: string; label: string }[];
  cheers: Cheer[];
  period: PeriodState;
  birthdays: Birthday[];
  birthdayGroups: BirthdayGroup[];
  giftPeople: GiftPerson[];
  giftItems: GiftItem[];
  howNotes: HowNote[];
  howWordsOn: string[];
  howPlainOn: boolean;
  padNotes: PadNote[];
  mealPlan: MealPlanState;
  maintPrefs: MaintPrefs;
  worldChoice: WorldChoice;
  spark: SparkState;
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

export const MANUAL_INTIMACY_KINDS: {
  id: ManualIntimacyKind;
  label: string;
  color: string;
  icon: string;
}[] = [
  { id: "kiss", label: "Kiss", color: "#FF6B9A", icon: "heart" },
  { id: "cuddle", label: "Cuddle", color: "#C9A0DC", icon: "moon" },
  { id: "talk", label: "Deep talk", color: "#8FA8C8", icon: "chatbubbles" },
  { id: "date", label: "Date night", color: "#F0C75E", icon: "wine" },
  { id: "oral", label: "Oral", color: "#FF8A5C", icon: "water" },
  { id: "sex", label: "Sex", color: "#FF4D6A", icon: "flame" },
  { id: "intimacy", label: "Intimacy", color: "#E05A78", icon: "heart-circle" },
  { id: "adventure", label: "Adventure", color: "#3ECFBF", icon: "compass" },
];

export const SIMPLE_INTIMACY_KINDS: {
  id: ManualIntimacyKind;
  label: string;
  color: string;
}[] = [
  { id: "kiss", label: "Kiss", color: "#FF6B9A" },
  { id: "cuddle", label: "Cuddle", color: "#C9A0DC" },
  { id: "talk", label: "Deep talk", color: "#8FA8C8" },
  { id: "date", label: "Date night", color: "#F0C75E" },
  { id: "oral", label: "Oral", color: "#FF8A5C" },
  { id: "sex", label: "Sex", color: "#FF4D6A" },
];

export const AUTO_INTIMACY_KINDS: {
  id: IntimacyKind;
  label: string;
  color: string;
  icon: string;
}[] = [
  { id: "dare", label: "Dare", color: "#FF5A3C", icon: "flash" },
  { id: "spicy", label: "Get Spicy", color: "#FF6A3D", icon: "flame" },
  { id: "ping", label: "Ping", color: "#FF8AB0", icon: "notifications" },
  { id: "connect", label: "Connect", color: "#7EC8E3", icon: "heart" },
];

export const INTIMACY_KINDS: {
  id: IntimacyKind;
  label: string;
  color: string;
  icon: string;
}[] = [...MANUAL_INTIMACY_KINDS, ...AUTO_INTIMACY_KINDS];

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
  { id: "chore-bath", label: "Bathroom reset" },
  { id: "chore-floors", label: "Floors" },
  { id: "chore-cat", label: "Creature duties" },
];

/** Retired defaults, stripped on hydrate so old saves lose the boring list. */
const RETIRED_FAIR_SHARE_IDS = new Set([
  "chore-dishes",
  "chore-trash",
  "chore-laundry",
  "chore-cook",
  "chore-admin",
  "who-dishes",
  "who-trash",
  "who-laundry",
  "who-cook",
  "who-shop",
  "who-bed",
  "who-bills",
  "who-car",
]);

const RETIRED_FAIR_SHARE_LABELS = new Set([
  "dishes",
  "trash & recycling",
  "laundry mountain",
  "cook tonight",
  "the boring emails",
  "did the dishes",
  "took the trash",
  "started laundry",
  "made dinner",
  "did the shop",
  "made the bed",
  "paid a bill",
  "filled the tank",
]);

export const DEFAULT_WHO_TASKS: { id: string; label: string }[] = [];

function keepFairShareItem(row: { id: string; label: string }) {
  if (RETIRED_FAIR_SHARE_IDS.has(row.id)) return false;
  return !RETIRED_FAIR_SHARE_LABELS.has(row.label.trim().toLowerCase());
}

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
    maintenance: [],
    vault: DEFAULT_VAULT.map((row) => ({ ...row })),
    vaultPin: "",
    vaultSkipPin: false,
    vaultPinResetVotes: [],
    sexyVault: emptySexyVault(),
    sexyVaultPin: "",
    sexyVaultPinResetVotes: [],
    whoLast: [],
    whoTasks: DEFAULT_WHO_TASKS.map((row) => ({ ...row })),
    cheers: [],
    period: emptyPeriodState(),
    birthdays: emptyBirthdays(),
    birthdayGroups: emptyBirthdayGroups(),
    giftPeople: emptyGifts().people,
    giftItems: emptyGifts().items,
    howNotes: emptyHowNotes(),
    howWordsOn: emptyHowWords(),
    howPlainOn: emptyHowPlainOn(),
    padNotes: emptyPadNotes(),
    mealPlan: emptyMealPlan(),
    maintPrefs: { ...DEFAULT_MAINT_PREFS },
    worldChoice: emptyWorldChoice(),
    spark: emptySparkState(),
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
    intimacy: asArray(row.intimacy, base.intimacy)
      .map(hydrateIntimacyLog)
      .filter((item): item is IntimacyLog => Boolean(item)),
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
    chores: asArray(row.chores, base.chores).filter(keepFairShareItem),
    fairSpins: asArray(row.fairSpins, base.fairSpins),
    trips: asArray(row.trips, base.trips).map(hydrateTrip).filter((row): row is Trip => Boolean(row)),
    goals: asArray(row.goals, base.goals)
      .map(hydrateMoneyGoal)
      .filter((item): item is MoneyGoal => Boolean(item)),
    budget: hydrateBudget(row.budget),
    maintenance: asArray(row.maintenance, base.maintenance),
    vault: asArray(row.vault, base.vault),
    vaultPin: typeof row.vaultPin === "string" ? row.vaultPin : "",
    vaultSkipPin: row.vaultSkipPin === true,
    vaultPinResetVotes: hydrateVoteIds(row.vaultPinResetVotes),
    sexyVault: hydrateSexyVault(row.sexyVault),
    sexyVaultPin: typeof row.sexyVaultPin === "string" ? row.sexyVaultPin : "",
    sexyVaultPinResetVotes: hydrateVoteIds(row.sexyVaultPinResetVotes),
    whoLast: asArray(row.whoLast, base.whoLast),
    whoTasks: asArray(row.whoTasks, base.whoTasks).filter(keepFairShareItem),
    cheers: asArray(row.cheers, base.cheers),
    period: hydratePeriodState(row.period),
    birthdays: hydrateBirthdays(row.birthdays),
    birthdayGroups: hydrateBirthdayGroups(row.birthdayGroups),
    giftPeople: hydrateGifts(row.giftPeople, row.giftItems).people,
    giftItems: hydrateGifts(row.giftPeople, row.giftItems).items,
    howNotes: hydrateHowNotes(row.howNotes),
    howWordsOn: hydrateHowWordsOn(row.howWordsOn),
    howPlainOn: hydrateHowPlainOn(row.howPlainOn),
    padNotes: hydratePadNotes(row.padNotes),
    mealPlan: hydrateMealPlan(row.mealPlan),
    maintPrefs: hydrateMaintPrefs(row.maintPrefs),
    worldChoice: hydrateWorldChoice(row.worldChoice),
    spark: hydrateSparkState(row.spark),
  };
}

