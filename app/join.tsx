import { looksLikeEmail } from "@/lib/account-usage";
import { ConsentChecks } from "@/components/ConsentChecks";
import { GenderPicker } from "@/components/ui/GenderPicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { normalizeInviteCode } from "@/lib/invite";
import { useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";

function codeFromWindow(): string {
  if (Platform.OS !== "web" || typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeInviteCode(params.get("code") ?? params.get("invite"));
  } catch {
    return "";
  }
}

export default function JoinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string | string[]; invite?: string | string[] }>();
  const { joinWithCode, usingCloud } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [code, setCode] = useState(() =>
    normalizeInviteCode(params.code) || normalizeInviteCode(params.invite) || codeFromWindow()
  );
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next =
      normalizeInviteCode(params.code) ||
      normalizeInviteCode(params.invite) ||
      codeFromWindow();
    if (next && next !== code) setCode(next);
  }, [params.code, params.invite, code]);

  const submit = async () => {
    if (!gender) return;
    const trimmedEmail = email.trim();
    if (usingCloud && !trimmedEmail) {
      setError("Email is how you open this pair again if this phone dies.");
      return;
    }
    if (trimmedEmail && !looksLikeEmail(trimmedEmail)) {
      setError("That email does not look right.");
      return;
    }
    if (!agreed) {
      setError("Tick that you are 18+ and agree to the Terms and Privacy Policy.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await joinWithCode({
        displayName: name,
        gender,
        code,
        email: trimmedEmail || undefined,
      });
      router.replace(usingCloud ? "/check-email" : "/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Join
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">Enter the code</Text>
        <Text className="mt-2 text-[16px] leading-6 text-mist/65">
          {code.length === 6
            ? `Code ${code} is already in the box from their invite. Add your name and email, then the 6-digit email code.`
            : "Two of you. One code. Email is the account on this phone and the next one. The code is still how you become a pair."}
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="rgba(244,244,246,0.35)"
          className="mt-8 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={usingCloud ? "Email (required)" : "Email (for a new phone later)"}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholderTextColor="rgba(244,244,246,0.35)"
          className="mt-3 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />

        <View className="mt-4">
          <GenderPicker value={gender} onChange={setGender} label="I am" />
        </View>

        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.toUpperCase())}
          placeholder="ABC234"
          placeholderTextColor="rgba(244,244,246,0.35)"
          autoCapitalize="characters"
          maxLength={6}
          className="mt-3 h-16 rounded-2xl border border-neon/40 bg-white/5 px-4 text-center text-[28px] font-bold tracking-[10px] text-mist"
        />

        <ConsentChecks agreed={agreed} onAgreed={setAgreed} />

        {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}

        <View className="mt-8 gap-3">
          <PrimaryButton
            label={usingCloud ? "Email me the link" : "Link us"}
            loading={loading}
            disabled={
              !name.trim() ||
              !gender ||
              !agreed ||
              code.trim().length !== 6 ||
              (usingCloud && !email.trim())
            }
            onPress={() => void submit()}
          />
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
