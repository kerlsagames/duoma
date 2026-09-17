import { expectedAdminKey, isAdminUnlocked } from "@/lib/admin-gate";
import { BET_PROMPTS, betPrompts } from "@/lib/bets";
import { pullCoupleState } from "@/lib/couple-backup";
import { peekMiniForCouple } from "@/lib/mini-apps";
import { supabase } from "@/lib/supabase";
import type { AppDB, Card, CardStage, Couple, Profile } from "@/lib/types";
import { STAGE_ORDER } from "@/games/get-spicy/engine";
import { catalogRows, newCatalogId } from "@/lib/catalog-rows";
import type { CatalogKey, CatalogRow } from "@/lib/catalog-overlay";

export type WrittenKind = "card" | "dare" | "chicken" | "bet";

export type WrittenItem = {
  id: string;
  kind: WrittenKind;
  title: string;
  body: string;
  group: string;
  coupleId: string;
  authorId: string | null;
  createdAt: string;
  sourceId: string;
};

export type WrittenCatalogTarget = {
  key: CatalogKey;
  row: CatalogRow;
};

const KIND_META: Record<WrittenKind, { label: string; catalog: CatalogKey }> = {
  card: { label: "Get Spicy card", catalog: "spicySeeds" },
  dare: { label: "Dare Me", catalog: "spicyDares" },
  chicken: { label: "Chicken", catalog: "chicken" },
  bet: { label: "LoveBetz", catalog: "bets" },
};

export function writtenKindMeta(kind: WrittenKind) {
  return KIND_META[kind];
}

export function normWritten(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[?!.,;:]+$/g, "");
}

function homemadeDareId(dareId: unknown): boolean {
  return dareId == null || dareId === "";
}

function asStage(value: unknown): CardStage {
  return STAGE_ORDER.includes(value as CardStage)
    ? (value as CardStage)
    : "foreplay";
}

function titleFrom(text: string, fallback: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return fallback;
  return clean.length > 72 ? `${clean.slice(0, 69)}…` : clean;
}

function catalogTextSet(key: CatalogKey): Set<string> {
  const set = new Set<string>();
  for (const row of catalogRows(key)) {
    const title = normWritten(row.title);
    const body = normWritten(row.body);
    if (title) set.add(title);
    if (body) set.add(body);
  }
  if (key === "bets") {
    for (const row of [...BET_PROMPTS, ...betPrompts(true)]) {
      const text = normWritten(row.text);
      if (text) set.add(text);
    }
  }
  return set;
}

export function writtenAlreadyInCatalog(item: WrittenItem): boolean {
  const set = catalogTextSet(KIND_META[item.kind].catalog);
  const title = normWritten(item.title);
  const body = normWritten(item.body);
  return (title ? set.has(title) : false) || (body ? set.has(body) : false);
}

export function writtenToCatalogRow(item: WrittenItem): WrittenCatalogTarget {
  const key = KIND_META[item.kind].catalog;
  return {
    key,
    row: {
      id: newCatalogId(key),
      title: item.title.trim() || "Untitled",
      body: item.body.trim() || item.title.trim(),
      group: item.group,
    },
  };
}

type CloudWritten = {
  cards: Array<{
    coupleId?: string;
    id?: string;
    title?: string;
    body?: string;
    stage?: string;
    createdBy?: string | null;
    createdAt?: string;
  }>;
  spicyDares: Array<{
    coupleId?: string;
    id?: string;
    text?: string;
    fromUserId?: string;
    createdAt?: string;
    categories?: unknown;
  }>;
  chickenPlays: Array<{
    coupleId?: string;
    id?: string;
    text?: string;
    fromUserId?: string;
    packId?: string | null;
    createdAt?: string;
  }>;
  predictions: Array<{
    coupleId?: string;
    id?: string;
    title?: string;
    statement?: string;
    createdBy?: string;
    fromUserId?: string;
    createdAt?: string;
    kind?: string;
  }>;
};

function pushCard(out: WrittenItem[], coupleId: string, card: Card | CloudWritten["cards"][number]) {
  const title = String(card.title ?? "").trim();
  const body = String(card.body ?? "").trim();
  if (!title && !body) return;
  const id = String(card.id ?? "");
  if (!id || !coupleId) return;
  out.push({
    id: `card:${coupleId}:${id}`,
    kind: "card",
    title: title || titleFrom(body, "Untitled card"),
    body,
    group: asStage(card.stage),
    coupleId,
    authorId: typeof card.createdBy === "string" ? card.createdBy : null,
    createdAt: String(card.createdAt ?? ""),
    sourceId: id,
  });
}

function firstCategory(raw: unknown): string {
  if (Array.isArray(raw)) {
    const hit = raw.find((item) => typeof item === "string" && item.trim());
    if (typeof hit === "string") return hit.trim();
  }
  return "Quick & Playful";
}

function pushDare(
  out: WrittenItem[],
  coupleId: string,
  row: {
    id?: string;
    text?: string;
    fromUserId?: string;
    createdAt?: string;
    categories?: unknown;
    dareId?: string | null;
  }
) {
  if (!homemadeDareId(row.dareId)) return;
  const text = String(row.text ?? "").trim();
  if (!text || !coupleId || !row.id) return;
  out.push({
    id: `dare:${coupleId}:${row.id}`,
    kind: "dare",
    title: titleFrom(text, "Homemade dare"),
    body: text,
    group: firstCategory(row.categories),
    coupleId,
    authorId: typeof row.fromUserId === "string" ? row.fromUserId : null,
    createdAt: String(row.createdAt ?? ""),
    sourceId: row.id,
  });
}

function pushChicken(
  out: WrittenItem[],
  coupleId: string,
  row: {
    id?: string;
    text?: string;
    fromUserId?: string;
    packId?: string | null;
    createdAt?: string;
    dareId?: string | null;
  }
) {
  if (!homemadeDareId(row.dareId)) return;
  const text = String(row.text ?? "").trim();
  if (!text || !coupleId || !row.id) return;
  out.push({
    id: `chicken:${coupleId}:${row.id}`,
    kind: "chicken",
    title: titleFrom(text, "Homemade dare"),
    body: text,
    group: row.packId?.trim() || "banter",
    coupleId,
    authorId: typeof row.fromUserId === "string" ? row.fromUserId : null,
    createdAt: String(row.createdAt ?? ""),
    sourceId: row.id,
  });
}

function isCatalogBet(title: string): boolean {
  const needle = normWritten(title);
  if (!needle) return true;
  return [...BET_PROMPTS, ...betPrompts(true)].some(
    (row) => normWritten(row.text) === needle
  );
}

function pushBet(
  out: WrittenItem[],
  coupleId: string,
  row: {
    id?: string;
    title?: string;
    statement?: string;
    createdBy?: string;
    fromUserId?: string;
    createdAt?: string;
    kind?: string;
  }
) {
  const title = String(row.title ?? "").trim();
  if (!title || !coupleId || !row.id) return;
  if (isCatalogBet(title)) return;
  out.push({
    id: `bet:${coupleId}:${row.id}`,
    kind: "bet",
    title,
    body: title,
    group: /^\s*who\b/i.test(title) ? "everyday" : "challenge",
    coupleId,
    authorId:
      typeof row.createdBy === "string"
        ? row.createdBy
        : typeof row.fromUserId === "string"
          ? row.fromUserId
          : null,
    createdAt: String(row.createdAt ?? ""),
    sourceId: row.id,
  });
}

function fromCloudBlob(blob: CloudWritten | null | undefined): WrittenItem[] {
  if (!blob) return [];
  const out: WrittenItem[] = [];
  for (const card of blob.cards ?? []) {
    pushCard(out, String(card.coupleId ?? ""), card);
  }
  for (const dare of blob.spicyDares ?? []) {
    pushDare(out, String(dare.coupleId ?? ""), dare);
  }
  for (const play of blob.chickenPlays ?? []) {
    pushChicken(out, String(play.coupleId ?? ""), play);
  }
  for (const bet of blob.predictions ?? []) {
    pushBet(out, String(bet.coupleId ?? ""), bet);
  }
  return out;
}

function fromLocalDb(db: AppDB): WrittenItem[] {
  const out: WrittenItem[] = [];
  for (const card of db.cards ?? []) {
    if (card.isDefault !== false) continue;
    pushCard(out, card.coupleId ?? "", card);
  }
  for (const dare of db.spicyDares ?? []) {
    pushDare(out, dare.coupleId, dare);
  }
  for (const play of db.chickenPlays ?? []) {
    pushChicken(out, play.coupleId, play);
  }
  return out;
}

async function mapPool<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) || 0 }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]!);
    }
  });
  await Promise.all(workers);
}

function parseCloudWritten(raw: unknown): CloudWritten | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<CloudWritten>;
  if (
    !Array.isArray(row.cards) ||
    !Array.isArray(row.spicyDares) ||
    !Array.isArray(row.chickenPlays) ||
    !Array.isArray(row.predictions)
  ) {
    return null;
  }
  return {
    cards: row.cards,
    spicyDares: row.spicyDares,
    chickenPlays: row.chickenPlays,
    predictions: row.predictions,
  };
}

async function loadCloudWritten(): Promise<WrittenItem[]> {
  if (!isAdminUnlocked()) return [];
  const key = expectedAdminKey();
  try {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    if (origin) {
      const res = await fetch(`${origin}/api/admin/written`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        const parsed = parseCloudWritten(await res.json());
        if (parsed) return fromCloudBlob(parsed);
      }
    }
  } catch {
    // Local Expo has no Vercel /api.
  }
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("admin_written", { p_key: key });
  if (error || !data) return [];
  const parsed = parseCloudWritten(data);
  return parsed ? fromCloudBlob(parsed) : [];
}

export async function gatherWritten(input: {
  db: AppDB;
  couples: Couple[];
}): Promise<WrittenItem[]> {
  const byId = new Map<string, WrittenItem>();
  const add = (item: WrittenItem) => {
    if (!byId.has(item.id)) byId.set(item.id, item);
  };
  for (const item of fromLocalDb(input.db)) add(item);

  const couples = input.couples.slice(0, 80);
  await mapPool(couples, 6, async (couple) => {
    try {
      const mini = await peekMiniForCouple(couple.id);
      const hold: WrittenItem[] = [];
      for (const bet of mini?.predictions ?? []) pushBet(hold, couple.id, bet);
      for (const item of hold) add(item);
    } catch {
      // Local hub cache is optional.
    }
    try {
      const remote = await pullCoupleState(couple.id);
      if (!remote) return;
      const hold = fromLocalDb({
        ...input.db,
        cards: remote.db.cards ?? [],
        spicyDares: remote.db.spicyDares ?? [],
        chickenPlays: remote.db.chickenPlays ?? [],
      });
      for (const item of hold) add(item);
      const bets: WrittenItem[] = [];
      for (const bet of remote.mini?.predictions ?? []) pushBet(bets, couple.id, bet);
      for (const item of bets) add(item);
    } catch {
      // RLS or missing table — passphrase RPC covers live pairs.
    }
  });

  try {
    for (const item of await loadCloudWritten()) add(item);
  } catch {
    // 016 not run yet, or no service role.
  }

  return [...byId.values()].sort((left, right) => {
    const a = Date.parse(right.createdAt) || 0;
    const b = Date.parse(left.createdAt) || 0;
    return a - b;
  });
}

export function writtenWho(
  item: WrittenItem,
  profiles: Profile[],
  couples: Couple[]
): { pair: string; author: string; demo: boolean } {
  const couple = couples.find((row) => row.id === item.coupleId);
  const a = profiles.find((row) => row.id === couple?.partnerA);
  const b = profiles.find((row) => row.id === couple?.partnerB);
  const author = profiles.find((row) => row.id === item.authorId);
  return {
    pair: [a?.displayName, b?.displayName].filter(Boolean).join(" / ") || couple?.inviteCode || "Unknown pair",
    author: author?.displayName?.trim() || "Someone",
    demo: Boolean(a?.isDemo || b?.isDemo),
  };
}
