import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { STAGE_META, STAGE_ORDER } from "@/games/get-spicy/engine";
import { personalizeCard, resolveCardGenders, resolveCardNames } from "@/lib/personalize";
import { useApp } from "@/lib/store";
import type { CardStage } from "@/lib/types";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CardBankScreen() {
  const router = useRouter();
  const { cards, toggleCardActive, addCustomCard, user, partner, ratings } =
    useApp();
  const [stage, setStage] = useState<CardStage>("pre_foreplay");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const names = resolveCardNames({
    userName: user?.displayName,
    partnerName: partner?.displayName,
  });
  const genders = resolveCardGenders({
    userGender: user?.gender,
    partnerGender: partner?.gender,
  });

  const visible = useMemo(
    () => cards.filter((card) => card.stage === stage),
    [cards, stage]
  );
  const activeCount = visible.filter((card) => card.isActive).length;

  const avgFor = (cardId: string) => {
    const votes = ratings.filter((row) => row.cardId === cardId);
    if (!votes.length) return null;
    return votes.reduce((sum, row) => sum + row.stars, 0) / votes.length;
  };

  const save = async () => {
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("Add a title and the play text.");
      return;
    }
    await addCustomCard({ stage, title, body });
    setTitle("");
    setBody("");
    setOpen(false);
  };

  return (
    <Screen scroll>
      <View className="pt-4">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Deck
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">Card Bank</Text>
        <Text className="mt-2 text-[15px] leading-6 text-mist/65">
          Every card names you and {partner?.displayName ?? "your partner"}. The
          person who plays it is named first. Toggle what stays in rotation, or
          write your own with {"{player}"}, {"{partner}"}, and anatomy tokens
          like {"{player_cock}"} / {"{partner_tits}"}.
        </Text>

        <View className="mt-5 flex-row flex-wrap gap-2">
          {STAGE_ORDER.map((key) => (
            <Pressable
              key={key}
              onPress={() => setStage(key)}
              className={`rounded-full px-3 py-2 ${
                stage === key ? "bg-neon" : "bg-white/10"
              }`}
            >
              <Text
                className={`text-[12px] font-semibold ${
                  stage === key ? "text-night" : "text-mist/70"
                }`}
              >
                {STAGE_META[key].label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-[13px] text-mist/50">
            {activeCount} of {visible.length} active
          </Text>
          <Pressable onPress={() => setOpen(true)}>
            <Text className="text-[14px] font-semibold text-neon">
              + Add custom card
            </Text>
          </Pressable>
        </View>

        <View className="mt-4 gap-3 pb-8">
          {visible.length === 0 ? (
            <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <Text className="text-[16px] font-semibold text-mist">
                No cards in this stage yet
              </Text>
              <Text className="mt-2 text-[14px] text-mist/60">
                Pair up to clone the default decks, then write your own.
              </Text>
            </View>
          ) : (
            visible.map((card) => {
              const copy = personalizeCard(card, names, genders);
              const avg = avgFor(card.id);
              return (
                <View
                  key={card.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-[11px] font-semibold uppercase tracking-widest text-crimson">
                        {card.isDefault ? "Default" : "Custom"}
                        {avg ? ` · ${avg.toFixed(1)}/10` : ""}
                      </Text>
                      <Text className="mt-1 text-[15px] font-semibold text-mist/70">
                        {copy.title}
                      </Text>
                      <Text className="mt-2 text-[16px] leading-6 text-mist">
                        {copy.body}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="mb-1 text-[10px] uppercase tracking-widest text-mist/40">
                        {card.isActive ? "On" : "Off"}
                      </Text>
                      <Switch
                        value={card.isActive}
                        onValueChange={() => void toggleCardActive(card.id)}
                        trackColor={{ false: "#2A2A30", true: "#FF007F" }}
                        thumbColor="#F4F4F6"
                      />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
        <View className="pb-8">
          <PrimaryButton
            label="Back to Settings"
            tone="ghost"
            onPress={() => router.back()}
          />
        </View>
      </View>

      <Modal visible={open} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/70">
          <View className="rounded-t-[28px] border border-white/10 bg-night p-5">
            <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
              {STAGE_META[stage].label}
            </Text>
            <Text className="mt-2 text-[24px] font-bold text-mist">
              New custom card
            </Text>
            <Text className="mt-2 text-[14px] leading-5 text-mist/60">
              Use {"{player}"} for whoever plays it and {"{partner}"} for the
              other name. Anatomy flips with Male/Female — e.g.{" "}
              {"{player} pulls {player_cock} out and cums on {partner}'s {partner_tits}."}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Short title"
              placeholderTextColor="rgba(244,244,246,0.35)"
              className="mt-5 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="{player} pulls {player_cock} out and cums on {partner}'s {partner_tits}."
              placeholderTextColor="rgba(244,244,246,0.35)"
              multiline
              className="mt-3 min-h-[120px] rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-[16px] text-mist"
            />
            {error ? (
              <Text className="mt-3 text-[14px] text-crimson">{error}</Text>
            ) : null}
            <View className="mt-5 gap-3 pb-4">
              <PrimaryButton label="Save card" onPress={() => void save()} />
              <PrimaryButton
                label="Cancel"
                tone="ghost"
                onPress={() => setOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
