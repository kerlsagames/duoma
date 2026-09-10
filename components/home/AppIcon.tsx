import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

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
    : (["#3A1028", "#FF007F"] as const);

  return (
    <Pressable onPress={onPress} className="w-[31%] items-center mb-5">
      <View
        style={{
          shadowColor: "#FF007F",
          shadowOpacity: hot ? 0.7 : 0.35,
          shadowRadius: hot ? 18 : 12,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <LinearGradient
          colors={[...colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.22)",
          }}
        >
          <Ionicons name={icon} size={28} color="#F4F4F6" />
        </LinearGradient>
        {live ? (
          <View className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-night bg-neon" />
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
      <LinearGradient
        colors={["#2A0818", "#12060C", "#0B0B0E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(255,0,127,0.45)",
          shadowColor: "#FF007F",
          shadowOpacity: 0.35,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={["#FF4DA6", "#FF007F", "#E60039"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={26} color="#F4F4F6" />
        </LinearGradient>
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
    </Pressable>
  );
}
