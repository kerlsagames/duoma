import { useHomeNotifications } from "@/components/home/useHomeNotifications";
import {
  dismissNotificationIds,
  notificationGoLabel,
} from "@/lib/notification-prefs";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";

const SWIPE = 110;
const SCREEN_W = Dimensions.get("window").width;

export function HomeNotificationCards({
  onStartSpicy,
}: {
  onStartSpicy: () => void;
}) {
  const { rows, prefs, persist, goTo, inbox } = useHomeNotifications(onStartSpicy);
  const pan = useRef(new Animated.ValueXY()).current;
  const current = rows[0] ?? null;
  const rest = rows.length - 1;

  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [current?.id, pan]);

  const flyOff = (dismiss: boolean) => {
    if (!current) return;
    Animated.timing(pan, {
      toValue: { x: dismiss ? -SCREEN_W * 1.2 : SCREEN_W * 1.2, y: 36 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      const item = current;
      pan.setValue({ x: 0, y: 0 });
      if (dismiss) {
        persist(dismissNotificationIds(prefs, [item.id]));
        return;
      }
      goTo(item.id, item.href);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -SWIPE) {
            flyOff(true);
            return;
          }
          if (gesture.dx > SWIPE) {
            flyOff(false);
            return;
          }
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: true,
          }).start();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id, prefs, rows.length]
  );

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });
  const goHint = pan.x.interpolate({
    inputRange: [16, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const clearHint = pan.x.interpolate({
    inputRange: [-120, -16],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (inbox !== "cards" || !current) return null;

  const size = Math.min(SCREEN_W - 56, 340);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        zIndex: 40,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "rgba(7,7,10,0.42)",
        }}
      />

      <Pressable
        onPress={() =>
          persist(dismissNotificationIds(prefs, rows.map((row) => row.id)))
        }
        accessibilityRole="button"
        accessibilityLabel="Clear all notifications"
        style={{
          marginBottom: 14,
          height: 36,
          paddingHorizontal: 16,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(18,18,24,0.92)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
          zIndex: 2,
        }}
      >
        <Text style={{ color: "#F4F4F6", fontSize: 13, fontWeight: "800" }}>
          Clear all
        </Text>
      </Pressable>

      <View style={{ width: size, height: size }}>
      {rest > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: 28,
            backgroundColor: "#1A1A22",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            transform: [{ translateY: 14 }, { scale: 0.94 }],
            opacity: 0.7,
          }}
        />
      ) : null}

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: size,
          height: size,
          borderRadius: 28,
          backgroundColor: "#121218",
          borderWidth: 1.5,
          borderColor: "rgba(255,0,127,0.45)",
          padding: 22,
          transform: [...pan.getTranslateTransform(), { rotate }],
          shadowColor: "#FF007F",
          shadowOpacity: 0.28,
          shadowRadius: 24,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            opacity: goHint,
            borderWidth: 2,
            borderColor: "#7CFFB2",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 4,
            transform: [{ rotate: "-12deg" }],
          }}
        >
          <Text style={{ color: "#7CFFB2", fontWeight: "800", fontSize: 12 }}>
            OPEN
          </Text>
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            opacity: clearHint,
            borderWidth: 2,
            borderColor: "#FF8AB8",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 4,
            transform: [{ rotate: "12deg" }],
          }}
        >
          <Text style={{ color: "#FF8AB8", fontWeight: "800", fontSize: 12 }}>
            CLEAR
          </Text>
        </Animated.View>

        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            color: "#FF007F",
          }}
        >
          {rest > 0 ? `${rows.length} waiting` : "Just this"}
        </Text>
        <Text
          style={{
            marginTop: 16,
            color: "#F4F4F6",
            fontSize: 22,
            fontWeight: "700",
            lineHeight: 28,
          }}
        >
          {current.line}
        </Text>
        <Text
          style={{
            marginTop: 10,
            color: "rgba(244,244,246,0.5)",
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          {current.when}
        </Text>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => goTo(current.id, current.href)}
          accessibilityRole="button"
          accessibilityLabel={notificationGoLabel(current.id)}
          style={{
            minHeight: 52,
            borderRadius: 16,
            backgroundColor: "#FF007F",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
            {notificationGoLabel(current.id)}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </Pressable>
        <Text
          style={{
            marginTop: 12,
            textAlign: "center",
            color: "rgba(244,244,246,0.45)",
            fontSize: 12,
            lineHeight: 17,
          }}
        >
          Swipe left to clear. Swipe right or tap through to act. Home stays
          behind the card.
        </Text>
      </Animated.View>
      </View>
    </View>
  );
}
