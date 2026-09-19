import { sendPushToSubscriptions, type PushPayload } from "@/lib/push";
import { supabase } from "@/lib/supabase";
import type { PushSubscriptionRow } from "@/lib/types";

function mapCloudRow(row: {
  id?: string;
  user_id: string;
  couple_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  updated_at?: string;
}): PushSubscriptionRow {
  return {
    id: row.id ?? row.endpoint,
    userId: row.user_id,
    coupleId: row.couple_id,
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export async function upsertCloudSubscription(row: PushSubscriptionRow) {
  if (!supabase) return;
  try {
    await supabase.from("push_subscriptions").upsert(
      {
        user_id: row.userId,
        couple_id: row.coupleId,
        endpoint: row.endpoint,
        p256dh: row.p256dh,
        auth: row.auth,
        updated_at: row.updatedAt,
      },
      { onConflict: "endpoint" }
    );
  } catch {
    // Local mode still works without a cloud table.
  }
}

function mergeByEndpoint(
  ...lists: PushSubscriptionRow[][]
): PushSubscriptionRow[] {
  const map = new Map<string, PushSubscriptionRow>();
  for (const list of lists) {
    for (const row of list) map.set(row.endpoint, row);
  }
  return [...map.values()];
}

export async function pullCouplePushSubscriptions(
  coupleId: string
): Promise<PushSubscriptionRow[]> {
  if (!supabase || !coupleId) return [];
  try {
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("couple_id", coupleId);
    if (error || !data) return [];
    return data.map(mapCloudRow);
  } catch {
    return [];
  }
}

export async function subscriptionsForUser(
  userId: string,
  local: PushSubscriptionRow[],
  coupleId?: string
) {
  const mine = local.filter((row) => row.userId === userId);
  if (!supabase) return mine;
  try {
    let query = supabase.from("push_subscriptions").select("*").eq("user_id", userId);
    if (coupleId) query = query.eq("couple_id", coupleId);
    const { data, error } = await query;
    if (error || !data) {
      if (coupleId) {
        const coupleRows = (await pullCouplePushSubscriptions(coupleId)).filter(
          (row) => row.userId === userId
        );
        return mergeByEndpoint(mine, coupleRows);
      }
      return mine;
    }
    return mergeByEndpoint(mine, data.map(mapCloudRow));
  } catch {
    return mine;
  }
}

export async function notifyUser(
  userId: string | null | undefined,
  local: PushSubscriptionRow[],
  payload: PushPayload,
  excludeEndpoints?: Set<string>,
  coupleId?: string
) {
  if (!userId) return;
  const rows = (await subscriptionsForUser(userId, local, coupleId)).filter(
    (row) => !excludeEndpoints?.has(row.endpoint)
  );
  if (!rows.length) return;
  try {
    await sendPushToSubscriptions(rows, payload);
  } catch {
    // Never block gameplay if Apple/Google push is unreachable.
  }
}
