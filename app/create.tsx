import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function CreateAccountScreen() {
  const router = useRouter();
  const { createAccount } = useApp();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await createAccount({ displayName: name });
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
          We'll generate a 6-character invite code the moment your profile
          lands. Share it. Wait for the spark.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="What should they call you?"
          placeholderTextColor="rgba(244,244,246,0.35)"
          autoFocus
          className="mt-8 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
        />
        {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="Generate my code"
            loading={loading}
            disabled={!name.trim()}
            onPress={() => void submit()}
          />
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
