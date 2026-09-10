import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

function IconWell({
  icon,
  size,
  radius,
  colors,
  glyph,
}: {
  icon: IconName;
  size: number;
  radius: number;
  colors: readonly [string, string, ...string[]];
  glyph: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: "#FF007F",
      }}
    >
      <LinearGradient
        colors={[...colors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={glyph} color="#F4F4F6" />
      </LinearGradient>
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
  const colors = hot
    ? (["#FF4DA6", "#FF007F", "#E60039"] as const)
    : (["#5A1438", "#FF007F"] as const);

  return (
    <Pressable onPress={onPress} className="mb-5 w-[31%] items-center">
      <View
        style={{
          shadowColor: "#FF007F",
          shadowOpacity: hot ? 0.75 : 0.4,
          shadowRadius: hot ? 16 : 12,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <IconWell
          icon={icon}
          size={64}
          radius={20}
          colors={colors}
          glyph={28}
        />
        {live ? (
          <View className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-neon" />
        ) : null}
      </View>
      <Text
        className="mt-2 text-center text-[11px] font-semibold leading-4 text-mist"
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
          shadowColor: "#FF007F",
          shadowOpacity: 0.35,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <LinearGradient
          colors={["#3A1024", "#1A0810", "#14060C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IconWell
            icon={icon}
            size={56}
            radius={18}
            colors={["#FF4DA6", "#FF007F", "#E60039"]}
            glyph={26}
          />
          <View className="ml-3 flex-1">
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
