import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useApp } from "@/lib/store";

export default function WelcomeScreen() {
  const router = useRouter();
  const { savedPair, continueAsSaved } = useApp();

  return (
    <Screen>
      <View className="flex-1 justify-between py-8">
        <View className="pt-10">
          <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
            Couples
          </Text>
          <Text className="mt-4 text-[52px] font-bold tracking-tight text-mist">
            FUSE
          </Text>
          <Text className="mt-3 max-w-[300px] text-[18px] leading-7 text-mist/70">
            Pair once. Stay paired. Cards that use your names.
          </Text>
        </View>

        <View className="mb-4 overflow-hidden rounded-[28px] border border-white/10">
          <LinearGradient
            colors={["#1A0810", "#0B0B0E"]}
            style={{ padding: 22 }}
          >
            <Text className="text-[13px] font-semibold uppercase tracking-[2px] text-crimson">
              Tonight's game
            </Text>
            <Text className="mt-2 text-[24px] font-bold text-mist">Get Spicy</Text>
            <Text className="mt-2 text-[15px] leading-6 text-mist/65">
              Five stages, two phones, one live deck. Tease through the day.
              Close the night in afterglow.
            </Text>
          </LinearGradient>
        </View>

        <View className="gap-3 pb-4">
          {savedPair ? (
            <>
              <Text className="text-center text-[14px] leading-5 text-mist/60">
                {savedPair.partner
                  ? `${savedPair.user.displayName} is still paired with ${savedPair.partner.displayName}. Same code. No new invite.`
                  : `${savedPair.user.displayName} still has an open invite code.`}
              </Text>
              <PrimaryButton
                label={`Continue as ${savedPair.user.displayName}`}
                onPress={() => {
                  void continueAsSaved().then(() => {
                    router.replace("/");
                  });
                }}
              />
            </>
          ) : null}
          <PrimaryButton
            label={savedPair ? "Start a new pair" : "Create your pair"}
            tone={savedPair ? "ghost" : "neon"}
            onPress={() => router.push("/create")}
          />
          <PrimaryButton
            label="I have a code"
            tone="ghost"
            onPress={() => router.push("/join")}
          />
          <PrimaryButton
            label="How to play"
            tone="ghost"
            onPress={() => router.push("/how-to")}
          />
        </View>
      </View>
    </Screen>
  );
}
