import {
  nextBirthdayKey,
  type Birthday,
} from "@/lib/birthdays";
import {
  dateAtLocalHours,
  daysUntil,
  endOfLocalDay,
  formatLongDate,
  localDateKey,
} from "@/lib/dates";
import { dueOn, isActiveMaintTask } from "@/lib/maintenance";
import type { MaintTask, Trip } from "@/lib/mini-content";
import type { CalendarCustomEvent } from "@/lib/types";
import type { Href } from "expo-router";
import { Platform } from "react-native";

export type ReminderLead = "at" | "15m" | "1h" | "1d" | "1w";

export type ReminderTargetKind = "birthday" | "custom" | "trip" | "job";

export const REMINDER_LEAD_OPTIONS: {
  id: ReminderLead;
  label: string;
  allDayLabel: string;
}[] = [
  { id: "at", label: "At the time", allDayLabel: "9:00 on the day" },
  { id: "15m", label: "15 minutes before", allDayLabel: "15 minutes before 9:00" },
  { id: "1h", label: "1 hour before", allDayLabel: "1 hour before 9:00" },
  { id: "1d", label: "1 day before", allDayLabel: "1 day before" },
  { id: "1w", label: "1 week before", allDayLabel: "1 week before" },
];

export const REMINDER_TARGET_OPTIONS: {
  kind: ReminderTargetKind;
  label: string;
  hint: string;
}[] = [
  {
    kind: "birthday",
    label: "Birthdays",
    hint: "Maya’s birthday is tomorrow — that kind of ping.",
  },
  {
    kind: "custom",
    label: "Your notes",
    hint: "Anything you add with + on General.",
  },
  {
    kind: "trip",
    label: "Trips",
    hint: "The morning you leave, or the day before.",
  },
  {
    kind: "job",
    label: "Household jobs",
    hint: "When a repeating job comes due.",
  },
];

export const DEFAULT_REMINDER_LEADS: Record<ReminderTargetKind, ReminderLead[]> = {
  birthday: ["1d"],
  custom: [],
  trip: ["1d"],
  job: [],
};

const ALL_DAY_HOUR = 9;

export function reminderItemKey(kind: ReminderTargetKind, id: string): string {
  return `${kind}:${id}`;
}

export function hydrateReminderLeads(raw: unknown): ReminderLead[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(REMINDER_LEAD_OPTIONS.map((row) => row.id));
  const seen = new Set<ReminderLead>();
  const leads: ReminderLead[] = [];
  for (const value of raw) {
    if (typeof value !== "string" || !allowed.has(value as ReminderLead)) continue;
    const lead = value as ReminderLead;
    if (seen.has(lead)) continue;
    seen.add(lead);
    leads.push(lead);
  }
  return leads;
}

export function toggleReminderLead(
  current: ReminderLead[],
  lead: ReminderLead
): ReminderLead[] {
  const next = current.includes(lead)
    ? current.filter((row) => row !== lead)
    : [...current, lead];
  return REMINDER_LEAD_OPTIONS.map((row) => row.id).filter((id) =>
    next.includes(id)
  );
}

export type CalendarReminderPrefs = {
  defaultLeads: Record<ReminderTargetKind, ReminderLead[]>;
  itemLeads: Record<string, ReminderLead[]>;
};

export function leadsForItem(
  prefs: CalendarReminderPrefs,
  kind: ReminderTargetKind,
  id: string
): ReminderLead[] {
  const key = reminderItemKey(kind, id);
  if (Object.prototype.hasOwnProperty.call(prefs.itemLeads, key)) {
    return prefs.itemLeads[key] ?? [];
  }
  return prefs.defaultLeads[kind] ?? [];
}

function jobDueDateKey(lastDone: string | null, everyDays: number): string {
  return dueOn(lastDone, everyDays);
}

function eventInstant(dateKey: string, at: Date | null): Date {
  if (at) return at;
  return dateAtLocalHours(dateKey, ALL_DAY_HOUR, 0);
}

export function fireAtForLead(eventAt: Date, lead: ReminderLead): Date {
  const fire = new Date(eventAt.getTime());
  if (lead === "at") return fire;
  if (lead === "15m") {
    fire.setMinutes(fire.getMinutes() - 15);
    return fire;
  }
  if (lead === "1h") {
    fire.setHours(fire.getHours() - 1);
    return fire;
  }
  if (lead === "1d") {
    fire.setDate(fire.getDate() - 1);
    return fire;
  }
  fire.setDate(fire.getDate() - 7);
  return fire;
}

export type CalendarReminder = {
  id: string;
  kind: ReminderTargetKind;
  targetId: string;
  lead: ReminderLead;
  title: string;
  body: string;
  href: Href;
  fireAt: number;
  eventAt: number;
  dateKey: string;
};

function pushReminder(
  items: CalendarReminder[],
  input: {
    kind: ReminderTargetKind;
    targetId: string;
    dateKey: string;
    eventAt: Date;
    leads: ReminderLead[];
    title: string;
    href: Href;
    allDay: boolean;
  }
) {
  for (const lead of input.leads) {
    const fire = fireAtForLead(input.eventAt, lead);
    items.push({
      id: `cal-remind-${input.kind}-${input.targetId}-${input.dateKey}-${lead}`,
      kind: input.kind,
      targetId: input.targetId,
      lead,
      title: input.title,
      body: reminderBody({
        title: input.title,
        dateKey: input.dateKey,
        lead,
        allDay: input.allDay,
        eventAt: input.eventAt,
      }),
      href: input.href,
      fireAt: fire.getTime(),
      eventAt: input.eventAt.getTime(),
      dateKey: input.dateKey,
    });
  }
}

function reminderBody(input: {
  title: string;
  dateKey: string;
  lead: ReminderLead;
  allDay: boolean;
  eventAt: Date;
}): string {
  const days = daysUntil(input.dateKey);
  if (input.lead === "1w") {
    return days <= 0
      ? `${input.title} is today.`
      : `${input.title} is in ${days} day${days === 1 ? "" : "s"}.`;
  }
  if (input.lead === "1d") {
    return days <= 0
      ? `${input.title} is today.`
      : `${input.title} is tomorrow.`;
  }
  if (input.lead === "15m") {
    return input.allDay
      ? `${input.title} is today.`
      : `${input.title} in 15 minutes.`;
  }
  if (input.lead === "1h") {
    return input.allDay ? `${input.title} is today.` : `${input.title} in 1 hour.`;
  }
  if (days <= 0) return `${input.title} is today.`;
  return `${input.title} · ${formatLongDate(input.dateKey)}`;
}

export function buildCalendarReminders(input: {
  birthdays: Birthday[];
  trips: Trip[];
  jobs: MaintTask[];
  events: CalendarCustomEvent[];
  prefs: CalendarReminderPrefs;
  now?: Date;
}): CalendarReminder[] {
  const now = input.now ?? new Date();
  const items: CalendarReminder[] = [];

  for (const row of input.birthdays) {
    const dateKey = nextBirthdayKey(row.month, row.day, now);
    const title = `${row.name}'s birthday`;
    pushReminder(items, {
      kind: "birthday",
      targetId: row.id,
      dateKey,
      eventAt: eventInstant(dateKey, null),
      leads: leadsForItem(input.prefs, "birthday", row.id),
      title,
      href: `/hub/calendar-item?kind=birthday&id=${encodeURIComponent(row.id)}`,
      allDay: true,
    });
  }

  for (const row of input.events) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) continue;
    if (daysUntil(row.date, now) < 0) continue;
    const allDay = row.allDay !== false;
    const timed = allDay ? null : new Date(row.happenedAt);
    const eventAt =
      timed && !Number.isNaN(timed.getTime())
        ? timed
        : eventInstant(row.date, null);
    pushReminder(items, {
      kind: "custom",
      targetId: row.id,
      dateKey: row.date,
      eventAt,
      leads: leadsForItem(input.prefs, "custom", row.id),
      title: row.title,
      href: `/hub/calendar-item?kind=custom&id=${encodeURIComponent(row.id)}`,
      allDay,
    });
  }

  for (const row of input.trips) {
    const start = /^\d{4}-\d{2}-\d{2}$/.test(row.start) ? row.start : null;
    if (!start || daysUntil(start, now) < 0) continue;
    pushReminder(items, {
      kind: "trip",
      targetId: row.id,
      dateKey: start,
      eventAt: eventInstant(start, null),
      leads: leadsForItem(input.prefs, "trip", row.id),
      title: row.title,
      href: `/hub/calendar-item?kind=trip&id=${encodeURIComponent(row.id)}`,
      allDay: true,
    });
  }

  for (const row of input.jobs) {
    if (!isActiveMaintTask(row) || !row.lastDone) continue;
    const dateKey = jobDueDateKey(row.lastDone, row.everyDays);
    if (daysUntil(dateKey, now) < -1) continue;
    pushReminder(items, {
      kind: "job",
      targetId: row.id,
      dateKey,
      eventAt: eventInstant(dateKey, null),
      leads: leadsForItem(input.prefs, "job", row.id),
      title: row.label,
      href: `/hub/calendar-item?kind=job&id=${encodeURIComponent(row.id)}`,
      allDay: true,
    });
  }

  return items.sort((a, b) => a.fireAt - b.fireAt);
}

/** Due for the home bell: fired, and the day has not passed. */
export function dueCalendarReminders(
  reminders: CalendarReminder[],
  now = new Date()
): CalendarReminder[] {
  const stamp = now.getTime();
  const today = localDateKey(now);
  return reminders.filter((row) => {
    if (row.fireAt > stamp) return false;
    if (row.dateKey < today) return false;
    return stamp <= endOfLocalDay(row.dateKey).getTime();
  });
}

const FIRED_KEY = "duoma:calendarReminderFired";

type FiredMap = Record<string, string>;

function readFired(): FiredMap {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(FIRED_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as FiredMap;
      return parsed && typeof parsed === "object" ? parsed : {};
    }
  } catch {
    /* ignore */
  }
  return {};
}

function writeFired(map: FiredMap) {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      localStorage.setItem(FIRED_KEY, JSON.stringify(map));
    }
  } catch {
    /* ignore */
  }
}

export function reminderAlreadyFired(id: string): boolean {
  return Boolean(readFired()[id]);
}

export function markReminderFired(id: string, at = new Date()): void {
  const map = readFired();
  map[id] = at.toISOString();
  const cutoff = at.getTime() - 21 * 86400000;
  for (const [key, value] of Object.entries(map)) {
    const stamp = Date.parse(value);
    if (!Number.isFinite(stamp) || stamp < cutoff) delete map[key];
  }
  writeFired(map);
}

export function leadLabel(lead: ReminderLead, allDay: boolean): string {
  const row = REMINDER_LEAD_OPTIONS.find((item) => item.id === lead);
  if (!row) return lead;
  return allDay ? row.allDayLabel : row.label;
}
