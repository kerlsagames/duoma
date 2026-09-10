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
  readSessionUserId,
  writeDb,
  writeSessionUserId,
} from "@/lib/storage";
import type {
  AppDB,
  Card,
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

function syncDefaultCards(): boolean {
  let added = false;
  for (const couple of db.couples) {
    const existingKeys = new Set(
      db.cards
        .filter((card) => card.coupleId === couple.id && card.isDefault)
        .map((card) => seedKey(card.stage, card.title, card.body))
    );
    const missing = GET_SPICY_SEEDS.filter(
      (seed) =>
        !existingKeys.has(
          seedKey(seed.category, seed.title, seed.description)
        )
    );
    if (!missing.length) continue;
    added = true;
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
  return added;
}

function coupleForUser(userId: string | null): Couple | null {
  if (!userId) return null;
  return (
    db.couples.find(
      (couple) => couple.partnerA === userId || couple.partnerB === userId
    ) ?? null
  );
}

function activeGameForCouple(coupleId: string | null): GameSession | null {
  if (!coupleId) return null;
  return (
    [...db.games]
      .reverse()
      .find(
        (game) =>
          game.coupleId === coupleId &&
          !["cancelled", "declined"].includes(game.status)
      ) ?? null
  );
}

type CreateAccountInput = { displayName: string };
type JoinInput = { displayName: string; code: string };

type AppContextValue = {
  ready: boolean;
  usingCloud: boolean;
  user: Profile | null;
  partner: Profile | null;
  couple: Couple | null;
  cards: Card[];
  game: GameSession | null;
  deck: DeckCard[];
  myBlocksRemaining: number;
  partnerBlocksRemaining: number;
  incomingInvite: GameSession | null;
  createAccount: (input: CreateAccountInput) => Promise<void>;
  joinWithCode: (input: JoinInput) => Promise<void>;
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
  endGame: () => Promise<void>;
  toggleCardActive: (cardId: string) => Promise<void>;
  addCustomCard: (input: {
    stage: CardStage;
    title: string;
    body: string;
  }) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

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
    const partnerId =
      couple.partnerA === user.id ? couple.partnerB : couple.partnerA;
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
    sessionUserId = profile.id;
    await writeSessionUserId(profile.id);
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
    sessionUserId = profile.id;
    await writeSessionUserId(profile.id);
    await persist();
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
          ? { ...row, status: "setup", updatedAt: nowIso() }
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
          ? { ...row, status: "declined", updatedAt: nowIso() }
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

  const configureGame = useCallback(
    async (input: {
      mode: GameMode;
      blockLimit: number;
      stageCounts: StageCounts;
    }) => {
      if (!game || !couple?.partnerA || !couple.partnerB) return;
      const blockLimit = Math.min(3, Math.max(1, input.blockLimit));
      if (input.mode === "random") {
        const picked = buildRandomDeck(cards, input.stageCounts);
        db = {
          ...db,
          games: db.games.map((row) =>
            row.id === game.id
              ? {
                  ...row,
                  mode: input.mode,
                  blockLimit,
                  stageCounts: input.stageCounts,
                  status: "playing",
                  currentStage: STAGE_ORDER[0],
                  updatedAt: nowIso(),
                }
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
              ? {
                  ...row,
                  mode: input.mode,
                  blockLimit,
                  stageCounts: input.stageCounts,
                  status: "selecting",
                  updatedAt: nowIso(),
                }
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
          ? {
              ...row,
              status: "playing",
              currentStage: ordered[0]?.stage ?? null,
              updatedAt: nowIso(),
            }
          : row
      ),
    };
    await persist();
  }, [cards, game]);

  const playCard = useCallback(async () => {
    if (!game || !user || game.status !== "playing") return;
    const currentDeck = db.deck
      .filter((item) => item.gameId === game.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const active = currentDeck.find((item) => item.status === "active");
    const next = currentDeck.find((item) => item.status === "queued");
    if (!next && !active) {
      db = {
        ...db,
        games: db.games.map((row) =>
          row.id === game.id
            ? { ...row, status: "completed", activeCardId: null, updatedAt: nowIso() }
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
          return { ...item, status: "played", playedBy: user.id };
        }
        if (next && item.id === next.id) {
          return { ...item, status: "active" };
        }
        return item;
      }),
      games: db.games.map((row) =>
        row.id === game.id
          ? {
              ...row,
              activeCardId: next?.id ?? null,
              currentStage: next?.stage ?? row.currentStage,
              status: next ? "playing" : "completed",
              updatedAt: nowIso(),
            }
          : row
      ),
    };
    await persist();
  }, [game, user]);

  const blockCard = useCallback(async () => {
    if (!game || !user || game.status !== "playing") return;
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
      throw new Error("Nothing to block yet. Play a card first.");
    }
    const usedIds = new Set(currentDeck.map((item) => item.cardId));
    const replacement = replacementCard(cards, active.stage, usedIds);
    let nextDeck = db.deck.map((item) =>
      item.id === active.id ? { ...item, status: "blocked" as const } : item
    );
    let activeCardId: string | null = null;
    let currentStage = active.stage;
    if (replacement) {
      const replacementRow: DeckCard = {
        id: createId(),
        gameId: game.id,
        cardId: replacement.id,
        stage: active.stage,
        sortOrder: active.sortOrder + 0.5,
        status: "active",
        playedBy: null,
      };
      nextDeck = [...nextDeck, replacementRow];
      activeCardId = replacementRow.id;
    } else {
      const queued = nextDeck
        .filter((item) => item.gameId === game.id && item.status === "queued")
        .sort((a, b) => a.sortOrder - b.sortOrder)[0];
      if (queued) {
        nextDeck = nextDeck.map((item) =>
          item.id === queued.id ? { ...item, status: "active" as const } : item
        );
        activeCardId = queued.id;
        currentStage = queued.stage;
      }
    }
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
          ? {
              ...row,
              activeCardId,
              currentStage: activeCardId ? currentStage : row.currentStage,
              status: activeCardId ? "playing" : "completed",
              updatedAt: nowIso(),
            }
          : row
      ),
    };
    await persist();
  }, [cards, game, user]);

  const endGame = useCallback(async () => {
    if (!game) return;
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? { ...row, status: "cancelled", updatedAt: nowIso() }
          : row
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
    myBlocksRemaining,
    partnerBlocksRemaining,
    incomingInvite,
    createAccount,
    joinWithCode,
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
