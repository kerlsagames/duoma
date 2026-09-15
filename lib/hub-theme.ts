import {
  hexAlpha,
  luminance,
  normalizeHex,
  paintColorTree,
  parseHex,
  sameHex,
} from "@/lib/color-paint";
import { HUBS, hubById, type HubDef, type HubId } from "@/lib/hubs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

export const HUB_THEME_KEY = "duoma:hubThemes:v1";

export type HubTheme = {
  hex: string;
  accent: string;
  accentSoft: string;
  tile: string;
  tileInk: string;
};

export type HubThemes = Record<HubId, HubTheme>;

export const HUB_COLOR_SWATCHES: { id: string; hex: string; label: string }[] = [
  { id: "rose", hex: "#FF6B9A", label: "Rose" },
  { id: "hot", hex: "#FF4D6A", label: "Hot" },
  { id: "gold", hex: "#F0C75E", label: "Gold" },
  { id: "teal", hex: "#3ECFBF", label: "Teal" },
  { id: "magenta", hex: "#E31B5D", label: "Magenta" },
  { id: "coral", hex: "#FF6B4A", label: "Coral" },
  { id: "violet", hex: "#A78BFA", label: "Violet" },
  { id: "sky", hex: "#5B8CFF", label: "Sky" },
  { id: "mint", hex: "#3DDC97", label: "Mint" },
  { id: "cherry", hex: "#FF007F", label: "Cherry" },
  { id: "copper", hex: "#E09A4A", label: "Copper" },
  { id: "lilac", hex: "#C9A0DC", label: "Lilac" },
];

export const HUB_COLOR_ORDER: HubId[] = ["connect", "desire", "play", "home-base"];

function themeFromHub(hub: HubDef): HubTheme {
  return {
    hex: hub.tile,
    accent: hub.accent,
    accentSoft: hub.accentSoft,
    tile: hub.tile,
    tileInk: hub.tileInk,
  };
}

export function defaultHubThemes(): HubThemes {
  return {
    connect: themeFromHub(HUBS[0]!),
    desire: themeFromHub(HUBS[1]!),
    play: themeFromHub(HUBS[2]!),
    "home-base": themeFromHub(HUBS[3]!),
  };
}

export function themeFromHex(hex: string): HubTheme | null {
  const normalized = normalizeHex(hex);
  const rgb = normalized ? parseHex(normalized) : null;
  if (!normalized || !rgb) return null;
  const ink = luminance(rgb) > 0.48 ? "#161018" : "#F6F3F0";
  return {
    hex: normalized,
    accent: normalized,
    accentSoft: hexAlpha(normalized, 0.18),
    tile: normalized,
    tileInk: ink,
  };
}

function hydrateHubTheme(raw: unknown, fallback: HubTheme): HubTheme {
  if (!raw || typeof raw !== "object") return fallback;
  const row = raw as Partial<HubTheme>;
  const hex =
    typeof row.hex === "string"
      ? row.hex
      : typeof row.accent === "string"
        ? row.accent
        : typeof row.tile === "string"
          ? row.tile
          : "";
  return themeFromHex(hex) ?? fallback;
}

export function hydrateHubThemes(raw: unknown): HubThemes {
  const base = defaultHubThemes();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<Record<HubId, unknown>>;
  return {
    connect: hydrateHubTheme(row.connect, base.connect),
    desire: hydrateHubTheme(row.desire, base.desire),
    play: hydrateHubTheme(row.play, base.play),
    "home-base": hydrateHubTheme(row["home-base"], base["home-base"]),
  };
}

async function readRaw(): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(HUB_THEME_KEY);
  }
  return AsyncStorage.getItem(HUB_THEME_KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(HUB_THEME_KEY, value);
    return;
  }
  await AsyncStorage.setItem(HUB_THEME_KEY, value);
}

let cache: HubThemes = defaultHubThemes();
const listeners = new Set<(themes: HubThemes) => void>();

function emit(themes: HubThemes) {
  cache = themes;
  listeners.forEach((fn) => fn(themes));
}

export function peekHubThemes(): HubThemes {
  return cache;
}

export function subscribeHubThemes(fn: (themes: HubThemes) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export async function loadHubThemes(): Promise<HubThemes> {
  try {
    const raw = await readRaw();
    const next = hydrateHubThemes(raw ? JSON.parse(raw) : null);
    emit(next);
    return next;
  } catch {
    emit(defaultHubThemes());
    return cache;
  }
}

export async function writeHubThemes(themes: HubThemes): Promise<void> {
  emit(themes);
  try {
    await writeRaw(JSON.stringify(themes));
  } catch {
    // Keep the in-memory update even if disk fails.
  }
}

export async function setHubColor(hubId: HubId, hex: string): Promise<HubThemes> {
  const theme = themeFromHex(hex);
  if (!theme) return cache;
  const next = { ...cache, [hubId]: theme };
  await writeHubThemes(next);
  return next;
}

export async function resetHubThemes(): Promise<HubThemes> {
  const next = defaultHubThemes();
  await writeHubThemes(next);
  return next;
}

export function applyHubTheme(hub: HubDef, theme: HubTheme): HubDef {
  if (sameHex(theme.hex, hub.tile) || sameHex(theme.hex, hub.accent)) {
    return hub;
  }
  return {
    ...hub,
    accent: theme.accent,
    accentSoft: theme.accentSoft,
    tile: theme.tile,
    tileInk: theme.tileInk,
  };
}

export function themedHubs(themes: HubThemes = cache): HubDef[] {
  return HUBS.map((hub) => applyHubTheme(hub, themes[hub.id]));
}

export function themedHub(hubId: HubId, themes: HubThemes = cache): HubDef | null {
  const hub = hubById(hubId);
  if (!hub) return null;
  return applyHubTheme(hub, themes[hubId]);
}

export function defaultHexForHub(hubId: HubId): string {
  return defaultHubThemes()[hubId].hex;
}

/** Keep a section's crafted palette until this hub's colour is customised. */
export function sectionAccent(hubId: HubId, original: string): string {
  const chosen = cache[hubId]?.hex ?? defaultHexForHub(hubId);
  if (sameHex(chosen, defaultHexForHub(hubId))) return original;
  return chosen;
}

export function themedTone<T>(hubId: HubId, tone: T, fromHex: string): T {
  const toHex = sectionAccent(hubId, fromHex);
  if (sameHex(toHex, fromHex)) return tone;
  return paintColorTree(tone, fromHex, toHex);
}

export function liveTone<T extends object>(hubId: HubId, base: T, fromHex: string): T {
  return new Proxy(base, {
    get(target, prop) {
      if (prop === "__base") return target;
      const painted = themedTone(hubId, target, fromHex) ?? target;
      return Reflect.get(painted as object, prop, painted);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, prop) {
      const painted = themedTone(hubId, target, fromHex) ?? target;
      return Object.getOwnPropertyDescriptor(painted as object, prop);
    },
  });
}

const HubThemeContext = createContext<HubThemes>(defaultHubThemes());

export function HubThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<HubThemes>(peekHubThemes);
  useEffect(() => {
    const unsub = subscribeHubThemes(setThemes);
    void loadHubThemes().then(setThemes);
    return unsub;
  }, []);
  return createElement(HubThemeContext.Provider, { value: themes }, children);
}

export function useHubThemes(): HubThemes {
  return useContext(HubThemeContext);
}

export function useThemedHubs(): HubDef[] {
  const themes = useHubThemes();
  return useMemo(() => themedHubs(themes), [themes]);
}

export function useThemedHub(hubId: HubId): HubDef | null {
  const themes = useHubThemes();
  return useMemo(() => themedHub(hubId, themes), [hubId, themes]);
}

export function useSectionAccent(hubId: HubId, original: string): string {
  const themes = useHubThemes();
  return sameHex(themes[hubId].hex, defaultHexForHub(hubId))
    ? original
    : themes[hubId].hex;
}
