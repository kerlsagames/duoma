import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createId, nowIso } from "@/lib/ids";
import { REPORTS_KEY } from "@/lib/safety";

export const REPORT_REASONS = [
  {
    id: "non-consensual",
    label: "Non-consensual or intimate without permission",
  },
  { id: "harassment", label: "Harassment or threats" },
  {
    id: "csam",
    label: "Someone under 18 / illegal sexual content",
    urgent: true,
  },
  { id: "other", label: "Something else that breaks the Terms" },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]["id"];

export type ReportStatus = "pending" | "reviewed" | "dismissed" | "action_taken";

export type ContentReport = {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  coupleId: string | null;
  mediaId: string | null;
  mediaKind: "sexy-vault" | "photo-memory" | "voice" | "pair" | "other";
  reason: ReportReasonId;
  details: string;
  status: ReportStatus;
  createdAt: string;
};

export const REPORT_CONFIRM =
  "Thank you for your report. We will review this item within 24 hours and take appropriate action.";

export function reportReasonMeta(id: string) {
  return REPORT_REASONS.find((row) => row.id === id) ?? REPORT_REASONS[REPORT_REASONS.length - 1]!;
}

function webStore(): Storage | null {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

export function hydrateContentReport(raw: unknown): ContentReport | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<ContentReport>;
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.reporterId !== "string" || !row.reporterId) return null;
  const reason = REPORT_REASONS.some((item) => item.id === row.reason)
    ? (row.reason as ReportReasonId)
    : "other";
  const status: ReportStatus =
    row.status === "reviewed" ||
    row.status === "dismissed" ||
    row.status === "action_taken"
      ? row.status
      : "pending";
  const mediaKind =
    row.mediaKind === "sexy-vault" ||
    row.mediaKind === "photo-memory" ||
    row.mediaKind === "voice" ||
    row.mediaKind === "pair" ||
    row.mediaKind === "other"
      ? row.mediaKind
      : "other";
  return {
    id: row.id,
    reporterId: row.reporterId,
    reportedUserId: typeof row.reportedUserId === "string" ? row.reportedUserId : null,
    coupleId: typeof row.coupleId === "string" ? row.coupleId : null,
    mediaId: typeof row.mediaId === "string" ? row.mediaId : null,
    mediaKind,
    reason,
    details: typeof row.details === "string" ? row.details : "",
    status,
    createdAt:
      typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso(),
  };
}

export function buildContentReport(input: {
  reporterId: string;
  reportedUserId?: string | null;
  coupleId?: string | null;
  mediaId?: string | null;
  mediaKind: ContentReport["mediaKind"];
  reason: ReportReasonId;
  details?: string;
}): ContentReport {
  return {
    id: createId(),
    reporterId: input.reporterId,
    reportedUserId: input.reportedUserId ?? null,
    coupleId: input.coupleId ?? null,
    mediaId: input.mediaId ?? null,
    mediaKind: input.mediaKind,
    reason: input.reason,
    details: (input.details ?? "").trim(),
    status: "pending",
    createdAt: nowIso(),
  };
}

export async function readLocalReports(): Promise<ContentReport[]> {
  try {
    const store = webStore();
    const raw = store
      ? store.getItem(REPORTS_KEY)
      : await AsyncStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return (Array.isArray(parsed) ? parsed : [])
      .map(hydrateContentReport)
      .filter((row): row is ContentReport => Boolean(row));
  } catch {
    return [];
  }
}

export async function writeLocalReports(rows: ContentReport[]): Promise<void> {
  const raw = JSON.stringify(rows);
  const store = webStore();
  if (store) store.setItem(REPORTS_KEY, raw);
  else await AsyncStorage.setItem(REPORTS_KEY, raw);
}
