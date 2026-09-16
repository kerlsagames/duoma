import { LookPanel, PrefSection } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { hexAlpha, inkOnAccent } from "@/lib/color-paint";
import { sectionAccent } from "@/lib/hub-theme";
import { localDateKey } from "@/lib/dates";
import { createId } from "@/lib/ids";
import {
  dueLabel,
  dueOn,
  isOverdue,
  sortMaintTasks,
  unusedSuggestions,
} from "@/lib/maintenance";
import { useMiniApps } from "@/lib/mini-apps";
import type { MaintTask } from "@/lib/mini-content";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#2A2418";
const fallbackPeg = () => sectionAccent("home-base", "#C4A574");
const PAPER = "#F3E2C0";
const INK = "#2A1C10";

export default function MaintenanceScreen() {
  const { data, ready, patch } = useMiniApps();
  const look = useAppLook("maintenance", fallbackPeg(), {});
  const tint = look.accent;
  const muted = hexAlpha(tint, 0.72);
  const wash = (alpha: number) => hexAlpha(tint, alpha);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("30");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const today = localDateKey();
  const prefs = data.maintPrefs;
  const sorted = useMemo(
    () => sortMaintTasks(data.maintenance, prefs.sort, today),
    [data.maintenance, prefs.sort, today]
  );
  const ideas = useMemo(() => unusedSuggestions(data.maintenance), [data.maintenance]);
  const removeRow = data.maintenance.find((row) => row.id === removeId) ?? null;

  const markDone = (id: string) => {
    void patch((state) => ({
      ...state,
      maintenance: state.maintenance.map((item) =>
        item.id === id ? { ...item, lastDone: today } : item
      ),
    }));
  };

  const addTask = (nextLabel: string, everyDays: number) => {
    const name = nextLabel.trim();
    if (!name || everyDays < 1) return;
    void patch((state) => {
      if (state.maintenance.some((row) => row.label.toLowerCase() === name.toLowerCase())) {
        return state;
      }
      return {
        ...state,
        maintenance: [
          ...state.maintenance,
          { id: createId(), label: name, everyDays, lastDone: null },
        ],
      };
    });
  };

  const removeTask = (id: string) => {
    void patch((state) => ({
      ...state,
      maintenance: state.maintenance.filter((item) => item.id !== id),
    }));
    setRemoveId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Screen scroll background={BG}>
        <Stage
          background={BG}
          fallback={"/hub/home-base" as Href}
          accent={tint}
          settingsLabel="Maintenance"
          settings={
            <LookPanel look={look} ink={PAPER} muted={muted}>
              <PrefSection label="View" hint="How the jobs hang." ink={PAPER} muted={muted}>
                <Choice
                  label="List"
                  hint="Due soon first. Tick the box."
                  on={prefs.view === "list"}
                  onPress={() =>
                    void patch((state) => ({
                      ...state,
                      maintPrefs: { ...state.maintPrefs, view: "list" },
                    }))
                  }
                  accent={tint}
                />
                <Choice
                  label="Pegboard"
                  hint="The old tags on the board."
                  on={prefs.view === "pegboard"}
                  onPress={() =>
                    void patch((state) => ({
                      ...state,
                      maintPrefs: { ...state.maintPrefs, view: "pegboard" },
                    }))
                  }
                  accent={tint}
                />
              </PrefSection>
              <PrefSection label="Sort" hint="Order of the jobs." ink={PAPER} muted={muted}>
                <Choice
                  label="Due soon"
                  hint="Closest due date at the top."
                  on={prefs.sort === "due"}
                  onPress={() =>
                    void patch((state) => ({
                      ...state,
                      maintPrefs: { ...state.maintPrefs, sort: "due" },
                    }))
                  }
                  accent={tint}
                />
                <Choice
                  label="Overdue first"
                  hint="Late jobs jump the queue."
                  on={prefs.sort === "overdue"}
                  onPress={() =>
                    void patch((state) => ({
                      ...state,
                      maintPrefs: { ...state.maintPrefs, sort: "overdue" },
                    }))
                  }
                  accent={tint}
                />
                <Choice
                  label="A–Z"
                  hint="Alphabetical."
                  on={prefs.sort === "name"}
                  onPress={() =>
                    void patch((state) => ({
                      ...state,
                      maintPrefs: { ...state.maintPrefs, sort: "name" },
                    }))
                  }
                  accent={tint}
                />
              </PrefSection>
              <PrefSection
                label="Suggestions"
                hint="Tap one to hang it on your list."
                ink={PAPER}
                muted={muted}
              >
                {ideas.length === 0 ? (
                  <Text style={{ color: muted, fontFamily: HANDWRITING, fontSize: 16 }}>
                    You’ve already got the lot.
                  </Text>
                ) : (
                  ideas.map((idea) => (
                    <Pressable
                      key={idea.label}
                      onPress={() => addTask(idea.label, idea.everyDays)}
                      style={{
                        marginBottom: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: wash(0.28),
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: PAPER, fontFamily: SERIF, fontSize: 15 }}>
                          {idea.label}
                        </Text>
                        <Text style={{ marginTop: 2, color: muted, fontSize: 12 }}>
                          Every {idea.everyDays} days
                        </Text>
                      </View>
                      <Ionicons name="add" size={18} color={tint} />
                    </Pressable>
                  ))
                )}
              </PrefSection>
            </LookPanel>
          }
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              color: muted,
            }}
          >
            HOME BASE
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: SERIF,
              fontSize: 30,
              color: tint,
            }}
          >
            Maintenance
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: HANDWRITING,
              fontSize: 18,
              color: muted,
            }}
          >
            {prefs.view === "list"
              ? "Due soon at the top. Tick it when it’s done."
              : "Hang a tag. Take it down when it’s done."}
          </Text>

          {!ready ? (
            <Text style={{ marginTop: 16, color: tint }}>Finding the hammer…</Text>
          ) : sorted.length === 0 ? (
            <Text
              style={{
                marginTop: 20,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: muted,
                textAlign: "center",
              }}
            >
              Nothing hanging. Add a job or pick one from the cog.
            </Text>
          ) : prefs.view === "list" ? (
            <View style={{ marginTop: 16, gap: 8 }}>
              {sorted.map((row) => (
                <ListRow
                  key={row.id}
                  row={row}
                  today={today}
                  accent={tint}
                  muted={muted}
                  onDone={() => markDone(row.id)}
                  onRemove={() => setRemoveId(row.id)}
                />
              ))}
            </View>
          ) : (
            <Pegboard rows={sorted} today={today} accent={tint} onDone={markDone} />
          )}

          <View style={{ marginTop: 18, flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="New job"
              placeholderTextColor={wash(0.4)}
              style={{
                flex: 1,
                color: tint,
                fontFamily: HANDWRITING,
                fontSize: 18,
                borderBottomWidth: 1,
                borderBottomColor: tint,
                paddingVertical: 6,
              }}
            />
            <TextInput
              value={days}
              onChangeText={setDays}
              keyboardType="numeric"
              accessibilityLabel="Repeat every days"
              style={{
                width: 56,
                color: tint,
                borderBottomWidth: 1,
                borderBottomColor: tint,
                paddingVertical: 6,
                textAlign: "center",
              }}
            />
            <Pressable
              onPress={() => {
                const n = Number(days);
                if (!label.trim() || !Number.isFinite(n) || n < 1) return;
                addTask(label, n);
                setLabel("");
              }}
              style={{
                backgroundColor: tint,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontFamily: SERIF, color: inkOnAccent(tint, PAPER, INK) }}>
                Add
              </Text>
            </Pressable>
          </View>
          <Text style={{ marginTop: 6, color: muted, fontSize: 12 }}>
            Days between repeats
          </Text>
          <View style={{ height: 28 }} />
        </Stage>
      </Screen>

      <ConfirmDialog
        open={Boolean(removeRow)}
        title="Take this job off the list?"
        body={
          removeRow
            ? `${removeRow.label} will be gone. You can add it again later.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (removeRow) removeTask(removeRow.id);
        }}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}

function ListRow({
  row,
  today,
  accent,
  muted,
  onDone,
  onRemove,
}: {
  row: MaintTask;
  today: string;
  accent: string;
  muted: string;
  onDone: () => void;
  onRemove: () => void;
}) {
  const late = isOverdue(row.lastDone, row.everyDays, today);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: late ? "#4A2018" : "#3A3224",
        borderWidth: 1,
        borderColor: late ? "#C23B3B" : hexAlpha(accent, 0.28),
        paddingVertical: 12,
        paddingHorizontal: 12,
      }}
    >
      <Pressable
        onPress={onDone}
        accessibilityLabel={`Mark ${row.label} done`}
        style={{
          width: 28,
          height: 28,
          borderWidth: 1.5,
          borderColor: late ? "#E8A0A0" : accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {late ? null : (
          <Ionicons name="checkmark" size={16} color={accent} />
        )}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 16, color: late ? "#F6D6D0" : PAPER }}>
          {row.label}
        </Text>
        <Text
          style={{
            marginTop: 3,
            fontFamily: "SpaceMono",
            fontSize: 10,
            color: late ? "#E8A0A0" : muted,
          }}
        >
          {dueLabel(row.lastDone, row.everyDays, today)} · every {row.everyDays}d
        </Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${row.label}`}>
        <Ionicons name="close" size={18} color={muted} />
      </Pressable>
    </View>
  );
}

function Pegboard({
  rows,
  today,
  accent,
  onDone,
}: {
  rows: MaintTask[];
  today: string;
  accent: string;
  onDone: (id: string) => void;
}) {
  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: "#3A3224",
        padding: 12,
        borderWidth: 8,
        borderColor: hexAlpha(accent, 0.35),
      }}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {rows.map((row, i) => {
          const late = isOverdue(row.lastDone, row.everyDays, today);
          return (
            <Pressable
              key={row.id}
              onPress={() => onDone(row.id)}
              style={{
                width: i % 3 === 0 ? "100%" : "47%",
                minHeight: 88,
                backgroundColor: late ? "#C23B3B" : PAPER,
                padding: 10,
                transform: [{ rotate: i % 2 ? "1.5deg" : "-1.5deg" }],
                borderWidth: 1,
                borderColor: late ? "#C23B3B" : hexAlpha(accent, 0.4),
              }}
            >
              <Text
                style={{
                  fontFamily: HANDWRITING,
                  fontSize: 18,
                  color: late ? "#FFF0E8" : INK,
                }}
              >
                {row.label}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: "SpaceMono",
                  fontSize: 10,
                  color: late ? "#FFD0C8" : accent,
                }}
              >
                {dueOn(row.lastDone, row.everyDays)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Choice({
  label,
  hint,
  on,
  onPress,
  accent,
}: {
  label: string;
  hint: string;
  on: boolean;
  onPress: () => void;
  accent: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: on ? accent : hexAlpha(accent, 0.2),
        backgroundColor: on ? hexAlpha(accent, 0.14) : "transparent",
      }}
    >
      <Text style={{ color: PAPER, fontFamily: SERIF, fontSize: 16 }}>{label}</Text>
      <Text style={{ marginTop: 2, color: hexAlpha(accent, 0.72), fontSize: 12 }}>{hint}</Text>
    </Pressable>
  );
}
