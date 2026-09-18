import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { promptPwaInstall, usePwaInstallState } from "@/lib/pwa-install";
import { useState } from "react";
import { Platform, Text, View } from "react-native";

/** Only a real Chrome install button. No Safari lecture. Hidden once installed. */
export function InstallHomeScreenCard({ compact = false }: { compact?: boolean }) {
  const { standalone, canPrompt } = usePwaInstallState();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (Platform.OS !== "web" || standalone || !canPrompt) return null;

  const install = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const outcome = await promptPwaInstall();
      if (outcome === "accepted") {
        setStatus("Installed. Open Duoma from the Home Screen icon.");
      } else if (outcome === "dismissed") {
        setStatus("You can tap again if you still want the icon.");
      } else {
        setStatus("Use the browser menu → Add to Home Screen.");
      }
    } catch {
      setStatus("Use the browser menu → Add to Home Screen.");
    } finally {
      setBusy(false);
    }
  };

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
        Add Duoma to this phone
      </Text>
      <Text className="mt-2 text-[14px] leading-5 text-mist/75">
        One tap. Then open the icon.
      </Text>
      <View className="mt-3">
        <PrimaryButton
          label="Add to Home Screen"
          loading={busy}
          size="compact"
          onPress={() => void install()}
        />
      </View>
      {status ? (
        <Text className="mt-2 text-[13px] leading-5 text-mist/70">{status}</Text>
      ) : null}
    </View>
  );
}
