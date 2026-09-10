import { isCuriosityComplete } from "@/lib/curiosity";
import { STAGE_META } from "@/games/get-spicy/engine";
import { daysUntil, formatLongDate, isSunday, localDateKey, parseDateKey } from "@/lib/dates";
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
  Milestone,
  Profile,
  ScratchReveal,
  SpicyDarePlay,
  TalkDraw,
} from "@/lib/types";
import type { Href } from "expo-router";

export type StatusItem = {
  id: string;
  line: string;
  when: string;
  href: Href;
  sortAt: number;
};

export function gameResumeHref(game: GameSession | null): Href | null {
  if (!game) return null;
  if (game.status === "setup") return "/game/setup";
  if (game.status === "selecting") return "/game/select";
  if (game.status === "playing" || game.status === "rating") return "/game/play";
  return null;
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
  if (!game || ["completed", "cancelled", "declined"].includes(game.status)) {
    return null;
  }

  const href = (gameResumeHref(game) ?? "/(tabs)") as Href;
  const sortAt = Date.parse(game.updatedAt || game.createdAt) || Date.now();

  if (game.status === "inviting") {
    return { id: "game", line: "Spicy Game · waiting on them", when: "Now", href: "/(tabs)", sortAt };
  }
  if (game.status === "setup") {
    return { id: "game", line: "Spicy Game · finish setup", when: "Now", href, sortAt };
  }
  if (game.status === "selecting") {
    const stage = game.currentStage
      ? STAGE_META[game.currentStage].short
      : "cards";
    return { id: "game", line: `Spicy Game · picking ${stage}`, when: "Now", href, sortAt };
  }
  if (game.status === "rating") {
    return { id: "game", line: "Spicy Game · rate tonight", when: "Now", href, sortAt };
  }
  if (game.awaitingPrivate) {
    return { id: "game", line: "Spicy Game · unlock private time", when: "Now", href, sortAt };
  }

  const turn = whoseTurn(game, input.user, input.partner);
  const stage = game.currentStage
    ? STAGE_META[game.currentStage].short
    : "in play";
  return { id: "game", line: `${turn} · ${stage}`, when: "Now", href, sortAt };
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
  spicyDares?: SpicyDarePlay[];
}): StatusItem[] {
  const today = localDateKey();
  const myId = input.user?.id;
  const items: StatusItem[] = [];
  const now = Date.now();

  const spicy = gameAlert(input);
  if (spicy) items.push({ ...spicy, sortAt: now });

  if (input.incomingCheckInRequest && myId) {
    items.push({
      id: `checkin-request-${input.incomingCheckInRequest.id}`,
      line: "They asked for a check-in",
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
    const tonight =
      partnerCheckIn.tonight === "yes"
        ? "Hell yeh"
        : partnerCheckIn.tonight === "no"
          ? "Nah not today"
          : null;
    if (tonight) bits.push(tonight);
    if (partnerCheckIn.mood) bits.push(moodMeta(partnerCheckIn.mood).label);
    if (partnerCheckIn.energy != null) bits.push(`energy ${partnerCheckIn.energy}`);
    if (!bits.length && partnerCheckIn.desireGauge) bits.push("spicy gauge in");
    if (!bits.length && partnerCheckIn.loveTank != null) {
      bits.push(`love tank ${partnerCheckIn.loveTank}`);
    }
    items.push({
      id: `checkin-${partnerCheckIn.id}`,
      line: bits.length ? bits.join(" · ") : "They checked in",
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
        href: "/hub/coupons",
        sortAt: Date.parse(coupon.acceptedAt ?? coupon.createdAt) || now,
      });
    });

  const sealed = input.jarNotes.filter((note) => !note.openedAt);
  if (sealed.length > 0) {
    const latest = [...sealed].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    items.push({
      id: "jar",
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

  const myCuriosity = input.curiosityAnswers.find(
    (row) => row.userId === myId && row.date === today && isCuriosityComplete(row)
  );
  const partnerCuriosity = input.curiosityAnswers.find(
    (row) =>
      row.userId === input.partner?.id &&
      row.date === today &&
      isCuriosityComplete(row)
  );
  if (partnerCuriosity && !myCuriosity) {
    items.push({
      id: `curiosity-${partnerCuriosity.id}`,
      line: "Curiosity sync · their turn is in",
      when: recentWhen(partnerCuriosity.createdAt),
      href: "/hub/curiosity",
      sortAt: Date.parse(partnerCuriosity.createdAt) || now,
    });
  } else if (partnerCuriosity && myCuriosity) {
    items.push({
      id: `curiosity-both-${partnerCuriosity.id}`,
      line: "Curiosity match results are in",
      when: recentWhen(
        [partnerCuriosity.createdAt, myCuriosity.createdAt].sort().slice(-1)[0]
      ),
      href: "/hub/curiosity",
      sortAt: Date.parse(partnerCuriosity.createdAt) || now,
    });
  } else if (myCuriosity && !partnerCuriosity) {
    items.push({
      id: `curiosity-waiting-${myCuriosity.id}`,
      line: "Curiosity · waiting on them",
      when: recentWhen(myCuriosity.createdAt),
      href: "/hub/curiosity",
      sortAt: Date.parse(myCuriosity.createdAt) || now,
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
        line: `They pulled ${name}`,
        when: recentWhen(draw.answeredAt ?? draw.createdAt),
        href: "/hub/talk",
        sortAt: Date.parse(draw.answeredAt ?? draw.createdAt) || now,
      });
    });

  (input.spicyDares ?? [])
    .filter((row) => row.status === "offered" || row.status === "accepted")
    .forEach((play) => {
      const incoming = play.toUserId === myId;
      const outgoing = play.fromUserId === myId;
      if (!incoming && !outgoing) return;
      const when = timeframeLabel(play.timeframe, play.customWhen);
      const line =
        play.status === "offered" && incoming
          ? play.direction === "you-do-me"
            ? "Wildcard · dare for you"
            : "Wildcard · they want to do this"
          : play.status === "offered"
            ? `Wildcard sent · ${when}`
            : `Wildcard on · ${when}`;
      items.push({
        id: `dare-${play.id}`,
        line,
        when: recentWhen(play.answeredAt ?? play.createdAt),
        href: "/hub/wildcard",
        sortAt: Date.parse(play.answeredAt ?? play.createdAt) || now,
      });
    });

  (input.scratches ?? [])
    .filter((row) => row.userId === input.partner?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
    .forEach((scratch) => {
      items.push({
        id: `scratch-${scratch.id}`,
        line: `They scratched ${scratch.title}`,
        when: recentWhen(scratch.createdAt),
        href: "/hub/scratch",
        sortAt: Date.parse(scratch.createdAt) || now,
      });
    });

  input.milestones
    .filter((item) => daysUntil(item.date) >= 0)
    .forEach((item) => {
      items.push({
        id: `milestone-${item.id}`,
        line: item.title,
        when: upcomingWhen(item.date),
        href: "/hub/milestones",
        sortAt: midday(item.date),
      });
    });

  (input.bucketItems ?? [])
    .filter(
      (item) => item.scheduledOn && !item.doneAt && daysUntil(item.scheduledOn) >= 0
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

  return items.sort((a, b) => Math.abs(a.sortAt - now) - Math.abs(b.sortAt - now));
}

/** @deprecated use buildHomeNotifications */
export function buildHomeAlerts(
  input: Parameters<typeof buildHomeNotifications>[0]
): StatusItem[] {
  return buildHomeNotifications(input);
}
