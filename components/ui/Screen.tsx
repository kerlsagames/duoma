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
  accent?: string;
};

export function Screen({
  children,
  scroll,
  background = "#0B0B0E",
  scrollRef,
  density = "regular",
  typeface = "sans",
  accent,
}: Props) {
  const sizes = densityLook(density);
  const padX = density === "compact" ? 16 : density === "roomy" ? 24 : 20;
  const canvas = accent ? tintCanvas(background, accent, 0.32) : background;
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
        {...webAttrs}
      >
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ flex: 1, backgroundColor: canvas }}
      edges={["top", "left", "right"]}
      {...webAttrs}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: canvas,
          paddingHorizontal: padX,
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
