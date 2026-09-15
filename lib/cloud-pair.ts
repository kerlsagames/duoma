import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Couple, Gender, Profile } from "@/lib/types";

export type PendingPair = {
  intent: "create" | "join";
  displayName: string;
  gender: Gender | null;
  code?: string;
  email?: string;
};

const PENDING_KEY = "duoma:pending-pair";

function webStore(): Storage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

export function savePendingPair(pending: PendingPair): void {
  const store = webStore();
  if (store) store.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function readPendingPair(): PendingPair | null {
  const store = webStore();
  const raw = store?.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    const row = JSON.parse(raw) as PendingPair;
    if (row.intent !== "create" && row.intent !== "join") return null;
    if (row.gender != null && row.gender !== "male" && row.gender !== "female") {
      return null;
    }
    return row;
  } catch {
    return null;
  }
}

export function clearPendingPair(): void {
  webStore()?.removeItem(PENDING_KEY);
}

function redirectTo(path: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${path}`;
}

export function readAuthRedirectError(): string | null {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const code = hash.get("error_code") || query.get("error_code");
  const desc = (hash.get("error_description") || query.get("error_description") || "").replace(
    /\+/g,
    " "
  );
  if (!code && !desc) return null;
  if (code === "otp_expired" || /expired|invalid/i.test(desc)) {
    return "That email link expired. Type the 6-digit code from the same email, or send a new one.";
  }
  return desc || "Could not open that email link.";
}

export function clearAuthRedirectError(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const hash = url.hash.replace(/^#/, "");
  if (!hash.includes("error") && !url.search.includes("error")) return;
  url.hash = "";
  url.searchParams.delete("error");
  url.searchParams.delete("error_code");
  url.searchParams.delete("error_description");
  window.history.replaceState(null, "", url.pathname + url.search);
}

async function sendOtp(email: string, pending: PendingPair): Promise<void> {
  if (!supabase) {
    throw new Error("Cloud accounts are not connected yet.");
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectTo("/check-email"),
      data: {
        display_name: pending.displayName.trim() || "Player",
        gender: pending.gender ?? "",
        invite_code: pending.code ?? "",
      },
    },
  });
  if (error) throw error;
}

export async function sendPairMagicLink(pending: PendingPair, email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  savePendingPair({ ...pending, email: trimmed });
  await sendOtp(trimmed, pending);
}

export async function sendLoginOtp(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  const pending = readPendingPair();
  savePendingPair({
    intent: pending?.intent ?? "create",
    displayName: pending?.displayName ?? "Player",
    gender: pending?.gender ?? null,
    code: pending?.code,
    email: trimmed,
  });
  await sendOtp(trimmed, readPendingPair() ?? { intent: "create", displayName: "Player", gender: null });
}

export async function verifyPairOtp(email: string, token: string): Promise<void> {
  if (!supabase) {
    throw new Error("Cloud accounts are not connected yet.");
  }
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.replace(/\s/g, ""),
    type: "email",
  });
  if (error) {
    if (/expired|invalid/i.test(error.message)) {
      throw new Error("That code is wrong or expired. Send a new one and type it here.");
    }
    throw error;
  }
}

function asCouple(row: {
  id: string;
  invite_code: string;
  partner_a: string;
  partner_b: string | null;
  created_at: string;
  paired_at: string | null;
}): Couple {
  return {
    id: row.id,
    inviteCode: row.invite_code,
    partnerA: row.partner_a,
    partnerB: row.partner_b,
    createdAt: row.created_at,
    pairedAt: row.paired_at,
  };
}

function asProfile(row: {
  id: string;
  display_name: string;
  gender?: string | null;
  email?: string | null;
  banned_at?: string | null;
  banned_reason?: string | null;
  last_seen_at?: string | null;
  created_at: string;
}): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    gender: row.gender === "male" || row.gender === "female" ? row.gender : null,
    email: row.email ?? null,
    bannedAt: row.banned_at ?? null,
    bannedReason: row.banned_reason ?? null,
    lastSeenAt: row.last_seen_at ?? null,
    createdAt: row.created_at,
  };
}

export async function absorbCloudSession(): Promise<{
  profile: Profile;
  partner: Profile | null;
  couple: Couple;
} | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const pending = readPendingPair();
  const userId = session.user.id;
  const email = session.user.email ?? pending?.email ?? null;

  const meta = session.user.user_metadata ?? {};
  const metaCode = typeof meta.invite_code === "string" ? meta.invite_code.trim() : "";
  const code = pending?.code || metaCode || undefined;
  const intent: "create" | "join" = pending?.intent ?? (code ? "join" : "create");

  await supabase
    .from("profiles")
    .update({
      display_name:
        pending?.displayName ??
        (typeof meta.display_name === "string" ? meta.display_name : undefined),
      gender: pending?.gender ?? (meta.gender === "male" || meta.gender === "female" ? meta.gender : undefined),
      email,
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", userId);

  const { data: existing, error: existingError } = await supabase
    .from("couples")
    .select("*")
    .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
    .maybeSingle();
  if (existingError) throw existingError;

  if (!existing) {
    if (intent === "join" && code) {
      const { error } = await supabase.rpc("join_couple", { p_code: code });
      if (error) throw error;
    } else {
      const { error } = await supabase.rpc("create_couple_for_user");
      if (error && !/already paired/i.test(error.message)) throw error;
    }
  }

  const { data: coupleRow, error: coupleError } = await supabase
    .from("couples")
    .select("*")
    .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
    .maybeSingle();
  if (coupleError) throw coupleError;
  if (!coupleRow) return null;

  const ids = [coupleRow.partner_a, coupleRow.partner_b].filter(Boolean) as string[];
  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids);
  if (profileError) throw profileError;

  const profiles = (profileRows ?? []).map(asProfile);
  const profile = profiles.find((row) => row.id === userId);
  if (!profile) return null;
  const partnerId =
    coupleRow.partner_a === userId ? coupleRow.partner_b : coupleRow.partner_a;
  const partner = profiles.find((row) => row.id === partnerId) ?? null;

  clearPendingPair();
  return { profile, partner, couple: asCouple(coupleRow) };
}

export async function loadCloudDirectory(): Promise<{
  profiles: Profile[];
  couples: Couple[];
} | null> {
  if (!supabase) return null;
  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("*");
  if (profileError) return null;
  const { data: coupleRows, error: coupleError } = await supabase.from("couples").select("*");
  if (coupleError) return null;
  return {
    profiles: (profileRows ?? []).map(asProfile),
    couples: (coupleRows ?? []).map(asCouple),
  };
}

export function cloudAccountsOn(): boolean {
  return isSupabaseConfigured;
}
