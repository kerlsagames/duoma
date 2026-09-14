import { Stage } from "@/components/hub/Stage";
import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { GOALS_TONE as T, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import {
  contributeToGoal,
  goalProgress,
  isGoalReached,
  money,
  nextGoalColor,
  parseMoney,
  type GoalHorizon,
  type MoneyGoal,
} from "@/lib/money";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const CHIPS = [10, 20, 50, 100, 200];

export default function GoalsScreen() {
  const router = useRouter();
  const { data, ready, patch } = useMiniApps();
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [note, setNote] = useState("");
  const [horizon, setHorizon] = useState<GoalHorizon>("long");
  const [feedId, setFeedId] = useState<string | null>(null);
  const [feedAmt, setFeedAmt] = useState("50");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const longTerm = useMemo(
    () => data.goals.filter((row) => row.horizon === "long" && !isGoalReached(row)),
    [data.goals]
  );
  const shortTerm = useMemo(
    () => data.goals.filter((row) => row.horizon === "short" && !isGoalReached(row)),
    [data.goals]
  );
  const done = useMemo(() => data.goals.filter(isGoalReached), [data.goals]);
  const feeding = data.goals.find((row) => row.id === feedId) ?? null;
  const removing = data.goals.find((row) => row.id === removeId) ?? null;

  const resetCompose = () => {
    setCompose(false);
    setTitle("");
    setTarget("");
    setNote("");
    setHorizon("long");
    setError(null);
  };

  const saveGoal = async () => {
    const n = parseMoney(target);
    if (!title.trim()) {
      setError("Give it a name.");
      return;
    }
    if (n == null || n <= 0) {
      setError("A goal needs a dollar target.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      goals: [
        ...state.goals,
        {
          id: createId(),
          title: title.trim(),
          target: n,
          saved: 0,
          color: nextGoalColor(state.goals),
          horizon,
          note: note.trim(),
          createdAt: nowIso(),
          completedAt: null,
        },
      ],
    }));
    resetCompose();
  };

  const feed = async () => {
    if (!feeding) return;
    const n = parseMoney(feedAmt);
    if (n == null || n === 0) {
      setError("Put a number in.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      goals: state.goals.map((row) => (row.id === feeding.id ? contributeToGoal(row, n) : row)),
    }));
    setFeedId(null);
    setFeedAmt("50");
  };

  const remove = async () => {
    if (!removing) return;
    await patch((state) => ({
      ...state,
      goals: state.goals.filter((row) => row.id !== removing.id),
    }));
    setRemoveId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.background }}>
      <Screen scroll background={T.background}>
        <Stage background={T.background} fallback={"/hub/home-base" as Href} accent={T.accent}>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              color: T.accent,
            }}
          >
            HOME BASE
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 34,
              lineHeight: 40,
              color: T.ink,
            }}
          >
            Shared goals
          </Text>
          <Text style={{ marginTop: 8, fontSize: 15, lineHeight: 22, color: T.muted }}>
            Long-term sits on top. Short-term is the list underneath. Add money when you have it.
          </Text>
          <Pressable
            onPress={() => router.push("/hub/budget" as Href)}
            style={{ marginTop: 10, alignSelf: "flex-start" }}
          >
            <Text style={{ color: T.accent, fontSize: 14, fontWeight: "700" }}>
              Pay, bills and spending live in Shared budget →
            </Text>
          </Pressable>

          {!ready ? (
            <Text style={{ marginTop: 24, color: T.muted }}>Opening the ledger…</Text>
          ) : (
            <>
              <SectionKicker label="Long-term" count={longTerm.length} />
              {longTerm.length === 0 ? (
                <EmptyBlock
                  text="Nothing slow on the list yet. A couch, a trip, a house deposit — the ones that take a while."
                />
              ) : (
                <View style={{ gap: 12 }}>
                  {longTerm.map((goal) => (
                    <LongCard
                      key={goal.id}
                      goal={goal}
                      onFeed={() => {
                        setFeedAmt("50");
                        setFeedId(goal.id);
                      }}
                      onRemove={() => setRemoveId(goal.id)}
                    />
                  ))}
                </View>
              )}

              <SectionKicker label="Short-term" count={shortTerm.length} />
              {shortTerm.length === 0 ? (
                <EmptyBlock text="Nearer wants go here — dinner, a weekend, the thing you want this season." />
              ) : (
                <View style={{ gap: 8 }}>
                  {shortTerm.map((goal) => (
                    <ShortRow
                      key={goal.id}
                      goal={goal}
                      onFeed={() => {
                        setFeedAmt("20");
                        setFeedId(goal.id);
                      }}
                      onRemove={() => setRemoveId(goal.id)}
                    />
                  ))}
                </View>
              )}

              {done.length > 0 ? (
                <>
                  <SectionKicker label="Reached" count={done.length} />
                  <View style={{ gap: 8 }}>
                    {done.map((goal) => (
                      <View
                        key={goal.id}
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          backgroundColor: T.surface,
                          borderWidth: 1,
                          borderColor: T.border,
                          opacity: 0.72,
                        }}
                      >
                        <Text style={{ color: T.ink, fontWeight: "700", fontSize: 16 }}>
                          {goal.title}
                        </Text>
                        <Text style={{ marginTop: 4, color: T.muted, fontSize: 13 }}>
                          {money(goal.target)} · done
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              <Pressable
                onPress={() => {
                  setError(null);
                  setCompose(true);
                }}
                style={{
                  marginTop: 22,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: T.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#1A1408", fontWeight: "800" }}>New goal</Text>
              </Pressable>
            </>
          )}
        </Stage>
      </Screen>

      {compose ? (
        <SheetOverlay
          kicker="NEW"
          title="Add a goal"
          onClose={resetCompose}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={label}>Name</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="The nice couch"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Target</Text>
          <TextInput
            value={target}
            onChangeText={setTarget}
            keyboardType="decimal-pad"
            placeholder="2400"
            placeholderTextColor={T.dim}
            style={field}
          />
          <Text style={[label, { marginTop: 14 }]}>Horizon</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {(
              [
                ["long", "Long-term"],
                ["short", "Short-term"],
              ] as const
            ).map(([id, text]) => (
              <Pressable
                key={id}
                onPress={() => setHorizon(id)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: horizon === id ? T.accent : T.surface,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: horizon === id ? "#1A1408" : T.ink,
                  }}
                >
                  {text}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[label, { marginTop: 14 }]}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Why this one matters"
            placeholderTextColor={T.dim}
            style={field}
          />
          {error ? (
            <Text style={{ marginTop: 12, color: "#FF8A7A" }}>{error}</Text>
          ) : null}
          <Pressable
            onPress={() => void saveGoal()}
            style={{
              marginTop: 18,
              height: 50,
              borderRadius: 16,
              backgroundColor: T.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontWeight: "800", color: "#1A1408" }}>Save goal</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      {feeding ? (
        <SheetOverlay
          kicker="ADD TO THE PILE"
          title={feeding.title}
          onClose={() => {
            setFeedId(null);
            setError(null);
          }}
          background={T.surfaceRaised}
          ink={T.ink}
          muted={T.muted}
        >
          <Text style={{ color: T.muted, marginBottom: 10 }}>
            {money(feeding.saved)} of {money(feeding.target)} ·{" "}
            {money(Math.max(0, feeding.target - feeding.saved))} to go
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {CHIPS.map((n) => (
              <Pressable
                key={n}
                onPress={() => setFeedAmt(String(n))}
                style={{
                  paddingHorizontal: 14,
                  height: 40,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: feedAmt === String(n) ? feeding.color : T.surface,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: feedAmt === String(n) ? "#1A1408" : T.ink,
                  }}
                >
                  {money(n)}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={feedAmt}
            onChangeText={setFeedAmt}
            keyboardType="decimal-pad"
            placeholder="Custom amount"
            placeholderTextColor={T.dim}
            style={[field, { marginTop: 12 }]}
          />
          {error ? (
            <Text style={{ marginTop: 12, color: "#FF8A7A" }}>{error}</Text>
          ) : null}
          <Pressable
            onPress={() => void feed()}
            style={{
              marginTop: 16,
              height: 50,
              borderRadius: 16,
              backgroundColor: feeding.color,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontWeight: "800", color: "#1A1408" }}>Add to this goal</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this goal?"
        body={
          removing
            ? `${removing.title} comes off the list. The dollars you already logged stay in Shared budget — they are not moved.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => void remove()}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}

function SectionKicker({ label, count }: { label: string; count: number }) {
  return (
    <Text
      style={{
        marginTop: 22,
        marginBottom: 10,
        fontFamily: "SpaceMono",
        fontSize: 11,
        letterSpacing: 2,
        color: T.muted,
      }}
    >
      {label.toUpperCase()} · {count}
    </Text>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surface,
      }}
    >
      <Text style={{ color: T.muted, lineHeight: 21 }}>{text}</Text>
    </View>
  );
}

function LongCard({
  goal,
  onFeed,
  onRemove,
}: {
  goal: MoneyGoal;
  onFeed: () => void;
  onRemove: () => void;
}) {
  const pct = goalProgress(goal);
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 18,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: T.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontFamily: SERIF, fontSize: 24, lineHeight: 28, color: T.ink }}>
            {goal.title}
          </Text>
          {goal.note ? (
            <Text style={{ marginTop: 6, color: T.muted, fontSize: 14, lineHeight: 20 }}>
              {goal.note}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${goal.title}`}>
          <Ionicons name="trash-outline" size={18} color={T.dim} />
        </Pressable>
      </View>
      <View
        style={{
          marginTop: 14,
          height: 12,
          borderRadius: 99,
          backgroundColor: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.max(4, pct * 100)}%`,
            height: "100%",
            backgroundColor: goal.color,
          }}
        />
      </View>
      <View
        style={{
          marginTop: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: goal.color, fontFamily: "SpaceMono", fontSize: 13 }}>
          {money(goal.saved)} / {money(goal.target)}
        </Text>
        <Text style={{ color: T.muted, fontSize: 13 }}>
          {money(Math.max(0, goal.target - goal.saved))} to go
        </Text>
      </View>
      <Pressable
        onPress={onFeed}
        style={{
          marginTop: 12,
          height: 42,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: goal.color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: goal.color, fontWeight: "700" }}>Add money</Text>
      </Pressable>
    </View>
  );
}

function ShortRow({
  goal,
  onFeed,
  onRemove,
}: {
  goal: MoneyGoal;
  onFeed: () => void;
  onRemove: () => void;
}) {
  const pct = goalProgress(goal);
  return (
    <View
      style={{
        padding: 12,
        borderRadius: 14,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: T.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: T.ink, fontWeight: "700", fontSize: 16 }}>{goal.title}</Text>
          <Text style={{ marginTop: 2, color: T.muted, fontSize: 12 }}>
            {money(goal.saved)} / {money(goal.target)}
          </Text>
        </View>
        <Pressable
          onPress={onFeed}
          style={{
            height: 36,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: goal.color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A1408", fontWeight: "800", fontSize: 13 }}>Add</Text>
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${goal.title}`}>
          <Ionicons name="trash-outline" size={18} color={T.dim} />
        </Pressable>
      </View>
      <View
        style={{
          marginTop: 8,
          height: 6,
          borderRadius: 99,
          backgroundColor: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.max(6, pct * 100)}%`,
            height: "100%",
            backgroundColor: goal.color,
          }}
        />
      </View>
    </View>
  );
}

const label = {
  fontFamily: "SpaceMono" as const,
  fontSize: 11,
  letterSpacing: 1.6,
  color: T.muted,
};

const field = {
  marginTop: 6,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: T.surface,
  color: T.ink,
  fontSize: 16,
} as const;
