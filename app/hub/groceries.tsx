import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { ERRANDS_TONE, HANDWRITING, SERIF } from "@/lib/app-themes";
import {
  DEFAULT_QUICK_GROCERIES,
  QUICK_ADD_EMOJIS,
  readErrandPrefs,
  writeErrandPrefs,
  type QuickAddItem,
} from "@/lib/errand-prefs";
import { noteHeading, type MealPlanNote } from "@/lib/meal-plan";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { ErrandItem, ErrandKind } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = ERRANDS_TONE;
const LINE = 36;

function itemLabel(item: ErrandItem) {
  return item.title.replace(/^[^\w]+/u, "").trim().toLowerCase();
}

export default function GroceriesErrandsScreen() {
  const {
    errandItems,
    addErrandItem,
    toggleErrandDone,
    removeErrandItem,
    clearDoneErrands,
  } = useApp();
  const { data } = useMiniApps();
  const router = useRouter();
  const [pad, setPad] = useState<ErrandKind>("grocery");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<QuickAddItem[]>(() =>
    DEFAULT_QUICK_GROCERIES.map((row) => ({ ...row }))
  );

  useEffect(() => {
    void readErrandPrefs().then((prefs) => setQuickAdd(prefs.quickAdd));
  }, []);

  const persistQuick = (next: QuickAddItem[]) => {
    setQuickAdd(next);
    void writeErrandPrefs({ quickAdd: next });
  };

  const groceries = useMemo(
    () => errandItems.filter((row) => row.kind === "grocery"),
    [errandItems]
  );
  const errands = useMemo(
    () => errandItems.filter((row) => row.kind === "errand"),
    [errandItems]
  );
  const plannedMeals = useMemo(
    () => data.mealPlan.notes.filter((row) => row.title.trim()),
    [data.mealPlan.notes]
  );

  const onGroceries = pad === "grocery";

  return (
    <Screen scroll background={T.background}>
      <View className="pt-4 pb-10">
        <BackButton
          color="#E8D9C4"
          fallback={"/hub/home-base" as Href}
          style={{ marginBottom: 12 }}
          onPress={() => {
            if (settingsOpen) {
              setSettingsOpen(false);
              return true;
            }
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: "#E8D9C4",
              }}
            >
              Home Base · Kitchen table
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: HANDWRITING,
                fontSize: 34,
                lineHeight: 40,
                color: "#F6EFE2",
              }}
            >
              {settingsOpen ? "Settings" : onGroceries ? "Groceries" : "Errands"}
            </Text>
            {settingsOpen ? (
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontSize: 15,
                  lineHeight: 22,
                  color: "rgba(232,217,196,0.72)",
                }}
              >
                Edit the quick-add chips on Groceries. Add the stuff you actually buy.
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => setSettingsOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={
              settingsOpen ? "Close groceries settings" : "Groceries settings"
            }
            style={{
              height: 44,
              width: 44,
              borderRadius: 16,
              backgroundColor: T.paper,
              borderWidth: 1,
              borderColor: T.paperEdge,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Ionicons
              name={settingsOpen ? "close" : "settings-outline"}
              size={22}
              color={T.ink}
            />
          </Pressable>
        </View>

        {settingsOpen ? (
          <View style={{ marginTop: 18 }}>
            <QuickAddSettings items={quickAdd} onChange={persistQuick} />
          </View>
        ) : (
          <>
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            padding: 4,
            borderRadius: 16,
            backgroundColor: T.desk,
            borderWidth: 1,
            borderColor: "rgba(232,217,196,0.18)",
          }}
        >
          {(
            [
              { id: "grocery" as const, label: "Groceries", count: groceries.filter((row) => !row.doneAt).length },
              { id: "errand" as const, label: "Errands", count: errands.filter((row) => !row.doneAt).length },
            ] as const
          ).map((item) => {
            const on = pad === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setPad(item.id)}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: on ? T.paper : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 12,
                    color: on ? T.ink : "#E8D9C4",
                  }}
                >
                  {item.label}
                  {item.count ? ` · ${item.count}` : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 18 }}>
          {onGroceries ? (
            <Notepad
              title="Groceries"
              kind="grocery"
              items={groceries}
              placeholder="Milk, bread, berries…"
              empty="Nothing on the grocery list."
              onAdd={(title) => addErrandItem({ title, kind: "grocery" })}
              onToggle={(id) => toggleErrandDone(id)}
              onRemove={(id) => removeErrandItem(id)}
              onClearDone={() => clearDoneErrands("grocery")}
              quickItems={quickAdd}
              meals={plannedMeals}
              onOpenMeals={() => router.push("/hub/meal-plan" as Href)}
            />
          ) : (
            <Notepad
              title="Errands"
              kind="errand"
              items={errands}
              placeholder="Dry cleaning, post office…"
              empty="No errands on the pad."
              onAdd={(title) => addErrandItem({ title, kind: "errand" })}
              onToggle={(id) => toggleErrandDone(id)}
              onRemove={(id) => removeErrandItem(id)}
              onClearDone={() => clearDoneErrands("errand")}
            />
          )}
        </View>
          </>
        )}
      </View>
    </Screen>
  );
}

function Notepad({
  title,
  kind,
  items,
  placeholder,
  empty,
  onAdd,
  onToggle,
  onRemove,
  onClearDone,
  quickItems,
  meals,
  onOpenMeals,
}: {
  title: string;
  kind: ErrandKind;
  items: ErrandItem[];
  placeholder: string;
  empty: string;
  onAdd: (title: string) => Promise<unknown>;
  onToggle: (id: string) => Promise<unknown>;
  onRemove: (id: string) => Promise<unknown>;
  onClearDone: () => Promise<unknown>;
  quickItems?: QuickAddItem[];
  meals?: MealPlanNote[];
  onOpenMeals?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showQuick, setShowQuick] = useState(false);

  const open = items.filter((row) => !row.doneAt);
  const done = items.filter((row) => Boolean(row.doneAt));
  const listed = [...open, ...done];
  const blankLines = Math.max(4, 8 - listed.length - (showQuick ? 5 : 1));

  const submit = async (value: string) => {
    const titleText = value.trim();
    if (!titleText || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onAdd(titleText);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add.");
    } finally {
      setBusy(false);
    }
  };

  const alreadyOpen = (label: string) =>
    open.some((row) => itemLabel(row) === label.toLowerCase());

  return (
    <View
      style={{
        backgroundColor: T.paper,
        borderRadius: 3,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.28,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        borderWidth: 1,
        borderColor: T.paperEdge,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 28,
          top: 0,
          bottom: 0,
          width: 1.5,
          backgroundColor: T.margin,
          zIndex: 2,
        }}
      />
      {[18, 44].map((top) => (
        <View
          key={top}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 10,
            top,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: T.hole,
            borderWidth: 1,
            borderColor: "rgba(44,36,22,0.12)",
            zIndex: 2,
          }}
        />
      ))}

      <View
        style={{
          minHeight: LINE + 10,
          paddingLeft: 40,
          paddingRight: 14,
          paddingTop: 12,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: T.rule,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Text
          style={{
            fontFamily: HANDWRITING,
            fontSize: 26,
            lineHeight: 30,
            color: T.ink,
          }}
        >
          {title}
        </Text>
        {done.length > 0 ? (
          <Pressable onPress={() => void onClearDone()} hitSlop={8}>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 12,
                color: T.accent,
              }}
            >
              Clear done
            </Text>
          </Pressable>
        ) : null}
      </View>

      <LinedRow>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor="rgba(44,36,22,0.32)"
          style={{
            flex: 1,
            height: LINE - 2,
            padding: 0,
            color: T.ink,
            fontFamily: SERIF,
            fontSize: 16,
          }}
          onSubmitEditing={() => void submit(draft)}
          returnKeyType="done"
        />
        <Pressable
          onPress={() => void submit(draft)}
          disabled={!draft.trim() || busy}
          hitSlop={8}
          style={{ paddingHorizontal: 4, opacity: draft.trim() ? 1 : 0.35 }}
        >
          <Ionicons name="add" size={22} color={T.ink} />
        </Pressable>
      </LinedRow>

      {quickItems && quickItems.length > 0 ? (
        <LinedRow>
          <Pressable
            onPress={() => setShowQuick((on) => !on)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flex: 1,
              height: LINE - 2,
            }}
          >
            <Text style={{ fontSize: 16 }}>🛒</Text>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 15,
                color: T.accent,
                fontWeight: "600",
              }}
            >
              {showQuick ? "Hide quick add" : "Quick add"}
            </Text>
          </Pressable>
        </LinedRow>
      ) : null}

      {quickItems && showQuick ? (
        <View
          style={{
            paddingLeft: 40,
            paddingRight: 10,
            paddingTop: 8,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: T.rule,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {quickItems.map((item) => {
            const onList = alreadyOpen(item.label);
            return (
              <Pressable
                key={item.label}
                disabled={busy || onList}
                onPress={() => void submit(`${item.emoji} ${item.label}`)}
                style={{
                  height: 32,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 4,
                  backgroundColor: onList ? T.accentSoft : "rgba(44,36,22,0.04)",
                  borderWidth: 1,
                  borderColor: onList ? T.accent : "rgba(44,36,22,0.1)",
                  opacity: onList ? 0.55 : 1,
                }}
              >
                <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: T.ink,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {error ? (
        <LinedRow>
          <Text style={{ color: T.margin, fontSize: 13, fontFamily: SERIF }}>
            {error}
          </Text>
        </LinedRow>
      ) : null}

      {listed.length === 0 ? (
        <LinedRow>
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              color: T.muted,
              fontStyle: "italic",
            }}
          >
            {empty}
          </Text>
        </LinedRow>
      ) : (
        listed.map((item) => (
          <ListRow
            key={item.id}
            item={item}
            onToggle={() => void onToggle(item.id)}
            onRemove={() => void onRemove(item.id)}
          />
        ))
      )}

      {meals ? (
        <View
          style={{
            paddingLeft: 40,
            paddingRight: 12,
            paddingTop: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: T.rule,
          }}
        >
          <Pressable
            onPress={onOpenMeals}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontFamily: HANDWRITING,
                fontSize: 20,
                color: T.ink,
              }}
            >
              Meal Plan
            </Text>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 12,
                color: T.accent,
              }}
            >
              Open
            </Text>
          </Pressable>
          {meals.length === 0 ? (
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                color: T.muted,
                fontStyle: "italic",
              }}
            >
              No dinners on the meal plan yet. Add some, then shop from here.
            </Text>
          ) : (
            <View style={{ gap: 6 }}>
              {meals.map((meal) => {
                const line = `${noteHeading(meal)} · ${meal.title.trim()}`;
                const onList = alreadyOpen(meal.title) || alreadyOpen(line);
                return (
                  <Pressable
                    key={meal.id}
                    disabled={busy || onList}
                    onPress={() => void submit(line)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      opacity: meal.eaten || onList ? 0.5 : 1,
                    }}
                  >
                    <Ionicons
                      name={onList ? "checkmark" : "add"}
                      size={16}
                      color={onList ? T.check : T.accent}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: SERIF,
                        fontSize: 15,
                        color: T.ink,
                        textDecorationLine: meal.eaten ? "line-through" : "none",
                      }}
                    >
                      {line}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      {Array.from({ length: blankLines }).map((_, index) => (
        <LinedRow key={`${kind}-blank-${index}`} />
      ))}
    </View>
  );
}

function LinedRow({ children }: { children?: ReactNode }) {
  return (
    <View
      style={{
        minHeight: LINE,
        paddingLeft: 40,
        paddingRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: T.rule,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </View>
  );
}

function ListRow({
  item,
  onToggle,
  onRemove,
}: {
  item: ErrandItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const done = Boolean(item.doneAt);
  return (
    <LinedRow>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: done ? T.check : T.pencil,
          backgroundColor: done ? T.check : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {done ? <Ionicons name="checkmark" size={13} color={T.paper} /> : null}
      </Pressable>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: SERIF,
          fontSize: 16,
          color: done ? T.muted : T.ink,
          textDecorationLine: done ? "line-through" : "none",
        }}
      >
        {item.title}
      </Text>
      <Pressable onPress={onRemove} hitSlop={10} style={{ padding: 2 }}>
        <Ionicons name="close" size={16} color={T.muted} />
      </Pressable>
    </LinedRow>
  );
}

function QuickAddSettings({
  items,
  onChange,
}: {
  items: QuickAddItem[];
  onChange: (next: QuickAddItem[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [emoji, setEmoji] = useState("🛒");
  const [error, setError] = useState<string | null>(null);

  const addChip = () => {
    const label = draft.trim();
    if (!label) {
      setError("Type a name first.");
      return;
    }
    if (items.some((row) => row.label.toLowerCase() === label.toLowerCase())) {
      setError("That’s already on quick add.");
      return;
    }
    onChange([...items, { emoji, label }]);
    setDraft("");
    setError(null);
  };

  return (
    <View
      style={{
        backgroundColor: T.paper,
        borderRadius: 3,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: T.paperEdge,
      }}
    >
      <View
        style={{
          paddingLeft: 18,
          paddingRight: 14,
          paddingTop: 14,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: T.rule,
        }}
      >
        <Text
          style={{
            fontFamily: HANDWRITING,
            fontSize: 24,
            color: T.ink,
          }}
        >
          Quick add
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: SERIF,
            fontSize: 14,
            lineHeight: 20,
            color: T.muted,
          }}
        >
          {items.length} chip{items.length === 1 ? "" : "s"} on the grocery pad.
        </Text>
      </View>

      <View
        style={{
          paddingLeft: 18,
          paddingRight: 14,
          paddingTop: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: T.rule,
          gap: 10,
        }}
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.2,
            color: T.muted,
          }}
        >
          ADD A CHIP
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {QUICK_ADD_EMOJIS.map((pick) => {
            const on = emoji === pick;
            return (
              <Pressable
                key={pick}
                onPress={() => setEmoji(pick)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: on ? T.accentSoft : "rgba(44,36,22,0.04)",
                  borderWidth: 1,
                  borderColor: on ? T.accent : "rgba(44,36,22,0.1)",
                }}
              >
                <Text style={{ fontSize: 18 }}>{pick}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={(value) => {
              setDraft(value);
              if (error) setError(null);
            }}
            placeholder="Oat milk, coriander…"
            placeholderTextColor="rgba(44,36,22,0.32)"
            onSubmitEditing={addChip}
            returnKeyType="done"
            style={{
              flex: 1,
              height: 44,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: "rgba(44,36,22,0.05)",
              color: T.ink,
              fontFamily: SERIF,
              fontSize: 16,
            }}
          />
          <Pressable
            onPress={addChip}
            disabled={!draft.trim()}
            accessibilityLabel="Add quick-add chip"
            style={{
              height: 44,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: T.accent,
              alignItems: "center",
              justifyContent: "center",
              opacity: draft.trim() ? 1 : 0.4,
            }}
          >
            <Text style={{ color: T.paper, fontWeight: "700", fontSize: 14 }}>Add</Text>
          </Pressable>
        </View>
        {error ? (
          <Text style={{ fontFamily: SERIF, fontSize: 13, color: T.margin }}>{error}</Text>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View style={{ padding: 18 }}>
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              color: T.muted,
              fontStyle: "italic",
            }}
          >
            No chips yet. Add one above, or restore the starter list.
          </Text>
        </View>
      ) : (
        items.map((item, index) => (
          <View
            key={`${item.label}-${index}`}
            style={{
              minHeight: LINE,
              paddingLeft: 18,
              paddingRight: 10,
              borderBottomWidth: 1,
              borderBottomColor: T.rule,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
            <Text
              style={{
                flex: 1,
                fontFamily: SERIF,
                fontSize: 16,
                color: T.ink,
              }}
            >
              {item.label}
            </Text>
            <Pressable
              onPress={() => onChange(items.filter((_, i) => i !== index))}
              hitSlop={10}
              accessibilityLabel={`Remove ${item.label}`}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={18} color={T.muted} />
            </Pressable>
          </View>
        ))
      )}

      <Pressable
        onPress={() => {
          onChange(DEFAULT_QUICK_GROCERIES.map((row) => ({ ...row })));
          setError(null);
        }}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 18,
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: SERIF, fontSize: 14, color: T.accent, fontWeight: "600" }}>
          Restore starter chips
        </Text>
      </Pressable>
    </View>
  );
}
