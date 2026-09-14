import { addDaysToDateKey, localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import type {
  PackItem,
  Trip,
  TripBooking,
  TripBookingKind,
  TripDay,
  TripPlanItem,
  TripStop,
} from "@/lib/mini-content";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export const BOOKING_KINDS: {
  id: TripBookingKind;
  label: string;
  icon: string;
}[] = [
  { id: "stay", label: "Stay", icon: "bed" },
  { id: "flight", label: "Flight", icon: "airplane" },
  { id: "train", label: "Train", icon: "train" },
  { id: "ticket", label: "Ticket", icon: "ticket" },
  { id: "car", label: "Car / ride", icon: "car" },
  { id: "other", label: "Other", icon: "link" },
];

export function isDateKey(value: string): boolean {
  return DATE_KEY.test(value);
}

export function emptyTripDay(index: number, date = ""): TripDay {
  return {
    id: createId(),
    date,
    title: date ? prettyDayTitle(date, index) : `Day ${index}`,
    items: [],
  };
}

export function prettyDayTitle(date: string, index: number): string {
  if (!isDateKey(date)) return `Day ${index}`;
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return `Day ${index}`;
  const label = parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `Day ${index} · ${label}`;
}

/** Build one day card per calendar day between start and end (inclusive). */
export function daysForRange(start: string, end: string): TripDay[] {
  if (!isDateKey(start)) return [emptyTripDay(1)];
  const last = isDateKey(end) && end >= start ? end : start;
  const days: TripDay[] = [];
  let cursor = start;
  let index = 1;
  while (cursor <= last && index <= 45) {
    days.push(emptyTripDay(index, cursor));
    cursor = addDaysToDateKey(cursor, 1);
    index += 1;
  }
  return days;
}

export function createTrip(input: {
  title: string;
  where: string;
  start: string;
  end: string;
  notes?: string;
}): Trip {
  const start = input.start.trim();
  const end = input.end.trim();
  return {
    id: createId(),
    title: input.title.trim(),
    where: input.where.trim(),
    start,
    end,
    notes: input.notes?.trim() ?? "",
    days: daysForRange(start, end),
    bookings: [],
    packing: [
      { id: createId(), label: "Chargers", packed: false },
      { id: createId(), label: "IDs / passports", packed: false },
      { id: createId(), label: "Tickets (screenshots)", packed: false },
    ],
    createdAt: nowIso(),
  };
}

export function tripPlanCost(trip: Trip): number {
  const days = trip.days.reduce(
    (sum, day) => sum + day.items.reduce((inner, item) => inner + (item.cost || 0), 0),
    0
  );
  const bookings = trip.bookings.reduce((sum, row) => sum + (row.cost || 0), 0);
  return Math.round((days + bookings) * 100) / 100;
}

export function tripDayCount(trip: Trip): number {
  return trip.days.length;
}

export function tripSummary(trip: Trip): string {
  const bits: string[] = [];
  if (trip.where) bits.push(trip.where);
  if (trip.start || trip.end) {
    bits.push([trip.start || "TBD", trip.end || "TBD"].join(" → "));
  }
  bits.push(`${trip.days.length} day${trip.days.length === 1 ? "" : "s"}`);
  return bits.join(" · ");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function hydratePlanItem(raw: unknown): TripPlanItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<TripPlanItem> & Partial<TripStop>;
  const title = asString(row.title).trim();
  if (!title) return null;
  return {
    id: asString(row.id, createId()),
    title,
    detail: asString(row.detail),
    time: asString(row.time ?? row.when),
    cost: asNumber(row.cost),
    done: asBool(row.done),
    url: asString(row.url),
  };
}

function hydrateDay(raw: unknown, index: number): TripDay | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<TripDay>;
  const items = Array.isArray(row.items)
    ? row.items.map(hydratePlanItem).filter((item): item is TripPlanItem => Boolean(item))
    : [];
  const date = asString(row.date);
  const title = asString(row.title).trim() || prettyDayTitle(date, index + 1);
  return {
    id: asString(row.id, createId()),
    date,
    title,
    items,
  };
}

function hydrateBooking(raw: unknown): TripBooking | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<TripBooking>;
  const title = asString(row.title).trim();
  if (!title) return null;
  const kind = BOOKING_KINDS.some((item) => item.id === row.kind)
    ? (row.kind as TripBookingKind)
    : "other";
  return {
    id: asString(row.id, createId()),
    kind,
    title,
    url: asString(row.url),
    note: asString(row.note),
    cost: asNumber(row.cost),
    dayDate: asString(row.dayDate),
    fileUri: asString(row.fileUri),
    fileName: asString(row.fileName),
  };
}

function hydratePack(raw: unknown): PackItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<PackItem>;
  const label = asString(row.label).trim();
  if (!label) return null;
  return {
    id: asString(row.id, createId()),
    label,
    packed: asBool(row.packed),
  };
}

/** Accept current trips and migrate older stop-list saves. */
export function hydrateTrip(raw: unknown): Trip | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Trip> & { stops?: TripStop[] };
  const title = asString(row.title).trim();
  if (!title) return null;

  let days = Array.isArray(row.days)
    ? row.days
        .map((day, index) => hydrateDay(day, index))
        .filter((day): day is TripDay => Boolean(day))
    : [];

  if (days.length === 0 && Array.isArray(row.stops) && row.stops.length > 0) {
    days = [
      {
        id: createId(),
        date: asString(row.start),
        title: "Itinerary",
        items: row.stops
          .map(hydratePlanItem)
          .filter((item): item is TripPlanItem => Boolean(item)),
      },
    ];
  }

  if (days.length === 0) {
    days = daysForRange(asString(row.start), asString(row.end));
  }

  return {
    id: asString(row.id, createId()),
    title,
    where: asString(row.where),
    start: asString(row.start),
    end: asString(row.end),
    notes: asString(row.notes),
    days,
    bookings: Array.isArray(row.bookings)
      ? row.bookings
          .map(hydrateBooking)
          .filter((item): item is TripBooking => Boolean(item))
      : [],
    packing: Array.isArray(row.packing)
      ? row.packing.map(hydratePack).filter((item): item is PackItem => Boolean(item))
      : [],
    createdAt: asString(row.createdAt, nowIso()),
  };
}

export function todayKey(): string {
  return localDateKey();
}
