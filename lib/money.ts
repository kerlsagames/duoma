import { localDateKey, parseDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";

export type PayCadence = "weekly" | "fortnight";
export type BillCadence = "weekly" | "fortnight" | "monthly" | "quarterly" | "yearly";
export type GoalHorizon = "long" | "short";
export type SpendWho = "us" | "me" | "them";

export type BillCategory =
  | "housing"
  | "utilities"
  | "insurance"
  | "phone"
  | "subscriptions"
  | "transport"
  | "debt"
  | "childcare"
  | "health"
  | "other";

export type SpendCategory =
  | "groceries"
  | "eating-out"
  | "fuel"
  | "shopping"
  | "health"
  | "fun"
  | "home"
  | "gifts"
  | "transport"
  | "savings"
  | "other";

export type MoneyGoal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  color: string;
  horizon: GoalHorizon;
  note: string;
  createdAt: string;
  completedAt: string | null;
};

export type PaySource = {
  id: string;
  label: string;
  amount: number;
  cadence: PayCadence;
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  cadence: BillCadence;
  category: BillCategory;
  dueOn: string;
  note: string;
  paidPeriodStarts: string[];
};

export type Spend = {
  id: string;
  name: string;
  amount: number;
  category: SpendCategory;
  date: string;
  who: SpendWho;
  note: string;
};

export type BudgetState = {
  cycle: PayCadence;
  periodStart: string;
  pays: PaySource[];
  bills: Bill[];
  spends: Spend[];
};

export const GOAL_COLORS = [
  "#3ECFBF",
  "#F0C75E",
  "#FF6B9A",
  "#8FA8C8",
  "#C9A0DC",
  "#E0896A",
] as const;

export const PAY_CADENCES: { id: PayCadence; label: string; hint: string }[] = [
  { id: "weekly", label: "Weekly", hint: "Every 7 days" },
  { id: "fortnight", label: "Fortnight", hint: "Every 14 days" },
];

export const BILL_CADENCES: { id: BillCadence; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "fortnight", label: "Fortnight" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];

export const BILL_CATEGORIES: { id: BillCategory; label: string }[] = [
  { id: "housing", label: "Housing" },
  { id: "utilities", label: "Utilities" },
  { id: "insurance", label: "Insurance" },
  { id: "phone", label: "Phone / internet" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "transport", label: "Transport" },
  { id: "debt", label: "Debt" },
  { id: "childcare", label: "Childcare" },
  { id: "health", label: "Health" },
  { id: "other", label: "Other" },
];

export const SPEND_CATEGORIES: { id: SpendCategory; label: string }[] = [
  { id: "groceries", label: "Groceries" },
  { id: "eating-out", label: "Eating out" },
  { id: "fuel", label: "Fuel" },
  { id: "shopping", label: "Shopping" },
  { id: "health", label: "Health" },
  { id: "fun", label: "Fun" },
  { id: "home", label: "Home" },
  { id: "gifts", label: "Gifts" },
  { id: "transport", label: "Transport" },
  { id: "savings", label: "To a goal" },
  { id: "other", label: "Other" },
];

const GOAL_SEEDS: {
  title: string;
  target: number;
  color: string;
  horizon: GoalHorizon;
}[] = [
  { title: "Escape weekend", target: 800, color: "#FF6B9A", horizon: "short" },
  { title: "The nice couch", target: 2400, color: "#3ECFBF", horizon: "long" },
  {
    title: "Anniversary dinner that hurts a little",
    target: 350,
    color: "#F0C75E",
    horizon: "short",
  },
];

export function emptyBudget(): BudgetState {
  return {
    cycle: "fortnight",
    periodStart: "",
    pays: [],
    bills: [],
    spends: [],
  };
}

function seedGoalId(title: string): string {
  return `goal:seed:${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export function defaultGoals(): MoneyGoal[] {
  return GOAL_SEEDS.map((row) => ({
    id: seedGoalId(row.title),
    title: row.title,
    target: row.target,
    saved: Math.round(row.target * 0.18),
    color: row.color,
    horizon: row.horizon,
    note: "",
    createdAt: "",
    completedAt: null,
  }));
}

export function dedupeMoneyGoals(rows: MoneyGoal[]): MoneyGoal[] {
  const map = new Map<string, MoneyGoal>();
  for (const row of rows) {
    const key = row.title.trim().toLowerCase();
    if (!key) continue;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, row);
      continue;
    }
    const richer =
      row.saved > prev.saved ||
      (row.saved === prev.saved && (row.completedAt || "") > (prev.completedAt || ""))
        ? row
        : prev;
    map.set(key, richer);
  }
  return [...map.values()];
}

export function parseMoney(raw: string): number | null {
  const n = Number(String(raw).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export function money(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `−$${formatted}` : `$${formatted}`;
}

export function daysInCycle(cycle: PayCadence): 7 | 14 {
  return cycle === "weekly" ? 7 : 14;
}

export function addDateDays(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function periodEnd(start: string, cycle: PayCadence): string {
  return addDateDays(start, daysInCycle(cycle) - 1);
}

export function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/** Monday of the week that contains `date`. */
export function mondayOf(date: string): string {
  const d = parseDateKey(date);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDateDays(date, offset);
}

export function defaultPeriodStart(today: string, cycle: PayCadence): string {
  const monday = mondayOf(today);
  return periodContaining(today, cycle, monday);
}

export function periodContaining(
  date: string,
  cycle: PayCadence,
  anchor: string
): string {
  const len = daysInCycle(cycle);
  const dateMs = parseDateKey(date).getTime();
  const anchorMs = parseDateKey(anchor).getTime();
  const diffDays = Math.round((dateMs - anchorMs) / 86400000);
  const offset = Math.floor(diffDays / len) * len;
  return addDateDays(anchor, offset);
}

export function resolvedPeriodStart(
  budget: BudgetState,
  today = localDateKey()
): string {
  if (budget.periodStart) return budget.periodStart;
  return defaultPeriodStart(today, budget.cycle);
}

export function shiftPeriod(start: string, cycle: PayCadence, direction: -1 | 1): string {
  return addDateDays(start, direction * daysInCycle(cycle));
}

export function categoryLabel(
  id: BillCategory | SpendCategory,
  list: { id: string; label: string }[]
): string {
  return list.find((row) => row.id === id)?.label ?? id;
}

export function formatPeriodRange(start: string, end: string): string {
  const a = parseDateKey(start);
  const b = parseDateKey(end);
  const sameMonth =
    a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const day = (d: Date) => d.getDate();
  const mon = (d: Date) => d.toLocaleDateString(undefined, { month: "short" });
  if (sameMonth) return `${day(a)}–${day(b)} ${mon(a)}`;
  return `${day(a)} ${mon(a)} – ${day(b)} ${mon(b)}`;
}

export function cadenceLabel(cadence: PayCadence | BillCadence): string {
  if (cadence === "weekly") return "week";
  if (cadence === "fortnight") return "fortnight";
  if (cadence === "monthly") return "month";
  if (cadence === "quarterly") return "quarter";
  return "year";
}

export function payInPeriod(pay: PaySource, cycle: PayCadence): number {
  if (pay.cadence === cycle) return pay.amount;
  if (pay.cadence === "weekly" && cycle === "fortnight") return pay.amount * 2;
  if (pay.cadence === "fortnight" && cycle === "weekly") return pay.amount / 2;
  return pay.amount;
}

const DAYS_PER_YEAR = 365.25;

export function billShareInPeriod(bill: Bill, cycle: PayCadence): number {
  const days = daysInCycle(cycle);
  switch (bill.cadence) {
    case "weekly":
      return bill.amount * (days / 7);
    case "fortnight":
      return bill.amount * (days / 14);
    case "monthly":
      return bill.amount * (days / 30.4375);
    case "quarterly":
      return bill.amount * (days / 91.3125);
    case "yearly":
      return bill.amount * (days / DAYS_PER_YEAR);
  }
}

export function advanceDue(dueOn: string, cadence: BillCadence): string {
  const date = parseDateKey(dueOn);
  if (cadence === "weekly") date.setDate(date.getDate() + 7);
  else if (cadence === "fortnight") date.setDate(date.getDate() + 14);
  else if (cadence === "monthly") date.setMonth(date.getMonth() + 1);
  else if (cadence === "quarterly") date.setMonth(date.getMonth() + 3);
  else date.setFullYear(date.getFullYear() + 1);
  return localDateKey(date);
}

export function markBillPaid(bill: Bill, periodStart: string, periodEndKey: string): Bill {
  const paid = bill.paidPeriodStarts.includes(periodStart)
    ? bill.paidPeriodStarts
    : [...bill.paidPeriodStarts, periodStart];
  let dueOn = bill.dueOn;
  let guard = 0;
  while (dueOn <= periodEndKey && guard < 24) {
    dueOn = advanceDue(dueOn, bill.cadence);
    guard += 1;
  }
  return { ...bill, paidPeriodStarts: paid, dueOn };
}

export function unmarkBillPaid(bill: Bill, periodStart: string): Bill {
  return {
    ...bill,
    paidPeriodStarts: bill.paidPeriodStarts.filter((key) => key !== periodStart),
  };
}

export function spendInPeriod(spends: Spend[], start: string, end: string): Spend[] {
  return spends
    .filter((row) => inRange(row.date, start, end))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export type BudgetSnapshot = {
  cycle: PayCadence;
  start: string;
  end: string;
  income: number;
  billShare: number;
  spent: number;
  left: number;
  spends: Spend[];
  spendByCategory: { id: SpendCategory; label: string; total: number }[];
};

export function budgetSnapshot(
  budget: BudgetState,
  today = localDateKey()
): BudgetSnapshot {
  const start = resolvedPeriodStart(budget, today);
  const end = periodEnd(start, budget.cycle);
  const income = budget.pays.reduce((sum, row) => sum + payInPeriod(row, budget.cycle), 0);
  const billShare = budget.bills.reduce(
    (sum, row) => sum + billShareInPeriod(row, budget.cycle),
    0
  );
  const spends = spendInPeriod(budget.spends, start, end);
  const spent = spends.reduce((sum, row) => sum + row.amount, 0);
  const byCat = new Map<SpendCategory, number>();
  for (const row of spends) {
    byCat.set(row.category, (byCat.get(row.category) ?? 0) + row.amount);
  }
  const spendByCategory = SPEND_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    total: byCat.get(cat.id) ?? 0,
  })).filter((row) => row.total > 0);
  return {
    cycle: budget.cycle,
    start,
    end,
    income,
    billShare,
    spent,
    left: income - billShare - spent,
    spends,
    spendByCategory,
  };
}

export function billStatus(
  bill: Bill,
  start: string,
  end: string
): "paid" | "due" | "overdue" | "later" {
  if (bill.paidPeriodStarts.includes(start)) return "paid";
  if (bill.dueOn < start) return "overdue";
  if (inRange(bill.dueOn, start, end)) return "due";
  return "later";
}

export function sortedBills(bills: Bill[], start: string, end: string): Bill[] {
  const rank = { overdue: 0, due: 1, later: 2, paid: 3 };
  return bills.slice().sort((a, b) => {
    const sa = billStatus(a, start, end);
    const sb = billStatus(b, start, end);
    if (rank[sa] !== rank[sb]) return rank[sa] - rank[sb];
    return a.dueOn.localeCompare(b.dueOn) || a.name.localeCompare(b.name);
  });
}

export function goalProgress(goal: MoneyGoal): number {
  if (goal.target <= 0) return 0;
  return Math.max(0, Math.min(1, goal.saved / goal.target));
}

export function isGoalReached(goal: MoneyGoal): boolean {
  return Boolean(goal.completedAt) || goal.saved >= goal.target;
}

export function contributeToGoal(goal: MoneyGoal, amount: number): MoneyGoal {
  const saved = Math.max(0, Math.round((goal.saved + amount) * 100) / 100);
  const capped = Math.min(goal.target, saved);
  const reached = capped >= goal.target;
  return {
    ...goal,
    saved: capped,
    completedAt: reached ? goal.completedAt ?? nowIso() : null,
  };
}

export function nextGoalColor(existing: MoneyGoal[]): string {
  return GOAL_COLORS[existing.length % GOAL_COLORS.length]!;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function hydrateMoneyGoal(raw: unknown): MoneyGoal | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<MoneyGoal>;
  const title = asString(row.title).trim();
  const target = asNumber(row.target);
  if (!title || target <= 0) return null;
  const saved = Math.max(0, asNumber(row.saved));
  const horizon: GoalHorizon =
    row.horizon === "long" || row.horizon === "short"
      ? row.horizon
      : target >= 1500
        ? "long"
        : "short";
  return {
    id: asString(row.id) || seedGoalId(title),
    title,
    target,
    saved,
    color: asString(row.color) || nextGoalColor([]),
    horizon,
    note: asString(row.note),
    createdAt: asString(row.createdAt),
    completedAt: asString(row.completedAt) || null,
  };
}

function hydratePay(raw: unknown): PaySource | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<PaySource>;
  const label = asString(row.label).trim();
  const amount = asNumber(row.amount);
  if (!label || amount <= 0) return null;
  return {
    id: asString(row.id) || createId(),
    label,
    amount,
    cadence: row.cadence === "weekly" ? "weekly" : "fortnight",
  };
}

function hydrateBill(raw: unknown): Bill | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Bill>;
  const name = asString(row.name).trim();
  const amount = asNumber(row.amount);
  if (!name || amount <= 0) return null;
  const cadence = BILL_CADENCES.some((item) => item.id === row.cadence)
    ? (row.cadence as BillCadence)
    : "monthly";
  const category = BILL_CATEGORIES.some((item) => item.id === row.category)
    ? (row.category as BillCategory)
    : "other";
  const paidPeriodStarts = Array.isArray(row.paidPeriodStarts)
    ? row.paidPeriodStarts.filter((item): item is string => typeof item === "string")
    : [];
  return {
    id: asString(row.id) || createId(),
    name,
    amount,
    cadence,
    category,
    dueOn: asString(row.dueOn) || localDateKey(),
    note: asString(row.note),
    paidPeriodStarts,
  };
}

function hydrateSpend(raw: unknown): Spend | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Spend>;
  const name = asString(row.name).trim();
  const amount = asNumber(row.amount);
  if (!name || amount <= 0) return null;
  const category = SPEND_CATEGORIES.some((item) => item.id === row.category)
    ? (row.category as SpendCategory)
    : "other";
  const who: SpendWho = row.who === "me" || row.who === "them" || row.who === "us" ? row.who : "us";
  return {
    id: asString(row.id) || createId(),
    name,
    amount,
    category,
    date: asString(row.date) || localDateKey(),
    who,
    note: asString(row.note),
  };
}

export function hydrateBudget(raw: unknown): BudgetState {
  const base = emptyBudget();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<BudgetState>;
  return {
    cycle: row.cycle === "weekly" ? "weekly" : "fortnight",
    periodStart: asString(row.periodStart),
    pays: Array.isArray(row.pays)
      ? row.pays.map(hydratePay).filter((item): item is PaySource => Boolean(item))
      : [],
    bills: Array.isArray(row.bills)
      ? row.bills.map(hydrateBill).filter((item): item is Bill => Boolean(item))
      : [],
    spends: Array.isArray(row.spends)
      ? row.spends.map(hydrateSpend).filter((item): item is Spend => Boolean(item))
      : [],
  };
}
