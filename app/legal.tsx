import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { LEGAL_EFFECTIVE, PRIVACY_NOTICE, TERMS_OF_USE } from "@/lib/legal";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function LegalScreen() {
  const router = useRouter();

  return (
    <Screen scroll>
      <View className="pt-8 pb-10">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Legal
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">Terms and privacy</Text>
        <Text className="mt-2 text-[15px] leading-6 text-mist/65">
          Effective {LEGAL_EFFECTIVE}. You agree to these when you create or join a
          pair.
        </Text>
        <Text className="mt-8 text-[22px] font-bold text-mist">Terms of Use</Text>
        <Text className="mt-3 text-[14px] leading-[21px] text-mist/70">{TERMS_OF_USE}</Text>
        <Text className="mt-10 text-[22px] font-bold text-mist">Privacy Policy</Text>
        <Text className="mt-3 text-[14px] leading-[21px] text-mist/70">{PRIVACY_NOTICE}</Text>
        <View className="mt-8">
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
