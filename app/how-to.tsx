import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

const STEPS = [
  {
    kicker: "Pair once",
    title: "One code, then you stay linked",
    body: "Email yourself a 6-digit code to open the app. On Home, Connect sends them the six-character pair code, that button leaves when they join. Sign in / Forgot password is on the login screen, not Home. Sign out does not unpair you. Do not make a new pair just to come back. Terms and privacy say you are responsible if someone else opens your email or codes.",
  },
  {
    kicker: "Names",
    title: "Male or Female, set at the start",
    body: "Pick Male or Female so spicy cards, positions, and roleplays use the right wording. Fix a mistake anytime in Home settings.",
  },
  {
    kicker: "Home",
    title: "Four hubs, not one game",
    body: "Home is the front door. Connect, Desire, Fun, and Home Base each open as two columns of apps. The cog on each hub lets you hide apps, reorder them, or switch to a list. Daily rhythm is three circles: Check-in, Calendar, and Notepad, larger with the default four favorite pins, smaller if you add more. Couple settings is the cog on the bottom bar. The bar chart on the right is Stats and Badges. When they send a Thought of You ping, a little Click me sits top-left of Home, tap it to read what they sent. Starred countdowns still tape across just above the bar.",
  },
  {
    kicker: "Notifications",
    title: "Bell, or a card on Home",
    body: "With this many apps, mute whole hubs. Settings → Notifications: four closed drawers, open one, switch its apps, or all on / all off. Choose Bell (a list) or Home cards (a square over the homepage, swipe left to clear, tap through to act, come back and the next one is waiting). If you're waiting on them in any app, Draw It, Dare Me, Chicken, a bet, poke them from that waiting screen.",
  },
  {
    kicker: "Shared world",
    title: "Optional. Off until you add it",
    body: "Home settings has a Shared world toggle. Leave it off if you just want Check-In, Calendar, and Notepad. Turn it on to pick Sanctuary, Pocket Ecosystem, Town, Odyssey, or Constellation. Activity you already do feeds whichever one you lock in.",
  },
  {
    kicker: "Connect",
    title: "Talk, plan, leave a note",
    body: "Lists, date nights, Flirtatious findings, Talk to Me, voice notes (real microphone), the gratitude jar, apology, and thought pings. Use it when you want a conversation, not a dare.",
  },
  {
    kicker: "Desire",
    title: "Spice when you both want it",
    body: "Get Spicy, Spark (200 slow burns for you to do, from afar or in the same room; favourite and mark completed), Dare Me, roleplays, positions, The How (named techniques, try one this week, keep the words that work), Fantasy Matcher, and The Sexy Vault. The vault uses a shared pin. You can hide a photo or clip until a time you set, they still get told something is waiting.",
  },
  {
    kicker: "Fun",
    title: "Play without a plan",
    body: "Coupons, Chicken (silly non-sexy dares, send one, they cluck or commit), LoveBetz, photo memory (one shot a week, shuffle until you lock it), How Well Do You Know Me (rip a card pack, then guess theirs before the next one opens), Draw It, Daily Word (same five letters, who lands it first), Fair Share (spin a chore or tap who did it last), and the rest of the games. Nothing here has to lead to bed.",
  },
  {
    kicker: "Home Base",
    title: "The life admin, shared",
    body: "Groceries, birthdays, gifts (wish lists, shopping, and a year-by-year book of what people got), countdowns (star one for the home ticker, or run them all), the meal plan, travel, shared goals, a detailed budget (pay, bills, spending), jobs around the house, period tracking. Birthdays and trips also land on the calendar.",
  },
  {
    kicker: "Calendar",
    title: "General, a week view, holidays",
    body: "Calendar opens on General, the big tab on the left (birthdays, holidays, trips, jobs). Desire & Connect is beside it. Month, Week, and Agenda live in the cog, not on the page. The cog can add Period Tracker from Home Base, and reminders for birthdays and notes.",
  },
  {
    kicker: "Get Spicy",
    title: "If you open that game",
    body: "It deals three cards. Pick one. Shuffle if the hand is wrong. You cannot pass your own card, your partner can pass if they do not want to do it. Setup has Detailed (all five stages, set the counts) or Keep it simple (one shared card, no turns). Daytime cards in Detailed stay private until you both tap that you are ready to move on. Finish Off is tagged F, M, or both. She generally cums first; an F-only card deals a second hand of M-cums cards only.",
  },
  {
    kicker: "Safety",
    title: "Unpair, report, adults only",
    body: "Create and Join stay locked until you tick that you are 18+ and agree to the Terms. Home settings has Report content / abuse (reviewed within 24 hours), Unpair / break up (wipes the shared vault, photos, and lists on both phones), and Delete account. Photos live in Duoma’s sandbox, not the Camera Roll. Open a vault clip or a Photo Memory to report that file.",
  },
  {
    kicker: "iPhone",
    title: "Add Duoma to the Home Screen",
    body: "Safari Share → Add to Home Screen, then open the icon, not the Safari tab. Notifications only work from that icon on iOS 16.4+.",
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
          A shared home for the two of you, talks, spice, games, and the boring
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
