import { CurrentStatus } from "@/components/home/CurrentStatus";
import { DuomaLogo } from "@/components/DuomaLogo";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { gameResumeHref } from "@/lib/home-status";
import { HOME_HEADER_WIDGETS, HOME_QUICK_LINKS, HUBS } from "@/lib/hubs";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          Jump back in
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {HOME_QUICK_LINKS.map((link) => (
            <Pressable
              key={link.id}
              onPress={() => router.push(link.href as Href)}
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderRadius: 18,
                backgroundColor: "#14141A",
                borderWidth: 1,
                borderColor: `${link.accent}55`,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: `${link.accent}22`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons name={link.icon} size={20} color={link.accent} />
              </View>
              <Text
                style={{
                  color: "#F4F4F6",
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                {link.label}
              </Text>
              <Text
                style={{
                  marginTop: 3,
                  color: "rgba(244,244,246,0.5)",
                  fontSize: 12,
                  lineHeight: 16,
                }}
              >
                {link.detail}
              </Text>
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

        <View style={{ gap: 12 }}>
          {HUBS.map((hub) => (
            <Pressable
              key={hub.id}
              onPress={() => router.push(hub.href as Href)}
              style={{
                borderRadius: 22,
                padding: 16,
                backgroundColor: "#121218",
                borderWidth: 1,
                borderColor: hub.accentSoft,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                    backgroundColor: hub.accentSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={hub.icon} size={28} color={hub.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 24,
                      lineHeight: 28,
                      color: "#F4F4F6",
                    }}
                  >
                    {hub.label}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      color: "rgba(244,244,246,0.55)",
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {hub.tagline}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={hub.accent} />
              </View>
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "rgba(244,244,246,0.4)",
                }}
              >
                {hub.features.length} features
                {hub.features.some((f) => f.isNew)
                  ? ` · ${hub.features.filter((f) => f.isNew).length} new`
                  : ""}
              </Text>
            </Pressable>
          ))}
        </View>

        <CurrentStatus onStartSpicy={() => void startSpicy()} />
      </View>
    </Screen>
  );
}
