import type { CalendarActivityKind } from "@/lib/calendar-activity";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const CALENDAR_PREFS_KEY = "duoma:calendarPrefs";

export type CalendarListMode = "all" | "preview";

export type CalendarPrefs = {
  enabledKinds: Record<CalendarActivityKind, boolean>;
  listMode: CalendarListMode;
};

export const CALENDAR_KIND_OPTIONS: {
  kind: CalendarActivityKind;
  label: string;
}[] = [
  { kind: "spicy_night", label: "Spicy nights" },
  { kind: "check_in", label: "Check-ins" },
  { kind: "talk", label: "Talk to Me" },
  { kind: "list", label: "Lists" },
  { kind: "dare", label: "Dares" },
  { kind: "coupon", label: "Coupons" },
  { kind: "jar", label: "Jar notes" },
  { kind: "curiosity", label: "Curiosity" },
  { kind: "ritual", label: "Rituals" },
  { kind: "bucket", label: "Date nights" },
  { kind: "milestone", label: "Milestones" },
  { kind: "scratch", label: "Scratch cards" },
  { kind: "custom", label: "Your entries" },
  { kind: "birthday", label: "Birthdays" },
  { kind: "trip", label: "Trips" },
  { kind: "job", label: "Jobs to do" },
];

export function defaultCalendarPrefs(): CalendarPrefs {
  const enabledKinds = {} as Record<CalendarActivityKind, boolean>;
  for (const row of CALENDAR_KIND_OPTIONS) {
    enabledKinds[row.kind] = true;
  }
  return { enabledKinds, listMode: "preview" };
}

export function hydrateCalendarPrefs(
  raw: Partial<CalendarPrefs> | null | undefined
): CalendarPrefs {
  const base = defaultCalendarPrefs();
  if (!raw) return base;
  const enabledKinds = { ...base.enabledKinds };
  if (raw.enabledKinds) {
    for (const row of CALENDAR_KIND_OPTIONS) {
      if (typeof raw.enabledKinds[row.kind] === "boolean") {
        enabledKinds[row.kind] = raw.enabledKinds[row.kind];
      }
    }
  }
  return {
    enabledKinds,
    listMode: raw.listMode === "all" ? "all" : "preview",
  };
}

export async function readCalendarPrefs(): Promise<CalendarPrefs> {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(CALENDAR_PREFS_KEY);
      return hydrateCalendarPrefs(raw ? JSON.parse(raw) : null);
    }
    const raw = await AsyncStorage.getItem(CALENDAR_PREFS_KEY);
    return hydrateCalendarPrefs(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultCalendarPrefs();
  }
}

export async function writeCalendarPrefs(prefs: CalendarPrefs): Promise<void> {
  const raw = JSON.stringify(prefs);
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(CALENDAR_PREFS_KEY, raw);
    return;
  }
  await AsyncStorage.setItem(CALENDAR_PREFS_KEY, raw);
}
