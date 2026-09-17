import { applyOverlay } from "@/lib/catalog-overlay";
import type { Gender } from "@/lib/types";
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
  "Submission & Control",
  "Exhibition & Risk",
  "Digital & Media",
  "Tech & Toys",
  "Edging & Teasing",
  "Quickies & Impulse",
  "Dirty Talk & Words",
  "Dress Up & Lingerie",
  "Oral & Hands",
  "Aftercare & Soft",
  "Food & Taste",
  "Games & Rules",
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
    | "flash-outline"
    | "key-outline"
    | "eye-outline"
    | "phone-portrait-outline"
    | "hardware-chip-outline"
    | "hourglass-outline"
    | "timer-outline"
    | "chatbubble-ellipses-outline"
    | "shirt-outline"
    | "happy-outline"
    | "leaf-outline"
    | "restaurant-outline"
    | "game-controller-outline";
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
  {
    id: "Submission & Control",
    label: "Control",
    detail: "Commands, restraint, obedience",
    icon: "key-outline",
  },
  {
    id: "Exhibition & Risk",
    label: "Risk",
    detail: "Public edge, exposure, thrill",
    icon: "eye-outline",
  },
  {
    id: "Digital & Media",
    label: "Digital",
    detail: "Screens, audio, private media",
    icon: "phone-portrait-outline",
  },
  {
    id: "Tech & Toys",
    label: "Tech",
    detail: "Vibes, rings, lube, toys",
    icon: "hardware-chip-outline",
  },
  {
    id: "Edging & Teasing",
    label: "Edging",
    detail: "Denial, tempo, brink play",
    icon: "hourglass-outline",
  },
  {
    id: "Quickies & Impulse",
    label: "Impulse",
    detail: "Right now, anywhere",
    icon: "timer-outline",
  },
  {
    id: "Dirty Talk & Words",
    label: "Talk",
    detail: "Whispers, scripts, filthy lines",
    icon: "chatbubble-ellipses-outline",
  },
  {
    id: "Dress Up & Lingerie",
    label: "Dress",
    detail: "Outfits, no-underwear, uniform",
    icon: "shirt-outline",
  },
  {
    id: "Oral & Hands",
    label: "Mouth",
    detail: "Oral, hands, no rush",
    icon: "happy-outline",
  },
  {
    id: "Aftercare & Soft",
    label: "Soft",
    detail: "Water, praise, slow come-down",
    icon: "leaf-outline",
  },
  {
    id: "Food & Taste",
    label: "Taste",
    detail: "Ice, honey, something edible",
    icon: "restaurant-outline",
  },
  {
    id: "Games & Rules",
    label: "Games",
    detail: "Dice, points, house rules",
    icon: "game-controller-outline",
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

export const SPICY_DARE_DECK_ID = "up-for-it" as const;
export const SPICY_DARE_LEGACY_IDS = ["wildcard", "secret-desires", "spicy-dares"] as const;
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
    text: "{m} takes one photo of {f} she is not allowed to see until later tonight. Lighting has to be flattering on purpose.",
    categories: ["Film & Photo", "Quick & Playful"],
  },
  {
    id: "sd-2",
    text: "{m} records a 15-second voice note of what he wants to do to {f} — send it while she is in another room.",
    categories: ["Film & Photo", "Roleplay & Teasing"],
  },
  {
    id: "sd-3",
    text: "{f} films a slow undress from the neck down. No faces. Watch it together before anything else happens.",
    categories: ["Film & Photo"],
  },
  {
    id: "sd-4",
    text: "{m} sets a lamp, a candle, or phone torch and shoots three stills of {f}'s body he actually likes. Shows her one.",
    categories: ["Film & Photo", "Sensory & Touch"],
  },
  {
    id: "sd-5",
    text: "Take a mirror photo together that you would never post. Keep it in a locked album.",
    categories: ["Film & Photo", "Location & Adventure"],
  },
  {
    id: "sd-6",
    text: "{f} sends {m} a photo mid-day with one piece of clothing already gone, no caption except a time.",
    categories: ["Film & Photo", "Roleplay & Teasing", "Quick & Playful"],
  },
  {
    id: "sd-7",
    text: "{m} blindfolds {f} and uses three different textures on her skin. She guesses. Wrong guess means he lingers.",
    categories: ["Toys & Accessories", "Sensory & Touch"],
  },
  {
    id: "sd-8",
    text: "Put a toy or accessory on the bed as the only instruction. No talking for the first five minutes.",
    categories: ["Toys & Accessories", "Quick & Playful"],
  },
  {
    id: "sd-9",
    text: "{m} picks ice cube or warm mug and traces it on {f} until she says stay or stop.",
    categories: ["Toys & Accessories", "Sensory & Touch"],
  },
  {
    id: "sd-10",
    text: "{m} ties or holds {f}'s wrists with something soft. {m} decides the pace. {f} decides the word that ends it.",
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
    text: "{m} texts {f} one explicit instruction she has to follow in public without anyone noticing.",
    categories: ["Roleplay & Teasing", "Location & Adventure"],
  },
  {
    id: "sd-14",
    text: "For the next hour {f} calls {m} a name he chooses. Stay in it even when you laugh.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-15",
    text: "{m} sends {f} three daytime texts that get filthier. The last one names a time they will make it real.",
    categories: ["Roleplay & Teasing", "Quick & Playful"],
  },
  {
    id: "sd-16",
    text: "{m} is in charge from the first kiss until {f} asks to switch. No asking 'is this okay' unless she uses the stop word.",
    categories: ["Roleplay & Teasing", "Sensory & Touch"],
  },
  {
    id: "sd-17",
    text: "{m} whispers what he is about to do to {f} before he does it. Do not skip the sentence.",
    categories: ["Roleplay & Teasing", "Quick & Playful"],
  },
  {
    id: "sd-18",
    text: "Act like you just met. Pick them up in your own kitchen. Take them 'home'.",
    categories: ["Roleplay & Teasing", "Location & Adventure"],
  },
  {
    id: "sd-19",
    text: "{m} gives {f} a full slow massage with a rule: no sex until she asks twice.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-20",
    text: "{m} uses only his mouth on {f} for ten minutes, no hands. Timer on the nightstand.",
    categories: ["Sensory & Touch", "Quick & Playful"],
  },
  {
    id: "sd-21",
    text: "{m} kisses every place on {f} he usually skips. Names them as he goes.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-22",
    text: "Temperature play: shower hot, then cooler hands. Stay until their breathing changes.",
    categories: ["Sensory & Touch", "Location & Adventure"],
  },
  {
    id: "sd-23",
    text: "{m} holds eye contact with {f} for one whole song while he touches her. If he looks away, start the song over.",
    categories: ["Sensory & Touch", "Roleplay & Teasing"],
  },
  {
    id: "sd-24",
    text: "{m} uses only his mouth and breath on {f}'s neck and chest until she pulls him in.",
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
    text: "{m} does all the work in the shower. {f} does not get to touch herself.",
    categories: ["Location & Adventure", "Sensory & Touch"],
  },
  {
    id: "sd-29",
    text: "Couch first. Bed is only if you both still want more after.",
    categories: ["Location & Adventure"],
  },
  {
    id: "sd-30",
    text: "{m} takes {f} for a walk. At some point he pulls her somewhere slightly too public and kisses her like he means it.",
    categories: ["Location & Adventure", "Roleplay & Teasing"],
  },
  {
    id: "sd-31",
    text: "{m} gets {f} as close as he can in five minutes. Stop on zero. Decide together whether to start it again.",
    categories: ["Quick & Playful", "Sensory & Touch"],
  },
  {
    id: "sd-32",
    text: "Strip race. Loser gives a three-minute lap sit with no kissing.",
    categories: ["Quick & Playful"],
  },
  {
    id: "sd-33",
    text: "{f} picks a number 1 to 10. {m} gives that many slow strokes or kisses. Then he asks if she wants the next ten.",
    categories: ["Quick & Playful", "Sensory & Touch"],
  },
  {
    id: "sd-34",
    text: "One song, standing up. Grind, kiss, or both. When the song ends, freeze for a count of five.",
    categories: ["Quick & Playful"],
  },
  {
    id: "sd-35",
    text: "{m} dares {f} to keep a straight face while he touches her under a blanket during a show.",
    categories: ["Quick & Playful", "Roleplay & Teasing"],
  },
  {
    id: "sd-36",
    text: "{m} writes a one-line dare on a note and puts it in {f}'s pocket. She has to do it before bed.",
    categories: ["Quick & Playful", "Roleplay & Teasing"],
  },
  {
    id: "sd-37",
    text: "{m} takes a photo of his hand on {f} that only she would recognize. Sends it with no context.",
    categories: ["Film & Photo", "Quick & Playful"],
  },
  {
    id: "sd-38",
    text: "Video the two of you kissing until it stops being polite. Watch the last ten seconds together.",
    categories: ["Film & Photo", "Sensory & Touch"],
  },
  {
    id: "sd-39",
    text: "{f} wears or holds one accessory {m} chose. She does not take it off until he says so.",
    categories: ["Toys & Accessories", "Roleplay & Teasing"],
  },
  {
    id: "sd-40",
    text: "{m} uses feather, nail, or ice on {f}. Two minutes each. She ranks them. Winner gets used again.",
    categories: ["Toys & Accessories", "Sensory & Touch", "Quick & Playful"],
  },
  {
    id: "sd-41",
    text: "{f} gets three asks for the evening. {m} does them.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-42",
    text: "{m} teases {f} in a doorway every time she walks through it tonight. No follow-through until the last one.",
    categories: ["Roleplay & Teasing", "Location & Adventure"],
  },
  {
    id: "sd-43",
    text: "Oil or lotion, lights low. One of you is not allowed to rush. The other one is not allowed to help.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-44",
    text: "{m} bites, then soothes, a place {f} names. Twice.",
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
    text: "{m} puts a toy on {f} on a timer she cannot see. She finds out when it starts.",
    categories: ["Toys & Accessories", "Quick & Playful"],
  },
  {
    id: "sd-51",
    text: "{m} texts {f} a role she has to stay in until she gets home — even in the grocery line.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-52",
    text: "{m} traces {f}'s outline with one finger, never lifting, until she asks him to stop or keep going.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-53",
    text: "{m} takes {f} somewhere they have never been intimate and kisses her like they might get caught.",
    categories: ["Location & Adventure"],
  },
  {
    id: "sd-54",
    text: "{f} picks a body part. {m} has ninety seconds to make it her favorite.",
    categories: ["Quick & Playful", "Sensory & Touch"],
  },
  {
    id: "sd-55",
    text: "{f} sends {m} a photo of the outfit she will take off later. Nothing else — let him wait.",
    categories: ["Film & Photo", "Roleplay & Teasing"],
  },
  {
    id: "sd-56",
    text: "{m} lays out three toys. {f} picks one without looking. He commits to using it.",
    categories: ["Toys & Accessories", "Quick & Playful"],
  },
  {
    id: "sd-57",
    text: "{m} writes a scene on a note {f} finds later. Play it out as written, no improvising the first round.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-58",
    text: "{m} gives {f} a warm-oil slow massage, no talking. If she speaks, he starts over.",
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
  {
    id: "sd-61",
    text: "{f} has total command for 30 minutes. {m} obeys any non-dangerous command without question.",
    categories: ["Submission & Control"],
  },
  {
    id: "sd-62",
    text: "{f} kneels and passes {m} a drink, snack, or item of his choice.",
    categories: ["Submission & Control"],
  },
  {
    id: "sd-63",
    text: "{m} loosely binds {f}'s wrists with a scarf or belt for the duration of a foreplay session.",
    categories: ["Submission & Control", "Toys & Accessories"],
  },
  {
    id: "sd-64",
    text: "{m} blindfolds {f} and leaves her at the mercy of his touch and pace.",
    categories: ["Submission & Control", "Sensory & Touch"],
  },
  {
    id: "sd-65",
    text: "{m} must ask out loud \"May I touch you?\" before every physical contact with {f} for the next 20 minutes.",
    categories: ["Submission & Control", "Roleplay & Teasing"],
  },
  {
    id: "sd-66",
    text: "{m} puts {f} on her hands and knees or flat on her stomach and makes her hold that position until he says otherwise.",
    categories: ["Submission & Control"],
  },
  {
    id: "sd-67",
    text: "{f} may not speak — only nod or shake her head — while following every physical direction {m} gives.",
    categories: ["Submission & Control"],
  },
  {
    id: "sd-68",
    text: "{m} sits back on the bed and points to each piece of clothing {f} takes off next.",
    categories: ["Submission & Control", "Roleplay & Teasing"],
  },
  {
    id: "sd-69",
    text: "{m} walks up to {f} in public and whispers an explicit sexual secret in her ear.",
    categories: ["Exhibition & Risk", "Location & Adventure"],
  },
  {
    id: "sd-70",
    text: "Car Park Quickie: pull over in a secluded spot on the way home for a quick, risky session in the car.",
    categories: ["Exhibition & Risk", "Quickies & Impulse"],
  },
  {
    id: "sd-71",
    text: "{m} gets {f} to go out to dinner or an event wearing no underwear.",
    categories: ["Exhibition & Risk"],
  },
  {
    id: "sd-72",
    text: "Window View: position play near a window or mirror where there's a slight edge of exposure or risk.",
    categories: ["Exhibition & Risk", "Location & Adventure"],
  },
  {
    id: "sd-73",
    text: "Backyard Kiss: step outside into the yard, balcony, or porch at night for a deep, risky 2-minute session in the dark.",
    categories: ["Exhibition & Risk", "Location & Adventure"],
  },
  {
    id: "sd-74",
    text: "{f} briefly flashes {m} a private body part while standing just inside an open doorway before closing it.",
    categories: ["Exhibition & Risk", "Quick & Playful"],
  },
  {
    id: "sd-75",
    text: "{m} slips his hand inside {f}'s back pocket or under her jacket to touch skin while walking in public.",
    categories: ["Exhibition & Risk"],
  },
  {
    id: "sd-76",
    text: "Steamy Glass Trace: touch and press your partner up against the glass during a hot shower while watching from the outside.",
    categories: ["Exhibition & Risk", "Sensory & Touch"],
  },
  {
    id: "sd-77",
    text: "{m} chooses the exact adult video or audio clip you both watch or listen to during foreplay.",
    categories: ["Digital & Media", "Film & Photo"],
  },
  {
    id: "sd-78",
    text: "{m} directs a 3-photo private photoshoot of {f} to keep on a locked phone.",
    categories: ["Digital & Media", "Film & Photo"],
  },
  {
    id: "sd-79",
    text: "{m} sends {f} an explicit 15-second audio of what he wants to do later while one of you is away.",
    categories: ["Digital & Media", "Roleplay & Teasing"],
  },
  {
    id: "sd-80",
    text: "Screen Blackout: turn off all devices, TVs, and phones for 2 hours to focus 100% on touch and connection.",
    categories: ["Digital & Media", "Sensory & Touch"],
  },
  {
    id: "sd-81",
    text: "POV Filming: film a short 15-second point-of-view clip of oral play or penetration to rewatch immediately together.",
    categories: ["Digital & Media", "Film & Photo"],
  },
  {
    id: "sd-82",
    text: "Mirror Snapshot: take a single explicit photo together in the full-length mirror during the session.",
    categories: ["Digital & Media", "Film & Photo"],
  },
  {
    id: "sd-83",
    text: "Audio Recording Only: turn on a voice memo and record only the audio of your session to play back in the car later.",
    categories: ["Digital & Media"],
  },
  {
    id: "sd-84",
    text: "{m} texts {f} three explicit instruction steps from the other room that she must follow in order.",
    categories: ["Digital & Media", "Roleplay & Teasing"],
  },
  {
    id: "sd-85",
    text: "{m} takes remote or direct control of a vibrator or massager on {f} during penetration.",
    categories: ["Tech & Toys", "Toys & Accessories"],
  },
  {
    id: "sd-86",
    text: "{m} blindfolds {f}, then chooses which toy to use on her.",
    categories: ["Tech & Toys", "Toys & Accessories"],
  },
  {
    id: "sd-87",
    text: "{m} gives {f} a 15-minute high-slickness massage using warming or sensory lube before sex.",
    categories: ["Tech & Toys", "Sensory & Touch"],
  },
  {
    id: "sd-88",
    text: "Double Toy Impact: use two toys at once — e.g. a wand on the clit while using an internal toy or cock ring.",
    categories: ["Tech & Toys", "Toys & Accessories"],
  },
  {
    id: "sd-89",
    text: "{m} warms or chills a glass or silicone toy, then traces it over {f}'s sensitive zones.",
    categories: ["Tech & Toys", "Sensory & Touch"],
  },
  {
    id: "sd-90",
    text: "{m} spends 5 full minutes with a deep-tissue massager on {f}'s shoulders and thighs before bringing it to sensitive areas.",
    categories: ["Tech & Toys", "Sensory & Touch"],
  },
  {
    id: "sd-91",
    text: "Ringing Release: wear a cock ring for the entire session to maximize hardness and endurance until final climax.",
    categories: ["Tech & Toys", "Toys & Accessories"],
  },
  {
    id: "sd-92",
    text: "Toy-Only Foreplay: reach the first stage of play using zero hands — only toys allowed on both partners.",
    categories: ["Tech & Toys", "Toys & Accessories"],
  },
  {
    id: "sd-93",
    text: "{m} brings {f} to the brink three times, full stop each time, before allowing release.",
    categories: ["Edging & Teasing"],
  },
  {
    id: "sd-94",
    text: "{f} is not allowed to finish until {m} explicitly gives the verbal green light.",
    categories: ["Edging & Teasing", "Submission & Control"],
  },
  {
    id: "sd-95",
    text: "{m} keeps all manual or oral touch on {f} at an agonizingly slow tempo for 10 minutes.",
    categories: ["Edging & Teasing", "Sensory & Touch"],
  },
  {
    id: "sd-96",
    text: "{f} gets touched and teased for 15 minutes, but is forbidden from touching {m} back.",
    categories: ["Edging & Teasing"],
  },
  {
    id: "sd-97",
    text: "60-Second Freeze: right when things get fast and intense, freeze completely for 60 seconds while remaining deep inside or touched.",
    categories: ["Edging & Teasing"],
  },
  {
    id: "sd-98",
    text: "Feather vs Firm: alternate between an ultra-light feather touch and a firm, heavy grip every 30 seconds.",
    categories: ["Edging & Teasing", "Sensory & Touch"],
  },
  {
    id: "sd-99",
    text: "{m} keeps his lips less than a millimeter from {f}'s mouth, nipples, or thighs for 2 minutes without making contact.",
    categories: ["Edging & Teasing", "Roleplay & Teasing"],
  },
  {
    id: "sd-100",
    text: "{f} must count out loud every time she gets close to the edge before {m} forces a full stop and rest.",
    categories: ["Edging & Teasing"],
  },
  {
    id: "sd-101",
    text: "Drop Everything: redeemable immediately — stop whatever you are doing and head straight to the bedroom.",
    categories: ["Quickies & Impulse", "Quick & Playful"],
  },
  {
    id: "sd-102",
    text: "{m} joins {f} in the shower mid-wash for a fast, standing-up encounter.",
    categories: ["Quickies & Impulse", "Location & Adventure"],
  },
  {
    id: "sd-103",
    text: "{f} wakes {m} with immediate oral attention or deep touch before he gets out of bed.",
    categories: ["Quickies & Impulse"],
  },
  {
    id: "sd-104",
    text: "{m} lifts {f} onto the kitchen counter for a fast 5-minute session before resuming the day.",
    categories: ["Quickies & Impulse", "Location & Adventure"],
  },
  {
    id: "sd-105",
    text: "Timer Challenge: set a timer for 7 minutes — start, finish, and clean up before the alarm goes off.",
    categories: ["Quickies & Impulse", "Quick & Playful"],
  },
  {
    id: "sd-106",
    text: "{m} catches {f} walking between rooms, pins her against the wall, and has a fast standing session.",
    categories: ["Quickies & Impulse", "Location & Adventure"],
  },
  {
    id: "sd-107",
    text: "Commercial Break: use a quick 3-minute break during a show or movie to touch, tease, and get as far as you can before it restarts.",
    categories: ["Quickies & Impulse", "Quick & Playful"],
  },
  {
    id: "sd-108",
    text: "Desk Hijack: clear off a home office desk or table and use it for an instant mid-day quickie.",
    categories: ["Quickies & Impulse", "Location & Adventure"],
  },
  {
    id: "sd-109",
    text: "{m} takes a photo of {f}'s mouth after they have been kissing. Sends it to her with one word: later.",
    categories: ["Film & Photo", "Dirty Talk & Words"],
  },
  {
    id: "sd-110",
    text: "{m} films ten seconds of his hands on {f}, no faces. Watch it once, then delete or lock it together.",
    categories: ["Film & Photo"],
  },
  {
    id: "sd-111",
    text: "{m} lights {f} the way he actually likes. Three stills. She picks the one that stays.",
    categories: ["Film & Photo"],
  },
  {
    id: "sd-112",
    text: "{m} records {f} saying what she wants tonight. Plays it back when you start.",
    categories: ["Film & Photo", "Dirty Talk & Words"],
  },
  {
    id: "sd-113",
    text: "{m} puts a toy in {f}'s hand and leaves the room for two minutes. Comes back and uses whatever she chose.",
    categories: ["Toys & Accessories"],
  },
  {
    id: "sd-114",
    text: "{m} uses ice in one hand and a warm toy in the other on {f}. Alternate every thirty seconds until she picks a favorite.",
    categories: ["Toys & Accessories", "Sensory & Touch"],
  },
  {
    id: "sd-115",
    text: "{f} wears one accessory {m} picks from the moment she gets home. It stays on until she asks to take it off out loud.",
    categories: ["Toys & Accessories", "Dress Up & Lingerie"],
  },
  {
    id: "sd-116",
    text: "{m} lays out a toy {f} has never used on him. She gets five minutes with it. He does not help.",
    categories: ["Toys & Accessories"],
  },
  {
    id: "sd-117",
    text: "You are the new neighbor. Knock. Stay in it until someone laughs, then stay in it anyway.",
    categories: ["Roleplay & Teasing"],
  },
  {
    id: "sd-118",
    text: "{m} gives {f} a job title for the next twenty minutes. Every request has to sound like that job.",
    categories: ["Roleplay & Teasing", "Dirty Talk & Words"],
  },
  {
    id: "sd-119",
    text: "Text a scene in three lines. Play the last line exactly as written.",
    categories: ["Roleplay & Teasing", "Digital & Media"],
  },
  {
    id: "sd-120",
    text: "{m} starts everything. {f} can only answer. One hour.",
    categories: ["Roleplay & Teasing", "Submission & Control"],
  },
  {
    id: "sd-121",
    text: "{m} traces {f}'s spine with one fingernail, neck to tailbone, three times. Do not speed up.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-122",
    text: "{m} puts his mouth on {f}'s neck, hands still, until she pulls him in or says stay.",
    categories: ["Sensory & Touch", "Oral & Hands"],
  },
  {
    id: "sd-123",
    text: "{m} gives {f} ten minutes of warm lotion, lights low. If she rushes him, start the ten over.",
    categories: ["Sensory & Touch", "Aftercare & Soft"],
  },
  {
    id: "sd-124",
    text: "{m} holds eye contact and breathes on {f}'s skin without kissing until the song ends.",
    categories: ["Sensory & Touch"],
  },
  {
    id: "sd-125",
    text: "Start in the hallway. You do not get the bedroom until someone asks twice.",
    categories: ["Location & Adventure"],
  },
  {
    id: "sd-126",
    text: "Balcony, yard, or parked car — coats on, five minutes, then walk back in like nothing.",
    categories: ["Location & Adventure", "Exhibition & Risk"],
  },
  {
    id: "sd-127",
    text: "Kitchen counter, standing. Clothes stay mostly on until the timer hits zero.",
    categories: ["Location & Adventure", "Quickies & Impulse"],
  },
  {
    id: "sd-128",
    text: "{m} does all the work in the shower. {f} does not get to use her hands.",
    categories: ["Location & Adventure", "Sensory & Touch"],
  },
  {
    id: "sd-129",
    text: "Ninety seconds. Get a sound out of them. If you fail, they get ninety on you.",
    categories: ["Quick & Playful"],
  },
  {
    id: "sd-130",
    text: "Coin flip. Winner names a three-minute dare. Do it before you sit down again.",
    categories: ["Quick & Playful", "Games & Rules"],
  },
  {
    id: "sd-131",
    text: "Strip race to underwear. Loser sits still for two minutes while the winner looks.",
    categories: ["Quick & Playful", "Dress Up & Lingerie"],
  },
  {
    id: "sd-132",
    text: "{f} picks a number 1 to 20. {m} gives that many slow kisses. Then asks if she wants twenty more.",
    categories: ["Quick & Playful", "Sensory & Touch"],
  },
  {
    id: "sd-133",
    text: "{f} asks before every touch for fifteen minutes. If she forgets, {m} stops for a count of ten.",
    categories: ["Submission & Control"],
  },
  {
    id: "sd-134",
    text: "{f} kneels, passes {m} a drink, and stays there until he taps her shoulder.",
    categories: ["Submission & Control"],
  },
  {
    id: "sd-135",
    text: "{m} points. {f} takes off that piece. No arguing the order.",
    categories: ["Submission & Control", "Dress Up & Lingerie"],
  },
  {
    id: "sd-136",
    text: "{m} sets the pace for one song. {f}'s hands stay behind her back. She does not get to help.",
    categories: ["Submission & Control"],
  },
  {
    id: "sd-137",
    text: "{m} walks {f} to the door in something she would not wear to the shops. Coat on. Coat off once, then go.",
    categories: ["Exhibition & Risk", "Dress Up & Lingerie"],
  },
  {
    id: "sd-138",
    text: "{m} whispers one explicit thing in {f}'s ear in public. Then acts like he said nothing.",
    categories: ["Exhibition & Risk", "Dirty Talk & Words"],
  },
  {
    id: "sd-139",
    text: "{m} keeps a hand on {f}'s lower back, under the jacket, while you walk. Do not take it out until you get home.",
    categories: ["Exhibition & Risk"],
  },
  {
    id: "sd-140",
    text: "Window or mirror with the light on. Two minutes. Then you close it.",
    categories: ["Exhibition & Risk"],
  },
  {
    id: "sd-141",
    text: "{m} sends {f} three voice notes that get filthier. The last one names a time.",
    categories: ["Digital & Media", "Dirty Talk & Words"],
  },
  {
    id: "sd-142",
    text: "Pick the clip you watch together. No skipping. Hands stay off until it ends.",
    categories: ["Digital & Media"],
  },
  {
    id: "sd-143",
    text: "Phones face-down for one hour. If someone checks, they owe a five-minute dare of the other's choosing.",
    categories: ["Digital & Media", "Games & Rules"],
  },
  {
    id: "sd-144",
    text: "Record audio only. Play the last thirty seconds in the car tomorrow.",
    categories: ["Digital & Media"],
  },
  {
    id: "sd-145",
    text: "{m} holds the remote of an app-controlled toy on {f} through dinner at home. She does not get the remote.",
    categories: ["Tech & Toys"],
  },
  {
    id: "sd-146",
    text: "{m} warms the toy. {f} guesses hot or cold with her eyes shut. Wrong guess means he lingers.",
    categories: ["Tech & Toys", "Sensory & Touch"],
  },
  {
    id: "sd-147",
    text: "{m} uses two toys on {f} at once for three minutes. Then she picks which one stays.",
    categories: ["Tech & Toys", "Toys & Accessories"],
  },
  {
    id: "sd-148",
    text: "Toy only for the first ten minutes. Hands are for holding, not helping.",
    categories: ["Tech & Toys"],
  },
  {
    id: "sd-149",
    text: "{m} brings {f} close twice. Full stop each time. Third time she has to ask.",
    categories: ["Edging & Teasing"],
  },
  {
    id: "sd-150",
    text: "{f} counts out loud every time she gets close. Miss a number and {m} starts that count over.",
    categories: ["Edging & Teasing", "Games & Rules"],
  },
  {
    id: "sd-151",
    text: "{m} stays agonizingly slow with {f} for eight minutes. If she speeds him up, the eight restarts.",
    categories: ["Edging & Teasing", "Sensory & Touch"],
  },
  {
    id: "sd-152",
    text: "Freeze for forty seconds right when it gets good. Stay touching. Then move again.",
    categories: ["Edging & Teasing"],
  },
  {
    id: "sd-153",
    text: "{m} catches {f} between rooms. Wall. Two minutes. Then lets her finish what she was doing.",
    categories: ["Quickies & Impulse"],
  },
  {
    id: "sd-154",
    text: "Alarm for six minutes. Start, finish, straighten the room before it rings.",
    categories: ["Quickies & Impulse", "Quick & Playful"],
  },
  {
    id: "sd-155",
    text: "{f} wakes {m} with her mouth. No talking until he says good morning.",
    categories: ["Quickies & Impulse", "Oral & Hands"],
  },
  {
    id: "sd-156",
    text: "{m} joins {f} in the shower mid-wash. Standing only. Out before the water runs cold.",
    categories: ["Quickies & Impulse", "Location & Adventure"],
  },
  {
    id: "sd-157",
    text: "{m} whispers the filthiest thing he thought about {f} this week, in detail, then does the first sentence.",
    categories: ["Dirty Talk & Words"],
  },
  {
    id: "sd-158",
    text: "{f} has to keep talking. If she goes quiet, {m} stops until she starts again.",
    categories: ["Dirty Talk & Words"],
  },
  {
    id: "sd-159",
    text: "{m} narrates what he is about to do to {f} before every move. Do not skip the sentence.",
    categories: ["Dirty Talk & Words", "Roleplay & Teasing"],
  },
  {
    id: "sd-160",
    text: "{m} writes three lines on a note {f} finds in a pocket. The last line is tonight's rule.",
    categories: ["Dirty Talk & Words"],
  },
  {
    id: "sd-161",
    text: "{m} gets to pick the lingerie {f} wears tonight. She wears it until he says change.",
    categories: ["Dress Up & Lingerie"],
  },
  {
    id: "sd-162",
    text: "{f} puts on something of {m}'s and nothing else. He looks for one full minute.",
    categories: ["Dress Up & Lingerie"],
  },
  {
    id: "sd-163",
    text: "{f} wears no underwear under whatever she already planned to wear out. {m} gets to check before you leave.",
    categories: ["Dress Up & Lingerie", "Exhibition & Risk"],
  },
  {
    id: "sd-164",
    text: "{m} undresses {f} with his mouth as far as he can. Hands only for buttons that will not give.",
    categories: ["Dress Up & Lingerie", "Oral & Hands"],
  },
  {
    id: "sd-165",
    text: "{f} loses a piece every time she blinks first in a staring contest with {m}.",
    categories: ["Dress Up & Lingerie", "Games & Rules"],
  },
  {
    id: "sd-166",
    text: "{m} dresses {f}. She does not get an opinion. Take it off only when he says.",
    categories: ["Dress Up & Lingerie", "Submission & Control"],
  },
  {
    id: "sd-167",
    text: "{f} wears the thing {m} likes and does something ordinary in it first — dishes, email, a show.",
    categories: ["Dress Up & Lingerie"],
  },
  {
    id: "sd-168",
    text: "{m} chooses which piece {f} leaves on the whole time, before you start.",
    categories: ["Dress Up & Lingerie"],
  },
  {
    id: "sd-169",
    text: "{m} uses only his mouth on {f}, no hands, ten minutes. Timer where she can see it.",
    categories: ["Oral & Hands"],
  },
  {
    id: "sd-170",
    text: "{m} kisses {f} from collarbone to navel, once, as slow as he can. Then asks if she wants it again.",
    categories: ["Oral & Hands", "Sensory & Touch"],
  },
  {
    id: "sd-171",
    text: "{f} sits on the edge of the bed. {m} kneels. She keeps one hand in his hair.",
    categories: ["Oral & Hands"],
  },
  {
    id: "sd-172",
    text: "Hands only, matching pace, one on them and one on you, until someone asks to switch.",
    categories: ["Oral & Hands"],
  },
  {
    id: "sd-173",
    text: "{m} alternates mouth and hand on {f} every thirty seconds. She says stop switching when she has had enough.",
    categories: ["Oral & Hands", "Edging & Teasing"],
  },
  {
    id: "sd-174",
    text: "{m} licks a single stripe up {f}'s neck and blows on the wet path. Does the other side.",
    categories: ["Oral & Hands", "Quick & Playful"],
  },
  {
    id: "sd-175",
    text: "{m} finishes {f} with his hand while he keeps kissing. No break in the kiss.",
    categories: ["Oral & Hands"],
  },
  {
    id: "sd-176",
    text: "{f} uses {m}'s mouth for two minutes. His hands stay on his thighs.",
    categories: ["Oral & Hands", "Submission & Control"],
  },
  {
    id: "sd-177",
    text: "Water, a cloth, and two specific compliments before anyone reaches for their phone.",
    categories: ["Aftercare & Soft"],
  },
  {
    id: "sd-178",
    text: "Hold them skin-to-skin for one song after. No talking unless they start.",
    categories: ["Aftercare & Soft"],
  },
  {
    id: "sd-179",
    text: "Ask what they want more of next time. Write it down where you will actually see it.",
    categories: ["Aftercare & Soft"],
  },
  {
    id: "sd-180",
    text: "{m} washes {f} in a slow shower. She does not have to lift a hand.",
    categories: ["Aftercare & Soft", "Location & Adventure"],
  },
  {
    id: "sd-181",
    text: "{f} picks the snack and water. {m} fetches. Then he stays until she falls asleep or says go.",
    categories: ["Aftercare & Soft"],
  },
  {
    id: "sd-182",
    text: "{m} puts oil or lotion on the places he was rough with {f}. Two minutes each spot. No restarting anything else.",
    categories: ["Aftercare & Soft", "Sensory & Touch"],
  },
  {
    id: "sd-183",
    text: "{m} tells {f} two things she did that worked. Be specific. No jokes for the first one.",
    categories: ["Aftercare & Soft", "Dirty Talk & Words"],
  },
  {
    id: "sd-184",
    text: "{m} brings {f} a warm cloth and asks if she wants quiet or talk.",
    categories: ["Aftercare & Soft"],
  },
  {
    id: "sd-185",
    text: "{m} puts honey, cream, or chocolate in one stripe on {f} that he has to clean off with his mouth.",
    categories: ["Food & Taste"],
  },
  {
    id: "sd-186",
    text: "{m} runs an ice cube from {f}'s collarbone to navel, then follows the melt with his mouth.",
    categories: ["Food & Taste", "Sensory & Touch"],
  },
  {
    id: "sd-187",
    text: "{m} feeds {f} something she likes while she sits in his lap. No hands from her.",
    categories: ["Food & Taste"],
  },
  {
    id: "sd-188",
    text: "Kiss after something cold, then something warm. They say which one stays.",
    categories: ["Food & Taste"],
  },
  {
    id: "sd-189",
    text: "{f} names a place. {m} has two minutes with whipped cream or honey. No rushing to the obvious spot first.",
    categories: ["Food & Taste"],
  },
  {
    id: "sd-190",
    text: "Share a drink. You take a sip, then kiss it to them. Three times.",
    categories: ["Food & Taste", "Quick & Playful"],
  },
  {
    id: "sd-191",
    text: "{m} blindfolds {f}. She tastes two things and guesses. Wrong guess means he chooses the next dare.",
    categories: ["Food & Taste", "Games & Rules"],
  },
  {
    id: "sd-192",
    text: "Breakfast in bed rule: whoever finished last night cooks or fetches. No debate.",
    categories: ["Food & Taste", "Aftercare & Soft"],
  },
  {
    id: "sd-193",
    text: "Roll a die. 1–2 slow kiss, 3–4 mouth only, 5 hands, 6 they pick. Best of three.",
    categories: ["Games & Rules"],
  },
  {
    id: "sd-194",
    text: "Twenty-one. Each point is a kiss lower than the last. Bust and you start at the mouth again.",
    categories: ["Games & Rules", "Oral & Hands"],
  },
  {
    id: "sd-195",
    text: "{f} sets three house rules on a note. {m} follows them until midnight. One veto allowed.",
    categories: ["Games & Rules", "Submission & Control"],
  },
  {
    id: "sd-196",
    text: "Truth or dare, three rounds. Dares only from this app's list. No skipping the third.",
    categories: ["Games & Rules"],
  },
  {
    id: "sd-197",
    text: "Keep score tonight. First to three sounds wins a five-minute dare of their choosing tomorrow.",
    categories: ["Games & Rules"],
  },
  {
    id: "sd-198",
    text: "Card draw: red they lead, black you lead, face card means no talking. One draw, one song.",
    categories: ["Games & Rules"],
  },
  {
    id: "sd-199",
    text: "{f} writes a rule on {m}'s skin where clothes will hide it. It stays until he showers.",
    categories: ["Games & Rules", "Dirty Talk & Words"],
  },
  {
    id: "sd-200",
    text: "Two-minute turns. When the timer buzzes, you freeze and swap who is in charge.",
    categories: ["Games & Rules", "Edging & Teasing"],
  },
];

export const SPICY_DARES_CATEGORIES = SPICY_DARE_CATEGORIES;

function asSpicyCat(value: string | undefined): SpicyDareCategory {
  return (SPICY_DARE_CATEGORIES as readonly string[]).includes(value ?? "")
    ? (value as SpicyDareCategory)
    : "Quick & Playful";
}

export function spicyDares(includeHidden = false): SpicyDare[] {
  return applyOverlay(
    "spicyDares",
    SPICY_DARES,
    (row, edit) => ({
      ...row,
      text: edit.body?.trim() || edit.title?.trim() || row.text,
      categories: edit.group
        ? edit.group
            .split(",")
            .map((item) => asSpicyCat(item.trim()))
            .filter(Boolean)
        : row.categories,
    }),
    (row) => ({
      id: row.id,
      text: row.body.trim() || row.title,
      categories: [asSpicyCat(row.group)],
    }),
    includeHidden
  );
}

export function dareById(id: string): SpicyDare | null {
  return spicyDares().find((row) => row.id === id) ?? null;
}

export function daresInCategory(tag: SpicyDareCategory | "all"): SpicyDare[] {
  if (tag === "all") return spicyDares();
  return spicyDares().filter((row) => row.categories.includes(tag));
}

export function withPlayStatus(playedIds: string[]): SpicyDare[] {
  const played = new Set(playedIds);
  return spicyDares().map((row) => ({
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

export function directionLabel(direction: DareDirection | null | undefined): string {
  if (direction === "i-do-you") return "I'll do this to you";
  if (direction === "you-do-me") return "You do this to me";
  return "No direction";
}

export function darePeople(input: {
  youName?: string | null;
  themName?: string | null;
  youGender?: Gender | null;
  themGender?: Gender | null;
}): { m: string; f: string } {
  const you = input.youName?.trim() || "You";
  const them = input.themName?.trim() || "them";
  if (input.youGender === "male" && input.themGender === "female") {
    return { m: you, f: them };
  }
  if (input.youGender === "female" && input.themGender === "male") {
    return { m: them, f: you };
  }
  if (input.youGender === "male") return { m: you, f: them };
  if (input.themGender === "male") return { m: them, f: you };
  if (input.youGender === "female") return { m: them, f: you };
  if (input.themGender === "female") return { m: you, f: them };
  return { m: you, f: them };
}

export function personalizeDareText(
  text: string,
  input: {
    youName?: string | null;
    themName?: string | null;
    youGender?: Gender | null;
    themGender?: Gender | null;
  }
): string {
  const names = darePeople(input);
  return text.replace(/\{m\}/gi, names.m).replace(/\{f\}/gi, names.f);
}
