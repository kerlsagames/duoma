import type { HubId } from "@/lib/hubs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const HOME_LAYOUT_KEY = "duoma:homeLayout:v2";

export type HomeHubView = "grid" | "list" | "compact";

export type HomeLayout = {
  hubView: HomeHubView;
  showHubTaglines: boolean;
  showDaily: boolean;
  showFavorites: boolean;
  /** Shared world tile on Daily rhythm. Listed in Home settings, not ready yet. */
  showWorld: boolean;
  /** Hide at most one of the four hubs. */
  hiddenHubId: HubId | null;
  /** How many favorite spots on Home. */
  favoriteSlots: number;
};

export const HOME_HUB_VIEW_OPTIONS: {
  id: HomeHubView;
  label: string;
  hint: string;
}[] = [
  {
    id: "grid",
    label: "Two columns",
    hint: "Four hub tiles, two by two.",
  },
  {
    id: "list",
    label: "List",
    hint: "Full-width rows with the tagline.",
  },
  {
    id: "compact",
    label: "Compact",
    hint: "Tight rows, names only.",
  },
];

export const HOME_FAVORITE_SLOT_MIN = 2;
export const HOME_FAVORITE_SLOT_MAX = 8;
export const HOME_FAVORITE_SLOTS_DEFAULT = 4;

export function clampFavoriteSlotCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return HOME_FAVORITE_SLOTS_DEFAULT;
  }
  return Math.min(
    HOME_FAVORITE_SLOT_MAX,
    Math.max(HOME_FAVORITE_SLOT_MIN, Math.round(value))
  );
}

export function defaultHomeLayout(): HomeLayout {
  return {
    hubView: "grid",
    showHubTaglines: true,
    showDaily: true,
    showFavorites: true,
    showWorld: false,
    hiddenHubId: null,
    favoriteSlots: HOME_FAVORITE_SLOTS_DEFAULT,
  };
}

function asHubId(value: unknown): HubId | null {
  if (
    value === "connect" ||
    value === "desire" ||
    value === "play" ||
    value === "home-base"
  ) {
    return value;
  }
  return null;
}

export function hydrateHomeLayout(raw: unknown): HomeLayout {
  const base = defaultHomeLayout();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<HomeLayout>;
  return {
    hubView:
      row.hubView === "list" || row.hubView === "compact" || row.hubView === "grid"
        ? row.hubView
        : base.hubView,
    showHubTaglines:
      typeof row.showHubTaglines === "boolean" ? row.showHubTaglines : base.showHubTaglines,
    showDaily: typeof row.showDaily === "boolean" ? row.showDaily : base.showDaily,
    showFavorites:
      typeof row.showFavorites === "boolean" ? row.showFavorites : base.showFavorites,
    showWorld: false,
    hiddenHubId: asHubId(row.hiddenHubId),
    favoriteSlots: clampFavoriteSlotCount(row.favoriteSlots),
  };
}

export async function loadHomeLayout(): Promise<HomeLayout> {
  try {
    const raw = await AsyncStorage.getItem(HOME_LAYOUT_KEY);
    if (raw) return hydrateHomeLayout(JSON.parse(raw));
    const legacy = await AsyncStorage.getItem("duoma:homeLayout:v1");
    return hydrateHomeLayout(legacy ? JSON.parse(legacy) : null);
  } catch {
    return defaultHomeLayout();
  }
}

export async function saveHomeLayout(layout: HomeLayout): Promise<void> {
  await AsyncStorage.setItem(HOME_LAYOUT_KEY, JSON.stringify(layout));
}
