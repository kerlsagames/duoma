import { GenderPicker } from "@/components/ui/GenderPicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function JoinScreen() {
  const router = useRouter();
  const { joinWithCode } = useApp();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!gender) return;
    setError(null);
    setLoading(true);
    try {
      await joinWithCode({ displayName: name, gender, code });
      router.replace("/(tabs)");
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
          Six characters. No zeros, no ones. Your name and Male/Female land on
          the pair so cards can speak to both of you.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="rgba(244,244,246,0.35)"
          className="mt-8 h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
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
        {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="Link us"
            loading={loading}
            disabled={!name.trim() || !gender || code.trim().length !== 6}
            onPress={() => void submit()}
          />
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
