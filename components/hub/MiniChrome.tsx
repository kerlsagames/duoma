import { BackButton } from "@/components/ui/BackButton";
import { SERIF } from "@/lib/app-themes";
import type { Href } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export function MiniChrome({
  accent,
  fallback,
  kicker,
  title,
  body,
  ready = true,
  children,
  headerRight,
}: {
  accent: string;
  fallback: Href;
  kicker: string;
  title: string;
  body?: string;
  ready?: boolean;
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  return (
    <View className="pt-4 pb-12">
      <BackButton color={accent} fallback={fallback} style={{ marginBottom: 14 }} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {kicker}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 32,
              lineHeight: 38,
              color: "#F4F4F6",
            }}
          >
            {title}
          </Text>
          {body ? (
            <Text
              style={{
                marginTop: 8,
                fontSize: 15,
                lineHeight: 22,
                color: "rgba(244,244,246,0.58)",
              }}
            >
              {body}
            </Text>
          ) : null}
        </View>
        {headerRight}
      </View>
      {!ready ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator color={accent} />
        </View>
      ) : (
        children
      )}
    </View>
  );
}

export function EmptyHint({ text }: { text: string }) {
  return (
    <View
      style={{
        marginTop: 18,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(244,244,246,0.18)",
      }}
    >
      <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 14, lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}
