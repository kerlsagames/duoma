import { GenderPicker } from "@/components/ui/GenderPicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Share, Text, View } from "react-native";

export default function WaitingScreen() {
  const router = useRouter();
  const { couple, partner, addDemoPartner, signOut } = useApp();
  const [copied, setCopied] = useState(false);
  const [demoGender, setDemoGender] = useState<Gender>("female");

  useEffect(() => {
    if (couple?.partnerB && partner) {
      router.replace("/(tabs)");
    }
  }, [couple?.partnerB, partner, router]);

  const share = async () => {
    if (!couple) return;
    const message = `Meet me on Duoma tonight. My invite code is ${couple.inviteCode}`;
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
    <Screen scroll>
      <View className="flex-1 justify-between py-6">
        <View>
          <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
            Pairing
          </Text>
          <Text className="mt-3 text-[34px] font-bold text-mist">
            Send the code
          </Text>
          <Text className="mt-2 text-[16px] leading-6 text-mist/65">
            Open Duoma on a second phone — or another browser tab — and join with
            this code. You only do this once. After they join, you stay paired.
          </Text>
        </View>

        <View className="items-center py-8">
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
          <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <Text className="text-[14px] leading-5 text-mist/65">
              Trying it solo? Demo partner Riley needs a gender so cards can
              reflect Male / Female anatomy.
            </Text>
            <View className="mt-3">
              <GenderPicker
                value={demoGender}
                onChange={setDemoGender}
                label="Riley is"
              />
            </View>
            <View className="mt-3">
              <PrimaryButton
                label="Continue with a demo partner"
                tone="crimson"
                onPress={() => void addDemoPartner("Riley", demoGender)}
              />
            </View>
          </View>
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
