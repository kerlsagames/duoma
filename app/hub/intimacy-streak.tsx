import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { sectionAccent } from "@/lib/hub-theme";
import { localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import {
  collectIntimacyLogs,
  dateOffset,
  fireHeat,
  fireLabel,
  fireScale,
  intimacyStreak,
} from "@/lib/intimacy-streak";
import { useMiniApps } from "@/lib/mini-apps";
import {
  INTIMACY_KINDS,
  MANUAL_INTIMACY_KINDS,
  type ManualIntimacyKind,
} from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

const BG = "#140806";
const hot = () => sectionAccent("desire", "#FF6A3D");

function Campfire({ heat }: { heat: number }) {
  const flicker = useRef(new Animated.Value(0)).current;
  const grow = useRef(new Animated.Value(fireScale(heat))).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 1,
          duration: 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flicker]);

  useEffect(() => {
    Animated.spring(grow, {
      toValue: fireScale(heat),
      friction: 7,
      tension: 48,
      useNativeDriver: true,
    }).start();
  }, [grow, heat]);

  const scale = fireScale(heat);
  const roaring = heat >= 2.4;
  const blazing = heat >= 6;
  const wobble = flicker.interpolate({
    inputRange: [0, 1],
    outputRange: roaring ? ["-6deg", "7deg"] : ["-3deg", "4deg"],
  });
  const glow = flicker.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.55],
  });
  const glowSize = 70 + Math.min(220, scale * 110);
  const stageHeight = Math.round(150 + Math.min(210, scale * 120));

  return (
    <View
      style={{
        height: stageHeight,
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "visible",
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 28,
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize,
          backgroundColor: blazing
            ? "rgba(255,90,20,0.55)"
            : roaring
              ? "rgba(255,80,20,0.42)"
              : heat > 0
                ? "rgba(255,70,20,0.28)"
                : "rgba(80,30,10,0.2)",
          opacity: glow,
        }}
      />
      <Animated.View style={{ transform: [{ scale: grow }, { rotate: wobble }] }}>
        <Svg width={210} height={210}>
          <Ellipse cx={105} cy={188} rx={58} ry={12} fill="#2A140C" />
          <Path d="M48 184 L82 158 L94 188 Z" fill="#6B3A1A" />
          <Path d="M162 184 L128 154 L116 188 Z" fill="#4A2812" />
          {heat <= 0.4 ? (
            <>
              <Path d="M105 150 C118 168 120 178 105 186 C90 178 92 168 105 150 Z" fill="#7A2A12" />
              <Path d="M105 162 C112 172 112 178 105 184 C98 178 98 172 105 162 Z" fill="#E85A1A" />
            </>
          ) : (
            <>
              {roaring ? (
                <>
                  <Path d="M70 70 C55 110 48 150 78 186 C95 150 92 110 70 70 Z" fill="#FF3B10" />
                  <Path d="M140 62 C160 108 168 150 132 186 C118 150 118 108 140 62 Z" fill="#FF4D1A" />
                </>
              ) : null}
              {blazing ? (
                <>
                  <Path d="M88 28 C70 80 62 130 90 186 C108 130 112 80 88 28 Z" fill="#FF2A00" />
                  <Path d="M122 22 C148 78 158 130 120 186 C102 130 98 78 122 22 Z" fill="#FF3B10" />
                </>
              ) : null}
              <Path d="M105 36 C132 88 146 128 105 186 C64 128 78 88 105 36 Z" fill="#FF4D1A" />
              <Path d="M105 58 C122 96 130 132 105 178 C80 132 88 96 105 58 Z" fill="#FFB347" />
              <Path d="M105 84 C114 112 118 138 105 168 C92 138 96 112 105 84 Z" fill="#FFF3B0" />
              {roaring ? (
                <>
                  <Circle cx={72} cy={78} r={3} fill="#FFD27A" />
                  <Circle cx={148} cy={64} r={2.5} fill="#FFE8A0" />
                  <Circle cx={96} cy={42} r={2} fill="#FFF3B0" />
                  <Circle cx={128} cy={50} r={2.2} fill="#FFB347" />
                </>
              ) : null}
              {blazing ? (
                <>
                  <Circle cx={60} cy={96} r={2} fill="#FF8A3D" />
                  <Circle cx={160} cy={88} r={2.4} fill="#FFE08A" />
                  <Circle cx={110} cy={24} r={2.6} fill="#FFF6C8" />
                </>
              ) : null}
            </>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}

export default function IntimacyStreakScreen() {
  const { user, spicyDares, nights, talkDraws, jarNotes, curiosityAnswers } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<ManualIntimacyKind>("date");
  const [note, setNote] = useState("");
  const today = localDateKey();
  const days = useMemo(() => Array.from({ length: 70 }, (_, i) => dateOffset(69 - i)), []);

  const logs = useMemo(
    () =>
      collectIntimacyLogs({
        stored: data.intimacy,
        spicyDares,
        nights,
        pings: data.pings,
        talkDraws,
        jarNotes,
        curiosityAnswers,
        audioNotes: data.audioNotes,
      }),
    [
      curiosityAnswers,
      data.audioNotes,
      data.intimacy,
      data.pings,
      jarNotes,
      nights,
      spicyDares,
      talkDraws,
    ]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, typeof logs>();
    for (const row of logs) {
      const list = map.get(row.date) ?? [];
      list.push(row);
      map.set(row.date, list);
    }
    return map;
  }, [logs]);

  const dates = useMemo(() => new Set(byDate.keys()), [byDate]);
  const streak = useMemo(() => intimacyStreak(dates, today), [dates, today]);
  const todayLogs = byDate.get(today) ?? [];
  const heat = fireHeat(streak, todayLogs.length, logs.length);
  const autoToday = todayLogs.filter((row) => row.sourceId).length;

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
          date: today,
          createdAt: nowIso(),
          sourceId: null,
        },
        ...state.intimacy,
      ],
    }));
    setNote("");
  };

  const sub =
    !ready
      ? "Lighting the grate…"
      : streak === 0 && logs.length === 0
        ? "Cold stones. A dare, a ping, a talk, or a log will light it."
        : streak === 0
          ? "The fire went out. Feed it today — dares, pings, Connect and logs all count."
          : streak === 1
            ? "A single night of kindling. Keep going."
            : `${streak} nights the fire stayed lit`;

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/desire" as Href} accent={hot()}>
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
        <Campfire heat={ready ? heat : 1} />
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 64,
            color: hot(),
            marginTop: -12,
          }}
        >
          {ready ? streak : "—"}
        </Text>
        <Text
          style={{
            textAlign: "center",
            color: "rgba(255,210,180,0.7)",
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 22,
            paddingHorizontal: 8,
          }}
        >
          {sub}
        </Text>
        {ready && todayLogs.length > 0 ? (
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              color: "#FFB347",
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 0.6,
            }}
          >
            {todayLogs.length} log{todayLogs.length === 1 ? "" : "s"} tonight
            {autoToday ? ` · ${autoToday} from play` : ""}
          </Text>
        ) : null}

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
            const rows = byDate.get(day) ?? [];
            const color =
              INTIMACY_KINDS.find((item) => item.id === rows[0]?.kind)?.color ?? "#2A1410";
            return (
              <View
                key={day}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: rows.length ? color : "#2A1410",
                }}
              />
            );
          })}
        </View>

        {todayLogs.length > 0 ? (
          <View style={{ marginTop: 18, gap: 6 }}>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: "rgba(255,210,180,0.45)",
              }}
            >
              TONIGHT’S FUEL
            </Text>
            {todayLogs.slice(0, 8).map((row) => {
              const meta = INTIMACY_KINDS.find((item) => item.id === row.kind);
              return (
                <View
                  key={row.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: "#2A1410",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      backgroundColor: meta?.color ?? hot(),
                    }}
                  />
                  <Text style={{ flex: 1, color: "#FFD2B4", fontSize: 14 }}>
                    {fireLabel(row.kind, meta?.label ?? row.kind)}
                    {row.note ? ` · ${row.note}` : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <Text
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "rgba(255,210,180,0.5)",
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          Completed dares, Get Spicy nights, thought-of-you pings, and Connect already feed this.
          Use the chips if you want to throw on another log.
        </Text>

        <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MANUAL_INTIMACY_KINDS.map((row) => (
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
            backgroundColor: hot(),
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
