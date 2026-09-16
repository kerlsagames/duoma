import { LookPanel, SettingsCog } from "@/components/hub/AppSettings";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { worldById, type WorldId } from "@/lib/worlds";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function WorldShell({
  worldId,
  background,
  children,
  footer,
}: {
  worldId: WorldId;
  background: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const router = useRouter();
  const world = worldById(worldId);
  const fallback = world?.accent ?? "#F4F4F6";
  const look = useAppLook(`world-${worldId}`, fallback, {
    hideTagline: false,
    compact: false,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Screen background={background} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 4,
            gap: 8,
          }}
        >
          <BackButton color={look.accent} fallback={"/(tabs)" as Href} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={() => router.push("/hub/worlds" as Href)}
              accessibilityLabel="Change shared world"
              style={{
                height: 36,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.16)",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <Ionicons
                name="swap-horizontal"
                size={16}
                color="rgba(244,244,246,0.75)"
              />
              <Text
                style={{
                  color: "rgba(244,244,246,0.75)",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                Worlds
              </Text>
            </Pressable>
            <SettingsCog
              accent={look.accent}
              open={settingsOpen}
              onToggle={() => setSettingsOpen((open) => !open)}
              label={world?.label ?? "World"}
            />
          </View>
        </View>
        {settingsOpen ? (
          <LookPanel
            look={look}
            ink="#F4F4F6"
            muted="rgba(244,244,246,0.55)"
            toggles={[
              {
                key: "hideTagline",
                label: "Hide the tagline",
                hint: "Name only at the top.",
              },
              {
                key: "compact",
                label: "Compact header",
                hint: "Smaller world title.",
              },
            ]}
          />
        ) : (
          <>
            <Text
              style={{
                marginTop: 8,
                fontFamily: "SpaceMono",
                fontSize: 10,
                letterSpacing: 2,
                color: look.accent,
              }}
            >
              {world?.style.toUpperCase()}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontFamily: SERIF,
                fontSize: look.prefs.compact ? 22 : 28,
                color: "#F4F4F6",
              }}
            >
              {world?.label}
            </Text>
            {look.prefs.hideTagline ? null : (
              <Text
                style={{
                  marginTop: 4,
                  color: "rgba(244,244,246,0.55)",
                  fontSize: 14,
                }}
              >
                {world?.tagline}
              </Text>
            )}
            <View style={{ flex: 1, marginTop: 12 }}>{children}</View>
            {footer}
          </>
        )}
      </View>
    </Screen>
  );
}
