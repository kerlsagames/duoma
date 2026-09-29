import { nowIso } from "@/lib/ids";
import type { GiftPerson } from "@/lib/gifts";
import type { CalendarCustomEvent } from "@/lib/types";

export type CalendarKid = {
  id: string;
  name: string;
  createdAt: string;
};

export type CalendarPersonChip = {
  id: string;
  name: string;
  kind: "user" | "kid";
};

export function householdAdults(input: {
  user?: { id: string; displayName: string } | null;
  partner?: { id: string; displayName: string } | null;
  couple?: { partnerA: string; partnerB: string | null } | null;
  profiles?: { id: string; displayName: string }[] | null;
}): CalendarPersonChip[] {
  const profiles = input.profiles ?? [];
  const nameOf = (id: string, fallback: string) => {
    if (input.user?.id === id && input.user.displayName.trim()) {
      return input.user.displayName.trim();
    }
    if (input.partner?.id === id && input.partner.displayName.trim()) {
      return input.partner.displayName.trim();
    }
    const row = profiles.find((item) => item.id === id);
    const label = row?.displayName.trim();
    return label || fallback;
  };
  const rows: CalendarPersonChip[] = [];
  const seen = new Set<string>();
  const add = (id: string | null | undefined, fallback: string) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    rows.push({ id, name: nameOf(id, fallback), kind: "user" });
  };
  add(input.user?.id, "You");
  add(input.partner?.id, input.partner?.displayName.trim() || "Partner");
  add(input.couple?.partnerA, input.user?.id === input.couple?.partnerA ? "You" : "Partner");
  add(input.couple?.partnerB, input.user?.id === input.couple?.partnerB ? "You" : "Partner");
  return rows;
}

export function hydrateCalendarKid(raw: unknown): CalendarKid | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<CalendarKid>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (!name) return null;
  return {
    id: row.id,
    name,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : nowIso(),
  };
}

export function giftKidsAsCalendar(people: GiftPerson[]): CalendarKid[] {
  return people
    .filter((row) => row.kind === "child" && !row.hidden)
    .map((row) => ({
      id: row.id,
      name: row.name.trim(),
      createdAt: row.createdAt,
    }))
    .filter((row) => row.name);
}

export function mergeCalendarKids(
  calendarKids: CalendarKid[],
  giftKids: CalendarKid[]
): CalendarKid[] {
  const byId = new Map<string, CalendarKid>();
  const byName = new Map<string, CalendarKid>();
  for (const row of [...giftKids, ...calendarKids]) {
    if (byId.has(row.id)) continue;
    const key = row.name.trim().toLowerCase();
    if (!key || byName.has(key)) continue;
    byId.set(row.id, row);
    byName.set(key, row);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function uniqIds(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const id = value.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function normalizeAffects(input: {
  affectsAll?: boolean;
  affectsUserIds?: unknown;
  affectsKidIds?: unknown;
}): {
  affectsAll: boolean;
  affectsUserIds: string[];
  affectsKidIds: string[];
} {
  const affectsUserIds = uniqIds(input.affectsUserIds);
  const affectsKidIds = uniqIds(input.affectsKidIds);
  const empty = affectsUserIds.length === 0 && affectsKidIds.length === 0;
  const affectsAll = input.affectsAll !== false && empty ? true : empty;
  if (affectsAll) {
    return { affectsAll: true, affectsUserIds: [], affectsKidIds: [] };
  }
  return { affectsAll: false, affectsUserIds, affectsKidIds };
}

export function eventAffectsAll(
  row: Pick<CalendarCustomEvent, "affectsAll" | "affectsUserIds" | "affectsKidIds">
): boolean {
  return normalizeAffects(row).affectsAll !== false;
}

export function toggleAffectsPerson(
  current: {
    affectsAll: boolean;
    affectsUserIds: string[];
    affectsKidIds: string[];
  },
  person: CalendarPersonChip
): {
  affectsAll: boolean;
  affectsUserIds: string[];
  affectsKidIds: string[];
} {
  if (current.affectsAll) {
    return normalizeAffects({
      affectsAll: false,
      affectsUserIds: person.kind === "user" ? [person.id] : [],
      affectsKidIds: person.kind === "kid" ? [person.id] : [],
    });
  }
  const users = new Set(current.affectsUserIds);
  const kids = new Set(current.affectsKidIds);
  if (person.kind === "user") {
    if (users.has(person.id)) users.delete(person.id);
    else users.add(person.id);
  } else if (kids.has(person.id)) kids.delete(person.id);
  else kids.add(person.id);
  return normalizeAffects({
    affectsAll: false,
    affectsUserIds: [...users],
    affectsKidIds: [...kids],
  });
}

export function affectsLabel(
  row: Pick<CalendarCustomEvent, "affectsAll" | "affectsUserIds" | "affectsKidIds">,
  names: {
    userId?: string | null;
    userName?: string | null;
    partnerId?: string | null;
    partnerName?: string | null;
    kids?: CalendarKid[];
  }
): string {
  const next = normalizeAffects(row);
  if (next.affectsAll) return "Everyone";
  const parts: string[] = [];
  for (const id of next.affectsUserIds ?? []) {
    if (id === names.userId) parts.push(names.userName?.trim() || "You");
    else if (id === names.partnerId) parts.push(names.partnerName?.trim() || "Partner");
  }
  for (const id of next.affectsKidIds ?? []) {
    const kid = (names.kids ?? []).find((item) => item.id === id);
    if (kid?.name) parts.push(kid.name);
  }
  return parts.length ? parts.join(", ") : "Everyone";
}
