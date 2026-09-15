import { localDateKey } from "@/lib/dates";

export type Holiday = {
  id: string;
  dateKey: string;
  title: string;
};

function pad(month: number, day: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nthWeekday(
  year: number,
  monthIndex: number,
  weekday: number,
  nth: number
): string {
  const date = new Date(year, monthIndex, 1);
  let seen = 0;
  while (date.getMonth() === monthIndex) {
    if (date.getDay() === weekday) {
      seen += 1;
      if (seen === nth) return localDateKey(date);
    }
    date.setDate(date.getDate() + 1);
  }
  return pad(monthIndex + 1, 1, year);
}

function lastWeekday(year: number, monthIndex: number, weekday: number): string {
  const date = new Date(year, monthIndex + 1, 0);
  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() - 1);
  }
  return localDateKey(date);
}

function holidaysForYear(year: number): Holiday[] {
  return [
    { id: `nye:${year}`, dateKey: pad(1, 1, year), title: "New Year's Day" },
    { id: `valentines:${year}`, dateKey: pad(2, 14, year), title: "Valentine's Day" },
    {
      id: `st-patrick:${year}`,
      dateKey: pad(3, 17, year),
      title: "St. Patrick's Day",
    },
    {
      id: `mothers:${year}`,
      dateKey: nthWeekday(year, 4, 0, 2),
      title: "Mother's Day",
    },
    {
      id: `memorial:${year}`,
      dateKey: lastWeekday(year, 4, 1),
      title: "Memorial Day",
    },
    {
      id: `fathers:${year}`,
      dateKey: nthWeekday(year, 5, 0, 3),
      title: "Father's Day",
    },
    { id: `july4:${year}`, dateKey: pad(7, 4, year), title: "Independence Day" },
    {
      id: `labor:${year}`,
      dateKey: nthWeekday(year, 8, 1, 1),
      title: "Labor Day",
    },
    { id: `halloween:${year}`, dateKey: pad(10, 31, year), title: "Halloween" },
    {
      id: `thanksgiving:${year}`,
      dateKey: nthWeekday(year, 10, 4, 4),
      title: "Thanksgiving",
    },
    { id: `xmas-eve:${year}`, dateKey: pad(12, 24, year), title: "Christmas Eve" },
    { id: `xmas:${year}`, dateKey: pad(12, 25, year), title: "Christmas" },
    { id: `nye-eve:${year}`, dateKey: pad(12, 31, year), title: "New Year's Eve" },
  ];
}

export function holidaysAround(from = new Date()): Holiday[] {
  const year = from.getFullYear();
  return [...holidaysForYear(year - 1), ...holidaysForYear(year), ...holidaysForYear(year + 1)];
}

export function upcomingHolidays(from = localDateKey(), limit = 4): Holiday[] {
  return holidaysAround()
    .filter((row) => row.dateKey >= from)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(0, limit);
}
