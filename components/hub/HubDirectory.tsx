import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import {
  catalogOrder,
  HUB_VIEW_OPTIONS,
  moveFeature,
  toggleHidden,
  useHubLayout,
  type HubView,
} from "@/lib/hub-layout";
import type { HubFeature, HubId } from "@/lib/hubs";
import { gameResumeHref } from "@/lib/home-status";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";

/** Feature directory for one of the four top-level hubs. */
export function HubDirectory({ hubId }: { hubId: HubId }) {
  const { hub, layout, visible, apps, save } = useHubLayout(hubId);
  const router = useRouter();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!hub) {
    return (
      <HomeBackdrop>
        <Screen background="transparent">
          <Text className="text-mist">Hub not found.</Text>
        </Screen>
      </HomeBackdrop>
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

  const showDetails = layout.view !== "compact" && layout.showDetails;
  const catalog = catalogOrder(hub);

  return (
    <HomeBackdrop>
      <Screen scroll background="transparent">
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
            <Pressable
              onPress={() => setSettingsOpen(true)}
              accessibilityLabel={`${hub.label} settings`}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: "#14141A",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="settings-outline" size={20} color={hub.accent} />
            </Pressable>
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

          {visible.length === 0 ? (
            <View
              style={{
                paddingVertical: 28,
                paddingHorizontal: 18,
                borderRadius: 18,
                backgroundColor: "#14141A",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: "#F4F4F6",
                }}
              >
                Every app is hidden
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontSize: 15,
                  lineHeight: 22,
                  color: "rgba(244,244,246,0.55)",
                }}
              >
                Open the cog to bring some back, or reset this hub to the default list.
              </Text>
              <Pressable
                onPress={() => setSettingsOpen(true)}
                style={{
                  marginTop: 16,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: hub.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "700", color: hub.accent }}>Open settings</Text>
              </Pressable>
            </View>
          ) : layout.view === "grid" ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                rowGap: 10,
              }}
            >
              {visible.map((feature) => (
                <GridTile
                  key={feature.id}
                  feature={feature}
                  accent={hub.accent}
                  accentSoft={hub.accentSoft}
                  showDetails={showDetails}
                  onPress={() => void openFeature(feature.id, feature.href)}
                />
              ))}
            </View>
          ) : (
            <View style={{ gap: layout.view === "compact" ? 6 : 10 }}>
              {visible.map((feature) => (
                <ListRow
                  key={feature.id}
                  feature={feature}
                  accent={hub.accent}
                  accentSoft={hub.accentSoft}
                  compact={layout.view === "compact"}
                  showDetails={showDetails}
                  onPress={() => void openFeature(feature.id, feature.href)}
                />
              ))}
            </View>
          )}
        </View>
      </Screen>

      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(8,8,12,0.72)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={() => setSettingsOpen(false)}
            accessibilityLabel={`Close ${hub.label} settings`}
          />
          <View
            style={{
              backgroundColor: "#14141A",
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 28,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              borderTopWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              maxHeight: "88%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    color: hub.accent,
                  }}
                >
                  {hub.label}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: SERIF,
                    fontSize: 22,
                    color: "#F4F4F6",
                  }}
                >
                  Hub settings
                </Text>
              </View>
              <Pressable onPress={() => setSettingsOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color="#F4F4F6" />
              </Pressable>
            </View>

            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <SectionLabel>View</SectionLabel>
              <View style={{ gap: 8, marginBottom: 20 }}>
                {HUB_VIEW_OPTIONS.map((row) => {
                  const on = layout.view === row.id;
                  return (
                    <Pressable
                      key={row.id}
                      onPress={() =>
                        void save((current) => ({
                          ...current,
                          view: row.id as HubView,
                        }))
                      }
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: on ? hub.accent : "rgba(255,255,255,0.08)",
                        backgroundColor: on ? hub.accentSoft : "#1A1A22",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#F4F4F6",
                          }}
                        >
                          {row.label}
                        </Text>
                        <Ionicons
                          name={on ? "radio-button-on" : "radio-button-off"}
                          size={20}
                          color={on ? hub.accent : "rgba(244,244,246,0.35)"}
                        />
                      </View>
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 13,
                          color: "rgba(244,244,246,0.5)",
                          paddingRight: 28,
                        }}
                      >
                        {row.hint}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {layout.view !== "compact" ? (
                <View
                  style={{
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    backgroundColor: "#1A1A22",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#F4F4F6" }}>
                      Show blurbs
                    </Text>
                    <Text
                      style={{
                        marginTop: 3,
                        fontSize: 13,
                        color: "rgba(244,244,246,0.5)",
                      }}
                    >
                      Turn off if you already know what each app does.
                    </Text>
                  </View>
                  <Switch
                    value={layout.showDetails}
                    onValueChange={(value) =>
                      void save((current) => ({ ...current, showDetails: value }))
                    }
                    trackColor={{ false: "#2A2A32", true: hub.accent }}
                    thumbColor="#F4F4F6"
                  />
                </View>
              ) : null}

              <SectionLabel>Apps</SectionLabel>
              <Text
                style={{
                  marginTop: -8,
                  marginBottom: 10,
                  fontSize: 13,
                  color: "rgba(244,244,246,0.5)",
                }}
              >
                Hide what you never open. Move the rest so your favourites sit at the top.
              </Text>
              <View style={{ gap: 8, marginBottom: 20 }}>
                {apps.map((feature, index) => {
                  const hidden = layout.hidden.includes(feature.id);
                  return (
                    <View
                      key={feature.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        backgroundColor: "#1A1A22",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.08)",
                        opacity: hidden ? 0.55 : 1,
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          void save((current) => ({
                            ...current,
                            hidden: toggleHidden(current.hidden, feature.id),
                          }))
                        }
                        accessibilityLabel={
                          hidden ? `Show ${feature.label}` : `Hide ${feature.label}`
                        }
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: hidden ? "rgba(255,255,255,0.04)" : hub.accentSoft,
                        }}
                      >
                        <Ionicons
                          name={hidden ? "eye-off-outline" : "eye-outline"}
                          size={18}
                          color={hidden ? "rgba(244,244,246,0.55)" : hub.accent}
                        />
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#F4F4F6",
                          }}
                        >
                          {feature.label}
                        </Text>
                        {hidden ? (
                          <Text
                            style={{
                              marginTop: 2,
                              fontSize: 12,
                              color: "rgba(244,244,246,0.45)",
                            }}
                          >
                            Hidden
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() =>
                          void save((current) => ({
                            ...current,
                            order: moveFeature(current.order, catalog, feature.id, -1),
                          }))
                        }
                        disabled={index === 0}
                        accessibilityLabel={`Move ${feature.label} up`}
                        style={{
                          width: 32,
                          height: 32,
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: index === 0 ? 0.25 : 1,
                        }}
                      >
                        <Ionicons name="chevron-up" size={18} color="#F4F4F6" />
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          void save((current) => ({
                            ...current,
                            order: moveFeature(current.order, catalog, feature.id, 1),
                          }))
                        }
                        disabled={index === apps.length - 1}
                        accessibilityLabel={`Move ${feature.label} down`}
                        style={{
                          width: 32,
                          height: 32,
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: index === apps.length - 1 ? 0.25 : 1,
                        }}
                      >
                        <Ionicons name="chevron-down" size={18} color="#F4F4F6" />
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              <Pressable
                onPress={() => void save(() => ({
                  order: [],
                  hidden: [],
                  view: "list",
                  showDetails: true,
                }))}
                style={{
                  height: 46,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "700", color: "rgba(244,244,246,0.75)" }}>
                  Reset this hub
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </HomeBackdrop>
  );
}

function ListRow({
  feature,
  accent,
  accentSoft,
  compact,
  showDetails,
  onPress,
}: {
  feature: HubFeature;
  accent: string;
  accentSoft: string;
  compact: boolean;
  showDetails: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: compact ? 12 : 14,
        paddingVertical: compact ? 10 : 14,
        paddingHorizontal: compact ? 12 : 14,
        borderRadius: compact ? 14 : 18,
        backgroundColor: "#14141A",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <View
        style={{
          width: compact ? 36 : 42,
          height: compact ? 36 : 42,
          borderRadius: compact ? 11 : 13,
          backgroundColor: accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={feature.icon} size={compact ? 18 : 22} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#F4F4F6",
            fontSize: compact ? 15 : 16,
            fontWeight: "700",
          }}
        >
          {feature.label}
        </Text>
        {showDetails ? (
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
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(244,244,246,0.35)" />
    </Pressable>
  );
}

function GridTile({
  feature,
  accent,
  accentSoft,
  showDetails,
  onPress,
}: {
  feature: HubFeature;
  accent: string;
  accentSoft: string;
  showDetails: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "48.2%",
        minHeight: showDetails ? 132 : 108,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: "#14141A",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          backgroundColor: accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={feature.icon} size={20} color={accent} />
      </View>
      <Text
        style={{
          marginTop: 12,
          color: "#F4F4F6",
          fontSize: 15,
          fontWeight: "700",
          lineHeight: 20,
        }}
      >
        {feature.label}
      </Text>
      {showDetails ? (
        <Text
          numberOfLines={2}
          style={{
            marginTop: 4,
            color: "rgba(244,244,246,0.5)",
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          {feature.detail}
        </Text>
      ) : null}
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        marginBottom: 10,
        fontFamily: "SpaceMono",
        fontSize: 11,
        letterSpacing: 1.6,
        textTransform: "uppercase",
        color: "rgba(244,244,246,0.45)",
      }}
    >
      {children}
    </Text>
  );
}
