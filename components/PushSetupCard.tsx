import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  isIosDevice,
  isStandalonePwa,
  notificationPermission,
  pushSupported,
} from "@/lib/push";
import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";

export function PushSetupCard() {
  const { user, couple, enablePush, sendTestPush } = useApp();
  const [permission, setPermission] = useState(notificationPermission());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testState, setTestState] = useState<string | null>(null);
  const ios = isIosDevice();
  const standalone = isStandalonePwa();
  const supported = pushSupported();

  useEffect(() => {
    setPermission(notificationPermission());
  }, []);

  if (Platform.OS !== "web") {
    return (
      <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <Text className="text-[12px] uppercase tracking-widest text-mist/40">
          Notifications
        </Text>
        <Text className="mt-2 text-[16px] font-semibold text-mist">
          Use the Home Screen web app
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-mist/60">
          Fuse sends lock-screen pings with free web push. On a phone, open the
          hosted site in Safari or Chrome, add it to the Home Screen, then
          enable notifications from that icon. No Apple Developer fee.
        </Text>
      </View>
    );
  }

  const enable = async () => {
    setError(null);
    setTestState(null);
    setLoading(true);
    try {
      await enablePush();
      setPermission("granted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable");
    } finally {
      setLoading(false);
    }
  };

  const ping = async () => {
    setError(null);
    setTestState(null);
    try {
      await sendTestPush();
      setTestState("Test ping sent. Check the lock screen or notification tray.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a test");
    }
  };

  return (
    <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <Text className="text-[12px] uppercase tracking-widest text-mist/40">
        Lock screen
      </Text>
      <Text className="mt-2 text-[16px] font-semibold text-mist">
        {permission === "granted"
          ? "Notifications are on"
          : "Ping your partner"}
      </Text>
      <Text className="mt-2 text-[14px] leading-5 text-mist/60">
        Get Spicy invites, favor coupons, today's curiosity, and a ready jar
        land as web push. HTTPS only. Free VAPID keys — no Apple $99 account.
      </Text>

      {ios ? (
        <View className="mt-4 rounded-2xl border border-neon/25 bg-neon/10 p-4">
          <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
            iPhone · iOS 16.4+
          </Text>
          <Text className="mt-2 text-[14px] leading-6 text-mist/75">
            Safari tab cannot receive push. Share → Add to Home Screen, open Fuse
            from that icon, then grant notifications. Native apps and paid
            hosting are not required.
          </Text>
          {!standalone ? (
            <Text className="mt-2 text-[13px] leading-5 text-crimson">
              You are still in Safari. Add Fuse to the Home Screen first.
            </Text>
          ) : (
            <Text className="mt-2 text-[13px] leading-5 text-mist/70">
              Home Screen app is open. You can grant permission now.
            </Text>
          )}
        </View>
      ) : null}

      {!supported ? (
        <Text className="mt-3 text-[14px] leading-5 text-mist/60">
          This browser does not support web push. Use Safari (Home Screen) on
          iOS, or Chrome / Edge / Firefox on desktop.
        </Text>
      ) : null}

      {permission === "denied" ? (
        <Text className="mt-3 text-[14px] leading-5 text-crimson">
          Notifications are blocked for this site. Reset permission in the
          browser settings, then try again.
        </Text>
      ) : null}

      {!user || !couple ? (
        <Text className="mt-3 text-[14px] leading-5 text-mist/60">
          Pair first, then enable notifications so we know which lock screen to
          hit.
        </Text>
      ) : null}

      {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}
      {testState ? (
        <Text className="mt-3 text-[14px] leading-5 text-mist/80">{testState}</Text>
      ) : null}

      <View className="mt-4 gap-3">
        <PrimaryButton
          label={
            permission === "granted" ? "Notifications enabled" : "Enable notifications"
          }
          loading={loading}
          disabled={
            !supported ||
            !user ||
            !couple ||
            permission === "denied" ||
            (ios && !standalone)
          }
          onPress={() => void enable()}
        />
        {permission === "granted" ? (
          <PrimaryButton
            label="Send me a test ping"
            tone="ghost"
            onPress={() => void ping()}
          />
        ) : null}
      </View>
    </View>
  );
}
