import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { PackItem, Trip, TripStop } from "@/lib/mini-content";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#101820";
const BLUE = "#1E4D8C";
const PAPER = "#F3EFE4";

export default function TravelScreen() {
  const { data, ready, patch } = useMiniApps();
  const [title, setTitle] = useState("Weekend escape");
  const [where, setWhere] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stop, setStop] = useState("");
  const [pack, setPack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const trip = data.trips[0] ?? null;

  const create = async () => {
    if (!title.trim() || !where.trim()) {
      setError("A ticket needs a name and a destination.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      trips: [
        {
          id: createId(),
          title: title.trim(),
          where: where.trim(),
          start: start.trim() || "TBD",
          end: end.trim() || "TBD",
          stops: [],
          packing: [
            { id: createId(), label: "Chargers", packed: false },
            { id: createId(), label: "The good snacks", packed: false },
            { id: createId(), label: "Whatever they forget", packed: false },
          ],
        },
        ...state.trips,
      ],
    }));
  };

  const mutateTrip = async (fn: (current: Trip) => Trip) => {
    if (!trip) return;
    await patch((state) => ({
      ...state,
      trips: state.trips.map((row) => (row.id === trip.id ? fn(row) : row)),
    }));
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent="#D7E4F2">
        {!trip ? (
          <View>
            <Text style={{ fontFamily: SERIF, fontSize: 32, color: "#D7E4F2" }}>
              Issue a ticket
            </Text>
            <Text style={{ fontFamily: HANDWRITING, fontSize: 18, color: "rgba(215,228,242,0.6)" }}>
              even a Tuesday can have a gate
            </Text>
            {[
              [title, setTitle, "flight name"],
              [where, setWhere, "destination"],
              [start, setStart, "departs"],
              [end, setEnd, "returns"],
            ].map(([val, set, ph], i) => (
              <TextInput
                key={i}
                value={val as string}
                onChangeText={set as (t: string) => void}
                placeholder={ph as string}
                placeholderTextColor="rgba(215,228,242,0.3)"
                style={field}
              />
            ))}
            <Pressable
              onPress={() => void create()}
              style={{ marginTop: 14, height: 50, backgroundColor: BLUE, justifyContent: "center" }}
            >
              <Text style={{ textAlign: "center", color: PAPER, fontWeight: "800" }}>
                Print boarding pass
              </Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          </View>
        ) : (
          <View>
            <View style={{ backgroundColor: PAPER, overflow: "hidden" }}>
              <View style={{ backgroundColor: BLUE, padding: 14 }}>
                <Text style={{ color: PAPER, fontFamily: "SpaceMono", fontSize: 10 }}>
                  BOARDING PASS · DUOMA AIR
                </Text>
                <Text style={{ fontFamily: SERIF, fontSize: 28, color: PAPER }}>{trip.title}</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 14,
                  borderStyle: "dashed",
                  borderBottomWidth: 2,
                  borderColor: BLUE,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "SpaceMono", fontSize: 10, color: BLUE }}>TO</Text>
                  <Text style={{ fontFamily: SERIF, fontSize: 22, color: "#1A2430" }}>
                    {trip.where}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontFamily: "SpaceMono", fontSize: 10, color: BLUE }}>
                    {trip.start} → {trip.end}
                  </Text>
                  <Text style={{ fontFamily: HANDWRITING, fontSize: 18, color: "#1A2430" }}>
                    gate whenever
                  </Text>
                </View>
              </View>
              <View style={{ padding: 14 }}>
                <Text style={{ fontFamily: "SpaceMono", fontSize: 10, color: BLUE }}>ITINERARY</Text>
                {trip.stops.map((row) => (
                  <Pressable key={row.id} onPress={() => void mutateTrip((t) => ({
                    ...t,
                    stops: t.stops.map((s: TripStop) =>
                      s.id === row.id ? { ...s, done: !s.done } : s
                    ),
                  }))}>
                    <Text
                      style={{
                        fontFamily: HANDWRITING,
                        fontSize: 18,
                        color: "#1A2430",
                        textDecorationLine: row.done ? "line-through" : "none",
                      }}
                    >
                      {row.done ? "☑" : "☐"} {row.title}
                    </Text>
                  </Pressable>
                ))}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TextInput
                    value={stop}
                    onChangeText={setStop}
                    placeholder="add a stop"
                    style={{ flex: 1, fontFamily: HANDWRITING, fontSize: 16, color: "#1A2430" }}
                  />
                  <Pressable
                    onPress={() => {
                      if (!stop.trim()) return;
                      void mutateTrip((t) => ({
                        ...t,
                        stops: [
                          ...t.stops,
                          { id: createId(), title: stop.trim(), detail: "", when: "", done: false },
                        ],
                      }));
                      setStop("");
                    }}
                  >
                    <Text style={{ color: BLUE }}>add</Text>
                  </Pressable>
                </View>
                <Text style={{ marginTop: 14, fontFamily: "SpaceMono", fontSize: 10, color: BLUE }}>
                  PACKING
                </Text>
                {trip.packing.map((row) => (
                  <Pressable
                    key={row.id}
                    onPress={() =>
                      void mutateTrip((t) => ({
                        ...t,
                        packing: t.packing.map((p: PackItem) =>
                          p.id === row.id ? { ...p, packed: !p.packed } : p
                        ),
                      }))
                    }
                  >
                    <Text style={{ color: row.packed ? BLUE : "#1A2430" }}>
                      {row.packed ? "▣" : "□"} {row.label}
                    </Text>
                  </Pressable>
                ))}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TextInput
                    value={pack}
                    onChangeText={setPack}
                    placeholder="don’t forget"
                    style={{ flex: 1, fontFamily: HANDWRITING, fontSize: 16, color: "#1A2430" }}
                  />
                  <Pressable
                    onPress={() => {
                      if (!pack.trim()) return;
                      void mutateTrip((t) => ({
                        ...t,
                        packing: [...t.packing, { id: createId(), label: pack.trim(), packed: false }],
                      }));
                      setPack("");
                    }}
                  >
                    <Text style={{ color: BLUE }}>add</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
        {!ready ? <Text style={{ color: "#D7E4F2" }}>Stamping passports…</Text> : null}
      </Stage>
    </Screen>
  );
}

const field = {
  marginTop: 10,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(215,228,242,0.3)",
  color: "#D7E4F2",
  fontFamily: HANDWRITING,
  fontSize: 20,
  paddingVertical: 6,
} as const;
