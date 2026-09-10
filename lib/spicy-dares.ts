import {
  expiresAtForTiming,
  formatExactWhen,
  parseLocalDateTime,
  timingSummary,
  toLocalDateTimeValue,
  type UseTimingId,
} from "@/lib/useTiming";

export type DareDirection = "i-do-you" | "you-do-me";
export type DareTimeframe =
  | "tonight"
  | "weekend"
  | "7d"
  | "30d"
  | "none"
  | "custom"
  | "24h"; // legacy
export type DarePlayStatus = "offered" | "accepted" | "declined" | "done";

export const SPICY_DARE_CATEGORIES = [
  "Film & Photo",
  "Toys & Accessories",
  "Roleplay & Teasing",
  "Sensory & Touch",
  "Location & Adventure",
  "Quick & Playful",
] as const;

export type SpicyDareCategory = (typeof SPICY_DARE_CATEGORIES)[number];

export type SpicyDareCategoryMeta = {
  id: SpicyDareCategory;
  label: string;
  detail: string;
  icon:
    | "camera-outline"
    | "diamond-outline"
    | "sparkles-outline"
    | "hand-left-outline"
    | "navigate-outline"
    | "flash-outline";
};

export const SPICY_DARE_CATEGORY_META: SpicyDareCategoryMeta[] = [
  {
    id: "Film & Photo",
    label: "Film",
    detail: "Photos, clips, voice notes",
    icon: "camera-outline",
  },
  {
    id: "Toys & Accessories",
    label: "Toys",
    detail: "Toys, ice, soft restraints",
    icon: "diamond-outline",
  },
  {
    id: "Roleplay & Teasing",
    label: "Roleplay",
    detail: "Scenes, teasing, text play",
    icon: "sparkles-outline",
  },
  {
    id: "Sensory & Touch",
    label: "Sensory",
    detail: "Touch, tempo, sensation",
    icon: "hand-left-outline",
  },
  {
    id: "Location & Adventure",
    label: "Places",
    detail: "Rooms, outings, risk",
    icon: "navigate-outline",
  },
  {
    id: "Quick & Playful",
    label: "Quick",
    detail: "Short, playful, right now",
    icon: "flash-outline",
  },
];

export function spicyCategoryMeta(
  id: SpicyDareCategory | string | null | undefined
): SpicyDareCategoryMeta | null {
  return SPICY_DARE_CATEGORY_META.find((row) => row.id === id) ?? null;
}

export type SpicyDare = {
  id: string;
  text: string;
  categories: SpicyDareCategory[];
  status?: "unplayed" | "played";
};

export const SPICY_DARE_DECK_ID = "wildcard" as const;
export const SPICY_DARE_LEGACY_IDS = ["secret-desires", "spicy-dares"] as const;
/** @deprecated use SPICY_DARE_LEGACY_IDS */
export const SPICY_DARE_LEGACY_ID = "secret-desires" as const;

export function isSpicyDareDeck(id: string | null | undefined): boolean {
  if (!id) return false;
  return (
    id === SPICY_DARE_DECK_ID ||
    (SPICY_DARE_LEGACY_IDS as readonly string[]).includes(id)
  );
}

export const SPICY_DARES: SpicyDare[] = [
  {
    id: "sd-1",
    text: "Take one photo of them they are not allowed to see until later tonight. Lighting has to be flattering on purpose.",
    categories: ["Film & Photo", "Quick & Playful"],
  },
  {
    id: "sd-2",
    text: "Record a 15-second voice note of what you want to do to them — send it while they are in another room.",
    categories: ["Film & Photo", "Roleplay & Teasing"],
  },
  {
    id: "sd-3",
    text: "Film a slow undress from the neck down. No faces. Watch it together before anything else happens.",
    categories: ["Film & Photo"],
  },
  {
    id: "sd-4",
    text: "Set a lamp, a candle, or phone torch and shoot three stills of their body you actually like. Show them one.",
    categories: ["Film & Photo", "Sensory & Touch"],
  },
  {
    id: "sd-5",
    text: "Take a mirror photo together that you would never post. Keep it in a locked album.",
    categories: ["Film & Photo", "Location & Adventure"],
  },
  {
    id: "sd-6",
    text: "Send a photo mid-day with one piece of clothing already gone, no caption except a time.",
    categories: ["Film & Photo", "Roleplay & Teasing", "Quick & Playful"],
  },
  {
    id: "sd-7",
    text: "Blindfold them. Use three different textures on their skin. They guess. Wrong guess means you linger.",
    categories: ["Toys & Accessories", "Sensory & Touch"],
  },
  {
    id: "sd-8",
    text: "Put a toy or accessory on the bed as the only instruction. No talking for the first five minutes.",
    categories: ["Toys & Accessories", "Quick & Playful"],
  },
  {
    id: "sd-9",
    text: "Ice cube or warm mug — pick one. Trace it until they say stay or stop.",
    categories: ["Toys & Accessories", "Sensory & Touch"],
  },
  {
    id: "sd-10",
    text: "Tie or hold their wrists with something soft. You decide the pace. They decide the word that ends it.",
    categories: ["Toys & Accessories", "Roleplay & Teasing"],
  },
  {
    id: "sd-11",
    text: "Headphones in. Play one song. Touch only to the beat. When it ends, you stop.",
    categories: ["Toys & Accessories", "Sensory & Touch", "Quick & Playful"],
  },
  {
    id: "sd-12",
    text: "Pick a toy you have not used in a while. The other person names how it gets used tonight.",
    categories: ["Toys & Accessories"],
  },
  {
    id: "sd-13",
    text: "Text them one explicit instruction they have to follow in public without anyone noticing.",
    categories: ["Roleplay & Teasing", "Location & Adventure"],
  },
  {
    id: "sd-14",
    text: "For the next hour they call you a name you choose. Stay in it even when you laugh.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-15",
    text: "Send three daytime texts that get filthier. The last one names a time you will make it real.",
    categories: ["Roleplay & Teasing", "Quick & Playful"],
  },
  {
    id: "sd-16",
    text: "You are in charge from the first kiss until they ask to switch. No asking 'is this okay' unless they use the stop word.",
    categories: ["Roleplay & Teasing", "Sensory & Touch"],
  },
  {
    id: "sd-17",
    text: "Whisper what you are about to do before you do it. Do not skip the sentence.",
    categories: ["Roleplay & Teasing", "Quick & Playful"],
  },
  {
    id: "sd-18",
    text: "Act like you just met. Pick them up in your own kitchen. Take them 'home'.",
    categories: ["Roleplay & Teasing", "Location & Adventure"],
  },
  {
    id: "sd-19",
    text: "A full slow massage with a rule: no sex until they ask twice.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-20",
    text: "Mouth only, ten minutes, no hands. Timer on the nightstand.",
    categories: ["Sensory & Touch", "Quick & Playful"],
  },
  {
    id: "sd-21",
    text: "Kiss every place you usually skip. Name them as you go.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-22",
    text: "Temperature play: shower hot, then cooler hands. Stay until their breathing changes.",
    categories: ["Sensory & Touch", "Location & Adventure"],
  },
  {
    id: "sd-23",
    text: "Hold eye contact for one whole song while you touch them. If you look away, start the song over.",
    categories: ["Sensory & Touch", "Roleplay & Teasing"],
  },
  {
    id: "sd-24",
    text: "Use only your mouth and breath on their neck and chest until they pull you in.",
    categories: ["Sensory & Touch", "Quick & Playful"],
  },
  {
    id: "sd-25",
    text: "Start in a room you do not usually use. Finish wherever you end up.",
    categories: ["Location & Adventure"],
  },
  {
    id: "sd-26",
    text: "Against a closed door. Clothes stay mostly on until someone begs.",
    categories: ["Location & Adventure", "Quick & Playful"],
  },
  {
    id: "sd-27",
    text: "Parked car, driveway or quiet street. Ten minutes. Then you go inside like nothing happened.",
    categories: ["Location & Adventure", "Quick & Playful"],
  },
  {
    id: "sd-28",
    text: "Shower together with a rule: one of you does not get to touch themselves. The other one does the work.",
    categories: ["Location & Adventure", "Sensory & Touch"],
  },
  {
    id: "sd-29",
    text: "Couch first. Bed is only if you both still want more after.",
    categories: ["Location & Adventure"],
  },
  {
    id: "sd-30",
    text: "Go for a walk. At some point pull them somewhere slightly too public and kiss like you mean it.",
    categories: ["Location & Adventure", "Roleplay & Teasing"],
  },
  {
    id: "sd-31",
    text: "Five-minute timer. Get them as close as you can. Stop on zero. Decide together whether to start it again.",
    categories: ["Quick & Playful", "Sensory & Touch"],
  },
  {
    id: "sd-32",
    text: "Strip race. Loser gives a three-minute lap sit with no kissing.",
    categories: ["Quick & Playful"],
  },
  {
    id: "sd-33",
    text: "They pick a number 1 to 10. That many slow strokes or kisses. Then you ask if they want the next ten.",
    categories: ["Quick & Playful", "Sensory & Touch"],
  },
  {
    id: "sd-34",
    text: "One song, standing up. Grind, kiss, or both. When the song ends, freeze for a count of five.",
    categories: ["Quick & Playful"],
  },
  {
    id: "sd-35",
    text: "Dare them to keep a straight face while you touch them under a blanket during a show.",
    categories: ["Quick & Playful", "Roleplay & Teasing"],
  },
  {
    id: "sd-36",
    text: "Write a one-line dare on a note. Put it in their pocket. They have to do it before bed.",
    categories: ["Quick & Playful", "Roleplay & Teasing"],
  },
  {
    id: "sd-37",
    text: "Take a photo of your hand on them that only they would recognize. Send it with no context.",
    categories: ["Film & Photo", "Quick & Playful"],
  },
  {
    id: "sd-38",
    text: "Video the two of you kissing until it stops being polite. Watch the last ten seconds together.",
    categories: ["Film & Photo", "Sensory & Touch"],
  },
  {
    id: "sd-39",
    text: "Wear or hold one accessory they chose. You do not take it off until they say so.",
    categories: ["Toys & Accessories", "Roleplay & Teasing"],
  },
  {
    id: "sd-40",
    text: "Feather, nail, or ice. Two minutes each. They rank them. Winner gets used again.",
    categories: ["Toys & Accessories", "Sensory & Touch", "Quick & Playful"],
  },
  {
    id: "sd-41",
    text: "Give them a job for the evening: they ask, you do. They only get three asks.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-42",
    text: "Tease them in a doorway every time they walk through it tonight. No follow-through until the last one.",
    categories: ["Roleplay & Teasing", "Location & Adventure"],
  },
  {
    id: "sd-43",
    text: "Oil or lotion, lights low. One of you is not allowed to rush. The other one is not allowed to help.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-44",
    text: "Bite, then soothe, on a place they name. Twice.",
    categories: ["Sensory & Touch", "Quick & Playful"],
  },
  {
    id: "sd-45",
    text: "Kitchen counter or washing machine. Something that hums is a bonus.",
    categories: ["Location & Adventure"],
  },
  {
    id: "sd-46",
    text: "Outside after dark, coats on. Hands only. Back inside before anyone sees.",
    categories: ["Location & Adventure", "Quick & Playful"],
  },
  {
    id: "sd-47",
    text: "A 60-second dare: get them making a sound. If you fail, they get 60 seconds on you.",
    categories: ["Quick & Playful"],
  },
  {
    id: "sd-48",
    text: "Swap who usually starts. The usual starter is not allowed to initiate — only answer.",
    categories: ["Roleplay & Teasing", "Quick & Playful"],
  },
  {
    id: "sd-49",
    text: "Film a slow kiss from the neck down. Stop before it gets explicit. Save it for later.",
    categories: ["Film & Photo", "Sensory & Touch"],
  },
  {
    id: "sd-50",
    text: "Put the toy on a timer they cannot see. They find out when it starts.",
    categories: ["Toys & Accessories", "Quick & Playful"],
  },
  {
    id: "sd-51",
    text: "Text them a role they have to stay in until they get home — even in the grocery line.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-52",
    text: "Trace their outline with one finger, never lifting, until they ask you to stop or keep going.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-53",
    text: "Take them somewhere you have never been intimate and kiss them like you might get caught.",
    categories: ["Location & Adventure"],
  },
  {
    id: "sd-54",
    text: "Ninety-second dare: they pick a body part. You have that long to make it their favorite.",
    categories: ["Quick & Playful", "Sensory & Touch"],
  },
  {
    id: "sd-55",
    text: "Send a photo of the outfit you will take off later. Nothing else — let them wait.",
    categories: ["Film & Photo", "Roleplay & Teasing"],
  },
  {
    id: "sd-56",
    text: "Lay out three toys. They pick one without looking. You commit to using it.",
    categories: ["Toys & Accessories", "Quick & Playful"],
  },
  {
    id: "sd-57",
    text: "Write a scene on a note they find later. Play it out as written, no improvising the first round.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-58",
    text: "Warm oil, slow hands, no talking. If they speak, start the massage over.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-59",
    text: "Meet them at the door already ready. Location is the hallway until you both agree to move.",
    categories: ["Location & Adventure", "Quick & Playful"],
  },
  {
    id: "sd-60",
    text: "Coin flip: winner names a five-minute dare. Loser does it immediately.",
    categories: ["Quick & Playful"],
  },
];

export const SPICY_DARES_CATEGORIES = SPICY_DARE_CATEGORIES;

export function dareById(id: string): SpicyDare | null {
  return SPICY_DARES.find((row) => row.id === id) ?? null;
}

export function daresInCategory(tag: SpicyDareCategory | "all"): SpicyDare[] {
  if (tag === "all") return SPICY_DARES;
  return SPICY_DARES.filter((row) => row.categories.includes(tag));
}

export function withPlayStatus(playedIds: string[]): SpicyDare[] {
  const played = new Set(playedIds);
  return SPICY_DARES.map((row) => ({
    ...row,
    status: played.has(row.id) ? "played" : "unplayed",
  }));
}

export function dueAtForTimeframe(
  timeframe: DareTimeframe | UseTimingId | string,
  customWhen?: string | null,
  now = new Date()
): string | null {
  return expiresAtForTiming(timeframe, customWhen, now);
}

export function defaultDareDateTime(now = new Date()): string {
  const next = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  next.setMinutes(0, 0, 0);
  return toLocalDateTimeValue(next);
}

export const formatDareDueAt = formatExactWhen;
export { parseLocalDateTime, toLocalDateTimeValue };

export function timeframeLabel(
  timeframe: DareTimeframe | string,
  customWhen?: string | null,
  dueAt?: string | null
): string {
  return timingSummary(timeframe, dueAt, customWhen);
}

export function directionLabel(direction: DareDirection): string {
  return direction === "i-do-you" ? "I'll do this to you" : "You do this to me";
}
