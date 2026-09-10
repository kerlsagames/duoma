import type { Gender } from "@/lib/types";
import { Pressable, Text, View } from "react-native";

const OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export function GenderPicker({
  value,
  onChange,
  label,
}: {
  value: Gender | null;
  onChange: (gender: Gender) => void;
  label?: string;
}) {
  return (
    <View>
      {label ? (
        <Text className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-mist/40">
          {label}
        </Text>
      ) : null}
      <View className="flex-row gap-2">
        {OPTIONS.map((option) => {
          const on = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className={`h-12 flex-1 items-center justify-center rounded-2xl border ${
                on ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"
              }`}
            >
              <Text
                className={`text-[15px] font-semibold ${
                  on ? "text-mist" : "text-mist/70"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
