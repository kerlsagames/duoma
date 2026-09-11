import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { ERRANDS_TONE, SERIF } from "@/lib/app-themes";
import { useApp } from "@/lib/store";
import type { ErrandItem, ErrandKind } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = ERRANDS_TONE;

type Filter = "all" | ErrandKind;

export default function GroceriesErrandsScreen() {
  const {
    user,
    partner,
    errandItems,
    addErrandItem,
    toggleErrandDone,
    removeErrandItem,
    clearDoneErrands,
  } = useApp();

  const [filter, setFilter] = useState<Filter>("all");
  const [draftKind, setDraftKind] = useState<ErrandKind>("grocery");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nameFor = (id: string | null | undefined) => {
    if (!id) return "someone";
    if (id === user?.id) return user.displayName || "You";
    if (id === partner?.id) return partner.displayName || "them";
    return "someone";
  };

  const visible = useMemo(() => {
    if (filter === "all") return errandItems;
    return errandItems.filter((row) => row.kind === filter);
  }, [errandItems, filter]);

  const openItems = visible.filter((row) => !row.doneAt);
  const doneItems = visible.filter((row) => Boolean(row.doneAt));
  const doneCount = errandItems.filter((row) => row.doneAt).length;

  const onAdd = async () => {
    setError(null);
    setBusy(true);
    try {
      await addErrandItem({
        title,
        kind: draftKind,
        notes: showNotes ? notes : "",
      });
      setTitle("");
      setNotes("");
      setShowNotes(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add item.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll background={T.background}>
      <View className="pt-4 pb-10">
        <BackButton
          color={T.accent}
          fallback={"/hub/home-base" as Href}
          style={{ marginBottom: 12 }}
        />

        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Home Base · Shared list
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 40,
            color: T.ink,
          }}
        >
          Groceries & Errands
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 24,
            color: T.muted,
          }}
        >
          One household list you both can add to, check off, and clear.
        </Text>

        <View
          style={{
            marginTop: 22,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {(
            [
              { id: "all" as const, label: "All" },
              { id: "grocery" as const, label: "Groceries" },
              { id: "errand" as const, label: "Errands" },
            ] as const
          ).map((tab) => {
            const on = filter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setFilter(tab.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: on ? T.accent : "rgba(255,255,255,0.12)",
                  backgroundColor: on ? T.accentSoft : T.surface,
                }}
              >
                <Text
                  style={{
                    color: on ? T.accent : T.ink,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 24,
            backgroundColor: T.frame,
            borderWidth: 1,
            borderColor: T.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: T.muted,
            }}
          >
            Add to list
          </Text>

          <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
            {(
              [
                {
                  id: "grocery" as const,
                  label: "Grocery",
                  icon: "cart-outline" as const,
                },
                {
                  id: "errand" as const,
                  label: "Errand",
                  icon: "walk-outline" as const,
                },
              ] as const
            ).map((opt) => {
              const on = draftKind === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setDraftKind(opt.id)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: on ? T.accent : "rgba(255,255,255,0.12)",
                    backgroundColor: on ? T.accentSoft : T.surface,
                  }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={on ? T.accent : T.muted}
                  />
                  <Text
                    style={{
                      color: on ? T.accent : T.ink,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              draftKind === "grocery"
                ? "Milk, bread, berries…"
                : "Pick up dry cleaning…"
            }
            placeholderTextColor="rgba(232,247,244,0.35)"
            style={{
              marginTop: 12,
              height: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.14)",
              backgroundColor: T.surface,
              paddingHorizontal: 14,
              color: T.ink,
              fontSize: 16,
            }}
            onSubmitEditing={() => void onAdd()}
            returnKeyType="done"
          />

          {showNotes ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor="rgba(232,247,244,0.35)"
              style={{
                marginTop: 10,
                minHeight: 72,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
                backgroundColor: T.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: T.ink,
                fontSize: 15,
                textAlignVertical: "top",
              }}
              multiline
            />
          ) : (
            <Pressable
              onPress={() => setShowNotes(true)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: T.accent, fontSize: 13, fontWeight: "600" }}>
                + Add note
              </Text>
            </Pressable>
          )}

          {error ? (
            <Text style={{ marginTop: 10, color: "#FF6B7A", fontSize: 13 }}>
              {error}
            </Text>
          ) : null}

          <View style={{ marginTop: 14 }}>
            <PrimaryButton
              label="Add item"
              tone="teal"
              loading={busy}
              disabled={!title.trim()}
              onPress={() => void onAdd()}
            />
          </View>
        </View>

        <View
          style={{
            marginTop: 28,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: T.muted,
            }}
          >
            To do · {openItems.length}
          </Text>
          {doneCount > 0 ? (
            <Pressable onPress={() => void clearDoneErrands("all")}>
              <Text style={{ color: T.accent, fontSize: 13, fontWeight: "700" }}>
                Clear done ({doneCount})
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ marginTop: 12, gap: 10 }}>
          {openItems.length === 0 ? (
            <EmptyCard
              text={
                filter === "grocery"
                  ? "No groceries yet. Add milk, snacks, or whatever’s running low."
                  : filter === "errand"
                    ? "No errands yet. Add post office, returns, or pickup tasks."
                    : "List is clear. Add a grocery or errand above."
              }
            />
          ) : (
            openItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                meta={`Added by ${nameFor(item.createdBy)}`}
                onToggle={() => void toggleErrandDone(item.id)}
                onRemove={() => void removeErrandItem(item.id)}
              />
            ))
          )}
        </View>

        {doneItems.length > 0 ? (
          <>
            <Text
              style={{
                marginTop: 28,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 2,
                textTransform: "uppercase",
                color: T.muted,
              }}
            >
              Done · {doneItems.length}
            </Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {doneItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  meta={`Checked by ${nameFor(item.doneBy)}`}
                  onToggle={() => void toggleErrandDone(item.id)}
                  onRemove={() => void removeErrandItem(item.id)}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(255,255,255,0.14)",
        backgroundColor: T.surface,
      }}
    >
      <Text
        style={{
          fontFamily: SERIF,
          fontSize: 15,
          lineHeight: 22,
          color: T.muted,
          textAlign: "center",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function ItemRow({
  item,
  meta,
  onToggle,
  onRemove,
}: {
  item: ErrandItem;
  meta: string;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const done = Boolean(item.doneAt);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: done ? "rgba(255,255,255,0.08)" : T.border,
        backgroundColor: done ? T.surface : T.surfaceRaised,
        opacity: done ? 0.72 : 1,
      }}
    >
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: done ? T.accent : "rgba(255,255,255,0.28)",
          backgroundColor: done ? T.accent : "transparent",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        }}
      >
        {done ? <Ionicons name="checkmark" size={16} color="#061612" /> : null}
      </Pressable>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
              backgroundColor: T.accentSoft,
            }}
          >
            <Text style={{ color: T.accent, fontSize: 11, fontWeight: "700" }}>
              {item.kind === "grocery" ? "Grocery" : "Errand"}
            </Text>
          </View>
          <Text
            style={{ color: T.muted, fontSize: 12, flex: 1 }}
            numberOfLines={1}
          >
            {meta}
          </Text>
        </View>
        <Text
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontSize: 18,
            lineHeight: 24,
            color: T.ink,
            textDecorationLine: done ? "line-through" : "none",
          }}
        >
          {item.title}
        </Text>
        {item.notes ? (
          <Text
            style={{
              marginTop: 4,
              fontSize: 13,
              lineHeight: 18,
              color: T.muted,
            }}
          >
            {item.notes}
          </Text>
        ) : null}
      </View>

      <Pressable onPress={onRemove} hitSlop={10} style={{ padding: 4 }}>
        <Ionicons name="trash-outline" size={18} color={T.muted} />
      </Pressable>
    </View>
  );
}
