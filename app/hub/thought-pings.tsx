import { Stage, TwinkleSky } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { PING_KINDS, type PingKind } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

const BG = "#05020C";

export default function ThoughtPingsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<PingKind>("heart");
  const [charging, setCharging] = useState(false);
  const [burst, setBurst] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const charge = useRef(new Animated.Value(0)).current;
  const boom = useRef(new Animated.Value(0)).current;
  const them = partner?.displayName || "them";
  const meta = PING_KINDS.find((row) => row.id === kind) ?? PING_KINDS[0]!;

  useEffect(() => {
    if (!charging) {
      Animated.timing(charge, { toValue: 0, duration: 180, useNativeDriver: false }).start();
      return;
    }
    Animated.timing(charge, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [charge, charging]);

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

  const ring = charge.interpolate({
    inputRange: [0, 1],
    outputRange: [88, 148],
  });

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
              hold to miss them
            </Text>
            <Animated.View
              style={{
                position: "absolute",
                width: ring,
                height: ring,
                borderRadius: 200,
                borderWidth: 2,
                borderColor: meta.color,
                opacity: 0.45,
              }}
            />
            {burst ? (
              <Animated.View
                style={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: 200,
                  borderWidth: 2,
                  borderColor: meta.color,
                  transform: [{ scale: boom.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.6] }) }],
                  opacity: boom.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                }}
              />
            ) : null}
            <Pressable
              onPressIn={() => setCharging(true)}
              onPressOut={() => {
                setCharging(false);
                void send();
              }}
              style={{ alignItems: "center" }}
            >
              <Text style={{ fontSize: 92, lineHeight: 100 }}>{meta.emoji === "♡" ? "♥" : meta.emoji}</Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: SERIF,
                  fontSize: 28,
                  color: meta.color,
                }}
              >
                {meta.label}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: "rgba(255,230,240,0.55)",
                  fontSize: 13,
                }}
              >
                {charging ? "charging…" : `release to send to ${them}`}
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
          {PING_KINDS.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setKind(row.id)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: kind === row.id ? row.color : "#160C18",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: row.color,
              }}
            >
              <Text style={{ fontSize: 16 }}>{row.emoji}</Text>
            </Pressable>
          ))}
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
          <Text style={{ marginTop: 8, textAlign: "center", color: "#FF8A8A" }}>{error}</Text>
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
                    transform: [{ rotate: i % 2 === 0 ? "1.5deg" : "-2deg" }],
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{row?.emoji}</Text>
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
