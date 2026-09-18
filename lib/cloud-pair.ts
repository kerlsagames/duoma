import { expectedAdminKey, isAdminUnlocked } from "@/lib/admin-gate";
import { isCreatorEmail } from "@/lib/creator";
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

export function asCouple(row: {
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

export function asProfile(row: {
  id: string;
  display_name?: string | null;
  gender?: string | null;
  email?: string | null;
  banned_at?: string | null;
  banned_reason?: string | null;
  last_seen_at?: string | null;
  over18_at?: string | null;
  privacy_consent_at?: string | null;
  moderation_consent_at?: string | null;
  timezone?: string | null;
  active_seconds?: number | null;
  app_seconds?: Record<string, number> | null;
  created_at?: string | null;
}): Profile {
  const raw = row as Record<string, unknown>;
  const secondsOf = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
    return 0;
  };
  const rawApps = raw.app_seconds ?? raw.appSeconds;
  const appSeconds =
    rawApps && typeof rawApps === "object" && !Array.isArray(rawApps)
      ? Object.fromEntries(
          Object.entries(rawApps)
            .map(([key, value]) => [key, secondsOf(value)] as const)
            .filter((entry) => entry[1] > 0)
        )
      : {};
  const active = secondsOf(raw.active_seconds ?? raw.activeSeconds);
  const appTotal = Object.values(appSeconds).reduce((sum, value) => sum + value, 0);
  return {
    id: row.id,
    displayName: String(raw.display_name ?? raw.displayName ?? "").trim() || "Player",
    gender: row.gender === "male" || row.gender === "female" ? row.gender : null,
    email: (typeof raw.email === "string" ? raw.email : null) ?? null,
    bannedAt: (raw.banned_at ?? raw.bannedAt ?? null) as string | null,
    bannedReason: (raw.banned_reason ?? raw.bannedReason ?? null) as string | null,
    lastSeenAt: (raw.last_seen_at ?? raw.lastSeenAt ?? null) as string | null,
    over18At: (raw.over18_at ?? raw.over18At ?? null) as string | null,
    privacyConsentAt: (raw.privacy_consent_at ?? raw.privacyConsentAt ?? null) as string | null,
    moderationConsentAt:
      (raw.moderation_consent_at ?? raw.moderationConsentAt ?? null) as string | null,
    timezone: (typeof raw.timezone === "string" ? raw.timezone : null) ?? null,
    activeSeconds: Math.max(active, appTotal),
    appSeconds,
    createdAt: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
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

  const consentedAt = new Date().toISOString();
  await supabase
    .from("profiles")
    .update({
      display_name:
        pending?.displayName ??
        (typeof meta.display_name === "string" ? meta.display_name : undefined),
      gender: pending?.gender ?? (meta.gender === "male" || meta.gender === "female" ? meta.gender : undefined),
      email,
      last_seen_at: consentedAt,
      over18_at: consentedAt,
      privacy_consent_at: consentedAt,
      moderation_consent_at: consentedAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    .eq("id", userId);

  if (isCreatorEmail(email)) {
    await supabase
      .from("profiles")
      .update({ banned_at: null, banned_reason: null })
      .eq("id", userId);
  }

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
  if (isAdminUnlocked()) {
    const fromPass = await loadDirectoryWithPassphrase();
    if (fromPass) return fromPass;
  }
  return loadDirectoryAsSignedIn();
}

async function loadDirectoryWithPassphrase(): Promise<{
  profiles: Profile[];
  couples: Couple[];
} | null> {
  const key = expectedAdminKey();
  try {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    if (origin) {
      const res = await fetch(`${origin}/api/admin/directory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        const parsed = parseDirectory(await res.json());
        if (parsed) return parsed;
      }
    }
  } catch {
    // Local Expo has no Vercel /api. Fall through to the SQL function.
  }
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("admin_directory", { p_key: key });
  if (error || !data) return null;
  return parseDirectory(data);
}

function parseDirectory(raw: unknown): { profiles: Profile[]; couples: Couple[] } | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as { profiles?: unknown; couples?: unknown };
  if (!Array.isArray(row.profiles) || !Array.isArray(row.couples)) return null;
  return {
    profiles: row.profiles
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .filter((item) => typeof item.id === "string")
      .map((item) => asProfile(item as Parameters<typeof asProfile>[0])),
    couples: row.couples
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
      ),
  };
}

async function loadDirectoryAsSignedIn(): Promise<{
  profiles: Profile[];
  couples: Couple[];
} | null> {
  if (!supabase) return null;
  const columns =
    "id, display_name, gender, email, banned_at, banned_reason, last_seen_at, over18_at, privacy_consent_at, moderation_consent_at, timezone, active_seconds, app_seconds, created_at";
  let profileRows: Record<string, unknown>[] | null = null;
  const full = await supabase.from("profiles").select(columns);
  if (full.error) {
    const fallback = await supabase
      .from("profiles")
      .select(
        "id, display_name, gender, email, banned_at, banned_reason, last_seen_at, over18_at, privacy_consent_at, moderation_consent_at, timezone, active_seconds, created_at"
      );
    if (fallback.error) return null;
    profileRows = (fallback.data ?? []) as Record<string, unknown>[];
  } else {
    profileRows = (full.data ?? []) as Record<string, unknown>[];
  }
  const { data: coupleRows, error: coupleError } = await supabase.from("couples").select("*");
  if (coupleError) return null;
  return {
    profiles: (profileRows ?? []).map((row) => asProfile(row as Parameters<typeof asProfile>[0])),
    couples: (coupleRows ?? []).map(asCouple),
  };
}

export function cloudAccountsOn(): boolean {
  return isSupabaseConfigured;
}
