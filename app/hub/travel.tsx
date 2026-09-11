import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#0B1018";
const BLUE = "#8FA8C8";

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
      setError("Name the trip and the place.");
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
            { id: createId(), label: "Whatever they always forget", packed: false },
          ],
        },
        ...state.trips,
      ],
    }));
  };

  const addStop = async () => {
    if (!trip || !stop.trim()) return;
    await patch((state) => ({
      ...state,
      trips: state.trips.map((row) =>
        row.id === trip.id
          ? {
              ...row,
              stops: [
                ...row.stops,
                {
                  id: createId(),
                  title: stop.trim(),
                  detail: "",
                  when: "",
                  done: false,
                },
              ],
            }
          : row
      ),
    }));
    setStop("");
  };

  const toggleStop = async (id: string) => {
    if (!trip) return;
    await patch((state) => ({
      ...state,
      trips: state.trips.map((row) =>
        row.id === trip.id
          ? {
              ...row,
              stops: row.stops.map((s) =>
                s.id === id ? { ...s, done: !s.done } : s
              ),
            }
          : row
      ),
    }));
  };

  const addPack = async () => {
    if (!trip || !pack.trim()) return;
    await patch((state) => ({
      ...state,
      trips: state.trips.map((row) =>
        row.id === trip.id
          ? {
              ...row,
              packing: [...row.packing, { id: createId(), label: pack.trim(), packed: false }],
            }
          : row
      ),
    }));
    setPack("");
  };

  const togglePack = async (id: string) => {
    if (!trip) return;
    await patch((state) => ({
      ...state,
      trips: state.trips.map((row) =>
        row.id === trip.id
          ? {
              ...row,
              packing: row.packing.map((p) =>
                p.id === id ? { ...p, packed: !p.packed } : p
              ),
            }
          : row
      ),
    }));
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={BLUE}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · boarding"
        title="Itinerary"
        body="A trip board that looks like a ticket. Stops, packing, the reservation you will otherwise lose in a screenshot pile."
        ready={ready}
      >
        {!trip ? (
          <View style={{ marginTop: 16, gap: 8 }}>
            <TextInput value={title} onChangeText={setTitle} placeholder="Trip name" placeholderTextColor="rgba(244,244,246,0.3)" style={inputStyle} />
            <TextInput value={where} onChangeText={setWhere} placeholder="Where" placeholderTextColor="rgba(244,244,246,0.3)" style={inputStyle} />
            <TextInput value={start} onChangeText={setStart} placeholder="Start (date or 'Friday')" placeholderTextColor="rgba(244,244,246,0.3)" style={inputStyle} />
            <TextInput value={end} onChangeText={setEnd} placeholder="End" placeholderTextColor="rgba(244,244,246,0.3)" style={inputStyle} />
            <Pressable
              onPress={() => void create()}
              style={{
                height: 50,
                borderRadius: 14,
                backgroundColor: BLUE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#0B1018", fontWeight: "800" }}>Issue boarding pass</Text>
            </Pressable>
            {error ? <Text style={{ color: "#FF8A8A" }}>{error}</Text> : null}
            <EmptyHint text="Start a trip. Even a Tuesday night date can have an itinerary." />
          </View>
        ) : (
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: "#E8EEF6",
              }}
            >
              <View style={{ padding: 16, backgroundColor: BLUE }}>
                <Text style={{ color: "#0B1018", fontFamily: "SpaceMono", fontSize: 11 }}>
                  BOARDING PASS
                </Text>
                <Text style={{ fontFamily: SERIF, fontSize: 28, color: "#0B1018" }}>
                  {trip.title}
                </Text>
              </View>
              <View style={{ padding: 16 }}>
                <Text style={{ color: "#1A2430", fontSize: 16 }}>{trip.where}</Text>
                <Text style={{ marginTop: 4, color: "rgba(26,36,48,0.6)" }}>
                  {trip.start}  →  {trip.end}
                </Text>
              </View>
            </View>

            <Text style={section}>STOPS</Text>
            {trip.stops.map((row) => (
              <Pressable
                key={row.id}
                onPress={() => void toggleStop(row.id)}
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#141C28",
                }}
              >
                <Text
                  style={{
                    color: "#F4F4F6",
                    textDecorationLine: row.done ? "line-through" : "none",
                  }}
                >
                  {row.done ? "✓  " : "○  "}
                  {row.title}
                </Text>
              </Pressable>
            ))}
            <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
              <TextInput
                value={stop}
                onChangeText={setStop}
                placeholder="Add a stop / reservation"
                placeholderTextColor="rgba(244,244,246,0.3)"
                style={[inputStyle, { flex: 1, marginTop: 0 }]}
              />
              <Pressable onPress={() => void addStop()} style={{ justifyContent: "center" }}>
                <Text style={{ color: BLUE }}>Add</Text>
              </Pressable>
            </View>

            <Text style={section}>PACKING</Text>
            {trip.packing.map((row) => (
              <Pressable
                key={row.id}
                onPress={() => void togglePack(row.id)}
                style={{ marginTop: 6 }}
              >
                <Text style={{ color: row.packed ? BLUE : "#F4F4F6" }}>
                  {row.packed ? "▣" : "□"}  {row.label}
                </Text>
              </Pressable>
            ))}
            <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
              <TextInput
                value={pack}
                onChangeText={setPack}
                placeholder="Don't forget…"
                placeholderTextColor="rgba(244,244,246,0.3)"
                style={[inputStyle, { flex: 1, marginTop: 0 }]}
              />
              <Pressable onPress={() => void addPack()} style={{ justifyContent: "center" }}>
                <Text style={{ color: BLUE }}>Add</Text>
              </Pressable>
            </View>
          </View>
        )}
      </MiniChrome>
    </Screen>
  );
}

const inputStyle = {
  marginTop: 0,
  borderRadius: 12,
  padding: 12,
  backgroundColor: "#141C28",
  color: "#F4F4F6",
} as const;

const section = {
  marginTop: 22,
  fontFamily: "SpaceMono" as const,
  fontSize: 11,
  letterSpacing: 2,
  color: BLUE,
};
