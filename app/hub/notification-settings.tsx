import { PushSetupCard } from "@/components/PushSetupCard";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import type { HubFeature, HubId } from "@/lib/hubs";
import {
  NOTIFICATION_SECTION_OPTIONS,
  appsForHub,
  defaultNotificationPrefs,
  hubAppsOnCount,
  readNotificationPrefs,
  setAppEnabled,
  setHubApps,
  writeNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function NotificationSettingsScreen() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs);
  const [openHub, setOpenHub] = useState<HubId | null>(null);

  useEffect(() => {
    void readNotificationPrefs().then(setPrefs);
  }, []);

  const save = (next: NotificationPrefs) => {
    setPrefs(next);
    void writeNotificationPrefs(next);
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
          Turn on lock-screen pings for this phone, then pick which apps show on
          the Home bell.
        </Text>

        <View className="mt-6">
          <PushSetupCard />
        </View>

        <Text className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Hubs
        </Text>
        <Text className="mb-4 text-[14px] leading-5 text-mist/55">
          Open a hub and switch each app on or off.
        </Text>
        <View className="gap-2">
          {hubs.map((row) => {
            if (!row.hubId) return null;
            const features = appsForHub(row.hubId);
            const onCount = hubAppsOnCount(prefs, row.hubId);
            const expanded = openHub === row.hubId;
            const allOn = onCount === features.length;
            return (
              <View
                key={row.kind}
                className="overflow-hidden rounded-2xl border"
                style={{
                  borderColor: onCount
                    ? "rgba(255,0,127,0.45)"
                    : "rgba(244,244,246,0.1)",
                  backgroundColor: onCount
                    ? "rgba(255,0,127,0.1)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() =>
                      setOpenHub((current) =>
                        current === row.hubId ? null : row.hubId ?? null
                      )
                    }
                    className="min-h-[64px] flex-1 flex-row items-center px-4 py-3.5"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-[16px] font-semibold text-mist">
                        {row.label}
                      </Text>
                      <Text className="mt-1 text-[13px] leading-5 text-mist/55">
                        {onCount} of {features.length} apps on
                      </Text>
                    </View>
                    <Ionicons
                      name={expanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="rgba(244,244,246,0.55)"
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => save(setHubApps(prefs, row.hubId!, !allOn))}
                    hitSlop={8}
                    accessibilityLabel={
                      allOn ? `Turn off ${row.label}` : `Turn on ${row.label}`
                    }
                    className="h-16 w-14 items-center justify-center"
                  >
                    <Ionicons
                      name={allOn ? "notifications" : "notifications-off-outline"}
                      size={22}
                      color={allOn ? "#FF007F" : "rgba(244,244,246,0.35)"}
                    />
                  </Pressable>
                </View>
                {expanded ? (
                  <View className="border-t border-white/10 px-2 pb-2 pt-1">
                    {features.map((feature) => (
                      <AppToggle
                        key={feature.id}
                        feature={feature}
                        on={prefs.apps[feature.id] !== false}
                        onPress={() =>
                          save(
                            setAppEnabled(
                              prefs,
                              feature.id,
                              prefs.apps[feature.id] === false
                            )
                          )
                        }
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <Text className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Also on Home
        </Text>
        <Text className="mb-4 text-[14px] leading-5 text-mist/55">
          Calendar and daily check-ins sit above the hubs.
        </Text>
        <View className="gap-2">
          {also.map((row) => {
            const appId = row.kind === "check_in" ? "check-in" : "calendar";
            const on = prefs.apps[appId] !== false;
            return (
              <Pressable
                key={row.kind}
                onPress={() => save(setAppEnabled(prefs, appId, !on))}
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

function AppToggle({
  feature,
  on,
  onPress,
}: {
  feature: HubFeature;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-xl px-3 py-2.5"
    >
      <View className="flex-1 pr-3">
        <Text className="text-[15px] font-semibold text-mist">{feature.label}</Text>
      </View>
      <Ionicons
        name={on ? "notifications" : "notifications-off-outline"}
        size={20}
        color={on ? "#FF007F" : "rgba(244,244,246,0.35)"}
      />
    </Pressable>
  );
}
