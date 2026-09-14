import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { createId } from "@/lib/ids";
import {
  dueLabel,
  dueOn,
  isOverdue,
  sortMaintTasks,
  unusedSuggestions,
  type MaintSort,
  type MaintView,
} from "@/lib/maintenance";
import { useMiniApps } from "@/lib/mini-apps";
import type { MaintTask } from "@/lib/mini-content";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const BG = "#2A2418";
const PEG = "#C4A574";
const PAPER = "#F3E2C0";
const INK = "#2A1C10";
const MUTED = "rgba(196,165,116,0.7)";

export default function MaintenanceScreen() {
  const { data, ready, patch } = useMiniApps();
  const [label, setLabel] = useState("");
  const [days, setDays] = useState("30");
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        <Stage background={BG} fallback={"/hub/home-base" as Href} accent={PEG}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 2,
                  color: MUTED,
                }}
              >
                HOME BASE
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: SERIF,
                  fontSize: 30,
                  color: PEG,
                }}
              >
                Maintenance
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: HANDWRITING,
                  fontSize: 18,
                  color: MUTED,
                }}
              >
                {prefs.view === "list"
                  ? "Due soon at the top. Tick it when it’s done."
                  : "Hang a tag. Take it down when it’s done."}
              </Text>
            </View>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              accessibilityLabel="Maintenance settings"
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(196,165,116,0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="settings-outline" size={20} color={PEG} />
            </Pressable>
          </View>

          {!ready ? (
            <Text style={{ marginTop: 16, color: PEG }}>Finding the hammer…</Text>
          ) : sorted.length === 0 ? (
            <Text
              style={{
                marginTop: 20,
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: MUTED,
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
                  onDone={() => markDone(row.id)}
                  onRemove={() => setRemoveId(row.id)}
                />
              ))}
            </View>
          ) : (
            <Pegboard rows={sorted} today={today} onDone={markDone} />
          )}

          <View style={{ marginTop: 18, flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="New job"
              placeholderTextColor="rgba(196,165,116,0.35)"
              style={{
                flex: 1,
                color: PEG,
                fontFamily: HANDWRITING,
                fontSize: 18,
                borderBottomWidth: 1,
                borderBottomColor: PEG,
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
                color: PEG,
                borderBottomWidth: 1,
                borderBottomColor: PEG,
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
                backgroundColor: PAPER,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontFamily: SERIF, color: INK }}>Add</Text>
            </Pressable>
          </View>
          <Text style={{ marginTop: 6, color: MUTED, fontSize: 12 }}>
            Days between repeats
          </Text>
          <View style={{ height: 28 }} />
        </Stage>
      </Screen>

      {settingsOpen ? (
        <SettingsSheet
          view={prefs.view}
          sort={prefs.sort}
          ideas={ideas}
          onClose={() => setSettingsOpen(false)}
          onView={(view) =>
            void patch((state) => ({
              ...state,
              maintPrefs: { ...state.maintPrefs, view },
            }))
          }
          onSort={(sort) =>
            void patch((state) => ({
              ...state,
              maintPrefs: { ...state.maintPrefs, sort },
            }))
          }
          onAddIdea={(idea) => addTask(idea.label, idea.everyDays)}
        />
      ) : null}

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
  onDone,
  onRemove,
}: {
  row: MaintTask;
  today: string;
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
        borderColor: late ? "#C23B3B" : "rgba(196,165,116,0.22)",
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
          borderColor: late ? "#E8A0A0" : PEG,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="checkmark" size={16} color={late ? "#E8A0A0" : PEG} />
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
            color: late ? "#E8A0A0" : MUTED,
          }}
        >
          {dueLabel(row.lastDone, row.everyDays, today)} · every {row.everyDays}d
        </Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${row.label}`}>
        <Ionicons name="close" size={18} color={MUTED} />
      </Pressable>
    </View>
  );
}

function Pegboard({
  rows,
  today,
  onDone,
}: {
  rows: MaintTask[];
  today: string;
  onDone: (id: string) => void;
}) {
  return (
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
                  color: late ? "#FFD0C8" : "#6A4A28",
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

function SettingsSheet({
  view,
  sort,
  ideas,
  onClose,
  onView,
  onSort,
  onAddIdea,
}: {
  view: MaintView;
  sort: MaintSort;
  ideas: { label: string; everyDays: number }[];
  onClose: () => void;
  onView: (view: MaintView) => void;
  onSort: (sort: MaintSort) => void;
  onAddIdea: (idea: { label: string; everyDays: number }) => void;
}) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        justifyContent: "flex-end",
        paddingBottom: 70,
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close maintenance settings"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(12,8,6,0.78)",
        }}
      />
      <View
        style={{
          width: "100%",
          maxHeight: "88%",
          backgroundColor: "#1C1812",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 18,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: 1,
          borderColor: "rgba(196,165,116,0.22)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                color: MUTED,
              }}
            >
              LOOK
            </Text>
            <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 22, color: PAPER }}>
              Settings
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={PAPER} />
          </Pressable>
        </View>
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          <Text style={kicker}>VIEW</Text>
          <Choice
            label="List"
            hint="Due soon first. Tick the box."
            on={view === "list"}
            onPress={() => onView("list")}
          />
          <Choice
            label="Pegboard"
            hint="The old tags on the board."
            on={view === "pegboard"}
            onPress={() => onView("pegboard")}
          />

          <Text style={[kicker, { marginTop: 16 }]}>SORT</Text>
          <Choice
            label="Due soon"
            hint="Closest due date at the top."
            on={sort === "due"}
            onPress={() => onSort("due")}
          />
          <Choice
            label="Overdue first"
            hint="Late jobs jump the queue."
            on={sort === "overdue"}
            onPress={() => onSort("overdue")}
          />
          <Choice
            label="A–Z"
            hint="Alphabetical."
            on={sort === "name"}
            onPress={() => onSort("name")}
          />

          <Text style={[kicker, { marginTop: 16 }]}>SUGGESTIONS</Text>
          <Text
            style={{
              marginBottom: 8,
              fontFamily: SERIF,
              fontSize: 14,
              color: MUTED,
            }}
          >
            Tap one to hang it on your list.
          </Text>
          {ideas.length === 0 ? (
            <Text style={{ color: MUTED, fontFamily: HANDWRITING, fontSize: 16 }}>
              You’ve already got the lot.
            </Text>
          ) : (
            ideas.map((idea) => (
              <Pressable
                key={idea.label}
                onPress={() => onAddIdea(idea)}
                style={{
                  marginBottom: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: "rgba(196,165,116,0.22)",
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
                  <Text style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
                    Every {idea.everyDays} days
                  </Text>
                </View>
                <Ionicons name="add" size={18} color={PEG} />
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function Choice({
  label,
  hint,
  on,
  onPress,
}: {
  label: string;
  hint: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: on ? PEG : "rgba(196,165,116,0.18)",
        backgroundColor: on ? "rgba(196,165,116,0.12)" : "transparent",
      }}
    >
      <Text style={{ color: PAPER, fontFamily: SERIF, fontSize: 16 }}>{label}</Text>
      <Text style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>{hint}</Text>
    </Pressable>
  );
}

const kicker = {
  fontFamily: "SpaceMono" as const,
  fontSize: 11,
  letterSpacing: 2,
  color: MUTED,
  marginBottom: 8,
};
