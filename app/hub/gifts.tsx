import { Stage } from "@/components/hub/Stage";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CalendarDateField } from "@/components/ui/CalendarDateField";
import { Screen } from "@/components/ui/Screen";
import { GIFTS_TONE as T, SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import {
  addGiftItem,
  addGiftPerson,
  currentGiftYear,
  ensureCouplePeople,
  formatGiftDate,
  GIFT_KIND_OPTIONS,
  GIFT_OCCASIONS,
  givenItems,
  groupedPeople,
  groupGivenByOccasion,
  kindLabel,
  occasionMeta,
  PERSON_EMOJIS,
  personById,
  removeGiftPerson,
  shopCount,
  wishCount,
  yearsInLedger,
  type GiftOccasionId,
  type GiftPersonKind,
} from "@/lib/gifts";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Tab = "people" | "wishes" | "ledger";
type Sheet = "person" | "log" | null;

export default function GiftsScreen() {
  const router = useRouter();
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [tab, setTab] = useState<Tab>("people");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Exclude<GiftPersonKind, "you" | "them">>("child");
  const [emoji, setEmoji] = useState("🧸");
  const [logPersonId, setLogPersonId] = useState<string | null>(null);
  const [logTitle, setLogTitle] = useState("");
  const [logFrom, setLogFrom] = useState("Us");
  const [logOccasion, setLogOccasion] = useState<GiftOccasionId>("christmas");
  const [logYear, setLogYear] = useState(String(currentGiftYear()));
  const [logDate, setLogDate] = useState(localDateKey());
  const [error, setError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [ledgerYear, setLedgerYear] = useState(currentGiftYear());

  useEffect(() => {
    if (!ready) return;
    const next = ensureCouplePeople(
      data.giftPeople,
      user?.displayName ?? "You",
      partner?.displayName ?? "Them"
    );
    if (next === data.giftPeople) return;
    void patch((state) => ({ ...state, giftPeople: next }));
  }, [ready, data.giftPeople, user?.displayName, partner?.displayName, patch]);

  const groups = useMemo(() => groupedPeople(data.giftPeople), [data.giftPeople]);
  const years = useMemo(
    () => yearsInLedger(data.giftItems, currentGiftYear()),
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
    setLogYear(String(currentGiftYear()));
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
      giftPeople: addGiftPerson(state.giftPeople, { name, kind, emoji }),
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
    const year = Number(logYear);
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
    setTab("ledger");
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
      <Screen scroll background={T.background}>
        <Stage
          background={T.background}
          fallback={"/hub/home-base" as Href}
          accent={T.gold}
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
            Home Base · Gifts
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
            Who we’re shopping for
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 22,
              color: T.muted,
            }}
          >
            Wish lists for the two of you. Lists for kids, family, friends. A
            book of what they actually got — Christmas, birthdays, the
            anniversary wine.
          </Text>

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
                ["ledger", "Ledger"],
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
                .filter((row) => !row.slot)
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

          {tab === "ledger" ? (
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
                    Mark a present as given on someone’s list, or log a gift
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
                                  ? `${person.emoji} ${person.name}`
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
          kicker="LEDGER"
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
            {data.giftPeople.map((person) => {
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
                    {person.emoji} {person.name}
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
          <TextInput
            value={logYear}
            onChangeText={setLogYear}
            keyboardType="number-pad"
            placeholder="2026"
            placeholderTextColor={T.dim}
            style={field}
          />
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
            <Text style={{ color: "#1A1408", fontWeight: "800" }}>Save to ledger</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        title={removing ? `Remove ${removing.name}?` : "Remove"}
        body="Their wish list, shopping list, and logged gifts go with them."
        confirmLabel="Remove"
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveId(null)}
      />
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
        <View style={{ gap: 10 }}>
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
                  borderRadius: 18,
                  backgroundColor: T.paper,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    height: 48,
                    width: 48,
                    borderRadius: 16,
                    backgroundColor: T.tag,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{person.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 18,
                      color: T.paperInk,
                      fontWeight: "700",
                    }}
                  >
                    {person.name}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: T.paperMuted }}>
                    {kindLabel(person.kind)}
                    {wishes ? ` · ${wishes} wish${wishes === 1 ? "" : "es"}` : ""}
                    {shop ? ` · ${shop} to get` : ""}
                    {!wishes && !shop ? " · lists are empty" : ""}
                  </Text>
                </View>
                {person.slot || !onRemove ? (
                  <Ionicons name="chevron-forward" size={18} color={T.ribbon} />
                ) : (
                  <Pressable
                    onPress={() => onRemove(person.id)}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${person.name}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={T.ribbon} />
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
  const wishes = items.filter(
    (row) => row.personId === person.id && row.lane === "wish" && row.status === "open"
  );
  const heading =
    person.slot === "you"
      ? `${person.name} wants`
      : person.slot === "them"
        ? `${person.name} wants`
        : `${person.name}’s list`;
  return (
    <Pressable
      onPress={onOpen}
      style={{
        borderRadius: 18,
        backgroundColor: T.paper,
        padding: 16,
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
