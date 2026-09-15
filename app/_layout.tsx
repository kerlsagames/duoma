import "react-native-gesture-handler";
import "@/lib/nativewind-boot";
import { GameInvitationModal } from "@/components/GameInvitationModal";
import { HomeBar } from "@/components/HomeBar";
import { PhoneShell } from "@/components/PhoneShell";
import { CalendarReminderWatch } from "@/components/hub/CalendarReminderWatch";
import { CatalogProvider } from "@/lib/catalog-overlay";
import { AppProvider, useApp } from "@/lib/store";
import { HubThemeProvider } from "@/lib/hub-theme";
import { colorScheme } from "nativewind";
import { useFonts } from "expo-font";
import Head from "expo-router/head";
import { Stack, usePathname, useRouter } from "expo-router";
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
    GreatVibes: require("../assets/fonts/GreatVibes-Regular.ttf"),
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

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title = "Duoma";
    }
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#050507" }}>
      <SafeAreaProvider>
        <CatalogProvider>
          <AppProvider>
            <HubThemeProvider>
              <Head>
                <title>Duoma</title>
              </Head>
              <RootChrome />
            </HubThemeProvider>
            <StatusBar style="light" />
          </AppProvider>
        </CatalogProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useApp();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const banned = Boolean(user?.bannedAt);

  useEffect(() => {
    if (!ready || admin) return;
    if (banned && pathname !== "/banned") {
      router.replace("/banned");
    }
  }, [ready, banned, admin, pathname, router]);

  return (
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
            <Stack.Screen name="admin" />
            <Stack.Screen name="banned" />
          </Stack>
        </View>
        {admin || pathname === "/banned" ? null : (
          <>
            <HomeBar />
            <GameInvitationModal />
            <CalendarReminderWatch />
          </>
        )}
      </View>
    </PhoneShell>
  );
}
