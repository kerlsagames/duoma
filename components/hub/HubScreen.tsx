import { SettingsCog } from "@/components/hub/AppSettings";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { HUB_TONES, SERIF, type HubTone } from "@/lib/app-themes";
import {
  densityLook,
  typefaceFamily,
  type DensityId,
  type TypefaceId,
} from "@/lib/app-prefs";
import { sameHex, tintCanvas } from "@/lib/color-paint";
import { ReactNode, useState } from "react";
import { Text, View } from "react-native";

type LookBits = {
  accent: string;
  look: ReturnType<typeof densityLook>;
  fontFamily?: string;
  prefs: { accent: string; density: DensityId; typeface?: TypefaceId };
};

type Props = {
  kicker: string;
  title?: string;
  body?: string;
  children: ReactNode;
  tone?: HubTone;
  headerRight?: ReactNode;
  settings?: ReactNode;
  settingsLabel?: string;
  /** Show a back control above the page header. Defaults to true. */
  showBack?: boolean;
  /** Defaults to true. Set false to lock the page to one screen. */
  scroll?: boolean;
  /** Override the tone accent (and kicker) with a hub colour. */
  accent?: string;
  look?: LookBits;
  /** Pull the header up and shrink it so more of the page fits. */
  compactHeader?: boolean;
};

export function HubScreen({
  kicker,
  title,
  body,
  children,
  tone = "default",
  headerRight,
  settings,
  settingsLabel,
  showBack = true,
  scroll = true,
  accent,
  look,
  compactHeader = false,
}: Props) {
  const theme = HUB_TONES[tone];
  const serifTitle = tone !== "default";
  const color = look?.accent ?? accent ?? theme.accent;
  const density = look?.prefs.density ?? "regular";
  const typeface = look?.prefs.typeface ?? "sans";
  const sizes = look?.look ?? densityLook(density);
  const fontFamily =
    look?.fontFamily ??
    typefaceFamily(typeface) ??
    (serifTitle ? SERIF : undefined);
  const storedColour = look?.prefs.accent?.trim() ?? "";
  const customColour = Boolean(
    storedColour && !sameHex(storedColour, theme.accent)
  );
  const background = customColour
    ? tintCanvas(theme.background, storedColour, 0.58)
    : theme.background;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const cog = settings ? (
    <SettingsCog
      accent={color}
      open={settingsOpen}
      onToggle={() => setSettingsOpen((open) => !open)}
      label={settingsLabel ?? title ?? kicker}
    />
  ) : null;
  const trailing =
    cog && headerRight ? (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {headerRight}
        {cog}
      </View>
    ) : cog ?? headerRight;

  return (
    <Screen
      scroll={scroll}
      background={background}
      density={density}
      typeface={typeface}
    >
      <View className={scroll ? (compactHeader ? "pt-2 pb-4" : "pt-4 pb-6") : "flex-1 pt-3 pb-3"}>
        {showBack ? (
          <BackButton
            color={color}
            style={{ marginBottom: compactHeader ? 4 : scroll ? sizes.gap + 2 : 8 }}
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
              fontSize: compactHeader ? (title ? 11 : 20) : 12,
              fontWeight: compactHeader && !title ? "700" : "600",
              letterSpacing: compactHeader && !title ? 0.4 : 3,
              textTransform: compactHeader && !title ? "none" : "uppercase",
              color,
              fontFamily:
                typeface === "sans" && tone === "talk" ? "SpaceMono" : fontFamily,
            }}
          >
            {kicker}
          </Text>
          {trailing}
        </View>
        {title ? (
          <Text
            style={{
              marginTop: compactHeader ? 4 : sizes.gap,
              fontSize: compactHeader ? Math.min(sizes.title, 24) : sizes.title,
              fontWeight: serifTitle ? "500" : "700",
              color: theme.ink,
              fontFamily: serifTitle && typeface === "sans" ? SERIF : fontFamily,
              lineHeight: compactHeader
                ? Math.min(sizes.titleLine, 28)
                : sizes.titleLine,
            }}
          >
            {title}
          </Text>
        ) : null}
        {body ? (
          <Text
            style={{
              marginTop: sizes.gap,
              fontSize: sizes.body + 1,
              lineHeight: sizes.bodyLine + 2,
              color: theme.muted,
              fontFamily,
            }}
          >
            {body}
          </Text>
        ) : null}
        <View
          className={`${title || body ? (compactHeader ? "mt-3" : "mt-6") : "mt-3"}${scroll ? "" : " flex-1"}`}
        >
          {settingsOpen && settings ? settings : children}
        </View>
      </View>
    </Screen>
  );
}
