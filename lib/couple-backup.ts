import { supabase } from "@/lib/supabase";
import { hydrateMiniState, type MiniState } from "@/lib/mini-content";
import { hydrateDb } from "@/lib/storage";
import type { AppDB } from "@/lib/types";

type CoupleSlice = Omit<AppDB, "profiles" | "couples" | "pushSubscriptions">;

type CloudState = {
  db: Partial<AppDB>;
  mini: MiniState;
  media: {
    vault: Record<string, string>;
    voice: Record<string, string>;
  };
  savedAt: string;
};

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
  const games = db.games.filter((row) => row.coupleId === coupleId);
  const gameIds = new Set(games.map((row) => row.id));
  const byCouple = <T>(rows: T[]) =>
    rows.filter((row) => hasCoupleId(row) && row.coupleId === coupleId);
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
    sexyVaultPin: "",
    audioNotes: [],
    photos: [],
  });
}

function mergeMini(local: MiniState, remote: MiniState): MiniState {
  const next = hydrateMiniState({ ...local, ...remote });
  const arrayKeys = Object.keys(local).filter((key) => Array.isArray((local as unknown as Record<string, unknown>)[key]));
  const keepOnPhone = new Set(["sexyVault", "audioNotes", "photos"]);
  for (const key of arrayKeys) {
    if (keepOnPhone.has(key)) continue;
    const localRows = (local as unknown as Record<string, unknown[]>)[key] ?? [];
    const remoteRows = (remote as unknown as Record<string, unknown[]>)[key] ?? [];
    if (localRows.every((row) => typeof row === "string")) {
      (next as unknown as Record<string, unknown>)[key] = [
        ...new Set([...(localRows as unknown as string[]), ...(remoteRows as unknown as string[])]),
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
  kept.sexyVault = local.sexyVault;
  kept.sexyVaultPin = local.sexyVaultPin;
  kept.audioNotes = local.audioNotes;
  kept.photos = local.photos;
  return kept;
}

let restoring = false;
let lastPushedAt = "";
let timer: ReturnType<typeof setTimeout> | null = null;
let queued: { coupleId: string; db: AppDB } | null = null;

export function scheduleCoupleBackup(coupleId: string, db: AppDB) {
  if (!coupleId || !supabase) return;
  queued = { coupleId, db };
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const job = queued;
    queued = null;
    timer = null;
    if (job) void pushCoupleState(job.coupleId, job.db);
  }, 1600);
}

export async function pushCoupleState(coupleId: string, db: AppDB): Promise<void> {
  if (!supabase || !coupleId || restoring) return;
  try {
    const { loadMiniState } = await import("@/lib/mini-apps");
    const mini = sanitizeMiniForCloud(await loadMiniState());
    const payload: CloudState = {
      db: sliceCoupleDb(db, coupleId),
      mini,
      media: { vault: {}, voice: {} },
      savedAt: new Date().toISOString(),
    };
    lastPushedAt = payload.savedAt;
    await supabase.from("couple_state").upsert({
      couple_id: coupleId,
      payload,
      updated_at: payload.savedAt,
    });
  } catch {
    // Table missing or offline — local play still works.
  }
}

export async function pullCoupleState(coupleId: string): Promise<CloudState | null> {
  if (!supabase || !coupleId) return null;
  try {
    const { data, error } = await supabase
      .from("couple_state")
      .select("payload")
      .eq("couple_id", coupleId)
      .maybeSingle();
    if (error || !data?.payload) return null;
    const raw = data.payload as CloudState;
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

export async function absorbCoupleState(coupleId: string, db: AppDB): Promise<AppDB> {
  const remote = await pullCoupleState(coupleId);
  if (!remote) return db;
  restoring = true;
  try {
    const merged = mergeCoupleDb(db, coupleId, remote.db);
    const { loadMiniState, patchMini } = await import("@/lib/mini-apps");
    const localMini = await loadMiniState();
    const nextMini = mergeMini(localMini, sanitizeMiniForCloud(remote.mini));
    await patchMini(() => nextMini);
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
