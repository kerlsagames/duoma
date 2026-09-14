import { CarnivalWheel } from "@/components/hub/CarnivalWheel";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { Chore } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C1410";
const PINK = "#FF6B9A";
const BLUE = "#5B8CFF";
const TEAL = "#3ECFBF";

type Tab = "spin" | "last";

function sliceColor(gender: string | null | undefined, fallback: string) {
  if (gender === "female") return PINK;
  if (gender === "male") return BLUE;
  return fallback;
}

export default function FairShareScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "You";
  const them = partner?.displayName || "Them";
  const [tab, setTab] = useState<Tab>("spin");
  const [choreId, setChoreId] = useState("");
  const [draft, setDraft] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const angle = useRef(0);

  const youColor = sliceColor(user?.gender, PINK);
  const themRaw = sliceColor(partner?.gender, youColor === PINK ? BLUE : PINK);
  const themColor = themRaw === youColor ? BLUE : themRaw;

  const people = useMemo(
    () => [
      { id: user?.id ?? "you", label: you, color: youColor },
      { id: partner?.id ?? "them", label: them, color: themColor },
    ],
    [partner?.id, them, themColor, user?.id, you, youColor]
  );

  const tasks = useMemo(() => {
    const seen = new Set(data.chores.map((row) => row.label.trim().toLowerCase()));
    const extra = data.whoTasks.filter((row) => !seen.has(row.label.trim().toLowerCase()));
    return [
      ...data.chores,
      ...extra.map((row) => ({ id: row.id, label: row.label })),
    ];
  }, [data.chores, data.whoTasks]);

  const chore = tasks.find((row) => row.id === choreId) ?? tasks[0];
  const removing = tasks.find((row) => row.id === removeId) ?? null;

  const spinCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const spin of data.fairSpins) {
      map[spin.winnerId] = (map[spin.winnerId] ?? 0) + 1;
    }
    return map;
  }, [data.fairSpins]);

  const lastFor = (taskId: string) => data.whoLast.find((row) => row.taskId === taskId);
  const lastScore = (id: string) => data.whoLast.filter((row) => row.userId === id).length;
  const yours = user ? lastScore(user.id) : 0;
  const theirs = partner ? lastScore(partner.id) : 0;

  const spin = () => {
    if (spinning || !chore || !user) return;
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
      const deg = (360 - (next % 360)) % 360;
      const index = Math.floor(deg / 180) % 2;
      const person = people[index]!;
      setWinner(person.label);
      setSpinning(false);
      void patch((state) => ({
        ...state,
        fairSpins: [
          { id: createId(), choreId: chore.id, winnerId: person.id, createdAt: nowIso() },
          ...state.fairSpins,
        ].slice(0, 40),
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

  const claim = async (task: Chore) => {
    if (!user) return;
    await patch((state) => ({
      ...state,
      whoLast: [
        { taskId: task.id, userId: user.id, at: nowIso() },
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
    }));
    if (choreId === removing.id) setChoreId("");
    setRemoveId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Screen scroll background={BG}>
        <Stage background={BG} fallback={"/hub/play" as Href} accent={TEAL}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              color: TEAL,
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
                  backgroundColor: tab === id ? TEAL : "transparent",
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

          <View
            style={{
              marginTop: 16,
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
                backgroundColor: TEAL,
                alignItems: "center",
                justifyContent: "center",
                opacity: draft.trim() ? 1 : 0.45,
              }}
            >
              <Text style={{ color: "#062016", fontWeight: "800" }}>Add</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {tasks.map((row) => (
              <Pressable
                key={row.id}
                onPress={() => setChoreId(row.id)}
                onLongPress={() => setRemoveId(row.id)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: chore?.id === row.id ? TEAL : "#16241E",
                }}
              >
                <Text style={{ color: chore?.id === row.id ? "#062016" : "#E8FFF8" }}>
                  {row.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {tasks.length > 0 ? (
            <Text
              style={{
                marginTop: 8,
                color: "rgba(232,255,248,0.4)",
                fontSize: 12,
              }}
            >
              Hold a chore to remove it.
            </Text>
          ) : null}

          {tab === "spin" ? (
            <>
              <View style={{ marginTop: 8 }}>
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
                disabled={spinning || !chore}
                style={{
                  height: 52,
                  backgroundColor: TEAL,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: spinning || !chore ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "#062016", fontWeight: "900" }}>
                  {spinning ? "Fate is thinking…" : `Spin for ${chore?.label ?? "a chore"}`}
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
              <View style={{ marginTop: 18, gap: 8 }}>
                {people.map((person) => {
                  const n = spinCounts[person.id] ?? 0;
                  const total = Math.max(1, data.fairSpins.length);
                  return (
                    <View key={person.id}>
                      <Text style={{ color: person.color, fontFamily: "SpaceMono" }}>
                        {person.label} · {n} spin{n === 1 ? "" : "s"}
                      </Text>
                      <View style={{ height: 10, backgroundColor: "#16241E" }}>
                        <View
                          style={{
                            width: `${(n / total) * 100}%`,
                            height: 10,
                            backgroundColor: person.color,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <View style={{ marginTop: 16, flexDirection: "row", height: 110 }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#0C2420",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRightWidth: 3,
                    borderRightColor: "#E8FFF8",
                  }}
                >
                  <Text style={{ fontFamily: SERIF, fontSize: 24, color: youColor }}>{you}</Text>
                  <Text style={{ fontFamily: "SpaceMono", fontSize: 34, color: youColor }}>
                    {yours}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#241018",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: SERIF, fontSize: 24, color: themColor }}>{them}</Text>
                  <Text style={{ fontFamily: "SpaceMono", fontSize: 34, color: themColor }}>
                    {theirs}
                  </Text>
                </View>
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
                Tap a row to claim you did it last.
              </Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                {tasks.map((task) => {
                  const last = lastFor(task.id);
                  const mine = last?.userId === user?.id;
                  const name = !last ? "unclaimed" : mine ? you : them;
                  const color = !last ? "#666" : mine ? youColor : themColor;
                  return (
                    <Pressable
                      key={task.id}
                      onPress={() => void claim(task)}
                      style={{ flexDirection: "row", overflow: "hidden", height: 64 }}
                    >
                      <View style={{ width: 8, backgroundColor: color }} />
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#121C18",
                          paddingHorizontal: 12,
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#E8FFF8" }}>
                          {task.label}
                        </Text>
                        <Text style={{ color, fontFamily: "SpaceMono", fontSize: 11 }}>
                          LAST · {name}
                          {last
                            ? ` · ${new Date(last.at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}`
                            : ""}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
          {!ready ? <Text style={{ color: TEAL }}>Oiling the wheel…</Text> : null}
        </Stage>
      </Screen>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this chore?"
        body={removing ? `${removing.label} comes off the list for both the wheel and who-last.` : ""}
        confirmLabel="Remove"
        onConfirm={() => void removeChore()}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}
