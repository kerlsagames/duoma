import { addDaysToDateKey, localDateKey, parseDateKey } from "@/lib/dates";

export const CALENDAR_REPEATS = ["none", "day", "week", "2week", "month", "year"] as const;
export type CalendarRepeat = (typeof CALENDAR_REPEATS)[number];

export const CALENDAR_COVERS = ["all", "m", "f", "both", "kids"] as const;
export type CalendarCovers = (typeof CALENDAR_COVERS)[number];

export function hydrateRepeat(value: unknown): CalendarRepeat {
  return CALENDAR_REPEATS.includes(value as CalendarRepeat)
    ? (value as CalendarRepeat)
    : "none";
}

export function hydrateCovers(value: unknown): CalendarCovers {
  return CALENDAR_COVERS.includes(value as CalendarCovers)
    ? (value as CalendarCovers)
    : "all";
}

export function repeatLabel(repeat: CalendarRepeat): string {
  switch (repeat) {
    case "day":
      return "Every day";
    case "week":
      return "Every week";
    case "2week":
      return "Every 2 weeks";
    case "month":
      return "Every month";
    case "year":
      return "Every year";
    default:
      return "Doesn't repeat";
  }
}

export function coversLabel(covers: CalendarCovers): string {
  switch (covers) {
    case "m":
      return "M";
    case "f":
      return "F";
    case "both":
      return "Both";
    case "kids":
      return "Kids";
    default:
      return "All";
  }
}

/** All shows every note. A specific person also sees notes that include them. */
export function coversMatches(note: CalendarCovers, filter: CalendarCovers): boolean {
  if (filter === "all" || note === "all") return true;
  if (filter === "m") return note === "m" || note === "both";
  if (filter === "f") return note === "f" || note === "both";
  if (filter === "both") return note === "both";
  return note === "kids";
}

function addMonthsToDateKey(key: string, months: number): string {
  const date = parseDateKey(key);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return localDateKey(date);
}

function stepDate(key: string, repeat: CalendarRepeat): string {
  if (repeat === "day") return addDaysToDateKey(key, 1);
  if (repeat === "week") return addDaysToDateKey(key, 7);
  if (repeat === "2week") return addDaysToDateKey(key, 14);
  if (repeat === "month") return addMonthsToDateKey(key, 1);
  if (repeat === "year") return addMonthsToDateKey(key, 12);
  return key;
}

export function calendarWindow(today = localDateKey()): { start: string; end: string } {
  return {
    start: addDaysToDateKey(today, -450),
    end: addDaysToDateKey(today, 450),
  };
}

/** One-off notes always return their date. Repeats fill the window, including every 2 weeks. */
export function occurrenceDates(
  start: string,
  repeat: CalendarRepeat,
  rangeStart: string,
  rangeEnd: string
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return [];
  if (repeat === "none") return [start];
  const out: string[] = [];
  let cursor = start;
  let guard = 0;
  while (cursor < rangeStart && guard < 2500) {
    const next = stepDate(cursor, repeat);
    if (next <= cursor) break;
    cursor = next;
    guard += 1;
  }
  while (cursor <= rangeEnd && out.length < 900 && guard < 4000) {
    if (cursor >= rangeStart) out.push(cursor);
    const next = stepDate(cursor, repeat);
    if (next <= cursor) break;
    cursor = next;
    guard += 1;
  }
  return out;
}

export function nextOccurrenceOnOrAfter(
  start: string,
  repeat: CalendarRepeat,
  today: string
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return null;
  if (repeat === "none") return start >= today ? start : null;
  return occurrenceDates(start, repeat, today, addDaysToDateKey(today, 800))[0] ?? null;
}

/** Same clock time as the original note, on a later repeat date. */
export function occurrenceIso(
  happenedAt: string,
  dateKey: string,
  allDay: boolean
): string {
  if (allDay) return `${dateKey}T12:00:00`;
  const original = new Date(happenedAt);
  if (Number.isNaN(original.getTime())) return `${dateKey}T12:00:00`;
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    original.getHours(),
    original.getMinutes(),
    0,
    0
  );
  return next.toISOString();
}
