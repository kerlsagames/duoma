import { useApp } from "@/lib/store";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function HomeDemoFlip() {
  const { canUseDemo, demoMode, partner, enterDemo, leaveDemo } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canUseDemo) return null;

  const flip = async () => {
    setError(null);
    setBusy(true);
    try {
      if (demoMode) await leaveDemo();
      else await enterDemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Pressable
        disabled={busy}
        onPress={() => void flip()}
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: demoMode ? "rgba(62,207,191,0.45)" : "rgba(255,0,127,0.28)",
          backgroundColor: demoMode ? "rgba(62,207,191,0.10)" : "rgba(255,0,127,0.08)",
          paddingVertical: 12,
          paddingHorizontal: 14,
          opacity: busy ? 0.65 : 1,
        }}
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.6,
            color: demoMode ? "#3ECFBF" : "#FF007F",
          }}
        >
          {demoMode ? "DEMO" : "CREATOR"}
        </Text>
        <Text style={{ marginTop: 4, color: "#F4F4F6", fontSize: 15, fontWeight: "700" }}>
          {busy
            ? "Switching…"
            : demoMode
              ? "Back to my pair"
              : "Open Riley demo"}
        </Text>
        <Text style={{ marginTop: 3, color: "rgba(244,244,246,0.5)", fontSize: 12, lineHeight: 17 }}>
          {demoMode
            ? `You are in the Riley sandbox${partner?.displayName ? ` with ${partner.displayName}` : ""}. This does not touch your real partner.`
            : "Only your inbox. Flip in, try things, flip back to the live pair."}
        </Text>
      </Pressable>
      {error ? (
        <Text style={{ marginTop: 6, color: "#FF8A8A", fontSize: 12 }}>{error}</Text>
      ) : null}
    </View>
  );
}
