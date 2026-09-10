import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
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
    checkIns: (raw.checkIns ?? []).map(hydrateCheckIn),
    checkInRequests: raw.checkInRequests ?? [],
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
