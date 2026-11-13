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
  /** Profile this list belongs to, for you/them so phones do not swap names. */
  userId: string | null;
  /** Partner never sees this list. */
  hidden: boolean;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
  status: "open" | "bought" | "given";
  price: string;
  /** Who a one-off Other-list gift is for. */
  forName: string;
  dateKey: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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

export function giftPersonLabel(
  person: GiftPerson,
  names: { you?: string | null; them?: string | null },
  ids?: { youId?: string | null; themId?: string | null }
): string {
  if (ids?.youId && person.userId === ids.youId) {
    return names.you?.trim() || person.name;
  }
  if (ids?.themId && person.userId === ids.themId) {
    return names.them?.trim() || person.name;
  }
  if (!isPlaceholderName(person.name)) return person.name;
  if (person.slot === "you") return names.you?.trim() || person.name;
  if (person.slot === "them") return names.them?.trim() || person.name;
  return person.name;
}

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

export function liveGiftItem(row: GiftItem): boolean {
  return !row.deletedAt;
}

export function liveGiftPerson(row: GiftPerson): boolean {
  return !row.deletedAt;
}

export function canRemoveGiftPerson(
  row: GiftPerson,
  youUserId?: string | null,
  themUserId?: string | null,
  youName?: string | null,
  themName?: string | null
): boolean {
  if (row.hidden) return false;
  if (isOtherList(row)) return false;
  if (youUserId && row.userId === youUserId) return false;
  if (themUserId && row.userId === themUserId) return false;
  const you = youName?.trim() ?? "";
  const them = themName?.trim() ?? "";
  if (row.slot && you && namesMatch(row.name, you)) return false;
  if (row.slot && them && namesMatch(row.name, them)) return false;
  if (row.slot && isPlaceholderName(row.name)) return false;
  return true;
}

export function formatGiftPrice(price: string | null | undefined): string {
  const raw = (price ?? "").trim();
  if (!raw) return "";
  if (/^\$/.test(raw) || /[a-z]/i.test(raw)) return raw;
  return `$${raw}`;
}

export function openItems(items: GiftItem[], personId: string, lane: GiftLane): GiftItem[] {
  return items
    .filter(
      (row) =>
        liveGiftItem(row) &&
        row.personId === personId &&
        row.lane === lane &&
        row.status === "open"
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function allOpenItems(items: GiftItem[], personId: string): GiftItem[] {
  return items
    .filter(
      (row) => liveGiftItem(row) && row.personId === personId && row.status === "open"
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function boughtItems(items: GiftItem[], personId?: string): GiftItem[] {
  return items
    .filter(
      (row) =>
        liveGiftItem(row) &&
        row.status === "bought" &&
        (!personId || row.personId === personId)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function givenItems(items: GiftItem[], personId?: string): GiftItem[] {
  return items
    .filter(
      (row) =>
        liveGiftItem(row) &&
        row.status === "given" &&
        (!personId || row.personId === personId)
    )
    .sort((a, b) => {
      const aKey = a.dateKey ?? `${a.year}-12-31`;
      const bKey = b.dateKey ?? `${b.year}-12-31`;
      return bKey.localeCompare(aKey) || b.createdAt.localeCompare(a.createdAt);
    });
}

export function yearsInGiftBook(items: GiftItem[], fallbackYear = currentGiftYear()): number[] {
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
    (row) =>
      liveGiftItem(row) &&
      row.personId === personId &&
      row.lane === "shop" &&
      row.status === "open"
  ).length;
}

export function wishCount(items: GiftItem[], personId: string): number {
  return items.filter(
    (row) =>
      liveGiftItem(row) &&
      row.personId === personId &&
      row.lane === "wish" &&
      row.status === "open"
  ).length;
}

function namesMatch(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function isPlaceholderName(name: string): boolean {
  const value = name.trim().toLowerCase();
  return value === "you" || value === "them" || value === "";
}

function isCouplePerson(row: GiftPerson): boolean {
  return Boolean(row.slot || row.kind === "you" || row.kind === "them");
}

function stampCoupleRow(
  row: GiftPerson,
  patch: Partial<GiftPerson>
): GiftPerson {
  const next = { ...row, ...patch };
  if (
    next.userId === row.userId &&
    next.slot === row.slot &&
    next.name === row.name &&
    next.kind === row.kind
  ) {
    return row;
  }
  return { ...next, updatedAt: nowIso() };
}

export function ensureCouplePeople(
  people: GiftPerson[],
  youName: string,
  themName: string,
  youUserId?: string | null,
  themUserId?: string | null
): GiftPerson[] {
  const you = youName.trim() || "You";
  const them = themName.trim() || "Them";
  let next = people.map((row) => {
    if (row.hidden || !liveGiftPerson(row)) return row;
    let userId = row.userId;
    if (!userId && youUserId && !isPlaceholderName(row.name) && namesMatch(row.name, you)) {
      userId = youUserId;
    }
    if (!userId && themUserId && !isPlaceholderName(row.name) && namesMatch(row.name, them)) {
      userId = themUserId;
    }
    let slot = row.slot;
    let name = row.name;
    if (youUserId && userId === youUserId) {
      slot = "you";
      name = you;
    } else if (themUserId && userId === themUserId) {
      slot = "them";
      name = them;
    }
    return stampCoupleRow(row, { userId, slot, name, kind: slot ?? row.kind });
  });

  let viewerYouTaken = next.some(
    (row) => liveGiftPerson(row) && !row.hidden && youUserId && row.userId === youUserId
  );
  let viewerThemTaken = next.some(
    (row) => liveGiftPerson(row) && !row.hidden && themUserId && row.userId === themUserId
  );
  next = next.map((row) => {
    if (row.hidden || !liveGiftPerson(row) || row.userId || !isCouplePerson(row)) {
      return row;
    }
    if (row.slot === "you") {
      if (!viewerYouTaken && youUserId) {
        viewerYouTaken = true;
        return stampCoupleRow(row, {
          userId: youUserId,
          slot: "you",
          name: isPlaceholderName(row.name) ? you : row.name,
          kind: "you",
        });
      }
      if (themUserId) {
        return stampCoupleRow(row, {
          userId: themUserId,
          slot: "them",
          name: isPlaceholderName(row.name) ? them : row.name,
          kind: "them",
        });
      }
    }
    if (row.slot === "them") {
      if (!viewerThemTaken && themUserId) {
        viewerThemTaken = true;
        return stampCoupleRow(row, {
          userId: themUserId,
          slot: "them",
          name: isPlaceholderName(row.name) ? them : row.name,
          kind: "them",
        });
      }
      if (youUserId) {
        return stampCoupleRow(row, {
          userId: youUserId,
          slot: "you",
          name: isPlaceholderName(row.name) ? you : row.name,
          kind: "you",
        });
      }
    }
    return row;
  });

  const youRow =
    next.find((row) => liveGiftPerson(row) && !row.hidden && youUserId && row.userId === youUserId) ??
    next.find((row) => liveGiftPerson(row) && !row.hidden && row.slot === "you");
  const themRow =
    next.find((row) => liveGiftPerson(row) && !row.hidden && themUserId && row.userId === themUserId) ??
    next.find((row) => liveGiftPerson(row) && !row.hidden && row.slot === "them");
  if (
    youRow &&
    themRow &&
    youRow.name === you &&
    themRow.name === them &&
    (!youUserId || youRow.userId === youUserId) &&
    (!themUserId || themRow.userId === themUserId)
  ) {
    return next;
  }
  const stamp = nowIso();
  if (!youRow) {
    next = [
      {
        id: createId(),
        name: you,
        kind: "you",
        emoji: "✨",
        notes: "",
        slot: "you",
        userId: youUserId ?? null,
        hidden: false,
        ownerUserId: null,
        createdAt: stamp,
        updatedAt: stamp,
        deletedAt: null,
      },
      ...next,
    ];
  }
  const themNow =
    next.find((row) => liveGiftPerson(row) && !row.hidden && themUserId && row.userId === themUserId) ??
    next.find((row) => liveGiftPerson(row) && !row.hidden && row.slot === "them");
  if (!themNow) {
    const youIndex = next.findIndex((row) => liveGiftPerson(row) && row.slot === "you");
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
        userId: themUserId ?? null,
        hidden: false,
        ownerUserId: null,
        createdAt: stamp,
        updatedAt: stamp,
        deletedAt: null,
      },
      ...next.slice(insertAt),
    ];
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
  const stamp = nowIso();
  return [
    ...people,
    {
      id: createId(),
      name,
      kind: input.kind,
      emoji: input.emoji?.trim() || (hidden ? "🔒" : defaultEmoji(input.kind)),
      notes: input.notes?.trim() ?? "",
      slot: null,
      userId: null,
      hidden,
      ownerUserId: hidden ? input.ownerUserId ?? null : null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
  ];
}

export function removeGiftPerson(
  people: GiftPerson[],
  items: GiftItem[],
  personId: string
): { people: GiftPerson[]; items: GiftItem[] } {
  const row = people.find((person) => person.id === personId);
  if (!row || !liveGiftPerson(row)) return { people, items };
  if (isOtherList(row)) return { people, items };
  if (row.slot && isCouplePerson(row) && (row.userId || isPlaceholderName(row.name))) {
    return { people, items };
  }
  const stamp = nowIso();
  return {
    people: people.map((person) =>
      person.id === personId
        ? { ...person, deletedAt: stamp, updatedAt: stamp }
        : person
    ),
    items: items.map((item) =>
      item.personId === personId && liveGiftItem(item)
        ? { ...item, deletedAt: stamp, updatedAt: stamp }
        : item
    ),
  };
}

export function addGiftItem(
  items: GiftItem[],
  input: {
    personId: string;
    title: string;
    notes?: string;
    from?: string;
    forName?: string;
    lane: GiftLane;
    occasion?: GiftOccasionId;
    year?: number;
    status?: "open" | "bought" | "given";
    price?: string;
    dateKey?: string | null;
  }
): GiftItem[] {
  const title = input.title.trim();
  if (!title || !input.personId) return items;
  const year = input.year ?? currentGiftYear();
  const stamp = nowIso();
  const status = input.status ?? "open";
  const titleKey = giftTitleKey(title);
  if (
    status === "open" &&
    items.some(
      (row) =>
        liveGiftItem(row) &&
        row.status === "open" &&
        row.personId === input.personId &&
        row.lane === input.lane &&
        giftTitleKey(row.title) === titleKey &&
        giftTitleKey(row.forName) === giftTitleKey(input.forName ?? "")
    )
  ) {
    return items;
  }
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
      status,
      price: (input.price ?? "").trim(),
      forName: (input.forName ?? "").trim(),
      dateKey: input.dateKey ?? null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
  ];
}

function giftTitleKey(title: string): string {
  return title.trim().toLowerCase();
}

export function markGiftBought(items: GiftItem[], itemId: string): GiftItem[] {
  const target = items.find((row) => row.id === itemId && liveGiftItem(row));
  if (!target || target.status !== "open") return items;
  const stamp = nowIso();
  const titleKey = giftTitleKey(target.title);
  return items.map((row) => {
    if (!liveGiftItem(row) || row.status !== "open") return row;
    const same =
      row.id === itemId ||
      (row.personId === target.personId &&
        row.lane === target.lane &&
        giftTitleKey(row.title) === titleKey &&
        giftTitleKey(row.forName) === giftTitleKey(target.forName));
    return same ? { ...row, status: "bought" as const, updatedAt: stamp } : row;
  });
}

export function updateGiftItem(
  items: GiftItem[],
  itemId: string,
  patch: { title?: string; price?: string; notes?: string; personId?: string; forName?: string }
): GiftItem[] {
  const title = patch.title?.trim();
  const stamp = nowIso();
  return items.map((row) => {
    if (row.id !== itemId || !liveGiftItem(row)) return row;
    return {
      ...row,
      title: title || row.title,
      price: patch.price !== undefined ? patch.price.trim() : row.price,
      notes: patch.notes !== undefined ? patch.notes : row.notes,
      personId: patch.personId || row.personId,
      forName: patch.forName !== undefined ? patch.forName.trim() : row.forName,
      updatedAt: stamp,
    };
  });
}

export function swapCoupleGiftItems(
  people: GiftPerson[],
  items: GiftItem[],
  youUserId?: string | null,
  themUserId?: string | null
): GiftItem[] {
  const you =
    people.find(
      (row) => liveGiftPerson(row) && !row.hidden && youUserId && row.userId === youUserId
    ) ??
    people.find((row) => liveGiftPerson(row) && !row.hidden && row.slot === "you");
  const them =
    people.find(
      (row) => liveGiftPerson(row) && !row.hidden && themUserId && row.userId === themUserId
    ) ??
    people.find((row) => liveGiftPerson(row) && !row.hidden && row.slot === "them");
  if (!you || !them || you.id === them.id) return items;
  const stamp = nowIso();
  return items.map((row) => {
    if (row.personId === you.id) return { ...row, personId: them.id, updatedAt: stamp };
    if (row.personId === them.id) return { ...row, personId: you.id, updatedAt: stamp };
    return row;
  });
}

export function markGiftGiven(
  items: GiftItem[],
  itemId: string,
  input: {
    dateKey?: string | null;
    year?: number;
    from?: string;
    occasion?: GiftOccasionId;
  }
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
      occasion: input.occasion ?? row.occasion,
      updatedAt: nowIso(),
    };
  });
}

export function removeGiftItem(items: GiftItem[], itemId: string): GiftItem[] {
  const target = items.find((row) => row.id === itemId);
  if (!target) return items;
  const stamp = nowIso();
  const titleKey = giftTitleKey(target.title);
  return items.map((row) => {
    if (row.deletedAt) return row;
    const same =
      row.id === itemId ||
      (row.personId === target.personId &&
        giftTitleKey(row.title) === titleKey &&
        giftTitleKey(row.forName) === giftTitleKey(target.forName));
    return same ? { ...row, deletedAt: stamp, updatedAt: stamp } : row;
  });
}

export function visibleGiftPeople(
  people: GiftPerson[],
  userId: string | undefined
): GiftPerson[] {
  return people.filter(
    (row) => liveGiftPerson(row) && (!row.hidden || row.ownerUserId === userId)
  );
}

export const SECRET_LIST_NAME = "Secret list";
export const OTHER_LIST_NAME = "Other";
export const OTHER_LIST_NOTE = "One-off gifts.";

export function isOtherList(row: GiftPerson): boolean {
  return (
    !row.hidden &&
    !row.slot &&
    (row.notes === OTHER_LIST_NOTE || namesMatch(row.name, OTHER_LIST_NAME))
  );
}

export function otherListFor(people: GiftPerson[]): GiftPerson | null {
  return people.find((row) => liveGiftPerson(row) && isOtherList(row)) ?? null;
}

function uniqueCouplePeople(people: GiftPerson[]): GiftPerson[] {
  const seen = new Set<string>();
  const out: GiftPerson[] = [];
  for (const row of people) {
    if (!liveGiftPerson(row)) continue;
    const key = row.userId
      ? `user:${row.userId}`
      : !isPlaceholderName(row.name) && (row.slot || row.kind === "you" || row.kind === "them")
        ? `couple:${row.name.trim().toLowerCase()}`
        : row.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

export function groupedPeople(people: GiftPerson[]): {
  us: GiftPerson[];
  kids: GiftPerson[];
  rest: GiftPerson[];
  privateLists: GiftPerson[];
} {
  return {
    us: uniqueCouplePeople(people.filter((row) => row.slot === "you" || row.slot === "them")),
    kids: people.filter((row) => liveGiftPerson(row) && row.kind === "child" && !row.hidden),
    rest: people.filter(
      (row) =>
        liveGiftPerson(row) &&
        !row.slot &&
        row.kind !== "child" &&
        !row.hidden &&
        !isOtherList(row)
    ),
    privateLists: people.filter((row) => liveGiftPerson(row) && row.hidden),
  };
}

export function sharedGiftPeople(people: GiftPerson[]): GiftPerson[] {
  return uniqueCouplePeople(people.filter((row) => !row.hidden));
}

export function secretListForUser(
  people: GiftPerson[],
  userId: string | undefined
): GiftPerson | null {
  if (!userId) return null;
  return (
    people.find((row) => liveGiftPerson(row) && row.hidden && row.ownerUserId === userId) ??
    null
  );
}

/** One secret list per person — merge extras and rename leftovers. */
export function collapseSecretLists(
  people: GiftPerson[],
  items: GiftItem[],
  userId: string
): { people: GiftPerson[]; items: GiftItem[] } {
  const mine = people.filter(
    (row) => liveGiftPerson(row) && row.hidden && row.ownerUserId === userId
  );
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
  const existing = people.find(
    (row) => liveGiftPerson(row) && row.hidden && row.ownerUserId === userId
  );
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
  const stamp = nowIso();
  const person: GiftPerson = {
    id: createId(),
    name: SECRET_LIST_NAME,
    kind: "other",
    emoji: "🔒",
    notes: "Hide from your partner.",
    slot: null,
    userId: null,
    hidden: true,
    ownerUserId: userId,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
  };
  return { people: [...people, person], person };
}

export function ensureOtherPerson(
  people: GiftPerson[]
): { people: GiftPerson[]; person: GiftPerson } {
  const existing = otherListFor(people);
  if (existing) {
    if (existing.name === OTHER_LIST_NAME && existing.notes === OTHER_LIST_NOTE) {
      return { people, person: existing };
    }
    return {
      people: people.map((row) =>
        row.id === existing.id
          ? {
              ...row,
              name: OTHER_LIST_NAME,
              emoji: "🎁",
              notes: OTHER_LIST_NOTE,
            }
          : row
      ),
      person: {
        ...existing,
        name: OTHER_LIST_NAME,
        emoji: "🎁",
        notes: OTHER_LIST_NOTE,
      },
    };
  }
  const stamp = nowIso();
  const person: GiftPerson = {
    id: createId(),
    name: OTHER_LIST_NAME,
    kind: "other",
    emoji: "🎁",
    notes: OTHER_LIST_NOTE,
    slot: null,
    userId: null,
    hidden: false,
    ownerUserId: null,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
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
  const createdAt = typeof row.createdAt === "string" && row.createdAt ? row.createdAt : nowIso();
  return {
    id: row.id,
    name,
    kind: slot ?? kind,
    emoji: typeof row.emoji === "string" && row.emoji.trim() ? row.emoji.trim() : defaultEmoji(kind),
    notes: typeof row.notes === "string" ? row.notes : "",
    slot,
    userId: typeof row.userId === "string" && row.userId ? row.userId : null,
    hidden: Boolean(row.hidden),
    ownerUserId:
      typeof row.ownerUserId === "string" && row.ownerUserId ? row.ownerUserId : null,
    createdAt,
    updatedAt:
      typeof row.updatedAt === "string" && row.updatedAt ? row.updatedAt : createdAt,
    deletedAt:
      typeof row.deletedAt === "string" && row.deletedAt ? row.deletedAt : null,
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
    status:
      row.status === "given" ? "given" : row.status === "bought" ? "bought" : "open",
    price: typeof row.price === "string" ? row.price : "",
    forName: typeof row.forName === "string" ? row.forName : "",
    dateKey:
      typeof row.dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.dateKey)
        ? row.dateKey
        : null,
    createdAt: typeof row.createdAt === "string" && row.createdAt ? row.createdAt : "",
    updatedAt:
      typeof row.updatedAt === "string" && row.updatedAt
        ? row.updatedAt
        : typeof row.createdAt === "string" && row.createdAt
          ? row.createdAt
          : "",
    deletedAt:
      typeof row.deletedAt === "string" && row.deletedAt ? row.deletedAt : null,
  };
}

export function giftStamp(row: GiftItem): string {
  return row.updatedAt || row.deletedAt || row.createdAt || "";
}

function giftProgress(row: GiftItem): number {
  if (row.status === "given") return 2;
  if (row.status === "bought") return 1;
  return 0;
}

/** A delete or bought/given tick beats the still-open copy. */
export function preferGiftItem(local: GiftItem, remote: GiftItem): GiftItem {
  const localDel = Boolean(local.deletedAt);
  const remoteDel = Boolean(remote.deletedAt);
  const localAt = giftStamp(local);
  const remoteAt = giftStamp(remote);
  if (localDel !== remoteDel) {
    if (localDel && localAt >= remoteAt) return local;
    if (remoteDel && remoteAt >= localAt) return remote;
    return localDel ? remote : local;
  }
  if (localDel && remoteDel) return remoteAt >= localAt ? remote : local;
  const localProgress = giftProgress(local);
  const remoteProgress = giftProgress(remote);
  if (localProgress !== remoteProgress) {
    return remoteProgress > localProgress ? remote : local;
  }
  return remoteAt >= localAt ? remote : local;
}

function personStamp(row: GiftPerson): string {
  return row.updatedAt || row.deletedAt || row.createdAt || "";
}

function preferGiftPerson(keeper: GiftPerson, other: GiftPerson): GiftPerson {
  const keeperDel = Boolean(keeper.deletedAt);
  const otherDel = Boolean(other.deletedAt);
  if (keeperDel !== otherDel) return keeperDel ? keeper : other;
  if (keeperDel && otherDel) {
    return personStamp(other) >= personStamp(keeper) ? other : keeper;
  }
  const name =
    isPlaceholderName(keeper.name) && !isPlaceholderName(other.name)
      ? other.name
      : keeper.name;
  return {
    ...keeper,
    name,
    userId: keeper.userId || other.userId,
    notes: keeper.notes || other.notes,
    emoji: keeper.emoji || other.emoji,
    updatedAt:
      personStamp(other) >= personStamp(keeper) ? other.updatedAt : keeper.updatedAt,
  };
}

function findPersonRoot(parent: Map<string, string>, id: string): string {
  let cur = parent.get(id) ?? id;
  while (parent.get(cur) && parent.get(cur) !== cur) {
    cur = parent.get(cur)!;
  }
  return cur;
}

function unionPerson(parent: Map<string, string>, keeperId: string, otherId: string) {
  const a = findPersonRoot(parent, keeperId);
  const b = findPersonRoot(parent, otherId);
  if (a !== b) parent.set(b, a);
}

/** One Craig, one Alana — merge by profile id and by name, not by you/them. */
export function collapseGiftPeople(
  people: GiftPerson[],
  items: GiftItem[]
): { people: GiftPerson[]; items: GiftItem[] } {
  const parent = new Map<string, string>();
  for (const row of people) parent.set(row.id, row.id);

  const byUser = new Map<string, string>();
  const byCoupleName = new Map<string, string>();
  const byOther = new Map<string, string>();
  const bySecret = new Map<string, string>();

  for (const row of people) {
    if (row.hidden) {
      const key = `secret:${row.ownerUserId || row.id}`;
      const prev = bySecret.get(key);
      if (prev) unionPerson(parent, prev, row.id);
      else bySecret.set(key, row.id);
      continue;
    }
    if (isOtherList(row)) {
      const prev = byOther.get("one-off");
      if (prev) unionPerson(parent, prev, row.id);
      else byOther.set("one-off", row.id);
      continue;
    }
    if (isCouplePerson(row)) {
      if (row.userId) {
        const prev = byUser.get(row.userId);
        if (prev) unionPerson(parent, prev, row.id);
        else byUser.set(row.userId, row.id);
      }
      const name = row.name.trim().toLowerCase();
      if (!isPlaceholderName(name)) {
        const prev = byCoupleName.get(name);
        if (prev) {
          const prevRow = people.find((person) => person.id === prev);
          if (!prevRow?.userId || !row.userId || prevRow.userId === row.userId) {
            unionPerson(parent, prev, row.id);
          }
        } else {
          byCoupleName.set(name, row.id);
        }
      }
      continue;
    }
    const key = `${row.kind}:${row.name.trim().toLowerCase()}`;
    const prev = byOther.get(key);
    if (prev) unionPerson(parent, prev, row.id);
    else byOther.set(key, row.id);
  }

  const remap = new Map<string, string>();
  const keepers = new Map<string, GiftPerson>();
  const order: GiftPerson[] = [];
  for (const row of people) {
    const root = findPersonRoot(parent, row.id);
    if (root !== row.id) remap.set(row.id, root);
    const prev = keepers.get(root);
    if (!prev) {
      keepers.set(root, row);
      order.push(row);
      continue;
    }
    const merged = preferGiftPerson(prev, row);
    keepers.set(root, merged);
    const index = order.findIndex((person) => person.id === prev.id);
    if (index >= 0) order[index] = merged;
  }

  const nextPeople = order.map((row) => keepers.get(row.id) ?? row);
  const nextItems =
    remap.size === 0
      ? items
      : items.map((row) => {
          const personId = remap.get(row.personId);
          return personId ? { ...row, personId } : row;
        });
  if (remap.size === 0 && nextPeople.length === people.length) {
    return { people: nextPeople, items: nextItems };
  }
  return { people: nextPeople, items: nextItems };
}

export function collapseGiftItems(items: GiftItem[]): GiftItem[] {
  const map = new Map<string, GiftItem>();
  for (const row of items) {
    const key = `${row.personId}:${row.lane}:${giftTitleKey(row.title)}:${giftTitleKey(row.forName)}`;
    const prev = map.get(key);
    map.set(key, prev ? preferGiftItem(prev, row) : row);
  }
  return [...map.values()];
}

export function mergeGiftItems(local: GiftItem[], remote: GiftItem[]): GiftItem[] {
  const map = new Map<string, GiftItem>();
  for (const row of local) map.set(row.id, row);
  for (const row of remote) {
    const prev = map.get(row.id);
    map.set(row.id, prev ? preferGiftItem(prev, row) : row);
  }
  return collapseGiftItems([...map.values()]);
}

export function mergeGiftPeople(local: GiftPerson[], remote: GiftPerson[]): GiftPerson[] {
  const map = new Map<string, GiftPerson>();
  for (const row of local) map.set(row.id, row);
  for (const row of remote) {
    const prev = map.get(row.id);
    map.set(row.id, prev ? preferGiftPerson(prev, row) : row);
  }
  return [...map.values()];
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
