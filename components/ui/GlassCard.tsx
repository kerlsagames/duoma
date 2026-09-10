import { Text, View, type ViewProps } from "react-native";

type Props = ViewProps & {
  title?: string;
  subtitle?: string;
};

export function GlassCard({ title, subtitle, children, className, ...rest }: Props) {
  return (
    <View
      className={`rounded-3xl border border-white/10 bg-white/5 p-5 ${className ?? ""}`}
      {...rest}
    >
      {title ? (
        <Text className="text-[13px] font-semibold uppercase tracking-[2px] text-neon">
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className="mt-2 text-[15px] leading-6 text-mist/80">{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}
