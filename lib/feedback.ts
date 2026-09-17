import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createId, nowIso } from "@/lib/ids";
import { HOME_HEADER_WIDGETS, HUBS } from "@/lib/hubs";

export const FEEDBACK_KEY = "duoma:feedback:v1";

export const FEEDBACK_PROMPT =
  "We’re still building and learning. If you see an error or think of something cool for this particular app let us know here!";

export type FeedbackNote = {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  coupleId: string | null;
  body: string;
  source: string | null;
  createdAt: string;
};

export function feedbackSourceFromPath(pathname: string): string {
  const path = pathname.replace(/\/$/, "") || "/";
  if (
    path === "/" ||
    path === "/index" ||
    path === "/(tabs)" ||
    path === "/(tabs)/index"
  ) {
    return "Home";
  }
  const hits: { href: string; label: string }[] = [
    ...HOME_HEADER_WIDGETS.map((row) => ({ href: row.href, label: row.label })),
    ...HUBS.flatMap((hub) => [
      { href: hub.href, label: hub.label },
      ...hub.features.map((feature) => ({ href: feature.href, label: feature.label })),
    ]),
    { href: "/game", label: "Spicy Game" },
    { href: "/how-to", label: "How it works" },
    { href: "/legal", label: "Terms and privacy" },
    { href: "/hub/notification-settings", label: "Notifications" },
    { href: "/hub/calendar-item", label: "Calendar" },
    { href: "/hub/calendar-night", label: "Calendar" },
  ];
  hits.sort((a, b) => b.href.length - a.href.length);
  const match = hits.find(
    (row) => path === row.href || path.startsWith(`${row.href}/`)
  );
  return match?.label ?? "Duoma";
}

function splitPrefixedBody(raw: string): { source: string | null; body: string } {
  const match = /^\[([^\]]{1,80})\]\n\n([\s\S]*)$/.exec(raw);
  if (!match) return { source: null, body: raw };
  return { source: match[1] ?? null, body: match[2] ?? "" };
}

export function prefixFeedbackBody(body: string, source?: string | null): string {
  const text = body.trim();
  const label = source?.trim();
  if (!label) return text;
  return `[${label}]\n\n${text}`;
}

export function buildFeedbackNote(input: {
  userId: string;
  displayName: string;
  email?: string | null;
  coupleId?: string | null;
  body: string;
  source?: string | null;
}): FeedbackNote {
  return {
    id: createId(),
    userId: input.userId,
    displayName: input.displayName.trim() || "Someone",
    email: input.email?.trim() || null,
    coupleId: input.coupleId ?? null,
    body: input.body.trim(),
    source: input.source?.trim() || null,
    createdAt: nowIso(),
  };
}

export function hydrateFeedbackNote(raw: unknown): FeedbackNote | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<FeedbackNote> & { source?: unknown };
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.userId !== "string" || !row.userId) return null;
  const rawBody = typeof row.body === "string" ? row.body.trim() : "";
  if (!rawBody) return null;
  const split = splitPrefixedBody(rawBody);
  const source =
    typeof row.source === "string" && row.source.trim()
      ? row.source.trim()
      : split.source;
  const body = split.source ? split.body.trim() : rawBody;
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
    source,
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
