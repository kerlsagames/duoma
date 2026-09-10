import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useApp } from "@/lib/store";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Share, Text, View } from "react-native";

export default function WaitingScreen() {
  const router = useRouter();
  const { couple, partner, addDemoPartner, signOut } = useApp();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (couple?.partnerB && partner) {
      router.replace("/(tabs)");
    }
  }, [couple?.partnerB, partner, router]);

  const share = async () => {
    if (!couple) return;
    const message = `Fuse with me tonight. My invite code is ${couple.inviteCode}`;
    try {
      await Share.share({ message });
    } catch {
      await Clipboard.setStringAsync(couple.inviteCode);
      setCopied(true);
    }
  };

  const copy = async () => {
    if (!couple) return;
    await Clipboard.setStringAsync(couple.inviteCode);
    setCopied(true);
  };

  return (
    <Screen>
      <View className="flex-1 justify-between py-6">
        <View>
          <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
            Pairing
          </Text>
          <Text className="mt-3 text-[34px] font-bold text-mist">
            Send the code
          </Text>
          <Text className="mt-2 text-[16px] leading-6 text-mist/65">
            Open Fuse on a second phone — or another browser tab — and join with
            this code. You only do this once. After they join, you stay paired.
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-[11px] uppercase tracking-[4px] text-mist/40">
            Invite code
          </Text>
          <Text
            className="mt-3 text-[48px] font-bold tracking-[8px] text-mist"
            style={{ fontFamily: "SpaceMono" }}
          >
            {couple?.inviteCode ?? "------"}
          </Text>
        </View>

        <View className="gap-3 pb-2">
          <PrimaryButton label="Share code" onPress={() => void share()} />
          <PrimaryButton
            label={copied ? "Copied" : "Copy code"}
            tone="ghost"
            onPress={() => void copy()}
          />
          <PrimaryButton
            label="Continue with a demo partner"
            tone="crimson"
            onPress={() => void addDemoPartner()}
          />
          <PrimaryButton
            label="Sign out"
            tone="ghost"
            onPress={() => {
              void signOut();
              router.replace("/welcome");
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
