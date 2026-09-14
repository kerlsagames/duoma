import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ImageSourcePropType } from "react-native";

export const HOME_WALLPAPER_KEY = "duoma:homeWallpaper";

export type HomeWallpaperId = "black" | "sketch" | "bokeh" | "dots" | "paint";

export const HOME_WALLPAPER_ORDER: HomeWallpaperId[] = [
  "black",
  "sketch",
  "bokeh",
  "dots",
  "paint",
];

export const HOME_WALLPAPERS: Record<
  HomeWallpaperId,
  { source: ImageSourcePropType | null; scrim: string; light: boolean }
> = {
  black: { source: null, scrim: "transparent", light: false },
  sketch: {
    source: require("../assets/home-bg/sketch.jpg"),
    scrim: "rgba(11,11,14,0.46)",
    light: true,
  },
  bokeh: {
    source: require("../assets/home-bg/bokeh.jpg"),
    scrim: "rgba(11,11,14,0.40)",
    light: true,
  },
  dots: {
    source: require("../assets/home-bg/dots.jpg"),
    scrim: "rgba(11,11,14,0.20)",
    light: false,
  },
  paint: {
    source: require("../assets/home-bg/paint.jpg"),
    scrim: "rgba(11,11,14,0.26)",
    light: false,
  },
};

export function nextHomeWallpaper(id: HomeWallpaperId): HomeWallpaperId {
  const index = HOME_WALLPAPER_ORDER.indexOf(id);
  return HOME_WALLPAPER_ORDER[(index + 1) % HOME_WALLPAPER_ORDER.length]!;
}

export function hydrateHomeWallpaper(raw: unknown): HomeWallpaperId {
  return HOME_WALLPAPER_ORDER.includes(raw as HomeWallpaperId)
    ? (raw as HomeWallpaperId)
    : "black";
}

export async function loadHomeWallpaper(): Promise<HomeWallpaperId> {
  try {
    const raw = await AsyncStorage.getItem(HOME_WALLPAPER_KEY);
    return hydrateHomeWallpaper(raw);
  } catch {
    return "black";
  }
}

export async function saveHomeWallpaper(id: HomeWallpaperId): Promise<void> {
  await AsyncStorage.setItem(HOME_WALLPAPER_KEY, id);
}
