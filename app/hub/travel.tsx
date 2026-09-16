import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { CalendarDateField } from "@/components/ui/CalendarDateField";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF, TRAVEL_TONE as T } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { hexAlpha, inkOnAccent } from "@/lib/color-paint";
import { money } from "@/lib/money";
import { useMiniApps } from "@/lib/mini-apps";
import { createTrip, todayKey, tripPlanCost, tripSummary } from "@/lib/trips";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const BG = T.background;
const PAPER = T.ink;
const MUTED = T.muted;
const CARD = T.surface;
const fallbackAccent = () => T.foil;

export default function TravelScreen() {
  const router = useRouter();
  const { data, ready, patch } = useMiniApps();
  const [compose, setCompose] = useState(false);
  const look = useAppLook("travel", fallbackAccent(), {
    hideCosts: false,
    compact: false,
  });
  const tint = look.accent;
  const wash = (alpha: number) => hexAlpha(tint, alpha);
  const [title, setTitle] = useState("");
  const [where, setWhere] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trips = useMemo(
    () =>
      [...data.trips].sort((a, b) =>
        (b.createdAt || b.start || "").localeCompare(a.createdAt || a.start || "")
      ),
    [data.trips]
  );

  const create = async () => {
    if (!title.trim()) {
      setError("Give the trip a name.");
      return;
    }
    setError(null);
    const trip = createTrip({
      title,
      where,
      start,
      end,
    });
    await patch((state) => ({
      ...state,
      trips: [trip, ...state.trips],
    }));
    setCompose(false);
    setTitle("");
    setWhere("");
    setStart("");
    setEnd("");
    router.push(`/hub/travel/${trip.id}` as Href);
  };

  return (
    <Screen background={BG} density={look.prefs.density} typeface={look.prefs.typeface} accent={look.accent}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
      <Stage
        background={BG}
        fallback={"/hub/home-base" as Href}
        accent={tint}
        settingsLabel="Travel"
        settings={
          <LookPanel
            look={look}
            ink={PAPER}
            muted={MUTED}
            toggles={[
              {
                key: "hideCosts",
                label: "Hide trip costs",
                hint: "Itinerary without the money line.",
              },
              {
                key: "compact",
                label: "Compact trip cards",
                hint: "Less air between the plans.",
              },
            ]}
          />
        }
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 3,
            color: T.foil,
          }}
        >
          PASSPORT
        </Text>
        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 34,
            color: tint,
            letterSpacing: -0.5,
            marginTop: 4,
          }}
        >
          Trips
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: MUTED,
          }}
        >
          Stamps, boarding passes, the days you picked. Costs hide if you want.
        </Text>

        <Pressable
          onPress={() => {
            setError(null);
            if (!start) setStart(todayKey());
            if (!end) setEnd(todayKey());
            setCompose(true);
          }}
          style={{
            marginTop: 22,
            height: 56,
            borderRadius: 18,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: tint,
            backgroundColor: wash(0.12),
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Ionicons name="add" size={22} color={tint} />
          <Text style={{ color: tint, fontWeight: "800", fontSize: 16 }}>
            Add trip plan
          </Text>
        </Pressable>

        <View style={{ marginTop: 18, gap: 10 }}>
          {!ready ? (
            <Text style={{ color: MUTED }}>Loading trips…</Text>
          ) : trips.length === 0 ? (
            <Text
              style={{
                marginTop: 12,
                textAlign: "center",
                color: MUTED,
                fontFamily: HANDWRITING,
                fontSize: 18,
              }}
            >
              No trips yet. Start one and keep everything inside it.
            </Text>
          ) : (
            trips.map((trip) => {
              const cost = tripPlanCost(trip);
              return (
                <Pressable
                  key={trip.id}
                  onPress={() => router.push(`/hub/travel/${trip.id}` as Href)}
                  style={{
                    backgroundColor: CARD,
                    borderRadius: 18,
                    padding: look.prefs.compact ? 12 : 16,
                    borderWidth: 1,
                    borderColor: wash(0.28),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: wash(0.18),
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="airplane" size={20} color={tint} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: SERIF,
                          fontSize: look.prefs.compact ? 20 : 22,
                          color: PAPER,
                        }}
                      >
                        {trip.title}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          color: MUTED,
                          fontSize: 13,
                          lineHeight: 18,
                        }}
                      >
                        {tripSummary(trip)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={MUTED} />
                  </View>
                  {cost > 0 && !look.prefs.hideCosts ? (
                    <Text
                      style={{
                        marginTop: 10,
                        fontFamily: "SpaceMono",
                        fontSize: 12,
                        color: tint,
                      }}
                    >
                      Est. {money(cost)}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </View>
      </Stage>
      </ScrollView>

      {compose ? (
        <SheetOverlay
          kicker="NEW TRIP"
          title="Add trip plan"
          onClose={() => setCompose(false)}
          background={CARD}
          ink={PAPER}
          muted={MUTED}
        >
          <Field
            label="Trip name"
            value={title}
            onChangeText={setTitle}
            placeholder="Anniversary in Kyoto"
            accent={tint}
          />
          <Field
            label="Where"
            value={where}
            onChangeText={setWhere}
            placeholder="City, region, or road trip"
            accent={tint}
          />
          <CalendarDateField
            label="Starts"
            value={start}
            onChange={(value) => {
              setStart(value);
              if (end && value && value > end) setEnd(value);
            }}
            ink={PAPER}
            muted={MUTED}
            accent={tint}
            background="#0F1822"
          />
          <CalendarDateField
            label="Ends"
            value={end}
            onChange={(value) => {
              setEnd(value);
              if (start && value && value < start) setStart(value);
            }}
            ink={PAPER}
            muted={MUTED}
            accent={tint}
            background="#0F1822"
          />
          <Text style={{ marginTop: 6, color: MUTED, fontSize: 12, lineHeight: 17 }}>
            Tap a day on the month. Clear either date if it is still TBD —
            you can always add day pages later.
          </Text>
          {error ? (
            <Text style={{ marginTop: 10, color: "#FF8A8A" }}>{error}</Text>
          ) : null}
          <Pressable
            onPress={() => void create()}
            style={{
              marginTop: 16,
              height: 52,
              borderRadius: 26,
              backgroundColor: tint,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: inkOnAccent(tint), fontWeight: "800" }}>Create trip</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  accent,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accent: string;
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
        style={{
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: "#0F1822",
          color: PAPER,
          fontSize: 16,
          borderWidth: 1,
          borderColor: hexAlpha(accent, 0.28),
        }}
      />
    </View>
  );
}
