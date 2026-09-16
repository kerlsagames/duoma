import { LookPanel, SettingsCog } from "@/components/hub/AppSettings";
import { SpicyDarePanel } from "@/components/hub/SpicyDarePanel";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF, UP_FOR_IT_TONE } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { useCallback, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const T = UP_FOR_IT_TONE;

export default function UpForItScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [focused, setFocused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const look = useAppLook("up-for-it", T.accent, {
    hideIntro: false,
    compact: false,
  });
  const innerBack = useRef<(() => boolean) | null>(null);
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  return (
    <Screen scroll background={T.background} scrollRef={scrollRef} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <View className="pt-4 pb-8">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: focused ? 8 : 12,
          }}
        >
          <BackButton
            color={look.accent}
            fallback="/hub/play"
            onPress={() => innerBack.current?.() ?? false}
          />
          {focused ? null : (
            <SettingsCog
              accent={look.accent}
              open={settingsOpen}
              onToggle={() => setSettingsOpen((open) => !open)}
              label="Dare Me"
            />
          )}
        </View>
        {settingsOpen && !focused ? (
          <LookPanel
            look={look}
            ink={T.ink}
            muted={T.muted}
            toggles={[
              {
                key: "hideIntro",
                label: "Skip the intro blurb",
                hint: "Straight to send / take a dare.",
              },
              {
                key: "compact",
                label: "Compact packs",
                hint: "Less air above the dare list.",
              },
            ]}
          />
        ) : null}
        {!focused && !look.prefs.hideIntro && !settingsOpen ? (
          <>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 12,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: look.accent,
              }}
            >
              Dare Me
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 34,
                lineHeight: 40,
                color: T.ink,
              }}
            >
              Challenges & Dares
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 16,
                lineHeight: 24,
                color: T.muted,
              }}
            >
              Send a dare, see what you sent, or open what they sent you.
            </Text>
          </>
        ) : null}

        <View className={focused || look.prefs.compact ? "mt-1" : "mt-6"}>
          <SpicyDarePanel
            mode="page"
            onNavigate={scrollToTop}
            onViewChange={(view) => setFocused(view !== "hub")}
            onBindBack={(fn) => {
              innerBack.current = fn;
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
