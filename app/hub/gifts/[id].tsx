import { LookPanel } from "@/components/hub/AppSettings";
import { GiftModeToggle, GiftNotepad } from "@/components/hub/GiftNotepad";
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
  allOpenItems,
  currentGiftYear,
  ensurePrivatePerson,
  formatGiftDate,
  giftYearChoices,
  GIFT_OCCASIONS,
  givenItems,
  kindLabel,
  markGiftGiven,
  occasionMeta,
  openItems,
  removeGiftItem,
  removeGiftPerson,
  type GiftItem,
  type GiftLane,
  type GiftOccasionId,
} from "@/lib/gifts";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Sheet = "add" | "give" | null;

export default function GiftPersonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useApp();
  const { data, patch } = useMiniApps();
  const person = data.giftPeople.find((row) => row.id === id) ?? null;

  const [sheet, setSheet] = useState<Sheet>(null);
  const [lane, setLane] = useState<GiftLane>("shop");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [occasion, setOccasion] = useState<GiftOccasionId>("christmas");
  const [year, setYear] = useState(currentGiftYear());
  const [giveId, setGiveId] = useState<string | null>(null);
  const [giveDate, setGiveDate] = useState(localDateKey());
  const [giveFrom, setGiveFrom] = useState("Us");
  const [error, setError] = useState<string | null>(null);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [removePerson, setRemovePerson] = useState(false);
  const look = useAppLook("gifts", T.gold, {
    hideLedger: false,
    compactPeople: true,
    classicMode: true,
  });
  const classic = look.prefs.classicMode !== false;

  const wishes = useMemo(
    () => (person ? openItems(data.giftItems, person.id, "wish") : []),
    [data.giftItems, person]
  );
  const shop = useMemo(
    () => (person ? openItems(data.giftItems, person.id, "shop") : []),
    [data.giftItems, person]
  );
  const given = useMemo(
    () => (person ? givenItems(data.giftItems, person.id) : []),
    [data.giftItems, person]
  );
  const giving = giveId
    ? data.giftItems.find((row) => row.id === giveId) ?? null
    : null;
  const removingItem = removeItemId
    ? data.giftItems.find((row) => row.id === removeItemId) ?? null
    : null;

  const resetAdd = () => {
    setSheet(null);
    setTitle("");
    setNotes("");
    setOccasion("christmas");
    setYear(currentGiftYear());
    setError(null);
  };

  const openAdd = (next: GiftLane) => {
    setLane(next);
    setOccasion(next === "wish" ? "just-because" : "christmas");
    setError(null);
    setSheet("add");
  };

  const saveItem = async () => {
    if (!person) return;
    if (!title.trim()) {
      setError("Name the gift.");
      return;
    }
    const parsedYear = year;
    if (!Number.isFinite(parsedYear) || parsedYear < 1990) {
      setError("Pick a real year.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      giftItems: addGiftItem(state.giftItems, {
        personId: person.id,
        title,
        notes,
        lane,
        occasion,
        year: parsedYear,
      }),
    }));
    resetAdd();
  };

  const saveGiven = async () => {
    if (!giveId) return;
    const parsedYear = giveDate ? Number(giveDate.slice(0, 4)) : currentGiftYear();
    await patch((state) => ({
      ...state,
      giftItems: markGiftGiven(state.giftItems, giveId, {
        dateKey: giveDate || null,
        year: parsedYear,
        from: giveFrom,
      }),
    }));
    setSheet(null);
    setGiveId(null);
  };

  const confirmRemoveItem = async () => {
    if (!removeItemId) return;
    const itemId = removeItemId;
    setRemoveItemId(null);
    await patch((state) => ({
      ...state,
      giftItems: removeGiftItem(state.giftItems, itemId),
    }));
  };

  const confirmRemovePerson = async () => {
    if (!person || person.slot) return;
    const personId = person.id;
    setRemovePerson(false);
    await patch((state) => {
      const next = removeGiftPerson(state.giftPeople, state.giftItems, personId);
      return { ...state, giftPeople: next.people, giftItems: next.items };
    });
    router.replace("/hub/gifts" as Href);
  };

  const sendToPrivate = async (item: GiftItem) => {
    if (!user?.id) return;
    await patch((state) => {
      const ensured = ensurePrivatePerson(state.giftPeople, user.id);
      return {
        ...state,
        giftPeople: ensured.people,
        giftItems: addGiftItem(state.giftItems, {
          personId: ensured.person.id,
          title: item.title,
          notes: item.notes,
          lane: "shop",
          occasion: item.occasion,
          year: item.year,
        }),
      };
    });
  };

  if (!person || (person.hidden && person.ownerUserId !== user?.id)) {
    return (
      <View style={{ flex: 1, backgroundColor: T.background }}>
        <Screen scroll background={T.background} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
          <Stage
            background={T.background}
            fallback={"/hub/gifts" as Href}
            accent={T.gold}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 24, color: T.ink }}>
              That person isn’t here.
            </Text>
            <Pressable
              onPress={() => router.replace("/hub/gifts" as Href)}
              style={{ marginTop: 16 }}
            >
              <Text style={{ color: T.gold, fontWeight: "700" }}>Back to Wishlists</Text>
            </Pressable>
          </Stage>
        </Screen>
      </View>
    );
  }

  const shopHeading =
    person.slot === "you"
      ? "Coming your way"
      : `Getting for ${person.name}`;
  const wishHeading =
    person.slot === "you" ? "Your wish list" : `${person.name}’s wish list`;

  return (
    <View style={{ flex: 1, backgroundColor: T.background }}>
      <Screen scroll background={T.background} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
        <Stage
          background={T.background}
          fallback={"/hub/gifts" as Href}
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
                  label: "Hide the year book",
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
              ]}
            />
          }
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                height: 56,
                width: 56,
                borderRadius: 18,
                backgroundColor: T.paper,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28 }}>{person.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.8,
                  color: T.gold,
                }}
              >
                {kindLabel(person.kind).toUpperCase()}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: SERIF,
                  fontSize: 32,
                  lineHeight: 36,
                  color: T.ink,
                }}
              >
                {person.name}
              </Text>
            </View>
          </View>

          <GiftModeToggle
            classic={classic}
            onChange={(value) => void look.patch({ classicMode: value })}
          />

          {classic ? (
            <GiftNotepad
              items={allOpenItems(data.giftItems, person.id)}
              empty="Write a gift. Tick the box when it’s given."
              onAdd={(title) => {
                void patch((state) => ({
                  ...state,
                  giftItems: addGiftItem(state.giftItems, {
                    personId: person.id,
                    title,
                    lane: person.slot === "you" ? "wish" : "shop",
                    occasion: "just-because",
                    year: currentGiftYear(),
                  }),
                }));
              }}
              onToggle={(item) => {
                void patch((state) => ({
                  ...state,
                  giftItems: markGiftGiven(state.giftItems, item.id, {
                    dateKey: localDateKey(),
                    year: currentGiftYear(),
                    from: person.slot === "you" ? person.name : "Us",
                  }),
                }));
              }}
              onRemove={setRemoveItemId}
              onSecret={
                person.slot === "them" && !person.hidden
                  ? (item) => void sendToPrivate(item)
                  : undefined
              }
            />
          ) : (
            <>
          <ListBlock
            kicker="Wish list"
            title={wishHeading}
            hint="Ideas they actually want. Steal from this when you shop."
            items={wishes}
            empty="No wishes yet. Add the things they keep mentioning."
            action="Add a wish"
            onAdd={() => openAdd("wish")}
            onGive={(item) => {
              setGiveId(item.id);
              setGiveFrom(person.slot === "you" ? person.name : "Us");
              setGiveDate(localDateKey());
              setSheet("give");
            }}
            onSecret={
              person.slot === "them" && !person.hidden
                ? (item) => void sendToPrivate(item)
                : undefined
            }
            onRemove={setRemoveItemId}
          />

          <ListBlock
            kicker="Shopping"
            title={shopHeading}
            hint="What you plan to wrap. Mark as given and it lands in the ledger."
            items={shop}
            empty="Nothing planned. Add a present you’re hunting down."
            action="Add a present"
            onAdd={() => openAdd("shop")}
            onGive={(item) => {
              setGiveId(item.id);
              setGiveFrom("Us");
              setGiveDate(localDateKey());
              setSheet("give");
            }}
            onRemove={setRemoveItemId}
          />
            </>
          )}

          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: T.gold,
              }}
            >
              WHAT THEY GOT
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
              fontSize: 16,
              color: T.ink,
            }}
          >
            Logged gifts
          </Text>
            {given.length === 0 ? (
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontSize: 14,
                  lineHeight: 20,
                  color: T.dim,
                }}
              >
                Christmas, birthdays, the anniversary bottle — it all collects
                here once you mark something given or log it from the ledger.
              </Text>
            ) : (
              <View
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: T.paper,
                }}
              >
                {given.map((row, index) => (
                  <View
                    key={row.id}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: "rgba(42,28,18,0.1)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      minHeight: 34,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: SERIF,
                        fontSize: 14,
                        color: T.paperInk,
                      }}
                      numberOfLines={1}
                    >
                      {row.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: T.paperMuted }} numberOfLines={1}>
                      {occasionMeta(row.occasion).short} · {formatGiftDate(row.dateKey, row.year)}
                      {row.from ? ` · ${row.from}` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {!person.slot ? (
            <Pressable
              onPress={() => setRemovePerson(true)}
              style={{ marginTop: 28, alignSelf: "flex-start" }}
            >
              <Text style={{ color: T.ribbon, fontWeight: "700" }}>
                Remove {person.name}
              </Text>
            </Pressable>
          ) : null}
        </Stage>
      </Screen>

      {sheet === "add" ? (
        <SheetOverlay
          kicker={lane === "wish" ? "WISH" : "SHOP"}
          title={lane === "wish" ? "Add a wish" : "Add a present"}
          onClose={resetAdd}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={label}>What</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              lane === "wish" ? "Noise-cancelling headphones…" : "Red bottle of wine…"
            }
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Note (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Size, colour, the shop you saw it in"
            placeholderTextColor={T.dim}
            style={[field, { height: 72, paddingTop: 12 }]}
            multiline
          />
          <Text style={[label, { marginTop: 14 }]}>Occasion</Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {GIFT_OCCASIONS.map((opt) => {
              const on = occasion === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setOccasion(opt.id)}
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
          <Text style={[label, { marginTop: 14 }]}>Year</Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {giftYearChoices().map((opt) => {
              const on = year === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setYear(opt)}
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
                    {opt}
                  </Text>
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
            onPress={() => void saveItem()}
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
              {lane === "wish" ? "Save wish" : "Save present"}
            </Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      {sheet === "give" && giving ? (
        <SheetOverlay
          kicker="GIVEN"
          title="Mark as given"
          onClose={() => {
            setSheet(null);
            setGiveId(null);
          }}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>
            {giving.title}
          </Text>
          <Text style={{ marginTop: 4, color: T.muted, fontSize: 13 }}>
            Lands in the {occasionMeta(giving.occasion).label} page of the ledger.
          </Text>
          <Text style={[label, { marginTop: 16 }]}>From</Text>
          <TextInput
            value={giveFrom}
            onChangeText={setGiveFrom}
            placeholder="Us"
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
          <Pressable
            onPress={() => void saveGiven()}
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
              Save to ledger
            </Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      <ConfirmDialog
        open={Boolean(removingItem)}
        title={removingItem ? `Remove ${removingItem.title}?` : "Remove"}
        body="It comes off this list. If it was already given, it leaves the ledger too."
        confirmLabel="Remove"
        onConfirm={() => void confirmRemoveItem()}
        onCancel={() => setRemoveItemId(null)}
      />
      <ConfirmDialog
        open={removePerson}
        title={`Remove ${person.name}?`}
        body="Their wish list, shopping list, and logged gifts go with them."
        confirmLabel="Remove"
        onConfirm={() => void confirmRemovePerson()}
        onCancel={() => setRemovePerson(false)}
      />
    </View>
  );
}

function ListBlock({
  kicker,
  title,
  hint,
  items,
  empty,
  action,
  onAdd,
  onGive,
  onSecret,
  onRemove,
}: {
  kicker: string;
  title: string;
  hint: string;
  items: GiftItem[];
  empty: string;
  action: string;
  onAdd: () => void;
  onGive: (item: GiftItem) => void;
  onSecret?: (item: GiftItem) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          color: T.gold,
        }}
      >
        {kicker.toUpperCase()}
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontFamily: SERIF,
          fontSize: 16,
          color: T.ink,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          marginTop: 1,
          fontFamily: SERIF,
          fontSize: 11,
          lineHeight: 14,
          color: T.dim,
        }}
      >
        {hint}
      </Text>
      <View
        style={{
          marginTop: 6,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: T.paper,
        }}
      >
        {items.length === 0 ? (
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              color: T.muted,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
          >
            {empty}
          </Text>
        ) : (
          items.map((item, index) => (
            <View
              key={item.id}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: "rgba(42,28,18,0.1)",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                minHeight: 34,
              }}
            >
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: 15,
                    color: T.paperInk,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11, color: T.paperMuted }} numberOfLines={1}>
                  {occasionMeta(item.occasion).short}
                </Text>
              </View>
              <Pressable onPress={() => onGive(item)} hitSlop={6}>
                <Text style={{ color: T.gold, fontWeight: "800", fontSize: 11 }}>Given</Text>
              </Pressable>
              {onSecret ? (
                <Pressable onPress={() => onSecret(item)} hitSlop={6}>
                  <Text style={{ color: T.ribbon, fontWeight: "800", fontSize: 11 }}>
                    Hide
                  </Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => onRemove(item.id)} hitSlop={6}>
                <Ionicons name="close" size={16} color={T.muted} />
              </Pressable>
            </View>
          ))
        )}
      </View>
      <Pressable
        onPress={onAdd}
        style={{
          marginTop: 8,
          borderRadius: 12,
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: T.gold,
          paddingVertical: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: T.gold, fontWeight: "800", fontSize: 13 }}>+ {action}</Text>
      </Pressable>
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
