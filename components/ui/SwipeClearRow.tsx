import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Animated, PanResponder, Pressable, Text, View } from "react-native";

const THRESHOLD = 88;

export function ClearAllBar({
  count,
  label = "Clear all",
  onClear,
  ink = "#F4F4F6",
  muted = "rgba(244,244,246,0.55)",
}: {
  count: number;
  label?: string;
  onClear: () => void;
  ink?: string;
  muted?: string;
}) {
  if (count <= 0) return null;
  return (
    <View
      style={{
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text style={{ flex: 1, color: muted, fontSize: 13, lineHeight: 18 }}>
        Swipe left or tap the × to drop one. {label} wipes this list.
      </Text>
      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          height: 36,
          paddingHorizontal: 14,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: ink, fontSize: 13, fontWeight: "800" }}>{label}</Text>
      </Pressable>
    </View>
  );
}

export function SwipeClearRow({
  children,
  onClear,
  disabled = false,
  ink = "#F4F4F6",
}: {
  children: ReactNode;
  onClear: () => void;
  disabled?: boolean;
  ink?: string;
}) {
  const pan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pan.setValue(0);
  }, [pan]);

  const flyOff = () => {
    Animated.timing(pan, {
      toValue: -420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      pan.setValue(0);
      onClear();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          if (disabled) return;
          pan.setValue(Math.min(0, gesture.dx));
        },
        onPanResponderRelease: (_, gesture) => {
          if (disabled) return;
          if (gesture.dx < -THRESHOLD) {
            flyOff();
            return;
          }
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true,
          }).start();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, onClear]
  );

  if (disabled) return <>{children}</>;

  return (
    <View style={{ overflow: "hidden", borderRadius: 20 }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 108,
          backgroundColor: "#C62828",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#FFF6F4", fontWeight: "800", fontSize: 12 }}>
          Remove
        </Text>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX: pan }] }}
      >
        <View>
          {children}
          <Pressable
            onPress={flyOff}
            accessibilityRole="button"
            accessibilityLabel="Remove"
            hitSlop={8}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "rgba(8,8,12,0.45)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={16} color={ink} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
