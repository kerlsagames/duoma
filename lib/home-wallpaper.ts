import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ImageSourcePropType } from "react-native";

export const HOME_WALLPAPER_KEY = "duoma:homeWallpaper";

export type HomeWallpaperId =
  | "black"
  | "sketch"
  | "bokeh"
  | "dots"
  | "paint"
  | "ember"
  | "wine"
  | "forest"
  | "ocean"
  | "slate"
  | "violet"
  | "rose"
  | "navy"
  | "copper"
  | "moss"
  | "storm"
  | "dusk"
  | "plum"
  | "teal"
  | "cherry"
  | "sand";

export type HomeWallpaper = {
  id: HomeWallpaperId;
  label: string;
  color: string;
  gradient?: [string, string];
  source: ImageSourcePropType | null;
  scrim: string;
};

function paper(
  id: HomeWallpaperId,
  label: string,
  color: string,
  extra: Partial<HomeWallpaper> = {}
): HomeWallpaper {
  return {
    id,
    label,
    color,
    source: null,
    scrim: "transparent",
    ...extra,
  };
}

export const HOME_WALLPAPER_ORDER: HomeWallpaperId[] = [
  "black",
  "sketch",
  "bokeh",
  "dots",
  "paint",
  "ember",
  "wine",
  "forest",
  "ocean",
  "slate",
  "violet",
  "rose",
  "navy",
  "copper",
  "moss",
  "storm",
  "dusk",
  "plum",
  "teal",
  "cherry",
  "sand",
];

export const HOME_WALLPAPERS: Record<HomeWallpaperId, HomeWallpaper> = {
  black: paper("black", "Black", "#0B0B0E"),
  sketch: paper("sketch", "Sketch", "#1A1612", {
    source: require("../assets/home-bg/sketch.jpg"),
    scrim: "rgba(11,11,14,0.46)",
  }),
  bokeh: paper("bokeh", "Bokeh", "#141018", {
    source: require("../assets/home-bg/bokeh.jpg"),
    scrim: "rgba(11,11,14,0.40)",
  }),
  dots: paper("dots", "Dots", "#101014", {
    source: require("../assets/home-bg/dots.jpg"),
    scrim: "rgba(11,11,14,0.20)",
  }),
  paint: paper("paint", "Paint", "#161018", {
    source: require("../assets/home-bg/paint.jpg"),
    scrim: "rgba(11,11,14,0.26)",
  }),
  ember: paper("ember", "Ember", "#2A100C", {
    gradient: ["#3A1410", "#140806"],
  }),
  wine: paper("wine", "Wine", "#220A12", {
    gradient: ["#3A1020", "#12060A"],
  }),
  forest: paper("forest", "Forest", "#0E1C14", {
    gradient: ["#16301C", "#07110C"],
  }),
  ocean: paper("ocean", "Ocean", "#0B1824", {
    gradient: ["#123048", "#071018"],
  }),
  slate: paper("slate", "Slate", "#1A1E26"),
  violet: paper("violet", "Violet", "#1A1230", {
    gradient: ["#2A1848", "#0E0818"],
  }),
  rose: paper("rose", "Rose night", "#2A1018", {
    gradient: ["#4A1828", "#14080C"],
  }),
  navy: paper("navy", "Navy", "#0A1228", {
    gradient: ["#142040", "#060A16"],
  }),
  copper: paper("copper", "Copper", "#2A1A10", {
    gradient: ["#3A2414", "#140E08"],
  }),
  moss: paper("moss", "Moss", "#142016"),
  storm: paper("storm", "Storm", "#12161C"),
  dusk: paper("dusk", "Dusk", "#1A1024", {
    gradient: ["#2A1838", "#100814"],
  }),
  plum: paper("plum", "Plum", "#1C0E1C", {
    gradient: ["#301428", "#100810"],
  }),
  teal: paper("teal", "Teal", "#0C1C1C", {
    gradient: ["#143030", "#081212"],
  }),
  cherry: paper("cherry", "Cherry", "#2A0C10", {
    gradient: ["#4A1018", "#140608"],
  }),
  sand: paper("sand", "Sand", "#2A2418", {
    gradient: ["#3A3220", "#16120C"],
  }),
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
