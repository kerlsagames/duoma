import { sameHex } from "@/lib/color-paint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export type DensityId = "compact" | "regular" | "roomy";
export type TypefaceId = "sans" | "serif" | "mono";

export const DENSITY_OPTIONS: { id: DensityId; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "regular", label: "Regular" },
  { id: "roomy", label: "Roomy" },
];

export const TYPEFACE_OPTIONS: { id: TypefaceId; label: string }[] = [
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
];

export function densityLook(density: DensityId | string | undefined) {
  if (density === "compact") {
    return {
      title: 28,
      titleLine: 32,
      body: 14,
      bodyLine: 20,
      gap: 8,
      pad: 12,
      scale: 0.94,
    };
  }
  if (density === "roomy") {
    return {
      title: 40,
      titleLine: 46,
      body: 18,
      bodyLine: 26,
      gap: 18,
      pad: 22,
      scale: 1.06,
    };
  }
  return {
    title: 34,
    titleLine: 40,
    body: 15,
    bodyLine: 22,
    gap: 12,
    pad: 16,
    scale: 1,
  };
}

export function typefaceFamily(id: TypefaceId | string | undefined) {
  if (id === "serif") {
    return Platform.select({
      ios: "Georgia",
      android: "serif",
      default: 'Georgia, "Iowan Old Style", Palatino, serif',
    });
  }
  if (id === "mono") {
    return Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: '"Space Mono", ui-monospace, Menlo, monospace',
    });
  }
  return Platform.select({
    ios: "System",
    android: "sans-serif",
    default: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  });
}

export function isTypefaceId(value: unknown): value is TypefaceId {
  return value === "sans" || value === "serif" || value === "mono";
}

export function isDensityId(value: unknown): value is DensityId {
  return value === "compact" || value === "regular" || value === "roomy";
}

export function appPrefsKey(appId: string) {
  return `duoma:appPrefs:v2:${appId}`;
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
    typeface: "sans" as TypefaceId,
    ...extras,
  } as { accent: string; density: DensityId; typeface: TypefaceId } & WidenBools<E>;
  const { prefs, ready, patch, reset } = useAppPrefs(appId, defaults);
  const accent = resolveAccent(prefs.accent, fallbackAccent);
  const look = densityLook(prefs.density);
  const fontFamily = typefaceFamily(prefs.typeface);
  const stored = prefs.accent.trim();
  const wash =
    stored && !sameHex(stored, fallbackAccent) ? stored : undefined;
  return { prefs, ready, patch, reset, accent, look, fontFamily, fallbackAccent, wash };
}
