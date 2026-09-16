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
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: demoMode ? "rgba(62,207,191,0.4)" : "rgba(255,0,127,0.28)",
          backgroundColor: demoMode ? "rgba(62,207,191,0.10)" : "rgba(255,0,127,0.08)",
          paddingVertical: 10,
          paddingHorizontal: 12,
          opacity: busy ? 0.65 : 1,
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 10,
              letterSpacing: 1.4,
              color: demoMode ? "#3ECFBF" : "#FF007F",
            }}
          >
            RILEY DEMO
          </Text>
          <Text style={{ marginTop: 2, color: "#F4F4F6", fontSize: 13, fontWeight: "700" }}>
            {busy
              ? "Switching…"
              : demoMode
                ? `On · ${partner?.displayName ?? "Riley"}`
                : "Off · tap to open"}
          </Text>
        </View>
        <Text
          style={{
            color: demoMode ? "#3ECFBF" : "rgba(244,244,246,0.55)",
            fontSize: 12,
            fontWeight: "700",
          }}
        >
          {demoMode ? "Leave" : "Open"}
        </Text>
      </Pressable>
      {error ? (
        <Text style={{ marginTop: 6, color: "#FF8A8A", fontSize: 12 }}>{error}</Text>
      ) : null}
    </View>
  );
}
