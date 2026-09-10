import { HubScreen } from "@/components/hub/HubScreen";
import { SpicyDarePanel } from "@/components/hub/SpicyDarePanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { HUB_TONES, SERIF, TALK_DECK_TINT } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { isSpicyDareDeck } from "@/lib/spicy-dares";
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

const THEME = HUB_TONES.talk;
const CONVO_DECKS = LETS_TALK_DECK.filter((category) => !isSpicyDareDeck(category.id));

export default function TalkScreen() {
  const { user, talkDraws, talkDecks, drawTalkQuestion, submitTalkAnswer, spicyDares } =
    useApp();
  const today = localDateKey();
  const left = user ? remainingToday(talkDraws, user.id, today) : CONVO_DECKS.length;
  const openDares = spicyDares.filter(
    (row) => row.status === "offered" || row.status === "accepted"
  ).length;

  const [openId, setOpenId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [reaction, setReaction] = useState<TalkReaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const spicyOpen = isSpicyDareDeck(openId);
  const openDraw = useMemo(() => {
    if (!openId || !user || spicyOpen) return undefined;
    return todaysDraw(talkDraws, { userId: user.id, categoryId: openId, date: today });
  }, [openId, spicyOpen, talkDraws, today, user]);

  const openCategory = LETS_TALK_DECK.find((row) => row.id === openId) ?? null;
  const openQuestion =
    openCategory && openDraw
      ? questionById(openCategory.id, openDraw.questionId)
      : null;
  const answered = Boolean(openDraw?.answeredAt);
  const openTint = openCategory
    ? TALK_DECK_TINT[openCategory.id] ?? THEME.accent
    : THEME.accent;

  const openCategoryTile = async (categoryId: string) => {
    setError(null);
    if (isSpicyDareDeck(categoryId)) {
      setOpenId(categoryId);
      return;
    }
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
    if (!openId || spicyOpen) return;
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
      tone="talk"
      kicker="Talk to me"
      title="Ten talks. One dare deck."
      body="Each conversation deck draws one question a day. Spicy Challenges stays open — filter, tweak the wording, and send a dare with a timeframe."
    >
      <Text
        style={{
          marginBottom: 14,
          fontFamily: "SpaceMono",
          fontSize: 12,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: THEME.accent,
        }}
      >
        {left === 0
          ? "All conversation decks have a card for today"
          : `${left} ${left === 1 ? "deck" : "decks"} still open`}
      </Text>

      <View style={{ gap: 8 }}>
        {LETS_TALK_DECK.map((category) => {
          const spicy = isSpicyDareDeck(category.id);
          const draw = user && !spicy
            ? todaysDraw(talkDraws, {
                userId: user.id,
                categoryId: category.id,
                date: today,
              })
            : undefined;
          const deck = talkDecks.find(
            (row) =>
              row.userId === user?.id &&
              (row.categoryId === category.id ||
                (spicy && isSpicyDareDeck(row.categoryId)))
          );
          const played = deck?.played.length ?? 0;
          const locked = Boolean(draw);
          const done = Boolean(draw?.answeredAt);
          const tint = TALK_DECK_TINT[category.id] ?? THEME.accent;
          const subtitle = spicy
            ? openDares
              ? `${openDares} live · browse anytime`
              : `${played} of ${category.questions.length} sent · always open`
            : done
              ? "Today's card is in"
              : `${played} of 60 told`;
          return (
            <Pressable
              key={category.id}
              onPress={() => void openCategoryTile(category.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 22,
                backgroundColor: done ? "rgba(228,195,122,0.12)" : THEME.surface,
                borderWidth: 1,
                borderColor: spicy
                  ? "rgba(201,123,138,0.4)"
                  : done
                    ? "rgba(228,195,122,0.4)"
                    : "rgba(244,237,224,0.08)",
                opacity: locked && !done ? 0.72 : 1,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: tint,
                  backgroundColor: done ? tint : "transparent",
                }}
              >
                <Ionicons
                  name={(category.iconName as IconName) ?? "chatbubbles-outline"}
                  size={22}
                  color={done ? "#12100C" : tint}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 18,
                    color: THEME.ink,
                    lineHeight: 22,
                  }}
                >
                  {category.name}
                </Text>
                <Text
                  style={{
                    marginTop: 3,
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 0.6,
                    color: spicy ? tint : done ? THEME.accent : "rgba(244,237,224,0.45)",
                  }}
                >
                  {subtitle}
                </Text>
              </View>
              <Ionicons
                name={
                  spicy
                    ? "chevron-forward"
                    : done
                      ? "checkmark"
                      : locked
                        ? "lock-closed-outline"
                        : "chevron-forward"
                }
                size={18}
                color={tint}
              />
            </Pressable>
          );
        })}
      </View>

      {error && !openId ? (
        <Text style={{ marginTop: 12, color: "#E8A090", fontFamily: SERIF, fontSize: 15 }}>
          {error}
        </Text>
      ) : null}

      <Modal visible={Boolean(openId)} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(8,7,5,0.82)" }}>
            <Pressable className="absolute inset-0" onPress={close} />
            <View
              style={{
                maxHeight: "88%",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderWidth: 1,
                borderColor: spicyOpen ? "rgba(201,123,138,0.4)" : "rgba(228,195,122,0.35)",
                backgroundColor: "#16130E",
                paddingHorizontal: 22,
                paddingTop: 22,
                paddingBottom: 36,
              }}
            >
              {spicyOpen ? (
                <SpicyDarePanel onClose={close} />
              ) : (
                <ScrollView keyboardShouldPersistTaps="handled">
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text
                      style={{
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        letterSpacing: 2.4,
                        textTransform: "uppercase",
                        color: openTint,
                      }}
                    >
                      {openCategory?.name}
                    </Text>
                    <Pressable onPress={close} hitSlop={12}>
                      <Ionicons name="close" size={22} color="rgba(244,237,224,0.7)" />
                    </Pressable>
                  </View>
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 26,
                      lineHeight: 34,
                      color: THEME.ink,
                    }}
                  >
                    {openQuestion?.text ?? "Drawing…"}
                  </Text>
                  <Text
                    style={{
                      marginTop: 12,
                      fontFamily: SERIF,
                      fontSize: 15,
                      lineHeight: 22,
                      fontStyle: "italic",
                      color: THEME.muted,
                    }}
                  >
                    Read it out loud. A thumb sends this card to the back of the deck.
                  </Text>

                  <View className="mt-5 flex-row gap-3">
                    <Pressable
                      onPress={() => setReaction("up")}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        borderRadius: 18,
                        paddingVertical: 16,
                        borderWidth: 1,
                        borderColor:
                          reaction === "up" ? THEME.accent : "rgba(244,237,224,0.14)",
                        backgroundColor:
                          reaction === "up" ? "rgba(228,195,122,0.18)" : "transparent",
                      }}
                    >
                      <Text className="text-[28px]">👍</Text>
                      <Text
                        style={{
                          marginTop: 6,
                          fontFamily: "SpaceMono",
                          fontSize: 11,
                          letterSpacing: 0.4,
                          color: THEME.ink,
                        }}
                      >
                        Keep this
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setReaction("down")}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        borderRadius: 18,
                        paddingVertical: 16,
                        borderWidth: 1,
                        borderColor:
                          reaction === "down" ? "#E8A090" : "rgba(244,237,224,0.14)",
                        backgroundColor:
                          reaction === "down" ? "rgba(232,160,144,0.16)" : "transparent",
                      }}
                    >
                      <Text className="text-[28px]">👎</Text>
                      <Text
                        style={{
                          marginTop: 6,
                          fontFamily: "SpaceMono",
                          fontSize: 11,
                          letterSpacing: 0.4,
                          color: THEME.ink,
                        }}
                      >
                        Send back
                      </Text>
                    </Pressable>
                  </View>

                  <TextInput
                    value={body}
                    onChangeText={setBody}
                    placeholder="A note, or just talk and save"
                    placeholderTextColor="rgba(244,237,224,0.35)"
                    multiline
                    style={{
                      marginTop: 18,
                      minHeight: 110,
                      borderRadius: 22,
                      borderWidth: 1,
                      borderColor: "rgba(228,195,122,0.22)",
                      backgroundColor: "#12100C",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      color: THEME.ink,
                      fontFamily: SERIF,
                      fontSize: 17,
                      lineHeight: 24,
                    }}
                  />
                  {error && openId ? (
                    <Text style={{ marginTop: 12, color: "#E8A090", fontFamily: SERIF }}>
                      {error}
                    </Text>
                  ) : null}
                  <View className="mt-4">
                    <PrimaryButton
                      tone="gold"
                      label={answered ? "Update this card" : "Save and shuffle back"}
                      loading={loading}
                      onPress={() => void save()}
                    />
                  </View>
                  <Text
                    style={{
                      marginTop: 12,
                      textAlign: "center",
                      fontFamily: SERIF,
                      fontSize: 13,
                      fontStyle: "italic",
                      color: "rgba(244,237,224,0.45)",
                    }}
                  >
                    {answered
                      ? "This deck is done for today. Tomorrow it unlocks again."
                      : "Closing still uses today's card. Reopen until you save."}
                  </Text>
                </ScrollView>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </HubScreen>
  );
}
