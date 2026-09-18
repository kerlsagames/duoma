const { createClient } = require("@supabase/supabase-js");

function adminKey() {
  return (process.env.EXPO_PUBLIC_DUOMA_ADMIN_KEY || "kerlsagames-hq").trim();
}

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  if (typeof body.key !== "string" || body.key.trim() !== adminKey()) {
    res.status(401).json({ error: "Admin only" });
    return;
  }
  const client = supabaseAdmin();
  if (!client) {
    res.status(503).json({ error: "Service role is not configured." });
    return;
  }
  const [profiles, couples, notes, reports, states] = await Promise.all([
    client.from("profiles").select("*"),
    client.from("couples").select("*"),
    client.from("feedback_notes").select("*").order("created_at", { ascending: false }).limit(200),
    client.from("content_reports").select("*").order("created_at", { ascending: false }).limit(200),
    client.from("couple_state").select("couple_id, payload, updated_at"),
  ]);
  const missing = /does not exist|schema cache/i;
  if (profiles.error || couples.error) {
    res.status(500).json({ error: profiles.error?.message || couples.error?.message });
    return;
  }
  res.status(200).json({
    profiles: profiles.data ?? [],
    couples: couples.data ?? [],
    feedback: missing.test(notes.error?.message || "")
      ? []
      : (notes.data ?? []).map((row) => ({
          id: row.id,
          userId: row.user_id,
          displayName: row.display_name,
          email: row.email,
          coupleId: row.couple_id,
          body: row.body,
          createdAt: row.created_at,
        })),
    reports: missing.test(reports.error?.message || "")
      ? []
      : (reports.data ?? []).map((row) => ({
          id: row.id,
          reporterId: row.reporter_id,
          reportedUserId: row.reported_user_id,
          coupleId: row.couple_id,
          mediaId: row.media_id,
          mediaKind: row.media_kind,
          reason: row.reason,
          details: row.details,
          status: row.status,
          createdAt: row.created_at,
        })),
    states: missing.test(states.error?.message || "")
      ? []
      : (states.data ?? []).map((row) => ({
          coupleId: row.couple_id,
          payload: row.payload,
          savedAt: row.payload?.savedAt || row.updated_at,
        })),
  });
};
