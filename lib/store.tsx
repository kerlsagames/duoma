import { cloneDefaultDeck, GET_SPICY_SEEDS } from "@/games/get-spicy";
import {
  buildRandomDeck,
  DEFAULT_STAGE_COUNTS,
  normalizeStageCounts,
  replacementCard,
  STAGE_ORDER,
} from "@/games/get-spicy/engine";
import { createId, createInviteCode, nowIso } from "@/lib/ids";
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
  Card,
  CardRating,
  CardStage,
  Couple,
  DeckCard,
  GameMode,
  GameSession,
  Profile,
  StageCounts,
} from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CHANNEL_NAME = "fuse-realtime";

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
};

const AppContext = createContext<AppContextValue | null>(null);

function sessionFields(game: GameSession, extra: Partial<GameSession>): GameSession {
  return {
    ...game,
    ...extra,
    updatedAt: nowIso(),
  };
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
      if (event.key !== "fuse:db") return;
      db = await readDb();
      bump();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
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
    db = {
      ...db,
      profiles: [...db.profiles, demo],
      couples: db.couples.map((row) =>
        row.id === couple.id
          ? { ...row, partnerB: demo.id, pairedAt: nowIso() }
          : row
      ),
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
      currentStage: null,
      activeCardId: null,
      turnUserId: user.id,
      activePlayedBy: null,
      awaitingPrivate: false,
      privateUnlocked: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db = { ...db, games: [...db.games, gameRow] };
    await persist();
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
    }) => {
      if (!game || !couple?.partnerA || !couple.partnerB) return;
      const blockLimit = Math.min(3, Math.max(1, input.blockLimit));
      const stageCounts = normalizeStageCounts(input.stageCounts);
      if (input.mode === "random") {
        const picked = buildRandomDeck(cards, stageCounts);
        db = {
          ...db,
          games: db.games.map((row) =>
            row.id === game.id
              ? startPlayingPatch(row, {
                  mode: input.mode,
                  blockLimit,
                  stageCounts,
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
          stageCounts
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
    const replacement = replacementCard(cards, active.stage, usedIds);
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
