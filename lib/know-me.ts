export type KnowMeQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
};

export type KnowMePack = {
  id: string;
  number: number;
  title: string;
  blurb: string;
  accent: string;
  foil: string;
  questions: KnowMeQuestion[];
};

export type KnowMeLane =
  | "locked"
  | "fill"
  | "wait"
  | "guess"
  | "waitGuess"
  | "done";

export const KNOW_ME_CARDS = 8;
export const KNOW_ME_WIN = 6;
export const KNOW_ME_PACK_COUNT = 20;

export const KNOW_ME_PACKS: KnowMePack[] = [
  pack(1, "everyday", "Everyday tells", "Mornings, phones, tiny habits.", "#C45C4A", "#E8A090", [
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
  pack(2, "food", "Food & drink", "Orders, cravings, fridge politics.", "#E06A32", "#F0A070", [
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
    q("snack", "The snack I will always say yes to", [
      "Chips",
      "Chocolate",
      "Cheese",
      "Fruit if you cut it up for me",
    ]),
  ]),
  pack(3, "us", "You & me", "How I love, fight, and cling.", "#D44878", "#F090B0", [
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
  pack(4, "comfort", "Comfort & stress", "What steadies me — and what doesn’t.", "#6B5CFF", "#A898F0", [
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
  pack(5, "weekends", "Weekends & travel", "Days off, trips, and how I wander.", "#2FA89A", "#7ED4C8", [
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
  ]),
  pack(6, "home", "At home", "Chores, nests, and the remote.", "#C4A056", "#E8D090", [
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
    q("sleep-side", "In bed I", [
      "Steal the duvet",
      "Run hot and kick it off",
      "Need a limb on you",
      "Need space or I overheat",
    ]),
  ]),
  pack(7, "childhood", "Growing up", "Kid me, still in here.", "#D4894A", "#F0C090", [
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
    q("sibling", "Sibling energy (or only-child)", [
      "I was the bossy one",
      "I was the baby",
      "Only child, full main character",
      "Peacemaker",
    ]),
    q("proud", "Something I was secretly proud of", [
      "A sport",
      "Being funny",
      "Being smart",
      "Being kind when it was uncool",
    ]),
  ]),
  pack(8, "social", "Friends & nights out", "Rooms, plans, and when I leave.", "#4A78D4", "#90B0F0", [
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
    q("home-time", "I want to go home when", [
      "I hit a quiet wall",
      "The food’s gone",
      "You look tired",
      "They start suggesting a second venue",
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
  pack(9, "taste", "Guilty pleasures", "What I pretend I don’t like.", "#9B6AD4", "#C8A8F0", [
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
    q("food-wrong", "A food I like “wrong”", [
      "Cold leftovers",
      "A dipping crime",
      "Something burnt",
      "A mix you find disgusting",
    ]),
  ]),
  pack(10, "wild", "Would you rather", "My real lean, not the cool one.", "#E06A7A", "#F0A0B0", [
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
    q("wyr-end", "End of a good day I want", [
      "To talk it to death",
      "To sit in it quietly",
      "To already plan the next one",
      "Dessert. Then sleep.",
    ]),
  ]),
  pack(11, "work", "Work & money", "Jobs, spending, Sunday-night brain.", "#4A8B6A", "#90C8A8", [
    q("job", "About work I am", [
      "I talk about it too much",
      "I leave it at the door",
      "I complain, then I love it",
      "I don’t want to think about it at home",
    ]),
    q("money-feel", "Money conversations make me", [
      "Calm if there’s a plan",
      "Avoidant, then suddenly intense",
      "The spreadsheet person",
      "The “it’ll be fine” person",
    ]),
    q("splurge", "If I splurge, it’s on", [
      "Us — a night out",
      "Something for the house",
      "A little treat for me",
      "I don’t. I feel it later.",
    ]),
    q("cheap", "I’m cheap about", [
      "Coffee out",
      "Clothes",
      "Utilities / lights",
      "I’m not cheap, I’m “intentional”",
    ]),
    q("ambition", "The ambition that still nips me", [
      "A title / promotion",
      "Making something of my own",
      "Having more time, not more status",
      "I don’t care about climbing",
    ]),
    q("payday", "Payday energy is", [
      "Quiet relief",
      "Let’s spend a bit",
      "I forget until the account pings",
      "I already spent it in my head",
    ]),
    q("advice", "Work advice from you lands if", [
      "You ask first",
      "You’re blunt",
      "You just listen",
      "You distract me instead",
    ]),
    q("retire", "Dream version of “made it”", [
      "A house that feels finished",
      "Travel without counting",
      "A job I don’t dread",
      "Days that aren’t rushed",
    ]),
  ]),
  pack(12, "body", "Sleep & body", "Energy, gyms, and the 4pm slump.", "#7A9BB8", "#B8D0E0", [
    q("sleep-need", "I actually need", [
      "Eight hours or I’m a problem",
      "I can run on six and lie about it",
      "Naps are a personality",
      "Sleep is a negotiation every night",
    ]),
    q("gym", "Moving my body, honestly", [
      "I like a real workout",
      "Walks count and I will die on that hill",
      "I start routines and ghost them",
      "I move if it’s fun, not if it’s a plan",
    ]),
    q("energy", "My energy peaks", [
      "Morning",
      "Late afternoon",
      "Night, unfortunately",
      "Unpredictable. Weather, food, vibes.",
    ]),
    q("mirror", "Looking in the mirror I", [
      "Clock the outfit, move on",
      "Find one thing to hate",
      "Need a pep talk, then I’m fine",
      "I avoid it more than I’ll admit",
    ]),
    q("sick-tell", "You know I’m rundown when I", [
      "Go quiet",
      "Get snappy",
      "Sleep at weird hours",
      "Start researching vitamins",
    ]),
    q("food-body", "How food and mood connect for me", [
      "Skip a meal and I unravel",
      "I eat my feelings, named",
      "I forget to eat, then crash",
      "Pretty steady, annoyingly",
    ]),
    q("touch-body", "The body stuff I actually like", [
      "A proper massage",
      "Hair / scalp",
      "Feet, don’t knock it",
      "Just hold me, skip the technique",
    ]),
    q("age", "Thinking about getting older I", [
      "I’m into it",
      "I joke so I don’t spiral",
      "I don’t think about it",
      "I want us to be cute about it",
    ]),
  ]),
  pack(13, "media", "Music & screens", "Aux, algorithms, and one more episode.", "#C44A6A", "#E890A8", [
    q("aux", "In the car the aux goes to", [
      "Me, obviously",
      "You, I trust you",
      "Whoever didn’t pick last time",
      "A shared playlist we both pretend to like",
    ]),
    q("song", "A song that still gets me", [
      "A high-school one",
      "Whatever was on when we met",
      "Something embarrassing and catchy",
      "I don’t have a song. I have 40.",
    ]),
    q("movie", "Movie night I want", [
      "Comfort rewatch",
      "Something new and good",
      "Trash, proudly",
      "I talk through it. Sorry.",
    ]),
    q("phone-bed", "Phone in bed I", [
      "Shouldn’t, still do",
      "Charge it across the room",
      "Scroll until you sigh",
      "Use it as a flashlight and a clock",
    ]),
    q("podcast", "Podcasts", [
      "I’m in too deep",
      "Only on walks / chores",
      "You put them on, I half listen",
      "Can’t. Need music or silence.",
    ]),
    q("game-screen", "Games / apps I disappear into", [
      "A real video game",
      "A stupid phone game",
      "Socials, which is worse",
      "I don’t. I watch you play.",
    ]),
    q("photo", "Photos of us I", [
      "Take too many",
      "Never take, then regret",
      "Want them printed, actually",
      "Live for a story, then they’re gone",
    ]),
    q("mute", "When I need quiet I", [
      "Headphones",
      "Leave the room",
      "Ask, nicely then less nicely",
      "Turn into a statue on the couch",
    ]),
  ]),
  pack(14, "after-dark", "After dark", "Want, timing, and how I ask.", "#8B3A5A", "#D080A0", [
    q("initiate", "I usually start something by", [
      "Saying it",
      "A look / a touch",
      "Waiting for you, then lighting up",
      "A joke that isn’t really a joke",
    ]),
    q("timing", "The time of day I’m actually in the mood", [
      "Morning, before the day lands",
      "After dinner, lights low",
      "Late, when the house is quiet",
      "Unscheduled. Catch me.",
    ]),
    q("turn-on", "The thing that actually works on me", [
      "Attention all day, not a sudden switch",
      "You looking done-up / smelling good",
      "A direct text",
      "Laughter, then it tips",
    ]),
    q("turn-off", "Instant freeze for me is", [
      "Feeling rushed",
      "A messy room / to-do list in my head",
      "Being teased in the wrong tone",
      "If we just argued and skipped the repair",
    ]),
    q("after", "Right after, I want", [
      "To talk",
      "To be held and not talk",
      "A snack, I’m not kidding",
      "Sleep. Immediately.",
    ]),
    q("ask", "If I want something new I", [
      "Just say it",
      "Hint until you guess",
      "Need you to ask me questions",
      "Write it down somewhere we both see",
    ]),
    q("frequency", "My honest frequency wish", [
      "More than we do",
      "About where we are",
      "Quality over calendar",
      "I go through seasons",
    ]),
    q("morning-after", "The morning after a good night I", [
      "Get shy",
      "Get clingy",
      "Act normal on purpose",
      "Want round two of breakfast, not that",
    ]),
  ]),
  pack(15, "future", "The long game", "Houses, kids-or-not, five-year fog.", "#3A6A8B", "#88B4D0", [
    q("house", "Dream home energy is", [
      "A project we fix up",
      "Already nice, please",
      "Small and ours",
      "I care more about the street than the kitchen",
    ]),
    q("kids", "Kids, my real temperature", [
      "Yes, I can see it",
      "Maybe, later, don’t pin me",
      "No, and I need that respected",
      "I change depending on the week, which is annoying",
    ]),
    q("city", "In five years I see us", [
      "Still here, deeper roots",
      "A new city",
      "More travel than address",
      "I don’t see it. I feel it.",
    ]),
    q("old", "Old-us, if we’re lucky", [
      "Still bickering in a kitchen",
      "Quiet and weirdly stylish",
      "On a porch bothering neighbours",
      "I can’t picture it and that scares me a bit",
    ]),
    q("risk", "A risk I’d actually take with you", [
      "A move",
      "A job change",
      "A year of less plan, more try",
      "I’m the seatbelt. You’re the risk.",
    ]),
    q("name", "If we named something after us it would be", [
      "A playlist",
      "A recipe",
      "A terrible indoor plant",
      "A running joke, not an object",
    ]),
    q("fight-future", "The future fight I want us to skip", [
      "Money scorekeeping",
      "Who sacrificed more",
      "Becoming roommates",
      "Never going anywhere new",
    ]),
    q("promise", "A promise that would actually land", [
      "I’ll tell you the hard thing sooner",
      "I’ll keep making plans",
      "I’ll keep wanting you on purpose",
      "I’ll remember the small stuff",
    ]),
  ]),
  pack(16, "people", "People I love", "Family, friends, and who I call.", "#B86A3A", "#E0A878", [
    q("call", "When something good happens I call", [
      "You first, always",
      "A parent",
      "A specific friend",
      "I sit with it, then I tell you",
    ]),
    q("family-now", "My family, currently", [
      "Close, for better and worse",
      "Love them from a distance",
      "Complicated, don’t simplify it",
      "You’re the family I picked",
    ]),
    q("friend", "My closest friend is", [
      "Someone from years ago",
      "Someone new-ish who gets it",
      "A group, not a person",
      "Mostly you. That’s a lot. I know.",
    ]),
    q("intro", "Introducing you to people I", [
      "Show you off",
      "Get nervous they’ll be weird",
      "Want it small and controlled",
      "Forget names. Help me.",
    ]),
    q("advice-who", "Advice about us I would take from", [
      "Almost nobody",
      "One friend who knows me",
      "A parent, selectively",
      "A stranger on the internet, unfortunately",
    ]),
    q("alone", "Time with other people vs us", [
      "I need friends or I get odd",
      "You are plenty",
      "I need both, scheduled",
      "I overbook, then I miss you",
    ]),
    q("text-them", "I go quiet on friends when", [
      "I’m in a hole",
      "We’re in a good us-bubble",
      "I have nothing fun to report",
      "I don’t. I’m the reliable one.",
    ]),
    q("hurt", "If someone I love hurt me you’d see", [
      "Anger",
      "A shutdown",
      "Jokes",
      "I’d need you to hate them a little with me",
    ]),
  ]),
  pack(17, "holidays", "Holidays & seasons", "Traditions I actually keep.", "#C43A3A", "#E87878", [
    q("xmas", "Christmas I want", [
      "Big, decorated, extra",
      "Small, just us",
      "Family obligation, then we escape",
      "I like the food and the lights. That’s it.",
    ]),
    q("birthday", "On my birthday I want", [
      "A fuss",
      "One perfect thing, not a circus",
      "To be surprised",
      "To pretend I don’t care, then I do",
    ]),
    q("nye", "New Year’s Eve I", [
      "Want a plan",
      "Want pajamas",
      "Want to kiss you at midnight, corny",
      "Fall asleep before the ball drops",
    ]),
    q("summer", "Peak summer me is", [
      "Outside, slightly sunburnt",
      "In the AC with a drink",
      "A trip, any trip",
      "Complaining about heat, still outside",
    ]),
    q("winter", "Peak winter me is", [
      "Nesting",
      "Still dragging us out",
      "Soup and early nights",
      "Sad in a cute way until January 15",
    ]),
    q("tradition", "A tradition I want us to keep", [
      "A specific meal",
      "A yearly trip",
      "A stupid movie",
      "We don’t have one yet. That’s the task.",
    ]),
    q("gift-day", "Holiday gifts I", [
      "Plan months out",
      "Panic-buy and somehow nail it",
      "Want experiences",
      "Want you to tell me exactly",
    ]),
    q("off", "A day off that isn’t a holiday I spend", [
      "Errands, unfortunately",
      "Doing nothing on purpose",
      "A project",
      "Whatever you pick if you pick it",
    ]),
  ]),
  pack(18, "memory", "Memory lane", "Firsts, tells, and what I keep.", "#6A5A9B", "#B0A0D8", [
    q("meet", "When we met I", [
      "Knew pretty fast",
      "Was cautious, then all in",
      "Played it cooler than I felt",
      "Don’t remember the details, remember the feeling",
    ]),
    q("first-date", "Our kind of first date, in my head, was", [
      "Talking too much",
      "Awkward then good",
      "Easy, like we’d done it",
      "I was performing a little",
    ]),
    q("keep", "I keep mementos", [
      "Ticket stubs, notes, junk with a story",
      "Photos, that’s the archive",
      "In my head, I swear",
      "I throw things away and then miss them",
    ]),
    q("song-us", "A song that’s ours", [
      "We have one",
      "We should",
      "I have one, you might not know",
      "Every song we ruin in the car",
    ]),
    q("fight-first", "Our first real fight was about", [
      "Something small that wasn’t small",
      "Time / attention",
      "A misread text",
      "I remember the feeling more than the topic",
    ]),
    q("proud-us", "A moment I was proud of us", [
      "A hard conversation we didn’t dodge",
      "A trip that worked",
      "Showing up for each other’s people",
      "An ordinary Tuesday that felt like a win",
    ]),
    q("tell", "A tell I had at the start you might’ve missed", [
      "I asked a lot of questions",
      "I went quiet when I liked you",
      "I made plans too fast",
      "I teased instead of saying it",
    ]),
    q("rewrite", "If I could redo one early thing", [
      "Say the real thing sooner",
      "Slow down",
      "Be less cool, more honest",
      "Nothing. The mess is the plot.",
    ]),
  ]),
  pack(19, "petty", "Petty opinions", "Hills I will die on.", "#3A8B7A", "#88D0C0", [
    q("food-hill", "A food hill I die on", [
      "That sauce doesn’t belong there",
      "Coriander is a crime / a gift",
      "Well-done steak is a tragedy",
      "Cereal is a valid dinner",
    ]),
    q("drive", "As a passenger I", [
      "Backseat drive, I know",
      "Fall asleep",
      "Need to pick the music",
      "I’m a delight. Don’t look at me like that.",
    ]),
    q("cold", "I am too cold in this house because", [
      "You are a furnace",
      "The windows",
      "I refuse a jumper on principle",
      "I’m not. You’re too hot.",
    ]),
    q("show", "A show/movie you like that I", [
      "Tolerate for you",
      "Secretly like now",
      "Will never get",
      "Will quote ironically forever",
    ]),
    q("chore-petty", "The chore I think you overrate", [
      "How often the sheets need doing",
      "How empty the dishwasher is",
      "“I’ll do it later” as a system",
      "The way you fold",
    ]),
    q("correct", "I am annoyingly correct about", [
      "Directions",
      "What we said yesterday",
      "How long something will take",
      "Whether that’ll fit in the fridge",
    ]),
    q("leave", "Leaving a party I", [
      "Do a slow Irish goodbye",
      "Announce it three times",
      "Need you to start the exit",
      "I’m in the car already",
    ]),
    q("right", "When I’m wrong I", [
      "Admit it fast",
      "Need a minute, then I admit it",
      "Make a joke and hope that counts",
      "You know. I double down first.",
    ]),
  ]),
  pack(20, "chaos", "Wildcard", "The pack with no genre.", "#D4A02A", "#F0D878", [
    q("superstition", "I’m secretly superstitious about", [
      "Numbers / dates",
      "Don’t jinx it",
      "A lucky object",
      "I’m not, I just knock wood",
    ]),
    q("celeb", "Celebrity I’d lose my mind meeting", [
      "A musician",
      "An actor from a comfort show",
      "An athlete",
      "I wouldn’t. I’d be weird and quiet.",
    ]),
    q("pet-dream", "Dream extra pet", [
      "Dog",
      "Cat",
      "Something ridiculous",
      "A plant I name. That’s the pet.",
    ]),
    q("time-off", "Free hour, no phone", [
      "Nap",
      "Walk",
      "Make out / fool around",
      "Finally do the admin",
    ]),
    q("secret-skill", "A useless skill I have", [
      "Remembering lyrics",
      "Guessing the time",
      "Impressions / bits",
      "Finding things you lost",
    ]),
    q("apocalypse", "In a mild apocalypse I", [
      "Would be surprisingly useful",
      "Would panic, then be useful",
      "Would be the morale",
      "Would need you to be the plan",
    ]),
    q("tattoo", "A tattoo of us would be", [
      "Cute if small",
      "Never, don’t",
      "A joke only we get",
      "I already thought about it",
    ]),
    q("last", "The last card: what I want you to remember", [
      "I like you even on the boring days",
      "Please keep surprising me a little",
      "Tell me the true thing",
      "Keep making the house feel like ours",
    ]),
  ]),
];

function pack(
  number: number,
  id: string,
  title: string,
  blurb: string,
  accent: string,
  foil: string,
  questions: KnowMeQuestion[]
): KnowMePack {
  return { id, number, title, blurb, accent, foil, questions };
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

export function latestGuess<
  T extends { packId: string; ownerId: string; guesserId: string; createdAt: string },
>(
  guesses: T[],
  packId: string,
  ownerId: string | null | undefined,
  guesserId: string | null | undefined
): T | null {
  if (!ownerId || !guesserId) return null;
  return (
    guesses.find(
      (row) =>
        row.packId === packId &&
        row.ownerId === ownerId &&
        row.guesserId === guesserId
    ) ?? null
  );
}

export function packLane(input: {
  pack: KnowMePack;
  sheets: { packId: string; userId: string }[];
  guesses: { packId: string; ownerId: string; guesserId: string; createdAt: string }[];
  userId: string | null | undefined;
  partnerId: string | null | undefined;
}): KnowMeLane {
  const { pack: current, sheets, guesses, userId, partnerId } = input;
  const index = KNOW_ME_PACKS.findIndex((row) => row.id === current.id);
  if (index < 0) return "locked";
  if (index > 0) {
    const prev = KNOW_ME_PACKS[index - 1]!;
    if (packLane({ ...input, pack: prev }) !== "done") return "locked";
  }
  const mine = sheetFor(sheets, userId, current.id);
  const theirs = sheetFor(sheets, partnerId, current.id);
  const myGuess = latestGuess(guesses, current.id, partnerId, userId);
  const theirGuess = latestGuess(guesses, current.id, userId, partnerId);
  if (!mine) return "fill";
  if (!theirs) return "wait";
  if (!myGuess) return "guess";
  if (!theirGuess) return "waitGuess";
  return "done";
}

export function laneLabel(lane: KnowMeLane, them: string): string {
  switch (lane) {
    case "locked":
      return "Sealed";
    case "fill":
      return "Rip yours";
    case "wait":
      return `Waiting on ${them}`;
    case "guess":
      return `Guess ${them}`;
    case "waitGuess":
      return `${them} still guessing`;
    case "done":
      return "In the binder";
  }
}

