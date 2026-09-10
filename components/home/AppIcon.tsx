import { Ionicons } from "@expo/vector-icons";
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
          width: size + 2,
          height: size + 2,
          borderRadius: radius + 2,
          backgroundColor: glow,
          opacity: 0.38,
          ...(Platform.OS === "web"
            ? {
                filter: "blur(4px)",
                boxShadow: `0 0 10px 3px ${glow}`,
              }
            : {
                shadowColor: "#FF007F",
                shadowOpacity: 0.45,
                shadowRadius: 10,
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
        glow={hot ? "rgba(255,77,166,0.55)" : "rgba(255,0,127,0.4)"}
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
