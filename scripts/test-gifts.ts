import {
  addGiftItem,
  addGiftPerson,
  canRemoveGiftPerson,
  collapseGiftPeople,
  ensureCouplePeople,
  giftPersonLabel,
  removeGiftPerson,
  swapCoupleGiftItems,
  type GiftItem,
  type GiftPerson,
} from "../lib/gifts";

function person(partial: Partial<GiftPerson> & Pick<GiftPerson, "id" | "name" | "slot">): GiftPerson {
  return {
    kind: partial.slot ?? "other",
    emoji: "🎁",
    notes: "",
    userId: null,
    hidden: false,
    ownerUserId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    deletedAt: null,
    ...partial,
  };
}

function item(partial: Partial<GiftItem> & Pick<GiftItem, "id" | "personId" | "title">): GiftItem {
  return {
    notes: "",
    from: "",
    lane: "shop",
    occasion: "just-because",
    year: 2026,
    status: "open",
    price: "",
    forName: "",
    dateKey: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    deletedAt: null,
    ...partial,
  };
}

let failed = 0;
function assert(name: string, ok: boolean) {
  if (!ok) {
    failed += 1;
    console.error(`FAIL ${name}`);
  } else {
    console.log(`ok   ${name}`);
  }
}

const craigId = "user-craig";
const alanaId = "user-alana";

const merged = ensureCouplePeople(
  [
    person({ id: "p-craig", name: "You", slot: "you" }),
    person({ id: "p-alana-local", name: "Them", slot: "them" }),
    person({ id: "p-alana-phone", name: "You", slot: "you" }),
    person({ id: "p-craig-from-alana", name: "Them", slot: "them" }),
  ],
  "Craig",
  "Alana",
  craigId,
  alanaId
);

const craig = merged.find((row) => row.id === "p-craig");
const extraYou = merged.find((row) => row.id === "p-alana-phone");
assert("first you-slot stays Craig", craig?.userId === craigId && craig?.name === "Craig");
assert("extra you-slot becomes Alana", extraYou?.userId === alanaId && extraYou?.name === "Alana");

const items = [
  item({ id: "hoselink", personId: "p-alana-phone", title: "Hoselink" }),
  item({ id: "dates", personId: "p-craig", title: "Date nights" }),
];
const folded = collapseGiftPeople(merged, items);
const hoselink = folded.items.find((row) => row.id === "hoselink");
const alana = folded.people.find((row) => row.userId === alanaId);
assert("hoselink follows Alana's person", Boolean(alana && hoselink?.personId === alana.id));

const labeled = giftPersonLabel(
  person({ id: "x", name: "Craig", slot: "you", userId: alanaId }),
  { you: "Craig", them: "Alana" },
  { youId: craigId, themId: alanaId }
);
assert("label uses profile id not slot", labeled === "Alana");

const lisa = addGiftPerson([], { name: "Lisa", kind: "friend" })[0]!;
assert(
  "Lisa can be removed",
  canRemoveGiftPerson(lisa, craigId, alanaId, "Craig", "Alana")
);
const removed = removeGiftPerson([lisa], [], lisa.id);
assert("Lisa stays tombstoned", Boolean(removed.people[0]?.deletedAt));

const swapped = swapCoupleGiftItems(
  [
    person({ id: "c", name: "Craig", slot: "you", userId: craigId }),
    person({ id: "a", name: "Alana", slot: "them", userId: alanaId }),
  ],
  [
    item({ id: "h", personId: "c", title: "Hoselink" }),
    item({ id: "d", personId: "a", title: "Date nights" }),
  ],
  craigId,
  alanaId
);
assert("swap moves hoselink to Alana", swapped.find((row) => row.id === "h")?.personId === "a");
assert("swap moves date nights to Craig", swapped.find((row) => row.id === "d")?.personId === "c");

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("all ok");
