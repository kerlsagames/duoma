export type FantasyCategoryId =
  | "tonight"
  | "weekend"
  | "roleplay"
  | "places"
  | "sensory"
  | "power"
  | "soft";

export type FantasyIdea = {
  id: string;
  title: string;
  blurb: string;
  category: FantasyCategoryId;
};

export type FantasyCategory = {
  id: FantasyCategoryId;
  label: string;
  tint: string;
};

export const FANTASY_CATEGORIES: FantasyCategory[] = [
  { id: "tonight", label: "Tonight", tint: "#FF6B9A" },
  { id: "weekend", label: "Weekend", tint: "#F0A46A" },
  { id: "roleplay", label: "Roleplay", tint: "#C084FC" },
  { id: "places", label: "Places", tint: "#5B8CFF" },
  { id: "sensory", label: "Sensory", tint: "#3ECFBF" },
  { id: "power", label: "Power", tint: "#FF5C7A" },
  { id: "soft", label: "Soft heat", tint: "#E4C37A" },
];

export const FANTASY_IDEAS: FantasyIdea[] = [
  {
    id: "fx-strangers-bar",
    title: "Strangers at the bar",
    blurb:
      "Act like you just met. Flirt from scratch, pick each other up, and take it from there.",
    category: "roleplay",
  },
  {
    id: "fx-hotel-key",
    title: "Hotel key drop",
    blurb:
      "Book a room (or fake one at home). One of you leaves a key and a time. No small talk first.",
    category: "places",
  },
  {
    id: "fx-blindfold-tour",
    title: "Blindfold tour",
    blurb:
      "Blindfold them and lead a slow full-body tour with only your hands and mouth.",
    category: "sensory",
  },
  {
    id: "fx-shower-rule",
    title: "Shower with one rule",
    blurb:
      "Shower together. One person is not allowed to touch themselves — the other does all the work.",
    category: "tonight",
  },
  {
    id: "fx-text-filth",
    title: "Filthy lunch texts",
    blurb:
      "Send three daytime texts that get filthier. The last one names exactly when you’ll make it real.",
    category: "tonight",
  },
  {
    id: "fx-kitchen-counter",
    title: "Kitchen counter detour",
    blurb:
      "Start dinner, abandon it halfway, and finish against the counter before the food burns.",
    category: "places",
  },
  {
    id: "fx-boss-desk",
    title: "Boss / assistant desk",
    blurb:
      "One of you is in charge. Clear instructions only. Stay in character until someone laughs.",
    category: "roleplay",
  },
  {
    id: "fx-massage-trap",
    title: "Massage that isn’t just a massage",
    blurb:
      "Oil, slow hands, no sex until they ask twice. If they speak early, restart.",
    category: "soft",
  },
  {
    id: "fx-tied-wrists",
    title: "Soft restraint night",
    blurb:
      "Tie or hold wrists with something soft. You set the pace. They set the stop word.",
    category: "power",
  },
  {
    id: "fx-mirror",
    title: "Mirror watch",
    blurb:
      "Do it where you can both see yourselves. No looking away for one whole song.",
    category: "sensory",
  },
  {
    id: "fx-car-driveway",
    title: "Parked car ten minutes",
    blurb:
      "Driveway or quiet street. Ten minutes. Then walk inside like nothing happened.",
    category: "places",
  },
  {
    id: "fx-outfit-order",
    title: "Wear what I pick",
    blurb:
      "One partner picks the other’s outfit (or lingerie) for the evening. No vetoes except safety.",
    category: "weekend",
  },
  {
    id: "fx-voice-note",
    title: "Voice note preview",
    blurb:
      "Record a 20-second voice note of what you want to do. They listen alone before you meet.",
    category: "tonight",
  },
  {
    id: "fx-edge-timer",
    title: "Edging timer",
    blurb:
      "Twenty minutes of teasing with a timer. Nobody finishes until it hits zero — then you decide.",
    category: "power",
  },
  {
    id: "fx-public-secret",
    title: "Public secret",
    blurb:
      "One explicit instruction they follow in public without anyone noticing. Payoff later.",
    category: "places",
  },
  {
    id: "fx-morning-wake",
    title: "Wake-up claim",
    blurb:
      "Wake them up with slow touch and no talking until they pull you in.",
    category: "soft",
  },
  {
    id: "fx-role-switch",
    title: "Full role switch",
    blurb:
      "Whoever usually leads follows tonight. No asking ‘is this okay’ unless the stop word is used.",
    category: "power",
  },
  {
    id: "fx-photo-tease",
    title: "Locked photo tease",
    blurb:
      "Send one photo they are not allowed to open until a set time tonight.",
    category: "tonight",
  },
  {
    id: "fx-ice-warm",
    title: "Ice then warm",
    blurb:
      "Temperature play: cool then warm hands or mouth. Stay until their breathing changes.",
    category: "sensory",
  },
  {
    id: "fx-movie-pause",
    title: "Movie pause rule",
    blurb:
      "Start a film. Every time someone gets distracted, pause and escalate for two minutes.",
    category: "weekend",
  },
  {
    id: "fx-new-room",
    title: "Wrong room on purpose",
    blurb:
      "Start in a room you never use. Finish wherever you end up.",
    category: "places",
  },
  {
    id: "fx-doctor",
    title: "Very thorough checkup",
    blurb:
      "Play doctor / patient with a clipboard of ‘symptoms’ you invent together.",
    category: "roleplay",
  },
  {
    id: "fx-slow-strip",
    title: "One piece at a time",
    blurb:
      "Clothes come off one piece per song. No rushing the playlist.",
    category: "soft",
  },
  {
    id: "fx-command-hour",
    title: "Command hour",
    blurb:
      "For sixty minutes they only do what you say. Kind, clear, and specific.",
    category: "power",
  },
  {
    id: "fx-bath-together",
    title: "Shared bath first",
    blurb:
      "Fill the tub, phones out, candles optional. Touch is allowed. Finish wherever you want after.",
    category: "weekend",
  },
  {
    id: "fx-toy-instruction",
    title: "Toy on the bed",
    blurb:
      "Leave one toy or accessory on the bed as the only instruction. No talking for five minutes.",
    category: "tonight",
  },
  {
    id: "fx-praise",
    title: "Praise-only night",
    blurb:
      "Only compliments and dirty praise allowed. No jokes that break the mood.",
    category: "soft",
  },
  {
    id: "fx-outdoor-risk",
    title: "Quiet outdoor risk",
    blurb:
      "Somewhere private outdoors or a balcony — keep it short, keep it quiet, keep it thrilling.",
    category: "places",
  },
  {
    id: "fx-name-game",
    title: "Call me that",
    blurb:
      "Pick a name or title. They use it for the next hour, even when you laugh.",
    category: "roleplay",
  },
  {
    id: "fx-aftercare-first",
    title: "Aftercare menu first",
    blurb:
      "Before anything spicy, agree the aftercare: water, cuddles, snack, or alone time.",
    category: "soft",
  },
  {
    id: "fx-sixty-nine-timer",
    title: "Mutual mouth timer",
    blurb:
      "Mouth only, ten minutes, no hands. Timer on the nightstand.",
    category: "tonight",
  },
  {
    id: "fx-weekend-hotel",
    title: "Fake anniversary hotel",
    blurb:
      "Treat a night like a hotel anniversary even if you stay home — robes, order-in, no chores.",
    category: "weekend",
  },
];

export function fantasyById(id: string): FantasyIdea | null {
  return FANTASY_IDEAS.find((item) => item.id === id) ?? null;
}

export function fantasyCategoryMeta(id: FantasyCategoryId): FantasyCategory {
  return (
    FANTASY_CATEGORIES.find((item) => item.id === id) ?? FANTASY_CATEGORIES[0]
  );
}

/** Deterministic subset of idea ids a demo partner "already liked". */
export function demoLikedFantasyIds(): string[] {
  return FANTASY_IDEAS.filter((_, index) => index % 2 === 0).map(
    (item) => item.id
  );
}
