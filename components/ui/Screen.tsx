import { ReactNode, RefObject } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  background?: string;
  scrollRef?: RefObject<ScrollView | null>;
};

export function Screen({
  children,
  scroll,
  background = "#0B0B0E",
  scrollRef,
}: Props) {
  if (scroll) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ flex: 1, backgroundColor: background }}
        edges={["top", "left", "right"]}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          style={{ backgroundColor: background }}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ flex: 1, backgroundColor: background }}
      edges={["top", "left", "right"]}
    >
      <View className="flex-1 px-5" style={{ backgroundColor: background }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
