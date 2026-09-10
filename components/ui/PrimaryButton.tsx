import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

type Props = PressableProps & {
  label: string;
  tone?: "neon" | "crimson" | "ghost" | "danger" | "gold" | "teal";
  loading?: boolean;
};

export function PrimaryButton({
  label,
  tone = "neon",
  loading,
  disabled,
  ...rest
}: Props) {
  if (tone === "ghost") {
    return (
      <Pressable
        disabled={disabled || loading}
        className="h-12 items-center justify-center rounded-2xl border border-white/15"
        {...rest}
      >
        <Text className="text-[15px] font-semibold tracking-wide text-mist">
          {label}
        </Text>
      </Pressable>
    );
  }

  if (tone === "danger") {
    return (
      <Pressable
        disabled={disabled || loading}
        className="h-12 items-center justify-center rounded-2xl border border-crimson/50 bg-crimson/20"
        {...rest}
      >
        <Text className="text-[15px] font-semibold tracking-wide text-mist">
          {label}
        </Text>
      </Pressable>
    );
  }

  if (tone === "gold" || tone === "teal") {
    const colors: readonly [string, string] =
      tone === "teal" ? ["#3DE0C5", "#7CFFB2"] : ["#E4C37A", "#C9A24A"];
    const labelColor = tone === "teal" ? "#061018" : "#12100C";
    return (
      <Pressable
        disabled={disabled || loading}
        className="w-full"
        {...rest}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 52,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled || loading ? 0.55 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={labelColor} />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 0.4,
                color: labelColor,
              }}
            >
              {label}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const colors: readonly [string, string] =
    tone === "crimson" ? ["#E60039", "#FF007F"] : ["#FF007F", "#E60039"];

  return (
    <Pressable disabled={disabled || loading} className="w-full" {...rest}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
          style={{
            height: 52,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled || loading ? 0.55 : 1,
            shadowColor: "#FF007F",
            shadowOpacity: 0.55,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 0 },
          }}
      >
        {loading ? (
          <ActivityIndicator color="#F4F4F6" />
        ) : (
          <Text className="text-[16px] font-bold tracking-wide text-mist">
            {label}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
