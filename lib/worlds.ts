import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type WorldId =
  | "sanctuary"
  | "ecosystem"
  | "town"
  | "odyssey"
  | "constellation";

export type WorldDef = {
  id: WorldId;
  option: number;
  label: string;
  tagline: string;
  style: string;
  expect: string;
  bestFor: string;
  href: string;
  icon: IconName;
  accent: string;
  accentSoft: string;
};

export type WorldChoice = {
  worldId: WorldId | null;
  lockedAt: string | null;
};

export const WORLDS: WorldDef[] = [
  {
    id: "sanctuary",
    option: 1,
    label: "The Shared Sanctuary",
    tagline: "Build your dream hideaway, piece by piece.",
    style: "Cozy isometric estate",
    expect:
      "A sunlit cabin that grows a terrace, garden, and spa deck. Photos hang on the memory wall. Won bets sit on the trophy mantle. Voice notes play on the turntable.",
    bestFor: "Home design, cozy rooms, history you can walk through.",
    href: "/hub/sanctuary",
    icon: "home",
    accent: "#E8B86D",
    accentSoft: "rgba(232,184,109,0.18)",
  },
  {
    id: "ecosystem",
    option: 2,
    label: "The Pocket Ecosystem",
    tagline: "Nurture a living, breathing bio-world.",
    style: "Dreamlike bioluminescent island",
    expect:
      "A floating island. Voice notes bloom as echo flowers. Dates grow canopy. Desire lights fireflies. Quiet only sleeps the world — it never dies.",
    bestFor: "Nature, calm atmosphere, gentle magic.",
    href: "/hub/eden",
    icon: "leaf",
    accent: "#7CFFB2",
    accentSoft: "rgba(124,255,178,0.16)",
  },
  {
    id: "town",
    option: 3,
    label: "The Time Capsule Town",
    tagline: "Construct a village made of your favorite moments.",
    style: "Playful interactive map",
    expect:
      "Milestones become buildings. Photos open the Memory Cinema. Bets raise the Grand Arena. Coupons visit the Love Bakery. Desire unlocks the Velvet Lounge.",
    bestFor: "Play, banter, bright energy.",
    href: "/hub/town",
    icon: "business",
    accent: "#F0A46A",
    accentSoft: "rgba(240,164,106,0.18)",
  },
  {
    id: "odyssey",
    option: 4,
    label: "The Odyssey",
    tagline: "Chart an uncharted voyage together.",
    style: "Vintage adventure map",
    expect:
      "Your airship burns fuel from every ping, note, and date. Waypoints open Whispering Forest, Crystal Bay, and Sunset Peaks — and leave a travel log.",
    bestFor: "Adventure, forward momentum, a shared expedition.",
    href: "/hub/odyssey",
    icon: "compass",
    accent: "#8FA8C8",
    accentSoft: "rgba(143,168,200,0.18)",
  },
  {
    id: "constellation",
    option: 5,
    label: "The Constellation",
    tagline: "Write your love story in the stars.",
    style: "Celestial night sky",
    expect:
      "Each action drops a star. Big streaks of dates and photos draw named constellations. Desire paints nebulae. Export the sky as a keepsake later.",
    bestFor: "Dark-mode romance, minimalism, a sky you can print.",
    href: "/hub/constellation",
    icon: "sparkles",
    accent: "#C9A0DC",
    accentSoft: "rgba(201,160,220,0.18)",
  },
];

export function mergeWorldChoices(local: WorldChoice, remote: WorldChoice): WorldChoice {
  if (local.lockedAt && remote.lockedAt) {
    return local.lockedAt <= remote.lockedAt ? local : remote;
  }
  if (local.lockedAt) return local;
  if (remote.lockedAt) return remote;
  return local.worldId ? local : remote;
}

export function emptyWorldChoice(): WorldChoice {
  return { worldId: null, lockedAt: null };
}

export function worldById(id: string | null | undefined): WorldDef | null {
  return WORLDS.find((row) => row.id === id) ?? null;
}

export function hydrateWorldChoice(raw: unknown): WorldChoice {
  const base = emptyWorldChoice();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<WorldChoice>;
  const found = worldById(typeof row.worldId === "string" ? row.worldId : null);
  return {
    worldId: found?.id ?? null,
    lockedAt: typeof row.lockedAt === "string" ? row.lockedAt : null,
  };
}

export function homeWorldWidget(choice: WorldChoice): {
  label: string;
  detail: string;
  href: string;
  icon: IconName;
  accent: string;
} {
  const world = worldById(choice.worldId);
  if (!world) {
    return {
      label: "Shared World",
      detail: "Pick how your story grows — five worlds",
      href: "/hub/worlds",
      icon: "planet",
      accent: "#7CFFB2",
    };
  }
  return {
    label: world.label,
    detail: world.tagline,
    href: world.href,
    icon: world.icon,
    accent: world.accent,
  };
}
