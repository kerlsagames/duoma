import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { personalizeCard, resolveCardNames } from "@/lib/personalize";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function YouScreen() {
  const router = useRouter();
  const { user, couple, partner, signOut, nights, bestCards } = useApp();
  const names = resolveCardNames({
    userName: user?.displayName,
    partnerName: partner?.displayName,
  });

  return (
    <Screen scroll>
      <View className="pt-4 pb-10">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Profile
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">
          {user?.displayName ?? "You"}
        </Text>
        <PartnerConnectionBanner />

        <View className="gap-3">
          <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Text className="text-[12px] uppercase tracking-widest text-mist/40">
              Pair code — keep this
            </Text>
            <Text
              className="mt-2 text-[28px] font-bold tracking-[6px] text-mist"
              style={{ fontFamily: "SpaceMono" }}
            >
              {couple?.inviteCode ?? "------"}
            </Text>
            <Text className="mt-2 text-[14px] leading-5 text-mist/60">
              {partner
                ? `You stay paired with ${partner.displayName}${partner.isDemo ? " (demo)" : ""}. Sign out does not unpair you. Do not make a new code for the next night.`
                : "Share this code so your partner can join. It stays yours."}
            </Text>
          </View>

          <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Text className="text-[12px] uppercase tracking-widest text-mist/40">
              Nights together
            </Text>
            {nights.length === 0 ? (
              <Text className="mt-2 text-[15px] leading-6 text-mist/65">
                No closed nights yet. Play Get Spicy and the history lives here
                with this pair.
              </Text>
            ) : (
              nights.slice(0, 6).map((night) => (
                <Text
                  key={night.id}
                  className="mt-2 text-[15px] text-mist/80"
                >
                  {new Date(night.updatedAt).toLocaleDateString()} ·{" "}
                  {night.status === "rating" ? "rating cards" : "closed"}
                </Text>
              ))
            )}
          </View>

          <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Text className="text-[12px] uppercase tracking-widest text-mist/40">
              Best cards
            </Text>
            {bestCards.length === 0 ? (
              <Text className="mt-2 text-[15px] leading-6 text-mist/65">
                After a night, rate what you played. The keepers show up here
                with your names on them.
              </Text>
            ) : (
              bestCards.map((row) => {
                const copy = personalizeCard(row.card, names);
                return (
                  <View key={row.card.id} className="mt-3">
                    <Text className="text-[12px] text-neon">
                      {row.average.toFixed(1)} ★
                    </Text>
                    <Text className="mt-1 text-[15px] leading-6 text-mist">
                      {copy.body}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <Text className="text-[12px] uppercase tracking-widest text-mist/40">
              Backend
            </Text>
            <Text className="mt-2 text-[16px] font-semibold text-mist">
              {isSupabaseConfigured ? "Supabase connected" : "Local realtime mode"}
            </Text>
            <Text className="mt-2 text-[14px] leading-5 text-mist/60">
              {isSupabaseConfigured
                ? "Invites, cards, and game state sync through Supabase Realtime."
                : "No project keys yet. Pairing still works across tabs on this device via a local live store. Add EXPO_PUBLIC_SUPABASE_URL to go cloud."}
            </Text>
          </View>
        </View>

        <View className="mt-8 gap-3">
          <PrimaryButton
            label="How to play"
            tone="ghost"
            onPress={() => router.push("/how-to")}
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
