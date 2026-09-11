import { Screen } from "@/components/ui/Screen";
import { HUB_TONES, SERIF, type HubTone } from "@/lib/app-themes";
import { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  kicker: string;
  title?: string;
  body?: string;
  children: ReactNode;
  tone?: HubTone;
};

export function HubScreen({ kicker, title, body, children, tone = "default" }: Props) {
  const theme = HUB_TONES[tone];
  const serifTitle = tone !== "default";

  return (
    <Screen scroll background={theme.background}>
      <View className="pt-4 pb-6">
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 3,
            textTransform: "uppercase",
            color: theme.kicker,
            fontFamily: tone === "talk" ? "SpaceMono" : undefined,
          }}
        >
          {kicker}
        </Text>
        {title ? (
          <Text
            style={{
              marginTop: 10,
              fontSize: serifTitle ? 34 : 32,
              fontWeight: serifTitle ? "500" : "700",
              color: theme.ink,
              fontFamily: serifTitle ? SERIF : undefined,
              lineHeight: serifTitle ? 40 : 38,
            }}
          >
            {title}
          </Text>
        ) : null}
        {body ? (
          <Text
            style={{
              marginTop: 10,
              fontSize: 16,
              lineHeight: 24,
              color: theme.muted,
              fontFamily: serifTitle ? SERIF : undefined,
            }}
          >
            {body}
          </Text>
        ) : null}
        <View className={title || body ? "mt-6" : "mt-3"}>{children}</View>
      </View>
    </Screen>
  );
}
