import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function BannedScreen() {
  const router = useRouter();
  const { user, signOut } = useApp();

  return (
    <Screen>
      <View className="flex-1 justify-center px-2">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Account closed
        </Text>
        <Text className="mt-3 text-[32px] font-bold text-mist">This pair is paused</Text>
        <Text className="mt-3 text-[16px] leading-6 text-mist/65">
          {user?.bannedReason?.trim() ||
            "This account was closed by Duoma. If that is a mistake, email kerlsagameshq@gmail.com."}
        </Text>
        <View className="mt-8">
          <PrimaryButton
            label="Sign out"
            onPress={() => {
              void signOut().then(() => router.replace("/welcome"));
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
