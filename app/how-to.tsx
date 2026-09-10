import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

const STEPS = [
  {
    kicker: "Stay paired",
    title: "One code, every night",
    body: "Create a pair once. The invite code is yours forever. Sign out if you want — you are still linked. Do not make a new code just to play again.",
  },
  {
    kicker: "Turns",
    title: "You take turns playing",
    body: "When it is your turn, Play Card. The card names you as the one doing it, and names your partner as the one receiving. Example: Alex, finish Riley off with oral.",
  },
  {
    kicker: "Blocks",
    title: "Block means you sit this one out",
    body: "You cannot block your own card. If your partner just played something you do not want to do, Block — I don't participate. That card is discarded and replaced.",
  },
  {
    kicker: "Stage 1",
    title: "Pre-foreplay is daytime",
    body: "Texts, looks, light touch throughout the day. When those cards are done, Fuse pauses. Tap when you are both ready for private sexy time. Foreplay will not auto-start.",
  },
  {
    kicker: "Us",
    title: "The couple account",
    body: "Us is the shared record: daily check-in, curiosity question, calendar, countdowns, desire matches, coupons, scratch-offs, the appreciation jar, and the date-night list. Sign out does not delete the pair.",
  },
  {
    kicker: "The close",
    title: "Finish Off, then Afterglow",
    body: "Finish Off is climax. Afterglow is post-sex care — water, towels, cuddles. Rate the cards you both used. Your best ones live in the Card Bank.",
  },
];

export default function HowToScreen() {
  const router = useRouter();

  return (
    <Screen scroll>
      <View className="pt-6 pb-10">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Get Spicy
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">How to play</Text>
        <Text className="mt-2 text-[16px] leading-6 text-mist/65">
          Two phones. One pair. Games and a shared life record.
        </Text>

        <View className="mt-7 gap-3">
          {STEPS.map((step) => (
            <View
              key={step.kicker}
              className="rounded-[24px] border border-white/10 bg-white/5 p-5"
            >
              <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-crimson">
                {step.kicker}
              </Text>
              <Text className="mt-2 text-[20px] font-bold text-mist">
                {step.title}
              </Text>
              <Text className="mt-2 text-[15px] leading-6 text-mist/70">
                {step.body}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-8">
          <PrimaryButton label="Back" tone="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
