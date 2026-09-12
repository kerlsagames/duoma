import { BackButton } from "@/components/ui/BackButton";
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
  headerRight?: ReactNode;
  /** Show a back control above the page header. Defaults to true. */
  showBack?: boolean;
  /** Defaults to true. Set false to lock the page to one screen. */
  scroll?: boolean;
};

export function HubScreen({
  kicker,
  title,
  body,
  children,
  tone = "default",
  headerRight,
  showBack = true,
  scroll = true,
}: Props) {
  const theme = HUB_TONES[tone];
  const serifTitle = tone !== "default";

  return (
    <Screen scroll={scroll} background={theme.background}>
      <View className={scroll ? "pt-4 pb-6" : "flex-1 pt-3 pb-3"}>
        {showBack ? (
          <BackButton
            color={theme.accent}
            style={{ marginBottom: scroll ? 14 : 8 }}
          />
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            style={{
              flex: 1,
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
          {headerRight}
        </View>
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
        <View className={`${title || body ? "mt-6" : "mt-3"}${scroll ? "" : " flex-1"}`}>
          {children}
        </View>
      </View>
    </Screen>
  );
}
