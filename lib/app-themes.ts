import { liveTone } from "@/lib/hub-theme";
import { Platform, type TextStyle } from "react-native";

export type HubTone = "default" | "talk" | "calendar";

export const SERIF: TextStyle["fontFamily"] = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: 'Georgia, "Iowan Old Style", Palatino, serif',
});

/** Physical coupon booklet — wine cover, parchment tickets, cherry stamp. */
const COUPONS_TONE_BASE = {
  background: "#2A1320",
  cover: "#3A1528",
  spine: "#6E1F38",
  paper: "#F3E6CF",
  paperEdge: "#E4D3B0",
  accent: "#C9A24A",
  accentSoft: "rgba(201,162,74,0.20)",
  ink: "#1A120C",
  muted: "rgba(26,18,12,0.58)",
  fine: "rgba(26,18,12,0.42)",
  surface: "#F7ECD8",
  surfaceRaised: "#FFF6E6",
  border: "rgba(110,31,56,0.22)",
  stamp: "#C62828",
  used: "rgba(26,18,12,0.32)",
  onCover: "#F7E7C8",
  onCoverMuted: "rgba(247,231,200,0.62)",
} as const;

export const COUPONS_TONE = liveTone(
  "play",
  COUPONS_TONE_BASE,
  COUPONS_TONE_BASE.accent
);

/** Hobby-shop felt table for How Well Do You Know Me packs. */
const KNOW_ME_TONE_BASE = {
  background: "#14261C",
  felt: "#1C3326",
  feltDark: "#0E1C14",
  wood: "#3A2416",
  pack: "#F4E6C8",
  packInk: "#1C140C",
  foil: "#E8C56A",
  foilSoft: "rgba(232,197,106,0.18)",
  cream: "#FBF3E0",
  ink: "#F6EED8",
  muted: "rgba(246,238,216,0.64)",
  dim: "rgba(246,238,216,0.38)",
  border: "rgba(232,197,106,0.28)",
  win: "#8FDE9A",
  miss: "#E07A6A",
  lock: "rgba(14,28,20,0.72)",
} as const;

export const KNOW_ME_TONE = liveTone(
  "play",
  KNOW_ME_TONE_BASE,
  KNOW_ME_TONE_BASE.foil
);

export const KNOW_ME_DISPLAY: TextStyle["fontFamily"] = Platform.select({
  ios: "Avenir Next Condensed",
  android: "sans-serif-condensed",
  default:
    '"Avenir Next Condensed", "Trebuchet MS", "Segoe UI Condensed", Impact, sans-serif',
});

/** Light race-day book for LoveBetz — cream paper, magenta, readable gold. */
const LOVEBETZ_TONE_BASE = {
  background: "#FFF1E8",
  paper: "#FFF8F3",
  surface: "#FFFFFF",
  surfaceRaised: "#FFFFFF",
  pink: "#E31B5D",
  pinkDeep: "#B01448",
  pinkSoft: "rgba(227,27,93,0.10)",
  gold: "#C48412",
  goldSoft: "rgba(196,132,18,0.14)",
  ink: "#2A1520",
  muted: "rgba(42,21,32,0.58)",
  dim: "rgba(42,21,32,0.40)",
  border: "rgba(227,27,93,0.16)",
  cream: "#FFF8F3",
  onPink: "#FFF7F2",
} as const;

export const LOVEBETZ_TONE = liveTone(
  "play",
  LOVEBETZ_TONE_BASE,
  LOVEBETZ_TONE_BASE.pink
);

export const LOVEBETZ_SCRIPT: TextStyle["fontFamily"] = "GreatVibes";

export const LOVEBETZ_DISPLAY: TextStyle["fontFamily"] = Platform.select({
  ios: "Avenir Next Condensed",
  android: "sans-serif-condensed",
  default: '"Avenir Next Condensed", "Trebuchet MS", "Segoe UI", Futura, sans-serif',
});

export const LOVEBETZ_SANS: TextStyle["fontFamily"] = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif",
  default: '"Avenir Next", "Nunito", "Trebuchet MS", "Segoe UI", sans-serif',
});

/** Arcade / slot-machine energy for Up for it challenges. */
const UP_FOR_IT_TONE_BASE = {
  background: "#070B10",
  accent: "#3DE0C5",
  accentSoft: "rgba(61,224,197,0.16)",
  hot: "#FF5A7A",
  ink: "#E8F4F1",
  muted: "rgba(232,244,241,0.58)",
  surface: "#101820",
  surfaceRaised: "#16202A",
  border: "rgba(61,224,197,0.28)",
  flash: "#7CFFB2",
} as const;

export const UP_FOR_IT_TONE = liveTone(
  "desire",
  UP_FOR_IT_TONE_BASE,
  UP_FOR_IT_TONE_BASE.accent
);

/** @deprecated use UP_FOR_IT_TONE */
export const WILDCARD_TONE = UP_FOR_IT_TONE;

/** Ink + rose for Sex Positions — pink F / blue M accents. */
const POSITIONS_TONE_BASE = {
  background: "#0C0810",
  accent: "#FF6B9A",
  accentSoft: "rgba(255,107,154,0.16)",
  male: "#5B8CFF",
  maleSoft: "rgba(91,140,255,0.16)",
  ink: "#F6EEF2",
  muted: "rgba(246,238,242,0.58)",
  surface: "#16101A",
  surfaceRaised: "#1E1624",
  border: "rgba(255,107,154,0.28)",
  frame: "#1A1018",
} as const;

export const POSITIONS_TONE = liveTone(
  "desire",
  POSITIONS_TONE_BASE,
  POSITIONS_TONE_BASE.accent
);

/** Desire crimson for Roleplays — spicy scenario library. */
const ROLEPLAYS_TONE_BASE = {
  background: "#14080C",
  accent: "#FF4D6A",
  accentSoft: "rgba(255,77,106,0.16)",
  warm: "#FF8FA3",
  warmSoft: "rgba(255,143,163,0.16)",
  ink: "#FFF0F3",
  muted: "rgba(255,240,243,0.58)",
  surface: "#1C0E14",
  surfaceRaised: "#261018",
  border: "rgba(255,77,106,0.32)",
  frame: "#1A0C12",
} as const;

export const ROLEPLAYS_TONE = liveTone(
  "desire",
  ROLEPLAYS_TONE_BASE,
  ROLEPLAYS_TONE_BASE.accent
);

/** Linen workbook for The How — named techniques, not dares. */
const HOW_TONE_BASE = {
  background: "#161012",
  paper: "#F6EBE2",
  paperInk: "#2A1816",
  paperMuted: "rgba(42,24,22,0.56)",
  rose: "#D47884",
  roseDeep: "#B85A68",
  roseSoft: "rgba(212,120,132,0.16)",
  ink: "#F7EEE8",
  muted: "rgba(247,238,232,0.62)",
  dim: "rgba(247,238,232,0.4)",
  surface: "#1E1618",
  surfaceRaised: "#281C20",
  border: "rgba(212,120,132,0.28)",
  keep: "#C4A07A",
} as const;

export const HOW_TONE = liveTone("desire", HOW_TONE_BASE, HOW_TONE_BASE.rose);

/** Warm glass mason jar for Appreciation notes. */
const JAR_TONE_BASE = {
  background: "#100E0C",
  accent: "#D4A35A",
  accentSoft: "rgba(212,163,90,0.18)",
  glass: "rgba(255, 245, 230, 0.04)",
  glassBorder: "rgba(246, 239, 226, 0.28)",
  cork: "#8B5A2B",
  corkLight: "#B8793C",
  paper: "#F2E4C4",
  paperAlt: "#E8D5A8",
  paperDeep: "#D9C392",
  ink: "#F6EFE2",
  muted: "rgba(246,239,226,0.58)",
  surface: "#1A1612",
  surfaceRaised: "#221C16",
  border: "rgba(212,163,90,0.3)",
  seal: "#C45C4A",
  handwriting: "#3A2A18",
} as const;

export const JAR_TONE = liveTone("connect", JAR_TONE_BASE, JAR_TONE_BASE.accent);

export const HANDWRITING: TextStyle["fontFamily"] = Platform.select({
  ios: "Snell Roundhand",
  android: "serif",
  default: '"Segoe Script", "Bradley Hand", "Apple Chancery", "Palatino Linotype", cursive',
});

/** Fun travel-sticker / bucket-list energy for shared Lists. */
const LISTS_TONE_BASE = {
  background: "#07191D",
  sky: "#0E2A31",
  accent: "#FF6B4A",
  accentSoft: "rgba(255,107,74,0.18)",
  teal: "#2EC4B6",
  tealSoft: "rgba(46,196,182,0.16)",
  sticky: "#FFD166",
  stickyInk: "#3A2A10",
  ink: "#F3FFFB",
  muted: "rgba(243,255,251,0.58)",
  surface: "#123038",
  surfaceRaised: "#183940",
  border: "rgba(46,196,182,0.32)",
  vault: "#FFD166",
  stamp: "#FF6B4A",
} as const;

export const LISTS_TONE = liveTone("connect", LISTS_TONE_BASE, LISTS_TONE_BASE.accent);

/** Chunky poster display for Lists titles. */
export const LISTS_DISPLAY: TextStyle["fontFamily"] = Platform.select({
  ios: "Avenir Next Condensed",
  android: "sans-serif-condensed",
  default: '"Avenir Next Condensed", "Trebuchet MS", "Segoe UI", Futura, sans-serif',
});

export const LISTS_ROUNDED: TextStyle["fontFamily"] = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif-medium",
  default: '"Avenir Next", "Nunito", "Trebuchet MS", sans-serif',
});

const TALK_TONE_BASE = {
  background: "#12100C",
  accent: "#E4C37A",
  ink: "#F4EDE0",
  muted: "rgba(244,237,224,0.62)",
  surface: "#1B1812",
  kicker: "#E4C37A",
} as const;

export const HUB_TONES: Record<
  HubTone,
  {
    background: string;
    accent: string;
    ink: string;
    muted: string;
    surface: string;
    kicker: string;
  }
> = {
  default: {
    background: "#0B0B0E",
    accent: "#FF007F",
    ink: "#F4F4F6",
    muted: "rgba(244,244,246,0.65)",
    surface: "rgba(255,255,255,0.05)",
    kicker: "#FF007F",
  },
  talk: liveTone("connect", TALK_TONE_BASE, TALK_TONE_BASE.accent),
  calendar: {
    background: "#F3F5F8",
    accent: "#C23B55",
    ink: "#16181D",
    muted: "rgba(22,24,29,0.58)",
    surface: "#FFFFFF",
    kicker: "#C23B55",
  },
};

export const TALK_DECK_TINT: Record<string, string> = {
  icebreakers: "#E4C37A",
  "deep-reflections": "#8FA8C8",
  "bedroom-throwbacks": "#D0896A",
  "future-dreams": "#8BB89A",
  "intimacy-romance": "#D4A0B0",
  "daily-checkin": "#E8D5A3",
  "growth-values": "#A3B17A",
  lighthearted: "#B5A3D4",
  appreciation: "#E0B48A",
};

/** Corkboard and post-its for the weekly Meal Plan. */
const MEAL_PLAN_TONE_BASE = {
  background: "#5C3D24",
  cork: "#7A5230",
  corkLight: "#8F643C",
  pin: "#C45C4A",
  accent: "#F4D35E",
  accentSoft: "rgba(244,211,94,0.2)",
  ink: "#F6EFE2",
  muted: "rgba(246,239,226,0.68)",
  surface: "#4A311C",
  surfaceRaised: "#6A4528",
  border: "rgba(246,239,226,0.18)",
  paperInk: "#2A2116",
  paperMuted: "rgba(42,33,22,0.55)",
} as const;

export const MEAL_PLAN_TONE = liveTone(
  "home-base",
  MEAL_PLAN_TONE_BASE,
  MEAL_PLAN_TONE_BASE.accent
);

/** Diner ticket for Meal Decisions. */
const MEALS_TONE_BASE = {
  background: "#1C1410",
  accent: "#F25C3A",
  accentSoft: "rgba(242,92,58,0.16)",
  paper: "#F3E6C4",
  ticketInk: "#2A1C10",
  ink: "#F6EDE4",
  muted: "rgba(246,237,228,0.62)",
  surface: "#261C16",
  surfaceRaised: "#2F231C",
  border: "rgba(242,92,58,0.32)",
  up: "#3ECF8E",
  down: "#F25C3A",
} as const;

export const MEALS_TONE = liveTone("home-base", MEALS_TONE_BASE, MEALS_TONE_BASE.accent);

/** Kitchen-table notepad for Groceries & Errands. */
const ERRANDS_TONE_BASE = {
  background: "#3A2C22",
  desk: "#4A382C",
  paper: "#F7F0DC",
  paperEdge: "#E4D8B8",
  rule: "#C5D4EA",
  margin: "#E24B4B",
  accent: "#2F6B56",
  accentSoft: "rgba(47,107,86,0.12)",
  ink: "#2C2416",
  muted: "rgba(44,36,22,0.52)",
  pencil: "#5C4A32",
  check: "#2F6B56",
  hole: "#D7CBB0",
} as const;

export const ERRANDS_TONE = liveTone(
  "home-base",
  ERRANDS_TONE_BASE,
  ERRANDS_TONE_BASE.accent
);

/** Party-card paper for the shared birthday book. */
const BIRTHDAYS_TONE_BASE = {
  background: "#1A1624",
  paper: "#FFF6E8",
  surface: "#241E30",
  surfaceRaised: "#2C2538",
  accent: "#E8A03A",
  accentSoft: "rgba(232,160,58,0.16)",
  family: "#E07A8A",
  friends: "#5BA3C7",
  ink: "#F7F0E4",
  paperInk: "#2A2116",
  muted: "rgba(247,240,228,0.62)",
  paperMuted: "rgba(42,33,22,0.56)",
  border: "rgba(232,160,58,0.28)",
} as const;

export const BIRTHDAYS_TONE = liveTone(
  "home-base",
  BIRTHDAYS_TONE_BASE,
  BIRTHDAYS_TONE_BASE.accent
);

/** Soft rose paper for the shared period tracker. */
const PERIOD_TONE_BASE = {
  background: "#F6EEF2",
  paper: "#FFF8FA",
  surface: "#FFFFFF",
  rose: "#C45C7A",
  roseDeep: "#9A3F5C",
  roseSoft: "rgba(196,92,122,0.14)",
  fertile: "#E8B4C4",
  fertileSoft: "rgba(232,180,196,0.35)",
  ovule: "#6F8F6E",
  ink: "#2A1A22",
  muted: "rgba(42,26,34,0.56)",
  dim: "rgba(42,26,34,0.38)",
  border: "rgba(196,92,122,0.18)",
  today: "#2A1A22",
} as const;

export const PERIOD_TONE = liveTone("home-base", PERIOD_TONE_BASE, PERIOD_TONE_BASE.rose);

/** Ledger paper for Shared Budget. */
const BUDGET_TONE_BASE = {
  background: "#12160F",
  surface: "#1A2016",
  surfaceRaised: "#222A1C",
  accent: "#C6E27A",
  accentSoft: "rgba(198,226,122,0.16)",
  gold: "#E4C37A",
  ink: "#F4F0E4",
  muted: "rgba(244,240,228,0.62)",
  dim: "rgba(244,240,228,0.4)",
  border: "rgba(198,226,122,0.22)",
  danger: "#FF8A7A",
  paid: "#7DCEA0",
} as const;

export const BUDGET_TONE = liveTone(
  "home-base",
  BUDGET_TONE_BASE,
  BUDGET_TONE_BASE.accent
);

/** Quiet savings list for Shared Goals. */
const GOALS_TONE_BASE = {
  background: "#14110C",
  surface: "#1E1A14",
  surfaceRaised: "#2A241C",
  accent: "#E4C37A",
  accentSoft: "rgba(228,195,122,0.16)",
  ink: "#F6EFE2",
  muted: "rgba(246,239,226,0.62)",
  dim: "rgba(246,239,226,0.4)",
  border: "rgba(228,195,122,0.22)",
} as const;

export const GOALS_TONE = liveTone("home-base", GOALS_TONE_BASE, GOALS_TONE_BASE.accent);

/** Pastel lilac deck for Discover. */
const DISCOVER_TONE_BASE = {
  background: "#F4EEF8",
  surface: "#FFFBFE",
  surfaceRaised: "#FFFFFF",
  accent: "#C084D4",
  accentSoft: "rgba(192,132,212,0.18)",
  blush: "#F3B6C8",
  mint: "#A8D5C4",
  ink: "#3D2E4A",
  muted: "rgba(61,46,74,0.58)",
  dim: "rgba(61,46,74,0.38)",
  border: "rgba(192,132,212,0.28)",
  skip: "#E8A0B4",
  talk: "#7EBEA8",
} as const;

export const DISCOVER_TONE = liveTone(
  "connect",
  DISCOVER_TONE_BASE,
  DISCOVER_TONE_BASE.accent
);

/** Kraft tags and cranberry ribbon for Gifts. */
const GIFTS_TONE_BASE = {
  background: "#17110E",
  pine: "#1E2A22",
  paper: "#F3E4C4",
  paperInk: "#2A1C12",
  paperMuted: "rgba(42,28,18,0.56)",
  ribbon: "#C43C4A",
  gold: "#D4A45A",
  goldSoft: "rgba(212,164,90,0.18)",
  ink: "#F6EEDC",
  muted: "rgba(246,238,220,0.62)",
  dim: "rgba(246,238,220,0.4)",
  surface: "#211A16",
  surfaceRaised: "#2B221C",
  border: "rgba(212,164,90,0.28)",
  tag: "#E7C9A0",
} as const;

export const GIFTS_TONE = liveTone(
  "home-base",
  GIFTS_TONE_BASE,
  GIFTS_TONE_BASE.gold
);

/** Rubber-chicken carnival booth — barn red, yolk tickets, comb stamp. */
export const CHICKEN_TONE_BASE = {
  background: "#7A1410",
  barn: "#5C0E0C",
  yolk: "#FFD028",
  comb: "#FF3B2E",
  cream: "#FFF4CC",
  creamInk: "#2A1408",
  creamMuted: "rgba(42,20,8,0.58)",
  ink: "#FFF6D6",
  muted: "rgba(255,246,214,0.72)",
  dim: "rgba(255,246,214,0.42)",
  surface: "#8E1C16",
  surfaceRaised: "#A3221A",
  border: "rgba(255,208,40,0.38)",
  check: "#FFF8DC",
} as const;

export const CHICKEN_TONE = liveTone(
  "play",
  CHICKEN_TONE_BASE,
  CHICKEN_TONE_BASE.yolk
);

export const CHICKEN_DISPLAY: TextStyle["fontFamily"] = Platform.select({
  ios: "Avenir Next Condensed",
  android: "sans-serif-condensed",
  default:
    '"Avenir Next Condensed", "Trebuchet MS", "Segoe UI Condensed", Impact, sans-serif',
});
