import { Platform } from "react-native";
import { VAPID_PUBLIC_KEY } from "@/lib/push-config";
import type { PushSubscriptionRow } from "@/lib/types";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export function isWebPushRuntime() {
  return Platform.OS === "web" && typeof window !== "undefined";
}

export function isIosDevice() {
  if (!isWebPushRuntime()) return false;
  const ua = window.navigator.userAgent;
  const iPadOs =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOs;
}

export function isStandalonePwa() {
  if (!isWebPushRuntime()) return false;
  const media = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  );
  return Boolean(media || iosStandalone);
}

export function pushSupported() {
  if (!isWebPushRuntime()) return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function notificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

export function pushApiBase() {
  const configured = process.env.EXPO_PUBLIC_PUSH_API?.replace(/\/$/, "");
  if (configured) return configured;
  if (isWebPushRuntime()) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:43128";
    }
  }
  return "";
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = globalThis.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export async function registerDuomaWorker() {
  if (!isWebPushRuntime()) return null;
  ensurePwaHead();
  if (!pushSupported()) return null;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

function ensurePwaHead() {
  const head = document.head;
  const add = (tag: string, attrs: Record<string, string>) => {
    const selector = Object.entries(attrs)
      .map(([key, value]) => `[${key}="${value}"]`)
      .join("");
    if (head.querySelector(`${tag}${selector}`)) return;
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    head.appendChild(el);
  };
  add("link", { rel: "manifest", href: "/manifest.webmanifest" });
  add("meta", { name: "theme-color", content: "#FF007F" });
  add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
  add("meta", { name: "mobile-web-app-capable", content: "yes" });
  add("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" });
  add("meta", { name: "apple-mobile-web-app-title", content: "Duoma" });
  add("link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" });
}

export async function subscribeToPush() {
  if (!pushSupported()) {
    throw new Error("This browser cannot receive web push.");
  }
  if (isIosDevice() && !isStandalonePwa()) {
    throw new Error(
      "On iPhone, add Duoma to your Home Screen first, then open it from the icon."
    );
  }
  const registration = await registerDuomaWorker();
  if (!registration) throw new Error("Service worker failed to register.");
  await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Push subscription was missing keys.");
  }
  return {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  };
}

export function toWebPushFormat(row: PushSubscriptionRow) {
  return {
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  };
}

export async function sendPushToSubscriptions(
  rows: PushSubscriptionRow[],
  payload: PushPayload
) {
  if (!rows.length) return { skipped: true as const, results: [] };
  const base = pushApiBase();
  const response = await fetch(`${base}/api/push/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscriptions: rows.map(toWebPushFormat),
      payload: {
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/",
      },
    }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    results?: unknown;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || "Could not send the notification.");
  }
  return { skipped: false as const, results: data.results ?? [] };
}
