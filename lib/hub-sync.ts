import { supabase } from "@/lib/supabase";
import type {
  AppDB,
  CalendarCustomEvent,
  CheckIn,
  CheckInRequest,
  PositionInvite,
  RoleplayInvite,
} from "@/lib/types";

export const HUB_KINDS = [
  "check_in",
  "check_in_request",
  "position_invite",
  "roleplay_invite",
  "calendar_event",
] as const;

export type HubKind = (typeof HUB_KINDS)[number];

export type HubBundle = {
  checkIns: CheckIn[];
  checkInRequests: CheckInRequest[];
  positionInvites: PositionInvite[];
  roleplayInvites: RoleplayInvite[];
  calendarEvents: CalendarCustomEvent[];
};

type HubRow = {
  id: string;
  couple_id: string;
  kind: HubKind;
  payload: unknown;
  updated_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stampOf(row: { createdAt?: string; updatedAt?: string; answeredAt?: string | null; completedAt?: string | null }): string {
  return (
    row.completedAt ||
    row.answeredAt ||
    row.updatedAt ||
    row.createdAt ||
    ""
  );
}

function mergeByKey<T>(
  local: T[],
  incoming: T[],
  keyOf: (row: T) => string,
  stamp: (row: T) => string
): T[] {
  const map = new Map<string, T>();
  for (const row of local) map.set(keyOf(row), row);
  for (const row of incoming) {
    const key = keyOf(row);
    const prev = map.get(key);
    if (!prev || stamp(row) >= stamp(prev)) map.set(key, row);
  }
  return [...map.values()];
}

function parseCheckIn(payload: unknown): CheckIn | null {
  if (!isRecord(payload)) return null;
  const id = asString(payload.id);
  const coupleId = asString(payload.coupleId);
  const userId = asString(payload.userId);
  const date = asString(payload.date);
  if (!id || !coupleId || !userId || !date) return null;
  return {
    id,
    coupleId,
    userId,
    date,
    energy: typeof payload.energy === "number" ? payload.energy : null,
    mood: (payload.mood as CheckIn["mood"]) ?? null,
    loveTank: typeof payload.loveTank === "number" ? payload.loveTank : null,
    socialBattery: (payload.socialBattery as CheckIn["socialBattery"]) ?? null,
    todayNeed: (payload.todayNeed as CheckIn["todayNeed"]) ?? null,
    desireGauge: (payload.desireGauge as CheckIn["desireGauge"]) ?? null,
    tonight: (payload.tonight as CheckIn["tonight"]) ?? null,
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
  };
}

function parseCheckInRequest(payload: unknown): CheckInRequest | null {
  if (!isRecord(payload)) return null;
  const id = asString(payload.id);
  const coupleId = asString(payload.coupleId);
  const fromUserId = asString(payload.fromUserId);
  const toUserId = asString(payload.toUserId);
  if (!id || !coupleId || !fromUserId || !toUserId) return null;
  return {
    id,
    coupleId,
    fromUserId,
    toUserId,
    metrics: Array.isArray(payload.metrics)
      ? (payload.metrics.filter((item) => typeof item === "string") as CheckInRequest["metrics"])
      : [],
    date: asString(payload.date),
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
    answeredAt: typeof payload.answeredAt === "string" ? payload.answeredAt : null,
  };
}

function parsePositionInvite(payload: unknown): PositionInvite | null {
  if (!isRecord(payload)) return null;
  const id = asString(payload.id);
  const coupleId = asString(payload.coupleId);
  const fromUserId = asString(payload.fromUserId);
  const toUserId = asString(payload.toUserId);
  const positionId = asString(payload.positionId);
  if (!id || !coupleId || !fromUserId || !toUserId || !positionId) return null;
  const status = payload.status;
  if (
    status !== "offered" &&
    status !== "accepted" &&
    status !== "declined" &&
    status !== "done"
  ) {
    return null;
  }
  return {
    id,
    coupleId,
    fromUserId,
    toUserId,
    positionId,
    status,
    dateKey: typeof payload.dateKey === "string" ? payload.dateKey : null,
    whenLabel: typeof payload.whenLabel === "string" ? payload.whenLabel : null,
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
    answeredAt: typeof payload.answeredAt === "string" ? payload.answeredAt : null,
    completedAt: typeof payload.completedAt === "string" ? payload.completedAt : null,
  };
}

function parseRoleplayInvite(payload: unknown): RoleplayInvite | null {
  if (!isRecord(payload)) return null;
  const id = asString(payload.id);
  const coupleId = asString(payload.coupleId);
  const fromUserId = asString(payload.fromUserId);
  const toUserId = asString(payload.toUserId);
  const roleplayId = asString(payload.roleplayId);
  if (!id || !coupleId || !fromUserId || !toUserId || !roleplayId) return null;
  const status = payload.status;
  if (
    status !== "offered" &&
    status !== "accepted" &&
    status !== "declined" &&
    status !== "done"
  ) {
    return null;
  }
  return {
    id,
    coupleId,
    fromUserId,
    toUserId,
    roleplayId,
    status,
    dateKey: typeof payload.dateKey === "string" ? payload.dateKey : null,
    whenLabel: typeof payload.whenLabel === "string" ? payload.whenLabel : null,
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
    answeredAt: typeof payload.answeredAt === "string" ? payload.answeredAt : null,
    completedAt: typeof payload.completedAt === "string" ? payload.completedAt : null,
  };
}

function parseCalendarEvent(payload: unknown): CalendarCustomEvent | null {
  if (!isRecord(payload)) return null;
  const id = asString(payload.id);
  const coupleId = asString(payload.coupleId);
  const title = asString(payload.title);
  const date = asString(payload.date);
  if (!id || !coupleId || !title || !date) return null;
  const source =
    payload.source === "position" || payload.source === "roleplay"
      ? payload.source
      : undefined;
  return {
    id,
    coupleId,
    title,
    notes: asString(payload.notes),
    date,
    happenedAt: asString(payload.happenedAt) || asString(payload.createdAt) || date,
    allDay: payload.allDay !== false,
    createdBy: asString(payload.createdBy),
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
    updatedAt: asString(payload.updatedAt) || asString(payload.createdAt) || new Date().toISOString(),
    source,
  };
}

function rowsToBundle(rows: HubRow[]): HubBundle {
  const bundle: HubBundle = {
    checkIns: [],
    checkInRequests: [],
    positionInvites: [],
    roleplayInvites: [],
    calendarEvents: [],
  };
  for (const row of rows) {
    if (row.kind === "check_in") {
      const parsed = parseCheckIn(row.payload);
      if (parsed) bundle.checkIns.push(parsed);
    } else if (row.kind === "check_in_request") {
      const parsed = parseCheckInRequest(row.payload);
      if (parsed) bundle.checkInRequests.push(parsed);
    } else if (row.kind === "position_invite") {
      const parsed = parsePositionInvite(row.payload);
      if (parsed) bundle.positionInvites.push(parsed);
    } else if (row.kind === "roleplay_invite") {
      const parsed = parseRoleplayInvite(row.payload);
      if (parsed) bundle.roleplayInvites.push(parsed);
    } else if (row.kind === "calendar_event") {
      const parsed = parseCalendarEvent(row.payload);
      if (parsed) bundle.calendarEvents.push(parsed);
    }
  }
  return bundle;
}

export function mergeHubBundle(db: AppDB, coupleId: string, bundle: HubBundle): AppDB {
  const mergeCheckIns = mergeByKey(
    db.checkIns.filter((row) => row.coupleId === coupleId),
    bundle.checkIns.filter((row) => row.coupleId === coupleId),
    (row) => `${row.userId}:${row.date}`,
    (row) => row.createdAt
  );
  const mergeRequests = mergeByKey(
    db.checkInRequests.filter((row) => row.coupleId === coupleId),
    bundle.checkInRequests.filter((row) => row.coupleId === coupleId),
    (row) => row.id,
    stampOf
  );
  const mergePositions = mergeByKey(
    db.positionInvites.filter((row) => row.coupleId === coupleId),
    bundle.positionInvites.filter((row) => row.coupleId === coupleId),
    (row) => row.id,
    stampOf
  );
  const mergeRoleplays = mergeByKey(
    db.roleplayInvites.filter((row) => row.coupleId === coupleId),
    bundle.roleplayInvites.filter((row) => row.coupleId === coupleId),
    (row) => row.id,
    stampOf
  );
  const mergeEvents = mergeByKey(
    db.calendarEvents.filter((row) => row.coupleId === coupleId),
    bundle.calendarEvents.filter((row) => row.coupleId === coupleId),
    (row) => row.id,
    (row) => row.updatedAt || row.createdAt
  );
  return {
    ...db,
    checkIns: [
      ...db.checkIns.filter((row) => row.coupleId !== coupleId),
      ...mergeCheckIns,
    ],
    checkInRequests: [
      ...db.checkInRequests.filter((row) => row.coupleId !== coupleId),
      ...mergeRequests,
    ],
    positionInvites: [
      ...db.positionInvites.filter((row) => row.coupleId !== coupleId),
      ...mergePositions,
    ],
    roleplayInvites: [
      ...db.roleplayInvites.filter((row) => row.coupleId !== coupleId),
      ...mergeRoleplays,
    ],
    calendarEvents: [
      ...db.calendarEvents.filter((row) => row.coupleId !== coupleId),
      ...mergeEvents,
    ],
  };
}

export async function pullCoupleHub(coupleId: string): Promise<HubBundle | null> {
  if (!supabase) return null;
  try {
    const query = supabase
      .from("hub_items")
      .select("id, couple_id, kind, payload, updated_at")
      .eq("couple_id", coupleId);
    const raced = await Promise.race([
      query,
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 8000)
      ),
    ]);
    if (raced.error || !raced.data) return null;
    return rowsToBundle(raced.data as HubRow[]);
  } catch {
    return null;
  }
}

export async function pushHubItems(
  coupleId: string,
  items: { kind: HubKind; payload: { id: string } & object }[]
): Promise<void> {
  if (!supabase || items.length === 0) return;
  try {
    await supabase.from("hub_items").upsert(
      items.map((item) => ({
        id: item.payload.id,
        couple_id: coupleId,
        kind: item.kind,
        payload: item.payload,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id" }
    );
  } catch {
    // Local play still works if the table is not on this project yet.
  }
}

export function subscribeCoupleHub(
  coupleId: string,
  onChange: (bundle: HubBundle) => void
): () => void {
  if (!supabase) return () => undefined;
  const channel = supabase
    .channel(`duoma-hub-${coupleId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "hub_items",
        filter: `couple_id=eq.${coupleId}`,
      },
      () => {
        void pullCoupleHub(coupleId).then((bundle) => {
          if (bundle) onChange(bundle);
        });
      }
    )
    .subscribe();
  return () => {
    void supabase?.removeChannel(channel);
  };
}
