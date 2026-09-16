import { GenderPicker } from "@/components/ui/GenderPicker";
import { useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function DemoPane() {
  const router = useRouter();
  const { canUseDemo, demoMode, partner, user, enterDemo, leaveDemo } = useApp();
  const [gender, setGender] = useState<Gender>("female");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      await enterDemo("Riley", gender);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the demo.");
    } finally {
      setLoading(false);
    }
  };

  const exit = async () => {
    setError(null);
    setLoading(true);
    try {
      await leaveDemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not leave the demo.");
    } finally {
      setLoading(false);
    }
  };

  if (!canUseDemo) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>Demo pair</Text>
        <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 8, lineHeight: 20 }}>
          Riley is only for craigmkerlin@gmail.com. Sign in with that inbox, then come
          back. Nobody else gets a demo mode.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>Demo pair</Text>
      <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 8, lineHeight: 20 }}>
        Your sandbox only. Riley lives on a separate local pair so flipping in does not
        overwrite your real partner. Home has the same flip.
      </Text>
      {demoMode ? (
        <Text style={{ color: "#3ECFBF", marginTop: 16, fontWeight: "700" }}>
          Demo is on. You are paired with {partner?.displayName ?? "Riley"}.
        </Text>
      ) : (
        <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 16, lineHeight: 20 }}>
          {user?.email
            ? `Signed in as ${user.email}. Open demo, try things, then flip back.`
            : "Sign in with your creator email first if you want to return to a live pair."}
        </Text>
      )}
      <View style={{ marginTop: 20 }}>
        <GenderPicker value={gender} onChange={setGender} label="Riley is" />
      </View>
      {error ? (
        <Text style={{ color: "#FF8A8A", marginTop: 12 }}>{error}</Text>
      ) : null}
      <Pressable
        disabled={loading || demoMode}
        onPress={() => void start()}
        style={{
          marginTop: 20,
          backgroundColor: demoMode ? "rgba(255,255,255,0.08)" : "#FF007F",
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: "center",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: demoMode ? "#F4F4F6" : "#0B0B0E", fontWeight: "800" }}>
          {demoMode ? "Demo is on" : loading ? "Opening…" : "Open Riley demo"}
        </Text>
      </Pressable>
      <Pressable
        disabled={loading || !demoMode}
        onPress={() => void exit()}
        style={{
          marginTop: 12,
          borderWidth: 1,
          borderColor: demoMode ? "rgba(62,207,191,0.45)" : "rgba(255,255,255,0.15)",
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: "center",
          opacity: demoMode ? 1 : 0.45,
        }}
      >
        <Text style={{ color: "#F4F4F6", fontWeight: "700" }}>Back to my pair</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace("/")}
        style={{
          marginTop: 12,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#F4F4F6", fontWeight: "700" }}>Open Home</Text>
      </Pressable>
    </ScrollView>
  );
}
