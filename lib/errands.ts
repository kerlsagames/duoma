import type { ErrandItem } from "@/lib/types";

/** Crossed-off groceries/errands stay on the pad this long, then drop from view. */
export const ERRAND_DONE_KEEP_MS = 2 * 60 * 60 * 1000;

export function errandLabelKey(title: string): string {
  return title.replace(/^[^\w]+/u, "").trim().toLowerCase();
}

export function isErrandStillListed(row: ErrandItem, now = Date.now()): boolean {
  if (!row.doneAt) return true;
  const at = Date.parse(row.doneAt);
  if (Number.isNaN(at)) return true;
  return now - at < ERRAND_DONE_KEEP_MS;
}

export function pruneStaleErrands(
  rows: ErrandItem[],
  now = Date.now()
): ErrandItem[] {
  return rows.filter((row) => isErrandStillListed(row, now));
}

export function errandStamp(row: ErrandItem): string {
  return row.updatedAt || row.doneAt || row.createdAt || "";
}

/** A ticked grocery stays done unless the open copy is a newer untick. */
export function preferErrandItem(local: ErrandItem, remote: ErrandItem): ErrandItem {
  const localDone = Boolean(local.doneAt);
  const remoteDone = Boolean(remote.doneAt);
  const localAt = errandStamp(local);
  const remoteAt = errandStamp(remote);
  if (localDone !== remoteDone) {
    if (!remoteDone && remoteAt > localAt) return remote;
    if (!localDone && localAt > remoteAt) return local;
    return localDone ? local : remote;
  }
  return remoteAt >= localAt ? remote : local;
}

export function collapseErrandDuplicates(rows: ErrandItem[]): ErrandItem[] {
  const map = new Map<string, ErrandItem>();
  for (const row of rows) {
    const key = `${row.coupleId}:${row.kind}:${errandLabelKey(row.title)}`;
    const prev = map.get(key);
    map.set(key, prev ? preferErrandItem(prev, row) : row);
  }
  return [...map.values()];
}

export function mergeErrandItems(
  local: ErrandItem[],
  remote: ErrandItem[]
): ErrandItem[] {
  const map = new Map<string, ErrandItem>();
  for (const row of local) map.set(row.id, row);
  for (const row of remote) {
    const prev = map.get(row.id);
    map.set(row.id, prev ? preferErrandItem(prev, row) : row);
  }
  return collapseErrandDuplicates([...map.values()]);
}
