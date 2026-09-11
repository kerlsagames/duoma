import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type HubId = "connect" | "desire" | "play" | "home-base";

export type HubFeature = {
  id: string;
  label: string;
  detail: string;
  icon: IconName;
  href: string;
};

export type HubDef = {
  id: HubId;
  label: string;
  tagline: string;
  icon: IconName;
  accent: string;
  accentSoft: string;
  /** Solid tile fill on the home grid — each hub should read as a different colour. */
  tile: string;
  /** Text/icon colour on top of `tile`. */
  tileInk: string;
  href: string;
  features: HubFeature[];
};

/** Persistent top widgets on the home dashboard (outside the 4 hubs). */
export const HOME_HEADER_WIDGETS = [
  {
    id: "check-in",
    label: "Daily Check-In",
    detail: "Energy, mood radar, stress & what you need",
    icon: "battery-charging" as IconName,
    href: "/hub/check-in",
    accent: "#3ECFBF",
  },
  {
    id: "calendar",
    label: "Calendar & Countdowns",
    detail: "Shared events, dates & milestones",
    icon: "calendar" as IconName,
    href: "/hub/calendar",
    accent: "#F0A46A",
  },
] as const;

export const HUBS: HubDef[] = [
  {
    id: "connect",
    label: "Connect",
    tagline: "Talk, listen, appreciate",
    icon: "heart",
    accent: "#FF6B9A",
    accentSoft: "rgba(255,107,154,0.16)",
    tile: "#FF6B9A",
    tileInk: "#1A0810",
    href: "/hub/connect",
    features: [
      {
        id: "lists",
        label: "Lists & Wishlist",
        detail: "Sizes, gifts, coffee orders, running wants",
        icon: "map",
        href: "/hub/lists",
      },
      {
        id: "date-night",
        label: "Date Night Generator",
        detail: "Build-a-date spinner: venue, activity & playful rule",
        icon: "wine",
        href: "/hub/planner",
      },
      {
        id: "curiosity",
        label: "Curiosity Deck",
        detail: "Daily curiosity questions",
        icon: "sparkles",
        href: "/hub/curiosity",
      },
      {
        id: "talk",
        label: "Talk To Me",
        detail: "Structured conversation decks",
        icon: "chatbubbles",
        href: "/hub/talk",
      },
      {
        id: "jar",
        label: "Gratitude Jar",
        detail: "1-sentence appreciations → memory timeline",
        icon: "file-tray",
        href: "/hub/jar",
      },
      {
        id: "apology",
        label: "Apology & Reset",
        detail: "Low-ego truce request / reset signal",
        icon: "refresh",
        href: "/hub/apology",
      },
      {
        id: "thought-pings",
        label: "Thought-of-You Pings",
        detail: "Low-pressure haptic / heart buzz to their phone",
        icon: "notifications",
        href: "/hub/thought-pings",
      },
    ],
  },
  {
    id: "desire",
    label: "Desire",
    tagline: "Heat, fantasy, after dark",
    icon: "flame",
    accent: "#FF4D6A",
    accentSoft: "rgba(255,77,106,0.22)",
    tile: "#FF4D6A",
    tileInk: "#1A0508",
    href: "/hub/desire",
    features: [
      {
        id: "spicy",
        label: "Spicy Game",
        detail: "Custom intimacy challenges & dares",
        icon: "flame",
        href: "/game/setup",
      },
      {
        id: "up-for-it",
        label: "Dare Me",
        detail: "Challenges & dares — send one or take one",
        icon: "flash",
        href: "/hub/up-for-it",
      },
      {
        id: "roleplays",
        label: "Roleplays",
        detail: "Scenarios & dynamic decks",
        icon: "sparkles",
        href: "/hub/roleplays",
      },
      {
        id: "positions",
        label: "Positions Guide",
        detail: "Illustrated pose guide",
        icon: "body",
        href: "/hub/positions",
      },
      {
        id: "fantasy-matcher",
        label: "Fantasy Matcher",
        detail: "Tinder-style swipe deck — matches only when both say yes",
        icon: "heart-circle",
        href: "/hub/fantasy-matcher",
      },
      {
        id: "secret-signals",
        label: "Secret Signal Codes",
        detail: "Custom emojis & private phrases",
        icon: "key",
        href: "/hub/secret-signals",
      },
      {
        id: "audio-vault",
        label: "Audio Voice Notes",
        detail: "Protected folder for private audio & bedtime stories",
        icon: "mic",
        href: "/hub/audio-vault",
      },
      {
        id: "intimacy-streak",
        label: "Intimacy Streak Tracker",
        detail: "Track connection, date nights & deep talks over time",
        icon: "flame",
        href: "/hub/intimacy-streak",
      },
    ],
  },
  {
    id: "play",
    label: "Fun",
    tagline: "Games, bets & playful rewards",
    icon: "game-controller",
    accent: "#F0C75E",
    accentSoft: "rgba(240,199,94,0.22)",
    tile: "#F0C75E",
    tileInk: "#1A1405",
    href: "/hub/play",
    features: [
      {
        id: "coupons",
        label: "Coupons",
        detail: "Digital favors & redeemable vouchers",
        icon: "ticket",
        href: "/hub/coupons",
      },
      {
        id: "trivia",
        label: "How Well Do You Know Me?",
        detail: "10 packs. Answer yours. Guess theirs.",
        icon: "help-circle",
        href: "/hub/trivia",
      },
      {
        id: "prediction",
        label: "Prediction Market",
        detail: "Bet favors on real-life outcomes",
        icon: "trending-up",
        href: "/hub/prediction",
      },
      {
        id: "two-truths",
        label: "Two Truths & A Wish",
        detail: "Confessions & hidden desire games",
        icon: "shuffle",
        href: "/hub/two-truths",
      },
      {
        id: "photo-challenges",
        label: "Photo Memory Challenges",
        detail: "Weekly memory upload prompts",
        icon: "camera",
        href: "/hub/photo-challenges",
      },
      {
        id: "doodle",
        label: "Doodle / Canvas",
        detail: "Shared digital canvas & games",
        icon: "brush",
        href: "/hub/doodle",
      },
      {
        id: "scoreboard",
        label: "Partner Scoreboard",
        detail: "Streaks & achievement badges",
        icon: "trophy",
        href: "/hub/scoreboard",
      },
      {
        id: "crossword",
        label: "Couple Crossword",
        detail: "Daily mini-puzzle from your relationship history",
        icon: "grid",
        href: "/hub/crossword",
      },
      {
        id: "story",
        label: "Choose-Your-Own Adventure",
        detail: "Take turns writing alternate story scenes",
        icon: "book",
        href: "/hub/story",
      },
      {
        id: "scrapbook",
        label: "Virtual Scrapbook",
        detail: "Time capsule that unlocks on future anniversaries",
        icon: "images",
        href: "/hub/scrapbook",
      },
    ],
  },
  {
    id: "home-base",
    label: "Home Base",
    tagline: "Life logistics & mental load",
    icon: "home",
    accent: "#3ECFBF",
    accentSoft: "rgba(62,207,191,0.22)",
    tile: "#3ECFBF",
    tileInk: "#06201C",
    href: "/hub/home-base",
    features: [
      {
        id: "todos",
        label: "Groceries & Errands",
        detail: "Two notepads: groceries and errands",
        icon: "cart",
        href: "/hub/groceries",
      },
      {
        id: "meal-picker",
        label: "Meal Decisions",
        detail: "Spin dinner, thumbs up or spin again",
        icon: "restaurant",
        href: "/hub/meal-picker",
      },
      {
        id: "where-wheel",
        label: "Where Are We Going?",
        detail: "Randomizer for local date spots",
        icon: "navigate",
        href: "/hub/where-wheel",
      },
      {
        id: "fair-share",
        label: "Fair-Share Task Wheel",
        detail: "Gamified chore splitting",
        icon: "sync",
        href: "/hub/fair-share",
      },
      {
        id: "travel",
        label: "Travel / Date Itinerary",
        detail: "Collaborative trip boards, packing & reservations",
        icon: "airplane",
        href: "/hub/travel",
      },
      {
        id: "budget",
        label: "Shared Budget & Goals",
        detail: "Visual savings progress",
        icon: "wallet",
        href: "/hub/budget",
      },
      {
        id: "maintenance",
        label: "Household Maintenance",
        detail: "Recurring home & car tasks",
        icon: "construct",
        href: "/hub/maintenance",
      },
      {
        id: "emergency-vault",
        label: "Emergency Info Vault",
        detail: "Encrypted household essentials",
        icon: "lock-closed",
        href: "/hub/emergency-vault",
      },
      {
        id: "who-did-it",
        label: "Who Did It Last?",
        detail: "Lighthearted chore tally",
        icon: "people",
        href: "/hub/who-did-it",
      },
      {
        id: "settings",
        label: "Settings",
        detail: "Couple prefs & notifications",
        icon: "settings-sharp",
        href: "/hub/settings",
      },
    ],
  },
];

export function hubById(id: HubId) {
  return HUBS.find((h) => h.id === id) ?? null;
}
