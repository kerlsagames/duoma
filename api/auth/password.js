const { createClient } = require("@supabase/supabase-js");

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
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
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!looksLikeEmail(email)) {
    res.status(400).json({ error: "That email does not look right." });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password needs at least 8 characters." });
    return;
  }
  const client = supabaseAdmin();
  if (!client) {
    res.status(503).json({ error: "Password accounts need the service role key." });
    return;
  }
  const displayName = String(body.displayName || "Player").trim() || "Player";
  const gender = body.gender === "male" || body.gender === "female" ? body.gender : "";
  const code = String(body.code || "").trim();
  const { error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      gender,
      invite_code: code,
    },
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      res.status(200).json({ ok: true, exists: true });
      return;
    }
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(200).json({ ok: true, exists: false });
};
