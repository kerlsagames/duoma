import {
  addDaysToDateKey,
  clockTimeValue,
  daysUntil,
  formatLongDate,
  isoFromDateAndTime,
  localDateKey,
  parseDateKey,
} from "@/lib/dates";
import type { CalendarCustomEvent, CalendarRepeat } from "@/lib/types";

export const CALENDAR_REPEAT_OPTIONS: { id: CalendarRepeat; label: string }[] = [
  { id: "none", label: "Doesn't repeat" },
  { id: "weekly", label: "Every week" },
  { id: "fortnightly", label: "Every 2 weeks" },
  { id: "monthly", label: "Every month" },
  { id: "yearly", label: "Every year" },
];

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function asCalendarRepeat(value: unknown): CalendarRepeat {
  if (
    value === "weekly" ||
    value === "fortnightly" ||
    value === "monthly" ||
    value === "yearly"
  ) {
    return value;
  }
  return "none";
}

export function eventRepeat(row: Pick<CalendarCustomEvent, "repeat">): CalendarRepeat {
  return asCalendarRepeat(row.repeat);
}

export function repeatLabel(repeat: CalendarRepeat): string | null {
  switch (repeat) {
    case "weekly":
      return "Every week";
    case "fortnightly":
      return "Every 2 weeks";
    case "monthly":
      return "Every month";
    case "yearly":
      return "Every year";
    default:
      return null;
  }
}

export function weekdayName(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, { weekday: "long" });
}

export function repeatHint(repeat: CalendarRepeat, startDate: string): string | null {
  if (!DATE_KEY_RE.test(startDate) || repeat === "none") return null;
  const day = weekdayName(startDate);
  const when = formatLongDate(startDate);
  if (repeat === "weekly") return `Repeats every ${day} from ${when}.`;
  if (repeat === "fortnightly") return `Repeats every second ${day} from ${when}.`;
  if (repeat === "monthly") return `Repeats on this day each month from ${when}.`;
  return `Repeats on this date each year from ${when}.`;
}

export function addMonthsToDateKey(key: string, months: number): string {
  const date = parseDateKey(key);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return localDateKey(date);
}

export function happenedAtOnDate(happenedAt: string, dateKey: string): string {
  const time = clockTimeValue(happenedAt);
  if (!time) return `${dateKey}T12:00:00.000Z`;
  return isoFromDateAndTime(dateKey, time);
}

export function occurrencesInRange(
  start: string,
  repeat: CalendarRepeat,
  from: string,
  to: string
): string[] {
  if (!DATE_KEY_RE.test(start)) return [];
  if (repeat === "none") {
    return start >= from && start <= to ? [start] : [];
  }

  if (repeat === "weekly" || repeat === "fortnightly") {
    const step = repeat === "weekly" ? 7 : 14;
    let cursor = start;
    if (cursor < from) {
      const delta = daysUntil(from, parseDateKey(start));
      const skip = Math.ceil(delta / step) * step;
      cursor = addDaysToDateKey(start, Math.max(0, skip));
    }
    const keys: string[] = [];
    while (cursor <= to) {
      if (cursor >= from) keys.push(cursor);
      cursor = addDaysToDateKey(cursor, step);
    }
    return keys;
  }

  const stepMonths = repeat === "monthly" ? 1 : 12;
  const keys: string[] = [];
  for (let n = 0; n < 400; n += 1) {
    const next = addMonthsToDateKey(start, n * stepMonths);
    if (next > to) break;
    if (next >= from) keys.push(next);
  }
  return keys;
}

export function nextOccurrence(
  start: string,
  repeat: CalendarRepeat,
  from = new Date()
): string | null {
  const today = localDateKey(from);
  if (repeat === "none") return start >= today ? start : null;
  const windowEnd = addMonthsToDateKey(today, 24);
  return occurrencesInRange(start, repeat, today, windowEnd)[0] ?? null;
}

export function expandEventDates(
  row: Pick<CalendarCustomEvent, "date" | "repeat">,
  from = addMonthsToDateKey(localDateKey(), -18),
  to = addMonthsToDateKey(localDateKey(), 24)
): string[] {
  return occurrencesInRange(row.date, eventRepeat(row), from, to);
}
