import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export type DensityId = "compact" | "regular" | "roomy";

export const DENSITY_OPTIONS: { id: DensityId; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "regular", label: "Regular" },
  { id: "roomy", label: "Roomy" },
];

export function densityLook(density: DensityId | string | undefined) {
  if (density === "compact") {
    return { title: 28, titleLine: 32, body: 14, bodyLine: 20, gap: 8 };
  }
  if (density === "roomy") {
    return { title: 40, titleLine: 46, body: 18, bodyLine: 26, gap: 16 };
  }
  return { title: 34, titleLine: 40, body: 15, bodyLine: 22, gap: 12 };
}

export function appPrefsKey(appId: string) {
  return `duoma:appPrefs:${appId}`;
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

function mergePrefs<T extends Record<string, unknown>>(
  defaults: T,
  raw: unknown
): T {
  if (!raw || typeof raw !== "object") return { ...defaults };
  const row = raw as Record<string, unknown>;
  const next = { ...defaults };
  (Object.keys(defaults) as (keyof T)[]).forEach((key) => {
    const fallback = defaults[key];
    const value = row[key as string];
    if (value === undefined || value === null) return;
    if (typeof fallback === "string" && typeof value === "string") {
      next[key] = value as T[keyof T];
      return;
    }
    if (typeof fallback === "boolean" && typeof value === "boolean") {
      next[key] = value as T[keyof T];
      return;
    }
    if (typeof fallback === "number" && typeof value === "number") {
      next[key] = value as T[keyof T];
    }
  });
  return next;
}

export function useAppPrefs<T extends Record<string, unknown>>(
  appId: string,
  defaults: T
) {
  const [prefs, setPrefs] = useState<T>(defaults);
  const [ready, setReady] = useState(false);
  const key = appPrefsKey(appId);
  const defaultsJson = JSON.stringify(defaults);

  useEffect(() => {
    let alive = true;
    const base = JSON.parse(defaultsJson) as T;
    void readRaw(key).then((raw) => {
      if (!alive) return;
      try {
        setPrefs(mergePrefs(base, raw ? JSON.parse(raw) : null));
      } catch {
        setPrefs(base);
      }
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [defaultsJson, key]);

  const save = useCallback(
    async (next: T) => {
      setPrefs(next);
      await writeRaw(key, JSON.stringify(next));
    },
    [key]
  );

  const patch = useCallback(
    (partial: Partial<T>) => {
      void save({ ...prefs, ...partial });
    },
    [prefs, save]
  );

  const reset = useCallback(() => {
    const base = JSON.parse(defaultsJson) as T;
    void save(base);
  }, [defaultsJson, save]);

  return { prefs, ready, patch, reset, save };
}

export function resolveAccent(stored: string | undefined, fallback: string) {
  return stored && stored.trim() ? stored : fallback;
}

type WidenBools<T> = {
  [K in keyof T]: T[K] extends boolean ? boolean : T[K];
};

export function useAppLook<E extends Record<string, string | boolean | number>>(
  appId: string,
  fallbackAccent: string,
  extras: E
) {
  const defaults = {
    accent: "",
    density: "regular" as DensityId,
    ...extras,
  } as { accent: string; density: DensityId } & WidenBools<E>;
  const { prefs, ready, patch, reset } = useAppPrefs(appId, defaults);
  const accent = resolveAccent(prefs.accent, fallbackAccent);
  const look = densityLook(prefs.density);
  return { prefs, ready, patch, reset, accent, look, fallbackAccent };
}
