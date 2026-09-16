import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import {
  activityDateKeys,
  currentStreak,
  pairAgeDays,
  type CoupleStatInput,
} from "@/lib/couple-stats";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type BadgeDef = {
  id: string;
  title: string;
  blurb: string;
  icon: IconName;
  target: number;
  progress: (input: CoupleStatInput) => number;
};

export type BadgeStatus = BadgeDef & {
  count: number;
  unlocked: boolean;
};

export const BADGES: BadgeDef[] = [
  {
    id: "pulse",
    title: "Pulse",
    blurb: "Log your first check-in.",
    icon: "heart",
    target: 1,
    progress: (input) => input.checkIns.filter((row) => row.userId === input.user?.id).length,
  },
  {
    id: "weather-report",
    title: "Weather report",
    blurb: "Five check-ins. They know the forecast.",
    icon: "rainy",
    target: 5,
    progress: (input) => input.checkIns.filter((row) => row.userId === input.user?.id).length,
  },
  {
    id: "same-morning",
    title: "Same morning",
    blurb: "You both check in on the same day.",
    icon: "sunny",
    target: 1,
    progress: (input) => {
      const yours = new Set(
        input.checkIns.filter((row) => row.userId === input.user?.id).map((row) => row.date)
      );
      return input.checkIns.some((row) => row.userId === input.partner?.id && yours.has(row.date))
        ? 1
        : 0;
    },
  },
  {
    id: "five-nights-on",
    title: "Five nights on",
    blurb: "Any activity five days in a row.",
    icon: "flame",
    target: 5,
    progress: (input) => currentStreak(activityDateKeys(input)),
  },
  {
    id: "fortnight-fire",
    title: "Fortnight fire",
    blurb: "Fourteen days in a row. Ridiculous, in a good way.",
    icon: "bonfire",
    target: 14,
    progress: (input) => currentStreak(activityDateKeys(input)),
  },
  {
    id: "ask-them-out",
    title: "Ask them out",
    blurb: "Start a date night.",
    icon: "wine",
    target: 1,
    progress: (input) => input.dateNightAsks.filter((row) => row.fromUserId === input.user?.id).length,
  },
  {
    id: "date-dealer",
    title: "Date dealer",
    blurb: "Start three date nights.",
    icon: "calendar",
    target: 3,
    progress: (input) => input.dateNightAsks.filter((row) => row.fromUserId === input.user?.id).length,
  },
  {
    id: "note-in-a-bottle",
    title: "Note in a bottle",
    blurb: "Write one jar note.",
    icon: "file-tray",
    target: 1,
    progress: (input) => input.jarNotes.filter((row) => row.fromUserId === input.user?.id).length,
  },
  {
    id: "soft-archive",
    title: "Soft archive",
    blurb: "Five notes in the jar.",
    icon: "file-tray-full",
    target: 5,
    progress: (input) => input.jarNotes.filter((row) => row.fromUserId === input.user?.id).length,
  },
  {
    id: "keep-talking",
    title: "Keep talking",
    blurb: "Draw ten Talk cards.",
    icon: "chatbubbles",
    target: 10,
    progress: (input) => input.talkDraws.length,
  },
  {
    id: "shared-list",
    title: "Shared list",
    blurb: "Tick off five list items together.",
    icon: "checkbox",
    target: 5,
    progress: (input) => input.listEntries.filter((row) => row.completedAt).length,
  },
  {
    id: "lights-down",
    title: "Lights down",
    blurb: "Play Get Spicy once.",
    icon: "moon",
    target: 1,
    progress: (input) => input.nights.filter((row) => row.gameKey === "get-spicy").length,
  },
  {
    id: "afterglow-club",
    title: "Afterglow club",
    blurb: "Finish five spicy nights.",
    icon: "sparkles",
    target: 5,
    progress: (input) =>
      input.nights.filter(
        (row) =>
          row.gameKey === "get-spicy" && (row.status === "completed" || row.status === "rating")
      ).length,
  },
  {
    id: "card-shark",
    title: "Card shark",
    blurb: "Play twenty spicy cards.",
    icon: "albums",
    target: 20,
    progress: (input) => input.deck.filter((row) => row.status === "played").length,
  },
  {
    id: "new-map",
    title: "New map",
    blurb: "Try five positions.",
    icon: "body",
    target: 5,
    progress: (input) => input.positionSaves.filter((row) => row.doneAt).length,
  },
  {
    id: "bookmark-the-body",
    title: "Bookmark the body",
    blurb: "Save five positions to try.",
    icon: "bookmark",
    target: 5,
    progress: (input) => input.positionSaves.length,
  },
  {
    id: "say-it",
    title: "Say it",
    blurb: "Send five Dare Me plays.",
    icon: "megaphone",
    target: 5,
    progress: (input) => input.spicyDares.filter((row) => row.fromUserId === input.user?.id).length,
  },
  {
    id: "hungry-eyes",
    title: "Hungry eyes",
    blurb: "Like ten fantasies.",
    icon: "eye",
    target: 10,
    progress: (input) =>
      input.fantasySwipes.filter((row) => row.userId === input.user?.id && row.liked).length,
  },
  {
    id: "costume-drawer",
    title: "Costume in the drawer",
    blurb: "Save a roleplay.",
    icon: "color-wand",
    target: 1,
    progress: (input) => input.roleplaySaves.length,
  },
  {
    id: "first-cluck",
    title: "First cluck",
    blurb: "Send a Chicken dare.",
    icon: "egg",
    target: 1,
    progress: (input) => input.chickenPlays.filter((row) => row.fromUserId === input.user?.id).length,
  },
  {
    id: "full-yard",
    title: "Full yard",
    blurb: "Ten Chicken dares sent or received.",
    icon: "paw",
    target: 10,
    progress: (input) => input.chickenPlays.length,
  },
  {
    id: "iou-artist",
    title: "IOU artist",
    blurb: "Give three coupons.",
    icon: "ticket",
    target: 3,
    progress: (input) => input.coupons.filter((row) => row.fromUserId === input.user?.id).length,
  },
  {
    id: "one-hour-in",
    title: "One hour in",
    blurb: "Spend an hour in the app.",
    icon: "hourglass",
    target: 60,
    progress: (input) => Math.floor((input.user?.activeSeconds ?? 0) / 60),
  },
  {
    id: "seven-days-paired",
    title: "Week of us",
    blurb: "Stay paired for seven days.",
    icon: "infinite",
    target: 7,
    progress: (input) => pairAgeDays(input.couple),
  },
];

export function evaluateBadges(input: CoupleStatInput): BadgeStatus[] {
  return BADGES.map((badge) => {
    const count = Math.max(0, badge.progress(input));
    return {
      ...badge,
      count,
      unlocked: count >= badge.target,
    };
  }).sort((left, right) => Number(right.unlocked) - Number(left.unlocked));
}
