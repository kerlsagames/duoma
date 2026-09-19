import type { ChickenPlay } from "@/lib/chicken";
import { isCuriosityComplete } from "@/lib/curiosity";
import { fantasyById } from "@/lib/fantasy-matcher";
import { isSexyVaultLocked, sexyVaultUnlockLabel, type SexyVaultItem } from "@/lib/sexy-vault";
import { STAGE_META } from "@/games/get-spicy/engine";
import { daysUntil, formatLongDate, isSunday, localDateKey, parseDateKey } from "@/lib/dates";
import { nightAskLabel } from "@/lib/play-items";
import { roleplayById } from "@/lib/roleplays";
import { positionById } from "@/lib/sex-positions";
import { moodMeta } from "@/lib/hub";
import { categoryById } from "@/lib/promptsData";
import { isSpicyDareDeck, timeframeLabel } from "@/lib/spicy-dares";
import type {
  BucketItem,
  CheckIn,
  CheckInRequest,
  Coupon,
  CuriosityAnswer,
  GameSession,
  JarNote,
  ListEntry,
  Milestone,
  Profile,
  ScratchReveal,
  SpicyDarePlay,
  TalkDraw,
  FantasySwipe,
  FantasyTonightAsk,
  DateNightAsk,
  PositionInvite,
  RoleplayInvite,
} from "@/lib/types";
import type { CalendarReminder } from "@/lib/calendar-reminders";
import { dueCalendarReminders } from "@/lib/calendar-reminders";
import { pokeAppMeta, pokeNoticeId } from "@/lib/partner-poke";
import { isLiveSpicyGame } from "@/lib/spicy-session";
import type { PartnerPoke } from "@/lib/types";
import type { Href } from "expo-router";

export { isLiveSpicyGame, spicyGameStampMs, spicyGameStarted } from "@/lib/spicy-session";

export type StatusItem = {
  id: string;
  line: string;
  when: string;
  href: Href;
  sortAt: number;
};

export function gameResumeHref(game: GameSession | null): Href | null {
  if (!game || !isLiveSpicyGame(game)) return null;
  if (game.status === "inviting" || game.status === "setup") return "/game/setup";
  if (game.status === "selecting") return "/game/play";
  if (game.status === "playing" || game.status === "rating") return "/game/play";
  return null;
}

/** Tile tap always opens setup so a leftover night cannot dump them mid-card. */
export function spicyOpenHref(_game: GameSession | null): Href {
  return "/game/setup";
}

function whoseTurn(
  game: GameSession,
  user: Profile | null,
  partner: Profile | null
) {
  if (!game.turnUserId) return "In play";
  if (user && game.turnUserId === user.id) return "Your turn";
  if (partner && game.turnUserId === partner.id) return "Their turn";
  return "Their turn";
}

function midday(dateKey: string): number {
  return parseDateKey(dateKey).getTime() + 12 * 60 * 60 * 1000;
}

function upcomingWhen(dateKey: string): string {
  const days = daysUntil(dateKey);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${formatLongDate(dateKey)}`;
}

function recentWhen(iso: string): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "Today";
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function gameAlert(input: {
  game: GameSession | null;
  user: Profile | null;
  partner: Profile | null;
}): StatusItem | null {
  const { game } = input;
  if (!game || !isLiveSpicyGame(game)) {
    return null;
  }

  const href = (gameResumeHref(game) ?? "/(tabs)") as Href;
  const sortAt = Date.parse(game.updatedAt || game.createdAt) || Date.now();

  const gameId = `game-${game.status}${game.awaitingPrivate ? "-private" : ""}`;

  if (game.status === "inviting") {
    return { id: gameId, line: `Spicy Game · waiting on ${input.partner?.displayName?.trim() || "them"}`, when: "Now", href: "/(tabs)", sortAt };
  }
  if (game.status === "setup") {
    return { id: gameId, line: "Spicy Game · finish setup", when: "Now", href, sortAt };
  }
  if (game.status === "selecting") {
    return {
      id: gameId,
      line: "Spicy Game · your deal",
      when: "Now",
      href,
      sortAt,
    };
  }
  if (game.status === "rating") {
    return { id: gameId, line: "Spicy Game · rate tonight", when: "Now", href, sortAt };
  }
  if (game.awaitingPrivate) {
    return { id: gameId, line: "Spicy Game · unlock private time", when: "Now", href, sortAt };
  }

  const turn =
    game.pace === "simple"
      ? "Together"
      : whoseTurn(game, input.user, input.partner);
  const stage = game.currentStage
    ? STAGE_META[game.currentStage].short
    : "in play";
  return { id: gameId, line: `${turn} · ${stage}`, when: "Now", href, sortAt };
}

export function buildHomeNotifications(input: {
  user: Profile | null;
  partner: Profile | null;
  game: GameSession | null;
  checkIns: CheckIn[];
  incomingCheckInRequest?: CheckInRequest | null;
  coupons: Coupon[];
  jarNotes: JarNote[];
  curiosityAnswers: CuriosityAnswer[];
  milestones: Milestone[];
  bucketItems?: BucketItem[];
  talkDraws?: TalkDraw[];
  scratches?: ScratchReveal[];
  listEntries?: ListEntry[];
  spicyDares?: SpicyDarePlay[];
  partnerPokes?: PartnerPoke[];
  chickenPlays?: ChickenPlay[];
  fantasySwipes?: FantasySwipe[];
  fantasyTonightAsks?: FantasyTonightAsk[];
  dateNightAsks?: DateNightAsk[];
  positionInvites?: PositionInvite[];
  roleplayInvites?: RoleplayInvite[];
  sexyVault?: SexyVaultItem[];
  calendarReminders?: CalendarReminder[];
  whiteFlags?: { id: string; toUserId: string; fromUserId: string; status: string; createdAt: string; note?: string }[];
}): StatusItem[] {
  const today = localDateKey();
  const myId = input.user?.id;
  const them = input.partner?.displayName?.trim() || "them";
  const they = input.partner?.displayName?.trim() || "They";
  const items: StatusItem[] = [];
  const now = Date.now();

  const spicy = gameAlert(input);
  if (spicy) items.push({ ...spicy, sortAt: now });

  (input.whiteFlags ?? [])
    .filter((row) => row.status === "raised" && row.toUserId === myId)
    .forEach((flag) => {
      items.push({
        id: `apology-${flag.id}`,
        line: `${they} sent an apology / reset`,
        when: recentWhen(flag.createdAt),
        href: "/hub/apology",
        sortAt: Date.parse(flag.createdAt) || now,
      });
    });

  (input.partnerPokes ?? [])
    .filter((row) => row.toUserId === myId)
    .forEach((poke) => {
      const meta = pokeAppMeta(poke.appId);
      items.push({
        id: pokeNoticeId(poke),
        line: `${meta.label} · ${they} poked you`,
        when: recentWhen(poke.createdAt),
        href: meta.href,
        sortAt: Date.parse(poke.createdAt) || now,
      });
    });

  if (input.incomingCheckInRequest && myId) {
    items.push({
      id: `checkin-request-${input.incomingCheckInRequest.id}`,
      line: `${they} asked for a check-in`,
      when: "Now",
      href: "/hub/check-in",
      sortAt: Date.parse(input.incomingCheckInRequest.createdAt) || now,
    });
  }

  const partnerCheckIn = input.checkIns.find(
    (row) => row.userId === input.partner?.id && row.date === today
  );
  if (partnerCheckIn) {
    const bits: string[] = [];
    if (partnerCheckIn.mood) bits.push(moodMeta(partnerCheckIn.mood).label);
    if (partnerCheckIn.energy != null) bits.push(`energy ${partnerCheckIn.energy}`);
    if (!bits.length && partnerCheckIn.desireGauge) bits.push("spicy gauge in");
    if (!bits.length && partnerCheckIn.loveTank != null) {
      bits.push(`love tank ${partnerCheckIn.loveTank}`);
    }
    items.push({
      id: `checkin-${partnerCheckIn.id}`,
      line: bits.length ? bits.join(" · ") : `${they} checked in`,
      when: recentWhen(partnerCheckIn.createdAt),
      href: "/hub/check-in",
      sortAt: Date.parse(partnerCheckIn.createdAt) || now,
    });
  }

  input.coupons
    .filter((row) => row.toUserId === myId && row.status !== "redeemed")
    .filter((row) => !row.expiresAt || Date.parse(row.expiresAt) >= Date.now())
    .forEach((coupon) => {
      items.push({
        id: `coupon-${coupon.id}`,
        line:
          coupon.status === "offered"
            ? `Coupon · ${coupon.title}`
            : `Redeem ${coupon.title}`,
        when: recentWhen(coupon.acceptedAt ?? coupon.createdAt),
        href: "/hub/coupons?tab=received",
        sortAt: Date.parse(coupon.acceptedAt ?? coupon.createdAt) || now,
      });
    });

  const sealed = input.jarNotes.filter((note) => !note.openedAt);
  if (sealed.length > 0) {
    const latest = [...sealed].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    items.push({
      id: `jar-${latest.id}`,
      line: isSunday()
        ? "Sunday · open the jar"
        : sealed.length === 1
          ? "A note is in the jar"
          : `${sealed.length} notes in the jar`,
      when: isSunday() ? "Today" : recentWhen(latest.createdAt),
      href: "/hub/jar",
      sortAt: isSunday() ? midday(today) : Date.parse(latest.createdAt) || now,
    });
  }

  const theirToday = input.curiosityAnswers.filter(
    (row) =>
      row.userId === input.partner?.id &&
      row.date === today &&
      isCuriosityComplete(row)
  );
  const myQuestionIds = new Set(
    input.curiosityAnswers
      .filter((row) => row.userId === myId && isCuriosityComplete(row))
      .map((row) => row.questionId)
  );
  const waitingOnMe = theirToday.filter((row) => !myQuestionIds.has(row.questionId));
  const myToday = input.curiosityAnswers.filter(
    (row) => row.userId === myId && row.date === today && isCuriosityComplete(row)
  );
  if (waitingOnMe.length) {
    const latest = waitingOnMe.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    items.push({
      id: `curiosity-${latest.id}`,
      line:
        waitingOnMe.length === 1
          ? `Flirtatious findings · ${them} answered a card`
          : `Flirtatious findings · ${waitingOnMe.length} cards waiting on you`,
      when: recentWhen(latest.createdAt),
      href: "/hub/discover",
      sortAt: Date.parse(latest.createdAt) || now,
    });
  } else if (myToday.length && theirToday.length) {
    const latest = [...theirToday, ...myToday]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    items.push({
      id: `curiosity-both-${latest.id}`,
      line: "Flirtatious findings vault has new answers",
      when: recentWhen(latest.createdAt),
      href: "/hub/discover",
      sortAt: Date.parse(latest.createdAt) || now,
    });
  } else if (myToday.length) {
    const latest = myToday.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    items.push({
      id: `curiosity-waiting-${latest.id}`,
      line: `Flirtatious findings · waiting on ${them}`,
      when: recentWhen(latest.createdAt),
      href: "/hub/discover",
      sortAt: Date.parse(latest.createdAt) || now,
    });
  }

  (input.talkDraws ?? [])
    .filter(
      (row) =>
        row.userId === input.partner?.id &&
        row.date === today &&
        row.answeredAt &&
        !isSpicyDareDeck(row.categoryId)
    )
    .forEach((draw) => {
      let name = "Talk to me";
      try {
        name = categoryById(draw.categoryId).name;
      } catch {
        // Unknown deck from an older save.
      }
      items.push({
        id: `talk-${draw.id}`,
        line: `${they} pulled ${name}`,
        when: recentWhen(draw.answeredAt ?? draw.createdAt),
        href: "/hub/talk",
        sortAt: Date.parse(draw.answeredAt ?? draw.createdAt) || now,
      });
    });

  (input.spicyDares ?? [])
    .filter((row) => row.status === "offered" || row.status === "accepted")
    .forEach((play) => {
      const incoming = play.toUserId === myId;
      if (!incoming) return;
      const when = timeframeLabel(play.timeframe, play.customWhen);
      const line =
        play.status === "offered"
          ? "Dare Me · a dare for you"
          : `Dare Me on · ${when}`;
      items.push({
        id: `dare-${play.id}`,
        line,
        when: recentWhen(play.answeredAt ?? play.createdAt),
        href: "/hub/up-for-it",
        sortAt: Date.parse(play.answeredAt ?? play.createdAt) || now,
      });
    });

  (input.chickenPlays ?? [])
    .filter((row) => row.status === "offered" || row.status === "accepted")
    .forEach((play) => {
      const incoming = play.toUserId === myId;
      if (!incoming) return;
      const line =
        play.status === "offered"
          ? "Chicken · a dare for you"
          : "Chicken · you’re in. Do it.";
      items.push({
        id: `chicken-${play.id}`,
        line,
        when: recentWhen(play.answeredAt ?? play.createdAt),
        href: "/hub/chicken",
        sortAt: Date.parse(play.answeredAt ?? play.createdAt) || now,
      });
    });

  (input.listEntries ?? [])
    .filter((row) => row.createdBy === input.partner?.id && !row.completedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
    .forEach((entry) => {
      items.push({
        id: `list-add-${entry.id}`,
        line: `${they} added “${entry.title}” to Lists`,
        when: recentWhen(entry.createdAt),
        href: `/hub/list/${entry.listId}` as Href,
        sortAt: Date.parse(entry.createdAt) || now,
      });
    });

  (input.listEntries ?? [])
    .filter((row) => row.completedAt && row.completedBy === input.partner?.id)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, 2)
    .forEach((entry) => {
      items.push({
        id: `list-done-${entry.id}`,
        line: `Vaulted “${entry.title}” — rate it`,
        when: recentWhen(entry.completedAt ?? entry.createdAt),
        href: "/hub/lists",
        sortAt: Date.parse(entry.completedAt ?? entry.createdAt) || now,
      });
    });

  input.milestones
    .filter((item) => daysUntil(item.date) >= 0 && item.createdBy !== myId)
    .forEach((item) => {
      items.push({
        id: `milestone-${item.id}`,
        line: item.title,
        when: upcomingWhen(item.date),
        href: "/hub/milestones",
        sortAt: midday(item.date),
      });
    });

  const myFantasyLikes = (input.fantasySwipes ?? []).filter(
    (row) => row.userId === myId && row.liked
  );
  const theirFantasyLikes = new Map(
    (input.fantasySwipes ?? [])
      .filter((row) => row.userId === input.partner?.id && row.liked)
      .map((row) => [row.fantasyId, row])
  );
  myFantasyLikes.forEach((mine) => {
    const theirs = theirFantasyLikes.get(mine.fantasyId);
    if (!theirs) return;
    // Only the first yes gets a card. The second person already saw Match.
    if ((mine.createdAt || "") > (theirs.createdAt || "")) return;
    const title = fantasyById(mine.fantasyId)?.title ?? "a fantasy";
    const whenAt = theirs.createdAt || mine.createdAt;
    const matchedAt = Date.parse(whenAt) || 0;
    if (matchedAt && now - matchedAt > 36 * 60 * 60 * 1000) return;
    items.push({
      id: `fantasy-match-${mine.fantasyId}`,
      line: `It's a match · ${title}`,
      when: recentWhen(whenAt),
      href: "/hub/fantasy-matcher",
      sortAt: Date.parse(whenAt) || now,
    });
  });

  (input.fantasyTonightAsks ?? []).forEach((ask) => {
    if (ask.nightKey !== today) return;
    const incoming = ask.toUserId === myId;
    if (!incoming) return;
    const title = fantasyById(ask.fantasyId)?.title ?? "a match";
    if (ask.status === "offered") {
      items.push({
        id: `fantasy-ask-${ask.id}`,
        line: `Try this tonight? · ${title}`,
        when: recentWhen(ask.createdAt),
        href: "/hub/fantasy-matcher",
        sortAt: Date.parse(ask.createdAt) || now,
      });
      return;
    }
    if (ask.status === "accepted") {
      items.push({
        id: `fantasy-yes-${ask.id}`,
        line: `Tonight's on · ${title}`,
        when: recentWhen(ask.answeredAt ?? ask.createdAt),
        href: "/hub/fantasy-matcher",
        sortAt: Date.parse(ask.answeredAt ?? ask.createdAt) || now,
      });
    }
  });

  (input.dateNightAsks ?? []).forEach((ask) => {
    if (ask.nightKey !== today) return;
    const incoming = ask.toUserId === myId;
    if (!incoming) return;
    const title =
      input.bucketItems?.find((item) => item.id === ask.bucketId)?.title ??
      "a date";
    if (ask.status === "offered") {
      items.push({
        id: `date-ask-${ask.id}`,
        line: `Try this tonight? · ${title}`,
        when: recentWhen(ask.createdAt),
        href: "/hub/planner",
        sortAt: Date.parse(ask.createdAt) || now,
      });
      return;
    }
    if (ask.status === "accepted") {
      items.push({
        id: `date-yes-${ask.id}`,
        line: `Tonight's on · ${title}`,
        when: recentWhen(ask.answeredAt ?? ask.createdAt),
        href: "/hub/planner",
        sortAt: Date.parse(ask.answeredAt ?? ask.createdAt) || now,
      });
    }
  });

  (input.positionInvites ?? [])
    .filter((row) => row.toUserId === myId && row.status === "offered")
    .forEach((row) => {
      const when = row.whenLabel ?? nightAskLabel(row.dateKey);
      const title = positionById(row.positionId)?.name ?? "a pose";
      items.push({
        id: `position-ask-${row.id}`,
        line: `Try this ${when}? · ${title}`,
        when: recentWhen(row.createdAt),
        href: "/hub/positions?tab=requests",
        sortAt: Date.parse(row.createdAt) || now,
      });
    });

  (input.positionInvites ?? [])
    .filter((row) => row.fromUserId === myId && row.status === "accepted" && row.answeredAt)
    .forEach((row) => {
      const when = row.whenLabel ?? nightAskLabel(row.dateKey);
      const title = positionById(row.positionId)?.name ?? "that pose";
      items.push({
        id: `position-yes-${row.id}`,
        line: `${them} is in · ${title} · ${when}`,
        when: recentWhen(row.answeredAt ?? row.createdAt),
        href: "/hub/positions?tab=asked",
        sortAt: Date.parse(row.answeredAt ?? row.createdAt) || now,
      });
    });

  (input.positionInvites ?? [])
    .filter((row) => row.fromUserId === myId && row.status === "declined")
    .forEach((row) => {
      const when = row.whenLabel ?? nightAskLabel(row.dateKey);
      const title = positionById(row.positionId)?.name ?? "that pose";
      items.push({
        id: `position-no-${row.id}`,
        line: `${them} said no · ${title} · ${when}`,
        when: recentWhen(row.answeredAt ?? row.createdAt),
        href: "/hub/positions?tab=asked",
        sortAt: Date.parse(row.answeredAt ?? row.createdAt) || now,
      });
    });

  (input.roleplayInvites ?? [])
    .filter((row) => row.toUserId === myId && row.status === "offered")
    .forEach((row) => {
      const when = row.whenLabel ?? nightAskLabel(row.dateKey);
      const title = roleplayById(row.roleplayId)?.name ?? "a scene";
      items.push({
        id: `roleplay-ask-${row.id}`,
        line: `Try this ${when}? · ${title}`,
        when: recentWhen(row.createdAt),
        href: "/hub/roleplays",
        sortAt: Date.parse(row.createdAt) || now,
      });
    });

  (input.sexyVault ?? [])
    .filter((item) => item.fromId === input.partner?.id && !item.seenAt)
    .forEach((item) => {
      const locked = isSexyVaultLocked(item, input.user?.id);
      items.push({
        id: `sexy-${item.id}`,
        line: locked
          ? `Sexy Vault · hidden until ${sexyVaultUnlockLabel(item)}`
          : item.kind === "video"
            ? `Sexy Vault · ${them} left a clip`
            : `Sexy Vault · ${them} left a photo`,
        when: locked ? "Later" : recentWhen(item.createdAt),
        href: "/hub/sexy-vault",
        sortAt: Date.parse(item.createdAt) || now,
      });
    });

  (input.bucketItems ?? [])
    .filter(
      (item) =>
        item.scheduledOn &&
        !item.doneAt &&
        daysUntil(item.scheduledOn) >= 0 &&
        item.createdBy !== myId
    )
    .forEach((item) => {
      items.push({
        id: `date-${item.id}`,
        line: `Date night · ${item.title}`,
        when: upcomingWhen(item.scheduledOn as string),
        href: "/hub/planner",
        sortAt: midday(item.scheduledOn as string),
      });
    });

  dueCalendarReminders(input.calendarReminders ?? [], new Date(), myId).forEach((row) => {
    items.push({
      id: row.id,
      line: row.body,
      when: upcomingWhen(row.dateKey),
      href: row.href,
      sortAt: row.fireAt,
    });
  });

  return items.sort((a, b) => Math.abs(a.sortAt - now) - Math.abs(b.sortAt - now));
}

/** @deprecated use buildHomeNotifications */
export function buildHomeAlerts(
  input: Parameters<typeof buildHomeNotifications>[0]
): StatusItem[] {
  return buildHomeNotifications(input);
}
