import { CarnivalWheel } from "@/components/hub/CarnivalWheel";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { sectionAccent } from "@/lib/hub-theme";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { Chore } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C1410";
const PINK = "#FF6B9A";
const BLUE = "#5B8CFF";
const teal = () => sectionAccent("play", "#3ECFBF");

type Tab = "spin" | "last";

type PersonCol = {
  id: string;
  label: string;
  color: string;
};

function sliceColor(gender: string | null | undefined, fallback: string) {
  if (gender === "female") return PINK;
  if (gender === "male") return BLUE;
  return fallback;
}

function personCol(
  profile: Profile | null | undefined,
  fallbackLabel: string,
  fallbackColor: string
): PersonCol | null {
  if (!profile) return null;
  return {
    id: profile.id,
    label: profile.displayName.trim() || fallbackLabel,
    color: sliceColor(profile.gender, fallbackColor),
  };
}

/** M column, then F column — names follow gender, not who is looking. */
function pairColumns(
  user: Profile | null | undefined,
  partner: Profile | null | undefined
): PersonCol[] {
  const youColor = sliceColor(user?.gender, PINK);
  const themFallback = youColor === PINK ? BLUE : PINK;
  const themColor = sliceColor(partner?.gender, themFallback);
  const you = personCol(user, "You", youColor);
  const them = personCol(partner, "Them", themColor === youColor ? themFallback : themColor);
  const people = [you, them].filter((row): row is PersonCol => Boolean(row));
  const male = [user, partner].find((p) => p?.gender === "male");
  const female = [user, partner].find((p) => p?.gender === "female");
  const m = people.find((p) => p.id === male?.id);
  const f = people.find((p) => p.id === female?.id);
  if (m && f) return [m, f];
  return people;
}

export default function FairShareScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [tab, setTab] = useState<Tab>("spin");
  const [choreId, setChoreId] = useState("");
  const [draft, setDraft] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const angle = useRef(0);

  const people = useMemo(() => pairColumns(user, partner), [partner, user]);

  const tasks = useMemo(() => {
    const seen = new Set(data.chores.map((row) => row.label.trim().toLowerCase()));
    const extra = data.whoTasks.filter((row) => !seen.has(row.label.trim().toLowerCase()));
    return [...data.chores, ...extra.map((row) => ({ id: row.id, label: row.label }))];
  }, [data.chores, data.whoTasks]);

  const chore = tasks.find((row) => row.id === choreId) ?? tasks[0];
  const removing = tasks.find((row) => row.id === removeId) ?? null;

  const lastFor = (taskId: string) => data.whoLast.find((row) => row.taskId === taskId);
  const lastScore = (id: string) => data.whoLast.filter((row) => row.userId === id).length;

  const spinTally = (taskId: string, personId: string) =>
    data.fairSpins.filter((row) => row.choreId === taskId && row.winnerId === personId)
      .length;

  const spin = () => {
    if (spinning || !chore || people.length === 0) return;
    setSpinning(true);
    setWinner(null);
    const extra = 360 * 8 + Math.random() * 360;
    const next = angle.current + extra;
    angle.current = next;
    Animated.timing(rotation, {
      toValue: next,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const slice = 360 / people.length;
      const deg = (360 - (next % 360)) % 360;
      const index = Math.floor(deg / slice) % people.length;
      const person = people[index]!;
      setWinner(person.label);
      setSpinning(false);
      void patch((state) => ({
        ...state,
        fairSpins: [
          { id: createId(), choreId: chore.id, winnerId: person.id, createdAt: nowIso() },
          ...state.fairSpins,
        ].slice(0, 200),
        whoLast: [
          { taskId: chore.id, userId: person.id, at: nowIso() },
          ...state.whoLast.filter((row) => row.taskId !== chore.id),
        ],
      }));
    });
  };

  const addChore = async () => {
    const label = draft.trim();
    if (!label) return;
    const id = createId();
    await patch((state) => ({
      ...state,
      chores: [...state.chores, { id, label }],
    }));
    setChoreId(id);
    setDraft("");
  };

  const claim = async (task: Chore, personId: string) => {
    await patch((state) => ({
      ...state,
      whoLast: [
        { taskId: task.id, userId: personId, at: nowIso() },
        ...state.whoLast.filter((row) => row.taskId !== task.id),
      ],
    }));
  };

  const removeChore = async () => {
    if (!removing) return;
    await patch((state) => ({
      ...state,
      chores: state.chores.filter((row) => row.id !== removing.id),
      whoTasks: state.whoTasks.filter((row) => row.id !== removing.id),
      fairSpins: state.fairSpins.filter((row) => row.choreId !== removing.id),
      whoLast: state.whoLast.filter((row) => row.taskId !== removing.id),
    }));
    if (choreId === removing.id) setChoreId("");
    setRemoveId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Screen scroll background={BG}>
        <Stage background={BG} fallback={"/hub/play" as Href} accent={teal()}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              color: teal(),
            }}
          >
            FUN
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 36,
              color: "#E8FFF8",
            }}
          >
            Fair share
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              fontFamily: HANDWRITING,
              fontSize: 20,
              color: "rgba(232,255,248,0.72)",
            }}
          >
            Spin who does it, or tap who did it last.
          </Text>

          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              backgroundColor: "#16241E",
              borderRadius: 14,
              padding: 4,
            }}
          >
            {(
              [
                ["spin", "Spin it"],
                ["last", "Who last"],
              ] as const
            ).map(([id, label]) => (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: tab === id ? teal() : "transparent",
                }}
              >
                <Text
                  style={{
                    fontWeight: "800",
                    color: tab === id ? "#062016" : "#E8FFF8",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === "spin" ? (
            <>
              <View style={{ marginTop: 12 }}>
                <CarnivalWheel
                  slices={people.map((p) => ({ label: p.label, color: p.color }))}
                  rotation={rotation}
                  size={300}
                  bulbColor={PINK}
                  labelFontSize={22}
                  maxChars={16}
                  firstWordOnly={false}
                />
              </View>
              <Pressable
                onPress={spin}
                disabled={spinning || !chore || people.length === 0}
                style={{
                  marginTop: 32,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: teal(),
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: spinning || !chore || people.length === 0 ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "#062016", fontWeight: "900" }}>
                  {spinning
                    ? "Fate is thinking…"
                    : `Spin for ${chore?.label ?? "a chore"}`}
                </Text>
              </Pressable>
              {winner && chore ? (
                <Text
                  style={{
                    marginTop: 14,
                    textAlign: "center",
                    fontFamily: SERIF,
                    fontSize: 26,
                    color: "#F0C75E",
                  }}
                >
                  {winner} does {chore.label.toLowerCase()}.
                </Text>
              ) : null}

              <Text
                style={{
                  marginTop: 22,
                  fontFamily: HANDWRITING,
                  fontSize: 18,
                  color: "rgba(232,255,248,0.72)",
                }}
              >
                Tap a job to spin it. The × drops it from the list.
              </Text>
              <ShareTable
                tasks={tasks}
                people={people}
                selectedId={chore?.id ?? null}
                selectable
                onSelect={(id) => setChoreId(id)}
                onRemove={(id) => setRemoveId(id)}
                cell={(task, person) => (
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 18,
                      color: person.color,
                      textAlign: "center",
                    }}
                  >
                    {spinTally(task.id, person.id)}
                  </Text>
                )}
              />
            </>
          ) : (
            <>
              <View style={{ marginTop: 16, flexDirection: "row", height: 110 }}>
                {people.map((person, index) => (
                  <View
                    key={person.id}
                    style={{
                      flex: 1,
                      backgroundColor: index === 0 ? "#0C2420" : "#241018",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRightWidth: index === 0 && people.length > 1 ? 3 : 0,
                      borderRightColor: "#E8FFF8",
                    }}
                  >
                    <Text style={{ fontFamily: SERIF, fontSize: 24, color: person.color }}>
                      {person.label}
                    </Text>
                    <Text style={{ fontFamily: "SpaceMono", fontSize: 34, color: person.color }}>
                      {lastScore(person.id)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontFamily: HANDWRITING,
                  fontSize: 18,
                  color: "#E8FFF8",
                }}
              >
                Tap a name to mark who did it last.
              </Text>
              <ShareTable
                tasks={tasks}
                people={people}
                selectedId={null}
                onRemove={(id) => setRemoveId(id)}
                cell={(task, person) => {
                  const last = lastFor(task.id);
                  const mine = last?.userId === person.id;
                  return (
                    <Pressable
                      onPress={() => void claim(task, person.id)}
                      style={{
                        minHeight: 40,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 6,
                        backgroundColor: mine ? person.color : "rgba(232,255,248,0.06)",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "800",
                          fontSize: 13,
                          color: mine ? "#062016" : person.color,
                        }}
                        numberOfLines={1}
                      >
                        {person.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </>
          )}

          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Add a chore"
              placeholderTextColor="rgba(232,255,248,0.35)"
              onSubmitEditing={() => void addChore()}
              returnKeyType="done"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(62,207,191,0.35)",
                backgroundColor: "#16241E",
                paddingHorizontal: 14,
                color: "#E8FFF8",
                fontSize: 16,
              }}
            />
            <Pressable
              onPress={() => void addChore()}
              disabled={!draft.trim()}
              style={{
                height: 48,
                paddingHorizontal: 16,
                borderRadius: 14,
                backgroundColor: teal(),
                alignItems: "center",
                justifyContent: "center",
                opacity: draft.trim() ? 1 : 0.45,
              }}
            >
              <Text style={{ color: "#062016", fontWeight: "800" }}>Add</Text>
            </Pressable>
          </View>
          {!ready ? <Text style={{ color: teal() }}>Oiling the wheel…</Text> : null}
        </Stage>
      </Screen>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this chore?"
        body={
          removing
            ? `${removing.label} comes off the list, the wheel, and the tally.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => void removeChore()}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}

function ShareTable({
  tasks,
  people,
  selectedId,
  selectable = false,
  onSelect,
  onRemove,
  cell,
}: {
  tasks: Chore[];
  people: PersonCol[];
  selectedId: string | null;
  selectable?: boolean;
  onSelect?: (id: string) => void;
  onRemove: (id: string) => void;
  cell: (task: Chore, person: PersonCol) => ReactNode;
}) {
  if (tasks.length === 0) {
    return (
      <Text
        style={{
          marginTop: 16,
          textAlign: "center",
          color: "rgba(232,255,248,0.5)",
        }}
      >
        No chores yet. Add one below.
      </Text>
    );
  }

  return (
    <View
      style={{
        marginTop: 12,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(62,207,191,0.28)",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#10201A",
          paddingVertical: 10,
          paddingLeft: 12,
          paddingRight: 4,
          gap: 6,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1,
            color: "rgba(232,255,248,0.45)",
          }}
        >
          JOB
        </Text>
        {people.map((person) => (
          <Text
            key={person.id}
            style={{
              width: 78,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 16,
              color: person.color,
            }}
            numberOfLines={1}
          >
            {person.label}
          </Text>
        ))}
        <View style={{ width: 36 }} />
      </View>
      {tasks.map((task, index) => {
        const selected = selectedId === task.id;
        return (
          <View
            key={task.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              paddingLeft: 12,
              paddingRight: 4,
              gap: 6,
              backgroundColor: selected ? "rgba(62,207,191,0.16)" : index % 2 ? "#0E1A16" : "#121C18",
              borderTopWidth: 1,
              borderTopColor: "rgba(232,255,248,0.06)",
            }}
          >
            <Pressable
              onPress={selectable && onSelect ? () => onSelect(task.id) : undefined}
              disabled={!selectable}
              style={{ flex: 1 }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: selected ? teal() : "#E8FFF8",
                }}
                numberOfLines={2}
              >
                {task.label}
              </Text>
            </Pressable>
            {people.map((person) => (
              <View key={person.id} style={{ width: 78 }}>
                {cell(task, person)}
              </View>
            ))}
            <Pressable
              onPress={() => onRemove(task.id)}
              hitSlop={8}
              accessibilityLabel={`Remove ${task.label}`}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={18} color="rgba(232,255,248,0.45)" />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
