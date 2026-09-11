import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#2A2418";
const PEG = "#C4A574";

function dueOn(lastDone: string | null, everyDays: number): string {
  const start = lastDone ?? localDateKey(new Date(Date.now() - everyDays * 86400000));
  const [y, m, d] = start.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setDate(date.getDate() + everyDays);
  return localDateKey(date);
}

function overdue(lastDone: string | null, everyDays: number): boolean {
  return dueOn(lastDone, everyDays) <= localDateKey();
}

export default function MaintenanceScreen() {
  const { data, ready, patch } = useMiniApps();
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("30");
  const today = localDateKey();
  const sorted = useMemo(
    () =>
      [...data.maintenance].sort((a, b) =>
        dueOn(a.lastDone, a.everyDays).localeCompare(dueOn(b.lastDone, b.everyDays))
      ),
    [data.maintenance]
  );

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent={PEG}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 32,
            color: PEG,
          }}
        >
          Pegboard
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 18,
            color: "rgba(196,165,116,0.7)",
          }}
        >
          hang a tag. take it down when it’s done.
        </Text>
        <View
          style={{
            marginTop: 16,
            backgroundColor: "#3A3224",
            padding: 12,
            borderWidth: 8,
            borderColor: "#4A3E2A",
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {sorted.map((row, i) => {
              const late = overdue(row.lastDone, row.everyDays);
              const due = dueOn(row.lastDone, row.everyDays);
              return (
                <Pressable
                  key={row.id}
                  onPress={() =>
                    void patch((state) => ({
                      ...state,
                      maintenance: state.maintenance.map((item) =>
                        item.id === row.id ? { ...item, lastDone: today } : item
                      ),
                    }))
                  }
                  style={{
                    width: i % 3 === 0 ? "100%" : "47%",
                    minHeight: 88,
                    backgroundColor: late ? "#C23B3B" : "#F3E2C0",
                    padding: 10,
                    transform: [{ rotate: i % 2 ? "1.5deg" : "-1.5deg" }],
                  }}
                >
                  <Text
                    style={{
                      fontFamily: HANDWRITING,
                      fontSize: 18,
                      color: late ? "#FFF0E8" : "#2A1C10",
                    }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: "SpaceMono",
                      fontSize: 10,
                      color: late ? "#FFD0C8" : "#6A4A28",
                    }}
                  >
                    due {due}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="new tag"
            placeholderTextColor="rgba(196,165,116,0.35)"
            style={{ flex: 1, color: PEG, fontFamily: HANDWRITING, fontSize: 18, borderBottomWidth: 1, borderBottomColor: PEG }}
          />
          <TextInput
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
            style={{ width: 50, color: PEG, borderBottomWidth: 1, borderBottomColor: PEG }}
          />
          <Pressable
            onPress={() => {
              const n = Number(days);
              if (!label.trim() || !Number.isFinite(n) || n < 1) return;
              void patch((state) => ({
                ...state,
                maintenance: [
                  ...state.maintenance,
                  { id: createId(), label: label.trim(), everyDays: n, lastDone: null },
                ],
              }));
              setLabel("");
            }}
          >
            <Text style={{ color: PEG }}>hang</Text>
          </Pressable>
        </View>
        {!ready ? <Text style={{ color: PEG }}>Finding the hammer…</Text> : null}
      </Stage>
    </Screen>
  );
}
