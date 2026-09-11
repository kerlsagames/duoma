import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { MEALS_TONE, SERIF } from "@/lib/app-themes";
import {
  groupMealsByCategory,
  mealCategoryMeta,
  mealsInCategories,
  MEAL_CATEGORIES,
  type MealCategoryId,
  type MealIdea,
} from "@/lib/meals";
import { useApp } from "@/lib/store";
import type { MealRound, MealWant } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const T = MEALS_TONE;
const ALL_CATEGORY_IDS = MEAL_CATEGORIES.map((row) => row.id);

export default function MealPickerScreen() {
  const {
    user,
    partner,
    mealRounds,
    mealWants,
    spinMeal,
    voteMeal,
    sendMealWant,
    dismissMealWant,
  } = useApp();

  const [enabled, setEnabled] = useState<MealCategoryId[]>(ALL_CATEGORY_IDS);
  const [openCategory, setOpenCategory] = useState<MealCategoryId | null>(
    "easy"
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const poolSize = useMemo(() => mealsInCategories(enabled).length, [enabled]);
  const groups = useMemo(() => groupMealsByCategory(), []);
  const current =
    mealRounds.find((row) => row.status === "voting") ??
    mealRounds.find((row) => row.status === "agreed") ??
    null;
  const wants = mealWants.filter((row) => row.status === "open");
  const partnerLabel = partner?.displayName ?? "your partner";

  const toggleCategory = (id: MealCategoryId) => {
    setEnabled((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update dinner.");
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
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Home Base · Meal decisions
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
          What’s for dinner?
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 24,
            color: T.muted,
          }}
        >
          Spin a menu item. Two thumbs up locks it. One thumb down spins again.
        </Text>

        <Pressable
          disabled={busy || poolSize === 0}
          onPress={() => void run(() => spinMeal({ pool: enabled }))}
          style={{
            marginTop: 22,
            borderRadius: 999,
            backgroundColor: T.accent,
            paddingVertical: 16,
            alignItems: "center",
            opacity: busy || poolSize === 0 ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: T.ticketInk,
              fontWeight: "700",
            }}
          >
            {current ? "Spin again" : "Spin dinner"}
          </Text>
        </Pressable>
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            fontSize: 13,
            color: T.muted,
          }}
        >
          {poolSize} dinners in the pot
        </Text>

        {current ? (
          <Ticket
            round={current}
            userId={user?.id}
            partnerId={partner?.id}
            partnerLabel={partnerLabel}
            busy={busy}
            onVote={(vote) => void run(() => voteMeal(current.id, vote))}
          />
        ) : (
          <View
            style={{
              marginTop: 18,
              backgroundColor: T.paper,
              padding: 22,
              transform: [{ rotate: "-0.6deg" }],
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                color: T.ticketInk,
              }}
            >
              TONIGHT’S SPECIAL
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                fontSize: 24,
                color: T.ticketInk,
              }}
            >
              Waiting on a spin
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontSize: 15,
                color: "rgba(42,28,16,0.62)",
              }}
            >
              Hit spin and we’ll drop a dinner on the ticket.
            </Text>
          </View>
        )}

        {error ? (
          <Text style={{ marginTop: 12, color: T.down, fontSize: 13 }}>
            {error}
          </Text>
        ) : null}

        <Text
          style={{
            marginTop: 32,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: T.muted,
          }}
        >
          Browse the menu
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontSize: 15,
            color: T.muted,
          }}
        >
          Tap a dish to send {partnerLabel} your want. They can put it up for
          thumbs.
        </Text>

        {wants.length ? (
          <View style={{ marginTop: 14, gap: 8 }}>
            {wants.map((want) => (
              <WantRow
                key={want.id}
                want={want}
                mine={want.fromUserId === user?.id}
                userName={
                  want.fromUserId === user?.id
                    ? "You"
                    : partnerLabel
                }
                busy={busy}
                onSpin={() =>
                  void run(() =>
                    spinMeal({
                      pool: enabled,
                      mealId: want.mealId,
                      wantId: want.id,
                    })
                  )
                }
                onDismiss={() => void run(() => dismissMealWant(want.id))}
              />
            ))}
          </View>
        ) : null}

        <View style={{ marginTop: 16, gap: 8 }}>
          {groups.map(({ category, items }) => {
            const open = openCategory === category.id;
            return (
              <View
                key={category.id}
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: T.border,
                  backgroundColor: T.surface,
                  overflow: "hidden",
                }}
              >
                <Pressable
                  onPress={() =>
                    setOpenCategory(open ? null : category.id)
                  }
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontFamily: SERIF,
                        fontSize: 18,
                        color: T.ink,
                      }}
                    >
                      {category.label}
                    </Text>
                    <Text style={{ marginTop: 2, fontSize: 12, color: T.muted }}>
                      {items.length} dishes
                    </Text>
                  </View>
                  <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={T.muted}
                  />
                </Pressable>
                {open
                  ? items.map((idea) => (
                      <BrowseRow
                        key={idea.id}
                        idea={idea}
                        wanted={wants.some(
                          (row) =>
                            row.fromUserId === user?.id &&
                            row.mealId === idea.id
                        )}
                        busy={busy}
                        onWant={() =>
                          void run(() => sendMealWant({ mealId: idea.id }))
                        }
                      />
                    ))
                  : null}
              </View>
            );
          })}
        </View>

        <Text
          style={{
            marginTop: 32,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: T.muted,
          }}
        >
          In the spin pot
        </Text>
        <Text
          style={{
            marginTop: 6,
            marginBottom: 12,
            fontFamily: SERIF,
            fontSize: 15,
            color: T.muted,
          }}
        >
          Toggle categories like date night. Off means they won’t come up on a
          spin.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MEAL_CATEGORIES.map((cat) => {
            const on = enabled.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: on ? T.accent : "rgba(255,255,255,0.12)",
                  backgroundColor: on ? T.accentSoft : T.surface,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: on ? T.accent : T.muted,
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

function Ticket({
  round,
  userId,
  partnerId,
  partnerLabel,
  busy,
  onVote,
}: {
  round: MealRound;
  userId?: string;
  partnerId?: string;
  partnerLabel: string;
  busy: boolean;
  onVote: (vote: "up" | "down") => void;
}) {
  const mine = round.votes.find((row) => row.userId === userId)?.vote ?? null;
  const theirs =
    round.votes.find((row) => row.userId === partnerId)?.vote ?? null;
  const agreed = round.status === "agreed";
  const cat = mealCategoryMeta(round.category as MealCategoryId);

  return (
    <View
      style={{
        marginTop: 18,
        backgroundColor: T.paper,
        padding: 20,
        transform: [{ rotate: "-0.5deg" }],
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2,
          color: agreed ? T.accent : T.ticketInk,
        }}
      >
        {agreed ? "LOCKED IN" : "TONIGHT’S SPECIAL"}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 32,
          lineHeight: 36,
          color: T.ticketInk,
        }}
      >
        {round.title}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 14,
          color: "rgba(42,28,16,0.58)",
        }}
      >
        {cat.label}
      </Text>

      {agreed ? (
        <Text
          style={{
            marginTop: 14,
            fontFamily: SERIF,
            fontSize: 16,
            color: T.ticketInk,
          }}
        >
          You both thumbed it up. That’s dinner.
        </Text>
      ) : (
        <>
          <View
            style={{
              marginTop: 18,
              flexDirection: "row",
              justifyContent: "center",
              gap: 22,
            }}
          >
            <ThumbButton
              kind="down"
              on={mine === "down"}
              disabled={busy}
              onPress={() => onVote("down")}
            />
            <ThumbButton
              kind="up"
              on={mine === "up"}
              disabled={busy}
              onPress={() => onVote("up")}
            />
          </View>
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 14,
              color: "rgba(42,28,16,0.62)",
            }}
          >
            {theirs === "up"
              ? `${partnerLabel} already likes this.`
              : theirs === "down"
                ? `${partnerLabel} passed — spinning again.`
                : mine === "up"
                  ? `Waiting on ${partnerLabel}…`
                  : `Thumb up to keep it. Thumb down to spin again.`}
          </Text>
        </>
      )}
    </View>
  );
}

function ThumbButton({
  kind,
  on,
  disabled,
  onPress,
}: {
  kind: "up" | "down";
  on: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const up = kind === "up";
  const color = up ? T.up : T.down;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: color,
        backgroundColor: on ? color : "transparent",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Ionicons
        name={up ? "thumbs-up" : "thumbs-down"}
        size={28}
        color={on ? T.ticketInk : color}
      />
    </Pressable>
  );
}

function WantRow({
  want,
  mine,
  userName,
  busy,
  onSpin,
  onDismiss,
}: {
  want: MealWant;
  mine: boolean;
  userName: string;
  busy: boolean;
  onSpin: () => void;
  onDismiss: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surfaceRaised,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: T.accent, fontWeight: "700" }}>
          {mine ? "You want" : `${userName} wants`}
        </Text>
        <Text
          style={{
            marginTop: 2,
            fontFamily: SERIF,
            fontSize: 17,
            color: T.ink,
          }}
        >
          {want.title}
        </Text>
      </View>
      <Pressable
        disabled={busy}
        onPress={onSpin}
        style={{
          borderRadius: 999,
          backgroundColor: T.accent,
          paddingHorizontal: 10,
          paddingVertical: 7,
        }}
      >
        <Text style={{ color: T.ticketInk, fontWeight: "700", fontSize: 12 }}>
          Put it up
        </Text>
      </Pressable>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <Ionicons name="close" size={18} color={T.muted} />
      </Pressable>
    </View>
  );
}

function BrowseRow({
  idea,
  wanted,
  busy,
  onWant,
}: {
  idea: MealIdea;
  wanted: boolean;
  busy: boolean;
  onWant: () => void;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.06)",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
          {idea.title}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 12, color: T.muted }}>
          {idea.blurb}
        </Text>
      </View>
      <Pressable
        disabled={busy || wanted}
        onPress={onWant}
        style={{
          borderRadius: 999,
          borderWidth: 1,
          borderColor: wanted ? T.up : T.border,
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: wanted ? T.up : T.ink,
          }}
        >
          {wanted ? "Sent" : "I want this"}
        </Text>
      </Pressable>
    </View>
  );
}
