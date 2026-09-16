import { createId, nowIso } from "@/lib/ids";

export const PAD_TYPING_MS = 4000;

export type PadNote = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export function emptyPadNotes(): PadNote[] {
  return [];
}

export function newPadNote(userId: string): PadNote {
  const at = nowIso();
  return {
    id: createId(),
    title: "",
    body: "",
    pinned: false,
    createdAt: at,
    updatedAt: at,
    updatedBy: userId,
  };
}

export function hydratePadNote(raw: unknown): PadNote | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<PadNote>;
  if (typeof row.id !== "string" || !row.id) return null;
  const createdAt = typeof row.createdAt === "string" ? row.createdAt : nowIso();
  return {
    id: row.id,
    title: typeof row.title === "string" ? row.title : "",
    body: typeof row.body === "string" ? row.body : "",
    pinned: Boolean(row.pinned),
    createdAt,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : createdAt,
    updatedBy: typeof row.updatedBy === "string" ? row.updatedBy : "",
  };
}

export function hydratePadNotes(raw: unknown): PadNote[] {
  if (!Array.isArray(raw)) return [];
  const notes = raw
    .map(hydratePadNote)
    .filter((row): row is PadNote => Boolean(row));
  const pinned = notes
    .filter((row) => row.pinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const keepPinned = pinned[0]?.id ?? null;
  return notes.map((row) =>
    row.pinned && row.id !== keepPinned ? { ...row, pinned: false } : row
  );
}

export function sortPadNotes(notes: PadNote[]): PadNote[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function upsertPadNote(
  notes: PadNote[],
  id: string,
  patch: Partial<Pick<PadNote, "title" | "body" | "pinned">>,
  userId: string
): PadNote[] {
  const at = nowIso();
  const existing = notes.find((row) => row.id === id);
  if (!existing) {
    const created: PadNote = {
      id,
      title: patch.title ?? "",
      body: patch.body ?? "",
      pinned: Boolean(patch.pinned),
      createdAt: at,
      updatedAt: at,
      updatedBy: userId,
    };
    return pinExclusive([created, ...notes], created.pinned ? created.id : null);
  }
  const next: PadNote = {
    ...existing,
    title: patch.title ?? existing.title,
    body: patch.body ?? existing.body,
    pinned: patch.pinned ?? existing.pinned,
    updatedAt: at,
    updatedBy: userId,
  };
  const mapped = notes.map((row) => (row.id === id ? next : row));
  if (patch.pinned === undefined) return mapped;
  return pinExclusive(mapped, next.pinned ? next.id : null);
}

export function pinPadNote(notes: PadNote[], id: string): PadNote[] {
  const current = notes.find((row) => row.id === id);
  if (!current) return notes;
  const pinThis = !current.pinned;
  return notes.map((row) => ({
    ...row,
    pinned: pinThis && row.id === id,
  }));
}

export function removePadNote(notes: PadNote[], id: string): PadNote[] {
  return notes.filter((row) => row.id !== id);
}

function pinExclusive(notes: PadNote[], pinnedId: string | null): PadNote[] {
  if (!pinnedId) {
    return notes.map((row) => (row.pinned ? { ...row, pinned: false } : row));
  }
  return notes.map((row) => ({
    ...row,
    pinned: row.id === pinnedId,
  }));
}

function bodyLines(note: PadNote): string[] {
  return note.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function noteCardCopy(note: PadNote): { heading: string; preview: string } {
  const title = note.title.trim();
  const lines = bodyLines(note);
  if (title) {
    return { heading: title, preview: lines[0] ?? "No text yet" };
  }
  if (lines[0]) {
    return { heading: lines[0], preview: lines[1] ?? "" };
  }
  return { heading: "Blank note", preview: "Tap to write" };
}

export function noteWhen(iso: string, now = Date.now()): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const mins = Math.max(0, Math.round((now - at) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function noteLiveBy(
  note: PadNote,
  userId: string | undefined,
  now = Date.now()
): boolean {
  if (!userId || note.updatedBy !== userId) return false;
  const at = Date.parse(note.updatedAt);
  if (Number.isNaN(at)) return false;
  return now - at < PAD_TYPING_MS;
}
