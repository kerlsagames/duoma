import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { hubById, type HubId } from "@/lib/hubs";
import { gameResumeHref } from "@/lib/home-status";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

/** Feature directory for one of the four top-level hubs. */
export function HubDirectory({ hubId }: { hubId: HubId }) {
  const hub = hubById(hubId);
  const router = useRouter();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!hub) {
    return (
      <Screen>
        <Text className="text-mist">Hub not found.</Text>
      </Screen>
    );
  }

  const openFeature = async (featureId: string, href: string) => {
    setError(null);
    if (featureId === "spicy") {
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
      return;
    }
    router.push(href as Href);
  };

  return (
    <Screen scroll background="#0B0B0E">
      <View className="pt-4 pb-10">
        <BackButton
          color={hub.accent}
          fallback="/"
          style={{ marginBottom: 14 }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: hub.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={hub.icon} size={24} color={hub.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: hub.accent,
              }}
            >
              Hub
            </Text>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 30,
                lineHeight: 36,
                color: "#F4F4F6",
              }}
            >
              {hub.label}
            </Text>
          </View>
        </View>

        <Text
          style={{
            marginTop: 4,
            marginBottom: 18,
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 24,
            color: "rgba(244,244,246,0.58)",
          }}
        >
          {hub.tagline}
        </Text>

        {loading ? (
          <Text
            style={{
              marginBottom: 10,
              textAlign: "center",
              color: hub.accent,
              fontSize: 12,
            }}
          >
            Lighting it up…
          </Text>
        ) : null}
        {error ? (
          <Text
            style={{
              marginBottom: 10,
              textAlign: "center",
              color: "#FF6B7A",
              fontSize: 12,
            }}
          >
            {error}
          </Text>
        ) : null}

        <View style={{ gap: 10 }}>
          {hub.features.map((feature) => (
            <Pressable
              key={feature.id}
              onPress={() => void openFeature(feature.id, feature.href)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 18,
                backgroundColor: "#14141A",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  backgroundColor: hub.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={feature.icon} size={22} color={hub.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text
                    style={{
                      color: "#F4F4F6",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {feature.label}
                  </Text>
                  {feature.isNew ? (
                    <View
                      style={{
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                        borderRadius: 8,
                        backgroundColor: hub.accentSoft,
                      }}
                    >
                      <Text
                        style={{
                          color: hub.accent,
                          fontSize: 10,
                          fontWeight: "700",
                          letterSpacing: 0.8,
                        }}
                      >
                        NEW
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={{
                    marginTop: 2,
                    color: "rgba(244,244,246,0.55)",
                    fontSize: 13,
                    lineHeight: 18,
                  }}
                >
                  {feature.detail}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="rgba(244,244,246,0.35)"
              />
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
