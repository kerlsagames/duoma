import { LookPanel } from "@/components/hub/AppSettings";
import { Stage, TwinkleSky } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { formatDateAndTime } from "@/lib/dates";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { PING_KINDS, type PingKind } from "@/lib/mini-content";
import { themLabel } from "@/lib/names";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

const BG = "#05020C";
const FINGERPRINT = require("../../assets/images/fingerprint-ping.jpg");

const noSelectText: TextStyle = {
  userSelect: "none",
  ...(Platform.OS === "web"
    ? ({
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      } as TextStyle)
    : null),
};

const noSelectView: ViewStyle =
  Platform.OS === "web"
    ? ({
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      } as ViewStyle)
    : {};

export default function ThoughtPingsScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [kind, setKind] = useState<PingKind>("heart");
  const look = useAppLook("thought-pings", "#FF6B9A", {
    softHaptic: false,
    fewerStars: false,
  });
  const [pressed, setPressed] = useState(false);
  const [burst, setBurst] = useState(false);
  const [openPingId, setOpenPingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const boom = useRef(new Animated.Value(0)).current;
  const them = themLabel(partner);
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
      await Haptics.impactAsync(
        look.prefs.softHaptic
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Heavy
      );
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
    <Screen scroll background={BG} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <Stage
        background={BG}
        fallback={"/hub/connect" as Href}
        accent={look.accent}
        settingsLabel="Thought pings"
        settings={
          <LookPanel
            look={look}
            ink="#FFD6E6"
            muted="rgba(255,214,230,0.65)"
            pageColor={BG}
            toggles={[
              {
                key: "softHaptic",
                label: "Soft buzz",
                hint: "A lighter tap when you send.",
              },
              {
                key: "fewerStars",
                label: "Fewer stars",
                hint: "A quieter night sky behind the fingerprint.",
              },
            ]}
          />
        }
      >
        <View
          style={{
            marginTop: 4,
            height: 420,
            borderRadius: 28,
            overflow: "hidden",
            backgroundColor: "#0A0614",
            ...noSelectView,
          }}
        >
          <LinearGradient
            colors={["#12061C", "#05020C", "#1A0820"]}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TwinkleSky count={look.prefs.fewerStars ? 12 : 36} />
            <Text
              selectable={false}
              style={[
                {
                  position: "absolute",
                  top: 22,
                  fontFamily: HANDWRITING,
                  fontSize: 22,
                  color: "rgba(255,214,230,0.7)",
                },
                noSelectText,
              ]}
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
              delayLongPress={10_000}
              // @ts-expect-error web-only: block native long-press menus / selection
              onContextMenu={(e: { preventDefault?: () => void }) => e.preventDefault?.()}
              style={[{ alignItems: "center" }, noSelectView]}
            >
              <View
                pointerEvents="box-none"
                style={{
                  width: 168,
                  height: 168,
                  borderRadius: 84,
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: meta.color,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  shadowColor: meta.color,
                  shadowOpacity: 0.45,
                  shadowRadius: 18,
                  backgroundColor: "#D8D8D8",
                }}
              >
                <Image
                  source={FINGERPRINT}
                  accessibilityLabel="Fingerprint send"
                  style={{
                    width: 168,
                    height: 168,
                    ...(Platform.OS === "web"
                      ? ({
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          WebkitTouchCallout: "none",
                        } as object)
                      : null),
                  }}
                  resizeMode="cover"
                />
              </View>
              <Text
                selectable={false}
                style={[
                  {
                    marginTop: 14,
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    color: "#F3E4EA",
                  },
                  noSelectText,
                ]}
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
                  selectable={false}
                  style={[
                    {
                      fontFamily: SERIF,
                      fontSize: 22,
                      color: meta.color,
                    },
                    noSelectText,
                  ]}
                >
                  {meta.label}
                </Text>
              </View>
              <Text
                selectable={false}
                style={[
                  {
                    marginTop: 4,
                    color: "rgba(255,230,240,0.55)",
                    fontSize: 13,
                  },
                  noSelectText,
                ]}
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
          selectable={false}
          style={[
            {
              marginTop: 10,
              textAlign: "center",
              color: "rgba(255,230,240,0.5)",
              fontFamily: HANDWRITING,
              fontSize: 18,
            },
            noSelectText,
          ]}
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
              selectable={false}
              style={[
                {
                  textAlign: "center",
                  color: "rgba(255,230,240,0.35)",
                  fontFamily: SERIF,
                  fontSize: 16,
                },
                noSelectText,
              ]}
            >
              The sky is empty. First ping is always a little shy.
            </Text>
          ) : (
            data.pings.slice(0, 8).map((ping, i) => {
              const row = PING_KINDS.find((item) => item.id === ping.kind);
              const mine = ping.fromId === user?.id;
              const when = formatDateAndTime(ping.createdAt);
              const open = openPingId === ping.id;
              return (
                <Pressable
                  key={ping.id}
                  onPress={() =>
                    setOpenPingId((current) =>
                      current === ping.id ? null : ping.id
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${mine ? "you" : them} sent ${row?.label ?? "a ping"} ${when}`}
                  style={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                    gap: 4,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: open
                      ? "rgba(255,107,154,0.12)"
                      : "rgba(255,214,230,0.05)",
                    transform: [{ rotate: i % 2 === 0 ? "1.5deg" : "-2deg" }],
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons
                      name={row?.icon ?? "heart"}
                      size={18}
                      color={row?.color ?? "#FF6B9A"}
                    />
                    <Text
                      selectable={false}
                      style={[
                        { color: row?.color ?? "#FF6B9A", fontFamily: SERIF },
                        noSelectText,
                      ]}
                    >
                      {mine ? "you" : them} · {row?.label.toLowerCase()}
                    </Text>
                  </View>
                  <Text
                    selectable={false}
                    style={[
                      {
                        color: "rgba(255,214,230,0.78)",
                        fontSize: 12,
                        fontFamily: "SpaceMono",
                        paddingLeft: 26,
                      },
                      noSelectText,
                    ]}
                  >
                    sent {when}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </Stage>
    </Screen>
  );
}
