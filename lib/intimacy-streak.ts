import { isCuriosityComplete } from "@/lib/curiosity";
import { addDaysToDateKey, dateKeyFromIso, localDateKey } from "@/lib/dates";
import {
  INTIMACY_KINDS,
  type AudioNote,
  type IntimacyKind,
  type IntimacyLog,
  type Ping,
} from "@/lib/mini-content";
import type {
  CuriosityAnswer,
  GameSession,
  JarNote,
  SpicyDarePlay,
  TalkDraw,
} from "@/lib/types";

export type IntimacyFuelInput = {
  stored: IntimacyLog[];
  spicyDares: SpicyDarePlay[];
  nights: GameSession[];
  pings: Ping[];
  talkDraws: TalkDraw[];
  jarNotes: JarNote[];
  curiosityAnswers: CuriosityAnswer[];
  audioNotes: AudioNote[];
};

const AUTO_KIND_META: Record<
  Extract<IntimacyKind, "dare" | "spicy" | "ping" | "connect">,
  { label: string }
> = {
  dare: { label: "Completed dare" },
  spicy: { label: "Get Spicy night" },
  ping: { label: "Thought-of-you" },
  connect: { label: "Connect" },
};

/** Five empty days in a row snuffs the fire. */
export const MISS_DAYS_TO_OUT = 5;

/** Days shown in the chart window. */
export const GRAPH_WINDOW_DAYS = 7;

/** How far you can page back. */
export const GRAPH_HISTORY_DAYS = 120;

/** Tiny spark when the first log of a stretch lands. */
const SPARK_LEVEL = 2.5;

/**
 * Slow climb — about three months of near-daily care to fill the grate.
 * Extra logs the same day help a little, not a leap.
 */
const GROWTH_BASE = 0.55;
const GROWTH_EXTRA = 0.12;
const GROWTH_EXTRA_CAP = 3;

/** Shrink harder the longer the cold stretch — fifth miss goes to zero. */
const MISS_DECAY = [0, 11, 16, 24, 34] as const;

/** While still within the five-night window, keep a visible ember — decay never snuffs early. */
const COOLING_EMBER = 1;

export function dateOffset(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return localDateKey(d);
}

function safeDateKey(iso: string | null | undefined, fallback: string): string {
  if (!iso) return fallback;
  const key = dateKeyFromIso(iso);
  return key || fallback;
}

function autoLog(row: {
  sourceId: string;
  userId: string;
  kind: IntimacyKind;
  note: string;
  date: string;
  createdAt: string;
}): IntimacyLog {
  return {
    id: `auto:${row.sourceId}`,
    userId: row.userId || "couple",
    kind: row.kind,
    note: row.note,
    date: row.date,
    createdAt: row.createdAt,
    sourceId: row.sourceId,
  };
}

export function deriveAutoLogs(input: Omit<IntimacyFuelInput, "stored">): IntimacyLog[] {
  const logs: IntimacyLog[] = [];

  for (const row of input.spicyDares) {
    if (row.status !== "done") continue;
    const createdAt = row.completedAt ?? row.answeredAt ?? row.createdAt;
    logs.push(
      autoLog({
        sourceId: `dare:${row.id}`,
        userId: row.fromUserId,
        kind: "dare",
        note: row.text.slice(0, 80) || "Completed dare",
        date: safeDateKey(createdAt, localDateKey()),
        createdAt,
      })
    );
  }

  for (const night of input.nights) {
    if (night.gameKey !== "get-spicy") continue;
    if (night.status !== "completed" && !night.completedAt) continue;
    const createdAt = night.completedAt ?? night.updatedAt ?? night.createdAt;
    logs.push(
      autoLog({
        sourceId: `spicy:${night.id}`,
        userId: night.initiatorId,
        kind: "spicy",
        note: "A Get Spicy night",
        date: night.playedDate || safeDateKey(createdAt, localDateKey()),
        createdAt,
      })
    );
  }

  for (const row of input.pings) {
    logs.push(
      autoLog({
        sourceId: `ping:${row.id}`,
        userId: row.fromId,
        kind: "ping",
        note: "A thought-of-you ping",
        date: safeDateKey(row.createdAt, localDateKey()),
        createdAt: row.createdAt,
      })
    );
  }

  for (const row of input.talkDraws) {
    if (!row.answeredAt) continue;
    logs.push(
      autoLog({
        sourceId: `connect:talk:${row.id}`,
        userId: row.userId,
        kind: "connect",
        note: "Talk to Me",
        date: row.date || safeDateKey(row.answeredAt, localDateKey()),
        createdAt: row.answeredAt,
      })
    );
  }

  for (const row of input.jarNotes) {
    logs.push(
      autoLog({
        sourceId: `connect:jar-write:${row.id}`,
        userId: row.fromUserId,
        kind: "connect",
        note: "Jar note written",
        date: safeDateKey(row.createdAt, localDateKey()),
        createdAt: row.createdAt,
      })
    );
    if (row.openedAt) {
      logs.push(
        autoLog({
          sourceId: `connect:jar-open:${row.id}`,
          userId: row.fromUserId,
          kind: "connect",
          note: "Jar note opened",
          date: safeDateKey(row.openedAt, localDateKey()),
          createdAt: row.openedAt,
        })
      );
    }
  }

  for (const row of input.curiosityAnswers) {
    const started =
      isCuriosityComplete(row) ||
      row.answerIndex != null ||
      Boolean(row.body?.trim());
    if (!started) continue;
    logs.push(
      autoLog({
        sourceId: `connect:curiosity:${row.id}`,
        userId: row.userId,
        kind: "connect",
        note: "Curiosity question",
        date: row.date || safeDateKey(row.createdAt, localDateKey()),
        createdAt: row.createdAt,
      })
    );
  }

  for (const row of input.audioNotes) {
    logs.push(
      autoLog({
        sourceId: `connect:voice:${row.id}`,
        userId: row.fromId,
        kind: "connect",
        note: row.title || "Voice note",
        date: safeDateKey(row.createdAt, localDateKey()),
        createdAt: row.createdAt,
      })
    );
  }

  return logs;
}

export function mergeIntimacyLogs(stored: IntimacyLog[], auto: IntimacyLog[]): IntimacyLog[] {
  const seen = new Set(
    stored.map((row) => row.sourceId).filter((id): id is string => Boolean(id))
  );
  const extra = auto.filter((row) => !row.sourceId || !seen.has(row.sourceId));
  return [...stored, ...extra].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function collectIntimacyLogs(input: IntimacyFuelInput): IntimacyLog[] {
  return mergeIntimacyLogs(input.stored, deriveAutoLogs(input));
}

export function intimacyStreak(dates: Set<string>, today = localDateKey()): number {
  const hasToday = dates.has(today);
  const yesterday = dateOffset(1);
  if (!hasToday && !dates.has(yesterday)) return 0;
  let n = 0;
  for (let i = hasToday ? 0 : 1; i < 400; i += 1) {
    if (dates.has(dateOffset(i))) n += 1;
    else break;
  }
  return n;
}

export function fireLabel(kind: IntimacyKind, fallback: string): string {
  if (kind in AUTO_KIND_META) {
    return AUTO_KIND_META[kind as keyof typeof AUTO_KIND_META].label;
  }
  return fallback;
}

export function colorForKind(kind: IntimacyKind): string {
  return INTIMACY_KINDS.find((row) => row.id === kind)?.color ?? "#FF6A3D";
}

export function groupLogsByDate(logs: IntimacyLog[]): Map<string, IntimacyLog[]> {
  const map = new Map<string, IntimacyLog[]>();
  for (const row of logs) {
    const list = map.get(row.date) ?? [];
    list.push(row);
    map.set(row.date, list);
  }
  return map;
}

export type DayBarSegment = {
  kind: IntimacyKind;
  color: string;
  count: number;
};

export type DayBar = {
  date: string;
  total: number;
  segments: DayBarSegment[];
};

/** Oldest → newest. Includes empty days so the axis stays honest. */
export function buildDayBars(
  logs: IntimacyLog[],
  dayCount = GRAPH_HISTORY_DAYS,
  today = localDateKey()
): DayBar[] {
  const byDate = groupLogsByDate(logs);
  const bars: DayBar[] = [];
  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const date = dateOffset(i, new Date(`${today}T12:00:00`));
    const rows = byDate.get(date) ?? [];
    const counts = new Map<IntimacyKind, number>();
    for (const row of rows) {
      counts.set(row.kind, (counts.get(row.kind) ?? 0) + 1);
    }
    const segments: DayBarSegment[] = [...counts.entries()]
      .map(([kind, count]) => ({
        kind,
        count,
        color: colorForKind(kind),
      }))
      .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind));
    bars.push({ date, total: rows.length, segments });
  }
  return bars;
}

export type FireState = {
  /** 0–100. Grows slowly over months; empty days pull it down. */
  level: number;
  lit: boolean;
  missStreak: number;
  /** Days that actually fed the fire since the earliest log. */
  fedDays: number;
  /** Consecutive fed days in the current lit stretch (1 on first spark). */
  day: number;
};

function growthForDay(count: number): number {
  if (count <= 0) return 0;
  const extras = Math.min(GROWTH_EXTRA_CAP, Math.max(0, count - 1));
  return GROWTH_BASE + extras * GROWTH_EXTRA;
}

function decayForMiss(missStreak: number): number {
  if (missStreak <= 0) return 0;
  if (missStreak >= MISS_DAYS_TO_OUT) return 100;
  return MISS_DECAY[missStreak] ?? 34;
}

/**
 * Walk day-by-day from the first log so the fire has to earn size over months,
 * and five finished quiet days snuff it.
 *
 * Today is grace: an empty morning does not count as a miss while the day is
 * still open — you still have until tonight to feed it.
 */
export function computeFireState(
  logs: IntimacyLog[],
  today = localDateKey()
): FireState {
  const byDate = groupLogsByDate(logs);
  if (byDate.size === 0) {
    return { level: 0, lit: false, missStreak: 0, fedDays: 0, day: 0 };
  }

  const earliest = [...byDate.keys()].sort()[0]!;
  let cursor = earliest;
  let level = 0;
  let lit = false;
  let missStreak = 0;
  let fedDays = 0;
  let day = 0;

  while (cursor <= today) {
    const count = byDate.get(cursor)?.length ?? 0;
    const isToday = cursor === today;
    if (count > 0) {
      missStreak = 0;
      fedDays += 1;
      if (!lit) {
        level = SPARK_LEVEL;
        lit = true;
        day = 1;
      } else {
        day += 1;
      }
      level = Math.min(100, level + growthForDay(count));
    } else if (lit && !isToday) {
      // Only finished days can miss — today stays open until midnight.
      missStreak += 1;
      day = 0;
      if (missStreak >= MISS_DAYS_TO_OUT) {
        level = 0;
        lit = false;
        missStreak = MISS_DAYS_TO_OUT;
      } else {
        // Cool down only. A small fire must still survive quiet nights until night 5.
        level = Math.max(COOLING_EMBER, level - decayForMiss(missStreak));
      }
    }
    if (cursor === today) break;
    cursor = addDaysToDateKey(cursor, 1);
  }

  return {
    level: Math.round(level * 10) / 10,
    lit: lit && level > 0,
    missStreak,
    fedDays,
    day: lit && level > 0 ? Math.max(1, day) : 0,
  };
}

/** Legacy heat used by older campfire math (streak + tonight). */
export function fireHeat(streak: number, todayCount: number, totalCount: number): number {
  const tonight = Math.min(10, todayCount) * 1.15;
  const body = Math.min(6, Math.log2(1 + totalCount) * 0.9);
  return streak + tonight + body;
}

/**
 * Map 0–100 fire level onto the campfire’s visual scale.
 * Day one must read as a speck — not a campfire.
 */
export function fireScale(level: number): number {
  if (level <= 0) return 0.18;
  if (level < 12) return 0.14 + (level / 12) * 0.12; // ~0.14–0.26 spark
  if (level < 35) return 0.26 + ((level - 12) / 23) * 0.2;
  if (level < 70) return 0.46 + ((level - 35) / 35) * 0.28;
  return 0.74 + Math.min(0.4, ((level - 70) / 30) * 0.4);
}

/** Consecutive day count for “day 1” copy. */
export function fireDayCount(state: FireState): number {
  return state.day;
}

export function fireCaption(state: FireState): string {
  if (!state.lit || state.level <= 0) {
    if (state.fedDays === 0) {
      return "Cold stones. Desire, Connect, or a manual log lights a tiny spark.";
    }
    return "The fire went out after too many quiet nights. One log today starts a new spark.";
  }
  if (state.missStreak > 0) {
    const left = MISS_DAYS_TO_OUT - state.missStreak;
    return `Cooling — ${state.missStreak} quiet night${state.missStreak === 1 ? "" : "s"}. Feed it today — ${left} more finished quiet day${left === 1 ? "" : "s"} and it goes out.`;
  }
  if (state.day <= 1 || state.level < 15) {
    return "Day 1 spark. It only grows if you keep feeding it — slowly, over months.";
  }
  if (state.level < 40) {
    return "Building. Daily care from Desire & Connect stacks up over weeks.";
  }
  if (state.level < 75) {
    return "A steady fire — months of small moments, not one big night.";
  }
  return "A long-tended blaze. Keep the nights warm or it will shrink.";
}
