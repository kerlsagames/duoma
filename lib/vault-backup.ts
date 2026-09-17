import {
  getSexyVaultBlob,
  putSexyVaultBlob,
  type SexyVaultItem,
} from "@/lib/sexy-vault";
import { localDateKey } from "@/lib/dates";

export const VAULT_BACKUP_KIND = "duoma-sexy-vault";
export const VAULT_BACKUP_VERSION = 1;

export type VaultBackupFile = {
  kind: typeof VAULT_BACKUP_KIND;
  version: number;
  savedAt: string;
  items: (SexyVaultItem & { dataUrl: string })[];
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

export async function buildVaultBackup(
  items: SexyVaultItem[]
): Promise<VaultBackupFile> {
  const packed: VaultBackupFile["items"] = [];
  for (const item of items) {
    let dataUrl = item.uri && item.uri.startsWith("data:") ? item.uri : "";
    if (!dataUrl) {
      const blob = await getSexyVaultBlob(item.id);
      if (!blob) continue;
      dataUrl = await blobToDataUrl(blob);
    }
    packed.push({ ...item, uri: undefined, dataUrl });
  }
  if (!packed.length) {
    throw new Error("Nothing to download.");
  }
  return {
    kind: VAULT_BACKUP_KIND,
    version: VAULT_BACKUP_VERSION,
    savedAt: new Date().toISOString(),
    items: packed,
  };
}

export async function downloadVaultBackup(items: SexyVaultItem[]): Promise<number> {
  if (typeof document === "undefined") {
    throw new Error("Save the copy in the phone browser.");
  }
  const backup = await buildVaultBackup(items);
  const blob = new Blob([JSON.stringify(backup)], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `duoma-vault-${localDateKey()}.duoma`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return backup.items.length;
}

export function parseVaultBackup(raw: string): VaultBackupFile {
  const data = JSON.parse(raw) as Partial<VaultBackupFile>;
  if (data.kind !== VAULT_BACKUP_KIND || !Array.isArray(data.items)) {
    throw new Error("That is not a Duoma vault file.");
  }
  const items = data.items.filter(
    (row) =>
      row &&
      typeof row.id === "string" &&
      typeof row.dataUrl === "string" &&
      row.dataUrl.startsWith("data:")
  );
  if (!items.length) {
    throw new Error("That file has no photos or clips in it.");
  }
  return {
    kind: VAULT_BACKUP_KIND,
    version: VAULT_BACKUP_VERSION,
    savedAt: typeof data.savedAt === "string" ? data.savedAt : new Date().toISOString(),
    items,
  };
}

export async function restoreVaultBackup(
  backup: VaultBackupFile,
  existing: SexyVaultItem[]
): Promise<SexyVaultItem[]> {
  const seen = new Set(existing.map((row) => row.id));
  const next = [...existing];
  for (const row of backup.items) {
    const blob = await (await fetch(row.dataUrl)).blob();
    await putSexyVaultBlob(row.id, blob);
    const item: SexyVaultItem = {
      id: row.id,
      fromId: row.fromId,
      kind: row.kind === "video" ? "video" : "photo",
      note: row.note ?? "",
      createdAt: row.createdAt,
      revealAt: row.revealAt ?? null,
      seenAt: row.seenAt ?? null,
      mimeType: row.mimeType || blob.type,
    };
    if (seen.has(item.id)) {
      const index = next.findIndex((entry) => entry.id === item.id);
      if (index >= 0) next[index] = item;
    } else {
      next.push(item);
      seen.add(item.id);
    }
  }
  return next;
}

export function pickVaultBackupFile(): Promise<string> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("Restore in the phone browser."));
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".duoma,application/json,application/octet-stream";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () =>
        reject(reader.error ?? new Error("Could not read that file."));
      reader.readAsText(file);
    };
    input.addEventListener("cancel", () => resolve(""));
    input.click();
  });
}
