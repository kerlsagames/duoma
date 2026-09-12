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
  ["oral-f", "Go down on F", "oral"],
  ["oral-m", "Give M a blowjob", "oral"],
  ["oral-69", "Sixty-nine — both mouths at once", "oral"],
  ["oral-facesit", "F sits on M's face", "oral"],
  ["oral-deep-m", "F deep-throats M", "oral"],
  ["oral-slow-m", "Slow, teasing blowjob on M", "oral"],
  ["oral-fast-f", "Fast, hungry oral on F", "oral"],
  ["oral-morning-m", "Wake M with a blowjob", "oral"],
  ["oral-wake-f", "Wake F by going down on her", "oral"],
  ["oral-wall", "Go down on them against the wall", "oral"],
  ["oral-bed-edge", "Go down on them sitting on the edge of the bed", "oral"],
  ["oral-stand", "Kneel and go down on them while they stand", "oral"],
  ["oral-mirror", "Go down on them in front of the mirror", "oral"],
  ["oral-handsfree-m", "Blow M with no hands", "oral"],
  ["oral-tease", "Tease with your mouth — don't let them finish yet", "oral"],
  ["oral-shower", "Go down on them after a shower", "oral"],
  ["oral-car", "Give head in the car", "oral"],
  ["oral-tv", "Go down on them while they try to watch TV", "oral"],
  ["oral-ice", "Alternate ice and a warm mouth", "oral"],
  ["oral-beg", "Keep going down on them until they beg", "oral"],
  ["oral-swallow", "Swallow when they cum", "oral"],
  ["oral-finish-her-tongue", "M cums on F's tongue", "oral"],
  ["oral-finish-his-tongue", "F cums on M's tongue", "oral"],
  ["oral-vibe-f", "Go down on F with a vibe on her clit", "oral"],
  ["oral-tied-f", "Go down on F while she's tied", "oral"],
  ["oral-tied-m", "Blow M while he's tied", "oral"],
  ["oral-sloppy-m", "Sloppy, messy blowjob on M", "oral"],
  ["oral-gentle-f", "Soft, slow oral on F", "oral"],
  ["oral-all-night", "Make the whole night just oral", "oral"],
  ["oral-eye-contact", "Go down on them and don't break eye contact", "oral"],

  ["anal-f", "Have anal sex with F", "anal"],
  ["anal-m", "Have anal sex with M", "anal"],
  ["anal-finger-f", "First finger in F's ass", "anal"],
  ["anal-finger-m", "First finger in M's ass", "anal"],
  ["anal-plug-f-sex", "F wears a plug during sex", "anal"],
  ["anal-plug-m-sex", "M wears a plug during sex", "anal"],
  ["anal-behind-f", "Anal with F from behind", "anal"],
  ["anal-f-on-top", "Anal with F on top", "anal"],
  ["anal-slow-f", "Slow anal with F", "anal"],
  ["anal-slow-m", "Slow anal with M", "anal"],
  ["anal-lube", "Anal with way too much lube", "anal"],
  ["anal-after-oral", "Oral first, then anal", "anal"],
  ["anal-shower", "Have anal in the shower", "anal"],
  ["anal-tied-f", "Anal with F while she's tied", "anal"],
  ["anal-tied-m", "Anal with M while he's tied", "anal"],
  ["anal-strap-m", "F fucks M with a strap-on", "anal"],
  ["anal-strap-f", "Use a strap-on on F", "anal"],
  ["anal-training", "An anal training night — slow and patient", "anal"],
  ["anal-only", "Anal-only night — nothing else", "anal"],
  ["anal-toy-first", "Open them with a toy, then anal", "anal"],
  ["anal-rim-f", "Rim F", "anal"],
  ["anal-rim-m", "Rim M", "anal"],
  ["anal-mirror", "Have anal in front of a mirror", "anal"],
  ["anal-then-vag", "Anal first, then vaginal", "anal"],
  ["anal-vag-then", "Vaginal first, then anal", "anal"],
  ["anal-floor", "Have anal on the floor", "anal"],
  ["anal-counter", "Have anal against the kitchen counter", "anal"],
  ["anal-prostate", "Prostate play on M", "anal"],
  ["anal-talk", "Anal with filthy talk the whole time", "anal"],
  ["anal-reward", "Anal as the reward they earned", "anal"],

  ["toy-f-during", "Use a toy on F during sex", "toys"],
  ["toy-vibe-fuck", "Hold a vibe on F while M fucks her", "toys"],
  ["toy-wand-f", "Use a wand on F until she shakes", "toys"],
  ["toy-dildo-f", "Fuck F with a dildo", "toys"],
  ["toy-rabbit", "Use a rabbit toy on F", "toys"],
  ["toy-sleeve-m", "Stroke M with a sleeve toy", "toys"],
  ["toy-cock-ring", "M wears a cock ring", "toys"],
  ["toy-remote-public", "F wears a remote vibe out in public", "toys"],
  ["toy-remote-dinner", "Remote vibe on F at dinner", "toys"],
  ["toy-porn", "Use a toy on them while porn plays", "toys"],
  ["toy-two-f", "Two toys on F at once", "toys"],
  ["toy-mouth", "Put a toy in F's mouth", "toys"],
  ["toy-tied-f", "Use a toy on F while she's tied", "toys"],
  ["toy-tied-m", "Use a toy on M while he's tied", "toys"],
  ["toy-together", "Share a couple vibe — both of you feel it", "toys"],
  ["toy-prostate-m", "Prostate toy on M", "toys"],
  ["toy-beads-f", "Anal beads on F", "toys"],
  ["toy-beads-m", "Anal beads on M", "toys"],
  ["toy-race", "Toy race — who cums first", "toys"],
  ["toy-strap-him", "F fucks M with a strap-on", "toys"],
  ["toy-he-only", "M only uses a toy on F — no cock", "toys"],
  ["toy-she-show", "F uses a toy on herself while M watches", "toys"],
  ["toy-he-show", "M uses a toy on himself while F watches", "toys"],
  ["toy-table", "Sneak a toy under the table", "toys"],
  ["toy-bullet", "Hold a bullet vibe on F's clit", "toys"],
  ["toy-glass", "Use a glass toy", "toys"],
  ["toy-app", "Control their toy from your phone", "toys"],
  ["toy-warmup", "Warm them up with a toy before sex", "toys"],
  ["toy-no-hands", "Make them cum with a toy, not your hands", "toys"],
  ["toy-finish", "Finish them with a toy", "toys"],

  ["film-head-f", "Film yourself going down on F", "film"],
  ["film-head-m", "Film F giving M a blowjob", "film"],
  ["film-sex", "Film the two of you having sex", "film"],
  ["film-her-top", "Film F on top", "film"],
  ["film-behind", "Film from behind while you fuck", "film"],
  ["film-close", "Film a close-up of where you join", "film"],
  ["film-mirror", "Film you two in the mirror", "film"],
  ["film-shower", "Film a shower together", "film"],
  ["film-photo-her", "Take photos of F's body", "film"],
  ["film-photo-him", "Take photos of M's body", "film"],
  ["film-voice", "Record a voice note of the night", "film"],
  ["film-replay", "Watch last time's video together, then do it again", "film"],
  ["film-toys", "Film a toy session", "film"],
  ["film-60", "Film only 60 seconds — then stop", "film"],
  ["film-her-face", "Film F's face when she cums", "film"],
  ["film-his-face", "Film M's face when he cums", "film"],
  ["film-tripod", "Set the phone on a tripod and forget it", "film"],
  ["film-one-photo", "One photo after you both finish", "film"],
  ["film-polaroid", "Take a Polaroid, then hide it", "film"],
  ["film-strip", "Film them stripping", "film"],
  ["film-hands", "Film only your hands on them", "film"],
  ["film-legs", "Film their legs and feet", "film"],
  ["film-ride", "Film F riding M", "film"],
  ["film-him-down", "Film M going down on F", "film"],
  ["film-quickie", "Film a quickie", "film"],
  ["film-watch-us", "Watch a tape of yourselves", "film"],
  ["film-delete", "Watch it once, then delete it", "film"],
  ["film-keep", "Keep one favourite clip", "film"],
  ["film-lights", "Film with the lights on", "film"],
  ["film-lingerie", "Film F in lingerie", "film"],

  ["group-three", "Have a threesome", "group"],
  ["group-ffm", "Threesome with another woman", "group"],
  ["group-mmf", "Threesome with another man", "group"],
  ["group-swap", "Swap with another couple", "group"],
  ["group-soft-swap", "Soft swap — kiss and touch the other couple only", "group"],
  ["group-watch-couple", "Watch another couple have sex", "group"],
  ["group-watched", "Let another couple watch you", "group"],
  ["group-same-room", "Swap in the same room", "group"],
  ["group-sep-rooms", "Swap, separate rooms", "group"],
  ["group-mfm", "Two men on F", "group"],
  ["group-fmf", "Two women on M", "group"],
  ["group-hotwife", "F plays with someone else while M watches", "group"],
  ["group-cuckold", "M watches F get fucked", "group"],
  ["group-she-woman", "F plays with another woman", "group"],
  ["group-he-man", "M plays with another man", "group"],
  ["group-third-watch", "Invite a third just to watch", "group"],
  ["group-third-oral", "Invite a third to join for oral only", "group"],
  ["group-club", "Play in a club playroom", "group"],
  ["group-hotel", "Hotel night with another couple", "group"],
  ["group-text-third", "Text a third together", "group"],
  ["group-pick-photos", "Pick a third from photos, together", "group"],
  ["group-unicorn", "Find a unicorn for one night", "group"],
  ["group-full-swap", "Full swap — sex with the other couple", "group"],
  ["group-kiss-else", "Kiss someone else in front of your partner", "group"],
  ["group-hands-else", "Put your hands on someone else in front of your partner", "group"],
  ["group-she-directs", "F directs M with a third person", "group"],
  ["group-he-directs", "M directs F with a third person", "group"],
  ["group-aftercare-3", "Aftercare with three of you", "group"],
  ["group-blind-who", "Blindfold — they don't know whose hands", "group"],
  ["group-fake-third", "Roleplay a third in the room — just the two of you", "group"],

  ["pow-tied", "Tie them up", "power"],
  ["pow-tied-f", "Tie F up", "power"],
  ["pow-tied-m", "Tie M up", "power"],
  ["pow-wrists-bed", "Tie their wrists to the bed", "power"],
  ["pow-spread", "Tie them spread open", "power"],
  ["pow-collar-f", "Put a collar on F", "power"],
  ["pow-collar-m", "Put a collar on M", "power"],
  ["pow-leash-house", "Walk them on a leash around the house", "power"],
  ["pow-gag", "Gag them", "power"],
  ["pow-blindfold", "Blindfold them", "power"],
  ["pow-she-charge", "F is in charge all night", "power"],
  ["pow-he-charge", "M is in charge all night", "power"],
  ["pow-ask-come", "They have to ask permission to cum", "power"],
  ["pow-orgasm-ctrl", "You decide if and when they get to cum", "power"],
  ["pow-edge", "Edge them until they shake", "power"],
  ["pow-beg", "Make them beg for it", "power"],
  ["pow-orders", "Only give orders — they don't get to ask", "power"],
  ["pow-kneel", "Make them kneel", "power"],
  ["pow-all-fours", "Put them on all fours and make them wait", "power"],
  ["pow-hair", "Pull their hair during sex", "power"],
  ["pow-throat", "Hand on their throat — check in, stay safe", "power"],
  ["pow-spank", "Spank them", "power"],
  ["pow-otk", "Pull them over your knee and spank them", "power"],
  ["pow-names", "Call them filthy names they asked for", "power"],
  ["pow-praise", "Talk them through it with praise only — good girl / good boy, no insults", "power"],
  ["pow-service", "They service you first and get nothing until you say", "power"],
  ["pow-tied-tease", "Tie them up and tease them", "power"],
  ["pow-tied-used", "Tie them up and use them", "power"],
  ["pow-free-use", "They're free to use for one hour", "power"],
  ["pow-safeword", "Pick a safeword and practise using it first", "power"],

  ["imp-whipped", "Whip them", "impact"],
  ["imp-crop-f", "Use a riding crop on F", "impact"],
  ["imp-crop-m", "Use a riding crop on M", "impact"],
  ["imp-paddle", "Paddle them", "impact"],
  ["imp-belt", "Light belt spanking", "impact"],
  ["imp-hairbrush", "Spank them with a hairbrush", "impact"],
  ["imp-slap-ass", "Slap their ass", "impact"],
  ["imp-slap-face", "Consensual slap across the face", "impact"],
  ["imp-flogged", "Flog them", "impact"],
  ["imp-cane", "Leave cane lines on them", "impact"],
  ["imp-then-sex", "Hit them, then fuck them", "impact"],
  ["imp-then-oral", "Hit them, then go down on them", "impact"],
  ["imp-count", "Make them count every hit out loud", "impact"],
  ["imp-marks", "Leave marks they'll still feel tomorrow", "impact"],
  ["imp-ice", "Ice on the sting after you hit them", "impact"],
  ["imp-warmup", "Warm-up spanking before anything else", "impact"],
  ["imp-harder-moan", "Hit harder every time they moan", "impact"],
  ["imp-harder-quiet", "Hit harder if they stay quiet", "impact"],
  ["imp-thighs", "Spank the insides of their thighs", "impact"],
  ["imp-riding", "Spank them while they ride you", "impact"],
  ["imp-tied", "Hit them while they're tied", "impact"],
  ["imp-she-whips", "F whips M", "impact"],
  ["imp-he-whips", "M whips F", "impact"],
  ["imp-heels-crop", "F in heels, riding crop in hand", "impact"],
  ["imp-spoon", "Spank them with a wooden spoon", "impact"],
  ["imp-hands", "Bare-hand spanking only", "impact"],
  ["imp-punish", "Spank them as a punishment they asked for", "impact"],
  ["imp-gift", "Spanking as a gift they want", "impact"],
  ["imp-oil", "Rub oil into the marks after", "impact"],
  ["imp-mirror", "Show them the marks in the mirror", "impact"],

  ["plc-counter", "Have sex on the kitchen counter", "places"],
  ["plc-shower", "Have sex in the shower", "places"],
  ["plc-wall", "Fuck them against the wall", "places"],
  ["plc-floor", "Have sex on the floor", "places"],
  ["plc-couch", "Have sex on the couch", "places"],
  ["plc-car", "Have sex in the car", "places"],
  ["plc-driveway", "Have sex in the driveway", "places"],
  ["plc-hotel", "Have sex in a hotel room", "places"],
  ["plc-balcony", "Have sex on the balcony", "places"],
  ["plc-woods", "Have sex in the woods", "places"],
  ["plc-beach", "Have sex on the beach at night", "places"],
  ["plc-changing", "Have sex in a changing room", "places"],
  ["plc-cinema", "Fool around in the cinema back row", "places"],
  ["plc-office", "Have sex in the office after hours", "places"],
  ["plc-elevator", "Risk it in an elevator", "places"],
  ["plc-stairs", "Have sex on the stairs", "places"],
  ["plc-alley", "A quickie in an alley", "places"],
  ["plc-pool", "Have sex in the pool", "places"],
  ["plc-hottub", "Have sex in the hot tub", "places"],
  ["plc-tent", "Have sex in a tent", "places"],
  ["plc-guest", "Have sex in the guest room", "places"],
  ["plc-window", "Have sex in front of a window", "places"],
  ["plc-washer", "Have sex on the washing machine", "places"],
  ["plc-desk", "Have sex on a desk", "places"],
  ["plc-bar-bath", "Have sex in a bar bathroom", "places"],
  ["plc-lookout", "Have sex parked at a lookout", "places"],
  ["plc-cabin", "Have sex in a cabin", "places"],
  ["plc-plane", "Mile-high fantasy — try it on a plane", "places"],
  ["plc-train", "Have sex in a train toilet", "places"],
  ["plc-roof", "Have sex on a roof or fire escape", "places"],

  ["wat-toy-her", "Watch F use a toy on herself", "watch"],
  ["wat-toy-him", "Watch M use a toy on himself", "watch"],
  ["wat-her-hands", "Watch F touch herself", "watch"],
  ["wat-him-hands", "Watch M touch himself", "watch"],
  ["wat-her-else", "Fantasy: M watches F with someone else", "watch"],
  ["wat-him-else", "Fantasy: F watches M with someone else", "watch"],
  ["wat-mirror", "Do it in front of the mirror the whole time", "watch"],
  ["wat-window", "Leave the window open a crack", "watch"],
  ["wat-lights", "Keep the lights on and look at each other the whole time", "watch"],
  ["wat-she-show", "F puts on a show — M only watches", "watch"],
  ["wat-he-show", "M puts on a show — F only watches", "watch"],
  ["wat-strip", "They do a striptease for you", "watch"],
  ["wat-lap", "They give you a lap dance", "watch"],
  ["wat-porn-us", "Put porn on and have sex to it", "watch"],
  ["wat-porn-her", "Have sex to porn F picked", "watch"],
  ["wat-porn-him", "Have sex to porn M picked", "watch"],
  ["wat-finish", "Watch each other cum", "watch"],
  ["wat-no-touch", "No touching — you only get to watch", "watch"],
  ["wat-doorway", "Watch them from the doorway", "watch"],
  ["wat-catch", "Walk in on them already started", "watch"],
  ["wat-exhibit", "Do it where someone could see", "watch"],
  ["wat-almost", "Get almost caught on purpose", "watch"],
  ["wat-replay-now", "Record it, then watch it immediately", "watch"],
  ["wat-mutual", "Both touch yourselves and watch", "watch"],
  ["wat-she-talks", "F talks M through touching himself", "watch"],
  ["wat-he-talks", "M talks F through touching herself", "watch"],
  ["wat-hotel-mirror", "Watch yourselves in a hotel mirror", "watch"],
  ["wat-dress", "Watch F get dressed after", "watch"],
  ["wat-hard", "Watch M get hard", "watch"],
  ["wat-eyes-come", "Don't look away when they cum", "watch"],

  ["bod-chest-her", "Cum on F's chest", "body"],
  ["bod-face-her", "Cum on F's face", "body"],
  ["bod-chest-him", "Cum on M's chest", "body"],
  ["bod-inside-f", "Cum inside F", "body"],
  ["bod-inside-m", "Cum inside M (anal)", "body"],
  ["bod-creampie", "Creampie — leave it in", "body"],
  ["bod-keep-going", "Creampie, then keep going", "body"],
  ["bod-breasts", "Fuck between F's breasts", "body"],
  ["bod-feet", "Use their feet", "body"],
  ["bod-hair-sex", "Pull their hair while you fuck", "body"],
  ["bod-neck", "Kiss their neck for a long time before anything else", "body"],
  ["bod-bites", "Leave bite marks", "body"],
  ["bod-hickeys", "Leave hickeys", "body"],
  ["bod-scratch-him", "Scratch M's back", "body"],
  ["bod-scratch-her", "Scratch F's back", "body"],
  ["bod-oil", "Oil all over both of you", "body"],
  ["bod-massage", "Massage that turns into sex", "body"],
  ["bod-outer", "Rub on each other — no penetration", "body"],
  ["bod-grind", "Grind clothed until you can't stand it", "body"],
  ["bod-dry", "Dry hump, then strip", "body"],
  ["bod-morning", "Have sex first thing in the morning", "body"],
  ["bod-quickie", "A quickie — in and out", "body"],
  ["bod-marathon", "A long marathon session", "body"],
  ["bod-slow-mean", "Go slow and mean", "body"],
  ["bod-fast-messy", "Go fast and messy", "body"],
  ["bod-stand", "Have sex standing up", "body"],
  ["bod-her-top", "F on top", "body"],
  ["bod-behind", "Fuck them from behind", "body"],
  ["bod-missionary", "Missionary, deep", "body"],
  ["bod-fridge", "Fuck them against the fridge", "body"],
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

/**
 * One shuffled deck for this couple + user, then leftover cards keep that order.
 * Rebuilding from leftovers with the same seed used to put the same category
 * first after every swipe (ten Toys in a row).
 */
export function leftoverFantasies(
  seenIds: Iterable<string>,
  seed = "deck"
): FantasyIdea[] {
  const seen = new Set(seenIds);
  return shuffledFantasyDeck(`${seed}:v2`).filter((idea) => !seen.has(idea.id));
}

function shuffledFantasyDeck(seed: string): FantasyIdea[] {
  const rand = seededRand(seed);
  const bag = shuffleInPlace([...FANTASY_IDEAS], rand);
  const mixed: FantasyIdea[] = [];
  while (bag.length) {
    const last = mixed[mixed.length - 1]?.category;
    const options = bag
      .map((idea, index) => index)
      .filter((index) => bag[index]!.category !== last);
    const pool = options.length > 0 ? options : bag.map((_, index) => index);
    const pick = pool[Math.floor(rand() * pool.length)]!;
    const [next] = bag.splice(pick, 1);
    mixed.push(next!);
  }
  return mixed;
}

/** Swap only F / M labels for names. Leave he / she / him / his alone so it doesn't read "Ck's face when Ck cums". */
export function personalizeFantasyTitle(
  title: string,
  cast: { f: string; m: string }
): string {
  return title
    .replace(/\bF's\b/g, `${cast.f}'s`)
    .replace(/\bM's\b/g, `${cast.m}'s`)
    .replace(/\bF\b/g, cast.f)
    .replace(/\bM\b/g, cast.m);
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
