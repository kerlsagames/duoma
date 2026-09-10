import "react-native-gesture-handler";
import { GameInvitationModal } from "@/components/GameInvitationModal";
import { AppProvider } from "@/lib/store";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
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

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0B0B0E" }}>
      <SafeAreaProvider>
        <AppProvider>
            <View
              style={{
                flex: 1,
                backgroundColor: "#0B0B0E",
                alignItems: Platform.OS === "web" ? "center" : undefined,
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  maxWidth: Platform.OS === "web" ? 430 : undefined,
                  backgroundColor: "#0B0B0E",
                }}
              >
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
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="game" />
                </Stack>
                <GameInvitationModal />
              </View>
            </View>
            <StatusBar style="light" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
