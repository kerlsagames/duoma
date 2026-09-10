import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { localDateKey } from "@/lib/dates";
import { LETS_TALK_DECK, questionById, remainingToday, todaysDraw } from "@/lib/talk";
import { useApp } from "@/lib/store";
import type { TalkReaction } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const SHORT_NAME: Record<string, string> = {
  icebreakers: "Icebreakers",
  "deep-reflections": "Deep",
  "bedroom-throwbacks": "Throwbacks",
  "secret-desires": "Desires",
  "future-dreams": "Future",
  "intimacy-romance": "Romance",
  "daily-checkin": "Daily",
  "growth-values": "Growth",
  lighthearted: "Would you rather",
  appreciation: "Gratitude",
  wildcard: "Wildcard",
};

export default function TalkScreen() {
  const { user, talkDraws, talkDecks, drawTalkQuestion, submitTalkAnswer } = useApp();
  const today = localDateKey();
  const left = user ? remainingToday(talkDraws, user.id, today) : LETS_TALK_DECK.length;

  const [openId, setOpenId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [reaction, setReaction] = useState<TalkReaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openDraw = useMemo(() => {
    if (!openId || !user) return undefined;
    return todaysDraw(talkDraws, { userId: user.id, categoryId: openId, date: today });
  }, [openId, talkDraws, today, user]);

  const openCategory = LETS_TALK_DECK.find((row) => row.id === openId) ?? null;
  const openQuestion =
    openCategory && openDraw
      ? questionById(openCategory.id, openDraw.questionId)
      : null;
  const answered = Boolean(openDraw?.answeredAt);

  const openCategoryTile = async (categoryId: string) => {
    setError(null);
    try {
      const draw = await drawTalkQuestion(categoryId);
      setOpenId(categoryId);
      setBody(draw.body);
      setReaction(draw.reaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw a card.");
    }
  };

  const save = async () => {
    if (!openId) return;
    setError(null);
    setLoading(true);
    try {
      await submitTalkAnswer({ categoryId: openId, body, reaction });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpenId(null);
    setError(null);
  };

  return (
    <HubScreen
      kicker="Talk to me"
      title="Eleven decks. One card each."
      body="Tap a category to draw today's question. You can play as many decks as you want today — just one card per deck until tomorrow. Answer out loud. Leave a thumb so it does not come back too soon."
    >
      <Text className="mb-4 text-center text-[13px] text-mist/55">
        {left === 0
          ? "Every deck has a card for today. Come back tomorrow."
          : `${left} ${left === 1 ? "deck" : "decks"} still open today`}
      </Text>

      <View className="flex-row flex-wrap justify-between">
        {LETS_TALK_DECK.map((category) => {
          const draw = user
            ? todaysDraw(talkDraws, {
                userId: user.id,
                categoryId: category.id,
                date: today,
              })
            : undefined;
          const deck = talkDecks.find(
            (row) => row.categoryId === category.id && row.userId === user?.id
          );
          const played = deck?.played.length ?? 0;
          const locked = Boolean(draw);
          const done = Boolean(draw?.answeredAt);
          return (
            <Pressable
              key={category.id}
              onPress={() => void openCategoryTile(category.id)}
              className="mb-4 w-[31%] items-center"
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: done ? "#2A0A18" : "#FF007F",
                  borderWidth: done ? 1 : 0,
                  borderColor: "rgba(255,0,127,0.45)",
                  opacity: locked && !done ? 0.7 : 1,
                }}
              >
                <Ionicons
                  name={(category.iconName as IconName) ?? "chatbubbles"}
                  size={26}
                  color="#F4F4F6"
                />
                {locked ? (
                  <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-night">
                    <Ionicons
                      name={done ? "checkmark-circle" : "lock-closed"}
                      size={16}
                      color={done ? "#FF007F" : "rgba(244,244,246,0.7)"}
                    />
                  </View>
                ) : null}
              </View>
              <Text
                className="mt-1 text-center text-[11px] font-semibold leading-4 text-mist"
                numberOfLines={2}
              >
                {SHORT_NAME[category.id] ?? category.name}
              </Text>
              <Text className="text-center text-[10px] text-mist/40">
                {done ? "Today's card" : `${played}/60`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && !openId ? (
        <Text className="mt-2 text-center text-[14px] text-crimson">{error}</Text>
      ) : null}

      <Modal visible={Boolean(openId)} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/80">
            <Pressable className="absolute inset-0" onPress={close} />
            <View className="max-h-[88%] rounded-t-[32px] border border-neon/30 bg-night px-5 pb-8 pt-5">
              <ScrollView keyboardShouldPersistTaps="handled">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
                    {openCategory?.name}
                  </Text>
                  <Pressable onPress={close} hitSlop={12}>
                    <Ionicons name="close" size={22} color="rgba(244,244,246,0.7)" />
                  </Pressable>
                </View>
                <Text className="text-[24px] font-bold leading-8 text-mist">
                  {openQuestion?.text ?? "Drawing…"}
                </Text>
                <Text className="mt-3 text-[14px] leading-6 text-mist/65">
                  Read it out loud. Stay in the look after. A thumb sends this card to the back of
                  the deck.
                </Text>

                <View className="mt-5 flex-row gap-3">
                  <Pressable
                    onPress={() => setReaction("up")}
                    className={`flex-1 items-center rounded-2xl border py-4 ${
                      reaction === "up"
                        ? "border-neon bg-neon/20"
                        : "border-white/15 bg-white/5"
                    }`}
                  >
                    <Text className="text-[28px]">👍</Text>
                    <Text className="mt-1 text-[12px] font-semibold text-mist">Keep this heat</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setReaction("down")}
                    className={`flex-1 items-center rounded-2xl border py-4 ${
                      reaction === "down"
                        ? "border-crimson bg-crimson/20"
                        : "border-white/15 bg-white/5"
                    }`}
                  >
                    <Text className="text-[28px]">👎</Text>
                    <Text className="mt-1 text-[12px] font-semibold text-mist">Send it back</Text>
                  </Pressable>
                </View>

                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="Optional note — or just talk and save"
                  placeholderTextColor="rgba(244,244,246,0.35)"
                  multiline
                  className="mt-5 min-h-[110px] rounded-3xl border border-white/15 bg-white/5 px-4 py-3 text-[16px] text-mist"
                />
                {error && openId ? (
                  <Text className="mt-3 text-[14px] text-crimson">{error}</Text>
                ) : null}
                <View className="mt-4">
                  <PrimaryButton
                    label={answered ? "Update" : "Save and shuffle back"}
                    loading={loading}
                    onPress={() => void save()}
                  />
                </View>
                {answered ? (
                  <Text className="mt-3 text-center text-[12px] text-mist/45">
                    This deck is done for today. Tomorrow it unlocks again.
                  </Text>
                ) : (
                  <Text className="mt-3 text-center text-[12px] text-mist/45">
                    Closing now still uses today's card. You can reopen it until you save.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </HubScreen>
  );
}
