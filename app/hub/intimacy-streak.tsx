import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
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
  dayConnectionScore,
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
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

const BG = "#140806";
const hot = () => sectionAccent("desire", "#FF6A3D");

function Campfire({ level, lit }: { level: number; lit: boolean }) {
  const heat = lit ? level : 0;
  const flicker = useRef(new Animated.Value(0)).current;
  const grow = useRef(new Animated.Value(fireScale(heat))).current;
  const spark = !lit || level < 18;
  const roaring = lit && level >= 40;
  const blazing = lit && level >= 75;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 1,
          duration: spark ? 420 : 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0,
          duration: spark ? 520 : 380,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flicker, spark]);

  useEffect(() => {
    Animated.spring(grow, {
      toValue: fireScale(heat),
      friction: 8,
      tension: 42,
      useNativeDriver: true,
    }).start();
  }, [grow, heat]);

  const scale = fireScale(heat);
  const wobble = flicker.interpolate({
    inputRange: [0, 1],
    outputRange: roaring ? ["-5deg", "6deg"] : spark ? ["-2deg", "2deg"] : ["-3deg", "3deg"],
  });
  const glow = flicker.interpolate({
    inputRange: [0, 1],
    outputRange: lit ? (spark ? [0.18, 0.34] : [0.28, 0.55]) : [0.1, 0.16],
  });
  const glowSize = spark
    ? 36 + scale * 40
    : 70 + Math.min(200, scale * 100);
  const stageHeight = spark
    ? Math.round(110 + scale * 40)
    : Math.round(140 + Math.min(180, scale * 100));

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
          bottom: spark ? 34 : 28,
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize,
          backgroundColor: blazing
            ? "rgba(255,90,20,0.55)"
            : roaring
              ? "rgba(255,80,20,0.42)"
              : lit
                ? spark
                  ? "rgba(255,120,40,0.35)"
                  : "rgba(255,70,20,0.28)"
                : "rgba(80,30,10,0.2)",
          opacity: glow,
        }}
      />
      <Animated.View style={{ transform: [{ scale: grow }, { rotate: wobble }] }}>
        <Svg width={spark ? 120 : 200} height={spark ? 120 : 200}>
          <Ellipse
            cx={spark ? 60 : 100}
            cy={spark ? 108 : 180}
            rx={spark ? 28 : 52}
            ry={spark ? 7 : 11}
            fill="#2A140C"
          />
          <Path
            d={spark ? "M28 106 L44 92 L50 108 Z" : "M42 176 L72 150 L82 178 Z"}
            fill="#6B3A1A"
          />
          <Path
            d={spark ? "M92 106 L76 90 L70 108 Z" : "M158 176 L128 148 L118 178 Z"}
            fill="#4A2812"
          />
          {spark ? (
            <>
              <Path
                d="M60 78 C68 92 70 100 60 108 C50 100 52 92 60 78 Z"
                fill="#FF5A1A"
              />
              <Path
                d="M60 88 C65 96 65 102 60 106 C55 102 55 96 60 88 Z"
                fill="#FFB347"
              />
              <Circle cx={60} cy={72} r={2.2} fill="#FFF3B0" />
            </>
          ) : !lit ? (
            <>
              <Path
                d="M100 145 C112 160 114 170 100 178 C86 170 88 160 100 145 Z"
                fill="#7A2A12"
              />
              <Path
                d="M100 156 C106 166 106 172 100 176 C94 172 94 166 100 156 Z"
                fill="#E85A1A"
              />
            </>
          ) : (
            <>
              {roaring ? (
                <>
                  <Path
                    d="M62 70 C48 108 42 145 72 178 C90 145 88 108 62 70 Z"
                    fill="#FF3B10"
                  />
                  <Path
                    d="M138 62 C158 105 164 145 128 178 C114 145 114 105 138 62 Z"
                    fill="#FF4D1A"
                  />
                </>
              ) : null}
              {blazing ? (
                <>
                  <Path
                    d="M82 28 C64 78 56 126 84 178 C102 126 106 78 82 28 Z"
                    fill="#FF2A00"
                  />
                  <Path
                    d="M118 22 C144 76 154 126 116 178 C98 126 94 76 118 22 Z"
                    fill="#FF3B10"
                  />
                </>
              ) : null}
              <Path
                d="M100 42 C126 90 138 128 100 178 C62 128 74 90 100 42 Z"
                fill="#FF4D1A"
              />
              <Path
                d="M100 62 C116 98 122 132 100 170 C84 132 84 98 100 62 Z"
                fill="#FFB347"
              />
              <Path
                d="M100 86 C110 112 112 138 100 160 C90 138 90 112 100 86 Z"
                fill="#FFF3B0"
              />
            </>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}

function dayLabel(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date.slice(8);
  return String(parsed.getDate());
}

function dayMonth(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(undefined, { month: "short" });
}

function prettyDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function kindLabel(kind: string): string {
  const meta = INTIMACY_KINDS.find((item) => item.id === kind);
  return fireLabel(kind as never, meta?.label ?? kind);
}

/** Fixed-height bar window — no nested ScrollView, so it always paints on web. */
function ActivityChart({
  bars,
  selected,
  onSelect,
}: {
  bars: DayBar[];
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const chartHeight = 128;
  const maxEnd = Math.max(GRAPH_WINDOW_DAYS, bars.length);
  const [end, setEnd] = useState(maxEnd);
  const [hovered, setHovered] = useState<string | null>(null);
  const windowEnd = Math.min(end, bars.length);
  const windowStart = Math.max(0, windowEnd - GRAPH_WINDOW_DAYS);
  const visible = bars.slice(windowStart, windowEnd);
  const maxTotal = Math.max(1, ...bars.map((row) => row.total));
  const canOlder = windowStart > 0;
  const canNewer = windowEnd < bars.length;
  const tipBar =
    visible.find((bar) => bar.date === hovered) ??
    visible.find((bar) => bar.date === selected) ??
    null;

  useEffect(() => {
    setEnd(bars.length);
  }, [bars.length]);

  return (
    <View style={{ minHeight: 220 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Pressable
          onPress={() =>
            canOlder &&
            setEnd((value) => Math.max(GRAPH_WINDOW_DAYS, value - GRAPH_WINDOW_DAYS))
          }
          disabled={!canOlder}
          hitSlop={10}
          style={{ opacity: canOlder ? 1 : 0.25, paddingHorizontal: 6 }}
        >
          <Text style={{ color: hot(), fontFamily: "SpaceMono", fontSize: 16 }}>‹</Text>
        </Pressable>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "rgba(255,210,180,0.5)",
          }}
        >
          Last {GRAPH_WINDOW_DAYS} days
        </Text>
        <Pressable
          onPress={() =>
            canNewer && setEnd((value) => Math.min(bars.length, value + GRAPH_WINDOW_DAYS))
          }
          disabled={!canNewer}
          hitSlop={10}
          style={{ opacity: canNewer ? 1 : 0.25, paddingHorizontal: 6 }}
        >
          <Text style={{ color: hot(), fontFamily: "SpaceMono", fontSize: 16 }}>›</Text>
        </Pressable>
      </View>

      <View
        style={{
          minHeight: 58,
          marginBottom: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: tipBar ? "#2A1410" : "rgba(42,20,16,0.45)",
          borderWidth: 1,
          borderColor: tipBar ? "rgba(255,106,61,0.35)" : "rgba(255,106,61,0.12)",
        }}
      >
        {tipBar ? (
          <>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 0.8,
                color: hot(),
                marginBottom: 4,
              }}
            >
              {prettyDate(tipBar.date)}
              {` · score ${dayConnectionScore(tipBar)}/100`}
              {tipBar.total
                ? ` · ${tipBar.total} log${tipBar.total === 1 ? "" : "s"}`
                : " · quiet"}
            </Text>
            {tipBar.total === 0 ? (
              <Text style={{ color: "rgba(255,210,180,0.55)", fontSize: 13 }}>
                No fuel this day.
              </Text>
            ) : (
              tipBar.segments.map((segment) => (
                <View
                  key={`${tipBar.date}-tip-${segment.kind}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 3,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      backgroundColor: segment.color,
                    }}
                  />
                  <Text style={{ flex: 1, color: "#FFD2B4", fontSize: 13 }}>
                    {kindLabel(segment.kind)}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,210,180,0.55)",
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                    }}
                  >
                    ×{segment.count}
                  </Text>
                </View>
              ))
            )}
          </>
        ) : (
          <Text
            style={{
              color: "rgba(255,210,180,0.45)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Hover or tap a bar to see what fed that day.
          </Text>
        )}
      </View>

      <View
        style={{
          height: chartHeight + 58,
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        {visible.map((bar) => {
          const active = selected === bar.date || hovered === bar.date;
          const score = dayConnectionScore(bar);
          const height =
            bar.total === 0
              ? 4
              : Math.max(16, Math.round((bar.total / maxTotal) * chartHeight));
          return (
            <Pressable
              key={bar.date}
              onPress={() => onSelect(bar.date)}
              onHoverIn={() => setHovered(bar.date)}
              onHoverOut={() => setHovered((current) => (current === bar.date ? null : current))}
              accessibilityLabel={`${prettyDate(bar.date)}: connection ${score} of 100`}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-end",
                paddingHorizontal: 3,
              }}
            >
              <Text
                style={{
                  marginBottom: 4,
                  fontSize: 11,
                  fontFamily: "SpaceMono",
                  fontWeight: "700",
                  color: active ? hot() : score ? "#FFD2B4" : "rgba(255,210,180,0.35)",
                }}
              >
                {score}
              </Text>
              <View
                style={{
                  width: "70%",
                  maxWidth: 28,
                  height,
                  borderRadius: bar.total ? 5 : 2,
                  overflow: "hidden",
                  backgroundColor: bar.total ? "transparent" : "rgba(255,106,61,0.2)",
                  borderWidth: active ? 1.5 : 0,
                  borderColor: hot(),
                  justifyContent: "flex-end",
                  opacity: hovered && hovered !== bar.date ? 0.55 : 1,
                }}
              >
                {bar.segments.map((segment) => {
                  const piece = Math.max(
                    4,
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
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: "700",
                  color: active ? hot() : "rgba(255,210,180,0.85)",
                  fontFamily: "SpaceMono",
                }}
              >
                {dayLabel(bar.date)}
              </Text>
              <Text
                style={{
                  marginTop: 1,
                  fontSize: 9,
                  color: active ? hot() : "rgba(255,210,180,0.55)",
                  fontFamily: "SpaceMono",
                }}
              >
                {dayMonth(bar.date)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function IntimacyStreakScreen() {
  const { user, spicyDares, nights, talkDraws, jarNotes, curiosityAnswers } =
    useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<ManualIntimacyKind>("date");
  const look = useAppLook("intimacy-streak", hot(), {
    hideGraph: false,
    calmFire: false,
  });
  const [note, setNote] = useState("");
  const today = localDateKey();
  const [selectedDay, setSelectedDay] = useState(today);

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

  const headline = !ready
    ? "—"
    : !fire.lit
      ? "out"
      : fire.day <= 1
        ? "Day 1"
        : `Day ${fire.day}`;

  return (
    <Screen scroll background={BG} density={look.prefs.density} typeface={look.prefs.typeface} accent={look.wash}>
      <Stage
        background={BG}
        fallback={"/hub/desire" as Href}
        accent={look.accent}
        settingsLabel="Intimacy streak"
        settings={
          <LookPanel
            look={look}
            ink="#F6E7DC"
            muted="rgba(246,231,220,0.6)"
            toggles={[
              {
                key: "hideGraph",
                label: "Hide the week graph",
                hint: "Just the fire.",
              },
              {
                key: "calmFire",
                label: "Calm fire",
                hint: "Less flicker. Same heat.",
              },
            ]}
          />
        }
      >
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
          level={ready ? fire.level : 3}
          lit={ready ? fire.lit : true}
        />

        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 44,
            color: hot(),
            marginTop: -8,
          }}
        >
          {headline}
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
          {ready ? fireCaption(fire) : "Lighting the grate…"}
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
            Tiny on day one · grows over months · {MISS_DAYS_TO_OUT} quiet nights puts it out
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

        {look.prefs.hideGraph ? null : (
        <View
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 20,
            backgroundColor: "#1C0C08",
            borderWidth: 1,
            borderColor: "rgba(255,106,61,0.22)",
          }}
        >
          <ActivityChart
            bars={bars}
            selected={selectedDay}
            onSelect={setSelectedDay}
          />
        </View>
        )}

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
          already feed this graph. Use a label below to throw on another log.
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
          <Text style={{ color: "#1A0806", fontWeight: "800" }}>Feed the fire</Text>
        </Pressable>
      </Stage>
    </Screen>
  );
}
