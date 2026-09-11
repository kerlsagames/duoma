import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { hubById, type HubId } from "@/lib/hubs";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

/** Lightweight placeholder for features that aren't built yet. */
export function ComingSoonScreen({
  title,
  detail,
  hubId,
  icon = "construct",
  accent = "#FF6B9A",
}: {
  title: string;
  detail: string;
  hubId: HubId;
  icon?: ComponentProps<typeof Ionicons>["name"];
  accent?: string;
}) {
  const hub = hubById(hubId);
  const color = accent || hub?.accent || "#FF6B9A";

  return (
    <Screen scroll background="#0B0B0E">
      <View className="pt-4 pb-10">
        <BackButton
          color={color}
          fallback={(hub?.href ?? "/") as Href}
          style={{ marginBottom: 18 }}
        />
        <View
          style={{
            marginTop: 40,
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: `${color}22`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Ionicons name={icon} size={34} color={color} />
          </View>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color,
              marginBottom: 8,
            }}
          >
            Coming soon
          </Text>
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              lineHeight: 34,
              color: "#F4F4F6",
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontFamily: SERIF,
              fontSize: 16,
              lineHeight: 24,
              color: "rgba(244,244,246,0.58)",
              textAlign: "center",
            }}
          >
            {detail}
          </Text>
          {hub ? (
            <Text
              style={{
                marginTop: 28,
                fontSize: 13,
                color: "rgba(244,244,246,0.4)",
                textAlign: "center",
              }}
            >
              Lives in the {hub.label} hub — we&apos;ll build this next.
            </Text>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
