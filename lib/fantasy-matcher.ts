import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type FantasyIcon = ComponentProps<typeof Ionicons>["name"];

export type FantasyCategoryId =
  | "oral"
  | "anal"
  | "toys"
  | "film"
  | "group"
  | "power"
  | "impact"
  | "places"
  | "watch"
  | "body";

export type FantasyIdea = {
  id: string;
  title: string;
  category: FantasyCategoryId;
};

export type FantasyCategory = {
  id: FantasyCategoryId;
  label: string;
  tint: string;
  icon: FantasyIcon;
};

export const FANTASY_CATEGORIES: FantasyCategory[] = [
  { id: "oral", label: "Oral", tint: "#FF6B9A", icon: "happy-outline" },
  { id: "anal", label: "Anal", tint: "#C084FC", icon: "flash-outline" },
  { id: "toys", label: "Toys", tint: "#F0A46A", icon: "cube-outline" },
  { id: "film", label: "Film", tint: "#5B8CFF", icon: "videocam-outline" },
  { id: "group", label: "Others", tint: "#FB7185", icon: "people-outline" },
  { id: "power", label: "Power", tint: "#FF5C7A", icon: "lock-closed-outline" },
  { id: "impact", label: "Impact", tint: "#E11D48", icon: "thunderstorm-outline" },
  { id: "places", label: "Places", tint: "#3ECFBF", icon: "location-outline" },
  { id: "watch", label: "Watch", tint: "#E4C37A", icon: "eye-outline" },
  { id: "body", label: "Body", tint: "#F472B6", icon: "heart-outline" },
];

const SHORTS: [string, string, FantasyCategoryId][] = [
  ["oral-f", "Head on F", "oral"],
  ["oral-m", "Head on M", "oral"],
  ["oral-69", "69", "oral"],
  ["oral-facesit", "Face sitting", "oral"],
  ["oral-deep-m", "Deep throat on M", "oral"],
  ["oral-slow-m", "Slow head on M", "oral"],
  ["oral-fast-f", "Fast head on F", "oral"],
  ["oral-morning-m", "Morning head on M", "oral"],
  ["oral-wake-f", "Wake her with oral", "oral"],
  ["oral-wall", "Oral against the wall", "oral"],
  ["oral-bed-edge", "Oral on the edge of the bed", "oral"],
  ["oral-stand", "Oral while they stand", "oral"],
  ["oral-mirror", "Oral in the mirror", "oral"],
  ["oral-handsfree-m", "Hands-free head on M", "oral"],
  ["oral-tease", "Tease-only oral", "oral"],
  ["oral-shower", "Oral after a shower", "oral"],
  ["oral-car", "Oral in the car", "oral"],
  ["oral-tv", "Oral while they watch TV", "oral"],
  ["oral-ice", "Ice-and-warm oral", "oral"],
  ["oral-beg", "Oral until they beg", "oral"],
  ["oral-swallow", "Swallow", "oral"],
  ["oral-finish-her-tongue", "Finish on her tongue", "oral"],
  ["oral-finish-his-tongue", "Finish on his tongue", "oral"],
  ["oral-vibe-f", "Oral with a vibe on F", "oral"],
  ["oral-tied-f", "Oral while F is tied", "oral"],
  ["oral-tied-m", "Oral while M is tied", "oral"],
  ["oral-sloppy-m", "Sloppy head on M", "oral"],
  ["oral-gentle-f", "Gentle oral on F", "oral"],
  ["oral-all-night", "Oral as the whole night", "oral"],
  ["oral-eye-contact", "Eye-contact oral", "oral"],

  ["anal-f", "Anal on F", "anal"],
  ["anal-m", "Anal on M", "anal"],
  ["anal-finger-f", "First finger in F", "anal"],
  ["anal-finger-m", "First finger in M", "anal"],
  ["anal-plug-f-sex", "Plug in F during sex", "anal"],
  ["anal-plug-m-sex", "Plug in M during sex", "anal"],
  ["anal-behind-f", "Anal from behind on F", "anal"],
  ["anal-f-on-top", "Anal on F, her on top", "anal"],
  ["anal-slow-f", "Slow anal on F", "anal"],
  ["anal-slow-m", "Slow anal on M", "anal"],
  ["anal-lube", "Anal with lots of lube", "anal"],
  ["anal-after-oral", "Anal after oral", "anal"],
  ["anal-shower", "Anal in the shower", "anal"],
  ["anal-tied-f", "Anal while F is tied", "anal"],
  ["anal-tied-m", "Anal while M is tied", "anal"],
  ["anal-strap-m", "Strap-on on M", "anal"],
  ["anal-strap-f", "Strap-on on F", "anal"],
  ["anal-training", "Anal training night", "anal"],
  ["anal-only", "Anal-only night", "anal"],
  ["anal-toy-first", "Anal with a toy first", "anal"],
  ["anal-rim-f", "Rimming F", "anal"],
  ["anal-rim-m", "Rimming M", "anal"],
  ["anal-mirror", "Anal in front of a mirror", "anal"],
  ["anal-then-vag", "Anal then vaginal", "anal"],
  ["anal-vag-then", "Vaginal then anal", "anal"],
  ["anal-floor", "Anal on the floor", "anal"],
  ["anal-counter", "Anal against the counter", "anal"],
  ["anal-prostate", "Prostate play", "anal"],
  ["anal-talk", "Anal with dirty talk", "anal"],
  ["anal-reward", "Anal as a reward", "anal"],

  ["toy-f-during", "Toy on F during sex", "toys"],
  ["toy-vibe-fuck", "Vibe on F while he fucks her", "toys"],
  ["toy-wand-f", "Wand on F", "toys"],
  ["toy-dildo-f", "Dildo on F", "toys"],
  ["toy-rabbit", "Rabbit toy", "toys"],
  ["toy-sleeve-m", "Sleeve toy on M", "toys"],
  ["toy-cock-ring", "Cock ring", "toys"],
  ["toy-remote-public", "Remote vibe in public", "toys"],
  ["toy-remote-dinner", "Remote vibe at dinner", "toys"],
  ["toy-porn", "Toy while watching porn", "toys"],
  ["toy-two-f", "Two toys on F", "toys"],
  ["toy-mouth", "Toy in her mouth", "toys"],
  ["toy-tied-f", "Toy while she's tied", "toys"],
  ["toy-tied-m", "Toy while he's tied", "toys"],
  ["toy-together", "Shared couple vibe", "toys"],
  ["toy-prostate-m", "Prostate toy on M", "toys"],
  ["toy-beads-f", "Anal beads on F", "toys"],
  ["toy-beads-m", "Anal beads on M", "toys"],
  ["toy-race", "Toy race — who finishes first", "toys"],
  ["toy-strap-him", "She fucks him with a strap", "toys"],
  ["toy-he-only", "He uses a toy on her only", "toys"],
  ["toy-she-show", "She uses a toy, he watches", "toys"],
  ["toy-he-show", "He uses a toy, she watches", "toys"],
  ["toy-table", "Toy under the table", "toys"],
  ["toy-bullet", "Bullet vibe on her clit", "toys"],
  ["toy-glass", "Glass toy", "toys"],
  ["toy-app", "App-controlled toy", "toys"],
  ["toy-warmup", "Toy as a warm-up", "toys"],
  ["toy-no-hands", "Toy instead of hands", "toys"],
  ["toy-finish", "Finish with a toy", "toys"],

  ["film-head-f", "Film head on F", "film"],
  ["film-head-m", "Film head on M", "film"],
  ["film-sex", "Film us having sex", "film"],
  ["film-her-top", "Film her on top", "film"],
  ["film-behind", "Film from behind", "film"],
  ["film-close", "Film a close-up", "film"],
  ["film-mirror", "Film in the mirror", "film"],
  ["film-shower", "Film a shower", "film"],
  ["film-photo-her", "Photo her body", "film"],
  ["film-photo-him", "Photo his body", "film"],
  ["film-voice", "Voice-note the night", "film"],
  ["film-replay", "Replay last time's video", "film"],
  ["film-toys", "Film a toy session", "film"],
  ["film-60", "Film 60 seconds only", "film"],
  ["film-her-face", "Film her face when she comes", "film"],
  ["film-his-face", "Film his face when he comes", "film"],
  ["film-tripod", "Phone on a tripod", "film"],
  ["film-one-photo", "One photo after", "film"],
  ["film-polaroid", "Polaroid then hide it", "film"],
  ["film-strip", "Film a strip", "film"],
  ["film-hands", "Film hands only", "film"],
  ["film-legs", "Film legs and feet", "film"],
  ["film-ride", "Film her riding", "film"],
  ["film-him-down", "Film him going down", "film"],
  ["film-quickie", "Film a quickie", "film"],
  ["film-watch-us", "Watch our own tape", "film"],
  ["film-delete", "Delete after watching", "film"],
  ["film-keep", "Keep one favorite clip", "film"],
  ["film-lights", "Film with the lights on", "film"],
  ["film-lingerie", "Film in lingerie", "film"],

  ["group-three", "Threesome", "group"],
  ["group-ffm", "Threesome with another woman", "group"],
  ["group-mmf", "Threesome with another man", "group"],
  ["group-swap", "Couple swap", "group"],
  ["group-soft-swap", "Soft swap — kiss and touch only", "group"],
  ["group-watch-couple", "Watch another couple", "group"],
  ["group-watched", "Be watched by a couple", "group"],
  ["group-same-room", "Same-room swap", "group"],
  ["group-sep-rooms", "Separate-rooms swap", "group"],
  ["group-mfm", "MFM", "group"],
  ["group-fmf", "FMF", "group"],
  ["group-hotwife", "Hotwife", "group"],
  ["group-cuckold", "Cuckold watch", "group"],
  ["group-she-woman", "She plays with another woman", "group"],
  ["group-he-man", "He plays with another man", "group"],
  ["group-third-watch", "Invite a third to watch only", "group"],
  ["group-third-oral", "Invite a third to join oral", "group"],
  ["group-club", "Club playroom", "group"],
  ["group-hotel", "Hotel with another couple", "group"],
  ["group-text-third", "Text a third together", "group"],
  ["group-pick-photos", "Pick a third from photos", "group"],
  ["group-unicorn", "Unicorn night", "group"],
  ["group-full-swap", "Full swap", "group"],
  ["group-kiss-else", "Kiss someone else in front of me", "group"],
  ["group-hands-else", "Hands on someone else in front of me", "group"],
  ["group-she-directs", "She directs him with a third", "group"],
  ["group-he-directs", "He directs her with a third", "group"],
  ["group-aftercare-3", "Aftercare with three", "group"],
  ["group-blind-who", "Blindfold — don't know who", "group"],
  ["group-fake-third", "Roleplay a third — just us", "group"],

  ["pow-tied", "Tied up", "power"],
  ["pow-tied-f", "She tied up", "power"],
  ["pow-tied-m", "He tied up", "power"],
  ["pow-wrists-bed", "Wrists to the bed", "power"],
  ["pow-spread", "Spread and tied", "power"],
  ["pow-collar-f", "Collar on F", "power"],
  ["pow-collar-m", "Collar on M", "power"],
  ["pow-leash-house", "Leash in the house", "power"],
  ["pow-gag", "Gag", "power"],
  ["pow-blindfold", "Blindfold", "power"],
  ["pow-she-charge", "She in charge all night", "power"],
  ["pow-he-charge", "He in charge all night", "power"],
  ["pow-ask-come", "Ask permission to come", "power"],
  ["pow-orgasm-ctrl", "Orgasm control", "power"],
  ["pow-edge", "Edging until they shake", "power"],
  ["pow-beg", "Beg for it", "power"],
  ["pow-orders", "Orders only, no asking", "power"],
  ["pow-kneel", "Kneel", "power"],
  ["pow-all-fours", "On all fours and wait", "power"],
  ["pow-hair", "Hair pulling", "power"],
  ["pow-throat", "Hand on throat (safe)", "power"],
  ["pow-spank", "Spanking", "power"],
  ["pow-otk", "Over the knee", "power"],
  ["pow-names", "Name-calling (hot)", "power"],
  ["pow-praise", "Praise only", "power"],
  ["pow-service", "Service — they get nothing first", "power"],
  ["pow-tied-tease", "Tied and teased", "power"],
  ["pow-tied-used", "Tied and used", "power"],
  ["pow-free-use", "Free use for an hour", "power"],
  ["pow-safeword", "Safe word practice first", "power"],

  ["imp-whipped", "Whipped", "impact"],
  ["imp-crop-f", "Crop on F", "impact"],
  ["imp-crop-m", "Crop on M", "impact"],
  ["imp-paddle", "Paddle", "impact"],
  ["imp-belt", "Belt (light)", "impact"],
  ["imp-hairbrush", "Hairbrush spanking", "impact"],
  ["imp-slap-ass", "Slapped ass", "impact"],
  ["imp-slap-face", "Slapped face (consensual)", "impact"],
  ["imp-flogged", "Flogged", "impact"],
  ["imp-cane", "Cane lines", "impact"],
  ["imp-then-sex", "Impact then sex", "impact"],
  ["imp-then-oral", "Impact then oral", "impact"],
  ["imp-count", "Count the hits", "impact"],
  ["imp-marks", "Marks that last tomorrow", "impact"],
  ["imp-ice", "Ice after impact", "impact"],
  ["imp-warmup", "Warm-up spanking", "impact"],
  ["imp-harder-moan", "Harder if they moan", "impact"],
  ["imp-harder-quiet", "Harder if they stay quiet", "impact"],
  ["imp-thighs", "Impact on thighs", "impact"],
  ["imp-riding", "Impact while riding", "impact"],
  ["imp-tied", "Impact while tied", "impact"],
  ["imp-she-whips", "She whips him", "impact"],
  ["imp-he-whips", "He whips her", "impact"],
  ["imp-heels-crop", "Riding crop in heels", "impact"],
  ["imp-spoon", "Wooden spoon", "impact"],
  ["imp-hands", "Bare-hand only", "impact"],
  ["imp-punish", "Impact as punishment", "impact"],
  ["imp-gift", "Impact as a gift", "impact"],
  ["imp-oil", "Aftercare oil", "impact"],
  ["imp-mirror", "Show the marks in the mirror", "impact"],

  ["plc-counter", "Kitchen counter", "places"],
  ["plc-shower", "Shower", "places"],
  ["plc-wall", "Against the wall", "places"],
  ["plc-floor", "On the floor", "places"],
  ["plc-couch", "Couch", "places"],
  ["plc-car", "Car", "places"],
  ["plc-driveway", "Driveway", "places"],
  ["plc-hotel", "Hotel", "places"],
  ["plc-balcony", "Balcony", "places"],
  ["plc-woods", "Woods", "places"],
  ["plc-beach", "Beach at night", "places"],
  ["plc-changing", "Changing room", "places"],
  ["plc-cinema", "Cinema back row", "places"],
  ["plc-office", "Office after hours", "places"],
  ["plc-elevator", "Elevator risk", "places"],
  ["plc-stairs", "Stairs", "places"],
  ["plc-alley", "Alley (quick)", "places"],
  ["plc-pool", "Pool", "places"],
  ["plc-hottub", "Hot tub", "places"],
  ["plc-tent", "Tent", "places"],
  ["plc-guest", "Guest room", "places"],
  ["plc-window", "In front of a window", "places"],
  ["plc-washer", "On the washing machine", "places"],
  ["plc-desk", "Desk", "places"],
  ["plc-bar-bath", "Bar bathroom", "places"],
  ["plc-lookout", "Parked lookout", "places"],
  ["plc-cabin", "Cabin", "places"],
  ["plc-plane", "Plane fantasy", "places"],
  ["plc-train", "Train toilet fantasy", "places"],
  ["plc-roof", "Roof / fire escape", "places"],

  ["wat-toy-her", "Watch her with a toy", "watch"],
  ["wat-toy-him", "Watch him with a toy", "watch"],
  ["wat-her-hands", "Watch her touch herself", "watch"],
  ["wat-him-hands", "Watch him touch himself", "watch"],
  ["wat-her-else", "He watches her with someone (fantasy)", "watch"],
  ["wat-him-else", "She watches him with someone (fantasy)", "watch"],
  ["wat-mirror", "Mirror the whole time", "watch"],
  ["wat-window", "Window open a crack", "watch"],
  ["wat-lights", "Lights on, eyes open", "watch"],
  ["wat-she-show", "She puts on a show", "watch"],
  ["wat-he-show", "He puts on a show", "watch"],
  ["wat-strip", "Striptease", "watch"],
  ["wat-lap", "Lap dance", "watch"],
  ["wat-porn-us", "Porn on while we do it", "watch"],
  ["wat-porn-her", "Porn she picked", "watch"],
  ["wat-porn-him", "Porn he picked", "watch"],
  ["wat-finish", "Watch each other finish", "watch"],
  ["wat-no-touch", "No touching — watch only", "watch"],
  ["wat-doorway", "Peek from the doorway", "watch"],
  ["wat-catch", "Catch them starting", "watch"],
  ["wat-exhibit", "Exhibitionist — someone could see", "watch"],
  ["wat-almost", "Almost-caught", "watch"],
  ["wat-replay-now", "Record then watch immediately", "watch"],
  ["wat-mutual", "Mutual masturbation", "watch"],
  ["wat-she-talks", "She talks him through it", "watch"],
  ["wat-he-talks", "He talks her through it", "watch"],
  ["wat-hotel-mirror", "Watch in a hotel mirror", "watch"],
  ["wat-dress", "Watch her get dressed after", "watch"],
  ["wat-hard", "Watch him get hard", "watch"],
  ["wat-eyes-come", "Eyes on them when they come", "watch"],

  ["bod-chest-her", "Finish on her chest", "body"],
  ["bod-face-her", "Finish on her face", "body"],
  ["bod-chest-him", "Finish on his chest", "body"],
  ["bod-inside-f", "Finish inside F", "body"],
  ["bod-inside-m", "Finish inside M (anal)", "body"],
  ["bod-creampie", "Creampie", "body"],
  ["bod-keep-going", "Creampie then keep going", "body"],
  ["bod-breasts", "Between her breasts", "body"],
  ["bod-feet", "Feet", "body"],
  ["bod-hair-sex", "Hair pulling + sex", "body"],
  ["bod-neck", "Neck kissing only first", "body"],
  ["bod-bites", "Bite marks", "body"],
  ["bod-hickeys", "Hickeys", "body"],
  ["bod-scratch-him", "Scratch his back", "body"],
  ["bod-scratch-her", "Scratch her back", "body"],
  ["bod-oil", "Oil everywhere", "body"],
  ["bod-massage", "Massage into sex", "body"],
  ["bod-outer", "Outercourse only", "body"],
  ["bod-grind", "Grinding clothed", "body"],
  ["bod-dry", "Dry hump then strip", "body"],
  ["bod-morning", "Morning sex", "body"],
  ["bod-quickie", "Quickie", "body"],
  ["bod-marathon", "Marathon", "body"],
  ["bod-slow-mean", "Slow and mean", "body"],
  ["bod-fast-messy", "Fast and messy", "body"],
  ["bod-stand", "Standing up", "body"],
  ["bod-her-top", "Her on top", "body"],
  ["bod-behind", "From behind", "body"],
  ["bod-missionary", "Missionary, deep", "body"],
  ["bod-fridge", "Against the fridge", "body"],
];

export const FANTASY_IDEAS: FantasyIdea[] = SHORTS.map(([id, title, category]) => ({
  id: `fx-${id}`,
  title,
  category,
}));

export function fantasyById(id: string): FantasyIdea | null {
  return FANTASY_IDEAS.find((item) => item.id === id) ?? null;
}

export function fantasyCategoryMeta(id: FantasyCategoryId): FantasyCategory {
  return (
    FANTASY_CATEGORIES.find((item) => item.id === id) ?? FANTASY_CATEGORIES[0]
  );
}

function seededRand(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], rand: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

/** Leftover cards, mixed across categories so the deck is not oral-then-anal. */
export function leftoverFantasies(
  seenIds: Iterable<string>,
  seed = "deck"
): FantasyIdea[] {
  const seen = new Set(seenIds);
  const leftover = FANTASY_IDEAS.filter((idea) => !seen.has(idea.id));
  const rand = seededRand(seed);
  const piles = shuffleInPlace([...FANTASY_CATEGORIES], rand)
    .map((category) =>
      shuffleInPlace(
        leftover.filter((idea) => idea.category === category.id),
        rand
      )
    )
    .filter((pile) => pile.length > 0);

  const mixed: FantasyIdea[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const pile of piles) {
      const next = pile.shift();
      if (next) {
        mixed.push(next);
        added = true;
      }
    }
  }
  return mixed;
}

export function personalizeFantasyTitle(
  title: string,
  cast: { f: string; m: string }
): string {
  return title
    .replace(/\bF's\b/g, `${cast.f}'s`)
    .replace(/\bM's\b/g, `${cast.m}'s`)
    .replace(/\bF\b/g, cast.f)
    .replace(/\bM\b/g, cast.m)
    .replace(/\bshe's\b/gi, `${cast.f}'s`)
    .replace(/\bhe's\b/gi, `${cast.m}'s`)
    .replace(
      /\bher\s+(tongue|body|clit|mouth|chest|face|breasts|back)\b/gi,
      `${cast.f}'s $1`
    )
    .replace(
      /\bhis\s+(tongue|body|chest|face|back)\b/gi,
      `${cast.m}'s $1`
    )
    .replace(/\bShe\b/g, cast.f)
    .replace(/\bHe\b/g, cast.m)
    .replace(/\bshe\b/g, cast.f)
    .replace(/\bhe\b/g, cast.m)
    .replace(/\bher\b/g, cast.f)
    .replace(/\bhim\b/g, cast.m)
    .replace(/\bhis\b/g, `${cast.m}'s`);
}

export function groupFantasiesByCategory(ideas: FantasyIdea[]): {
  category: FantasyCategory;
  items: FantasyIdea[];
}[] {
  return FANTASY_CATEGORIES.map((category) => ({
    category,
    items: ideas.filter((idea) => idea.category === category.id),
  })).filter((row) => row.items.length > 0);
}

/** Deterministic subset of idea ids a demo partner "already liked". */
export function demoLikedFantasyIds(): string[] {
  return FANTASY_IDEAS.filter((_, index) => index % 3 === 0).map(
    (item) => item.id
  );
}
