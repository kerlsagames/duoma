import { DuomaLogo } from "@/components/DuomaLogo";
import { InstallHomeScreenCard } from "@/components/InstallHomeScreenCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { HUBS } from "@/lib/hubs";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { savedPair, continueAsSaved, usingCloud, pairError } = useApp();

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
        {pairError ? (
          <Text className="mt-3 text-[14px] leading-5 text-crimson">{pairError}</Text>
        ) : null}

        <View
          style={{
            marginTop: 22,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {HUBS.map((hub) => (
            <View
              key={hub.id}
              style={{
                width: "48%",
                marginBottom: 8,
                borderRadius: 18,
                paddingVertical: 10,
                paddingHorizontal: 10,
                backgroundColor: hub.tile,
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={hub.icon} size={28} color={hub.tileInk} />
              </View>
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 18,
                    lineHeight: 22,
                    color: hub.tileInk,
                    textAlign: "center",
                  }}
                >
                  {hub.label}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    color: hub.tileInk,
                    opacity: 0.72,
                    fontSize: 11,
                    lineHeight: 14,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {hub.tagline}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-6">
          <InstallHomeScreenCard />
        </View>

        <View className="mt-2 gap-3">
          {savedPair && !savedPair.user.bannedAt ? (
            <>
              <Text className="text-center text-[14px] leading-5 text-mist/60">
                {savedPair.partner
                  ? `${savedPair.user.displayName} is still paired with ${savedPair.partner.displayName}. Same code. No new invite.`
                  : `${savedPair.user.displayName} still has an open invite code.`}
              </Text>
              <PrimaryButton
                label={`Continue as ${savedPair.user.displayName}`}
                onPress={() => {
                  void continueAsSaved()
                    .then(() => router.replace("/"))
                    .catch((err: unknown) => {
                      if (err instanceof Error && err.message === "CHECK_EMAIL") {
                        router.replace("/check-email");
                        return;
                      }
                      router.replace("/banned");
                    });
                }}
              />
            </>
          ) : null}
          <PrimaryButton
            label={savedPair && !savedPair.user.bannedAt ? "Start a new pair" : "Create your pair"}
            tone={savedPair && !savedPair.user.bannedAt ? "ghost" : "neon"}
            onPress={() => router.push("/create")}
          />
          <PrimaryButton
            label="I have a code"
            tone="ghost"
            onPress={() => router.push("/join")}
          />
          {usingCloud ? (
            <PrimaryButton
              label="Sign in"
              tone="ghost"
              onPress={() => router.push("/login")}
            />
          ) : null}
          <PrimaryButton
            label="Terms and privacy"
            tone="ghost"
            onPress={() => router.push("/legal" as Href)}
          />
        </View>
      </View>
    </Screen>
  );
}
