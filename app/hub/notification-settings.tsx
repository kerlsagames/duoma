import { PushSetupCard } from "@/components/PushSetupCard";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import {
  NOTIFICATION_SECTION_OPTIONS,
  defaultNotificationPrefs,
  readNotificationPrefs,
  writeNotificationPrefs,
  type NotificationPrefs,
  type NotificationSection,
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

  const toggle = (kind: NotificationSection) => {
    save({
      ...prefs,
      enabled: {
        ...prefs.enabled,
        [kind]: !prefs.enabled[kind],
      },
    });
  };

  const hubs = NOTIFICATION_SECTION_OPTIONS.filter((row) => row.group === "hubs");
  const also = NOTIFICATION_SECTION_OPTIONS.filter((row) => row.group === "also");

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
          Turn on lock-screen pings for this phone, then pick which hubs and
          home widgets show on the bell.
        </Text>

        <View className="mt-6">
          <PushSetupCard />
        </View>

        <Text className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Hubs
        </Text>
        <Text className="mb-4 text-[14px] leading-5 text-mist/55">
          One switch each for Connect, Desire, Play, and Home Base.
        </Text>
        <SectionList rows={hubs} prefs={prefs} onToggle={toggle} />

        <Text className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Also on Home
        </Text>
        <Text className="mb-4 text-[14px] leading-5 text-mist/55">
          Calendar and daily check-ins sit above the hubs.
        </Text>
        <SectionList rows={also} prefs={prefs} onToggle={toggle} />
      </View>
    </Screen>
  );
}

function SectionList({
  rows,
  prefs,
  onToggle,
}: {
  rows: typeof NOTIFICATION_SECTION_OPTIONS;
  prefs: NotificationPrefs;
  onToggle: (kind: NotificationSection) => void;
}) {
  return (
    <View className="gap-2">
      {rows.map((row) => {
        const on = prefs.enabled[row.kind] !== false;
        return (
          <Pressable
            key={row.kind}
            onPress={() => onToggle(row.kind)}
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
  );
}
