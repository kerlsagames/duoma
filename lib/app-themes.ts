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
