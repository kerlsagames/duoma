import { compressImageFile } from "@/lib/photo-challenge";
import { formatExactWhen } from "@/lib/useTiming";
import { nowIso } from "@/lib/ids";

const DB_NAME = "duoma-sexy-vault";
const STORE = "clips";
const VERSION = 1;
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const PHOTO_FALLBACK_BYTES = 700_000;

export type SexyVaultKind = "photo" | "video";

export type SexyVaultItem = {
  id: string;
  fromId: string;
  kind: SexyVaultKind;
  note: string;
  createdAt: string;
  /** ISO time. Partner cannot open the media until then. */
  revealAt: string | null;
  seenAt: string | null;
  mimeType?: string;
  /** Small photo data URL used only when IndexedDB is unavailable. */
  uri?: string;
};

export function emptySexyVault(): SexyVaultItem[] {
  return [];
}

export function hydrateSexyVaultItem(raw: unknown): SexyVaultItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<SexyVaultItem>;
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.fromId !== "string" || !row.fromId) return null;
  const kind: SexyVaultKind = row.kind === "video" ? "video" : "photo";
  const note = typeof row.note === "string" ? row.note : "";
  const createdAt =
    typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso();
  const revealAt =
    typeof row.revealAt === "string" && row.revealAt ? row.revealAt : null;
  const seenAt = typeof row.seenAt === "string" && row.seenAt ? row.seenAt : null;
  const mimeType =
    typeof row.mimeType === "string" && row.mimeType ? row.mimeType : undefined;
  const uri =
    typeof row.uri === "string" && row.uri.startsWith("data:") ? row.uri : undefined;
  return {
    id: row.id,
    fromId: row.fromId,
    kind,
    note,
    createdAt,
    revealAt,
    seenAt,
    mimeType,
    uri,
  };
}

export function hydrateSexyVault(raw: unknown): SexyVaultItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(hydrateSexyVaultItem)
    .filter((item): item is SexyVaultItem => Boolean(item));
}

export function isSexyVaultLocked(
  item: SexyVaultItem,
  viewerId: string | null | undefined,
  now = Date.now()
): boolean {
  if (!item.revealAt) return false;
  if (viewerId && item.fromId === viewerId) return false;
  const at = Date.parse(item.revealAt);
  if (Number.isNaN(at)) return false;
  return at > now;
}

export function sexyVaultUnlockLabel(item: SexyVaultItem): string {
  return formatExactWhen(item.revealAt) ?? "later";
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("no-idb"));
      return;
    }
    const open = indexedDB.open(DB_NAME, VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    open.onerror = () => reject(open.error ?? new Error("idb-open"));
    open.onsuccess = () => {
      const db = open.result;
      try {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error ?? new Error("idb-op"));
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("idb-tx"));
        };
      } catch (error) {
        db.close();
        reject(error);
      }
    };
  });
}

export async function putSexyVaultBlob(id: string, blob: Blob): Promise<void> {
  await withStore("readwrite", (store) => store.put(blob, id));
}

export async function getSexyVaultBlob(id: string): Promise<Blob | null> {
  try {
    const row = await withStore<Blob | undefined>("readonly", (store) => store.get(id));
    return row instanceof Blob ? row : null;
  } catch {
    return null;
  }
}

export async function deleteSexyVaultBlob(id: string): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(id));
  } catch {
    // ignore
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

export async function persistSexyVaultMedia(
  id: string,
  blob: Blob
): Promise<{ mimeType: string; uri?: string }> {
  const mimeType = blob.type || "application/octet-stream";
  try {
    await putSexyVaultBlob(id, blob);
    return { mimeType };
  } catch {
    if (blob.size > PHOTO_FALLBACK_BYTES) {
      throw new Error("This file is too large to keep on this device.");
    }
    const uri = await blobToDataUrl(blob);
    return { mimeType, uri };
  }
}

export async function resolveSexyVaultSrc(
  item: SexyVaultItem
): Promise<string | null> {
  const blob = await getSexyVaultBlob(item.id);
  if (blob) return URL.createObjectURL(blob);
  if (item.uri && item.uri.startsWith("data:")) return item.uri;
  return null;
}

export function pickSexyMedia(): Promise<{
  kind: SexyVaultKind;
  blob: Blob;
  mimeType: string;
} | null> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("Uploads need the web app."));
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      void (async () => {
        try {
          if (file.type.startsWith("video/")) {
            if (file.size > MAX_VIDEO_BYTES) {
              throw new Error("Keep clips under 20 MB.");
            }
            resolve({
              kind: "video",
              blob: file,
              mimeType: file.type || "video/mp4",
            });
            return;
          }
          const dataUrl = await compressImageFile(file);
          const blob = await (await fetch(dataUrl)).blob();
          resolve({
            kind: "photo",
            blob,
            mimeType: blob.type || "image/jpeg",
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Could not read that file."));
        }
      })();
    };
    input.click();
  });
}
