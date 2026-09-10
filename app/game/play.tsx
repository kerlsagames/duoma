import { RealtimeCardStage } from "@/components/RealtimeCardStage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { STAGE_ORDER } from "@/games/get-spicy/engine";
import { personalizeCard, resolveCardGenders, resolveCardNames } from "@/lib/personalize";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (stars: number) => void;
}) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} className="px-1 py-1">
          <Text className="text-[22px]">{star <= value ? "★" : "☆"}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function PlayScreen() {
  const router = useRouter();
  const {
    game,
    cards,
    deck,
    ratings,
    playCard,
    blockCard,
    unlockPrivate,
    rateCard,
    finishRatings,
    endGame,
    myBlocksRemaining,
    partnerBlocksRemaining,
    user,
    partner,
  } = useApp();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!game) router.replace("/(tabs)");
  }, [game, router]);

  const active = deck.find((item) => item.status === "active") ?? null;
  const card = cards.find((item) => item.id === active?.cardId);
  const resolved = deck.filter((item) =>
    ["played", "blocked", "active"].includes(item.status)
  ).length;
  const remaining = deck.filter((item) => item.status === "queued").length;
  const played = deck.filter((item) => item.status === "played");
  const completed =
    game?.status === "completed" ||
    (!active && remaining === 0 && deck.length > 0 && game?.status !== "rating");
  const myTurn =
    Boolean(partner?.isDemo) || !game?.turnUserId || game.turnUserId === user?.id;
  const turnName =
    game?.turnUserId === user?.id
      ? "your"
      : `${partner?.displayName ?? "their"}'s`;
  const canBlock =
    myBlocksRemaining > 0 &&
    Boolean(active) &&
    (Boolean(partner?.isDemo) || game?.activePlayedBy !== user?.id);

  const names = resolveCardNames({
    userName: user?.displayName,
    partnerName: partner?.displayName,
    userId: user?.id,
    partnerId: partner?.id,
    playedById: active?.playedBy ?? game?.activePlayedBy ?? user?.id,
  });
  const genders = resolveCardGenders({
    userGender: user?.gender,
    partnerGender: partner?.gender,
    userId: user?.id,
    partnerId: partner?.id,
    playedById: active?.playedBy ?? game?.activePlayedBy ?? user?.id,
  });

  const actor =
    (active?.playedBy ?? game?.activePlayedBy) === partner?.id
      ? partner?.displayName
      : user?.displayName;

  const progressLabel = useMemo(() => {
    if (!deck.length) return "No cards dealt";
    return `${Math.max(resolved, active ? 1 : 0)} / ${deck.length}`;
  }, [active, deck.length, resolved]);

  const onPlay = async () => {
    setError(null);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // native-only
    }
    try {
      await playCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play");
    }
  };

  const onBlock = async () => {
    setError(null);
    try {
      await blockCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not block");
    }
  };

  if (game?.awaitingPrivate) {
    return (
      <Screen>
        <View className="flex-1 justify-center">
          <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
            Stage 1 closed
          </Text>
          <Text className="mt-3 text-[34px] font-bold leading-10 text-mist">
            Pre-foreplay is done.
          </Text>
          <Text className="mt-4 text-[16px] leading-7 text-mist/70">
            That was the daytime tease. When you are both somewhere private and
            ready for sexy time, tap below. Foreplay will not start until you do.
          </Text>
          <View className="mt-8 gap-3">
            <PrimaryButton
              label="We're ready for private sexy time"
              onPress={() => void unlockPrivate()}
            />
            <PrimaryButton
              label="Keep the night paused"
              tone="ghost"
              onPress={() => router.replace("/(tabs)")}
            />
          </View>
        </View>
      </Screen>
    );
  }

  if (game?.status === "rating") {
    const previewNames = resolveCardNames({
      userName: user?.displayName,
      partnerName: partner?.displayName,
    });
    const previewGenders = resolveCardGenders({
      userGender: user?.gender,
      partnerGender: partner?.gender,
    });
    const mine = ratings.filter(
      (row) => row.gameId === game.id && row.userId === user?.id
    );
    return (
      <Screen scroll>
        <View className="pt-2 pb-8">
          <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
            Rate the night
          </Text>
          <Text className="mt-3 text-[32px] font-bold text-mist">Best cards</Text>
          <Text className="mt-2 text-[15px] leading-6 text-mist/65">
            Both of you rate the cards you actually played. High scores land in
            your bank so you can find them again.
          </Text>

          <View className="mt-6 gap-3">
            {played.length === 0 ? (
              <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <Text className="text-[16px] text-mist/70">
                  No played cards to rate. The blocked ones stay out of this list.
                </Text>
              </View>
            ) : (
              played.map((item) => {
                const playedCard = cards.find((row) => row.id === item.cardId);
                if (!playedCard) return null;
                const copy = personalizeCard(playedCard, previewNames, previewGenders);
                const current =
                  mine.find((row) => row.cardId === playedCard.id)?.stars ?? 0;
                return (
                  <View
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <Text className="text-[12px] uppercase tracking-widest text-crimson">
                      {playedCard.stage.replaceAll("_", " ")}
                    </Text>
                    <Text className="mt-1 text-[16px] font-semibold text-mist">
                      {copy.title}
                    </Text>
                    <Text className="mt-2 text-[14px] leading-5 text-mist/70">
                      {copy.body}
                    </Text>
                    <View className="mt-3">
                      <Stars
                        value={current}
                        onChange={(stars) => void rateCard(playedCard.id, stars)}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View className="mt-8 gap-3">
            <PrimaryButton
              label="Save ratings"
              onPress={() => {
                void finishRatings();
                router.replace("/(tabs)");
              }}
            />
            <PrimaryButton
              label="Skip for tonight"
              tone="ghost"
              onPress={() => {
                void finishRatings();
                router.replace("/(tabs)");
              }}
            />
          </View>
        </View>
      </Screen>
    );
  }

  if (completed) {
    return (
      <Screen>
        <View className="flex-1 justify-center">
          <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
            Deck complete
          </Text>
          <Text className="mt-3 text-[36px] font-bold text-mist">You made it.</Text>
          <Text className="mt-3 text-[16px] leading-6 text-mist/70">
            Afterglow is closed. You stay paired — same code, same history. Come
            back tomorrow without making a new invite.
          </Text>
          <View className="mt-8">
            <PrimaryButton
              label="Back home"
              onPress={() => {
                void endGame();
                router.replace("/(tabs)");
              }}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 py-3">
        <View className="mb-2 flex-row justify-between">
          {STAGE_ORDER.map((stage) => {
            const on = game?.currentStage === stage;
            return (
              <View
                key={stage}
                className={`h-1.5 flex-1 mx-0.5 rounded-full ${
                  on ? "bg-neon" : "bg-white/15"
                }`}
              />
            );
          })}
        </View>

        <RealtimeCardStage
          stage={active?.stage ?? game?.currentStage ?? null}
          active={active}
          card={card}
          names={names}
          genders={genders}
          actorLabel={actor ? `${actor} played` : "Live card"}
          progressLabel={progressLabel}
          emptyTitle={
            myTurn ? "Your turn" : `Waiting on ${partner?.displayName ?? "them"}`
          }
          emptyBody={
            deck.length
              ? myTurn
                ? `Play a card. It will name you first, then ${partner?.displayName ?? "your partner"}.`
                : `${partner?.displayName ?? "Your partner"} plays next. You can block what they just played if you don't want in.`
              : "The deck is empty. Head back and deal again."
          }
        />

        <View className="mt-4 flex-row justify-between">
          <Text className="text-[13px] text-mist/50">
            {myTurn ? "Your turn to play" : `${turnName} turn`}
          </Text>
          <Text className="text-[13px] text-mist/50">
            Blocks · you {myBlocksRemaining} / {partner?.displayName ?? "them"}{" "}
            {partnerBlocksRemaining}
          </Text>
        </View>

        {error ? <Text className="mt-2 text-[13px] text-crimson">{error}</Text> : null}

        <View className="mt-4 gap-3 pb-3">
          <PrimaryButton
            label={
              active
                ? myTurn
                  ? "Play next card"
                  : `Waiting — ${partner?.displayName ?? "partner"}'s turn`
                : myTurn
                  ? "Play card"
                  : `Waiting — ${partner?.displayName ?? "partner"}'s turn`
            }
            disabled={!myTurn}
            onPress={() => void onPlay()}
          />
          <PrimaryButton
            label="Block — I don't participate"
            tone="danger"
            disabled={!canBlock}
            onPress={() => void onBlock()}
          />
          <PrimaryButton
            label="End session"
            tone="ghost"
            onPress={() => {
              void endGame();
              router.replace("/(tabs)");
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
