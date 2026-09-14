import { isCuriosityComplete } from "@/lib/curiosity";
import { dateKeyFromIso, localDateKey } from "@/lib/dates";
import type { AudioNote, IntimacyKind, IntimacyLog, Ping } from "@/lib/mini-content";
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

/** Streak days plus tonight’s logs — this is what sizes the flame. */
export function fireHeat(streak: number, todayCount: number, totalCount: number): number {
  const tonight = Math.min(10, todayCount) * 1.15;
  const body = Math.min(6, Math.log2(1 + totalCount) * 0.9);
  return streak + tonight + body;
}

/** Ember when cold. First logs jump the size; a week of streak fills the grate. */
export function fireScale(heat: number): number {
  if (heat <= 0.35) return 0.4;
  return 0.72 + Math.min(1.18, (heat - 0.35) * 0.17);
}

export function fireLabel(kind: IntimacyKind, fallback: string): string {
  if (kind in AUTO_KIND_META) {
    return AUTO_KIND_META[kind as keyof typeof AUTO_KIND_META].label;
  }
  return fallback;
}
