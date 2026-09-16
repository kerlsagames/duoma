import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { looksLikeEmail } from "@/lib/account-usage";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { usingCloud, requestEmailCode } = useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const trimmed = email.trim();
    if (!looksLikeEmail(trimmed)) {
      setError("That email does not look right.");
      return;
    }
    if (!usingCloud) {
      setError("Cloud sign-in is not connected on this build.");
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
          Forgot password
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">Sign in</Text>
        <Text className="mt-3 text-[16px] leading-6 text-mist/65">
          There is no password. Enter the email on your pair. We send a 6-digit
          code. Type it on the next screen — do not tap the email link.
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

        {error ? (
          <Text className="mt-3 text-[14px] leading-5 text-crimson">{error}</Text>
        ) : null}

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="Email me the code"
            loading={loading}
            disabled={!email.trim()}
            onPress={() => void send()}
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
