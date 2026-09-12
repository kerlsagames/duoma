import { createId, nowIso } from "@/lib/ids";
import { daysUntil, localDateKey } from "@/lib/dates";

export type BirthdayCircle = "family" | "friends";

export type Birthday = {
  id: string;
  name: string;
  circle: BirthdayCircle;
  month: number;
  day: number;
  createdAt: string;
};

export const BIRTHDAY_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function daysInMonth(month: number, year = 2024): number {
  return new Date(year, month + 1, 0).getDate();
}

export function clampBirthdayDay(month: number, day: number): number {
  return Math.max(1, Math.min(day, daysInMonth(month)));
}

export function birthdayDateKey(
  year: number,
  month: number,
  day: number
): string {
  const safeDay = Math.min(day, daysInMonth(month, year));
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(safeDay).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function formatBirthdayDate(month: number, day: number): string {
  return `${BIRTHDAY_MONTHS[month] ?? "January"} ${day}`;
}

export function nextBirthdayKey(
  month: number,
  day: number,
  from = new Date()
): string {
  const today = localDateKey(from);
  const thisYear = birthdayDateKey(from.getFullYear(), month, day);
  if (thisYear >= today) return thisYear;
  return birthdayDateKey(from.getFullYear() + 1, month, day);
}

export function upcomingInDays(month: number, day: number, from = new Date()): number {
  return daysUntil(nextBirthdayKey(month, day, from), from);
}

export function emptyBirthdays(): Birthday[] {
  return [];
}

export function hydrateBirthday(raw: unknown): Birthday | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Birthday>;
  if (typeof row.name !== "string" || !row.name.trim()) return null;
  const month = typeof row.month === "number" ? row.month : 0;
  const day = typeof row.day === "number" ? row.day : 1;
  return {
    id: typeof row.id === "string" ? row.id : createId(),
    name: row.name.trim(),
    circle: row.circle === "friends" ? "friends" : "family",
    month: Math.max(0, Math.min(11, month)),
    day: clampBirthdayDay(Math.max(0, Math.min(11, month)), day),
    createdAt: typeof row.createdAt === "string" ? row.createdAt : nowIso(),
  };
}

export function hydrateBirthdays(raw: unknown): Birthday[] {
  if (!Array.isArray(raw)) return emptyBirthdays();
  return raw
    .map(hydrateBirthday)
    .filter((row): row is Birthday => Boolean(row))
    .sort(sortBirthdays);
}

export function sortBirthdays(a: Birthday, b: Birthday): number {
  const ad = upcomingInDays(a.month, a.day);
  const bd = upcomingInDays(b.month, b.day);
  if (ad !== bd) return ad - bd;
  return a.name.localeCompare(b.name);
}

export function addBirthday(
  list: Birthday[],
  input: { name: string; circle: BirthdayCircle; month: number; day: number }
): Birthday[] {
  const name = input.name.trim();
  if (!name) return list;
  const month = Math.max(0, Math.min(11, input.month));
  const next: Birthday = {
    id: createId(),
    name,
    circle: input.circle,
    month,
    day: clampBirthdayDay(month, input.day),
    createdAt: nowIso(),
  };
  return sortBirthdaysList([...list, next]);
}

export function removeBirthday(list: Birthday[], id: string): Birthday[] {
  return list.filter((row) => row.id !== id);
}

export function sortBirthdaysList(list: Birthday[]): Birthday[] {
  return [...list].sort(sortBirthdays);
}

export function birthdayById(list: Birthday[], id: string): Birthday | null {
  return list.find((row) => row.id === id) ?? null;
}
