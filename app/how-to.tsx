import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

const STEPS = [
  {
    kicker: "Pair once",
    title: "One code, then you stay linked",
    body: "Create a pair and send the six-character code. After they join, you are linked on this phone. Sign out does not unpair you. Do not make a new code just to come back.",
  },
  {
    kicker: "Names",
    title: "Male or Female, set at the start",
    body: "Pick Male or Female so spicy cards, positions, and roleplays use the right wording. Fix a mistake anytime in Settings.",
  },
  {
    kicker: "Home",
    title: "Four hubs, not one game",
    body: "Home is the front door. Connect, Desire, Fun, and Home Base each open a room of apps. The cog on each hub lets you hide apps, reorder them, or switch to two columns. Daily Check-In, the shared calendar, and Eden sit at the top. Couple settings is on Home — card bank, notifications, and sign-out live there.",
  },
  {
    kicker: "Connect",
    title: "Talk, plan, leave a note",
    body: "Lists, date nights, Curiosity, Talk to Me, voice notes (real microphone), the gratitude jar, apology, and thought pings. Use it when you want a conversation, not a dare.",
  },
  {
    kicker: "Desire",
    title: "Spice when you both want it",
    body: "Get Spicy, Dare Me, roleplays, positions, and Fantasy Matcher. Swipe fantasies separately — you only see a match when you both said yes.",
  },
  {
    kicker: "Fun",
    title: "Play without a plan",
    body: "Coupons, LoveBetz, photo memory (100 ideas, one shot a week), trivia, Draw It, Daily Word (same five letters, who lands it first), and the rest of the games. Nothing here has to lead to bed.",
  },
  {
    kicker: "Home Base",
    title: "The life admin, shared",
    body: "Groceries, birthdays, the meal plan, travel, the budget jars, jobs around the house, period tracking. Birthdays and trips also land on the calendar.",
  },
  {
    kicker: "Calendar",
    title: "Two tabs, one month",
    body: "Desire & Connect shows nights, talks, and dares you already did. General shows birthdays, trips, and jobs. The cog switches stacked, split, or agenda.",
  },
  {
    kicker: "Get Spicy",
    title: "If you open that game",
    body: "It deals three cards. Pick one. Shuffle if the hand is wrong. You cannot pass your own card — your partner can pass if they do not want to do it. Daytime cards stay private until you both tap that you are ready to move on.",
  },
  {
    kicker: "iPhone",
    title: "Add Duoma to the Home Screen",
    body: "Safari Share → Add to Home Screen, then open the icon — not the Safari tab. Notifications only work from that icon on iOS 16.4+.",
  },
];

export default function HowToScreen() {
  const router = useRouter();

  return (
    <Screen scroll>
      <View className="pt-6 pb-10">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          Duoma
        </Text>
        <Text className="mt-3 text-[34px] font-bold text-mist">How it works</Text>
        <Text className="mt-2 text-[16px] leading-6 text-mist/65">
          A shared home for the two of you — talks, spice, games, and the boring
          stuff that still has to get done.
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
