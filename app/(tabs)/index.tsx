import { HomeNotificationsBell } from "@/components/home/HomeNotificationsBell";
import { DuomaLogo } from "@/components/DuomaLogo";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
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
import { HOME_HEADER_WIDGETS, HUBS } from "@/lib/hubs";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { game, partner, sendSpicyInvite } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<HomeFavoriteSlot[]>(
    emptyFavoriteSlots()
  );
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  // Screen horizontal padding (~20) + gap between tiles.
  const tileWidth = Math.max(140, (width - 40 - 12) / 2);
  const favoriteGap = 8;
  const favoriteBox =
    Math.max(64, (width - 40 - 20 - favoriteGap * 3) / HOME_FAVORITE_SLOTS);

  const appsByHub = useMemo(() => {
    const used = new Set(favorites.filter(Boolean) as string[]);
    return HUBS.map((hub) => ({
      hub,
      apps: allHubApps().filter(
        (app) => app.hubId === hub.id && !used.has(app.id)
      ),
    })).filter((row) => row.apps.length > 0);
  }, [favorites]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const slots = await loadHomeFavorites();
      if (alive) setFavorites(slots);
    })();
    return () => {
      alive = false;
    };
  }, []);

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

  return (
    <Screen scroll>
      <View className="pt-1 pb-10">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            paddingTop: 4,
            position: "relative",
            minHeight: 52,
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
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {HUBS.map((hub) => (
            <Pressable
              key={hub.id}
              onPress={() => router.push(hub.href as Href)}
              style={{
                width: tileWidth,
                borderRadius: 18,
                paddingVertical: 12,
                paddingHorizontal: 10,
                backgroundColor: hub.tile,
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={hub.icon} size={28} color={hub.tileInk} />
              </View>
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 18,
                    lineHeight: 22,
                    color: hub.tileInk,
                    textAlign: "center",
                  }}
                >
                  {hub.label}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    color: hub.tileInk,
                    opacity: 0.72,
                    fontSize: 11,
                    lineHeight: 14,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {hub.tagline}
                </Text>
              </View>
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
            marginBottom: 8,
          }}
        >
          Daily rhythm
        </Text>

        <View style={{ gap: 8 }}>
          {HOME_HEADER_WIDGETS.map((widget) => (
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
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          <View style={{ flexDirection: "row", gap: favoriteGap }}>
            {favorites.map((featureId, index) => {
              const app = featureId ? hubAppById(featureId) : null;
              if (app) {
                return (
                  <Pressable
                    key={`fav-${index}`}
                    onPress={() => router.push(app.href as Href)}
                    onLongPress={() => void clearFavorite(index)}
                    style={{
                      width: favoriteBox,
                      height: favoriteBox,
                      borderRadius: 14,
                      backgroundColor: `${app.accent}22`,
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
                    width: favoriteBox,
                    height: favoriteBox,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderStyle: "dashed",
                    borderColor: "rgba(244,244,246,0.28)",
                    backgroundColor: "rgba(255,255,255,0.03)",
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
  );
}
