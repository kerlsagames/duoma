import { birthdayDateKey, formatBirthdayDate, type Birthday } from "@/lib/birthdays";
import { curiosityQuestionById } from "@/lib/curiosityQuestions";
import { dateKeyFromIso, localDateKey } from "@/lib/dates";
import { RITUALS } from "@/lib/hub";
import type { MaintTask, Trip } from "@/lib/mini-content";
import { categoryById, questionById } from "@/lib/talk";
import type {
  BucketItem,
  CalendarCustomEvent,
  CardRating,
  CheckIn,
  CoupleList,
  Coupon,
  CuriosityAnswer,
  DeckCard,
  GameSession,
  JarNote,
  ListEntry,
  Milestone,
  Profile,
  RitualCheck,
  ScratchReveal,
  SpicyDarePlay,
  TalkDraw,
} from "@/lib/types";

export type CalendarMark =
  | "play"
  | "checkin"
  | "milestone"
  | "date"
  | "ritual"
  | "talk"
  | "list"
  | "dare"
  | "coupon"
  | "jar"
  | "curiosity"
  | "custom"
  | "scratch"
  | "birthday"
  | "trip"
  | "job";

export type CalendarActivityKind =
  | "spicy_night"
  | "check_in"
  | "milestone"
  | "bucket"
  | "ritual"
  | "talk"
  | "list"
  | "dare"
  | "coupon"
  | "jar"
  | "curiosity"
  | "custom"
  | "scratch"
  | "birthday"
  | "trip"
  | "job";

export type CalendarLane = "together" | "life";

export type CalendarActivity = {
  id: string;
  kind: CalendarActivityKind;
  dateKey: string;
  at: string;
  title: string;
  subtitle?: string;
  mark: CalendarMark;
  href: string;
};

export type CalendarActivityInput = {
  nights: GameSession[];
  checkIns: CheckIn[];
  milestones: Milestone[];
  bucketItems: BucketItem[];
  ritualChecks: RitualCheck[];
  talkDraws: TalkDraw[];
  listEntries: ListEntry[];
  coupleLists: CoupleList[];
  spicyDares: SpicyDarePlay[];
  coupons: Coupon[];
  jarNotes: JarNote[];
  curiosityAnswers: CuriosityAnswer[];
  scratches: ScratchReveal[];
  calendarEvents: CalendarCustomEvent[];
  birthdays?: Birthday[];
  trips?: Trip[];
  maintenance?: MaintTask[];
  partner: Profile | null;
  user: Profile | null;
};

const TOGETHER_KINDS = new Set<CalendarActivityKind>([
  "spicy_night",
  "check_in",
  "milestone",
  "bucket",
  "ritual",
  "talk",
  "list",
  "dare",
  "coupon",
  "jar",
  "curiosity",
  "scratch",
]);

const LIFE_KINDS = new Set<CalendarActivityKind>([
  "birthday",
  "trip",
  "job",
  "custom",
]);

export function laneForKind(kind: CalendarActivityKind): CalendarLane {
  return LIFE_KINDS.has(kind) ? "life" : "together";
}

export function activitiesForLane(
  activities: CalendarActivity[],
  lane: CalendarLane
): CalendarActivity[] {
  return activities.filter((row) => laneForKind(row.kind) === lane);
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function dueOn(lastDone: string | null, everyDays: number): string {
  const start =
    lastDone ?? localDateKey(new Date(Date.now() - everyDays * 86400000));
  const [y, m, d] = start.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setDate(date.getDate() + everyDays);
  return localDateKey(date);
}

const NIGHT_STATUSES = new Set([
  "playing",
  "rating",
  "completed",
  "selecting",
  "setup",
]);

function nameFor(
  userId: string,
  user: Profile | null,
  partner: Profile | null
): string {
  if (user && userId === user.id) return user.displayName;
  if (partner && userId === partner.id) return partner.displayName;
  return "Partner";
}

function nightDate(night: GameSession): string {
  return (
    night.playedDate ??
    (night.completedAt ? dateKeyFromIso(night.completedAt) : null) ??
    dateKeyFromIso(night.updatedAt)
  );
}

function nightTime(night: GameSession): string {
  return night.completedAt ?? night.updatedAt;
}

function nightTitle(night: GameSession): string {
  if (night.gameKey === "lets-talk") return "Let's Talk";
  return "Get Spicy";
}

function nightSubtitle(night: GameSession): string {
  if (night.status === "completed") return "Completed";
  if (night.status === "rating") return "Rating cards";
  if (night.status === "playing") return "In progress";
  return night.status.replace(/_/g, " ");
}

export function buildCalendarActivities(
  input: CalendarActivityInput
): CalendarActivity[] {
  const items: CalendarActivity[] = [];
  const { user, partner } = input;

  for (const night of input.nights) {
    if (!NIGHT_STATUSES.has(night.status)) continue;
    if (night.gameKey !== "get-spicy" && night.gameKey !== "lets-talk") continue;
    items.push({
      id: `night:${night.id}`,
      kind: night.gameKey === "get-spicy" ? "spicy_night" : "talk",
      dateKey: nightDate(night),
      at: nightTime(night),
      title: nightTitle(night),
      subtitle: nightSubtitle(night),
      mark: "play",
      href: `/hub/calendar-night?id=${encodeURIComponent(night.id)}`,
    });
  }

  for (const row of input.checkIns) {
    items.push({
      id: `checkin:${row.id}`,
      kind: "check_in",
      dateKey: row.date,
      at: row.createdAt,
      title: "Check-in",
      subtitle: `Logged by ${nameFor(row.userId, user, partner)}`,
      mark: "checkin",
      href: `/hub/calendar-item?kind=check_in&id=${encodeURIComponent(row.id)}`,
    });
  }

  for (const row of input.milestones) {
    items.push({
      id: `milestone:${row.id}`,
      kind: "milestone",
      dateKey: row.date,
      at: `${row.date}T12:00:00.000Z`,
      title: row.title,
      subtitle: `Milestone · ${row.kind}`,
      mark: "milestone",
      href: `/hub/calendar-item?kind=milestone&id=${encodeURIComponent(row.id)}`,
    });
  }

  for (const row of input.bucketItems) {
    if (row.scheduledOn) {
      items.push({
        id: `bucket-plan:${row.id}`,
        kind: "bucket",
        dateKey: row.scheduledOn,
        at: `${row.scheduledOn}T18:00:00.000Z`,
        title: row.title,
        subtitle: "Planned date night",
        mark: "date",
        href: `/hub/calendar-item?kind=bucket&id=${encodeURIComponent(row.id)}`,
      });
    }
    if (row.doneAt) {
      const doneKey = dateKeyFromIso(row.doneAt);
      if (doneKey !== row.scheduledOn) {
        items.push({
          id: `bucket-done:${row.id}`,
          kind: "bucket",
          dateKey: doneKey,
          at: row.doneAt,
          title: row.title,
          subtitle: "Date night done",
          mark: "date",
          href: `/hub/calendar-item?kind=bucket&id=${encodeURIComponent(row.id)}`,
        });
      }
    }
  }

  for (const row of input.ritualChecks) {
    const ritual = RITUALS.find((item) => item.id === row.ritualId);
    items.push({
      id: `ritual:${row.id}`,
      kind: "ritual",
      dateKey: row.date,
      at: row.createdAt,
      title: ritual?.title ?? "Ritual",
      subtitle: `Checked by ${nameFor(row.userId, user, partner)}`,
      mark: "ritual",
      href: `/hub/calendar-item?kind=ritual&id=${encodeURIComponent(row.id)}`,
    });
  }

  for (const row of input.talkDraws) {
    if (!row.answeredAt && !row.date) continue;
    const dateKey = row.answeredAt
      ? dateKeyFromIso(row.answeredAt)
      : row.date;
    const question = questionById(row.categoryId, row.questionId);
    let categoryName = "Talk to Me";
    try {
      categoryName = categoryById(row.categoryId).name;
    } catch {
      /* unknown / spicy deck */
    }
    items.push({
      id: `talk:${row.id}`,
      kind: "talk",
      dateKey,
      at: row.answeredAt ?? row.createdAt,
      title: categoryName,
      subtitle: row.answeredAt
        ? question?.text?.slice(0, 80) ?? "Answered"
        : "Drawn",
      mark: "talk",
      href: `/hub/calendar-item?kind=talk&id=${encodeURIComponent(row.id)}`,
    });
  }

  for (const row of input.listEntries) {
    if (!row.completedAt) continue;
    const list = input.coupleLists.find((item) => item.id === row.listId);
    items.push({
      id: `list:${row.id}`,
      kind: "list",
      dateKey: dateKeyFromIso(row.completedAt),
      at: row.completedAt,
      title: row.title,
      subtitle: list ? `${list.emoji} ${list.title}` : "List item",
      mark: "list",
      href: `/hub/calendar-item?kind=list&id=${encodeURIComponent(row.id)}`,
    });
  }

  for (const row of input.spicyDares) {
    const stamp = row.completedAt ?? row.answeredAt ?? row.createdAt;
    const label =
      row.status === "done"
        ? "Dare completed"
        : row.status === "accepted"
          ? "Dare accepted"
          : row.status === "declined"
            ? "Dare declined"
            : "Dare offered";
    items.push({
      id: `dare:${row.id}`,
      kind: "dare",
      dateKey: dateKeyFromIso(stamp),
      at: stamp,
      title: row.text.slice(0, 60) || "Spicy dare",
      subtitle: label,
      mark: "dare",
      href: `/hub/calendar-item?kind=dare&id=${encodeURIComponent(row.id)}`,
    });
  }

  for (const row of input.coupons) {
    if (row.status === "redeemed" && row.redeemedAt) {
      items.push({
        id: `coupon:${row.id}`,
        kind: "coupon",
        dateKey: dateKeyFromIso(row.redeemedAt),
        at: row.redeemedAt,
        title: row.title,
        subtitle: "Coupon redeemed",
        mark: "coupon",
        href: `/hub/calendar-item?kind=coupon&id=${encodeURIComponent(row.id)}`,
      });
    } else if (row.status === "accepted" && row.acceptedAt) {
      items.push({
        id: `coupon-accept:${row.id}`,
        kind: "coupon",
        dateKey: dateKeyFromIso(row.acceptedAt),
        at: row.acceptedAt,
        title: row.title,
        subtitle: "Coupon accepted",
        mark: "coupon",
        href: `/hub/calendar-item?kind=coupon&id=${encodeURIComponent(row.id)}`,
      });
    }
  }

  for (const row of input.jarNotes) {
    if (!row.openedAt) continue;
    items.push({
      id: `jar:${row.id}`,
      kind: "jar",
      dateKey: dateKeyFromIso(row.openedAt),
      at: row.openedAt,
      title: "Jar note opened",
      subtitle: `From ${nameFor(row.fromUserId, user, partner)}`,
      mark: "jar",
      href: `/hub/calendar-item?kind=jar&id=${encodeURIComponent(row.id)}`,
    });
  }

  const curiosityByDate = new Map<string, CuriosityAnswer[]>();
  for (const row of input.curiosityAnswers) {
    const list = curiosityByDate.get(row.date) ?? [];
    list.push(row);
    curiosityByDate.set(row.date, list);
  }
  for (const [date, answers] of curiosityByDate) {
    const question = curiosityQuestionById(answers[0]?.questionId ?? "");
    const latest = answers
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    items.push({
      id: `curiosity:${date}`,
      kind: "curiosity",
      dateKey: date,
      at: latest?.createdAt ?? `${date}T12:00:00.000Z`,
      title: "Curiosity question",
      subtitle: question?.question?.slice(0, 80) ?? `${answers.length} answer(s)`,
      mark: "curiosity",
      href: `/hub/calendar-item?kind=curiosity&id=${encodeURIComponent(date)}`,
    });
  }

  for (const row of input.scratches) {
    items.push({
      id: `scratch:${row.id}`,
      kind: "scratch",
      dateKey: dateKeyFromIso(row.createdAt),
      at: row.createdAt,
      title: row.title,
      subtitle: `Scratch · ${row.kind}`,
      mark: "scratch",
      href: `/hub/calendar-item?kind=scratch&id=${encodeURIComponent(row.id)}`,
    });
  }

  for (const row of input.calendarEvents) {
    items.push({
      id: `custom:${row.id}`,
      kind: "custom",
      dateKey: row.date,
      at: row.happenedAt,
      title: row.title,
      subtitle: row.notes.trim() ? row.notes.slice(0, 80) : "Your note",
      mark: "custom",
      href: `/hub/calendar-item?kind=custom&id=${encodeURIComponent(row.id)}`,
    });
  }

  const yearNow = new Date().getFullYear();
  for (const row of input.birthdays ?? []) {
    for (const year of [yearNow - 1, yearNow, yearNow + 1, yearNow + 2]) {
      const dateKey = birthdayDateKey(year, row.month, row.day);
      items.push({
        id: `birthday:${row.id}:${year}`,
        kind: "birthday",
        dateKey,
        at: `${dateKey}T12:00:00.000Z`,
        title: `${row.name}'s birthday`,
        subtitle:
          row.circle === "family"
            ? `Family · ${formatBirthdayDate(row.month, row.day)}`
            : `Friends · ${formatBirthdayDate(row.month, row.day)}`,
        mark: "birthday",
        href: `/hub/calendar-item?kind=birthday&id=${encodeURIComponent(row.id)}`,
      });
    }
  }

  for (const row of input.trips ?? []) {
    const start = DATE_KEY_RE.test(row.start) ? row.start : null;
    const end = DATE_KEY_RE.test(row.end) ? row.end : null;
    if (start) {
      items.push({
        id: `trip-start:${row.id}`,
        kind: "trip",
        dateKey: start,
        at: `${start}T12:00:00.000Z`,
        title: row.title,
        subtitle: end && end !== start ? `${row.where} · until ${end}` : row.where,
        mark: "trip",
        href: `/hub/calendar-item?kind=trip&id=${encodeURIComponent(row.id)}`,
      });
    }
    if (end && end !== start) {
      items.push({
        id: `trip-end:${row.id}`,
        kind: "trip",
        dateKey: end,
        at: `${end}T12:00:00.000Z`,
        title: `${row.title} ends`,
        subtitle: row.where,
        mark: "trip",
        href: `/hub/calendar-item?kind=trip&id=${encodeURIComponent(row.id)}`,
      });
    }
  }

  for (const row of input.maintenance ?? []) {
    const dateKey = dueOn(row.lastDone, row.everyDays);
    items.push({
      id: `job:${row.id}`,
      kind: "job",
      dateKey,
      at: `${dateKey}T12:00:00.000Z`,
      title: row.label,
      subtitle:
        dateKey <= localDateKey()
          ? "Job due · overdue or today"
          : `Job due · every ${row.everyDays} days`,
      mark: "job",
      href: `/hub/calendar-item?kind=job&id=${encodeURIComponent(row.id)}`,
    });
  }

  return items.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
    return b.at.localeCompare(a.at);
  });
}

export function activitiesForDate(
  activities: CalendarActivity[],
  dateKey: string
): CalendarActivity[] {
  return activities
    .filter((row) => row.dateKey === dateKey)
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function marksByDate(
  activities: CalendarActivity[]
): Record<string, CalendarMark[]> {
  const map: Record<string, CalendarMark[]> = {};
  for (const row of activities) {
    const list = map[row.dateKey] ?? [];
    if (!list.includes(row.mark)) list.push(row.mark);
    map[row.dateKey] = list;
  }
  return map;
}

export function stageLabel(stage: string): string {
  switch (stage) {
    case "pre_foreplay":
      return "Pre-foreplay";
    case "foreplay":
      return "Foreplay";
    case "step_it_up":
      return "Step it up";
    case "finish_off":
      return "Finish off";
    case "afterglow":
      return "Afterglow";
    default:
      return stage.replace(/_/g, " ");
  }
}

export type NightCardDetail = {
  deckId: string;
  cardId: string;
  title: string;
  body: string;
  stage: string;
  status: DeckCard["status"];
  playedBy: string | null;
  ratings: { userId: string; stars: number }[];
};

export function nightCardDetails(input: {
  night: GameSession;
  deck: DeckCard[];
  cards: { id: string; title: string; body: string }[];
  ratings: CardRating[];
}): NightCardDetail[] {
  const deckRows = input.deck
    .filter((row) => row.gameId === input.night.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return deckRows.map((row) => {
    const card = input.cards.find((item) => item.id === row.cardId);
    return {
      deckId: row.id,
      cardId: row.cardId,
      title: card?.title ?? "Card",
      body: card?.body ?? "",
      stage: row.stage,
      status: row.status,
      playedBy: row.playedBy,
      ratings: input.ratings
        .filter(
          (rating) =>
            rating.gameId === input.night.id && rating.cardId === row.cardId
        )
        .map((rating) => ({ userId: rating.userId, stars: rating.stars })),
    };
  });
}

export function defaultHappenedAt(dateKey: string): string {
  const today = localDateKey();
  if (dateKey === today) return new Date().toISOString();
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
  return date.toISOString();
}
