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
  const [{ data: profiles, error: profileError }, { data: couples, error: coupleError }] =
    await Promise.all([
      client.from("profiles").select("*"),
      client.from("couples").select("*"),
    ]);
  if (profileError || coupleError) {
    res.status(500).json({ error: profileError?.message || coupleError?.message });
    return;
  }
  res.status(200).json({ profiles: profiles ?? [], couples: couples ?? [] });
};
