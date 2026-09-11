import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const NOTIFICATION_PREFS_KEY = "duoma:notificationPrefs";

export type NotificationKind =
  | "spicy_game"
  | "check_in"
  | "curiosity"
  | "talk"
  | "up_for_it"
  | "coupons"
  | "jar"
  | "lists"
  | "milestones"
  | "date_night";

export type NotificationPrefs = {
  enabled: Record<NotificationKind, boolean>;
};

export const NOTIFICATION_KIND_OPTIONS: {
  kind: NotificationKind;
  label: string;
  detail: string;
}[] = [
  {
    kind: "spicy_game",
    label: "Spicy Game",
    detail: "Invites, your turn, and night unlocks",
  },
  {
    kind: "check_in",
    label: "Check-ins",
    detail: "Their daily check-in and check-in requests",
  },
  {
    kind: "curiosity",
    label: "Curiosity",
    detail: "Daily question answers and matches",
  },
  {
    kind: "talk",
    label: "Talk to me",
    detail: "When they pull a conversation card",
  },
  {
    kind: "up_for_it",
    label: "Up for it",
    detail: "Dares sent, accepted, or waiting on you",
  },
  {
    kind: "coupons",
    label: "Coupons",
    detail: "New favor coupons and ones ready to redeem",
  },
  {
    kind: "jar",
    label: "The jar",
    detail: "Appreciation notes waiting to open",
  },
  {
    kind: "lists",
    label: "Lists",
    detail: "Things they add to shared lists",
  },
  {
    kind: "milestones",
    label: "Countdowns",
    detail: "Upcoming anniversaries and milestones",
  },
  {
    kind: "date_night",
    label: "Date night",
    detail: "Planner ideas and date plans",
  },
];

export function defaultNotificationPrefs(): NotificationPrefs {
  const enabled = {} as Record<NotificationKind, boolean>;
  for (const row of NOTIFICATION_KIND_OPTIONS) {
    enabled[row.kind] = true;
  }
  return { enabled };
}

export function hydrateNotificationPrefs(
  raw: Partial<NotificationPrefs> | null | undefined
): NotificationPrefs {
  const base = defaultNotificationPrefs();
  if (!raw?.enabled) return base;
  const enabled = { ...base.enabled };
  for (const row of NOTIFICATION_KIND_OPTIONS) {
    if (typeof raw.enabled[row.kind] === "boolean") {
      enabled[row.kind] = raw.enabled[row.kind];
    }
  }
  return { enabled };
}

export async function readNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
      return hydrateNotificationPrefs(raw ? JSON.parse(raw) : null);
    }
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    return hydrateNotificationPrefs(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultNotificationPrefs();
  }
}

export async function writeNotificationPrefs(
  prefs: NotificationPrefs
): Promise<void> {
  const raw = JSON.stringify(prefs);
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, raw);
    return;
  }
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, raw);
}

/** Map a home-feed row id to a preference kind. */
export function kindFromStatusId(id: string): NotificationKind | null {
  if (id === "game" || id.startsWith("game")) return "spicy_game";
  if (id.startsWith("checkin")) return "check_in";
  if (id.startsWith("curiosity")) return "curiosity";
  if (id.startsWith("talk")) return "talk";
  if (id.startsWith("dare")) return "up_for_it";
  if (id.startsWith("coupon")) return "coupons";
  if (id === "jar" || id.startsWith("jar")) return "jar";
  if (id.startsWith("list")) return "lists";
  if (id.startsWith("milestone")) return "milestones";
  if (id.startsWith("date") || id.startsWith("bucket") || id.startsWith("scratch")) {
    return "date_night";
  }
  return null;
}

export function prefsAllowStatusId(
  prefs: NotificationPrefs,
  id: string
): boolean {
  const kind = kindFromStatusId(id);
  if (!kind) return true;
  return prefs.enabled[kind] !== false;
}
