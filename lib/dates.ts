export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatLongDate(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/** e.g. just now, 12m ago, yesterday — for tickers and inboxes. */
export function formatRelativeWhen(iso: string, from = Date.now()): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "today";
  const mins = Math.max(0, Math.round((from - at) / 60000));
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

/** e.g. Wed, Sep 16 · 9:43 pm */
export function formatDateAndTime(iso: string): string {
  const time = formatClockTime(iso);
  const key = dateKeyFromIso(iso);
  if (!time) return formatLongDate(key);
  return `${formatLongDate(key)} · ${time}`;
}

/** e.g. 9:43 pm */
export function formatClockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\s?(AM|PM)/i, (_, mer) => mer.toLowerCase())
    .replace(/\u202f/g, " ");
}

/** Local noon on a date key — useful default for all-day custom events. */
export function noonOnDateKey(key: string): string {
  const date = parseDateKey(key);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

export function dateKeyFromIso(iso: string): string {
  return localDateKey(new Date(iso));
}

export function daysUntil(key: string, from = new Date()): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const target = parseDateKey(key);
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export function addDaysToDateKey(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

/** Next occurrence of a weekday (0 Sun–6 Sat). Same day counts as this week. */
export function upcomingWeekday(weekday: number, from = new Date()): string {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  const delta = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + delta);
  return localDateKey(date);
}

/** Local clock on a date key. */
export function dateAtLocalHours(
  key: string,
  hours: number,
  minutes = 0
): Date {
  const date = parseDateKey(key);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function endOfLocalDay(key: string): Date {
  const date = parseDateKey(key);
  date.setHours(23, 59, 59, 999);
  return date;
}

/** `HH:mm` from an ISO stamp, local. */
export function clockTimeValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function isoFromDateAndTime(dateKey: string, time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  const hours = match ? Number(match[1]) : 9;
  const minutes = match ? Number(match[2]) : 0;
  return dateAtLocalHours(dateKey, hours, minutes).toISOString();
}

export function isSunday(date = new Date()): boolean {
  return date.getDay() === 0;
}

export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: ({ date: string; day: number } | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date: localDateKey(date), day });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function addMonths(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** Sunday of the week that contains `key`, matching the month grid. */
export function startOfWeek(key: string): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() - date.getDay());
  return localDateKey(date);
}

export function weekDays(startKey: string): { date: string; day: number }[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDaysToDateKey(startKey, index);
    return { date, day: parseDateKey(date).getDate() };
  });
}

export function formatWeekRange(startKey: string): string {
  const start = parseDateKey(startKey);
  const end = parseDateKey(addDaysToDateKey(startKey, 6));
  const startMonth = start.toLocaleDateString(undefined, { month: "short" });
  const endMonth = end.toLocaleDateString(undefined, { month: "short" });
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()} to ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} to ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${startMonth} ${start.getDate()}, ${start.getFullYear()} to ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
}
