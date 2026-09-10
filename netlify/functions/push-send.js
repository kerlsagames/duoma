const { isConfigured, sendToMany } = require("../../server/push");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ error: "POST only" }),
    };
  }
  if (!isConfigured()) {
    return {
      statusCode: 503,
      headers: cors,
      body: JSON.stringify({
        error: "Push is not configured. Set VAPID_PRIVATE_KEY on the host.",
      }),
    };
  }
  const body = JSON.parse(event.body || "{}");
  const subscriptions = body.subscriptions || [];
  const payload = body.payload || { title: "Fuse", body: "Open Fuse.", url: "/" };
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: "No subscriptions to notify." }),
    };
  }
  const results = await sendToMany(subscriptions, payload);
  return {
    statusCode: 200,
    headers: { ...cors, "Content-Type": "application/json" },
    body: JSON.stringify({ results }),
  };
};
