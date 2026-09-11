import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { INTIMACY_KINDS, type IntimacyKind } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";

const BG = "#140806";
const HOT = "#FF6A3D";

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateKey(d);
}

function Campfire({ heat }: { heat: number }) {
  const flicker = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 1,
          duration: 380,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flicker]);
  const scale = 0.7 + Math.min(1.1, heat * 0.12);
  const wobble = flicker.interpolate({
    inputRange: [0, 1],
    outputRange: ["-3deg", "4deg"],
  });

  return (
    <View style={{ height: 210, alignItems: "center", justifyContent: "flex-end" }}>
      <Animated.View style={{ transform: [{ scale }, { rotate: wobble }] }}>
        <Svg width={180} height={170}>
          <Ellipse cx={90} cy={150} rx={50} ry={10} fill="#2A140C" />
          <Path d="M40 148 L70 128 L80 150 Z" fill="#6B3A1A" />
          <Path d="M140 148 L110 124 L100 150 Z" fill="#4A2812" />
          <Path d="M90 40 C110 80 120 110 90 148 C60 110 70 80 90 40 Z" fill="#FF4D1A" />
          <Path d="M90 58 C102 86 108 112 90 140 C72 112 78 86 90 58 Z" fill="#FFB347" />
          <Path d="M90 78 C96 98 98 116 90 132 C82 116 84 98 90 78 Z" fill="#FFF3B0" />
        </Svg>
      </Animated.View>
    </View>
  );
}

export default function IntimacyStreakScreen() {
  const { user } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<IntimacyKind>("date");
  const [note, setNote] = useState("");
  const days = useMemo(() => Array.from({ length: 70 }, (_, i) => dateOffset(69 - i)), []);
  const byDate = useMemo(() => {
    const map = new Map<string, IntimacyKind[]>();
    for (const row of data.intimacy) {
      const list = map.get(row.date) ?? [];
      list.push(row.kind);
      map.set(row.date, list);
    }
    return map;
  }, [data.intimacy]);
  const streak = useMemo(() => {
    let n = 0;
    for (let i = 0; i < 60; i += 1) {
      if (byDate.has(dateOffset(i))) n += 1;
      else break;
    }
    return n;
  }, [byDate]);

  const log = async () => {
    if (!user) return;
    await patch((state) => ({
      ...state,
      intimacy: [
        {
          id: createId(),
          userId: user.id,
          kind,
          note: note.trim(),
          date: localDateKey(),
          createdAt: nowIso(),
        },
        ...state.intimacy,
      ],
    }));
    setNote("");
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/desire" as Href} accent={HOT}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 22,
            color: "#FFB347",
          }}
        >
          keep the fire
        </Text>
        <Campfire heat={ready ? streak : 1} />
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 64,
            color: HOT,
            marginTop: -12,
          }}
        >
          {ready ? streak : "—"}
        </Text>
        <Text
          style={{
            textAlign: "center",
            color: "rgba(255,210,180,0.6)",
            fontFamily: SERIF,
            fontSize: 16,
          }}
        >
          {streak === 0
            ? "Cold stones. Throw a log on."
            : streak === 1
              ? "A single night of kindling."
              : "nights the fire stayed lit"}
        </Text>

        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 5,
            justifyContent: "center",
          }}
        >
          {days.map((day) => {
            const kinds = byDate.get(day) ?? [];
            const color =
              INTIMACY_KINDS.find((row) => row.id === kinds[0])?.color ?? "#2A1410";
            return (
              <View
                key={day}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: kinds.length ? color : "#2A1410",
                }}
              />
            );
          })}
        </View>

        <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {INTIMACY_KINDS.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setKind(row.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: kind === row.id ? row.color : "#2A1410",
                borderRadius: 999,
              }}
            >
              <Text style={{ color: kind === row.id ? "#1A0806" : "#FFD2B4", fontSize: 13 }}>
                {row.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What did you throw on the fire?"
          placeholderTextColor="rgba(255,210,180,0.35)"
          style={{
            marginTop: 12,
            borderRadius: 12,
            padding: 12,
            backgroundColor: "#2A1410",
            color: "#FFE8D6",
            fontFamily: HANDWRITING,
            fontSize: 18,
          }}
        />
        <Pressable
          onPress={() => void log()}
          style={{
            marginTop: 10,
            height: 52,
            borderRadius: 26,
            backgroundColor: HOT,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A0806", fontWeight: "800" }}>Feed the fire</Text>
        </Pressable>
      </Stage>
    </Screen>
  );
}
