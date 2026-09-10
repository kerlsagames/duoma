import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { AppDB, GameSession } from "@/lib/types";

export const DB_KEY = "fuse:db";
export const SESSION_KEY = "fuse:session";
export const LAST_USER_KEY = "fuse:lastUser";

const hubEmpty = () => ({
  checkIns: [],
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

function hydrateGame(game: GameSession): GameSession {
  return {
    ...game,
    turnUserId: game.turnUserId ?? game.initiatorId ?? null,
    activePlayedBy: game.activePlayedBy ?? null,
    awaitingPrivate: game.awaitingPrivate ?? false,
    privateUnlocked: game.privateUnlocked ?? false,
    playedDate: game.playedDate ?? null,
  };
}

export function hydrateDb(raw: Partial<AppDB> | null | undefined): AppDB {
  const base = emptyDb();
  if (!raw) return base;
  return {
    profiles: raw.profiles ?? [],
    couples: raw.couples ?? [],
    cards: raw.cards ?? [],
    games: (raw.games ?? []).map(hydrateGame),
    gamePlayers: raw.gamePlayers ?? [],
    deck: raw.deck ?? [],
    ratings: raw.ratings ?? [],
    checkIns: raw.checkIns ?? [],
    curiosityAnswers: raw.curiosityAnswers ?? [],
    milestones: raw.milestones ?? [],
    desireToggles: raw.desireToggles ?? [],
    coupons: raw.coupons ?? [],
    scratches: raw.scratches ?? [],
    jarNotes: raw.jarNotes ?? [],
    jarOpenVotes: raw.jarOpenVotes ?? [],
    bucketItems: raw.bucketItems ?? [],
    ritualChecks: raw.ritualChecks ?? [],
    pushSubscriptions: raw.pushSubscriptions ?? [],
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
