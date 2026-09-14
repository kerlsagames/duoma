import { HUBS, hubById, type HubDef, type HubFeature, type HubId } from "@/lib/hubs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export const HUB_LAYOUT_KEY = "duoma:hubLayout:v1";

export type HubView = "list" | "grid" | "compact";

export type HubLayout = {
  order: string[];
  hidden: string[];
  view: HubView;
  showDetails: boolean;
};

export type HubLayouts = Record<HubId, HubLayout>;

export const HUB_VIEW_OPTIONS: {
  id: HubView;
  label: string;
  hint: string;
}[] = [
  {
    id: "list",
    label: "List",
    hint: "Full-width rows with a short blurb.",
  },
  {
    id: "grid",
    label: "Two columns",
    hint: "Tiles you can scan faster.",
  },
  {
    id: "compact",
    label: "Compact",
    hint: "Tight rows, names only.",
  },
];

export function defaultHubLayout(): HubLayout {
  return {
    order: [],
    hidden: [],
    view: "list",
    showDetails: true,
  };
}

export function emptyHubLayouts(): HubLayouts {
  return {
    connect: defaultHubLayout(),
    desire: defaultHubLayout(),
    play: defaultHubLayout(),
    "home-base": defaultHubLayout(),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function hydrateHubLayout(raw: unknown): HubLayout {
  const base = defaultHubLayout();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<HubLayout>;
  return {
    order: asStringArray(row.order),
    hidden: asStringArray(row.hidden),
    view:
      row.view === "grid" || row.view === "compact" || row.view === "list"
        ? row.view
        : base.view,
    showDetails: typeof row.showDetails === "boolean" ? row.showDetails : true,
  };
}

export function hydrateHubLayouts(raw: unknown): HubLayouts {
  const base = emptyHubLayouts();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<Record<HubId, unknown>>;
  return {
    connect: hydrateHubLayout(row.connect),
    desire: hydrateHubLayout(row.desire),
    play: hydrateHubLayout(row.play),
    "home-base": hydrateHubLayout(row["home-base"]),
  };
}

export function catalogOrder(hub: HubDef): string[] {
  return hub.features.map((feature) => feature.id);
}

export function resolvedFeatures(hub: HubDef, layout: HubLayout): HubFeature[] {
  const known = new Map(hub.features.map((feature) => [feature.id, feature]));
  const seen = new Set<string>();
  const out: HubFeature[] = [];
  for (const id of layout.order) {
    const feature = known.get(id);
    if (!feature || seen.has(id)) continue;
    out.push(feature);
    seen.add(id);
  }
  for (const feature of hub.features) {
    if (seen.has(feature.id)) continue;
    out.push(feature);
  }
  return out;
}

export function visibleFeatures(hub: HubDef, layout: HubLayout): HubFeature[] {
  const hidden = new Set(layout.hidden);
  return resolvedFeatures(hub, layout).filter((feature) => !hidden.has(feature.id));
}

export function moveFeature(
  order: string[],
  catalog: string[],
  id: string,
  direction: -1 | 1
): string[] {
  const full = [
    ...order.filter((item) => catalog.includes(item)),
    ...catalog.filter((item) => !order.includes(item)),
  ];
  const index = full.indexOf(id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= full.length) return full;
  const next = [...full];
  const swap = next[nextIndex]!;
  next[nextIndex] = next[index]!;
  next[index] = swap;
  return next;
}

export function toggleHidden(hidden: string[], id: string): string[] {
  return hidden.includes(id) ? hidden.filter((item) => item !== id) : [...hidden, id];
}

async function readRaw(): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(HUB_LAYOUT_KEY);
  }
  return AsyncStorage.getItem(HUB_LAYOUT_KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(HUB_LAYOUT_KEY, value);
    return;
  }
  await AsyncStorage.setItem(HUB_LAYOUT_KEY, value);
}

export async function readHubLayouts(): Promise<HubLayouts> {
  try {
    const raw = await readRaw();
    return hydrateHubLayouts(raw ? JSON.parse(raw) : null);
  } catch {
    return emptyHubLayouts();
  }
}

export async function writeHubLayouts(layouts: HubLayouts): Promise<void> {
  await writeRaw(JSON.stringify(layouts));
}

let cache: HubLayouts | null = null;
const listeners = new Set<(layouts: HubLayouts) => void>();

function emit(layouts: HubLayouts) {
  cache = layouts;
  listeners.forEach((fn) => fn(layouts));
}

export async function loadHubLayouts(): Promise<HubLayouts> {
  if (cache) return cache;
  cache = await readHubLayouts();
  return cache;
}

export async function patchHubLayout(
  hubId: HubId,
  fn: (layout: HubLayout) => HubLayout
): Promise<HubLayouts> {
  const current = await loadHubLayouts();
  const next = { ...current, [hubId]: fn(current[hubId]) };
  emit(next);
  try {
    await writeHubLayouts(next);
  } catch {
    // Keep the in-memory update even if disk fails.
  }
  return next;
}

export function useHubLayout(hubId: HubId) {
  const hub = hubById(hubId) ?? HUBS[0]!;
  const [layout, setLayout] = useState<HubLayout>(
    cache?.[hubId] ?? defaultHubLayout()
  );
  const [ready, setReady] = useState(Boolean(cache));

  useEffect(() => {
    const onChange = (layouts: HubLayouts) => setLayout(layouts[hubId]);
    listeners.add(onChange);
    let alive = true;
    loadHubLayouts().then((layouts) => {
      if (!alive) return;
      setLayout(layouts[hubId]);
      setReady(true);
    });
    return () => {
      alive = false;
      listeners.delete(onChange);
    };
  }, [hubId]);

  const save = useCallback(
    (fn: (current: HubLayout) => HubLayout) => patchHubLayout(hubId, fn),
    [hubId]
  );

  return {
    hub,
    layout,
    ready,
    save,
    apps: resolvedFeatures(hub, layout),
    visible: visibleFeatures(hub, layout),
  };
}
