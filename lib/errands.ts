import type { ErrandItem } from "@/lib/types";

/** Crossed-off groceries/errands stay on the pad this long, then drop. */
export const ERRAND_DONE_KEEP_MS = 2 * 60 * 60 * 1000;

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
