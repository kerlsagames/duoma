import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { looksLikeEmail } from "@/lib/account-usage";
import { useApp } from "@/lib/store";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string | string[];
    reauth?: string | string[];
    from?: string | string[];
  }>();
  const {
    ready,
    user,
    usingCloud,
    signInWithPassword,
  } = useApp();
  const paramEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const reauthFlag = Array.isArray(params.reauth) ? params.reauth[0] : params.reauth;
  const fromFlag = Array.isArray(params.from) ? params.from[0] : params.from;
  const signedInIntent =
    Boolean(paramEmail) || reauthFlag === "1" || fromFlag === "signin";
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
  const sessionEmail = user?.email?.trim() || "";
  if (user) return <Redirect href="/" />;
  if (!signedInIntent) return <Redirect href="/welcome" />;

  const filledEmail = email.trim() || sessionEmail;

  const open = async () => {
    if (!looksLikeEmail(filledEmail)) {
      setError("That email does not look right.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (!usingCloud) {
      setError("Cloud sign-in is not connected on this build.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(filledEmail, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
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
          Email and password. That is how you open Duoma from the Home Screen
          icon.
        </Text>

        <TextInput
          value={email || sessionEmail}
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
            disabled={!filledEmail || !password}
            onPress={() => void open()}
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
