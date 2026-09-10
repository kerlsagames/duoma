import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { GAME_REGISTRY } from "@/games/registry";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (game?.status === "setup") router.push("/game/setup");
  }, [game?.status, router]);

  const resume = () => {
    if (!game) return;
    if (game.status === "setup") router.push("/game/setup");
    else if (game.status === "selecting") router.push("/game/select");
    else if (game.status === "playing") router.push("/game/play");
  };

  const startSpicy = async () => {
    setError(null);
    setLoading(true);
    try {
      if (game?.status === "inviting") return;
      if (game && ["setup", "selecting", "playing"].includes(game.status)) {
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

  return (
    <Screen scroll>
      <View className="pt-4">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Fuse
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">Tonight</Text>
        <PartnerConnectionBanner />

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

        {game && ["setup", "selecting", "playing"].includes(game.status) ? (
          <View className="mb-5 rounded-3xl border border-crimson/40 bg-crimson/10 p-5">
            <Text className="text-[13px] font-semibold uppercase tracking-[2px] text-crimson">
              Live session
            </Text>
            <Text className="mt-2 text-[18px] font-semibold text-mist">
              You already have a Get Spicy night in motion.
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
            label={
              game && ["setup", "selecting", "playing"].includes(game.status)
                ? "Resume Get Spicy"
                : "Get Spicy tonight?"
            }
            loading={loading}
            onPress={() => void startSpicy()}
          />
        </View>
      </View>
    </Screen>
  );
}
