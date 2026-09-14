import type { CalendarActivityKind } from "@/lib/calendar-activity";
import {
  DEFAULT_REMINDER_LEADS,
  hydrateReminderLeads,
  type ReminderLead,
  type ReminderTargetKind,
} from "@/lib/calendar-reminders";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const CALENDAR_PREFS_KEY = "duoma:calendarPrefs";

export type CalendarListMode = "all" | "preview";

export type CalendarLayout = "stack" | "split" | "agenda";

export type CalendarPrefs = {
  enabledKinds: Record<CalendarActivityKind, boolean>;
  listMode: CalendarListMode;
  layout: CalendarLayout;
  defaultLeads: Record<ReminderTargetKind, ReminderLead[]>;
  itemLeads: Record<string, ReminderLead[]>;
};

export const CALENDAR_LAYOUT_OPTIONS: {
  id: CalendarLayout;
  label: string;
  hint: string;
}[] = [
  {
    id: "stack",
    label: "Stacked",
    hint: "Month on top, that day's notes underneath. The default.",
  },
  {
    id: "split",
    label: "Split",
    hint: "Month on the left half, notes and notifications on the right.",
  },
  {
    id: "agenda",
    label: "Agenda",
    hint: "This month as a running list of notes, grouped by day.",
  },
];

export const CALENDAR_KIND_OPTIONS: {
  kind: CalendarActivityKind;
  label: string;
  hint?: string;
}[] = [
  { kind: "check_in", label: "Daily Check-In" },
  { kind: "talk", label: "Talk To Me" },
  { kind: "list", label: "Lists & Wishlist" },
  { kind: "curiosity", label: "Discover" },
  { kind: "jar", label: "Gratitude Jar" },
  { kind: "bucket", label: "Date Night" },
  { kind: "spicy_night", label: "Spicy Game" },
  { kind: "dare", label: "Dare Me" },
  { kind: "coupon", label: "Coupons" },
  { kind: "milestone", label: "Milestones" },
  { kind: "custom", label: "Your notes" },
  { kind: "birthday", label: "Birthdays" },
  { kind: "trip", label: "Trips" },
  { kind: "job", label: "Household jobs" },
];

const TARGET_KINDS: ReminderTargetKind[] = [
  "birthday",
  "custom",
  "trip",
  "job",
];

export function defaultCalendarPrefs(): CalendarPrefs {
  const enabledKinds = {} as Record<CalendarActivityKind, boolean>;
  for (const row of CALENDAR_KIND_OPTIONS) {
    enabledKinds[row.kind] = true;
  }
  return {
    enabledKinds,
    listMode: "preview",
    layout: "stack",
    defaultLeads: {
      birthday: [...DEFAULT_REMINDER_LEADS.birthday],
      custom: [...DEFAULT_REMINDER_LEADS.custom],
      trip: [...DEFAULT_REMINDER_LEADS.trip],
      job: [...DEFAULT_REMINDER_LEADS.job],
    },
    itemLeads: {},
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
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

  const defaultLeads = { ...base.defaultLeads };
  const incomingDefaults = asRecord(raw.defaultLeads);
  for (const kind of TARGET_KINDS) {
    if (kind in incomingDefaults) {
      defaultLeads[kind] = hydrateReminderLeads(incomingDefaults[kind]);
    }
  }

  const itemLeads: Record<string, ReminderLead[]> = {};
  const incomingItems = asRecord(raw.itemLeads);
  for (const [key, value] of Object.entries(incomingItems)) {
    if (typeof key !== "string" || !key.includes(":")) continue;
    itemLeads[key] = hydrateReminderLeads(value);
  }

  return {
    enabledKinds,
    listMode: raw.listMode === "all" ? "all" : "preview",
    layout:
      raw.layout === "split" || raw.layout === "agenda" ? raw.layout : "stack",
    defaultLeads,
    itemLeads,
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
    window.dispatchEvent(new Event("duoma:calendar-prefs"));
    return;
  }
  await AsyncStorage.setItem(CALENDAR_PREFS_KEY, raw);
}
