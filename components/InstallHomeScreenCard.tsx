import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  promptPwaInstall,
  usePwaInstallState,
} from "@/lib/pwa-install";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

/**
 * Home Screen install prompt.
 * Hides only when Duoma is open as a standalone Home Screen app.
 * iPhone copy cannot be dismissed while still in Safari — lock-screen
 * pings never work from that tab, and How-to is easy to miss.
 */
export function InstallHomeScreenCard({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { standalone, canPrompt, ios } = usePwaInstallState();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (Platform.OS !== "web" || standalone) return null;

  const install = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const outcome = await promptPwaInstall();
      if (outcome === "accepted") {
        setStatus("Installed. Open Duoma from the Home Screen icon.");
      } else if (outcome === "dismissed") {
        setStatus("Chrome closed the prompt. You can tap again, or use the menu.");
      } else {
        setStatus(
          "This browser has no install button. Use Chrome’s menu → Add to Home Screen."
        );
      }
    } catch {
      setStatus("Could not open the install prompt. Use Chrome’s menu instead.");
    } finally {
      setBusy(false);
    }
  };

  const openHowTo = () => router.push("/how-to" as Href);

  return (
    <View
      className="rounded-3xl border border-neon/35 bg-neon/10"
      style={{ marginBottom: compact ? 10 : 16, padding: compact ? 12 : 16 }}
    >
      <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-neon">
        Home Screen
      </Text>
      <Text
        className="mt-1 font-semibold text-mist"
        style={{ fontSize: compact ? 15 : 16 }}
      >
        {ios ? "Add Duoma from Safari" : "Add Duoma to this phone"}
      </Text>

      {ios ? (
        compact ? (
          <Text className="mt-1.5 text-[13px] leading-5 text-mist/75">
            Share → Add to Home Screen → open that icon, not this tab. Pings
            never work from Safari. How-to keeps these steps.
          </Text>
        ) : (
          <>
            <Text className="mt-2 text-[14px] leading-5 text-mist/75">
              A Safari tab cannot get lock-screen pings. Stay in Safari, then:
            </Text>
            <View className="mt-3 gap-2">
              <Step n="1" text="Tap Share (the square with the arrow)." />
              <Step n="2" text="Tap Add to Home Screen, then Add." />
              <Step n="3" text="Open the new Duoma icon — not this tab." />
            </View>
            <Text className="mt-3 text-[13px] leading-5 text-crimson">
              This stays until you open that icon. There is no dismiss while you
              are still in Safari.
            </Text>
          </>
        )
      ) : canPrompt ? (
        <>
          <Text className="mt-2 text-[14px] leading-5 text-mist/75">
            Chrome can install Duoma with one tap. Open it from the icon after.
          </Text>
          <View className="mt-3">
            <PrimaryButton
              label="Add to Home Screen"
              loading={busy}
              size="compact"
              onPress={() => void install()}
            />
          </View>
        </>
      ) : (
        <Text className="mt-2 text-[14px] leading-5 text-mist/75">
          Chrome menu → Add to Home Screen, then open the icon. iPhone has to
          use Safari Share instead — Chrome on iOS cannot do this.
        </Text>
      )}

      {status ? (
        <Text className="mt-2 text-[13px] leading-5 text-mist/70">{status}</Text>
      ) : null}

      <Pressable
        onPress={openHowTo}
        accessibilityRole="button"
        accessibilityLabel="Open How it works for Home Screen steps"
        className="mt-2 flex-row items-center"
        hitSlop={8}
      >
        <Text className="text-[13px] font-semibold text-mist/80">
          Share steps stay in How-to
        </Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color="rgba(244,244,246,0.55)"
          style={{ marginLeft: 2 }}
        />
      </Pressable>
    </View>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View className="flex-row items-start">
      <View className="mr-2 mt-px h-5 w-5 items-center justify-center rounded-full bg-neon/25">
        <Text className="text-[11px] font-bold text-neon">{n}</Text>
      </View>
      <Text className="flex-1 text-[14px] leading-5 text-mist/80">{text}</Text>
    </View>
  );
}
