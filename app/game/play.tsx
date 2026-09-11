import { DealHand } from "@/components/DealHand";
import { FinishReveal } from "@/components/FinishReveal";
import { RealtimeCardStage } from "@/components/RealtimeCardStage";
import { ScoreSlider } from "@/components/ScoreSlider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { STAGE_ORDER } from "@/games/get-spicy/engine";
import {
  personalizeCard,
  resolveCardGenders,
  resolveCardNames,
} from "@/lib/personalize";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function PlayScreen() {
  const router = useRouter();
  const {
    game,
    cards,
    deck,
    ratings,
    dealHand,
    shuffleHand,
    chooseHandCard,
    completeActiveCard,
    playDemoPartnerTurn,
    resolveFinishReveal,
    blockCard,
    unlockPrivate,
    rateCard,
    finishRatings,
    endGame,
    myBlocksRemaining,
    myShufflesRemaining,
    user,
    partner,
  } = useApp();

  const [error, setError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationMode, setAnimationMode] = useState<"deal" | "shuffle">("deal");

  useEffect(() => {
    if (!game) router.replace("/(tabs)");
  }, [game, router]);

  const active = deck.find((item) => item.status === "active") ?? null;
  const card = cards.find((item) => item.id === active?.cardId);
  const played = deck.filter((item) => item.status === "played");
  const myTurn = !game?.turnUserId || game.turnUserId === user?.id;

  const handCards = useMemo(
    () =>
      (game?.handCardIds ?? [])
        .map((id) => cards.find((row) => row.id === id))
        .filter((row): row is NonNullable<typeof row> => Boolean(row)),
    [cards, game?.handCardIds]
  );

  const completed =
    game?.status === "completed" ||
    (played.length > 0 &&
      !active &&
      handCards.length === 0 &&
      !game?.awaitingFinishReveal &&
      !game?.awaitingPrivate &&
      game?.status !== "rating" &&
      game?.status !== "playing");

  const canPass =
    myBlocksRemaining > 0 &&
    Boolean(active) &&
    game?.activePlayedBy !== user?.id;

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

  const stagePlayed = played.filter(
    (item) => item.stage === game?.currentStage
  ).length;
  const stageNeed = game?.currentStage
    ? game.stageCounts[game.currentStage]
    : 0;
  const progressLabel = `${stagePlayed} / ${stageNeed} this stage`;

  // Fetch a hand, then play the deal animation — only on your turn with no live card.
  useEffect(() => {
    if (!game || game.status !== "playing") return;
    if (game.awaitingPrivate || game.awaitingFinishReveal) return;
    if (!myTurn) return;
    if (active) return;
    if (handCards.length > 0) return;
    if (animating) return;

    let cancelled = false;
    void (async () => {
      try {
        setError(null);
        setAnimationMode("deal");
        setAnimating(true);
        await dealHand();
        if (!cancelled) setAnimationKey((key) => key + 1);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not deal");
          setAnimating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    animating,
    dealHand,
    game,
    handCards.length,
    myTurn,
  ]);

  // Demo partner: after your Complete, Riley plays a card you can see.
  useEffect(() => {
    if (!game || game.status !== "playing") return;
    if (!partner?.isDemo) return;
    if (game.turnUserId !== partner.id) return;
    if (game.awaitingPrivate || game.awaitingFinishReveal) return;
    if (active) return;
    if (handCards.length > 0) return;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          setError(null);
          await playDemoPartnerTurn();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Demo partner could not play"
          );
        }
      })();
    }, 900);

    return () => clearTimeout(timer);
  }, [
    active,
    game,
    handCards.length,
    partner?.id,
    partner?.isDemo,
    playDemoPartnerTurn,
  ]);

  const onPick = async (cardId: string) => {
    setError(null);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // native-only
    }
    try {
      await chooseHandCard(cardId);
      setAnimating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play");
    }
  };

  const onComplete = async () => {
    setError(null);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // native-only
    }
    try {
      await completeActiveCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete");
    }
  };

  const onShuffle = async () => {
    setError(null);
    try {
      setAnimationMode("shuffle");
      setAnimating(true);
      await shuffleHand();
      setAnimationKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not shuffle");
      setAnimating(false);
    }
  };

  const onPass = async () => {
    setError(null);
    try {
      await blockCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not pass");
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
            That was the daytime tease. When you are both ready for what comes
            next, tap below. Foreplay will not start until you do.
          </Text>
          <View className="mt-8 gap-3">
            <PrimaryButton
              label="We are ready to move on"
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

  if (game?.awaitingFinishReveal) {
    const finishName =
      game.finishPickerId === user?.id
        ? user?.displayName
        : game.finishPickerId === partner?.id
          ? partner?.displayName
          : null;
    const afterglowName =
      game.afterglowPickerId === user?.id
        ? user?.displayName
        : game.afterglowPickerId === partner?.id
          ? partner?.displayName
          : null;
    return (
      <Screen>
        <FinishReveal
          youName={user?.displayName ?? "You"}
          partnerName={partner?.displayName ?? "Partner"}
          revealedName={finishName}
          afterglowName={afterglowName}
          onReveal={() => resolveFinishReveal()}
        />
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
            Score each played card from 0 to 10 (decimals ok). High scores land
            in your bank so you can find them again.
          </Text>
          <View className="mt-6 gap-3">
            {played.length === 0 ? (
              <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <Text className="text-[16px] text-mist/70">
                  No played cards to rate.
                </Text>
              </View>
            ) : (
              played.map((item) => {
                const playedCard = cards.find((row) => row.id === item.cardId);
                if (!playedCard) return null;
                const copy = personalizeCard(
                  playedCard,
                  previewNames,
                  previewGenders
                );
                const current =
                  mine.find((row) => row.cardId === playedCard.id)?.stars ?? 7.5;
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
                    <View className="mt-4">
                      <ScoreSlider
                        value={current}
                        onChange={(score) => void rateCard(playedCard.id, score)}
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
            Afterglow is closed. You stay paired — same code, same history.
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

  const concealPreForeplay =
    Boolean(active) &&
    active?.stage === "pre_foreplay" &&
    !game?.privateUnlocked &&
    (active?.playedBy ?? game?.activePlayedBy) !== user?.id;

  const showHand = myTurn && !active && handCards.length > 0;
  const shuffleLabel =
    myShufflesRemaining < 0
      ? "Shuffle hand · unlimited"
      : `Shuffle hand · ${myShufflesRemaining} left`;

  return (
    <Screen scroll={showHand}>
      <View className="flex-1 py-3">
        <View className="mb-2 flex-row justify-between">
          {STAGE_ORDER.map((stage) => {
            const on = game?.currentStage === stage;
            return (
              <View
                key={stage}
                className={`mx-0.5 h-1.5 flex-1 rounded-full ${
                  on ? "bg-neon" : "bg-white/15"
                }`}
              />
            );
          })}
        </View>

        {showHand ? (
          <View className="flex-1">
            <DealHand
              key={animationKey}
              cards={handCards}
              names={names}
              genders={genders}
              animationKey={animationKey}
              mode={animationMode}
              onReady={() => setAnimating(false)}
              onPick={(cardId) => void onPick(cardId)}
              disabled={!myTurn}
            />
          </View>
        ) : (
          <RealtimeCardStage
            stage={active?.stage ?? game?.currentStage ?? null}
            active={active}
            card={card}
            names={names}
            genders={genders}
            actorLabel={actor ? `${actor} played` : "Live card"}
            progressLabel={progressLabel}
            emptyTitle={
              myTurn
                ? "Shuffling your deck…"
                : `Waiting on ${partner?.displayName ?? "them"}`
            }
            emptyBody={
              myTurn
                ? "Cards will deal to you in a moment. Pick one when they land."
                : `${partner?.displayName ?? "Your partner"} is choosing. Hang tight.`
            }
          
            conceal={concealPreForeplay}
            concealTitle={`${partner?.displayName ?? "They"} played a daytime tease`}
            concealBody="You will see the card when you both move on to the night."
          />
        )}

        <View className="mt-4 flex-row justify-between">
          <Text className="text-[13px] text-mist/50">
            {active
              ? "Live card"
              : myTurn
                ? "Your turn"
                : `${partner?.displayName ?? "Partner"}'s turn`}
          </Text>
          <Text className="text-[13px] text-mist/50">
            Passes {myBlocksRemaining} · Shuffles{" "}
            {myShufflesRemaining < 0 ? "∞" : myShufflesRemaining}
          </Text>
        </View>

        {active ? (
          <Text className="mt-2 text-[14px] leading-5 text-mist/65">
            {concealPreForeplay
              ? "A daytime tease is in play. Tap Complete when they are done — you will see the card after you move on."
              : "When you are both finished with this card, tap Complete to pass the turn."}
          </Text>
        ) : null}

        {error ? <Text className="mt-2 text-[13px] text-crimson">{error}</Text> : null}

        <View className="mt-4 gap-3 pb-3">
          {active ? (
            <PrimaryButton
              label="Complete"
              onPress={() => void onComplete()}
            />
          ) : null}
          {showHand ? (
            <PrimaryButton
              label={shuffleLabel}
              tone="ghost"
              disabled={!myTurn || animating || myShufflesRemaining === 0}
              onPress={() => void onShuffle()}
            />
          ) : null}
          <PrimaryButton
            label="Pass — I do not participate"
            tone="danger"
            disabled={!canPass}
            onPress={() => void onPass()}
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
