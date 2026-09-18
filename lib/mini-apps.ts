import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { emptyMiniState, hydrateMiniState, type MiniState } from "@/lib/mini-content";

export const MINI_APPS_LEGACY_KEY = "duoma:miniApps:v1";
const PREFIX = "duoma:miniApps:v1:";

let activeCoupleId: string | null | undefined;
let cache: MiniState | null = null;
const listeners = new Set<(state: MiniState) => void>();

function emit(state: MiniState) {
  cache = state;
  listeners.forEach((fn) => fn(state));
}

function storageKey(coupleId: string | null): string {
  return `${PREFIX}${coupleId || "local"}`;
}

function isMiniAppsKey(key: string | null | undefined): boolean {
  return Boolean(
    key && (key === MINI_APPS_LEGACY_KEY || key.startsWith(PREFIX))
  );
}

function resetJobLastDone(state: MiniState): MiniState {
  let changed = false;
  const maintenance = state.maintenance.map((row) => {
    if (!row.lastDone) return row;
    changed = true;
    return { ...row, lastDone: null };
  });
  return changed ? { ...state, maintenance } : state;
}

async function readKey(key: string): Promise<string | null> {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }
  return AsyncStorage.getItem(key);
}

async function writeKey(key: string, raw: string): Promise<void> {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, raw);
    return;
  }
  await AsyncStorage.setItem(key, raw);
}

async function removeKey(key: string): Promise<void> {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

async function listMiniKeys(): Promise<string[]> {
  if (typeof localStorage !== "undefined") {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (isMiniAppsKey(key)) keys.push(key as string);
    }
    return keys;
  }
  const all = await AsyncStorage.getAllKeys();
  return all.filter((key) => isMiniAppsKey(key));
}

async function parseState(raw: string | null): Promise<MiniState | null> {
  if (!raw) return null;
  try {
    return hydrateMiniState(JSON.parse(raw));
  } catch {
    return null;
  }
}

const PLAY_KEYS = [
  "birthdays",
  "trips",
  "intimacy",
  "predictions",
  "pings",
  "flashes",
  "triviaQuestions",
  "triviaAttempts",
  "knowMeSheets",
  "knowMeGuesses",
  "twoTruths",
  "photos",
  "capsules",
  "fairSpins",
  "maintenance",
  "whoLast",
  "cheers",
  "giftPeople",
  "giftItems",
  "padNotes",
  "crossword",
  "audioNotes",
] as const;

export function miniHasPlay(state: MiniState | null | undefined): state is MiniState {
  if (!state) return false;
  return PLAY_KEYS.some((key) => {
    const value = state[key];
    return Array.isArray(value) && value.length > 0;
  });
}

async function readOrphanMini(): Promise<MiniState | null> {
  const local = await parseState(await readKey(storageKey(null)));
  if (miniHasPlay(local)) return local;
  const legacy = await parseState(await readKey(MINI_APPS_LEGACY_KEY));
  if (miniHasPlay(legacy)) return resetJobLastDone(legacy);
  return null;
}

async function adoptOrphanMini(coupleId: string): Promise<MiniState | null> {
  const orphan = await readOrphanMini();
  if (!orphan) return null;
  await writeKey(storageKey(coupleId), JSON.stringify(orphan));
  await removeKey(storageKey(null));
  await removeKey(MINI_APPS_LEGACY_KEY);
  return orphan;
}

export async function loadMiniState(): Promise<MiniState> {
  if (cache) return cache;
  if (activeCoupleId === undefined) {
    cache = emptyMiniState();
    return cache;
  }
  const key = storageKey(activeCoupleId);
  try {
    const scoped = await parseState(await readKey(key));
    if (miniHasPlay(scoped)) {
      cache = scoped;
      return cache;
    }
    if (activeCoupleId) {
      const adopted = await adoptOrphanMini(activeCoupleId);
      if (adopted) {
        cache = adopted;
        return cache;
      }
    }
    if (scoped) {
      cache = scoped;
      return cache;
    }
    cache = emptyMiniState();
  } catch {
    cache = emptyMiniState();
  }
  return cache;
}

/** Read one pair’s hub cache without switching the live session. */
export async function peekMiniForCouple(coupleId: string): Promise<MiniState | null> {
  if (!coupleId) return null;
  try {
    if (activeCoupleId === coupleId && cache) return cache;
    const scoped = await parseState(await readKey(storageKey(coupleId)));
    if (miniHasPlay(scoped)) return scoped;
    const orphan = await readOrphanMini();
    if (orphan) return orphan;
    if (scoped) return scoped;
    if (activeCoupleId === coupleId) return await loadMiniState();
    return null;
  } catch {
    return null;
  }
}

export async function bindMiniAppsCouple(coupleId: string | null): Promise<MiniState> {
  if (activeCoupleId === coupleId && cache) return cache;
  activeCoupleId = coupleId;
  cache = null;
  const next = await loadMiniState();
  emit(next);
  if (coupleId && miniHasPlay(next)) {
    void import("@/lib/couple-backup").then((mod) => mod.scheduleFromMini(coupleId));
  }
  return next;
}

export async function patchMini(
  fn: (state: MiniState) => MiniState
): Promise<MiniState> {
  const current = await loadMiniState();
  const next = fn(current);
  emit(next);
  if (activeCoupleId === undefined) return next;
  try {
    await writeKey(storageKey(activeCoupleId), JSON.stringify(next));
    const coupleId = activeCoupleId;
    if (coupleId) {
      void import("@/lib/couple-backup").then((mod) =>
        mod.scheduleFromMini(coupleId)
      );
    }
  } catch {
    // Keep the in-memory update even if disk fails.
  }
  return next;
}

export async function wipeMiniApps(): Promise<MiniState> {
  cache = emptyMiniState();
  emit(cache);
  try {
    const keys = await listMiniKeys();
    await Promise.all(keys.map((key) => removeKey(key)));
  } catch {
    // In-memory empty still applies.
  }
  return cache;
}

/** Drop one pair’s hub cache. Other pairs on this phone stay put. */
export async function wipeMiniAppsForCouple(coupleId: string): Promise<MiniState | null> {
  try {
    await removeKey(storageKey(coupleId));
  } catch {
    // Keep going even if disk fails.
  }
  if (activeCoupleId !== coupleId) return cache;
  cache = emptyMiniState();
  emit(cache);
  return cache;
}

export async function reloadMiniFromDisk(): Promise<MiniState> {
  cache = null;
  return loadMiniState();
}

export function useMiniApps() {
  const [data, setData] = useState<MiniState>(cache ?? emptyMiniState());
  const [ready, setReady] = useState(Boolean(cache) && activeCoupleId !== undefined);

  useEffect(() => {
    const onChange = (state: MiniState) => {
      setData(state);
      setReady(true);
    };
    listeners.add(onChange);
    let alive = true;
    if (activeCoupleId !== undefined) {
      loadMiniState().then((state) => {
        if (!alive) return;
        setData(state);
        setReady(true);
      });
    }
    const onStorage = (event: StorageEvent) => {
      if (!isMiniAppsKey(event.key) && event.key !== "duoma:safety:event") return;
      void reloadMiniFromDisk().then((state) => {
        if (alive) setData(state);
      });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      alive = false;
      listeners.delete(onChange);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);

  const patch = useCallback((fn: (state: MiniState) => MiniState) => {
    return patchMini(fn);
  }, []);

  return { data, ready, patch };
}
