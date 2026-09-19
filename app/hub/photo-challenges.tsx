import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { MediaShield, useScanUpload } from "@/components/MediaShield";
import { ReportSheet, ReportTextButton } from "@/components/ReportSheet";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { formatLongDate } from "@/lib/dates";
import { sectionAccent } from "@/lib/hub-theme";
import { useMiniApps } from "@/lib/mini-apps";
import {
  PHOTO_CATEGORIES,
  PHOTO_SHUFFLES,
  agreePhotoWeek,
  completePhotoWeek,
  createPhotoMemory,
  ensurePhotoWeek,
  formatCountdown,
  photoPromptLabel,
  photoPromptTitle,
  photoWeekIsLive,
  pickImageFromDevice,
  prependPhoto,
  shufflePhotoWeek,
  startNextPhotoWeek,
  type PhotoMemory,
  type PhotoPromptCategory,
} from "@/lib/photo-challenge";
import { scanInputFromDataUrl } from "@/lib/media-scan";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const BG = "#1A0A0A";
const red = () => sectionAccent("play", "#C23B3B");
const CREAM = "#F6EFE2";
const INK = "#3A2A18";
const PINK = "#F6D6D6";

export default function PhotoChallengesScreen() {
  const { user, partner, submitContentReport } = useApp();
  const { data, ready, patch } = useMiniApps();
  const scanUpload = useScanUpload();
  const [tick, setTick] = useState(() => Date.now());
  const [caption, setCaption] = useState("");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [looking, setLooking] = useState<PhotoMemory | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const look = useAppLook("photo-challenges", red(), {});

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (data.photoWeek && photoWeekIsLive(data.photoWeek)) return;
    void patch((state) => {
      if (state.photoWeek && photoWeekIsLive(state.photoWeek)) return state;
      const next = ensurePhotoWeek(state.photoWeek, new Date(), state.photoPrefs.categories);
      if (next === state.photoWeek) return state;
      return { ...state, photoWeek: next };
    });
  }, [ready, patch, data.photoWeek]);

  const week = data.photoWeek;

  if (!ready || !week) {
    return (
      <MediaShield>
      <Screen
        scroll
        background={BG}
        density={look.prefs.density}
        typeface={look.prefs.typeface}
        wash={look.wash}
      >
        <Stage background={BG} fallback={"/hub/play" as Href} accent={look.accent}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 28,
              color: PINK,
              marginTop: 24,
            }}
          >
            Dealing this week's shot…
          </Text>
        </Stage>
      </Screen>
      </MediaShield>
    );
  }

  const cats = data.photoPrefs.categories;
  const prompt = photoPromptLabel(week.promptId);
  const promptTitle = photoPromptTitle(week.promptId);
  const done = Boolean(week.completedAt);
  const locked = week.locked || done;
  const agreed = Boolean(week.agreedAt) || done;
  const clock = formatCountdown(week.expiresAt, new Date(tick));
  const thisWeekShot =
    data.photos.find((row) => row.weekKey === week.weekKey) ?? null;
  const gallery = data.photos;

  const shuffle = async () => {
    if (locked) return;
    setError(null);
    setDraftImage(null);
    await patch((state) => {
      if (!state.photoWeek) return state;
      return {
        ...state,
        photoWeek: shufflePhotoWeek(state.photoWeek, state.photoPrefs.categories),
      };
    });
  };

  const toggleCategory = async (id: PhotoPromptCategory) => {
    await patch((state) => {
      const current = state.photoPrefs.categories;
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      if (next.length === 0) return state;
      return {
        ...state,
        photoPrefs: { ...state.photoPrefs, categories: next },
      };
    });
  };

  const agree = async () => {
    setError(null);
    await patch((state) => {
      if (!state.photoWeek) return state;
      return { ...state, photoWeek: agreePhotoWeek(state.photoWeek) };
    });
  };

  const pickPhoto = async () => {
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await pickImageFromDevice();
      if (dataUrl) {
        setDraftImage(dataUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that photo.");
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    if (!user) return;
    if (!draftImage) {
      setError("Upload the photo first.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const scan = await scanUpload(scanInputFromDataUrl(draftImage, true));
      if (!scan.ok) {
        setError(scan.reason);
        return;
      }
      const memory = createPhotoMemory({
        userId: user.id,
        promptId: week.promptId,
        caption,
        imageData: draftImage,
        weekKey: week.weekKey,
      });
      await patch((state) => {
        const live = state.photoWeek;
        if (!live) return state;
        const finished = completePhotoWeek(live, user.id);
        return {
          ...state,
          photoWeek: state.photoPrefs.dealAfterComplete
            ? startNextPhotoWeek(finished, new Date(), state.photoPrefs.categories)
            : finished,
          photos: prependPhoto(state.photos, memory),
        };
      });
      setCaption("");
      setDraftImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that photo.");
    } finally {
      setBusy(false);
    }
  };

  const dealNext = async () => {
    setError(null);
    setDraftImage(null);
    setCaption("");
    await patch((state) => ({
      ...state,
      photoWeek: startNextPhotoWeek(state.photoWeek, new Date(), state.photoPrefs.categories),
    }));
  };

  const shownImage = thisWeekShot?.imageData ?? draftImage;

  return (
    <MediaShield>
    <Screen
      scroll
      background={BG}
      density={look.prefs.density}
      typeface={look.prefs.typeface}
      wash={look.wash}
    >
      <Stage background={BG} fallback={"/hub/play" as Href} accent={look.accent}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                color: red(),
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 3,
              }}
            >
              DARKROOM · ONE SHOT THIS WEEK
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontSize: 34,
                color: PINK,
              }}
            >
              Clothesline
            </Text>
          </View>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            accessibilityLabel="Clothesline settings"
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(194,59,59,0.4)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="settings-outline" size={20} color={PINK} />
          </Pressable>
        </View>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: "rgba(246,214,214,0.65)",
          }}
        >
          find a photo pose challenge for you to complete in a week
        </Text>

        {settingsOpen ? (
          <View
            style={{
              marginTop: 16,
              borderWidth: 1,
              borderColor: "rgba(194,59,59,0.4)",
              backgroundColor: "rgba(10,4,4,0.55)",
              padding: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 2,
                  color: red(),
                }}
              >
                SETTINGS
              </Text>
              <Pressable onPress={() => setSettingsOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={20} color={PINK} />
              </Pressable>
            </View>
            <LookPanel
              look={{
                ...look,
                reset: () => {
                  look.reset();
                  void patch((state) => ({
                    ...state,
                    photoPrefs: {
                      dealAfterComplete: false,
                      categories: PHOTO_CATEGORIES.map((row) => row.id),
                    },
                  }));
                },
              }}
              ink={CREAM}
              muted="rgba(246,214,214,0.65)"
              pageColor={BG}
            >
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 16,
                color: CREAM,
              }}
            >
              Suggestion packs
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontFamily: SERIF,
                fontSize: 14,
                color: "rgba(246,214,214,0.65)",
              }}
            >
              Shuffle only draws from packs you leave on.
            </Text>
            {PHOTO_CATEGORIES.map((row) => {
              const on = cats.includes(row.id);
              return (
                <Pressable
                  key={row.id}
                  onPress={() => void toggleCategory(row.id)}
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: on ? red() : "rgba(246,214,214,0.18)",
                    backgroundColor: on ? "rgba(194,59,59,0.18)" : "transparent",
                  }}
                >
                  <Text style={{ color: CREAM, fontWeight: "800" }}>{row.label}</Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: SERIF,
                      fontSize: 14,
                      color: "rgba(246,214,214,0.65)",
                    }}
                  >
                    {row.detail} · 25 shots
                  </Text>
                </Pressable>
              );
            })}
            <Text
              style={{
                marginTop: 16,
                fontFamily: SERIF,
                fontSize: 16,
                color: CREAM,
              }}
            >
              When to deal
            </Text>
            {(
              [
                {
                  on: false,
                  label: "Wait the week",
                  hint: "Next challenge deals when the timer hits zero.",
                },
                {
                  on: true,
                  label: "Deal another now",
                  hint: "Deals a new shot right now, and again as soon as you peg one.",
                },
              ] as const
            ).map((row) => {
              const selected = data.photoPrefs.dealAfterComplete === row.on;
              return (
                <Pressable
                  key={row.label}
                  onPress={() => {
                    setError(null);
                    if (row.on) {
                      setDraftImage(null);
                      setCaption("");
                      setSettingsOpen(false);
                    }
                    void patch((state) => ({
                      ...state,
                      photoPrefs: { ...state.photoPrefs, dealAfterComplete: row.on },
                      photoWeek: row.on
                        ? startNextPhotoWeek(
                            state.photoWeek,
                            new Date(),
                            state.photoPrefs.categories
                          )
                        : state.photoWeek,
                    }));
                  }}
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: selected ? red() : "rgba(246,214,214,0.18)",
                    backgroundColor: selected ? "rgba(194,59,59,0.18)" : "transparent",
                  }}
                >
                  <Text style={{ color: CREAM, fontWeight: "800" }}>{row.label}</Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: SERIF,
                      fontSize: 14,
                      color: "rgba(246,214,214,0.65)",
                    }}
                  >
                    {row.hint}
                  </Text>
                </Pressable>
              );
            })}
            </LookPanel>
          </View>
        ) : null}

        <View
          style={{
            marginTop: 18,
            borderWidth: 1,
            borderColor: "rgba(194,59,59,0.35)",
            paddingVertical: 12,
            paddingHorizontal: 14,
            alignItems: "center",
            backgroundColor: "rgba(194,59,59,0.1)",
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              color: "rgba(246,214,214,0.55)",
            }}
          >
            TIME LEFT
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: SERIF,
              fontSize: 28,
              color: CREAM,
            }}
          >
            {clock}
          </Text>
        </View>

        <View
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: 320,
            marginTop: 22,
            backgroundColor: CREAM,
            padding: 12,
            paddingBottom: 28,
            transform: [{ rotate: "-1.5deg" }],
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 12,
          }}
        >
          <View
            style={{
              height: 220,
              backgroundColor: shownImage ? "#111" : "#E7C8B4",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {shownImage ? (
              <Image
                source={{ uri: shownImage }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 22,
                  lineHeight: 28,
                  color: INK,
                  textAlign: "center",
                  paddingHorizontal: 16,
                }}
              >
                {promptTitle}
              </Text>
            )}
          </View>
          <Text
            style={{
              marginTop: 12,
              fontFamily: HANDWRITING,
              fontSize: 18,
              color: INK,
            }}
          >
            {done
              ? thisWeekShot?.caption || prompt
              : shownImage
                ? prompt
                : prompt}
          </Text>
        </View>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {Array.from({ length: PHOTO_SHUFFLES }).map((_, i) => {
            const used = i >= week.shufflesLeft;
            return (
              <View
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  borderWidth: 2,
                  borderColor: red(),
                  backgroundColor: used ? red() : "transparent",
                }}
              />
            );
          })}
        </View>
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1,
            color: "rgba(246,214,214,0.55)",
          }}
        >
          {done
            ? "LOCKED IN · ON THE LINE"
            : locked
              ? "LOCKED IN · NO MORE SHUFFLES"
              : `${week.shufflesLeft} shuffle${week.shufflesLeft === 1 ? "" : "s"} left`}
        </Text>

        {!done ? (
          <View style={{ marginTop: 16, gap: 10 }}>
            {!locked ? (
              <Pressable
                onPress={() => void shuffle()}
                style={{
                  height: 48,
                  borderWidth: 1,
                  borderColor: red(),
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Ionicons name="shuffle" size={18} color={CREAM} />
                <Text style={{ color: CREAM, fontWeight: "800" }}>
                  Shuffle the shot
                </Text>
              </Pressable>
            ) : null}

            {!agreed ? (
              <Pressable
                onPress={() => void agree()}
                style={{
                  height: 48,
                  backgroundColor: red(),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: CREAM, fontWeight: "800" }}>
                  Agree — this is the one
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  onPress={() => void pickPhoto()}
                  disabled={busy}
                  style={{
                    height: 48,
                    borderWidth: 1,
                    borderColor: red(),
                    backgroundColor: draftImage ? "rgba(194,59,59,0.18)" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Ionicons name="camera" size={18} color={CREAM} />
                  <Text style={{ color: CREAM, fontWeight: "800" }}>
                    {busy
                      ? "Opening…"
                      : draftImage
                        ? "Swap the upload"
                        : "Upload the photo"}
                  </Text>
                </Pressable>
                <Text
                  style={{
                    textAlign: "center",
                    color: "rgba(246,214,214,0.45)",
                    fontSize: 12,
                  }}
                >
                  Stays in Duoma. Not saved to the Camera Roll.
                </Text>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="optional note on the back"
                  placeholderTextColor="rgba(246,214,214,0.3)"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: red(),
                    color: PINK,
                    fontFamily: HANDWRITING,
                    fontSize: 20,
                    paddingVertical: 8,
                  }}
                />
                <Pressable
                  onPress={() => void complete()}
                  disabled={busy || !draftImage}
                  style={{
                    height: 48,
                    backgroundColor: draftImage ? red() : "rgba(194,59,59,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: CREAM, fontWeight: "800" }}>
                    {busy ? "Pegging…" : "Complete — peg it to the line"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        ) : data.photoPrefs.dealAfterComplete ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            <Text
              style={{
                textAlign: "center",
                fontFamily: SERIF,
                fontSize: 16,
                color: "rgba(246,214,214,0.7)",
              }}
            >
              Pegged. Deal the next shot whenever you want.
            </Text>
            <Pressable
              onPress={() => void dealNext()}
              style={{
                height: 48,
                backgroundColor: red(),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: CREAM, fontWeight: "800" }}>
                Deal the next shot
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text
            style={{
              marginTop: 18,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 16,
              color: "rgba(246,214,214,0.7)",
            }}
          >
            This week's on the line. Next shot deals when the timer hits zero.
          </Text>
        )}

        {error ? (
          <Text style={{ marginTop: 10, color: "#FFB4B4", textAlign: "center" }}>
            {error}
          </Text>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <View
            style={{
              height: 2,
              backgroundColor: "#C4A484",
              marginBottom: -8,
            }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {["│", "│", "│", "│"].map((pin, i) => (
              <Text key={i} style={{ color: "#C4A484", fontSize: 18 }}>
                {pin}
              </Text>
            ))}
          </View>
          <Text
            style={{
              marginTop: 10,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              color: "rgba(246,214,214,0.5)",
            }}
          >
            LOOK BACK
          </Text>
        </View>

        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {!ready || gallery.length === 0 ? (
            <Text style={{ color: "rgba(246,214,214,0.4)", fontFamily: SERIF }}>
              The line is empty. First print is always a little crooked.
            </Text>
          ) : (
            gallery.map((photo, i) => (
              <Pressable
                key={photo.id}
                onPress={() => setLooking(photo)}
                style={{
                  width: "46%",
                  backgroundColor: CREAM,
                  padding: 8,
                  paddingBottom: 20,
                  transform: [{ rotate: i % 2 ? "2deg" : "-2deg" }],
                }}
              >
                <View
                  style={{
                    height: 110,
                    backgroundColor: photo.tint,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {photo.imageData ? (
                    <Image
                      source={{ uri: photo.imageData }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 22 }}>{photo.sticker}</Text>
                  )}
                </View>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: HANDWRITING,
                    color: INK,
                    fontSize: 14,
                  }}
                  numberOfLines={3}
                >
                  {photo.caption || photoPromptLabel(photo.promptId)}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </Stage>

      <Modal
        visible={Boolean(looking)}
        transparent
        animationType="fade"
        onRequestClose={() => setLooking(null)}
      >
        <Pressable
          onPress={() => setLooking(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(10,4,4,0.86)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {looking ? (
            <Pressable
              onPress={(e) => e.stopPropagation?.()}
              style={{
                backgroundColor: CREAM,
                padding: 14,
                paddingBottom: 28,
              }}
            >
              <View style={{ height: 320, backgroundColor: "#111", overflow: "hidden" }}>
                {looking.imageData ? (
                  <Image
                    source={{ uri: looking.imageData }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: looking.tint,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 42 }}>{looking.sticker}</Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  marginTop: 12,
                  fontFamily: SERIF,
                  fontSize: 18,
                  color: INK,
                }}
              >
                {photoPromptLabel(looking.promptId)}
              </Text>
              {looking.caption ? (
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: HANDWRITING,
                    fontSize: 20,
                    color: INK,
                  }}
                >
                  {looking.caption}
                </Text>
              ) : null}
              <Text style={{ marginTop: 8, fontSize: 13, color: "rgba(58,42,24,0.55)" }}>
                {looking.weekKey
                  ? `Week of ${formatLongDate(looking.weekKey)}`
                  : looking.createdAt.slice(0, 10)}
              </Text>
              <View style={{ marginTop: 12 }}>
                <ReportTextButton onPress={() => setReportOpen(true)} />
              </View>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={async ({ reason, details }) => {
          if (!looking) throw new Error("Open a photo first.");
          await submitContentReport({
            reason,
            details,
            mediaId: looking.id,
            mediaKind: "photo-memory",
            reportedUserId:
              looking.userId === user?.id ? partner?.id ?? null : looking.userId,
          });
        }}
      />
    </Screen>
    </MediaShield>
  );
}
