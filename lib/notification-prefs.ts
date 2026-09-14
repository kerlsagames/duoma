import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const NOTIFICATION_PREFS_KEY = "duoma:notificationPrefs";

export type NotificationSection =
  | "connect"
  | "desire"
  | "play"
  | "home_base"
  | "calendar"
  | "check_in";

/** @deprecated use NotificationSection */
export type NotificationKind = NotificationSection;

export type NotificationPrefs = {
  enabled: Record<NotificationSection, boolean>;
  dismissed: string[];
};

export const NOTIFICATION_SECTION_OPTIONS: {
  kind: NotificationSection;
  group: "hubs" | "also";
  label: string;
  detail: string;
}[] = [
  {
    kind: "connect",
    group: "hubs",
    label: "Connect",
    detail: "Talk to me, curiosity, the jar, and lists",
  },
  {
    kind: "desire",
    group: "hubs",
    label: "Desire",
    detail: "Spicy Game, dares, and tonight asks",
  },
  {
    kind: "play",
    group: "hubs",
    label: "Play",
    detail: "Coupons and scratch-offs",
  },
  {
    kind: "home_base",
    group: "hubs",
    label: "Home Base",
    detail: "Household moments from Home Base",
  },
  {
    kind: "calendar",
    group: "also",
    label: "Calendar",
    detail: "Dates, countdowns, and planned nights",
  },
  {
    kind: "check_in",
    group: "also",
    label: "Check-ins",
    detail: "Their daily check-in and check-in requests",
  },
];

/** @deprecated use NOTIFICATION_SECTION_OPTIONS */
export const NOTIFICATION_KIND_OPTIONS = NOTIFICATION_SECTION_OPTIONS;

const OLD_KIND_TO_SECTION: Record<string, NotificationSection> = {
  spicy_game: "desire",
  up_for_it: "desire",
  check_in: "check_in",
  curiosity: "connect",
  talk: "connect",
  jar: "connect",
  lists: "connect",
  coupons: "play",
  milestones: "calendar",
  date_night: "calendar",
};

export function defaultNotificationPrefs(): NotificationPrefs {
  const enabled = {} as Record<NotificationSection, boolean>;
  for (const row of NOTIFICATION_SECTION_OPTIONS) {
    enabled[row.kind] = true;
  }
  return { enabled, dismissed: [] };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function hydrateNotificationPrefs(raw: unknown): NotificationPrefs {
  const base = defaultNotificationPrefs();
  const incoming = asRecord(raw);
  const enabledRaw = asRecord(incoming.enabled);
  const enabled = { ...base.enabled };

  for (const row of NOTIFICATION_SECTION_OPTIONS) {
    if (typeof enabledRaw[row.kind] === "boolean") {
      enabled[row.kind] = enabledRaw[row.kind] as boolean;
    }
  }

  for (const row of NOTIFICATION_SECTION_OPTIONS) {
    if (typeof enabledRaw[row.kind] === "boolean") continue;
    const oldVals = Object.entries(OLD_KIND_TO_SECTION)
      .filter(([, section]) => section === row.kind)
      .map(([old]) => enabledRaw[old])
      .filter((value): value is boolean => typeof value === "boolean");
    if (oldVals.length) {
      enabled[row.kind] = oldVals.some((value) => value !== false);
    }
  }

  const dismissed = Array.isArray(incoming.dismissed)
    ? incoming.dismissed.filter((id): id is string => typeof id === "string")
    : [];

  return { enabled, dismissed };
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

export function dismissNotificationIds(
  prefs: NotificationPrefs,
  ids: string[]
): NotificationPrefs {
  const next = new Set(prefs.dismissed);
  for (const id of ids) next.add(id);
  return { ...prefs, dismissed: [...next] };
}

/** Map a home-feed row id to a preference section. */
export function kindFromStatusId(id: string): NotificationSection | null {
  if (id === "game" || id.startsWith("game")) return "desire";
  if (id.startsWith("dare")) return "desire";
  if (id.startsWith("fantasy")) return "desire";
  if (id.startsWith("checkin")) return "check_in";
  if (id.startsWith("curiosity")) return "connect";
  if (id.startsWith("talk")) return "connect";
  if (id === "jar" || id.startsWith("jar")) return "connect";
  if (id.startsWith("list")) return "connect";
  if (id.startsWith("coupon")) return "play";
  if (id.startsWith("scratch")) return "play";
  if (id.startsWith("milestone")) return "calendar";
  if (id.startsWith("date") || id.startsWith("bucket")) return "calendar";
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

export function prefsShowStatusId(
  prefs: NotificationPrefs,
  id: string
): boolean {
  if (prefs.dismissed.includes(id)) return false;
  return prefsAllowStatusId(prefs, id);
}
