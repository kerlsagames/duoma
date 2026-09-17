import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createId, nowIso } from "@/lib/ids";

export const FEEDBACK_KEY = "duoma:feedback:v1";

export type FeedbackNote = {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  coupleId: string | null;
  body: string;
  createdAt: string;
};

export function buildFeedbackNote(input: {
  userId: string;
  displayName: string;
  email?: string | null;
  coupleId?: string | null;
  body: string;
}): FeedbackNote {
  return {
    id: createId(),
    userId: input.userId,
    displayName: input.displayName.trim() || "Someone",
    email: input.email?.trim() || null,
    coupleId: input.coupleId ?? null,
    body: input.body.trim(),
    createdAt: nowIso(),
  };
}

export function hydrateFeedbackNote(raw: unknown): FeedbackNote | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<FeedbackNote>;
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.userId !== "string" || !row.userId) return null;
  const body = typeof row.body === "string" ? row.body.trim() : "";
  if (!body) return null;
  return {
    id: row.id,
    userId: row.userId,
    displayName:
      typeof row.displayName === "string" && row.displayName.trim()
        ? row.displayName.trim()
        : "Someone",
    email: typeof row.email === "string" && row.email.trim() ? row.email.trim() : null,
    coupleId: typeof row.coupleId === "string" ? row.coupleId : null,
    body,
    createdAt: typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso(),
  };
}

function webStore(): Storage | null {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

export async function readLocalFeedback(): Promise<FeedbackNote[]> {
  try {
    const store = webStore();
    const raw = store
      ? store.getItem(FEEDBACK_KEY)
      : await AsyncStorage.getItem(FEEDBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(hydrateFeedbackNote)
      .filter((row): row is FeedbackNote => Boolean(row));
  } catch {
    return [];
  }
}

export async function writeLocalFeedback(rows: FeedbackNote[]): Promise<void> {
  const raw = JSON.stringify(rows);
  const store = webStore();
  if (store) {
    store.setItem(FEEDBACK_KEY, raw);
    return;
  }
  await AsyncStorage.setItem(FEEDBACK_KEY, raw);
}
