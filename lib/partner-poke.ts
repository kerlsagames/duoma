import { HUBS } from "@/lib/hubs";
import type { PartnerPoke } from "@/lib/types";
import type { Href } from "expo-router";

export type { PartnerPoke };

export const POKE_COOLDOWN_MS = 15 * 60 * 1000;

export type PokeAppMeta = {
  appId: string;
  label: string;
  href: Href;
};

const EXTRA: PokeAppMeta[] = [
  { appId: "check-in", label: "Check-in", href: "/hub/check-in" },
  { appId: "calendar", label: "Calendar", href: "/hub/calendar" },
  { appId: "notepad", label: "Notepad", href: "/hub/notepad" },
];

export function pokeAppMeta(appId: string): PokeAppMeta {
  for (const hub of HUBS) {
    const feature = hub.features.find((row) => row.id === appId);
    if (feature) {
      return { appId, label: feature.label, href: feature.href as Href };
    }
  }
  const extra = EXTRA.find((row) => row.appId === appId);
  if (extra) return extra;
  return { appId, label: "Duoma", href: "/" as Href };
}

export function pokeReady(
  lastAt: string | null | undefined,
  now = Date.now(),
  them = "them"
): { ready: boolean; label: string } {
  const last = lastAt ? Date.parse(lastAt) : 0;
  if (last && now - last < POKE_COOLDOWN_MS) {
    const mins = Math.max(1, Math.ceil((POKE_COOLDOWN_MS - (now - last)) / 60000));
    return {
      ready: false,
      label: mins === 1 ? "Poked just now" : `Poked · wait ${mins}m`,
    };
  }
  return { ready: true, label: `Poke ${them}` };
}

export function latestPokeAt(
  pokes: PartnerPoke[] | null | undefined,
  input: { fromUserId: string; appId: string; targetId: string }
): string | null {
  const match = (pokes ?? [])
    .filter(
      (row) =>
        row.fromUserId === input.fromUserId &&
        row.appId === input.appId &&
        row.targetId === input.targetId
    )
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))[0];
  return match?.createdAt ?? null;
}

export function pokeNoticeId(poke: PartnerPoke) {
  return `nudge/${poke.appId}/${poke.id}`;
}
