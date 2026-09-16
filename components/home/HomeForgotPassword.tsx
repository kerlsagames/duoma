import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { looksLikeEmail } from "@/lib/account-usage";
import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

export function HomeForgotPassword() {
  const { user, usingCloud, requestEmailCode, demoMode } = useApp();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  if (!usingCloud || demoMode) return null;

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
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
    } finally {
      setLoading(false);
    }
  };

  if (!open && !sent) {
    return (
      <View style={{ marginBottom: 16 }}>
        <PrimaryButton label="Forgot password" tone="ghost" onPress={() => setOpen(true)} />
      </View>
    );
  }

  return (
    <View
      style={{
        marginBottom: 16,
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
        There is no password. We email a sign-in link to this address so you can
        open the pair on a new phone.
      </Text>
      <TextInput
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setSent(false);
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
      {sent ? (
        <Text style={{ marginTop: 8, color: "#F4F4F6", fontSize: 13, lineHeight: 18 }}>
          Sent to {email.trim()}. Open the link, or type the 6-digit code on
          Check your email.
        </Text>
      ) : null}
      <View style={{ marginTop: 12, gap: 10 }}>
        <PrimaryButton
          label={sent ? "Send again" : "Email me the link"}
          loading={loading}
          onPress={() => void send()}
        />
        <PrimaryButton
          label="Hide"
          tone="ghost"
          onPress={() => {
            setOpen(false);
            setSent(false);
            setError(null);
          }}
        />
      </View>
    </View>
  );
}
