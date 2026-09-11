import { HUBS, type HubFeature, type HubId } from "@/lib/hubs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const HOME_FAVORITES_KEY = "duoma:homeFavorites";
export const HOME_FAVORITE_SLOTS = 4;

export type HomeFavoriteSlot = string | null;

export type HubAppOption = HubFeature & {
  hubId: HubId;
  hubLabel: string;
  accent: string;
};

export function allHubApps(): HubAppOption[] {
  return HUBS.flatMap((hub) =>
    hub.features.map((feature) => ({
      ...feature,
      hubId: hub.id,
      hubLabel: hub.label,
      accent: hub.accent,
    }))
  );
}

export function hubAppById(featureId: string): HubAppOption | null {
  return allHubApps().find((app) => app.id === featureId) ?? null;
}

export function emptyFavoriteSlots(): HomeFavoriteSlot[] {
  return Array.from({ length: HOME_FAVORITE_SLOTS }, () => null);
}

export function hydrateFavoriteSlots(
  raw: unknown
): HomeFavoriteSlot[] {
  const slots = emptyFavoriteSlots();
  if (!Array.isArray(raw)) return slots;
  const known = new Set(allHubApps().map((app) => app.id));
  for (let i = 0; i < HOME_FAVORITE_SLOTS; i += 1) {
    const value = raw[i];
    if (typeof value === "string" && known.has(value)) slots[i] = value;
  }
  return slots;
}

export async function loadHomeFavorites(): Promise<HomeFavoriteSlot[]> {
  try {
    const raw = await AsyncStorage.getItem(HOME_FAVORITES_KEY);
    if (!raw) return emptyFavoriteSlots();
    return hydrateFavoriteSlots(JSON.parse(raw));
  } catch {
    return emptyFavoriteSlots();
  }
}

export async function saveHomeFavorites(
  slots: HomeFavoriteSlot[]
): Promise<void> {
  const next = hydrateFavoriteSlots(slots);
  await AsyncStorage.setItem(HOME_FAVORITES_KEY, JSON.stringify(next));
}
