import { HubColorPicker, HubColorSectionLabel } from "@/components/home/HubColorPicker";
import { HomeBackdrop } from "@/components/home/HomeBackdrop";
import { HomeConnectButton } from "@/components/home/HomeConnectButton";
import { HomeDemoFlip } from "@/components/home/HomeDemoFlip";
import { HomeNotificationsBell } from "@/components/home/HomeNotificationsBell";
import { HomeNotificationCards } from "@/components/home/HomeNotificationCards";
import { HomePingNudge } from "@/components/home/HomePingNudge";
import { HomeStatsSheet } from "@/components/home/HomeStatsSheet";
import { HubGlyph } from "@/components/hub/HubGlyph";
import { FeedbackSheet } from "@/components/FeedbackSheet";
import { DuomaLogo } from "@/components/DuomaLogo";
import { InstallHomeScreenCard } from "@/components/InstallHomeScreenCard";
import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GenderPicker } from "@/components/ui/GenderPicker";
import { ReportSheet } from "@/components/ReportSheet";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { gameResumeHref } from "@/lib/home-status";
import {
  allHubApps,
  emptyFavoriteSlots,
  hubAppById,
  loadHomeFavorites,
  resizeFavoriteSlots,
  saveHomeFavorites,
  type HomeFavoriteSlot,
  type HubAppOption,
} from "@/lib/home-favorites";
import {
  defaultHomeLayout,
  HOME_FAVORITE_SLOT_MAX,
  HOME_FAVORITE_SLOT_MIN,
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
import { HOME_HEADER_WIDGETS, type HubId } from "@/lib/hubs";
import { useMiniApps } from "@/lib/mini-apps";
import { subscribeHomeSettings, subscribeHomeStats } from "@/lib/home-chrome";
import { useApp } from "@/lib/store";
import { votePinReset } from "@/lib/vault-pin";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { game, partner, sendSpicyInvite, usingCloud, user, cloudLive, demoMode } =
    useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<HomeFavoriteSlot[]>(
    emptyFavoriteSlots()
  );
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [wallpaperId, setWallpaperId] = useState<HomeWallpaperId>("black");
  const [layout, setLayout] = useState<HomeLayout>(defaultHomeLayout());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const hubs = useThemedHubs();
  const visibleHubs = useMemo(
    () => hubs.filter((hub) => hub.id !== layout.hiddenHubId),
    [hubs, layout.hiddenHubId]
  );
  const dailyWidgets = useMemo(
    () => HOME_HEADER_WIDGETS.filter((widget) => widget.id !== "world"),
    []
  );
  const favoriteGap = 8;
  const favoriteBox = 72;
  const favoriteSlots = layout.favoriteSlots;
  const rhythmSize =
    favoriteSlots <= 4 ? 72 : Math.max(42, 72 - (favoriteSlots - 4) * 8);
  const rhythmIcon = Math.round(rhythmSize * 0.46);

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
      setLayout(homeLayout);
      setFavorites(resizeFavoriteSlots(slots, homeLayout.favoriteSlots));
      setWallpaperId(paper);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const offSettings = subscribeHomeSettings(() => {
      setStatsOpen(false);
      setSettingsOpen(true);
    });
    const offStats = subscribeHomeStats(() => {
      setSettingsOpen(false);
      setStatsOpen(true);
    });
    return () => {
      offSettings();
      offStats();
    };
  }, []);

  const persistLayout = async (next: HomeLayout) => {
    setLayout(next);
    await saveHomeLayout(next);
    if (next.favoriteSlots !== layout.favoriteSlots) {
      const resized = resizeFavoriteSlots(favorites, next.favoriteSlots);
      setFavorites(resized);
      await saveHomeFavorites(resized, next.favoriteSlots);
    }
  };

  const persistWallpaper = async (id: HomeWallpaperId) => {
    setWallpaperId(id);
    await saveHomeWallpaper(id);
  };

  const persistFavorites = async (next: HomeFavoriteSlot[]) => {
    const sized = resizeFavoriteSlots(next, layout.favoriteSlots);
    setFavorites(sized);
    await saveHomeFavorites(sized, layout.favoriteSlots);
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
    <Screen scroll={false} background="transparent">
      <View
        className="pt-1"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          ...(Platform.OS === "web" ? { touchAction: "none" as const } : null),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 6,
            paddingTop: 0,
            position: "relative",
            minHeight: 44,
          }}
        >
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

        <InstallHomeScreenCard compact />
        <HomeConnectButton />
        {usingCloud && user && !cloudLive && !demoMode ? (
          <Pressable
            onPress={() => router.push("/login")}
            style={{
              marginBottom: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,0,127,0.35)",
              backgroundColor: "rgba(255,0,127,0.1)",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: "#FF007F", fontSize: 13, fontWeight: "700" }}>
              Cloud is signed out
            </Text>
            <Text
              style={{
                color: "rgba(244,244,246,0.7)",
                fontSize: 12,
                lineHeight: 17,
                marginTop: 4,
              }}
            >
              This phone still works, but Admin cannot see Feedback or hubs until
              you send a new email code. Tap here → Login.
            </Text>
          </Pressable>
        ) : null}

        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(244,244,246,0.45)",
            marginBottom: 6,
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
                  marginBottom: 8,
                }
              : { gap: 8, marginBottom: 8 }
          }
        >
          {visibleHubs.map((hub, index) => {
            const gridThree = layout.hubView === "grid" && visibleHubs.length === 3;
            const fullRow = gridThree && index === 2;
            return (
            <Pressable
              key={hub.id}
              onPress={() => router.push(hub.href as Href)}
              style={
                layout.hubView === "grid"
                  ? {
                      width: fullRow ? "100%" : "48%",
                      marginBottom: 8,
                      borderRadius: 18,
                      paddingVertical: 10,
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
            );
          })}
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
            marginBottom: 6,
          }}
        >
          Daily rhythm
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {dailyWidgets.map((widget) => (
            <Pressable
              key={widget.id}
              onPress={() => router.push(widget.href as Href)}
              accessibilityRole="button"
              accessibilityLabel={widget.label}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 2,
              }}
            >
              <View
                style={{
                  width: rhythmSize,
                  height: rhythmSize,
                  borderRadius: rhythmSize / 2,
                  backgroundColor: `${widget.accent}22`,
                  borderWidth: 1,
                  borderColor: `${widget.accent}66`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={widget.icon}
                  size={rhythmIcon}
                  color={widget.accent}
                />
              </View>
              <Text
                style={{
                  marginTop: 6,
                  color: "#F4F4F6",
                  fontSize: favoriteSlots <= 4 ? 12 : 11,
                  fontWeight: "700",
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {widget.shortLabel}
              </Text>
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
          <View style={{ gap: favoriteGap }}>
            {Array.from(
              { length: Math.ceil(favorites.length / 4) },
              (_, rowIndex) => favorites.slice(rowIndex * 4, rowIndex * 4 + 4)
            ).map((row, rowIndex) => (
              <View
                key={`fav-row-${rowIndex}`}
                style={{ flexDirection: "row", gap: favoriteGap }}
              >
                {row.map((featureId, colIndex) => {
                  const index = rowIndex * 4 + colIndex;
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
                        <HubGlyph
                          icon={app.icon}
                          mark={app.mark}
                          size={22}
                          color={app.accent}
                        />
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
                {favorites.length > 4 && row.length < 4
                  ? Array.from({ length: 4 - row.length }, (_, pad) => (
                      <View key={`fav-pad-${rowIndex}-${pad}`} style={{ flex: 1 }} />
                    ))
                  : null}
              </View>
            ))}
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
                            <HubGlyph
                              icon={app.icon}
                              mark={app.mark}
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
    <HomePingNudge />
    {!settingsOpen && !statsOpen ? (
      <HomeNotificationCards onStartSpicy={() => void startSpicy()} />
    ) : null}
    {settingsOpen ? (
      <HomeSettingsSheet
        layout={layout}
        wallpaperId={wallpaperId}
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
    {statsOpen ? <HomeStatsSheet onClose={() => setStatsOpen(false)} /> : null}
    </HomeBackdrop>
  );
}

function HomeSettingsSheet({
  layout,
  wallpaperId,
  onClose,
  onLayout,
  onWallpaper,
  onReset,
}: {
  layout: HomeLayout;
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
    unpairAndWipe,
    deleteOwnAccount,
    submitContentReport,
    setProfileGender,
  } = useApp();
  const [danger, setDanger] = useState<"unpair" | "delete" | "report" | null>(null);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [areaH, setAreaH] = useState(0);
  const sheetH = areaH > 0 ? Math.max(280, areaH - 20) : undefined;
  const hubThemes = useHubThemes();
  const hubs = useThemedHubs();
  return (
    <View
      pointerEvents="box-none"
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.height);
        if (next !== areaH) setAreaH(next);
      }}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        justifyContent: "flex-end",
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
        pointerEvents="auto"
        style={{
          width: "100%",
          height: sheetH,
          maxHeight: sheetH ?? "92%",
          overflow: "hidden",
          backgroundColor: "#14141A",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 18,
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
            marginBottom: 12,
            flexShrink: 0,
          }}
        >
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
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityLabel="Close settings"
            style={{
              width: 40,
              height: 40,
              borderRadius: 16,
              backgroundColor: "#1A1A22",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.16)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={22} color="#F4F4F6" />
          </Pressable>
        </View>
        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 36 }}
        >
          <HomeDemoFlip />
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
            hint="Not ready yet."
            on={false}
            disabled
            onPress={() => undefined}
          />
          <ToggleRow
            label="Favourites"
            on={layout.showFavorites}
            onPress={() => onLayout({ ...layout, showFavorites: !layout.showFavorites })}
          />
          {layout.showFavorites ? (
            <View
              style={{
                marginBottom: 12,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: "#1A1A22",
              }}
            >
              <Text style={{ color: "#F4F4F6", fontSize: 15, fontWeight: "700" }}>
                Favorite spots
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
                How many pins on Home. {HOME_FAVORITE_SLOT_MIN} to {HOME_FAVORITE_SLOT_MAX}.
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {Array.from(
                  { length: HOME_FAVORITE_SLOT_MAX - HOME_FAVORITE_SLOT_MIN + 1 },
                  (_, i) => i + HOME_FAVORITE_SLOT_MIN
                ).map((count) => {
                  const on = layout.favoriteSlots === count;
                  return (
                    <Pressable
                      key={count}
                      onPress={() => onLayout({ ...layout, favoriteSlots: count })}
                      style={{
                        minWidth: 40,
                        height: 36,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: on ? "rgba(255,0,127,0.18)" : "#121218",
                        borderWidth: 1,
                        borderColor: on ? "#FF007F" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text
                        style={{
                          color: on ? "#FF007F" : "#F4F4F6",
                          fontWeight: "800",
                          fontSize: 14,
                        }}
                      >
                        {count}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <Pressable
            onPress={() => setHelpOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Help, feedback or suggestions"
            style={{
              marginBottom: 12,
              paddingVertical: 14,
              paddingHorizontal: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              backgroundColor: "#1A1A22",
            }}
          >
            <Text style={{ color: "#F4F4F6", fontSize: 16, fontWeight: "700" }}>
              Help, feedback or suggestions
            </Text>
            <Text
              style={{
                marginTop: 2,
                color: "rgba(244,244,246,0.5)",
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              Send a note to Duoma Admin.
            </Text>
          </Pressable>

          <Text
            style={{
              marginTop: 8,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.6,
              color: "rgba(244,244,246,0.45)",
              marginBottom: 8,
            }}
          >
            HIDE A HUB
          </Text>
          <Text
            style={{
              marginBottom: 10,
              color: "rgba(244,244,246,0.55)",
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            Hide one of the four sections if you don’t want it on Home. The other
            three stay. Tap again to bring it back.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {hubs.map((hub) => {
              const on = layout.hiddenHubId === hub.id;
              const blocked = Boolean(layout.hiddenHubId) && !on;
              return (
                <Pressable
                  key={hub.id}
                  disabled={blocked}
                  onPress={() =>
                    onLayout({
                      ...layout,
                      hiddenHubId: on ? null : (hub.id as HubId),
                    })
                  }
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 14,
                    opacity: blocked ? 0.4 : 1,
                    backgroundColor: on ? "rgba(255,0,127,0.18)" : "#1A1A22",
                    borderWidth: 1,
                    borderColor: on ? "#FF007F" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{
                      color: on ? "#FF007F" : "#F4F4F6",
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {on ? `Hidden: ${hub.label}` : hub.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <VaultPinResetBlock />

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
            hint="Bell or home cards, then which apps ping you."
            onPress={() => {
              onClose();
              router.push("/hub/notification-settings" as Href);
            }}
          />
          <LinkRow
            label="How it works"
            hint="Pairing, Home Screen Share steps, the four hubs, calendar, and Get Spicy."
            onPress={() => {
              onClose();
              router.push("/how-to" as Href);
            }}
          />
          <LinkRow
            label="Terms and privacy"
            hint="Terms of Use and Privacy Policy."
            onPress={() => {
              onClose();
              router.push("/legal" as Href);
            }}
          />
          <Text
            style={{
              marginTop: 10,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.6,
              color: "rgba(244,244,246,0.45)",
              marginBottom: 4,
            }}
          >
            SAFETY
          </Text>
          <Pressable
            onPress={() => {
              setSafetyError(null);
              setDanger("report");
            }}
            style={{ marginTop: 4, paddingVertical: 12 }}
          >
            <Text style={{ color: "#FF6B7A", fontSize: 15, fontWeight: "700" }}>
              Report content / abuse
            </Text>
            <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
              Goes to Duoma, not your partner. We review within 24 hours.
            </Text>
          </Pressable>
          {partner ? (
            <Pressable
              onPress={() => {
                setSafetyError(null);
                setDanger("unpair");
              }}
              style={{ marginTop: 4, paddingVertical: 12 }}
            >
              <Text style={{ color: "#FF6B7A", fontSize: 15, fontWeight: "700" }}>
                Unpair / break up
              </Text>
              <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
                Ends the connection. Shared photos, vault, and lists on this pair
                are wiped on both sides.
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              setSafetyError(null);
              setDanger("delete");
            }}
            style={{ marginTop: 4, paddingVertical: 12 }}
          >
            <Text style={{ color: "#FF6B7A", fontSize: 15, fontWeight: "700" }}>
              Delete account
            </Text>
            <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
              Closes your Duoma account and wipes this phone’s copy of the pair.
            </Text>
          </Pressable>
          {safetyError ? (
            <Text style={{ marginTop: 8, color: "#FF6B7A", fontSize: 13 }}>{safetyError}</Text>
          ) : null}
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
                ? `You stay paired with ${partner.displayName}${partner.isDemo ? " in the Riley sandbox" : ""}. Sign out does not unpair you.`
                : "Share this code so your partner can join."}
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
      <FeedbackSheet
        open={helpOpen}
        source="Home"
        onClose={() => setHelpOpen(false)}
      />
      <ConfirmDialog
        open={danger === "unpair"}
        title="End this pairing?"
        body={`${partner?.displayName ?? "They"} lose access to the shared vault, photos, and lists. This phone wipes them too. You keep your account and get a new pair code.`}
        confirmLabel="Unpair and wipe"
        cancelLabel="Keep us paired"
        onCancel={() => setDanger(null)}
        onConfirm={() => {
          void (async () => {
            try {
              await unpairAndWipe();
              setDanger(null);
              onClose();
              router.replace("/waiting");
            } catch (err) {
              setSafetyError(err instanceof Error ? err.message : "Could not unpair.");
              setDanger(null);
            }
          })();
        }}
      />
      <ConfirmDialog
        open={danger === "delete"}
        title="Delete your account?"
        body="This unpaired you, wipes local vaults, and closes the account on this phone. Email kerlsagameshq@gmail.com if a cloud login still needs finishing."
        confirmLabel="Delete everything"
        cancelLabel="Keep my account"
        onCancel={() => setDanger(null)}
        onConfirm={() => {
          void (async () => {
            try {
              await deleteOwnAccount();
              setDanger(null);
              onClose();
              router.replace("/welcome");
            } catch (err) {
              setSafetyError(err instanceof Error ? err.message : "Could not delete.");
              setDanger(null);
            }
          })();
        }}
      />
      <ReportSheet
        open={danger === "report"}
        onClose={() => setDanger(null)}
        onSubmit={async ({ reason, details }) => {
          await submitContentReport({
            reason,
            details,
            mediaKind: "pair",
          });
        }}
      />
    </View>
  );
}

function VaultPinResetBlock() {
  const { user, partner } = useApp();
  const { data, patch } = useMiniApps();
  const [flash, setFlash] = useState<string | null>(null);

  const emergencyOn = Boolean(data.vaultPin);
  const sexyOn = Boolean(data.sexyVaultPin);
  if (!emergencyOn && !sexyOn) return null;

  const them = partner?.displayName || "your partner";

  const tapReset = async (kind: "vault" | "sexy") => {
    if (!user?.id) {
      setFlash("Sign in first.");
      return;
    }
    if (!partner?.id) {
      setFlash("Need your partner on the other phone too.");
      return;
    }
    const current = kind === "vault" ? data.vaultPinResetVotes : data.sexyVaultPinResetVotes;
    const result = votePinReset({
      votes: current,
      userId: user.id,
      partnerId: partner.id,
      partnerIsDemo: Boolean(partner.isDemo),
    });
    if (result.reset) {
      await patch((state) =>
        kind === "vault"
          ? { ...state, vaultPin: "", vaultPinResetVotes: [] }
          : { ...state, sexyVaultPin: "", sexyVaultPinResetVotes: [] }
      );
      setFlash(
        partner.isDemo
          ? `${them} confirmed. Pin cleared.`
          : "Both of you tapped reset. Pin cleared."
      );
      return;
    }
    await patch((state) =>
      kind === "vault"
        ? { ...state, vaultPinResetVotes: result.votes }
        : { ...state, sexyVaultPinResetVotes: result.votes }
    );
    setFlash(`Waiting for ${them} to tap Reset too.`);
  };

  const row = (
    kind: "vault" | "sexy",
    label: string,
    votes: string[]
  ) => {
    const youVoted = Boolean(user?.id && votes.includes(user.id));
    const theyVoted = Boolean(partner?.id && votes.includes(partner.id));
    return (
      <View
        key={kind}
        style={{
          marginBottom: 8,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 14,
          backgroundColor: "#1A1A22",
        }}
      >
        <Text style={{ color: "#F4F4F6", fontSize: 15, fontWeight: "700" }}>{label}</Text>
        <Text
          style={{
            marginTop: 4,
            marginBottom: 10,
            color: "rgba(244,244,246,0.5)",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          Forgot it? Both of you tap Reset in Home settings. One hacked phone
          isn’t enough.
        </Text>
        <Pressable
          onPress={() => void tapReset(kind)}
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: youVoted ? "rgba(255,0,127,0.18)" : "#121218",
            borderWidth: 1,
            borderColor: "#FF007F",
          }}
        >
          <Text style={{ color: "#FF007F", fontWeight: "800", fontSize: 13 }}>
            {youVoted && !theyVoted ? "Waiting for them" : "Reset pin"}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          marginTop: 8,
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          color: "rgba(244,244,246,0.45)",
          marginBottom: 8,
        }}
      >
        VAULT PINS
      </Text>
      {emergencyOn ? row("vault", "Emergency vault", data.vaultPinResetVotes) : null}
      {sexyOn ? row("sexy", "Sexy vault", data.sexyVaultPinResetVotes) : null}
      {flash ? (
        <Text style={{ marginBottom: 8, color: "#FF007F", fontSize: 12 }}>{flash}</Text>
      ) : null}
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
  hint,
  on,
  onPress,
  disabled,
}: {
  label: string;
  hint?: string;
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
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 15 }}>{label}</Text>
        {hint ? (
          <Text
            style={{
              marginTop: 2,
              color: "rgba(244,244,246,0.5)",
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
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
