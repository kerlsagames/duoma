import "react-native-gesture-handler";
import "@/lib/nativewind-boot";
import { GameInvitationModal } from "@/components/GameInvitationModal";
import { HomeBar } from "@/components/HomeBar";
import { PhoneShell } from "@/components/PhoneShell";
import { AppProvider } from "@/lib/store";
import { colorScheme } from "nativewind";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    try {
      colorScheme.set("dark");
    } catch {
      // NativeWind still compiling flags; class-based dark mode covers this.
    }
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#050507" }}>
      <SafeAreaProvider>
        <AppProvider>
          <PhoneShell>
            <View style={{ flex: 1, backgroundColor: "#0B0B0E" }}>
              <View style={{ flex: 1 }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#0B0B0E" },
                    animation: "fade",
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="welcome" />
                  <Stack.Screen name="create" />
                  <Stack.Screen name="join" />
                  <Stack.Screen name="waiting" />
                  <Stack.Screen name="how-to" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="hub" />
                  <Stack.Screen name="game" />
                </Stack>
              </View>
              <HomeBar />
              <GameInvitationModal />
            </View>
          </PhoneShell>
          <StatusBar style="light" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
