import {
  densityLook,
  type DensityId,
  type TypefaceId,
} from "@/lib/app-prefs";
import { tintCanvas } from "@/lib/color-paint";
import { ReactNode, RefObject } from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  background?: string;
  scrollRef?: RefObject<ScrollView | null>;
  density?: DensityId;
  typeface?: TypefaceId;
  /** Only a colour the user picked in this app’s cog. Never the default accent. */
  wash?: string;
};

export function Screen({
  children,
  scroll,
  background = "#0B0B0E",
  scrollRef,
  density = "regular",
  typeface = "sans",
  wash,
}: Props) {
  const sizes = densityLook(density);
  const padX = density === "compact" ? 14 : density === "roomy" ? 28 : 20;
  const canvas = wash ? tintCanvas(background, wash, 0.58) : background;
  const webAttrs =
    Platform.OS === "web"
      ? ({
          dataSet: { appDensity: density, appTypeface: typeface },
        } as object)
      : {};
  if (scroll) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ flex: 1, backgroundColor: canvas }}
        edges={["top", "left", "right"]}
      >
        <View className="flex-1" style={{ backgroundColor: canvas }} {...webAttrs}>
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: padX,
              paddingBottom: 20 + sizes.gap,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            style={{ backgroundColor: canvas }}
          >
            <View>{children}</View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ flex: 1, backgroundColor: canvas }}
      edges={["top", "left", "right"]}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: canvas,
          paddingHorizontal: padX,
        }}
        {...webAttrs}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
