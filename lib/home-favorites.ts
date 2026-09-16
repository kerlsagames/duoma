import { HUBS, type HubDef, type HubFeature, type HubId } from "@/lib/hubs";
import {
  clampFavoriteSlotCount,
  HOME_FAVORITE_SLOT_MAX,
  HOME_FAVORITE_SLOTS_DEFAULT,
} from "@/lib/home-layout";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const HOME_FAVORITES_KEY = "duoma:homeFavorites";
export const HOME_FAVORITE_SLOTS = HOME_FAVORITE_SLOTS_DEFAULT;

export type HomeFavoriteSlot = string | null;

export type HubAppOption = HubFeature & {
  hubId: HubId;
  hubLabel: string;
  accent: string;
};

export function allHubApps(hubs: readonly HubDef[] = HUBS): HubAppOption[] {
  return hubs.flatMap((hub) =>
    hub.features.map((feature) => ({
      ...feature,
      hubId: hub.id,
      hubLabel: hub.label,
      accent: hub.accent,
    }))
  );
}

export function hubAppById(
  featureId: string,
  hubs: readonly HubDef[] = HUBS
): HubAppOption | null {
  return allHubApps(hubs).find((app) => app.id === featureId) ?? null;
}

export function emptyFavoriteSlots(
  count = HOME_FAVORITE_SLOTS_DEFAULT
): HomeFavoriteSlot[] {
  return Array.from({ length: clampFavoriteSlotCount(count) }, () => null);
}

export function hydrateFavoriteSlots(
  raw: unknown,
  count = HOME_FAVORITE_SLOTS_DEFAULT
): HomeFavoriteSlot[] {
  const size = clampFavoriteSlotCount(count);
  const slots = emptyFavoriteSlots(size);
  if (!Array.isArray(raw)) return slots;
  const known = new Set(allHubApps().map((app) => app.id));
  for (let i = 0; i < size; i += 1) {
    const rawValue = raw[i];
    const value = rawValue === "who-did-it" ? "fair-share" : rawValue;
    if (typeof value === "string" && known.has(value)) slots[i] = value;
  }
  return slots;
}

export function resizeFavoriteSlots(
  slots: HomeFavoriteSlot[],
  count: number
): HomeFavoriteSlot[] {
  return hydrateFavoriteSlots(slots, count);
}

export async function loadHomeFavorites(
  count = HOME_FAVORITE_SLOT_MAX
): Promise<HomeFavoriteSlot[]> {
  try {
    const raw = await AsyncStorage.getItem(HOME_FAVORITES_KEY);
    if (!raw) return emptyFavoriteSlots(count);
    return hydrateFavoriteSlots(JSON.parse(raw), count);
  } catch {
    return emptyFavoriteSlots(count);
  }
}

export async function saveHomeFavorites(
  slots: HomeFavoriteSlot[],
  count = slots.length
): Promise<void> {
  const next = hydrateFavoriteSlots(slots, count);
  await AsyncStorage.setItem(HOME_FAVORITES_KEY, JSON.stringify(next));
}
