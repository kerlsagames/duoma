import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  personalizeCard,
  type GenderPair,
  type NamePair,
} from "@/lib/personalize";
import type { Card } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type Phase = "shuffle" | "deal" | "ready";

type Props = {
  cards: Card[];
  names: NamePair;
  genders: GenderPair | null | undefined;
  /** Change this to replay shuffle + deal (new deal or reshuffle). */
  animationKey: string | number;
  mode?: "deal" | "shuffle";
  onReady?: () => void;
  /** Fires only after the player confirms with Play. */
  onPick: (cardId: string) => void;
  disabled?: boolean;
};

const CARD_GAP = 12;
const FLY_CARD_HEIGHT = 120;

export function DealHand({
  cards,
  names,
  genders,
  animationKey,
  mode = "deal",
  onReady,
  onPick,
  disabled,
}: Props) {
  const { width } = useWindowDimensions();
  const laneWidth = Math.min(width - 40, 420);
  const hand = useMemo(() => cards.slice(0, 3), [cards]);
  const cardWidth = Math.min(laneWidth, 380);

  const [phase, setPhase] = useState<Phase>("shuffle");
  const [flipped, setFlipped] = useState([false, false, false]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const deckShake = useRef(new Animated.Value(0)).current;
  const deckRotate = useRef(new Animated.Value(0)).current;
  const deckOpacity = useRef(new Animated.Value(1)).current;

  const slots = useRef(
    [0, 1, 2].map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0.9),
      opacity: new Animated.Value(0),
      flip: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setPhase("shuffle");
    setFlipped([false, false, false]);
    setSelectedId(null);
    deckShake.setValue(0);
    deckRotate.setValue(0);
    deckOpacity.setValue(1);
    slots.forEach((slot) => {
      slot.x.setValue(0);
      slot.y.setValue(-12);
      slot.rotate.setValue(0);
      slot.scale.setValue(0.9);
      slot.opacity.setValue(0);
      slot.flip.setValue(0);
    });

    const buzz = async (style = Haptics.ImpactFeedbackStyle.Light) => {
      try {
        await Haptics.impactAsync(style);
      } catch {
        // web / unsupported
      }
    };

    const shuffleLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(deckShake, {
            toValue: 1,
            duration: 65,
            useNativeDriver: true,
          }),
          Animated.timing(deckRotate, {
            toValue: 1,
            duration: 65,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(deckShake, {
            toValue: -1,
            duration: 65,
            useNativeDriver: true,
          }),
          Animated.timing(deckRotate, {
            toValue: -1,
            duration: 65,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(deckShake, {
            toValue: 0,
            duration: 65,
            useNativeDriver: true,
          }),
          Animated.timing(deckRotate, {
            toValue: 0,
            duration: 65,
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: mode === "shuffle" ? 6 : 4 }
    );

    void buzz();
    shuffleLoop.start();

    const shuffleMs = mode === "shuffle" ? 980 : 720;
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        shuffleLoop.stop();
        deckShake.setValue(0);
        deckRotate.setValue(0);
        setPhase("deal");
        void buzz(Haptics.ImpactFeedbackStyle.Medium);

        const startY = 128;
        const targets = hand.map((_, index) => ({
          x: 0,
          y: startY + index * (FLY_CARD_HEIGHT + CARD_GAP),
          tilt: index === 0 ? -0.4 : index === 2 ? 0.4 : 0,
        }));

        hand.forEach((_, index) => {
          const slot = slots[index];
          timers.push(
            setTimeout(() => {
              if (cancelled) return;
              slot.opacity.setValue(1);
              Animated.parallel([
                Animated.timing(slot.x, {
                  toValue: targets[index].x,
                  duration: 440,
                  easing: Easing.out(Easing.cubic),
                  useNativeDriver: true,
                }),
                Animated.timing(slot.y, {
                  toValue: targets[index].y,
                  duration: 440,
                  easing: Easing.out(Easing.cubic),
                  useNativeDriver: true,
                }),
                Animated.timing(slot.rotate, {
                  toValue: targets[index].tilt,
                  duration: 440,
                  useNativeDriver: true,
                }),
                Animated.spring(slot.scale, {
                  toValue: 1,
                  friction: 6,
                  tension: 68,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                Animated.timing(slot.flip, {
                  toValue: 1,
                  duration: 300,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }).start(() => {
                  if (cancelled) return;
                  setFlipped((prev) => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                  });
                  void buzz();
                  if (index === hand.length - 1) {
                    Animated.timing(deckOpacity, {
                      toValue: 0,
                      duration: 180,
                      useNativeDriver: true,
                    }).start();
                    setPhase("ready");
                    onReady?.();
                  }
                });
              });
            }, index * 280)
          );
        });
      }, shuffleMs)
    );

    return () => {
      cancelled = true;
      shuffleLoop.stop();
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationKey, mode, hand.map((card) => card.id).join("|"), laneWidth]);

  const openConfirm = (cardId: string) => {
    if (disabled || phase !== "ready") return;
    setSelectedId(cardId);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const changeMind = () => setSelectedId(null);

  const playSelected = () => {
    if (!selectedId) return;
    onPick(selectedId);
  };

  const deckTranslateX = deckShake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-10, 10],
  });
  const deckRotateZ = deckRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-9deg", "9deg"],
  });

  const status =
    selectedId
      ? "Your pick"
      : phase === "shuffle"
        ? mode === "shuffle"
          ? "Shuffling…"
          : "Shuffling the deck…"
        : phase === "deal"
          ? "Dealing to you…"
          : "Pick one — read them all";

  const selectedCard = hand.find((card) => card.id === selectedId) ?? null;
  const selectedCopy = selectedCard
    ? personalizeCard(selectedCard, names, genders)
    : null;

  const flyHeight = 128 + hand.length * (FLY_CARD_HEIGHT + CARD_GAP) + 20;
  const animating = phase !== "ready";

  return (
    <View className="flex-1">
      <Text className="mb-3 text-[12px] font-semibold uppercase tracking-[2px] text-neon">
        {status}
      </Text>

      {animating ? (
        <View className="relative items-center" style={{ minHeight: flyHeight }}>
          <Animated.View
            pointerEvents="none"
            style={{
              opacity: deckOpacity,
              transform: [
                { translateX: deckTranslateX },
                { rotate: deckRotateZ },
              ],
              zIndex: 2,
            }}
            className="absolute top-2 h-[100px] w-[72px] items-center justify-center rounded-2xl border border-neon/45 bg-[#1A0B14]"
          >
            <View className="absolute inset-1 rounded-xl border border-crimson/25" />
            <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-neon">
              Deck
            </Text>
            <Text className="mt-1 text-[20px] font-bold text-crimson">♠</Text>
          </Animated.View>

          {phase === "shuffle"
            ? [0, 1, 2].map((i) => (
                <Animated.View
                  key={`flutter-${i}`}
                  pointerEvents="none"
                  style={{
                    opacity: 0.5,
                    zIndex: 1,
                    transform: [
                      {
                        translateX: deckShake.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-16 - i * 5, 16 + i * 5],
                        }),
                      },
                      {
                        translateY: deckRotate.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-6 + i * 3, 10 - i * 2],
                        }),
                      },
                      {
                        rotate: deckRotate.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [
                            `${-14 - i * 3}deg`,
                            `${14 + i * 3}deg`,
                          ],
                        }),
                      },
                    ],
                  }}
                  className="absolute top-3 h-[92px] w-[66px] rounded-2xl border border-white/15 bg-[#12080F]"
                />
              ))
            : null}

          {hand.map((card, index) => {
            const slot = slots[index];
            const copy = personalizeCard(card, names, genders);
            const frontOpacity = slot.flip.interpolate({
              inputRange: [0, 0.49, 0.5, 1],
              outputRange: [0, 0, 1, 1],
            });
            const backOpacity = slot.flip.interpolate({
              inputRange: [0, 0.49, 0.5, 1],
              outputRange: [1, 1, 0, 0],
            });
            const scaleX = slot.flip.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.04, 1],
            });
            const rotate = slot.rotate.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ["-4deg", "0deg", "4deg"],
            });

            return (
              <Animated.View
                key={`${animationKey}-fly-${card.id}`}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 10,
                  width: cardWidth,
                  height: FLY_CARD_HEIGHT,
                  opacity: slot.opacity,
                  zIndex: 10 + index,
                  transform: [
                    { translateX: slot.x },
                    { translateY: slot.y },
                    { rotate },
                    { scale: slot.scale },
                    { scaleX },
                  ],
                }}
              >
                <Animated.View
                  style={{ opacity: backOpacity }}
                  className="absolute inset-0 items-center justify-center rounded-[22px] border border-neon/40 bg-[#1A0B14]"
                >
                  <Text className="text-[28px] font-bold text-crimson">♠</Text>
                </Animated.View>
                <Animated.View
                  style={{ opacity: frontOpacity }}
                  className="absolute inset-0 rounded-[22px] border border-neon/50 bg-[#140910] px-4 py-3"
                >
                  <Text
                    className="text-[14px] font-semibold leading-5 text-mist"
                    numberOfLines={4}
                  >
                    {copy.body}
                  </Text>
                </Animated.View>
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <View className="gap-3">
          {hand.map((card, index) => {
            const copy = personalizeCard(card, names, genders);
            const ready = flipped[index];
            return (
              <Pressable
                key={`${animationKey}-ready-${card.id}`}
                disabled={disabled || !ready}
                onPress={() => openConfirm(card.id)}
                className="rounded-[24px] border border-neon/50 bg-[#140910] px-4 py-4 active:border-neon active:bg-neon/15"
              >
                <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-neon/70">
                  Option {index + 1}
                </Text>
                {copy.title ? (
                  <Text className="mt-1 text-[15px] font-semibold leading-5 text-mist/70">
                    {copy.title}
                  </Text>
                ) : null}
                <Text className="mt-2 text-[17px] font-semibold leading-6 text-mist">
                  {copy.body}
                </Text>
              </Pressable>
            );
          })}
          <Text className="mt-1 text-center text-[13px] text-mist/55">
            Tap a card to open it full screen
          </Text>
        </View>
      )}

      <Modal
        visible={Boolean(selectedId && selectedCopy)}
        animationType="fade"
        transparent
        onRequestClose={changeMind}
      >
        <View className="flex-1 justify-end bg-black/80">
          <View className="max-h-[92%] min-h-[70%] rounded-t-[28px] border border-neon/40 bg-[#12080F] px-5 pb-8 pt-5">
            <Text className="text-center text-[12px] font-semibold uppercase tracking-[3px] text-neon">
              Your pick
            </Text>
            <ScrollView
              className="mt-4 flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
            >
              {selectedCopy?.title ? (
                <Text className="text-center text-[18px] font-semibold leading-6 text-mist/65">
                  {selectedCopy.title}
                </Text>
              ) : null}
              <Text className="mt-4 text-center text-[26px] font-bold leading-9 text-mist">
                {selectedCopy?.body}
              </Text>
            </ScrollView>
            <View className="mt-2 gap-3">
              <PrimaryButton
                label="Play"
                disabled={disabled}
                onPress={playSelected}
              />
              <PrimaryButton
                label="Change mind"
                tone="ghost"
                disabled={disabled}
                onPress={changeMind}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
