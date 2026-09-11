import { SpicyDarePanel } from "@/components/hub/SpicyDarePanel";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF, UP_FOR_IT_TONE } from "@/lib/app-themes";
import { useCallback, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const T = UP_FOR_IT_TONE;

export default function UpForItScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [focused, setFocused] = useState(false);
  const innerBack = useRef<(() => boolean) | null>(null);
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  return (
    <Screen scroll background={T.background} scrollRef={scrollRef}>
      <View className="pt-4 pb-8">
        <BackButton
          color={T.accent}
          fallback="/hub/play"
          style={{ marginBottom: focused ? 8 : 12 }}
          onPress={() => innerBack.current?.() ?? false}
        />
        {!focused ? (
          <>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 12,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: T.accent,
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

        <View className={focused ? "mt-1" : "mt-6"}>
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
