import { DAILY_WORDS } from "@/lib/daily-word-bank";
import { localDateKey } from "@/lib/dates";
import { nowIso } from "@/lib/ids";

export type LetterMark = "correct" | "present" | "absent";
export type WordleThemeId = "classic" | "blush" | "ocean" | "forest" | "cream" | "high";

export type WordlePlayer = {
  userId: string;
  guesses: string[];
  solvedAt: string | null;
};

export type WordleDay = {
  dateKey: string;
  word: string;
  players: WordlePlayer[];
};

export type WordlePrefs = {
  themeId: WordleThemeId;
  colorBlind: boolean;
  hardMode: boolean;
  showScoreboard: boolean;
};

export type WordleState = {
  prefs: WordlePrefs;
  days: WordleDay[];
};

export type WordleTheme = {
  id: WordleThemeId;
  label: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  empty: string;
  border: string;
  correct: string;
  present: string;
  absent: string;
  key: string;
  keyText: string;
  accent: string;
};

export const WORDLE_THEMES: WordleTheme[] = [
  {
    id: "classic",
    label: "Classic",
    bg: "#0E1014",
    surface: "#181A20",
    text: "#F4F4F6",
    muted: "rgba(244,244,246,0.52)",
    empty: "#1C1E26",
    border: "#3A3A3C",
    correct: "#6AAA64",
    present: "#C9B458",
    absent: "#1A1A1C",
    key: "#8E8E92",
    keyText: "#F4F4F6",
    accent: "#6AAA64",
  },
  {
    id: "blush",
    label: "Blush",
    bg: "#1A0C12",
    surface: "#261018",
    text: "#F8E8EE",
    muted: "rgba(248,232,238,0.55)",
    empty: "#2E141C",
    border: "#5A2434",
    correct: "#E31B5D",
    present: "#E8A0B8",
    absent: "#1A1014",
    key: "#6A3A48",
    keyText: "#F8E8EE",
    accent: "#E31B5D",
  },
  {
    id: "ocean",
    label: "Ocean",
    bg: "#07141C",
    surface: "#0E1E28",
    text: "#E4F2F6",
    muted: "rgba(228,242,246,0.55)",
    empty: "#122430",
    border: "#2A4A58",
    correct: "#2BB4A8",
    present: "#3D8ECF",
    absent: "#0A1418",
    key: "#3A5860",
    keyText: "#E4F2F6",
    accent: "#2BB4A8",
  },
  {
    id: "forest",
    label: "Forest",
    bg: "#0C1410",
    surface: "#142018",
    text: "#E8F0E4",
    muted: "rgba(232,240,228,0.55)",
    empty: "#1A2820",
    border: "#2E4A34",
    correct: "#4C8A4A",
    present: "#C4A24A",
    absent: "#0E1610",
    key: "#3E5644",
    keyText: "#E8F0E4",
    accent: "#7CB86A",
  },
  {
    id: "cream",
    label: "Cream",
    bg: "#F3E6C4",
    surface: "#E8D8B0",
    text: "#2A1C12",
    muted: "rgba(42,28,18,0.55)",
    empty: "#EFE0B8",
    border: "#C4A574",
    correct: "#4A7A3A",
    present: "#C48412",
    absent: "#5A4A36",
    key: "#E2D4B0",
    keyText: "#2A1C12",
    accent: "#8B1E1E",
  },
  {
    id: "high",
    label: "High contrast",
    bg: "#000000",
    surface: "#141414",
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.6)",
    empty: "#1A1A1A",
    border: "#FFFFFF",
    correct: "#F5793A",
    present: "#85C0F9",
    absent: "#141414",
    key: "#6A6A6A",
    keyText: "#FFFFFF",
    accent: "#F5793A",
  },
];

export function emptyWordle(): WordleState {
  return {
    prefs: {
      themeId: "classic",
      colorBlind: false,
      hardMode: false,
      showScoreboard: true,
    },
    days: [],
  };
}

export function hydrateWordle(raw: unknown): WordleState {
  const base = emptyWordle();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<WordleState>;
  const prefs =
    row.prefs && typeof row.prefs === "object"
      ? (row.prefs as Partial<WordlePrefs>)
      : {};
  return {
    prefs: {
      themeId: WORDLE_THEMES.some((item) => item.id === prefs.themeId)
        ? (prefs.themeId as WordleThemeId)
        : "classic",
      colorBlind: Boolean(prefs.colorBlind),
      hardMode: Boolean(prefs.hardMode),
      showScoreboard: prefs.showScoreboard !== false,
    },
    days: Array.isArray(row.days)
      ? row.days
          .map(hydrateDay)
          .filter((item): item is WordleDay => Boolean(item))
          .slice(0, 21)
      : [],
  };
}

function hydrateDay(raw: unknown): WordleDay | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<WordleDay>;
  if (typeof row.dateKey !== "string" || typeof row.word !== "string") return null;
  return {
    dateKey: row.dateKey,
    word: row.word.toUpperCase(),
    players: Array.isArray(row.players)
      ? row.players
          .filter((item): item is WordlePlayer => Boolean(item && typeof item.userId === "string"))
          .map((item) => ({
            userId: item.userId,
            guesses: Array.isArray(item.guesses)
              ? item.guesses
                  .filter((g): g is string => typeof g === "string")
                  .map((g) => g.toUpperCase())
                  .slice(0, 6)
              : [],
            solvedAt: typeof item.solvedAt === "string" ? item.solvedAt : null,
          }))
      : [],
  };
}

export function wordForDate(dateKey: string): string {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return DAILY_WORDS[hash % DAILY_WORDS.length] ?? "HEART";
}

export function ensureWordleDay(state: WordleState, dateKey = localDateKey()): WordleState {
  const existing = state.days.find((row) => row.dateKey === dateKey);
  if (existing) return state;
  return {
    ...state,
    days: [{ dateKey, word: wordForDate(dateKey), players: [] }, ...state.days].slice(0, 21),
  };
}

export function wordleDay(state: WordleState, dateKey = localDateKey()): WordleDay {
  return (
    state.days.find((row) => row.dateKey === dateKey) ?? {
      dateKey,
      word: wordForDate(dateKey),
      players: [],
    }
  );
}

export function playerFor(day: WordleDay, userId: string): WordlePlayer {
  return day.players.find((row) => row.userId === userId) ?? {
    userId,
    guesses: [],
    solvedAt: null,
  };
}

export function scoreGuess(guess: string, answer: string): LetterMark[] {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const marks: LetterMark[] = Array.from({ length: 5 }, () => "absent");
  const leftover: Record<string, number> = {};
  for (let i = 0; i < 5; i += 1) {
    if (g[i] === a[i]) marks[i] = "correct";
    else leftover[a[i]!] = (leftover[a[i]!] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i += 1) {
    if (marks[i] === "correct") continue;
    const ch = g[i]!;
    if (leftover[ch]) {
      marks[i] = "present";
      leftover[ch] -= 1;
    }
  }
  return marks;
}

export function hardModeError(guess: string, previous: string[], answer: string): string | null {
  if (previous.length === 0) return null;
  const g = guess.toUpperCase();
  for (const prior of previous) {
    const marks = scoreGuess(prior, answer);
    for (let i = 0; i < 5; i += 1) {
      if (marks[i] === "correct" && g[i] !== prior[i]) {
        return `Hard mode: letter ${i + 1} must stay ${prior[i]}.`;
      }
    }
    for (let i = 0; i < 5; i += 1) {
      if (marks[i] === "present" && !g.includes(prior[i]!)) {
        return `Hard mode: must use ${prior[i]}.`;
      }
    }
  }
  return null;
}

export function applyGuess(
  state: WordleState,
  userId: string,
  guess: string,
  dateKey = localDateKey()
): { state: WordleState; error: string | null } {
  const next = ensureWordleDay(state, dateKey);
  const day = wordleDay(next, dateKey);
  const player = playerFor(day, userId);
  const word = guess.trim().toUpperCase();
  if (player.solvedAt || player.guesses.length >= 6) {
    return { state: next, error: null };
  }
  if (!/^[A-Z]{5}$/.test(word)) {
    return { state: next, error: "Five letters." };
  }
  if (player.guesses.includes(word)) {
    return { state: next, error: "Already tried that." };
  }
  if (next.prefs.hardMode) {
    const hard = hardModeError(word, player.guesses, day.word);
    if (hard) return { state: next, error: hard };
  }
  const guesses = [...player.guesses, word];
  const solvedAt = word === day.word ? nowIso() : player.solvedAt;
  const updated: WordlePlayer = { userId, guesses, solvedAt };
  const players = [updated, ...day.players.filter((row) => row.userId !== userId)];
  return {
    state: {
      ...next,
      days: next.days.map((row) => (row.dateKey === dateKey ? { ...row, players } : row)),
    },
    error: null,
  };
}

export function keyMarks(guesses: string[], answer: string): Record<string, LetterMark> {
  const rank: Record<LetterMark, number> = { absent: 1, present: 2, correct: 3 };
  const out: Record<string, LetterMark> = {};
  for (const guess of guesses) {
    const marks = scoreGuess(guess, answer);
    guess.split("").forEach((ch, i) => {
      const mark = marks[i]!;
      if (!out[ch] || rank[mark] > rank[out[ch]!]) out[ch] = mark;
    });
  }
  return out;
}

export function themeFor(prefs: WordlePrefs): WordleTheme {
  const base = WORDLE_THEMES.find((item) => item.id === prefs.themeId) ?? WORDLE_THEMES[0]!;
  if (!prefs.colorBlind || prefs.themeId === "high") return base;
  return { ...base, correct: "#F5793A", present: "#85C0F9" };
}

export function finished(player: WordlePlayer): boolean {
  return Boolean(player.solvedAt) || player.guesses.length >= 6;
}

export function winnerOf(day: WordleDay): WordlePlayer | null {
  const solved = day.players.filter((row) => row.solvedAt);
  if (solved.length === 0) return null;
  return [...solved].sort((a, b) => {
    const t = (a.solvedAt ?? "").localeCompare(b.solvedAt ?? "");
    if (t !== 0) return t;
    return a.guesses.length - b.guesses.length;
  })[0]!;
}

export type WordleRecord = {
  wins: number;
  losses: number;
  ties: number;
  avgGuesses: number | null;
  played: number;
};

export function coupleWordleRecord(
  state: WordleState,
  youId: string,
  themId: string
): WordleRecord {
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let guessSum = 0;
  let guessN = 0;
  let played = 0;
  for (const day of state.days) {
    const mine = playerFor(day, youId);
    const theirs = playerFor(day, themId);
    if (!finished(mine) && !finished(theirs)) continue;
    played += 1;
    if (finished(mine) && mine.guesses.length > 0) {
      guessSum += mine.guesses.length;
      guessN += 1;
    }
    const meSolved = Boolean(mine.solvedAt);
    const theySolved = Boolean(theirs.solvedAt);
    if (meSolved && theySolved) {
      if (mine.guesses.length < theirs.guesses.length) wins += 1;
      else if (mine.guesses.length > theirs.guesses.length) losses += 1;
      else {
        const t = (mine.solvedAt ?? "").localeCompare(theirs.solvedAt ?? "");
        if (t < 0) wins += 1;
        else if (t > 0) losses += 1;
        else ties += 1;
      }
    } else if (meSolved) {
      wins += 1;
    } else if (theySolved) {
      losses += 1;
    } else {
      ties += 1;
    }
  }
  return {
    wins,
    losses,
    ties,
    avgGuesses: guessN ? guessSum / guessN : null,
    played,
  };
}

export function everSolved(state: WordleState): boolean {
  return state.days.some((day) => day.players.some((row) => row.solvedAt));
}

function richerPlayer(a: WordlePlayer, b: WordlePlayer): WordlePlayer {
  if (b.guesses.length > a.guesses.length) return b;
  if (a.guesses.length > b.guesses.length) return a;
  if (b.solvedAt && !a.solvedAt) return b;
  if (a.solvedAt && !b.solvedAt) return a;
  if ((b.solvedAt ?? "") > (a.solvedAt ?? "")) return b;
  return a;
}

export function mergeWordleStates(local: WordleState, remote: WordleState): WordleState {
  const days = new Map<string, WordleDay>();
  const put = (day: WordleDay) => {
    const prev = days.get(day.dateKey);
    if (!prev) {
      days.set(day.dateKey, day);
      return;
    }
    const players = new Map<string, WordlePlayer>();
    for (const row of [...prev.players, ...day.players]) {
      const have = players.get(row.userId);
      players.set(row.userId, have ? richerPlayer(have, row) : row);
    }
    days.set(day.dateKey, {
      dateKey: day.dateKey,
      word: prev.word || day.word,
      players: [...players.values()],
    });
  };
  for (const day of local.days) put(day);
  for (const day of remote.days) put(day);
  return {
    prefs: local.prefs,
    days: [...days.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey)).slice(0, 21),
  };
}

export const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
] as const;
