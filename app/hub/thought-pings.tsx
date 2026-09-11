import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { useMiniApps } from "@/lib/mini-apps";
import { PING_KINDS, type PingKind } from "@/lib/mini-content";
import { createId, nowIso } from "@/lib/ids";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

const BG = "#0A0610";

function PulseHeart({ color, beating }: { color: string; beating: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!beating) {
      scale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.18,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [beating, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
      <Ionicons name="heart" size={88} color={color} />
    </Animated.View>
  );
}

export default function ThoughtPingsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<PingKind>("heart");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const meta = PING_KINDS.find((row) => row.id === kind) ?? PING_KINDS[0];
  const them = partner?.displayName || "them";

  const send = async () => {
    if (!user) {
      setError("Sign in to send a ping.");
      return;
    }
    setError(null);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      /* web */
    }
    const ping = {
      id: createId(),
      fromId: user.id,
      kind,
      createdAt: nowIso(),
    };
    await patch((state) => ({ ...state, pings: [ping, ...state.pings].slice(0, 40) }));
    setSent(`Sent ${meta.label.toLowerCase()} to ${them}.`);
    if (partner?.isDemo) {
      const replyKind: PingKind = kind === "spicy" ? "heart" : "hug";
      setTimeout(() => {
        void patch((state) => ({
          ...state,
          pings: [
            {
              id: createId(),
              fromId: partner.id,
              kind: replyKind,
              createdAt: nowIso(),
            },
            ...state.pings,
          ].slice(0, 40),
        }));
      }, 1600);
    }
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent="#FF6B9A"
        fallback={"/hub/connect" as Href}
        kicker="Connect"
        title="Thought-of-you"
        body={`A haptic tap, not a conversation. ${them} feels it and can ignore it. That's the point.`}
        ready={ready}
      >
        <View style={{ marginTop: 22, alignItems: "center" }}>
          <PulseHeart color={meta.color} beating={Boolean(sent)} />
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 20,
              color: meta.color,
            }}
          >
            {meta.label}
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: "rgba(244,244,246,0.5)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {meta.blurb}
          </Text>
        </View>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {PING_KINDS.map((row) => {
            const on = row.id === kind;
            return (
              <Pressable
                key={row.id}
                onPress={() => {
                  setKind(row.id);
                  setSent(null);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: on ? `${row.color}33` : "rgba(255,255,255,0.04)",
                  borderWidth: 1,
                  borderColor: on ? row.color : "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ color: on ? row.color : "#F4F4F6", fontSize: 13 }}>
                  {row.emoji}  {row.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => void send()}
          style={{
            marginTop: 22,
            height: 56,
            borderRadius: 999,
            backgroundColor: meta.color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A0810", fontWeight: "800", fontSize: 16 }}>
            Send the ping
          </Text>
        </Pressable>

        {sent ? (
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              color: meta.color,
              fontSize: 13,
            }}
          >
            {sent}
          </Text>
        ) : null}
        {error ? (
          <Text style={{ marginTop: 10, color: "#FF6B6B", textAlign: "center" }}>
            {error}
          </Text>
        ) : null}

        <Text
          style={{
            marginTop: 28,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(244,244,246,0.4)",
          }}
        >
          RECENT SIGNALS
        </Text>
        {data.pings.length === 0 ? (
          <Text style={{ marginTop: 10, color: "rgba(244,244,246,0.45)" }}>
            No pings yet. Send one the next time they cross your mind in a meeting.
          </Text>
        ) : (
          <View style={{ marginTop: 12, gap: 8 }}>
            {data.pings.slice(0, 12).map((ping) => {
              const row = PING_KINDS.find((item) => item.id === ping.kind);
              const mine = ping.fromId === user?.id;
              const name = mine ? "You" : them;
              return (
                <View
                  key={ping.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: `${row?.color ?? "#FF6B9A"}22`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="heart" size={16} color={row?.color ?? "#FF6B9A"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#F4F4F6", fontWeight: "600" }}>
                      {name} · {row?.label}
                    </Text>
                    <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
                      {new Date(ping.createdAt).toLocaleString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </MiniChrome>
    </Screen>
  );
}
