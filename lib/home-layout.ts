import AsyncStorage from "@react-native-async-storage/async-storage";

export const HOME_LAYOUT_KEY = "duoma:homeLayout:v1";

export type HomeHubView = "grid" | "list" | "compact";

export type HomeLayout = {
  hubView: HomeHubView;
  showHubTaglines: boolean;
  showDaily: boolean;
  showFavorites: boolean;
  /** Shared world tile on Daily rhythm. Off until they add it in Home settings. */
  showWorld: boolean;
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

export function defaultHomeLayout(): HomeLayout {
  return {
    hubView: "grid",
    showHubTaglines: true,
    showDaily: true,
    showFavorites: true,
    showWorld: false,
  };
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
    showWorld: typeof row.showWorld === "boolean" ? row.showWorld : base.showWorld,
  };
}

export async function loadHomeLayout(): Promise<HomeLayout> {
  try {
    const raw = await AsyncStorage.getItem(HOME_LAYOUT_KEY);
    return hydrateHomeLayout(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultHomeLayout();
  }
}

export async function saveHomeLayout(layout: HomeLayout): Promise<void> {
  await AsyncStorage.setItem(HOME_LAYOUT_KEY, JSON.stringify(layout));
}
