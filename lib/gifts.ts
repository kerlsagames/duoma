import { parseDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";

export type GiftPersonKind = "you" | "them" | "child" | "family" | "friend" | "other";

export type GiftPersonSlot = "you" | "them";

export type GiftOccasionId =
  | "christmas"
  | "birthday"
  | "anniversary"
  | "valentines"
  | "mothers"
  | "fathers"
  | "just-because"
  | "other";

export type GiftLane = "wish" | "shop";

export type GiftPerson = {
  id: string;
  name: string;
  kind: GiftPersonKind;
  emoji: string;
  notes: string;
  slot: GiftPersonSlot | null;
  /** Partner never sees this list. */
  hidden: boolean;
  ownerUserId: string | null;
  createdAt: string;
};

export type GiftItem = {
  id: string;
  personId: string;
  title: string;
  notes: string;
  from: string;
  lane: GiftLane;
  occasion: GiftOccasionId;
  year: number;
  status: "open" | "given";
  dateKey: string | null;
  createdAt: string;
};

export const GIFT_OCCASIONS: {
  id: GiftOccasionId;
  label: string;
  short: string;
}[] = [
  { id: "christmas", label: "Christmas", short: "Xmas" },
  { id: "birthday", label: "Birthday", short: "Bday" },
  { id: "anniversary", label: "Anniversary", short: "Anniv" },
  { id: "valentines", label: "Valentine's", short: "V-day" },
  { id: "mothers", label: "Mother's Day", short: "Mum" },
  { id: "fathers", label: "Father's Day", short: "Dad" },
  { id: "just-because", label: "Just because", short: "Anytime" },
  { id: "other", label: "Other", short: "Other" },
];

export const GIFT_KIND_OPTIONS: {
  id: Exclude<GiftPersonKind, "you" | "them">;
  label: string;
  hint: string;
  emoji: string;
}[] = [
  { id: "child", label: "Kid", hint: "Christmas, birthdays, the growing pile", emoji: "🧸" },
  { id: "family", label: "Family", hint: "Parents, siblings, in-laws", emoji: "🏠" },
  { id: "friend", label: "Friend", hint: "The ones you always mean to shop for", emoji: "💛" },
  { id: "other", label: "Someone else", hint: "Teachers, neighbours, the dog", emoji: "🎁" },
];

export const PERSON_EMOJIS = [
  "🎁",
  "🎀",
  "🧸",
  "👧",
  "👦",
  "👶",
  "👩",
  "👨",
  "👵",
  "👴",
  "💛",
  "🏠",
  "🐶",
  "🐱",
  "✨",
  "🎄",
  "💍",
  "🧁",
];

export function emptyGifts(): { people: GiftPerson[]; items: GiftItem[] } {
  return { people: [], items: [] };
}

export function currentGiftYear(from = new Date()): number {
  return from.getFullYear();
}

export function giftYearChoices(from = new Date()): number[] {
  const year = currentGiftYear(from);
  return [year + 1, year, year - 1, year - 2, year - 3];
}

export function occasionMeta(id: GiftOccasionId) {
  return GIFT_OCCASIONS.find((row) => row.id === id) ?? GIFT_OCCASIONS[GIFT_OCCASIONS.length - 1]!;
}

export function kindLabel(kind: GiftPersonKind): string {
  if (kind === "you") return "Your list";
  if (kind === "them") return "Theirs";
  if (kind === "child") return "Kid";
  if (kind === "family") return "Family";
  if (kind === "friend") return "Friend";
  return "Someone else";
}

export function formatGiftDate(dateKey: string | null, year: number): string {
  if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return parseDateKey(dateKey).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return String(year);
}

export function personById(people: GiftPerson[], id: string): GiftPerson | null {
  return people.find((row) => row.id === id) ?? null;
}

export function openItems(items: GiftItem[], personId: string, lane: GiftLane): GiftItem[] {
  return items
    .filter((row) => row.personId === personId && row.lane === lane && row.status === "open")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function allOpenItems(items: GiftItem[], personId: string): GiftItem[] {
  return items
    .filter((row) => row.personId === personId && row.status === "open")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function givenItems(items: GiftItem[], personId?: string): GiftItem[] {
  return items
    .filter((row) => row.status === "given" && (!personId || row.personId === personId))
    .sort((a, b) => {
      const aKey = a.dateKey ?? `${a.year}-12-31`;
      const bKey = b.dateKey ?? `${b.year}-12-31`;
      return bKey.localeCompare(aKey) || b.createdAt.localeCompare(a.createdAt);
    });
}

export function yearsInLedger(items: GiftItem[], fallbackYear = currentGiftYear()): number[] {
  const years = new Set<number>();
  years.add(fallbackYear);
  items.forEach((row) => {
    if (row.status === "given") years.add(row.year);
  });
  return [...years].sort((a, b) => b - a);
}

export function groupGivenByOccasion(
  items: GiftItem[],
  year: number
): { occasion: GiftOccasionId; rows: GiftItem[] }[] {
  const ofYear = givenItems(items).filter((row) => row.year === year);
  return GIFT_OCCASIONS.map((meta) => ({
    occasion: meta.id,
    rows: ofYear.filter((row) => row.occasion === meta.id),
  })).filter((group) => group.rows.length > 0);
}

export function shopCount(items: GiftItem[], personId: string): number {
  return items.filter(
    (row) => row.personId === personId && row.lane === "shop" && row.status === "open"
  ).length;
}

export function wishCount(items: GiftItem[], personId: string): number {
  return items.filter(
    (row) => row.personId === personId && row.lane === "wish" && row.status === "open"
  ).length;
}

export function ensureCouplePeople(
  people: GiftPerson[],
  youName: string,
  themName: string
): GiftPerson[] {
  const you = youName.trim() || "You";
  const them = themName.trim() || "Them";
  const youRow = people.find((row) => row.slot === "you");
  const themRow = people.find((row) => row.slot === "them");
  if (
    youRow &&
    themRow &&
    youRow.name === you &&
    themRow.name === them
  ) {
    return people;
  }
  let next = [...people];
  if (!youRow) {
    next = [
      {
        id: createId(),
        name: you,
        kind: "you",
        emoji: "✨",
        notes: "",
        slot: "you",
        hidden: false,
        ownerUserId: null,
        createdAt: nowIso(),
      },
      ...next,
    ];
  } else if (youRow.name !== you) {
    next = next.map((row) => (row.slot === "you" ? { ...row, name: you } : row));
  }
  const themNow = next.find((row) => row.slot === "them");
  if (!themNow) {
    const youIndex = next.findIndex((row) => row.slot === "you");
    const insertAt = youIndex >= 0 ? youIndex + 1 : 0;
    next = [
      ...next.slice(0, insertAt),
      {
        id: createId(),
        name: them,
        kind: "them",
        emoji: "💛",
        notes: "",
        slot: "them",
        hidden: false,
        ownerUserId: null,
        createdAt: nowIso(),
      },
      ...next.slice(insertAt),
    ];
  } else if (themNow.name !== them) {
    next = next.map((row) => (row.slot === "them" ? { ...row, name: them } : row));
  }
  return next;
}

export function addGiftPerson(
  people: GiftPerson[],
  input: {
    name: string;
    kind: Exclude<GiftPersonKind, "you" | "them">;
    emoji?: string;
    notes?: string;
    hidden?: boolean;
    ownerUserId?: string | null;
  }
): GiftPerson[] {
  const name = input.name.trim();
  if (!name) return people;
  const hidden = Boolean(input.hidden);
  return [
    ...people,
    {
      id: createId(),
      name,
      kind: input.kind,
      emoji: input.emoji?.trim() || (hidden ? "🔒" : defaultEmoji(input.kind)),
      notes: input.notes?.trim() ?? "",
      slot: null,
      hidden,
      ownerUserId: hidden ? input.ownerUserId ?? null : null,
      createdAt: nowIso(),
    },
  ];
}

export function removeGiftPerson(
  people: GiftPerson[],
  items: GiftItem[],
  personId: string
): { people: GiftPerson[]; items: GiftItem[] } {
  const row = people.find((person) => person.id === personId);
  if (!row || row.slot) return { people, items };
  return {
    people: people.filter((person) => person.id !== personId),
    items: items.filter((item) => item.personId !== personId),
  };
}

export function addGiftItem(
  items: GiftItem[],
  input: {
    personId: string;
    title: string;
    notes?: string;
    from?: string;
    lane: GiftLane;
    occasion?: GiftOccasionId;
    year?: number;
    status?: "open" | "given";
    dateKey?: string | null;
  }
): GiftItem[] {
  const title = input.title.trim();
  if (!title || !input.personId) return items;
  const year = input.year ?? currentGiftYear();
  return [
    ...items,
    {
      id: createId(),
      personId: input.personId,
      title,
      notes: input.notes?.trim() ?? "",
      from: input.from?.trim() ?? "",
      lane: input.lane,
      occasion: input.occasion ?? "just-because",
      year,
      status: input.status ?? "open",
      dateKey: input.dateKey ?? null,
      createdAt: nowIso(),
    },
  ];
}

export function markGiftGiven(
  items: GiftItem[],
  itemId: string,
  input: { dateKey?: string | null; year?: number; from?: string }
): GiftItem[] {
  return items.map((row) => {
    if (row.id !== itemId) return row;
    const dateKey = input.dateKey ?? row.dateKey;
    const year =
      input.year ??
      (dateKey && /^\d{4}-/.test(dateKey) ? Number(dateKey.slice(0, 4)) : row.year);
    return {
      ...row,
      status: "given" as const,
      dateKey,
      year,
      from: input.from?.trim() || row.from,
    };
  });
}

export function removeGiftItem(items: GiftItem[], itemId: string): GiftItem[] {
  return items.filter((row) => row.id !== itemId);
}

export function visibleGiftPeople(
  people: GiftPerson[],
  userId: string | undefined
): GiftPerson[] {
  return people.filter((row) => !row.hidden || row.ownerUserId === userId);
}

export const SECRET_LIST_NAME = "Secret list";

export function groupedPeople(people: GiftPerson[]): {
  us: GiftPerson[];
  kids: GiftPerson[];
  rest: GiftPerson[];
  privateLists: GiftPerson[];
} {
  return {
    us: people.filter((row) => row.slot === "you" || row.slot === "them"),
    kids: people.filter((row) => row.kind === "child" && !row.hidden),
    rest: people.filter((row) => !row.slot && row.kind !== "child" && !row.hidden),
    privateLists: people.filter((row) => row.hidden),
  };
}

export function sharedGiftPeople(people: GiftPerson[]): GiftPerson[] {
  return people.filter((row) => !row.hidden);
}

export function secretListForUser(
  people: GiftPerson[],
  userId: string | undefined
): GiftPerson | null {
  if (!userId) return null;
  return (
    people.find((row) => row.hidden && row.ownerUserId === userId) ?? null
  );
}

/** One secret list per person — merge extras and rename leftovers. */
export function collapseSecretLists(
  people: GiftPerson[],
  items: GiftItem[],
  userId: string
): { people: GiftPerson[]; items: GiftItem[] } {
  const mine = people.filter((row) => row.hidden && row.ownerUserId === userId);
  if (mine.length === 0) return { people, items };
  const keeper =
    mine.find(
      (row) => row.name === SECRET_LIST_NAME || row.name === "Private list"
    ) ?? mine[0]!;
  const extraIds = new Set(
    mine.filter((row) => row.id !== keeper.id).map((row) => row.id)
  );
  const rename =
    keeper.name !== SECRET_LIST_NAME ||
    keeper.emoji !== "🔒" ||
    keeper.notes !== "Hide from your partner.";
  if (extraIds.size === 0 && !rename) return { people, items };
  return {
    people: people
      .filter((row) => !extraIds.has(row.id))
      .map((row) =>
        row.id === keeper.id
          ? {
              ...row,
              name: SECRET_LIST_NAME,
              emoji: "🔒",
              notes: "Hide from your partner.",
            }
          : row
      ),
    items: extraIds.size
      ? items.map((row) =>
          extraIds.has(row.personId) ? { ...row, personId: keeper.id } : row
        )
      : items,
  };
}

export function ensurePrivatePerson(
  people: GiftPerson[],
  userId: string
): { people: GiftPerson[]; person: GiftPerson } {
  const existing = people.find((row) => row.hidden && row.ownerUserId === userId);
  if (existing) {
    if (
      existing.name === SECRET_LIST_NAME &&
      existing.notes === "Hide from your partner."
    ) {
      return { people, person: existing };
    }
    return {
      people: people.map((row) =>
        row.id === existing.id
          ? {
              ...row,
              name: SECRET_LIST_NAME,
              emoji: "🔒",
              notes: "Hide from your partner.",
            }
          : row
      ),
      person: {
        ...existing,
        name: SECRET_LIST_NAME,
        emoji: "🔒",
        notes: "Hide from your partner.",
      },
    };
  }
  const person: GiftPerson = {
    id: createId(),
    name: SECRET_LIST_NAME,
    kind: "other",
    emoji: "🔒",
    notes: "Hide from your partner.",
    slot: null,
    hidden: true,
    ownerUserId: userId,
    createdAt: nowIso(),
  };
  return { people: [...people, person], person };
}

function defaultEmoji(kind: GiftPersonKind): string {
  if (kind === "child") return "🧸";
  if (kind === "family") return "🏠";
  if (kind === "friend") return "💛";
  if (kind === "you") return "✨";
  if (kind === "them") return "💛";
  return "🎁";
}

function asOccasion(value: unknown): GiftOccasionId {
  return GIFT_OCCASIONS.some((row) => row.id === value)
    ? (value as GiftOccasionId)
    : "other";
}

function asKind(value: unknown): GiftPersonKind {
  if (
    value === "you" ||
    value === "them" ||
    value === "child" ||
    value === "family" ||
    value === "friend" ||
    value === "other"
  ) {
    return value;
  }
  return "other";
}

export function hydrateGiftPerson(raw: unknown): GiftPerson | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<GiftPerson>;
  if (typeof row.id !== "string" || !row.id) return null;
  const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : null;
  if (!name) return null;
  const kind = asKind(row.kind);
  const slot: GiftPersonSlot | null =
    row.slot === "you" || row.slot === "them"
      ? row.slot
      : kind === "you" || kind === "them"
        ? kind
        : null;
  return {
    id: row.id,
    name,
    kind: slot ?? kind,
    emoji: typeof row.emoji === "string" && row.emoji.trim() ? row.emoji.trim() : defaultEmoji(kind),
    notes: typeof row.notes === "string" ? row.notes : "",
    slot,
    hidden: Boolean(row.hidden),
    ownerUserId:
      typeof row.ownerUserId === "string" && row.ownerUserId ? row.ownerUserId : null,
    createdAt: typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso(),
  };
}

export function hydrateGiftItem(raw: unknown): GiftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<GiftItem>;
  if (typeof row.id !== "string" || !row.id) return null;
  if (typeof row.personId !== "string" || !row.personId) return null;
  const title = typeof row.title === "string" && row.title.trim() ? row.title.trim() : null;
  if (!title) return null;
  const year =
    typeof row.year === "number" && Number.isFinite(row.year)
      ? Math.round(row.year)
      : currentGiftYear();
  return {
    id: row.id,
    personId: row.personId,
    title,
    notes: typeof row.notes === "string" ? row.notes : "",
    from: typeof row.from === "string" ? row.from : "",
    lane: row.lane === "wish" ? "wish" : "shop",
    occasion: asOccasion(row.occasion),
    year,
    status: row.status === "given" ? "given" : "open",
    dateKey:
      typeof row.dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.dateKey)
        ? row.dateKey
        : null,
    createdAt: typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso(),
  };
}

export function hydrateGifts(rawPeople: unknown, rawItems: unknown): {
  people: GiftPerson[];
  items: GiftItem[];
} {
  return {
    people: (Array.isArray(rawPeople) ? rawPeople : [])
      .map(hydrateGiftPerson)
      .filter((row): row is GiftPerson => Boolean(row)),
    items: (Array.isArray(rawItems) ? rawItems : [])
      .map(hydrateGiftItem)
      .filter((row): row is GiftItem => Boolean(row)),
  };
}
