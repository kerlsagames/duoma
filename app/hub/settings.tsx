import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { PushSetupCard } from "@/components/PushSetupCard";
import { GenderPicker } from "@/components/ui/GenderPicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { personalizeCard, resolveCardGenders, resolveCardNames } from "@/lib/personalize";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

function SettingsRow({
  label,
  hint,
  icon,
  onPress,
}: {
  label: string;
  hint: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-3xl border border-white/10 bg-white/5 px-4 py-4"
    >
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-neon/20">
        <Ionicons name={icon} size={22} color="#FF007F" />
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-semibold text-mist">{label}</Text>
        <Text className="mt-0.5 text-[13px] text-mist/55">{hint}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(244,244,246,0.4)" />
    </Pressable>
  );
}

function Section({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    user,
    couple,
    partner,
    signOut,
    nights,
    bestCards,
    setProfileGender,
  } = useApp();
  const names = resolveCardNames({
    userName: user?.displayName,
    partnerName: partner?.displayName,
  });
  const genders = resolveCardGenders({
    userGender: user?.gender,
    partnerGender: partner?.gender,
  });

  return (
    <Screen scroll>
      <View className="pt-4 pb-10">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Settings
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">
          {user?.displayName ?? "You"}
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-mist/65">
          Card Bank, notifications, the pair code, and how to play. Home is the
          only tab.
        </Text>

        <View className="mt-5">
          <PartnerConnectionBanner />
        </View>

        <View className="gap-3">
          <Section>
            <Text className="text-[12px] uppercase tracking-widest text-mist/40">
              Male / Female
            </Text>
            <Text className="mt-2 text-[14px] leading-5 text-mist/60">
              Set once when you create or join Duoma. Change it here if you got
              it wrong — Get Spicy uses this for anatomy wording.
            </Text>
            <View className="mt-4 gap-4">
              <GenderPicker
                value={user?.gender ?? null}
                onChange={(gender) => void setProfileGender("you", gender)}
                label="I am"
              />
              <GenderPicker
                value={partner?.gender ?? null}
                onChange={(gender) => void setProfileGender("partner", gender)}
                label={
                  partner
                    ? `${partner.displayName} is`
                    : "Partner is"
                }
              />
            </View>
          </Section>

          <SettingsRow
            label="Card Bank"
            hint="Toggle rotation. Write custom cards with your names."
            icon="albums"
            onPress={() => router.push("/(tabs)/cards" as Href)}
          />
          <SettingsRow
            label="How to play"
            hint="Deal three, pick one, passes, shuffles, daytime pause."
            icon="book"
            onPress={() => router.push("/how-to" as Href)}
          />

          <PushSetupCard />

          <Section>
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
                ? `You stay paired with ${partner.displayName}${partner.isDemo ? " (demo)" : ""}. Check-ins, nights, dates, and notes live on this account. Sign out does not unpair you.`
                : "Share this code so your partner can join. It stays yours."}
            </Text>
          </Section>

          <Section>
            <Text className="text-[12px] uppercase tracking-widest text-mist/40">
              Nights together
            </Text>
            {nights.length === 0 ? (
              <Text className="mt-2 text-[15px] leading-6 text-mist/65">
                No closed nights yet. Play the Spicy Game and the history lives
                here with this pair.
              </Text>
            ) : (
              nights.slice(0, 6).map((night) => (
                <Text key={night.id} className="mt-2 text-[15px] text-mist/80">
                  {new Date(night.updatedAt).toLocaleDateString()} ·{" "}
                  {night.status === "rating" ? "rating cards" : "closed"}
                </Text>
              ))
            )}
          </Section>

          <Section>
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
                const copy = personalizeCard(row.card, names, genders);
                return (
                  <View key={row.card.id} className="mt-3">
                    <Text className="text-[12px] text-neon">
                      {row.average.toFixed(1)}/10
                    </Text>
                    <Text className="mt-1 text-[15px] leading-6 text-mist">
                      {copy.body}
                    </Text>
                  </View>
                );
              })
            )}
          </Section>

          <Section>
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
          </Section>
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
