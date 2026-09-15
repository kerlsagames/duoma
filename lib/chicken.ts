import { CHICKEN_DARES as CHICKEN_SEED, type ChickenDare } from "@/lib/chicken-dares";
import { applyOverlay } from "@/lib/catalog-overlay";
import {
  CHICKEN_PACKS,
  CHICKEN_YARDS,
  type ChickenPack,
  type ChickenPackId,
  type ChickenYard,
  type ChickenYardId,
} from "@/lib/chicken-meta";

export type { ChickenDare, ChickenPack, ChickenPackId, ChickenYard, ChickenYardId };
export { CHICKEN_PACKS, CHICKEN_YARDS };

export function chickenDares(includeHidden = false): ChickenDare[] {
  return applyOverlay(
    "chicken",
    CHICKEN_SEED,
    (row, edit) => ({
      ...row,
      name: edit.title?.trim() || row.name,
      body: edit.body?.trim() || row.body,
      pack: (edit.group as ChickenPackId) || row.pack,
    }),
    (row) => {
      const pack =
        CHICKEN_PACKS.find((item) => item.id === row.group) ?? CHICKEN_PACKS[0]!;
      return {
        id: row.id,
        n: 0,
        yard: pack.yard,
        pack: pack.id,
        name: row.title.trim() || "Homemade dare",
        body: row.body.trim() || row.title,
      };
    },
    includeHidden
  );
}

export const CHICKEN_DARES = CHICKEN_SEED;

export type ChickenPlayStatus = "offered" | "accepted" | "declined" | "done";

export type ChickenPlay = {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  dareId: string | null;
  packId: ChickenPackId | null;
  yardId: ChickenYardId | null;
  text: string;
  status: ChickenPlayStatus;
  createdAt: string;
  answeredAt: string | null;
  completedAt: string | null;
};

export type ChickenBadgeId =
  | "first-egg"
  | "half-dozen"
  | "carton"
  | "coop-legend"
  | "public-menace"
  | "home-bird"
  | "cluckless";

export type ChickenBadge = {
  id: ChickenBadgeId;
  label: string;
  detail: string;
};

export const CHICKEN_BADGES: ChickenBadge[] = [
  { id: "first-egg", label: "First egg", detail: "Did one dare. The coop noticed." },
  { id: "half-dozen", label: "Half dozen", detail: "Six dares done. A respectable clutch." },
  { id: "carton", label: "Full carton", detail: "Twelve. You are no longer a chick." },
  { id: "coop-legend", label: "Coop legend", detail: "Twenty-five completed. Statue pending." },
  { id: "public-menace", label: "Public menace", detail: "Five Out & About dares, in the wild." },
  { id: "home-bird", label: "Home bird", detail: "Five At Home dares. The furniture is tired." },
  { id: "cluckless", label: "Cluckless", detail: "Ten done, zero chicken-outs." },
];

export function chickenDareById(id: string | null | undefined): ChickenDare | null {
  if (!id) return null;
  return chickenDares().find((row) => row.id === id) ?? null;
}

export function chickenPackById(id: ChickenPackId | null | undefined): ChickenPack | null {
  if (!id) return null;
  return CHICKEN_PACKS.find((row) => row.id === id) ?? null;
}

export function chickenYardById(id: ChickenYardId | null | undefined): ChickenYard | null {
  if (!id) return null;
  return CHICKEN_YARDS.find((row) => row.id === id) ?? null;
}

export function daresInPack(pack: ChickenPackId): ChickenDare[] {
  return chickenDares().filter((row) => row.pack === pack);
}

export function daresInYard(yard: ChickenYardId): ChickenDare[] {
  return chickenDares().filter((row) => row.yard === yard);
}

export function peckRandom(from: ChickenDare[] = chickenDares()): ChickenDare {
  return from[Math.floor(Math.random() * from.length)]!;
}

export function statusLine(status: ChickenPlayStatus): string {
  if (status === "offered") return "Waiting";
  if (status === "accepted") return "In";
  if (status === "declined") return "Chicken";
  return "Done";
}

export type ChickenBoard = {
  done: number;
  sent: number;
  clucks: number;
  inPlay: number;
  outDone: number;
  homeDone: number;
  badges: ChickenBadgeId[];
};

export function chickenBoard(plays: ChickenPlay[], userId: string): ChickenBoard {
  const mineAsDoer = plays.filter((row) => row.toUserId === userId);
  const doneRows = mineAsDoer.filter((row) => row.status === "done");
  const done = doneRows.length;
  const sent = plays.filter((row) => row.fromUserId === userId).length;
  const clucks = mineAsDoer.filter((row) => row.status === "declined").length;
  const inPlay = mineAsDoer.filter(
    (row) => row.status === "offered" || row.status === "accepted"
  ).length;
  const outDone = doneRows.filter((row) => {
    const dare = chickenDareById(row.dareId);
    return (row.yardId ?? dare?.yard) === "out";
  }).length;
  const homeDone = doneRows.filter((row) => {
    const dare = chickenDareById(row.dareId);
    return (row.yardId ?? dare?.yard) === "home";
  }).length;
  const badges: ChickenBadgeId[] = [];
  if (done >= 1) badges.push("first-egg");
  if (done >= 6) badges.push("half-dozen");
  if (done >= 12) badges.push("carton");
  if (done >= 25) badges.push("coop-legend");
  if (outDone >= 5) badges.push("public-menace");
  if (homeDone >= 5) badges.push("home-bird");
  if (done >= 10 && clucks === 0) badges.push("cluckless");
  return { done, sent, clucks, inPlay, outDone, homeDone, badges };
}

export function hydrateChickenPlay(raw: unknown): ChickenPlay | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<ChickenPlay>;
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.coupleId !== "string" || typeof row.fromUserId !== "string") return null;
  if (typeof row.toUserId !== "string" || typeof row.text !== "string") return null;
  const status: ChickenPlayStatus =
    row.status === "accepted" ||
    row.status === "declined" ||
    row.status === "done"
      ? row.status
      : "offered";
  const packId =
    row.packId && CHICKEN_PACKS.some((pack) => pack.id === row.packId)
      ? row.packId
      : chickenDareById(row.dareId ?? null)?.pack ?? null;
  const yardId =
    row.yardId && CHICKEN_YARDS.some((yard) => yard.id === row.yardId)
      ? row.yardId
      : chickenDareById(row.dareId ?? null)?.yard ??
        (packId ? chickenPackById(packId)?.yard ?? null : null);
  return {
    id: row.id,
    coupleId: row.coupleId,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    dareId: typeof row.dareId === "string" ? row.dareId : null,
    packId,
    yardId,
    text: row.text,
    status,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
    answeredAt: typeof row.answeredAt === "string" ? row.answeredAt : null,
    completedAt: typeof row.completedAt === "string" ? row.completedAt : null,
  };
}
