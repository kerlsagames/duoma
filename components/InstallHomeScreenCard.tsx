import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  promptPwaInstall,
  usePwaInstallState,
} from "@/lib/pwa-install";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

/**
 * Home Screen install prompt.
 * Hides only when Duoma is open as a standalone Home Screen app.
 * iPhone copy cannot be dismissed while still in Safari — lock-screen
 * pings never work from that tab, and How-to is easy to miss.
 * Chrome on iPhone has no install button; copy the link and finish in Safari.
 */
export function InstallHomeScreenCard({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { standalone, canPrompt, ios, iosChrome } = usePwaInstallState();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (Platform.OS !== "web" || standalone) return null;

  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://duoma.vercel.app";

  const copyLink = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await Clipboard.setStringAsync(pageUrl);
      setStatus("Link copied. Open Safari, paste in the address bar, then Share → Add to Home Screen.");
    } catch {
      setStatus(pageUrl);
    } finally {
      setBusy(false);
    }
  };

  const openSafari = () => {
    if (typeof window === "undefined") return;
    const href = window.location.href;
    const safari = href.startsWith("https:")
      ? href.replace(/^https:/, "x-safari-https:")
      : href.replace(/^http:/, "x-safari-http:");
    window.location.href = safari;
    setStatus("If Safari did not open, copy the link and paste it there yourself.");
  };

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
        {iosChrome
          ? "Chrome on iPhone cannot add the icon"
          : ios
            ? "Add Duoma from Safari"
            : "Add Duoma to this phone"}
      </Text>

      {iosChrome ? (
        <>
          <Text className="mt-2 text-[14px] leading-5 text-mist/75">
            {compact
              ? "There is no Add to Home Screen button in iPhone Chrome. Copy this link, open Safari, paste it, then Share → Add to Home Screen."
              : "Apple only lets Safari create the Home Screen app that can get lock-screen pings. Chrome on iPhone has no download-to-screen button for Duoma. Copy the link, switch to Safari, paste it, then Share → Add to Home Screen."}
          </Text>
          <View className="mt-3 gap-2">
            <PrimaryButton
              label="Copy Duoma link"
              loading={busy}
              size="compact"
              onPress={() => void copyLink()}
            />
            <PrimaryButton
              label="Try opening Safari"
              tone="ghost"
              size="compact"
              onPress={openSafari}
            />
          </View>
        </>
      ) : ios ? (
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
          Chrome menu → Add to Home Screen, then open the icon. iPhone Chrome
          cannot do this — copy the link and finish in Safari.
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
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "rgba(255,0,127,0.22)",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "800", color: "#FF007F" }}>{n}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: "rgba(244,244,246,0.8)" }}>
        {text}
      </Text>
    </View>
  );
}
