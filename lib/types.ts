export const STAGES = [
  "pre_foreplay",
  "foreplay",
  "step_it_up",
  "finish_off",
  "afterglow",
] as const;

export type CardStage = (typeof STAGES)[number];

export type GameKey = "get-spicy" | "lets-talk";

export type GameMode = "random" | "pick_your_own";

export type GameStatus =
  | "inviting"
  | "declined"
  | "setup"
  | "selecting"
  | "playing"
  | "rating"
  | "completed"
  | "cancelled";

export type DeckCardStatus = "queued" | "active" | "played" | "blocked";

export type StageCounts = Record<CardStage, number>;

export type Profile = {
  id: string;
  displayName: string;
  isDemo?: boolean;
  createdAt: string;
};

export type Couple = {
  id: string;
  inviteCode: string;
  partnerA: string;
  partnerB: string | null;
  createdAt: string;
  pairedAt: string | null;
};

export type Card = {
  id: string;
  coupleId: string | null;
  stage: CardStage;
  title: string;
  body: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
};

export type DefaultCardSeed = {
  category: CardStage;
  title: string;
  description: string;
  order: number;
};

export type GameSession = {
  id: string;
  coupleId: string;
  gameKey: GameKey;
  status: GameStatus;
  initiatorId: string;
  mode: GameMode | null;
  blockLimit: number;
  stageCounts: StageCounts;
  currentStage: CardStage | null;
  activeCardId: string | null;
  turnUserId: string | null;
  activePlayedBy: string | null;
  awaitingPrivate: boolean;
  privateUnlocked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GamePlayer = {
  gameId: string;
  userId: string;
  blocksRemaining: number;
};

export type DeckCard = {
  id: string;
  gameId: string;
  cardId: string;
  stage: CardStage;
  sortOrder: number;
  status: DeckCardStatus;
  playedBy: string | null;
};

export type CardRating = {
  id: string;
  coupleId: string;
  gameId: string;
  cardId: string;
  userId: string;
  stars: number;
  createdAt: string;
};

export type AppDB = {
  profiles: Profile[];
  couples: Couple[];
  cards: Card[];
  games: GameSession[];
  gamePlayers: GamePlayer[];
  deck: DeckCard[];
  ratings: CardRating[];
};

export type GameModule = {
  key: GameKey;
  title: string;
  tagline: string;
  available: boolean;
};
