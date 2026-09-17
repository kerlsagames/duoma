import { curiosityQuestionById } from "@/lib/curiosityQuestions";
import { pairAgeDays } from "@/lib/couple-stats";
import { fantasyById } from "@/lib/fantasy-matcher";
import { knowMePackById } from "@/lib/know-me";
import {
  HOME_HEADER_WIDGETS,
  HUBS,
  type HubDef,
  type HubFeature,
  type HubId,
  type HubMark,
} from "@/lib/hubs";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import { emptyMiniState, PING_KINDS, type MiniState } from "@/lib/mini-content";
import { positionById } from "@/lib/sex-positions";
import { sparkById } from "@/lib/spark";
import { roleplayById } from "@/lib/roleplays";
import { questionById } from "@/lib/talk";
import { howTechniques } from "@/lib/the-how";
import type { AppDB, Couple, Profile } from "@/lib/types";
import { offerLabel, toneLabel, type WhiteFlag } from "@/lib/white-flag";
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

const EVENT_CAP = 80;

export type StatFact = {
  id: string;
  label: string;
  value: string;
};

export type StatEvent = {
  id: string;
  at: string | null;
  title: string;
  detail: string;
};

export type AppInsight = {
  id: string;
  hubId: HubId | "home";
  label: string;
  detail: string;
  icon: IconName;
  mark?: HubMark;
  seconds: number;
  lastAt: string | null;
  firstAt: string | null;
  facts: StatFact[];
  events: StatEvent[];
};

export type HubInsight = {
  id: HubId | "home";
  label: string;
  tagline: string;
  tile: string;
  tileInk: string;
  icon: IconName;
  seconds: number;
  lastAt: string | null;
  usedApps: number;
  totalApps: number;
  eventCount: number;
  apps: AppInsight[];
};

export type PartnerDossier = {
  profileId: string;
  facts: StatFact[];
  home: HubInsight;
  hubs: HubInsight[];
};

type Bucket = {
  facts: StatFact[];
  events: StatEvent[];
};

type Ctx = {
  db: AppDB;
  mini: MiniState;
  profile: Profile;
  couple: Couple | null;
  coupleIds: Set<string>;
  flags: WhiteFlag[];
  names: Map<string, string>;
};

function n(value: number): string {
  return String(value);
}

function clip(text: string, max = 120): string {
  const next = text.replace(/\s+/g, " ").trim();
  if (next.length <= max) return next;
  return `${next.slice(0, max - 1)}…`;
}

function later(left: string | null, right: string | null): string | null {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

function earlier(left: string | null, right: string | null): string | null {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) <= Date.parse(right) ? left : right;
}

function involved(coupleId: string | null | undefined, ids: Set<string>) {
  return Boolean(coupleId && ids.has(coupleId));
}

function fact(id: string, label: string, value: string | number): StatFact {
  return { id, label, value: typeof value === "number" ? n(value) : value };
}

function event(id: string, at: string | null | undefined, title: string, detail: string): StatEvent {
  return { id, at: at ?? null, title, detail };
}

function sortEvents(rows: StatEvent[]): StatEvent[] {
  return [...rows]
    .sort((left, right) => Date.parse(right.at ?? "") - Date.parse(left.at ?? ""))
    .slice(0, EVENT_CAP);
}

function stamps(events: StatEvent[]): { first: string | null; last: string | null } {
  let first: string | null = null;
  let last: string | null = null;
  for (const row of events) {
    first = earlier(first, row.at);
    last = later(last, row.at);
  }
  return { first, last };
}

function nameOf(ctx: Ctx, userId: string | null | undefined): string {
  if (!userId) return "someone";
  if (userId === ctx.profile.id) return ctx.profile.displayName;
  return ctx.names.get(userId) ?? "partner";
}

function whoLine(ctx: Ctx, fromId: string, toId?: string | null): string {
  const from = fromId === ctx.profile.id ? "sent" : "received";
  if (!toId) return from;
  return `${from} · ${nameOf(ctx, fromId === ctx.profile.id ? toId : fromId)}`;
}

function cardTitle(db: AppDB, cardId: string): string {
  return db.cards.find((row) => row.id === cardId)?.title ?? cardId;
}

function listTitle(db: AppDB, listId: string): string {
  return db.coupleLists.find((row) => row.id === listId)?.title ?? "List";
}

function howName(id: string): string {
  return howTechniques(true).find((row) => row.id === id)?.name ?? id;
}

function pingLabel(kind: string): string {
  return PING_KINDS.find((row) => row.id === kind)?.label ?? kind;
}

function collectLists(ctx: Ctx): Bucket {
  const lists = ctx.db.coupleLists.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const entries = ctx.db.listEntries.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const mine = entries.filter((row) => row.createdBy === ctx.profile.id);
  const done = entries.filter((row) => row.completedAt);
  const events = [
    ...lists.map((row) =>
      event(row.id, row.createdAt, row.title, `list · ${row.createdBy === ctx.profile.id ? "opened by them" : "on the pair"}`)
    ),
    ...entries.map((row) =>
      event(
        row.id,
        row.completedAt || row.createdAt,
        row.title,
        `${listTitle(ctx.db, row.listId)}${row.completedAt ? " · ticked off" : " · added"}${row.notes ? ` · ${clip(row.notes, 60)}` : ""}`
      )
    ),
  ];
  return {
    facts: [
      fact("lists", "Lists on the pair", lists.length),
      fact("added", "Items they added", mine.length),
      fact("all", "Items on the pair", entries.length),
      fact("done", "Items ticked off", done.length),
    ],
    events,
  };
}

function collectDates(ctx: Ctx): Bucket {
  const buckets = ctx.db.bucketItems.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const asks = ctx.db.dateNightAsks.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  const titleOf = (id: string) => buckets.find((row) => row.id === id)?.title ?? id;
  return {
    facts: [
      fact("saved", "Dates saved", buckets.length),
      fact("done-dates", "Dates marked done", buckets.filter((row) => row.doneAt).length),
      fact("asks", "Date nights they started", asks.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("yes", "Asks accepted", asks.filter((row) => row.status === "accepted").length),
      fact("no", "Asks declined", asks.filter((row) => row.status === "declined").length),
    ],
    events: [
      ...asks.map((row) =>
        event(row.id, row.answeredAt || row.createdAt, titleOf(row.bucketId), `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status} · ${row.nightKey}`)
      ),
      ...buckets.map((row) =>
        event(row.id, row.doneAt || row.createdAt, row.title, `${row.kind}${row.doneAt ? " · done" : " · to-do"}${row.scheduledOn ? ` · ${row.scheduledOn}` : ""}`)
      ),
    ],
  };
}

function collectPings(ctx: Ctx): Bucket {
  const pokes = ctx.db.partnerPokes.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  const pings = ctx.mini.pings.filter((row) => row.fromId === ctx.profile.id);
  const flashes = ctx.mini.flashes.filter((row) => row.fromId === ctx.profile.id);
  return {
    facts: [
      fact("pokes", "App pokes", pokes.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("pings", "Thought pings sent", pings.length),
      fact("flashes", "Signal flashes sent", flashes.length),
    ],
    events: [
      ...pokes.map((row) =>
        event(row.id, row.createdAt, row.appId, whoLine(ctx, row.fromUserId, row.toUserId))
      ),
      ...pings.map((row) => event(row.id, row.createdAt, pingLabel(row.kind), "thought ping")),
      ...flashes.map((row) => event(row.id, row.createdAt, "Signal flash", row.codeId)),
    ],
  };
}

function collectTalk(ctx: Ctx): Bucket {
  const draws = ctx.db.talkDraws.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.userId === ctx.profile.id
  );
  const vault = ctx.db.talkVault.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.userId === ctx.profile.id
  );
  return {
    facts: [
      fact("drawn", "Cards drawn", draws.length),
      fact("answered", "Cards answered", draws.filter((row) => row.answeredAt).length),
      fact("vault", "Vault keeps", vault.length),
    ],
    events: [
      ...draws.map((row) => {
        const q = questionById(row.categoryId, row.questionId);
        return event(row.id, row.answeredAt || row.createdAt, q?.text ?? row.questionId, `${row.categoryId} · ${row.answeredAt ? "answered" : "drawn"}`);
      }),
      ...vault.map((row) => event(row.id, row.readAt, clip(row.text || row.questionId), `vault · ${row.source}`)),
    ],
  };
}

function collectAudio(ctx: Ctx): Bucket {
  const notes = ctx.mini.audioNotes.filter((row) => row.fromId === ctx.profile.id);
  const heard = ctx.mini.audioNotes.filter((row) => row.fromId !== ctx.profile.id);
  return {
    facts: [
      fact("sent", "Voice notes they recorded", notes.length),
      fact("heard", "Notes from partner on this phone", heard.length),
      fact("secs", "Seconds they recorded", notes.reduce((sum, row) => sum + (row.seconds || 0), 0)),
    ],
    events: notes.map((row) =>
      event(row.id, row.createdAt, row.title || "Voice note", `${row.folder} · ${row.seconds}s${row.body ? ` · ${clip(row.body, 80)}` : ""}`)
    ),
  };
}

function collectJar(ctx: Ctx): Bucket {
  const notes = ctx.db.jarNotes.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const mine = notes.filter((row) => row.fromUserId === ctx.profile.id);
  return {
    facts: [
      fact("wrote", "Notes they wrote", mine.length),
      fact("pair", "Notes on the pair", notes.length),
      fact("open", "Opened", notes.filter((row) => row.openedAt).length),
      fact("sealed", "Still sealed", notes.filter((row) => !row.openedAt).length),
    ],
    events: notes.map((row) =>
      event(
        row.id,
        row.openedAt || row.createdAt,
        clip(row.body),
        `${row.fromUserId === ctx.profile.id ? "they wrote" : "partner wrote"} · ${row.openedAt ? "opened" : "sealed"}`
      )
    ),
  };
}

function collectApology(ctx: Ctx): Bucket {
  const flags = ctx.flags.filter(
    (row) => row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id
  );
  return {
    facts: [
      fact("raised", "Flags they raised", flags.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("got", "Flags they received", flags.filter((row) => row.toUserId === ctx.profile.id).length),
      fact("open", "Still open", flags.filter((row) => row.status === "raised").length),
    ],
    events: flags.map((row) =>
      event(
        row.id,
        row.resolvedAt || row.createdAt,
        toneLabel(row.tone),
        `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status}${row.offer ? ` · ${offerLabel(row.offer)}` : ""}${row.note ? ` · ${clip(row.note, 60)}` : ""}`
      )
    ),
  };
}

function collectCuriosity(ctx: Ctx): Bucket {
  const answers = ctx.db.curiosityAnswers.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.userId === ctx.profile.id
  );
  const skips = ctx.db.curiositySkips.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.userId === ctx.profile.id
  );
  return {
    facts: [
      fact("answered", "Cards answered", answers.length),
      fact("skipped", "Cards skipped", skips.length),
      fact("guessed", "Partner guesses logged", answers.filter((row) => row.guessIndex != null).length),
    ],
    events: [
      ...answers.map((row) => {
        const q = curiosityQuestionById(row.questionId);
        return event(row.id, row.createdAt, q?.question ?? row.questionId, clip(row.body || q?.options[row.answerIndex ?? 0] || "answered"));
      }),
      ...skips.map((row) => event(row.id, row.createdAt, curiosityQuestionById(row.questionId)?.question ?? row.questionId, "skipped")),
    ],
  };
}

function collectSpicy(ctx: Ctx): Bucket {
  const nights = ctx.db.games.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.gameKey === "get-spicy"
  );
  const gameIds = new Set(nights.map((row) => row.id));
  const deck = ctx.db.deck.filter((row) => gameIds.has(row.gameId));
  const played = deck.filter((row) => row.status === "played");
  const ratings = ctx.db.ratings.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.userId === ctx.profile.id
  );
  return {
    facts: [
      fact("nights", "Nights on the pair", nights.length),
      fact("started", "Nights they started", nights.filter((row) => row.initiatorId === ctx.profile.id).length),
      fact("done", "Nights finished", nights.filter((row) => row.status === "completed" || row.status === "rating").length),
      fact("cards", "Cards played", played.length),
      fact("they-played", "Cards they played", played.filter((row) => row.playedBy === ctx.profile.id).length),
      fact("rated", "Cards they rated", ratings.length),
    ],
    events: [
      ...nights.map((row) =>
        event(
          row.id,
          row.completedAt || row.updatedAt || row.createdAt,
          `Spicy night · ${row.pace}`,
          `${row.status} · started by ${nameOf(ctx, row.initiatorId)} · ${row.flavorTags?.length ?? 0} flavours`
        )
      ),
      ...played.map((row) => {
        const night = nights.find((item) => item.id === row.gameId);
        return event(
          row.id,
          night?.completedAt || night?.createdAt || null,
          cardTitle(ctx.db, row.cardId),
          `${row.stage} · ${row.playedBy ? nameOf(ctx, row.playedBy) : "unassigned"}`
        );
      }),
      ...ratings.map((row) =>
        event(row.id, row.createdAt, cardTitle(ctx.db, row.cardId), `${row.stars}★`)
      ),
    ],
  };
}

function collectSpark(ctx: Ctx): Bucket {
  const spark = ctx.mini.spark;
  const asks = spark.asks.filter(
    (row) => row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id
  );
  return {
    facts: [
      fact("done", "Sparks marked done", spark.doneIds.length),
      fact("fav", "Favourites", spark.favorites.length),
      fact("asks", "Sparks sent / received", asks.length),
      fact("done-asks", "Asks completed", asks.filter((row) => row.status === "done").length),
    ],
    events: [
      ...asks.map((row) => {
        const card = sparkById(row.cardId);
        return event(row.id, row.answeredAt || row.createdAt, card?.title ?? row.cardId, `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status}${card ? ` · ${card.location}` : ""}`);
      }),
      ...spark.doneIds.slice(0, 40).map((id) =>
        event(`done-${id}`, null, sparkById(id)?.title ?? id, "marked done")
      ),
    ],
  };
}

function collectDares(ctx: Ctx): Bucket {
  const dares = ctx.db.spicyDares.filter(
    (row) =>
      involved(row.coupleId, ctx.coupleIds) &&
      (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  const saves = ctx.db.dareSaves.filter((row) => involved(row.coupleId, ctx.coupleIds));
  return {
    facts: [
      fact("sent", "Dares they sent", dares.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("got", "Dares they received", dares.filter((row) => row.toUserId === ctx.profile.id).length),
      fact("done", "Completed", dares.filter((row) => row.status === "done" || row.completedAt).length),
      fact("open", "Still open", dares.filter((row) => row.status === "offered" || row.status === "accepted").length),
      fact("saved", "Saved dares on the pair", saves.length),
    ],
    events: dares.map((row) =>
      event(
        row.id,
        row.completedAt || row.answeredAt || row.createdAt,
        clip(row.text),
        `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status} · ${row.timeframe}${row.categories.length ? ` · ${row.categories.join(", ")}` : ""}`
      )
    ),
  };
}

function collectRoleplays(ctx: Ctx): Bucket {
  const saves = ctx.db.roleplaySaves.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const invites = ctx.db.roleplayInvites.filter(
    (row) =>
      involved(row.coupleId, ctx.coupleIds) &&
      (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  const titleOf = (id: string) => roleplayById(id)?.name ?? id;
  return {
    facts: [
      fact("saved", "Saved", saves.length),
      fact("tried", "Tried", saves.filter((row) => row.doneAt).length),
      fact("asks", "Asks they sent", invites.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("got", "Asks they got", invites.filter((row) => row.toUserId === ctx.profile.id).length),
    ],
    events: [
      ...invites.map((row) =>
        event(row.id, row.completedAt || row.answeredAt || row.createdAt, titleOf(row.roleplayId), `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status}${row.whenLabel ? ` · ${row.whenLabel}` : ""}`)
      ),
      ...saves.map((row) =>
        event(row.id, row.doneAt || row.createdAt, titleOf(row.roleplayId), row.doneAt ? "tried" : "saved")
      ),
    ],
  };
}

function collectPositions(ctx: Ctx): Bucket {
  const saves = ctx.db.positionSaves.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const invites = ctx.db.positionInvites.filter(
    (row) =>
      involved(row.coupleId, ctx.coupleIds) &&
      (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  const ratings = ctx.db.playItemRatings.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.kind === "position" && row.userId === ctx.profile.id
  );
  const titleOf = (id: string) => positionById(id)?.name ?? id;
  return {
    facts: [
      fact("saved", "Saved", saves.length),
      fact("tried", "Tried", saves.filter((row) => row.doneAt).length),
      fact("asks", "Asks they sent", invites.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("rated", "They rated", ratings.length),
    ],
    events: [
      ...invites.map((row) =>
        event(row.id, row.completedAt || row.answeredAt || row.createdAt, titleOf(row.positionId), `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status}${row.whenLabel ? ` · ${row.whenLabel}` : ""}`)
      ),
      ...saves.map((row) =>
        event(row.id, row.doneAt || row.createdAt, titleOf(row.positionId), row.doneAt ? "tried" : "saved")
      ),
      ...ratings.map((row) => event(row.id, row.createdAt, titleOf(row.targetId), `${row.stars}★`)),
    ],
  };
}

function collectFantasy(ctx: Ctx): Bucket {
  const swipes = ctx.db.fantasySwipes.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.userId === ctx.profile.id
  );
  const done = ctx.db.fantasyCompletions.filter(
    (row) => involved(row.coupleId, ctx.coupleIds)
  );
  const asks = ctx.db.fantasyTonightAsks.filter(
    (row) =>
      involved(row.coupleId, ctx.coupleIds) &&
      (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  const titleOf = (id: string) => fantasyById(id)?.title ?? id;
  const liked = swipes.filter((row) => row.liked);
  return {
    facts: [
      fact("swipes", "Swipes", swipes.length),
      fact("liked", "Liked", liked.length),
      fact("passed", "Passed", swipes.filter((row) => !row.liked).length),
      fact("done", "Marked done on the pair", done.length),
      fact("tonight", "Tonight asks", asks.length),
    ],
    events: [
      ...asks.map((row) =>
        event(row.id, row.createdAt, titleOf(row.fantasyId), `${whoLine(ctx, row.fromUserId, row.toUserId)}`)
      ),
      ...done.map((row) => event(row.id, row.doneAt, titleOf(row.fantasyId), `completed by ${nameOf(ctx, row.completedBy)}`)),
      ...liked.map((row) => event(row.id, row.createdAt, titleOf(row.fantasyId), "liked")),
    ],
  };
}

function collectStreak(ctx: Ctx): Bucket {
  const logs = ctx.mini.intimacy.filter(
    (row) => row.userId === ctx.profile.id || row.userId === "couple"
  );
  const byKind = new Map<string, number>();
  for (const row of logs) byKind.set(row.kind, (byKind.get(row.kind) ?? 0) + 1);
  return {
    facts: [
      fact("logs", "Intimacy logs", logs.length),
      ...[...byKind.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
        .map(([kind, count]) => fact(`k-${kind}`, kind, count)),
    ],
    events: logs.map((row) =>
      event(row.id, row.createdAt, row.kind, `${row.date}${row.note ? ` · ${clip(row.note, 80)}` : ""}${row.sourceId ? " · auto" : " · logged"}`)
    ),
  };
}

function collectVault(ctx: Ctx): Bucket {
  const items = ctx.mini.sexyVault.filter((row) => row.fromId === ctx.profile.id);
  const photos = items.filter((row) => row.kind !== "video");
  const clips = items.filter((row) => row.kind === "video");
  return {
    facts: [
      fact("items", "Items they added (this phone)", items.length),
      fact("photos", "Photos", photos.length),
      fact("clips", "Clips", clips.length),
      fact("pair", "Vault items on this phone", ctx.mini.sexyVault.length),
    ],
    events: items.map((row) =>
      event(row.id, row.createdAt, row.note?.trim() || (row.kind === "video" ? "Clip" : "Photo"), row.kind)
    ),
  };
}

function collectHow(ctx: Ctx): Bucket {
  const notes = ctx.mini.howNotes.filter((row) => row.status || row.note);
  return {
    facts: [
      fact("marked", "Techniques marked", notes.filter((row) => row.status).length),
      fact("keep", "Keep", notes.filter((row) => row.status === "keep").length),
      fact("want", "Want", notes.filter((row) => row.status === "want").length),
      fact("skip", "Skip", notes.filter((row) => row.status === "skip").length),
      fact("notes", "With a note", notes.filter((row) => row.note.trim()).length),
    ],
    events: notes.map((row) =>
      event(row.techniqueId, row.updatedAt, howName(row.techniqueId), `${row.status ?? "noted"}${row.note ? ` · ${clip(row.note, 80)}` : ""}`)
    ),
  };
}

function collectCoupons(ctx: Ctx): Bucket {
  const coupons = ctx.db.coupons.filter(
    (row) =>
      involved(row.coupleId, ctx.coupleIds) &&
      (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  return {
    facts: [
      fact("gave", "They gave", coupons.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("got", "They received", coupons.filter((row) => row.toUserId === ctx.profile.id).length),
      fact("used", "Redeemed", coupons.filter((row) => row.status === "redeemed" || row.redeemedAt).length),
    ],
    events: coupons.map((row) =>
      event(row.id, row.redeemedAt || row.createdAt, row.title, `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status}`)
    ),
  };
}

function collectTrivia(ctx: Ctx): Bucket {
  const sheets = ctx.mini.knowMeSheets.filter((row) => row.userId === ctx.profile.id);
  const guesses = ctx.mini.knowMeGuesses.filter((row) => row.guesserId === ctx.profile.id);
  const avg =
    guesses.length > 0
      ? Math.round((guesses.reduce((sum, row) => sum + row.score, 0) / guesses.length) * 10) / 10
      : 0;
  return {
    facts: [
      fact("packs", "Packs they answered", sheets.length),
      fact("guesses", "Guesses they made", guesses.length),
      fact("avg", "Average score", guesses.length ? `${avg}` : "—"),
      fact("best", "Best score", guesses.length ? Math.max(...guesses.map((row) => row.score)) : 0),
    ],
    events: [
      ...guesses.map((row) =>
        event(row.id, row.createdAt, knowMePackById(row.packId)?.title ?? row.packId, `guessed ${nameOf(ctx, row.ownerId)} · ${row.score}`)
      ),
      ...sheets.map((row) =>
        event(row.id, row.updatedAt || row.createdAt, knowMePackById(row.packId)?.title ?? row.packId, "answered their pack")
      ),
    ],
  };
}

function collectBets(ctx: Ctx): Bucket {
  const bets = ctx.mini.predictions.filter(
    (row) => row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id || row.createdBy === ctx.profile.id
  );
  return {
    facts: [
      fact("sent", "Slips they sent", bets.filter((row) => row.fromUserId === ctx.profile.id || row.createdBy === ctx.profile.id).length),
      fact("settled", "Settled", bets.filter((row) => row.status === "settled").length),
      fact("open", "Open", bets.filter((row) => row.status === "offered" || row.status === "accepted").length),
    ],
    events: bets.map((row) =>
      event(
        row.id,
        row.answeredAt || row.createdAt,
        row.statement || row.title,
        `${row.status} · stake: ${row.stake}${row.resolved ? ` · ${row.resolved}` : ""}`
      )
    ),
  };
}

function collectPhotos(ctx: Ctx): Bucket {
  const photos = ctx.mini.photos.filter((row) => row.userId === ctx.profile.id);
  return {
    facts: [
      fact("shots", "Shots they added (this phone)", photos.length),
      fact("pair", "Shots on this phone", ctx.mini.photos.length),
      fact("week", "Weekly prompt locked", ctx.mini.photoWeek ? "yes" : "no"),
    ],
    events: photos.map((row) =>
      event(row.id, row.createdAt, row.caption?.trim() || "Photo Memory", row.promptId || "photo")
    ),
  };
}

function collectWord(ctx: Ctx): Bucket {
  const days = ctx.mini.wordle?.days ?? [];
  const mine = days.flatMap((day) =>
    day.players
      .filter((player) => player.userId === ctx.profile.id)
      .map((player) => ({ day, player }))
  );
  const solved = mine.filter((row) => row.player.solvedAt);
  return {
    facts: [
      fact("played", "Days played", mine.length),
      fact("solved", "Solved", solved.length),
      fact("fail", "Burned out", mine.filter((row) => !row.player.solvedAt && row.player.guesses.length >= 6).length),
    ],
    events: mine.map((row) =>
      event(
        `${row.day.dateKey}-${ctx.profile.id}`,
        row.player.solvedAt || row.day.dateKey,
        row.day.dateKey,
        row.player.solvedAt
          ? `solved in ${row.player.guesses.length}`
          : `${row.player.guesses.length} guess${row.player.guesses.length === 1 ? "" : "es"}`
      )
    ),
  };
}

function collectChicken(ctx: Ctx): Bucket {
  const plays = ctx.db.chickenPlays.filter(
    (row) =>
      involved(row.coupleId, ctx.coupleIds) &&
      (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  return {
    facts: [
      fact("sent", "They sent", plays.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("got", "They received", plays.filter((row) => row.toUserId === ctx.profile.id).length),
      fact("done", "Finished", plays.filter((row) => row.status === "done" || row.completedAt).length),
    ],
    events: plays.map((row) =>
      event(row.id, row.completedAt || row.createdAt, clip(row.text), `${whoLine(ctx, row.fromUserId, row.toUserId)} · ${row.status}`)
    ),
  };
}

function collectDoodle(ctx: Ctx): Bucket {
  const history = ctx.mini.doodle?.history ?? [];
  const mine = history.filter(
    (row) => row.drawerId === ctx.profile.id || row.guesserId === ctx.profile.id
  );
  const done = mine.filter((row) => row.status === "revealed" || Boolean(row.guessedAt));
  return {
    facts: [
      fact("rounds", "Rounds they were in", mine.length),
      fact("drew", "They drew", mine.filter((row) => row.drawerId === ctx.profile.id).length),
      fact("guessed", "They guessed", mine.filter((row) => row.guesserId === ctx.profile.id).length),
      fact("done", "Finished", done.length),
    ],
    events: mine.map((row) =>
      event(
        row.id,
        row.guessedAt || row.createdAt,
        row.prompt || row.options.join(" / "),
        `${row.drawerId === ctx.profile.id ? "drew" : "guessed"} · ${row.status}${row.guess ? ` · guessed “${row.guess}”` : ""}`
      )
    ),
  };
}

function collectFair(ctx: Ctx): Bucket {
  const spins = ctx.mini.fairSpins.filter((row) => row.winnerId === ctx.profile.id);
  const lasts = ctx.mini.whoLast.filter((row) => row.userId === ctx.profile.id);
  const choreOf = (id: string) => ctx.mini.chores.find((row) => row.id === id)?.label ?? id;
  return {
    facts: [
      fact("spins", "Spins they won", spins.length),
      fact("all-spins", "Spins on this phone", ctx.mini.fairSpins.length),
      fact("last", "Who-last taps", lasts.length),
    ],
    events: [
      ...ctx.mini.fairSpins.map((row) =>
        event(row.id, row.createdAt, choreOf(row.choreId), `winner ${nameOf(ctx, row.winnerId)}`)
      ),
      ...lasts.map((row) => event(`${row.taskId}-${row.at}`, row.at, row.taskId, "tapped last")),
    ],
  };
}

function collectMeals(ctx: Ctx): Bucket {
  const notes = ctx.mini.mealPlan?.notes ?? [];
  const eaten = notes.filter((row) => row.eaten);
  const rounds = ctx.db.mealRounds.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const wants = ctx.db.mealWants.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.fromUserId === ctx.profile.id
  );
  return {
    facts: [
      fact("notes", "Meal-plan notes", notes.length),
      fact("eaten", "Marked eaten", eaten.length),
      fact("rounds", "Lucky-dip rounds", rounds.length),
      fact("agreed", "Agreed rounds", rounds.filter((row) => row.status === "agreed").length),
      fact("wants", "Wants they added", wants.length),
    ],
    events: [
      ...notes.map((row) =>
        event(row.id, null, row.title, `weekday ${row.weekday}${row.eaten ? " · eaten" : ""}${row.source ? ` · ${row.source}` : ""}`)
      ),
      ...rounds.map((row) =>
        event(row.id, row.createdAt, row.title, `${row.status} · spun by ${nameOf(ctx, row.spunBy)}`)
      ),
      ...wants.map((row) => event(row.id, row.createdAt, row.title, row.status)),
    ],
  };
}

function collectGifts(ctx: Ctx): Bucket {
  const people = ctx.mini.giftPeople;
  const items = ctx.mini.giftItems;
  const mine = items.filter((row) => {
    const person = people.find((item) => item.id === row.personId);
    return person?.ownerUserId === ctx.profile.id || person?.slot === "you";
  });
  return {
    facts: [
      fact("people", "People", people.length),
      fact("items", "Wish items", items.length),
      fact("theirs", "On their lists", mine.length),
    ],
    events: items.map((row) => {
      const person = people.find((item) => item.id === row.personId);
      return event(row.id, row.createdAt, row.title, `${person?.name ?? "someone"} · ${row.lane} · ${row.occasion}`);
    }),
  };
}

function collectCountdowns(ctx: Ctx): Bucket {
  const rows = ctx.db.milestones.filter((row) => involved(row.coupleId, ctx.coupleIds));
  return {
    facts: [
      fact("all", "Countdowns", rows.length),
      fact("they", "They added", rows.filter((row) => row.createdBy === ctx.profile.id).length),
    ],
    events: rows.map((row) =>
      event(row.id, row.createdAt, row.title, `${row.kind} · ${row.date}`)
    ),
  };
}

function collectErrands(ctx: Ctx): Bucket {
  const rows = ctx.db.errandItems.filter((row) => involved(row.coupleId, ctx.coupleIds));
  const mine = rows.filter((row) => row.createdBy === ctx.profile.id);
  const done = rows.filter((row) => row.doneAt);
  return {
    facts: [
      fact("open", "Still open", rows.filter((row) => !row.doneAt).length),
      fact("done", "Ticked off", done.length),
      fact("added", "They added", mine.length),
      fact("they-did", "They ticked", rows.filter((row) => row.doneBy === ctx.profile.id).length),
    ],
    events: rows.map((row) =>
      event(row.id, row.doneAt || row.createdAt, row.title, `${row.kind}${row.doneAt ? " · done" : " · open"}`)
    ),
  };
}

function collectBirthdays(ctx: Ctx): Bucket {
  const rows = ctx.mini.birthdays;
  return {
    facts: [
      fact("people", "Birthdays saved", rows.length),
      fact("groups", "Circles", ctx.mini.birthdayGroups.length),
    ],
    events: rows.map((row) =>
      event(row.id, row.createdAt, row.name, `${row.circle} · ${row.day}/${row.month}${row.year ? `/${row.year}` : ""}`)
    ),
  };
}

function collectMaint(ctx: Ctx): Bucket {
  const rows = ctx.mini.maintenance;
  const done = rows.filter((row) => row.lastDone);
  return {
    facts: [
      fact("jobs", "Jobs", rows.length),
      fact("done", "Ever ticked", done.length),
    ],
    events: rows.map((row) =>
      event(row.id, row.lastDone, row.label, row.lastDone ? `last done ${row.lastDone} · every ${row.everyDays}d` : `never · every ${row.everyDays}d`)
    ),
  };
}

function collectTravel(ctx: Ctx): Bucket {
  const trips = ctx.mini.trips;
  return {
    facts: [
      fact("trips", "Trips", trips.length),
      fact("days", "Days planned", trips.reduce((sum, row) => sum + row.days.length, 0)),
      fact("book", "Bookings", trips.reduce((sum, row) => sum + row.bookings.length, 0)),
    ],
    events: trips.map((row) =>
      event(row.id, row.createdAt, row.title, `${row.where} · ${row.start} → ${row.end} · ${row.days.length} days`)
    ),
  };
}

function collectGoals(ctx: Ctx): Bucket {
  const goals = ctx.mini.goals;
  return {
    facts: [
      fact("goals", "Goals", goals.length),
      fact("done", "Completed", goals.filter((row) => row.completedAt).length),
    ],
    events: goals.map((row) =>
      event(
        row.id,
        row.completedAt || row.createdAt,
        row.title,
        `${row.horizon} · $${row.saved}/$${row.target}${row.completedAt ? " · done" : ""}`
      )
    ),
  };
}

function collectBudget(ctx: Ctx): Bucket {
  const budget = ctx.mini.budget;
  const spend = budget.spends.reduce((sum, row) => sum + row.amount, 0);
  return {
    facts: [
      fact("pays", "Pay sources", budget.pays.length),
      fact("bills", "Bills", budget.bills.length),
      fact("spends", "Spends logged", budget.spends.length),
      fact("out", "Spend total", `$${Math.round(spend)}`),
    ],
    events: [
      ...budget.spends.map((row) =>
        event(row.id, row.date, row.name, `$${row.amount} · ${row.category} · ${row.who}`)
      ),
      ...budget.bills.map((row) =>
        event(row.id, row.dueOn, row.name, `$${row.amount} · ${row.cadence} · ${row.category}`)
      ),
    ],
  };
}

function collectEmergency(ctx: Ctx): Bucket {
  const filled = ctx.mini.vault.filter((row) => row.value.trim());
  return {
    facts: [
      fact("slots", "Slots", ctx.mini.vault.length),
      fact("filled", "Filled", filled.length),
    ],
    events: filled.map((row) => event(row.id, null, row.label, "has a value (hidden here)")),
  };
}

function collectPeriod(ctx: Ctx): Bucket {
  const period = ctx.mini.period;
  const last = [...period.cycles].sort((left, right) => right.start.localeCompare(left.start))[0];
  return {
    facts: [
      fact("cycles", "Cycles logged", period.cycles.length),
      fact("days", "Day logs", period.logs.length),
      fact("last", "Last start", last?.start ?? "—"),
    ],
    events: [
      ...period.cycles.map((row) =>
        event(row.id, row.start, `Cycle ${row.start}`, row.end ? `ended ${row.end}` : "open")
      ),
      ...period.logs.map((row) =>
        event(row.date, row.date, row.date, [row.flow, row.mood, row.note].filter(Boolean).join(" · ") || "logged")
      ),
    ],
  };
}

function collectCheckIn(ctx: Ctx): Bucket {
  const rows = ctx.db.checkIns.filter(
    (row) => involved(row.coupleId, ctx.coupleIds) && row.userId === ctx.profile.id
  );
  const asks = ctx.db.checkInRequests.filter(
    (row) =>
      involved(row.coupleId, ctx.coupleIds) &&
      (row.fromUserId === ctx.profile.id || row.toUserId === ctx.profile.id)
  );
  return {
    facts: [
      fact("logged", "Check-ins they logged", rows.length),
      fact("asks", "Nudges sent", asks.filter((row) => row.fromUserId === ctx.profile.id).length),
      fact("got", "Nudges received", asks.filter((row) => row.toUserId === ctx.profile.id).length),
    ],
    events: rows.map((row) =>
      event(
        row.id,
        row.createdAt,
        row.date,
        [
          row.mood,
          row.tonight ? `tonight ${row.tonight}` : null,
          row.todayNeed ? `need ${row.todayNeed}` : null,
          row.desireGauge ? `desire ${row.desireGauge}` : null,
          row.energy != null ? `energy ${row.energy}` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "logged"
      )
    ),
  };
}

function collectCalendar(ctx: Ctx): Bucket {
  const rows = ctx.db.calendarEvents.filter((row) => involved(row.coupleId, ctx.coupleIds));
  return {
    facts: [
      fact("notes", "Calendar notes", rows.length),
      fact("they", "They added", rows.filter((row) => row.createdBy === ctx.profile.id).length),
      fact("desire", "Desire nights", rows.filter((row) => row.source === "position" || row.source === "roleplay").length),
    ],
    events: rows.map((row) =>
      event(
        row.id,
        row.happenedAt || row.createdAt,
        row.title,
        `${row.date}${row.allDay ? " · all day" : ""}${row.source ? ` · ${row.source}` : ""}${row.notes ? ` · ${clip(row.notes, 60)}` : ""}`
      )
    ),
  };
}

function collectNotepad(ctx: Ctx): Bucket {
  const notes = ctx.mini.padNotes;
  const mine = notes.filter((row) => row.updatedBy === ctx.profile.id);
  return {
    facts: [
      fact("pages", "Pages", notes.length),
      fact("they", "Last edited by them", mine.length),
      fact("pinned", "Pinned", notes.filter((row) => row.pinned).length),
    ],
    events: notes.map((row) =>
      event(
        row.id,
        row.updatedAt || row.createdAt,
        row.title.trim() || "Untitled page",
        `${row.updatedBy === ctx.profile.id ? "they edited" : "partner edited"} · ${clip(row.body, 80) || "empty"}`
      )
    ),
  };
}

const COLLECTORS: Record<string, (ctx: Ctx) => Bucket> = {
  lists: collectLists,
  "date-night": collectDates,
  "thought-pings": collectPings,
  talk: collectTalk,
  "audio-vault": collectAudio,
  jar: collectJar,
  apology: collectApology,
  curiosity: collectCuriosity,
  spicy: collectSpicy,
  spark: collectSpark,
  "up-for-it": collectDares,
  roleplays: collectRoleplays,
  positions: collectPositions,
  "fantasy-matcher": collectFantasy,
  "intimacy-streak": collectStreak,
  "sexy-vault": collectVault,
  "the-how": collectHow,
  coupons: collectCoupons,
  trivia: collectTrivia,
  prediction: collectBets,
  "photo-challenges": collectPhotos,
  crossword: collectWord,
  chicken: collectChicken,
  doodle: collectDoodle,
  "fair-share": collectFair,
  "meal-plan": collectMeals,
  gifts: collectGifts,
  countdowns: collectCountdowns,
  todos: collectErrands,
  birthdays: collectBirthdays,
  maintenance: collectMaint,
  travel: collectTravel,
  goals: collectGoals,
  budget: collectBudget,
  "emergency-vault": collectEmergency,
  period: collectPeriod,
  "check-in": collectCheckIn,
  calendar: collectCalendar,
  notepad: collectNotepad,
};

function packApp(
  ctx: Ctx,
  hubId: HubId | "home",
  feature: { id: string; label: string; detail: string; icon: IconName; mark?: HubMark }
): AppInsight {
  const raw = COLLECTORS[feature.id]?.(ctx) ?? { facts: [], events: [] };
  const events = sortEvents(raw.events);
  const { first, last } = stamps(events);
  const seconds = ctx.profile.appSeconds?.[feature.id] ?? 0;
  const actionCount = events.length;
  const facts = [
    fact("time", "Time in this app", seconds ? formatActiveTime(seconds) : "not tracked yet"),
    fact("last", "Last activity", last ? formatWhen(last) : "—"),
    fact("first", "First activity", first ? formatWhen(first) : "—"),
    fact("rows", "Logged events", actionCount),
    ...raw.facts,
  ];
  return {
    id: feature.id,
    hubId,
    label: feature.label,
    detail: feature.detail,
    icon: feature.icon,
    mark: feature.mark,
    seconds,
    lastAt: last,
    firstAt: first,
    facts,
    events,
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
): HubInsight {
  const apps = hub.features.map((feature) => packApp(ctx, hub.id, feature));
  const seconds = apps.reduce((sum, app) => sum + app.seconds, 0);
  let lastAt: string | null = null;
  let eventCount = 0;
  for (const app of apps) {
    lastAt = later(lastAt, app.lastAt);
    eventCount += app.events.length;
  }
  return {
    id: hub.id,
    label: hub.label,
    tagline: hub.tagline,
    tile: hub.tile,
    tileInk: hub.tileInk,
    icon: hub.icon,
    seconds,
    lastAt,
    usedApps: apps.filter((app) => app.events.length > 0 || app.seconds > 0).length,
    totalApps: apps.length,
    eventCount,
    apps,
  };
}

export function buildPartnerDossier(input: {
  db: AppDB;
  mini?: MiniState | null;
  profile: Profile;
  couple: Couple | null;
  flags?: WhiteFlag[];
}): PartnerDossier {
  const coupleIds = new Set(
    input.db.couples
      .filter((row) => row.partnerA === input.profile.id || row.partnerB === input.profile.id)
      .map((row) => row.id)
  );
  if (input.couple) coupleIds.add(input.couple.id);
  const names = new Map<string, string>();
  for (const row of input.db.profiles) names.set(row.id, row.displayName);
  const ctx: Ctx = {
    db: input.db,
    mini: input.mini ?? emptyMiniState(),
    profile: input.profile,
    couple: input.couple,
    coupleIds,
    flags: input.flags ?? [],
    names,
  };
  const home = packHub(ctx, {
    id: "home",
    label: "Home screen",
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
  const usedApps = [home, ...hubs].reduce((sum, hub) => sum + hub.usedApps, 0);
  const totalApps = [home, ...hubs].reduce((sum, hub) => sum + hub.totalApps, 0);
  const lastEvent = [home, ...hubs].reduce<string | null>(
    (stamp, hub) => later(stamp, hub.lastAt),
    input.profile.lastSeenAt ?? null
  );
  return {
    profileId: input.profile.id,
    facts: [
      fact("login", "Last login", formatWhen(input.profile.lastSeenAt)),
      fact("time", "Time in the app", formatActiveTime(input.profile.activeSeconds)),
      fact("zone", "Timezone", input.profile.timezone || "—"),
      fact("joined", "Account created", formatWhen(input.profile.createdAt)),
      fact("pair", "Days as a pair", pairAgeDays(input.couple)),
      fact("gender", "Gender", input.profile.gender ?? "unset"),
      fact("mail", "Email", input.profile.email || "none"),
      fact("age", "18+", input.profile.over18At ? formatWhen(input.profile.over18At) : "no"),
      fact("privacy", "Privacy consent", input.profile.privacyConsentAt ? "yes" : "no"),
      fact("last", "Last activity", formatWhen(lastEvent)),
      fact("apps", "Apps with any use", `${usedApps} / ${totalApps}`),
    ],
    home,
    hubs,
  };
}
