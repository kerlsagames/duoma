import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { LISTS_DISPLAY, LISTS_ROUNDED, LISTS_TONE } from "@/lib/app-themes";
import { listFieldCopy, starterDef } from "@/lib/lists";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const T = LISTS_TONE;

type Tab = "lists" | "vault";

const EMOJI_PICKS = ["✨", "🌟", "🎈", "🧭", "🎢", "🧁", "🏕️", "🎧", "🚲", "🎨"];

export default function ListsScreen() {
  const router = useRouter();
  const {
    couple,
    coupleLists,
    listEntries,
    ensureStarterLists,
    createCoupleList,
    setListHidden,
  } = useApp();

  const [tab, setTab] = useState<Tab>("lists");
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void ensureStarterLists();
  }, [ensureStarterLists]);

  const openByList = useMemo(() => {
    const map = new Map<string, number>();
    listEntries.forEach((entry) => {
      if (entry.completedAt) return;
      map.set(entry.listId, (map.get(entry.listId) ?? 0) + 1);
    });
    return map;
  }, [listEntries]);

  const doneByList = useMemo(() => {
    const map = new Map<string, number>();
    listEntries.forEach((entry) => {
      if (!entry.completedAt) return;
      map.set(entry.listId, (map.get(entry.listId) ?? 0) + 1);
    });
    return map;
  }, [listEntries]);

  const visibleLists = useMemo(
    () => coupleLists.filter((row) => !row.hiddenAt),
    [coupleLists]
  );

  const vaultLists = useMemo(
    () =>
      coupleLists
        .filter((list) => (doneByList.get(list.id) ?? 0) > 0)
        .sort((a, b) => {
          const aCount = doneByList.get(a.id) ?? 0;
          const bCount = doneByList.get(b.id) ?? 0;
          return bCount - aCount;
        }),
    [coupleLists, doneByList]
  );

  const saveList = async () => {
    setError(null);
    setSaving(true);
    try {
      const row = await createCoupleList({ title, emoji });
      setCreateOpen(false);
      setTitle("");
      setEmoji("✨");
      if (row) router.push(`/hub/list/${row.id}` as Href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create list");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll background={T.background}>
      <View className="pb-10 pt-2">
        <BackButton color={T.teal} style={{ marginBottom: 12 }} />
        <View className="mb-1 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              style={{
                fontFamily: LISTS_ROUNDED,
                fontSize: 12,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: T.teal,
                fontWeight: "700",
              }}
            >
              Bucket list
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: LISTS_DISPLAY,
                fontSize: 36,
                lineHeight: 40,
                color: T.ink,
                fontWeight: "700",
              }}
            >
              Lists
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: LISTS_ROUNDED,
                fontSize: 15,
                lineHeight: 22,
                color: T.muted,
              }}
            >
              Dream it up together, tick it off, then open each vault by list.
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 8 }}>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              accessibilityLabel="List settings"
              style={{
                height: 44,
                width: 44,
                borderRadius: 16,
                backgroundColor: T.sky,
                borderWidth: 1,
                borderColor: T.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="settings-outline" size={20} color={T.teal} />
            </Pressable>
            <View
              style={{
                height: 54,
                width: 54,
                borderRadius: 18,
                backgroundColor: T.sticky,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ rotate: "6deg" }],
              }}
            >
              <Text style={{ fontSize: 26 }}>🗺️</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            gap: 8,
            padding: 4,
            borderRadius: 18,
            backgroundColor: T.sky,
            borderWidth: 1,
            borderColor: T.border,
          }}
        >
          {(
            [
              { id: "lists" as const, label: "Open lists" },
              { id: "vault" as const, label: "Vault" },
            ] as const
          ).map((item) => {
            const on = tab === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  paddingVertical: 10,
                  alignItems: "center",
                  backgroundColor: on ? T.accent : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: LISTS_ROUNDED,
                    fontWeight: "700",
                    fontSize: 14,
                    color: on ? "#1A120E" : T.muted,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "lists" ? (
          <View style={{ marginTop: 18, gap: 12 }}>
            {visibleLists.length === 0 ? (
              <View
                style={{
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: T.border,
                  backgroundColor: T.surface,
                  padding: 18,
                }}
              >
                <Text style={{ color: T.muted, fontFamily: LISTS_ROUNDED }}>
                  {!couple
                    ? "Pair with your partner first, then your starter lists will appear here."
                    : coupleLists.length > 0
                      ? "All lists are hidden. Open settings to show some again."
                      : "Warming up your bucket lists…"}
                </Text>
              </View>
            ) : (
              visibleLists.map((list, index) => {
                const openCount = openByList.get(list.id) ?? 0;
                const hint = starterDef(list.starterKey)?.hint;
                const tilt = index % 2 === 0 ? "-1.2deg" : "1.4deg";
                return (
                  <Pressable
                    key={list.id}
                    onPress={() => router.push(`/hub/list/${list.id}` as Href)}
                    style={{
                      borderRadius: 24,
                      borderWidth: 2,
                      borderColor: list.accent,
                      backgroundColor: T.surfaceRaised,
                      padding: 16,
                      transform: [{ rotate: tilt }],
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          height: 52,
                          width: 52,
                          borderRadius: 18,
                          backgroundColor: `${list.accent}33`,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 26 }}>{list.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: LISTS_DISPLAY,
                            fontSize: 22,
                            color: T.ink,
                            fontWeight: "700",
                          }}
                        >
                          {list.title}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontFamily: LISTS_ROUNDED,
                            fontSize: 13,
                            color: T.muted,
                          }}
                        >
                          {openCount === 0
                            ? "Empty — add the first idea"
                            : `${openCount} open`}
                          {list.starterKey ? "" : " · custom"}
                        </Text>
                        {hint ? (
                          <Text
                            style={{
                              marginTop: 4,
                              fontFamily: LISTS_ROUNDED,
                              fontSize: 12,
                              color: "rgba(243,255,251,0.42)",
                            }}
                            numberOfLines={1}
                          >
                            {hint}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={T.teal} />
                    </View>
                  </Pressable>
                );
              })
            )}

            <Pressable
              onPress={() => {
                setError(null);
                setCreateOpen(true);
              }}
              style={{
                marginTop: 4,
                borderRadius: 22,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: T.sticky,
                backgroundColor: T.accentSoft,
                paddingVertical: 18,
                paddingHorizontal: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: LISTS_DISPLAY,
                  fontSize: 18,
                  color: T.sticky,
                  fontWeight: "700",
                }}
              >
                + Create your own list
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ marginTop: 18, gap: 12 }}>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: T.sticky,
                padding: 14,
                transform: [{ rotate: "-1deg" }],
              }}
            >
              <Text
                style={{
                  fontFamily: LISTS_DISPLAY,
                  fontSize: 18,
                  color: T.stickyInk,
                  fontWeight: "700",
                }}
              >
                Memory vault
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: LISTS_ROUNDED,
                  fontSize: 13,
                  color: T.stickyInk,
                  opacity: 0.8,
                }}
              >
                Tap a list to open only that history — movies, places, and more stay separate.
              </Text>
            </View>

            {vaultLists.length === 0 ? (
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: LISTS_ROUNDED,
                  color: T.muted,
                  fontSize: 15,
                }}
              >
                Nothing in the vault yet. Mark something done from a list.
              </Text>
            ) : (
              vaultLists.map((list, index) => {
                const count = doneByList.get(list.id) ?? 0;
                const copy = listFieldCopy({
                  starterKey: list.starterKey,
                  title: list.title,
                });
                const tilt = index % 2 === 0 ? "1deg" : "-1.2deg";
                return (
                  <Pressable
                    key={list.id}
                    onPress={() =>
                      router.push(
                        `/hub/list/${list.id}?section=vault` as Href
                      )
                    }
                    style={{
                      borderRadius: 24,
                      borderWidth: 2,
                      borderColor: list.accent,
                      backgroundColor: T.surfaceRaised,
                      padding: 16,
                      transform: [{ rotate: tilt }],
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          height: 52,
                          width: 52,
                          borderRadius: 18,
                          backgroundColor: `${list.accent}33`,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 26 }}>{list.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: LISTS_DISPLAY,
                            fontSize: 22,
                            color: T.ink,
                            fontWeight: "700",
                          }}
                        >
                          {copy.vaultTitle}
                        </Text>
                        <Text
                          style={{
                            marginTop: 4,
                            fontFamily: LISTS_ROUNDED,
                            fontSize: 13,
                            color: T.muted,
                          }}
                        >
                          {count === 1 ? "1 memory" : `${count} memories`}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={T.teal} />
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </View>

      <Modal
        visible={settingsOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.72)",
          }}
        >
          <View
            style={{
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              backgroundColor: T.sky,
              borderWidth: 1,
              borderColor: T.border,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 28,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: LISTS_DISPLAY,
                  fontSize: 24,
                  color: T.ink,
                  fontWeight: "700",
                }}
              >
                List settings
              </Text>
              <Pressable onPress={() => setSettingsOpen(false)}>
                <Text style={{ color: T.muted, fontFamily: LISTS_ROUNDED }}>
                  Close
                </Text>
              </Pressable>
            </View>
            <Text
              style={{
                fontFamily: LISTS_ROUNDED,
                fontSize: 13,
                color: T.muted,
                marginBottom: 14,
                lineHeight: 18,
              }}
            >
              Hide lists you are not using. Hidden lists stay in the vault if they have memories.
            </Text>
            <View style={{ gap: 10 }}>
              {coupleLists.length === 0 ? (
                <Text style={{ color: T.muted, fontFamily: LISTS_ROUNDED }}>
                  No lists yet.
                </Text>
              ) : (
                coupleLists.map((list) => {
                  const hidden = Boolean(list.hiddenAt);
                  return (
                    <View
                      key={list.id}
                      style={{
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: T.border,
                        backgroundColor: T.surface,
                        padding: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{list.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: LISTS_ROUNDED,
                            fontWeight: "700",
                            fontSize: 15,
                            color: T.ink,
                          }}
                        >
                          {list.title}
                        </Text>
                        <Text
                          style={{
                            marginTop: 2,
                            fontFamily: LISTS_ROUNDED,
                            fontSize: 12,
                            color: T.muted,
                          }}
                        >
                          {hidden ? "Hidden from Open lists" : "Visible"}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => void setListHidden(list.id, !hidden)}
                        style={{
                          borderRadius: 999,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          backgroundColor: hidden ? T.sticky : T.tealSoft,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: LISTS_ROUNDED,
                            fontWeight: "700",
                            fontSize: 12,
                            color: hidden ? T.stickyInk : T.teal,
                          }}
                        >
                          {hidden ? "Show" : "Hide"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={createOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setCreateOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.72)",
          }}
        >
          <View
            style={{
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              backgroundColor: T.sky,
              borderWidth: 1,
              borderColor: T.border,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 28,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: LISTS_DISPLAY,
                  fontSize: 24,
                  color: T.ink,
                  fontWeight: "700",
                }}
              >
                New list
              </Text>
              <Pressable onPress={() => setCreateOpen(false)}>
                <Text style={{ color: T.muted, fontFamily: LISTS_ROUNDED }}>
                  Close
                </Text>
              </Pressable>
            </View>

            <Text
              style={{
                fontFamily: LISTS_ROUNDED,
                fontSize: 12,
                color: T.muted,
                marginBottom: 8,
              }}
            >
              Pick a sticker
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {EMOJI_PICKS.map((item) => {
                const on = emoji === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setEmoji(item)}
                    style={{
                      height: 44,
                      width: 44,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: on ? T.sticky : T.surface,
                      borderWidth: 1,
                      borderColor: on ? T.sticky : T.border,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Books to read, recipes to cook…"
              placeholderTextColor="rgba(243,255,251,0.35)"
              style={{
                marginTop: 14,
                height: 48,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: T.border,
                backgroundColor: T.surface,
                paddingHorizontal: 14,
                color: T.ink,
                fontFamily: LISTS_ROUNDED,
                fontSize: 16,
              }}
            />
            {error ? (
              <Text
                style={{
                  marginTop: 8,
                  color: T.accent,
                  fontFamily: LISTS_ROUNDED,
                }}
              >
                {error}
              </Text>
            ) : null}
            <View style={{ marginTop: 16 }}>
              <PrimaryButton
                label="Create list"
                loading={saving}
                onPress={() => void saveList()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
