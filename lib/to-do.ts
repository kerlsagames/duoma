import type { ChickenPlay } from "@/lib/chicken";
import { formatRelativeWhen } from "@/lib/dates";
import { fantasyById } from "@/lib/fantasy-matcher";
import type { Prediction } from "@/lib/mini-content";
import { nightAskLabel } from "@/lib/play-items";
import { roleplayById } from "@/lib/roleplays";
import { positionById } from "@/lib/sex-positions";
import { sparkById, type SparkAsk } from "@/lib/spark";
import { timeframeLabel } from "@/lib/spicy-dares";
import type {
  BucketItem,
  CheckInRequest,
  Coupon,
  DateNightAsk,
  FantasyTonightAsk,
  PositionInvite,
  Profile,
  RoleplayInvite,
  SpicyDarePlay,
} from "@/lib/types";
import type { Href } from "expo-router";

export type ToDoKind =
  | "position"
  | "roleplay"
  | "date"
  | "fantasy"
  | "dare"
  | "chicken"
  | "coupon"
  | "check-in"
  | "spark"
  | "bet";

export type ToDoLane = "request" | "todo";

export type ToDoItem = {
  id: string;
  kind: ToDoKind;
  lane: ToDoLane;
  title: string;
  detail: string;
  app: string;
  href: Href;
  sortAt: number;
  accent: string;
  yesLabel?: string;
  noLabel?: string;
  doneLabel?: string;
};

const ACCENT: Record<ToDoKind, string> = {
  position: "#FF6B9A",
  roleplay: "#E08AB4",
  date: "#F0A46A",
  fantasy: "#FF4D6A",
  dare: "#FF007F",
  chicken: "#F0C75E",
  coupon: "#C9A24A",
  "check-in": "#3ECFBF",
  spark: "#FF7A9A",
  bet: "#E31B5D",
};

function when(iso: string | null | undefined): string {
  return iso ? formatRelativeWhen(iso) : "now";
}

function stamp(iso: string | null | undefined): number {
  const at = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(at) ? Date.now() : at;
}

export function buildToDoInbox(input: {
  user: Profile | null;
  partner: Profile | null;
  positionInvites: PositionInvite[];
  roleplayInvites: RoleplayInvite[];
  dateNightAsks: DateNightAsk[];
  bucketItems: BucketItem[];
  fantasyTonightAsks: FantasyTonightAsk[];
  spicyDares: SpicyDarePlay[];
  chickenPlays: ChickenPlay[];
  coupons: Coupon[];
  incomingCheckInRequest: CheckInRequest | null;
  sparkAsks?: SparkAsk[];
  predictions?: Prediction[];
}): { requests: ToDoItem[]; todos: ToDoItem[] } {
  const myId = input.user?.id;
  const them = input.partner?.displayName?.trim() || "them";
  const requests: ToDoItem[] = [];
  const todos: ToDoItem[] = [];
  if (!myId) return { requests, todos };

  input.positionInvites.forEach((row) => {
    const pose = positionById(row.positionId);
    const title = pose?.name ?? "a pose";
    const night = row.whenLabel ?? nightAskLabel(row.dateKey);
    if (row.toUserId === myId && row.status === "offered") {
      requests.push({
        id: row.id,
        kind: "position",
        lane: "request",
        title,
        detail: `${them} asked · ${night} · ${when(row.createdAt)}`,
        app: "Positions",
        href: "/hub/positions?tab=requests",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.position,
        yesLabel: `Yes — ${night}`,
        noLabel: "Not this time",
      });
    }
    if (row.status === "accepted") {
      todos.push({
        id: row.id,
        kind: "position",
        lane: "todo",
        title,
        detail: `${night} is on · ${when(row.answeredAt ?? row.createdAt)}`,
        app: "Positions",
        href: "/hub/positions?tab=todo",
        sortAt: stamp(row.answeredAt ?? row.createdAt),
        accent: ACCENT.position,
        doneLabel: "Complete",
      });
    }
  });

  input.roleplayInvites.forEach((row) => {
    const scene = roleplayById(row.roleplayId);
    const title = scene?.name ?? "a scene";
    const night = row.whenLabel ?? nightAskLabel(row.dateKey);
    if (row.toUserId === myId && row.status === "offered") {
      requests.push({
        id: row.id,
        kind: "roleplay",
        lane: "request",
        title,
        detail: `${them} asked · ${night} · ${when(row.createdAt)}`,
        app: "Roleplays",
        href: "/hub/roleplays?tab=requests",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.roleplay,
        yesLabel: `Yes — ${night}`,
        noLabel: "Pass",
      });
    }
    if (row.status === "accepted") {
      todos.push({
        id: row.id,
        kind: "roleplay",
        lane: "todo",
        title,
        detail: `${night} is on · ${when(row.answeredAt ?? row.createdAt)}`,
        app: "Roleplays",
        href: "/hub/roleplays?tab=todo",
        sortAt: stamp(row.answeredAt ?? row.createdAt),
        accent: ACCENT.roleplay,
        doneLabel: "Complete",
      });
    }
  });

  input.dateNightAsks.forEach((row) => {
    const title =
      input.bucketItems.find((item) => item.id === row.bucketId)?.title ?? "a date";
    if (row.toUserId === myId && row.status === "offered") {
      requests.push({
        id: row.id,
        kind: "date",
        lane: "request",
        title,
        detail: `${them} asked · ${when(row.createdAt)}`,
        app: "Date night",
        href: "/hub/planner",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.date,
        yesLabel: "Yes — let’s",
        noLabel: "Not this time",
      });
    }
    if (row.status === "accepted") {
      todos.push({
        id: row.id,
        kind: "date",
        lane: "todo",
        title,
        detail: `Date is on · ${when(row.answeredAt ?? row.createdAt)}`,
        app: "Date night",
        href: "/hub/planner",
        sortAt: stamp(row.answeredAt ?? row.createdAt),
        accent: ACCENT.date,
      });
    }
  });

  input.fantasyTonightAsks.forEach((row) => {
    const title = fantasyById(row.fantasyId)?.title ?? "a match";
    if (row.toUserId === myId && row.status === "offered") {
      requests.push({
        id: row.id,
        kind: "fantasy",
        lane: "request",
        title,
        detail: `${them} asked · ${when(row.createdAt)}`,
        app: "Fantasy Matcher",
        href: "/hub/fantasy-matcher",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.fantasy,
        yesLabel: "Yes — tonight",
        noLabel: "Not tonight",
      });
    }
    if (row.status === "accepted") {
      todos.push({
        id: row.id,
        kind: "fantasy",
        lane: "todo",
        title,
        detail: `Tonight’s on · ${when(row.answeredAt ?? row.createdAt)}`,
        app: "Fantasy Matcher",
        href: "/hub/fantasy-matcher",
        sortAt: stamp(row.answeredAt ?? row.createdAt),
        accent: ACCENT.fantasy,
        doneLabel: "Mark done",
      });
    }
  });

  input.spicyDares.forEach((row) => {
    if (row.toUserId !== myId) return;
    const whenBit = timeframeLabel(row.timeframe, row.customWhen);
    if (row.status === "offered") {
      requests.push({
        id: row.id,
        kind: "dare",
        lane: "request",
        title: row.text,
        detail: `${them} dared you · ${whenBit} · ${when(row.createdAt)}`,
        app: "Dare Me",
        href: "/hub/up-for-it",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.dare,
        yesLabel: "I’m in",
        noLabel: "Pass",
      });
    }
    if (row.status === "accepted") {
      todos.push({
        id: row.id,
        kind: "dare",
        lane: "todo",
        title: row.text,
        detail: `On · ${whenBit} · ${when(row.answeredAt ?? row.createdAt)}`,
        app: "Dare Me",
        href: "/hub/up-for-it",
        sortAt: stamp(row.answeredAt ?? row.createdAt),
        accent: ACCENT.dare,
        doneLabel: "Did it",
      });
    }
  });

  input.chickenPlays.forEach((row) => {
    if (row.toUserId !== myId) return;
    if (row.status === "offered") {
      requests.push({
        id: row.id,
        kind: "chicken",
        lane: "request",
        title: row.text,
        detail: `${them} dared you · ${when(row.createdAt)}`,
        app: "Chicken",
        href: "/hub/chicken",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.chicken,
        yesLabel: "I’m in",
        noLabel: "Chicken!",
      });
    }
    if (row.status === "accepted") {
      todos.push({
        id: row.id,
        kind: "chicken",
        lane: "todo",
        title: row.text,
        detail: `Do it · ${when(row.answeredAt ?? row.createdAt)}`,
        app: "Chicken",
        href: "/hub/chicken",
        sortAt: stamp(row.answeredAt ?? row.createdAt),
        accent: ACCENT.chicken,
        doneLabel: "Did it",
      });
    }
  });

  input.coupons
    .filter((row) => row.toUserId === myId)
    .filter((row) => !row.expiresAt || Date.parse(row.expiresAt) >= Date.now())
    .forEach((row) => {
      if (row.status === "offered") {
        requests.push({
          id: row.id,
          kind: "coupon",
          lane: "request",
          title: row.title,
          detail: `${them} sent this · ${when(row.createdAt)}`,
          app: "Coupons",
          href: "/hub/coupons?tab=received",
          sortAt: stamp(row.createdAt),
          accent: ACCENT.coupon,
          yesLabel: "Accept",
        });
      }
      if (row.status === "accepted") {
        todos.push({
          id: row.id,
          kind: "coupon",
          lane: "todo",
          title: row.title,
          detail: `Ready to tear · ${when(row.acceptedAt ?? row.createdAt)}`,
          app: "Coupons",
          href: "/hub/coupons?tab=received",
          sortAt: stamp(row.acceptedAt ?? row.createdAt),
          accent: ACCENT.coupon,
          doneLabel: "Redeem",
        });
      }
    });

  if (input.incomingCheckInRequest) {
    const row = input.incomingCheckInRequest;
    requests.push({
      id: row.id,
      kind: "check-in",
      lane: "request",
      title: `${them} asked for a check-in`,
      detail: when(row.createdAt),
      app: "Check-in",
      href: "/hub/check-in",
      sortAt: stamp(row.createdAt),
      accent: ACCENT["check-in"],
    });
  }

  (input.sparkAsks ?? [])
    .filter((row) => row.toUserId === myId && row.status === "offered")
    .forEach((row) => {
      const card = sparkById(row.cardId);
      requests.push({
        id: row.id,
        kind: "spark",
        lane: "request",
        title: card?.title ?? "a spark",
        detail: `${them} sent this · ${when(row.createdAt)}`,
        app: "Spark",
        href: "/hub/spark",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.spark,
      });
    });

  (input.predictions ?? []).forEach((row) => {
    const incoming = row.toUserId === myId;
    if (incoming && row.status === "offered") {
      requests.push({
        id: row.id,
        kind: "bet",
        lane: "request",
        title: row.title,
        detail: `${them} sent a slip · ${when(row.createdAt)}`,
        app: "LoveBetz",
        href: "/hub/prediction",
        sortAt: stamp(row.createdAt),
        accent: ACCENT.bet,
      });
    }
    if (row.status === "accepted" && (incoming || row.fromUserId === myId)) {
      todos.push({
        id: row.id,
        kind: "bet",
        lane: "todo",
        title: row.title,
        detail: `On · ${row.stake} · ${when(row.answeredAt ?? row.createdAt)}`,
        app: "LoveBetz",
        href: "/hub/prediction",
        sortAt: stamp(row.answeredAt ?? row.createdAt),
        accent: ACCENT.bet,
      });
    }
  });

  const byNewest = (a: ToDoItem, b: ToDoItem) => b.sortAt - a.sortAt;
  return {
    requests: requests.sort(byNewest),
    todos: todos.sort(byNewest),
  };
}
