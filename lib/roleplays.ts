export type RoleplayCategoryId =
  | "micro-escapes"
  | "nostalgia"
  | "stress-busters"
  | "everyday-surprises"
  | "quality-time";

export type Roleplay = {
  id: string;
  name: string;
  category: RoleplayCategoryId;
  blurb: string;
  /** Filename stem under assets/images/roleplays/ (no .png). */
  image: string;
};

export type RoleplayCategory = {
  id: RoleplayCategoryId;
  label: string;
  detail: string;
  icon: string;
};

export const ROLEPLAY_CATEGORIES: RoleplayCategory[] = [
  {
    id: "micro-escapes",
    label: "Micro-Escapes",
    detail: "Personal space, resets, guilt-free alone time",
    icon: "leaf-outline",
  },
  {
    id: "nostalgia",
    label: "Nostalgia & Fun",
    detail: "Playful, competitive, childlike energy",
    icon: "game-controller-outline",
  },
  {
    id: "stress-busters",
    label: "Stress Busters",
    detail: "Relief when life gets loud",
    icon: "heart-circle-outline",
  },
  {
    id: "everyday-surprises",
    label: "Everyday Surprises",
    detail: "Small unexpected weekday brighteners",
    icon: "gift-outline",
  },
  {
    id: "quality-time",
    label: "Quality Time",
    detail: "Deep talk, shared memories, closeness",
    icon: "chatbubbles-outline",
  },
];

export const ROLEPLAYS: Roleplay[] = [
  // Micro-Escapes & Self-Care
  {
    id: "guilt-free-solo",
    name: "Guilt-Free Solo Hour",
    category: "micro-escapes",
    blurb:
      "1 hour of zero interruptions where your partner handles everything while you do whatever you want.",
    image: "guilt-free-solo",
  },
  {
    id: "quiet-reading",
    name: "Quiet Reading / Scrolling Pass",
    category: "micro-escapes",
    blurb:
      "Immunity from household chatter or requests for 45 minutes while you unwind.",
    image: "quiet-reading",
  },
  {
    id: "hobby-sprint",
    name: "Hobby Sprint",
    category: "micro-escapes",
    blurb:
      "Your partner covers routine responsibilities so you can spend two uninterrupted hours on a project or hobby.",
    image: "hobby-sprint",
  },
  {
    id: "hot-shower-lockout",
    name: "Long Hot Shower Lockout",
    category: "micro-escapes",
    blurb:
      "Complete quiet and zero bathroom interruptions for as long as a hot shower takes.",
    image: "hot-shower-lockout",
  },
  {
    id: "solo-drive-coffee",
    name: "Solo Drive / Coffee Break",
    category: "micro-escapes",
    blurb:
      "Take the car, get your favorite beverage, and sit somewhere quiet for an hour on your own.",
    image: "solo-drive-coffee",
  },
  {
    id: "sleep-in",
    name: "Sleep-In Exemption",
    category: "micro-escapes",
    blurb:
      "Pass this to stay in bed extra late on a weekend morning without explaining why.",
    image: "sleep-in",
  },
  {
    id: "digital-fast",
    name: "Digital Fast Pass",
    category: "micro-escapes",
    blurb:
      "Declare a 2-hour window where you don't have to reply to texts, check emails, or look at your phone.",
    image: "digital-fast",
  },
  {
    id: "hammock-reset",
    name: "Hammock / Porch Reset",
    category: "micro-escapes",
    blurb:
      "Your partner brings you a cold drink while you sit outside and do nothing for 30 minutes.",
    image: "hammock-reset",
  },
  {
    id: "zero-decibel",
    name: "Zero-Decibel Evening",
    category: "micro-escapes",
    blurb:
      "30 minutes of absolute silence around the house while you decompress after a long day.",
    image: "zero-decibel",
  },
  {
    id: "early-night",
    name: "Early Night Out-Of-Duty",
    category: "micro-escapes",
    blurb:
      "Redeem to go to bed as early as you want, leaving all closing-up tasks to your partner.",
    image: "early-night",
  },

  // Nostalgia & Fun
  {
    id: "arcade-night",
    name: "Arcade / Games Night",
    category: "nostalgia",
    blurb:
      "Head to an arcade, bowling alley, or set up retro games at home for a play session.",
    image: "arcade-night",
  },
  {
    id: "childhood-snacks",
    name: "Childhood Snack Nostalgia",
    category: "nostalgia",
    blurb:
      "Your partner tracks down and buys three nostalgic snacks from your past.",
    image: "childhood-snacks",
  },
  {
    id: "retro-movie",
    name: "Retro Movie Marathon",
    category: "nostalgia",
    blurb:
      "You pick two movies from your childhood or teenage years to watch back-to-back.",
    image: "retro-movie",
  },
  {
    id: "gaming-buddy",
    name: "Playstation / Gaming Buddy",
    category: "nostalgia",
    blurb:
      "Your partner agrees to play co-op or multiplayer games with you for an hour.",
    image: "gaming-buddy",
  },
  {
    id: "lego-puzzle",
    name: "Lego / Puzzle Build",
    category: "nostalgia",
    blurb:
      "Spend a quiet evening putting together a set or puzzle while listening to music.",
    image: "lego-puzzle",
  },
  {
    id: "ice-cream-run",
    name: "Ice Cream Parlour Run",
    category: "nostalgia",
    blurb:
      "Grab a waffle cone or sundae from a local parlor, no matter the time of night.",
    image: "ice-cream-run",
  },
  {
    id: "show-and-tell",
    name: "Show-and-Tell Night",
    category: "nostalgia",
    blurb:
      "Show your partner your favorite old music videos, classic clips, or photo albums.",
    image: "show-and-tell",
  },
  {
    id: "mini-golf-trivia",
    name: "Mini-Golf / Trivia Challenge",
    category: "nostalgia",
    blurb:
      "Redeem for a quick mini-golf round or local pub trivia night together.",
    image: "mini-golf-trivia",
  },
  {
    id: "comfort-food",
    name: "Comfort Food Dinner",
    category: "nostalgia",
    blurb: "Request a meal that tastes like home or a favorite childhood dish.",
    image: "comfort-food",
  },
  {
    id: "board-game-rematch",
    name: "Board Game Rematch",
    category: "nostalgia",
    blurb:
      "Instantly trigger a rematch on any tabletop or card game you lost recently.",
    image: "board-game-rematch",
  },

  // Stress Busters & Relief
  {
    id: "venting-vault",
    name: "Venting Vault",
    category: "stress-busters",
    blurb:
      "15 minutes to complain about work or life with guaranteed validation and zero advice.",
    image: "venting-vault",
  },
  {
    id: "emergency-hug",
    name: "Emergency Hug Hold",
    category: "stress-busters",
    blurb:
      "Hold a continuous 2-minute embrace whenever you need an instant reset.",
    image: "emergency-hug",
  },
  {
    id: "decision-free",
    name: "Decision-Free Evening",
    category: "stress-busters",
    blurb:
      "Your partner makes every single minor decision (what to eat, watch, or do) for the rest of the night.",
    image: "decision-free",
  },
  {
    id: "head-massage",
    name: "Head Massage on Demand",
    category: "stress-busters",
    blurb:
      "A 10-minute quiet scalp massage when a headache or stress hits.",
    image: "head-massage",
  },
  {
    id: "comfort-item",
    name: "Priority Comfort Item",
    category: "stress-busters",
    blurb:
      "Your partner fetches a warm blanket, heat pack, or fresh socks without you asking twice.",
    image: "comfort-item",
  },
  {
    id: "brainstorm",
    name: "Problem-Solving Brainstorm",
    category: "stress-busters",
    blurb:
      "Sit down for 20 minutes while your partner helps you map out a solution to something stressing you out.",
    image: "brainstorm",
  },
  {
    id: "peace-quiet",
    name: "Peace & Quiet Guarantee",
    category: "stress-busters",
    blurb:
      "Immediate noise reduction in the house for 1 hour when you're overwhelmed.",
    image: "peace-quiet",
  },
  {
    id: "no-questions",
    name: "No-Questions Answered",
    category: "stress-busters",
    blurb:
      "Get out of explaining why you're in a mood — your partner simply offers a hug or space.",
    image: "no-questions",
  },
  {
    id: "heavy-lifting",
    name: "Heavy Lifting Pass",
    category: "stress-busters",
    blurb:
      "Your partner handles moving, carrying, or lifting heavy items for the day.",
    image: "heavy-lifting",
  },
  {
    id: "tea-cocoa",
    name: "Tea / Cocoa Remedy",
    category: "stress-busters",
    blurb:
      "A fresh hot drink delivered whenever you express that you've had a tough moment.",
    image: "tea-cocoa",
  },

  // Everyday Surprises
  {
    id: "hidden-notes",
    name: "Hidden Note Hunt",
    category: "everyday-surprises",
    blurb:
      "Your partner hides three sweet or funny notes in your bag, car, or pockets for you to find.",
    image: "rp-hidden-notes",
  },
  {
    id: "surprise-treat",
    name: "Surprise Treat in Bag",
    category: "everyday-surprises",
    blurb:
      "Your partner sneaks your favorite chocolate or snack into your work bag.",
    image: "rp-surprise-treat",
  },
  {
    id: "playlist",
    name: "Playlist Dedicated to You",
    category: "everyday-surprises",
    blurb:
      "Your partner curates a 10-song custom playlist tailored specifically to your taste.",
    image: "rp-playlist",
  },
  {
    id: "morning-coffee",
    name: "Custom Morning Coffee",
    category: "everyday-surprises",
    blurb:
      "Wake up to your favorite coffee prepared exactly how you like it before you ask.",
    image: "rp-morning-coffee",
  },
  {
    id: "gas-fill",
    name: "Car Gas Tank Fill-Up",
    category: "everyday-surprises",
    blurb:
      "Your partner takes your car to the station and returns it with a full tank.",
    image: "rp-gas-fill",
  },
  {
    id: "desk-tidy",
    name: "Desk Pickup Service",
    category: "everyday-surprises",
    blurb:
      "Your partner tidies your desk area or workspace while you take a break.",
    image: "rp-desk-tidy",
  },
  {
    id: "fresh-sheets",
    name: "Fresh Sheets Upgrade",
    category: "everyday-surprises",
    blurb:
      "Bed made with freshly washed sheets ready for you at the end of the day.",
    image: "rp-fresh-sheets",
  },
  {
    id: "snack-drop",
    name: "Favorite Local Snack Drop",
    category: "everyday-surprises",
    blurb:
      "Your partner drops off a fresh bakery treat or lunch item at your workspace.",
    image: "rp-snack-drop",
  },
  {
    id: "midday-text",
    name: "Mid-Day Check-in Text",
    category: "everyday-surprises",
    blurb:
      "A thoughtful message during a busy workday simply to tell you you're doing great.",
    image: "rp-midday-text",
  },
  {
    id: "flowers",
    name: "Flower / Plant Pick-Me-Up",
    category: "everyday-surprises",
    blurb:
      "A small bouquet or potted plant brought home on a random weekday.",
    image: "rp-flowers",
  },

  // Quality Time & Deep Connection
  {
    id: "deep-dive",
    name: "Deep Dive Q&A",
    category: "quality-time",
    blurb:
      "Spend 30 minutes asking each other open-ended connection questions over a drink.",
    image: "rp-deep-dive",
  },
  {
    id: "sunset",
    name: "Sunset / Sunrise View",
    category: "quality-time",
    blurb:
      "Drive to a local spot to watch the sun go down or come up together.",
    image: "rp-sunset",
  },
  {
    id: "dream-plan",
    name: "Dream Planning Session",
    category: "quality-time",
    blurb:
      "Sit down with notebooks and talk about future travel, home projects, or long-term goals.",
    image: "rp-dream-plan",
  },
  {
    id: "porch-sit",
    name: "Unplugged Porch Sit",
    category: "quality-time",
    blurb:
      "30 minutes sitting outside together chatting with zero phones or screens present.",
    image: "rp-porch-sit",
  },
  {
    id: "gratitude",
    name: "Gratitude Exchange",
    category: "quality-time",
    blurb:
      "Share five specific things you deeply appreciate about each other right now.",
    image: "rp-gratitude",
  },
  {
    id: "memory-drive",
    name: "Memory Lane Drive",
    category: "quality-time",
    blurb:
      "Drive around meaningful local spots (where you first met, first date, early memories).",
    image: "rp-memory-drive",
  },
  {
    id: "podcast",
    name: "Shared Podcast / Audio Book",
    category: "quality-time",
    blurb:
      "Listen to an episode of an interesting podcast or audiobook chapter together while relaxing.",
    image: "rp-podcast",
  },
  {
    id: "cook-together",
    name: "Cook Together Class at Home",
    category: "quality-time",
    blurb:
      "Pick a brand-new recipe you've never tried and cook it as a team.",
    image: "rp-cook-together",
  },
  {
    id: "stargaze",
    name: "Stargazing & Music",
    category: "quality-time",
    blurb:
      "Lay out a blanket in the yard or balcony with music playing softly in the background.",
    image: "rp-stargaze",
  },
  {
    id: "photo-album",
    name: "Photo Album Review",
    category: "quality-time",
    blurb:
      "Scroll through photos from a favorite trip or year past and reminisce.",
    image: "rp-photo-album",
  },
];

export function roleplaysInCategories(ids: RoleplayCategoryId[]): Roleplay[] {
  const set = new Set(ids);
  return ROLEPLAYS.filter((row) => set.has(row.category));
}

export function roleplayById(id: string): Roleplay | null {
  return ROLEPLAYS.find((row) => row.id === id) ?? null;
}

export function categoryMeta(id: RoleplayCategoryId): RoleplayCategory | null {
  return ROLEPLAY_CATEGORIES.find((row) => row.id === id) ?? null;
}

export function pickRandomRoleplay(
  categories: RoleplayCategoryId[],
  excludeId?: string | null
): Roleplay | null {
  const pool = roleplaysInCategories(categories).filter(
    (row) => row.id !== excludeId
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
