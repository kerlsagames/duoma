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
  /** Taller type for a stage jump that has to read as the main move. */
  size?: "default" | "loud" | "compact";
};

export function PrimaryButton({
  label,
  tone = "neon",
  loading,
  disabled,
  size = "default",
  ...rest
}: Props) {
  const loud = size === "loud";
  const compact = size === "compact";
  const height = loud ? 60 : compact ? 44 : 52;
  const radius = loud ? 20 : compact ? 14 : 18;
  const typeSize = loud ? 18 : compact ? 15 : 16;

  if (tone === "ghost") {
    return (
      <Pressable
        disabled={disabled || loading}
        className="items-center justify-center rounded-2xl border border-white/15"
        style={{ height: loud ? 56 : 48 }}
        {...rest}
      >
        <Text
          className="font-semibold tracking-wide text-mist"
          style={{ fontSize: loud ? 16 : 15 }}
        >
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
            height,
            borderRadius: radius,
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
                fontSize: typeSize,
                fontWeight: "800",
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
            height,
            borderRadius: radius,
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled || loading ? 0.55 : 1,
            shadowColor: "#FF007F",
            shadowOpacity: loud ? 0.75 : 0.55,
            shadowRadius: loud ? 22 : 16,
            shadowOffset: { width: 0, height: 0 },
          }}
      >
        {loading ? (
          <ActivityIndicator color="#F4F4F6" />
        ) : (
          <Text
            className="font-bold tracking-wide text-mist"
            style={{ fontSize: typeSize }}
          >
            {label}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
