import { DuomaLogo } from "@/components/DuomaLogo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { HUBS } from "@/lib/hubs";
import { useApp } from "@/lib/store";
import { useRouter, type Href } from "expo-router";
import { Text, View } from "react-native";

const LANES = HUBS.map((hub) => ({
  label: hub.label,
  hint:
    hub.id === "connect"
      ? "Talks, dates, the jar"
      : hub.id === "desire"
        ? "Spice, dares, fantasies"
        : hub.id === "play"
          ? "Bets, photos, games"
          : "Bills, birthdays, trips",
  tile: hub.tile,
  ink: hub.tileInk,
}));

export default function WelcomeScreen() {
  const router = useRouter();
  const { savedPair, continueAsSaved } = useApp();

  return (
    <Screen scroll>
      <View className="pt-10 pb-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Couples app
        </Text>
        <View className="mt-4 items-start">
          <DuomaLogo size={52} />
        </View>
        <Text className="mt-3 max-w-[320px] text-[22px] font-bold leading-7 text-mist">
          Two phones. One home.
        </Text>
        <Text className="mt-2 max-w-[340px] text-[16px] leading-6 text-mist/70">
          Pair once. Then the calendar, the talks, the games, and the spice all
          live in the same place.
        </Text>

        <View
          style={{
            marginTop: 22,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {LANES.map((lane) => (
            <View
              key={lane.label}
              style={{
                width: "47.5%",
                flexGrow: 1,
                backgroundColor: lane.tile,
                paddingVertical: 14,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: lane.ink,
                }}
              >
                {lane.label}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  lineHeight: 16,
                  color: lane.ink,
                  opacity: 0.78,
                }}
              >
                {lane.hint}
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-[13px] leading-5 text-mist/50">
          Plus a shared calendar and a daily check-in on the home screen.
        </Text>

        <View className="mt-8 gap-3">
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
            label="How it works"
            tone="ghost"
            onPress={() => router.push("/how-to" as Href)}
          />
        </View>
      </View>
    </Screen>
  );
}
