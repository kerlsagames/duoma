import { supabase } from "@/lib/supabase";
import { mergeDoodleBoards } from "@/lib/doodle-game";
import { mergeWordleStates } from "@/lib/daily-word";
import { mergePhotoWeeks } from "@/lib/photo-challenge";
import { mergeMealPlans } from "@/lib/meal-plan";
import { mergeBudgets } from "@/lib/money";
import { mergePeriodStates } from "@/lib/period";
import { mergeSparkStates } from "@/lib/spark";
import { mergeWorldChoices } from "@/lib/worlds";
import { hydrateMiniState, type MiniState, type WhoLast } from "@/lib/mini-content";
import { hydrateDb } from "@/lib/storage";
import type { AppDB } from "@/lib/types";

type CoupleSlice = Omit<AppDB, "profiles" | "couples" | "pushSubscriptions">;

export type CloudState = {
  db: Partial<AppDB>;
  mini: MiniState;
  media: {
    vault: Record<string, string>;
    voice: Record<string, string>;
  };
  savedAt: string;
};

const COUPLE_ROW_KEYS = [
  "cards",
  "games",
  "ratings",
  "checkIns",
  "checkInRequests",
  "curiosityAnswers",
  "curiositySkips",
  "milestones",
  "desireToggles",
  "fantasySwipes",
  "fantasyTonightAsks",
  "fantasyCompletions",
  "coupons",
  "scratches",
  "coupleLists",
  "listEntries",
  "listEntryRatings",
  "jarNotes",
  "jarOpenVotes",
  "bucketItems",
  "ritualChecks",
  "dateNightAsks",
  "positionSaves",
  "playItemRatings",
  "talkDecks",
  "talkDraws",
  "talkVault",
  "spicyDares",
  "partnerPokes",
  "chickenPlays",
  "positionInvites",
  "roleplayInvites",
  "roleplaySaves",
  "dareSaves",
  "calendarEvents",
  "errandItems",
  "mealRounds",
  "mealWants",
  "customMeals",
  "hiddenMeals",
  "contentReports",
  "feedbackNotes",
] as const;

export function isCoupleUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function aliasCoupleIds(db: AppDB, coupleId: string): Set<string> {
  const ids = new Set<string>([coupleId]);
  const couple = db.couples.find((row) => row.id === coupleId);
  if (!couple) return ids;
  for (const row of db.couples) {
    if (row.id === coupleId) continue;
    if (couple.inviteCode && row.inviteCode === couple.inviteCode) ids.add(row.id);
    if (row.partnerA === couple.partnerA || (couple.partnerB && row.partnerB === couple.partnerB)) {
      ids.add(row.id);
    }
    if (row.partnerA === couple.partnerB || row.partnerB === couple.partnerA) ids.add(row.id);
  }
  return ids;
}

export function remapCoupleSlice(slice: Partial<AppDB>, toId: string): Partial<AppDB> {
  const next: Partial<AppDB> = { ...slice };
  for (const key of COUPLE_ROW_KEYS) {
    const rows = slice[key];
    if (!Array.isArray(rows)) continue;
    (next as Record<string, unknown>)[key] = rows.map((row) =>
      row && typeof row === "object" && "coupleId" in row
        ? { ...row, coupleId: toId }
        : row
    );
  }
  return next;
}

export function rewriteCoupleIds(db: AppDB, fromIds: string[], toId: string): AppDB {
  const from = new Set(fromIds.filter((id) => id && id !== toId));
  if (!from.size) return db;
  const next: AppDB = { ...db };
  for (const key of COUPLE_ROW_KEYS) {
    const rows = db[key] as { coupleId?: string }[];
    (next as unknown as Record<string, unknown>)[key] = rows.map((row) =>
      row.coupleId && from.has(row.coupleId) ? { ...row, coupleId: toId } : row
    );
  }
  return next;
}

function memberOwnsRow(row: object, members: Set<string>): boolean {
  const record = row as Record<string, unknown>;
  return ["userId", "fromUserId", "toUserId", "createdBy", "completedBy"].some(
    (key) => typeof record[key] === "string" && members.has(record[key] as string)
  );
}

function coupleMembers(db: AppDB, coupleId: string): Set<string> {
  const members = new Set<string>();
  for (const id of aliasCoupleIds(db, coupleId)) {
    const row = db.couples.find((item) => item.id === id);
    if (row?.partnerA) members.add(row.partnerA);
    if (row?.partnerB) members.add(row.partnerB);
  }
  return members;
}

/** Move this person's hub rows onto the cloud pair, even if they were tagged with a local id. */
export function adoptMemberRows(db: AppDB, userId: string, toId: string): AppDB {
  if (!userId || !toId) return db;
  const members = new Set<string>([userId, ...coupleMembers(db, toId)]);
  const next: AppDB = { ...db };
  for (const key of COUPLE_ROW_KEYS) {
    const rows = db[key] as { coupleId?: string }[];
    (next as unknown as Record<string, unknown>)[key] = rows.map((row) => {
      if (row.coupleId === toId) return row;
      if (!memberOwnsRow(row, members)) return row;
      if (row.coupleId && isCoupleUuid(row.coupleId) && !aliasCoupleIds(db, toId).has(row.coupleId)) {
        return row;
      }
      return { ...row, coupleId: toId };
    });
  }
  return next;
}

function stampOf(row: Record<string, unknown>): string {
  const keys = ["updatedAt", "completedAt", "answeredAt", "openedAt", "createdAt"];
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value) return value;
  }
  return "";
}

function mergeByKey<T>(
  local: T[],
  incoming: T[],
  keyOf: (row: T) => string,
  stamp: (row: T) => string
): T[] {
  const map = new Map<string, T>();
  for (const row of local) map.set(keyOf(row), row);
  for (const row of incoming) {
    const key = keyOf(row);
    if (!key) continue;
    const prev = map.get(key);
    if (!prev || stamp(row) >= stamp(prev)) map.set(key, row);
  }
  return [...map.values()];
}

function hasCoupleId(row: unknown): row is { coupleId: string; id?: string } {
  return Boolean(row) && typeof row === "object" && row !== null && "coupleId" in row;
}

function gameIdsForCouple(db: AppDB, coupleId: string): Set<string> {
  return new Set(db.games.filter((row) => row.coupleId === coupleId).map((row) => row.id));
}

export function sliceCoupleDb(db: AppDB, coupleId: string): CoupleSlice {
  const aliases = aliasCoupleIds(db, coupleId);
  const members = coupleMembers(db, coupleId);
  const keep = (row: unknown) => {
    if (!hasCoupleId(row)) return false;
    if (aliases.has(row.coupleId)) return true;
    if (!isCoupleUuid(row.coupleId) && memberOwnsRow(row, members)) return true;
    return false;
  };
  const games = db.games.filter(keep).map((row) => ({ ...row, coupleId }));
  const gameIds = new Set(games.map((row) => row.id));
  const byCouple = <T>(rows: T[]) =>
    rows.filter((row) => keep(row)).map((row) => ({ ...row, coupleId }));
  return {
    cards: byCouple(db.cards),
    games,
    gamePlayers: db.gamePlayers.filter((row) => gameIds.has(row.gameId)),
    deck: db.deck.filter((row) => gameIds.has(row.gameId)),
    ratings: byCouple(db.ratings),
    checkIns: byCouple(db.checkIns),
    checkInRequests: byCouple(db.checkInRequests),
    curiosityAnswers: byCouple(db.curiosityAnswers),
    curiositySkips: byCouple(db.curiositySkips),
    milestones: byCouple(db.milestones),
    desireToggles: byCouple(db.desireToggles),
    fantasySwipes: byCouple(db.fantasySwipes),
    fantasyTonightAsks: byCouple(db.fantasyTonightAsks),
    fantasyCompletions: byCouple(db.fantasyCompletions),
    coupons: byCouple(db.coupons),
    scratches: byCouple(db.scratches),
    coupleLists: byCouple(db.coupleLists),
    listEntries: byCouple(db.listEntries),
    listEntryRatings: byCouple(db.listEntryRatings),
    jarNotes: byCouple(db.jarNotes),
    jarOpenVotes: byCouple(db.jarOpenVotes),
    bucketItems: byCouple(db.bucketItems),
    ritualChecks: byCouple(db.ritualChecks),
    dateNightAsks: byCouple(db.dateNightAsks),
    positionSaves: byCouple(db.positionSaves),
    playItemRatings: byCouple(db.playItemRatings),
    talkDecks: byCouple(db.talkDecks),
    talkDraws: byCouple(db.talkDraws),
    talkVault: byCouple(db.talkVault),
    spicyDares: byCouple(db.spicyDares),
    partnerPokes: byCouple(db.partnerPokes),
    chickenPlays: byCouple(db.chickenPlays),
    positionInvites: byCouple(db.positionInvites),
    roleplayInvites: byCouple(db.roleplayInvites),
    roleplaySaves: byCouple(db.roleplaySaves),
    dareSaves: byCouple(db.dareSaves),
    calendarEvents: byCouple(db.calendarEvents),
    errandItems: byCouple(db.errandItems),
    mealRounds: byCouple(db.mealRounds),
    mealWants: byCouple(db.mealWants),
    customMeals: byCouple(db.customMeals),
    hiddenMeals: byCouple(db.hiddenMeals),
    contentReports: byCouple(db.contentReports),
    feedbackNotes: byCouple(db.feedbackNotes),
  };
}

function mergeIdRows<T extends { id: string }>(local: T[], incoming: T[]): T[] {
  return mergeByKey(local, incoming, (row) => row.id, (row) => stampOf(row as unknown as Record<string, unknown>));
}

export function mergeCoupleDb(db: AppDB, coupleId: string, slice: Partial<AppDB>): AppDB {
  const incoming = hydrateDb({
    ...db,
    ...slice,
    profiles: db.profiles,
    couples: db.couples,
    pushSubscriptions: db.pushSubscriptions,
  });
  const localGames = gameIdsForCouple(db, coupleId);
  const remoteGames = gameIdsForCouple(incoming, coupleId);
  const allGameIds = new Set([...localGames, ...remoteGames]);
  const keepOther = <T>(rows: T[], mine: (row: T) => boolean) => rows.filter((row) => !mine(row));
  const coupleMine = <T>(row: T) => hasCoupleId(row) && row.coupleId === coupleId;

  const next: AppDB = { ...db };
  next.cards = [
    ...keepOther(db.cards, coupleMine),
    ...mergeIdRows(db.cards.filter(coupleMine), incoming.cards.filter(coupleMine)),
  ];
  next.games = [
    ...keepOther(db.games, coupleMine),
    ...mergeIdRows(db.games.filter(coupleMine), incoming.games.filter(coupleMine)),
  ];
  next.gamePlayers = [
    ...db.gamePlayers.filter((row) => !allGameIds.has(row.gameId)),
    ...mergeByKey(
      db.gamePlayers.filter((row) => allGameIds.has(row.gameId)),
      incoming.gamePlayers.filter((row) => allGameIds.has(row.gameId)),
      (row) => `${row.gameId}:${row.userId}`,
      () => ""
    ),
  ];
  next.deck = [
    ...db.deck.filter((row) => !allGameIds.has(row.gameId)),
    ...mergeIdRows(
      db.deck.filter((row) => allGameIds.has(row.gameId)),
      incoming.deck.filter((row) => allGameIds.has(row.gameId))
    ),
  ];

  const keys = [
    "ratings",
    "checkIns",
    "checkInRequests",
    "curiosityAnswers",
    "curiositySkips",
    "milestones",
    "desireToggles",
    "fantasySwipes",
    "fantasyTonightAsks",
    "fantasyCompletions",
    "coupons",
    "scratches",
    "coupleLists",
    "listEntries",
    "listEntryRatings",
    "jarNotes",
    "jarOpenVotes",
    "bucketItems",
    "ritualChecks",
    "dateNightAsks",
    "positionSaves",
    "playItemRatings",
    "talkDecks",
    "talkDraws",
    "talkVault",
    "spicyDares",
    "partnerPokes",
    "chickenPlays",
    "positionInvites",
    "roleplayInvites",
    "roleplaySaves",
    "dareSaves",
    "calendarEvents",
    "errandItems",
    "mealRounds",
    "mealWants",
    "customMeals",
    "hiddenMeals",
    "contentReports",
    "feedbackNotes",
  ] as const;

  for (const key of keys) {
    const localRows = (db[key] as { id?: string; coupleId?: string }[]).filter(
      (row) => row.coupleId === coupleId
    );
    const remoteRows = (incoming[key] as { id?: string; coupleId?: string }[]).filter(
      (row) => row.coupleId === coupleId
    );
    const others = (db[key] as { coupleId?: string }[]).filter((row) => row.coupleId !== coupleId);
    (next as unknown as Record<string, unknown>)[key] = [
      ...others,
      ...mergeByKey(
        localRows,
        remoteRows,
        (row) => (typeof row.id === "string" ? row.id : JSON.stringify(row)),
        (row) => stampOf(row as Record<string, unknown>)
      ),
    ];
  }
  return next;
}

/** Lists and games may go to the couple backup. Pics, clips, and voice stay on the phone. */
function sanitizeMiniForCloud(mini: MiniState): MiniState {
  return hydrateMiniState({
    ...mini,
    sexyVault: [],
    audioNotes: [],
    photos: [],
  });
}

export function mergeMiniStates(local: MiniState, remote: MiniState): MiniState {
  const next = hydrateMiniState({ ...local, ...remote });
  const localRecord = local as unknown as Record<string, unknown>;
  const remoteRecord = remote as unknown as Record<string, unknown>;
  const arrayKeys = new Set([
    ...Object.keys(local).filter((key) => Array.isArray(localRecord[key])),
    ...Object.keys(remote).filter((key) => Array.isArray(remoteRecord[key])),
  ]);
  const keepOnPhone = new Set(["sexyVault", "audioNotes", "photos"]);
  for (const key of arrayKeys) {
    if (keepOnPhone.has(key)) continue;
    const localRows = (localRecord[key] as unknown[]) ?? [];
    const remoteRows = (remoteRecord[key] as unknown[]) ?? [];
    if (localRows.every((row) => typeof row === "string") && remoteRows.every((row) => typeof row === "string")) {
      (next as unknown as Record<string, unknown>)[key] = [
        ...new Set([...(localRows as string[]), ...(remoteRows as string[])]),
      ];
      continue;
    }
    (next as unknown as Record<string, unknown>)[key] = mergeByKey(
      localRows as { id?: string }[],
      remoteRows as { id?: string }[],
      (row) => (typeof row?.id === "string" ? row.id : JSON.stringify(row)),
      (row) => stampOf(row as Record<string, unknown>)
    );
  }
  const kept = hydrateMiniState(next);
  kept.wordle = mergeWordleStates(local.wordle, remote.wordle);
  kept.doodle = mergeDoodleBoards(local.doodle, remote.doodle);
  kept.photoWeek = mergePhotoWeeks(local.photoWeek, remote.photoWeek);
  kept.spark = mergeSparkStates(local.spark, remote.spark);
  kept.mealPlan = mergeMealPlans(local.mealPlan, remote.mealPlan);
  kept.budget = mergeBudgets(local.budget, remote.budget);
  kept.period = mergePeriodStates(local.period, remote.period);
  kept.worldChoice = mergeWorldChoices(local.worldChoice, remote.worldChoice);
  kept.whoLast = mergeWhoLast(local.whoLast, remote.whoLast);
  kept.sexyVault = local.sexyVault;
  kept.sexyVaultPin = local.sexyVaultPin || remote.sexyVaultPin;
  kept.audioNotes = local.audioNotes;
  kept.photos = local.photos;
  kept.photoPrefs = local.photoPrefs;
  kept.maintPrefs = local.maintPrefs;
  return kept;
}

function mergeWhoLast(local: WhoLast[], remote: WhoLast[]): WhoLast[] {
  return mergeByKey(
    local,
    remote,
    (row) => row.taskId || JSON.stringify(row),
    (row) => row.at || ""
  );
}

let restoring = false;
let pushing = false;
let lastPushedAt = "";
let timer: ReturnType<typeof setTimeout> | null = null;
let queued: { coupleId: string; db: AppDB } | null = null;

export function scheduleCoupleBackup(coupleId: string, db: AppDB) {
  if (!coupleId || !supabase) return;
  queued = { coupleId, db };
  if (pushing || restoring) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const job = queued;
    queued = null;
    timer = null;
    if (job) void pushCoupleState(job.coupleId, job.db);
  }, 400);
}

/** Push the queued backup now so a lock-screen ping is not faster than the coupon. */
export async function flushCoupleBackup(): Promise<void> {
  if (restoring) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const job = queued;
  if (!job) return;
  if (pushing) return;
  queued = null;
  await pushCoupleState(job.coupleId, job.db);
}

export function subscribeCoupleState(
  coupleId: string,
  onChange: () => void
): () => void {
  if (!supabase || !coupleId) return () => undefined;
  const channel = supabase
    .channel(`duoma-state-${coupleId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "couple_state",
        filter: `couple_id=eq.${coupleId}`,
      },
      () => onChange()
    )
    .subscribe();
  return () => {
    void supabase?.removeChannel(channel);
  };
}

async function pullLiveCoupleState(coupleId: string): Promise<CloudState | null> {
  if (!supabase || !coupleId) return null;
  try {
    const query = supabase
      .from("couple_state")
      .select("payload")
      .eq("couple_id", coupleId)
      .maybeSingle();
    const raced = await Promise.race([
      query,
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 8000)
      ),
    ]);
    if (raced.error || !raced.data?.payload) return null;
    const raw = raced.data.payload as CloudState;
    if (!raw || typeof raw !== "object") return null;
    return {
      db: raw.db ?? {},
      mini: hydrateMiniState(raw.mini),
      media: raw.media ?? { vault: {}, voice: {} },
      savedAt: raw.savedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function cloudPlayEqual(a: CloudState, b: CloudState): boolean {
  try {
    return JSON.stringify({ db: a.db, mini: a.mini }) === JSON.stringify({ db: b.db, mini: b.mini });
  } catch {
    return false;
  }
}

function miniCloudEqual(local: MiniState, remote: MiniState): boolean {
  try {
    return (
      JSON.stringify(sanitizeMiniForCloud(local)) ===
      JSON.stringify(sanitizeMiniForCloud(remote))
    );
  } catch {
    return false;
  }
}

export async function pushCoupleState(coupleId: string, db: AppDB): Promise<void> {
  if (!supabase || !coupleId || !isCoupleUuid(coupleId)) return;
  if (restoring || pushing) {
    queued = { coupleId, db };
    return;
  }
  pushing = true;
  try {
    const { loadMiniState, patchMini } = await import("@/lib/mini-apps");
    const localMini = await loadMiniState();
    const remote = await pullLiveCoupleState(coupleId);
    let mini = localMini;
    let working = db;
    if (remote) {
      mini = mergeMiniStates(localMini, sanitizeMiniForCloud(remote.mini));
      working = mergeCoupleDb(db, coupleId, remote.db);
      restoring = true;
      try {
        if (!miniCloudEqual(localMini, mini)) {
          await patchMini(() => mini);
        }
      } finally {
        restoring = false;
      }
    }
    const payload: CloudState = {
      db: sliceCoupleDb(working, coupleId),
      mini: sanitizeMiniForCloud(mini),
      media: { vault: {}, voice: {} },
      savedAt: new Date().toISOString(),
    };
    if (remote && cloudPlayEqual(payload, remote)) return;
    lastPushedAt = payload.savedAt;
    const row = {
      couple_id: coupleId,
      payload,
      updated_at: payload.savedAt,
    };
    const { error } = await supabase.from("couple_state").upsert(row);
    if (error) {
      const signed = await supabase.rpc("save_couple_state", {
        p_couple_id: coupleId,
        p_payload: payload,
      });
      if (signed.error) {
        const { adminSaveCoupleState } = await import("@/lib/admin-snapshot");
        await adminSaveCoupleState(coupleId, payload);
      }
    }
  } catch {
    // Table missing or offline — local play still works.
  } finally {
    pushing = false;
    const next = queued;
    queued = null;
    if (next && !restoring) void pushCoupleState(next.coupleId, next.db);
  }
}

export async function pullCoupleState(coupleId: string): Promise<CloudState | null> {
  return pullLiveCoupleState(coupleId);
}

export async function absorbCoupleState(coupleId: string, db: AppDB): Promise<AppDB> {
  const remote = await pullCoupleState(coupleId);
  if (!remote) return db;
  restoring = true;
  try {
    const merged = mergeCoupleDb(db, coupleId, remote.db);
    const { loadMiniState, patchMini } = await import("@/lib/mini-apps");
    const localMini = await loadMiniState();
    const nextMini = mergeMiniStates(localMini, sanitizeMiniForCloud(remote.mini));
    if (!miniCloudEqual(localMini, nextMini)) {
      await patchMini(() => nextMini);
    }
    return merged;
  } catch {
    return mergeCoupleDb(db, coupleId, remote.db);
  } finally {
    restoring = false;
  }
}

export async function scheduleFromMini(coupleId: string | null) {
  if (!coupleId || restoring) return;
  const { readDb } = await import("@/lib/storage");
  const db = await readDb();
  scheduleCoupleBackup(coupleId, db);
}
