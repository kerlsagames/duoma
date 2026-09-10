import type { CheckIn, MoodWeather, ScratchKind } from "@/lib/types";

export const MOODS: { id: MoodWeather; label: string; sky: string }[] = [
  { id: "sunny", label: "Sunny", sky: "Clear and easy" },
  { id: "bright", label: "Bright", sky: "Up, with a little bounce" },
  { id: "cloudy", label: "Cloudy", sky: "Fine, a bit muted" },
  { id: "rain", label: "Rain", sky: "Heavy, needs softness" },
  { id: "storm", label: "Storm", sky: "Protect the night" },
];

export function moodMeta(id: MoodWeather) {
  return MOODS.find((mood) => mood.id === id) ?? MOODS[2];
}

export function partnerHint(checkIn: CheckIn, partnerName: string): string {
  if (checkIn.energy <= 3) {
    return `${partnerName} reported a low battery today — consider taking dinner off their plate.`;
  }
  if (checkIn.loveTank <= 3) {
    return `${partnerName}'s love tank is low. A specific compliment or a long hug would land.`;
  }
  if (checkIn.mood === "storm" || checkIn.mood === "rain") {
    return `${partnerName}'s forecast is rough. Keep plans light and stay close.`;
  }
  if (checkIn.energy >= 8 && checkIn.loveTank >= 8) {
    return `${partnerName} is charged. Suggest something you both actually want tonight.`;
  }
  if (checkIn.mood === "cloudy") {
    return `${partnerName} is a little muted. A small plan with no pressure helps.`;
  }
  return `${partnerName} checked in steady. Guard a little 1-on-1 time anyway.`;
}

export const CURIOSITY_QUESTIONS = [
  { id: "q1", prompt: "What is one quiet thing I did this week that you noticed?" },
  { id: "q2", prompt: "If tonight had a soundtrack, what song is playing?" },
  { id: "q3", prompt: "What would make tomorrow feel 10% easier?" },
  { id: "q4", prompt: "Where in our home do you feel the most like yourself?" },
  { id: "q5", prompt: "What is a small luxury you want us to stop treating as extra?" },
  { id: "q6", prompt: "When did you last feel proud of us as a team?" },
  { id: "q7", prompt: "What should we say no to this month?" },
  { id: "q8", prompt: "What is a memory from this year you want to keep on purpose?" },
  { id: "q9", prompt: "How full is your social battery right now, 1 to 10?" },
  { id: "q10", prompt: "What meal should we cook together before the month ends?" },
  { id: "q11", prompt: "What is one way I can make you feel chosen this week?" },
  { id: "q12", prompt: "If we had a free Saturday with no errands, how do we spend it?" },
  { id: "q13", prompt: "What habit of mine actually helps you more than I realize?" },
  { id: "q14", prompt: "What are you quietly excited about?" },
  { id: "q15", prompt: "What do you want more of in our evenings?" },
  { id: "q16", prompt: "What do you want less of in our evenings?" },
  { id: "q17", prompt: "Who outside of us has been good for you lately?" },
  { id: "q18", prompt: "What is a trip we should stop only talking about?" },
  { id: "q19", prompt: "When do you feel most attractive with me?" },
  { id: "q20", prompt: "What apology do you still need — or still want to give?" },
  { id: "q21", prompt: "What is the kindest thing we did for each other recently?" },
  { id: "q22", prompt: "If our week had a weather report, what is it?" },
  { id: "q23", prompt: "What should we celebrate that we usually skip?" },
  { id: "q24", prompt: "What is a boundary you want us to honor better?" },
  { id: "q25", prompt: "What is one thing you want me to ask you more often?" },
  { id: "q26", prompt: "Where should our money go that would actually feel good?" },
  { id: "q27", prompt: "What is a silly future you can picture for us?" },
  { id: "q28", prompt: "What made you laugh this week that I missed?" },
  { id: "q29", prompt: "What does support look like for you tonight, specifically?" },
  { id: "q30", prompt: "What is a yes you wish I would offer without being asked?" },
];

export function curiosityFor(coupleId: string, date: string) {
  let hash = 0;
  const key = `${coupleId}:${date}`;
  for (let i = 0; i < key.length; i += 1) hash += key.charCodeAt(i) * (i + 3);
  const question = CURIOSITY_QUESTIONS[hash % CURIOSITY_QUESTIONS.length];
  return question;
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

export const COUPON_TEMPLATES = [
  { title: "15-minute back rub", body: "No phones. You pick the pressure." },
  { title: "Full control of the remote", body: "One night, your show, no commentary." },
  { title: "Uninterrupted nap", body: "I handle the house. You sleep." },
  { title: "Breakfast in bed", body: "Whatever you want. Brought to you." },
  { title: "You pick dinner", body: "No negotiating. I make it happen." },
  { title: "Phone-free hour", body: "I put mine away first." },
  { title: "Kitchen slow dance", body: "One song, held close, no talking required." },
  { title: "Foot rub on the couch", body: "Twenty minutes. Your playlist." },
  { title: "I do your chore", body: "Name it. I do it this week." },
  { title: "Morning coffee run", body: "Your exact order, in your hands." },
];

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
    detail: "Ten seconds. Energy, weather, love tank.",
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
