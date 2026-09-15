import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

export const CATALOG_KEY = "duoma:catalog:v1";
const CHANNEL = "duoma-catalog";

export type CatalogKey =
  | "fantasy"
  | "spicyDares"
  | "chicken"
  | "roleplays"
  | "positions"
  | "dates"
  | "coupons"
  | "discover"
  | "curiosity"
  | "how"
  | "spicySeeds"
  | "photo";

export type CatalogRow = {
  id: string;
  title: string;
  body: string;
  group: string;
};

export type FieldEdit = {
  title?: string;
  body?: string;
  group?: string;
};

export type CatalogDeck = {
  hiddenIds: string[];
  edits: Record<string, FieldEdit>;
  extras: CatalogRow[];
};

export type CatalogOverlay = Record<CatalogKey, CatalogDeck>;

export const CATALOG_KEYS: { id: CatalogKey; label: string; add: boolean }[] = [
  { id: "fantasy", label: "Fantasy Matcher", add: true },
  { id: "spicyDares", label: "Dare Me (spicy)", add: true },
  { id: "chicken", label: "Chicken", add: true },
  { id: "roleplays", label: "Roleplays", add: true },
  { id: "positions", label: "Positions", add: true },
  { id: "dates", label: "Date Night", add: true },
  { id: "coupons", label: "Coupons", add: true },
  { id: "discover", label: "Discover", add: true },
  { id: "curiosity", label: "Curiosity", add: true },
  { id: "how", label: "The How", add: false },
  { id: "spicySeeds", label: "Get Spicy seeds", add: true },
  { id: "photo", label: "Photo Memory", add: true },
];

function emptyDeck(): CatalogDeck {
  return { hiddenIds: [], edits: {}, extras: [] };
}

export function emptyOverlay(): CatalogOverlay {
  return {
    fantasy: emptyDeck(),
    spicyDares: emptyDeck(),
    chicken: emptyDeck(),
    roleplays: emptyDeck(),
    positions: emptyDeck(),
    dates: emptyDeck(),
    coupons: emptyDeck(),
    discover: emptyDeck(),
    curiosity: emptyDeck(),
    how: emptyDeck(),
    spicySeeds: emptyDeck(),
    photo: emptyDeck(),
  };
}

function hydrateDeck(raw: unknown): CatalogDeck {
  const base = emptyDeck();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<CatalogDeck>;
  return {
    hiddenIds: Array.isArray(row.hiddenIds)
      ? row.hiddenIds.filter((id): id is string => typeof id === "string")
      : [],
    edits:
      row.edits && typeof row.edits === "object"
        ? Object.fromEntries(
            Object.entries(row.edits).filter(
              ([id, edit]) => typeof id === "string" && edit && typeof edit === "object"
            )
          )
        : {},
    extras: Array.isArray(row.extras)
      ? row.extras
          .filter((item): item is CatalogRow => Boolean(item && typeof item.id === "string"))
          .map((item) => ({
            id: item.id,
            title: String(item.title ?? ""),
            body: String(item.body ?? ""),
            group: String(item.group ?? ""),
          }))
      : [],
  };
}

export function hydrateOverlay(raw: unknown): CatalogOverlay {
  const base = emptyOverlay();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<Record<CatalogKey, unknown>>;
  for (const key of Object.keys(base) as CatalogKey[]) {
    base[key] = hydrateDeck(row[key]);
  }
  return base;
}

async function readRaw(): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(CATALOG_KEY);
  }
  return AsyncStorage.getItem(CATALOG_KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(CATALOG_KEY, value);
    return;
  }
  await AsyncStorage.setItem(CATALOG_KEY, value);
}

let cache: CatalogOverlay = emptyOverlay();
const listeners = new Set<(overlay: CatalogOverlay) => void>();

function emit(next: CatalogOverlay) {
  cache = next;
  listeners.forEach((fn) => fn(next));
}

export function peekCatalog(): CatalogOverlay {
  return cache;
}

export function subscribeCatalog(fn: (overlay: CatalogOverlay) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export async function loadCatalog(): Promise<CatalogOverlay> {
  try {
    const raw = await readRaw();
    const next = hydrateOverlay(raw ? JSON.parse(raw) : null);
    emit(next);
    return next;
  } catch {
    emit(emptyOverlay());
    return cache;
  }
}

export async function writeCatalog(next: CatalogOverlay): Promise<void> {
  emit(next);
  try {
    await writeRaw(JSON.stringify(next));
  } catch {
    // Keep memory even if disk fails.
  }
  if (typeof BroadcastChannel !== "undefined") {
    try {
      new BroadcastChannel(CHANNEL).postMessage("ok");
    } catch {
      // Ignore.
    }
  }
}

export function applyOverlay<T extends { id: string }>(
  key: CatalogKey,
  seed: T[],
  merge: (row: T, edit: FieldEdit) => T,
  extra: (row: CatalogRow) => T,
  includeHidden = false
): T[] {
  const deck = peekCatalog()[key] ?? emptyDeck();
  const hidden = new Set(deck.hiddenIds);
  const out: T[] = [];
  for (const row of seed) {
    if (!includeHidden && hidden.has(row.id)) continue;
    const edit = deck.edits[row.id];
    out.push(edit ? merge(row, edit) : row);
  }
  for (const row of deck.extras) {
    if (!includeHidden && hidden.has(row.id)) continue;
    out.push(extra(row));
  }
  return out;
}

export async function hideCatalogRow(key: CatalogKey, id: string): Promise<void> {
  const next = { ...peekCatalog() };
  const deck = { ...next[key], hiddenIds: [...next[key].hiddenIds] };
  if (!deck.hiddenIds.includes(id)) deck.hiddenIds.push(id);
  deck.extras = deck.extras.filter((row) => row.id !== id);
  next[key] = deck;
  await writeCatalog(next);
}

export async function restoreCatalogRow(key: CatalogKey, id: string): Promise<void> {
  const next = { ...peekCatalog() };
  next[key] = {
    ...next[key],
    hiddenIds: next[key].hiddenIds.filter((item) => item !== id),
  };
  await writeCatalog(next);
}

export async function editCatalogRow(
  key: CatalogKey,
  id: string,
  edit: FieldEdit
): Promise<void> {
  const next = { ...peekCatalog() };
  const deck = { ...next[key] };
  const extraIndex = deck.extras.findIndex((row) => row.id === id);
  if (extraIndex >= 0) {
    const extras = [...deck.extras];
    extras[extraIndex] = {
      ...extras[extraIndex]!,
      title: edit.title ?? extras[extraIndex]!.title,
      body: edit.body ?? extras[extraIndex]!.body,
      group: edit.group ?? extras[extraIndex]!.group,
    };
    next[key] = { ...deck, extras };
  } else {
    next[key] = {
      ...deck,
      edits: {
        ...deck.edits,
        [id]: { ...deck.edits[id], ...edit },
      },
    };
  }
  await writeCatalog(next);
}

export async function addCatalogRow(key: CatalogKey, row: CatalogRow): Promise<void> {
  const next = { ...peekCatalog() };
  next[key] = {
    ...next[key],
    extras: [...next[key].extras, row],
  };
  await writeCatalog(next);
}

const CatalogRevContext = createContext(0);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [rev, setRev] = useState(0);
  useEffect(() => {
    void loadCatalog().then(() => setRev((n) => n + 1));
    const unsub = subscribeCatalog(() => setRev((n) => n + 1));
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = () => {
        void loadCatalog();
      };
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === CATALOG_KEY) void loadCatalog();
    };
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      unsub();
      channel?.close();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);
  return createElement(CatalogRevContext.Provider, { value: rev }, children);
}

export function useCatalogRevision(): number {
  return useContext(CatalogRevContext);
}
