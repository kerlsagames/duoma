import { cloneDefaultDeck, getSpicySeeds } from "@/games/get-spicy";
import {
  buildRandomDeck,
  dealHandFromBank,
  dealFinishHandFromBank,
  DEFAULT_STAGE_COUNTS,
  SIMPLE_STAGE_COUNTS,
  firstActiveStage,
  handSizeForPace,
  isSimpleOpenStage,
  nextActiveStage,
  normalizePassLimit,
  normalizeShuffleLimit,
  normalizeStageCounts,
  pickSimpleActor,
  playedCountForStage,
  replacementCard,
  simpleCanLeaveFinish,
  STAGE_ORDER,
} from "@/games/get-spicy/engine";
import { cardAllowedByFlavorTags, defaultEnabledFlavorTags, normalizeFlavorTags } from "@/games/get-spicy/flavor-tags";
import { cardFinishClimax, climaxHintForCard } from "@/games/get-spicy/finish-climax";
import {
  mergeHubBundle,
  pullCoupleHub,
  pushHubItems,
  subscribeCoupleHub,
  type HubKind,
} from "@/lib/hub-sync";
import {
  absorbCoupleState,
  adoptMemberRows,
  isCoupleUuid,
  mergeCoupleDb,
  remapCoupleSlice,
  rewriteCoupleIds,
  scheduleCoupleBackup,
} from "@/lib/couple-backup";
import { bumpAppSeconds, currentDwellApp } from "@/lib/app-dwell";
import { resolveCardGenders } from "@/lib/personalize";
import { pokeAppMeta, POKE_COOLDOWN_MS, latestPokeAt } from "@/lib/partner-poke";
import { chickenDareById, chickenPackById, type ChickenPackId } from "@/lib/chicken";
import { createId, createInviteCode, nowIso } from "@/lib/ids";
import { daysUntil, formatLongDate, localDateKey } from "@/lib/dates";
import {
  ALL_DESIRE_OPTIONS,
  hashPick,
  SCRATCH_POOLS,
} from "@/lib/hub";
import {
  CUSTOM_LIST_ACCENTS,
  STARTER_LISTS,
  clampScore,
} from "@/lib/lists";
import {
  curiositySynergy,
  dailyCuriosityQuestion,
  isCuriosityComplete,
} from "@/lib/curiosity";
import { discoverQuestionById } from "@/lib/discover-questions";
import { notifyUser, upsertCloudSubscription } from "@/lib/notify";
import { positionById } from "@/lib/sex-positions";
import { roleplayById } from "@/lib/roleplays";
import { nightAskLabel } from "@/lib/play-items";
import {
  buildFeedbackNote,
  hydrateFeedbackNote,
  prefixFeedbackBody,
  readLocalFeedback,
  writeLocalFeedback,
  type FeedbackNote,
} from "@/lib/feedback";
import {
  broadcastSafetyEvent,
  safetyEventNow,
  stripCoupleFromDb,
  wipeLocalMediaCaches,
} from "@/lib/safety";
import {
  buildContentReport,
  hydrateContentReport,
  readLocalReports,
  writeLocalReports,
  type ContentReport,
  type ReportReasonId,
} from "@/lib/reports";
import { bindMiniAppsCouple, wipeMiniApps, wipeMiniAppsForCouple } from "@/lib/mini-apps";
import {
  registerDuomaWorker,
  sendPushToSubscriptions,
  showLocalPush,
  subscribeToPush,
} from "@/lib/push";
import {
  emptyDb,
  readDb,
  readDemoUserId,
  readLastUserId,
  readLiveUserId,
  readSessionUserId,
  writeDb,
  writeDemoUserId,
  writeLastUserId,
  writeLiveUserId,
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
  CoupleList,
  CuriosityAnswer,
  CuriositySkip,
  ListEntry,
  ListEntryRating,
  DeckCard,
  DesireToggle,
  FantasyCompletion,
  FantasySwipe,
  FantasyTonightAsk,
  DesireGauge,
  TonightSex,
  GameMode,
  GameSession,
  JarNote,
  Milestone,
  MilestoneKind,
  MoodWeather,
  Gender,
  Profile,
  PushSubscriptionRow,
  ScratchKind,
  ScratchReveal,
  SocialBattery,
  SpicyPace,
  StageCounts,
  TodayNeed,
  TalkDeckState,
  TalkDraw,
  TalkVaultEntry,
  TalkReaction,
  DareDirection,
  DareTimeframe,
  SpicyDarePlay,
  PartnerPoke,
  PositionInvite,
  RoleplayInvite,
  RoleplaySave,
  DareSave,
  DateNightAsk,
  PositionSave,
  PlayItemRating,
  CalendarCustomEvent,
  ChickenPlay,
  ErrandItem,
  ErrandKind,
  CustomMeal,
  HiddenMeal,
  MealRound,
  MealVoteKind,
  MealWant,
} from "@/lib/types";
import {
  combineMenu,
  customMealToIdea,
  mealById,
  pickRandomMeal,
  type MealCategoryId,
} from "@/lib/meals";
import {
  categoryById,
  ensureDeck,
  markPlayed,
  nextQuestionId,
  questionById,
  rotatePlayed,
  TALKS_PER_DAY,
  todaysDraw,
  todaysPick,
  todaysPicks,
  vaultQuestionIds,
} from "@/lib/talk";
import {
  SPICY_DARE_DECK_ID,
  dareById,
  dueAtForTimeframe,
  isSpicyDareDeck,
  personalizeDareText,
} from "@/lib/spicy-dares";
import {
  demoLikedFantasyIds,
  fantasyById,
  fantasyIdeas,
} from "@/lib/fantasy-matcher";
import { subscribeCatalog } from "@/lib/catalog-overlay";
import { isCreatorEmail, pardonCreator } from "@/lib/creator";
import { deviceTimezone } from "@/lib/legal";
import {
  absorbCloudSession,
  cloudAccountsOn,
  loadCloudDirectory,
  readPendingPair,
  registerPasswordPair,
  sendLoginOtp,
  signInWithPasswordAccount,
  updateAccountPassword,
  verifyPairOtp,
} from "@/lib/cloud-pair";
import { loadAdminInbox } from "@/lib/admin-inbox";
import {
  adminBan,
  adminResolveReport,
  adminSubmitFeedback,
  adminTouchUsage,
  adminUnban,
  loadAdminSnapshot,
} from "@/lib/admin-snapshot";
import { supabase } from "@/lib/supabase";
import type { MiniState } from "@/lib/mini-content";
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
let liveUserId: string | null = null;
let demoUserId: string | null = null;
let directoryProfiles: Profile[] = [];
let directoryCouples: Couple[] = [];
let inboxFeedback: FeedbackNote[] = [];
let inboxMinis: Record<string, MiniState> = {};
let inboxSlices: Record<string, Partial<AppDB>> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function persist(opts?: { skipDwell?: boolean }) {
  if (!opts?.skipDwell && !sessionIsDemo() && sessionUserId) {
    const appId = currentDwellApp();
    if (appId) {
      const current = db.profiles.find((row) => row.id === sessionUserId);
      if (current) {
        const nextSeconds = (current.activeSeconds ?? 0) + 15;
        const appSeconds = bumpAppSeconds(current.appSeconds, appId, 15);
        db = {
          ...db,
          profiles: db.profiles.map((row) =>
            row.id === sessionUserId
              ? {
                  ...row,
                  activeSeconds: nextSeconds,
                  appSeconds,
                  lastSeenAt: nowIso(),
                }
              : row
          ),
        };
      }
    }
  }
  await writeDb(db);
  emit();
  if (typeof BroadcastChannel !== "undefined") {
    new BroadcastChannel(CHANNEL_NAME).postMessage({ at: Date.now() });
  }
  if (!sessionIsDemo() && sessionUserId) {
    const couple = coupleForUser(sessionUserId);
    if (couple?.id) {
      const staleIds = db.couples
        .filter((row) => {
          if (row.id === couple.id) return false;
          if (couple.inviteCode && row.inviteCode === couple.inviteCode) return true;
          return row.partnerA === sessionUserId || row.partnerB === sessionUserId;
        })
        .map((row) => row.id);
      if (staleIds.length) db = rewriteCoupleIds(db, staleIds, couple.id);
      db = adoptMemberRows(db, sessionUserId, couple.id);
      scheduleCoupleBackup(couple.id, db);
    }
  }
}

function mergeCloudPair(input: {
  profile: Profile;
  partner: Profile | null;
  couple: Couple;
}) {
  const profiles = [...db.profiles];
  const put = (next: Profile) => {
    const index = profiles.findIndex((row) => row.id === next.id);
    if (index >= 0) profiles[index] = { ...profiles[index], ...next };
    else profiles.push(next);
  };
  put(input.profile);
  if (input.partner) put(input.partner);
  const couples = [...db.couples];
  const coupleIndex = couples.findIndex((row) => row.id === input.couple.id);
  if (coupleIndex >= 0) couples[coupleIndex] = { ...couples[coupleIndex], ...input.couple };
  else couples.push(input.couple);
  let cards = db.cards;
  if (!cards.some((card) => card.coupleId === input.couple.id && card.isDefault)) {
    cards = [...cards, ...cloneDefaultDeck(input.couple.id, input.profile.id)];
  }
  db = { ...db, profiles, couples, cards };
  const staleIds = couples
    .filter((row) => {
      if (row.id === input.couple.id) return false;
      if (input.couple.inviteCode && row.inviteCode === input.couple.inviteCode) return true;
      return (
        row.partnerA === input.profile.id ||
        row.partnerB === input.profile.id ||
        (input.partner && (row.partnerA === input.partner.id || row.partnerB === input.partner.id))
      );
    })
    .map((row) => row.id);
  if (staleIds.length) db = rewriteCoupleIds(db, staleIds, input.couple.id);
}

async function absorbHubForCouple(coupleId: string | null | undefined) {
  if (!coupleId || sessionIsDemo()) return;
  const bundle = await pullCoupleHub(coupleId);
  if (bundle) db = mergeHubBundle(db, coupleId, bundle);
  db = await absorbCoupleState(coupleId, db);
}

function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of local) map.set(row.id, row);
  for (const row of remote) {
    map.set(row.id, { ...(map.get(row.id) as T | undefined), ...row });
  }
  return [...map.values()];
}

function laterStamp(a?: string | null, b?: string | null): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a >= b ? a : b;
}

function mergeProfiles(local: Profile[], remote: Profile[]): Profile[] {
  const map = new Map<string, Profile>();
  for (const row of local) map.set(row.id, row);
  for (const row of remote) {
    const prev = map.get(row.id);
    if (!prev) {
      map.set(row.id, row);
      continue;
    }
    map.set(row.id, {
      ...prev,
      ...row,
      activeSeconds: Math.max(prev.activeSeconds ?? 0, row.activeSeconds ?? 0),
      appSeconds: { ...prev.appSeconds, ...row.appSeconds },
      lastSeenAt: laterStamp(prev.lastSeenAt, row.lastSeenAt),
    });
  }
  return [...map.values()];
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
  const seedByTitle = new Map(getSpicySeeds().map((seed) => [seed.title, seed]));
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
        const nextClimax =
          seed.category === "finish_off"
            ? seed.climax ??
              climaxHintForCard({
                title: seed.title,
                body: seed.description,
              })
            : card.climax;
        if (
          card.stage !== seed.category ||
          card.body !== seed.description ||
          card.sortOrder !== seed.order ||
          card.climax !== nextClimax
        ) {
          changed = true;
          return {
            ...card,
            stage: seed.category,
            body: seed.description,
            sortOrder: seed.order,
            climax: nextClimax,
          };
        }
        return card;
      }),
    };

    const missing = getSpicySeeds().filter((seed) => !byTitle.has(seed.title));
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
            climax:
              seed.climax ??
              (seed.category === "finish_off"
                ? climaxHintForCard({
                    title: seed.title,
                    body: seed.description,
                  })
                : undefined),
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
  const hits = db.couples.filter(
    (couple) => couple.partnerA === userId || couple.partnerB === userId
  );
  return hits.find((row) => isCoupleUuid(row.id)) ?? hits[0] ?? null;
}

function otherUserId(couple: Couple, userId: string): string | null {
  if (couple.partnerA === userId) return couple.partnerB;
  if (couple.partnerB === userId) return couple.partnerA;
  return null;
}

function profileById(userId: string | null): Profile | null {
  if (!userId) return null;
  return db.profiles.find((profile) => profile.id === userId) ?? null;
}

function findDemoCouple(): Couple | null {
  return (
    db.couples.find((row) => {
      const a = profileById(row.partnerA);
      const b = profileById(row.partnerB);
      if (!a?.isDemo && !b?.isDemo) return false;
      // Never treat the live pairing as the Riley sandbox.
      if (liveUserId && (row.partnerA === liveUserId || row.partnerB === liveUserId)) {
        return false;
      }
      return true;
    }) ?? null
  );
}

function demoYouIdForCouple(couple: Couple): string {
  const a = profileById(couple.partnerA);
  const b = profileById(couple.partnerB);
  if (a && !a.isDemo) return a.id;
  if (b && !b.isDemo) return b.id;
  return couple.partnerA;
}

function sessionIsDemo(): boolean {
  if (!sessionUserId) return false;
  if (demoUserId && sessionUserId === demoUserId) return true;
  if (liveUserId && sessionUserId === liveUserId) return false;
  const me = profileById(sessionUserId);
  if (isCreatorEmail(me?.email)) return false;
  const couple = coupleForUser(sessionUserId);
  if (!couple) return false;
  return Boolean(profileById(otherUserId(couple, sessionUserId))?.isDemo);
}

function creatorOnThisPhone(): Profile | null {
  const session = profileById(sessionUserId);
  if (isCreatorEmail(session?.email)) return session;
  const live = profileById(liveUserId);
  if (isCreatorEmail(live?.email)) return live;
  return db.profiles.find((profile) => isCreatorEmail(profile.email)) ?? null;
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
  const senderEndpoints = new Set(
    db.pushSubscriptions
      .filter((row) => row.userId === user.id)
      .map((row) => row.endpoint)
  );
  void notifyUser(target, db.pushSubscriptions, payload, senderEndpoints);
}

function pairGenders(couple: Couple | null | undefined) {
  const a = couple ? profileById(couple.partnerA) : null;
  const b = couple?.partnerB ? profileById(couple.partnerB) : null;
  return {
    maleId:
      a?.gender === "male" ? a.id : b?.gender === "male" ? b.id : null,
    femaleId:
      a?.gender === "female" ? a.id : b?.gender === "female" ? b.id : null,
  };
}

function simpleActorFor(
  couple: Couple,
  game: GameSession,
  extra: {
    stage?: GameSession["currentStage"];
    finishAwaitingMale?: boolean;
    currentActorId?: string | null;
    flip?: boolean;
  } = {}
) {
  const genders = pairGenders(couple);
  return pickSimpleActor({
    couple,
    maleId: genders.maleId,
    femaleId: genders.femaleId,
    stage: extra.stage ?? game.currentStage,
    finishAwaitingMale: extra.finishAwaitingMale ?? game.finishAwaitingMale,
    currentActorId: extra.currentActorId ?? game.turnUserId ?? game.activePlayedBy,
    initiatorId: game.initiatorId,
    flip: extra.flip ?? false,
  });
}

function shareHub(
  couple: Couple | null | undefined,
  items: {
    kind: HubKind;
    payload:
      | CheckIn
      | CheckInRequest
      | PositionInvite
      | RoleplayInvite
      | CalendarCustomEvent;
  }[]
) {
  if (!couple || sessionIsDemo() || items.length === 0) return;
  void pushHubItems(couple.id, items);
}

type CreateAccountInput = {
  displayName: string;
  gender: Gender;
  email?: string;
  password?: string;
};
type JoinInput = {
  displayName: string;
  gender: Gender;
  code: string;
  email?: string;
  password?: string;
};

export type BestCard = {
  card: Card;
  average: number;
  votes: number;
};

type AppContextValue = {
  ready: boolean;
  usingCloud: boolean;
  cloudLive: boolean;
  user: Profile | null;
  partner: Profile | null;
  couple: Couple | null;
  cards: Card[];
  game: GameSession | null;
  deck: DeckCard[];
  ratings: CardRating[];
  myBlocksRemaining: number;
  partnerBlocksRemaining: number;
  myShufflesRemaining: number;
  partnerShufflesRemaining: number;
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
  curiositySkips: CuriositySkip[];
  curiosityMatchScore: {
    matchScore: number;
    daysPlayed: number;
    matchRate: number;
  };
  milestones: Milestone[];
  desireToggles: DesireToggle[];
  fantasySwipes: FantasySwipe[];
  fantasyTonightAsks: FantasyTonightAsk[];
  fantasyCompletions: FantasyCompletion[];
  coupons: Coupon[];
  scratches: ScratchReveal[];
  coupleLists: CoupleList[];
  listEntries: ListEntry[];
  listEntryRatings: ListEntryRating[];
  jarNotes: JarNote[];
  bucketItems: BucketItem[];
  ritualChecks: AppDB["ritualChecks"];
  dateNightAsks: DateNightAsk[];
  positionSaves: PositionSave[];
  playItemRatings: PlayItemRating[];
  jarOpenVotes: AppDB["jarOpenVotes"];
  pushSubscriptions: PushSubscriptionRow[];
  talkDecks: TalkDeckState[];
  talkDraws: TalkDraw[];
  talkVault: TalkVaultEntry[];
  spicyDares: SpicyDarePlay[];
  partnerPokes: PartnerPoke[];
  chickenPlays: ChickenPlay[];
  positionInvites: PositionInvite[];
  roleplayInvites: RoleplayInvite[];
  roleplaySaves: RoleplaySave[];
  dareSaves: DareSave[];
  calendarEvents: CalendarCustomEvent[];
  errandItems: ErrandItem[];
  mealRounds: MealRound[];
  mealWants: MealWant[];
  customMeals: CustomMeal[];
  hiddenMeals: HiddenMeal[];
  /** Full deck history (all games) for calendar night detail. */
  allDeck: DeckCard[];
  allProfiles: Profile[];
  allCouples: Couple[];
  allCards: Card[];
  adminDb: AppDB;
  adminMinis: Record<string, MiniState>;
  pairError: string | null;
  createAccount: (input: CreateAccountInput) => Promise<void>;
  joinWithCode: (input: JoinInput) => Promise<void>;
  continueAsSaved: () => Promise<void>;
  addDemoPartner: (name?: string, gender?: Gender) => Promise<void>;
  enterDemo: (name?: string, gender?: Gender) => Promise<void>;
  leaveDemo: () => Promise<void>;
  ensureDemoPair: () => Promise<void>;
  demoMode: boolean;
  canUseDemo: boolean;
  setProfileGender: (who: "you" | "partner", gender: Gender) => Promise<void>;
  banAccount: (profileId: string, reason: string) => Promise<void>;
  unbanAccount: (profileId: string) => Promise<void>;
  refreshCloudAccounts: () => Promise<void>;
  requestEmailCode: (email: string) => Promise<void>;
  verifyEmailCode: (token: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  setAccountPassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  unpairAndWipe: () => Promise<void>;
  deleteOwnAccount: () => Promise<void>;
  submitContentReport: (input: {
    reason: ReportReasonId;
    details?: string;
    reportedUserId?: string | null;
    mediaId?: string | null;
    mediaKind: import("@/lib/reports").ContentReport["mediaKind"];
  }) => Promise<void>;
  resolveContentReport: (
    id: string,
    action: "dismiss" | "action_taken"
  ) => Promise<void>;
  contentReports: import("@/lib/reports").ContentReport[];
  sendFeedback: (body: string, source?: string) => Promise<void>;
  feedbackNotes: import("@/lib/feedback").FeedbackNote[];
  sendSpicyInvite: () => Promise<void>;
  acceptInvite: () => Promise<void>;
  declineInvite: () => Promise<void>;
  configureGame: (input: {
    blockLimit: number;
    shuffleLimit: number;
    stageCounts: StageCounts;
    flavorTags: string[];
    pace?: SpicyPace;
  }) => Promise<void>;
  toggleDeckPick: (cardId: string) => Promise<void>;
  fillPicksRandomly: () => Promise<void>;
  lockInPicks: () => Promise<void>;
  dealHand: () => Promise<void>;
  shuffleHand: () => Promise<void>;
  chooseHandCard: (cardId: string) => Promise<void>;
  completeActiveCard: () => Promise<void>;
  playDemoPartnerTurn: () => Promise<void>;
  resolveFinishReveal: () => Promise<void>;
  playCard: () => Promise<void>;
  blockCard: () => Promise<void>;
  unlockPrivate: () => Promise<void>;
  readyToMoveOn: () => Promise<void>;
  skipSimpleCard: () => Promise<void>;
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
  submitDiscoverAnswer: (questionId: string, body?: string) => Promise<void>;
  skipDiscover: (questionId: string) => Promise<void>;
  restoreDiscoverSkip: (questionId: string) => Promise<void>;
  undoDiscover: (questionId: string) => Promise<void>;
  drawTalkQuestion: (categoryId: string) => Promise<TalkDraw>;
  shuffleTalkQuestion: (categoryId?: string) => Promise<TalkDraw>;
  submitTalkAnswer: (input?: { categoryId?: string }) => Promise<void>;
  sendSpicyDare: (input: {
    dareId: string | null;
    text: string;
    categories?: string[];
    direction: DareDirection | null;
    timeframe: DareTimeframe;
    customWhen?: string | null;
  }) => Promise<void>;
  respondSpicyDare: (id: string, status: "accepted" | "declined") => Promise<void>;
  completeSpicyDare: (id: string) => Promise<void>;
  markSpicyDareRead: (id: string) => Promise<void>;
  pokeSpicyDare: (id: string) => Promise<void>;
  pokePartner: (appId: string, targetId?: string) => Promise<void>;
  sendChickenDare: (input: {
    dareId: string | null;
    text: string;
    packId?: string | null;
  }) => Promise<void>;
  respondChickenDare: (id: string, status: "accepted" | "declined") => Promise<void>;
  completeChickenDare: (id: string) => Promise<void>;
  sendPositionInvite: (
    positionId: string,
    when?: { dateKey: string; label: string }
  ) => Promise<void>;
  respondPositionInvite: (
    id: string,
    status: "accepted" | "declined"
  ) => Promise<void>;
  completePositionInvite: (id: string) => Promise<void>;
  savePosition: (positionId: string) => Promise<PositionSave>;
  unsavePosition: (positionId: string) => Promise<void>;
  markPositionSaveDone: (id: string) => Promise<void>;
  ratePlayItem: (
    kind: PlayItemRating["kind"],
    targetId: string,
    stars: number
  ) => Promise<void>;
  sendDateNightAsk: (bucketId: string, dateKey?: string) => Promise<void>;
  respondDateNightAsk: (
    id: string,
    status: "accepted" | "declined"
  ) => Promise<void>;
  sendRoleplayInvite: (
    roleplayId: string,
    when?: { dateKey: string; label: string }
  ) => Promise<void>;
  respondRoleplayInvite: (
    id: string,
    status: "accepted" | "declined"
  ) => Promise<void>;
  completeRoleplayInvite: (id: string) => Promise<void>;
  saveRoleplay: (roleplayId: string) => Promise<RoleplaySave>;
  unsaveRoleplay: (roleplayId: string) => Promise<void>;
  markRoleplaySaveDone: (id: string) => Promise<void>;
  saveDare: (dareId: string) => Promise<DareSave>;
  unsaveDare: (dareId: string) => Promise<void>;
  markDareSaveDone: (id: string) => Promise<void>;
  addMilestone: (input: {
    title: string;
    kind: MilestoneKind;
    date: string;
  }) => Promise<void>;
  setFeaturedMilestone: (id: string) => Promise<void>;
  removeMilestone: (id: string) => Promise<void>;
  addCalendarEvent: (input: {
    title: string;
    notes?: string;
    date: string;
    happenedAt?: string;
    allDay?: boolean;
  }) => Promise<CalendarCustomEvent>;
  updateCalendarEvent: (
    id: string,
    input: {
      title: string;
      notes?: string;
      date: string;
      happenedAt?: string;
      allDay?: boolean;
    }
  ) => Promise<void>;
  removeCalendarEvent: (id: string) => Promise<void>;
  addErrandItem: (input: {
    title: string;
    kind: ErrandKind;
    notes?: string;
  }) => Promise<ErrandItem>;
  toggleErrandDone: (id: string) => Promise<void>;
  removeErrandItem: (id: string) => Promise<void>;
  clearDoneErrands: (kind?: ErrandKind | "all") => Promise<void>;
  spinMeal: (input?: {
    pool?: MealCategoryId[];
    mealId?: string | null;
    wantId?: string | null;
  }) => Promise<MealRound>;
  voteMeal: (roundId: string, vote: MealVoteKind) => Promise<MealRound | null>;
  sendMealWant: (input: {
    mealId?: string | null;
    title?: string;
  }) => Promise<MealWant>;
  dismissMealWant: (id: string) => Promise<void>;
  addCustomMeal: (input: {
    title: string;
    blurb?: string;
    category: MealCategoryId;
  }) => Promise<CustomMeal>;
  removeMealFromMenu: (mealId: string) => Promise<void>;
  toggleDesire: (optionId: string) => Promise<void>;
  /** Swipe a Fantasy Matcher card. Returns whether it just became a mutual match. */
  swipeFantasy: (
    fantasyId: string,
    liked: boolean
  ) => Promise<{ matched: boolean }>;
  forgetFantasySwipe: (fantasyId: string) => Promise<void>;
  askFantasyTonight: (fantasyId: string) => Promise<void>;
  respondFantasyTonight: (
    id: string,
    status: "accepted" | "declined"
  ) => Promise<void>;
  completeFantasyMatch: (fantasyId: string) => Promise<void>;
  reopenFantasyMatch: (fantasyId: string) => Promise<void>;
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
  ensureStarterLists: () => Promise<void>;
  createCoupleList: (input: {
    title: string;
    emoji?: string;
  }) => Promise<CoupleList | null>;
  setListHidden: (listId: string, hidden: boolean) => Promise<void>;
  addListEntry: (input: {
    listId: string;
    title: string;
    notes?: string;
  }) => Promise<void>;
  completeListEntry: (entryId: string) => Promise<void>;
  rateListEntry: (entryId: string, stars: number) => Promise<void>;
  reopenListEntry: (entryId: string) => Promise<void>;
  addJarNote: (input: {
    body: string;
    openOption?: string | null;
    openAt?: string | null;
  }) => Promise<void>;
  voteOpenJar: () => Promise<void>;
  openJarNote: (noteId: string) => Promise<void>;
  addBucketItem: (input: {
    title: string;
    kind: BucketKind;
    notes?: string;
    scheduledOn?: string | null;
    sourceId?: string | null;
  }) => Promise<BucketItem>;
  spinDateNight: () => Promise<BucketItem | null>;
  markBucketDone: (id: string) => Promise<void>;
  toggleRitual: (ritualId: string) => Promise<void>;
  enablePush: () => Promise<void>;
  sendTestPush: () => Promise<void>;
  notifyPartner: (payload: { title: string; body: string; url: string }) => void;
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
  const [pairError, setPairError] = useState<string | null>(null);
  const [cloudLive, setCloudLive] = useState(false);

  const bump = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    const unsub = subscribe(bump);
    const unsubCatalog = subscribeCatalog(() => {
      void (async () => {
        if (syncDefaultCards()) await persist();
        else bump();
      })();
    });
    let channel: BroadcastChannel | null = null;
    let authSub: { unsubscribe: () => void } | null = null;

    const applyCloudSession = async () => {
      if (!cloudAccountsOn()) return false;
      try {
        const absorbed = await absorbCloudSession();
        if (!absorbed) return false;
        const profile = pardonCreator(absorbed.profile);
        mergeCloudPair({ ...absorbed, profile });
        liveUserId = profile.id;
        lastUserId = profile.id;
        await writeLiveUserId(profile.id);
        await writeLastUserId(profile.id);
        if (!sessionIsDemo()) {
          sessionUserId = profile.id;
          await writeSessionUserId(profile.id);
          await absorbHubForCouple(absorbed.couple.id);
        }
        setPairError(null);
        return true;
      } catch (err) {
        setPairError(err instanceof Error ? err.message : "Could not open this pair.");
        return false;
      }
    };

    (async () => {
      db = await readDb();
      const localReports = await readLocalReports();
      if (localReports.length) {
        const seen = new Set((db.contentReports ?? []).map((row) => row.id));
        const extra = localReports.filter((row) => !seen.has(row.id));
        if (extra.length) {
          db = { ...db, contentReports: [...(db.contentReports ?? []), ...extra] };
        }
      }
      const localFeedback = await readLocalFeedback();
      if (localFeedback.length) {
        const seen = new Set((db.feedbackNotes ?? []).map((row) => row.id));
        const extra = localFeedback.filter((row) => !seen.has(row.id));
        if (extra.length) {
          db = { ...db, feedbackNotes: [...(db.feedbackNotes ?? []), ...extra] };
        }
      }
      const pardoned = db.profiles.map(pardonCreator);
      const clearedBan = pardoned.some((profile, index) => profile !== db.profiles[index]);
      if (clearedBan) db = { ...db, profiles: pardoned };
      sessionUserId = await readSessionUserId();
      lastUserId = await readLastUserId();
      liveUserId = await readLiveUserId();
      demoUserId = await readDemoUserId();
      const known = (id: string | null) =>
        Boolean(id && db.profiles.some((profile) => profile.id === id));
      if (!known(sessionUserId) && known(liveUserId)) {
        sessionUserId = liveUserId;
        await writeSessionUserId(liveUserId);
      }
      if (!known(sessionUserId) && known(lastUserId) && lastUserId !== demoUserId) {
        sessionUserId = lastUserId;
        await writeSessionUserId(lastUserId);
      }
      if (!known(sessionUserId)) {
        const resume =
          (known(liveUserId) ? liveUserId : null) ??
          db.profiles.find((profile) => isCreatorEmail(profile.email))?.id ??
          db.profiles.find((profile) => !profile.isDemo)?.id ??
          null;
        if (resume) {
          sessionUserId = resume;
          lastUserId = resume;
          await writeSessionUserId(resume);
          await writeLastUserId(resume);
        }
      }
      const absorbed = await applyCloudSession();
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        setCloudLive(Boolean(sessionData.session?.user));
      }
      if (syncDefaultCards() || absorbed || clearedBan) {
        await persist();
      } else {
        bump();
      }
      setReady(true);
    })();

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
          setCloudLive(true);
          void applyCloudSession().then((changed) => {
            if (changed) void persist();
          });
        }
        if (event === "SIGNED_OUT") {
          setCloudLive(false);
          sessionUserId = null;
          void writeSessionUserId(null);
          emit();
        }
      });
      authSub = data.subscription;
    }

    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = async (event) => {
        const data = event?.data as { type?: string; coupleId?: string } | undefined;
        if (data?.type === "unpair" || data?.type === "delete-account") {
          if (data.type === "delete-account") {
            await wipeLocalMediaCaches();
            await wipeMiniApps();
          } else if (data.coupleId) {
            await wipeMiniAppsForCouple(data.coupleId);
          } else {
            await wipeLocalMediaCaches();
            await wipeMiniApps();
          }
        }
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
      unsubCatalog();
      authSub?.unsubscribe();
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
  useEffect(() => {
    void bindMiniAppsCouple(couple?.id ?? null);
  }, [couple?.id]);
  const partner = useMemo(() => {
    if (!couple || !user) return null;
    const partnerId = otherUserId(couple, user.id);
    return db.profiles.find((profile) => profile.id === partnerId) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  const demoMode = useMemo(() => sessionIsDemo(), [version]);
  const canUseDemo = useMemo(
    () => Boolean(creatorOnThisPhone()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  useEffect(() => {
    const client = supabase;
    if (!ready || !cloudAccountsOn() || !couple?.id || !client) return;
    let cancelled = false;
    const pull = async () => {
      try {
        const absorbed = await absorbCloudSession();
        if (cancelled || !absorbed) return;
        const profile = pardonCreator(absorbed.profile);
        mergeCloudPair({ ...absorbed, profile });
        liveUserId = profile.id;
        await writeLiveUserId(profile.id);
        if (!sessionIsDemo()) {
          sessionUserId = profile.id;
          lastUserId = profile.id;
          await writeSessionUserId(profile.id);
          await writeLastUserId(profile.id);
          await absorbHubForCouple(absorbed.couple.id);
        }
        await persist();
      } catch {
        // Waiting screen keeps polling.
      }
    };
    const channel = client
      .channel(`duoma-couple-${couple.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "couples", filter: `id=eq.${couple.id}` },
        () => {
          void pull();
        }
      )
      .subscribe();
    const stopHub = sessionIsDemo()
      ? () => undefined
      : subscribeCoupleHub(couple.id, (bundle) => {
          db = mergeHubBundle(db, couple.id, bundle);
          void persist();
        });
    if (!sessionIsDemo()) {
      void absorbHubForCouple(couple.id).then(() => persist());
    }
    const timer = couple.partnerB ? null : setInterval(() => void pull(), 4000);
    return () => {
      cancelled = true;
      void client.removeChannel(channel);
      stopHub();
      if (timer) clearInterval(timer);
    };
  }, [ready, couple?.id, couple?.partnerB]);

  useEffect(() => {
    if (!ready || !user?.id) return;
    const pulse = async (seconds = 30) => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      const current = db.profiles.find((row) => row.id === user.id);
      if (!current) return;
      const nextSeconds = (current.activeSeconds ?? 0) + seconds;
      const appSeconds = bumpAppSeconds(current.appSeconds, currentDwellApp(), seconds);
      const seen = nowIso();
      const zone = deviceTimezone();
      db = {
        ...db,
        profiles: db.profiles.map((row) =>
          row.id === user.id
            ? {
                ...row,
                activeSeconds: nextSeconds,
                appSeconds,
                lastSeenAt: seen,
                timezone: zone ?? row.timezone,
              }
            : row
        ),
      };
      await persist({ skipDwell: true });
      if (supabase && !sessionIsDemo()) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              active_seconds: nextSeconds,
              last_seen_at: seen,
              timezone: zone,
              app_seconds: appSeconds,
            })
            .eq("id", user.id);
          if (error) {
            const signed = await supabase.rpc("touch_profile_usage", {
              p_active_seconds: nextSeconds,
              p_app_seconds: appSeconds,
              p_timezone: zone ?? "",
            });
            if (signed.error) {
              await adminTouchUsage({
                userId: user.id,
                activeSeconds: nextSeconds,
                appSeconds,
                timezone: zone,
              });
            }
          }
        } catch {
          await adminTouchUsage({
            userId: user.id,
            activeSeconds: nextSeconds,
            appSeconds,
            timezone: zone,
          });
        }
      }
    };
    void pulse(15);
    const timer = setInterval(() => void pulse(30), 30_000);
    return () => clearInterval(timer);
  }, [ready, user?.id]);

  const allProfiles = useMemo(
    () => mergeProfiles(db.profiles, directoryProfiles),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const allCouples = useMemo(
    () => mergeById(db.couples, directoryCouples),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const allCards = useMemo(
    () => db.cards,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
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
  const myShufflesRemaining = useMemo(
    () =>
      db.gamePlayers.find(
        (row) => row.gameId === game?.id && row.userId === user?.id
      )?.shufflesRemaining ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const partnerShufflesRemaining = useMemo(
    () =>
      db.gamePlayers.find(
        (row) => row.gameId === game?.id && row.userId === partner?.id
      )?.shufflesRemaining ?? 0,
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
            ["completed", "rating", "playing", "setup", "selecting"].includes(
              row.status
            )
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const allDeck = useMemo(
    () => db.deck,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const calendarEvents = useMemo(
    () =>
      db.calendarEvents
        .filter((row) => row.coupleId === couple?.id)
        .sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const errandItems = useMemo(
    () =>
      db.errandItems
        .filter((row) => row.coupleId === couple?.id)
        .sort((a, b) => {
          const aDone = a.doneAt ? 1 : 0;
          const bDone = b.doneAt ? 1 : 0;
          if (aDone !== bDone) return aDone - bDone;
          return b.createdAt.localeCompare(a.createdAt);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const mealRounds = useMemo(
    () =>
      db.mealRounds
        .filter((row) => row.coupleId === couple?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const mealWants = useMemo(
    () =>
      db.mealWants
        .filter((row) => row.coupleId === couple?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const customMeals = useMemo(
    () =>
      db.customMeals
        .filter((row) => row.coupleId === couple?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const hiddenMeals = useMemo(
    () => db.hiddenMeals.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const contentReports = useMemo(
    () => db.contentReports ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const feedbackNotes = useMemo(
    () => {
      const map = new Map<string, FeedbackNote>();
      for (const row of db.feedbackNotes ?? []) map.set(row.id, row);
      for (const row of inboxFeedback) map.set(row.id, row);
      return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
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
  const curiositySkips = useMemo(
    () => (db.curiositySkips ?? []).filter((row) => row.coupleId === couple?.id),
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
  const talkVault = useMemo(
    () => db.talkVault.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const spicyDares = useMemo(
    () => (db.spicyDares ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const partnerPokes = useMemo(
    () => (db.partnerPokes ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const chickenPlays = useMemo(
    () => (db.chickenPlays ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const positionInvites = useMemo(
    () => db.positionInvites.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const positionSaves = useMemo(
    () => (db.positionSaves ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const dateNightAsks = useMemo(
    () => (db.dateNightAsks ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const playItemRatings = useMemo(
    () => (db.playItemRatings ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const roleplayInvites = useMemo(
    () => db.roleplayInvites.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const roleplaySaves = useMemo(
    () => (db.roleplaySaves ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const dareSaves = useMemo(
    () => (db.dareSaves ?? []).filter((row) => row.coupleId === couple?.id),
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
  const fantasySwipes = useMemo(
    () => db.fantasySwipes.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const fantasyTonightAsks = useMemo(
    () =>
      (db.fantasyTonightAsks ?? []).filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const fantasyCompletions = useMemo(
    () =>
      (db.fantasyCompletions ?? []).filter((row) => row.coupleId === couple?.id),
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
  const coupleLists = useMemo(
    () =>
      db.coupleLists
        .filter((row) => row.coupleId === couple?.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const listEntries = useMemo(
    () => db.listEntries.filter((row) => row.coupleId === couple?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
  const listEntryRatings = useMemo(
    () => db.listEntryRatings.filter((row) => row.coupleId === couple?.id),
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

  const createAccount = useCallback(async ({ displayName, gender, email, password }: CreateAccountInput) => {
    const trimmedEmail = email?.trim().toLowerCase() || "";
    if (cloudAccountsOn()) {
      if (!trimmedEmail) {
        throw new Error("Email is required so you can open this pair on a new phone.");
      }
      if (!password) {
        throw new Error("Set a password so you can open Duoma from the Home Screen without waiting on Gmail.");
      }
      setPairError(null);
      sessionUserId = null;
      await writeSessionUserId(null);
      emit();
      await registerPasswordPair(
        { intent: "create", displayName: displayName.trim() || "You", gender },
        trimmedEmail,
        password
      );
      const absorbed = await absorbCloudSession();
      if (!absorbed) {
        throw new Error("Signed in, but the pair is not ready yet.");
      }
      const profile = pardonCreator(absorbed.profile);
      mergeCloudPair({ ...absorbed, profile });
      liveUserId = profile.id;
      await writeLiveUserId(profile.id);
      await rememberUser(profile.id);
      await absorbHubForCouple(absorbed.couple.id);
      await persist();
      return;
    }
    const profile: Profile = {
      id: createId(),
      displayName: displayName.trim() || "You",
      gender,
      email: trimmedEmail || null,
      bannedAt: null,
      lastSeenAt: nowIso(),
      over18At: nowIso(),
      privacyConsentAt: nowIso(),
      moderationConsentAt: nowIso(),
      timezone: deviceTimezone(),
      activeSeconds: 0,
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

  const joinWithCode = useCallback(async ({ displayName, gender, code, email, password }: JoinInput) => {
    const normalized = code.trim().toUpperCase();
    const trimmedEmail = email?.trim().toLowerCase() || "";
    if (cloudAccountsOn()) {
      if (!trimmedEmail) {
        throw new Error("Email is required so you can open this pair on a new phone.");
      }
      if (!password) {
        throw new Error("Set a password so you can open Duoma from the Home Screen without waiting on Gmail.");
      }
      setPairError(null);
      sessionUserId = null;
      await writeSessionUserId(null);
      emit();
      await registerPasswordPair(
        {
          intent: "join",
          displayName: displayName.trim() || "You",
          gender,
          code: normalized,
        },
        trimmedEmail,
        password
      );
      const absorbed = await absorbCloudSession();
      if (!absorbed) {
        throw new Error("Signed in, but the pair is not ready yet.");
      }
      const profile = pardonCreator(absorbed.profile);
      mergeCloudPair({ ...absorbed, profile });
      liveUserId = profile.id;
      await writeLiveUserId(profile.id);
      await rememberUser(profile.id);
      await absorbHubForCouple(absorbed.couple.id);
      await persist();
      return;
    }
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
      gender,
      email: trimmedEmail || null,
      bannedAt: null,
      lastSeenAt: nowIso(),
      over18At: nowIso(),
      privacyConsentAt: nowIso(),
      moderationConsentAt: nowIso(),
      timezone: deviceTimezone(),
      activeSeconds: 0,
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
    if (cloudAccountsOn()) {
      try {
        const absorbed = await absorbCloudSession();
        if (absorbed) {
          const profile = pardonCreator(absorbed.profile);
          if (profile.bannedAt && !isCreatorEmail(profile.email)) {
            throw new Error(profile.bannedReason || "This account is banned.");
          }
          mergeCloudPair({ ...absorbed, profile });
          liveUserId = profile.id;
          await writeLiveUserId(profile.id);
          await rememberUser(profile.id);
          await absorbHubForCouple(absorbed.couple.id);
          await persist();
          setPairError(null);
          return;
        }
      } catch (err) {
        if (err instanceof Error && /banned/i.test(err.message)) throw err;
      }
      const saved = lastUserId
        ? db.profiles.find((profile) => profile.id === lastUserId)
        : null;
      if (saved?.bannedAt && !isCreatorEmail(saved.email)) {
        throw new Error(saved.bannedReason || "This account is banned.");
      }
      if (saved?.email) {
        throw new Error("SIGN_IN");
      }
      throw new Error("Sign in with your password, or create the pair again with your email.");
    }
    if (!lastUserId) return;
    const saved = db.profiles.find((profile) => profile.id === lastUserId);
    if (saved?.bannedAt && !isCreatorEmail(saved.email)) {
      throw new Error(saved.bannedReason || "This account is banned.");
    }
    sessionUserId = lastUserId;
    await writeSessionUserId(lastUserId);
    db = {
      ...db,
      profiles: db.profiles.map((profile) =>
        profile.id === lastUserId ? { ...profile, lastSeenAt: nowIso() } : profile
      ),
    };
    await persist();
  }, []);

  const refreshCloudAccounts = useCallback(async () => {
    const snapshot = await loadAdminSnapshot();
    if (snapshot) {
      directoryProfiles = snapshot.profiles;
      directoryCouples = snapshot.couples;
      inboxFeedback = snapshot.feedback;
      inboxMinis = snapshot.minis;
      inboxSlices = Object.fromEntries(
        Object.entries(snapshot.states).map(([id, state]) => [id, state.db])
      );
    } else {
      const directory = await loadCloudDirectory();
      if (directory) {
        directoryProfiles = directory.profiles;
        directoryCouples = directory.couples;
      }
      const inbox = await loadAdminInbox();
      if (inbox) {
        inboxFeedback = inbox.feedback;
        inboxMinis = inbox.minis;
      }
    }
    let touchedDb = false;
    if (cloudAccountsOn() && supabase) {
      const { data } = await supabase
        .from("content_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) {
        const remote = data
          .map((row) =>
            hydrateContentReport({
              id: row.id,
              reporterId: row.reporter_id,
              reportedUserId: row.reported_user_id,
              coupleId: row.couple_id,
              mediaId: row.media_id,
              mediaKind: row.media_kind,
              reason: row.reason,
              details: row.details,
              status: row.status,
              createdAt: row.created_at,
            })
          )
          .filter((row): row is ContentReport => Boolean(row));
        const seen = new Set(remote.map((row) => row.id));
        const extra = (db.contentReports ?? []).filter((row) => !seen.has(row.id));
        db = { ...db, contentReports: [...remote, ...extra] };
        touchedDb = true;
      }
      if (snapshot?.reports.length) {
        const seen = new Set((db.contentReports ?? []).map((row) => row.id));
        const extra = snapshot.reports.filter((row) => !seen.has(row.id));
        if (extra.length) {
          db = { ...db, contentReports: [...(db.contentReports ?? []), ...extra] };
          touchedDb = true;
        }
      }
      try {
        const { data: feedbackRows } = await supabase
          .from("feedback_notes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (feedbackRows) {
          const remote = feedbackRows
            .map((row) =>
              hydrateFeedbackNote({
                id: row.id,
                userId: row.user_id,
                displayName: row.display_name,
                email: row.email,
                coupleId: row.couple_id,
                body: row.body,
                createdAt: row.created_at,
              })
            )
            .filter((row): row is FeedbackNote => Boolean(row));
          const seen = new Set(remote.map((row) => row.id));
          const extra = (db.feedbackNotes ?? []).filter((row) => !seen.has(row.id));
          db = { ...db, feedbackNotes: [...remote, ...extra] };
          touchedDb = true;
        }
      } catch {
        // Table may not exist yet.
      }
    }
    if (touchedDb) await persist();
    else emit();
  }, []);

  const requestEmailCode = useCallback(async (email: string) => {
    setPairError(null);
    await sendLoginOtp(email);
  }, []);

  const verifyEmailCode = useCallback(async (token: string) => {
    const pending = readPendingPair();
    const email = pending?.email;
    if (!email) {
      throw new Error("Add the email we sent the code to, then send a new one.");
    }
    setPairError(null);
    await verifyPairOtp(email, token);
    const absorbed = await absorbCloudSession();
    if (!absorbed) {
      throw new Error("Signed in, but the pair is not ready yet. Send a new code.");
    }
    const profile = pardonCreator(absorbed.profile);
    mergeCloudPair({ ...absorbed, profile });
    liveUserId = profile.id;
    await writeLiveUserId(profile.id);
    await rememberUser(profile.id);
    await absorbHubForCouple(absorbed.couple.id);
    await persist();
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setPairError(null);
    await signInWithPasswordAccount(email, password);
    const absorbed = await absorbCloudSession();
    if (!absorbed) {
      throw new Error("Signed in, but the pair is not ready yet.");
    }
    const profile = pardonCreator(absorbed.profile);
    if (profile.bannedAt && !isCreatorEmail(profile.email)) {
      throw new Error(profile.bannedReason || "This account is banned.");
    }
    mergeCloudPair({ ...absorbed, profile });
    liveUserId = profile.id;
    await writeLiveUserId(profile.id);
    await rememberUser(profile.id);
    await absorbHubForCouple(absorbed.couple.id);
    await persist();
  }, []);

  const setAccountPassword = useCallback(async (password: string) => {
    await updateAccountPassword(password);
  }, []);

  const banAccount = useCallback(async (profileId: string, reason: string) => {
    const target = profileById(profileId);
    if (isCreatorEmail(target?.email)) {
      throw new Error("Creator accounts cannot be banned.");
    }
    if (cloudAccountsOn() && supabase) {
      const viaPass = await adminBan(profileId, reason.trim() || "Banned");
      if (!viaPass) {
        const { error } = await supabase.rpc("ban_user", {
          p_user_id: profileId,
          p_reason: reason.trim() || "Banned",
        });
        if (error) {
          throw new Error(
            /admin only/i.test(error.message)
              ? "Bans need SQL 018 so the passphrase can ban. Paste it in the Supabase SQL editor."
              : error.message
          );
        }
      }
    }
    db = {
      ...db,
      profiles: db.profiles.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              bannedAt: nowIso(),
              bannedReason: reason.trim() || "Banned",
            }
          : profile
      ),
    };
    if (sessionUserId === profileId) {
      sessionUserId = null;
      await writeSessionUserId(null);
    }
    await persist();
  }, []);

  const unbanAccount = useCallback(async (profileId: string) => {
    if (cloudAccountsOn() && supabase) {
      const viaPass = await adminUnban(profileId);
      if (!viaPass) {
        const { error } = await supabase.rpc("unban_user", { p_user_id: profileId });
        if (error) {
          throw new Error(
            /admin only/i.test(error.message)
              ? "Unban needs SQL 018 so the passphrase can unban. Paste it in the Supabase SQL editor."
              : error.message
          );
        }
      }
    }
    db = {
      ...db,
      profiles: db.profiles.map((profile) =>
        profile.id === profileId
          ? { ...profile, bannedAt: null, bannedReason: null }
          : profile
      ),
    };
    await persist();
  }, []);

  const enterDemo = useCallback(async (name = "Riley", gender: Gender = "female") => {
    const creator = creatorOnThisPhone();
    if (!creator || !isCreatorEmail(creator.email)) {
      throw new Error("Demo is only for craigmkerlin@gmail.com.");
    }

    if (sessionUserId && !sessionIsDemo()) {
      liveUserId = sessionUserId;
      lastUserId = sessionUserId;
      await writeLiveUserId(sessionUserId);
      await writeLastUserId(sessionUserId);
    } else if (creator.id && creator.id !== demoUserId) {
      liveUserId = creator.id;
      await writeLiveUserId(creator.id);
    }

    const existing = findDemoCouple();
    if (existing) {
      const attachedId = demoYouIdForCouple(existing);
      const attached = profileById(attachedId);
      const liveId = liveUserId ?? creator.id;
      if (attachedId === liveId && isCreatorEmail(attached?.email)) {
        const stampSplit = nowIso();
        const demoYou: Profile = {
          id: createId(),
          displayName:
            attached?.displayName && attached.displayName !== "You"
              ? attached.displayName
              : creator.displayName && creator.displayName !== "You"
                ? creator.displayName
                : "Craig",
          gender: attached?.gender ?? (gender === "female" ? "male" : "female"),
          email: attached?.email ?? creator.email,
          lastSeenAt: stampSplit,
          over18At: attached?.over18At ?? stampSplit,
          privacyConsentAt: attached?.privacyConsentAt ?? stampSplit,
          moderationConsentAt: attached?.moderationConsentAt ?? stampSplit,
          timezone: attached?.timezone ?? deviceTimezone(),
          activeSeconds: 0,
          createdAt: stampSplit,
        };
        db = {
          ...db,
          profiles: [...db.profiles, demoYou],
          couples: db.couples.map((row) => {
            if (row.id !== existing.id) return row;
            if (row.partnerA === attachedId) return { ...row, partnerA: demoYou.id };
            if (row.partnerB === attachedId) return { ...row, partnerB: demoYou.id };
            return row;
          }),
        };
        demoUserId = demoYou.id;
        sessionUserId = demoYou.id;
        await writeDemoUserId(demoYou.id);
        await writeSessionUserId(demoYou.id);
        await persist();
        return;
      }
      demoUserId = attachedId;
      sessionUserId = attachedId;
      await writeDemoUserId(attachedId);
      await writeSessionUserId(attachedId);
      emit();
      return;
    }

    const stamp = nowIso();
    const you: Profile = {
      id: createId(),
      displayName:
        creator.displayName && creator.displayName !== "You" ? creator.displayName : "Craig",
      gender: creator.gender ?? (gender === "female" ? "male" : "female"),
      email: creator.email ?? "craigmkerlin@gmail.com",
      lastSeenAt: stamp,
      over18At: creator.over18At ?? stamp,
      privacyConsentAt: creator.privacyConsentAt ?? stamp,
      moderationConsentAt: creator.moderationConsentAt ?? stamp,
      timezone: creator.timezone ?? deviceTimezone(),
      activeSeconds: 0,
      createdAt: stamp,
    };
    const pair: Couple = {
      id: createId(),
      inviteCode: uniqueInviteCode(),
      partnerA: you.id,
      partnerB: null,
      createdAt: stamp,
      pairedAt: null,
    };
    db = {
      ...db,
      profiles: [...db.profiles, you],
      couples: [...db.couples, pair],
      cards: [...db.cards, ...cloneDefaultDeck(pair.id, you.id)],
    };

    const pairId = pair.id;
    const youId = you.id;
    const demo: Profile = {
      id: createId(),
      displayName: name,
      gender,
      email: "riley.demo@duoma.app",
      isDemo: true,
      lastSeenAt: stamp,
      over18At: stamp,
      privacyConsentAt: stamp,
      moderationConsentAt: stamp,
      timezone: creator.timezone ?? deviceTimezone(),
      activeSeconds: 0,
      createdAt: stamp,
    };
    const today = localDateKey();
    const anniversary = new Date();
    anniversary.setMonth(anniversary.getMonth() + 2);
    const seededLists: CoupleList[] = STARTER_LISTS.map((def, index) => ({
      id: createId(),
      coupleId: pairId,
      title: def.title,
      emoji: def.emoji,
      accent: def.accent,
      starterKey: def.key,
      hiddenAt: null,
      createdBy: demo.id,
      createdAt: new Date(Date.parse(stamp) + index).toISOString(),
    }));
    const moviesListId =
      seededLists.find((row) => row.starterKey === "movies")?.id ??
      seededLists[0]?.id ??
      createId();
    const eatListId =
      seededLists.find((row) => row.starterKey === "places_eat")?.id ??
      moviesListId;
    const pastMovieId = createId();
    const pastEatId = createId();
    db = {
      ...db,
      profiles: [...db.profiles, demo],
      couples: db.couples.map((row) =>
        row.id === pairId
          ? { ...row, partnerB: demo.id, pairedAt: nowIso() }
          : row
      ),
      checkIns: [
        ...db.checkIns,
        {
          id: createId(),
          coupleId: pairId,
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
            coupleId: pairId,
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
          coupleId: pairId,
          title: "Weekend getaway",
          kind: "trip" as const,
          date: localDateKey(anniversary),
          createdBy: demo.id,
          createdAt: nowIso(),
          featured: true,
        },
      ],
      jarNotes: [
        ...db.jarNotes,
        {
          id: createId(),
          coupleId: pairId,
          fromUserId: demo.id,
          body: "Thank you for making coffee before I asked.",
          createdAt: nowIso(),
          openedAt: null,
          openAt: null,
          openOption: "together",
        },
      ],
      chickenPlays: [
        ...db.chickenPlays,
        {
          id: createId(),
          coupleId: pairId,
          fromUserId: demo.id,
          toUserId: youId,
          dareId: null,
          packId: null,
          yardId: null,
          text: "Send me a photo of the weirdest thing in the fridge.",
          status: "offered" as const,
          createdAt: nowIso(),
          answeredAt: null,
          completedAt: null,
        },
      ],
      bucketItems: [
        ...db.bucketItems,
        {
          id: createId(),
          coupleId: pairId,
          title: "Oyster night at the market",
          kind: "meal" as const,
          notes: "Weeknight. No occasion required.",
          scheduledOn: null,
          doneAt: null,
          createdBy: demo.id,
          createdAt: nowIso(),
          sourceId: null,
        },
        {
          id: createId(),
          coupleId: pairId,
          title: "Coast overnight",
          kind: "trip" as const,
          notes: "Cheap motel is fine.",
          scheduledOn: null,
          doneAt: null,
          createdBy: demo.id,
          createdAt: nowIso(),
          sourceId: null,
        },
      ],
      coupleLists: [
        ...db.coupleLists.filter((row) => row.coupleId !== pairId),
        ...seededLists,
      ],
      listEntries: [
        ...db.listEntries,
        {
          id: createId(),
          listId: moviesListId,
          coupleId: pairId,
          title: "Past Lives",
          notes: "",
          createdBy: demo.id,
          createdAt: nowIso(),
          completedAt: null,
          completedBy: null,
        },
        {
          id: pastMovieId,
          listId: moviesListId,
          coupleId: pairId,
          title: "Before Sunrise",
          notes: "",
          createdBy: demo.id,
          createdAt: nowIso(),
          completedAt: stamp,
          completedBy: demo.id,
        },
        {
          id: createId(),
          listId: moviesListId,
          coupleId: pairId,
          title: "The Grand Budapest Hotel",
          notes: "",
          createdBy: demo.id,
          createdAt: nowIso(),
          completedAt: stamp,
          completedBy: demo.id,
        },
        {
          id: pastEatId,
          listId: eatListId,
          coupleId: pairId,
          title: "Night market noodles",
          notes: "",
          createdBy: demo.id,
          createdAt: nowIso(),
          completedAt: stamp,
          completedBy: demo.id,
        },
      ],
      listEntryRatings: [
        ...db.listEntryRatings,
        {
          id: createId(),
          entryId: pastMovieId,
          coupleId: pairId,
          userId: demo.id,
          stars: 8.4,
          createdAt: stamp,
        },
        {
          id: createId(),
          entryId: pastEatId,
          coupleId: pairId,
          userId: demo.id,
          stars: 9.1,
          createdAt: stamp,
        },
      ],
    };
    demoUserId = youId;
    sessionUserId = youId;
    await writeDemoUserId(youId);
    await writeSessionUserId(youId);
    await persist();
  }, []);

  const addDemoPartner = enterDemo;

  const ensureDemoPair = useCallback(async () => {
    if (!creatorOnThisPhone()) return;
    if (findDemoCouple()) {
      const existing = findDemoCouple();
      if (existing) {
        const youId = demoYouIdForCouple(existing);
        if (youId && demoUserId !== youId) {
          demoUserId = youId;
          await writeDemoUserId(youId);
        }
      }
      return;
    }
    const keepSession = sessionUserId;
    await enterDemo();
    sessionUserId = keepSession;
    await writeSessionUserId(keepSession);
    emit();
  }, [enterDemo]);

  const leaveDemo = useCallback(async () => {
    const live =
      profileById(liveUserId) ??
      db.profiles.find(
        (profile) => isCreatorEmail(profile.email) && profile.id !== demoUserId
      ) ??
      null;
    if (!live) {
      throw new Error("No live pair to return to. Sign in with your email first.");
    }
    liveUserId = live.id;
    lastUserId = live.id;
    sessionUserId = live.id;
    await writeLiveUserId(live.id);
    await writeLastUserId(live.id);
    await writeSessionUserId(live.id);
    emit();
  }, []);

  const setProfileGender = useCallback(
    async (who: "you" | "partner", gender: Gender) => {
      const targetId = who === "you" ? user?.id : partner?.id;
      if (!targetId) return;
      db = {
        ...db,
        profiles: db.profiles.map((profile) =>
          profile.id === targetId ? { ...profile, gender } : profile
        ),
      };
      await persist();
    },
    [user?.id, partner?.id]
  );

  const signOut = useCallback(async () => {
    if (sessionUserId && !sessionIsDemo()) {
      liveUserId = sessionUserId;
      lastUserId = sessionUserId;
      await writeLiveUserId(sessionUserId);
      await writeLastUserId(sessionUserId);
    }
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Local session still clears. Hub data stays on this phone.
      }
    }
    sessionUserId = null;
    await writeSessionUserId(null);
    emit();
  }, []);

  const unpairAndWipe = useCallback(async () => {
    if (!user || !couple) {
      throw new Error("There is no connection to end.");
    }
    pingPartner(couple, user, partner, {
      title: "Connection ended",
      body: `${user.displayName} ended the pairing. Shared photos and lists on this pair are gone.`,
      url: "/welcome",
    });
    if (cloudAccountsOn() && supabase) {
      const { error } = await supabase.rpc("unpair_couple");
      if (error) {
        throw new Error(error.message || "Could not unpair on the server.");
      }
    }
    await wipeMiniAppsForCouple(couple.id);
    const stripped = stripCoupleFromDb(db, couple.id);
    const freshId = createId();
    const freshCode = uniqueInviteCode();
    db = {
      ...stripped,
      profiles: stripped.profiles.filter((row) => !row.isDemo || row.id === user.id),
      couples: [
        ...stripped.couples,
        {
          id: freshId,
          inviteCode: freshCode,
          partnerA: user.id,
          partnerB: null,
          createdAt: nowIso(),
          pairedAt: null,
        },
      ],
      cards: [...stripped.cards, ...cloneDefaultDeck(freshId, user.id)],
    };
    broadcastSafetyEvent(safetyEventNow("unpair", couple.id));
    await persist();
  }, [user, couple, partner]);

  const deleteOwnAccount = useCallback(async () => {
    if (!user) throw new Error("Sign in first.");
    if (couple) {
      pingPartner(couple, user, partner, {
        title: "Account closed",
        body: `${user.displayName} closed their Duoma account. The pairing is gone.`,
        url: "/welcome",
      });
    }
    if (cloudAccountsOn() && supabase) {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) {
        throw new Error(error.message || "Could not close the cloud account.");
      }
      try {
        await supabase.auth.signOut();
      } catch {
        // Local wipe still runs.
      }
    }
    await wipeLocalMediaCaches();
    await wipeMiniApps();
    if (couple) {
      db = stripCoupleFromDb(db, couple.id);
    }
    db = {
      ...db,
      profiles: db.profiles.filter((row) => row.id !== user.id && !row.isDemo),
    };
    sessionUserId = null;
    lastUserId = null;
    liveUserId = null;
    await writeSessionUserId(null);
    await writeLastUserId(null);
    await writeLiveUserId(null);
    broadcastSafetyEvent(safetyEventNow("delete-account", couple?.id ?? null));
    await persist();
    emit();
  }, [user, couple, partner]);

  const submitContentReport = useCallback(
    async (input: {
      reason: ReportReasonId;
      details?: string;
      reportedUserId?: string | null;
      mediaId?: string | null;
      mediaKind: import("@/lib/reports").ContentReport["mediaKind"];
    }) => {
      if (!user) throw new Error("Sign in first.");
      const row = buildContentReport({
        reporterId: user.id,
        reportedUserId: input.reportedUserId ?? partner?.id ?? null,
        coupleId: couple?.id ?? null,
        mediaId: input.mediaId ?? null,
        mediaKind: input.mediaKind,
        reason: input.reason,
        details: input.details,
      });
      db = { ...db, contentReports: [...(db.contentReports ?? []), row] };
      await writeLocalReports(db.contentReports);
      if (cloudAccountsOn() && supabase) {
        const { error } = await supabase.from("content_reports").insert({
          id: row.id,
          reporter_id: row.reporterId,
          reported_user_id: row.reportedUserId,
          couple_id: row.coupleId,
          media_id: row.mediaId,
          media_kind: row.mediaKind,
          reason: row.reason,
          details: row.details,
          status: row.status,
          created_at: row.createdAt,
        });
        if (error) {
          // Keep the local copy so the report is not lost if the table is not migrated yet.
        }
      }
      await persist();
    },
    [user, partner?.id, couple?.id]
  );

  const resolveContentReport = useCallback(
    async (id: string, action: "dismiss" | "action_taken") => {
      const status = action === "dismiss" ? "dismissed" : "action_taken";
      const existing = (db.contentReports ?? []).find((row) => row.id === id);
      if (cloudAccountsOn() && supabase) {
        const viaPass = await adminResolveReport(id, action);
        if (!viaPass) {
          const { error } = await supabase.rpc("resolve_report", {
            p_report_id: id,
            p_action: action,
          });
          if (error) {
            throw new Error(error.message || "Could not resolve that report.");
          }
        }
      }
      db = {
        ...db,
        contentReports: (db.contentReports ?? []).map((row) =>
          row.id === id ? { ...row, status } : row
        ),
        profiles:
          action === "action_taken" && existing?.reportedUserId
            ? db.profiles.map((profile) =>
                profile.id === existing.reportedUserId &&
                !isCreatorEmail(profile.email)
                  ? {
                      ...profile,
                      bannedAt: nowIso(),
                      bannedReason: "Removed after a safety report",
                    }
                  : profile
              )
            : db.profiles,
      };
      await writeLocalReports(db.contentReports);
      await persist();
    },
    []
  );

  const sendFeedback = useCallback(
    async (body: string, source?: string) => {
      if (!user) throw new Error("Sign in first.");
      const text = body.trim();
      if (!text) throw new Error("Write a note first.");
      const row = buildFeedbackNote({
        userId: user.id,
        displayName: user.displayName,
        email: user.email,
        coupleId: couple?.id ?? null,
        body: text,
        source: source ?? null,
      });
      db = { ...db, feedbackNotes: [...(db.feedbackNotes ?? []), row] };
      await writeLocalFeedback(db.feedbackNotes);
      await persist();
      if (cloudAccountsOn() && supabase) {
        try {
          const { data: auth } = await supabase.auth.getUser();
          const userId = auth.user?.id || row.userId;
          const coupleId =
            row.coupleId &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              row.coupleId
            )
              ? row.coupleId
              : null;
          const payload = {
            id: row.id,
            user_id: userId,
            display_name: row.displayName,
            email: row.email,
            couple_id: coupleId,
            body: prefixFeedbackBody(row.body, row.source),
            created_at: row.createdAt,
          };
          let { error } = await supabase.from("feedback_notes").insert(payload);
          if (error && coupleId) {
            ({ error } = await supabase
              .from("feedback_notes")
              .insert({ ...payload, couple_id: null }));
          }
          if (error) {
            const viaKey = await adminSubmitFeedback({
              id: row.id,
              userId,
              displayName: row.displayName,
              email: row.email,
              coupleId,
              body: prefixFeedbackBody(row.body, row.source),
              createdAt: row.createdAt,
            });
            if (!viaKey) {
              const message = error.message || "";
              if (/does not exist|schema cache|018/i.test(message)) {
                throw new Error(
                  "Feedback never left this phone. Paste SQL 018 in the Supabase SQL editor."
                );
              }
              if (/row-level|rls|jwt|not authenticated|sign in/i.test(message)) {
                throw new Error(
                  "This phone is signed out of the cloud. Open Login, sign in with your password, then send the note again — or paste SQL 020 so it can upload without that login."
                );
              }
              throw new Error(
                "Admin did not get that note. Paste SQL 020 in Supabase, or send a new email login code and try once more."
              );
            }
            error = null;
          }
          if (!error && userId !== row.userId) {
            db = {
              ...db,
              feedbackNotes: (db.feedbackNotes ?? []).map((item) =>
                item.id === row.id ? { ...item, userId } : item
              ),
            };
            await writeLocalFeedback(db.feedbackNotes);
            await persist();
          }
        } catch (err) {
          if (err instanceof Error && /SQL|Login|Admin did not|never left/i.test(err.message)) {
            throw err;
          }
          throw new Error(
            "Admin did not get that note. Send a new email login code, or paste SQL 020 in Supabase."
          );
        }
      }
    },
    [user, couple?.id]
  );

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
      shuffleLimit: 3,
      stageCounts: { ...DEFAULT_STAGE_COUNTS },
      flavorTags: defaultEnabledFlavorTags(),
      pace: "simple",
      currentStage: null,
      activeCardId: null,
      turnUserId: user.id,
      activePlayedBy: null,
      handCardIds: [],
      awaitingFinishReveal: false,
      finishPickerId: null,
      afterglowPickerId: null,
      finishAwaitingMale: false,
      finishUnitsDone: 0,
      awaitingPrivate: false,
      privateUnlocked: false,
      playedDate: null,
      completedAt: null,
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

  const seedPlayers = (
    gameId: string,
    blockLimit: number,
    shuffleLimit: number,
    a: string,
    b: string
  ) => [
    {
      gameId,
      userId: a,
      blocksRemaining: blockLimit,
      shufflesRemaining: shuffleLimit,
    },
    {
      gameId,
      userId: b,
      blocksRemaining: blockLimit,
      shufflesRemaining: shuffleLimit,
    },
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

  const partnerIdOf = (coupleIdUser: string) => {
    if (!couple) return null;
    return couple.partnerA === coupleIdUser
      ? couple.partnerB
      : couple.partnerA;
  };

  const exclusiveTurnForStage = (
    row: GameSession,
    stage: CardStage | null,
    fallbackUserId: string
  ) => {
    if (stage === "finish_off" && row.finishPickerId) return row.finishPickerId;
    if (stage === "afterglow" && row.afterglowPickerId) {
      return row.afterglowPickerId;
    }
    return fallbackUserId;
  };

  const usedCardIdsForGame = (gameId: string) =>
    new Set(
      db.deck
        .filter((item) => item.gameId === gameId)
        .map((item) => item.cardId)
    );

  const advanceAfterPlay = (
    row: GameSession,
    deckRows: DeckCard[],
    justPlayedStage: CardStage,
    currentUserId: string,
    passToUserId: string,
    finishResolved?: "F" | "M" | "FM" | null
  ): Partial<GameSession> => {
    const stageCounts = normalizeStageCounts(row.stageCounts);

    if (justPlayedStage === "finish_off" && finishResolved) {
      if (finishResolved === "F") {
        return {
          currentStage: "finish_off",
          turnUserId:
            row.pace === "simple"
              ? passToUserId
              : exclusiveTurnForStage(row, "finish_off", currentUserId),
          handCardIds: [],
          awaitingFinishReveal: false,
          finishAwaitingMale: true,
          finishUnitsDone: row.finishUnitsDone ?? 0,
        };
      }
      const units = (row.finishUnitsDone ?? 0) + 1;
      if (row.pace !== "simple" && units < stageCounts.finish_off) {
        return {
          currentStage: "finish_off",
          turnUserId: exclusiveTurnForStage(row, "finish_off", passToUserId),
          handCardIds: [],
          awaitingFinishReveal: false,
          finishAwaitingMale: false,
          finishUnitsDone: units,
        };
      }
      const next = nextActiveStage(stageCounts, justPlayedStage);
      if (!next) {
        return {
          currentStage: justPlayedStage,
          turnUserId: null,
          handCardIds: [],
          activeCardId: null,
          activePlayedBy: null,
          status: "rating",
          finishAwaitingMale: false,
          finishUnitsDone: units,
        };
      }
      return {
        currentStage: next,
        turnUserId: exclusiveTurnForStage(row, next, passToUserId),
        handCardIds: [],
        awaitingFinishReveal: false,
        finishAwaitingMale: false,
        finishUnitsDone: units,
      };
    }

    const playedInStage = playedCountForStage(deckRows, justPlayedStage);
    const openEnded = isSimpleOpenStage(row.pace, justPlayedStage);
    const stageDone = !openEnded && playedInStage >= stageCounts[justPlayedStage];

    if (!stageDone) {
      return {
        currentStage: justPlayedStage,
        turnUserId: openEnded
          ? passToUserId
          : exclusiveTurnForStage(row, justPlayedStage, passToUserId),
        handCardIds: [],
        awaitingFinishReveal: false,
      };
    }

    const next = nextActiveStage(stageCounts, justPlayedStage);
    if (!next) {
      return {
        currentStage: justPlayedStage,
        turnUserId: null,
        handCardIds: [],
        activeCardId: null,
        activePlayedBy: null,
        status: "rating",
      };
    }

    // Leaving daytime tease → private gate
    if (
      justPlayedStage === "pre_foreplay" &&
      next !== "pre_foreplay" &&
      !row.privateUnlocked
    ) {
      return {
        currentStage: next,
        turnUserId: currentUserId,
        handCardIds: [],
        activeCardId: null,
        activePlayedBy: null,
        awaitingPrivate: true,
      };
    }

    // Entering climax stages → suspense reveal for who picks Finish Off
    if (
      (next === "finish_off" || next === "afterglow") &&
      !row.finishPickerId &&
      !row.afterglowPickerId
    ) {
      return {
        currentStage: next,
        turnUserId: null,
        handCardIds: [],
        activeCardId: null,
        activePlayedBy: null,
        awaitingFinishReveal: true,
      };
    }

    return {
      currentStage: next,
      turnUserId: exclusiveTurnForStage(row, next, passToUserId),
      handCardIds: [],
      awaitingFinishReveal: false,
    };
  };

  const startPlayingPatch = (
    row: GameSession,
    extra: Partial<GameSession>
  ): GameSession => {
    const stageCounts = normalizeStageCounts(
      extra.stageCounts ?? row.stageCounts
    );
    const opening = firstActiveStage(stageCounts);
    const needsReveal =
      opening === "finish_off" || opening === "afterglow";
    return sessionFields(row, {
      status: "playing",
      mode: "deal",
      currentStage: opening,
      turnUserId: needsReveal
        ? null
        : exclusiveTurnForStage(
            { ...row, ...extra, finishPickerId: extra.finishPickerId ?? null, afterglowPickerId: extra.afterglowPickerId ?? null } as GameSession,
            opening,
            row.initiatorId
          ),
      activeCardId: null,
      activePlayedBy: null,
      handCardIds: [],
      awaitingFinishReveal: Boolean(needsReveal),
      finishPickerId: extra.finishPickerId ?? null,
      afterglowPickerId: extra.afterglowPickerId ?? null,
      finishAwaitingMale: false,
      finishUnitsDone: 0,
      awaitingPrivate: false,
      privateUnlocked: stageCounts.pre_foreplay === 0,
      ...extra,
      stageCounts,
    });
  };

  const configureGame = useCallback(
    async (input: {
      blockLimit: number;
      shuffleLimit: number;
      stageCounts: StageCounts;
      flavorTags: string[];
      pace?: SpicyPace;
    }) => {
      if (!game || !couple?.partnerA || !couple.partnerB) return;
      const pace: SpicyPace = input.pace === "simple" ? "simple" : "detailed";
      const blockLimit =
        pace === "simple" ? 0 : normalizePassLimit(input.blockLimit);
      const shuffleLimit =
        pace === "simple" ? 0 : normalizeShuffleLimit(input.shuffleLimit);
      const stageCounts = normalizeStageCounts(
        pace === "simple" ? SIMPLE_STAGE_COUNTS : input.stageCounts
      );
      const flavorTags = normalizeFlavorTags(input.flavorTags);
      if (flavorTags.length === 0) {
        throw new Error("Pick at least one flavor for the deck.");
      }
      if (totalCardsMissing(stageCounts)) {
        throw new Error("Turn on at least one stage card.");
      }
      db = {
        ...db,
        games: db.games.map((row) =>
          row.id === game.id
            ? startPlayingPatch(row, {
                mode: "deal",
                pace,
                blockLimit,
                shuffleLimit,
                stageCounts,
                flavorTags,
                finishPickerId: null,
                afterglowPickerId: null,
                finishAwaitingMale: false,
                finishUnitsDone: 0,
                ...(pace === "simple"
                  ? {
                      turnUserId: pickSimpleActor({
                        couple,
                        ...pairGenders(couple),
                        stage: firstActiveStage(stageCounts),
                        finishAwaitingMale: false,
                        currentActorId: null,
                        initiatorId: game.initiatorId,
                        flip: false,
                      }),
                      awaitingFinishReveal: false,
                    }
                  : {}),
              })
            : row
        ),
        gamePlayers: [
          ...db.gamePlayers.filter((row) => row.gameId !== game.id),
          ...seedPlayers(
            game.id,
            blockLimit,
            shuffleLimit,
            couple.partnerA,
            couple.partnerB
          ),
        ],
        deck: db.deck.filter((row) => row.gameId !== game.id),
      };
      await persist();
    },
    [cards, couple, game]
  );

  const totalCardsMissing = (counts: StageCounts) =>
    STAGE_ORDER.every((stage) => counts[stage] <= 0);

  // Legacy pick-your-own helpers kept for old saves still mid-selecting.
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
              sortOrder: db.deck.filter((item) => item.gameId === game.id)
                .length,
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
      db.deck
        .filter((item) => item.gameId === game.id)
        .map((item) => item.cardId)
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
              mode: "deal",
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

  const dealHand = useCallback(async () => {
    if (!game || !user || !couple || game.status !== "playing") return;
    if (game.awaitingPrivate || game.awaitingFinishReveal) return;
    const simple = game.pace === "simple";
    if (!simple && game.turnUserId && game.turnUserId !== user.id) {
      throw new Error(`It's ${profileName(game.turnUserId)}'s turn.`);
    }
    const stage = game.currentStage;
    if (!stage) return;
    if (
      !simple &&
      ((stage === "finish_off" &&
        game.finishPickerId &&
        game.finishPickerId !== user.id) ||
        (stage === "afterglow" &&
          game.afterglowPickerId &&
          game.afterglowPickerId !== user.id))
    ) {
      throw new Error("This stage belongs to your partner.");
    }
    if ((game.handCardIds?.length ?? 0) > 0) return;

    let deckRows = db.deck.filter((item) => item.gameId === game.id);
    // Keep the live card on screen until someone taps Complete.
    if (game.activeCardId || deckRows.some((item) => item.status === "active")) {
      return;
    }

    const used = new Set(deckRows.map((item) => item.cardId));
    const actorId =
      game.pace === "simple" && couple
        ? simpleActorFor(couple, game, {
            currentActorId: game.turnUserId ?? game.activePlayedBy,
          })
        : user.id;
    const actorProfile = profileById(actorId);
    const actorPartnerId = partnerIdOf(actorId);
    const finishGenders = resolveCardGenders({
      userGender: actorProfile?.gender ?? user.gender,
      partnerGender:
        profileById(actorPartnerId)?.gender ??
        partner?.gender ??
        profileById(partnerIdOf(user.id))?.gender,
      userId: actorId,
      partnerId: actorPartnerId ?? partnerIdOf(user.id),
      playedById: actorId,
    });
    const size = handSizeForPace(game.pace);
    const dealt =
      stage === "finish_off"
        ? dealFinishHandFromBank(
            cards,
            used,
            game.flavorTags,
            game.finishAwaitingMale ? "M" : "F",
            finishGenders,
            size
          )
        : dealHandFromBank(cards, stage, used, game.flavorTags, size);
    if (dealt.length === 0) {
      throw new Error("No cards left for this stage. Add more in the bank or change flavors.");
    }

    if (game.pace === "simple") {
      const pick = dealt[0]!;
      const maxOrder = deckRows.reduce(
        (max, item) => Math.max(max, item.sortOrder),
        -1
      );
      const activeRow: DeckCard = {
        id: createId(),
        gameId: game.id,
        cardId: pick.id,
        stage: pick.stage,
        sortOrder: maxOrder + 1,
        status: "active",
        playedBy: actorId,
      };
      db = {
        ...db,
        deck: [
          ...db.deck.filter((item) => item.gameId !== game.id),
          ...deckRows,
          activeRow,
        ],
        games: db.games.map((row) =>
          row.id === game.id
            ? sessionFields(row, {
                handCardIds: [],
                activeCardId: activeRow.id,
                activePlayedBy: actorId,
                turnUserId: actorId,
              })
            : row
        ),
      };
      await persist();
      return;
    }

    db = {
      ...db,
      deck: [
        ...db.deck.filter((item) => item.gameId !== game.id),
        ...deckRows,
      ],
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              handCardIds: dealt.map((card) => card.id),
              activeCardId: null,
              activePlayedBy: null,
            })
          : row
      ),
    };
    await persist();
  }, [cards, couple, game, partner, user]);

  const shuffleHand = useCallback(async () => {
    if (!game || !user || game.status !== "playing") return;
    if (game.turnUserId && game.turnUserId !== user.id) {
      throw new Error(`It's ${profileName(game.turnUserId)}'s turn.`);
    }
    if (game.activeCardId) {
      throw new Error("Complete the live card before shuffling.");
    }
    const stage = game.currentStage;
    if (!stage) return;
    const player = db.gamePlayers.find(
      (row) => row.gameId === game.id && row.userId === user.id
    );
    if (!player) return;
    if (player.shufflesRemaining === 0) {
      throw new Error("No shuffles left.");
    }
    if ((game.handCardIds?.length ?? 0) === 0) {
      throw new Error("Deal a hand before shuffling.");
    }

    const used = usedCardIdsForGame(game.id);
    // Also exclude the current hand so reshuffle feels fresh when possible
    game.handCardIds.forEach((id) => used.add(id));
    const finishGenders = resolveCardGenders({
      userGender: user.gender,
      partnerGender: partner?.gender ?? profileById(partnerIdOf(user.id))?.gender,
      userId: user.id,
      partnerId: partnerIdOf(user.id),
      playedById: user.id,
    });
    const dealt =
      stage === "finish_off"
        ? dealFinishHandFromBank(
            cards,
            used,
            game.flavorTags,
            game.finishAwaitingMale ? "M" : "F",
            finishGenders,
            handSizeForPace(game.pace)
          )
        : dealHandFromBank(cards, stage, used, game.flavorTags, handSizeForPace(game.pace));
    if (dealt.length === 0) {
      throw new Error("No alternate cards left to shuffle in.");
    }

    const nextShuffles =
      player.shufflesRemaining < 0 ? -1 : player.shufflesRemaining - 1;

    db = {
      ...db,
      gamePlayers: db.gamePlayers.map((row) =>
        row.gameId === game.id && row.userId === user.id
          ? { ...row, shufflesRemaining: nextShuffles }
          : row
      ),
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              handCardIds: dealt.map((card) => card.id),
            })
          : row
      ),
    };
    await persist();
  }, [cards, couple, game, partner, user]);

  const chooseHandCard = useCallback(
    async (cardId: string) => {
      if (!game || !user || !couple || game.status !== "playing") return;
      if (game.turnUserId && game.turnUserId !== user.id) {
        throw new Error(`It's ${profileName(game.turnUserId)}'s turn.`);
      }
      if (game.activeCardId) {
        throw new Error("Complete the live card first.");
      }
      if (!(game.handCardIds ?? []).includes(cardId)) {
        throw new Error("Pick one of the three dealt cards.");
      }
      const card = cards.find((item) => item.id === cardId);
      if (!card || card.stage !== game.currentStage) {
        throw new Error("That card is not available right now.");
      }

      const deckRows = db.deck.filter((item) => item.gameId === game.id);
      const maxOrder = deckRows.reduce(
        (max, item) => Math.max(max, item.sortOrder),
        -1
      );
      const activeRow: DeckCard = {
        id: createId(),
        gameId: game.id,
        cardId: card.id,
        stage: card.stage,
        sortOrder: maxOrder + 1,
        status: "active",
        playedBy: user.id,
      };

      // Park the card as live. Turn advances only after Complete.
      db = {
        ...db,
        deck: [
          ...db.deck.filter((item) => item.gameId !== game.id),
          ...deckRows,
          activeRow,
        ],
        games: db.games.map((row) =>
          row.id === game.id
            ? sessionFields(row, {
                activeCardId: activeRow.id,
                activePlayedBy: user.id,
                handCardIds: [],
                turnUserId: user.id,
              })
            : row
        ),
      };
      await persist();
    },
    [cards, couple, game, user]
  );

  const completeActiveCard = useCallback(async () => {
    if (!game || !user || !couple || game.status !== "playing") return;
    const deckRows = db.deck.filter((item) => item.gameId === game.id);
    const active = deckRows.find((item) => item.status === "active");
    if (!active) {
      throw new Error("No live card to complete.");
    }

    const simple = game.pace === "simple";
    const playedBy = simple
      ? active.playedBy ?? game.turnUserId ?? game.activePlayedBy ?? user.id
      : active.playedBy ?? game.activePlayedBy ?? user.id;
    const partnerId = partnerIdOf(playedBy) ?? partnerIdOf(user.id);
    const otherId =
      playedBy === user.id ? partnerId ?? user.id : user.id;
    const finishGenders = resolveCardGenders({
      userGender: profileById(playedBy)?.gender,
      partnerGender: profileById(partnerIdOf(playedBy))?.gender,
      userId: playedBy,
      partnerId: partnerIdOf(playedBy),
      playedById: playedBy,
    });
    const playedCard = cards.find((item) => item.id === active.cardId);
    const finishResolved =
      active.stage === "finish_off" && playedCard
        ? cardFinishClimax(playedCard, finishGenders)
        : null;
    const passTo = simple && couple
      ? simpleActorFor(couple, game, {
          stage: active.stage,
          finishAwaitingMale: finishResolved === "F",
          currentActorId: playedBy,
          flip: active.stage !== "finish_off",
        })
      : exclusiveTurnForStage(game, active.stage, otherId);

    const nextDeck = deckRows.map((item) =>
      item.id === active.id
        ? { ...item, status: "played" as const, playedBy }
        : item
    );
    const patch = advanceAfterPlay(
      game,
      nextDeck,
      active.stage,
      user.id,
      passTo,
      finishResolved
    );

    db = {
      ...db,
      deck: [
        ...db.deck.filter((item) => item.gameId !== game.id),
        ...nextDeck,
      ],
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              ...patch,
              activeCardId: null,
              activePlayedBy: null,
              handCardIds: [],
              status: patch.status ?? "playing",
            })
          : row
      ),
    };
    await persist();
  }, [cards, couple, game, user]);

  const playDemoPartnerTurn = useCallback(async () => {
    if (!game || !user || !couple || game.status !== "playing") return;
    if (game.pace === "simple") return;
    if (!partner?.isDemo) return;
    if (game.turnUserId !== partner.id) return;
    if (game.awaitingPrivate || game.awaitingFinishReveal) return;
    if (game.activeCardId) return;
    if ((game.handCardIds?.length ?? 0) > 0) return;

    const stage = game.currentStage;
    if (!stage) return;
    if (
      (stage === "finish_off" &&
        game.finishPickerId &&
        game.finishPickerId !== partner.id) ||
      (stage === "afterglow" &&
        game.afterglowPickerId &&
        game.afterglowPickerId !== partner.id)
    ) {
      return;
    }

    const deckRows = db.deck.filter((item) => item.gameId === game.id);
    if (deckRows.some((item) => item.status === "active")) return;

    const used = new Set(deckRows.map((item) => item.cardId));
    const finishGenders = resolveCardGenders({
      userGender: partner.gender,
      partnerGender: user.gender,
      userId: partner.id,
      partnerId: user.id,
      playedById: partner.id,
    });
    const dealt =
      stage === "finish_off"
        ? dealFinishHandFromBank(
            cards,
            used,
            game.flavorTags,
            game.finishAwaitingMale ? "M" : "F",
            finishGenders,
            handSizeForPace(game.pace)
          )
        : dealHandFromBank(cards, stage, used, game.flavorTags, handSizeForPace(game.pace));
    if (dealt.length === 0) return;

    const pick = dealt[Math.floor(Math.random() * dealt.length)] ?? dealt[0];
    const maxOrder = deckRows.reduce(
      (max, item) => Math.max(max, item.sortOrder),
      -1
    );
    const activeRow: DeckCard = {
      id: createId(),
      gameId: game.id,
      cardId: pick.id,
      stage: pick.stage,
      sortOrder: maxOrder + 1,
      status: "active",
      playedBy: partner.id,
    };

    db = {
      ...db,
      deck: [
        ...db.deck.filter((item) => item.gameId !== game.id),
        ...deckRows,
        activeRow,
      ],
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              activeCardId: activeRow.id,
              activePlayedBy: partner.id,
              handCardIds: [],
              turnUserId: partner.id,
            })
          : row
      ),
    };
    await persist();
  }, [cards, couple, game, partner, user]);

  const resolveFinishReveal = useCallback(async () => {
    if (!game || !couple?.partnerA || !couple.partnerB) return;
    if (!game.awaitingFinishReveal) return;
    if (game.pace === "simple") {
      db = {
        ...db,
        games: db.games.map((row) =>
          row.id === game.id
            ? sessionFields(row, {
                awaitingFinishReveal: false,
                finishPickerId: null,
                afterglowPickerId: null,
                turnUserId: null,
                handCardIds: [],
                activeCardId: null,
                activePlayedBy: null,
              })
            : row
        ),
      };
      await persist();
      return;
    }
    const pickFinish =
      Math.random() < 0.5 ? couple.partnerA : couple.partnerB;
    const pickAfterglow =
      pickFinish === couple.partnerA ? couple.partnerB : couple.partnerA;
    const stageCounts = normalizeStageCounts(game.stageCounts);
    let stage =
      stageCounts.finish_off > 0
        ? ("finish_off" as CardStage)
        : stageCounts.afterglow > 0
          ? ("afterglow" as CardStage)
          : null;
    const turnUserId =
      stage === "finish_off"
        ? pickFinish
        : stage === "afterglow"
          ? pickAfterglow
          : null;

    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              awaitingFinishReveal: false,
              finishPickerId: pickFinish,
              afterglowPickerId: pickAfterglow,
              currentStage: stage,
              turnUserId,
              handCardIds: [],
              activeCardId: null,
              activePlayedBy: null,
              finishAwaitingMale: false,
              finishUnitsDone: 0,
              status: stage ? "playing" : closeNight(game.id, true),
            })
          : row
      ),
    };
    await persist();
  }, [couple, game]);

  // Kept for older mid-session random decks; deal mode uses chooseHandCard.
  const playCard = useCallback(async () => {
    if (!game || !user || !couple || game.status !== "playing") return;
    if (game.mode === "deal" || !game.mode) {
      if ((game.handCardIds?.length ?? 0) === 0) {
        await dealHand();
      }
      return;
    }
    const demo = Boolean(partner?.isDemo);
    if (!demo && game.turnUserId && game.turnUserId !== user.id) {
      throw new Error(`It's ${profileName(game.turnUserId)}'s turn to play.`);
    }

    const currentDeck = db.deck
      .filter((item) => item.gameId === game.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const active = currentDeck.find((item) => item.status === "active");
    const next = currentDeck.find((item) => item.status === "queued");
    const partnerId = partnerIdOf(user.id);
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
            ? {
                ...item,
                status: "played" as const,
                playedBy: item.playedBy ?? user.id,
              }
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
          return {
            ...item,
            status: "played",
            playedBy: item.playedBy ?? user.id,
          };
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
  }, [couple, dealHand, game, partner, user]);

  const unlockPrivate = useCallback(async () => {
    if (!game || !game.awaitingPrivate) return;
    const stage = game.currentStage;
    const simple = game.pace === "simple";
    const needsReveal =
      !simple &&
      (stage === "finish_off" || stage === "afterglow") &&
      !game.finishPickerId;

    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              awaitingPrivate: false,
              privateUnlocked: true,
              awaitingFinishReveal: Boolean(needsReveal),
              turnUserId: simple
                ? null
                : needsReveal
                  ? null
                  : exclusiveTurnForStage(row, stage, row.turnUserId ?? row.initiatorId),
              handCardIds: [],
            })
          : row
      ),
    };
    await persist();
  }, [game]);

  const readyToMoveOn = useCallback(async () => {
    if (!game || game.status !== "playing") return;
    if (!isSimpleOpenStage(game.pace, game.currentStage)) {
      throw new Error("Finish this stage's cards, or use Detailed counts.");
    }
    const from = game.currentStage;
    if (!from) return;
    if (
      from === "finish_off" &&
      !simpleCanLeaveFinish({
        finishAwaitingMale: game.finishAwaitingMale,
        finishUnitsDone: game.finishUnitsDone ?? 0,
      })
    ) {
      throw new Error(
        "Play the M cums card first. Afterglow waits until he finishes too."
      );
    }
    const stageCounts = normalizeStageCounts(game.stageCounts);
    const next = nextActiveStage(stageCounts, from);
    const deckRows = db.deck.filter((item) => item.gameId === game.id);
    const nextDeck = deckRows.map((item) =>
      item.status === "active" ? { ...item, status: "played" as const } : item
    );
    const nextActor =
      couple && next
        ? simpleActorFor(couple, game, {
            stage: next,
            finishAwaitingMale: false,
            currentActorId: game.turnUserId ?? game.activePlayedBy,
            flip: false,
          })
        : null;
    const extra: Partial<GameSession> = next
      ? {
          currentStage: next,
          turnUserId: nextActor,
          handCardIds: [],
          activeCardId: null,
          activePlayedBy: null,
          awaitingPrivate: false,
          awaitingFinishReveal: false,
          finishPickerId: null,
          afterglowPickerId: null,
          finishAwaitingMale: false,
          privateUnlocked: true,
        }
      : {
          currentStage: from,
          turnUserId: null,
          handCardIds: [],
          activeCardId: null,
          activePlayedBy: null,
          awaitingPrivate: false,
          awaitingFinishReveal: false,
          finishPickerId: null,
          afterglowPickerId: null,
          finishAwaitingMale: false,
          privateUnlocked: true,
          status: closeNight(game.id, true),
        };
    db = {
      ...db,
      deck: [
        ...db.deck.filter((item) => item.gameId !== game.id),
        ...nextDeck,
      ],
      games: db.games.map((row) =>
        row.id === game.id ? sessionFields(row, extra) : row
      ),
    };
    await persist();
  }, [couple, game]);

  const skipSimpleCard = useCallback(async () => {
    if (!game || !user || game.status !== "playing") return;
    if (game.pace !== "simple") {
      throw new Error("Skip is for Keep it simple.");
    }
    const deckRows = db.deck.filter((item) => item.gameId === game.id);
    const active = deckRows.find((item) => item.status === "active");
    if (!active) {
      throw new Error("No card to skip.");
    }
    db = {
      ...db,
      deck: db.deck.map((item) =>
        item.id === active.id ? { ...item, status: "blocked" as const } : item
      ),
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              activeCardId: null,
              activePlayedBy: null,
              handCardIds: [],
              turnUserId: active.playedBy ?? row.turnUserId,
            })
          : row
      ),
    };
    await persist();
  }, [game, user]);

  const blockCard = useCallback(async () => {
    if (!game || !user || game.status !== "playing") return;
    if (game.activePlayedBy && game.activePlayedBy === user.id) {
      throw new Error("You can't pass your own card. That's your partner's call.");
    }
    const player = db.gamePlayers.find(
      (row) => row.gameId === game.id && row.userId === user.id
    );
    if (!player || player.blocksRemaining <= 0) {
      throw new Error("No passes left.");
    }
    const currentDeck = db.deck
      .filter((item) => item.gameId === game.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const active = currentDeck.find((item) => item.status === "active");
    if (!active) {
      throw new Error("Nothing to pass on yet. Wait until they play.");
    }

    // Mark blocked and give the turn back so they deal a replacement hand.
    const nextDeck = db.deck.map((item) =>
      item.id === active.id ? { ...item, status: "blocked" as const } : item
    );
    const returnTo = active.playedBy ?? game.activePlayedBy ?? game.turnUserId;

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
              activeCardId: null,
              activePlayedBy: null,
              handCardIds: [],
              turnUserId: returnTo,
              currentStage: active.stage,
              status: "playing",
            })
          : row
      ),
    };
    await persist();
  }, [game, user]);

  const rateCard = useCallback(
    async (cardId: string, stars: number) => {
      if (!game || !user || !couple) return;
      const clamped = clampScore(stars);
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
    const stamp = nowIso();
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id
          ? sessionFields(row, {
              status: "completed",
              activeCardId: null,
              activePlayedBy: null,
              playedDate: row.playedDate ?? localDateKey(),
              completedAt: row.completedAt ?? stamp,
            })
          : row
      ),
    };
    await persist();
  }, [game]);

  const endGame = useCallback(async () => {
    if (!game) return;
    if (game.status === "playing") {
      const deckRows = db.deck.filter((item) => item.gameId === game.id);
      const nextDeck = deckRows.map((item) =>
        item.status === "active" ? { ...item, status: "played" as const } : item
      );
      const hasPlayed = nextDeck.some((item) => item.status === "played");
      db = {
        ...db,
        deck: [
          ...db.deck.filter((item) => item.gameId !== game.id),
          ...nextDeck,
        ],
        games: db.games.map((row) =>
          row.id === game.id
            ? sessionFields(row, {
                status: hasPlayed ? "rating" : "cancelled",
                activeCardId: null,
                activePlayedBy: null,
                handCardIds: [],
              })
            : row
        ),
      };
      await persist();
      return;
    }
    db = {
      ...db,
      games: db.games.map((row) =>
        row.id === game.id ? sessionFields(row, { status: "completed" }) : row
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
      if (!shared) {
        throw new Error("Toggle on at least one check-in area and fill it in.");
      }
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
      shareHub(couple, [{ kind: "check_in", payload: row }]);
      const answeredRequests = db.checkInRequests.filter(
        (item) =>
          item.coupleId === couple.id &&
          item.toUserId === user.id &&
          item.date === today &&
          item.answeredAt
      );
      if (answeredRequests.length) {
        shareHub(
          couple,
          answeredRequests.map((item) => ({
            kind: "check_in_request" as const,
            payload: item,
          }))
        );
      }
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
      shareHub(couple, [{ kind: "check_in_request", payload: row }]);
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
          url: "/hub/discover",
        });
      }
    },
    [couple, partner, user]
  );

  const submitDiscoverAnswer = useCallback(
    async (questionId: string, body?: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then Flirtatious findings.");
      }
      const question = discoverQuestionById(questionId);
      if (!question) throw new Error("That card isn’t in the deck.");
      const text = (body ?? "").trim();
      const today = localDateKey();
      const existing = db.curiosityAnswers.find(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === user.id &&
          row.questionId === questionId
      );
      const mine: CuriosityAnswer = {
        id: existing?.id ?? createId(),
        coupleId: couple.id,
        userId: user.id,
        date: existing?.date ?? today,
        questionId,
        answerIndex: null,
        guessIndex: null,
        body: text,
        createdAt: existing?.createdAt ?? nowIso(),
      };
      const extra: CuriosityAnswer[] = [];
      if (partner?.isDemo && text) {
        const already = db.curiosityAnswers.some(
          (row) =>
            row.coupleId === couple.id &&
            row.userId === partner.id &&
            row.questionId === questionId
        );
        if (!already) {
          extra.push({
            id: createId(),
            coupleId: couple.id,
            userId: partner.id,
            date: today,
            questionId,
            answerIndex: null,
            guessIndex: null,
            body: "I’d rather say this out loud than type it — ask me tonight.",
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
                row.questionId === questionId
              )
          ),
          mine,
          ...extra,
        ],
        curiositySkips: (db.curiositySkips ?? []).filter(
          (row) =>
            !(
              row.coupleId === couple.id &&
              row.userId === user.id &&
              row.questionId === questionId
            )
        ),
        ritualChecks: upsertRitual(couple.id, user.id, "curiosity", today),
      };
      await persist();
      if (text && !partner?.isDemo) {
        pingPartner(couple, user, partner, {
        title: "Flirtatious findings",
        body: `${user.displayName} answered a Flirtatious findings card. Your turn if you want it.`,
          url: "/hub/discover",
        });
      }
    },
    [couple, partner, user]
  );

  const skipDiscover = useCallback(
    async (questionId: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then Flirtatious findings.");
      }
      if (!discoverQuestionById(questionId)) {
        throw new Error("That card isn’t in the deck.");
      }
      const already = (db.curiositySkips ?? []).some(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === user.id &&
          row.questionId === questionId
      );
      if (already) return;
      const row: CuriositySkip = {
        id: createId(),
        coupleId: couple.id,
        userId: user.id,
        questionId,
        createdAt: nowIso(),
      };
      db = {
        ...db,
        curiositySkips: [...(db.curiositySkips ?? []), row],
      };
      await persist();
    },
    [couple, user]
  );

  const restoreDiscoverSkip = useCallback(
    async (questionId: string) => {
      if (!user || !couple) return;
      db = {
        ...db,
        curiositySkips: (db.curiositySkips ?? []).filter(
          (row) =>
            !(
              row.coupleId === couple.id &&
              row.userId === user.id &&
              row.questionId === questionId
            )
        ),
      };
      await persist();
    },
    [couple, user]
  );

  const undoDiscover = useCallback(
    async (questionId: string) => {
      if (!user || !couple) return;
      db = {
        ...db,
        curiosityAnswers: db.curiosityAnswers.filter(
          (row) =>
            !(
              row.coupleId === couple.id &&
              row.userId === user.id &&
              row.questionId === questionId
            )
        ),
        curiositySkips: (db.curiositySkips ?? []).filter(
          (row) =>
            !(
              row.coupleId === couple.id &&
              row.userId === user.id &&
              row.questionId === questionId
            )
        ),
      };
      await persist();
    },
    [couple, user]
  );

  const drawTalkQuestion = useCallback(
    async (categoryId: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then pull a card.");
      }
      if (isSpicyDareDeck(categoryId)) {
        throw new Error("Browse Up for it Challenges & Dares instead of drawing.");
      }
      categoryById(categoryId);
      const today = localDateKey();
      const existing = todaysDraw(db.talkDraws, {
        userId: user.id,
        categoryId,
        date: today,
      });
      if (existing) return existing;
      const picks = todaysPicks(db.talkDraws, user.id, today);
      if (picks.length >= TALKS_PER_DAY) {
        throw new Error("You already picked two topics today. Come back tomorrow for more.");
      }

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
      const excluded = vaultQuestionIds(db.talkVault, {
        coupleId: couple.id,
        categoryId,
      });
      const questionId = nextQuestionId(deck, excluded);
      if (!questionId) {
        throw new Error("This deck is empty — every question is already in your vault.");
      }
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
        shuffledToday: false,
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

  const shuffleTalkQuestion = useCallback(async (categoryId?: string) => {
    if (!user || !couple) {
      throw new Error("Pair first, then shuffle.");
    }
    const today = localDateKey();
    const existing =
      (categoryId
        ? todaysDraw(db.talkDraws, {
            userId: user.id,
            categoryId,
            date: today,
          })
        : undefined) ?? todaysPick(db.talkDraws, user.id, today);
    if (!existing) {
      throw new Error("Pick a topic first.");
    }
    if (existing.answeredAt) {
      throw new Error("Today's question is already answered.");
    }
    if (existing.shuffledToday) {
      throw new Error("You already used today's shuffle.");
    }

    const question = questionById(existing.categoryId, existing.questionId);
    const vaultRow: TalkVaultEntry = {
      id: createId(),
      coupleId: couple.id,
      userId: user.id,
      categoryId: existing.categoryId,
      questionId: existing.questionId,
      text: question?.text ?? existing.questionId,
      readAt: nowIso(),
      source: "shuffled",
    };

    const previous = db.talkDecks.find(
      (row) =>
        row.coupleId === couple.id &&
        row.userId === user.id &&
        row.categoryId === existing.categoryId
    );
    let deck = markPlayed(
      ensureDeck(previous, {
        id: previous?.id ?? createId(),
        coupleId: couple.id,
        userId: user.id,
        categoryId: existing.categoryId,
      }),
      existing.questionId
    );
    const talkVault = [...db.talkVault, vaultRow];
    const excluded = vaultQuestionIds(talkVault, {
      coupleId: couple.id,
      categoryId: existing.categoryId,
    });
    const nextId = nextQuestionId(deck, excluded);
    if (!nextId) {
      throw new Error("No fresh questions left in this deck.");
    }
    deck = markPlayed(deck, nextId);
    // nextId is live, not vaulted yet — undo the premature mark
    deck = { ...deck, played: deck.played.filter((id) => id !== nextId) };

    const next: TalkDraw = {
      ...existing,
      questionId: nextId,
      shuffledToday: true,
    };
    db = {
      ...db,
      talkDecks: [...db.talkDecks.filter((item) => item.id !== deck.id), deck],
      talkDraws: db.talkDraws.map((row) => (row.id === existing.id ? next : row)),
      talkVault,
    };
    await persist();
    return next;
  }, [couple, user]);

  const submitTalkAnswer = useCallback(
    async (input?: { categoryId?: string }) => {
      if (!user || !couple) {
        throw new Error("Pair first, then mark answered.");
      }
      const today = localDateKey();
      const existing =
        (input?.categoryId
          ? todaysDraw(db.talkDraws, {
              userId: user.id,
              categoryId: input.categoryId,
              date: today,
            })
          : undefined) ?? todaysPick(db.talkDraws, user.id, today);
      if (!existing) {
        throw new Error("Draw a card first.");
      }
      if (existing.answeredAt) {
        return;
      }

      const question = questionById(existing.categoryId, existing.questionId);
      const vaultRow: TalkVaultEntry = {
        id: createId(),
        coupleId: couple.id,
        userId: user.id,
        categoryId: existing.categoryId,
        questionId: existing.questionId,
        text: question?.text ?? existing.questionId,
        readAt: nowIso(),
        source: "answered",
      };

      const previous = db.talkDecks.find(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === user.id &&
          row.categoryId === existing.categoryId
      );
      const marked = markPlayed(
        ensureDeck(previous, {
          id: previous?.id ?? createId(),
          coupleId: couple.id,
          userId: user.id,
          categoryId: existing.categoryId,
        }),
        existing.questionId
      );
      const next: TalkDraw = {
        ...existing,
        body: "",
        reaction: null,
        answeredAt: nowIso(),
      };
      db = {
        ...db,
        talkDecks: [...db.talkDecks.filter((row) => row.id !== marked.id), marked],
        talkDraws: db.talkDraws.map((row) => (row.id === existing.id ? next : row)),
        talkVault: [...db.talkVault, vaultRow],
      };
      await persist();
      const category = categoryById(existing.categoryId);
      pingPartner(couple, user, partner, {
        title: "Let's Talk",
        body: `${user.displayName} answered ${category.name}.`,
        url: "/hub/talk",
      });
    },
    [couple, partner, user]
  );

  const sendSpicyDare = useCallback(
    async (input: {
      dareId: string | null;
      text: string;
      categories?: string[];
      direction: DareDirection | null;
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
      const text = personalizeDareText(input.text.trim(), {
        youName: user.displayName,
        themName: partner?.displayName,
        youGender: user.gender,
        themGender: partner?.gender,
      });
      if (!text) throw new Error("Write the dare, or tweak the one you picked.");
      if (input.timeframe === "custom" && !input.customWhen?.trim()) {
        throw new Error("Pick a date and time on the calendar.");
      }
      const dueAt = dueAtForTimeframe(input.timeframe, input.customWhen);
      if (input.timeframe !== "none") {
        if (!dueAt) {
          throw new Error("Pick a valid expiry time.");
        }
        const dueMs = Date.parse(dueAt);
        const nightKey = input.customWhen?.slice(0, 10) ?? "";
        const todayKey = localDateKey();
        const sameDayAsk =
          input.timeframe === "custom" && /^\d{4}-\d{2}-\d{2}$/.test(nightKey) && nightKey >= todayKey;
        if (!sameDayAsk && dueMs <= Date.now()) {
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
        direction: null,
        timeframe: input.timeframe,
        customWhen: input.timeframe === "custom" ? input.customWhen!.trim() : null,
        dueAt,
        status: "offered",
        createdAt: nowIso(),
        answeredAt: null,
        completedAt: null,
        readAt: null,
        pokedAt: null,
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
      const night = input.customWhen?.slice(0, 10);
      const when =
        night && /^\d{4}-\d{2}-\d{2}$/.test(night)
          ? ` · ${formatLongDate(night)}`
          : "";
      pingPartner(couple, user, partner, {
        title: "Up for it",
        body: `${user.displayName} sent you a dare${when}.`,
        url: "/hub/up-for-it",
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
      const stamp = nowIso();
      const nightKey = existing.customWhen?.slice(0, 10) ?? "";
      const dated = /^\d{4}-\d{2}-\d{2}$/.test(nightKey);
      let calendarEvents = db.calendarEvents;
      if (status === "accepted" && couple && dated) {
        calendarEvents = [
          ...db.calendarEvents,
          {
            id: createId(),
            coupleId: couple.id,
            title:
              existing.text.length > 72
                ? `${existing.text.slice(0, 69)}…`
                : existing.text,
            notes: "Desire dare",
            date: nightKey,
            happenedAt: stamp,
            allDay: true,
            createdBy: user.id,
            createdAt: stamp,
            updatedAt: stamp,
          },
        ];
      }
      db = {
        ...db,
        spicyDares: db.spicyDares.map((row) =>
          row.id === id
            ? { ...row, status, answeredAt: stamp }
            : row
        ),
        calendarEvents,
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: status === "accepted" ? "Dare's on" : "Up for it",
        body:
          status === "accepted"
            ? `${user.displayName} is up for the dare${dated ? ` · ${formatLongDate(nightKey)}` : ""}.`
            : `${user.displayName} passed on this one.`,
        url: status === "accepted" && dated ? "/hub/calendar" : "/hub/up-for-it",
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

  const markSpicyDareRead = useCallback(
    async (id: string) => {
      if (!user) return;
      const existing = db.spicyDares.find((row) => row.id === id);
      if (!existing || existing.toUserId !== user.id) return;
      if (existing.status !== "offered" || existing.readAt) return;
      db = {
        ...db,
        spicyDares: db.spicyDares.map((row) =>
          row.id === id ? { ...row, readAt: nowIso() } : row
        ),
      };
      await persist();
    },
    [user]
  );

  const pokePartner = useCallback(
    async (appId: string, targetId = "open") => {
      if (!user || !couple) {
        throw new Error("Pair first, then poke.");
      }
      const toUserId = otherUserId(couple, user.id);
      if (!toUserId) {
        throw new Error("They need to be paired for a poke.");
      }
      const lastAt = latestPokeAt(db.partnerPokes ?? [], {
        fromUserId: user.id,
        appId,
        targetId,
      });
      const last = lastAt ? Date.parse(lastAt) : 0;
      if (last && Date.now() - last < POKE_COOLDOWN_MS) {
        throw new Error("Give them a little longer before poking again.");
      }
      const stamp = nowIso();
      const row: PartnerPoke = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        appId,
        targetId,
        createdAt: stamp,
      };
      db = {
        ...db,
        partnerPokes: [row, ...(db.partnerPokes ?? [])].slice(0, 80),
        spicyDares:
          appId === "up-for-it"
            ? db.spicyDares.map((item) =>
                item.id === targetId && item.fromUserId === user.id
                  ? { ...item, pokedAt: stamp }
                  : item
              )
            : db.spicyDares,
      };
      await persist();
      const meta = pokeAppMeta(appId);
      pingPartner(couple, user, partner, {
        title: meta.label,
        body: `${user.displayName} poked you about ${meta.label}.`,
        url: String(meta.href),
      });
    },
    [couple, partner, user]
  );

  const pokeSpicyDare = useCallback(
    async (id: string) => {
      await pokePartner("up-for-it", id);
    },
    [pokePartner]
  );

  const sendChickenDare = useCallback(
    async (input: { dareId: string | null; text: string; packId?: string | null }) => {
      if (!user || !couple) {
        throw new Error("Pair first, then send a dare.");
      }
      const toUserId = otherUserId(couple, user.id);
      if (!toUserId) {
        throw new Error("Pair up before sending a dare.");
      }
      const text = input.text.trim();
      if (!text) throw new Error("Write the dare, or pick one from the coop.");
      const catalog = input.dareId ? chickenDareById(input.dareId) : null;
      const pack = catalog
        ? chickenPackById(catalog.pack)
        : input.packId
          ? chickenPackById(input.packId as ChickenPackId)
          : null;
      const row: ChickenPlay = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        dareId: catalog?.id ?? input.dareId,
        packId: catalog?.pack ?? pack?.id ?? null,
        yardId: catalog?.yard ?? pack?.yard ?? null,
        text,
        status: "offered",
        createdAt: nowIso(),
        answeredAt: null,
        completedAt: null,
      };
      db = { ...db, chickenPlays: [...(db.chickenPlays ?? []), row] };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Chicken",
        body: `${user.displayName} dared you. Cluck or commit.`,
        url: "/hub/chicken",
      });
    },
    [couple, partner, user]
  );

  const respondChickenDare = useCallback(
    async (id: string, status: "accepted" | "declined") => {
      if (!user) return;
      const existing = (db.chickenPlays ?? []).find((row) => row.id === id);
      if (!existing || existing.status !== "offered") return;
      if (existing.toUserId !== user.id) return;
      db = {
        ...db,
        chickenPlays: (db.chickenPlays ?? []).map((row) =>
          row.id === id ? { ...row, status, answeredAt: nowIso() } : row
        ),
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Chicken",
        body:
          status === "accepted"
            ? `${user.displayName} is in. No clucking.`
            : `${user.displayName} chickened out.`,
        url: "/hub/chicken",
      });
    },
    [couple, partner, user]
  );

  const completeChickenDare = useCallback(
    async (id: string) => {
      if (!user) return;
      db = {
        ...db,
        chickenPlays: (db.chickenPlays ?? []).map((row) => {
          if (row.id === id && row.status === "accepted" && row.toUserId === user.id) {
            return { ...row, status: "done" as const, completedAt: nowIso() };
          }
          return row;
        }),
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Chicken",
        body: `${user.displayName} did the dare. Egg on the board.`,
        url: "/hub/chicken",
      });
    },
    [couple, partner, user]
  );

  const sendPositionInvite = useCallback(
    async (positionId: string, when?: { dateKey: string; label: string }) => {
      if (!user || !couple) {
        throw new Error("Pair first, then send a position.");
      }
      const toUserId = otherUserId(couple, user.id);
      if (!toUserId) {
        throw new Error("Pair up before sending a position.");
      }
      const id = positionId.trim();
      if (!id) throw new Error("Pick a position first.");
      const dateKey = when?.dateKey ?? null;
      const already = db.positionInvites.find(
        (row) =>
          row.coupleId === couple.id &&
          row.positionId === id &&
          (row.status === "offered" || row.status === "accepted") &&
          (row.dateKey ?? null) === dateKey
      );
      if (already?.status === "accepted") {
        throw new Error("That's already a yes on this one.");
      }
      if (already?.status === "offered") {
        if (already.fromUserId === user.id) {
          throw new Error("They're still answering this one.");
        }
        throw new Error("They already asked you this one. Answer that first.");
      }
      const row: PositionInvite = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        positionId: id,
        status: "offered",
        dateKey,
        whenLabel: when?.label ?? null,
        createdAt: nowIso(),
        answeredAt: null,
        completedAt: null,
      };
      db = {
        ...db,
        positionInvites: [...db.positionInvites, row],
      };
      await persist();
      shareHub(couple, [{ kind: "position_invite", payload: row }]);
      const whenBit = when?.label ?? "tonight";
      pingPartner(couple, user, partner, {
        title: `Try this ${whenBit}?`,
        body: `${user.displayName} wants to try a position ${whenBit}. Confirm it first.`,
        url: "/hub/positions",
      });
    },
    [couple, partner, user]
  );

  const respondPositionInvite = useCallback(
    async (id: string, status: "accepted" | "declined") => {
      if (!user) return;
      const existing = db.positionInvites.find((row) => row.id === id);
      if (!existing || existing.status !== "offered") return;
      if (existing.toUserId !== user.id) return;
      const stamp = nowIso();
      const pose = positionById(existing.positionId);
      const calendarRow: CalendarCustomEvent | null =
        status === "accepted" && existing.dateKey
          ? {
              id: createId(),
              coupleId: existing.coupleId,
              title: pose ? `Try ${pose.name}` : "Try a position",
              notes: pose?.blurb ?? "",
              date: existing.dateKey,
              happenedAt: stamp,
              allDay: true,
              createdBy: user.id,
              createdAt: stamp,
              updatedAt: stamp,
              source: "position",
            }
          : null;
      db = {
        ...db,
        positionInvites: db.positionInvites.map((row) =>
          row.id === id
            ? { ...row, status, answeredAt: stamp }
            : row
        ),
        calendarEvents: calendarRow
          ? [...db.calendarEvents, calendarRow]
          : db.calendarEvents,
      };
      await persist();
      shareHub(couple, [
        {
          kind: "position_invite",
          payload: { ...existing, status, answeredAt: stamp },
        },
        ...(calendarRow
          ? [{ kind: "calendar_event" as const, payload: calendarRow }]
          : []),
      ]);
      const whenBit = existing.whenLabel ?? "tonight";
      pingPartner(couple, user, partner, {
        title: status === "accepted" ? `${whenBit} is on` : "Not this time",
        body:
          status === "accepted"
            ? `${user.displayName} said yes — that pose is on ${whenBit}.`
            : `${user.displayName} said not ${whenBit} for that pose.`,
        url: "/hub/positions",
      });
    },
    [couple, partner, user]
  );

  const completePositionInvite = useCallback(
    async (id: string) => {
      if (!user) return;
      const existing = db.positionInvites.find((row) => row.id === id);
      const stamp = nowIso();
      db = {
        ...db,
        positionInvites: db.positionInvites.map((row) => {
          const involved =
            row.fromUserId === user.id || row.toUserId === user.id;
          const demoHold = Boolean(
            partner?.isDemo &&
              (row.toUserId === partner.id || row.fromUserId === partner.id)
          );
          if (
            row.id === id &&
            row.status === "accepted" &&
            (involved || demoHold)
          ) {
            return { ...row, status: "done", completedAt: stamp };
          }
          return row;
        }),
        positionSaves: existing
          ? (db.positionSaves ?? []).map((row) =>
              row.coupleId === existing.coupleId &&
              row.positionId === existing.positionId &&
              !row.doneAt
                ? { ...row, doneAt: stamp }
                : row
            )
            : (db.positionSaves ?? []),
      };
      await persist();
      if (existing) {
        shareHub(couple, [
          {
            kind: "position_invite",
            payload: { ...existing, status: "done", completedAt: stamp },
          },
        ]);
      }
    },
    [couple, partner, user]
  );

  const savePosition = useCallback(
    async (positionId: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then save a position.");
      }
      const id = positionId.trim();
      if (!id) throw new Error("Pick a position first.");
      const existing = (db.positionSaves ?? []).find(
        (row) =>
          row.coupleId === couple.id && row.positionId === id && !row.doneAt
      );
      if (existing) return existing;
      const row: PositionSave = {
        id: createId(),
        coupleId: couple.id,
        positionId: id,
        createdBy: user.id,
        createdAt: nowIso(),
        doneAt: null,
      };
      db = { ...db, positionSaves: [...(db.positionSaves ?? []), row] };
      await persist();
      return row;
    },
    [couple, user]
  );

  const unsavePosition = useCallback(
    async (positionId: string) => {
      if (!couple) return;
      db = {
        ...db,
        positionSaves: (db.positionSaves ?? []).filter(
          (row) =>
            !(
              row.coupleId === couple.id &&
              row.positionId === positionId &&
              !row.doneAt
            )
        ),
      };
      await persist();
    },
    [couple]
  );

  const markPositionSaveDone = useCallback(async (id: string) => {
    const stamp = nowIso();
    const save = (db.positionSaves ?? []).find((row) => row.id === id);
    db = {
      ...db,
      positionSaves: (db.positionSaves ?? []).map((row) =>
        row.id === id ? { ...row, doneAt: stamp } : row
      ),
      positionInvites: save
        ? (db.positionInvites ?? []).map((row) =>
            row.coupleId === save.coupleId &&
            row.positionId === save.positionId &&
            (row.status === "offered" || row.status === "accepted")
              ? { ...row, status: "done", completedAt: stamp }
              : row
          )
        : db.positionInvites,
    };
    await persist();
  }, []);

  const ratePlayItem = useCallback(
    async (
      kind: PlayItemRating["kind"],
      targetId: string,
      stars: number
    ) => {
      if (!user || !couple) return;
      const score = clampScore(stars);
      const existing = (db.playItemRatings ?? []).find(
        (row) =>
          row.coupleId === couple.id &&
          row.userId === user.id &&
          row.kind === kind &&
          row.targetId === targetId
      );
      if (existing) {
        db = {
          ...db,
          playItemRatings: (db.playItemRatings ?? []).map((row) =>
            row.id === existing.id
              ? { ...row, stars: score, createdAt: nowIso() }
              : row
          ),
        };
      } else {
        const row: PlayItemRating = {
          id: createId(),
          coupleId: couple.id,
          userId: user.id,
          kind,
          targetId,
          stars: score,
          createdAt: nowIso(),
        };
        db = { ...db, playItemRatings: [...(db.playItemRatings ?? []), row] };
      }
      await persist();
    },
    [couple, user]
  );

  const sendDateNightAsk = useCallback(
    async (bucketId: string, dateKey?: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then ask for a date.");
      }
      const toUserId = otherUserId(couple, user.id);
      if (!toUserId) {
        throw new Error("Pair up before asking.");
      }
      const item = db.bucketItems.find(
        (row) => row.id === bucketId && row.coupleId === couple.id
      );
      if (!item) throw new Error("That date is gone.");
      const nightKey =
        dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
          ? dateKey
          : localDateKey();
      const already = (db.dateNightAsks ?? []).find(
        (row) =>
          row.coupleId === couple.id &&
          row.bucketId === bucketId &&
          row.nightKey === nightKey &&
          (row.status === "offered" || row.status === "accepted")
      );
      if (already?.status === "accepted") {
        throw new Error("This date is already a yes.");
      }
      if (already?.status === "offered") {
        if (already.fromUserId === user.id) {
          throw new Error("They're still answering this one.");
        }
        throw new Error("They already asked you this one. Answer that first.");
      }
      const row: DateNightAsk = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        bucketId,
        nightKey,
        status: "offered",
        createdAt: nowIso(),
        answeredAt: null,
      };
      db = { ...db, dateNightAsks: [...(db.dateNightAsks ?? []), row] };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Date night?",
        body: `${user.displayName} wants to do: ${item.title} · ${formatLongDate(nightKey)}`,
        url: "/hub/planner",
      });
    },
    [couple, partner, user]
  );

  const respondDateNightAsk = useCallback(
    async (id: string, status: "accepted" | "declined") => {
      if (!user) return;
      const existing = (db.dateNightAsks ?? []).find((row) => row.id === id);
      if (!existing || existing.status !== "offered") return;
      if (existing.toUserId !== user.id) return;
      const item = db.bucketItems.find((row) => row.id === existing.bucketId);
      const nightKey = existing.nightKey || localDateKey();
      let calendarEvents = db.calendarEvents;
      if (status === "accepted" && couple && item) {
        const stamp = nowIso();
        calendarEvents = [
          ...db.calendarEvents,
          {
            id: createId(),
            coupleId: couple.id,
            title: item.title,
            notes: item.notes || "Date night",
            date: nightKey,
            happenedAt: stamp,
            allDay: true,
            createdBy: user.id,
            createdAt: stamp,
            updatedAt: stamp,
          },
        ];
      }
      db = {
        ...db,
        dateNightAsks: (db.dateNightAsks ?? []).map((row) =>
          row.id === id ? { ...row, status, answeredAt: nowIso() } : row
        ),
        bucketItems:
          status === "accepted"
            ? db.bucketItems.map((row) =>
                row.id === existing.bucketId
                  ? { ...row, scheduledOn: nightKey }
                  : row
              )
            : db.bucketItems,
        calendarEvents,
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: status === "accepted" ? "Date's on" : "Not that night",
        body:
          status === "accepted"
            ? `${user.displayName} said yes — ${item?.title ?? "that date"} is on ${formatLongDate(nightKey)}.`
            : `${user.displayName} said no to ${item?.title ?? "that one"}.`,
        url: "/hub/planner",
      });
    },
    [couple, partner, user]
  );

  const sendRoleplayInvite = useCallback(
    async (roleplayId: string, when?: { dateKey: string; label: string }) => {
      if (!user || !couple) {
        throw new Error("Pair first, then send a roleplay.");
      }
      const toUserId = otherUserId(couple, user.id);
      if (!toUserId) {
        throw new Error("Pair up before sending a roleplay.");
      }
      const id = roleplayId.trim();
      if (!id) throw new Error("Pick a roleplay first.");
      const dateKey = when?.dateKey ?? null;
      const already = db.roleplayInvites.find(
        (row) =>
          row.coupleId === couple.id &&
          row.roleplayId === id &&
          (row.status === "offered" || row.status === "accepted") &&
          (row.dateKey ?? null) === dateKey
      );
      if (already?.status === "accepted") {
        throw new Error("That's already a yes on this one.");
      }
      if (already?.status === "offered") {
        if (already.fromUserId === user.id) {
          throw new Error("They're still answering this one.");
        }
        throw new Error("They already asked you this one. Answer that first.");
      }
      const row: RoleplayInvite = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        roleplayId: id,
        status: "offered",
        dateKey,
        whenLabel: when?.label ?? null,
        createdAt: nowIso(),
        answeredAt: null,
        completedAt: null,
      };
      db = {
        ...db,
        roleplayInvites: [...db.roleplayInvites, row],
      };
      await persist();
      shareHub(couple, [{ kind: "roleplay_invite", payload: row }]);
      const whenBit = when?.label ?? "tonight";
      pingPartner(couple, user, partner, {
        title: `Try this ${whenBit}?`,
        body: `${user.displayName} wants to try a roleplay ${whenBit}. Confirm it first.`,
        url: "/hub/roleplays",
      });
    },
    [couple, partner, user]
  );

  const respondRoleplayInvite = useCallback(
    async (id: string, status: "accepted" | "declined") => {
      if (!user) return;
      const existing = db.roleplayInvites.find((row) => row.id === id);
      if (!existing || existing.status !== "offered") return;
      if (existing.toUserId !== user.id) return;
      const stamp = nowIso();
      const scene = roleplayById(existing.roleplayId);
      const calendarRow: CalendarCustomEvent | null =
        status === "accepted" && existing.dateKey
          ? {
              id: createId(),
              coupleId: existing.coupleId,
              title: scene ? `Try ${scene.name}` : "Try a roleplay",
              notes: scene?.blurb ?? "",
              date: existing.dateKey,
              happenedAt: stamp,
              allDay: true,
              createdBy: user.id,
              createdAt: stamp,
              updatedAt: stamp,
              source: "roleplay",
            }
          : null;
      db = {
        ...db,
        roleplayInvites: db.roleplayInvites.map((row) =>
          row.id === id
            ? { ...row, status, answeredAt: stamp }
            : row
        ),
        calendarEvents: calendarRow
          ? [...db.calendarEvents, calendarRow]
          : db.calendarEvents,
      };
      await persist();
      shareHub(couple, [
        {
          kind: "roleplay_invite",
          payload: { ...existing, status, answeredAt: stamp },
        },
        ...(calendarRow
          ? [{ kind: "calendar_event" as const, payload: calendarRow }]
          : []),
      ]);
      const whenBit = existing.whenLabel ?? "tonight";
      pingPartner(couple, user, partner, {
        title: status === "accepted" ? `${whenBit} is on` : "Not this time",
        body:
          status === "accepted"
            ? `${user.displayName} said yes — that roleplay is on ${whenBit}.`
            : `${user.displayName} said not ${whenBit} for that roleplay.`,
        url: "/hub/roleplays",
      });
    },
    [couple, partner, user]
  );

  const completeRoleplayInvite = useCallback(
    async (id: string) => {
      if (!user) return;
      const existing = db.roleplayInvites.find((row) => row.id === id);
      const stamp = nowIso();
      db = {
        ...db,
        roleplayInvites: db.roleplayInvites.map((row) => {
          const involved =
            row.fromUserId === user.id || row.toUserId === user.id;
          const demoHold = Boolean(
            partner?.isDemo &&
              (row.toUserId === partner.id || row.fromUserId === partner.id)
          );
          if (
            row.id === id &&
            row.status === "accepted" &&
            (involved || demoHold)
          ) {
            return { ...row, status: "done", completedAt: stamp };
          }
          return row;
        }),
        roleplaySaves: existing
          ? (db.roleplaySaves ?? []).map((row) =>
              row.coupleId === existing.coupleId &&
              row.roleplayId === existing.roleplayId &&
              !row.doneAt
                ? { ...row, doneAt: stamp }
                : row
            )
          : (db.roleplaySaves ?? []),
      };
      await persist();
      if (existing) {
        shareHub(couple, [
          {
            kind: "roleplay_invite",
            payload: { ...existing, status: "done", completedAt: stamp },
          },
        ]);
      }
    },
    [couple, partner, user]
  );

  const saveRoleplay = useCallback(
    async (roleplayId: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then save a roleplay.");
      }
      const id = roleplayId.trim();
      if (!id) throw new Error("Pick a roleplay first.");
      const existing = (db.roleplaySaves ?? []).find(
        (row) =>
          row.coupleId === couple.id && row.roleplayId === id && !row.doneAt
      );
      if (existing) return existing;
      const row: RoleplaySave = {
        id: createId(),
        coupleId: couple.id,
        roleplayId: id,
        createdBy: user.id,
        createdAt: nowIso(),
        doneAt: null,
      };
      db = { ...db, roleplaySaves: [...(db.roleplaySaves ?? []), row] };
      await persist();
      return row;
    },
    [couple, user]
  );

  const unsaveRoleplay = useCallback(
    async (roleplayId: string) => {
      if (!couple) return;
      db = {
        ...db,
        roleplaySaves: (db.roleplaySaves ?? []).filter(
          (row) =>
            !(
              row.coupleId === couple.id &&
              row.roleplayId === roleplayId &&
              !row.doneAt
            )
        ),
      };
      await persist();
    },
    [couple]
  );

  const saveDare = useCallback(
    async (dareId: string) => {
      if (!user || !couple) {
        throw new Error("Pair first, then save a dare.");
      }
      const id = dareId.trim();
      if (!id) throw new Error("Pick a dare first.");
      const existing = (db.dareSaves ?? []).find(
        (row) => row.coupleId === couple.id && row.dareId === id && !row.doneAt
      );
      if (existing) return existing;
      const row: DareSave = {
        id: createId(),
        coupleId: couple.id,
        dareId: id,
        createdBy: user.id,
        createdAt: nowIso(),
        doneAt: null,
      };
      db = { ...db, dareSaves: [...(db.dareSaves ?? []), row] };
      await persist();
      return row;
    },
    [couple, user]
  );

  const unsaveDare = useCallback(
    async (dareId: string) => {
      if (!couple) return;
      db = {
        ...db,
        dareSaves: (db.dareSaves ?? []).filter(
          (row) =>
            !(row.coupleId === couple.id && row.dareId === dareId && !row.doneAt)
        ),
      };
      await persist();
    },
    [couple]
  );

  const markDareSaveDone = useCallback(async (id: string) => {
    const stamp = nowIso();
    db = {
      ...db,
      dareSaves: (db.dareSaves ?? []).map((row) =>
        row.id === id ? { ...row, doneAt: stamp } : row
      ),
    };
    await persist();
  }, []);

  const markRoleplaySaveDone = useCallback(async (id: string) => {
    const stamp = nowIso();
    const save = (db.roleplaySaves ?? []).find((row) => row.id === id);
    db = {
      ...db,
      roleplaySaves: (db.roleplaySaves ?? []).map((row) =>
        row.id === id ? { ...row, doneAt: stamp } : row
      ),
      roleplayInvites: save
        ? db.roleplayInvites.map((row) =>
            row.coupleId === save.coupleId &&
            row.roleplayId === save.roleplayId &&
            (row.status === "offered" || row.status === "accepted")
              ? { ...row, status: "done", completedAt: stamp }
              : row
          )
        : db.roleplayInvites,
    };
    await persist();
  }, []);

  const addMilestone = useCallback(
    async (input: { title: string; kind: MilestoneKind; date: string }) => {
      if (!user || !couple) return;
      const title = input.title.trim();
      if (!title || !input.date) throw new Error("Add a title and a date.");
      const ours = db.milestones.filter((row) => row.coupleId === couple.id);
      const row: Milestone = {
        id: createId(),
        coupleId: couple.id,
        title,
        kind: input.kind,
        date: input.date,
        createdBy: user.id,
        createdAt: nowIso(),
        featured: ours.length === 0 || !ours.some((item) => item.featured),
      };
      db = { ...db, milestones: [...db.milestones, row] };
      await persist();
    },
    [couple, user]
  );

  const setFeaturedMilestone = useCallback(
    async (id: string) => {
      if (!couple) return;
      db = {
        ...db,
        milestones: db.milestones.map((row) =>
          row.coupleId === couple.id
            ? { ...row, featured: row.id === id }
            : row
        ),
      };
      await persist();
    },
    [couple]
  );

  const removeMilestone = useCallback(async (id: string) => {
    const removed = db.milestones.find((row) => row.id === id);
    let next = db.milestones.filter((row) => row.id !== id);
    if (removed?.featured && removed.coupleId) {
      const ours = next.filter((row) => row.coupleId === removed.coupleId);
      if (ours.length > 0 && !ours.some((row) => row.featured)) {
        const pick =
          ours
            .filter((row) => daysUntil(row.date) >= 0)
            .sort((a, b) => a.date.localeCompare(b.date))[0] ?? ours[0]!;
        next = next.map((row) =>
          row.coupleId === removed.coupleId
            ? { ...row, featured: row.id === pick.id }
            : row
        );
      }
    }
    db = { ...db, milestones: next };
    await persist();
  }, []);

  const addCalendarEvent = useCallback(
    async (input: {
      title: string;
      notes?: string;
      date: string;
      happenedAt?: string;
      allDay?: boolean;
    }) => {
      if (!user || !couple) throw new Error("Pair up first.");
      const title = input.title.trim();
      if (!title) throw new Error("Add a title.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
        throw new Error("Use a date like 2026-09-10.");
      }
      const stamp = nowIso();
      const allDay = input.allDay !== false;
      const row: CalendarCustomEvent = {
        id: createId(),
        coupleId: couple.id,
        title,
        notes: (input.notes ?? "").trim(),
        date: input.date,
        happenedAt: input.happenedAt ?? stamp,
        allDay,
        createdBy: user.id,
        createdAt: stamp,
        updatedAt: stamp,
      };
      db = { ...db, calendarEvents: [...db.calendarEvents, row] };
      await persist();
      return row;
    },
    [couple, user]
  );

  const updateCalendarEvent = useCallback(
    async (
      id: string,
      input: {
        title: string;
        notes?: string;
        date: string;
        happenedAt?: string;
        allDay?: boolean;
      }
    ) => {
      const title = input.title.trim();
      if (!title) throw new Error("Add a title.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
        throw new Error("Use a date like 2026-09-10.");
      }
      db = {
        ...db,
        calendarEvents: db.calendarEvents.map((row) =>
          row.id === id
            ? {
                ...row,
                title,
                notes: (input.notes ?? "").trim(),
                date: input.date,
                happenedAt: input.happenedAt ?? row.happenedAt,
                allDay: input.allDay ?? row.allDay,
                updatedAt: nowIso(),
              }
            : row
        ),
      };
      await persist();
    },
    []
  );

  const removeCalendarEvent = useCallback(async (id: string) => {
    db = {
      ...db,
      calendarEvents: db.calendarEvents.filter((row) => row.id !== id),
    };
    await persist();
  }, []);

  const addErrandItem = useCallback(
    async (input: { title: string; kind: ErrandKind; notes?: string }) => {
      if (!user || !couple) throw new Error("Pair up first.");
      const title = input.title.trim();
      if (!title) throw new Error("Add an item.");
      const stamp = nowIso();
      const row: ErrandItem = {
        id: createId(),
        coupleId: couple.id,
        kind: input.kind,
        title,
        notes: (input.notes ?? "").trim(),
        createdBy: user.id,
        createdAt: stamp,
        doneAt: null,
        doneBy: null,
      };
      db = { ...db, errandItems: [...db.errandItems, row] };
      await persist();
      return row;
    },
    [couple, user]
  );

  const toggleErrandDone = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Sign in first.");
      const stamp = nowIso();
      db = {
        ...db,
        errandItems: db.errandItems.map((row) => {
          if (row.id !== id) return row;
          if (row.doneAt) {
            return { ...row, doneAt: null, doneBy: null };
          }
          return { ...row, doneAt: stamp, doneBy: user.id };
        }),
      };
      await persist();
    },
    [user]
  );

  const removeErrandItem = useCallback(async (id: string) => {
    db = {
      ...db,
      errandItems: db.errandItems.filter((row) => row.id !== id),
    };
    await persist();
  }, []);

  const clearDoneErrands = useCallback(
    async (kind: ErrandKind | "all" = "all") => {
      if (!couple) return;
      db = {
        ...db,
        errandItems: db.errandItems.filter((row) => {
          if (row.coupleId !== couple.id) return true;
          if (!row.doneAt) return true;
          if (kind === "all") return false;
          return row.kind !== kind;
        }),
      };
      await persist();
    },
    [couple]
  );

  const spinMeal = useCallback(
    async (input?: {
      pool?: MealCategoryId[];
      mealId?: string | null;
      wantId?: string | null;
    }) => {
      if (!user || !couple) throw new Error("Pair up before spinning dinner.");
      const pool = (input?.pool?.length
        ? input.pool
        : ["staple"]) as MealCategoryId[];
      const extras = db.customMeals
        .filter((row) => row.coupleId === couple.id)
        .map(customMealToIdea);
      const hidden = db.hiddenMeals
        .filter((row) => row.coupleId === couple.id)
        .map((row) => row.mealId);
      const menu = combineMenu(extras, hidden);
      const catalog = input?.mealId ? mealById(input.mealId, extras) : null;
      const recent = db.mealRounds
        .filter((row) => row.coupleId === couple.id)
        .slice(0, 6)
        .map((row) => row.mealId);
      const picked =
        catalog ??
        pickRandomMeal(pool, recent, menu);
      if (!picked) throw new Error("Turn on at least one dinner category.");

      const stamp = nowIso();
      const round: MealRound = {
        id: createId(),
        coupleId: couple.id,
        mealId: picked.id,
        title: picked.title,
        category: picked.category,
        pool,
        spunBy: user.id,
        createdAt: stamp,
        votes: [],
        status: "voting",
      };

      db = {
        ...db,
        mealRounds: [
          ...db.mealRounds.map((row) =>
            row.coupleId === couple.id && row.status === "voting"
              ? { ...row, status: "vetoed" as const }
              : row
          ),
          round,
        ],
        mealWants: input?.wantId
          ? db.mealWants.map((row) =>
              row.id === input.wantId ? { ...row, status: "used" as const } : row
            )
          : db.mealWants,
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Dinner spin",
        body: `${user.displayName} spun ${picked.title}. Thumbs?`,
        url: "/hub/meal-picker",
      });
      return round;
    },
    [couple, partner, user]
  );

  const voteMeal = useCallback(
    async (roundId: string, vote: MealVoteKind) => {
      if (!user || !couple) throw new Error("Pair up before voting.");
      const existing = db.mealRounds.find((row) => row.id === roundId);
      if (!existing || existing.coupleId !== couple.id) {
        throw new Error("That dinner is gone.");
      }
      if (existing.status !== "voting") {
        throw new Error("This one’s already settled.");
      }

      const stamp = nowIso();
      const partnerId = otherUserId(couple, user.id);
      let votes = [
        ...existing.votes.filter((row) => row.userId !== user.id),
        { userId: user.id, vote, at: stamp },
      ];

      if (partner?.isDemo && partner.id && vote === "up") {
        const demoVoted = votes.some((row) => row.userId === partner.id);
        if (!demoVoted) {
          votes = [
            ...votes,
            { userId: partner.id, vote: "up", at: stamp },
          ];
        }
      }

      const anyDown = votes.some((row) => row.vote === "down");
      const needed = [user.id, partnerId].filter(Boolean) as string[];
      const allUp =
        !anyDown &&
        needed.every((id) =>
          votes.some((row) => row.userId === id && row.vote === "up")
        );

      if (anyDown) {
        const pool = (existing.pool.length
          ? existing.pool
          : existing.category
            ? [existing.category]
            : ["easy"]) as MealCategoryId[];
        const extras = db.customMeals
          .filter((row) => row.coupleId === couple.id)
          .map(customMealToIdea);
        const hidden = db.hiddenMeals
          .filter((row) => row.coupleId === couple.id)
          .map((row) => row.mealId);
        const next = pickRandomMeal(
          pool,
          [existing.mealId],
          combineMenu(extras, hidden)
        );
        if (!next) throw new Error("No other dinners left in those categories.");
        const follow: MealRound = {
          id: createId(),
          coupleId: couple.id,
          mealId: next.id,
          title: next.title,
          category: next.category,
          pool,
          spunBy: user.id,
          createdAt: stamp,
          votes: [],
          status: "voting",
        };
        db = {
          ...db,
          mealRounds: [
            ...db.mealRounds.map((row) =>
              row.id === existing.id
                ? { ...row, votes, status: "vetoed" as const }
                : row
            ),
            follow,
          ],
        };
        await persist();
        pingPartner(couple, user, partner, {
          title: "Dinner veto",
          body: `${user.displayName} passed on ${existing.title}. Now: ${next.title}.`,
          url: "/hub/meal-picker",
        });
        return follow;
      }

      const status = allUp ? "agreed" : "voting";
      const updated: MealRound = { ...existing, votes, status };
      db = {
        ...db,
        mealRounds: db.mealRounds.map((row) =>
          row.id === existing.id ? updated : row
        ),
      };
      await persist();
      if (allUp) {
        pingPartner(couple, user, partner, {
          title: "Dinner’s on",
          body: `You both want ${existing.title}.`,
          url: "/hub/meal-picker",
        });
      }
      return updated;
    },
    [couple, partner, user]
  );

  const sendMealWant = useCallback(
    async (input: { mealId?: string | null; title?: string }) => {
      if (!user || !couple) throw new Error("Pair up first.");
      const extras = db.customMeals
        .filter((row) => row.coupleId === couple.id)
        .map(customMealToIdea);
      const catalog = input.mealId ? mealById(input.mealId, extras) : null;
      const title = (catalog?.title ?? input.title ?? "").trim();
      if (!title) throw new Error("Pick a dinner first.");
      const already = db.mealWants.find(
        (row) =>
          row.coupleId === couple.id &&
          row.fromUserId === user.id &&
          row.status === "open" &&
          (catalog
            ? row.mealId === catalog.id
            : row.title.toLowerCase() === title.toLowerCase())
      );
      if (already) return already;
      const row: MealWant = {
        id: createId(),
        coupleId: couple.id,
        mealId: catalog?.id ?? input.mealId ?? null,
        title,
        category: catalog?.category ?? null,
        fromUserId: user.id,
        createdAt: nowIso(),
        status: "open",
      };
      db = { ...db, mealWants: [...db.mealWants, row] };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Dinner want",
        body: `${user.displayName} wants ${title}.`,
        url: "/hub/meal-picker",
      });
      return row;
    },
    [couple, partner, user]
  );

  const dismissMealWant = useCallback(async (id: string) => {
    db = {
      ...db,
      mealWants: db.mealWants.map((row) =>
        row.id === id ? { ...row, status: "dismissed" as const } : row
      ),
    };
    await persist();
  }, []);

  const addCustomMeal = useCallback(
    async (input: {
      title: string;
      blurb?: string;
      category: MealCategoryId;
    }) => {
      if (!user || !couple) throw new Error("Pair up first.");
      const title = input.title.trim();
      if (!title) throw new Error("Name the dinner first.");
      const row: CustomMeal = {
        id: createId(),
        coupleId: couple.id,
        title,
        blurb: (input.blurb ?? "").trim(),
        category: input.category,
        staple: true,
        createdBy: user.id,
        createdAt: nowIso(),
      };
      db = { ...db, customMeals: [...db.customMeals, row] };
      await persist();
      return row;
    },
    [couple, user]
  );

  const removeMealFromMenu = useCallback(
    async (mealId: string) => {
      if (!user || !couple) throw new Error("Pair up first.");
      const custom = db.customMeals.find(
        (row) => row.id === mealId && row.coupleId === couple.id
      );
      if (custom) {
        db = {
          ...db,
          customMeals: db.customMeals.filter((row) => row.id !== mealId),
        };
        await persist();
        return;
      }
      const already = db.hiddenMeals.some(
        (row) => row.coupleId === couple.id && row.mealId === mealId
      );
      if (already) return;
      const row: HiddenMeal = {
        id: createId(),
        coupleId: couple.id,
        mealId,
        hiddenBy: user.id,
        hiddenAt: nowIso(),
      };
      db = { ...db, hiddenMeals: [...db.hiddenMeals, row] };
      await persist();
    },
    [couple, user]
  );

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

  const swipeFantasy = useCallback(
    async (fantasyId: string, liked: boolean) => {
      if (!user || !couple) {
        throw new Error("Pair up before swiping fantasies.");
      }
      const liveCouple = coupleForUser(user.id) ?? couple;
      const stamp = nowIso();
      const withoutMine = db.fantasySwipes.filter(
        (row) => !(row.userId === user.id && row.fantasyId === fantasyId)
      );
      const mine: FantasySwipe = {
        id: createId(),
        coupleId: liveCouple.id,
        userId: user.id,
        fantasyId,
        liked,
        createdAt: stamp,
      };
      let next = [...withoutMine, mine];

      // Demo partner: like a stable subset. Top up when new scenarios are added
      // so a finished older deck does not hide leftover cards from matching.
      if (partner?.isDemo && partner.id) {
        const demoSeen = new Set(
          next
            .filter(
              (row) =>
                row.coupleId === liveCouple.id && row.userId === partner.id
            )
            .map((row) => row.fantasyId)
        );
        const likedIds = new Set(demoLikedFantasyIds());
        const missing = fantasyIdeas().filter((idea) => !demoSeen.has(idea.id));
        if (missing.length) {
          next = [
            ...next,
            ...missing.map((idea) => ({
              id: createId(),
              coupleId: liveCouple.id,
              userId: partner.id,
              fantasyId: idea.id,
              liked: likedIds.has(idea.id),
              createdAt: stamp,
            })),
          ];
        }
      }

      const partnerId = otherUserId(liveCouple, user.id);
      const partnerLike = partnerId
        ? next.find(
            (row) =>
              row.coupleId === liveCouple.id &&
              row.userId === partnerId &&
              row.fantasyId === fantasyId &&
              row.liked
          )
        : null;
      const matched = Boolean(liked && partnerLike);

      db = { ...db, fantasySwipes: next };
      await persist();

      if (matched) {
        pingPartner(couple, user, partner, {
          title: "Fantasy match",
          body: `${user.displayName} matched with you on a fantasy.`,
          url: "/hub/fantasy-matcher",
        });
      }

      return { matched };
    },
    [couple, partner, user]
  );

  const forgetFantasySwipe = useCallback(
    async (fantasyId: string) => {
      if (!user || !couple) return;
      db = {
        ...db,
        fantasySwipes: db.fantasySwipes.filter(
          (row) =>
            !(
              row.coupleId === couple.id &&
              row.userId === user.id &&
              row.fantasyId === fantasyId
            )
        ),
      };
      await persist();
    },
    [couple, user]
  );

  const askFantasyTonight = useCallback(
    async (fantasyId: string) => {
      if (!user || !couple) {
        throw new Error("Pair up before asking for tonight.");
      }
      const toUserId = otherUserId(couple, user.id);
      if (!toUserId) {
        throw new Error("Pair up before asking for tonight.");
      }
      const idea = fantasyById(fantasyId);
      if (!idea) throw new Error("That fantasy is gone.");
      const nightKey = localDateKey();
      const already = (db.fantasyTonightAsks ?? []).find(
        (row) =>
          row.coupleId === couple.id &&
          row.fantasyId === fantasyId &&
          row.nightKey === nightKey &&
          (row.status === "offered" || row.status === "accepted")
      );
      if (already?.status === "accepted") {
        throw new Error("Tonight's already a yes on this one.");
      }
      if (already?.status === "offered") {
        if (already.fromUserId === user.id) {
          throw new Error("They're still answering this one.");
        }
        throw new Error("They already asked you this one. Answer that first.");
      }
      const row: FantasyTonightAsk = {
        id: createId(),
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId,
        fantasyId,
        nightKey,
        status: "offered",
        createdAt: nowIso(),
        answeredAt: null,
      };
      db = {
        ...db,
        fantasyTonightAsks: [...(db.fantasyTonightAsks ?? []), row],
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: "Try this tonight?",
        body: `${user.displayName} wants to try: ${idea.title}`,
        url: "/hub/fantasy-matcher",
      });
    },
    [couple, partner, user]
  );

  const respondFantasyTonight = useCallback(
    async (id: string, status: "accepted" | "declined") => {
      if (!user) return;
      const existing = (db.fantasyTonightAsks ?? []).find((row) => row.id === id);
      if (!existing || existing.status !== "offered") return;
      if (existing.toUserId !== user.id) return;
      const idea = fantasyById(existing.fantasyId);
      db = {
        ...db,
        fantasyTonightAsks: (db.fantasyTonightAsks ?? []).map((row) =>
          row.id === id ? { ...row, status, answeredAt: nowIso() } : row
        ),
      };
      await persist();
      pingPartner(couple, user, partner, {
        title: status === "accepted" ? "Tonight's on" : "Not tonight",
        body:
          status === "accepted"
            ? `${user.displayName} said yes — ${idea?.title ?? "that fantasy"} is on tonight.`
            : `${user.displayName} said not tonight for ${idea?.title ?? "that one"}.`,
        url: "/hub/fantasy-matcher",
      });
    },
    [couple, partner, user]
  );

  const completeFantasyMatch = useCallback(
    async (fantasyId: string) => {
      if (!user || !couple) {
        throw new Error("Pair up before marking a fantasy done.");
      }
      const id = fantasyId.trim();
      if (!id || !fantasyById(id)) throw new Error("That fantasy is gone.");
      const existing = (db.fantasyCompletions ?? []).find(
        (row) => row.coupleId === couple.id && row.fantasyId === id
      );
      if (existing) return;
      const row: FantasyCompletion = {
        id: createId(),
        coupleId: couple.id,
        fantasyId: id,
        completedBy: user.id,
        doneAt: nowIso(),
      };
      db = {
        ...db,
        fantasyCompletions: [...(db.fantasyCompletions ?? []), row],
      };
      await persist();
    },
    [couple, user]
  );

  const reopenFantasyMatch = useCallback(
    async (fantasyId: string) => {
      if (!couple) return;
      db = {
        ...db,
        fantasyCompletions: (db.fantasyCompletions ?? []).filter(
          (row) =>
            !(row.coupleId === couple.id && row.fantasyId === fantasyId)
        ),
      };
      await persist();
    },
    [couple]
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

  const seedStarterLists = (coupleId: string, createdBy: string): CoupleList[] => {
    const stamp = nowIso();
    return STARTER_LISTS.map((def, index) => ({
      id: createId(),
      coupleId,
      title: def.title,
      emoji: def.emoji,
      accent: def.accent,
      starterKey: def.key,
      hiddenAt: null,
      createdBy,
      createdAt: new Date(Date.parse(stamp) + index).toISOString(),
    }));
  };

  const ensureStarterLists = useCallback(async () => {
    if (!user || !couple) return;
    const existing = db.coupleLists.filter((row) => row.coupleId === couple.id);
    if (existing.length > 0) return;
    db = {
      ...db,
      coupleLists: [...db.coupleLists, ...seedStarterLists(couple.id, user.id)],
    };
    await persist();
  }, [couple, user]);

  const createCoupleList = useCallback(
    async (input: { title: string; emoji?: string }) => {
      if (!user || !couple) return null;
      await ensureStarterLists();
      const title = input.title.trim();
      if (!title) throw new Error("Give the list a name.");
      const count = db.coupleLists.filter((row) => row.coupleId === couple.id).length;
      const row: CoupleList = {
        id: createId(),
        coupleId: couple.id,
        title,
        emoji: (input.emoji?.trim() || "✨").slice(0, 4),
        accent: CUSTOM_LIST_ACCENTS[count % CUSTOM_LIST_ACCENTS.length],
        starterKey: null,
        hiddenAt: null,
        createdBy: user.id,
        createdAt: nowIso(),
      };
      db = { ...db, coupleLists: [...db.coupleLists, row] };
      await persist();
      return row;
    },
    [couple, ensureStarterLists, user]
  );

  const setListHidden = useCallback(
    async (listId: string, hidden: boolean) => {
      if (!user || !couple) return;
      const list = db.coupleLists.find(
        (row) => row.id === listId && row.coupleId === couple.id
      );
      if (!list) throw new Error("List not found.");
      db = {
        ...db,
        coupleLists: db.coupleLists.map((row) =>
          row.id === listId
            ? { ...row, hiddenAt: hidden ? nowIso() : null }
            : row
        ),
      };
      await persist();
    },
    [couple, user]
  );

  const addListEntry = useCallback(
    async (input: { listId: string; title: string; notes?: string }) => {
      if (!user || !couple) return;
      const list = db.coupleLists.find(
        (row) => row.id === input.listId && row.coupleId === couple.id
      );
      if (!list) throw new Error("List not found.");
      const title = input.title.trim();
      if (!title) throw new Error("Add a title first.");
      const row: ListEntry = {
        id: createId(),
        listId: list.id,
        coupleId: couple.id,
        title,
        notes: (input.notes ?? "").trim(),
        createdBy: user.id,
        createdAt: nowIso(),
        completedAt: null,
        completedBy: null,
      };
      db = { ...db, listEntries: [...db.listEntries, row] };
      await persist();
    },
    [couple, user]
  );

  const completeListEntry = useCallback(
    async (entryId: string) => {
      if (!user || !couple) return;
      const entry = db.listEntries.find(
        (row) => row.id === entryId && row.coupleId === couple.id
      );
      if (!entry) throw new Error("Item not found.");
      if (entry.completedAt) return;
      db = {
        ...db,
        listEntries: db.listEntries.map((row) =>
          row.id === entryId
            ? { ...row, completedAt: nowIso(), completedBy: user.id }
            : row
        ),
      };
      await persist();
    },
    [couple, user]
  );

  const rateListEntry = useCallback(
    async (entryId: string, stars: number) => {
      if (!user || !couple) return;
      const entry = db.listEntries.find(
        (row) => row.id === entryId && row.coupleId === couple.id
      );
      if (!entry) throw new Error("Item not found.");
      if (!entry.completedAt) {
        throw new Error("Mark it done before rating.");
      }
      const score = clampScore(stars);
      const existing = db.listEntryRatings.find(
        (row) => row.entryId === entryId && row.userId === user.id
      );
      if (existing) {
        db = {
          ...db,
          listEntryRatings: db.listEntryRatings.map((row) =>
            row.id === existing.id
              ? { ...row, stars: score, createdAt: nowIso() }
              : row
          ),
        };
      } else {
        const row: ListEntryRating = {
          id: createId(),
          entryId,
          coupleId: couple.id,
          userId: user.id,
          stars: score,
          createdAt: nowIso(),
        };
        db = { ...db, listEntryRatings: [...db.listEntryRatings, row] };
      }
      await persist();
    },
    [couple, user]
  );

  const reopenListEntry = useCallback(
    async (entryId: string) => {
      if (!user || !couple) return;
      const entry = db.listEntries.find(
        (row) => row.id === entryId && row.coupleId === couple.id
      );
      if (!entry) throw new Error("Item not found.");
      db = {
        ...db,
        listEntries: db.listEntries.map((row) =>
          row.id === entryId
            ? { ...row, completedAt: null, completedBy: null }
            : row
        ),
        listEntryRatings: db.listEntryRatings.filter(
          (row) => row.entryId !== entryId
        ),
      };
      await persist();
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
      // Unlock only — notes open one-by-one via the envelope ceremony.
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

  const openJarNote = useCallback(
    async (noteId: string) => {
      if (!user || !couple) return;
      const note = db.jarNotes.find(
        (row) => row.id === noteId && row.coupleId === couple.id
      );
      if (!note || note.openedAt) return;
      db = {
        ...db,
        jarNotes: db.jarNotes.map((row) =>
          row.id === noteId ? { ...row, openedAt: nowIso() } : row
        ),
      };
      await persist();
    },
    [couple, user]
  );

  const addBucketItem = useCallback(
    async (input: {
      title: string;
      kind: BucketKind;
      notes?: string;
      scheduledOn?: string | null;
      sourceId?: string | null;
    }) => {
      if (!user || !couple) throw new Error("Pair up first.");
      const title = input.title.trim();
      if (!title) throw new Error("Name the plan.");
      const sourceId = input.sourceId?.trim() || null;
      if (sourceId) {
        const existing = db.bucketItems.find(
          (row) =>
            row.coupleId === couple.id &&
            row.sourceId === sourceId &&
            !row.doneAt
        );
        if (existing) return existing;
      }
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
        sourceId,
      };
      db = { ...db, bucketItems: [...db.bucketItems, row] };
      await persist();
      return row;
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

  const notifyPartner = useCallback(
    (payload: { title: string; body: string; url: string }) => {
      pingPartner(couple, user, partner, payload);
    },
    [couple, user, partner]
  );

  const sendTestPush = useCallback(async () => {
    if (!user) throw new Error("Sign in first.");
    const payload = {
      title: "Duoma",
      body: "Test ping. This is how a lock-screen note looks.",
      url: "/",
    };
    await showLocalPush(payload);
    const mine = db.pushSubscriptions.filter((row) => row.userId === user.id);
    if (!mine.length) return;
    try {
      await sendPushToSubscriptions(mine, payload);
    } catch {
      // Local ping already landed. Remote send can fail on localhost.
    }
  }, [user]);

  const value: AppContextValue = {
    ready,
    usingCloud: cloudAccountsOn(),
    cloudLive,
    pairError,
    user,
    partner,
    couple,
    cards,
    game,
    deck,
    ratings,
    myBlocksRemaining,
    partnerBlocksRemaining,
    myShufflesRemaining,
    partnerShufflesRemaining,
    incomingInvite,
    savedPair,
    nights,
    allDeck,
    allProfiles,
    allCouples,
    allCards,
    adminDb: Object.entries(inboxSlices).reduce(
      (next, [id, slice]) => mergeCoupleDb(next, id, remapCoupleSlice(slice, id)),
      { ...db, profiles: allProfiles, couples: allCouples }
    ),
    adminMinis: inboxMinis,
    calendarEvents,
    errandItems,
    mealRounds,
    mealWants,
    customMeals,
    hiddenMeals,
    bestCards,
    checkIns,
    checkInRequests,
    incomingCheckInRequest,
    curiosityAnswers,
    curiositySkips,
    curiosityMatchScore,
    talkDecks,
    talkDraws,
    talkVault,
    spicyDares,
    partnerPokes,
    chickenPlays,
    positionInvites,
    positionSaves,
    dateNightAsks,
    playItemRatings,
    roleplayInvites,
    roleplaySaves,
    dareSaves,
    milestones,
    desireToggles,
    fantasySwipes,
    fantasyTonightAsks,
    fantasyCompletions,
    coupons,
    scratches,
    coupleLists,
    listEntries,
    listEntryRatings,
    jarNotes,
    bucketItems,
    ritualChecks,
    jarOpenVotes,
    pushSubscriptions,
    createAccount,
    joinWithCode,
    continueAsSaved,
    addDemoPartner,
    enterDemo,
    leaveDemo,
    ensureDemoPair,
    demoMode,
    canUseDemo,
    setProfileGender,
    banAccount,
    unbanAccount,
    refreshCloudAccounts,
    requestEmailCode,
    verifyEmailCode,
    signInWithPassword,
    setAccountPassword,
    signOut,
    unpairAndWipe,
    deleteOwnAccount,
    submitContentReport,
    resolveContentReport,
    contentReports,
    sendFeedback,
    feedbackNotes,
    sendSpicyInvite,
    acceptInvite,
    declineInvite,
    configureGame,
    toggleDeckPick,
    fillPicksRandomly,
    lockInPicks,
    dealHand,
    shuffleHand,
    chooseHandCard,
    completeActiveCard,
    playDemoPartnerTurn,
    resolveFinishReveal,
    playCard,
    blockCard,
    unlockPrivate,
    readyToMoveOn,
    skipSimpleCard,
    rateCard,
    finishRatings,
    endGame,
    toggleCardActive,
    addCustomCard,
    submitCheckIn,
    requestCheckIn,
    submitCuriosity,
    submitDiscoverAnswer,
    skipDiscover,
    restoreDiscoverSkip,
    undoDiscover,
    drawTalkQuestion,
    shuffleTalkQuestion,
    submitTalkAnswer,
    sendSpicyDare,
    respondSpicyDare,
    completeSpicyDare,
    markSpicyDareRead,
    pokeSpicyDare,
    pokePartner,
    sendChickenDare,
    respondChickenDare,
    completeChickenDare,
    sendPositionInvite,
    respondPositionInvite,
    completePositionInvite,
    savePosition,
    unsavePosition,
    markPositionSaveDone,
    ratePlayItem,
    sendDateNightAsk,
    respondDateNightAsk,
    sendRoleplayInvite,
    respondRoleplayInvite,
    completeRoleplayInvite,
    saveRoleplay,
    unsaveRoleplay,
    markRoleplaySaveDone,
    saveDare,
    unsaveDare,
    markDareSaveDone,
    addMilestone,
    setFeaturedMilestone,
    removeMilestone,
    addCalendarEvent,
    updateCalendarEvent,
    removeCalendarEvent,
    addErrandItem,
    toggleErrandDone,
    removeErrandItem,
    clearDoneErrands,
    spinMeal,
    voteMeal,
    sendMealWant,
    dismissMealWant,
    addCustomMeal,
    removeMealFromMenu,
    toggleDesire,
    swipeFantasy,
    forgetFantasySwipe,
    askFantasyTonight,
    respondFantasyTonight,
    completeFantasyMatch,
    reopenFantasyMatch,
    createCoupon,
    acceptCoupon,
    redeemCoupon,
    scratchCard,
    ensureStarterLists,
    createCoupleList,
    setListHidden,
    addListEntry,
    completeListEntry,
    rateListEntry,
    reopenListEntry,
    addJarNote,
    voteOpenJar,
    openJarNote,
    addBucketItem,
    spinDateNight,
    markBucketDone,
    toggleRitual,
    enablePush,
    sendTestPush,
    notifyPartner,
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
