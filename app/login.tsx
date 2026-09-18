import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { looksLikeEmail } from "@/lib/account-usage";
import { useApp } from "@/lib/store";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const { ready, user, usingCloud, signInWithPassword, requestEmailCode } = useApp();
  const paramEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const [email, setEmail] = useState(paramEmail ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-night">
        <ActivityIndicator color="#FF007F" />
      </View>
    );
  }
  if (user) return <Redirect href="/" />;

  const open = async () => {
    const trimmed = email.trim();
    if (!looksLikeEmail(trimmed)) {
      setError("That email does not look right.");
      return;
    }
    if (!password) {
      setError("Enter the password you set for this pair.");
      return;
    }
    if (!usingCloud) {
      setError("Cloud sign-in is not connected on this build.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(trimmed, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    const trimmed = email.trim();
    if (!looksLikeEmail(trimmed)) {
      setError("Enter the email on your pair first.");
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

  return (
    <Screen scroll>
      <View className="pt-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Sign in
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">Your password</Text>
        <Text className="mt-3 text-[16px] leading-6 text-mist/65">
          Email and the password you chose. No Gmail code unless you forgot it.
          On iPhone, add Duoma from Safari first, then sign in from that icon.
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
          autoFocus
          className="mt-8 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />
        <TextInput
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError(null);
          }}
          placeholder="Password"
          placeholderTextColor="rgba(244,244,246,0.35)"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          textContentType="password"
          className="mt-3 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />

        {error ? (
          <Text className="mt-3 text-[14px] leading-5 text-crimson">{error}</Text>
        ) : null}

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="Open the app"
            loading={loading}
            disabled={!email.trim() || !password}
            onPress={() => void open()}
          />
          <PrimaryButton
            label="Forgot password — email a code"
            tone="ghost"
            disabled={!email.trim()}
            onPress={() => void forgot()}
          />
          <PrimaryButton
            label="Back"
            tone="ghost"
            onPress={() => router.replace("/welcome")}
          />
        </View>
      </View>
    </Screen>
  );
}
