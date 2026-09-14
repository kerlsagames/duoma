import { Stage, TwinkleSky } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { PING_KINDS, type PingKind } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";

const BG = "#05020C";
const PAD = "#F3E4EA";

function FingerprintMark({ color, size = 92 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 96">
      <Ellipse
        cx="40"
        cy="50"
        rx="10"
        ry="13"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <Ellipse
        cx="40"
        cy="50"
        rx="16"
        ry="20"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      <Ellipse
        cx="40"
        cy="50"
        rx="22"
        ry="27"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M18 44c2-16 12-28 22-28s20 12 22 28"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M14 52c3-22 14-38 26-38s23 16 26 38"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Path
        d="M12 62c4-26 16-46 28-46s24 20 28 46"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Path
        d="M20 78c4-8 10-12 20-12s16 4 20 12"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Path
        d="M16 84c6-12 14-18 24-18s18 6 24 18"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Path
        d="M24 36c6 4 8 14 6 24"
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <Path
        d="M56 38c-5 5-6 14-4 24"
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <Path
        d="M32 22c-8 10-10 24-8 36"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <Path
        d="M48 22c8 10 10 24 8 36"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function ThoughtPingsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<PingKind>("heart");
  const [pressed, setPressed] = useState(false);
  const [burst, setBurst] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boom = useRef(new Animated.Value(0)).current;
  const them = partner?.displayName || "them";
  const meta = PING_KINDS.find((row) => row.id === kind) ?? PING_KINDS[0]!;

  const send = async () => {
    if (!user) {
      setError("Sign in first — this ping needs a body to leave from.");
      return;
    }
    setError(null);
    setBurst(true);
    boom.setValue(0);
    Animated.timing(boom, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setBurst(false));
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      /* web */
    }
    const ping = { id: createId(), fromId: user.id, kind, createdAt: nowIso() };
    await patch((state) => ({ ...state, pings: [ping, ...state.pings].slice(0, 40) }));
    if (partner?.isDemo) {
      setTimeout(() => {
        void patch((state) => ({
          ...state,
          pings: [
            {
              id: createId(),
              fromId: partner.id,
              kind: (kind === "spicy" ? "heart" : "hug") as PingKind,
              createdAt: nowIso(),
            },
            ...state.pings,
          ].slice(0, 40),
        }));
      }, 1400);
    }
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/connect" as Href} accent={meta.color}>
        <View
          style={{
            marginTop: 4,
            height: 420,
            borderRadius: 28,
            overflow: "hidden",
            backgroundColor: "#0A0614",
          }}
        >
          <LinearGradient
            colors={["#12061C", "#05020C", "#1A0820"]}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TwinkleSky count={36} />
            <Text
              style={{
                position: "absolute",
                top: 22,
                fontFamily: HANDWRITING,
                fontSize: 22,
                color: "rgba(255,214,230,0.7)",
              }}
            >
              a fingerprint, not a lecture
            </Text>
            {burst ? (
              <Animated.View
                style={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: 200,
                  borderWidth: 2,
                  borderColor: meta.color,
                  transform: [
                    {
                      scale: boom.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.4, 1.6],
                      }),
                    },
                  ],
                  opacity: boom.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 0],
                  }),
                }}
              />
            ) : null}
            <Pressable
              accessibilityLabel="Press here to send"
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              onPress={() => void send()}
              style={{ alignItems: "center" }}
            >
              <View
                style={{
                  width: 168,
                  height: 168,
                  borderRadius: 84,
                  backgroundColor: PAD,
                  borderWidth: 3,
                  borderColor: meta.color,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  shadowColor: meta.color,
                  shadowOpacity: 0.45,
                  shadowRadius: 18,
                }}
              >
                <FingerprintMark color={meta.color} />
              </View>
              <Text
                style={{
                  marginTop: 14,
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: PAD,
                }}
              >
                press here to send
              </Text>
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name={meta.icon} size={18} color={meta.color} />
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 22,
                    color: meta.color,
                  }}
                >
                  {meta.label}
                </Text>
              </View>
              <Text
                style={{
                  marginTop: 4,
                  color: "rgba(255,230,240,0.55)",
                  fontSize: 13,
                }}
              >
                {pressed ? "sending…" : `to ${them}`}
              </Text>
            </Pressable>
          </LinearGradient>
        </View>

        <View
          style={{
            marginTop: -22,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
            paddingHorizontal: 4,
          }}
        >
          {PING_KINDS.map((row) => {
            const on = kind === row.id;
            return (
              <Pressable
                key={row.id}
                onPress={() => setKind(row.id)}
                accessibilityLabel={row.label}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: on ? row.color : "#24141C",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: row.color,
                }}
              >
                <Ionicons
                  name={row.icon}
                  size={18}
                  color={on ? "#1A0810" : row.color}
                />
              </Pressable>
            );
          })}
        </View>
        <Text
          style={{
            marginTop: 10,
            textAlign: "center",
            color: "rgba(255,230,240,0.5)",
            fontFamily: HANDWRITING,
            fontSize: 18,
          }}
        >
          {meta.blurb}
        </Text>
        {error ? (
          <Text style={{ marginTop: 8, textAlign: "center", color: "#FF8A8A" }}>
            {error}
          </Text>
        ) : null}

        <View style={{ marginTop: 22, gap: 10 }}>
          {!ready || data.pings.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "rgba(255,230,240,0.35)",
                fontFamily: SERIF,
                fontSize: 16,
              }}
            >
              The sky is empty. First ping is always a little shy.
            </Text>
          ) : (
            data.pings.slice(0, 8).map((ping, i) => {
              const row = PING_KINDS.find((item) => item.id === ping.kind);
              const mine = ping.fromId === user?.id;
              return (
                <View
                  key={ping.id}
                  style={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    transform: [{ rotate: i % 2 === 0 ? "1.5deg" : "-2deg" }],
                  }}
                >
                  <Ionicons
                    name={row?.icon ?? "heart"}
                    size={18}
                    color={row?.color ?? "#FF6B9A"}
                  />
                  <Text style={{ color: row?.color ?? "#FF6B9A", fontFamily: SERIF }}>
                    {mine ? "you" : them} · {row?.label.toLowerCase()}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </Stage>
    </Screen>
  );
}
