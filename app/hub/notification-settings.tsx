import { PushSetupCard } from "@/components/PushSetupCard";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import {
  NOTIFICATION_KIND_OPTIONS,
  defaultNotificationPrefs,
  readNotificationPrefs,
  writeNotificationPrefs,
  type NotificationKind,
  type NotificationPrefs,
} from "@/lib/notification-prefs";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function NotificationSettingsScreen() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs);

  useEffect(() => {
    void readNotificationPrefs().then(setPrefs);
  }, []);

  const save = (next: NotificationPrefs) => {
    setPrefs(next);
    void writeNotificationPrefs(next);
  };

  const toggle = (kind: NotificationKind) => {
    save({
      enabled: {
        ...prefs.enabled,
        [kind]: !prefs.enabled[kind],
      },
    });
  };

  return (
    <Screen scroll>
      <View className="pt-4 pb-10">
        <BackButton style={{ marginBottom: 12 }} />
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Notifications
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">
          What reaches you
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-mist/60">
          Turn on lock-screen pings for this phone, then pick which moments show
          on Home and hit your notifications.
        </Text>

        <View className="mt-6">
          <PushSetupCard />
        </View>

        <Text className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Show & notify
        </Text>
        <Text className="mb-4 text-[14px] leading-5 text-mist/55">
          These control the Home notifications list and the lock-screen pings you
          want for each kind.
        </Text>

        <View className="gap-2">
          {NOTIFICATION_KIND_OPTIONS.map((row) => {
            const on = prefs.enabled[row.kind] !== false;
            return (
              <Pressable
                key={row.kind}
                onPress={() => toggle(row.kind)}
                className="flex-row items-center rounded-2xl border px-4 py-3.5"
                style={{
                  borderColor: on
                    ? "rgba(255,0,127,0.45)"
                    : "rgba(244,244,246,0.1)",
                  backgroundColor: on
                    ? "rgba(255,0,127,0.1)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-[16px] font-semibold text-mist">
                    {row.label}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-mist/55">
                    {row.detail}
                  </Text>
                </View>
                <Ionicons
                  name={on ? "notifications" : "notifications-off-outline"}
                  size={22}
                  color={on ? "#FF007F" : "rgba(244,244,246,0.35)"}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
