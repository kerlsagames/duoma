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
  const padX = density === "compact" ? 16 : density === "roomy" ? 24 : 20;
  const canvas = wash ? tintCanvas(background, wash, 0.32) : background;
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
