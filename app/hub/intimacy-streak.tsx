import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { sectionAccent } from "@/lib/hub-theme";
import { localDateKey } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import {
  GRAPH_HISTORY_DAYS,
  GRAPH_WINDOW_DAYS,
  MISS_DAYS_TO_OUT,
  buildDayBars,
  collectIntimacyLogs,
  computeFireState,
  fireCaption,
  fireLabel,
  fireScale,
  type DayBar,
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
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

const BG = "#140806";
const hot = () => sectionAccent("desire", "#FF6A3D");

function Campfire({ level, lit }: { level: number; lit: boolean }) {
  const heat = lit ? level : 0;
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
  const roaring = lit && level >= 40;
  const blazing = lit && level >= 75;
  const wobble = flicker.interpolate({
    inputRange: [0, 1],
    outputRange: roaring ? ["-6deg", "7deg"] : ["-3deg", "4deg"],
  });
  const glow = flicker.interpolate({
    inputRange: [0, 1],
    outputRange: lit ? [0.28, 0.55] : [0.12, 0.2],
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
              : lit
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
          {!lit || level <= 0.4 ? (
            <>
              <Path
                d="M105 150 C118 168 120 178 105 186 C90 178 92 168 105 150 Z"
                fill="#7A2A12"
              />
              <Path
                d="M105 162 C112 172 112 178 105 184 C98 178 98 172 105 162 Z"
                fill="#E85A1A"
              />
            </>
          ) : (
            <>
              {roaring ? (
                <>
                  <Path
                    d="M70 70 C55 110 48 150 78 186 C95 150 92 110 70 70 Z"
                    fill="#FF3B10"
                  />
                  <Path
                    d="M140 62 C160 108 168 150 132 186 C118 150 118 108 140 62 Z"
                    fill="#FF4D1A"
                  />
                </>
              ) : null}
              {blazing ? (
                <>
                  <Path
                    d="M88 28 C70 80 62 130 90 186 C108 130 112 80 88 28 Z"
                    fill="#FF2A00"
                  />
                  <Path
                    d="M122 22 C148 78 158 130 120 186 C102 130 98 78 122 22 Z"
                    fill="#FF3B10"
                  />
                </>
              ) : null}
              <Path
                d="M105 36 C132 88 146 128 105 186 C64 128 78 88 105 36 Z"
                fill="#FF4D1A"
              />
              <Path
                d="M105 58 C122 96 130 132 105 178 C80 132 88 96 105 58 Z"
                fill="#FFB347"
              />
              <Path
                d="M105 84 C114 112 118 138 105 168 C92 138 96 112 105 84 Z"
                fill="#FFF3B0"
              />
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

function dayLabel(date: string): string {
  const day = Number(date.slice(8, 10));
  return Number.isFinite(day) ? String(day) : date.slice(5);
}

function ActivityChart({
  bars,
  selected,
  onSelect,
}: {
  bars: DayBar[];
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [viewport, setViewport] = useState(0);
  const slot = viewport > 0 ? viewport / GRAPH_WINDOW_DAYS : 12;
  const chartHeight = 120;
  const maxTotal = Math.max(1, ...bars.map((row) => row.total));

  const onLayout = (event: LayoutChangeEvent) => {
    setViewport(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (!viewport) return;
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [viewport, bars.length]);

  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: "rgba(255,210,180,0.45)",
          textAlign: "center",
        }}
      >
        Last {GRAPH_WINDOW_DAYS} days · swipe for older
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={onLayout}
        style={{ marginTop: 12 }}
        contentContainerStyle={{
          paddingHorizontal: 4,
          alignItems: "flex-end",
          minWidth: viewport || undefined,
        }}
      >
        {bars.map((bar) => {
          const active = selected === bar.date;
          const barWidth = Math.max(5, slot - 5);
          const height =
            bar.total === 0
              ? 2
              : Math.max(12, Math.round((bar.total / maxTotal) * chartHeight));
          return (
            <Pressable
              key={bar.date}
              onPress={() => onSelect(bar.date)}
              accessibilityLabel={`${bar.date}: ${bar.total} log${bar.total === 1 ? "" : "s"}`}
              style={{
                width: slot,
                alignItems: "center",
                justifyContent: "flex-end",
                paddingHorizontal: 1,
              }}
            >
              <View
                style={{
                  width: barWidth,
                  height,
                  borderRadius: bar.total ? 3 : 1,
                  overflow: "hidden",
                  backgroundColor: bar.total ? "transparent" : "rgba(255,106,61,0.18)",
                  borderWidth: active ? 1 : 0,
                  borderColor: hot(),
                  justifyContent: "flex-end",
                }}
              >
                {bar.segments.map((segment) => {
                  const piece = Math.max(
                    3,
                    Math.round((segment.count / maxTotal) * chartHeight)
                  );
                  return (
                    <View
                      key={`${bar.date}-${segment.kind}`}
                      style={{
                        height: piece,
                        width: "100%",
                        backgroundColor: segment.color,
                      }}
                    />
                  );
                })}
              </View>
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 9,
                  color: active ? hot() : "rgba(255,210,180,0.35)",
                  fontFamily: "SpaceMono",
                }}
              >
                {dayLabel(bar.date)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 12,
          color: "rgba(255,210,180,0.45)",
          lineHeight: 17,
        }}
      >
        Taller = more that day. Color is the kind of fuel — tap a day for details.
      </Text>
    </View>
  );
}

export default function IntimacyStreakScreen() {
  const { user, spicyDares, nights, talkDraws, jarNotes, curiosityAnswers } =
    useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<ManualIntimacyKind>("date");
  const [note, setNote] = useState("");
  const today = localDateKey();
  const [selectedDay, setSelectedDay] = useState<string>(today);

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

  const bars = useMemo(
    () => buildDayBars(logs, GRAPH_HISTORY_DAYS, today),
    [logs, today]
  );

  const fire = useMemo(() => computeFireState(logs, today), [logs, today]);

  const selectedLogs = useMemo(
    () => logs.filter((row) => row.date === selectedDay),
    [logs, selectedDay]
  );

  const todayLogs = useMemo(
    () => logs.filter((row) => row.date === today),
    [logs, today]
  );
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
    setSelectedDay(today);
  };

  const levelLabel = !ready
    ? "—"
    : !fire.lit
      ? "out"
      : `${Math.round(fire.level)}`;

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

        <Campfire
          level={ready ? fire.level : 5}
          lit={ready ? fire.lit : true}
        />

        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 56,
            color: hot(),
            marginTop: -12,
          }}
        >
          {levelLabel}
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
          {ready
            ? fireCaption(fire)
            : "Lighting the grate…"}
        </Text>
        {ready && fire.lit ? (
          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              color: "rgba(255,210,180,0.45)",
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 0.6,
            }}
          >
            Grows over months · {MISS_DAYS_TO_OUT} quiet nights puts it out
            {fire.fedDays ? ` · ${fire.fedDays} fed days` : ""}
          </Text>
        ) : null}
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
            {todayLogs.length} log{todayLogs.length === 1 ? "" : "s"} today
            {autoToday ? ` · ${autoToday} from play` : ""}
          </Text>
        ) : null}

        <View
          style={{
            marginTop: 22,
            padding: 14,
            borderRadius: 20,
            backgroundColor: "#1C0C08",
            borderWidth: 1,
            borderColor: "rgba(255,106,61,0.18)",
          }}
        >
          <ActivityChart
            bars={bars}
            selected={selectedDay}
            onSelect={setSelectedDay}
          />
        </View>

        {selectedLogs.length > 0 ? (
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
              {selectedDay === today ? "TODAY’S FUEL" : `${selectedDay} · FUEL`}
            </Text>
            {selectedLogs.slice(0, 10).map((row) => {
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
        ) : (
          <Text
            style={{
              marginTop: 16,
              textAlign: "center",
              color: "rgba(255,210,180,0.4)",
              fontSize: 13,
            }}
          >
            No fuel logged on {selectedDay === today ? "today" : selectedDay}.
          </Text>
        )}

        <Text
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "rgba(255,210,180,0.5)",
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          Completed dares, Get Spicy nights, thought-of-you pings, and Connect
          already feed this chart. Use a label below to throw on another log.
        </Text>

        <View
          style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}
        >
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
              <Text
                style={{
                  color: kind === row.id ? "#1A0806" : "#FFD2B4",
                  fontSize: 13,
                }}
              >
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
          <Text style={{ color: "#1A0806", fontWeight: "800" }}>
            Feed the fire
          </Text>
        </Pressable>
      </Stage>
    </Screen>
  );
}
