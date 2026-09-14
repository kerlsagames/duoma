import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import {
  catalogOrder,
  defaultHubLayout,
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
import { Pressable, ScrollView, Text, View } from "react-native";

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

      {settingsOpen ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 30,
            justifyContent: "flex-end",
            paddingBottom: 70,
          }}
        >
          <Pressable
            onPress={() => setSettingsOpen(false)}
            accessibilityLabel={`Close ${hub.label} settings`}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(8,8,12,0.72)",
            }}
          />
          <View
            style={{
              width: "100%",
              maxHeight: "88%",
              backgroundColor: "#14141A",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 22,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              borderTopWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
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
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <SectionLabel>View</SectionLabel>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
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
                        flex: 1,
                        minWidth: 0,
                        minHeight: 44,
                        paddingHorizontal: 6,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: on ? hub.accent : "rgba(255,255,255,0.08)",
                        backgroundColor: on ? hub.accentSoft : "#1A1A22",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#F4F4F6",
                          textAlign: "center",
                        }}
                      >
                        {row.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text
                style={{
                  marginBottom: 16,
                  fontSize: 13,
                  lineHeight: 18,
                  color: "rgba(244,244,246,0.5)",
                }}
              >
                {HUB_VIEW_OPTIONS.find((row) => row.id === layout.view)?.hint}
              </Text>

              {layout.view !== "compact" ? (
                <Pressable
                  onPress={() =>
                    void save((current) => ({
                      ...current,
                      showDetails: !current.showDetails,
                    }))
                  }
                  style={{
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    backgroundColor: "#1A1A22",
                    borderWidth: 1,
                    borderColor: layout.showDetails
                      ? hub.accent
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Ionicons
                    name={layout.showDetails ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={layout.showDetails ? hub.accent : "rgba(244,244,246,0.35)"}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
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
                </Pressable>
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
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        backgroundColor: "#1A1A22",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.08)",
                        opacity: hidden ? 0.55 : 1,
                      }}
                    >
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
                      <View
                        style={{
                          marginTop: 10,
                          flexDirection: "row",
                          gap: 8,
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
                            flex: 1,
                            minWidth: 0,
                            height: 40,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: 6,
                            backgroundColor: hidden
                              ? "rgba(255,255,255,0.04)"
                              : hub.accentSoft,
                          }}
                        >
                          <Ionicons
                            name={hidden ? "eye-off-outline" : "eye-outline"}
                            size={16}
                            color={hidden ? "rgba(244,244,246,0.55)" : hub.accent}
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: hidden ? "rgba(244,244,246,0.7)" : hub.accent,
                            }}
                          >
                            {hidden ? "Hidden" : "Visible"}
                          </Text>
                        </Pressable>
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
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255,255,255,0.06)",
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
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255,255,255,0.06)",
                            opacity: index === apps.length - 1 ? 0.25 : 1,
                          }}
                        >
                          <Ionicons name="chevron-down" size={18} color="#F4F4F6" />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>

              <Pressable
                onPress={() => void save(() => defaultHubLayout())}
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
      ) : null}
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
