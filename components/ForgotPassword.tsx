import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { looksLikeEmail } from "@/lib/account-usage";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export function ForgotPassword() {
  const router = useRouter();
  const { usingCloud, requestEmailCode } = useApp();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!usingCloud) return null;

  const send = async () => {
    const trimmed = email.trim();
    if (!looksLikeEmail(trimmed)) {
      setError("That email does not look right.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestEmailCode(trimmed);
      router.replace("/check-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <PrimaryButton label="Forgot password" tone="ghost" onPress={() => setOpen(true)} />
    );
  }

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(244,244,246,0.45)",
        }}
      >
        Forgot password
      </Text>
      <Text
        style={{
          marginTop: 8,
          color: "rgba(244,244,246,0.65)",
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        There is no password. We email a 6-digit sign-in code so you can open
        the pair on this phone.
      </Text>
      <TextInput
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setError(null);
        }}
        placeholder="Email"
        placeholderTextColor="rgba(244,244,246,0.35)"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={{
          marginTop: 12,
          height: 48,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
          backgroundColor: "rgba(255,255,255,0.05)",
          paddingHorizontal: 14,
          color: "#F4F4F6",
          fontSize: 16,
        }}
      />
      {error ? (
        <Text style={{ marginTop: 8, color: "#FF8A8A", fontSize: 13 }}>{error}</Text>
      ) : null}
      <View style={{ marginTop: 12, gap: 10 }}>
        <PrimaryButton
          label="Email me the code"
          loading={loading}
          onPress={() => void send()}
        />
        <PrimaryButton
          label="Hide"
          tone="ghost"
          onPress={() => {
            setOpen(false);
            setError(null);
          }}
        />
      </View>
    </View>
  );
}
