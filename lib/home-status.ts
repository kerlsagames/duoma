import { STAGE_META } from "@/games/get-spicy/engine";
import { daysUntil, isSunday, localDateKey } from "@/lib/dates";
import { moodMeta } from "@/lib/hub";
import type {
  CheckIn,
  CheckInRequest,
  Coupon,
  CuriosityAnswer,
  GameSession,
  JarNote,
  Milestone,
  Profile,
} from "@/lib/types";
import type { Href } from "expo-router";

export type StatusItem = {
  id: string;
  line: string;
  href: Href;
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

function moodAlert(input: {
  user: Profile | null;
  partner: Profile | null;
  checkIns: CheckIn[];
  incomingCheckInRequest?: CheckInRequest | null;
}): StatusItem | null {
  const today = localDateKey();
  const partnerCheckIn = input.checkIns.find(
    (row) => row.userId === input.partner?.id && row.date === today
  );
  const myCheckIn = input.checkIns.find(
    (row) => row.userId === input.user?.id && row.date === today
  );

  if (input.incomingCheckInRequest && !myCheckIn) {
    return {
      id: "mood",
      line: "They asked for a check-in",
      href: "/hub/check-in",
    };
  }

  if (partnerCheckIn) {
    const bits: string[] = [];
    if (partnerCheckIn.mood) bits.push(moodMeta(partnerCheckIn.mood).label);
    if (partnerCheckIn.energy != null) bits.push(`energy ${partnerCheckIn.energy}`);
    if (!bits.length && partnerCheckIn.desireGauge) bits.push("spicy gauge in");
    if (!bits.length && partnerCheckIn.loveTank != null) {
      bits.push(`love tank ${partnerCheckIn.loveTank}`);
    }
    if (!bits.length) bits.push("checked in");
    return {
      id: "mood",
      line: bits[0] === "checked in" ? "They checked in" : bits.join(" · "),
      href: "/hub/check-in",
    };
  }

  if (!myCheckIn) {
    return {
      id: "mood",
      line: "Check-in still open",
      href: "/hub/check-in",
    };
  }

  if (input.partner) {
    return {
      id: "mood",
      line: "They haven't checked in",
      href: "/hub/check-in",
    };
  }

  return null;
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

  if (game.status === "inviting") {
    return { id: "game", line: "Spicy Game · waiting on them", href: "/(tabs)" };
  }
  if (game.status === "setup") {
    return { id: "game", line: "Spicy Game · finish setup", href };
  }
  if (game.status === "selecting") {
    const stage = game.currentStage
      ? STAGE_META[game.currentStage].short
      : "cards";
    return { id: "game", line: `Spicy Game · picking ${stage}`, href };
  }
  if (game.status === "rating") {
    return { id: "game", line: "Spicy Game · rate tonight", href };
  }
  if (game.awaitingPrivate) {
    return { id: "game", line: "Spicy Game · unlock private time", href };
  }

  const turn = whoseTurn(game, input.user, input.partner);
  const stage = game.currentStage
    ? STAGE_META[game.currentStage].short
    : "in play";
  return { id: "game", line: `${turn} · ${stage}`, href };
}

function todoAlerts(input: {
  user: Profile | null;
  partner: Profile | null;
  coupons: Coupon[];
  jarNotes: JarNote[];
  curiosityAnswers: CuriosityAnswer[];
  milestones: Milestone[];
}): StatusItem[] {
  const today = localDateKey();
  const todos: StatusItem[] = [];
  const myId = input.user?.id;

  const couponForMe = input.coupons.find(
    (row) =>
      row.toUserId === myId &&
      (row.status === "offered" || row.status === "accepted")
  );
  if (couponForMe) {
    todos.push({
      id: "todo-coupon",
      line:
        couponForMe.status === "offered"
          ? "Coupon waiting to accept"
          : `Redeem ${couponForMe.title}`,
      href: "/hub/coupons",
    });
  }

  const sealed = input.jarNotes.filter((note) => !note.openedAt);
  if (sealed.length > 0) {
    todos.push({
      id: "todo-jar",
      line: isSunday()
        ? "Sunday · open the jar"
        : sealed.length === 1
          ? "A note is in the jar"
          : `${sealed.length} notes in the jar`,
      href: "/hub/jar",
    });
  }

  const myCuriosity = input.curiosityAnswers.find(
    (row) => row.userId === myId && row.date === today
  );
  const partnerCuriosity = input.curiosityAnswers.find(
    (row) => row.userId === input.partner?.id && row.date === today
  );
  if (partnerCuriosity && !myCuriosity) {
    todos.push({
      id: "todo-curiosity",
      line: "They answered curiosity",
      href: "/hub/curiosity",
    });
  }

  const soon = input.milestones
    .map((item) => ({ item, days: daysUntil(item.date) }))
    .filter((row) => row.days >= 0 && row.days <= 7)
    .sort((a, b) => a.days - b.days)[0];
  if (soon) {
    const when =
      soon.days === 0 ? "today" : soon.days === 1 ? "tomorrow" : `${soon.days}d`;
    todos.push({
      id: "todo-countdown",
      line: `${soon.item.title} · ${when}`,
      href: "/hub/milestones",
    });
  }

  return todos;
}

export function buildHomeAlerts(input: {
  user: Profile | null;
  partner: Profile | null;
  game: GameSession | null;
  checkIns: CheckIn[];
  incomingCheckInRequest?: CheckInRequest | null;
  coupons: Coupon[];
  jarNotes: JarNote[];
  curiosityAnswers: CuriosityAnswer[];
  milestones: Milestone[];
}): StatusItem[] {
  const items: StatusItem[] = [];
  const mood = moodAlert(input);
  const spicy = gameAlert(input);
  if (mood) items.push(mood);
  if (spicy) items.push(spicy);
  items.push(...todoAlerts(input));
  return items.slice(0, 3);
}
