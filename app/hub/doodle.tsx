import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { DoodlePoint, DoodleStroke } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const BG = "#0B0D12";
const INK = "#F0C75E";
const PALETTE = ["#F0C75E", "#FF6B9A", "#3ECFBF", "#F4F4F6", "#FF7A45", "#C9A0DC"];

function toPath(points: DoodlePoint[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")}`;
}

export default function DoodleScreen() {
  const { user } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [color, setColor] = useState(PALETTE[0]!);
  const [width, setWidth] = useState(4);
  const [live, setLive] = useState<DoodleStroke | null>(null);
  const box = useRef({ w: 1, h: 320 });

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
          prev
            ? { ...prev, points: [...prev.points, { x: locationX, y: locationY }] }
            : prev
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

  const onLayout = (e: LayoutChangeEvent) => {
    box.current = {
      w: e.nativeEvent.layout.width,
      h: e.nativeEvent.layout.height,
    };
  };

  const strokes = live ? [...data.doodle.strokes, live] : data.doodle.strokes;

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={INK}
        fallback={"/hub/play" as Href}
        kicker="Fun · canvas"
        title="Shared doodle"
        body="A fridge-door canvas. Draw badly on purpose. Hearts, maps, insults, tic-tac-toe."
        ready={ready}
      >
        <View
          onLayout={onLayout}
          {...pan.panHandlers}
          style={{
            marginTop: 16,
            height: 340,
            borderRadius: 20,
            backgroundColor: "#12151C",
            borderWidth: 1,
            borderColor: "rgba(240,199,94,0.3)",
            overflow: "hidden",
          }}
        >
          <Svg width="100%" height="100%">
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
        </View>
        <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
          {PALETTE.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: c,
                borderWidth: color === c ? 2 : 0,
                borderColor: "#fff",
              }}
            />
          ))}
          <Pressable onPress={() => setWidth(width === 4 ? 8 : 4)} style={{ justifyContent: "center" }}>
            <Text style={{ color: INK }}>{width === 4 ? "thin" : "thick"}</Text>
          </Pressable>
        </View>
        <View style={{ marginTop: 10, flexDirection: "row", gap: 12 }}>
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
            <Text style={{ color: "#F4F4F6" }}>Undo</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              void patch((state) => ({
                ...state,
                doodle: { strokes: [], updatedAt: nowIso(), updatedBy: user?.id ?? null },
              }))
            }
          >
            <Text style={{ color: "#FF8A8A" }}>Clear canvas</Text>
          </Pressable>
        </View>
      </MiniChrome>
    </Screen>
  );
}
