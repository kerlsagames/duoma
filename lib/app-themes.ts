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
