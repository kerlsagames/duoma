import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  buildHomeNotifications,
  gameResumeHref,
} from "@/lib/home-status";
import {
  defaultNotificationPrefs,
  dismissNotificationIds,
  prefsShowStatusId,
  readNotificationPrefs,
  writeNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export function HomeNotificationsBell({
  onStartSpicy,
}: {
  onStartSpicy: () => void;
}) {
  const router = useRouter();
  const {
    user,
    partner,
    game,
    checkIns,
    incomingCheckInRequest,
    coupons,
    jarNotes,
    curiosityAnswers,
    milestones,
    bucketItems,
    talkDraws,
    listEntries,
    spicyDares,
    fantasyTonightAsks,
  } = useApp();
  const { data: mini } = useMiniApps();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs());
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<
    | { type: "one"; id: string; line: string }
    | { type: "all" }
    | null
  >(null);

  useFocusEffect(
    useCallback(() => {
      void readNotificationPrefs().then(setPrefs);
    }, [])
  );

  const rows = useMemo(
    () =>
      buildHomeNotifications({
        user,
        partner,
        game,
        checkIns,
        incomingCheckInRequest,
        coupons,
        jarNotes,
        curiosityAnswers,
        milestones,
        bucketItems,
        talkDraws,
        listEntries,
        spicyDares,
        fantasyTonightAsks,
        sexyVault: mini.sexyVault,
      }).filter((item) => prefsShowStatusId(prefs, item.id)),
    [
      user,
      partner,
      game,
      checkIns,
      incomingCheckInRequest,
      coupons,
      jarNotes,
      curiosityAnswers,
      milestones,
      bucketItems,
      talkDraws,
      listEntries,
      spicyDares,
      fantasyTonightAsks,
      mini.sexyVault,
      prefs,
    ]
  );

  const persist = (next: NotificationPrefs) => {
    setPrefs(next);
    void writeNotificationPrefs(next);
  };

  const openGame = () => {
    const href = gameResumeHref(game);
    if (href) {
      router.push(href);
      return;
    }
    if (game?.status === "inviting") return;
    onStartSpicy();
  };

  const count = rows.length;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={
          count > 0 ? `Notifications, ${count} waiting` : "Notifications"
        }
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <Text style={{ fontSize: 20, lineHeight: 24 }}>🔔</Text>
        {count > 0 ? (
          <View
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              paddingHorizontal: 3,
              backgroundColor: "#FF007F",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 9,
                fontWeight: "800",
                lineHeight: 11,
              }}
            >
              {count > 9 ? "9+" : String(count)}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-start",
            paddingTop: 72,
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            style={{
              borderRadius: 22,
              backgroundColor: "#121218",
              borderWidth: 1,
              borderColor: "rgba(255,0,127,0.28)",
              overflow: "hidden",
              maxHeight: "70%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#FF007F",
                }}
              >
                Notifications
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {count > 0 ? (
                  <Pressable
                    onPress={() => setPending({ type: "all" })}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all notifications"
                    style={{
                      height: 34,
                      paddingHorizontal: 10,
                      borderRadius: 17,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#F4F4F6",
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      Clear all
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    router.push("/hub/notification-settings");
                  }}
                  hitSlop={8}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,0,127,0.12)",
                  }}
                >
                  <Ionicons name="settings-outline" size={16} color="#FF007F" />
                </Pressable>
                <Pressable
                  onPress={() => setOpen(false)}
                  hitSlop={8}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <Ionicons name="close" size={18} color="#F4F4F6" />
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {rows.length === 0 ? (
                <Text
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 22,
                    color: "rgba(244,244,246,0.5)",
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  Quiet for now. The next happening lands here.
                </Text>
              ) : (
                rows.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setOpen(false);
                      if (item.id === "game" || item.id.startsWith("game")) {
                        openGame();
                        return;
                      }
                      router.push(item.href as Href);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 14,
                      borderBottomWidth: index === rows.length - 1 ? 0 : 1,
                      borderBottomColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: "#F4F4F6",
                        fontSize: 14,
                        fontWeight: "600",
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {item.line}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                        color: "rgba(255,0,127,0.85)",
                      }}
                    >
                      {item.when}
                    </Text>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        setPending({
                          type: "one",
                          id: item.id,
                          line: item.line,
                        });
                      }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.line}`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color="rgba(244,244,246,0.7)"
                      />
                    </Pressable>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        open={pending?.type === "one"}
        title="Remove this?"
        body={
          pending?.type === "one"
            ? `Take “${pending.line}” off the list. It stays gone until something new happens.`
            : ""
        }
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending?.type === "one") {
            persist(dismissNotificationIds(prefs, [pending.id]));
          }
          setPending(null);
        }}
      />
      <ConfirmDialog
        open={pending?.type === "all"}
        title="Clear all?"
        body="This clears every waiting line on the bell. New happenings still show up."
        confirmLabel="Clear all"
        cancelLabel="Keep them"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          persist(dismissNotificationIds(prefs, rows.map((row) => row.id)));
          setPending(null);
        }}
      />
    </>
  );
}
