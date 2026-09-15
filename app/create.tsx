import { looksLikeEmail } from "@/lib/account-usage";
import { GenderPicker } from "@/components/ui/GenderPicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function CreateAccountScreen() {
  const router = useRouter();
  const { createAccount } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!gender) return;
    const trimmedEmail = email.trim();
    if (trimmedEmail && !looksLikeEmail(trimmedEmail)) {
      setError("That email does not look right.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createAccount({
        displayName: name,
        gender,
        email: trimmedEmail || undefined,
      });
      router.replace("/waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Step 1
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">Your name</Text>
        <Text className="mt-2 text-[16px] leading-6 text-mist/65">
          Your name, plus Male or Female so spicy cards, positions, and
          roleplays speak to the right body. Email is how you get this pair
          back on a new phone. The six-character code is still how you link
          the two of you.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="What should they call you?"
          placeholderTextColor="rgba(244,244,246,0.35)"
          autoFocus
          className="mt-8 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email (for this phone and the next one)"
          placeholderTextColor="rgba(244,244,246,0.35)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          className="mt-3 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />

        <View className="mt-4">
          <GenderPicker value={gender} onChange={setGender} label="I am" />
        </View>

        {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="Generate my code"
            loading={loading}
            disabled={!name.trim() || !gender}
            onPress={() => void submit()}
          />
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
