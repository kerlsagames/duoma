import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { GAME_REGISTRY } from "@/games/registry";
import { personalizeCard, resolveCardNames } from "@/lib/personalize";
import { useApp } from "@/lib/store";
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { game, partner, user, sendSpicyInvite, nights, bestCards } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const names = resolveCardNames({
    userName: user?.displayName,
    partnerName: partner?.displayName,
  });

  useEffect(() => {
    if (game?.status === "setup") router.push("/game/setup");
  }, [game?.status, router]);

  const resume = () => {
    if (!game) return;
    if (game.status === "setup") router.push("/game/setup");
    else if (game.status === "selecting") router.push("/game/select");
    else if (["playing", "rating"].includes(game.status)) router.push("/game/play");
  };

  const startSpicy = async () => {
    setError(null);
    setLoading(true);
    try {
      if (game?.status === "inviting") return;
      if (game && ["setup", "selecting", "playing", "rating"].includes(game.status)) {
        resume();
        return;
      }
      await sendSpicyInvite();
      if (partner?.isDemo) router.push("/game/setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start");
    } finally {
      setLoading(false);
    }
  };

  const live = Boolean(
    game && ["setup", "selecting", "playing", "rating"].includes(game.status)
  );

  return (
    <Screen scroll>
      <View className="pt-4 pb-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Fuse
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">Tonight</Text>
        <PartnerConnectionBanner />

        <Pressable
          onPress={() => router.push("/how-to" as Href)}
          className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
            How to play
          </Text>
          <Text className="mt-2 text-[16px] font-semibold text-mist">
            Turns, daytime tease, then private time.
          </Text>
          <Text className="mt-1 text-[14px] leading-5 text-mist/65">
            Cards name both of you. Block means you sit their card out. You stay
            paired after tonight.
          </Text>
        </Pressable>

        {game?.status === "inviting" ? (
          <View className="mb-5 rounded-3xl border border-neon/30 bg-neon/10 p-5">
            <Text className="text-[13px] font-semibold uppercase tracking-[2px] text-neon">
              Waiting
            </Text>
            <Text className="mt-2 text-[18px] font-semibold text-mist">
              Get Spicy is sitting on {partner?.displayName ?? "their"} lock screen.
            </Text>
            <Text className="mt-1 text-[14px] text-mist/65">
              The second they accept, setup opens on both phones.
            </Text>
          </View>
        ) : null}

        {live ? (
          <View className="mb-5 rounded-3xl border border-crimson/40 bg-crimson/10 p-5">
            <Text className="text-[13px] font-semibold uppercase tracking-[2px] text-crimson">
              Live session
            </Text>
            <Text className="mt-2 text-[18px] font-semibold text-mist">
              {game?.status === "rating"
                ? "Rate the cards you used tonight."
                : game?.awaitingPrivate
                  ? "Daytime is done. Unlock private time when you are ready."
                  : "You already have a Get Spicy night in motion."}
            </Text>
            <View className="mt-4">
              <PrimaryButton label="Return to the stage" onPress={resume} />
            </View>
          </View>
        ) : null}

        <View className="gap-3">
          {GAME_REGISTRY.map((module) => (
            <Pressable
              key={module.key}
              disabled={!module.available}
              onPress={() => {
                if (module.key === "get-spicy") void startSpicy();
              }}
              className={`rounded-[28px] border p-5 ${
                module.available
                  ? "border-neon/40 bg-white/5"
                  : "border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
                {module.available ? "Ready" : "Coming soon"}
              </Text>
              <Text className="mt-2 text-[26px] font-bold text-mist">
                {module.title}
              </Text>
              <Text className="mt-2 text-[15px] leading-6 text-mist/70">
                {module.tagline}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text className="mt-4 text-[14px] text-crimson">{error}</Text> : null}

        <View className="mt-6">
          <PrimaryButton
            label={live ? "Resume Get Spicy" : "Get Spicy tonight?"}
            loading={loading}
            onPress={() => void startSpicy()}
          />
        </View>

        {bestCards.length ? (
          <View className="mt-8">
            <Text className="text-[12px] font-semibold uppercase tracking-widest text-mist/40">
              Your best cards
            </Text>
            <View className="mt-3 gap-3">
              {bestCards.slice(0, 3).map((row) => {
                const copy = personalizeCard(row.card, names);
                return (
                  <View
                    key={row.card.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <Text className="text-[12px] text-neon">
                      {row.average.toFixed(1)} ★ · {row.votes}{" "}
                      {row.votes === 1 ? "vote" : "votes"}
                    </Text>
                    <Text className="mt-1 text-[16px] font-semibold text-mist">
                      {copy.body}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {nights.length ? (
          <View className="mt-8">
            <Text className="text-[12px] font-semibold uppercase tracking-widest text-mist/40">
              Nights together
            </Text>
            <Text className="mt-2 text-[15px] leading-6 text-mist/65">
              {nights.length} closed {nights.length === 1 ? "night" : "nights"} with{" "}
              {partner?.displayName ?? "your partner"}. Same pair. Same code.
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
