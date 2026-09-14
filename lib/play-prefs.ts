import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export type PlayRatingsPrefs = {
  ratingsOn: boolean;
};

export const DATE_NIGHT_PREFS_KEY = "duoma:dateNightPrefs";
export const POSITIONS_PREFS_KEY = "duoma:positionsPrefs";

export function defaultPlayRatingsPrefs(): PlayRatingsPrefs {
  return { ratingsOn: false };
}

export function hydratePlayRatingsPrefs(raw: unknown): PlayRatingsPrefs {
  const base = defaultPlayRatingsPrefs();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<PlayRatingsPrefs>;
  return {
    ratingsOn: typeof row.ratingsOn === "boolean" ? row.ratingsOn : base.ratingsOn,
  };
}

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }
  return AsyncStorage.getItem(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

export function usePlayRatingsPrefs(storageKey: string) {
  const [prefs, setPrefs] = useState<PlayRatingsPrefs>(defaultPlayRatingsPrefs);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void readRaw(storageKey).then((raw) => {
      if (!alive) return;
      try {
        setPrefs(hydratePlayRatingsPrefs(raw ? JSON.parse(raw) : null));
      } catch {
        setPrefs(defaultPlayRatingsPrefs());
      }
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [storageKey]);

  const save = useCallback(
    async (next: PlayRatingsPrefs) => {
      setPrefs(next);
      await writeRaw(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  return { prefs, ready, save };
}
