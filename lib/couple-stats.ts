import { addDaysToDateKey, dateKeyFromIso, localDateKey } from "@/lib/dates";
import { formatActiveTime } from "@/lib/legal";
import type {
  BucketItem,
  CalendarCustomEvent,
  CheckIn,
  ChickenPlay,
  Coupon,
  CuriosityAnswer,
  DateNightAsk,
  DeckCard,
  DesireToggle,
  ErrandItem,
  FantasyCompletion,
  FantasySwipe,
  GameSession,
  JarNote,
  ListEntry,
  MealRound,
  PositionInvite,
  PositionSave,
  Profile,
  RitualCheck,
  RoleplayInvite,
  RoleplaySave,
  SpicyDarePlay,
  TalkDraw,
  CardRating,
  Couple,
} from "@/lib/types";

export type StatSectionId = "general" | "connect" | "desire" | "fun" | "home";

export type StatRow = {
  id: string;
  label: string;
  value: string;
};

export type StatSection = {
  id: StatSectionId;
  label: string;
  hint: string;
  accent: string;
  rows: StatRow[];
};

export type CoupleStatInput = {
  user: Profile | null;
  partner: Profile | null;
  couple: Couple | null;
  nights: GameSession[];
  deck: DeckCard[];
  ratings: CardRating[];
  checkIns: CheckIn[];
  dateNightAsks: DateNightAsk[];
  jarNotes: JarNote[];
  talkDraws: TalkDraw[];
  listEntries: ListEntry[];
  curiosityAnswers: CuriosityAnswer[];
  spicyDares: SpicyDarePlay[];
  chickenPlays: ChickenPlay[];
  coupons: Coupon[];
  fantasySwipes: FantasySwipe[];
  fantasyCompletions: FantasyCompletion[];
  positionSaves: PositionSave[];
  positionInvites: PositionInvite[];
  roleplaySaves: RoleplaySave[];
  roleplayInvites: RoleplayInvite[];
  desireToggles: DesireToggle[];
  bucketItems: BucketItem[];
  calendarEvents: CalendarCustomEvent[];
  errandItems: ErrandItem[];
  mealRounds: MealRound[];
  ritualChecks: RitualCheck[];
};

function n(value: number): string {
  return String(value);
}

function mine<T extends { fromUserId?: string; userId?: string; createdBy?: string; initiatorId?: string }>(
  rows: T[],
  userId: string | undefined,
  key: keyof T
): T[] {
  if (!userId) return [];
  return rows.filter((row) => row[key] === userId);
}

export function activityDateKeys(input: CoupleStatInput): string[] {
  const days = new Set<string>();
  const push = (iso: string | null | undefined) => {
    if (!iso) return;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) days.add(iso);
    else {
      const key = dateKeyFromIso(iso);
      if (key) days.add(key);
    }
  };
  for (const row of input.checkIns) push(row.date || row.createdAt);
  for (const row of input.nights) push(row.completedAt || row.createdAt);
  for (const row of input.jarNotes) push(row.createdAt);
  for (const row of input.talkDraws) push(row.createdAt);
  for (const row of input.chickenPlays) push(row.createdAt);
  for (const row of input.spicyDares) push(row.createdAt);
  for (const row of input.dateNightAsks) push(row.createdAt);
  for (const row of input.coupons) push(row.createdAt);
  for (const row of input.ritualChecks) push(row.date);
  push(input.user?.lastSeenAt);
  push(input.partner?.lastSeenAt);
  return [...days].sort();
}

export function currentStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let cursor = localDateKey();
  if (!set.has(cursor)) cursor = addDaysToDateKey(cursor, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDaysToDateKey(cursor, -1);
  }
  return streak;
}

export function pairAgeDays(couple: Couple | null): number {
  if (!couple) return 0;
  const start = Date.parse(couple.pairedAt || couple.createdAt);
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
}

export function buildCoupleStats(input: CoupleStatInput): StatSection[] {
  const you = input.user?.id;
  const them = input.partner?.id;
  const spicy = input.nights.filter((row) => row.gameKey === "get-spicy");
  const spicyDone = spicy.filter((row) => row.status === "completed" || row.status === "rating");
  const playedCards = input.deck.filter((row) => row.status === "played");
  const bothDays = new Set(
    input.checkIns.filter((row) => row.userId === you).map((row) => row.date)
  );
  const theirCheckDays = new Set(
    input.checkIns.filter((row) => row.userId === them).map((row) => row.date)
  );
  let bothChecked = 0;
  for (const day of bothDays) if (theirCheckDays.has(day)) bothChecked += 1;

  const datesYou = input.dateNightAsks.filter((row) => row.fromUserId === you);
  const datesThem = input.dateNightAsks.filter((row) => row.fromUserId === them);
  const days = activityDateKeys(input);

  return [
    {
      id: "general",
      label: "General",
      hint: "The pair as a whole — time, streak, how long you have been us",
      accent: "#8B3A4A",
      rows: [
        { id: "pair-days", label: "Days as a pair", value: n(pairAgeDays(input.couple)) },
        { id: "active-days", label: "Days with any activity", value: n(days.length) },
        { id: "streak", label: "Days in a row", value: n(currentStreak(days)) },
        { id: "hours-you", label: "Time you spent in the app", value: formatActiveTime(input.user?.activeSeconds) },
        { id: "hours-them", label: "Time they spent in the app", value: formatActiveTime(input.partner?.activeSeconds) },
        { id: "check-all", label: "Check-ins between you", value: n(input.checkIns.length) },
        { id: "spicy-all", label: "Spicy nights played", value: n(spicy.length) },
        { id: "dates-all", label: "Date nights started", value: n(input.dateNightAsks.length) },
      ],
    },
    {
      id: "connect",
      label: "Connect",
      hint: "Talks, dates, the jar, showing up",
      accent: "#FF6B9A",
      rows: [
        { id: "check-you", label: "Check-ins you logged", value: n(input.checkIns.filter((row) => row.userId === you).length) },
        { id: "check-them", label: "Check-ins they logged", value: n(input.checkIns.filter((row) => row.userId === them).length) },
        { id: "check-both", label: "Days you both checked in", value: n(bothChecked) },
        { id: "dates-you", label: "Date nights you started", value: n(datesYou.length) },
        { id: "dates-them", label: "Date nights they started", value: n(datesThem.length) },
        { id: "dates-yes", label: "Dates they said yes to", value: n(input.dateNightAsks.filter((row) => row.status === "accepted").length) },
        { id: "jar-you", label: "Jar notes you wrote", value: n(input.jarNotes.filter((row) => row.fromUserId === you).length) },
        { id: "jar-open", label: "Jar notes opened", value: n(input.jarNotes.filter((row) => row.openedAt).length) },
        { id: "talk-draw", label: "Talk cards drawn", value: n(input.talkDraws.length) },
        { id: "talk-ans", label: "Talk cards answered", value: n(input.talkDraws.filter((row) => row.answeredAt).length) },
        { id: "lists-add", label: "List items added", value: n(input.listEntries.length) },
        { id: "lists-done", label: "List items ticked off", value: n(input.listEntries.filter((row) => row.completedAt).length) },
        { id: "curiosity", label: "Curiosity answers", value: n(input.curiosityAnswers.length) },
      ],
    },
    {
      id: "desire",
      label: "Desire",
      hint: "Spice, dares, bodies, fantasies",
      accent: "#FF007F",
      rows: [
        { id: "spicy-start", label: "Spicy nights you started", value: n(spicy.filter((row) => row.initiatorId === you).length) },
        { id: "spicy-play", label: "Spicy nights played", value: n(spicy.length) },
        { id: "spicy-done", label: "Spicy nights finished", value: n(spicyDone.length) },
        { id: "cards-play", label: "Spicy cards played", value: n(playedCards.length) },
        { id: "cards-rate", label: "Cards rated", value: n(input.ratings.length) },
        { id: "dare-sent", label: "Dares you sent", value: n(input.spicyDares.filter((row) => row.fromUserId === you).length) },
        { id: "dare-done", label: "Dares completed", value: n(input.spicyDares.filter((row) => row.completedAt).length) },
        { id: "fan-like", label: "Fantasies you liked", value: n(input.fantasySwipes.filter((row) => row.userId === you && row.liked).length) },
        { id: "fan-done", label: "Fantasies marked done", value: n(input.fantasyCompletions.length) },
        { id: "pos-save", label: "Positions saved", value: n(input.positionSaves.length) },
        { id: "pos-try", label: "Positions tried", value: n(input.positionSaves.filter((row) => row.doneAt).length) },
        { id: "pos-ask", label: "Position asks sent", value: n(mine(input.positionInvites, you, "fromUserId").length) },
        { id: "rp-save", label: "Roleplays saved", value: n(input.roleplaySaves.length) },
        { id: "rp-try", label: "Roleplays tried", value: n(input.roleplaySaves.filter((row) => row.doneAt).length) },
        { id: "desire-on", label: "Desire toggles on", value: n(input.desireToggles.length) },
      ],
    },
    {
      id: "fun",
      label: "Fun",
      hint: "Chicken, coupons, play for play's sake",
      accent: "#F0A46A",
      rows: [
        { id: "chick-you", label: "Chicken dares you sent", value: n(input.chickenPlays.filter((row) => row.fromUserId === you).length) },
        { id: "chick-them", label: "Chicken dares they sent", value: n(input.chickenPlays.filter((row) => row.fromUserId === them).length) },
        { id: "chick-done", label: "Chicken dares finished", value: n(input.chickenPlays.filter((row) => row.status === "done" || row.completedAt).length) },
        { id: "coup-you", label: "Coupons you gave", value: n(input.coupons.filter((row) => row.fromUserId === you).length) },
        { id: "coup-them", label: "Coupons they gave", value: n(input.coupons.filter((row) => row.fromUserId === them).length) },
        { id: "coup-use", label: "Coupons redeemed", value: n(input.coupons.filter((row) => row.status === "redeemed" || row.redeemedAt).length) },
        { id: "bucket", label: "To-do dates saved", value: n(input.bucketItems.length) },
        { id: "bucket-done", label: "To-do dates done", value: n(input.bucketItems.filter((row) => row.doneAt).length) },
      ],
    },
    {
      id: "home",
      label: "Home Base",
      hint: "The house, the hours, the calendar",
      accent: "#3ECFBF",
      rows: [
        { id: "cal", label: "Calendar notes", value: n(input.calendarEvents.length) },
        { id: "errand", label: "Groceries & errands done", value: n(input.errandItems.filter((row) => row.doneAt).length) },
        { id: "errand-open", label: "Errands still open", value: n(input.errandItems.filter((row) => !row.doneAt).length) },
        { id: "meals", label: "Meal rounds agreed", value: n(input.mealRounds.filter((row) => row.status === "agreed").length) },
        { id: "rituals", label: "Rituals checked", value: n(input.ritualChecks.length) },
      ],
    },
  ];
}
