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

export async function subscriptionsForUser(
  userId: string,
  local: PushSubscriptionRow[]
) {
  const mine = local.filter((row) => row.userId === userId);
  if (mine.length || !supabase) return mine;
  try {
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);
    if (error || !data) return mine;
    return data.map(mapCloudRow);
  } catch {
    return mine;
  }
}

export async function notifyUser(
  userId: string | null | undefined,
  local: PushSubscriptionRow[],
  payload: PushPayload
) {
  if (!userId) return;
  const rows = await subscriptionsForUser(userId, local);
  if (!rows.length) return;
  try {
    await sendPushToSubscriptions(rows, payload);
  } catch {
    // Never block gameplay if Apple/Google push is unreachable.
  }
}
