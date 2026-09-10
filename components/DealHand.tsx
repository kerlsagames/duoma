import { Animated, Pressable, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import type { Card } from "@/lib/types";
import {
  personalizeCard,
  type GenderPair,
  type NamePair,
} from "@/lib/personalize";

type Props = {
  cards: Card[];
  names: NamePair;
  genders: GenderPair | null | undefined;
  dealing: boolean;
  onDealt: () => void;
  onPick: (cardId: string) => void;
  disabled?: boolean;
};

export function DealHand({
  cards,
  names,
  genders,
  dealing,
  onDealt,
  onPick,
  disabled,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(dealing ? 0 : cards.length);
  const scales = useRef(cards.map(() => new Animated.Value(dealing ? 0.4 : 1))).current;
  const opacities = useRef(cards.map(() => new Animated.Value(dealing ? 0 : 1))).current;
  const offsets = useRef(cards.map(() => new Animated.Value(dealing ? -48 : 0))).current;

  useEffect(() => {
    if (!dealing) {
      setVisibleCount(cards.length);
      return;
    }
    setVisibleCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    cards.forEach((_, index) => {
      scales[index].setValue(0.4);
      opacities[index].setValue(0);
      offsets[index].setValue(-48);
      const timer = setTimeout(() => {
        setVisibleCount((count) => Math.max(count, index + 1));
        Animated.parallel([
          Animated.spring(scales[index], {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(opacities[index], {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(offsets[index], {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (index === cards.length - 1) onDealt();
        });
      }, 180 + index * 220);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealing, cards.map((card) => card.id).join("|")]);

  return (
    <View className="gap-3">
      <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
        {dealing || visibleCount < cards.length ? "Dealing…" : "Pick one"}
      </Text>
      {cards.map((card, index) => {
        if (index >= visibleCount) return null;
        const copy = personalizeCard(card, names, genders);
        return (
          <Animated.View
            key={card.id}
            style={{
              opacity: opacities[index],
              transform: [
                { scale: scales[index] },
                { translateY: offsets[index] },
              ],
            }}
          >
            <Pressable
              disabled={disabled || dealing || visibleCount < cards.length}
              onPress={() => onPick(card.id)}
              className="rounded-[24px] border border-neon/35 bg-white/5 p-4 active:border-neon active:bg-neon/10"
            >
              <Text className="text-[13px] font-semibold text-mist/55">
                {copy.title}
              </Text>
              <Text className="mt-2 text-[17px] font-semibold leading-6 text-mist">
                {copy.body}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
