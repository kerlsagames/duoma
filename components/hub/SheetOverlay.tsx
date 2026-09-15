import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SheetOverlay({
  kicker,
  title,
  onClose,
  children,
  background,
  ink,
  muted,
}: {
  kicker: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  background: string;
  ink: string;
  muted: string;
}) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        justifyContent: "flex-end",
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(8,8,6,0.78)",
        }}
      />
      <View
        pointerEvents="auto"
        style={{
          width: "100%",
          maxHeight: "88%",
          zIndex: 1,
          backgroundColor: background,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 18,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                color: muted,
              }}
            >
              {kicker}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 22, fontWeight: "700", color: ink }}>
              {title}
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close sheet">
            <Ionicons name="close" size={22} color={ink} />
          </Pressable>
        </View>
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
