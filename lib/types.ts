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
  playedDate: string | null;
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

export type MoodWeather = "sunny" | "bright" | "cloudy" | "rain" | "storm";

export type SocialBattery = "drain" | "balanced" | "social";

export type TodayNeed =
  | "alone"
  | "listen"
  | "comfort"
  | "tasks"
  | "fun"
  | "talk";

export type DesireGauge = "off" | "medium" | "high" | "hot";

export type TonightSex = "yes" | "no";

export type CheckInMetricKey =
  | "tonight"
  | "battery"
  | "mood"
  | "loveTank"
  | "socialBattery"
  | "todayNeed"
  | "desireGauge";

export type CheckIn = {
  id: string;
  coupleId: string;
  userId: string;
  date: string;
  energy: number | null;
  mood: MoodWeather | null;
  loveTank: number | null;
  socialBattery: SocialBattery | null;
  todayNeed: TodayNeed | null;
  desireGauge: DesireGauge | null;
  tonight: TonightSex | null;
  createdAt: string;
};

export type CheckInRequest = {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  metrics: CheckInMetricKey[];
  date: string;
  createdAt: string;
  answeredAt: string | null;
};

export type CuriosityCategory = "flirty" | "fun" | "life" | "deep";

export type CuriosityQuestion = {
  id: string;
  question: string;
  options: string[];
  category: CuriosityCategory;
};

export type CuriosityAnswer = {
  id: string;
  coupleId: string;
  userId: string;
  date: string;
  questionId: string;
  /** Selected option index for Step 1 */
  answerIndex: number | null;
  /** Guess of partner's answer for Step 2 */
  guessIndex: number | null;
  /** Display text of own answer (legacy + UI) */
  body: string;
  createdAt: string;
};

export type MilestoneKind = "anniversary" | "date" | "trip" | "other";

export type Milestone = {
  id: string;
  coupleId: string;
  title: string;
  kind: MilestoneKind;
  date: string;
  createdBy: string;
  createdAt: string;
};

export type DesireToggle = {
  id: string;
  coupleId: string;
  userId: string;
  optionId: string;
  createdAt: string;
};

export type CouponStatus = "offered" | "accepted" | "redeemed" | "expired";

export type Coupon = {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  title: string;
  body: string;
  reason: string | null;
  categoryId: string | null;
  ideaId: string | null;
  useOption: string | null;
  expiresAt: string | null;
  status: CouponStatus;
  createdAt: string;
  acceptedAt: string | null;
  redeemedAt: string | null;
};

export type ScratchKind = "date" | "evening" | "dare";

export type ScratchReveal = {
  id: string;
  coupleId: string;
  userId: string;
  kind: ScratchKind;
  title: string;
  body: string;
  createdAt: string;
};

export type JarNote = {
  id: string;
  coupleId: string;
  fromUserId: string;
  body: string;
  createdAt: string;
  openedAt: string | null;
  openAt: string | null;
  openOption: string | null;
};

export type JarOpenVote = {
  id: string;
  coupleId: string;
  userId: string;
  date: string;
};

export type BucketKind = "place" | "meal" | "trip" | "other";

export type BucketItem = {
  id: string;
  coupleId: string;
  title: string;
  kind: BucketKind;
  notes: string;
  scheduledOn: string | null;
  doneAt: string | null;
  createdBy: string;
  createdAt: string;
};

export type RitualCheck = {
  id: string;
  coupleId: string;
  ritualId: string;
  date: string;
  userId: string;
  createdAt: string;
};

export type PushSubscriptionRow = {
  id: string;
  userId: string;
  coupleId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  updatedAt: string;
};

export type TalkReaction = "up" | "down";

export type TalkDeckState = {
  id: string;
  coupleId: string;
  userId: string;
  categoryId: string;
  queue: string[];
  played: string[];
};

export type TalkDraw = {
  id: string;
  coupleId: string;
  userId: string;
  categoryId: string;
  questionId: string;
  date: string;
  body: string;
  reaction: TalkReaction | null;
  answeredAt: string | null;
  createdAt: string;
};

export type DareDirection = "i-do-you" | "you-do-me";

export type DareTimeframe = "tonight" | "24h" | "custom";

export type DarePlayStatus = "offered" | "accepted" | "declined" | "done";

export type SpicyDarePlay = {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  dareId: string | null;
  text: string;
  categories: string[];
  direction: DareDirection;
  timeframe: DareTimeframe;
  customWhen: string | null;
  dueAt: string | null;
  status: DarePlayStatus;
  createdAt: string;
  answeredAt: string | null;
  completedAt: string | null;
};

export type AppDB = {
  profiles: Profile[];
  couples: Couple[];
  cards: Card[];
  games: GameSession[];
  gamePlayers: GamePlayer[];
  deck: DeckCard[];
  ratings: CardRating[];
  checkIns: CheckIn[];
  checkInRequests: CheckInRequest[];
  curiosityAnswers: CuriosityAnswer[];
  milestones: Milestone[];
  desireToggles: DesireToggle[];
  coupons: Coupon[];
  scratches: ScratchReveal[];
  jarNotes: JarNote[];
  jarOpenVotes: JarOpenVote[];
  bucketItems: BucketItem[];
  ritualChecks: RitualCheck[];
  pushSubscriptions: PushSubscriptionRow[];
  talkDecks: TalkDeckState[];
  talkDraws: TalkDraw[];
  spicyDares: SpicyDarePlay[];
};

export type GameModule = {
  key: GameKey;
  title: string;
  tagline: string;
  available: boolean;
};
