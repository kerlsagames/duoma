export type KnowMeQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
};

export type KnowMePack = {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  questions: KnowMeQuestion[];
};

export const KNOW_ME_WIN = 7;

export const KNOW_ME_PACKS: KnowMePack[] = [
  pack("everyday", "Everyday me", "Habits, mornings, tiny tells.", "#F6E27A", [
    q("coffee", "My coffee order if nobody's watching", [
      "Whatever’s strongest",
      "Something sweet with too much foam",
      "Tea, actually",
      "I change it every time",
    ]),
    q("alarm", "When the alarm goes off I", [
      "Get up on the first one",
      "Negotiate with snooze",
      "Need you to poke me",
      "Was already half awake",
    ]),
    q("texts", "How I actually text", [
      "Novels",
      "One-word missiles",
      "Voice notes",
      "Memes, then a real sentence",
    ]),
    q("late", "If I’m running late I", [
      "Text a novel of excuses",
      "Just appear, breathless",
      "Blame traffic no matter what",
      "Reschedule like a professional",
    ]),
    q("playlist", "The playlist I’d put on in the car", [
      "Nostalgia hits",
      "Whatever’s new and loud",
      "Podcast, not music",
      "Silence. Don’t touch the aux.",
    ]),
    q("phone", "My phone habit", [
      "It’s glued to me",
      "I lose it in the couch",
      "Notifications off, on purpose",
      "I check it more than I’ll admit",
    ]),
    q("shower", "Shower length, honestly", [
      "In and out",
      "A whole season of a show",
      "Depends on the day",
      "I sing. That’s the delay.",
    ]),
    q("shoes", "Leaving the house, I forget", [
      "Keys",
      "My water bottle",
      "What I just stood up to do",
      "Nothing. I’m the organised one.",
    ]),
    q("night", "My real bedtime", [
      "Early and proud",
      "“Just one more episode”",
      "Whenever you turn the light off",
      "Different every night",
    ]),
    q("mood", "You can tell my mood first from", [
      "My face",
      "How loud I get",
      "How quiet I get",
      "The snacks I start hunting",
    ]),
  ]),
  pack("food", "Food & drink", "Orders, cravings, fridge politics.", "#FF7A45", [
    q("comfort", "My secret comfort food", [
      "Something fried and unholy",
      "Cereal for dinner",
      "A very specific takeout order",
      "Whatever you cook when you’re showing off",
    ]),
    q("spice", "Spice level I actually want", [
      "Mild, don’t test me",
      "Medium with bravado",
      "Hot. Make it a problem.",
      "I say hot and regret it",
    ]),
    q("leftovers", "Leftovers in this house", [
      "I claim them immediately",
      "They’re yours, I forget they exist",
      "We fight about the last bit",
      "I reheat them wrong on purpose",
    ]),
    q("sweet", "Dessert personality", [
      "I need something sweet",
      "Savoury forever",
      "I’ll steal two bites of yours",
      "Ice cream is a food group",
    ]),
    q("cook", "When it’s my turn to cook I", [
      "Follow a recipe like law",
      "Vibe it and hope",
      "Suggest takeout creatively",
      "Make the same three things",
    ]),
    q("drink", "My default drink", [
      "Water, I’m boring",
      "Something fizzy",
      "Coffee until it’s a problem",
      "Whatever you’re having",
    ]),
    q("hungry", "When I’m hungry I get", [
      "Quiet and dangerous",
      "Dramatic",
      "Suddenly very loving",
      "I don’t notice until I crash",
    ]),
    q("restaurant", "At a restaurant I", [
      "Know in ten seconds",
      "Need to hear specials and still panic",
      "Want to share everything",
      "Guard my plate",
    ]),
    q("breakfast", "Real breakfast, if I had time", [
      "Eggs and something fried",
      "Sweet — toast, yoghurt, fruit",
      "Just coffee",
      "I skip it and call lunch breakfast",
    ]),
    q("snack", "The snack I will always say yes to", [
      "Chips",
      "Chocolate",
      "Cheese",
      "Fruit if you cut it up for me",
    ]),
  ]),
  pack("us", "You & me", "How I love, fight, and cling.", "#FF3D8B", [
    q("loved", "The thing that actually makes me feel loved", [
      "A surprise plan",
      "Being left alone on purpose",
      "A stupid in-joke in public",
      "Help with the boring stuff",
    ]),
    q("fight", "In a fight I need you to", [
      "Give me twenty minutes, then come back",
      "Stay in the room even if it’s messy",
      "Say the real thing first",
      "Hug me before we solve it",
    ]),
    q("apology", "A good apology from you is", [
      "Short and specific",
      "A paragraph and a snack",
      "Changed behaviour, fewer words",
      "Funny, then sincere",
    ]),
    q("date", "My idea of a good date", [
      "Dress up and go out",
      "Pajamas and a movie",
      "A walk with no plan",
      "Something slightly new",
    ]),
    q("jealous", "I get jealous when", [
      "You go quiet on your phone",
      "Someone is obviously into you",
      "I don’t, I just get thoughtful",
      "You make plans without me",
    ]),
    q("need", "When I’ve had a bad day I want", [
      "To vent, then be done",
      "Silence and your shoulder",
      "A fix-it plan",
      "To be taken out of the house",
    ]),
    q("pda", "Public affection, my setting is", [
      "Hand and that’s plenty",
      "Kiss me anyway",
      "Depends who’s watching",
      "I’m the one who starts it",
    ]),
    q("future", "When we talk about the future I", [
      "Want details",
      "Want the feeling, not the spreadsheet",
      "Get itchy if it’s too far out",
      "Already have a list",
    ]),
    q("pet", "My most extra couple habit", [
      "Sending you photos of nothing",
      "Checking you’re okay twice",
      "Stealing your hoodies",
      "Narrating the dog / the day",
    ]),
    q("love-word", "If I had to pick how I show love", [
      "Words",
      "Touch",
      "Doing the thing",
      "Time, no phones",
    ]),
  ]),
  pack("comfort", "Comfort & stress", "What steadies me and what doesn’t.", "#7C5CFF", [
    q("stress", "When I’m stressed you can see it in", [
      "My sleep",
      "My tone",
      "The mess I leave",
      "How much I disappear into a screen",
    ]),
    q("calm", "The fastest way to calm me down", [
      "Food",
      "A walk",
      "Let me rant",
      "Leave me alone, kindly",
    ]),
    q("worry", "I worry most about", [
      "Money",
      "Us going quiet",
      "Work / being enough",
      "Health, mine or yours",
    ]),
    q("cry", "I cry", [
      "At ads, easily",
      "Only when it’s serious",
      "When I’m angry, weirdly",
      "Almost never, which is its own thing",
    ]),
    q("sick", "When I’m sick I want", [
      "To be left in a nest",
      "You checking on me every hour",
      "Soup and no questions",
      "To pretend I’m fine",
    ]),
    q("overwhelmed", "If the day is too much I", [
      "Cancel everything",
      "Push through and crash",
      "Need you to pick the next step",
      "Clean something aggressively",
    ]),
    q("comfort-show", "My comfort watch", [
      "A show I’ve seen twelve times",
      "Something dumb and new",
      "You picking is the comfort",
      "I don’t watch, I scroll",
    ]),
    q("touch", "When I’m anxious, touch should be", [
      "A full hug",
      "Just your hand",
      "Don’t, not yet",
      "Sit near me without talking",
    ]),
    q("news", "Bad news, I want it", [
      "Straight, no soft landing",
      "Gently, with context",
      "After food",
      "In a text first so I can think",
    ]),
    q("reset", "My reset button is", [
      "A shower",
      "Sleep",
      "Getting out of the house",
      "A plan for tomorrow",
    ]),
  ]),
  pack("weekends", "Weekends & travel", "Days off, trips, and how I wander.", "#3ECFBF", [
    q("saturday", "If we had a free Saturday I’d pick", [
      "A long walk with no destination",
      "A project around the house",
      "Staying in with a movie stack",
      "A slightly too-ambitious day trip",
    ]),
    q("sleep-in", "Weekend mornings I", [
      "Sleep in like it’s a sport",
      "Wake up anyway",
      "Want breakfast in bed energy",
      "Start chores before you’re up",
    ]),
    q("trip", "On a trip I am", [
      "Itinerary person",
      "Wander person",
      "Food person",
      "Nap person who swears we’ll go out later",
    ]),
    q("pack", "Packing for a weekend I", [
      "Overpack",
      "Forget a charger",
      "Make a list and still miss something",
      "Throw it in 20 minutes before",
    ]),
    q("beach", "Beach day, my truth", [
      "In the water immediately",
      "Towel, book, don’t splash me",
      "I’ll go if there’s food nearby",
      "I burn. I know. I’ll still forget sunscreen.",
    ]),
    q("flight", "At the airport I", [
      "Want to be hours early",
      "Cut it fine and sprint",
      "Need a snack strategy",
      "Need you to hold the tickets vibe",
    ]),
    q("hotel", "Hotel arrival, first move", [
      "Jump on the bed",
      "Inspect the bathroom",
      "Find food",
      "Open the curtains and sigh",
    ]),
    q("sunday", "Sunday scaries hit me", [
      "Hard, around 4pm",
      "Only Sunday night",
      "I don’t get them",
      "I get them but I pretend I don’t",
    ]),
    q("adventure", "“Let’s just go” works on me if", [
      "There’s a vibe and a snack",
      "I had a hint yesterday",
      "Never. I need a plan.",
      "Always. Please kidnap me kindly.",
    ]),
    q("souvenir", "I bring home", [
      "Something useful",
      "Something ugly and beloved",
      "Photos, that’s it",
      "Fridge magnets, unironically",
    ]),
  ]),
  pack("home", "At home", "Chores, nests, and the remote.", "#E4C37A", [
    q("nest", "My favourite spot in the house", [
      "The couch corner",
      "The bed, always",
      "The kitchen counter",
      "Wherever you are",
    ]),
    q("chores", "Chores I will do without being asked", [
      "Dishes",
      "Trash",
      "Laundry",
      "None of them, but I’ll do one if you start",
    ]),
    q("mess", "A messy room makes me", [
      "Itchy",
      "Fine until it tips",
      "Weirdly calm",
      "Blame the other person in my head",
    ]),
    q("remote", "The remote / aux", [
      "I should hold it",
      "You can have it",
      "We fight, affectionately",
      "I put something on and vanish",
    ]),
    q("guests", "When people come over I", [
      "Clean like we’re selling the house",
      "Hide the worst pile",
      "Don’t care",
      "Panic-cook",
    ]),
    q("plants", "House plants", [
      "I keep them alive",
      "I love them and they die",
      "They’re yours",
      "We shouldn’t have plants",
    ]),
    q("temp", "The house temperature I want", [
      "Warm, almost too warm",
      "Cold, duvet weather",
      "Windows open always",
      "I complain either way",
    ]),
    q("noise", "Background noise at home", [
      "TV on even if nobody’s watching",
      "Music",
      "Quiet, please",
      "A podcast I half listen to",
    ]),
    q("morning-home", "First thing I do at home after work", [
      "Change clothes",
      "Find you",
      "Snack",
      "Zone out for twenty minutes",
    ]),
    q("sleep-side", "In bed I", [
      "Steal the duvet",
      "Run hot and kick it off",
      "Need a limb on you",
      "Need space or I overheat",
    ]),
  ]),
  pack("childhood", "Growing up", "Kid me, still in here.", "#F0A46A", [
    q("kid", "As a kid I was", [
      "Shy until I knew you",
      "The loud one",
      "In my own world",
      "Trying to be the responsible one",
    ]),
    q("school", "School memory that still tracks", [
      "Teacher’s favourite / try-hard",
      "Class clown",
      "In the back, drawing",
      "Anxious and overprepared",
    ]),
    q("family", "Family dinners growing up were", [
      "Loud and long",
      "Quiet, TV on",
      "Rare — everyone busy",
      "A production",
    ]),
    q("holiday", "The holiday I still care about", [
      "Christmas",
      "My birthday, don’t skip it",
      "A random one I made important",
      "I don’t, really",
    ]),
    q("toy", "Childhood comfort I still want", [
      "A specific food",
      "A show or book",
      "Being tucked in energy",
      "Winning a silly game",
    ]),
    q("grounded", "I got in trouble for", [
      "Talking back",
      "Sneaking out / staying up",
      "Not doing homework",
      "I was suspiciously well-behaved",
    ]),
    q("dream", "Kid-me’s job fantasy", [
      "Something on a stage",
      "Something heroic",
      "Something with animals",
      "I had no idea, still don’t",
    ]),
    q("sibling", "Sibling energy (or only-child)", [
      "I was the bossy one",
      "I was the baby",
      "Only child, full main character",
      "Peacemaker",
    ]),
    q("scare", "Things that scared kid-me", [
      "The dark",
      "Being left out",
      "Disappointing someone",
      "Loud adults",
    ]),
    q("proud", "Something I was secretly proud of", [
      "A sport",
      "Being funny",
      "Being smart",
      "Being kind when it was uncool",
    ]),
  ]),
  pack("social", "Friends & nights out", "Rooms, plans, and when I leave.", "#5B8CFF", [
    q("party", "At a party I", [
      "Find one person and camp",
      "Work the room",
      "Stay near the snacks",
      "Suggest we leave at a reasonable time",
    ]),
    q("plans", "Group plans I prefer", [
      "Small, three people max",
      "The more the merrier",
      "Last-minute yes",
      "I want an out baked in",
    ]),
    q("stranger", "Talking to strangers", [
      "Easy, I start it",
      "Fine if they start",
      "Please don’t make me",
      "I can, then I need a nap",
    ]),
    q("cancel", "I cancel plans when", [
      "I’m tired, honestly",
      "Almost never, I feel guilty",
      "The vibe feels off",
      "You want to stay in — that’s enough",
    ]),
    q("dance", "Dancing in public", [
      "Yes, immediately",
      "After two drinks",
      "Absolutely not",
      "Only if you do it first",
    ]),
    q("photo", "Group photos I", [
      "Hide",
      "Take them",
      "Care about the angle",
      "Don’t care, post anything",
    ]),
    q("home-time", "I want to go home when", [
      "I hit a quiet wall",
      "The food’s gone",
      "You look tired",
      "They start suggesting a second venue",
    ]),
    q("friend-fight", "If a friend upset me I’d", [
      "Talk it out fast",
      "Go quiet for a week",
      "Tell you first, then them",
      "Pretend I’m fine",
    ]),
    q("gift", "I give gifts that are", [
      "Useful",
      "Sentimental and a bit much",
      "Experiences",
      "Last-minute but weirdly perfect",
    ]),
    q("host", "Hosting at ours, I", [
      "Love it, I’m on",
      "Love the idea, hate the aftermath",
      "Want you to run it",
      "Prefer we go to theirs",
    ]),
  ]),
  pack("taste", "Guilty pleasures", "What I pretend I don’t like.", "#C084FC", [
    q("music-secret", "Music I won’t put on first", [
      "Embarrassing pop",
      "Country",
      "Musical theatre",
      "The same four sad songs",
    ]),
    q("show-secret", "A show I’d rewatch and not defend", [
      "Reality trash",
      "A kids’ movie",
      "A procedural I’ve seen all of",
      "Something extremely spicy",
    ]),
    q("shop", "I spend too much on", [
      "Food delivery",
      "Clothes / little treats",
      "Stuff for the house",
      "I don’t, and I judge us a bit",
    ]),
    q("scroll", "Late-night scroll of shame", [
      "Old photos",
      "People I don’t even like",
      "How-to videos I’ll never do",
      "Shopping I won’t buy",
    ]),
    q("game", "Competitive me comes out in", [
      "Board games",
      "Trivia",
      "Sport",
      "I say I don’t care and then I care",
    ]),
    q("fashion", "My real style", [
      "Comfy first",
      "A look, even at the shops",
      "Your hoodie",
      "I own one good outfit",
    ]),
    q("unpopular", "Unpopular opinion I hold", [
      "That restaurant is overrated",
      "That movie isn’t good",
      "Mornings are a scam",
      "Pineapple belongs / doesn’t — you know which",
    ]),
    q("celeb", "Celebrity I’d lose my mind meeting", [
      "A musician",
      "An actor from a comfort show",
      "An athlete",
      "I wouldn’t. I’d be weird and quiet.",
    ]),
    q("food-wrong", "A food I like “wrong”", [
      "Cold leftovers",
      "A dipping crime",
      "Something burnt",
      "A mix you find disgusting",
    ]),
    q("superstition", "I’m secretly superstitious about", [
      "Numbers / dates",
      "Don’t jinx it",
      "A lucky object",
      "I’m not, I just knock wood",
    ]),
  ]),
  pack("wild", "Would you rather", "Pick my real lean, not the cool one.", "#FB7185", [
    q("wyr-night", "I’d rather", [
      "A big night out",
      "A tiny perfect night in",
      "A last-minute drive",
      "Fall asleep at 9 and not apologise",
    ]),
    q("wyr-money", "If we got a surprise $200 I’d", [
      "Save it",
      "A nice dinner",
      "Something stupid and fun",
      "Split it and pretend to be responsible",
    ]),
    q("wyr-fame", "I’d rather be", [
      "A little famous",
      "Rich and unknown",
      "Really good at one niche thing",
      "Left alone with a garden",
    ]),
    q("wyr-super", "Useless superpower I’d take", [
      "Always know the wifi password",
      "Never lose my keys",
      "Perfect timing at lights",
      "Recall every lyric",
    ]),
    q("wyr-pet", "Dream extra pet", [
      "Dog",
      "Cat",
      "Something ridiculous",
      "A plant I name. That’s the pet.",
    ]),
    q("wyr-live", "I’d rather live", [
      "By the water",
      "In a city that doesn’t sleep",
      "Somewhere quiet with a garden",
      "Wherever you got a good job",
    ]),
    q("wyr-season", "My season", [
      "Summer",
      "Winter nest",
      "Autumn, obviously",
      "Spring, briefly, then I complain",
    ]),
    q("wyr-secret", "I’d rather you", [
      "Know all my search history",
      "Know my bank balance",
      "Hear my inner monologue for a day",
      "Meet every version of teenage me",
    ]),
    q("wyr-time", "Free hour, no phone", [
      "Nap",
      "Walk",
      "Make out / fool around",
      "Finally do the admin",
    ]),
    q("wyr-end", "End of a good day I want", [
      "To talk it to death",
      "To sit in it quietly",
      "To already plan the next one",
      "Dessert. Then sleep.",
    ]),
  ]),
];

function pack(
  id: string,
  title: string,
  blurb: string,
  accent: string,
  questions: KnowMeQuestion[]
): KnowMePack {
  return { id, title, blurb, accent, questions };
}

function q(
  id: string,
  prompt: string,
  options: [string, string, string, string]
): KnowMeQuestion {
  return { id, prompt, options };
}

export function knowMePackById(id: string): KnowMePack | null {
  return KNOW_ME_PACKS.find((item) => item.id === id) ?? null;
}

export function demoAnswersForPack(packId: string): number[] {
  const packItem = knowMePackById(packId);
  if (!packItem) return [];
  return packItem.questions.map((_, index) => (packId.charCodeAt(0) + index * 3) % 4);
}

export const DEMO_KNOW_ME_PACKS = ["everyday", "food", "us", "home"] as const;

export type KnowMeStatLine = {
  correct: number;
  asked: number;
  wins: number;
  guesses: number;
};

export function scoreKnowMe(answers: number[], guesses: number[]): number {
  const n = Math.min(answers.length, guesses.length);
  let score = 0;
  for (let i = 0; i < n; i += 1) {
    if (answers[i] === guesses[i]) score += 1;
  }
  return score;
}

export function sheetFor<T extends { packId: string; userId: string }>(
  sheets: T[],
  userId: string | null | undefined,
  packId: string
): T | null {
  if (!userId) return null;
  return sheets.find((row) => row.userId === userId && row.packId === packId) ?? null;
}

export function tallyKnowMeGuesses(
  guesses: { guesserId: string; score: number; guesses: number[] }[],
  userId: string | null | undefined
): KnowMeStatLine {
  const mine = guesses.filter((row) => row.guesserId === userId);
  return {
    correct: mine.reduce((sum, row) => sum + row.score, 0),
    asked: mine.reduce((sum, row) => sum + row.guesses.length, 0),
    wins: mine.filter((row) => row.score >= KNOW_ME_WIN).length,
    guesses: mine.length,
  };
}

export function latestGuess<T extends { packId: string; ownerId: string; guesserId: string; createdAt: string }>(
  guesses: T[],
  packId: string,
  ownerId: string,
  guesserId: string
): T | null {
  return (
    guesses.find(
      (row) =>
        row.packId === packId &&
        row.ownerId === ownerId &&
        row.guesserId === guesserId
    ) ?? null
  );
}
