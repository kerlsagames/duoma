import { cloneDefaultDeck, GET_SPICY_SEEDS } from "@/games/get-spicy";
import {
  buildRandomDeck,
  DEFAULT_STAGE_COUNTS,
  normalizeStageCounts,
  replacementCard,
  STAGE_ORDER,
} from "@/games/get-spicy/engine";
import {
  cardAllowedByFlavorTags,
  defaultEnabledFlavorTags,
  normalizeFlavorTags,
} from "@/games/get-spicy/flavor-tags";
import { createId, createInviteCode, nowIso } from "@/lib/ids";
import { localDateKey } from "@/lib/dates";
import {
  ALL_DESIRE_OPTIONS,
  hashPick,
  SCRATCH_POOLS,
} from "@/lib/hub";
import {
  curiositySynergy,
  dailyCuriosityQuestion,
  isCuriosityComplete,
} from "@/lib/curiosity";
import { notifyUser, upsertCloudSubscription } from "@/lib/notify";
import {
  registerDuomaWorker,
  sendPushToSubscriptions,
  subscribeToPush,
} from "@/lib/push";
import {
  emptyDb,
  readDb,
  readLastUserId,
  readSessionUserId,
  writeDb,
  writeLastUserId,
  writeSessionUserId,
} from "@/lib/storage";
import type {
  AppDB,
  BucketItem,
  BucketKind,
  Card,
  CardRating,
  CardStage,
  CheckIn,
  CheckInMetricKey,
  CheckInRequest,
  Coupon,
  Couple,
  CuriosityAnswer,
  DeckCard,
  DesireToggle,
  DesireGauge,
  TonightSex,
  GameMode,
  GameSession,
  JarNote,
  Milestone,
  MilestoneKind,
  MoodWeather,
  Profile,
  PushSubscriptionRow,
  ScratchKind,
  ScratchReveal,
  SocialBattery,
  StageCounts,
  TodayNeed,
  TalkDeckState,
  TalkDraw,
  TalkReaction,
  DareDirection,
  DareTimeframe,
  SpicyDarePlay,
} from "@/lib/types";
import {
  categoryById,
  ensureDeck,
  nextQuestionId,
  rotatePlayed,
  todaysDraw,
} from "@/lib/talk";
import {
  SPICY_DARE_DECK_ID,
  dareById,
  dueAtForTimeframe,
  isSpicyDareDeck,
} from "@/lib/spicy-dares";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CHANNEL_NAME = "duoma-realtime";

let db: AppDB = emptyDb();
let sessionUserId: string | null = null;
let lastUserId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function persist() {
  await writeDb(db);
  emit();
  if (typeof BroadcastChannel !== "undefined") {
    new BroadcastChannel(CHANNEL_NAME).postMessage({ at: Date.now() });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function uniqueInviteCode(): string {
  const existing = new Set(db.couples.map((couple) => couple.inviteCode));
  let code = createInviteCode();
  while (existing.has(code)) code = createInviteCode();
  return code;
}

function seedKey(stage: string, title: string, body: string) {
  return `${stage}::${title}::${body}`;
}

function referencedCardIds(): Set<string> {
  return new Set([
    ...db.deck.map((item) => item.cardId),
    ...db.ratings.map((item) => item.cardId),
  ]);
}

function syncDefaultCards(): boolean {
  let changed = false;
  const usedIds = referencedCardIds();
  const seedByTitle = new Map(GET_SPICY_SEEDS.map((seed) => [seed.title, seed]));
  const seedTitles = new Set(seedByTitle.keys());

  for (const couple of db.couples) {
    const defaults = db.cards.filter(
      (card) => card.coupleId === couple.id && card.isDefault
    );
    const byTitle = new Map(defaults.map((card) => [card.title, card]));

    db = {
      ...db,
      cards: db.cards.map((card) => {
        if (card.coupleId !== couple.id || !card.isDefault) return card;
        const seed = seedByTitle.get(card.title);
        if (!seed) return card;
        if (
          card.stage !== seed.category ||
          card.body !== seed.description ||
          card.sortOrder !== seed.order
        ) {
          changed = true;
          return {
            ...card,
            stage: seed.category,
            body: seed.description,
            sortOrder: seed.order,
          };
        }
        return card;
      }),
    };

    const missing = GET_SPICY_SEEDS.filter((seed) => !byTitle.has(seed.title));
    if (missing.length) {
      changed = true;
      db = {
        ...db,
        cards: [
          ...db.cards,
          ...missing.map((seed) => ({
            id: createId(),
            coupleId: couple.id,
            stage: seed.category,
            title: seed.title,
            body: seed.description,
            isDefault: true,
            isActive: true,
            sortOrder: seed.order,
            createdBy: couple.partnerA,
            createdAt: nowIso(),
          })),
        ],
      };
    }

    const stale = db.cards.filter(
      (card) =>
        card.coupleId === couple.id &&
        card.isDefault &&
        !seedTitles.has(card.title) &&
        !usedIds.has(card.id)
    );
    if (stale.length) {
      changed = true;
      const staleIds = new Set(stale.map((card) => card.id));
      db = {
        ...db,
        cards: db.cards.filter((card) => !staleIds.has(card.id)),
      };
    }
  }

  // Drop exact-duplicate default keys created by older syncs
  for (const couple of db.couples) {
    const seen = new Set<string>();
    const drop = new Set<string>();
    for (const card of db.cards) {
      if (card.coupleId !== couple.id || !card.isDefault) continue;
      const key = seedKey(card.stage, card.title, card.body);
      if (seen.has(key) && !usedIds.has(card.id)) drop.add(card.id);
      else seen.add(key);
    }
    if (drop.size) {
      changed = true;
      db = {
        ...db,
        cards: db.cards.filter((card) => !drop.has(card.id)),
      };
    }
  }

  return changed;
}

function coupleForUser(userId: string | null): Couple | null {
  if (!userId) return null;
  return (
    db.couples.find(
      (couple) => couple.partnerA === userId || couple.partnerB === userId
    ) ?? null
  );
}

function otherUserId(couple: Couple, userId: string): string | null {
  if (couple.partnerA === userId) return couple.partnerB;
  if (couple.partnerB === userId) return couple.partnerA;
  return null;
}

function upsertRitual(
  coupleId: string,
  userId: string,
  ritualId: string,
  date: string
) {
  const exists = db.ritualChecks.some(
    (row) =>
      row.coupleId === coupleId &&
      row.ritualId === ritualId &&
      row.date === date &&
      row.userId === userId
  );
  if (exists) return db.ritualChecks;
  return [
    ...db.ritualChecks,
    {
      id: createId(),
      coupleId,
      ritualId,
      date,
      userId,
      createdAt: nowIso(),
    },
  ];
}

function activeGameForCouple(coupleId: string | null): GameSession | null {
  if (!coupleId) return null;
  return (
    [...db.games]
      .reverse()
      .find(
        (game) =>
          game.coupleId === coupleId &&
          !["cancelled", "declined", "completed"].includes(game.status)
      ) ?? null
  );
}

function profileName(userId: string | null | undefined): string {
  if (!userId) return "Partner";
  return db.profiles.find((profile) => profile.id === userId)?.displayName ?? "Partner";
}

function pingPartner(
  couple: Couple | null | undefined,
  user: Profile | null | undefined,
  partner: Profile | null | undefined,
  payload: { title: string; body: string; url: string }
) {
  if (!couple || !user || partner?.isDemo) return;
  const target = otherUserId(couple, user.id);
  void notifyUser(target, db.pushSubscriptions, payload);
}

type CreateAccountInput = { displayName: string };
type JoinInput = { displayName: string; code: string };

export type BestCard = {
  card: Card;
  average: number;
  votes: number;
};

type AppContextValue = {
  ready: boolean;
  usingCloud: boolean;
  user: Profile | null;
  partner: Profile | null;
  couple: Couple | null;
  cards: Card[];
  game: GameSession | null;
  deck: DeckCard[];
  ratings: CardRating[];
  myBlocksRemaining: number;
  partnerBlocksRemaining: number;
  incomingInvite: GameSession | null;
  savedPair: {
    user: Profile;
    partner: Profile | null;
    couple: Couple;
  } | null;
  nights: GameSession[];
  bestCards: BestCard[];
  checkIns: CheckIn[];
  checkInRequests: CheckInRequest[];
  incomingCheckInRequest: CheckInRequest | null;
  curiosityAnswers: CuriosityAnswer[];
  curiosityMatchScore: {
    matchScore: number;
    daysPlayed: number;
    matchRate: number;
  };
  milestones: Milestone[];
  desireToggles: DesireToggle[];
  coupons: Coupon[];
  scratches: ScratchReveal[];
  jarNotes: JarNote[];
  bucketItems: BucketItem[];
  ritualChecks: AppDB["ritualChecks"];
  jarOpenVotes: AppDB["jarOpenVotes"];
  pushSubscriptions: PushSubscriptionRow[];
  talkDecks: TalkDeckState[];
  talkDraws: TalkDraw[];
  spicyDares: SpicyDarePlay[];
  createAccount: (input: CreateAccountInput) => Promise<void>;
  joinWithCode: (input: JoinInput) => Promise<void>;
  continueAsSaved: () => Promise<void>;
  addDemoPartner: (name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendSpicyInvite: () => Promise<void>;
  acceptInvite: () => Promise<void>;
  declineInvite: () => Promise<void>;
  configureGame: (input: {
    mode: GameMode;
    blockLimit: number;
    stageCounts: StageCounts;
    flavorTags: string[];
  }) => Promise<void>;
  toggleDeckPick: (cardId: string) => Promise<void>;
  fillPicksRandomly: () => Promise<void>;
  lockInPicks: () => Promise<void>;
  playCard: () => Promise<void>;
  blockCard: () => Promise<void>;
  unlockPrivate: () => Promise<void>;
  rateCard: (cardId: string, stars: number) => Promise<void>;
  finishRatings: () => Promise<void>;
  endGame: () => Promise<void>;
  toggleCardActive: (cardId: string) => Promise<void>;
  addCustomCard: (input: {
    stage: CardStage;
    title: string;
    body: string;
  }) => Promise<void>;
  submitCheckIn: (input: {
    energy: number | null;
    mood: MoodWeather | null;
    loveTank: number | null;
    socialBattery: SocialBattery | null;
    todayNeed: TodayNeed | null;
    desireGauge: DesireGauge | null;
    tonight: TonightSex | null;
  }) => Promise<void>;
  requestCheckIn: (metrics: CheckInMetricKey[]) => Promise<void>;
  submitCuriosity: (input: {
    answerIndex: number;
    guessIndex: number;
  }) => Promise<void>;
  drawTalkQuestion: (categoryId: string) => Promise<TalkDraw>;
  submitTalkAnswer: (input: {
    categoryId: string;
    body: string;
    reaction: TalkReaction | null;
  }) => Promise<void>;
  sendSpicyDare: (input: {
    dareId: string | null;
    text: string;
    categories?: string[];
    direction: DareDirection;
    timeframe: DareTimeframe;
    customWhen?: string | null;
  }) => Promise<void>;
  respondSpicyDare: (id: string, status: "accepted" | "declined") => Promise<void>;
  completeSpicyDare: (id: string) => Promise<void>;
  addMilestone: (input: {
    title: string;
    kind: MilestoneKind;
    date: string;
  }) => Promise<void>;
  removeMilestone: (id: string) => Promise<void>;
  toggleDesire: (optionId: string) => Promise<void>;
  createCoupon: (input: {
    title: string;
    body?: string;
    reason?: string | null;
    categoryId?: string | null;
    ideaId?: string | null;
    useOption?: string | null;
    expiresAt?: string | null;
  }) => Promise<void>;
  acceptCoupon: (id: string) => Promise<void>;
  redeemCoupon: (id: string) => Promise<void>;
  scratchCard: (kind: ScratchKind) => Promise<ScratchReveal | null>;
  addJarNote: (input: {
    body: string;
    openOption?: string | null;
    openAt?: string | null;
  }) => Promise<void>;
  voteOpenJar: () => Promise<void>;
  addBucketItem: (input: {
    title: string;
    kind: BucketKind;
    notes?: string;
    scheduledOn?: string | null;
  }) => Promise<void>;
  spinDateNight: () => Promise<BucketItem | null>;
  markBucketDone: (id: string) => Promise<void>;
  toggleRitual: (ritualId: string) => Promise<void>;
  enablePush: () => Promise<void>;
  sendTestPush: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function sessionFields(game: GameSession, extra: Partial<GameSession>): GameSession {
  const next: GameSession = {
    ...game,
    ...extra,
    updatedAt: nowIso(),
  };
  if (
    (next.status === "rating" || next.status === "completed") &&
    !next.playedDate
  ) {
    next.playedDate = localDateKey();
  }
  return next;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    const unsub = subscribe(bump);
    let channel: BroadcastChannel | null = null;

    (async () => {
      db = await readDb();
      sessionUserId = await readSessionUserId();
      lastUserId = await readLastUserId();
      if (syncDefaultCards()) {
        await persist();
      } else {
        bump();
      }
      setReady(true);
    })();

    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = async () => {
        db = await readDb();
        bump();
      };
    }

    const onStorage = async (event: StorageEvent) => {
      if (event.key !== "duoma:db") return;
      db = await readDb();
      bump();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      void registerDuomaWorker();
    }

    return () => {
      unsub();
      channel?.close();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [bump]);

  const user = useMemo(
    () => db.profiles.find((profile) => profile.id === sessionUserId) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const couple = useMemo(() => coupleForUser(sessionUserId), [version]);
  const partner = useMemo(() => {
    if (!couple || !user) return null;
    const partnerId = otherUserId(couple, user.id);
    return db.profiles.find((profile) => profile.id === partnerId) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  const cards = useMemo(
    () =>
      db.cards
        .filter((card) => card.coupleId === couple?.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const game = useMemo(
    () => activeGameForCouple(couple?.id ?? null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const deck = useMemo(
    () =>
      db.deck
        .filter((item) => item.gameId === game?.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const ratings = useMemo(
    () => db.ratings.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const myBlocksRemaining = useMemo(
    () =>
      db.gamePlayers.find(
        (row) => row.gameId === game?.id && row.userId === user?.id
      )?.blocksRemaining ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const partnerBlocksRemaining = useMemo(
    () =>
      db.gamePlayers.find(
        (row) => row.gameId === game?.id && row.userId === partner?.id
      )?.blocksRemaining ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const incomingInvite = useMemo(() => {
    if (!game || !user) return null;
    if (game.status !== "inviting") return null;
    if (game.initiatorId === user.id) return null;
    return game;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const savedPair = useMemo(() => {
    if (!lastUserId) return null;
    const savedUser = db.profiles.find((profile) => profile.id === lastUserId);
    if (!savedUser) return null;
    const savedCouple = coupleForUser(savedUser.id);
    if (!savedCouple) return null;
    const partnerId = otherUserId(savedCouple, savedUser.id);
    const savedPartner = partnerId
      ? db.profiles.find((profile) => profile.id === partnerId) ?? null
      : null;
    return { user: savedUser, partner: savedPartner, couple: savedCouple };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const nights = useMemo(
    () =>
      db.games
        .filter(
          (row) =>
            row.coupleId === couple?.id &&
            ["completed", "rating"].includes(row.status)
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const bestCards = useMemo(() => {
    if (!couple) return [];
    const byCard = new Map<string, number[]>();
    for (const rating of db.ratings.filter((row) => row.coupleId === couple.id)) {
      const list = byCard.get(rating.cardId) ?? [];
      list.push(rating.stars);
      byCard.set(rating.cardId, list);
    }
    return [...byCard.entries()]
      .map(([cardId, stars]) => {
        const card = db.cards.find((item) => item.id === cardId);
        if (!card) return null;
        const average = stars.reduce((sum, n) => sum + n, 0) / stars.length;
        return { card, average, votes: stars.length };
      })
      .filter((row): row is BestCard => Boolean(row))
      .sort((a, b) => b.average - a.average || b.votes - a.votes)
      .slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const ritualChecks = useMemo(
    () => db.ritualChecks.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const jarOpenVotes = useMemo(
    () => db.jarOpenVotes.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const pushSubscriptions = useMemo(
    () => db.pushSubscriptions.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const checkIns = useMemo(
    () => db.checkIns.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const checkInRequests = useMemo(
    () => db.checkInRequests.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const incomingCheckInRequest = useMemo(() => {
    if (!user || !couple) return null;
    const today = localDateKey();
    return (
      db.checkInRequests.find(
        (row) =>
          row.coupleId === couple.id &&
          row.toUserId === user.id &&
          row.date === today &&
          !row.answeredAt
      ) ?? null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  const curiosityAnswers = useMemo(
    () => db.curiosityAnswers.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const curiosityMatchScore = useMemo(() => {
    const synergy = curiositySynergy(
      db.curiosityAnswers.filter((row) => row.coupleId === couple?.id)
    );
    return synergy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  const talkDecks = useMemo(
    () => db.talkDecks.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const talkDraws = useMemo(
    () => db.talkDraws.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const spicyDares = useMemo(
    () => db.spicyDares.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const milestones = useMemo(
    () =>
      db.milestones
        .filter((row) => row.coupleId === couple?.id)
        .sort((a, b) => a.date.localeCompare(b.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const desireToggles = useMemo(
    () => db.desireToggles.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const coupons = useMemo(
    () => db.coupons.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const scratches = useMemo(
    () => db.scratches.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const jarNotes = useMemo(
    () => db.jarNotes.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const bucketItems = useMemo(
    () => db.bucketItems.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const rememberUser = async (userId: string) => {
    sessionUserId = userId;
    lastUserId = userId;
    await writeSessionUserId(userId);
    await writeLastUserId(userId);
  };

  const createAccount = useCallback(async ({ displayName }: CreateAccountInput) => {
    const profile: Profile = {
      id: createId(),
      displayName: displayName.trim() || "You",
      createdAt: nowIso(),
    };
    const coupleRow: Couple = {
      id: createId(),
      inviteCode: uniqueInviteCode(),
      partnerA: profile.id,
      partnerB: null,
      createdAt: nowIso(),
      pairedAt: null,
    };
    db = {
      ...db,
      profiles: [...db.profiles, profile],
      couples: [...db.couples, coupleRow],
      cards: [...db.cards, ...cloneDefaultDeck(coupleRow.id, profile.id)],
    };
    await rememberUser(profile.id);
    await persist();
  }, []);

  const joinWithCode = useCallback(async ({ displayName, code }: JoinInput) => {
    const normalized = code.trim().toUpperCase();
    const match = db.couples.find((row) => row.inviteCode === normalized);
    if (!match) {
      throw new Error("That invite code was not found.");
    }
    if (match.partnerB) {
      throw new Error("This couple is already paired.");
    }
    const profile: Profile = {
      id: createId(),
      displayName: displayName.trim() || "You",
      createdAt: nowIso(),
    };
    db = {
      ...db,
      profiles: [...db.profiles, profile],
      couples: db.couples.map((row) =>
        row.id === match.id
          ? { ...row, partnerB: profile.id, pairedAt: nowIso() }
          : row
      ),
    };
    await rememberUser(profile.id);
    await persist();
  }, []);

  const continueAsSaved = useCallback(async () => {
    if (!lastUserId) return;
    sessionUserId = lastUserId;
    await writeSessionUserId(lastUserId);
    emit();
  }, []);

  const addDemoPartner = useCallback(async (name = "Riley") => {
    if (!couple || couple.partnerB) return;
    const demo: Profile = {
      id: createId(),
      displayName: name,
      isDemo: true,
      createdAt: nowIso(),
    };
    const today = localDateKey();
    const anniversary = new Date();
    anniversary.setMonth(anniversary.getMonth() + 2);
    db = {
      ...db,
      profiles: [...db.profiles, demo],
      couples: db.couples.map((row) =>
        row.id === couple.id
          ? { ...row, partnerB: demo.id, pairedAt: nowIso() }
          : row
      ),
      checkIns: [
        ...db.checkIns,
        {
          id: createId(),
          coupleId: couple.id,
          userId: demo.id,
          date: today,
          energy: 3,
          mood: "rain",
          loveTank: 4,
          socialBattery: "drain",
          todayNeed: "comfort",
          desireGauge: null,
          tonight: "no",
          createdAt: nowIso(),
        },
      ],
      desireToggles: [
        ...db.desireToggles,
        ...ALL_DESIRE_OPTIONS.filter((_, index) => index % 3 !== 2).map(
          (option) => ({
            id: createId(),
            coupleId: couple.id,
            userId: demo.id,
            optionId: option.id,
            createdAt: nowIso(),
          })
        ),
      ],
      milestones: [
        ...db.milestones,
        {
          id: createId(),
          coupleId: couple.id,
          title: "Weekend getaway",
          kind: "trip" as const,
          date: localDateKey(anniversary),
          createdBy: demo.id,
          createdAt: nowIso(),
        },
      ],
      jarNotes: [
        ...db.jarNotes,
        {
          id: createId(),
          coupleId: couple.id,
          fromUserId: demo.id,
          body: "Thank you for making coffee before I asked.",
          createdAt: nowIso(),
          openedAt: null,
          openAt: null,
          openOption: "together",
        },
      ],
      bucketItems: [
        ...db.bucketItems,
        {
          id: createId(),
          coupleId: couple.id,
          title: "Oyster night at the market",
          kind: "meal" as const,
          notes: "Weeknight. No occasion required.",
          scheduledOn: null,
          doneAt: null,
          createdBy: demo.id,
          createdAt: nowIso(),
        },
        {
          id: createId(),
          coupleId: couple.id,
          title: "Coast overnight",
          kind: "trip" as const,
          notes: "Cheap motel is fine.",
          scheduledOn: null,
          doneAt: null,
          createdBy: demo.id,
          createdAt: nowIso(),
        },
      ],
    };
    await persist();
  }, [couple]);

  const signOut = useCallback(async () => {
    sessionUserId = null;
    await writeSessionUserId(null);
    emit();
  }, []);

  const sendSpicyInvite = useCallback(async () => {
    if (!user || !couple?.partnerB) {
      throw new Error("Pair with a partner before starting a game.");
    }
    const existing = activeGameForCouple(couple.id);
    if (existing && !["completed", "declined", "cancelled"].includes(existing.status)) {
      throw new Error("You already have a live session.");
    }
    const gameRow: GameSession = {
      id: createId(),
      coupleId: couple.id,
      gameKey: "get-spicy",
      status: partner?.isDemo ? "setup" : "inviting",
      initiatorId: user.id,
      mode: null,
      blockLimit: 1,
      stageCounts: { ...DEFAULT_STAGE_COUNTS },
      flavorTags: defaultEnabledFlavorTags(),
      currentStage: null,
      activeCardId: null,
      turnUserId: user.id,
      activePlayedBy: null,
      awaitingPrivate: false,
      privateUnlocked: false,
      playedDate: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db = { ...db, games: [...db.games, gameRow] };
    await persist();
    pingPartner(couple, user, partner, {
      title: "Get Spicy",
      body: `${user.displayName} wants to play tonight.`,
      url: "/",
    });
  }, [couple, partner, user]);

  const acceptInvite = useCallback(async () => {
    if (!game) return;
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, { status: "setup" })
          : row
      ),
    };
    await persist();
  }, [game]);

  const declineInvite = useCallback(async () => {
    if (!game) return;
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, { status: "declined" })
          : row
      ),
    };
    await persist();
  }, [game]);

  const seedPlayers = (gameId: string, blockLimit: number, a: string, b: string) => [
    { gameId, userId: a, blocksRemaining: blockLimit },
    { gameId, userId: b, blocksRemaining: blockLimit },
  ];

  const writeDeck = (gameId: string, picked: Card[]): DeckCard[] => {
    let order = 0;
    const items: DeckCard[] = [];
    for (const stage of STAGE_ORDER) {
      picked
        .filter((card) => card.stage === stage)
        .forEach((card) => {
          items.push({
            id: createId(),
            gameId,
            cardId: card.id,
            stage,
            sortOrder: order,
            status: "queued",
            playedBy: null,
          });
          order += 1;
        });
    }
    return items;
  };

  const startPlayingPatch = (
    row: GameSession,
    extra: Partial<GameSession>
  ): GameSession =>
    sessionFields(row, {
      status: "playing",
      currentStage: STAGE_ORDER[0],
      turnUserId: row.initiatorId,
      activePlayedBy: null,
      awaitingPrivate: false,
      privateUnlocked: (extra.stageCounts ?? row.stageCounts).pre_foreplay === 0,
      ...extra,
    });

  const configureGame = useCallback(
    async (input: {
      mode: GameMode;
      blockLimit: number;
      stageCounts: StageCounts;
      flavorTags: string[];
    }) => {
      if (!game || !couple?.partnerA || !couple.partnerB) return;
      const blockLimit = Math.min(3, Math.max(1, input.blockLimit));
      const stageCounts = normalizeStageCounts(input.stageCounts);
      const flavorTags = normalizeFlavorTags(input.flavorTags);
      if (flavorTags.length === 0) {
        throw new Error("Pick at least one flavor for the deck.");
      }
      if (input.mode === "random") {
        const picked = buildRandomDeck(cards, stageCounts, flavorTags);
        db = {
          ...db,
          games: db.games.map((row) =>
            row.id === game.id
              ? startPlayingPatch(row, {
                  mode: input.mode,
                  blockLimit,
                  stageCounts,
                  flavorTags,
                })
              : row
          ),
          gamePlayers: [
            ...db.gamePlayers.filter((row) => row.gameId !== game.id),
            ...seedPlayers(game.id, blockLimit, couple.partnerA, couple.partnerB),
          ],
          deck: [
            ...db.deck.filter((row) => row.gameId !== game.id),
            ...writeDeck(game.id, picked),
          ],
        };
      } else {
        db = {
          ...db,
          games: db.games.map((row) =>
            row.id === game.id
              ? sessionFields(row, {
                  mode: input.mode,
                  blockLimit,
                  stageCounts,
                  flavorTags,
                  status: "selecting",
                  privateUnlocked: stageCounts.pre_foreplay === 0,
                })
              : row
          ),
          gamePlayers: [
            ...db.gamePlayers.filter((row) => row.gameId !== game.id),
            ...seedPlayers(game.id, blockLimit, couple.partnerA, couple.partnerB),
          ],
          deck: db.deck.filter((row) => row.gameId !== game.id),
        };
      }
      await persist();
    },
    [cards, couple, game]
  );

  const toggleDeckPick = useCallback(
    async (cardId: string) => {
      if (!game || game.status !== "selecting") return;
      const card = cards.find((item) => item.id === cardId);
      if (!card || !card.isActive) return;
      if (!cardAllowedByFlavorTags(card, game.flavorTags)) return;
      const existing = db.deck.find(
        (item) => item.gameId === game.id && item.cardId === cardId
      );
      if (existing) {
        db = {
          ...db,
          deck: db.deck.filter((item) => item.id !== existing.id),
        };
      } else {
        const stageCount = db.deck.filter(
          (item) => item.gameId === game.id && item.stage === card.stage
        ).length;
        if (stageCount >= game.stageCounts[card.stage]) return;
        db = {
          ...db,
          deck: [
            ...db.deck,
            {
              id: createId(),
              gameId: game.id,
              cardId: card.id,
              stage: card.stage,
              sortOrder: db.deck.filter((item) => item.gameId === game.id).length,
              status: "queued",
              playedBy: null,
            },
          ],
        };
      }
      await persist();
    },
    [cards, game]
  );

  const fillPicksRandomly = useCallback(async () => {
    if (!game || game.status !== "selecting") return;
    const selectedIds = new Set(
      db.deck.filter((item) => item.gameId === game.id).map((item) => item.cardId)
    );
    const remaining: Card[] = [];
    const counts = normalizeStageCounts(game.stageCounts);
    for (const stage of STAGE_ORDER) {
      const have = db.deck.filter(
        (item) => item.gameId === game.id && item.stage === stage
      ).length;
      const need = Math.max(0, counts[stage] - have);
      const stageCounts = Object.fromEntries(
        STAGE_ORDER.map((key) => [key, key === stage ? need : 0])
      ) as StageCounts;
      remaining.push(
        ...buildRandomDeck(
          cards.filter((card) => !selectedIds.has(card.id)),
          stageCounts,
          game.flavorTags
        )
      );
    }
    db = {
      ...db,
      deck: [
        ...db.deck.filter((item) => item.gameId !== game.id),
        ...writeDeck(game.id, [
          ...cards.filter((card) => selectedIds.has(card.id)),
          ...remaining,
        ]),
      ],
    };
    await persist();
  }, [cards, game]);

  const lockInPicks = useCallback(async () => {
    if (!game) return;
    const selected = db.deck.filter((item) => item.gameId === game.id);
    if (selected.length === 0) return;
    const ordered = writeDeck(
      game.id,
      selected
        .map((item) => cards.find((card) => card.id === item.cardId))
        .filter((card): card is Card => Boolean(card))
    );
    db = {
      ...db,
      deck: [
        ...db.deck.filter((item) => item.gameId !== game.id),
        ...ordered,
      ],
      games: db.games.map((row) =>
        row.id === game.id
          ? startPlayingPatch(row, {
              currentStage: ordered[0]?.stage ?? null,
              privateUnlocked:
                ordered.every((item) => item.stage !== "pre_foreplay") ||
                game.privateUnlocked,
            })
          : row
      ),
    };
    await persist();
  }, [cards, game]);

  const closeNight = (_gameId: string, hasPlayed: boolean): GameSession["status"] =>
    hasPlayed ? "rating" : "completed";

  const playCard = useCallback(async () => {
    if (!game || !user || !couple || game.status !== "playing") return;
    const demo = Boolean(partner?.isDemo);
    if (!demo && game.turnUserId && game.turnUserId !== user.id) {
      throw new Error(`It's ${profileName(game.turnUserId)}'s turn to play.`);
    }

    const currentDeck = db.deck
      .filter((item) => item.gameId === game.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const active = currentDeck.find((item) => item.status === "active");
    const next = currentDeck.find((item) => item.status === "queued");
    const partnerId = otherUserId(couple, user.id);
    const passTo = partnerId && !demo ? partnerId : user.id;
    const playedCount = currentDeck.filter((item) => item.status === "played").length;

    if (!next && !active) {
      db = {
        ...db,
        games: db.games.map((row) =>
          row.id === game.id
            ? sessionFields(row, {
                status: closeNight(game.id, playedCount > 0),
                activeCardId: null,
                activePlayedBy: null,
              })
            : row
        ),
      };
      await persist();
      return;
    }

    const finishingDaytime =
      Boolean(next) &&
      next!.stage !== "pre_foreplay" &&
      !game.privateUnlocked &&
      (!active || active.stage === "pre_foreplay") &&
      currentDeck.some((item) => item.stage === "pre_foreplay");

    if (finishingDaytime && next) {
      db = {
        ...db,
        deck: db.deck.map((item) =>
          active && item.id === active.id
            ? { ...item, status: "played" as const, playedBy: item.playedBy ?? user.id }
            : item
        ),
        games: db.games.map((row) =>
          row.id === game.id
            ? sessionFields(row, {
                awaitingPrivate: true,
                activeCardId: null,
                activePlayedBy: null,
                currentStage: next.stage,
                turnUserId: user.id,
              })
            : row
        ),
      };
      await persist();
      return;
    }

    if (!active && next && next.stage !== "pre_foreplay" && !game.privateUnlocked) {
      db = {
        ...db,
        games: db.games.map((row) =>
          row.id === game.id
            ? sessionFields(row, {
                awaitingPrivate: true,
                currentStage: next.stage,
                turnUserId: user.id,
              })
            : row
        ),
      };
      await persist();
      return;
    }

    db = {
      ...db,
      deck: db.deck.map((item) => {
        if (active && item.id === active.id) {
          return { ...item, status: "played", playedBy: item.playedBy ?? user.id };
        }
        if (next && item.id === next.id) {
          return { ...item, status: "active", playedBy: user.id };
        }
        return item;
      }),
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              activeCardId: next?.id ?? null,
              activePlayedBy: next ? user.id : null,
              currentStage: next?.stage ?? row.currentStage,
              turnUserId: next ? passTo : row.turnUserId,
              status: next ? "playing" : closeNight(game.id, true),
            })
          : row
      ),
    };
    await persist();
  }, [couple, game, partner, user]);

  const unlockPrivate = useCallback(async () => {
    if (!game || !game.awaitingPrivate) return;
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              awaitingPrivate: false,
              privateUnlocked: true,
            })
          : row
      ),
    };
    await persist();
  }, [game]);

  const blockCard = useCallback(async () => {
    if (!game || !user || game.status !== "playing") return;
    const demo = Boolean(partner?.isDemo);
    if (!demo && game.activePlayedBy && game.activePlayedBy === user.id) {
      throw new Error("You can't block your own card. That's your partner's call.");
    }
    const player = db.gamePlayers.find(
      (row) => row.gameId === game.id && row.userId === user.id
    );
    if (!player || player.blocksRemaining <= 0) {
      throw new Error("No block cards left.");
    }
    const currentDeck = db.deck
      .filter((item) => item.gameId === game.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const active = currentDeck.find((item) => item.status === "active");
    if (!active) {
      throw new Error("Nothing to block yet. Wait until they play.");
    }
    const usedIds = new Set(currentDeck.map((item) => item.cardId));
    const replacement = replacementCard(
      cards,
      active.stage,
      usedIds,
      game.flavorTags
    );
    let nextDeck = db.deck.map((item) =>
      item.id === active.id ? { ...item, status: "blocked" as const } : item
    );
    let activeCardId: string | null = null;
    let currentStage = active.stage;
    let activePlayedBy = game.activePlayedBy;
    if (replacement) {
      const replacementRow: DeckCard = {
        id: createId(),
        gameId: game.id,
        cardId: replacement.id,
        stage: active.stage,
        sortOrder: active.sortOrder + 0.5,
        status: "active",
        playedBy: active.playedBy,
      };
      nextDeck = [...nextDeck, replacementRow];
      activeCardId = replacementRow.id;
    } else {
      const queued = nextDeck
        .filter((item) => item.gameId === game.id && item.status === "queued")
        .sort((a, b) => a.sortOrder - b.sortOrder)[0];
      if (queued) {
        nextDeck = nextDeck.map((item) =>
          item.id === queued.id
            ? { ...item, status: "active" as const, playedBy: user.id }
            : item
        );
        activeCardId = queued.id;
        currentStage = queued.stage;
        activePlayedBy = user.id;
      }
    }
    const remainingPlayed = nextDeck.filter(
      (item) => item.gameId === game.id && item.status === "played"
    ).length;
    db = {
      ...db,
      deck: nextDeck,
      gamePlayers: db.gamePlayers.map((row) =>
        row.gameId === game.id && row.userId === user.id
          ? { ...row, blocksRemaining: row.blocksRemaining - 1 }
          : row
      ),
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              activeCardId,
              activePlayedBy: activeCardId ? activePlayedBy : null,
              currentStage: activeCardId ? currentStage : row.currentStage,
              status: activeCardId
                ? "playing"
                : closeNight(game.id, remainingPlayed > 0),
            })
          : row
      ),
    };
    await persist();
  }, [cards, game, partner, user]);

  const rateCard = useCallback(
    async (cardId: string, stars: number) => {
      if (!game || !user || !couple) return;
      const clamped = Math.min(5, Math.max(1, Math.round(stars)));
      const existing = db.ratings.find(
        (row) =>
          row.gameId === game.id && row.cardId === cardId && row.userId === user.id
      );
      const nextRating: CardRating = existing
        ? { ...existing, stars: clamped }
        : {
            id: createId(),
            coupleId: couple.id,
            gameId: game.id,
            cardId,
            userId: user.id,
            stars: clamped,
            createdAt: nowIso(),
          };
      db = {
        ...db,
        ratings: existing
          ? db.ratings.map((row) => (row.id === existing.id ? nextRating : row))
          : [...db.ratings, nextRating],
      };
      await persist();
    },
    [couple, game, user]
  );

  const finishRatings = useCallback(async () => {
    if (!game) return;
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              status: "completed",
              activeCardId: null,
              activePlayedBy: null,
              playedDate: row.playedDate ?? localDateKey(),
            })
          : row
      ),
    };
    await persist();
  }, [game]);

  const endGame = useCallback(async () => {
    if (!game) return;
    const status =
      game.status === "rating" || game.status === "playing"
        ? game.status === "rating"
          ? "completed"
          : "cancelled"
        : "cancelled";
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id ? sessionFields(row, { status }) : row
      ),
    };
    await persist();
  }, [game]);

  const toggleCardActive = useCallback(async (cardId: string) => {
    db = {
      ...db,
      cards: db.cards.map((card) =>
        card.id === cardId ? { ...card, isActive: !card.isActive } : card
      ),
    };
    await persist();
  }, []);

  const addCustomCard = useCallback(
    async (input: { stage: CardStage; title: string; body: string }) => {
      if (!user || !couple) return;
      const stageCards = db.cards.filter(
        (card) => card.coupleId === couple.id && card.stage === input.stage
      );
      const card: Card = {
        id: createId(),
        coupleId: couple.id,
        stage: input.stage,
        title: input.title.trim(),
        body: input.body.trim(),
        isDefault: false,
        isActive: true,
        sortOrder: stageCards.length + 1,
        createdBy: user.id,
        createdAt: nowIso(),
      };
      db = { ...db, cards: [...db.cards, card] };
      await persist();
    },
    [couple, user]
  );

  const submitCheckIn = useCallback(
    async (input: {
      energy: number | null;
      mood: MoodWeather | null;
      loveTank: number | null;
      socialBattery: SocialBattery | null;
      todayNeed: TodayNeed | null;
      desireGauge: DesireGauge | null;
      tonight: TonightSex | null;
    }) => {
      if (!user || !couple) return;
      const shared = [
        input.energy,
        input.mood,
        input.loveTank,
        input.socialBattery,
        input.todayNeed,
        input.desireGauge,
        input.tonight,
      ].some((value) => value != null);
      if (!shared) throw new Error("Pick Hell yeh or Nah not today — or add more detail.");
      const today = localDateKey();
      const row: CheckIn = {
        id: createId(),
        coupleId: couple.id,
        userId: user.id,
        date: today,
        energy:
          input.energy == null ? null : Math.min(10, Math.max(1, input.energy)),
        mood: input.mood,
        loveTank:
          input.loveTank == null
            ? null
            : Math.min(10, Math.max(1, input.loveTank)),
        socialBattery: input.socialBattery,
        todayNeed: input.todayNeed,
        desireGauge: input.desireGauge,
        tonight: input.tonight,
        createdAt: nowIso(),
      };
      db = {
        ...db,
        checkIns: [
          ...db.checkIns.filter(
            (item) =>
              !(
                item.coupleId === couple.id &&
                item.userId === user.id &&
                item.date === today
              )
          ),
          row,
        ],
        checkInRequests: db.checkInRequests.map((item) =>
          item.coupleId === couple.id &&
          item.toUserId === user.id &&
          item.date === today &&
          !item.answeredAt
            ? { ...item, answeredAt: nowIso() }
            : item
        ),
        ritualChecks: upsertRitual(couple.id, user.id, "check-in", today),
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Check-in landed",
        body: "They shared how they are. Open Check-in.",
        url: "/hub/check-in",
      });
    },
    [couple, partner, user]
  );

  const requestCheckIn = useCallback(
    async (metrics: CheckInMetricKey[]) => {
      if (!user || !couple) return;
      if (!partner) throw new Error("Pair up first.");
      const unique = [...new Set(metrics)];
      if (!unique.length) throw new Error("Pick at least one area.");
      const today = localDateKey();
      const row: CheckInRequest = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId: partner.id,
        metrics: unique,
        date: today,
        createdAt: nowIso(),
        answeredAt: null,
      };
      db = {
        ...db,
        checkInRequests: [
          ...db.checkInRequests.filter(
            (item) =>
              !(
                item.coupleId === couple.id &&
                item.fromUserId === user.id &&
                item.date === today
              )
          ),
          row,
        ],
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Check-in request",
        body: "They want a few updates from you.",
        url: "/hub/check-in",
      });
    },
    [couple, partner, user]
  );

  const submitCuriosity = useCallback(
    async (input: { answerIndex: number; guessIndex: number }) => {
      if (!user || !couple) {
        throw new Error("Pair first, then play Curiosity.");
      }
      const question = dailyCuriosityQuestion(couple.id, localDateKey());
      if (
        input.answerIndex < 0 ||
        input.answerIndex >= question.options.length ||
        input.guessIndex < 0 ||
        input.guessIndex >= question.options.length
      ) {
        throw new Error("Pick your answer and your guess.");
      }
      const today = localDateKey();
      const firstSubmit = !db.curiosityAnswers.some(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === user.id &&
          row.date === today &&
          isCuriosityComplete(row)
      );
      const theyAlreadyAnswered = db.curiosityAnswers.some(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === partner?.id &&
          row.date === today &&
          isCuriosityComplete(row)
      );
      const mine: CuriosityAnswer = {
        id: createId(),
        coupleId: couple.id,
        userId: user.id,
        date: today,
        questionId: question.id,
        answerIndex: input.answerIndex,
        guessIndex: input.guessIndex,
        body: question.options[input.answerIndex] ?? "",
        createdAt: nowIso(),
      };
      const extra: CuriosityAnswer[] = [];
      if (partner?.isDemo) {
        const already = db.curiosityAnswers.some(
          (row) =>
            row.coupleId === couple.id &&
            row.userId === partner.id &&
            row.date === today &&
            isCuriosityComplete(row)
        );
        if (!already) {
          // Demo partner: answer something plausible, guess the user's answer often.
          const demoAnswer =
            (input.answerIndex + 1) % question.options.length;
          const demoGuess =
            Math.random() > 0.35 ? input.answerIndex : demoAnswer;
          extra.push({
            id: createId(),
            coupleId: couple.id,
            userId: partner.id,
            date: today,
            questionId: question.id,
            answerIndex: demoAnswer,
            guessIndex: demoGuess,
            body: question.options[demoAnswer] ?? "",
            createdAt: nowIso(),
          });
        }
      }
      db = {
        ...db,
        curiosityAnswers: [
          ...db.curiosityAnswers.filter(
            (row) =>
              !(
                row.coupleId === couple.id &&
                row.userId === user.id &&
                row.date === today
              )
          ),
          mine,
          ...extra,
        ],
        ritualChecks: upsertRitual(couple.id, user.id, "curiosity", today),
      };
      await persist();
      if (firstSubmit && !theyAlreadyAnswered && !partner?.isDemo) {
        pingPartner(couple, user, partner, {
          title: "Daily curiosity",
          body: `${user.displayName} locked today's sync. Your turn.`,
          url: "/hub/curiosity",
        });
      }
    },
    [couple, partner, user]
  );

  const drawTalkQuestion = useCallback(
    async (categoryId: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then pull a card.");
      }
      if (isSpicyDareDeck(categoryId)) {
        throw new Error("Browse Wildcard Challenges & Dares instead of drawing.");
      }
      categoryById(categoryId);
      const today = localDateKey();
      const existing = todaysDraw(db.talkDraws, {
        userId: user.id,
        categoryId,
        date: today,
      });
      if (existing) return existing;

      const previous = db.talkDecks.find(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === user.id &&
          row.categoryId === categoryId
      );
      const deck = ensureDeck(previous, {
        id: previous?.id ?? createId(),
        coupleId: couple.id,
        userId: user.id,
        categoryId,
      });
      const questionId = nextQuestionId(deck);
      const row: TalkDraw = {
        id: createId(),
        coupleId: couple.id,
        userId: user.id,
        categoryId,
        questionId,
        date: today,
        body: "",
        reaction: null,
        answeredAt: null,
        createdAt: nowIso(),
      };
      db = {
        ...db,
        talkDecks: [...db.talkDecks.filter((item) => item.id !== deck.id), deck],
        talkDraws: [...db.talkDraws, row],
      };
      await persist();
      return row;
    },
    [couple, user]
  );

  const submitTalkAnswer = useCallback(
    async (input: {
      categoryId: string;
      body: string;
      reaction: TalkReaction | null;
    }) => {
      if (!user || !couple) {
        throw new Error("Pair first, then save.");
      }
      const text = input.body.trim();
      if (!input.reaction && !text) {
        throw new Error("Tap a thumb or leave a note.");
      }
      const today = localDateKey();
      const existing = todaysDraw(db.talkDraws, {
        userId: user.id,
        categoryId: input.categoryId,
        date: today,
      });
      if (!existing) {
        throw new Error("Draw a card first.");
      }
      const firstAnswer = !existing.answeredAt;
      let talkDecks = db.talkDecks;
      if (firstAnswer) {
        const previous = talkDecks.find(
          (row) =>
            row.coupleId === couple.id &&
            row.userId === user.id &&
            row.categoryId === input.categoryId
        );
        const rotated = rotatePlayed(
          ensureDeck(previous, {
            id: previous?.id ?? createId(),
            coupleId: couple.id,
            userId: user.id,
            categoryId: input.categoryId,
          }),
          existing.questionId
        );
        talkDecks = [...talkDecks.filter((row) => row.id !== rotated.id), rotated];
      }
      const next: TalkDraw = {
        ...existing,
        body: text,
        reaction: input.reaction,
        answeredAt: existing.answeredAt ?? nowIso(),
      };
      db = {
        ...db,
        talkDecks,
        talkDraws: db.talkDraws.map((row) => (row.id === existing.id ? next : row)),
      };
      await persist();
      if (firstAnswer) {
        const category = categoryById(input.categoryId);
        pingPartner(couple, user, partner, {
          title: "Let's Talk",
          body: `${user.displayName} pulled ${category.name}.`,
          url: "/hub/talk",
        });
      }
    },
    [couple, partner, user]
  );

  const sendSpicyDare = useCallback(
    async (input: {
      dareId: string | null;
      text: string;
      categories?: string[];
      direction: DareDirection;
      timeframe: DareTimeframe;
      customWhen?: string | null;
    }) => {
      if (!user || !couple) {
        throw new Error("Pair first, then send a dare.");
      }
      const toUserId = otherUserId(couple, user.id);
      if (!toUserId) {
        throw new Error("Pair up before sending a dare.");
      }
      const text = input.text.trim();
      if (!text) throw new Error("Write the dare, or tweak the one you picked.");
      if (input.timeframe === "custom" && !input.customWhen?.trim()) {
        throw new Error("Pick a date and time on the calendar.");
      }
      const dueAt = dueAtForTimeframe(input.timeframe, input.customWhen);
      if (input.timeframe !== "none") {
        if (!dueAt) {
          throw new Error("Pick a valid expiry time.");
        }
        if (Date.parse(dueAt) <= Date.now()) {
          throw new Error("Pick a time in the future.");
        }
      }
      const catalog = input.dareId ? dareById(input.dareId) : null;
      const categories =
        input.categories && input.categories.length > 0
          ? input.categories
          : catalog
            ? [...catalog.categories]
            : [];
      const row: SpicyDarePlay = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        dareId: catalog?.id ?? input.dareId,
        text,
        categories,
        direction: input.direction,
        timeframe: input.timeframe,
        customWhen: input.timeframe === "custom" ? input.customWhen!.trim() : null,
        dueAt,
        status: "offered",
        createdAt: nowIso(),
        answeredAt: null,
        completedAt: null,
      };
      let talkDecks = db.talkDecks;
      if (catalog) {
        const previous = talkDecks.find(
          (item) =>
            item.coupleId === couple.id &&
            item.userId === user.id &&
            isSpicyDareDeck(item.categoryId)
        );
        const rotated = rotatePlayed(
          ensureDeck(previous, {
            id: previous?.id ?? createId(),
            coupleId: couple.id,
            userId: user.id,
            categoryId: SPICY_DARE_DECK_ID,
          }),
          catalog.id
        );
        talkDecks = [...talkDecks.filter((item) => item.id !== rotated.id), rotated];
      }
      db = {
        ...db,
        spicyDares: [...db.spicyDares, row],
        talkDecks,
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Wildcard dare",
        body:
          input.direction === "i-do-you"
            ? `${user.displayName} wants to do this to you.`
            : `${user.displayName} dared you — if you're up for it.`,
        url: "/hub/wildcard",
      });
    },
    [couple, partner, user]
  );

  const respondSpicyDare = useCallback(
    async (id: string, status: "accepted" | "declined") => {
      if (!user) return;
      const existing = db.spicyDares.find((row) => row.id === id);
      if (!existing || existing.status !== "offered") return;
      // Only the recipient can accept or pass — never act for a demo partner.
      if (existing.toUserId !== user.id) return;
      db = {
        ...db,
        spicyDares: db.spicyDares.map((row) =>
          row.id === id
            ? { ...row, status, answeredAt: nowIso() }
            : row
        ),
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Wildcard dare",
        body:
          status === "accepted"
            ? `${user.displayName} is up for the dare.`
            : `${user.displayName} passed on this one.`,
        url: "/hub/wildcard",
      });
    },
    [couple, partner, user]
  );

  const completeSpicyDare = useCallback(
    async (id: string) => {
      if (!user) return;
      db = {
        ...db,
        spicyDares: db.spicyDares.map((row) => {
          const involved = row.fromUserId === user.id || row.toUserId === user.id;
          const demoHold = Boolean(
            partner?.isDemo &&
              (row.toUserId === partner.id || row.fromUserId === partner.id)
          );
          if (row.id === id && row.status === "accepted" && (involved || demoHold)) {
            return { ...row, status: "done", completedAt: nowIso() };
          }
          return row;
        }),
      };
      await persist();
    },
    [partner, user]
  );

  const addMilestone = useCallback(
    async (input: { title: string; kind: MilestoneKind; date: string }) => {
      if (!user || !couple) return;
      const title = input.title.trim();
      if (!title || !input.date) throw new Error("Add a title and a date.");
      const row: Milestone = {
        id: createId(),
        coupleId: couple.id,
        title,
        kind: input.kind,
        date: input.date,
        createdBy: user.id,
        createdAt: nowIso(),
      };
      db = { ...db, milestones: [...db.milestones, row] };
      await persist();
    },
    [couple, user]
  );

  const removeMilestone = useCallback(async (id: string) => {
    db = { ...db, milestones: db.milestones.filter((row) => row.id !== id) };
    await persist();
  }, []);

  const toggleDesire = useCallback(
    async (optionId: string) => {
      if (!user || !couple) return;
      const existing = db.desireToggles.find(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === user.id &&
          row.optionId === optionId
      );
      db = {
        ...db,
        desireToggles: existing
          ? db.desireToggles.filter((row) => row.id !== existing.id)
          : [
              ...db.desireToggles,
              {
                id: createId(),
                coupleId: couple.id,
                userId: user.id,
                optionId,
                createdAt: nowIso(),
              },
            ],
      };
      await persist();
    },
    [couple, user]
  );

  const createCoupon = useCallback(
    async (input: {
      title: string;
      body?: string;
      reason?: string | null;
      categoryId?: string | null;
      ideaId?: string | null;
      useOption?: string | null;
      expiresAt?: string | null;
    }) => {
      if (!user || !couple?.partnerB) {
        throw new Error("Pair up before sending a coupon.");
      }
      const title = input.title.trim();
      if (!title) throw new Error("Pick a coupon first.");
      const toUserId =
        couple.partnerB === user.id ? couple.partnerA : couple.partnerB;
      if (!toUserId) throw new Error("Pair up before sending a coupon.");
      const demoTarget = Boolean(partner?.isDemo && toUserId === partner.id);
      const row: Coupon = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        title,
        body: (input.body ?? "").trim(),
        reason: input.reason?.trim() || null,
        categoryId: input.categoryId ?? null,
        ideaId: input.ideaId ?? null,
        useOption: input.useOption ?? null,
        expiresAt: input.expiresAt ?? null,
        status: demoTarget ? "accepted" : "offered",
        createdAt: nowIso(),
        acceptedAt: demoTarget ? nowIso() : null,
        redeemedAt: null,
      };
      db = { ...db, coupons: [...db.coupons, row] };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Favor coupon",
        body: `${user.displayName} sent you “${title}”.`,
        url: "/hub/coupons",
      });
    },
    [couple, partner, user]
  );

  const acceptCoupon = useCallback(
    async (id: string) => {
      if (!user) return;
      db = {
        ...db,
        coupons: db.coupons.map((row) =>
          row.id === id && row.toUserId === user.id && row.status === "offered"
            ? { ...row, status: "accepted", acceptedAt: nowIso() }
            : row
        ),
      };
      await persist();
    },
    [user]
  );

  const redeemCoupon = useCallback(
    async (id: string) => {
      if (!user) return;
      db = {
        ...db,
        coupons: db.coupons.map((row) => {
          const mine = row.toUserId === user.id;
          const demoHold = Boolean(partner?.isDemo && row.toUserId === partner.id);
          const expired =
            Boolean(row.expiresAt) && Date.parse(row.expiresAt as string) < Date.now();
          if (
            row.id === id &&
            row.status === "accepted" &&
            !expired &&
            (mine || demoHold)
          ) {
            return { ...row, status: "redeemed", redeemedAt: nowIso() };
          }
          return row;
        }),
      };
      await persist();
    },
    [partner, user]
  );

  const scratchCard = useCallback(
    async (kind: ScratchKind) => {
      if (!user || !couple) return null;
      const pick = hashPick(
        SCRATCH_POOLS[kind],
        `${couple.id}:${user.id}:${kind}:${Date.now()}`
      );
      const row: ScratchReveal = {
        id: createId(),
        coupleId: couple.id,
        userId: user.id,
        kind,
        title: pick.title,
        body: pick.body,
        createdAt: nowIso(),
      };
      db = { ...db, scratches: [...db.scratches, row] };
      await persist();
      return row;
    },
    [couple, user]
  );

  const addJarNote = useCallback(
    async (input: {
      body: string;
      openOption?: string | null;
      openAt?: string | null;
    }) => {
      if (!user || !couple) return;
      const text = input.body.trim();
      if (!text) throw new Error("Write a note first.");
      const row: JarNote = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        body: text,
        createdAt: nowIso(),
        openedAt: null,
        openAt: input.openAt ?? null,
        openOption: input.openOption ?? null,
      };
      db = { ...db, jarNotes: [...db.jarNotes, row] };
      await persist();
    },
    [couple, user]
  );

  const voteOpenJar = useCallback(async () => {
    if (!user || !couple) return;
    const today = localDateKey();
    const already = db.jarOpenVotes.some(
      (row) =>
        row.coupleId === couple.id &&
        row.userId === user.id &&
        row.date === today
    );
    let votes = already
      ? db.jarOpenVotes
      : [
          ...db.jarOpenVotes,
          {
            id: createId(),
            coupleId: couple.id,
            userId: user.id,
            date: today,
          },
        ];
    if (partner?.isDemo) {
      const demoVoted = votes.some(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === partner.id &&
          row.date === today
      );
      if (!demoVoted) {
        votes = [
          ...votes,
          {
            id: createId(),
            coupleId: couple.id,
            userId: partner.id,
            date: today,
          },
        ];
      }
    }
    const needed = partner ? 2 : 1;
    const count = votes.filter(
      (row) => row.coupleId === couple.id && row.date === today
    ).length;
    const openNow = count >= needed;
    db = {
      ...db,
      jarOpenVotes: votes,
      jarNotes: openNow
        ? db.jarNotes.map((note) =>
            note.coupleId === couple.id && !note.openedAt
              ? { ...note, openedAt: nowIso() }
              : note
          )
        : db.jarNotes,
      ritualChecks: openNow
        ? upsertRitual(couple.id, user.id, "jar-sunday", today)
        : db.ritualChecks,
    };
    await persist();
    if (!openNow) {
      pingPartner(couple, user, partner, {
        title: "Appreciation jar",
        body: `${user.displayName} is ready to open the jar.`,
        url: "/hub/jar",
      });
    }
  }, [couple, partner, user]);

  const addBucketItem = useCallback(
    async (input: {
      title: string;
      kind: BucketKind;
      notes?: string;
      scheduledOn?: string | null;
    }) => {
      if (!user || !couple) return;
      const title = input.title.trim();
      if (!title) throw new Error("Name the plan.");
      const row: BucketItem = {
        id: createId(),
        coupleId: couple.id,
        title,
        kind: input.kind,
        notes: input.notes?.trim() ?? "",
        scheduledOn: input.scheduledOn || null,
        doneAt: null,
        createdBy: user.id,
        createdAt: nowIso(),
      };
      db = { ...db, bucketItems: [...db.bucketItems, row] };
      await persist();
    },
    [couple, user]
  );

  const spinDateNight = useCallback(async () => {
    if (!couple) return null;
    const open = db.bucketItems.filter(
      (row) => row.coupleId === couple.id && !row.doneAt
    );
    if (!open.length) return null;
    const pick = open[Math.floor(Math.random() * open.length)];
    db = {
      ...db,
      bucketItems: db.bucketItems.map((row) =>
        row.id === pick.id
          ? { ...row, scheduledOn: row.scheduledOn ?? localDateKey() }
          : row
      ),
      ritualChecks: user
        ? upsertRitual(couple.id, user.id, "date-night", localDateKey())
        : db.ritualChecks,
    };
    await persist();
    return pick;
  }, [couple, user]);

  const markBucketDone = useCallback(async (id: string) => {
    db = {
      ...db,
      bucketItems: db.bucketItems.map((row) =>
        row.id === id ? { ...row, doneAt: nowIso() } : row
      ),
    };
    await persist();
  }, []);

  const toggleRitual = useCallback(
    async (ritualId: string) => {
      if (!user || !couple) return;
      const today = localDateKey();
      const existing = db.ritualChecks.find(
        (row) =>
          row.coupleId === couple.id &&
          row.ritualId === ritualId &&
          row.date === today &&
          row.userId === user.id
      );
      db = {
        ...db,
        ritualChecks: existing
          ? db.ritualChecks.filter((row) => row.id !== existing.id)
          : upsertRitual(couple.id, user.id, ritualId, today),
      };
      await persist();
    },
    [couple, user]
  );

  const enablePush = useCallback(async () => {
    if (!user || !couple) {
      throw new Error("Pair first, then enable notifications.");
    }
    const keys = await subscribeToPush();
    const row: PushSubscriptionRow = {
      id: createId(),
      userId: user.id,
      coupleId: couple.id,
      endpoint: keys.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      updatedAt: nowIso(),
    };
    db = {
      ...db,
      pushSubscriptions: [
        ...db.pushSubscriptions.filter((item) => item.endpoint !== row.endpoint),
        row,
      ],
    };
    await persist();
    await upsertCloudSubscription(row);
  }, [couple, user]);

  const sendTestPush = useCallback(async () => {
    if (!user) throw new Error("Sign in first.");
    const mine = db.pushSubscriptions.filter((row) => row.userId === user.id);
    if (!mine.length) {
      throw new Error("Enable notifications on this device first.");
    }
    await sendPushToSubscriptions(mine, {
      title: "Duoma",
      body: "Notifications are on. Your partner will get the real pings.",
      url: "/",
    });
  }, [user]);

  const value: AppContextValue = {
    ready,
    usingCloud: false,
    user,
    partner,
    couple,
    cards,
    game,
    deck,
    ratings,
    myBlocksRemaining,
    partnerBlocksRemaining,
    incomingInvite,
    savedPair,
    nights,
    bestCards,
    checkIns,
    checkInRequests,
    incomingCheckInRequest,
    curiosityAnswers,
    curiosityMatchScore,
    talkDecks,
    talkDraws,
    spicyDares,
    milestones,
    desireToggles,
    coupons,
    scratches,
    jarNotes,
    bucketItems,
    ritualChecks,
    jarOpenVotes,
    pushSubscriptions,
    createAccount,
    joinWithCode,
    continueAsSaved,
    addDemoPartner,
    signOut,
    sendSpicyInvite,
    acceptInvite,
    declineInvite,
    configureGame,
    toggleDeckPick,
    fillPicksRandomly,
    lockInPicks,
    playCard,
    blockCard,
    unlockPrivate,
    rateCard,
    finishRatings,
    endGame,
    toggleCardActive,
    addCustomCard,
    submitCheckIn,
    requestCheckIn,
    submitCuriosity,
    drawTalkQuestion,
    submitTalkAnswer,
    sendSpicyDare,
    respondSpicyDare,
    completeSpicyDare,
    addMilestone,
    removeMilestone,
    toggleDesire,
    createCoupon,
    acceptCoupon,
    redeemCoupon,
    scratchCard,
    addJarNote,
    voteOpenJar,
    addBucketItem,
    spinDateNight,
    markBucketDone,
    toggleRitual,
    enablePush,
    sendTestPush,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return value;
}
