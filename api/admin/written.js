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

function homemadeDare(row) {
  return !row || row.dareId == null || row.dareId === "";
}

function extract(states) {
  const cards = [];
  const spicyDares = [];
  const chickenPlays = [];
  const predictions = [];
  for (const row of states) {
    const coupleId = row.couple_id;
    const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
    const db = payload.db && typeof payload.db === "object" ? payload.db : {};
    const mini = payload.mini && typeof payload.mini === "object" ? payload.mini : {};
    for (const card of Array.isArray(db.cards) ? db.cards : []) {
      if (!card || card.isDefault !== false) continue;
      if (!String(card.title || card.body || "").trim()) continue;
      cards.push({
        coupleId,
        id: card.id,
        title: card.title,
        body: card.body,
        stage: card.stage,
        createdBy: card.createdBy,
        createdAt: card.createdAt,
      });
    }
    for (const dare of Array.isArray(db.spicyDares) ? db.spicyDares : []) {
      if (!homemadeDare(dare) || !String(dare?.text || "").trim()) continue;
      spicyDares.push({
        coupleId,
        id: dare.id,
        text: dare.text,
        fromUserId: dare.fromUserId,
        createdAt: dare.createdAt,
        categories: dare.categories,
      });
    }
    for (const play of Array.isArray(db.chickenPlays) ? db.chickenPlays : []) {
      if (!homemadeDare(play) || !String(play?.text || "").trim()) continue;
      chickenPlays.push({
        coupleId,
        id: play.id,
        text: play.text,
        fromUserId: play.fromUserId,
        packId: play.packId,
        createdAt: play.createdAt,
      });
    }
    for (const bet of Array.isArray(mini.predictions) ? mini.predictions : []) {
      if (!String(bet?.title || "").trim()) continue;
      predictions.push({
        coupleId,
        id: bet.id,
        title: bet.title,
        statement: bet.statement,
        createdBy: bet.createdBy,
        fromUserId: bet.fromUserId,
        createdAt: bet.createdAt,
        kind: bet.kind,
      });
    }
  }
  return { cards, spicyDares, chickenPlays, predictions };
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
  const { data, error } = await client.from("couple_state").select("couple_id, payload");
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json(extract(data ?? []));
};
