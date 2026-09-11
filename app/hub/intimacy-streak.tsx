import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { INTIMACY_KINDS, type IntimacyKind } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#12080C";
const HOT = "#FF4D6A";

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateKey(d);
}

export default function IntimacyStreakScreen() {
  const { user } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<IntimacyKind>("date");
  const [note, setNote] = useState("");

  const days = useMemo(() => Array.from({ length: 70 }, (_, i) => dateOffset(69 - i)), []);
  const byDate = useMemo(() => {
    const map = new Map<string, IntimacyKind[]>();
    for (const row of data.intimacy) {
      const list = map.get(row.date) ?? [];
      list.push(row.kind);
      map.set(row.date, list);
    }
    return map;
  }, [data.intimacy]);

  const streak = useMemo(() => {
    let n = 0;
    for (let i = 0; i < 60; i += 1) {
      const key = dateOffset(i);
      if (byDate.has(key)) n += 1;
      else break;
    }
    return n;
  }, [byDate]);

  const log = async () => {
    if (!user) return;
    const today = localDateKey();
    await patch((state) => ({
      ...state,
      intimacy: [
        {
          id: createId(),
          userId: user.id,
          kind,
          note: note.trim(),
          date: today,
          createdAt: nowIso(),
        },
        ...state.intimacy,
      ],
    }));
    setNote("");
  };

  const meta = INTIMACY_KINDS.find((row) => row.id === kind)!;

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={HOT}
        fallback={"/hub/desire" as Href}
        kicker="Desire · fire"
        title="Intimacy streak"
        body="Not a score. A weather map of closeness — kisses, talks, dates, the night you didn't look at your phones."
        ready={ready}
      >
        <View
          style={{
            marginTop: 18,
            padding: 20,
            borderRadius: 24,
            backgroundColor: "#1C0C12",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255,77,106,0.35)",
          }}
        >
          <Ionicons name="flame" size={42} color={HOT} />
          <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 56, color: HOT }}>
            {streak}
          </Text>
          <Text style={{ color: "rgba(244,244,246,0.6)" }}>
            {streak === 1 ? "day alight" : "days alight"}
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: "rgba(244,244,246,0.4)",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Miss a day and the fire goes quiet — not out. Log something small.
          </Text>
        </View>

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(255,77,106,0.7)",
          }}
        >
          LAST 10 WEEKS
        </Text>
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {days.map((day) => {
            const kinds = byDate.get(day) ?? [];
            const color =
              INTIMACY_KINDS.find((row) => row.id === kinds[0])?.color ?? "rgba(255,255,255,0.08)";
            return (
              <View
                key={day}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: kinds.length ? color : "rgba(255,255,255,0.08)",
                  opacity: kinds.length ? 1 : 0.5,
                }}
              />
            );
          })}
        </View>
        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {INTIMACY_KINDS.map((row) => (
            <Text key={row.id} style={{ color: row.color, fontSize: 11 }}>
              ■ {row.label}
            </Text>
          ))}
        </View>

        <Text
          style={{
            marginTop: 24,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(255,77,106,0.7)",
          }}
        >
          LOG TODAY
        </Text>
        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {INTIMACY_KINDS.map((row) => {
            const on = row.id === kind;
            return (
              <Pressable
                key={row.id}
                onPress={() => setKind(row.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: on ? `${row.color}33` : "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: on ? row.color : "transparent",
                }}
              >
                <Text style={{ color: on ? row.color : "#F4F4F6", fontSize: 13 }}>
                  {row.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={`Optional note — why this ${meta.label.toLowerCase()} counted`}
          placeholderTextColor="rgba(244,244,246,0.3)"
          style={{
            marginTop: 10,
            borderRadius: 14,
            padding: 12,
            backgroundColor: "#1C0C12",
            color: "#F4F4F6",
          }}
        />
        <Pressable
          onPress={() => void log()}
          style={{
            marginTop: 10,
            height: 50,
            borderRadius: 16,
            backgroundColor: HOT,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A0508", fontWeight: "800" }}>Keep the fire</Text>
        </Pressable>

        <View style={{ marginTop: 20, gap: 8 }}>
          {data.intimacy.slice(0, 8).map((row) => {
            const k = INTIMACY_KINDS.find((item) => item.id === row.kind);
            return (
              <View
                key={row.id}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: "#1C0C12",
                }}
              >
                <Text style={{ color: k?.color ?? HOT, fontWeight: "700" }}>
                  {k?.label} · {row.date}
                </Text>
                {row.note ? (
                  <Text style={{ marginTop: 4, color: "rgba(244,244,246,0.6)" }}>
                    {row.note}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </MiniChrome>
    </Screen>
  );
}
