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
  {
    id: "world",
    label: "Shared World",
    detail: "Pick how your story grows — five worlds",
    icon: "planet" as IconName,
    href: "/hub/worlds",
    accent: "#7CFFB2",
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
        id: "thought-pings",
        label: "Thought-of-You Pings",
        detail: "Low-pressure haptic / heart buzz to their phone",
        icon: "notifications",
        href: "/hub/thought-pings",
      },
      {
        id: "talk",
        label: "Talk To Me",
        detail: "Structured conversation decks",
        icon: "chatbubbles",
        href: "/hub/talk",
      },
      {
        id: "audio-vault",
        label: "Audio Voice Notes",
        detail: "Record a real voice note. They press play and hear you.",
        icon: "mic",
        href: "/hub/audio-vault",
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
        id: "curiosity",
        label: "Flirtatious findings",
        detail: "Chat about cheeky and taboo things with your partner",
        icon: "sparkles",
        href: "/hub/discover",
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
        detail: "18 packs. 200 dares. Send one or take one.",
        icon: "flash",
        href: "/hub/up-for-it",
      },
      {
        id: "roleplays",
        label: "Roleplays",
        detail: "Spin scenes. Save to To-do. Tick them off.",
        icon: "sparkles",
        href: "/hub/roleplays",
      },
      {
        id: "positions",
        label: "Positions Guide",
        detail: "Pose guide. Spin one, or search the list.",
        icon: "body",
        href: "/hub/positions",
      },
      {
        id: "the-how",
        label: "The How",
        detail: "Four parts. Timed tries. Keep what actually works.",
        icon: "book",
        href: "/hub/the-how",
      },
      {
        id: "fantasy-matcher",
        label: "Fantasy Matcher",
        detail: "Swipe yes or no. To-do, completed, and passed.",
        icon: "heart-circle",
        href: "/hub/fantasy-matcher",
      },
      {
        id: "intimacy-streak",
        label: "Intimacy Streak Tracker",
        detail: "Grows with dares, spicy nights, pings & Connect.",
        icon: "flame",
        href: "/hub/intimacy-streak",
      },
      {
        id: "sexy-vault",
        label: "The Sexy Vault",
        detail: "Private pics and clips. Shared pin. Hide until a time you set.",
        icon: "lock-closed",
        href: "/hub/sexy-vault",
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
        id: "chicken",
        label: "Chicken",
        detail: "Silly dares. Send one. Cluck or commit.",
        icon: "egg",
        href: "/hub/chicken",
      },
      {
        id: "coupons",
        label: "Coupons",
        detail: "Tear a favor from the booklet and gift it",
        icon: "ticket",
        href: "/hub/coupons",
      },
      {
        id: "trivia",
        label: "How Well Do You Know Me?",
        detail: "Rip a pack. Answer yours. Guess theirs. Next pack stays sealed.",
        icon: "help-circle",
        href: "/hub/trivia",
      },
      {
        id: "prediction",
        label: "LoveBetz",
        detail: "Send a slip. They accept. Winner takes the stake.",
        icon: "cash",
        href: "/hub/prediction",
      },
      {
        id: "photo-challenges",
        label: "Photo Memory Challenges",
        detail: "One shot a week. Shuffle until you both lock it in.",
        icon: "camera",
        href: "/hub/photo-challenges",
      },
      {
        id: "doodle",
        label: "Draw It",
        detail: "Three prompts. Draw. They guess.",
        icon: "brush",
        href: "/hub/doodle",
      },
      {
        id: "crossword",
        label: "Daily Word",
        detail: "Same five letters. Who lands it first.",
        icon: "grid",
        href: "/hub/crossword",
      },
      {
        id: "fair-share",
        label: "Fair Share",
        detail: "Spin who does the chore, or tap who did it last.",
        icon: "sync",
        href: "/hub/fair-share",
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
        detail: "Groceries or errands — one notepad at a time",
        icon: "cart",
        href: "/hub/groceries",
      },
      {
        id: "meal-plan",
        label: "Meal Plan",
        detail: "Seven post-its. What’s for dinner?",
        icon: "restaurant",
        href: "/hub/meal-plan",
      },
      {
        id: "gifts",
        label: "Gifts",
        detail: "Wish lists, what to buy, and what they got each year",
        icon: "ribbon",
        href: "/hub/gifts",
      },
      {
        id: "birthdays",
        label: "Birthdays",
        detail: "Family and friends — lands on the calendar",
        icon: "gift",
        href: "/hub/birthdays",
      },
      {
        id: "maintenance",
        label: "Household Maintenance",
        detail: "What’s due. Tick it off.",
        icon: "construct",
        href: "/hub/maintenance",
      },
      {
        id: "travel",
        label: "Travel / Date Itinerary",
        detail: "Day-by-day trip plans, stays, tickets & costs",
        icon: "airplane",
        href: "/hub/travel",
      },
      {
        id: "goals",
        label: "Shared Goals",
        detail: "Long-term on top. Nearer wants in a list. Track the pile.",
        icon: "flag",
        href: "/hub/goals",
      },
      {
        id: "budget",
        label: "Shared Budget",
        detail: "Weekly or fortnight pay, then bills and what you spent.",
        icon: "wallet",
        href: "/hub/budget",
      },
      {
        id: "emergency-vault",
        label: "Emergency Info Vault",
        detail: "Encrypted household essentials",
        icon: "lock-closed",
        href: "/hub/emergency-vault",
      },
      {
        id: "period",
        label: "Period Tracker",
        detail: "Cycle, symptoms, next period — shared",
        icon: "water",
        href: "/hub/period",
      },
    ],
  },
];

export function hubById(id: HubId) {
  return HUBS.find((h) => h.id === id) ?? null;
}
