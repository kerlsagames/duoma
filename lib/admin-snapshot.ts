import { expectedAdminKey, isAdminUnlocked } from "@/lib/admin-gate";
import { asCouple, asProfile } from "@/lib/cloud-pair";
import type { CloudState } from "@/lib/couple-backup";
import { hydrateFeedbackNote, type FeedbackNote } from "@/lib/feedback";
import { hydrateMiniState, type MiniState } from "@/lib/mini-content";
import { hydrateContentReport, type ContentReport } from "@/lib/reports";
import { supabase } from "@/lib/supabase";
import type { Couple, Profile } from "@/lib/types";

export type AdminSnapshot = {
  profiles: Profile[];
  couples: Couple[];
  feedback: FeedbackNote[];
  reports: ContentReport[];
  minis: Record<string, MiniState>;
  states: Record<string, CloudState>;
};

let cache: AdminSnapshot | null = null;

export function peekAdminSnapshot(): AdminSnapshot | null {
  return cache;
}

export function peekAdminCoupleState(coupleId: string): CloudState | null {
  return cache?.states[coupleId] ?? null;
}

function asCloudState(raw: unknown): CloudState | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as { db?: unknown; mini?: unknown; media?: unknown; savedAt?: unknown };
  return {
    db: row.db && typeof row.db === "object" ? (row.db as CloudState["db"]) : {},
    mini: hydrateMiniState(row.mini),
    media:
      row.media && typeof row.media === "object"
        ? (row.media as CloudState["media"])
        : { vault: {}, voice: {} },
    savedAt: typeof row.savedAt === "string" ? row.savedAt : new Date().toISOString(),
  };
}

function parseSnapshot(raw: unknown): AdminSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as {
    profiles?: unknown;
    couples?: unknown;
    feedback?: unknown;
    reports?: unknown;
    states?: unknown;
  };
  if (!Array.isArray(row.profiles) || !Array.isArray(row.couples)) return null;
  const profiles = row.profiles
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .filter((item) => typeof item.id === "string")
    .map((item) => asProfile(item as Parameters<typeof asProfile>[0]));
  const couples = row.couples
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .filter((item) => typeof item.id === "string")
    .map((item) =>
      asCouple({
        id: String(item.id),
        invite_code: String(item.invite_code ?? item.inviteCode ?? "—"),
        partner_a: String(item.partner_a ?? item.partnerA ?? ""),
        partner_b: (item.partner_b ?? item.partnerB ?? null) as string | null,
        created_at: String(item.created_at ?? item.createdAt ?? new Date().toISOString()),
        paired_at: (item.paired_at ?? item.pairedAt ?? null) as string | null,
      })
    );
  const feedback = Array.isArray(row.feedback)
    ? row.feedback
        .map((item) => hydrateFeedbackNote(item))
        .filter((item): item is FeedbackNote => Boolean(item))
    : [];
  const reports = Array.isArray(row.reports)
    ? row.reports
        .map((item) => hydrateContentReport(item))
        .filter((item): item is ContentReport => Boolean(item))
    : [];
  const minis: Record<string, MiniState> = {};
  const states: Record<string, CloudState> = {};
  const extraNotes: FeedbackNote[] = [];
  if (Array.isArray(row.states)) {
    for (const item of row.states) {
      if (!item || typeof item !== "object") continue;
      const state = item as {
        coupleId?: unknown;
        couple_id?: unknown;
        payload?: unknown;
        mini?: unknown;
        savedAt?: unknown;
      };
      const id =
        typeof state.coupleId === "string"
          ? state.coupleId
          : typeof state.couple_id === "string"
            ? state.couple_id
            : "";
      if (!id) continue;
      const payload = asCloudState(
        state.payload && typeof state.payload === "object"
          ? { ...(state.payload as object), savedAt: state.savedAt }
          : { mini: state.mini, savedAt: state.savedAt }
      );
      if (!payload) continue;
      states[id] = payload;
      minis[id] = payload.mini;
      const rawNotes = (payload.db as { feedbackNotes?: unknown } | undefined)?.feedbackNotes;
      if (Array.isArray(rawNotes)) {
        for (const note of rawNotes) {
          const parsed = hydrateFeedbackNote(note);
          if (parsed) extraNotes.push(parsed);
        }
      }
    }
  }
  const notes = [...feedback];
  const seen = new Set(notes.map((item) => item.id));
  for (const note of extraNotes) {
    if (seen.has(note.id)) continue;
    seen.add(note.id);
    notes.push(note);
  }
  return { profiles, couples, feedback: notes, reports, minis, states };
}

export async function loadAdminSnapshot(): Promise<AdminSnapshot | null> {
  if (!isAdminUnlocked()) return null;
  const key = expectedAdminKey();
  try {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    if (origin) {
      const res = await fetch(`${origin}/api/admin/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        const parsed = parseSnapshot(await res.json());
        if (parsed) {
          cache = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // Local Expo has no Vercel /api.
  }
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("admin_snapshot", { p_key: key });
  if (error || !data) return null;
  const parsed = parseSnapshot(data);
  if (parsed) cache = parsed;
  return parsed;
}

export async function adminBan(profileId: string, reason: string): Promise<boolean> {
  if (!isAdminUnlocked() || !supabase) return false;
  const { error } = await supabase.rpc("admin_ban", {
    p_key: expectedAdminKey(),
    p_user_id: profileId,
    p_reason: reason,
  });
  return !error;
}

export async function adminUnban(profileId: string): Promise<boolean> {
  if (!isAdminUnlocked() || !supabase) return false;
  const { error } = await supabase.rpc("admin_unban", {
    p_key: expectedAdminKey(),
    p_user_id: profileId,
  });
  return !error;
}

export async function adminResolveReport(
  id: string,
  action: "dismiss" | "action_taken"
): Promise<boolean> {
  if (!isAdminUnlocked() || !supabase) return false;
  const { error } = await supabase.rpc("admin_resolve_report", {
    p_key: expectedAdminKey(),
    p_report_id: id,
    p_action: action,
  });
  return !error;
}

function isUuid(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

export async function adminSubmitFeedback(input: {
  id: string;
  userId: string;
  displayName: string;
  email?: string | null;
  coupleId?: string | null;
  body: string;
  createdAt: string;
}): Promise<boolean> {
  if (!supabase || !isUuid(input.id) || !isUuid(input.userId)) return false;
  const { error } = await supabase.rpc("admin_submit_feedback", {
    p_key: expectedAdminKey(),
    p_id: input.id,
    p_user_id: input.userId,
    p_display_name: input.displayName,
    p_email: input.email ?? "",
    p_couple_id: isUuid(input.coupleId) ? input.coupleId : null,
    p_body: input.body,
    p_created_at: input.createdAt,
  });
  return !error;
}

export async function adminSaveCoupleState(
  coupleId: string,
  payload: unknown
): Promise<boolean> {
  if (!supabase || !isUuid(coupleId)) return false;
  const { error } = await supabase.rpc("admin_save_couple_state", {
    p_key: expectedAdminKey(),
    p_couple_id: coupleId,
    p_payload: payload,
  });
  return !error;
}

export async function adminTouchUsage(input: {
  userId: string;
  activeSeconds: number;
  appSeconds: Record<string, number>;
  timezone?: string | null;
}): Promise<boolean> {
  if (!supabase || !isUuid(input.userId)) return false;
  const { error } = await supabase.rpc("admin_touch_usage", {
    p_key: expectedAdminKey(),
    p_user_id: input.userId,
    p_active_seconds: input.activeSeconds,
    p_app_seconds: input.appSeconds,
    p_timezone: input.timezone ?? "",
  });
  return !error;
}

export async function adminWriteCatalog(payload: unknown): Promise<boolean> {
  if (!isAdminUnlocked() || !supabase) return false;
  const { error } = await supabase.rpc("admin_write_catalog", {
    p_key: expectedAdminKey(),
    p_payload: payload,
  });
  return !error;
}
