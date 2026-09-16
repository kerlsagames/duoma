import { scanUpload } from "@/lib/media-scan";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AppState, Platform, Pressable, Text, View } from "react-native";

type Props = {
  children: ReactNode;
  /** When true, block screenshots on native and blur if the app backgrounds. */
  lock?: boolean;
};

/**
 * FLAG_SECURE on Android (via expo-screen-capture when installed),
 * blur overlay when the app is backgrounded or a screen is recording,
 * and no Camera Roll export from these surfaces.
 */
export function MediaShield({ children, lock = true }: Props) {
  const [cover, setCover] = useState(false);

  useEffect(() => {
    if (!lock) return;
    let allowed = true;
    try {
      // Optional native module — web and Expo Go without the plugin still run.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ScreenCapture = require("expo-screen-capture") as {
        preventScreenCaptureAsync?: () => Promise<void>;
        allowScreenCaptureAsync?: () => Promise<void>;
        addScreenshotListener?: (cb: () => void) => { remove: () => void };
      };
      void ScreenCapture.preventScreenCaptureAsync?.();
      const sub = ScreenCapture.addScreenshotListener?.(() => {
        if (allowed) setCover(true);
      });
      return () => {
        allowed = false;
        sub?.remove();
        void ScreenCapture.allowScreenCaptureAsync?.();
      };
    } catch {
      return;
    }
  }, [lock]);

  useEffect(() => {
    if (!lock) return;
    const onApp = (state: string) => {
      setCover(state !== "active");
    };
    const sub = AppState.addEventListener("change", onApp);
    const onVis = () => {
      if (typeof document === "undefined") return;
      setCover(document.visibilityState !== "visible");
    };
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVis);
    }
    return () => {
      sub.remove();
      if (Platform.OS === "web" && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVis);
      }
    };
  }, [lock]);

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => false}
      // @ts-expect-error web-only
      onContextMenu={
        Platform.OS === "web"
          ? (event: { preventDefault: () => void }) => event.preventDefault()
          : undefined
      }
    >
      {children}
      {cover && lock ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "#050507",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text style={{ color: "rgba(244,244,246,0.55)", fontSize: 15, textAlign: "center" }}>
            Hidden while this screen isn’t in the foreground.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function AdultAttest({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 12 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          borderWidth: 1.5,
          borderColor: checked ? "#E4B56A" : "rgba(246,231,220,0.35)",
          backgroundColor: checked ? "#E4B56A" : "transparent",
          marginTop: 1,
        }}
      />
      <Text style={{ flex: 1, color: "rgba(246,231,220,0.78)", fontSize: 13, lineHeight: 18 }}>
        Everyone in this photo or clip is 18 or older. It stays in Duoma — not the Camera Roll.
      </Text>
    </Pressable>
  );
}

export function useScanUpload() {
  return useCallback(scanUpload, []);
}
