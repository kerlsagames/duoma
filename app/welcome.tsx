import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

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
            Pair up. Deal the night. Play every card on the same beat.
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
          <PrimaryButton
            label="Create your pair"
            onPress={() => router.push("/create")}
          />
          <PrimaryButton
            label="I have a code"
            tone="ghost"
            onPress={() => router.push("/join")}
          />
        </View>
      </View>
    </Screen>
  );
}
