import { AppIcon, FeatureApp } from "@/components/home/AppIcon";
import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { Screen } from "@/components/ui/Screen";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const MINI_APPS: { label: string; icon: IconName; href: string; hot?: boolean }[] = [
  { label: "Check-in", icon: "battery-charging", href: "/hub/check-in", hot: true },
  { label: "Curiosity", icon: "sparkles", href: "/hub/curiosity" },
  { label: "Calendar", icon: "calendar", href: "/hub/calendar" },
  { label: "Countdowns", icon: "timer", href: "/hub/milestones" },
  { label: "Desire", icon: "heart", href: "/hub/desire", hot: true },
  { label: "Coupons", icon: "ticket", href: "/hub/coupons" },
  { label: "Scratch", icon: "gift", href: "/hub/scratch" },
  { label: "The jar", icon: "file-tray", href: "/hub/jar" },
  { label: "Date night", icon: "wine", href: "/hub/planner", hot: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resume = () => {
    if (!game) return;
    if (game.status === "setup") router.push("/game/setup");
    else if (game.status === "selecting") router.push("/game/select");
    else if (["playing", "rating"].includes(game.status)) router.push("/game/play");
  };

  const live = Boolean(
    game && ["setup", "selecting", "playing", "rating", "inviting"].includes(game.status)
  );

  const startSpicy = async () => {
    setError(null);
    if (game?.status === "inviting") return;
    if (game && ["setup", "selecting", "playing", "rating"].includes(game.status)) {
      resume();
      return;
    }
    setLoading(true);
    try {
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
      <View className="pt-2 pb-10">
        <View className="items-center pt-2">
          <LinearGradient
            colors={["rgba(255,0,127,0.35)", "transparent"]}
            style={{
              position: "absolute",
              top: -40,
              width: 220,
              height: 140,
              borderRadius: 999,
            }}
          />
          <Text
            className="text-[11px] font-bold uppercase tracking-[6px] text-neon"
            style={{ textShadowColor: "#FF007F", textShadowRadius: 12 }}
          >
            Home
          </Text>
          <Text
            className="mt-1 text-[40px] font-black tracking-tight text-mist"
            style={{
              textShadowColor: "rgba(255,0,127,0.8)",
              textShadowRadius: 22,
              textShadowOffset: { width: 0, height: 0 },
            }}
          >
            DUOMA
          </Text>
          <Text className="mt-1 text-[14px] text-mist/70">
            Pick an app. Spark something.
          </Text>
        </View>

        <View className="mt-4">
          <PartnerConnectionBanner />
        </View>

        <FeatureApp
          kicker={live ? "In motion" : "Tonight"}
          title="The Spicy Game"
          blurb="A whole day leading to a steamy conclusion."
          icon="flame"
          live={live}
          onPress={() => void startSpicy()}
        />
        <FeatureApp
          kicker="Talk"
          title="Talk to me"
          blurb="Heat, us, or a dare. Read it out loud."
          icon="chatbubbles"
          onPress={() => router.push("/hub/talk" as Href)}
        />

        {loading ? (
          <Text className="mb-3 text-center text-[13px] text-neon">Lighting it up…</Text>
        ) : null}
        {error ? (
          <Text className="mb-3 text-center text-[13px] text-crimson">{error}</Text>
        ) : null}

        <Text className="mb-3 mt-2 text-[11px] font-bold uppercase tracking-[3px] text-neon">
          Your apps
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {MINI_APPS.map((app) => (
            <AppIcon
              key={app.href}
              label={app.label}
              icon={app.icon}
              hot={app.hot}
              onPress={() => router.push(app.href as Href)}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}
