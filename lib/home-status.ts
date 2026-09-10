import { STAGE_META } from "@/games/get-spicy/engine";
import { daysUntil, isSunday, localDateKey } from "@/lib/dates";
import { moodMeta, partnerHint } from "@/lib/hub";
import type {
  CheckIn,
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
  kicker: string;
  title: string;
  detail: string;
  href: Href;
};

export function gameResumeHref(game: GameSession | null): Href | null {
  if (!game) return null;
  if (game.status === "setup") return "/game/setup";
  if (game.status === "selecting") return "/game/select";
  if (game.status === "playing" || game.status === "rating") return "/game/play";
  return null;
}

function turnName(
  game: GameSession,
  user: Profile | null,
  partner: Profile | null
) {
  if (!game.turnUserId) return null;
  if (user && game.turnUserId === user.id) return "Your turn";
  if (partner && game.turnUserId === partner.id) {
    return `${partner.displayName}'s turn`;
  }
  return "Their turn";
}

export function buildMoodStatus(input: {
  user: Profile | null;
  partner: Profile | null;
  checkIns: CheckIn[];
}): StatusItem {
  const today = localDateKey();
  const partnerCheckIn = input.checkIns.find(
    (row) => row.userId === input.partner?.id && row.date === today
  );
  const myCheckIn = input.checkIns.find(
    (row) => row.userId === input.user?.id && row.date === today
  );

  if (partnerCheckIn && input.partner) {
    const mood = moodMeta(partnerCheckIn.mood);
    return {
      id: "mood",
      kicker: `${input.partner.displayName}'s mood`,
      title: `${mood.label} · energy ${partnerCheckIn.energy}`,
      detail: partnerHint(partnerCheckIn, input.partner.displayName),
      href: "/hub/check-in",
    };
  }

  if (!myCheckIn) {
    return {
      id: "mood",
      kicker: "Check-in",
      title: "You haven't logged today",
      detail: input.partner
        ? `Ten seconds so ${input.partner.displayName} knows how to show up.`
        : "Energy, weather, love tank — then they can see you.",
      href: "/hub/check-in",
    };
  }

  return {
    id: "mood",
    kicker: input.partner ? `${input.partner.displayName}'s mood` : "Check-in",
    title: input.partner
      ? `${input.partner.displayName} hasn't checked in`
      : "You're logged for today",
    detail: input.partner
      ? "Their forecast will land here once they log energy and mood."
      : "Pair up so this strip can show their weather too.",
    href: "/hub/check-in",
  };
}

export function buildGameStatus(input: {
  game: GameSession | null;
  user: Profile | null;
  partner: Profile | null;
}): StatusItem {
  const { game, partner } = input;
  const name = partner?.displayName ?? "your partner";
  const href = (gameResumeHref(game) ?? "/game/setup") as Href;

  if (!game || ["completed", "cancelled", "declined"].includes(game.status)) {
    return {
      id: "game",
      kicker: "Spicy Game",
      title: "No game in motion",
      detail: "Start one when you want a whole day leading to a steamy close.",
      href: "/(tabs)",
    };
  }

  if (game.status === "inviting") {
    return {
      id: "game",
      kicker: "Spicy Game",
      title: `Waiting on ${name}`,
      detail: "They need to accept before setup. Stay on Home — the invite modal will catch them.",
      href: "/(tabs)",
    };
  }

  if (game.status === "setup") {
    return {
      id: "game",
      kicker: "Spicy Game",
      title: "Finish setup",
      detail: "Mode, blocks, and how many cards per stage.",
      href,
    };
  }

  if (game.status === "selecting") {
    const stage = game.currentStage
      ? STAGE_META[game.currentStage].label
      : "cards";
    return {
      id: "game",
      kicker: "Spicy Game",
      title: `Picking ${stage}`,
      detail: "Choose the cards for tonight, then play.",
      href,
    };
  }

  if (game.status === "rating") {
    return {
      id: "game",
      kicker: "Spicy Game",
      title: "Rate tonight's cards",
      detail: "Keepers land in the Card Bank under Settings.",
      href,
    };
  }

  if (game.awaitingPrivate) {
    return {
      id: "game",
      kicker: "Spicy Game",
      title: "Private time is locked",
      detail: "Daytime cards are done. Unlock together when you are both in the room.",
      href,
    };
  }

  const turn = turnName(game, input.user, partner);
  const stage = game.currentStage
    ? STAGE_META[game.currentStage].label
    : "In play";
  return {
    id: "game",
    kicker: "Spicy Game",
    title: turn ?? "In play",
    detail: `${stage}. Tap to open the table.`,
    href,
  };
}

export function buildTodoStatus(input: {
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
  const partnerName = input.partner?.displayName ?? "your partner";

  const couponForMe = input.coupons.find(
    (row) =>
      row.toUserId === myId &&
      (row.status === "offered" || row.status === "accepted")
  );
  if (couponForMe) {
    todos.push({
      id: "todo-coupon",
      kicker: "To do",
      title:
        couponForMe.status === "offered"
          ? `${partnerName} sent a coupon`
          : `Redeem ${couponForMe.title}`,
      detail:
        couponForMe.status === "offered"
          ? "Accept it before it can be cashed in."
          : couponForMe.body,
      href: "/hub/coupons",
    });
  }

  const sealed = input.jarNotes.filter((note) => !note.openedAt);
  if (sealed.length > 0) {
    todos.push({
      id: "todo-jar",
      kicker: "To do",
      title:
        sealed.length === 1
          ? "A note is waiting in the jar"
          : `${sealed.length} notes in the jar`,
      detail: isSunday()
        ? "Sunday — open it together tonight."
        : "Open it when you both want the hit.",
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
      kicker: "To do",
      title: `${partnerName} answered curiosity`,
      detail: "Your turn to write back.",
      href: "/hub/curiosity",
    });
  } else if (myId && !myCuriosity && todos.length < 2) {
    todos.push({
      id: "todo-curiosity",
      kicker: "To do",
      title: "Today's curiosity is open",
      detail: "One prompt. Write it for them.",
      href: "/hub/curiosity",
    });
  }

  const soon = input.milestones
    .map((item) => ({ item, days: daysUntil(item.date) }))
    .filter((row) => row.days >= 0 && row.days <= 7)
    .sort((a, b) => a.days - b.days)[0];
  if (soon && todos.length < 2) {
    todos.push({
      id: "todo-countdown",
      kicker: "Coming up",
      title: soon.item.title,
      detail:
        soon.days === 0
          ? "That's today."
          : soon.days === 1
            ? "Tomorrow."
            : `${soon.days} days out.`,
      href: "/hub/milestones",
    });
  }

  return todos.slice(0, 2);
}
