import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { Platform, Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

function IconWell({
  icon,
  size,
  radius,
  glow,
  glyph,
}: {
  icon: IconName;
  size: number;
  radius: number;
  glow: string;
  glyph: number;
}) {
  const pad = 10;
  return (
    <View
      style={{
        width: size + pad,
        height: size + pad,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: size + 6,
          height: size + 6,
          borderRadius: radius + 6,
          backgroundColor: glow,
          opacity: 0.7,
          ...(Platform.OS === "web"
            ? {
                filter: "blur(7px)",
                boxShadow: `0 0 18px 8px ${glow}`,
              }
            : {
                shadowColor: "#FF007F",
                shadowOpacity: 0.9,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 0 },
              }),
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: "#FF007F",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -size * 0.25,
            left: -size * 0.15,
            width: size * 0.9,
            height: size * 0.7,
            borderRadius: size,
            backgroundColor: "rgba(255,255,255,0.28)",
          }}
        />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={glyph} color="#F4F4F6" />
        </View>
      </View>
    </View>
  );
}

type Props = {
  label: string;
  icon: IconName;
  onPress: () => void;
  live?: boolean;
  hot?: boolean;
};

export function AppIcon({ label, icon, onPress, live, hot }: Props) {
  return (
    <Pressable onPress={onPress} className="mb-4 w-[31%] items-center">
      <IconWell
        icon={icon}
        size={64}
        radius={20}
        glow={hot ? "rgba(255,77,166,0.95)" : "rgba(255,0,127,0.7)"}
        glyph={28}
      />
      {live ? (
        <View className="absolute right-4 top-1 h-3.5 w-3.5 rounded-full bg-neon" />
      ) : null}
      <Text
        className="mt-1 text-center text-[11px] font-semibold leading-4 text-mist"
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type FeatureProps = {
  kicker: string;
  title: string;
  blurb: string;
  icon: IconName;
  onPress: () => void;
  live?: boolean;
};

export function FeatureApp({
  kicker,
  title,
  blurb,
  icon,
  onPress,
  live,
}: FeatureProps) {
  return (
    <Pressable onPress={onPress} className="mb-3">
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: "#2A0818",
          borderWidth: 1,
          borderColor: "rgba(255,0,127,0.45)",
          ...(Platform.OS === "web"
            ? { boxShadow: "0 0 22px 2px rgba(255,0,127,0.28)" }
            : {
                shadowColor: "#FF007F",
                shadowOpacity: 0.35,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 0 },
              }),
        }}
      >
        <LinearGradient
          colors={["#4A1530", "#220814"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IconWell
            icon={icon}
            size={56}
            radius={18}
            glow="rgba(255,77,166,0.9)"
            glyph={26}
          />
          <View className="ml-2 flex-1">
            <View className="flex-row items-center">
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-neon">
                {kicker}
              </Text>
              {live ? (
                <Text className="ml-2 text-[11px] font-bold text-crimson">LIVE</Text>
              ) : null}
            </View>
            <Text className="mt-0.5 text-[18px] font-bold text-mist">{title}</Text>
            <Text className="mt-0.5 text-[13px] leading-5 text-mist/70">{blurb}</Text>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
