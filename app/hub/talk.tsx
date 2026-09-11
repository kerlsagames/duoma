import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { HUB_TONES, SERIF, TALK_DECK_TINT } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { useApp } from "@/lib/store";
import {
  LETS_TALK_DECK,
  canShuffleDraw,
  categoryById,
  questionById,
  remainingToday,
  todaysDraw,
  todaysPick,
} from "@/lib/talk";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const THEME = HUB_TONES.talk;

export default function TalkScreen() {
  const {
    user,
    partner,
    talkDraws,
    talkDecks,
    talkVault,
    drawTalkQuestion,
    shuffleTalkQuestion,
    submitTalkAnswer,
  } = useApp();

  const today = localDateKey();
  const myPick = user ? todaysPick(talkDraws, user.id, today) : undefined;
  const picksLeft = user ? remainingToday(talkDraws, user.id, today) : 1;

  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVault, setShowVault] = useState(false);

  const openDraw = useMemo(() => {
    if (!openId || !user) return undefined;
    return todaysDraw(talkDraws, {
      userId: user.id,
      categoryId: openId,
      date: today,
    });
  }, [openId, talkDraws, today, user]);

  const openCategory = LETS_TALK_DECK.find((row) => row.id === openId) ?? null;
  const openQuestion =
    openCategory && openDraw
      ? questionById(openCategory.id, openDraw.questionId)
      : null;
  const answered = Boolean(openDraw?.answeredAt);
  const canShuffle = canShuffleDraw(openDraw);
  const openTint = openCategory
    ? TALK_DECK_TINT[openCategory.id] ?? THEME.accent
    : THEME.accent;

  const vaultRows = useMemo(
    () =>
      [...talkVault].sort(
        (a, b) => Date.parse(b.readAt) - Date.parse(a.readAt)
      ),
    [talkVault]
  );

  const openCategoryTile = async (categoryId: string) => {
    setError(null);
    if (myPick && myPick.categoryId !== categoryId) {
      setError(
        "You already picked today's topic. Other decks stay locked until tomorrow."
      );
      return;
    }
    try {
      await drawTalkQuestion(categoryId);
      setOpenId(categoryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw a card.");
    }
  };

  const markAnswered = async () => {
    if (!openId) return;
    setError(null);
    setLoading(true);
    try {
      await submitTalkAnswer({ categoryId: openId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark answered");
    } finally {
      setLoading(false);
    }
  };

  const onShuffle = async () => {
    setError(null);
    setLoading(true);
    try {
      await shuffleTalkQuestion();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not shuffle");
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
      title="Nine conversations."
      body="Each of you picks one topic a day. Read it out loud, then tap Answered. One shuffle if you want a different card."
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
        {myPick
          ? myPick.answeredAt
            ? "Today's card is in — decks locked until tomorrow"
            : "Your topic is locked in — finish or shuffle this card"
          : picksLeft
            ? "Pick one topic for today"
            : "Come back tomorrow"}
      </Text>

      <View style={{ gap: 8 }}>
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
          const told = deck?.played.length ?? 0;
          const isMine = Boolean(draw);
          const lockedOut = Boolean(myPick && !isMine);
          const done = Boolean(draw?.answeredAt);
          const tint = TALK_DECK_TINT[category.id] ?? THEME.accent;

          return (
            <Pressable
              key={category.id}
              disabled={lockedOut}
              onPress={() => void openCategoryTile(category.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 22,
                backgroundColor: done
                  ? "rgba(228,195,122,0.12)"
                  : isMine
                    ? "rgba(228,195,122,0.08)"
                    : THEME.surface,
                borderWidth: 1,
                borderColor:
                  done || isMine
                    ? "rgba(228,195,122,0.4)"
                    : "rgba(244,237,224,0.08)",
                opacity: lockedOut ? 0.45 : 1,
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
                    color: done
                      ? THEME.accent
                      : lockedOut
                        ? "rgba(244,237,224,0.35)"
                        : "rgba(244,237,224,0.45)",
                  }}
                >
                  {done
                    ? "Answered"
                    : isMine
                      ? "Open — your card for today"
                      : lockedOut
                        ? "Locked — you already picked"
                        : `${told} told · tap to draw`}
                </Text>
              </View>
              <Ionicons
                name={
                  done
                    ? "checkmark"
                    : lockedOut
                      ? "lock-closed-outline"
                      : isMine
                        ? "book-outline"
                        : "chevron-forward"
                }
                size={18}
                color={tint}
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => setShowVault((value) => !value)}
        style={{
          marginTop: 22,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "rgba(228,195,122,0.28)",
          backgroundColor: THEME.surface,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: THEME.accent,
            }}
          >
            Question vault
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: SERIF,
              fontSize: 16,
              color: THEME.ink,
            }}
          >
            {vaultRows.length === 0
              ? "Read cards land here"
              : `${vaultRows.length} read · never dealt again`}
          </Text>
        </View>
        <Ionicons
          name={showVault ? "chevron-up" : "chevron-down"}
          size={18}
          color={THEME.accent}
        />
      </Pressable>

      {showVault ? (
        <View style={{ marginTop: 10, gap: 8 }}>
          {vaultRows.length === 0 ? (
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 15,
                color: THEME.muted,
                fontStyle: "italic",
              }}
            >
              Nothing vaulted yet. Answer or shuffle a card and it stays out of
              future deals.
            </Text>
          ) : (
            vaultRows.map((row) => {
              let categoryName = row.categoryId;
              try {
                categoryName = categoryById(row.categoryId).name;
              } catch {
                // spicy / legacy ids
              }
              const who =
                row.userId === user?.id
                  ? "You"
                  : partner?.displayName ?? "Partner";
              return (
                <View
                  key={row.id}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "rgba(244,237,224,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 10,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: THEME.accent,
                    }}
                  >
                    {categoryName} · {who} · {row.source}
                  </Text>
                  <Text
                    style={{
                      marginTop: 6,
                      fontFamily: SERIF,
                      fontSize: 16,
                      lineHeight: 22,
                      color: THEME.ink,
                    }}
                  >
                    {row.text}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      ) : null}

      {error && !openId ? (
        <Text
          style={{
            marginTop: 12,
            color: "#E8A090",
            fontFamily: SERIF,
            fontSize: 15,
          }}
        >
          {error}
        </Text>
      ) : null}

      <Modal
        visible={Boolean(openId)}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(8,7,5,0.82)",
          }}
        >
          <Pressable
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={close}
          />
          <View
            style={{
              maxHeight: "88%",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              borderWidth: 1,
              borderColor: "rgba(228,195,122,0.35)",
              backgroundColor: "#16130E",
              paddingHorizontal: 22,
              paddingTop: 22,
              paddingBottom: 36,
            }}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <View
                style={{
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
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
                  <Ionicons
                    name="close"
                    size={22}
                    color="rgba(244,237,224,0.7)"
                  />
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
                {answered
                  ? "Answered — this card is in your vault and will not come up again."
                  : "Read it out loud. Mark answered when you are done, or shuffle once for a different card."}
              </Text>

              {error && openId ? (
                <Text
                  style={{
                    marginTop: 12,
                    color: "#E8A090",
                    fontFamily: SERIF,
                  }}
                >
                  {error}
                </Text>
              ) : null}

              <View style={{ marginTop: 18, gap: 10 }}>
                {!answered ? (
                  <>
                    <PrimaryButton
                      tone="gold"
                      label="Answered"
                      loading={loading}
                      onPress={() => void markAnswered()}
                    />
                    <PrimaryButton
                      tone="ghost"
                      label={
                        canShuffle
                          ? "Shuffle once for a new question"
                          : "Shuffle used for today"
                      }
                      disabled={!canShuffle || loading}
                      onPress={() => void onShuffle()}
                    />
                  </>
                ) : (
                  <PrimaryButton
                    tone="gold"
                    label="Answered"
                    disabled
                    onPress={() => undefined}
                  />
                )}
              </View>

              <Text
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  fontFamily: SERIF,
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "rgba(244,237,224,0.45)",
                }}
              >
                Your partner still has every topic open until they pick theirs.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </HubScreen>
  );
}
