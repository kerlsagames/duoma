import { Platform, type TextStyle } from "react-native";

export type HubTone = "default" | "talk" | "calendar";

export const SERIF: TextStyle["fontFamily"] = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: 'Georgia, "Iowan Old Style", Palatino, serif',
});

export const COUPONS_TONE = {
  background: "#10131A",
  accent: "#F0C75E",
  accentSoft: "rgba(240,199,94,0.18)",
  ink: "#F7F1E3",
  muted: "rgba(247,241,227,0.62)",
  surface: "#171C27",
  surfaceRaised: "#1E2533",
  border: "rgba(240,199,94,0.28)",
  stamp: "#FF5C7A",
  used: "rgba(247,241,227,0.35)",
} as const;

/** Light race-day book for LoveBetz — cream paper, magenta, readable gold. */
export const LOVEBETZ_TONE = {
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
export const UP_FOR_IT_TONE = {
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

/** @deprecated use UP_FOR_IT_TONE */
export const WILDCARD_TONE = UP_FOR_IT_TONE;

/** Ink + rose for Sex Positions — pink F / blue M accents. */
export const POSITIONS_TONE = {
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

/** Desire crimson for Roleplays — spicy scenario library. */
export const ROLEPLAYS_TONE = {
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

/** Warm glass mason jar for Appreciation notes. */
export const JAR_TONE = {
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

export const HANDWRITING: TextStyle["fontFamily"] = Platform.select({
  ios: "Snell Roundhand",
  android: "serif",
  default: '"Segoe Script", "Bradley Hand", "Apple Chancery", "Palatino Linotype", cursive',
});

/** Fun travel-sticker / bucket-list energy for shared Lists. */
export const LISTS_TONE = {
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
  talk: {
    background: "#12100C",
    accent: "#E4C37A",
    ink: "#F4EDE0",
    muted: "rgba(244,237,224,0.62)",
    surface: "#1B1812",
    kicker: "#E4C37A",
  },
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

/** Diner ticket for Meal Decisions. */
export const MEALS_TONE = {
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

/** Kitchen-table notepad for Groceries & Errands. */
export const ERRANDS_TONE = {
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

/** Soft rose paper for the shared period tracker. */
export const PERIOD_TONE = {
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
