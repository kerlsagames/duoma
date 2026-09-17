import { HOME_HEADER_WIDGETS, HUBS } from "@/lib/hubs";

const SKIP = new Set([
  "/admin",
  "/welcome",
  "/login",
  "/create",
  "/join",
  "/check-email",
  "/waiting",
  "/banned",
  "/how-to",
  "/legal",
]);

const EXTRA: [string, string][] = [
  ["/game", "spicy"],
  ["/hub/list", "lists"],
  ["/hub/gifts", "gifts"],
  ["/hub/calendar-item", "calendar"],
  ["/hub/calendar-night", "calendar"],
  ["/hub/notification-settings", "home"],
];

function rules(): [string, string][] {
  const rows: [string, string][] = [
    ...HUBS.flatMap((hub) => hub.features.map((app) => [app.href, app.id] as [string, string])),
    ...HOME_HEADER_WIDGETS.map((row) => [row.href, row.id] as [string, string]),
    ...EXTRA,
  ];
  return rows.sort((left, right) => right[0].length - left[0].length);
}

const RULES = rules();

export function dwellAppFromPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const path = pathname.split("?")[0] || pathname;
  if (SKIP.has(path) || path.startsWith("/admin")) return null;
  for (const [prefix, id] of RULES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return id;
  }
  if (path === "/" || path === "/index" || path.startsWith("/(tabs)")) return "home";
  return "home";
}

let currentAppId: string | null = null;

export function setDwellPath(pathname: string | null | undefined) {
  currentAppId = dwellAppFromPath(pathname);
}

export function currentDwellApp(): string | null {
  return currentAppId;
}

export function bumpAppSeconds(
  current: Record<string, number> | null | undefined,
  appId: string | null,
  seconds: number
): Record<string, number> {
  const next = { ...(current ?? {}) };
  if (!appId) return next;
  next[appId] = (next[appId] ?? 0) + seconds;
  return next;
}
