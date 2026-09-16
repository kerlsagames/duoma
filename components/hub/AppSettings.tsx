import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { BackButton } from "@/components/ui/BackButton";
import { SERIF } from "@/lib/app-themes";
import {
  DENSITY_OPTIONS,
  TYPEFACE_OPTIONS,
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
  onChange,
  ink,
}: {
  value: string;
  fallback: string;
  onChange: (hex: string) => void;
  ink: string;
}) {
  const current = value.trim() || fallback;
  const matchingHub = !value.trim();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Pressable
        onPress={() => onChange("")}
        accessibilityLabel="Match hub colour"
        style={{
          height: 32,
          paddingHorizontal: 10,
          borderRadius: 16,
          borderWidth: matchingHub ? 2 : 1,
          borderColor: matchingHub ? ink : wash(ink, 0.22),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: wash(ink, 0.08),
        }}
      >
        <Text style={{ color: ink, fontSize: 12, fontWeight: "700" }}>Hub</Text>
      </Pressable>
      {HUB_COLOR_SWATCHES.map((swatch) => {
        const on =
          !matchingHub && swatch.hex.toUpperCase() === current.toUpperCase();
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
        Pick a colour only if you want this app’s background to shift. Type size
        and font restyle the page. Hub colour still paints the tile on Home.
      </Text>
      <PrefSection
        label="Colour"
        hint="Only if you pick one. Leave Hub to keep this app’s own background."
        ink={ink}
        muted={muted}
      >
        <PrefColor
          value={storedAccent}
          fallback={fallbackAccent}
          onChange={onAccent}
          ink={ink}
        />
      </PrefSection>
      {hideDensity ? null : (
        <PrefSection
          label="Type size"
          hint="Compact, regular, or roomy type and spacing on this page."
          ink={ink}
          muted={muted}
        >
          <PrefChoices
            value={density}
            options={DENSITY_OPTIONS}
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
      accessibilityLabel="Restore defaults"
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
        Restore defaults
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
  muted: string
) {
  return {
    accent: look.accent,
    fallbackAccent: look.fallbackAccent,
    ink,
    muted,
    density: look.prefs.density,
    typeface: look.prefs.typeface ?? "sans",
    storedAccent: look.prefs.accent,
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
    <AppSettingsPanel {...lookPanelProps(look, ink, muted)}>
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
