import { Platform, type TextStyle } from "react-native";

export type HubTone = "default" | "talk";

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

/** Arcade / slot-machine energy for Wildcard challenges. */
export const WILDCARD_TONE = {
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
