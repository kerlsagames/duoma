import { Screen } from "@/components/ui/Screen";
import { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  kicker: string;
  title: string;
  body?: string;
  children: ReactNode;
};

export function HubScreen({ kicker, title, body, children }: Props) {
  return (
    <Screen scroll>
      <View className="pt-4 pb-6">
        <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
          {kicker}
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">{title}</Text>
        {body ? (
          <Text className="mt-2 text-[15px] leading-6 text-mist/65">{body}</Text>
        ) : null}
        <View className="mt-6">{children}</View>
      </View>
    </Screen>
  );
}
