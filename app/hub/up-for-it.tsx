import { SpicyDarePanel } from "@/components/hub/SpicyDarePanel";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF, UP_FOR_IT_TONE } from "@/lib/app-themes";
import { Text, View } from "react-native";

const T = UP_FOR_IT_TONE;

export default function UpForItScreen() {
  return (
    <Screen scroll background={T.background}>
      <View className="pt-4 pb-8">
        <BackButton color={T.accent} style={{ marginBottom: 12 }} />
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Up for it
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
          Pick a vibe. Spin one. Send it.
        </Text>

        <View className="mt-6">
          <SpicyDarePanel mode="page" />
        </View>
      </View>
    </Screen>
  );
}
