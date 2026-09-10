import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function YouScreen() {
  const router = useRouter();
  const { user, couple, partner, signOut } = useApp();

  return (
    <Screen scroll>
      <View className="pt-4">
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
              Invite code
            </Text>
            <Text
              className="mt-2 text-[28px] font-bold tracking-[6px] text-mist"
              style={{ fontFamily: "SpaceMono" }}
            >
              {couple?.inviteCode ?? "------"}
            </Text>
            <Text className="mt-2 text-[14px] text-mist/60">
              {partner
                ? `Paired with ${partner.displayName}${partner.isDemo ? " (demo)" : ""}.`
                : "Share this code so your partner can join."}
            </Text>
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
