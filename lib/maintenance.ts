import { addDaysToDateKey, localDateKey } from "@/lib/dates";

type Task = {
  id: string;
  label: string;
  everyDays: number;
  lastDone: string | null;
  gone?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MaintView = "list" | "pegboard";
export type MaintSort = "due" | "overdue" | "name";

export type MaintPrefs = {
  view: MaintView;
  sort: MaintSort;
};

export const DEFAULT_MAINT_PREFS: MaintPrefs = {
  view: "list",
  sort: "due",
};

export const MAINT_SUGGESTIONS: { label: string; everyDays: number }[] = [
  { label: "Change HVAC filter", everyDays: 90 },
  { label: "Run washing machine cleaner", everyDays: 60 },
  { label: "Check smoke / CO batteries", everyDays: 180 },
  { label: "Car oil & tires glance", everyDays: 90 },
  { label: "Deep-clean fridge", everyDays: 45 },
  { label: "Descale the kettle / coffee gear", everyDays: 30 },
  { label: "Gutters / outdoor drain peek", everyDays: 120 },
  { label: "Water the neglected plant", everyDays: 7 },
  { label: "Clean the oven", everyDays: 60 },
  { label: "Wipe rangehood filters", everyDays: 30 },
  { label: "Vacuum under the sofa", everyDays: 21 },
  { label: "Wash the doona / duvet", everyDays: 90 },
  { label: "Clean bathroom grout", everyDays: 60 },
  { label: "Replace toothbrush heads", everyDays: 90 },
  { label: "Defrost the freezer", everyDays: 180 },
  { label: "Clean the dishwasher filter", everyDays: 30 },
  { label: "Test the leftover leftovers", everyDays: 7 },
  { label: "Wipe the window tracks", everyDays: 45 },
  { label: "Flush unused taps", everyDays: 14 },
  { label: "Check the first-aid kit", everyDays: 180 },
  { label: "Clean the ceiling fans", everyDays: 90 },
  { label: "Wash the dog beds / car seats", everyDays: 30 },
  { label: "Service the mower / tools", everyDays: 180 },
  { label: "Clean the microwave", everyDays: 14 },
];

export function hydrateMaintPrefs(raw: unknown): MaintPrefs {
  const base = { ...DEFAULT_MAINT_PREFS };
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<MaintPrefs>;
  return {
    view: row.view === "pegboard" || row.view === "list" ? row.view : base.view,
    sort: row.sort === "overdue" || row.sort === "name" || row.sort === "due" ? row.sort : base.sort,
  };
}

export function isOnceOff(everyDays: number): boolean {
  return !Number.isFinite(everyDays) || everyDays < 1;
}

export function isActiveMaintTask(row: Pick<Task, "everyDays" | "lastDone" | "gone">): boolean {
  if (row.gone) return false;
  if (isOnceOff(row.everyDays) && row.lastDone) return false;
  return true;
}

export function hydrateMaintTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Task> & { once?: boolean };
  const label = typeof row.label === "string" ? row.label.trim() : "";
  if (!label) return null;
  const once = row.once === true || isOnceOff(Number(row.everyDays));
  const everyDays = once ? 0 : Math.max(1, Math.round(Number(row.everyDays) || 30));
  const createdAt =
    typeof row.createdAt === "string" && row.createdAt ? row.createdAt : "";
  const lastDone = typeof row.lastDone === "string" ? row.lastDone : null;
  const updatedAt =
    typeof row.updatedAt === "string" && row.updatedAt
      ? row.updatedAt
      : lastDone || createdAt;
  return {
    id: typeof row.id === "string" && row.id ? row.id : `job:${label.toLowerCase()}`,
    label,
    everyDays,
    lastDone,
    gone: row.gone === true,
    createdAt,
    updatedAt,
  };
}

export function dueOn(
  lastDone: string | null,
  everyDays: number,
  today = localDateKey()
): string {
  if (isOnceOff(everyDays)) return lastDone ?? today;
  if (!lastDone) return today;
  return addDaysToDateKey(lastDone, everyDays);
}

export function daysUntilDue(lastDone: string | null, everyDays: number, today = localDateKey()): number {
  const due = dueOn(lastDone, everyDays, today);
  const a = Date.parse(`${today}T12:00:00`);
  const b = Date.parse(`${due}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

export function isOverdue(lastDone: string | null, everyDays: number, today = localDateKey()): boolean {
  return dueOn(lastDone, everyDays, today) <= today;
}

export function dueLabel(lastDone: string | null, everyDays: number, today = localDateKey()): string {
  if (isOnceOff(everyDays)) {
    return lastDone ? "Done · once" : "Once · do it";
  }
  const n = daysUntilDue(lastDone, everyDays, today);
  if (n < 0) return n === -1 ? "Due yesterday" : `Due ${Math.abs(n)} days ago`;
  if (n === 0) return "Due today";
  if (n === 1) return "Due tomorrow";
  return `Due in ${n} days`;
}

export function sortMaintTasks(rows: Task[], sort: MaintSort, today = localDateKey()): Task[] {
  return [...rows].sort((a, b) => {
    if (sort === "name") return a.label.localeCompare(b.label);
    const da = daysUntilDue(a.lastDone, a.everyDays, today);
    const db = daysUntilDue(b.lastDone, b.everyDays, today);
    const aDone = !isOnceOff(a.everyDays) && Boolean(a.lastDone) && da > 0;
    const bDone = !isOnceOff(b.everyDays) && Boolean(b.lastDone) && db > 0;
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (sort === "overdue") {
      const ao = da <= 0 ? 0 : 1;
      const bo = db <= 0 ? 0 : 1;
      if (ao !== bo) return ao - bo;
    }
    if (da !== db) return da - db;
    return a.label.localeCompare(b.label);
  });
}

export function unusedSuggestions(existing: Task[]): { label: string; everyDays: number }[] {
  const have = new Set(
    existing.filter(isActiveMaintTask).map((row) => row.label.toLowerCase())
  );
  return MAINT_SUGGESTIONS.filter((row) => !have.has(row.label.toLowerCase()));
}
