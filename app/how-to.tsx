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
    kicker: "Male / Female",
    title: "Set once at the start",
    body: "When you create or join Duoma, pick Male or Female so cards use the right anatomy. Fix a mistake anytime in Settings — not inside the spicy game.",
  },
  {
    kicker: "Deal three",
    title: "Pick one card to play",
    body: "On your turn the app deals three cards with a little animation. Tap the one you want. Play then moves to your partner.",
  },
  {
    kicker: "Shuffle",
    title: "Redraw your hand",
    body: "Do not like the three you got? Shuffle for a fresh hand. Setup sets how many shuffles each of you gets — or unlimited.",
  },
  {
    kicker: "Pass",
    title: "Pass means you sit this one out",
    body: "You cannot pass your own card. If your partner just played something you do not want to do, Pass — I don't participate. They deal again.",
  },
  {
    kicker: "Stage 1",
    title: "Pre-foreplay is daytime",
    body: "Texts, looks, light touch throughout the day. When those cards are done, Duoma pauses. Tap We are ready to move on when you both want foreplay. Your partner will not see your daytime cards until then.",
  },
  {
    kicker: "Finish Off",
    title: "A suspense toss chooses who picks",
    body: "Before Finish Off and Afterglow, a reveal picks who chooses the Finish Off card. The other person chooses Afterglow. Defaults are one card each.",
  },
  {
    kicker: "Home",
    title: "It's a home screen of apps",
    body: "The top of Home is Now — their mood, whose spicy-game turn it is, and what's next. Twelve app icons sit under that, including Spicy Game, Talk to me, and Settings in the bottom right. Card Bank, notifications, and sign-out live in Settings. The only tab is Home.",
  },
  {
    kicker: "iPhone",
    title: "Add Duoma to the Home Screen",
    body: "Web push is free — no Apple Developer account. iOS 16.4+: Safari Share → Add to Home Screen. Open the icon (not the Safari tab), then grant notifications in Settings. Push does not work inside a regular Safari tab.",
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
