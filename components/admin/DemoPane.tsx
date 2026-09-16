import { GenderPicker } from "@/components/ui/GenderPicker";
import { useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function DemoPane() {
  const router = useRouter();
  const { user, partner, couple, addDemoPartner } = useApp();
  const [gender, setGender] = useState<Gender>("female");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = Boolean(partner?.isDemo);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      await addDemoPartner("Riley", gender);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the demo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>Demo pair</Text>
      <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 8, lineHeight: 20 }}>
        Creator only. Regular sign-up never sees this. Riley joins this phone as a fake
        partner: check-in, jar note, lists, a Chicken dare waiting, and they answer
        like a person in Get Spicy, pings, coupons, and the rest.
      </Text>
      {live ? (
        <Text style={{ color: "#3ECFBF", marginTop: 16, fontWeight: "700" }}>
          You are paired with {partner?.displayName} (demo).
        </Text>
      ) : partner && !partner.isDemo ? (
        <Text style={{ color: "#E4C37A", marginTop: 16, lineHeight: 20 }}>
          This pair already has {partner.displayName}. Demo needs an open pair. Sign
          out of the real pair first, then come back here.
        </Text>
      ) : (
        <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 16, lineHeight: 20 }}>
          {user
            ? "Adds Riley to this pair."
            : "Makes a local You on this phone, then pairs Riley. Nothing is sent to other users."}
        </Text>
      )}
      <View style={{ marginTop: 20 }}>
        <GenderPicker value={gender} onChange={setGender} label="Riley is" />
      </View>
      {error ? (
        <Text style={{ color: "#FF8A8A", marginTop: 12 }}>{error}</Text>
      ) : null}
      <Pressable
        disabled={loading || live || Boolean(partner && !partner.isDemo)}
        onPress={() => void start()}
        style={{
          marginTop: 20,
          backgroundColor: live ? "rgba(255,255,255,0.08)" : "#FF007F",
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: "center",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: live ? "#F4F4F6" : "#0B0B0E", fontWeight: "800" }}>
          {live ? "Demo is on" : loading ? "Pairing…" : "Pair me with Riley"}
        </Text>
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
      {couple?.inviteCode ? (
        <Text style={{ color: "rgba(244,244,246,0.4)", marginTop: 16, fontSize: 12 }}>
          Pair code on this phone {couple.inviteCode}
        </Text>
      ) : null}
    </ScrollView>
  );
}
