import type { Card, CardStage } from "@/lib/types";

export type SpicyFlavorTag = {
  id: string;
  stage: CardStage;
  label: string;
  /** Lowercase needles — card title+body match if any hit. Empty = catch-all for unmatched. */
  keywords: string[];
  catchAll?: boolean;
};

function tag(
  stage: CardStage,
  key: string,
  label: string,
  keywords: string[],
  catchAll = false
): SpicyFlavorTag {
  return {
    id: `${stage}:${key}`,
    stage,
    label,
    keywords,
    catchAll,
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Phrase needles use includes(); single tokens require a word-ish boundary so
 * "bra" does not match "embrace" and "ear" does not match "heart" / "wear".
 */
export function matchesKeywords(text: string, keywords: string[]): boolean {
  return keywords.some((needle) => {
    const n = needle.toLowerCase().trim();
    if (!n) return false;
    if (n.includes(" ")) return text.includes(n);
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(n)}([^a-z0-9]|$)`, "i");
    return re.test(text);
  });
}

/** Flavors shown as checkboxes when creating a Get Spicy game. */
export const SPICY_FLAVOR_TAGS: SpicyFlavorTag[] = [
  // Stage 1 — Pre-Foreplay
  tag("pre_foreplay", "together", "At home together", [
    "same room",
    "face to face",
    "face-to-face",
    "in person",
    "home",
    "arrive",
    "door",
    "ear",
    "earlobe",
    "kiss",
    "hug",
    "embrace",
    "behind them",
    "standing close",
    "stand close",
    "stand next",
    "stand face",
    "close behind",
    "from behind",
    "neck",
    "cheek",
    "thigh",
    "lap",
    "lips",
    "collarbone",
    "into their ear",
    "next to their ear",
    "against their ear",
    "hold hands",
    "hand on",
    "fingers through",
    "sway",
    "pulse",
    "heartbeat",
    "walk up",
    "sit on",
    "sit next",
    "standing together",
    "whisper",
    "nibble",
    "bite",
    "graze",
    "pocket",
    "forearm",
    "waist",
    "hip",
    "shoulder",
    "knee",
    "couch",
    "foot rub",
    "eyes",
    "eye contact",
    "wink",
    "palm",
    "wrist",
    "massage",
    "on your knees",
    "hips touch",
    "without touching",
    "close their eyes",
    "side of their face",
    "look {partner}",
    "catch {partner}'s eye",
    "the look",
  ]),
  tag("pre_foreplay", "apart", "Away from each other", [
    "text",
    "voice note",
    "voice message",
    "send a",
    "at work",
    "commute",
    "while you are apart",
    "away from each other",
  ]),
  tag("pre_foreplay", "digital", "Digital & texting", [
    "text",
    "voice note",
    "voice message",
    "emoji",
    "keyword",
    "send a",
    "photo",
    "video",
    "picture",
    "selfie",
  ]),
  tag("pre_foreplay", "film", "Film & photo", [
    "photo",
    "video",
    "picture",
    "pic",
    "selfie",
    "film",
    "camera",
  ]),
  tag("pre_foreplay", "dress", "Dress & attire", [
    "wear",
    "wearing",
    "outfit",
    "lingerie",
    "underwear",
    "clothing",
    "clothes",
    "garment",
    "dress",
    "strip",
    "bra",
    "unbutton",
    "unzip",
  ]),
  tag("pre_foreplay", "atmosphere", "Atmosphere & ambience", [
    "candle",
    "candlelight",
    "music",
    "song",
    "soundtrack",
    "light",
    "lighting",
    "dim",
    "playlist",
    "ambience",
    "lamp",
    "lamps",
  ]),
  tag("pre_foreplay", "timer", "Timers & countdowns", [
    "timer",
    "countdown",
    "clock",
    "minutes",
    "tonight at",
    "schedule",
    "for the next",
  ]),
  tag("pre_foreplay", "open", "Open / mixed tease", [], true),

  // Stage 2 — Foreplay
  tag("foreplay", "kissing", "Kissing & making out", [
    "kiss",
    "make out",
    "lips",
    "mouth",
    "nibble",
  ]),
  tag("foreplay", "sensory", "Sensory & temperature", [
    "ice",
    "blindfold",
    "temperature",
    "oil",
    "warm",
    "cool",
    "feather",
    "silk",
    "scarf",
    "sensory",
    "breath",
  ]),
  tag("foreplay", "toys", "Toys & accessories", [
    "toy",
    "vibrator",
    "accessory",
    "wand",
  ]),
  tag("foreplay", "food", "Food & edible treats", [
    "food",
    "cream",
    "fruit",
    "edible",
    "chocolate",
    "whip",
    "honey",
    "taste",
  ]),
  tag("foreplay", "massage", "Massage & touch", [
    "massage",
    "rub",
    "stroke",
    "touch",
    "fingertip",
    "hands",
    "trace",
  ]),
  tag("foreplay", "roleplay", "Roleplay & power", [
    "role",
    "command",
    "dominant",
    "power",
    "instruction",
    "obey",
    "control",
  ]),
  tag("foreplay", "verbal", "Verbal teasing & dirty talk", [
    "whisper",
    "dirty",
    "talk",
    "tell them",
    "describe",
    "say ",
    "words",
  ]),
  tag("foreplay", "restraints", "Restraints & blindfolds", [
    "blindfold",
    "restrain",
    "tie",
    "belt",
    "pin",
    "hands above",
    "wrists",
  ]),
  tag("foreplay", "oral", "Oral & mouth play", [
    "oral",
    "tongue",
    "suck",
    "lick",
    "mouth",
    "nipple",
  ]),
  tag("foreplay", "anal", "Anal tease", [
    "anal",
    "ass",
    "rim",
    "butt",
  ]),
  tag("foreplay", "spanking", "Spanking & impact", [
    "spank",
    "stinging",
    "slap",
    "inspection",
  ]),
  tag("foreplay", "hair", "Hair pull & grip", [
    "hair",
    "roots",
    "tip their head",
  ]),
  tag("foreplay", "film", "Film & photo", [
    "photo",
    "video",
    "picture",
    "porn",
    "camera",
    "record",
  ]),
  tag("foreplay", "temperature", "Ice & temperature", [
    "ice",
    "hot breath",
    "temperature",
    "ribcage",
  ]),
  tag("foreplay", "open", "Open / mixed foreplay", [], true),

  // Stage 3 — Step It Up
  tag("step_it_up", "penetrative", "Intercourse / penetrative", [
    "enter",
    "penetrat",
    "thrust",
    "intercourse",
    "inside",
    "deeper",
  ]),
  tag("step_it_up", "positions", "Position & style", [
    "position",
    "missionary",
    "cowgirl",
    "doggy",
    "rider",
    "spoons",
    "lotus",
    "prone",
    "standing",
  ]),
  tag("step_it_up", "rooms", "New room / furniture", [
    "shower",
    "couch",
    "rug",
    "kitchen",
    "hallway",
    "wall",
    "dresser",
    "chair",
    "floor",
  ]),
  tag("step_it_up", "adventure", "Spontaneous / adventure", [
    "spontaneous",
    "adventure",
    "public",
    "risk",
    "outside",
    "unexpected",
  ]),
  tag("step_it_up", "slow", "Slow & passionate", [
    "slow",
    "agonizing",
    "unhurried",
    "pace",
    "tease",
  ]),
  tag("step_it_up", "fast", "Fast & intense", [
    "fast",
    "intense",
    "hard",
    "speed",
    "rough",
  ]),
  tag("step_it_up", "visual", "Mirror / visual play", [
    "mirror",
    "watch",
    "visual",
    "eyes locked",
    "look at",
  ]),
  tag("step_it_up", "toys", "Toy integration", [
    "toy",
    "vibrator",
    "wand",
  ]),
  tag("step_it_up", "oral", "Oral escalation", [
    "oral",
    "tongue",
    "mouth",
    "lick",
    "eat",
    "throat",
  ]),
  tag("step_it_up", "anal", "Anal play", [
    "anal",
    "ass",
    "rim",
    "butt",
  ]),
  tag("step_it_up", "film", "Film & photo", [
    "photo",
    "video",
    "picture",
    "camera",
    "record",
    "clip",
  ]),
  tag("step_it_up", "restraints", "Restraints & binding", [
    "tie",
    "bound",
    "scarf",
    "pin",
    "wrists",
    "hands above",
  ]),
  tag("step_it_up", "power", "Commands & control", [
    "command",
    "control",
    "dominant",
    "instruction",
    "edge",
    "pin",
    "dirty",
    "throttle",
    "neck",
  ]),
  tag("step_it_up", "hair", "Hair pull & grip", [
    "hair",
    "fistful",
    "head angle",
  ]),
  tag("step_it_up", "spanking", "Spanking & impact", [
    "spank",
    "timed spanks",
  ]),
  tag("step_it_up", "open", "Open / mixed heat", [], true),

  // Stage 4 — Finish Off
  tag("finish_off", "mutual", "Mutual climax focus", [
    "mutual",
    "together",
    "chest-to-chest",
    "both",
  ]),
  tag("finish_off", "guided", "Guided / controlled / edging", [
    "edge",
    "command",
    "control",
    "order",
    "edging",
    "hold back",
    "vibrator",
    "wand",
    "brink",
  ]),
  tag("finish_off", "oral", "Oral finish", [
    "oral",
    "tongue",
    "mouth",
    "swallow",
    "throat",
    "lips and chin",
  ]),
  tag("finish_off", "toys", "Toy-assisted finish", [
    "toy",
    "vibrator",
    "wand",
  ]),
  tag("finish_off", "anal", "Anal finish", [
    "anal",
    "ass",
    "butt",
  ]),
  tag("finish_off", "creampie", "Creampie / finish inside", [
    "creampie",
    "deep inside",
    "stay completely",
    "finish inside",
    "holding their hips",
  ]),
  tag("finish_off", "body", "Finish on the body", [
    "face",
    "chest",
    "stomach",
    "paint",
    "splash",
    "tribute",
    "cum across",
    "cum over",
    "tits",
  ]),
  tag("finish_off", "manual", "Hands-only / manual", [
    "manual",
    "hand",
    "masturbat",
    "fingers",
  ]),
  tag("finish_off", "positions", "Position finish", [
    "missionary",
    "cowgirl",
    "doggy",
    "spoons",
    "lotus",
    "prone",
    "standing",
    "position",
  ]),
  tag("finish_off", "slow", "Slow-burn finish", [
    "slow",
    "unhurried",
    "gentle",
    "breath",
  ]),
  tag("finish_off", "open", "Open / mixed finish", [], true),

  // Stage 5 — Afterglow
  tag("afterglow", "cuddle", "Deep cuddling & skin-to-skin", [
    "cuddle",
    "snuggle",
    "skin",
    "hold",
    "wrap",
    "lock",
    "embrace",
  ]),
  tag("afterglow", "pillow", "Pillow talk & secrets", [
    "ask",
    "favorite",
    "secret",
    "whisper",
    "talk",
    "query",
    "tell me",
  ]),
  tag("afterglow", "bath", "Warm shower or bath", [
    "shower",
    "bath",
    "towel",
    "clean",
  ]),
  tag("afterglow", "care", "Hydration & snacks", [
    "water",
    "snack",
    "drink",
    "hydrate",
    "bring",
    "glass",
  ]),
  tag("afterglow", "touch", "Gentle scratches & massage", [
    "stroke",
    "scratch",
    "massage",
    "hair",
    "kiss",
    "touch",
    "lotion",
    "oil",
  ]),
  tag("afterglow", "anal", "Ass care after play", [
    "ass",
    "sore",
    "cheeks",
  ]),
  tag("afterglow", "affirm", "Compliments & affirmations", [
    "compliment",
    "thank",
    "beautiful",
    "love",
    "affirm",
    "proud",
    "praise",
    "whisper two",
  ]),
  tag("afterglow", "recap", "Morning-after / recap", [
    "morning",
    "message",
    "recap",
    "favorite moment",
    "tonight",
    "mirror",
    "inspect",
  ]),
  tag("afterglow", "open", "Open / mixed afterglow", [], true),
];

export const ALL_FLAVOR_TAG_IDS = SPICY_FLAVOR_TAGS.map((row) => row.id);

export function flavorTagsForStage(stage: CardStage): SpicyFlavorTag[] {
  return SPICY_FLAVOR_TAGS.filter((row) => row.stage === stage);
}

export function defaultEnabledFlavorTags(): string[] {
  return [...ALL_FLAVOR_TAG_IDS];
}

function cardText(card: Pick<Card, "title" | "body">): string {
  return `${card.title} ${card.body}`.toLowerCase();
}

/** Specific (non catch-all) tag ids this card matches. */
export function specificTagsForCard(card: Pick<Card, "stage" | "title" | "body">): string[] {
  const text = cardText(card);
  return flavorTagsForStage(card.stage)
    .filter((row) => !row.catchAll && matchesKeywords(text, row.keywords))
    .map((row) => row.id);
}

export function tagsForCard(card: Pick<Card, "stage" | "title" | "body">): string[] {
  const specific = specificTagsForCard(card);
  if (specific.length) return specific;
  const catchAll = flavorTagsForStage(card.stage).find((row) => row.catchAll);
  return catchAll ? [catchAll.id] : [];
}

export function normalizeFlavorTags(
  tags?: string[] | null
): string[] {
  if (tags == null) return defaultEnabledFlavorTags();
  const known = new Set(ALL_FLAVOR_TAG_IDS);
  return tags.filter((id) => known.has(id));
}

export function cardAllowedByFlavorTags(
  card: Pick<Card, "stage" | "title" | "body">,
  enabledTagIds: string[] | null | undefined
): boolean {
  // null/undefined = legacy / no filter yet → allow all
  if (enabledTagIds == null) return true;
  if (enabledTagIds.length === 0) return false;
  const enabled = new Set(enabledTagIds);
  return tagsForCard(card).some((id) => enabled.has(id));
}

export function stageHasAnyFlavorEnabled(
  stage: CardStage,
  enabledTagIds: string[]
): boolean {
  const enabled = new Set(enabledTagIds);
  return flavorTagsForStage(stage).some((row) => enabled.has(row.id));
}

export function summarizeFlavorSelection(enabledTagIds: string[]): string {
  const total = ALL_FLAVOR_TAG_IDS.length;
  const n = enabledTagIds.length;
  if (n === total) return "All flavors on";
  if (n === 0) return "No flavors selected";
  return `${n} of ${total} flavors`;
}
