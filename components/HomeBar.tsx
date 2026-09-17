import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedbackSheet } from "@/components/FeedbackSheet";
import { HomeCountdownTicker } from "@/components/home/HomeCountdownTicker";
import { feedbackSourceFromPath } from "@/lib/feedback";
import { requestHomeSettings, requestHomeStats } from "@/lib/home-chrome";

type IconName = ComponentProps<typeof Ionicons>["name"];

const HIDDEN = new Set([
  "/welcome",
  "/login",
  "/create",
  "/join",
  "/check-email",
  "/waiting",
  "/admin",
  "/banned",
]);

function isHomePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/index" ||
    pathname === "/(tabs)" ||
    pathname === "/(tabs)/index"
  );
}

function BarButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 2,
        minWidth: 64,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={24} color="#FF007F" />
      <Text
        style={{
          marginTop: 2,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.4,
          color: "#FF007F",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function HomeBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const atHome = isHomePath(pathname);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const source = feedbackSourceFromPath(pathname);

  if (HIDDEN.has(pathname)) return null;

  return (
    <View
      style={{
        backgroundColor: "#07070A",
        borderTopColor: "rgba(255,0,127,0.35)",
        borderTopWidth: 1,
        paddingTop: atHome ? 6 : 8,
        paddingBottom: Math.max(insets.bottom, 8),
        shadowColor: "#FF007F",
        shadowOpacity: 0.35,
        shadowRadius: 16,
      }}
    >
      {atHome ? <HomeCountdownTicker /> : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
        }}
      >
        {atHome ? (
          <BarButton
            icon="settings-outline"
            label="Settings"
            onPress={() => requestHomeSettings()}
          />
        ) : (
          <BarButton
            icon="chevron-back"
            label="Back"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/");
            }}
          />
        )}

        <BarButton icon="home" label="Home" onPress={() => router.replace("/")} />

        {atHome ? (
          <BarButton
            icon="bar-chart"
            label="Stats"
            onPress={() => requestHomeStats()}
          />
        ) : (
          <Pressable
            onPress={() => setFeedbackOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Send feedback"
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 2,
              minWidth: 64,
            }}
          >
            <Text style={{ fontSize: 22, lineHeight: 26 }}>✉️</Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.4,
                color: "#FF007F",
              }}
            >
              Note
            </Text>
          </Pressable>
        )}
      </View>
      <FeedbackSheet
        open={feedbackOpen}
        source={source}
        onClose={() => setFeedbackOpen(false)}
      />
    </View>
  );
}
