import { applyOverlay } from "@/lib/catalog-overlay";
import { localDateKey, startOfWeek } from "@/lib/dates";
import { nowIso } from "@/lib/ids";
import { HOW_TECHNIQUES as HOW_SEED } from "@/lib/the-how-book";

export type HowChapterId = "essentials" | "penetration" | "amplify" | "release";

export type HowFor = "her" | "him" | "both";

export type HowStatus = "want" | "keep" | "skip";

export type HowType = {
  name: string;
  line: string;
};

export type HowStep = {
  minutes: string;
  title: string;
  body: string;
  durationSec: number;
};

export type HowVoice = {
  promise: string;
  what: string;
  why: string;
  signs: string[];
};

export type HowTechnique = {
  id: string;
  number: number;
  chapter: HowChapterId;
  for: HowFor;
  name: string;
  terms: string[];
  /** Who does what, on which part of the body. Shown above the try. */
  where: string;
  typesLabel: string;
  types: HowType[];
  routineLabel: string;
  routine: HowStep[];
  signsLabel: string;
  sayThis: string;
  plain: HowVoice;
  science: HowVoice;
};

export type HowChapter = {
  id: HowChapterId;
  label: string;
  range: string;
  detail: string;
};

export type HowNote = {
  techniqueId: string;
  status: HowStatus | null;
  note: string;
  updatedAt: string;
};

export type HowWord = {
  id: string;
  word: string;
  meaning: string;
};

export type HowBodyWord = {
  id: string;
  word: string;
  meaning: string;
};

export const HOW_CHAPTERS: HowChapter[] = [
  {
    id: "essentials",
    label: "Essentials",
    range: "1–12",
    detail: "Warm-up, talking, and clitoral touch before anyone goes inside",
  },
  {
    id: "penetration",
    label: "Penetration",
    range: "13–19",
    detail: "Angle, depth, and pairing — not just thrusting",
  },
  {
    id: "amplify",
    label: "Amplify",
    range: "20–25",
    detail: "Breath, tension, mapping, voice, and the minutes after",
  },
  {
    id: "release",
    label: "Release",
    range: "26–28",
    detail: "Clitoral, deep inside, blended, and the wave that follows",
  },
];

export const HOW_WORDS: HowWord[] = [
  { id: "softer", word: "Softer", meaning: "Less pressure. Not slower — lighter." },
  { id: "lighter", word: "Lighter", meaning: "Drop the weight. Keep the contact." },
  { id: "stay", word: "Stay", meaning: "Do not change a thing. That exact motion." },
  { id: "hold", word: "Hold", meaning: "Freeze. Keep contact. Do not start a new stroke." },
  { id: "there", word: "Right there", meaning: "You found it. Park on it." },
  { id: "left", word: "Left a bit", meaning: "A centimetre, not a new technique." },
  { id: "slower", word: "Slower", meaning: "Half the rhythm you just had." },
  { id: "harder", word: "Harder", meaning: "More pressure. Same place." },
  { id: "pause", word: "Pause", meaning: "Hold still, keep contact, breathe." },
  { id: "back-off", word: "Back off", meaning: "Drop intensity. Do not leave the body." },
  { id: "more-time", word: "More time", meaning: "Do not escalate yet. Stay here longer." },
  { id: "dont-stop", word: "Don’t stop", meaning: "Ride the same stroke through the peak." },
  { id: "not-that", word: "Not that", meaning: "Kind, fast, no essay required." },
  { id: "again", word: "Again later", meaning: "Good. File it. We can repeat it." },
];

export const HOW_BODY_WORDS: HowBodyWord[] = [
  {
    id: "vulva",
    word: "Vulva",
    meaning:
      "Everything on the outside: lips, hood, clitoris, opening. The vagina is the inside canal.",
  },
  {
    id: "mons",
    word: "Mons",
    meaning:
      "The soft padded mound above the vulva — where pubic hair grows. Pressing here is grounding, not ‘the clit.’",
  },
  {
    id: "hood",
    word: "Hood",
    meaning:
      "The fold of skin covering the clitoris, like a built-in sleeve. Touch here is usually kinder than going straight for the tip.",
  },
  {
    id: "glans",
    word: "The tip / glans",
    meaning:
      "The small, very sensitive head of the clitoris you can see. Easy to overdo. Most of the clitoris lives under the skin.",
  },
  {
    id: "labia",
    word: "Labia / lips",
    meaning:
      "The folds of skin around the opening. Outer lips are fuller; inner lips are thinner and sit inside.",
  },
  {
    id: "perineum",
    word: "Perineum",
    meaning: "The stretch of skin between the vaginal opening and the anus.",
  },
  {
    id: "entrance",
    word: "Entrance",
    meaning:
      "The first inch or two of the vagina. Most of the feeling lives here, not deep inside.",
  },
  {
    id: "front-wall",
    word: "Front wall",
    meaning:
      "The vaginal wall toward the belly button, a couple of inches in. Often spongy. Can feel like you need to pee — that’s nearby tissue, not a mistake.",
  },
  {
    id: "clit-body",
    word: "The rest of the clitoris",
    meaning:
      "Most of it you cannot see — legs and bulbs under the lips. Circling the hood still reaches them.",
  },
  {
    id: "pelvic-floor",
    word: "Pelvic floor",
    meaning:
      "The sling of muscle between the pubic bone and tailbone. It clenches in orgasm and clamps when someone is tense or cold.",
  },
  {
    id: "sacrum",
    word: "Sacrum",
    meaning:
      "The triangular bone at the base of the spine, just above the tailbone. Firm pressure here often echoes in the pelvis.",
  },
];

export function howTechniques(includeHidden = false): HowTechnique[] {
  const blank = HOW_SEED[0]!;
  return applyOverlay(
    "how",
    HOW_SEED,
    (row, edit) => ({
      ...row,
      name: edit.title?.trim() || row.name,
      where: edit.group?.trim() || row.where,
      sayThis: edit.body?.trim() ? row.sayThis : row.sayThis,
      plain: {
        ...row.plain,
        what: edit.body?.trim() || row.plain.what,
      },
    }),
    (row) => ({
      ...blank,
      id: row.id,
      number: 99,
      name: row.title.trim() || "Untitled",
      where: row.group || blank.where,
      sayThis: row.body || blank.sayThis,
      plain: { ...blank.plain, what: row.body || blank.plain.what },
    }),
    includeHidden
  );
}

export const HOW_TECHNIQUES = HOW_SEED;

export function howVoice(technique: HowTechnique, plainOn: boolean): HowVoice {
  return plainOn ? technique.plain : technique.science;
}

export function bodyWordsFor(ids: string[]): HowBodyWord[] {
  return ids
    .map((id) => HOW_BODY_WORDS.find((row) => row.id === id))
    .filter((row): row is HowBodyWord => Boolean(row));
}

export function chapterMeta(id: HowChapterId) {
  return HOW_CHAPTERS.find((row) => row.id === id) ?? HOW_CHAPTERS[0]!;
}

export function techniqueById(id: string): HowTechnique | null {
  return howTechniques().find((row) => row.id === id) ?? null;
}

export function techniquesInChapter(id: HowChapterId): HowTechnique[] {
  return howTechniques().filter((row) => row.chapter === id);
}

export function forLabel(who: HowFor): string {
  if (who === "her") return "For her";
  if (who === "him") return "For him";
  return "For both of you";
}

export function statusLabel(status: HowStatus | null): string {
  if (status === "want") return "Want to try";
  if (status === "keep") return "Keep this";
  if (status === "skip") return "Not for us";
  return "Untried";
}

export function padHowNumber(n: number): string {
  return String(n).padStart(2, "0");
}

export function routineMinutes(technique: HowTechnique): number {
  const total = technique.routine.reduce((sum, step) => sum + step.durationSec, 0);
  return Math.max(1, Math.round(total / 60));
}

export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function noteFor(notes: HowNote[], techniqueId: string): HowNote | null {
  return notes.find((row) => row.techniqueId === techniqueId) ?? null;
}

export function upsertHowNote(
  notes: HowNote[],
  techniqueId: string,
  patch: Partial<Pick<HowNote, "status" | "note">>
): HowNote[] {
  const current = noteFor(notes, techniqueId);
  const next: HowNote = {
    techniqueId,
    status: patch.status !== undefined ? patch.status : current?.status ?? null,
    note: patch.note !== undefined ? patch.note : current?.note ?? "",
    updatedAt: nowIso(),
  };
  if (!current) return [...notes, next];
  return notes.map((row) => (row.techniqueId === techniqueId ? next : row));
}

export function keptTechniques(notes: HowNote[]): HowTechnique[] {
  const ids = new Set(
    notes
      .filter((row) => row.status === "keep" || row.status === "want")
      .map((row) => row.techniqueId)
  );
  return howTechniques().filter((row) => ids.has(row.id));
}

export function thisWeekKey(from = new Date()): string {
  return startOfWeek(localDateKey(from));
}

function hashKey(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function weekTechnique(notes: HowNote[], weekKey: string): HowTechnique {
  const skipped = new Set(
    notes.filter((row) => row.status === "skip").map((row) => row.techniqueId)
  );
  const tried = new Set(
    notes
      .filter((row) => row.status === "keep" || row.status === "want")
      .map((row) => row.techniqueId)
  );
  const fresh = howTechniques().filter(
    (row) => !skipped.has(row.id) && !tried.has(row.id)
  );
  const pool = fresh.length
    ? fresh
    : howTechniques().filter((row) => !skipped.has(row.id));
  const list = pool.length ? pool : howTechniques();
  return list[hashKey(weekKey) % list.length]!;
}

export function emptyHowNotes(): HowNote[] {
  return [];
}

export function emptyHowWords(): string[] {
  return [];
}

export function emptyHowPlainOn(): boolean {
  return true;
}

export function hydrateHowPlainOn(raw: unknown): boolean {
  return raw !== false;
}

export function hydrateHowNote(raw: unknown): HowNote | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<HowNote>;
  if (typeof row.techniqueId !== "string" || !row.techniqueId) return null;
  if (!techniqueById(row.techniqueId)) return null;
  const status =
    row.status === "want" || row.status === "keep" || row.status === "skip"
      ? row.status
      : null;
  return {
    techniqueId: row.techniqueId,
    status,
    note: typeof row.note === "string" ? row.note : "",
    updatedAt: typeof row.updatedAt === "string" && row.updatedAt ? row.updatedAt : nowIso(),
  };
}

export function hydrateHowNotes(raw: unknown): HowNote[] {
  return (Array.isArray(raw) ? raw : [])
    .map(hydrateHowNote)
    .filter((row): row is HowNote => Boolean(row));
}

export function hydrateHowWordsOn(raw: unknown): string[] {
  const known = new Set(HOW_WORDS.map((row) => row.id));
  return (Array.isArray(raw) ? raw : []).filter(
    (id): id is string => typeof id === "string" && known.has(id)
  );
}
