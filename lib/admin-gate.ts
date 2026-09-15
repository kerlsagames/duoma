import { Platform } from "react-native";

const SESSION_KEY = "duoma:admin-session";

/** Set EXPO_PUBLIC_DUOMA_ADMIN_KEY in .env before a public deploy. */
export function expectedAdminKey(): string {
  const fromEnv = process.env.EXPO_PUBLIC_DUOMA_ADMIN_KEY?.trim();
  if (fromEnv) return fromEnv;
  return "kerlsagames-hq";
}

function webStore(): Storage | null {
  if (Platform.OS !== "web") return null;
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

let memoryUnlocked = false;

export function isAdminUnlocked(): boolean {
  const store = webStore();
  if (store) return store.getItem(SESSION_KEY) === "ok";
  return memoryUnlocked;
}

export function unlockAdmin(pass: string): boolean {
  if (pass.trim() !== expectedAdminKey()) return false;
  const store = webStore();
  if (store) store.setItem(SESSION_KEY, "ok");
  else memoryUnlocked = true;
  return true;
}

export function lockAdmin(): void {
  const store = webStore();
  if (store) store.removeItem(SESSION_KEY);
  memoryUnlocked = false;
}
