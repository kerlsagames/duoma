import { localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import {
  PHOTO_CATEGORIES,
  PHOTO_PROMPTS,
  photoPrompts,
  type PhotoPrompt,
  type PhotoPromptCategory,
} from "@/lib/photo-prompts";

export function refreshUnknownPrompt(
  week: PhotoWeek,
  enabled?: PhotoPromptCategory[]
): PhotoWeek {
  if (week.locked || week.completedAt) return week;
  if (photoPromptById(week.promptId)) return week;
  const next = pickPhotoPrompt(week.usedPromptIds, enabled);
  return {
    ...week,
    promptId: next.id,
    usedPromptIds: [...week.usedPromptIds, next.id].slice(-120),
  };
}

export {
  PHOTO_CATEGORIES,
  PHOTO_PROMPTS,
  photoPrompts,
  photoPromptsIn,
} from "@/lib/photo-prompts";
export type { PhotoPrompt, PhotoPromptCategory } from "@/lib/photo-prompts";

export const PHOTO_SHUFFLES = 3;
export const PHOTO_GALLERY_CAP = 36;

export type PhotoMemory = {
  id: string;
  userId: string;
  promptId: string;
  caption: string;
  tint: string;
  sticker: string;
  createdAt: string;
  imageData: string | null;
  weekKey: string | null;
};

export type PhotoWeek = {
  weekKey: string;
  promptId: string;
  shufflesLeft: number;
  locked: boolean;
  agreedAt: string | null;
  startedAt: string;
  expiresAt: string;
  usedPromptIds: string[];
  completedAt: string | null;
  completedBy: string | null;
};

/** Older weekly shots keep their caption if they used the previous bank. */
const PHOTO_PROMPT_ARCHIVE: { id: string; label: string }[] = [
  { id: "first-coffee", label: "The first coffee of the day, still steaming" },
  { id: "their-hands", label: "Their hands, doing something ordinary" },
  { id: "unmade-bed", label: "The unmade bed from this morning" },
  { id: "kitchen-bench", label: "Whatever is on the kitchen bench right now" },
  { id: "shoes-door", label: "The shoes by the door" },
  { id: "dinner-before", label: "Tonight's dinner, before anyone eats" },
  { id: "couch-seat", label: "The view from our usual seat on the couch" },
  { id: "honest-sink", label: "A sink that tells the truth" },
  { id: "hallway-7", label: "The hallway light at 7pm" },
  { id: "their-bathroom", label: "Their side of the bathroom" },
  { id: "fridge-open", label: "The fridge, door open, no posing" },
  { id: "laundry-mid", label: "Laundry in progress" },
  { id: "leaving-pile", label: "Keys, wallet, the leaving pile" },
  { id: "thirsty-plant", label: "The plant you keep meaning to water" },
  { id: "ignored-clock", label: "The clock you both ignore" },
  { id: "mirror-steam", label: "Steam on the bathroom mirror" },
  { id: "lost-remote", label: "The remote, wherever it actually lives" },
  { id: "window-weather", label: "Today's weather through the window" },
  { id: "leftovers", label: "Leftovers that survived" },
  { id: "stolen-mug", label: "The mug they always steal" },
  { id: "odd-sock", label: "A sock that lost its pair" },
  { id: "one-lamp", label: "The hallway at night, one lamp" },
  { id: "grocery-bags", label: "Groceries still in the bags" },
  { id: "dump-spot", label: "The spot they dump their bag" },
  { id: "breakfast-scene", label: "Breakfast evidence" },
  { id: "no-smile", label: "Both of you in one frame. No smiling on purpose" },
  { id: "unposed-kiss", label: "A kiss that isn't for the camera" },
  { id: "hands-together", label: "Our hands together" },
  { id: "oldest-pose", label: "The same pose as our oldest photo of us" },
  { id: "first-date-fit", label: "Recreate our first-date outfits, badly" },
  { id: "mid-laugh", label: "Them laughing, mid-sentence" },
  { id: "their-pov", label: "You, from their point of view" },
  { id: "foreheads", label: "Foreheads together" },
  { id: "photo-of-photo", label: "A photo of them taking a photo of you" },
  { id: "match-or-not", label: "Matching — or aggressively not" },
  { id: "leaving-house", label: "The two of you leaving the house" },
  { id: "two-shadows", label: "Both of our shadows" },
  { id: "half-asleep", label: "One face, half-asleep" },
  { id: "not-looking", label: "The look they give you when they think you're not looking" },
  { id: "favourite-chair", label: "Our favourite chair, with them in it" },
  { id: "hug-behind", label: "A hug from behind" },
  { id: "two-pairs-feet", label: "Two pairs of feet on the same couch" },
  { id: "two-brushes", label: "The two toothbrushes" },
  { id: "car-profile", label: "Their profile in a car window" },
  { id: "kitchen-dance", label: "A kitchen dance, even a bad one" },
  { id: "two-plates", label: "The same meal, two plates" },
  { id: "in-your-jumper", label: "Them in the other's jumper" },
  { id: "almost-deleted", label: "A selfie you almost deleted" },
  { id: "pinkies", label: "Pinkies hooked" },
  { id: "doorway-two", label: "The two of you in a doorway" },
  { id: "our-table", label: "The table you keep going back to" },
  { id: "sunset-now", label: "Tonight's sunset. No filter debate" },
  { id: "their-doorway", label: "A doorway you still picture them in" },
  { id: "usual-carpark", label: "The car park you always end up in" },
  { id: "your-street", label: "Streetlight, our street" },
  { id: "linger-aisle", label: "The aisle you linger in" },
  { id: "ticket-stub", label: "A ticket stub or receipt that matters" },
  { id: "usual-walk", label: "The walk you always take" },
  { id: "window-seat", label: "A window seat" },
  { id: "apology-place", label: "The place you argued, then apologised" },
  { id: "neon", label: "Neon, somewhere" },
  { id: "usual-order", label: "Our usual coffee order, in the wild" },
  { id: "a-bench", label: "A bench you sat on this week" },
  { id: "passenger", label: "The view from the passenger seat" },
  { id: "rain-glass", label: "Rain on the windscreen" },
  { id: "visitor-spot", label: "Somewhere you'd take a visitor" },
  { id: "long-way", label: "The long way home" },
  { id: "joke-sign", label: "A sign that feels like an inside joke" },
  { id: "boring-gold", label: "Golden hour on a boring street" },
  { id: "your-corner", label: "Our booth, bar stool, or corner" },
  { id: "night-fluorescent", label: "Night market or fluorescent shop" },
  { id: "a-crossing", label: "A bridge or crossing" },
  { id: "sky-colour", label: "The sky the colour of the day you met. Close enough" },
  { id: "front-door", label: "Our front door from the street" },
  { id: "somewhere-new", label: "Somewhere new this week, even tiny" },
  { id: "bad-good-night", label: "A bad photo of a good night" },
  { id: "inside-joke", label: "Evidence of an inside joke" },
  { id: "movie-still", label: "Recreate a movie still with what's in the house" },
  { id: "ugly-love", label: "The most unflattering angle of something you love" },
  { id: "so-them", label: "One object that is so them" },
  { id: "only-us", label: "A photo only you two would understand" },
  { id: "cook-crime", label: "The crime scene after cooking" },
  { id: "invisible-chore", label: "Them doing the chore they pretend not to see" },
  { id: "a-mess", label: "A spill, a drop, a mess" },
  { id: "worst-outfit", label: "The worst outfit in the house, worn proudly" },
  { id: "judging-pet", label: "The pet judging you. Or a stuffed stand-in" },
  { id: "mess-mirror", label: "Mirror selfie, but only the mess behind you" },
  { id: "almost-bin", label: "A tiny thing you almost threw away" },
  { id: "only-red", label: "Colour hunt: only red" },
  { id: "free-fancy", label: "Something that costs nothing and looks expensive" },
  { id: "plan-wreck", label: "The wreckage of a plan" },
  { id: "from-floor", label: "A photo taken from the floor" },
  { id: "three-objects", label: "One frame, three objects that tell the week" },
  { id: "half-hidden", label: "Hide and seek: them, half hidden" },
  { id: "fridge-note", label: "The note you'd leave on the fridge" },
  { id: "we-live-here", label: "A 'we live here' still life" },
  { id: "flashlight-face", label: "A shadow puppet or flashlight face" },
  { id: "restage-last", label: "Restage the last photo on their camera roll" },
  { id: "something-soft", label: "Close-up of something soft" },
  { id: "first-kitchen", label: "The first kitchen you shared, or the one that feels like it" },
];

export const POLAROID_TINTS = [
  "#F4D6C6",
  "#D7E4C0",
  "#C9D7F2",
  "#F2D5E0",
  "#F7E7B8",
  "#D9C4F0",
];

export function photoPromptById(id: string): PhotoPrompt | null {
  return photoPrompts().find((row) => row.id === id) ?? null;
}

export function photoPromptTitle(id: string): string {
  const live = photoPromptById(id);
  if (live) return live.title;
  return PHOTO_PROMPT_ARCHIVE.find((row) => row.id === id)?.label ?? "This week's shot";
}

export function photoPromptLabel(id: string): string {
  const live = photoPromptById(id);
  if (live) return live.label;
  return PHOTO_PROMPT_ARCHIVE.find((row) => row.id === id)?.label ?? "This week's shot";
}

/** Monday of the local week as YYYY-MM-DD. */
export function currentPhotoWeekKey(from = new Date()): string {
  const date = new Date(from);
  const day = date.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + delta);
  date.setHours(0, 0, 0, 0);
  return localDateKey(date);
}

export function photoWeekExpiresAt(weekKey: string): string {
  const [year, month, day] = weekKey.split("-").map(Number);
  const end = new Date(year, (month || 1) - 1, (day || 1) + 7, 0, 0, 0, 0);
  return end.toISOString();
}

export function pickPhotoPrompt(
  avoidIds: string[] = [],
  enabled: PhotoPromptCategory[] = PHOTO_CATEGORIES.map((row) => row.id)
): PhotoPrompt {
  const avoid = new Set(avoidIds);
  const allowed = new Set(enabled.length ? enabled : PHOTO_CATEGORIES.map((row) => row.id));
  const live = photoPrompts();
  const inCats = live.filter((row) => allowed.has(row.category));
  const pool = inCats.filter((row) => !avoid.has(row.id));
  const source = pool.length ? pool : inCats.length ? inCats : live;
  return source[Math.floor(Math.random() * source.length)]!;
}

export function dealPhotoWeek(
  from = new Date(),
  avoidIds: string[] = [],
  enabled?: PhotoPromptCategory[]
): PhotoWeek {
  const weekKey = currentPhotoWeekKey(from);
  const prompt = pickPhotoPrompt(avoidIds, enabled);
  return {
    weekKey,
    promptId: prompt.id,
    shufflesLeft: PHOTO_SHUFFLES,
    locked: false,
    agreedAt: null,
    startedAt: nowIso(),
    expiresAt: photoWeekExpiresAt(weekKey),
    usedPromptIds: [...avoidIds, prompt.id].slice(-48),
    completedAt: null,
    completedBy: null,
  };
}

export function photoWeekIsLive(week: PhotoWeek | null, from = new Date()): boolean {
  if (!week) return false;
  return new Date(week.expiresAt).getTime() > from.getTime();
}

export type PhotoPrefs = {
  /** New shot can deal as soon as this one is pegged. Default waits the week. */
  dealAfterComplete: boolean;
  categories: PhotoPromptCategory[];
};

export function defaultPhotoPrefs(): PhotoPrefs {
  return {
    dealAfterComplete: false,
    categories: PHOTO_CATEGORIES.map((row) => row.id),
  };
}

export function normalizePhotoCategories(raw: unknown): PhotoPromptCategory[] {
  const all = PHOTO_CATEGORIES.map((row) => row.id);
  if (!Array.isArray(raw)) return all;
  const next = raw.filter((id): id is PhotoPromptCategory =>
    all.includes(id as PhotoPromptCategory)
  );
  return next.length ? next : all;
}

export function hydratePhotoPrefs(raw: unknown): PhotoPrefs {
  const base = defaultPhotoPrefs();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<PhotoPrefs>;
  return {
    dealAfterComplete: Boolean(row.dealAfterComplete),
    categories: normalizePhotoCategories(row.categories),
  };
}

export function startNextPhotoWeek(
  week: PhotoWeek | null,
  from = new Date(),
  enabled?: PhotoPromptCategory[]
): PhotoWeek {
  const next = dealPhotoWeek(from, week?.usedPromptIds ?? [], enabled);
  const ends = new Date(from);
  ends.setDate(ends.getDate() + 7);
  return {
    ...next,
    weekKey: `${localDateKey(from)}-${from.getTime()}`,
    expiresAt: ends.toISOString(),
  };
}

export function ensurePhotoWeek(
  week: PhotoWeek | null,
  from = new Date(),
  enabled?: PhotoPromptCategory[]
): PhotoWeek {
  if (photoWeekIsLive(week, from) && week) return week;
  return dealPhotoWeek(from, week?.usedPromptIds ?? [], enabled);
}

export function choosePhotoPrompt(week: PhotoWeek, promptId: string): PhotoWeek {
  if (week.locked || week.completedAt) return week;
  if (!photoPromptById(promptId)) return week;
  return {
    ...week,
    promptId,
    usedPromptIds: [...week.usedPromptIds, promptId].slice(-120),
  };
}

export function shufflePhotoWeek(
  week: PhotoWeek,
  enabled?: PhotoPromptCategory[]
): PhotoWeek {
  if (week.locked || week.completedAt || week.shufflesLeft <= 0) return week;
  const next = pickPhotoPrompt(week.usedPromptIds, enabled);
  const left = week.shufflesLeft - 1;
  return {
    ...week,
    promptId: next.id,
    shufflesLeft: left,
    locked: left <= 0,
    usedPromptIds: [...week.usedPromptIds, next.id].slice(-48),
  };
}

export function agreePhotoWeek(week: PhotoWeek, at = nowIso()): PhotoWeek {
  if (week.completedAt) return week;
  return { ...week, locked: true, agreedAt: week.agreedAt ?? at };
}

export function completePhotoWeek(
  week: PhotoWeek,
  userId: string,
  at = nowIso()
): PhotoWeek {
  return {
    ...week,
    locked: true,
    agreedAt: week.agreedAt ?? at,
    completedAt: at,
    completedBy: userId,
  };
}

export function createPhotoMemory(input: {
  userId: string;
  promptId: string;
  caption?: string;
  imageData: string;
  weekKey: string;
  tint?: string;
  sticker?: string;
}): PhotoMemory {
  return {
    id: createId(),
    userId: input.userId,
    promptId: input.promptId,
    caption: (input.caption ?? "").trim(),
    tint: input.tint ?? POLAROID_TINTS[0]!,
    sticker: input.sticker ?? "♡",
    createdAt: nowIso(),
    imageData: input.imageData,
    weekKey: input.weekKey,
  };
}

export function prependPhoto(
  list: PhotoMemory[],
  next: PhotoMemory
): PhotoMemory[] {
  return [next, ...list].slice(0, PHOTO_GALLERY_CAP);
}

export function hydratePhotoMemory(raw: unknown): PhotoMemory | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<PhotoMemory> & { image?: string };
  if (typeof row.promptId !== "string" && typeof row.caption !== "string") {
    return null;
  }
  const image =
    typeof row.imageData === "string"
      ? row.imageData
      : typeof row.image === "string"
        ? row.image
        : null;
  return {
    id: typeof row.id === "string" ? row.id : createId(),
    userId: typeof row.userId === "string" ? row.userId : "",
    promptId: typeof row.promptId === "string" ? row.promptId : "",
    caption: typeof row.caption === "string" ? row.caption : "",
    tint: typeof row.tint === "string" ? row.tint : POLAROID_TINTS[0]!,
    sticker: typeof row.sticker === "string" ? row.sticker : "♡",
    createdAt: typeof row.createdAt === "string" ? row.createdAt : nowIso(),
    imageData: image && image.startsWith("data:image") ? image : image,
    weekKey: typeof row.weekKey === "string" ? row.weekKey : null,
  };
}

export function hydratePhotoWeek(raw: unknown): PhotoWeek | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<PhotoWeek>;
  if (typeof row.weekKey !== "string" || typeof row.promptId !== "string") {
    return null;
  }
  const shuffles =
    typeof row.shufflesLeft === "number"
      ? Math.max(0, Math.min(PHOTO_SHUFFLES, Math.round(row.shufflesLeft)))
      : PHOTO_SHUFFLES;
  return {
    weekKey: row.weekKey,
    promptId: row.promptId,
    shufflesLeft: shuffles,
    locked: Boolean(row.locked) || shuffles <= 0 || Boolean(row.agreedAt),
    agreedAt: typeof row.agreedAt === "string" ? row.agreedAt : null,
    startedAt: typeof row.startedAt === "string" ? row.startedAt : nowIso(),
    expiresAt:
      typeof row.expiresAt === "string"
        ? row.expiresAt
        : photoWeekExpiresAt(row.weekKey),
    usedPromptIds: Array.isArray(row.usedPromptIds)
      ? row.usedPromptIds.filter((id): id is string => typeof id === "string")
      : [row.promptId],
    completedAt: typeof row.completedAt === "string" ? row.completedAt : null,
    completedBy: typeof row.completedBy === "string" ? row.completedBy : null,
  };
}

export function formatCountdown(expiresAt: string, from = new Date()): string {
  const ms = Math.max(0, new Date(expiresAt).getTime() - from.getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (ms <= 0) return "Week's up";
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export async function compressImageFile(file: Blob): Promise<string> {
  if (typeof createImageBitmap !== "function") {
    return readFileAsDataUrl(file);
  }
  const bitmap = await createImageBitmap(file);
  const max = 960;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read that photo."));
    };
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.readAsDataURL(file);
  });
}

export function pickImageFromDevice(): Promise<string | null> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("Photo upload needs the web app."));
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      void compressImageFile(file).then(resolve).catch(reject);
    };
    input.click();
  });
}
