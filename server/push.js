const webpush = require("web-push");

function vapid() {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY || process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:duoma@localhost";
  return { publicKey, privateKey, subject };
}

function isConfigured() {
  const keys = vapid();
  return Boolean(keys.publicKey && keys.privateKey);
}

async function sendPush(subscription, payload) {
  const keys = vapid();
  if (!keys.publicKey || !keys.privateKey) {
    throw new Error("Missing VAPID_PRIVATE_KEY / EXPO_PUBLIC_VAPID_PUBLIC_KEY.");
  }
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

async function sendToMany(subscriptions, payload) {
  const results = [];
  for (const subscription of subscriptions) {
    try {
      await sendPush(subscription, payload);
      results.push({ endpoint: subscription.endpoint, ok: true });
    } catch (error) {
      results.push({
        endpoint: subscription.endpoint,
        ok: false,
        error: error instanceof Error ? error.message : "send failed",
      });
    }
  }
  return results;
}

module.exports = { isConfigured, sendPush, sendToMany, vapid };
