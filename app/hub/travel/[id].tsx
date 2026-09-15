import { Stage } from "@/components/hub/Stage";
import { ClockTimeField, formatClockLabel } from "@/components/ui/ClockTimeField";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { sectionAccent } from "@/lib/hub-theme";
import { createId } from "@/lib/ids";
import { money, parseMoney } from "@/lib/money";
import { useMiniApps } from "@/lib/mini-apps";
import type {
  Trip,
  TripBooking,
  TripBookingKind,
  TripDay,
  TripPlanItem,
} from "@/lib/mini-content";
import { BOOKING_KINDS, emptyTripDay, sortPlanItems, tripDayCount, tripPlanCost, tripSummary } from "@/lib/trips";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

const BG = "#0C1218";
const PAPER = "#E8EEF4";
const MUTED = "rgba(232,238,244,0.55)";
const CARD = "#15202B";
const inkBlue = () => sectionAccent("home-base", "#3D8BDB");

type Tab = "days" | "bookings" | "pack";

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, patch } = useMiniApps();
  const trip = data.trips.find((row) => row.id === id) ?? null;

  const [tab, setTab] = useState<Tab>("days");
  const [dayId, setDayId] = useState<string | null>(null);
  const [itemOpen, setItemOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [packText, setPackText] = useState("");
  const [notes, setNotes] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [itemTitle, setItemTitle] = useState("");
  const [itemDetail, setItemDetail] = useState("");
  const [itemTime, setItemTime] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [itemUrl, setItemUrl] = useState("");

  const [bookTitle, setBookTitle] = useState("");
  const [bookKind, setBookKind] = useState<TripBookingKind>("stay");
  const [bookUrl, setBookUrl] = useState("");
  const [bookNote, setBookNote] = useState("");
  const [bookCost, setBookCost] = useState("");
  const [bookFileUri, setBookFileUri] = useState("");
  const [bookFileName, setBookFileName] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);

  const activeDay = useMemo(() => {
    if (!trip) return null;
    return trip.days.find((day) => day.id === dayId) ?? trip.days[0] ?? null;
  }, [trip, dayId]);

  const dayItems = useMemo(
    () => (activeDay ? sortPlanItems(activeDay.items) : []),
    [activeDay]
  );

  const total = trip ? tripPlanCost(trip) : 0;

  const keepScroll = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: scrollY.current, animated: false });
    });
  };

  const onMainScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  };

  const update = async (fn: (current: Trip) => Trip) => {
    if (!trip) return;
    await patch((state) => ({
      ...state,
      trips: state.trips.map((row) => (row.id === trip.id ? fn(row) : row)),
    }));
  };

  if (!trip) {
    return (
      <Screen scroll background={BG}>
        <Stage background={BG} fallback={"/hub/travel" as Href} accent={inkBlue()}>
          <Text style={{ fontFamily: SERIF, fontSize: 28, color: PAPER }}>
            Trip not found
          </Text>
          <Pressable onPress={() => router.replace("/hub/travel" as Href)}>
            <Text style={{ marginTop: 12, color: inkBlue() }}>Back to trip plans</Text>
          </Pressable>
        </Stage>
      </Screen>
    );
  }

  const addDay = async () => {
    const next = emptyTripDay(trip.days.length + 1);
    await update((current) => ({ ...current, days: [...current.days, next] }));
    setDayId(next.id);
  };

  const saveItem = async () => {
    if (!activeDay) return;
    if (!itemTitle.trim()) {
      setError("Name what you’re doing.");
      return;
    }
    const item: TripPlanItem = {
      id: createId(),
      title: itemTitle.trim(),
      detail: itemDetail.trim(),
      time: itemTime.trim(),
      cost: parseMoney(itemCost) ?? 0,
      done: false,
      url: itemUrl.trim(),
    };
    await update((current) => ({
      ...current,
      days: current.days.map((day) =>
        day.id === activeDay.id
          ? { ...day, items: sortPlanItems([...day.items, item]) }
          : day
      ),
    }));
    setItemOpen(false);
    setItemTitle("");
    setItemDetail("");
    setItemTime("");
    setItemCost("");
    setItemUrl("");
    setError(null);
    keepScroll();
  };

  const pickFile = () => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      setError("Paste a ticket link below — file upload is on web for now.");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 1_500_000) {
        setError("Keep uploads under about 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setBookFileUri(typeof reader.result === "string" ? reader.result : "");
        setBookFileName(file.name);
        setError(null);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const saveBooking = async () => {
    if (!bookTitle.trim()) {
      setError("Name the booking or ticket.");
      return;
    }
    const booking: TripBooking = {
      id: createId(),
      kind: bookKind,
      title: bookTitle.trim(),
      url: bookUrl.trim(),
      note: bookNote.trim(),
      cost: parseMoney(bookCost) ?? 0,
      dayDate: activeDay?.date ?? "",
      fileUri: bookFileUri,
      fileName: bookFileName,
    };
    await update((current) => ({
      ...current,
      bookings: [booking, ...current.bookings],
    }));
    setBookingOpen(false);
    setBookTitle("");
    setBookUrl("");
    setBookNote("");
    setBookCost("");
    setBookFileUri("");
    setBookFileName("");
    setBookKind("stay");
    setError(null);
  };

  return (
    <Screen background={BG}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={onMainScroll}
        scrollEventThrottle={16}
      >
      <Stage background={BG} fallback={"/hub/travel" as Href} accent={inkBlue()}>
        <Text style={{ fontFamily: "SpaceMono", fontSize: 11, color: MUTED }}>
          TRIP PLAN · TIMES IN ORDER
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: SERIF,
            fontSize: 32,
            color: PAPER,
            letterSpacing: -0.4,
          }}
        >
          {trip.title}
        </Text>
        <Text style={{ marginTop: 4, color: MUTED, lineHeight: 20 }}>
          {tripSummary(trip)}
        </Text>

        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Pill text={`${tripDayCount(trip)} days`} />
          <Pill text={`Est. ${money(total)}`} />
          <Pill text={`${trip.bookings.length} bookings`} />
        </View>

        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            gap: 6,
            backgroundColor: CARD,
            borderRadius: 14,
            padding: 4,
          }}
        >
          {(
            [
              ["days", "Days"],
              ["bookings", "Stays & tickets"],
              ["pack", "Pack"],
            ] as const
          ).map(([key, label]) => {
            const on = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 11,
                  backgroundColor: on ? inkBlue() : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: on ? "#071018" : MUTED,
                    fontWeight: "700",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "days" ? (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {trip.days.map((day, index) => {
                const on = (activeDay?.id ?? trip.days[0]?.id) === day.id;
                return (
                  <Pressable
                    key={day.id}
                    onPress={() => setDayId(day.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: on ? inkBlue() : CARD,
                    }}
                  >
                    <Text
                      style={{
                        color: on ? "#071018" : PAPER,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {day.date ? day.date.slice(5) : `D${index + 1}`}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => void addDay()}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: inkBlue(),
                }}
              >
                <Text style={{ color: inkBlue(), fontWeight: "700", fontSize: 12 }}>
                  + Day
                </Text>
              </Pressable>
            </View>

            {activeDay ? (
              <View
                style={{
                  marginTop: 14,
                  backgroundColor: CARD,
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 22, color: PAPER }}>
                  {activeDay.title}
                </Text>
                {activeDay.date ? (
                  <Text style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
                    {activeDay.date}
                  </Text>
                ) : null}

                {activeDay.items.length === 0 ? (
                  <Text
                    style={{
                      marginTop: 14,
                      fontFamily: HANDWRITING,
                      fontSize: 18,
                      color: MUTED,
                    }}
                  >
                    Nothing planned yet. Add a meal, museum, hike, nap…
                  </Text>
                ) : (
                  <View style={{ marginTop: 12, gap: 4 }}>
                    {dayItems.map((item) => (
                      <DayItemRow
                        key={item.id}
                        item={item}
                        onToggle={() => {
                          void update((current) => ({
                            ...current,
                            days: current.days.map((day) =>
                              day.id !== activeDay.id
                                ? day
                                : {
                                    ...day,
                                    items: day.items.map((row) =>
                                      row.id === item.id
                                        ? { ...row, done: !row.done }
                                        : row
                                    ),
                                  }
                            ),
                          }));
                          keepScroll();
                        }}
                        onRemove={() => {
                          void update((current) => ({
                            ...current,
                            days: current.days.map((day) =>
                              day.id !== activeDay.id
                                ? day
                                : {
                                    ...day,
                                    items: day.items.filter((row) => row.id !== item.id),
                                  }
                            ),
                          }));
                          keepScroll();
                        }}
                      />
                    ))}
                  </View>
                )}

                <Pressable
                  onPress={() => {
                    setError(null);
                    if (!itemTime) setItemTime("12:00 PM");
                    setItemOpen(true);
                  }}
                  style={{
                    marginTop: 14,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: inkBlue(),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#071018", fontWeight: "800" }}>
                    Add to this day
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View
              style={{
                marginTop: 16,
                backgroundColor: CARD,
                borderRadius: 18,
                padding: 14,
              }}
            >
              <Text style={{ fontFamily: "SpaceMono", fontSize: 10, color: MUTED }}>
                TRIP NOTES
              </Text>
              <TextInput
                value={notes ?? trip.notes}
                onChangeText={setNotes}
                onBlur={() => {
                  if (notes == null) return;
                  void update((current) => ({ ...current, notes: notes.trim() }));
                  setNotes(null);
                }}
                placeholder="Visa reminders, meetup spots, soft plans…"
                placeholderTextColor="rgba(232,238,244,0.28)"
                multiline
                style={{
                  marginTop: 8,
                  minHeight: 80,
                  color: PAPER,
                  fontFamily: HANDWRITING,
                  fontSize: 18,
                  lineHeight: 24,
                }}
              />
            </View>
          </View>
        ) : null}

        {tab === "bookings" ? (
          <View style={{ marginTop: 16, gap: 10 }}>
            <Pressable
              onPress={() => {
                setError(null);
                setBookingOpen(true);
              }}
              style={{
                height: 48,
                borderRadius: 14,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: inkBlue(),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: inkBlue(), fontWeight: "700" }}>
                + Stay, flight, ticket…
              </Text>
            </Pressable>

            {trip.bookings.length === 0 ? (
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: HANDWRITING,
                  fontSize: 18,
                  color: MUTED,
                  textAlign: "center",
                }}
              >
                Link the Airbnb, upload boarding passes, stash museum tickets.
              </Text>
            ) : (
              trip.bookings.map((row) => (
                <BookingCard
                  key={row.id}
                  booking={row}
                  onRemove={() =>
                    void update((current) => ({
                      ...current,
                      bookings: current.bookings.filter((item) => item.id !== row.id),
                    }))
                  }
                />
              ))
            )}
          </View>
        ) : null}

        {tab === "pack" ? (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={packText}
                onChangeText={setPackText}
                placeholder="Add to packing list"
                placeholderTextColor="rgba(232,238,244,0.28)"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: CARD,
                  color: PAPER,
                }}
              />
              <Pressable
                onPress={() => {
                  if (!packText.trim()) return;
                  void update((current) => ({
                    ...current,
                    packing: [
                      ...current.packing,
                      { id: createId(), label: packText.trim(), packed: false },
                    ],
                  }));
                  setPackText("");
                  keepScroll();
                }}
                style={{
                  width: 48,
                  borderRadius: 12,
                  backgroundColor: inkBlue(),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={22} color="#071018" />
              </Pressable>
            </View>
            <View style={{ marginTop: 12, gap: 6 }}>
              {trip.packing.map((row) => (
                <Pressable
                  key={row.id}
                  onPress={() =>
                    void update((current) => ({
                      ...current,
                      packing: current.packing.map((item) =>
                        item.id === row.id ? { ...item, packed: !item.packed } : item
                      ),
                    }))
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: CARD,
                  }}
                >
                  <Ionicons
                    name={row.packed ? "checkbox" : "square-outline"}
                    size={20}
                    color={row.packed ? inkBlue() : MUTED}
                  />
                  <Text
                    style={{
                      flex: 1,
                      color: PAPER,
                      textDecorationLine: row.packed ? "line-through" : "none",
                    }}
                  >
                    {row.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={() => {
            void patch((state) => ({
              ...state,
              trips: state.trips.filter((row) => row.id !== trip.id),
            }));
            router.replace("/hub/travel" as Href);
          }}
          style={{ marginTop: 28 }}
        >
          <Text style={{ textAlign: "center", color: "#FF8A8A", fontSize: 13 }}>
            Delete this trip plan
          </Text>
        </Pressable>
      </Stage>
      </ScrollView>

      {itemOpen && activeDay ? (
        <SheetOverlay
          kicker="DAY PLAN"
          title={`Add to ${activeDay.title}`}
          onClose={() => setItemOpen(false)}
          background={CARD}
          ink={PAPER}
          muted={MUTED}
        >
          <Field label="What" value={itemTitle} onChangeText={setItemTitle} placeholder="Ramen crawl" />
          <ClockTimeField
            label="Time"
            value={itemTime}
            onChange={setItemTime}
            ink={PAPER}
            muted={MUTED}
            accent={inkBlue()}
            background="#0F1822"
          />
          <Field label="Details" value={itemDetail} onChangeText={setItemDetail} placeholder="Booked under Alex" />
          <Field label="Link" value={itemUrl} onChangeText={setItemUrl} placeholder="https://…" />
          <Field
            label="Est. cost"
            value={itemCost}
            onChangeText={setItemCost}
            placeholder="40"
            keyboardType="decimal-pad"
          />
          {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          <Primary label="Save to day" onPress={() => void saveItem()} />
        </SheetOverlay>
      ) : null}

      {bookingOpen ? (
        <SheetOverlay
          kicker="BOOKING"
          title="Stay, flight, or ticket"
          onClose={() => setBookingOpen(false)}
          background={CARD}
          ink={PAPER}
          muted={MUTED}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {BOOKING_KINDS.map((row) => {
              const on = bookKind === row.id;
              return (
                <Pressable
                  key={row.id}
                  onPress={() => setBookKind(row.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: on ? inkBlue() : "#0F1822",
                  }}
                >
                  <Text
                    style={{
                      color: on ? "#071018" : PAPER,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {row.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Field
            label="Title"
            value={bookTitle}
            onChangeText={setBookTitle}
            placeholder="Airbnb near the canal"
          />
          <Field
            label="Link"
            value={bookUrl}
            onChangeText={setBookUrl}
            placeholder="https://booking…"
          />
          <Field
            label="Note"
            value={bookNote}
            onChangeText={setBookNote}
            placeholder="Check-in 3pm · code 4821"
          />
          <Field
            label="Est. cost"
            value={bookCost}
            onChangeText={setBookCost}
            placeholder="620"
            keyboardType="decimal-pad"
          />
          <Pressable
            onPress={pickFile}
            style={{
              marginTop: 12,
              height: 46,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(61,139,219,0.45)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: inkBlue(), fontWeight: "700" }}>
              {bookFileName ? `Attached · ${bookFileName}` : "Upload ticket / photo"}
            </Text>
          </Pressable>
          {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          <Primary label="Save booking" onPress={() => void saveBooking()} />
        </SheetOverlay>
      ) : null}
    </Screen>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(61,139,219,0.16)",
      }}
    >
      <Text style={{ color: inkBlue(), fontSize: 12, fontWeight: "700" }}>{text}</Text>
    </View>
  );
}

function DayItemRow({
  item,
  onToggle,
  onRemove,
}: {
  item: TripPlanItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(232,238,244,0.08)",
      }}
    >
      <Pressable onPress={onToggle}>
        <Ionicons
          name={item.done ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={item.done ? inkBlue() : MUTED}
        />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: PAPER,
            fontSize: 16,
            fontWeight: "600",
            textDecorationLine: item.done ? "line-through" : "none",
          }}
        >
          {item.time ? `${formatClockLabel(item.time)} · ` : ""}
          {item.title}
        </Text>
        {item.detail ? (
          <Text style={{ marginTop: 2, color: MUTED, fontSize: 13 }}>{item.detail}</Text>
        ) : null}
        <View style={{ marginTop: 4, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {item.cost > 0 ? (
            <Text style={{ color: inkBlue(), fontSize: 12 }}>{money(item.cost)}</Text>
          ) : null}
          {item.url ? (
            <Pressable onPress={() => void Linking.openURL(item.url)}>
              <Text style={{ color: inkBlue(), fontSize: 12 }}>Open link</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onRemove}>
            <Text style={{ color: "#FF8A8A", fontSize: 12 }}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function BookingCard({
  booking,
  onRemove,
}: {
  booking: TripBooking;
  onRemove: () => void;
}) {
  const meta = BOOKING_KINDS.find((item) => item.id === booking.kind);
  return (
    <View style={{ backgroundColor: CARD, borderRadius: 16, padding: 14 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "rgba(61,139,219,0.18)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={(meta?.icon as keyof typeof Ionicons.glyphMap) ?? "link"}
            size={18}
            color={inkBlue()}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: PAPER, fontWeight: "700", fontSize: 16 }}>
            {booking.title}
          </Text>
          <Text style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
            {meta?.label ?? "Booking"}
            {booking.dayDate ? ` · ${booking.dayDate}` : ""}
            {booking.cost > 0 ? ` · ${money(booking.cost)}` : ""}
          </Text>
          {booking.note ? (
            <Text style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
              {booking.note}
            </Text>
          ) : null}
          <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {booking.url ? (
              <Pressable onPress={() => void Linking.openURL(booking.url)}>
                <Text style={{ color: inkBlue(), fontSize: 13 }}>Open link</Text>
              </Pressable>
            ) : null}
            {booking.fileUri ? (
              <Pressable onPress={() => void Linking.openURL(booking.fileUri)}>
                <Text style={{ color: inkBlue(), fontSize: 13 }}>
                  {booking.fileName || "Open file"}
                </Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onRemove}>
              <Text style={{ color: "#FF8A8A", fontSize: 13 }}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "decimal-pad";
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.2,
          color: MUTED,
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(232,238,244,0.28)"
        keyboardType={keyboardType}
        style={{
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: "#0F1822",
          color: PAPER,
          fontSize: 16,
        }}
      />
    </View>
  );
}

function Primary({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: 16,
        height: 52,
        borderRadius: 26,
        backgroundColor: inkBlue(),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#071018", fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}
