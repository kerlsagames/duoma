import {
  addMonths,
  daysUntil,
  localDateKey,
  parseDateKey,
} from "@/lib/dates";
import { createId } from "@/lib/ids";

export type PeriodFlow = "spotting" | "light" | "medium" | "heavy";
export type PeriodMood =
  | "fine"
  | "low"
  | "irritable"
  | "anxious"
  | "sensitive"
  | "energised";
export type PeriodSymptom =
  | "cramps"
  | "headache"
  | "bloating"
  | "fatigue"
  | "back"
  | "tender"
  | "acne"
  | "nausea";

export type PeriodDayLog = {
  date: string;
  flow: PeriodFlow | null;
  symptoms: PeriodSymptom[];
  mood: PeriodMood | null;
  note: string;
};

export type PeriodCycle = {
  id: string;
  start: string;
  end: string | null;
};

export type PeriodSettings = {
  typicalLength: number;
  typicalPeriod: number;
  lutealDays: number;
};

export type PeriodState = {
  cycles: PeriodCycle[];
  logs: PeriodDayLog[];
  settings: PeriodSettings;
};

export type DayMark = "period" | "predicted" | "fertile" | "ovulation" | "none";

export type CycleSnapshot = {
  averageLength: number;
  last: PeriodCycle | null;
  nextStart: string | null;
  ovulation: string | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  predictedEnd: string | null;
  todayKey: string;
  cycleDay: number | null;
  periodDay: number | null;
  inPeriod: boolean;
  inPredicted: boolean;
  inFertile: boolean;
  isOvulation: boolean;
};

export const FLOW_OPTIONS: { id: PeriodFlow; label: string }[] = [
  { id: "spotting", label: "Spotting" },
  { id: "light", label: "Light" },
  { id: "medium", label: "Medium" },
  { id: "heavy", label: "Heavy" },
];

export const MOOD_OPTIONS: { id: PeriodMood; label: string }[] = [
  { id: "fine", label: "Fine" },
  { id: "low", label: "Low" },
  { id: "irritable", label: "Irritable" },
  { id: "anxious", label: "Anxious" },
  { id: "sensitive", label: "Sensitive" },
  { id: "energised", label: "Energised" },
];

export const SYMPTOM_OPTIONS: { id: PeriodSymptom; label: string }[] = [
  { id: "cramps", label: "Cramps" },
  { id: "headache", label: "Headache" },
  { id: "bloating", label: "Bloating" },
  { id: "fatigue", label: "Tired" },
  { id: "back", label: "Back" },
  { id: "tender", label: "Tender" },
  { id: "acne", label: "Skin" },
  { id: "nausea", label: "Nausea" },
];

export function emptyPeriodState(): PeriodState {
  return {
    cycles: [],
    logs: [],
    settings: { typicalLength: 28, typicalPeriod: 5, lutealDays: 14 },
  };
}

export function addDays(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function daysBetween(from: string, to: string): number {
  return daysUntil(to, parseDateKey(from));
}

export function sortCycles(cycles: PeriodCycle[]): PeriodCycle[] {
  return [...cycles].sort((a, b) => a.start.localeCompare(b.start));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function hydratePeriodState(raw: unknown): PeriodState {
  const base = emptyPeriodState();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<PeriodState>;
  const settings = row.settings ?? base.settings;
  return {
    cycles: Array.isArray(row.cycles)
      ? row.cycles
          .filter((item): item is PeriodCycle =>
            Boolean(item && typeof item.id === "string" && typeof item.start === "string")
          )
          .map((item) => ({
            id: item.id,
            start: item.start,
            end: typeof item.end === "string" ? item.end : null,
          }))
      : [],
    logs: Array.isArray(row.logs)
      ? row.logs
          .filter((item): item is PeriodDayLog =>
            Boolean(item && typeof item.date === "string")
          )
          .map((item) => ({
            date: item.date,
            flow: item.flow ?? null,
            symptoms: Array.isArray(item.symptoms) ? item.symptoms : [],
            mood: item.mood ?? null,
            note: typeof item.note === "string" ? item.note : "",
          }))
      : [],
    settings: {
      typicalLength: clamp(Number(settings.typicalLength) || 28, 21, 45),
      typicalPeriod: clamp(Number(settings.typicalPeriod) || 5, 2, 10),
      lutealDays: clamp(Number(settings.lutealDays) || 14, 10, 16),
    },
  };
}

export function cycleLengths(cycles: PeriodCycle[]): number[] {
  const starts = sortCycles(cycles).map((row) => row.start);
  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i += 1) {
    const span = daysBetween(starts[i - 1]!, starts[i]!);
    if (span >= 18 && span <= 60) lengths.push(span);
  }
  return lengths;
}

export function averageCycleLength(state: PeriodState): number {
  const recent = cycleLengths(state.cycles).slice(-6);
  if (!recent.length) return state.settings.typicalLength;
  return Math.round(recent.reduce((sum, n) => sum + n, 0) / recent.length);
}

export function lastCycle(cycles: PeriodCycle[]): PeriodCycle | null {
  const sorted = sortCycles(cycles);
  return sorted[sorted.length - 1] ?? null;
}

export function cycleForDate(
  cycles: PeriodCycle[],
  date: string,
  typicalPeriod: number
): PeriodCycle | null {
  return (
    sortCycles(cycles)
      .filter((row) => {
        const end = row.end ?? addDays(row.start, typicalPeriod - 1);
        return row.start <= date && date <= end;
      })
      .at(-1) ?? null
  );
}

export function dateRange(start: string, end: string): string[] {
  if (end < start) return [];
  const keys: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    keys.push(cursor);
    cursor = addDays(cursor, 1);
    if (keys.length > 80) break;
  }
  return keys;
}

export function snapshot(state: PeriodState, today = localDateKey()): CycleSnapshot {
  const averageLength = averageCycleLength(state);
  const last = lastCycle(state.cycles);
  const nextStart = last ? addDays(last.start, averageLength) : null;
  const predictedEnd = nextStart
    ? addDays(nextStart, state.settings.typicalPeriod - 1)
    : null;
  const ovulation = nextStart ? addDays(nextStart, -state.settings.lutealDays) : null;
  const fertileStart = ovulation ? addDays(ovulation, -5) : null;
  const fertileEnd = ovulation ? addDays(ovulation, 1) : null;
  const openEnd = last
    ? last.end ?? addDays(last.start, state.settings.typicalPeriod - 1)
    : null;
  const inPeriod = Boolean(last && last.start <= today && today <= (openEnd ?? last.start));
  const inPredicted = Boolean(
    !inPeriod && nextStart && predictedEnd && nextStart <= today && today <= predictedEnd
  );
  const inFertile = Boolean(
    fertileStart && fertileEnd && fertileStart <= today && today <= fertileEnd
  );
  const periodDay =
    inPeriod && last ? daysBetween(last.start, today) + 1 : null;
  const cycleDay = last && today >= last.start ? daysBetween(last.start, today) + 1 : null;

  return {
    averageLength,
    last,
    nextStart,
    ovulation,
    fertileStart,
    fertileEnd,
    predictedEnd,
    todayKey: today,
    cycleDay,
    periodDay,
    inPeriod,
    inPredicted,
    inFertile,
    isOvulation: ovulation === today,
  };
}

export function markForDate(state: PeriodState, date: string, snap: CycleSnapshot): DayMark {
  const logged = cycleForDate(state.cycles, date, state.settings.typicalPeriod);
  if (logged) return "period";
  if (snap.ovulation === date) return "ovulation";
  if (
    snap.fertileStart &&
    snap.fertileEnd &&
    snap.fertileStart <= date &&
    date <= snap.fertileEnd
  ) {
    return "fertile";
  }
  if (
    snap.nextStart &&
    snap.predictedEnd &&
    snap.nextStart <= date &&
    date <= snap.predictedEnd
  ) {
    return "predicted";
  }
  return "none";
}

export function startPeriodOn(state: PeriodState, date: string): PeriodState {
  if (state.cycles.some((row) => row.start === date)) return state;
  const sorted = sortCycles(state.cycles);
  const previous = [...sorted].reverse().find((row) => row.start < date);
  let cycles = state.cycles;
  if (previous && !previous.end) {
    const closeOn = addDays(date, -1);
    cycles = cycles.map((row) =>
      row.id === previous.id
        ? { ...row, end: closeOn < previous.start ? previous.start : closeOn }
        : row
    );
  }
  return {
    ...state,
    cycles: sortCycles([...cycles, { id: createId(), start: date, end: null }]),
  };
}

export function endPeriodOn(state: PeriodState, date: string): PeriodState {
  const covering = cycleForDate(state.cycles, date, state.settings.typicalPeriod);
  const open = sortCycles(state.cycles).find((row) => !row.end && row.start <= date);
  const target = covering ?? open ?? lastCycle(state.cycles.filter((row) => row.start <= date));
  if (!target) return startPeriodOn(state, date);
  if (date < target.start) return state;
  return {
    ...state,
    cycles: state.cycles.map((row) =>
      row.id === target.id ? { ...row, end: date } : row
    ),
  };
}

export function removeCycle(state: PeriodState, id: string): PeriodState {
  return { ...state, cycles: state.cycles.filter((row) => row.id !== id) };
}

export function logForDate(state: PeriodState, date: string): PeriodDayLog | null {
  return state.logs.find((row) => row.date === date) ?? null;
}

export function upsertLog(
  state: PeriodState,
  date: string,
  patch: Partial<Omit<PeriodDayLog, "date">>
): PeriodState {
  const current = logForDate(state, date) ?? {
    date,
    flow: null,
    symptoms: [],
    mood: null,
    note: "",
  };
  const next: PeriodDayLog = {
    ...current,
    ...patch,
    date,
    symptoms: patch.symptoms ?? current.symptoms,
  };
  const empty =
    !next.flow && !next.mood && !next.note.trim() && next.symptoms.length === 0;
  return {
    ...state,
    logs: empty
      ? state.logs.filter((row) => row.date !== date)
      : [next, ...state.logs.filter((row) => row.date !== date)],
  };
}

export function updateSettings(
  state: PeriodState,
  patch: Partial<PeriodSettings>
): PeriodState {
  return {
    ...state,
    settings: {
      typicalLength: clamp(patch.typicalLength ?? state.settings.typicalLength, 21, 45),
      typicalPeriod: clamp(patch.typicalPeriod ?? state.settings.typicalPeriod, 2, 10),
      lutealDays: clamp(patch.lutealDays ?? state.settings.lutealDays, 10, 16),
    },
  };
}

export function historyRows(state: PeriodState): {
  cycle: PeriodCycle;
  length: number | null;
  bleed: number | null;
}[] {
  const sorted = sortCycles(state.cycles).reverse();
  return sorted.map((cycle, index) => {
    const newer = sorted[index - 1];
    const length = newer ? daysBetween(cycle.start, newer.start) : null;
    const bleed = cycle.end ? daysBetween(cycle.start, cycle.end) + 1 : null;
    return { cycle, length, bleed };
  });
}

export { addMonths };
