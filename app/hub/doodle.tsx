import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING } from "@/lib/app-themes";
import { nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { DoodlePoint, DoodleStroke } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useRef, useState } from "react";
import { LayoutChangeEvent, PanResponder, Pressable, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";

const BG = "#2A241C";
const PAPER = "#F3E6C4";
const PALETTE = ["#2A1C12", "#C23B3B", "#1F6B5A", "#2A4A8B", "#D4A017", "#7A3E8B"];

function toPath(points: DoodlePoint[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")}`;
}

export default function DoodleScreen() {
  const { user } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [color, setColor] = useState(PALETTE[0]!);
  const [width, setWidth] = useState(3);
  const [live, setLive] = useState<DoodleStroke | null>(null);

  const commit = (stroke: DoodleStroke) => {
    void patch((state) => ({
      ...state,
      doodle: {
        strokes: [...state.doodle.strokes, stroke].slice(-80),
        updatedAt: nowIso(),
        updatedBy: user?.id ?? null,
      },
    }));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setLive({ color, width, points: [{ x: locationX, y: locationY }] });
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setLive((prev) =>
          prev ? { ...prev, points: [...prev.points, { x: locationX, y: locationY }] } : prev
        );
      },
      onPanResponderRelease: () => {
        setLive((prev) => {
          if (prev && prev.points.length > 1) commit(prev);
          return null;
        });
      },
    })
  ).current;

  const onLayout = (_e: LayoutChangeEvent) => {};
  const strokes = live ? [...data.doodle.strokes, live] : data.doodle.strokes;

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/play" as Href} accent={PAPER}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 28,
            color: PAPER,
          }}
        >
          the fridge door
        </Text>
        <View
          onLayout={onLayout}
          {...pan.panHandlers}
          style={{
            marginTop: 12,
            height: 360,
            backgroundColor: PAPER,
            borderRadius: 2,
            overflow: "hidden",
            transform: [{ rotate: "-0.8deg" }],
            shadowColor: "#000",
            shadowOpacity: 0.35,
            shadowRadius: 16,
          }}
        >
          <Svg width="100%" height="100%">
            {Array.from({ length: 14 }, (_, i) => (
              <Line
                key={i}
                x1={0}
                x2={400}
                y1={24 + i * 24}
                y2={24 + i * 24}
                stroke="rgba(42,28,18,0.08)"
                strokeWidth={1}
              />
            ))}
            {strokes.map((stroke, i) => (
              <Path
                key={i}
                d={toPath(stroke.points)}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </Svg>
          {!ready || data.doodle.strokes.length === 0 ? (
            <Text
              style={{
                position: "absolute",
                top: 40,
                left: 24,
                fontFamily: HANDWRITING,
                fontSize: 22,
                color: "rgba(42,28,18,0.25)",
              }}
            >
              draw something stupid
            </Text>
          ) : null}
        </View>
        <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {PALETTE.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={{
                width: 18,
                height: 56,
                backgroundColor: c,
                borderRadius: 3,
                transform: [{ rotate: color === c ? "-8deg" : "4deg" }],
                borderWidth: color === c ? 2 : 0,
                borderColor: "#F3E6C4",
              }}
            />
          ))}
          <Pressable onPress={() => setWidth(width === 3 ? 7 : 3)}>
            <Text style={{ color: PAPER, fontFamily: HANDWRITING, fontSize: 18 }}>
              {width === 3 ? "pencil" : "crayon"}
            </Text>
          </Pressable>
        </View>
        <View style={{ marginTop: 10, flexDirection: "row", gap: 18 }}>
          <Pressable
            onPress={() =>
              void patch((state) => ({
                ...state,
                doodle: {
                  strokes: state.doodle.strokes.slice(0, -1),
                  updatedAt: nowIso(),
                  updatedBy: user?.id ?? null,
                },
              }))
            }
          >
            <Text style={{ color: PAPER }}>undo</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              void patch((state) => ({
                ...state,
                doodle: { strokes: [], updatedAt: nowIso(), updatedBy: user?.id ?? null },
              }))
            }
          >
            <Text style={{ color: "#C23B3B" }}>rip the page out</Text>
          </Pressable>
        </View>
      </Stage>
    </Screen>
  );
}
