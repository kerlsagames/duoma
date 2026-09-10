import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll }: Props) {
  if (scroll) {
    return (
      <SafeAreaView
        className="flex-1 bg-night"
        style={{ flex: 1, backgroundColor: "#0B0B0E" }}
        edges={["top", "left", "right"]}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-night"
      style={{ flex: 1, backgroundColor: "#0B0B0E" }}
      edges={["top", "left", "right"]}
    >
      <View className="flex-1 px-5">{children}</View>
    </SafeAreaView>
  );
}
