import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { readPendingPair } from "@/lib/cloud-pair";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function CheckEmailScreen() {
  const router = useRouter();
  const { user, couple, pairError } = useApp();
  const [pending, setPending] = useState(() => readPendingPair());

  useEffect(() => {
    setPending(readPendingPair());
  }, []);

  useEffect(() => {
    if (readPendingPair()) return;
    if (!user || !couple) return;
    router.replace(couple.partnerB ? "/" : "/waiting");
  }, [user, couple, router]);

  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Almost there
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">Check your email</Text>
        <Text className="mt-3 text-[16px] leading-6 text-mist/65">
          We sent a link{pending?.displayName ? ` for ${pending.displayName}` : ""}. Open
          it on this phone. That is your account — new phone, same email. The
          six-character code is still how the two of you link.
        </Text>
        {pending?.intent === "join" && pending.code ? (
          <Text className="mt-3 text-[16px] leading-6 text-mist/65">
            After you tap the link, you join with code {pending.code}.
          </Text>
        ) : (
          <Text className="mt-3 text-[16px] leading-6 text-mist/65">
            After you tap the link, you get the pair code to send them.
          </Text>
        )}
        {pairError ? (
          <Text className="mt-4 text-[14px] leading-5 text-crimson">{pairError}</Text>
        ) : null}
        <View className="mt-8 gap-3">
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.replace("/welcome")} />
        </View>
      </View>
    </Screen>
  );
}
