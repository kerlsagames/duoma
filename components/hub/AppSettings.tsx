import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { BackButton } from "@/components/ui/BackButton";
import { SERIF } from "@/lib/app-themes";
import {
  DENSITY_OPTIONS,
  TYPEFACE_OPTIONS,
  densityLook,
  type DensityId,
  type TypefaceId,
} from "@/lib/app-prefs";
import { hexAlpha, luminance, parseHex } from "@/lib/color-paint";
import { HUB_COLOR_SWATCHES } from "@/lib/hub-theme";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

function wash(ink: string, alpha: number) {
  return hexAlpha(ink, alpha);
}

function onAccent(accent: string) {
  const rgb = parseHex(accent);
  if (!rgb) return "#161018";
  return luminance(rgb) > 0.48 ? "#161018" : "#F6F3F0";
}

/** Ink that stays readable on a settings panel sitting on `canvas`. */
export function settingsInk(canvas: string) {
  const rgb = parseHex(canvas);
  if (rgb && luminance(rgb) > 0.42) {
    return { ink: "#1A1410", muted: "rgba(26,20,16,0.62)" };
  }
  return { ink: "#F6EFE2", muted: "rgba(246,239,226,0.72)" };
}

export function SettingsCog({
  accent,
  open,
  onToggle,
  label,
}: {
  accent: string;
  open: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={open ? `Close ${label}` : `${label} settings`}
      hitSlop={8}
      style={{
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: hexAlpha(accent, 0.16),
        borderWidth: 1,
        borderColor: hexAlpha(accent, 0.35),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name={open ? "close" : "settings-outline"}
        size={20}
        color={accent}
      />
    </Pressable>
  );
}

export function SettingsDock({
  accent,
  fallback,
  open,
  onToggle,
  label,
  style,
}: {
  accent: string;
  fallback?: Href;
  open: boolean;
  onToggle: () => void;
  label: string;
  style?: object;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
        ...style,
      }}
    >
      <BackButton color={accent} fallback={fallback} />
      <SettingsCog
        accent={accent}
        open={open}
        onToggle={onToggle}
        label={label}
      />
    </View>
  );
}

export function PrefSection({
  label,
  hint,
  ink,
  muted,
  children,
}: {
  label: string;
  hint?: string;
  ink: string;
  muted: string;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: muted,
        }}
      >
        {label}
      </Text>
      {hint ? (
        <Text
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontSize: 14,
            lineHeight: 20,
            color: muted,
          }}
        >
          {hint}
        </Text>
      ) : null}
      <View style={{ marginTop: 10 }}>{children}</View>
    </View>
  );
}

export function PrefColor({
  value,
  fallback,
  originalColor,
  onChange,
  ink,
}: {
  value: string;
  fallback: string;
  originalColor?: string;
  onChange: (hex: string) => void;
  ink: string;
}) {
  const current = value.trim() || fallback;
  const matchingOriginal = !value.trim();
  const originalSwatch = originalColor || fallback;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Pressable
        onPress={() => onChange("")}
        accessibilityLabel="Original colour"
        style={{
          height: 36,
          paddingLeft: 6,
          paddingRight: 12,
          borderRadius: 18,
          borderWidth: matchingOriginal ? 2 : 1,
          borderColor: matchingOriginal ? ink : wash(ink, 0.22),
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          backgroundColor: wash(ink, 0.08),
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: originalSwatch,
            borderWidth: 1,
            borderColor: wash(ink, 0.35),
          }}
        />
        <Text style={{ color: ink, fontSize: 13, fontWeight: "700" }}>Original</Text>
      </Pressable>
      {HUB_COLOR_SWATCHES.map((swatch) => {
        const on =
          !matchingOriginal && swatch.hex.toUpperCase() === current.toUpperCase();
        return (
          <Pressable
            key={swatch.id}
            onPress={() => onChange(swatch.hex)}
            accessibilityLabel={swatch.label}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: swatch.hex,
              borderWidth: on ? 2 : 1,
              borderColor: on ? ink : wash(ink, 0.22),
            }}
          />
        );
      })}
    </View>
  );
}

export function PrefDensity({
  value,
  onChange,
  accent,
  ink,
}: {
  value: DensityId;
  onChange: (id: DensityId) => void;
  accent: string;
  ink: string;
}) {
  const sample = densityLook(value);
  const chipSize: Record<DensityId, number> = {
    compact: 12,
    regular: 15,
    roomy: 19,
  };
  const currentLabel =
    DENSITY_OPTIONS.find((row) => row.id === value)?.label.toLowerCase() ?? "regular";
  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {DENSITY_OPTIONS.map((option) => {
          const on = option.id === value;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              accessibilityLabel={`${option.label} type`}
              style={{
                minHeight: 52,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: on ? accent : wash(ink, 0.08),
                borderWidth: 1,
                borderColor: on ? accent : wash(ink, 0.16),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: on ? onAccent(accent) : ink,
                  fontSize: chipSize[option.id],
                  fontWeight: "700",
                  lineHeight: chipSize[option.id] + 6,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text
        style={{
          marginTop: 12,
          fontFamily: SERIF,
          fontSize: sample.body,
          lineHeight: sample.bodyLine,
          color: ink,
        }}
      >
        This is how writing looks with {currentLabel} type.
      </Text>
    </View>
  );
}

export function PrefChoices<T extends string>({
  value,
  options,
  onChange,
  accent,
  ink,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  accent: string;
  ink: string;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => {
        const on = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={{
              height: 36,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: on ? accent : wash(ink, 0.08),
              borderWidth: 1,
              borderColor: on ? accent : wash(ink, 0.16),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: on ? onAccent(accent) : ink,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PrefToggle({
  on,
  label,
  hint,
  accent,
  ink,
  muted,
  onToggle,
}: {
  on: boolean;
  label: string;
  hint?: string;
  accent: string;
  ink: string;
  muted: string;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: wash(ink, 0.07),
        borderWidth: 1,
        borderColor: wash(ink, 0.14),
      }}
    >
      <View
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          padding: 3,
          backgroundColor: on ? accent : wash(ink, 0.18),
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#fff",
            alignSelf: on ? "flex-end" : "flex-start",
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: ink, fontSize: 15, fontWeight: "700" }}>
          {label}
        </Text>
        {hint ? (
          <Text style={{ marginTop: 3, color: muted, fontSize: 12, lineHeight: 16 }}>
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function AppSettingsPanel({
  accent,
  fallbackAccent,
  ink,
  muted,
  density,
  typeface,
  storedAccent,
  onAccent,
  onDensity,
  onTypeface,
  onReset,
  children,
  hideDensity,
  originalColor,
}: {
  accent: string;
  fallbackAccent: string;
  ink: string;
  muted: string;
  density: DensityId;
  typeface: TypefaceId;
  storedAccent: string;
  onAccent: (hex: string) => void;
  onDensity: (id: DensityId) => void;
  onTypeface: (id: TypefaceId) => void;
  onReset: () => void;
  children?: ReactNode;
  hideDensity?: boolean;
  originalColor?: string;
}) {
  return (
    <View>
      <Text
        style={{
          marginBottom: 14,
          fontFamily: SERIF,
          fontSize: 15,
          lineHeight: 22,
          color: muted,
        }}
      >
        Original keeps this app’s own background. A colour tints the whole page.
        Smaller, regular, or bigger changes how large the writing is.
      </Text>
      <PrefSection
        label="Colour"
        hint="Original is this app’s own colour. Tap it to go back."
        ink={ink}
        muted={muted}
      >
        <PrefColor
          value={storedAccent}
          fallback={fallbackAccent}
          originalColor={originalColor ?? fallbackAccent}
          onChange={onAccent}
          ink={ink}
        />
      </PrefSection>
      {hideDensity ? null : (
        <PrefSection
          label="Type size"
          hint="Smaller packs the writing tighter. Bigger makes it larger and easier to read. You can see it change on this page."
          ink={ink}
          muted={muted}
        >
          <PrefDensity
            value={density}
            onChange={onDensity}
            accent={accent}
            ink={ink}
          />
        </PrefSection>
      )}
      <PrefSection
        label="Font"
        hint="Sans is the default. Serif or mono restyles the page."
        ink={ink}
        muted={muted}
      >
        <PrefChoices
          value={typeface}
          options={TYPEFACE_OPTIONS}
          onChange={onTypeface}
          accent={accent}
          ink={ink}
        />
      </PrefSection>
      {children}
      <RestoreDefaultsButton muted={muted} ink={ink} onReset={onReset} />
    </View>
  );
}

export function RestoreDefaultsButton({
  muted,
  ink,
  onReset,
}: {
  muted: string;
  ink: string;
  onReset: () => void;
}) {
  return (
    <Pressable
      onPress={onReset}
      accessibilityRole="button"
      accessibilityLabel="Back to original look"
      style={{
        marginTop: 12,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: wash(ink, 0.18),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: muted, fontWeight: "700", fontSize: 13 }}>
        Back to original look
      </Text>
    </Pressable>
  );
}

export function lookPanelProps(
  look: {
    accent: string;
    fallbackAccent: string;
    prefs: { accent: string; density: DensityId; typeface: TypefaceId };
    patch: (partial: Record<string, string | boolean | number>) => void;
    reset: () => void;
  },
  ink: string,
  muted: string,
  originalColor?: string
) {
  return {
    accent: look.accent,
    fallbackAccent: look.fallbackAccent,
    ink,
    muted,
    density: look.prefs.density,
    typeface: look.prefs.typeface ?? "sans",
    storedAccent: look.prefs.accent,
    originalColor,
    onAccent: (hex: string) => look.patch({ accent: hex }),
    onDensity: (id: DensityId) => look.patch({ density: id }),
    onTypeface: (id: TypefaceId) => look.patch({ typeface: id }),
    onReset: look.reset,
  };
}

export function LookPanel({
  look,
  ink,
  muted,
  pageColor,
  toggles,
  choices,
  children,
}: {
  look: {
    accent: string;
    fallbackAccent: string;
    prefs: { accent: string; density: DensityId; typeface: TypefaceId } & Record<
      string,
      string | boolean | number
    >;
    patch: (partial: Record<string, string | boolean | number>) => void;
    reset: () => void;
  };
  ink: string;
  muted: string;
  pageColor?: string;
  toggles?: { key: string; label: string; hint?: string }[];
  choices?: {
    key: string;
    label: string;
    hint?: string;
    options: { id: string; label: string }[];
  }[];
  children?: ReactNode;
}) {
  return (
    <AppSettingsPanel {...lookPanelProps(look, ink, muted, pageColor)}>
      {toggles?.length || choices?.length ? (
        <PrefSection label="This app" ink={ink} muted={muted}>
          <View style={{ gap: 10 }}>
            {toggles?.map((row) => (
              <PrefToggle
                key={row.key}
                on={Boolean(look.prefs[row.key])}
                label={row.label}
                hint={row.hint}
                accent={look.accent}
                ink={ink}
                muted={muted}
                onToggle={() =>
                  look.patch({ [row.key]: !look.prefs[row.key] })
                }
              />
            ))}
            {choices?.map((row) => (
              <View key={row.key}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: "700",
                    color: ink,
                  }}
                >
                  {row.label}
                </Text>
                {row.hint ? (
                  <Text
                    style={{
                      marginTop: -4,
                      marginBottom: 8,
                      fontSize: 12,
                      color: muted,
                    }}
                  >
                    {row.hint}
                  </Text>
                ) : null}
                <PrefChoices
                  value={String(look.prefs[row.key])}
                  options={row.options}
                  onChange={(id) => look.patch({ [row.key]: id })}
                  accent={look.accent}
                  ink={ink}
                />
              </View>
            ))}
          </View>
        </PrefSection>
      ) : null}
      {children}
    </AppSettingsPanel>
  );
}

export function AppSettingsSheet({
  open,
  onClose,
  title,
  kicker = "APP SETTINGS",
  background,
  ink,
  muted,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  background: string;
  ink: string;
  muted: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <SheetOverlay
      kicker={kicker}
      title={title}
      onClose={onClose}
      background={background}
      ink={ink}
      muted={muted}
    >
      {children}
    </SheetOverlay>
  );
}
