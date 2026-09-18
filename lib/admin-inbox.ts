import { expectedAdminKey, isAdminUnlocked } from "@/lib/admin-gate";
import { hydrateFeedbackNote, type FeedbackNote } from "@/lib/feedback";
import { hydrateMiniState, type MiniState } from "@/lib/mini-content";
import { supabase } from "@/lib/supabase";

export type AdminInbox = {
  feedback: FeedbackNote[];
  minis: Record<string, MiniState>;
};

function parseInbox(raw: unknown): AdminInbox | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as { feedback?: unknown; states?: unknown };
  const feedback = Array.isArray(row.feedback)
    ? row.feedback
        .map((item) => hydrateFeedbackNote(item))
        .filter((item): item is FeedbackNote => Boolean(item))
    : [];
  const minis: Record<string, MiniState> = {};
  if (Array.isArray(row.states)) {
    for (const item of row.states) {
      if (!item || typeof item !== "object") continue;
      const state = item as { coupleId?: unknown; couple_id?: unknown; mini?: unknown };
      const id = typeof state.coupleId === "string" ? state.coupleId : String(state.couple_id ?? "");
      if (!id) continue;
      minis[id] = hydrateMiniState(state.mini);
    }
  }
  return { feedback, minis };
}

export async function loadAdminInbox(): Promise<AdminInbox | null> {
  if (!isAdminUnlocked()) return null;
  const key = expectedAdminKey();
  try {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    if (origin) {
      const res = await fetch(`${origin}/api/admin/inbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        const parsed = parseInbox(await res.json());
        if (parsed) return parsed;
      }
    }
  } catch {
    // Local Expo has no Vercel /api.
  }
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("admin_inbox", { p_key: key });
  if (error || !data) return null;
  return parseInbox(data);
}
