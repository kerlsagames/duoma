import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { AppDB } from "@/lib/types";

export const DB_KEY = "fuse:db";
export const SESSION_KEY = "fuse:session";

export function emptyDb(): AppDB {
  return {
    profiles: [],
    couples: [],
    cards: [],
    games: [],
    gamePlayers: [],
    deck: [],
  };
}

export async function readDb(): Promise<AppDB> {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? (JSON.parse(raw) as AppDB) : emptyDb();
    }
    const raw = await AsyncStorage.getItem(DB_KEY);
    return raw ? (JSON.parse(raw) as AppDB) : emptyDb();
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
