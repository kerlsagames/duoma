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
    ...HUBS.map((hub) => [hub.href, hub.id] as [string, string]),
    ...HOME_HEADER_WIDGETS.map((row) => [row.href, row.id] as [string, string]),
    ...EXTRA,
  ];
  return rows.sort((left, right) => right[0].length - left[0].length);
}

const RULES = rules();

export function dwellAppFromPath(pathname: string | null | undefined): string | null {
  if (!pathname) return "home";
  const path = pathname.split("?")[0] || pathname;
  if (!path) return "home";
  if (SKIP.has(path) || path.startsWith("/admin")) return null;
  for (const [prefix, id] of RULES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return id;
  }
  if (path === "/" || path === "/index" || path.startsWith("/(tabs)")) return "home";
  return "home";
}

let currentAppId: string | null = "home";
let dwellSkipped = false;

export function setDwellPath(pathname: string | null | undefined) {
  const id = dwellAppFromPath(pathname);
  dwellSkipped = id === null;
  currentAppId = id ?? "home";
}

export function currentDwellApp(): string | null {
  if (dwellSkipped) return null;
  return currentAppId ?? "home";
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

export function mergeAppSeconds(
  ...parts: Array<Record<string, number> | null | undefined>
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const part of parts) {
    if (!part) continue;
    for (const [key, value] of Object.entries(part)) {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
      next[key] = Math.max(next[key] ?? 0, value);
    }
  }
  return next;
}
