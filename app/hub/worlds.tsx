import { LookPanel, SettingsDock } from "@/components/hub/AppSettings";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { WORLDS, worldById, type WorldId } from "@/lib/worlds";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function WorldsScreen() {
  const router = useRouter();
  const { data, patch } = useMiniApps();
  const current = data.worldChoice.worldId;
  const [picked, setPicked] = useState<WorldId | null>(current);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const look = useAppLook("worlds", "#C9A0DC", {
    hideLockedHint: false,
    compact: false,
  });

  useEffect(() => {
    if (current) setPicked(current);
  }, [current]);

  const lockIn = async () => {
    if (!picked) return;
    await patch((state) => ({
      ...state,
      worldChoice: { worldId: picked, lockedAt: nowIso() },
    }));
    const world = worldById(picked);
    router.replace((world?.href ?? "/(tabs)") as Href);
  };

  return (
    <Screen scroll background="#0C0E14" density={look.prefs.density} typeface={look.prefs.typeface} accent={look.accent}>
      <SettingsDock
        accent={look.accent}
        fallback={"/(tabs)" as Href}
        open={settingsOpen}
        onToggle={() => setSettingsOpen((open) => !open)}
        label="Shared world"
      />
      {settingsOpen ? (
        <LookPanel
          look={look}
          ink="#F4F4F6"
          muted="rgba(244,244,246,0.55)"
          toggles={[
            {
              key: "hideLockedHint",
              label: "Hide unlock hints",
              hint: "Just the world names.",
            },
            {
              key: "compact",
              label: "Compact cards",
              hint: "Less story under each world.",
            },
          ]}
        />
      ) : null}
      <Text
        style={{
          marginTop: 8,
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2,
          color: "rgba(201,160,220,0.7)",
        }}
      >
        CHOOSE YOUR SHARED WORLD
      </Text>
      <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 32, color: "#F4F4F6" }}>
        How do you want to watch your story grow?
      </Text>
      <Text style={{ marginTop: 8, color: "rgba(244,244,246,0.55)", fontSize: 15, lineHeight: 22 }}>
        Every connection builds this universe. Pick a style together. You can change it
        anytime — both phones follow the same world.
      </Text>

      <View style={{ marginTop: 18, gap: 12 }}>
        {WORLDS.map((world) => {
          const on = picked === world.id;
          return (
            <Pressable
              key={world.id}
              onPress={() => setPicked(world.id)}
              style={{
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: on ? world.accent : "rgba(244,244,246,0.1)",
                backgroundColor: on ? world.accentSoft : "#14141A",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${world.accent}22`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={world.icon} size={20} color={world.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 10,
                      color: world.accent,
                    }}
                  >
                    OPTION {world.option}
                  </Text>
                  <Text style={{ color: "#F4F4F6", fontWeight: "800", fontSize: 17 }}>
                    {world.label}
                  </Text>
                </View>
                <Ionicons
                  name={on ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={on ? world.accent : "rgba(244,244,246,0.3)"}
                />
              </View>
              <Text style={{ marginTop: 8, color: world.accent, fontSize: 13 }}>
                {world.tagline}
              </Text>
              <Text style={{ marginTop: 4, color: "rgba(244,244,246,0.42)", fontSize: 12 }}>
                {world.style}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: "rgba(244,244,246,0.68)",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {world.expect}
              </Text>
              <Text style={{ marginTop: 8, color: "rgba(244,244,246,0.45)", fontSize: 12 }}>
                Best for: {world.bestFor}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => void lockIn()}
        disabled={!picked}
        style={{
          marginTop: 18,
          height: 52,
          borderRadius: 14,
          backgroundColor: picked ? "#7CFFB2" : "rgba(124,255,178,0.25)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#102018", fontWeight: "800" }}>Lock in our world</Text>
      </Pressable>
      <Text
        style={{
          marginTop: 10,
          marginBottom: 20,
          textAlign: "center",
          color: "rgba(244,244,246,0.4)",
          fontSize: 12,
        }}
      >
        Both of you see this world on Home after you lock it.
      </Text>
    </Screen>
  );
}
