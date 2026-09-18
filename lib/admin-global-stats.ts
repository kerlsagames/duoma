import { isDemoPair, isExampleAccount } from "@/lib/admin-example";
import { chickenDareById } from "@/lib/chicken";
import { fantasyById } from "@/lib/fantasy-matcher";
import {
  HOME_HEADER_WIDGETS,
  HUBS,
  type HubDef,
  type HubFeature,
  type HubId,
  type HubMark,
} from "@/lib/hubs";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import { emptyMiniState, type MiniState } from "@/lib/mini-content";
import { positionById } from "@/lib/sex-positions";
import { sparkById } from "@/lib/spark";
import { dareById } from "@/lib/spicy-dares";
import { questionById } from "@/lib/talk";
import { howTechniques } from "@/lib/the-how";
import type { AppDB, Couple, Profile } from "@/lib/types";
import { roleplayById } from "@/lib/roleplays";
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type RankedItem = {
  id: string;
  title: string;
  detail: string;
  count: number;
};

export type GlobalFact = {
  id: string;
  label: string;
  value: string;
};

export type GlobalAppStats = {
  id: string;
  hubId: HubId | "home";
  label: string;
  detail: string;
  icon: IconName;
  mark?: HubMark;
  seconds: number;
  people: number;
  eventCount: number;
  lastAt: string | null;
  facts: GlobalFact[];
  ranked: RankedItem[];
  rankedLabel: string;
};

export type GlobalHubStats = {
  id: HubId | "home";
  label: string;
  tagline: string;
  tile: string;
  tileInk: string;
  icon: IconName;
  seconds: number;
  usedApps: number;
  totalApps: number;
  eventCount: number;
  lastAt: string | null;
  apps: GlobalAppStats[];
};

export type GlobalStats = {
  pairs: number;
  livePairs: number;
  waiting: number;
  people: number;
  totalSeconds: number;
  lastAt: string | null;
  home: GlobalHubStats;
  hubs: GlobalHubStats[];
};

const HIDDEN = new Set(["sexy-vault", "audio-vault", "emergency-vault"]);
const RANK_CAP = 40;

function later(left: string | null, right: string | null): string | null {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

function fact(id: string, label: string, value: string | number): GlobalFact {
  return { id, label, value: typeof value === "number" ? String(value) : value };
}

function norm(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function howName(id: string): string {
  return howTechniques(true).find((row) => row.id === id)?.name ?? id;
}

type Tally = {
  id: string;
  title: string;
  n: number;
  extra: number;
  stars: number;
  rates: number;
  pairs: Set<string>;
};

function tally(map: Map<string, Tally>, id: string, title: string, coupleId?: string): Tally {
  const key = id || norm(title) || "unknown";
  let row = map.get(key);
  if (!row) {
    row = { id: key, title: title.trim() || key, n: 0, extra: 0, stars: 0, rates: 0, pairs: new Set() };
    map.set(key, row);
  }
  if (title.trim() && title.trim().length > row.title.length) row.title = title.trim();
  if (coupleId) row.pairs.add(coupleId);
  return row;
}

function ranked(
  map: Map<string, Tally>,
  detailOf: (row: Tally) => string,
  score: (row: Tally) => number = (row) => row.n
): RankedItem[] {
  return [...map.values()]
    .filter((row) => row.n > 0 || row.extra > 0 || row.rates > 0)
    .sort((left, right) => {
      const delta = score(right) - score(left);
      if (delta) return delta;
      return left.title.localeCompare(right.title);
    })
    .slice(0, RANK_CAP)
    .map((row) => ({
      id: row.id,
      title: row.title,
      detail: detailOf(row),
      count: score(row),
    }));
}

function liveCouples(couples: Couple[], profiles: Profile[]): Couple[] {
  return couples.filter((couple) => {
    if (isExampleAccount(couple.id)) return false;
    const a = profiles.find((row) => row.id === couple.partnerA) ?? null;
    const b = couple.partnerB ? profiles.find((row) => row.id === couple.partnerB) ?? null : null;
    return !isDemoPair(a, b);
  });
}

function packFeatures(
  hub: HubDef | {
    id: HubId | "home";
    features: HubFeature[] | typeof HOME_HEADER_WIDGETS;
  }
): { id: string; label: string; detail: string; icon: IconName; mark?: HubMark }[] {
  return hub.features
    .filter((row) => !HIDDEN.has(row.id))
    .map((row) => ({
      id: row.id,
      label: row.label,
      detail: row.detail,
      icon: row.icon,
      mark: "mark" in row ? row.mark : undefined,
    }));
}

type Ctx = {
  db: AppDB;
  minis: MiniState[];
  coupleIds: Set<string>;
  profiles: Profile[];
};

function secondsFor(profiles: Profile[], appId: string): { seconds: number; people: number } {
  let seconds = 0;
  let people = 0;
  for (const profile of profiles) {
    const value = profile.appSeconds?.[appId] ?? 0;
    if (!value) continue;
    seconds += value;
    people += 1;
  }
  return { seconds, people };
}

function rankSpicy(ctx: Ctx): { facts: GlobalFact[]; ranked: RankedItem[]; events: number; lastAt: string | null } {
  const nights = ctx.db.games.filter((row) => ctx.coupleIds.has(row.coupleId) && row.gameKey === "get-spicy");
  const gameIds = new Set(nights.map((row) => row.id));
  const played = ctx.db.deck.filter((row) => gameIds.has(row.gameId) && row.status === "played");
  const ratings = ctx.db.ratings.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of played) {
    const card = ctx.db.cards.find((item) => item.id === row.cardId);
    const title = card?.title?.trim() || row.cardId;
    const key = card ? `${card.stage}::${norm(card.title)}` : row.cardId;
    const hit = tally(map, key, title, row.gameId);
    hit.n += 1;
  }
  for (const row of ratings) {
    const card = ctx.db.cards.find((item) => item.id === row.cardId);
    const title = card?.title?.trim() || row.cardId;
    const key = card ? `${card.stage}::${norm(card.title)}` : row.cardId;
    const hit = tally(map, key, title, row.coupleId);
    hit.rates += 1;
    hit.stars += row.stars;
    hit.n += 1;
  }
  let lastAt: string | null = null;
  for (const row of nights) lastAt = later(lastAt, row.completedAt || row.updatedAt || row.createdAt);
  for (const row of ratings) lastAt = later(lastAt, row.createdAt);
  return {
    facts: [
      fact("nights", "Nights", nights.length),
      fact("played", "Cards played", played.length),
      fact("rated", "Ratings", ratings.length),
      fact("avg", "Average stars", ratings.length ? (ratings.reduce((sum, row) => sum + row.stars, 0) / ratings.length).toFixed(1) : "—"),
    ],
    ranked: ranked(
      map,
      (row) => {
        const plays = `${row.n} play${row.n === 1 ? "" : "s"}`;
        if (!row.rates) return `${plays} · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`;
        return `${(row.stars / row.rates).toFixed(1)}★ · ${row.rates} rate${row.rates === 1 ? "" : "s"} · ${plays}`;
      },
      (row) => row.rates * 10 + row.stars + row.n
    ),
    events: nights.length + played.length + ratings.length,
    lastAt,
  };
}

function rankRoleplays(ctx: Ctx) {
  const saves = ctx.db.roleplaySaves.filter((row) => ctx.coupleIds.has(row.coupleId));
  const invites = ctx.db.roleplayInvites.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of saves) {
    const hit = tally(map, row.roleplayId, roleplayById(row.roleplayId)?.name ?? row.roleplayId, row.coupleId);
    hit.n += 1;
    if (row.doneAt) hit.extra += 1;
  }
  for (const row of invites) {
    const hit = tally(map, row.roleplayId, roleplayById(row.roleplayId)?.name ?? row.roleplayId, row.coupleId);
    hit.n += 1;
  }
  let lastAt: string | null = null;
  for (const row of saves) lastAt = later(lastAt, row.doneAt || row.createdAt);
  for (const row of invites) lastAt = later(lastAt, row.completedAt || row.answeredAt || row.createdAt);
  return {
    facts: [
      fact("saved", "Saved", saves.length),
      fact("tried", "Tried", saves.filter((row) => row.doneAt).length),
      fact("asks", "Asks sent", invites.length),
      fact("scenes", "Distinct scenes", map.size),
    ],
    ranked: ranked(map, (row) => `${row.n} save${row.n === 1 ? "" : "s"} · ${row.extra} tried · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`),
    events: saves.length + invites.length,
    lastAt,
  };
}

function rankPositions(ctx: Ctx) {
  const saves = ctx.db.positionSaves.filter((row) => ctx.coupleIds.has(row.coupleId));
  const invites = ctx.db.positionInvites.filter((row) => ctx.coupleIds.has(row.coupleId));
  const ratings = ctx.db.playItemRatings.filter(
    (row) => ctx.coupleIds.has(row.coupleId) && row.kind === "position"
  );
  const map = new Map<string, Tally>();
  for (const row of saves) {
    const hit = tally(map, row.positionId, positionById(row.positionId)?.name ?? row.positionId, row.coupleId);
    hit.n += 1;
    if (row.doneAt) hit.extra += 1;
  }
  for (const row of invites) {
    tally(map, row.positionId, positionById(row.positionId)?.name ?? row.positionId, row.coupleId).n += 1;
  }
  for (const row of ratings) {
    const hit = tally(map, row.targetId, positionById(row.targetId)?.name ?? row.targetId, row.coupleId);
    hit.rates += 1;
    hit.stars += row.stars;
    hit.n += 1;
  }
  let lastAt: string | null = null;
  for (const row of saves) lastAt = later(lastAt, row.doneAt || row.createdAt);
  for (const row of ratings) lastAt = later(lastAt, row.createdAt);
  return {
    facts: [
      fact("saved", "Saved", saves.length),
      fact("tried", "Tried", saves.filter((row) => row.doneAt).length),
      fact("asks", "Asks", invites.length),
      fact("rated", "Ratings", ratings.length),
    ],
    ranked: ranked(
      map,
      (row) => {
        const base = `${row.n} save${row.n === 1 ? "" : "s"} · ${row.extra} tried`;
        if (!row.rates) return `${base} · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`;
        return `${(row.stars / row.rates).toFixed(1)}★ · ${row.rates} rate${row.rates === 1 ? "" : "s"} · ${base}`;
      },
      (row) => row.rates * 10 + row.stars + row.n
    ),
    events: saves.length + invites.length + ratings.length,
    lastAt,
  };
}

function rankFantasy(ctx: Ctx) {
  const swipes = ctx.db.fantasySwipes.filter((row) => ctx.coupleIds.has(row.coupleId));
  const done = ctx.db.fantasyCompletions.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of swipes) {
    const hit = tally(map, row.fantasyId, fantasyById(row.fantasyId)?.title ?? row.fantasyId, row.coupleId);
    hit.n += 1;
    if (row.liked) hit.extra += 1;
  }
  for (const row of done) {
    tally(map, row.fantasyId, fantasyById(row.fantasyId)?.title ?? row.fantasyId, row.coupleId).n += 1;
  }
  let lastAt: string | null = null;
  for (const row of swipes) lastAt = later(lastAt, row.createdAt);
  for (const row of done) lastAt = later(lastAt, row.doneAt);
  return {
    facts: [
      fact("swipes", "Swipes", swipes.length),
      fact("liked", "Liked", swipes.filter((row) => row.liked).length),
      fact("passed", "Passed", swipes.filter((row) => !row.liked).length),
      fact("done", "Marked done", done.length),
    ],
    ranked: ranked(
      map,
      (row) => `${row.extra} like${row.extra === 1 ? "" : "s"} · ${row.n} swipe${row.n === 1 ? "" : "s"} · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`,
      (row) => row.extra * 5 + row.n
    ),
    events: swipes.length + done.length,
    lastAt,
  };
}

function rankSpark(ctx: Ctx) {
  const map = new Map<string, Tally>();
  let lastAt: string | null = null;
  let done = 0;
  let fav = 0;
  let asks = 0;
  for (const mini of ctx.minis) {
    done += mini.spark.doneIds.length;
    fav += mini.spark.favorites.length;
    asks += mini.spark.asks.length;
    for (const id of mini.spark.doneIds) {
      tally(map, id, sparkById(id)?.title ?? id).n += 1;
    }
    for (const id of mini.spark.favorites) {
      tally(map, id, sparkById(id)?.title ?? id).extra += 1;
    }
    for (const row of mini.spark.asks) {
      tally(map, row.cardId, sparkById(row.cardId)?.title ?? row.cardId).n += 1;
      lastAt = later(lastAt, row.answeredAt || row.createdAt);
    }
  }
  return {
    facts: [
      fact("done", "Marked done", done),
      fact("fav", "Favourites", fav),
      fact("asks", "Asks", asks),
    ],
    ranked: ranked(map, (row) => `${row.n} done/ask · ${row.extra} favourite${row.extra === 1 ? "" : "s"}`),
    events: done + asks,
    lastAt,
  };
}

function rankDares(ctx: Ctx) {
  const plays = ctx.db.spicyDares.filter((row) => ctx.coupleIds.has(row.coupleId));
  const saves = ctx.db.dareSaves.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of plays) {
    const title = dareById(row.dareId ?? "")?.text ?? row.text;
    const hit = tally(map, row.dareId || norm(row.text), title, row.coupleId);
    hit.n += 1;
    if (row.status === "done" || row.completedAt) hit.extra += 1;
  }
  for (const row of saves) {
    const title = dareById(row.dareId)?.text ?? row.dareId;
    const hit = tally(map, row.dareId, title, row.coupleId);
    hit.n += 1;
    if (row.doneAt) hit.extra += 1;
  }
  let lastAt: string | null = null;
  for (const row of plays) lastAt = later(lastAt, row.completedAt || row.answeredAt || row.createdAt);
  return {
    facts: [
      fact("sent", "Dares sent", plays.length),
      fact("done", "Completed", plays.filter((row) => row.status === "done" || row.completedAt).length),
      fact("saved", "Saved", saves.length),
    ],
    ranked: ranked(map, (row) => `${row.n} play${row.n === 1 ? "" : "s"} · ${row.extra} done · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`),
    events: plays.length + saves.length,
    lastAt,
  };
}

function rankChicken(ctx: Ctx) {
  const plays = ctx.db.chickenPlays.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of plays) {
    const title = chickenDareById(row.dareId)?.name ?? row.text;
    const hit = tally(map, row.dareId || norm(row.text), title, row.coupleId);
    hit.n += 1;
    if (row.status === "done" || row.completedAt) hit.extra += 1;
  }
  let lastAt: string | null = null;
  for (const row of plays) lastAt = later(lastAt, row.completedAt || row.answeredAt || row.createdAt);
  return {
    facts: [
      fact("sent", "Sent", plays.length),
      fact("done", "Done", plays.filter((row) => row.status === "done" || row.completedAt).length),
    ],
    ranked: ranked(map, (row) => `${row.n} play${row.n === 1 ? "" : "s"} · ${row.extra} done · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`),
    events: plays.length,
    lastAt,
  };
}

function rankBets(ctx: Ctx) {
  const map = new Map<string, Tally>();
  let count = 0;
  let lastAt: string | null = null;
  for (const mini of ctx.minis) {
    for (const row of mini.predictions) {
      count += 1;
      const title = row.statement || row.title || "Bet";
      const hit = tally(map, norm(title), title);
      hit.n += 1;
      if (row.status === "settled") hit.extra += 1;
      lastAt = later(lastAt, row.answeredAt || row.createdAt);
    }
  }
  return {
    facts: [
      fact("slips", "Slips", count),
      fact("settled", "Settled", [...map.values()].reduce((sum, row) => sum + row.extra, 0)),
    ],
    ranked: ranked(map, (row) => `${row.n} slip${row.n === 1 ? "" : "s"} · ${row.extra} settled`),
    events: count,
    lastAt,
  };
}

function rankTalk(ctx: Ctx) {
  const draws = ctx.db.talkDraws.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of draws) {
    const q = questionById(row.categoryId, row.questionId);
    const hit = tally(map, `${row.categoryId}:${row.questionId}`, q?.text ?? row.questionId, row.coupleId);
    hit.n += 1;
    if (row.answeredAt) hit.extra += 1;
  }
  let lastAt: string | null = null;
  for (const row of draws) lastAt = later(lastAt, row.answeredAt || row.createdAt);
  return {
    facts: [
      fact("drawn", "Drawn", draws.length),
      fact("answered", "Answered", draws.filter((row) => row.answeredAt).length),
    ],
    ranked: ranked(map, (row) => `${row.n} draw${row.n === 1 ? "" : "s"} · ${row.extra} answered`),
    events: draws.length,
    lastAt,
  };
}

function rankDates(ctx: Ctx) {
  const buckets = ctx.db.bucketItems.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of buckets) {
    const hit = tally(map, row.sourceId || norm(row.title), row.title, row.coupleId);
    hit.n += 1;
    if (row.doneAt) hit.extra += 1;
  }
  let lastAt: string | null = null;
  for (const row of buckets) lastAt = later(lastAt, row.doneAt || row.createdAt);
  return {
    facts: [
      fact("saved", "Dates saved", buckets.length),
      fact("done", "Marked done", buckets.filter((row) => row.doneAt).length),
    ],
    ranked: ranked(map, (row) => `${row.n} save${row.n === 1 ? "" : "s"} · ${row.extra} done · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`),
    events: buckets.length,
    lastAt,
  };
}

function rankCoupons(ctx: Ctx) {
  const coupons = ctx.db.coupons.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of coupons) {
    const hit = tally(map, norm(row.title), row.title, row.coupleId);
    hit.n += 1;
    if (row.status === "redeemed" || row.redeemedAt) hit.extra += 1;
  }
  let lastAt: string | null = null;
  for (const row of coupons) lastAt = later(lastAt, row.redeemedAt || row.createdAt);
  return {
    facts: [
      fact("given", "Given", coupons.length),
      fact("used", "Redeemed", coupons.filter((row) => row.status === "redeemed" || row.redeemedAt).length),
    ],
    ranked: ranked(map, (row) => `${row.n} given · ${row.extra} redeemed`),
    events: coupons.length,
    lastAt,
  };
}

function rankHow(ctx: Ctx) {
  const map = new Map<string, Tally>();
  let marked = 0;
  let lastAt: string | null = null;
  for (const mini of ctx.minis) {
    for (const row of mini.howNotes) {
      if (!row.status && !row.note) continue;
      marked += 1;
      const hit = tally(map, row.techniqueId, howName(row.techniqueId));
      hit.n += 1;
      if (row.status === "keep") hit.extra += 1;
      lastAt = later(lastAt, row.updatedAt);
    }
  }
  return {
    facts: [
      fact("marked", "Techniques marked", marked),
      fact("keep", "Keep", [...map.values()].reduce((sum, row) => sum + row.extra, 0)),
    ],
    ranked: ranked(map, (row) => `${row.n} mark${row.n === 1 ? "" : "s"} · ${row.extra} keep`),
    events: marked,
    lastAt,
  };
}

function rankLists(ctx: Ctx) {
  const lists = ctx.db.coupleLists.filter((row) => ctx.coupleIds.has(row.coupleId));
  const entries = ctx.db.listEntries.filter((row) => ctx.coupleIds.has(row.coupleId));
  const map = new Map<string, Tally>();
  for (const row of entries) {
    const list = lists.find((item) => item.id === row.listId);
    const hit = tally(map, list?.starterKey || norm(list?.title || row.title), list?.title || row.title, row.coupleId);
    hit.n += 1;
    if (row.completedAt) hit.extra += 1;
  }
  let lastAt: string | null = null;
  for (const row of entries) lastAt = later(lastAt, row.completedAt || row.createdAt);
  return {
    facts: [
      fact("lists", "Lists", lists.length),
      fact("items", "Items", entries.length),
      fact("done", "Ticked off", entries.filter((row) => row.completedAt).length),
    ],
    ranked: ranked(map, (row) => `${row.n} item${row.n === 1 ? "" : "s"} · ${row.extra} done · ${row.pairs.size} pair${row.pairs.size === 1 ? "" : "s"}`),
    events: lists.length + entries.length,
    lastAt,
  };
}

function rankBirthdays(ctx: Ctx) {
  let count = 0;
  let lastAt: string | null = null;
  for (const mini of ctx.minis) {
    count += mini.birthdays.length;
    for (const row of mini.birthdays) lastAt = later(lastAt, row.createdAt);
  }
  return {
    facts: [fact("saved", "Birthdays saved", count)],
    ranked: [] as RankedItem[],
    events: count,
    lastAt,
  };
}

function rankCheckIn(ctx: Ctx) {
  const rows = ctx.db.checkIns.filter((row) => ctx.coupleIds.has(row.coupleId));
  let lastAt: string | null = null;
  for (const row of rows) lastAt = later(lastAt, row.createdAt);
  const yes = rows.filter((row) => row.tonight === "yes").length;
  return {
    facts: [
      fact("logs", "Check-ins", rows.length),
      fact("yes", "Tonight yes", yes),
      fact("maybe", "Tonight maybe", rows.filter((row) => row.tonight === "maybe").length),
      fact("no", "Tonight no", rows.filter((row) => row.tonight === "no").length),
    ],
    ranked: [] as RankedItem[],
    events: rows.length,
    lastAt,
  };
}

const RANKERS: Record<
  string,
  (ctx: Ctx) => { facts: GlobalFact[]; ranked: RankedItem[]; events: number; lastAt: string | null }
> = {
  spicy: rankSpicy,
  roleplays: rankRoleplays,
  positions: rankPositions,
  "fantasy-matcher": rankFantasy,
  spark: rankSpark,
  "up-for-it": rankDares,
  chicken: rankChicken,
  prediction: rankBets,
  talk: rankTalk,
  "date-night": rankDates,
  coupons: rankCoupons,
  "the-how": rankHow,
  lists: rankLists,
  birthdays: rankBirthdays,
  "check-in": rankCheckIn,
};

const RANK_LABEL: Record<string, string> = {
  spicy: "Top cards",
  roleplays: "Top scenes",
  positions: "Top positions",
  "fantasy-matcher": "Top fantasies",
  spark: "Top sparks",
  "up-for-it": "Top dares",
  chicken: "Top chicken dares",
  prediction: "Top bets",
  talk: "Top questions",
  "date-night": "Top dates",
  coupons: "Top coupons",
  "the-how": "Top techniques",
  lists: "Top lists",
};

function emptyRank() {
  return { facts: [] as GlobalFact[], ranked: [] as RankedItem[], events: 0, lastAt: null as string | null };
}

function packApp(
  ctx: Ctx,
  hubId: HubId | "home",
  feature: { id: string; label: string; detail: string; icon: IconName; mark?: HubMark }
): GlobalAppStats {
  const time = secondsFor(ctx.profiles, feature.id);
  const extra = RANKERS[feature.id]?.(ctx) ?? emptyRank();
  const people = new Set(
    ctx.profiles.filter((row) => (row.appSeconds?.[feature.id] ?? 0) > 0).map((row) => row.id)
  ).size;
  return {
    id: feature.id,
    hubId,
    label: feature.label,
    detail: feature.detail,
    icon: feature.icon,
    mark: feature.mark,
    seconds: time.seconds,
    people,
    eventCount: extra.events,
    lastAt: extra.lastAt,
    facts: [
      fact("time", "Total time", time.seconds ? formatActiveTime(time.seconds) : extra.events ? "used" : "—"),
      fact("people", "People with time", people),
      fact("events", "Logged events", extra.events),
      fact("last", "Last activity", extra.lastAt ? formatWhen(extra.lastAt) : "—"),
      ...extra.facts,
    ],
    ranked: extra.ranked,
    rankedLabel: RANK_LABEL[feature.id] ?? "Top items",
  };
}

function packHub(
  ctx: Ctx,
  hub: HubDef | {
    id: HubId | "home";
    label: string;
    tagline: string;
    tile: string;
    tileInk: string;
    icon: IconName;
    features: HubFeature[] | typeof HOME_HEADER_WIDGETS;
  }
): GlobalHubStats {
  const apps = packFeatures(hub).map((feature) => packApp(ctx, hub.id, feature));
  return {
    id: hub.id,
    label: hub.label,
    tagline: hub.tagline,
    tile: hub.tile,
    tileInk: hub.tileInk,
    icon: hub.icon,
    seconds: apps.reduce((sum, row) => sum + row.seconds, 0),
    usedApps: apps.filter((row) => row.eventCount > 0 || row.seconds > 0).length,
    totalApps: apps.length,
    eventCount: apps.reduce((sum, row) => sum + row.eventCount, 0),
    lastAt: apps.reduce<string | null>((stamp, row) => later(stamp, row.lastAt), null),
    apps,
  };
}

export function buildGlobalStats(input: {
  db: AppDB;
  minis: Record<string, MiniState>;
  profiles: Profile[];
  couples: Couple[];
}): GlobalStats {
  const couples = liveCouples(input.couples, input.profiles);
  const coupleIds = new Set(couples.map((row) => row.id));
  const people = input.profiles.filter(
    (row) =>
      !isExampleAccount(row.id) &&
      !row.isDemo &&
      couples.some((couple) => couple.partnerA === row.id || couple.partnerB === row.id)
  );
  const minis = couples.map((couple) => input.minis[couple.id] ?? emptyMiniState());
  const ctx: Ctx = { db: input.db, minis, coupleIds, profiles: people };
  const home = packHub(ctx, {
    id: "home",
    label: "Home",
    tagline: "Check-in, calendar, notepad",
    tile: "#2A2A33",
    tileInk: "#F4F4F6",
    icon: "home",
    features: HOME_HEADER_WIDGETS.map((row) => ({
      id: row.id,
      label: row.label,
      detail: row.detail,
      icon: row.icon,
      href: row.href,
    })),
  });
  const hubs = HUBS.map((hub) => packHub(ctx, hub));
  const lastAt = [home, ...hubs].reduce<string | null>((stamp, hub) => later(stamp, hub.lastAt), null);
  const totalSeconds = people.reduce((sum, row) => sum + (row.activeSeconds ?? 0), 0);
  return {
    pairs: couples.length,
    livePairs: couples.filter((row) => row.partnerB).length,
    waiting: couples.filter((row) => !row.partnerB).length,
    people: people.length,
    totalSeconds,
    lastAt,
    home,
    hubs,
  };
}
