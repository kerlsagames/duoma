import { CurrentStatus } from "@/components/home/CurrentStatus";
import { DuomaLogo } from "@/components/DuomaLogo";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { gameResumeHref } from "@/lib/home-status";
import { HOME_HEADER_WIDGETS, HUBS } from "@/lib/hubs";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Screen horizontal padding (~20) + gap between tiles.
  const tileWidth = Math.max(140, (width - 40 - 12) / 2);

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
      <View className="pt-1 pb-10">
        <View className="mb-3 items-center pt-1">
          <DuomaLogo size={44} />
        </View>

        {loading ? (
          <Text className="mb-2 text-center text-[12px] text-neon">
            Lighting it up…
          </Text>
        ) : null}
        {error ? (
          <Text className="mb-2 text-center text-[12px] text-crimson">
            {error}
          </Text>
        ) : null}

        {/* Persistent top widgets */}
        <View style={{ gap: 10, marginBottom: 18 }}>
          {HOME_HEADER_WIDGETS.map((widget) => (
            <Pressable
              key={widget.id}
              onPress={() => router.push(widget.href as Href)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 18,
                backgroundColor: "#14141A",
                borderWidth: 1,
                borderColor: `${widget.accent}44`,
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: `${widget.accent}22`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={widget.icon} size={24} color={widget.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#F4F4F6",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {widget.label}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    color: "rgba(244,244,246,0.55)",
                    fontSize: 13,
                    lineHeight: 18,
                  }}
                >
                  {widget.detail}
                </Text>
              </View>
              {widget.id === "calendar" ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    router.push("/hub/milestones");
                  }}
                  hitSlop={8}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: `${widget.accent}22`,
                  }}
                >
                  <Ionicons name="timer" size={18} color={widget.accent} />
                </Pressable>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(244,244,246,0.35)"
                />
              )}
            </Pressable>
          ))}
        </View>

        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(244,244,246,0.45)",
            marginBottom: 12,
          }}
        >
          Your hubs
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {HUBS.map((hub) => (
            <Pressable
              key={hub.id}
              onPress={() => router.push(hub.href as Href)}
              style={{
                width: tileWidth,
                minHeight: tileWidth,
                borderRadius: 22,
                padding: 14,
                backgroundColor: "#121218",
                borderWidth: 1,
                borderColor: hub.accentSoft,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: hub.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={hub.icon} size={26} color={hub.accent} />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 22,
                    lineHeight: 26,
                    color: "#F4F4F6",
                  }}
                >
                  {hub.label}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    color: "rgba(244,244,246,0.55)",
                    fontSize: 12,
                    lineHeight: 17,
                  }}
                  numberOfLines={2}
                >
                  {hub.tagline}
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: "rgba(244,244,246,0.4)",
                  }}
                >
                  {hub.features.length} features
                  {hub.features.some((f) => f.isNew)
                    ? ` · ${hub.features.filter((f) => f.isNew).length} new`
                    : ""}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <CurrentStatus onStartSpicy={() => void startSpicy()} />
      </View>
    </Screen>
  );
}
