import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "duoma:whiteFlags";

export type FlagToneId =
  | "i-was-wrong"
  | "can-we-reset"
  | "need-softness"
  | "ready-to-listen";

export type PeaceOfferId =
  | "tea"
  | "walk"
  | "phones-down"
  | "big-hug"
  | "your-pick";

export type WhiteFlagStatus = "raised" | "accepted" | "held";

export type WhiteFlag = {
  id: string;
  fromUserId: string;
  toUserId: string;
  tone: FlagToneId;
  offer: PeaceOfferId | null;
  note: string;
  status: WhiteFlagStatus;
  createdAt: string;
  resolvedAt?: string;
};

export const FLAG_TONES: {
  id: FlagToneId;
  label: string;
  detail: string;
}[] = [
  {
    id: "i-was-wrong",
    label: "I was wrong",
    detail: "No excuses — just ownership.",
  },
  {
    id: "can-we-reset",
    label: "Can we reset?",
    detail: "Start this moment over, gently.",
  },
  {
    id: "need-softness",
    label: "I need softness",
    detail: "I’m tender. Please handle with care.",
  },
  {
    id: "ready-to-listen",
    label: "I’m ready to listen",
    detail: "Your turn. I won’t defend.",
  },
];

export const PEACE_OFFERS: {
  id: PeaceOfferId;
  label: string;
  icon: string;
}[] = [
  { id: "tea", label: "I’ll make the tea", icon: "cafe" },
  { id: "walk", label: "A short walk together", icon: "footsteps" },
  { id: "phones-down", label: "Phones down for an hour", icon: "phone-portrait-outline" },
  { id: "big-hug", label: "A long hug first", icon: "heart" },
  { id: "your-pick", label: "You pick the peace offering", icon: "sparkles" },
];

export function toneLabel(id: FlagToneId) {
  return FLAG_TONES.find((row) => row.id === id)?.label ?? id;
}

export function offerLabel(id: PeaceOfferId | null) {
  if (!id) return null;
  return PEACE_OFFERS.find((row) => row.id === id)?.label ?? id;
}

async function readAll(): Promise<WhiteFlag[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WhiteFlag[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: WhiteFlag[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(rows));
}

export async function listWhiteFlags(): Promise<WhiteFlag[]> {
  const rows = await readAll();
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function raiseWhiteFlag(input: {
  fromUserId: string;
  toUserId: string;
  tone: FlagToneId;
  offer: PeaceOfferId | null;
  note: string;
}): Promise<WhiteFlag> {
  const row: WhiteFlag = {
    id: `flag_${Date.now().toString(36)}`,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    tone: input.tone,
    offer: input.offer,
    note: input.note.trim(),
    status: "raised",
    createdAt: new Date().toISOString(),
  };
  const rows = await readAll();
  await writeAll([row, ...rows]);
  return row;
}

export async function resolveWhiteFlag(
  id: string,
  status: Extract<WhiteFlagStatus, "accepted" | "held">
): Promise<WhiteFlag | null> {
  const rows = await readAll();
  const next = rows.map((row) =>
    row.id === id
      ? { ...row, status, resolvedAt: new Date().toISOString() }
      : row
  );
  await writeAll(next);
  return next.find((row) => row.id === id) ?? null;
}
