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
  Pressable,
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
  onPick: (cardId: string) => void;
  disabled?: boolean;
};

const CARD_HEIGHT = 140;

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

  const [phase, setPhase] = useState<Phase>("shuffle");
  const [flipped, setFlipped] = useState([false, false, false]);

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

        const targets = [
          { x: -laneWidth * 0.3, y: 168, tilt: -1 },
          { x: 0, y: 188, tilt: 0 },
          { x: laneWidth * 0.3, y: 168, tilt: 1 },
        ];

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
                      toValue: 0.3,
                      duration: 220,
                      useNativeDriver: true,
                    }).start();
                    setPhase("ready");
                    onReady?.();
                  }
                });
              });
            }, index * 300)
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

  const deckTranslateX = deckShake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-10, 10],
  });
  const deckRotateZ = deckRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-9deg", "9deg"],
  });

  const status =
    phase === "shuffle"
      ? mode === "shuffle"
        ? "Shuffling…"
        : "Shuffling the deck…"
      : phase === "deal"
        ? "Dealing to you…"
        : "Pick one";

  const cardWidth = Math.min(128, laneWidth * 0.3);

  return (
    <View className="flex-1">
      <Text className="mb-3 text-[12px] font-semibold uppercase tracking-[2px] text-neon">
        {status}
      </Text>

      <View className="relative items-center" style={{ height: 380 }}>
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
          className="absolute top-2 h-[118px] w-[84px] items-center justify-center rounded-2xl border border-neon/45 bg-[#1A0B14]"
        >
          <View className="absolute inset-1 rounded-xl border border-crimson/25" />
          <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-neon">
            Deck
          </Text>
          <Text className="mt-1 text-[22px] font-bold text-crimson">♠</Text>
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
                        outputRange: [`${-14 - i * 3}deg`, `${14 + i * 3}deg`],
                      }),
                    },
                  ],
                }}
                className="absolute top-3 h-[110px] w-[78px] rounded-2xl border border-white/15 bg-[#12080F]"
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
            outputRange: ["-11deg", "0deg", "11deg"],
          });

          return (
            <Animated.View
              key={`${animationKey}-${card.id}`}
              style={{
                position: "absolute",
                top: 10,
                width: cardWidth,
                height: CARD_HEIGHT,
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
                pointerEvents="none"
                style={{ opacity: backOpacity }}
                className="absolute inset-0 items-center justify-center rounded-2xl border border-neon/40 bg-[#1A0B14]"
              >
                <Text className="text-[20px] font-bold text-crimson">♠</Text>
              </Animated.View>

              <Animated.View style={{ opacity: frontOpacity, flex: 1 }}>
                <Pressable
                  disabled={disabled || phase !== "ready" || !flipped[index]}
                  onPress={() => onPick(card.id)}
                  className="flex-1 rounded-2xl border border-neon/50 bg-white/5 p-3 active:border-neon active:bg-neon/15"
                >
                  <Text
                    className="text-[11px] font-semibold text-mist/50"
                    numberOfLines={1}
                  >
                    {copy.title}
                  </Text>
                  <Text
                    className="mt-1 text-[13px] font-semibold leading-4 text-mist"
                    numberOfLines={6}
                  >
                    {copy.body}
                  </Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          );
        })}
      </View>

      {phase === "ready" ? (
        <Text className="mt-1 text-center text-[13px] text-mist/55">
          Tap a card to play it
        </Text>
      ) : null}
    </View>
  );
}
