import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { defaultEnabledFlavorTags } from "@/games/get-spicy/flavor-tags";
import type { AppDB, GameSession } from "@/lib/types";

export const DB_KEY = "duoma:db";
export const SESSION_KEY = "duoma:session";
export const LAST_USER_KEY = "duoma:lastUser";

const hubEmpty = () => ({
  checkIns: [],
  checkInRequests: [],
  curiosityAnswers: [],
  milestones: [],
  desireToggles: [],
  coupons: [],
  scratches: [],
  jarNotes: [],
  jarOpenVotes: [],
  bucketItems: [],
  ritualChecks: [],
  pushSubscriptions: [],
  talkDecks: [],
  talkDraws: [],
  spicyDares: [],
});

export function emptyDb(): AppDB {
  return {
    profiles: [],
    couples: [],
    cards: [],
    games: [],
    gamePlayers: [],
    deck: [],
    ratings: [],
    ...hubEmpty(),
  };
}

function hydrateJarNote(row: AppDB["jarNotes"][number]): AppDB["jarNotes"][number] {
  return {
    ...row,
    openAt: row.openAt ?? null,
    openOption: row.openOption ?? null,
    openedAt: row.openedAt ?? null,
  };
}

function hydrateCoupon(row: AppDB["coupons"][number]): AppDB["coupons"][number] {
  return {
    ...row,
    reason: row.reason ?? null,
    categoryId: row.categoryId ?? null,
    ideaId: row.ideaId ?? null,
    useOption: row.useOption ?? null,
    expiresAt: row.expiresAt ?? null,
    acceptedAt: row.acceptedAt ?? null,
    redeemedAt: row.redeemedAt ?? null,
  };
}

function hydrateCuriosity(
  row: AppDB["curiosityAnswers"][number]
): AppDB["curiosityAnswers"][number] {
  return {
    ...row,
    answerIndex: row.answerIndex ?? null,
    guessIndex: row.guessIndex ?? null,
    body: row.body ?? "",
  };
}

function hydrateCheckIn(row: AppDB["checkIns"][number]): AppDB["checkIns"][number] {
  return {
    ...row,
    energy: row.energy ?? null,
    mood: row.mood ?? null,
    loveTank: row.loveTank ?? null,
    socialBattery: row.socialBattery ?? null,
    todayNeed: row.todayNeed ?? null,
    desireGauge: row.desireGauge ?? null,
    tonight: row.tonight ?? null,
  };
}

function hydrateGame(game: GameSession): GameSession {
  return {
    ...game,
    turnUserId: game.turnUserId ?? game.initiatorId ?? null,
    activePlayedBy: game.activePlayedBy ?? null,
    awaitingPrivate: game.awaitingPrivate ?? false,
    privateUnlocked: game.privateUnlocked ?? false,
    playedDate: game.playedDate ?? null,
    flavorTags:
      Array.isArray(game.flavorTags) && game.flavorTags.length > 0
        ? game.flavorTags
        : defaultEnabledFlavorTags(),
  };
}

function hydrateProfile(row: AppDB["profiles"][number]): AppDB["profiles"][number] {
  return {
    ...row,
    displayName: row.displayName?.trim() || "You",
    gender: row.gender === "male" || row.gender === "female" ? row.gender : null,
  };
}

export function hydrateDb(raw: Partial<AppDB> | null | undefined): AppDB {
  const base = emptyDb();
  if (!raw) return base;
  return {
    profiles: (raw.profiles ?? []).map(hydrateProfile),
    couples: raw.couples ?? [],
    cards: raw.cards ?? [],
    games: (raw.games ?? []).map(hydrateGame),
    gamePlayers: raw.gamePlayers ?? [],
    deck: raw.deck ?? [],
    ratings: raw.ratings ?? [],
    checkIns: (raw.checkIns ?? []).map(hydrateCheckIn),
    checkInRequests: raw.checkInRequests ?? [],
    curiosityAnswers: (raw.curiosityAnswers ?? []).map(hydrateCuriosity),
    milestones: raw.milestones ?? [],
    desireToggles: raw.desireToggles ?? [],
    coupons: (raw.coupons ?? []).map(hydrateCoupon),
    scratches: raw.scratches ?? [],
    jarNotes: (raw.jarNotes ?? []).map(hydrateJarNote),
    jarOpenVotes: raw.jarOpenVotes ?? [],
    bucketItems: raw.bucketItems ?? [],
    ritualChecks: raw.ritualChecks ?? [],
    pushSubscriptions: raw.pushSubscriptions ?? [],
    talkDecks: raw.talkDecks ?? [],
    talkDraws: raw.talkDraws ?? [],
    spicyDares: (raw.spicyDares ?? []).map(hydrateSpicyDare),
  };
}

function hydrateSpicyDare(row: AppDB["spicyDares"][number]): AppDB["spicyDares"][number] {
  return {
    ...row,
    dareId: row.dareId ?? null,
    categories: row.categories ?? [],
    customWhen: row.customWhen ?? null,
    dueAt: row.dueAt ?? null,
    answeredAt: row.answeredAt ?? null,
    completedAt: row.completedAt ?? null,
  };
}

export async function readDb(): Promise<AppDB> {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(DB_KEY);
      return hydrateDb(raw ? (JSON.parse(raw) as AppDB) : null);
    }
    const raw = await AsyncStorage.getItem(DB_KEY);
    return hydrateDb(raw ? (JSON.parse(raw) as AppDB) : null);
  } catch {
    return emptyDb();
  }
}

export async function writeDb(db: AppDB): Promise<void> {
  const raw = JSON.stringify(db);
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(DB_KEY, raw);
    return;
  }
  await AsyncStorage.setItem(DB_KEY, raw);
}

export async function readSessionUserId(): Promise<string | null> {
  try {
    if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem(SESSION_KEY);
    }
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function writeSessionUserId(userId: string | null): Promise<void> {
  if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
    if (userId) sessionStorage.setItem(SESSION_KEY, userId);
    else sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  if (userId) await AsyncStorage.setItem(SESSION_KEY, userId);
  else await AsyncStorage.removeItem(SESSION_KEY);
}

export async function readLastUserId(): Promise<string | null> {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      return localStorage.getItem(LAST_USER_KEY);
    }
    return await AsyncStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
}

export async function writeLastUserId(userId: string | null): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    if (userId) localStorage.setItem(LAST_USER_KEY, userId);
    else localStorage.removeItem(LAST_USER_KEY);
    return;
  }
  if (userId) await AsyncStorage.setItem(LAST_USER_KEY, userId);
  else await AsyncStorage.removeItem(LAST_USER_KEY);
}
