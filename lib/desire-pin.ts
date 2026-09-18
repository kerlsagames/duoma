import { HUBS } from "@/lib/hubs";

const UNLOCK_LISTENERS = new Set<() => void>();
let visitUnlocked = false;

export function isDesireRoute(pathname: string | null | undefined) {
  if (!pathname) return false;
  if (pathname === "/hub/desire" || pathname.startsWith("/hub/desire/")) return true;
  if (pathname === "/game" || pathname.startsWith("/game/")) return true;
  const desire = HUBS.find((hub) => hub.id === "desire");
  return (desire?.features ?? []).some((feature) => {
    const href = feature.href;
    return pathname === href || pathname.startsWith(`${href}/`);
  });
}

export function desireVisitUnlocked() {
  return visitUnlocked;
}

export function markDesireUnlocked() {
  visitUnlocked = true;
  for (const listener of UNLOCK_LISTENERS) listener();
}

export function lockDesireVisit() {
  visitUnlocked = false;
  for (const listener of UNLOCK_LISTENERS) listener();
}

export function subscribeDesireUnlock(listener: () => void) {
  UNLOCK_LISTENERS.add(listener);
  return () => {
    UNLOCK_LISTENERS.delete(listener);
  };
}
