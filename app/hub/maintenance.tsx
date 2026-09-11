import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#10120C";
const OLIVE = "#A3B17A";

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

  const mark = async (id: string) => {
    await patch((state) => ({
      ...state,
      maintenance: state.maintenance.map((row) =>
        row.id === id ? { ...row, lastDone: today } : row
      ),
    }));
  };

  const add = async () => {
    const n = Number(days);
    if (!label.trim() || !Number.isFinite(n) || n < 1) return;
    await patch((state) => ({
      ...state,
      maintenance: [
        ...state.maintenance,
        {
          id: createId(),
          label: label.trim(),
          everyDays: n,
          lastDone: null,
        },
      ],
    }));
    setLabel("");
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={OLIVE}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · toolkit"
        title="Household maintenance"
        body="The unsexy calendar that keeps the house from quietly failing. Filters, batteries, the plant you keep apologizing to."
        ready={ready}
      >
        <View style={{ marginTop: 16, gap: 10 }}>
          {sorted.map((row) => {
            const late = overdue(row.lastDone, row.everyDays);
            const due = dueOn(row.lastDone, row.everyDays);
            return (
              <Pressable
                key={row.id}
                onPress={() => void mark(row.id)}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: late ? "rgba(255,77,106,0.12)" : "#181C14",
                  borderWidth: 1,
                  borderColor: late ? "rgba(255,77,106,0.4)" : "rgba(163,177,122,0.25)",
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={late ? "warning" : "construct"}
                  size={20}
                  color={late ? "#FF6B6B" : OLIVE}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: SERIF, fontSize: 18, color: "#F4F4F6" }}>
                    {row.label}
                  </Text>
                  <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 12 }}>
                    Every {row.everyDays}d · due {due}
                    {row.lastDone ? ` · last ${row.lastDone}` : " · never done"}
                  </Text>
                </View>
                <Text style={{ color: OLIVE, fontSize: 12 }}>done</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="New repeating task"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={{ flex: 1, borderRadius: 12, padding: 12, backgroundColor: "#181C14", color: "#F4F4F6" }}
          />
          <TextInput
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
            style={{
              width: 64,
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#181C14",
              color: "#F4F4F6",
            }}
          />
          <Pressable onPress={() => void add()} style={{ justifyContent: "center" }}>
            <Text style={{ color: OLIVE, fontWeight: "700" }}>Add</Text>
          </Pressable>
        </View>
      </MiniChrome>
    </Screen>
  );
}
