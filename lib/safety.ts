import type { AppDB } from "@/lib/types";
import { emptyMiniState } from "@/lib/mini-content";
import { nowIso } from "@/lib/ids";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const MINI_APPS_KEY = "duoma:miniApps:v1";
export const MEDIA_COUPLE_KEY = "duoma:mediaCouple";
export const SAFETY_EVENT_KEY = "duoma:safety:event";
export const REPORTS_KEY = "duoma:contentReports:v1";

const SEXY_VAULT_DB = "duoma-sexy-vault";
const VOICE_DB = "duoma-voice-notes";

export type SafetyEvent = {
  type: "unpair" | "delete-account";
  coupleId: string | null;
  at: string;
};

function webStore(): Storage | null {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

async function wipeIndexedDb(name: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  await new Promise<void>((resolve) => {
    try {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function wipeLocalMediaCaches(): Promise<void> {
  await wipeIndexedDb(SEXY_VAULT_DB);
  await wipeIndexedDb(VOICE_DB);
  const empty = JSON.stringify(emptyMiniState());
  const store = webStore();
  if (store) store.setItem(MINI_APPS_KEY, empty);
  else await AsyncStorage.setItem(MINI_APPS_KEY, empty);
}

export function broadcastSafetyEvent(event: SafetyEvent): void {
  const store = webStore();
  if (store) {
    store.setItem(SAFETY_EVENT_KEY, JSON.stringify(event));
  }
  if (typeof BroadcastChannel !== "undefined") {
    try {
      new BroadcastChannel("duoma-realtime").postMessage(event);
    } catch {
      // Channel not available.
    }
  }
}

export async function readMediaCoupleId(): Promise<string | null> {
  try {
    const store = webStore();
    if (store) return store.getItem(MEDIA_COUPLE_KEY);
    return await AsyncStorage.getItem(MEDIA_COUPLE_KEY);
  } catch {
    return null;
  }
}

export async function writeMediaCoupleId(id: string | null): Promise<void> {
  const store = webStore();
  if (store) {
    if (id) store.setItem(MEDIA_COUPLE_KEY, id);
    else store.removeItem(MEDIA_COUPLE_KEY);
    return;
  }
  if (id) await AsyncStorage.setItem(MEDIA_COUPLE_KEY, id);
  else await AsyncStorage.removeItem(MEDIA_COUPLE_KEY);
}

function dropCouple<T extends { coupleId?: string | null }>(
  rows: T[],
  coupleId: string
): T[] {
  return rows.filter((row) => row.coupleId !== coupleId);
}

/** Remove every row that belonged to a pairing. Profiles stay. */
export function stripCoupleFromDb(db: AppDB, coupleId: string): AppDB {
  const goneGames = new Set(
    db.games.filter((row) => row.coupleId === coupleId).map((row) => row.id)
  );
  return {
    ...db,
    couples: db.couples.filter((row) => row.id !== coupleId),
    cards: dropCouple(db.cards, coupleId),
    games: dropCouple(db.games, coupleId),
    gamePlayers: db.gamePlayers.filter((row) => !goneGames.has(row.gameId)),
    deck: db.deck.filter((row) => !goneGames.has(row.gameId)),
    ratings: dropCouple(db.ratings, coupleId),
    checkIns: dropCouple(db.checkIns, coupleId),
    checkInRequests: dropCouple(db.checkInRequests, coupleId),
    curiosityAnswers: dropCouple(db.curiosityAnswers, coupleId),
    curiositySkips: dropCouple(db.curiositySkips, coupleId),
    milestones: dropCouple(db.milestones, coupleId),
    desireToggles: dropCouple(db.desireToggles, coupleId),
    fantasySwipes: dropCouple(db.fantasySwipes, coupleId),
    fantasyTonightAsks: dropCouple(db.fantasyTonightAsks, coupleId),
    fantasyCompletions: dropCouple(db.fantasyCompletions, coupleId),
    coupons: dropCouple(db.coupons, coupleId),
    scratches: dropCouple(db.scratches, coupleId),
    coupleLists: dropCouple(db.coupleLists, coupleId),
    listEntries: dropCouple(db.listEntries, coupleId),
    listEntryRatings: dropCouple(db.listEntryRatings, coupleId),
    jarNotes: dropCouple(db.jarNotes, coupleId),
    jarOpenVotes: dropCouple(db.jarOpenVotes, coupleId),
    bucketItems: dropCouple(db.bucketItems, coupleId),
    ritualChecks: dropCouple(db.ritualChecks, coupleId),
    dateNightAsks: dropCouple(db.dateNightAsks, coupleId),
    positionSaves: dropCouple(db.positionSaves, coupleId),
    playItemRatings: dropCouple(db.playItemRatings, coupleId),
    pushSubscriptions: dropCouple(db.pushSubscriptions, coupleId),
    talkDecks: dropCouple(db.talkDecks, coupleId),
    talkDraws: dropCouple(db.talkDraws, coupleId),
    talkVault: dropCouple(db.talkVault, coupleId),
    spicyDares: dropCouple(db.spicyDares, coupleId),
    chickenPlays: dropCouple(db.chickenPlays, coupleId),
    positionInvites: dropCouple(db.positionInvites, coupleId),
    roleplayInvites: dropCouple(db.roleplayInvites, coupleId),
    roleplaySaves: dropCouple(db.roleplaySaves, coupleId),
    calendarEvents: dropCouple(db.calendarEvents, coupleId),
    errandItems: dropCouple(db.errandItems, coupleId),
    mealRounds: dropCouple(db.mealRounds, coupleId),
    mealWants: dropCouple(db.mealWants, coupleId),
    customMeals: dropCouple(db.customMeals, coupleId),
    hiddenMeals: dropCouple(db.hiddenMeals, coupleId),
    contentReports: db.contentReports ?? [],
  };
}

export function safetyEventNow(
  type: SafetyEvent["type"],
  coupleId: string | null
): SafetyEvent {
  return { type, coupleId, at: nowIso() };
}
