import { dailyCuriosityQuestion } from "@/lib/curiosityQuestions";
import type {
  CheckIn,
  CheckInMetricKey,
  DesireGauge,
  MoodWeather,
  ScratchKind,
  SocialBattery,
  TodayNeed,
  TonightSex,
} from "@/lib/types";

export const MOODS: { id: MoodWeather; label: string; sky: string }[] = [
  { id: "sunny", label: "Sunny", sky: "Feeling cheerful, bright, and easygoing" },
  { id: "cloudy", label: "Part-cloudy", sky: "Mostly good, a bit distracted or tired" },
  { id: "rain", label: "Rain", sky: "Down, sensitive, or emotional" },
  { id: "storm", label: "Storm", sky: "Stressed, overwhelmed, or irritable" },
];

export function moodMeta(id: MoodWeather | null | undefined) {
  if (!id) return MOODS[1];
  if (id === "bright") return MOODS[0];
  return MOODS.find((mood) => mood.id === id) ?? MOODS[1];
}

export function batteryLabel(val: number) {
  if (val <= 3) return "Running on empty. Zero pressure, quiet rest.";
  if (val <= 6) return "Moderate energy. Basic tasks, taking it easy.";
  if (val <= 8) return "Good energy. Balanced and active.";
  return "High energy. Ready for outings, workouts, or a plan.";
}

export function loveTankLabel(val: number) {
  if (val <= 3) return "Running low. Feeling disconnected or unappreciated.";
  if (val <= 6) return "Doing okay. Loved, but a spark would land.";
  return "Full tank. Deeply loved, valued, and connected.";
}

export const SOCIAL_BATTERY: {
  id: SocialBattery;
  title: string;
  detail: string;
}[] = [
  {
    id: "drain",
    title: "Drain / Low",
    detail: "Need quiet solo time. Don't want to see people.",
  },
  {
    id: "balanced",
    title: "Balanced",
    detail: "Happy to chill with you. Prefer no big crowds.",
  },
  {
    id: "social",
    title: "High / Social",
    detail: "Feeling social. Hang out, or catch up with friends.",
  },
];

export const TODAY_NEEDS: {
  id: TodayNeed;
  title: string;
  detail: string;
}[] = [
  { id: "alone", title: "Alone space", detail: "Time to unwind on my own" },
  { id: "listen", title: "A listening ear", detail: "Vent without needing solutions" },
  { id: "comfort", title: "Comfort and hugs", detail: "Physical touch and reassurance" },
  { id: "tasks", title: "Help with tasks", detail: "Lifting some household weight" },
  { id: "fun", title: "Fun / distraction", detail: "A laugh, a game, or a date night" },
  { id: "talk", title: "Deep talk", detail: "Real conversation and connection" },
];

export const TONIGHT_SEX: {
  id: TonightSex;
  title: string;
  detail: string;
}[] = [
  { id: "yes", title: "Hell yeh", detail: "That's the plan. We're on." },
  { id: "no", title: "Nah not today", detail: "Not tonight. Still us." },
];

export function tonightLabel(id: TonightSex | null | undefined): string | null {
  if (!id) return null;
  return TONIGHT_SEX.find((item) => item.id === id)?.title ?? null;
}

export const DESIRE_GAUGE: {
  id: DesireGauge;
  title: string;
  detail: string;
}[] = [
  { id: "off", title: "Off / Low", detail: "Rest or quiet cuddling only" },
  { id: "medium", title: "Medium", detail: "Open to romance if we start slow" },
  { id: "high", title: "High", detail: "Affectionate and physically playful" },
  { id: "hot", title: "Hot", detail: "Definitely in the mood tonight" },
];

export const CHECK_IN_METRIC_META: {
  key: CheckInMetricKey;
  label: string;
  icon:
    | "flame-outline"
    | "battery-charging-outline"
    | "partly-sunny-outline"
    | "heart-outline"
    | "people-outline"
    | "compass-outline";
}[] = [
  { key: "tonight", label: "Are we fucking today?", icon: "flame-outline" },
  { key: "loveTank", label: "Love tank", icon: "heart-outline" },
  { key: "battery", label: "Battery / energy", icon: "battery-charging-outline" },
  { key: "mood", label: "Mood forecast", icon: "partly-sunny-outline" },
  { key: "socialBattery", label: "Social battery", icon: "people-outline" },
  { key: "todayNeed", label: "What I need today", icon: "compass-outline" },
  { key: "desireGauge", label: "Spicy gauge", icon: "flame-outline" },
];

export function socialBatteryMeta(id: SocialBattery | null | undefined) {
  return SOCIAL_BATTERY.find((item) => item.id === id) ?? null;
}

export function todayNeedMeta(id: TodayNeed | null | undefined) {
  return TODAY_NEEDS.find((item) => item.id === id) ?? null;
}

export function desireGaugeMeta(id: DesireGauge | null | undefined) {
  return DESIRE_GAUGE.find((item) => item.id === id) ?? null;
}

export function partnerHint(checkIn: CheckIn): string {
  if (checkIn.tonight === "yes") {
    return "Hell yeh. Make the night easy to say yes to — lock the door, skip the extra plans.";
  }
  if (checkIn.tonight === "no") {
    return "Nah not today. Keep it close without making it a thing.";
  }
  if (checkIn.energy != null && checkIn.energy <= 3) {
    return "Low battery today — consider taking dinner off their plate.";
  }
  if (checkIn.loveTank != null && checkIn.loveTank <= 3) {
    return "Love tank is low. A specific compliment or a long hug would land.";
  }
  if (checkIn.mood === "storm" || checkIn.mood === "rain") {
    return "Forecast is rough. Keep plans light and stay close.";
  }
  if (checkIn.todayNeed === "alone") {
    return "They asked for alone space. Give it without taking it personally.";
  }
  if (checkIn.socialBattery === "drain") {
    return "Social battery is drained. Quiet, just the two of you — or solo.";
  }
  if (
    checkIn.energy != null &&
    checkIn.energy >= 8 &&
    (checkIn.loveTank == null || checkIn.loveTank >= 8)
  ) {
    return "They're charged. Suggest something you both actually want tonight.";
  }
  if (checkIn.mood === "cloudy") {
    return "A little muted. A small plan with no pressure helps.";
  }
  return "They checked in. Guard a little 1-on-1 time anyway.";
}

export function checkInLines(checkIn: CheckIn): string[] {
  const lines: string[] = [];
  const tonight = tonightLabel(checkIn.tonight);
  if (tonight) lines.push(`Are we fucking today? ${tonight}`);
  if (checkIn.loveTank != null) {
    lines.push(`Love tank ${checkIn.loveTank}/10`);
  }
  if (checkIn.energy != null) {
    lines.push(`Battery ${checkIn.energy}/10`);
  }
  if (checkIn.mood) {
    lines.push(`Mood · ${moodMeta(checkIn.mood).label}`);
  }
  const social = socialBatteryMeta(checkIn.socialBattery);
  if (social) lines.push(`Social · ${social.title}`);
  const need = todayNeedMeta(checkIn.todayNeed);
  if (need) lines.push(`Need · ${need.title}`);
  const spicy = desireGaugeMeta(checkIn.desireGauge);
  if (spicy) lines.push(`Spicy · ${spicy.title}`);
  return lines;
}

export function curiosityFor(coupleId: string, date: string) {
  const question = dailyCuriosityQuestion(coupleId, date);
  return { id: question.id, prompt: question.question };
}

export const DESIRE_CATEGORIES = [
  {
    id: "dates",
    label: "Date ideas",
    options: [
      { id: "date-cook", label: "Cook a long meal at home" },
      { id: "date-out", label: "Dress up and go out" },
      { id: "date-walk", label: "Walk with no destination" },
      { id: "date-museum", label: "Museum or gallery" },
      { id: "date-hike", label: "Hike or long outdoor day" },
      { id: "date-movie", label: "Stay-in movie pile" },
      { id: "date-live", label: "Live music or a show" },
      { id: "date-picnic", label: "Picnic, even in the living room" },
      { id: "date-drive", label: "Night drive with a playlist" },
      { id: "date-breakfast", label: "Lazy breakfast out" },
    ],
  },
  {
    id: "affection",
    label: "Affection style",
    options: [
      { id: "aff-words", label: "Specific verbal praise" },
      { id: "aff-touch", label: "Casual touch all day" },
      { id: "aff-acts", label: "Acts of service" },
      { id: "aff-time", label: "Undivided time, phones down" },
      { id: "aff-gifts", label: "Small unexpected gifts" },
      { id: "aff-notes", label: "Written notes" },
      { id: "aff-public", label: "Public affection" },
      { id: "aff-private", label: "Private, just us" },
    ],
  },
  {
    id: "intimacy",
    label: "Intimacy preferences",
    options: [
      { id: "int-morning", label: "Slow mornings" },
      { id: "int-night", label: "Long nights" },
      { id: "int-quick", label: "Quick and hungry" },
      { id: "int-massage", label: "Massage first" },
      { id: "int-talk", label: "Talk through it" },
      { id: "int-quiet", label: "Mostly quiet" },
      { id: "int-shower", label: "Shower together" },
      { id: "int-playful", label: "Playful and laughing" },
      { id: "int-intense", label: "Intense and focused" },
      { id: "int-aftercare", label: "Serious aftercare" },
    ],
  },
] as const;

export const ALL_DESIRE_OPTIONS = DESIRE_CATEGORIES.flatMap((category) =>
  category.options.map((option) => ({ ...option, category: category.id }))
);

export const SCRATCH_POOLS: Record<
  ScratchKind,
  { title: string; body: string }[]
> = {
  date: [
    { title: "Neighborhood wander", body: "Walk until you both agree on a place to sit." },
    { title: "Dress-up at home", body: "Nice clothes, candles, a meal you already have." },
    { title: "Two-course takeout", body: "Order from two places. Eat it on real plates." },
    { title: "Sunrise or sunset", body: "Pick the next clear one. Be there." },
    { title: "Bookstore date", body: "Each buy one thing for the other. No peeking." },
    { title: "Live something", body: "Music, comedy, sport — whatever is on tonight." },
  ],
  evening: [
    { title: "Couch fort", body: "Blankets, one show, snacks you do not usually buy." },
    { title: "Cook with a timer", body: "30 minutes, one pan, no recipe heroics." },
    { title: "Phone in a drawer", body: "Ninety minutes. Talk or touch or both." },
    { title: "Map a trip", body: "Open a map. Bookmark three places you might actually go." },
    { title: "Slow shower", body: "Same bathroom. Unrushed." },
    { title: "Read out loud", body: "One chapter, taking turns." },
  ],
  dare: [
    { title: "Voice note", body: "Send the other a 20-second voice note of something you want." },
    { title: "Outfit pick", body: "They pick what you wear for the next hour." },
    { title: "Kiss interruption", body: "Kiss them the next time they are mid-sentence." },
    { title: "Compliment streak", body: "Three specific compliments before the next song ends." },
    { title: "Slow dance", body: "One song, kitchen floor, no irony." },
    { title: "Replay", body: "Redo your favorite 10 minutes from the last month." },
  ],
};

export const RITUALS = [
  {
    id: "check-in",
    title: "Daily check-in",
    cadence: "daily" as const,
    detail: "Share only the metrics you want. Request the rest.",
  },
  {
    id: "curiosity",
    title: "Curiosity question",
    cadence: "daily" as const,
    detail: "One question. Hidden until you both answer.",
  },
  {
    id: "date-night",
    title: "Guard date night",
    cadence: "weekly" as const,
    detail: "Mark it when 1-on-1 time actually happened.",
  },
  {
    id: "jar-sunday",
    title: "Open the jar",
    cadence: "weekly" as const,
    detail: "Sunday evening is for reading the notes out loud.",
  },
];

export function hashPick<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i) * 17) % 997;
  return items[hash % items.length];
}
