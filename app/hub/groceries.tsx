import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { ERRANDS_TONE, HANDWRITING, SERIF } from "@/lib/app-themes";
import { noteHeading, type MealPlanNote } from "@/lib/meal-plan";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { ErrandItem, ErrandKind } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = ERRANDS_TONE;
const LINE = 36;

const QUICK_GROCERIES = [
  { emoji: "🥛", label: "Milk" },
  { emoji: "🍞", label: "Bread" },
  { emoji: "🥚", label: "Eggs" },
  { emoji: "🧈", label: "Butter" },
  { emoji: "🧀", label: "Cheese" },
  { emoji: "🥛", label: "Yoghurt" },
  { emoji: "🥛", label: "Cream" },
  { emoji: "🍎", label: "Apples" },
  { emoji: "🍌", label: "Bananas" },
  { emoji: "🍓", label: "Berries" },
  { emoji: "🍋", label: "Lemons" },
  { emoji: "🥑", label: "Avocado" },
  { emoji: "🍅", label: "Tomatoes" },
  { emoji: "🧅", label: "Onions" },
  { emoji: "🧄", label: "Garlic" },
  { emoji: "🥔", label: "Potatoes" },
  { emoji: "🥕", label: "Carrots" },
  { emoji: "🥬", label: "Greens" },
  { emoji: "🥦", label: "Broccoli" },
  { emoji: "🥒", label: "Cucumber" },
  { emoji: "🫑", label: "Capsicum" },
  { emoji: "🍄", label: "Mushrooms" },
  { emoji: "🌽", label: "Corn" },
  { emoji: "🫚", label: "Ginger" },
  { emoji: "🍗", label: "Chicken" },
  { emoji: "🥩", label: "Beef" },
  { emoji: "🥩", label: "Mince" },
  { emoji: "🥓", label: "Bacon" },
  { emoji: "🌭", label: "Sausages" },
  { emoji: "🐟", label: "Salmon" },
  { emoji: "🐟", label: "Tuna" },
  { emoji: "🦐", label: "Prawns" },
  { emoji: "🍝", label: "Pasta" },
  { emoji: "🍜", label: "Noodles" },
  { emoji: "🍚", label: "Rice" },
  { emoji: "🌮", label: "Tortillas" },
  { emoji: "🫘", label: "Beans" },
  { emoji: "🥫", label: "Tinned tomatoes" },
  { emoji: "🥥", label: "Coconut milk" },
  { emoji: "🥣", label: "Stock" },
  { emoji: "🫘", label: "Chickpeas" },
  { emoji: "🌾", label: "Flour" },
  { emoji: "🍯", label: "Honey" },
  { emoji: "🥜", label: "Peanut butter" },
  { emoji: "🫒", label: "Oil" },
  { emoji: "🧂", label: "Salt" },
  { emoji: "🌶️", label: "Chilli" },
  { emoji: "☕", label: "Coffee" },
  { emoji: "🍵", label: "Tea" },
  { emoji: "🧃", label: "Juice" },
  { emoji: "🍷", label: "Wine" },
  { emoji: "🧊", label: "Frozen veg" },
  { emoji: "🍦", label: "Ice cream" },
  { emoji: "🥣", label: "Oats" },
  { emoji: "🥣", label: "Cereal" },
  { emoji: "🍫", label: "Chocolate" },
  { emoji: "🍪", label: "Crackers" },
] as const;

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
        />

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
          {onGroceries ? "Groceries" : "Errands"}
        </Text>

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
              quickAdd
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
  quickAdd,
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
  quickAdd?: boolean;
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

      {quickAdd ? (
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

      {quickAdd && showQuick ? (
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
          {QUICK_GROCERIES.map((item) => {
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
