import { HubColorPicker, HubColorSectionLabel } from "@/components/home/HubColorPicker";
import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { HomeConnectButton } from "@/components/home/HomeConnectButton";
import { HomeForgotPassword } from "@/components/home/HomeForgotPassword";
import { HomeNotificationsBell } from "@/components/home/HomeNotificationsBell";
import { DuomaLogo } from "@/components/DuomaLogo";
import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { GenderPicker } from "@/components/ui/GenderPicker";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { personalizeCard, resolveCardGenders, resolveCardNames } from "@/lib/personalize";
import { isSupabaseConfigured } from "@/lib/supabase";
import { gameResumeHref } from "@/lib/home-status";
import {
  allHubApps,
  emptyFavoriteSlots,
  HOME_FAVORITE_SLOTS,
  hubAppById,
  loadHomeFavorites,
  saveHomeFavorites,
  type HomeFavoriteSlot,
  type HubAppOption,
} from "@/lib/home-favorites";
import {
  defaultHomeLayout,
  HOME_HUB_VIEW_OPTIONS,
  loadHomeLayout,
  saveHomeLayout,
  type HomeLayout,
} from "@/lib/home-layout";
import {
  HOME_WALLPAPER_ORDER,
  HOME_WALLPAPERS,
  loadHomeWallpaper,
  saveHomeWallpaper,
  type HomeWallpaperId,
} from "@/lib/home-wallpaper";
import {
  resetHubThemes,
  useHubThemes,
  useThemedHubs,
} from "@/lib/hub-theme";
import { HOME_HEADER_WIDGETS } from "@/lib/hubs";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { homeWorldWidget } from "@/lib/worlds";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { game, partner, sendSpicyInvite } = useApp();
  const { data: mini } = useMiniApps();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<HomeFavoriteSlot[]>(
    emptyFavoriteSlots()
  );
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [wallpaperId, setWallpaperId] = useState<HomeWallpaperId>("black");
  const [layout, setLayout] = useState<HomeLayout>(defaultHomeLayout());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hubs = useThemedHubs();
  const dailyWidgets = useMemo(() => {
    const world = homeWorldWidget(mini.worldChoice);
    return HOME_HEADER_WIDGETS.filter(
      (widget) => widget.id !== "world" || layout.showWorld
    ).map((widget) =>
      widget.id === "world"
        ? {
            ...widget,
            label: world.label,
            detail: world.detail,
            href: world.href,
            icon: world.icon,
            accent: world.accent,
          }
        : widget
    );
  }, [mini.worldChoice, layout.showWorld]);
  const favoriteGap = 8;
  const favoriteBox = 72;

  const appsByHub = useMemo(() => {
    const used = new Set(favorites.filter(Boolean) as string[]);
    return hubs.map((hub) => ({
      hub,
      apps: allHubApps(hubs).filter(
        (app) => app.hubId === hub.id && !used.has(app.id)
      ),
    })).filter((row) => row.apps.length > 0);
  }, [favorites, hubs]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [slots, paper, homeLayout] = await Promise.all([
        loadHomeFavorites(),
        loadHomeWallpaper(),
        loadHomeLayout(),
      ]);
      if (!alive) return;
      setFavorites(slots);
      setWallpaperId(paper);
      setLayout(homeLayout);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persistLayout = async (next: HomeLayout) => {
    setLayout(next);
    await saveHomeLayout(next);
  };

  const persistWallpaper = async (id: HomeWallpaperId) => {
    setWallpaperId(id);
    await saveHomeWallpaper(id);
  };

  const persistFavorites = async (next: HomeFavoriteSlot[]) => {
    setFavorites(next);
    await saveHomeFavorites(next);
  };

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

  const chooseFavorite = async (app: HubAppOption) => {
    if (pickerSlot === null) return;
    const next = [...favorites];
    next[pickerSlot] = app.id;
    setPickerSlot(null);
    await persistFavorites(next);
  };

  const clearFavorite = async (index: number) => {
    const next = [...favorites];
    next[index] = null;
    await persistFavorites(next);
  };

  const showTaglines = layout.hubView !== "compact" && layout.showHubTaglines;

  return (
    <HomeBackdrop wallpaperId={wallpaperId}>
    <Screen scroll background="transparent">
      <View className="pt-1 pb-10">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            paddingTop: 2,
            position: "relative",
            minHeight: 44,
          }}
        >
          <Pressable
            onPress={() => setSettingsOpen(true)}
            accessibilityLabel="Home settings"
            style={{
              position: "absolute",
              left: 0,
              top: 2,
              width: 40,
              height: 40,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(244,244,246,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="settings-outline" size={20} color="#F4F4F6" />
          </Pressable>
          <DuomaLogo size={44} />
          <View style={{ position: "absolute", right: 0, top: 2 }}>
            <HomeNotificationsBell onStartSpicy={() => void startSpicy()} />
          </View>
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

        <HomeConnectButton />
        <HomeForgotPassword />

        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(244,244,246,0.45)",
            marginBottom: 8,
          }}
        >
          Your hubs
        </Text>

        <View
          style={
            layout.hubView === "grid"
              ? {
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }
              : { gap: 8, marginBottom: 14 }
          }
        >
          {hubs.map((hub) => (
            <Pressable
              key={hub.id}
              onPress={() => router.push(hub.href as Href)}
              style={
                layout.hubView === "grid"
                  ? {
                      width: "48%",
                      marginBottom: 10,
                      borderRadius: 18,
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      backgroundColor: hub.tile,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }
                  : {
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: layout.hubView === "compact" ? 10 : 12,
                      paddingHorizontal: 12,
                      borderRadius: 16,
                      backgroundColor: hub.tile,
                    }
              }
            >
              <View
                style={{
                  width: layout.hubView === "compact" ? 36 : 48,
                  height: layout.hubView === "compact" ? 36 : 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={hub.icon}
                  size={layout.hubView === "compact" ? 20 : 28}
                  color={hub.tileInk}
                />
              </View>
              <View
                style={{
                  width: layout.hubView === "grid" ? "100%" : undefined,
                  flex: layout.hubView === "grid" ? undefined : 1,
                  alignItems: layout.hubView === "grid" ? "center" : "flex-start",
                }}
              >
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: layout.hubView === "compact" ? 16 : 18,
                    lineHeight: 22,
                    color: hub.tileInk,
                    textAlign: layout.hubView === "grid" ? "center" : "left",
                  }}
                >
                  {hub.label}
                </Text>
                {showTaglines ? (
                  <Text
                    style={{
                      marginTop: 2,
                      color: hub.tileInk,
                      opacity: 0.72,
                      fontSize: 11,
                      lineHeight: 14,
                      textAlign: layout.hubView === "grid" ? "center" : "left",
                    }}
                    numberOfLines={1}
                  >
                    {hub.tagline}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>

        {layout.showDaily ? (
          <>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(244,244,246,0.45)",
            marginBottom: 8,
          }}
        >
          Daily rhythm
        </Text>

        <View style={{ gap: 8 }}>
          {dailyWidgets.map((widget) => (
            <Pressable
              key={widget.id}
              onPress={() => router.push(widget.href as Href)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: "#14141A",
                borderWidth: 1,
                borderColor: `${widget.accent}44`,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: `${widget.accent}22`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={widget.icon} size={18} color={widget.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#F4F4F6",
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {widget.label}
                </Text>
                <Text
                  style={{
                    marginTop: 1,
                    color: "rgba(244,244,246,0.5)",
                    fontSize: 11,
                    lineHeight: 15,
                  }}
                  numberOfLines={1}
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
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: `${widget.accent}22`,
                  }}
                >
                  <Ionicons name="timer" size={16} color={widget.accent} />
                </Pressable>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(244,244,246,0.35)"
                />
              )}
            </Pressable>
          ))}
        </View>
          </>
        ) : null}

        {layout.showFavorites ? (
          <>
        <Text
          style={{
            marginTop: 12,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(244,244,246,0.45)",
            marginBottom: 8,
          }}
        >
          Favorites
        </Text>

        <View
          style={{
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: "rgba(244,244,246,0.28)",
            borderRadius: 18,
            padding: 10,
            backgroundColor: "#121218",
          }}
        >
          <View style={{ flexDirection: "row", gap: favoriteGap }}>
            {favorites.map((featureId, index) => {
              const app = featureId ? hubAppById(featureId, hubs) : null;
              if (app) {
                return (
                  <Pressable
                    key={`fav-${index}`}
                    onPress={() => router.push(app.href as Href)}
                    onLongPress={() => void clearFavorite(index)}
                    style={{
                      flex: 1,
                      height: favoriteBox,
                      borderRadius: 14,
                      backgroundColor: "#1A1A22",
                      borderWidth: 1,
                      borderColor: `${app.accent}55`,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 4,
                    }}
                  >
                    <Ionicons name={app.icon} size={22} color={app.accent} />
                    <Text
                      style={{
                        marginTop: 4,
                        color: "#F4F4F6",
                        fontSize: 10,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {app.label}
                    </Text>
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={`fav-empty-${index}`}
                  onPress={() => setPickerSlot(index)}
                  style={{
                    flex: 1,
                    height: favoriteBox,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderStyle: "dashed",
                    borderColor: "rgba(244,244,246,0.28)",
                    backgroundColor: "#1A1A22",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="add"
                    size={28}
                    color="rgba(244,244,246,0.55)"
                  />
                </Pressable>
              );
            })}
          </View>
          <Text
            style={{
              marginTop: 8,
              color: "rgba(244,244,246,0.4)",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            Tap + to pin an app · long-press a favorite to remove
          </Text>
        </View>
          </>
        ) : null}
      </View>

      <Modal
        visible={pickerSlot !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerSlot(null)}
      >
        <Pressable
          onPress={() => setPickerSlot(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.72)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            style={{
              maxHeight: "78%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              backgroundColor: "#121218",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              paddingTop: 16,
              paddingBottom: 28,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 42,
                height: 4,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.2)",
                marginBottom: 14,
              }}
            />
            <Text
              style={{
                paddingHorizontal: 20,
                fontFamily: SERIF,
                fontSize: 24,
                color: "#F4F4F6",
              }}
            >
              Add a favorite
            </Text>
            <Text
              style={{
                marginTop: 6,
                paddingHorizontal: 20,
                color: "rgba(244,244,246,0.55)",
                fontSize: 13,
                lineHeight: 18,
              }}
            >
              Pick any app from Connect, Desire, Fun, or Home Base.
            </Text>

            <ScrollView
              style={{ marginTop: 14 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
            >
              {appsByHub.length === 0 ? (
                <Text
                  style={{
                    color: "rgba(244,244,246,0.5)",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 24,
                  }}
                >
                  All apps are already pinned.
                </Text>
              ) : (
                appsByHub.map(({ hub, apps }) => (
                  <View key={hub.id} style={{ marginBottom: 18 }}>
                    <Text
                      style={{
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: hub.accent,
                        marginBottom: 8,
                        marginLeft: 4,
                      }}
                    >
                      {hub.label}
                    </Text>
                    <View style={{ gap: 8 }}>
                      {apps.map((app) => (
                        <Pressable
                          key={app.id}
                          onPress={() => void chooseFavorite(app)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            backgroundColor: "#1A1A22",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.08)",
                          }}
                        >
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              backgroundColor: `${hub.accent}22`,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Ionicons
                              name={app.icon}
                              size={20}
                              color={hub.accent}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: "#F4F4F6",
                                fontSize: 15,
                                fontWeight: "700",
                              }}
                            >
                              {app.label}
                            </Text>
                            <Text
                              style={{
                                marginTop: 2,
                                color: "rgba(244,244,246,0.5)",
                                fontSize: 12,
                              }}
                              numberOfLines={1}
                            >
                              {app.detail}
                            </Text>
                          </View>
                          <Ionicons
                            name="add-circle"
                            size={22}
                            color={hub.accent}
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
    {settingsOpen ? (
      <HomeSettingsSheet
        layout={layout}
        wallpaperId={wallpaperId}
        worldLabel={homeWorldWidget(mini.worldChoice).label}
        hasWorld={Boolean(mini.worldChoice.worldId)}
        onClose={() => setSettingsOpen(false)}
        onLayout={(next) => void persistLayout(next)}
        onWallpaper={(id) => void persistWallpaper(id)}
        onReset={() => {
          void persistLayout(defaultHomeLayout());
          void persistWallpaper("black");
          void resetHubThemes();
        }}
      />
    ) : null}
    </HomeBackdrop>
  );
}

function HomeSettingsSheet({
  layout,
  wallpaperId,
  worldLabel,
  hasWorld,
  onClose,
  onLayout,
  onWallpaper,
  onReset,
}: {
  layout: HomeLayout;
  worldLabel: string;
  hasWorld: boolean;
  wallpaperId: HomeWallpaperId;
  onClose: () => void;
  onLayout: (next: HomeLayout) => void;
  onWallpaper: (id: HomeWallpaperId) => void;
  onReset: () => void;
}) {
  const router = useRouter();
  const {
    user,
    couple,
    partner,
    signOut,
    nights,
    bestCards,
    setProfileGender,
  } = useApp();
  const hubThemes = useHubThemes();
  const names = resolveCardNames({
    userName: user?.displayName,
    partnerName: partner?.displayName,
  });
  const genders = resolveCardGenders({
    userGender: user?.gender,
    partnerGender: partner?.gender,
  });
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        justifyContent: "flex-end",
        paddingBottom: 70,
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close home settings"
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
          paddingBottom: 18,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: "#FF007F",
              }}
            >
              Home
            </Text>
            <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 22, color: "#F4F4F6" }}>
              Settings
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close settings">
            <Ionicons name="close" size={22} color="#F4F4F6" />
          </Pressable>
        </View>
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.6,
              color: "rgba(244,244,246,0.45)",
              marginBottom: 8,
            }}
          >
            LAYOUT
          </Text>
          {HOME_HUB_VIEW_OPTIONS.map((option) => {
            const on = layout.hubView === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onLayout({ ...layout, hubView: option.id })}
                style={{
                  marginBottom: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: on ? "#FF007F" : "rgba(255,255,255,0.1)",
                  backgroundColor: on ? "rgba(255,0,127,0.12)" : "#1A1A22",
                }}
              >
                <Text style={{ color: "#F4F4F6", fontSize: 16, fontWeight: "700" }}>
                  {option.label}
                </Text>
                <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.5)", fontSize: 12 }}>
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
          <ToggleRow
            label="Show hub blurbs"
            on={layout.showHubTaglines}
            disabled={layout.hubView === "compact"}
            onPress={() =>
              onLayout({ ...layout, showHubTaglines: !layout.showHubTaglines })
            }
          />
          <ToggleRow
            label="Daily rhythm"
            on={layout.showDaily}
            onPress={() => onLayout({ ...layout, showDaily: !layout.showDaily })}
          />
          <ToggleRow
            label="Shared world"
            on={layout.showWorld}
            onPress={() => {
              const next = !layout.showWorld;
              onLayout({ ...layout, showWorld: next });
              if (next && !hasWorld) {
                onClose();
                router.push("/hub/worlds" as Href);
              }
            }}
          />
          {layout.showWorld ? (
            <Pressable
              onPress={() => {
                onClose();
                router.push("/hub/worlds" as Href);
              }}
              style={{
                marginBottom: 8,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(124,255,178,0.28)",
                backgroundColor: "#1A1A22",
              }}
            >
              <Text style={{ color: "#F4F4F6", fontSize: 16, fontWeight: "700" }}>
                {hasWorld ? "Change world" : "Choose a world"}
              </Text>
              <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.5)", fontSize: 12 }}>
                {hasWorld ? worldLabel : "Five styles. Lock one in together."}
              </Text>
            </Pressable>
          ) : null}
          <ToggleRow
            label="Favorites strip"
            on={layout.showFavorites}
            onPress={() => onLayout({ ...layout, showFavorites: !layout.showFavorites })}
          />

          <HubColorSectionLabel />
          <HubColorPicker themes={hubThemes} />

          <Text
            style={{
              marginTop: 18,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.6,
              color: "rgba(244,244,246,0.45)",
              marginBottom: 8,
            }}
          >
            BACKGROUND
          </Text>
          <Text
            style={{
              marginBottom: 10,
              color: "rgba(244,244,246,0.55)",
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            Black is the default. Twenty more papers if you want a different room.
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {HOME_WALLPAPER_ORDER.map((id) => (
              <WallpaperSwatch
                key={id}
                id={id}
                selected={wallpaperId === id}
                onPress={() => onWallpaper(id)}
              />
            ))}
          </View>

          <Pressable onPress={onReset} style={{ marginTop: 18, paddingVertical: 10 }}>
            <Text style={{ color: "#FF007F", fontSize: 14, fontWeight: "700" }}>
              Reset home
            </Text>
            <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
              Two-column hubs, all sections on, original colours, black background.
            </Text>
          </Pressable>

          <Text
            style={{
              marginTop: 22,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.6,
              color: "rgba(244,244,246,0.45)",
              marginBottom: 8,
            }}
          >
            COUPLE
          </Text>
          <PartnerConnectionBanner />
          <View
            style={{
              marginBottom: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: "#1A1A22",
            }}
          >
            <Text style={{ color: "#F4F4F6", fontSize: 15, fontWeight: "700" }}>
              Male / Female
            </Text>
            <Text
              style={{
                marginTop: 4,
                marginBottom: 10,
                color: "rgba(244,244,246,0.5)",
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              Get Spicy uses this for wording. Change it if you got it wrong.
            </Text>
            <View style={{ gap: 12 }}>
              <GenderPicker
                value={user?.gender ?? null}
                onChange={(gender) => void setProfileGender("you", gender)}
                label="I am"
              />
              <GenderPicker
                value={partner?.gender ?? null}
                onChange={(gender) => void setProfileGender("partner", gender)}
                label={partner ? `${partner.displayName} is` : "Partner is"}
              />
            </View>
          </View>
          <LinkRow
            label="Notifications"
            hint="Lock-screen pings and what shows on the Home bell."
            onPress={() => {
              onClose();
              router.push("/hub/notification-settings" as Href);
            }}
          />
          <LinkRow
            label="Card Bank"
            hint="Toggle rotation. Write custom cards with your names."
            onPress={() => {
              onClose();
              router.push("/(tabs)/cards" as Href);
            }}
          />
          <LinkRow
            label="How it works"
            hint="Pairing, the four hubs, calendar, and Get Spicy."
            onPress={() => {
              onClose();
              router.push("/how-to" as Href);
            }}
          />
          <View
            style={{
              marginBottom: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: "#1A1A22",
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: "rgba(244,244,246,0.45)",
              }}
            >
              PAIR CODE
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: "SpaceMono",
                fontSize: 24,
                letterSpacing: 6,
                color: "#F4F4F6",
                fontWeight: "700",
              }}
            >
              {couple?.inviteCode ?? "------"}
            </Text>
            <Text
              style={{
                marginTop: 6,
                color: "rgba(244,244,246,0.5)",
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              {partner
                ? `You stay paired with ${partner.displayName}${partner.isDemo ? " (demo)" : ""}. Sign out does not unpair you.`
                : "Share this code so your partner can join."}
            </Text>
          </View>
          <View
            style={{
              marginBottom: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: "#1A1A22",
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: "rgba(244,244,246,0.45)",
              }}
            >
              NIGHTS TOGETHER
            </Text>
            {nights.length === 0 ? (
              <Text
                style={{
                  marginTop: 6,
                  color: "rgba(244,244,246,0.5)",
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                No closed nights yet. Play Get Spicy and they land here.
              </Text>
            ) : (
              nights.slice(0, 6).map((night) => (
                <Text
                  key={night.id}
                  style={{ marginTop: 6, color: "#F4F4F6", fontSize: 14 }}
                >
                  {new Date(night.updatedAt).toLocaleDateString()} ·{" "}
                  {night.status === "rating" ? "rating cards" : "closed"}
                </Text>
              ))
            )}
          </View>
          <View
            style={{
              marginBottom: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: "#1A1A22",
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: "rgba(244,244,246,0.45)",
              }}
            >
              BEST CARDS
            </Text>
            {bestCards.length === 0 ? (
              <Text
                style={{
                  marginTop: 6,
                  color: "rgba(244,244,246,0.5)",
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                After a night, rate what you played. Keepers show up here.
              </Text>
            ) : (
              bestCards.slice(0, 4).map((row) => {
                const copy = personalizeCard(row.card, names, genders);
                return (
                  <View key={row.card.id} style={{ marginTop: 8 }}>
                    <Text style={{ color: "#FF007F", fontSize: 12 }}>
                      {row.average.toFixed(1)}/10
                    </Text>
                    <Text
                      style={{
                        marginTop: 2,
                        color: "#F4F4F6",
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      {copy.body}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
          <View
            style={{
              marginBottom: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: "#1A1A22",
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: "rgba(244,244,246,0.45)",
              }}
            >
              BACKEND
            </Text>
            <Text
              style={{
                marginTop: 6,
                color: "#F4F4F6",
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              {isSupabaseConfigured ? "Supabase connected" : "Local realtime mode"}
            </Text>
            <Text
              style={{
                marginTop: 4,
                color: "rgba(244,244,246,0.5)",
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              {isSupabaseConfigured
                ? "Invites, cards, and game state sync through Supabase."
                : "Pairing works across tabs on this device. Add project keys to go cloud."}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              onClose();
              void signOut();
              router.replace("/welcome");
            }}
            style={{ marginTop: 8, paddingVertical: 12 }}
          >
            <Text style={{ color: "#FF007F", fontSize: 15, fontWeight: "700" }}>
              Sign out
            </Text>
            <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
              Does not unpair you. Continue as {user?.displayName ?? "you"} next time.
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function LinkRow({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: "#1A1A22",
      }}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 15, fontWeight: "700" }}>
          {label}
        </Text>
        <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.5)", fontSize: 12 }}>
          {hint}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(244,244,246,0.4)" />
    </Pressable>
  );
}

function ToggleRow({
  label,
  on,
  onPress,
  disabled,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: "#1A1A22",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Text style={{ color: "#F4F4F6", fontSize: 15 }}>{label}</Text>
      <Ionicons
        name={on ? "checkbox" : "square-outline"}
        size={22}
        color={on ? "#FF007F" : "rgba(244,244,246,0.4)"}
      />
    </Pressable>
  );
}

function WallpaperSwatch({
  id,
  selected,
  onPress,
}: {
  id: HomeWallpaperId;
  selected: boolean;
  onPress: () => void;
}) {
  const paper = HOME_WALLPAPERS[id];
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "23%",
        marginBottom: 10,
      }}
    >
      <View
        style={{
          height: 56,
          borderRadius: 10,
          overflow: "hidden",
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "#FF007F" : "rgba(255,255,255,0.12)",
          backgroundColor: paper.color,
        }}
      >
        {paper.gradient ? (
          <LinearGradient
            colors={paper.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          />
        ) : null}
        {paper.source ? (
          <Image
            source={paper.source}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : null}
      </View>
      <Text
        style={{
          marginTop: 4,
          color: selected ? "#FF007F" : "rgba(244,244,246,0.65)",
          fontSize: 10,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {paper.label}
      </Text>
    </Pressable>
  );
}
