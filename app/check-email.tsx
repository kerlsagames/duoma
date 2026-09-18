import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { looksLikeEmail } from "@/lib/account-usage";
import {
  clearAuthRedirectError,
  readAuthRedirectError,
  readPendingPair,
} from "@/lib/cloud-pair";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function CheckEmailScreen() {
  const router = useRouter();
  const { user, couple, pairError, requestEmailCode, verifyEmailCode } = useApp();
  const [pending, setPending] = useState(() => readPendingPair());
  const [email, setEmail] = useState(pending?.email ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(Boolean(pending?.email));

  useEffect(() => {
    const next = readPendingPair();
    setPending(next);
    if (next?.email) setEmail(next.email);
    const authError = readAuthRedirectError();
    if (authError) {
      setError(authError);
      clearAuthRedirectError();
    }
  }, []);

  useEffect(() => {
    if (!user || !couple) return;
    if (readPendingPair() && !couple.inviteCode) return;
    router.replace("/");
  }, [user, couple, router]);

  const send = async () => {
    const trimmed = email.trim();
    if (!looksLikeEmail(trimmed)) {
      setError("That email does not look right.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await requestEmailCode(trimmed);
      setPending(readPendingPair());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setSending(false);
    }
  };

  const confirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await verifyEmailCode(code);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm that code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Your account
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">Check your email</Text>
        <Text className="mt-3 text-[16px] leading-6 text-mist/65">
          Do not tap the link — Gmail often burns it. Type the 6-digit code from
          the email. Then set a password in Home settings so the next sign-in
          does not need Gmail.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="rgba(244,244,246,0.35)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          className="mt-8 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />

        {sent ? (
          <TextInput
            value={code}
            onChangeText={(value) => setCode(value.replace(/[^\d]/g, "").slice(0, 8))}
            placeholder="6-digit code"
            placeholderTextColor="rgba(244,244,246,0.35)"
            keyboardType="number-pad"
            maxLength={8}
            className="mt-3 h-16 rounded-2xl border border-neon/40 bg-white/5 px-4 text-center text-[28px] font-bold tracking-[8px] text-mist"
          />
        ) : null}

        {error || pairError ? (
          <Text className="mt-3 text-[14px] leading-5 text-crimson">
            {error || pairError}
          </Text>
        ) : null}

        <View className="mt-8 gap-3">
          {sent ? (
            <PrimaryButton
              label="Open the app"
              loading={loading}
              disabled={code.trim().length < 6}
              onPress={() => void confirm()}
            />
          ) : null}
          <PrimaryButton
            label={sent ? "Send a new code" : "Email me the code"}
            tone={sent ? "ghost" : "neon"}
            loading={sending}
            disabled={!email.trim()}
            onPress={() => void send()}
          />
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.replace("/welcome")} />
        </View>
      </View>
    </Screen>
  );
}
