import { LookPanel } from "@/components/hub/AppSettings";
import {
  BoughtList,
  GiftBookList,
  GiftModeToggle,
  GiftNotepad,
  PriceBox,
} from "@/components/hub/GiftNotepad";
import { Stage } from "@/components/hub/Stage";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CalendarDateField } from "@/components/ui/CalendarDateField";
import { Screen } from "@/components/ui/Screen";
import { GIFTS_TONE as T, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { localDateKey } from "@/lib/dates";
import {
  addGiftItem,
  addGiftPerson,
  allOpenItems,
  boughtItems,
  canRemoveGiftPerson,
  collapseGiftPeople,
  collapseSecretLists,
  currentGiftYear,
  ensureCouplePeople,
  ensureOtherPerson,
  ensurePrivatePerson,
  formatGiftDate,
  GIFT_KIND_OPTIONS,
  GIFT_OCCASIONS,
  givenItems,
  groupedPeople,
  groupGivenByOccasion,
  giftPersonLabel,
  giftYearChoices,
  kindLabel,
  markGiftBought,
  markGiftGiven,
  occasionMeta,
  PERSON_EMOJIS,
  personById,
  removeGiftItem,
  removeGiftPerson,
  updateGiftItem,
  OTHER_LIST_NAME,
  SECRET_LIST_NAME,
  isOtherList,
  otherListFor,
  secretListForUser,
  sharedGiftPeople,
  shopCount,
  visibleGiftPeople,
  wishCount,
  yearsInGiftBook,
  type GiftItem,
  type GiftOccasionId,
  type GiftPerson,
  type GiftPersonKind,
} from "@/lib/gifts";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Tab = "people" | "wishes" | "book";
type Sheet = "person" | "log" | "give" | null;

function useGiftPersonName() {
  const { user, partner } = useApp();
  return (person: GiftPerson) =>
    giftPersonLabel(
      person,
      {
        you: user?.displayName,
        them: partner?.displayName,
      },
      { youId: user?.id, themId: partner?.id }
    );
}

export default function GiftsScreen() {
  const router = useRouter();
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const nameOf = useGiftPersonName();
  const [tab, setTab] = useState<Tab>("people");
  const look = useAppLook("gifts", T.gold, {
    hideLedger: false,
    hideCosts: false,
    compactPeople: true,
    classicMode: true,
  });
  const classic = look.prefs.classicMode !== false;
  const [sheet, setSheet] = useState<Sheet>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Exclude<GiftPersonKind, "you" | "them">>("child");
  const [emoji, setEmoji] = useState("🧸");
  const [logPersonId, setLogPersonId] = useState<string | null>(null);
  const [logTitle, setLogTitle] = useState("");
  const [logFrom, setLogFrom] = useState("Us");
  const [logOccasion, setLogOccasion] = useState<GiftOccasionId>("christmas");
  const [logYear, setLogYear] = useState(currentGiftYear());
  const [logDate, setLogDate] = useState(localDateKey());
  const [error, setError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [ledgerYear, setLedgerYear] = useState(currentGiftYear());
  const [padPersonId, setPadPersonId] = useState<string | null>(null);
  const [giveItem, setGiveItem] = useState<GiftItem | null>(null);
  const [giveOccasion, setGiveOccasion] = useState<GiftOccasionId>("just-because");
  const [giveDate, setGiveDate] = useState(localDateKey());
  const [giveFrom, setGiveFrom] = useState("Us");
  const [givePrice, setGivePrice] = useState("");

  useEffect(() => {
    if (!ready) return;
    const nextPeople = ensureCouplePeople(
      data.giftPeople,
      user?.displayName ?? "You",
      partner?.displayName ?? "Them",
      user?.id,
      partner?.id
    );
    const folded = collapseGiftPeople(nextPeople, data.giftItems);
    const collapsed = user?.id
      ? collapseSecretLists(folded.people, folded.items, user.id)
      : folded;
    const samePeople =
      collapsed.people.length === data.giftPeople.length &&
      collapsed.people.every((row, index) => {
        const prev = data.giftPeople[index];
        return (
          prev &&
          prev.id === row.id &&
          prev.userId === row.userId &&
          prev.slot === row.slot &&
          prev.name === row.name &&
          prev.deletedAt === row.deletedAt
        );
      });
    const sameItems =
      collapsed.items === data.giftItems ||
      (collapsed.items.length === data.giftItems.length &&
        collapsed.items.every((row, index) => row === data.giftItems[index]));
    if (padPersonId) {
      const stillThere = collapsed.people.some(
        (row) => row.id === padPersonId && !row.deletedAt
      );
      if (!stillThere) {
        const oldItem = data.giftItems.find((row) => row.personId === padPersonId);
        const moved = oldItem
          ? collapsed.items.find((row) => row.id === oldItem.id)
          : null;
        if (moved && moved.personId !== padPersonId) {
          setPadPersonId(moved.personId);
        }
      }
    }
    if (samePeople && sameItems) {
      return;
    }
    void patch((state) => ({
      ...state,
      giftPeople: collapsed.people,
      giftItems: collapsed.items,
    }));
  }, [
    ready,
    data.giftPeople,
    padPersonId,
    user?.displayName,
    user?.id,
    partner?.displayName,
    partner?.id,
    patch,
  ]);

  const groups = useMemo(
    () => groupedPeople(visibleGiftPeople(data.giftPeople, user?.id)),
    [data.giftPeople, user?.id]
  );
  const years = useMemo(
    () => yearsInGiftBook(data.giftItems, currentGiftYear()),
    [data.giftItems]
  );
  const ledgerGroups = useMemo(
    () => groupGivenByOccasion(data.giftItems, ledgerYear),
    [data.giftItems, ledgerYear]
  );
  const givenThisYear = useMemo(
    () => givenItems(data.giftItems).filter((row) => row.year === ledgerYear),
    [data.giftItems, ledgerYear]
  );
  const removing = removeId ? personById(data.giftPeople, removeId) : null;

  const resetPerson = () => {
    setSheet(null);
    setName("");
    setKind("child");
    setEmoji("🧸");
    setError(null);
  };

  const resetLog = () => {
    setSheet(null);
    setLogTitle("");
    setLogFrom("Us");
    setLogOccasion("christmas");
    setLogYear(currentGiftYear());
    setLogDate(localDateKey());
    setError(null);
  };

  const savePerson = async () => {
    if (!name.trim()) {
      setError("Give them a name.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      giftPeople: addGiftPerson(state.giftPeople, {
        name,
        kind,
        emoji,
      }),
    }));
    resetPerson();
  };

  const saveLog = async () => {
    const personId = logPersonId ?? data.giftPeople[0]?.id;
    if (!personId) {
      setError("Add someone first.");
      return;
    }
    if (!logTitle.trim()) {
      setError("What did they get?");
      return;
    }
    const year = logYear;
    if (!Number.isFinite(year) || year < 1990 || year > currentGiftYear() + 1) {
      setError("Pick a real year.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      giftItems: addGiftItem(state.giftItems, {
        personId,
        title: logTitle,
        from: logFrom,
        lane: "shop",
        occasion: logOccasion,
        year,
        status: "given",
        dateKey: logDate || null,
      }),
    }));
    setLedgerYear(year);
    setTab("book");
    resetLog();
  };

  const confirmRemove = async () => {
    if (!removing) return;
    const id = removing.id;
    setRemoveId(null);
    await patch((state) => {
      const next = removeGiftPerson(state.giftPeople, state.giftItems, id);
      return { ...state, giftPeople: next.people, giftItems: next.items };
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.background }}>
      <Screen scroll background={T.background} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
        <Stage
          background={T.background}
          fallback={"/hub/home-base" as Href}
          accent={look.accent}
          settingsLabel="Wishlists"
          settings={
            <LookPanel
              look={look}
              ink={T.ink}
              muted={T.muted}
            pageColor={T.background}
              toggles={[
                {
                  key: "hideLedger",
                  label: "Hide the gift book",
                  hint: "Just people and wish lists.",
                },
                {
                  key: "compactPeople",
                  label: "Compact people",
                  hint: "Shorter cards in the who-list.",
                },
                {
                  key: "classicMode",
                  label: "Classic notepad",
                  hint: "Write gifts like notes, with a checkbox.",
                },
                {
                  key: "hideCosts",
                  label: "Hide prices",
                  hint: "Turn off the dollar boxes. Left on by default.",
                },
              ]}
            />
          }
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: T.gold,
            }}
          >
            Home Base · Wishlists
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 34,
              lineHeight: 40,
              color: T.ink,
            }}
          >
            Wishlists
          </Text>

          <GiftModeToggle
            classic={classic}
            onChange={(value) => void look.patch({ classicMode: value })}
          />

          {classic ? (
            <ClassicPad
              people={sharedGiftPeople(visibleGiftPeople(data.giftPeople, user?.id)).filter(
                (row) => !isOtherList(row)
              )}
              other={otherListFor(data.giftPeople)}
              secret={secretListForUser(data.giftPeople, user?.id)}
              items={data.giftItems}
              selectedId={padPersonId}
              onSelect={setPadPersonId}
              onAddPerson={() => {
                setError(null);
                setSheet("person");
              }}
              onRemovePerson={setRemoveId}
              hideCosts={Boolean(look.prefs.hideCosts)}
              canRemovePerson={(person) =>
                canRemoveGiftPerson(
                  person,
                  user?.id,
                  partner?.id,
                  user?.displayName,
                  partner?.displayName
                )
              }
              onOpenSecret={async () => {
                if (!user?.id) return;
                let nextId = "";
                await patch((state) => {
                  const ensured = ensurePrivatePerson(state.giftPeople, user.id);
                  nextId = ensured.person.id;
                  return { ...state, giftPeople: ensured.people };
                });
                if (nextId) setPadPersonId(nextId);
              }}
              onOpenOther={async () => {
                let nextId = "";
                await patch((state) => {
                  const ensured = ensureOtherPerson(state.giftPeople);
                  nextId = ensured.person.id;
                  return { ...state, giftPeople: ensured.people };
                });
                if (nextId) setPadPersonId(nextId);
              }}
              onAdd={(personId, title, price, forName) => {
                void patch((state) => ({
                  ...state,
                  giftItems: addGiftItem(state.giftItems, {
                    personId,
                    title,
                    price,
                    forName,
                    lane: personById(state.giftPeople, personId)?.slot === "you" ? "wish" : "shop",
                    occasion: "just-because",
                    year: currentGiftYear(),
                  }),
                }));
              }}
              onEdit={(item, next) => {
                void patch((state) => ({
                  ...state,
                  giftItems: updateGiftItem(state.giftItems, item.id, next),
                }));
              }}
              onMove={(item, personId) => {
                void patch((state) => ({
                  ...state,
                  giftItems: updateGiftItem(state.giftItems, item.id, { personId }),
                }));
              }}
              onBuy={(item) => {
                void patch((state) => ({
                  ...state,
                  giftItems: markGiftBought(state.giftItems, item.id),
                }));
              }}
              onGive={(item) => {
                setGiveItem(item);
                setGiveOccasion(
                  item.occasion === "just-because" ? "birthday" : item.occasion
                );
                setGiveDate(localDateKey());
                setGiveFrom("Us");
                setGivePrice(item.price);
                setError(null);
                setSheet("give");
              }}
              onRemove={(id) => void patch((state) => ({
                ...state,
                giftItems: removeGiftItem(state.giftItems, id),
              }))}
              onAddBought={(personId, title, price) => {
                void patch((state) => ({
                  ...state,
                  giftItems: addGiftItem(state.giftItems, {
                    personId,
                    title,
                    price,
                    lane: "shop",
                    occasion: "just-because",
                    year: currentGiftYear(),
                    status: "bought",
                  }),
                }));
              }}
              onLogGift={(personId) => {
                setError(null);
                setLogPersonId(personId);
                setSheet("log");
              }}
              onSecret={
                user?.id
                  ? (item) => {
                      void patch((state) => {
                        const ensured = ensurePrivatePerson(state.giftPeople, user.id);
                        return {
                          ...state,
                          giftPeople: ensured.people,
                          giftItems: addGiftItem(state.giftItems, {
                            personId: ensured.person.id,
                            title: item.title,
                            notes: item.notes,
                            price: item.price,
                            forName: item.forName,
                            lane: "shop",
                            occasion: item.occasion,
                            year: item.year,
                          }),
                        };
                      });
                    }
                  : undefined
              }
            />
          ) : (
          <>
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              padding: 4,
              borderRadius: 16,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            {(
              [
                ["people", "People"],
                ["wishes", "Wishes"],
                ...(look.prefs.hideLedger ? [] : [["book", "Gift book"] as const]),
              ] as const
            ).map(([id, label]) => {
              const on = tab === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setTab(id)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    borderRadius: 12,
                    paddingVertical: 10,
                    backgroundColor: on ? T.ribbon : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 15,
                      fontWeight: "700",
                      color: on ? T.paper : T.muted,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === "people" ? (
            <View style={{ marginTop: 18, gap: 18 }}>
              <PersonGroup
                kicker="The two of you"
                people={groups.us}
                items={data.giftItems}
                onOpen={(id) => router.push(`/hub/gifts/${id}` as Href)}
              />
              <PersonGroup
                kicker="Kids"
                people={groups.kids}
                items={data.giftItems}
                empty="Add the kids so Christmas and birthdays have a list."
                onOpen={(id) => router.push(`/hub/gifts/${id}` as Href)}
                onRemove={setRemoveId}
              />
              <PersonGroup
                kicker="Everyone else"
                people={groups.rest}
                items={data.giftItems}
                empty="Parents, friends, the people you always shop late for."
                onOpen={(id) => router.push(`/hub/gifts/${id}` as Href)}
                onRemove={setRemoveId}
              />
              <Pressable
                onPress={async () => {
                  let nextId = "";
                  await patch((state) => {
                    const ensured = ensureOtherPerson(state.giftPeople);
                    nextId = ensured.person.id;
                    return { ...state, giftPeople: ensured.people };
                  });
                  if (nextId) router.push(`/hub/gifts/${nextId}` as Href);
                }}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: T.gold,
                  backgroundColor: T.goldSoft,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 18 }}>🎁</Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: 16,
                    color: T.ink,
                    fontWeight: "700",
                  }}
                >
                  {OTHER_LIST_NAME}
                </Text>
              </Pressable>
              <PersonGroup
                kicker="Secret list"
                people={groups.privateLists.slice(0, 1)}
                items={data.giftItems}
                empty="One list your partner can’t see. Steal a wish here so it doesn’t spoil."
                onOpen={(id) => router.push(`/hub/gifts/${id}` as Href)}
              />
              <Pressable
                onPress={async () => {
                  if (!user?.id) return;
                  let nextId = "";
                  await patch((state) => {
                    const ensured = ensurePrivatePerson(state.giftPeople, user.id);
                    nextId = ensured.person.id;
                    return { ...state, giftPeople: ensured.people };
                  });
                  if (nextId) router.push(`/hub/gifts/${nextId}` as Href);
                }}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: T.gold,
                  backgroundColor: T.goldSoft,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="lock-closed-outline" size={18} color={T.gold} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: 16,
                    color: T.ink,
                    fontWeight: "700",
                  }}
                >
                  {groups.privateLists.length ? "Open secret list" : "Open secret list"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setError(null);
                  setSheet("person");
                }}
                style={{
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  borderColor: T.gold,
                  backgroundColor: T.goldSoft,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Ionicons name="person-add-outline" size={20} color={T.gold} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: 17,
                    color: T.ink,
                    fontWeight: "700",
                  }}
                >
                  Add a person
                </Text>
              </Pressable>
            </View>
          ) : null}

          {tab === "wishes" ? (
            <View style={{ marginTop: 18, gap: 12 }}>
              {groups.us.map((person) => (
                <WishCard
                  key={person.id}
                  person={person}
                  items={data.giftItems}
                  onOpen={() => router.push(`/hub/gifts/${person.id}` as Href)}
                />
              ))}
              {data.giftPeople
                .filter((row) => !row.slot && (!row.hidden || row.ownerUserId === user?.id))
                .map((person) =>
                  wishCount(data.giftItems, person.id) === 0 ? null : (
                    <WishCard
                      key={person.id}
                      person={person}
                      items={data.giftItems}
                      onOpen={() => router.push(`/hub/gifts/${person.id}` as Href)}
                    />
                  )
                )}
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: SERIF,
                  fontSize: 14,
                  lineHeight: 20,
                  color: T.dim,
                }}
              >
                Open a person to add what they want. Their wish list is the
                cheat sheet when you are actually shopping.
              </Text>
            </View>
          ) : null}

          {tab === "book" ? (
            <View style={{ marginTop: 18 }}>
              <ScrollYears years={years} selected={ledgerYear} onChange={setLedgerYear} />
              {givenThisYear.length === 0 ? (
                <View
                  style={{
                    marginTop: 16,
                    borderRadius: 18,
                    backgroundColor: T.paper,
                    padding: 18,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 18,
                      color: T.paperInk,
                    }}
                  >
                    Nothing logged for {ledgerYear} yet.
                  </Text>
                  <Text
                    style={{
                      marginTop: 6,
                      fontFamily: SERIF,
                      fontSize: 14,
                      lineHeight: 20,
                      color: T.paperMuted,
                    }}
                  >
                    Give a bought present and pick the occasion, or log a gift
                    from a past Christmas, birthday, or anniversary.
                  </Text>
                </View>
              ) : (
                <View style={{ marginTop: 14, gap: 16 }}>
                  {ledgerGroups.map((group) => (
                    <View key={group.occasion}>
                      <Text
                        style={{
                          fontFamily: "SpaceMono",
                          fontSize: 11,
                          letterSpacing: 1.6,
                          textTransform: "uppercase",
                          color: T.gold,
                          marginBottom: 8,
                        }}
                      >
                        {occasionMeta(group.occasion).label}
                      </Text>
                      <View
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          backgroundColor: T.paper,
                        }}
                      >
                        {group.rows.map((row, index) => {
                          const person = personById(data.giftPeople, row.personId);
                          return (
                            <View
                              key={row.id}
                              style={{
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                borderTopWidth: index === 0 ? 0 : 1,
                                borderTopColor: "rgba(42,28,18,0.1)",
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: SERIF,
                                  fontSize: 16,
                                  color: T.paperInk,
                                }}
                              >
                                {person
                                  ? `${person.emoji} ${nameOf(person)}`
                                  : "Someone"}
                              </Text>
                              <Text
                                style={{
                                  marginTop: 2,
                                  fontFamily: SERIF,
                                  fontSize: 15,
                                  color: T.paperInk,
                                }}
                              >
                                {row.title}
                              </Text>
                              <Text
                                style={{
                                  marginTop: 3,
                                  fontSize: 12,
                                  color: T.paperMuted,
                                }}
                              >
                                {formatGiftDate(row.dateKey, row.year)}
                                {row.from ? ` · from ${row.from}` : ""}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
              )}
              <Pressable
                onPress={() => {
                  setError(null);
                  setLogPersonId(groups.us[1]?.id ?? groups.us[0]?.id ?? null);
                  setSheet("log");
                }}
                style={{
                  marginTop: 18,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: T.gold,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#1A1408", fontWeight: "800" }}>
                  Log a gift
                </Text>
              </Pressable>
            </View>
          ) : null}
          </>
          )}
        </Stage>
      </Screen>

      {sheet === "person" ? (
        <SheetOverlay
          kicker="NEW"
          title="Add a person"
          onClose={resetPerson}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Mia, Mum, Sam…"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Who they are</Text>
          <View style={{ marginTop: 8, gap: 8 }}>
            {GIFT_KIND_OPTIONS.map((opt) => {
              const on = kind === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setKind(opt.id);
                    setEmoji(opt.emoji);
                  }}
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: on ? T.gold : T.border,
                    backgroundColor: on ? T.goldSoft : T.surface,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{opt.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.ink, fontWeight: "700", fontSize: 15 }}>
                      {opt.label}
                    </Text>
                    <Text style={{ marginTop: 2, color: T.muted, fontSize: 12 }}>
                      {opt.hint}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text style={[label, { marginTop: 14 }]}>Sticker</Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {PERSON_EMOJIS.map((item) => {
              const on = emoji === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setEmoji(item)}
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: on ? T.gold : T.surface,
                    borderWidth: 1,
                    borderColor: on ? T.gold : T.border,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          {error ? (
            <Text style={{ marginTop: 12, color: T.ribbon, fontFamily: SERIF }}>
              {error}
            </Text>
          ) : null}
          <Pressable
            onPress={() => void savePerson()}
            style={{
              marginTop: 18,
              height: 52,
              borderRadius: 26,
              backgroundColor: T.gold,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#1A1408", fontWeight: "800" }}>Save person</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      {sheet === "log" ? (
        <SheetOverlay
          kicker="GIFT BOOK"
          title="Log a gift"
          onClose={resetLog}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={label}>Who got it</Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {visibleGiftPeople(data.giftPeople, user?.id).map((person) => {
              const on = logPersonId === person.id;
              return (
                <Pressable
                  key={person.id}
                  onPress={() => setLogPersonId(person.id)}
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: on ? T.gold : T.surface,
                    borderWidth: 1,
                    borderColor: on ? T.gold : T.border,
                  }}
                >
                  <Text
                    style={{
                      color: on ? "#1A1408" : T.ink,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {person.emoji} {nameOf(person)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[label, { marginTop: 14 }]}>The gift</Text>
          <TextInput
            value={logTitle}
            onChangeText={setLogTitle}
            placeholder="Red bottle of wine, Lego set…"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>From</Text>
          <TextInput
            value={logFrom}
            onChangeText={setLogFrom}
            placeholder="Us, Grandma, Santa…"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Occasion</Text>
          <OccasionChips value={logOccasion} onChange={setLogOccasion} />
          <Text style={[label, { marginTop: 14 }]}>Year</Text>
          <YearChips value={logYear} onChange={setLogYear} />
          <CalendarDateField
            label="When"
            value={logDate}
            onChange={setLogDate}
            ink={T.ink}
            muted={T.muted}
            accent={T.gold}
            background={T.surface}
          />
          {error ? (
            <Text style={{ marginTop: 12, color: T.ribbon, fontFamily: SERIF }}>
              {error}
            </Text>
          ) : null}
          <Pressable
            onPress={() => void saveLog()}
            style={{
              marginTop: 18,
              height: 52,
              borderRadius: 26,
              backgroundColor: T.gold,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#1A1408", fontWeight: "800" }}>Save to gift book</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      {sheet === "give" && giveItem ? (
        <SheetOverlay
          kicker="GIVE"
          title={`Give ${giveItem.title}`}
          onClose={() => {
            setSheet(null);
            setGiveItem(null);
            setError(null);
          }}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 22, color: T.muted }}>
            Pick the occasion. It lands in their gift book.
          </Text>
          <Text style={[label, { marginTop: 16 }]}>Occasion</Text>
          <OccasionChips value={giveOccasion} onChange={setGiveOccasion} />
          <Text style={[label, { marginTop: 14 }]}>From</Text>
          <TextInput
            value={giveFrom}
            onChangeText={setGiveFrom}
            placeholder="Us, Grandma, Santa…"
            placeholderTextColor={T.dim}
            style={field}
          />
          <CalendarDateField
            label="When they got it"
            value={giveDate}
            onChange={setGiveDate}
            ink={T.ink}
            muted={T.muted}
            accent={T.gold}
            background={T.surface}
          />
          {look.prefs.hideCosts ? null : (
            <>
              <Text style={[label, { marginTop: 14 }]}>Price</Text>
              <View style={{ marginTop: 8, alignSelf: "flex-start" }}>
                <PriceBox
                  value={givePrice}
                  onChangeText={setGivePrice}
                  editable
                />
              </View>
            </>
          )}
          {error ? (
            <Text style={{ marginTop: 12, color: T.ribbon, fontFamily: SERIF }}>
              {error}
            </Text>
          ) : null}
          <Pressable
            onPress={() => {
              const item = giveItem;
              if (!item) return;
              const year = giveDate
                ? Number(giveDate.slice(0, 4))
                : currentGiftYear();
              void patch((state) => ({
                ...state,
                giftItems: markGiftGiven(state.giftItems, item.id, {
                  dateKey: giveDate || null,
                  year,
                  from: giveFrom,
                  occasion: giveOccasion,
                  price: givePrice,
                }),
              }));
              setLedgerYear(year);
              setSheet(null);
              setGiveItem(null);
            }}
            style={{
              marginTop: 18,
              height: 52,
              borderRadius: 26,
              backgroundColor: T.gold,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#1A1408", fontWeight: "800" }}>
              Save to gift book
            </Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        title={removing ? `Remove ${removing.name}?` : "Remove"}
        body="Their wish list, shopping list, and gift book go with them."
        confirmLabel="Remove"
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}

function ClassicPad({
  people,
  other,
  secret,
  items,
  selectedId,
  onSelect,
  onAddPerson,
  onRemovePerson,
  canRemovePerson,
  onOpenSecret,
  onOpenOther,
  onAdd,
  onBuy,
  onGive,
  onRemove,
  onEdit,
  onMove,
  onSecret,
  onAddBought,
  onLogGift,
  hideCosts,
}: {
  people: ReturnType<typeof visibleGiftPeople>;
  other: ReturnType<typeof otherListFor>;
  secret: ReturnType<typeof secretListForUser>;
  items: GiftItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddPerson: () => void;
  onRemovePerson?: (id: string) => void;
  canRemovePerson?: (person: GiftPerson) => boolean;
  onOpenSecret: () => void;
  onOpenOther: () => void;
  onAdd: (personId: string, title: string, price?: string, forName?: string) => void;
  onBuy: (item: GiftItem) => void;
  onGive: (item: GiftItem) => void;
  onRemove: (id: string) => void;
  onEdit?: (item: GiftItem, next: { title: string; price: string; forName?: string }) => void;
  onMove?: (item: GiftItem, personId: string) => void;
  onSecret?: (item: GiftItem) => void;
  onAddBought?: (personId: string, title: string, price?: string) => void;
  onLogGift?: (personId: string) => void;
  hideCosts?: boolean;
}) {
  const nameOf = useGiftPersonName();
  const catalog = [...people, other, secret].filter(
    (row): row is NonNullable<typeof row> => Boolean(row)
  );
  const selected =
    catalog.find((row) => row.id === selectedId) ??
    (selectedId ? null : people[0] ?? other ?? secret ?? null);
  const otherOn = Boolean(other && selected?.id === other.id);
  const rows = selected ? allOpenItems(items, selected.id) : [];
  const bought = selected ? boughtItems(items, selected.id) : [];
  const given = selected ? givenItems(items, selected.id) : [];
  const steal =
    selected && selected.slot === "them" && !selected.hidden ? onSecret : undefined;
  const secretOn = Boolean(secret && selected?.id === secret.id);

  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {people.map((person) => {
          const on = selected?.id === person.id;
          const removable = Boolean(canRemovePerson?.(person) && onRemovePerson);
          return (
            <Pressable
              key={person.id}
              onPress={() => onSelect(person.id)}
              onLongPress={removable ? () => onRemovePerson?.(person.id) : undefined}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 7,
                backgroundColor: on ? T.gold : T.surface,
                borderWidth: 1,
                borderColor: on ? T.gold : T.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  color: on ? "#1A1408" : T.ink,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {person.emoji} {nameOf(person)}
              </Text>
              {removable ? (
                <Pressable
                  onPress={() => onRemovePerson?.(person.id)}
                  hitSlop={8}
                  accessibilityLabel={`Remove ${nameOf(person)}`}
                >
                  <Ionicons name="close" size={14} color={on ? "#1A1408" : T.muted} />
                </Pressable>
              ) : null}
            </Pressable>
          );
        })}
        <Pressable
          onPress={onOpenOther}
          style={{
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7,
            backgroundColor: otherOn ? T.gold : T.surface,
            borderWidth: 1,
            borderColor: otherOn ? T.gold : T.border,
          }}
        >
          <Text
            style={{
              color: otherOn ? "#1A1408" : T.ink,
              fontWeight: "700",
              fontSize: 13,
            }}
          >
            🎁 {OTHER_LIST_NAME}
          </Text>
        </Pressable>
        <Pressable
          onPress={onOpenSecret}
          style={{
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7,
            backgroundColor: secretOn ? T.gold : T.goldSoft,
            borderWidth: 1,
            borderColor: T.gold,
          }}
        >
          <Text
            style={{
              color: secretOn ? "#1A1408" : T.gold,
              fontWeight: "800",
              fontSize: 13,
            }}
          >
            🔒 {SECRET_LIST_NAME}
          </Text>
        </Pressable>
        <Pressable
          onPress={onAddPerson}
          style={{
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: T.gold,
          }}
        >
          <Text style={{ color: T.gold, fontWeight: "800", fontSize: 13 }}>+ Person</Text>
        </Pressable>
      </View>
      {selected ? (
        <>
        <Text
          style={{
            marginTop: 14,
            fontFamily: SERIF,
            fontSize: 18,
            fontWeight: "700",
            color: T.ink,
          }}
        >
          {otherOn
            ? "Other · one-off gifts"
            : selected.hidden
              ? SECRET_LIST_NAME
              : `${nameOf(selected)}’s list`}
        </Text>
        <GiftNotepad
          key={selected.id}
          items={rows}
          oneOff={otherOn}
          empty={
            selected.hidden
              ? "Write what you’re getting them. Partner can’t see this list."
              : otherOn
                ? "Name on the left, present on the right. For one-off gifts."
                : `Write on ${selected.name}’s list. Tick the box when you’ve bought it.`
          }
          onAdd={(title, price, forName) => onAdd(selected.id, title, price, forName)}
          onToggle={onBuy}
          onRemove={onRemove}
          onEdit={onEdit}
          onMove={onMove}
          onSecret={steal}
          hideCosts={hideCosts}
          people={people.map((person) => ({ id: person.id, name: nameOf(person) }))}
        />
        <BoughtList
          items={bought}
          onGive={onGive}
          onRemove={onRemove}
          onEdit={onEdit}
          hideCosts={hideCosts}
          onAdd={
            selected && onAddBought
              ? (title, price) => onAddBought(selected.id, title, price)
              : undefined
          }
        />
        <GiftBookList
          items={given}
          hideCosts={hideCosts}
          onLog={selected && onLogGift ? () => onLogGift(selected.id) : undefined}
        />
        </>
      ) : (
        <Text style={{ marginTop: 16, fontFamily: SERIF, color: T.muted }}>
          {people.length || other || secret
            ? "Pick a person to write on their list."
            : "Add someone to start a list."}
        </Text>
      )}
    </View>
  );
}

function PersonGroup({
  kicker,
  people,
  items,
  empty,
  onOpen,
  onRemove,
}: {
  kicker: string;
  people: ReturnType<typeof groupedPeople>["us"];
  items: import("@/lib/gifts").GiftItem[];
  empty?: string;
  onOpen: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const nameOf = useGiftPersonName();
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: T.gold,
          marginBottom: 8,
        }}
      >
        {kicker}
      </Text>
      {people.length === 0 ? (
        <Text style={{ fontFamily: SERIF, fontSize: 14, color: T.dim, lineHeight: 20 }}>
          {empty}
        </Text>
      ) : (
        <View style={{ gap: 4 }}>
          {people.map((person) => {
            const shop = shopCount(items, person.id);
            const wishes = wishCount(items, person.id);
            return (
              <Pressable
                key={person.id}
                onPress={() => onOpen(person.id)}
                onLongPress={
                  person.slot || !onRemove ? undefined : () => onRemove(person.id)
                }
                style={{
                  borderRadius: 8,
                  backgroundColor: T.paper,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 36,
                }}
              >
                <Text style={{ fontSize: 18, width: 24, textAlign: "center" }}>
                  {person.emoji}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 15,
                      color: T.paperInk,
                      fontWeight: "700",
                    }}
                    numberOfLines={1}
                  >
                    {nameOf(person)}
                    {person.hidden ? "  · secret" : ""}
                  </Text>
                  <Text style={{ fontSize: 11, color: T.paperMuted }} numberOfLines={1}>
                    {kindLabel(person.kind)}
                    {wishes ? ` · ${wishes} wish${wishes === 1 ? "" : "es"}` : ""}
                    {shop ? ` · ${shop} to get` : ""}
                    {!wishes && !shop ? " · empty" : ""}
                  </Text>
                </View>
                {person.slot || !onRemove ? (
                  <Ionicons name="chevron-forward" size={16} color={T.ribbon} />
                ) : (
                  <Pressable
                    onPress={() => onRemove(person.id)}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${nameOf(person)}`}
                  >
                    <Ionicons name="trash-outline" size={16} color={T.ribbon} />
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function WishCard({
  person,
  items,
  onOpen,
}: {
  person: import("@/lib/gifts").GiftPerson;
  items: import("@/lib/gifts").GiftItem[];
  onOpen: () => void;
}) {
  const nameOf = useGiftPersonName();
  const wishes = items.filter(
    (row) => row.personId === person.id && row.lane === "wish" && row.status === "open"
  );
  const heading =
    person.slot === "you"
      ? `${nameOf(person)} wants`
      : person.slot === "them"
        ? `${nameOf(person)} wants`
        : `${nameOf(person)}’s list`;
  return (
    <Pressable
      onPress={onOpen}
      style={{
        borderRadius: 12,
        backgroundColor: T.paper,
        paddingVertical: 10,
        paddingHorizontal: 12,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
          color: T.ribbon,
        }}
      >
        {person.emoji} WISH LIST
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 22,
          color: T.paperInk,
        }}
      >
        {heading}
      </Text>
      {wishes.length === 0 ? (
        <Text style={{ marginTop: 8, color: T.paperMuted, fontFamily: SERIF }}>
          Nothing on it yet. Tap to add ideas.
        </Text>
      ) : (
        <View style={{ marginTop: 10, gap: 6 }}>
          {wishes.slice(0, 4).map((row) => (
            <Text
              key={row.id}
              style={{ fontFamily: SERIF, fontSize: 15, color: T.paperInk }}
            >
              · {row.title}
            </Text>
          ))}
          {wishes.length > 4 ? (
            <Text style={{ color: T.paperMuted, fontSize: 13 }}>
              +{wishes.length - 4} more
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function YearChips({
  value,
  onChange,
}: {
  value: number;
  onChange: (year: number) => void;
}) {
  const years = giftYearChoices();
  return (
    <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {years.map((year) => {
        const on = year === value;
        return (
          <Pressable
            key={year}
            onPress={() => onChange(year)}
            style={{
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: on ? T.gold : T.surface,
              borderWidth: 1,
              borderColor: on ? T.gold : T.border,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 13,
                color: on ? "#1A1408" : T.ink,
              }}
            >
              {year}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ScrollYears({
  years,
  selected,
  onChange,
}: {
  years: number[];
  selected: number;
  onChange: (year: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {years.map((year) => {
        const on = year === selected;
        return (
          <Pressable
            key={year}
            onPress={() => onChange(year)}
            style={{
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: on ? T.gold : T.surface,
              borderWidth: 1,
              borderColor: on ? T.gold : T.border,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                color: on ? "#1A1408" : T.ink,
                fontSize: 13,
              }}
            >
              {year}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OccasionChips({
  value,
  onChange,
}: {
  value: GiftOccasionId;
  onChange: (id: GiftOccasionId) => void;
}) {
  return (
    <View
      style={{
        marginTop: 8,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {GIFT_OCCASIONS.map((opt) => {
        const on = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={{
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: on ? T.ribbon : T.surface,
            }}
          >
            <Text
              style={{
                color: on ? T.paper : T.ink,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {opt.short}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const label = {
  fontFamily: "SpaceMono" as const,
  fontSize: 11,
  letterSpacing: 1.4,
  color: T.muted,
};

const field = {
  marginTop: 8,
  height: 48,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: T.border,
  backgroundColor: T.surface,
  paddingHorizontal: 14,
  color: T.ink,
  fontFamily: SERIF,
  fontSize: 16,
};
