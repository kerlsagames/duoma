const { isConfigured, sendToMany } = require("../../server/push");

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
  if (!isConfigured()) {
    res.status(503).json({
      error: "Push is not configured. Set VAPID_PRIVATE_KEY on the host.",
    });
    return;
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const subscriptions = body.subscriptions || [];
  const payload = body.payload || { title: "Duoma", body: "Open Duoma.", url: "/" };
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    res.status(400).json({ error: "No subscriptions to notify." });
    return;
  }
  const results = await sendToMany(subscriptions, payload);
  res.status(200).json({ results });
};
