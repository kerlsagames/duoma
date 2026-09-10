const { isConfigured, sendToMany } = require("../../server/push");

function asSubscription(row) {
  return {
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "GET or POST" });
    return;
  }
  if (!isConfigured()) {
    res.status(503).json({ error: "VAPID keys missing" });
    return;
  }
  const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(200).json({
      ok: true,
      sent: 0,
      note: "Daily curiosity ping. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to notify both phones while the app is closed.",
    });
    return;
  }
  const response = await fetch(
    `${url}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );
  if (!response.ok) {
    res.status(502).json({ error: "Could not load push subscriptions." });
    return;
  }
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(200).json({ ok: true, sent: 0 });
    return;
  }
  const results = await sendToMany(rows.map(asSubscription), {
    title: "Duoma",
    body: "Today's curiosity question is waiting for both of you.",
    url: "/hub/curiosity",
  });
  res.status(200).json({
    ok: true,
    sent: results.filter((row) => row.ok).length,
    results,
  });
};
