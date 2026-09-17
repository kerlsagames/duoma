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
  buildDayBars,
  collectIntimacyLogs,
  computeFireState,
  dayConnectionScore,
  fireLabel,
  fireScale,
  type DayBar,
} from "@/lib/intimacy-streak";
import { useMiniApps } from "@/lib/mini-apps";
import {
  INTIMACY_KINDS,
  MANUAL_INTIMACY_KINDS,
  SIMPLE_INTIMACY_KINDS,
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

function extraNoteParts(note: string, label: string): { match: boolean; detail: string } {
  if (note === label) return { match: true, detail: "" };
  const prefix = `${label} · `;
  if (note.startsWith(prefix)) return { match: true, detail: note.slice(prefix.length) };
  return { match: false, detail: "" };
}

function composeExtraNote(label: string, detail: string): string {
  const next = detail.trim();
  return next ? `${label} · ${next}` : label;
}

function logCaption(
  row: { kind: string; note: string },
  extraButtons: string[]
): { title: string; detail: string } {
  if (row.kind === "adventure") {
    for (const label of extraButtons) {
      const parts = extraNoteParts(row.note, label);
      if (parts.match) return { title: label, detail: parts.detail };
    }
    const [title, ...rest] = row.note.split(" · ");
    return { title: title || "Custom", detail: rest.join(" · ") };
  }
  const meta = INTIMACY_KINDS.find((item) => item.id === row.kind);
  return { title: meta?.label ?? row.kind, detail: row.note };
}

/** Fixed-height bar window — no nested ScrollView, so it always paints on web. */
function ActivityChart({
  bars,
  selected,
  onSelect,
  hideScore = false,
}: {
  bars: DayBar[];
  selected: string | null;
  onSelect: (date: string) => void;
  hideScore?: boolean;
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
              {hideScore
                ? tipBar.total
                  ? ` · ${tipBar.total} log${tipBar.total === 1 ? "" : "s"}`
                  : " · quiet"
                : ` · score ${dayConnectionScore(tipBar)}/100${
                    tipBar.total
                      ? ` · ${tipBar.total} log${tipBar.total === 1 ? "" : "s"}`
                      : " · quiet"
                  }`}
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
              {hideScore ? null : (
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
              )}
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
    simpleMode: false,
    extraSimple: "",
  });
  const simple = Boolean(look.prefs.simpleMode);
  const extraButtons = useMemo(
    () =>
      String(look.prefs.extraSimple ?? "")
        .split(",")
        .map((row) => row.trim())
        .filter(Boolean)
        .slice(0, 8),
    [look.prefs.extraSimple]
  );
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailDraft, setDetailDraft] = useState("");
  const today = localDateKey();
  const [selectedDay, setSelectedDay] = useState(today);

  const fireLogs = useMemo(
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
  const simpleLogs = useMemo(
    () =>
      data.intimacy.filter(
        (row) =>
          !row.sourceId &&
          (SIMPLE_INTIMACY_KINDS.some((item) => item.id === row.kind) ||
            (row.kind === "adventure" && Boolean(row.note)))
      ),
    [data.intimacy]
  );
  const logs = simple ? simpleLogs : fireLogs;

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

  const logKind = async (next: ManualIntimacyKind, nextNote = "") => {
    if (!user) return;
    await patch((state) => ({
      ...state,
      intimacy: [
        {
          id: createId(),
          userId: user.id,
          kind: next,
          note: nextNote.trim(),
          date: today,
          createdAt: nowIso(),
          sourceId: null,
        },
        ...state.intimacy,
      ],
    }));
    setSelectedDay(today);
  };

  const log = async () => {
    await logKind(kind, note);
    setNote("");
  };

  const todayCount = (id: ManualIntimacyKind, extraNote?: string) =>
    extraNote
      ? todayLogs.filter(
          (row) =>
            row.kind === "adventure" && extraNoteParts(row.note, extraNote).match
        ).length
      : todayLogs.filter((row) => row.kind === id).length;

  const addExtraButton = () => {
    const label = addDraft.trim();
    if (!label) return;
    if (extraButtons.some((row) => row.toLowerCase() === label.toLowerCase())) {
      setAddDraft("");
      setAdding(false);
      return;
    }
    if (SIMPLE_INTIMACY_KINDS.some((row) => row.label.toLowerCase() === label.toLowerCase())) {
      setAddDraft("");
      setAdding(false);
      return;
    }
    look.patch({ extraSimple: [...extraButtons, label].join(",") });
    setAddDraft("");
    setAdding(false);
  };

  const beginEdit = (row: { id: string; kind: string; note: string }) => {
    const caption = logCaption(row, extraButtons);
    setEditingId(row.id);
    setDetailDraft(caption.detail);
  };

  const saveDetail = async () => {
    if (!editingId) return;
    const row = logs.find((item) => item.id === editingId);
    if (!row) {
      setEditingId(null);
      return;
    }
    const caption = logCaption(row, extraButtons);
    const nextNote =
      row.kind === "adventure"
        ? composeExtraNote(caption.title, detailDraft)
        : detailDraft.trim();
    await patch((state) => ({
      ...state,
      intimacy: state.intimacy.map((item) =>
        item.id === editingId ? { ...item, note: nextNote } : item
      ),
    }));
    setEditingId(null);
    setDetailDraft("");
  };

  const headline = !ready
    ? "—"
    : !fire.lit
      ? "out"
      : fire.day <= 1
        ? "Day 1"
        : `Day ${fire.day}`;

  return (
    <Screen scroll background={BG} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
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
            pageColor={BG}
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
        <View
          style={{
            flexDirection: "row",
            padding: 4,
            borderRadius: 16,
            backgroundColor: "#1C0C08",
            borderWidth: 1,
            borderColor: "rgba(255,106,61,0.22)",
          }}
        >
          {(
            [
              [false, "Fire"],
              [true, "Keep it simple"],
            ] as const
          ).map(([value, label]) => {
            const on = simple === value;
            return (
              <Pressable
                key={label}
                onPress={() => look.patch({ simpleMode: value })}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 10,
                  backgroundColor: on ? hot() : "transparent",
                }}
              >
                <Text
                  style={{
                    color: on ? "#1A0806" : "#FFD2B4",
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {simple ? (
          <>
            <Text
              style={{
                marginTop: 18,
                textAlign: "center",
                fontFamily: HANDWRITING,
                fontSize: 22,
                color: "#FFB347",
              }}
            >
              just log it
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontFamily: SERIF,
                fontSize: 34,
                color: hot(),
                marginTop: 2,
              }}
            >
              Keep it simple
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{
                marginTop: 18,
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
          </>
        )}
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
            {!simple && autoToday ? ` · ${autoToday} from play` : ""}
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
            hideScore={simple}
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
              {simple
                ? selectedDay === today
                  ? "TODAY  ·  tap a log for details"
                  : selectedDay
                : selectedDay === today
                  ? "TODAY’S FUEL"
                  : `${selectedDay} · FUEL`}
            </Text>
            {selectedLogs.slice(0, 10).map((row) => {
              const meta = INTIMACY_KINDS.find((item) => item.id === row.kind);
              const caption = logCaption(row, extraButtons);
              const editing = editingId === row.id;
              return (
                <View
                  key={row.id}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: "#2A1410",
                    gap: 8,
                  }}
                >
                  <Pressable
                    onPress={() => (simple ? beginEdit(row) : undefined)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
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
                      {caption.title}
                      {caption.detail ? ` · ${caption.detail}` : ""}
                    </Text>
                    {simple ? (
                      <Text
                        style={{
                          color: "rgba(255,179,71,0.85)",
                          fontFamily: "SpaceMono",
                          fontSize: 10,
                        }}
                      >
                        {editing ? "editing" : "details"}
                      </Text>
                    ) : null}
                  </Pressable>
                  {editing ? (
                    <View>
                      <TextInput
                        value={detailDraft}
                        onChangeText={setDetailDraft}
                        placeholder="e.g. on the bathroom bench"
                        placeholderTextColor="rgba(255,210,180,0.35)"
                        autoFocus
                        multiline
                        onSubmitEditing={() => void saveDetail()}
                        style={{
                          minHeight: 56,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(255,106,61,0.35)",
                          backgroundColor: "#1C0C08",
                          color: "#FFE8D6",
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 15,
                        }}
                      />
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                        <Pressable
                          onPress={() => {
                            setEditingId(null);
                            setDetailDraft("");
                          }}
                          style={{
                            flex: 1,
                            height: 36,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "rgba(255,210,180,0.2)",
                          }}
                        >
                          <Text style={{ color: "#FFD2B4", fontWeight: "700", fontSize: 13 }}>
                            Cancel
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => void saveDetail()}
                          style={{
                            flex: 1,
                            height: 36,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: hot(),
                          }}
                        >
                          <Text style={{ color: "#1A0806", fontWeight: "800", fontSize: 13 }}>
                            Save details
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
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
            {simple ? "Nothing logged" : "No fuel logged"} on{" "}
            {selectedDay === today ? "today" : selectedDay}.
          </Text>
        )}

        {simple ? (
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {SIMPLE_INTIMACY_KINDS.map((row) => {
              const count = todayCount(row.id);
              return (
                <Pressable
                  key={row.id}
                  onPress={() => void logKind(row.id)}
                  style={{
                    width: "48%",
                    flexGrow: 1,
                    minWidth: 140,
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    backgroundColor: row.color,
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#1A0806",
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    {row.label}
                  </Text>
                  {count > 0 ? (
                    <Text
                      style={{
                        marginTop: 4,
                        color: "rgba(26,8,6,0.65)",
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                      }}
                    >
                      today ×{count}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
            {extraButtons.map((label) => {
              const count = todayCount("adventure", label);
              return (
                <Pressable
                  key={`extra-${label}`}
                  onPress={() => void logKind("adventure", label)}
                  onLongPress={() =>
                    look.patch({
                      extraSimple: extraButtons
                        .filter((row) => row !== label)
                        .join(","),
                    })
                  }
                  style={{
                    width: "48%",
                    flexGrow: 1,
                    minWidth: 140,
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    backgroundColor: "#3ECFBF",
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#1A0806",
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    {label}
                  </Text>
                  {count > 0 ? (
                    <Text
                      style={{
                        marginTop: 4,
                        color: "rgba(26,8,6,0.65)",
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                      }}
                    >
                      today ×{count}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
            {adding ? (
              <View
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: "#2A1410",
                  borderWidth: 1,
                  borderColor: "rgba(255,106,61,0.35)",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,210,180,0.7)",
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  Name the new button. Long-press a custom one later to remove it.
                </Text>
                <TextInput
                  value={addDraft}
                  onChangeText={setAddDraft}
                  placeholder="e.g. Massage, shower, quickie"
                  placeholderTextColor="rgba(255,210,180,0.35)"
                  autoFocus
                  onSubmitEditing={addExtraButton}
                  style={{
                    minHeight: 52,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,106,61,0.28)",
                    backgroundColor: "#1C0C08",
                    color: "#FFE8D6",
                    fontWeight: "700",
                    fontSize: 16,
                    paddingHorizontal: 14,
                  }}
                />
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <Pressable
                    onPress={() => {
                      setAdding(false);
                      setAddDraft("");
                    }}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "rgba(255,210,180,0.2)",
                    }}
                  >
                    <Text style={{ color: "#FFD2B4", fontWeight: "700", fontSize: 14 }}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={addExtraButton}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: hot(),
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#1A0806", fontWeight: "800", fontSize: 14 }}>
                      Add button
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : extraButtons.length < 8 ? (
              <Pressable
                onPress={() => setAdding(true)}
                style={{
                  width: "48%",
                  flexGrow: 1,
                  minWidth: 140,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: "rgba(255,179,71,0.55)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFB347",
                    fontWeight: "800",
                    fontSize: 16,
                  }}
                >
                  + Add a button
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
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
          </>
        )}
      </Stage>
    </Screen>
  );
}
