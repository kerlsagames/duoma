import { AppIcon } from "@/components/home/AppIcon";
import { CurrentStatus } from "@/components/home/CurrentStatus";
import { DuomaLogo } from "@/components/DuomaLogo";
import { Screen } from "@/components/ui/Screen";
import { gameResumeHref } from "@/lib/home-status";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const APPS: {
  label: string;
  icon: IconName;
  href?: string;
  spicy?: boolean;
  hot?: boolean;
}[] = [
  { label: "Spicy Game", icon: "flame", spicy: true, hot: true },
  { label: "Talk to me", icon: "chatbubbles", href: "/hub/talk" },
  { label: "Check-in", icon: "battery-charging", href: "/hub/check-in", hot: true },
  { label: "Curiosity", icon: "sparkles", href: "/hub/curiosity" },
  { label: "Calendar", icon: "calendar", href: "/hub/calendar" },
  { label: "Countdowns", icon: "timer", href: "/hub/milestones" },
  { label: "Up for it", icon: "flash", href: "/hub/up-for-it", hot: true },
  { label: "Coupons", icon: "ticket", href: "/hub/coupons" },
  { label: "Lists", icon: "map", href: "/hub/lists" },
  { label: "The jar", icon: "file-tray", href: "/hub/jar" },
  { label: "Date night", icon: "wine", href: "/hub/planner", hot: true },
  { label: "Settings", icon: "settings-sharp", href: "/hub/settings" },
  { label: "Positions", icon: "body", href: "/hub/positions", hot: true },
  { label: "Roleplays", icon: "sparkles", href: "/hub/roleplays", hot: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const live = Boolean(
    game && ["setup", "selecting", "playing", "rating", "inviting"].includes(game.status)
  );

  const startSpicy = async () => {
    setError(null);
    const resume = gameResumeHref(game);
    if (resume) {
      router.push(resume);
      return;
    }
    if (game?.status === "inviting") return;
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
      <View className="pt-1 pb-8">
        <View className="mb-3 items-center pt-1">
          <DuomaLogo size={44} />
        </View>

        {loading ? (
          <Text className="mb-2 text-center text-[12px] text-neon">Lighting it up…</Text>
        ) : null}
        {error ? (
          <Text className="mb-2 text-center text-[12px] text-crimson">{error}</Text>
        ) : null}

        <View className="flex-row flex-wrap justify-between">
          {APPS.map((app) => (
            <AppIcon
              key={app.label}
              label={app.label}
              icon={app.icon}
              hot={app.hot}
              live={app.spicy ? live : false}
              onPress={() => {
                if (app.spicy) {
                  void startSpicy();
                  return;
                }
                if (app.href) router.push(app.href as Href);
              }}
            />
          ))}
        </View>

        <CurrentStatus onStartSpicy={() => void startSpicy()} />
      </View>
    </Screen>
  );
}
