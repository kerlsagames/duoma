export const STAGES = [
  "pre_foreplay",
  "foreplay",
  "step_it_up",
  "finish_off",
  "afterglow",
] as const;

export type CardStage = (typeof STAGES)[number];

export type GameKey = "get-spicy" | "lets-talk";

/** Live deal-3 play. Legacy random / pick_your_own may still appear in old saves. */
export type GameMode = "deal" | "random" | "pick_your_own";

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

/** Shuffle budget: 0–10, or -1 for unlimited. */
export type ShuffleLimit = number;

export type Gender = "male" | "female";

export type Profile = {
  id: string;
  displayName: string;
  gender: Gender | null;
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
  /** Passes each player gets ("I don't participate"). 0–5. */
  blockLimit: number;
  /**
   * Shuffles each player gets to redraw their 3-card hand.
   * 0–10, or -1 for unlimited.
   */
  shuffleLimit: ShuffleLimit;
  stageCounts: StageCounts;
  /** Enabled flavor tag ids from Get Spicy setup checkboxes. */
  flavorTags: string[];
  currentStage: CardStage | null;
  activeCardId: string | null;
  turnUserId: string | null;
  activePlayedBy: string | null;
  /** Card ids currently dealt to the turn player (up to 3). */
  handCardIds: string[];
  /** Suspense reveal before Finish Off / Afterglow assignment. */
  awaitingFinishReveal: boolean;
  /** Who chooses the Finish Off card(s). */
  finishPickerId: string | null;
  /** Who chooses the Afterglow card(s). */
  afterglowPickerId: string | null;
  awaitingPrivate: boolean;
  privateUnlocked: boolean;
  playedDate: string | null;
  /** When ratings finished / night closed. Used for calendar time. */
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GamePlayer = {
  gameId: string;
  userId: string;
  /** Passes remaining ("I don't participate"). */
  blocksRemaining: number;
  /** Shuffles remaining; -1 means unlimited. */
  shufflesRemaining: number;
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

export type TonightSex = "yes" | "maybe" | "no";

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

/** Shared couple bucket lists (Movies, Places, custom, …). */
export type CoupleList = {
  id: string;
  coupleId: string;
  title: string;
  emoji: string;
  accent: string;
  starterKey: string | null;
  /** When set, list is hidden from the Open lists screen. */
  hiddenAt: string | null;
  createdBy: string;
  createdAt: string;
};

export type ListEntry = {
  id: string;
  listId: string;
  coupleId: string;
  title: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  completedBy: string | null;
};

export type ListEntryRating = {
  id: string;
  entryId: string;
  coupleId: string;
  userId: string;
  stars: number;
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
  /** @deprecated Kept for older saves; Talk no longer uses notes. */
  body: string;
  /** @deprecated Kept for older saves; Talk no longer uses thumbs. */
  reaction: TalkReaction | null;
  answeredAt: string | null;
  /** One free reshuffle per draw per day. */
  shuffledToday: boolean;
  createdAt: string;
};

export type TalkVaultEntry = {
  id: string;
  coupleId: string;
  userId: string;
  categoryId: string;
  questionId: string;
  text: string;
  readAt: string;
  source: "answered" | "shuffled";
};

export type DareDirection = "i-do-you" | "you-do-me";

export type DareTimeframe =
  | "tonight"
  | "weekend"
  | "7d"
  | "30d"
  | "none"
  | "custom"
  | "24h"; // legacy

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

export type PositionInviteStatus =
  | "offered"
  | "accepted"
  | "declined"
  | "done";

/** Partner ping for a suggested sex position. */
export type PositionInvite = {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  positionId: string;
  status: PositionInviteStatus;
  createdAt: string;
  answeredAt: string | null;
  completedAt: string | null;
};

export type RoleplayInviteStatus =
  | "offered"
  | "accepted"
  | "declined"
  | "done";

/** Partner ping for a suggested roleplay scenario. */
export type RoleplayInvite = {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  roleplayId: string;
  status: RoleplayInviteStatus;
  createdAt: string;
  answeredAt: string | null;
  completedAt: string | null;
};

/** User-added calendar entries (dates, plans, notes). */
export type CalendarCustomEvent = {
  id: string;
  coupleId: string;
  title: string;
  notes: string;
  date: string;
  /** ISO timestamp for sorting / clock display on that day. */
  happenedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
  coupleLists: CoupleList[];
  listEntries: ListEntry[];
  listEntryRatings: ListEntryRating[];
  jarNotes: JarNote[];
  jarOpenVotes: JarOpenVote[];
  bucketItems: BucketItem[];
  ritualChecks: RitualCheck[];
  pushSubscriptions: PushSubscriptionRow[];
  talkDecks: TalkDeckState[];
  talkDraws: TalkDraw[];
  talkVault: TalkVaultEntry[];
  spicyDares: SpicyDarePlay[];
  positionInvites: PositionInvite[];
  roleplayInvites: RoleplayInvite[];
  calendarEvents: CalendarCustomEvent[];
};

export type GameModule = {
  key: GameKey;
  title: string;
  tagline: string;
  available: boolean;
};
