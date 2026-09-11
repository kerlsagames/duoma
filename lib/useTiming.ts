/** Shared time-to-use / expiry options for Coupons and Up for it dares. */

export const USE_TIMING_OPTIONS = [
  { id: "tonight", label: "Tonight", hint: "Use by end of today" },
  { id: "weekend", label: "This weekend", hint: "Use by Sunday night" },
  { id: "7d", label: "7 days", hint: "A week from now" },
  { id: "30d", label: "30 days", hint: "A month of runway" },
  { id: "none", label: "No expiry", hint: "Stays until used" },
  { id: "custom", label: "Custom", hint: "Pick exact date & time" },
] as const;

export type UseTimingId = (typeof USE_TIMING_OPTIONS)[number]["id"];

export function toLocalDateTimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDateTime(value: string | null | undefined): Date | null {
  const raw = value?.trim();
  if (!raw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw);
  if (match) {
    const [, y, m, d, hh, mm] = match;
    const date = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      0,
      0
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function defaultCustomDateTime(now = new Date()): string {
  const next = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  next.setMinutes(0, 0, 0);
  return toLocalDateTimeValue(next);
}

export function formatExactWhen(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function expiresAtForTiming(
  option: UseTimingId | string,
  customWhen?: string | null,
  now = new Date()
): string | null {
  if (option === "none") return null;
  if (option === "custom") {
    const parsed = parseLocalDateTime(customWhen);
    return parsed ? parsed.toISOString() : null;
  }
  // Legacy dare option
  if (option === "24h") {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
  const end = new Date(now);
  if (option === "tonight") {
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  if (option === "weekend") {
    const day = end.getDay();
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    end.setDate(end.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  if (option === "7d") {
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  if (option === "30d") {
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  return null;
}

export function useTimingLabel(option: UseTimingId | string | null | undefined) {
  if (option === "24h") return "24 hours";
  return USE_TIMING_OPTIONS.find((row) => row.id === option)?.label ?? "Custom";
}

export function timingSummary(
  option: UseTimingId | string | null | undefined,
  expiresAt?: string | null,
  customWhen?: string | null
): string {
  if (!option) return "Custom";
  if (option === "none") return "No expiry";
  if (option === "custom") {
    const exact =
      formatExactWhen(expiresAt) ??
      formatExactWhen(parseLocalDateTime(customWhen)?.toISOString() ?? null);
    return exact ? `By ${exact}` : "Custom";
  }
  const label = useTimingLabel(option);
  const exact = formatExactWhen(expiresAt);
  return exact ? `${label} · ${exact}` : label;
}
