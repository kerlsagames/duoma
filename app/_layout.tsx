import "react-native-gesture-handler";
import "@/lib/nativewind-boot";
import { DesirePinGate } from "@/components/DesirePinGate";
import { GameInvitationModal } from "@/components/GameInvitationModal";
import { HomeBar } from "@/components/HomeBar";
import { PhoneShell } from "@/components/PhoneShell";
import { CalendarReminderWatch } from "@/components/hub/CalendarReminderWatch";
import { CatalogProvider } from "@/lib/catalog-overlay";
import { SafetyWatch } from "@/components/SafetyWatch";
import { isCreatorEmail } from "@/lib/creator";
import { setDwellPath } from "@/lib/app-dwell";
import { captureInstallPrompt } from "@/lib/pwa-install";
import { registerDuomaWorker } from "@/lib/push";
import { AppProvider, useApp } from "@/lib/store";
import { HubThemeProvider } from "@/lib/hub-theme";
import { colorScheme } from "nativewind";
import { useFonts } from "expo-font";
import Head from "expo-router/head";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function LoadingMark() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0B0B0E",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../assets/images/splash-icon.png")}
        style={{ width: 168, height: 168 }}
        resizeMode="contain"
      />
    </View>
  );
}

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
      captureInstallPrompt();
      void registerDuomaWorker();
    }
  }, []);

  if (!loaded) return <LoadingMark />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#050507", overflow: "hidden" }}>
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
  const { user, ready, usingCloud, cloudLive } = useApp();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const banned = Boolean(user?.bannedAt) && !isCreatorEmail(user?.email);

  useEffect(() => {
    setDwellPath(pathname);
  }, [pathname]);

  const authGate =
    pathname === "/login" ||
    pathname === "/create" ||
    pathname === "/join";
  const stayOnPasswordLogin =
    pathname === "/login" && usingCloud && !cloudLive;

  useEffect(() => {
    if (!ready || admin) return;
    if (banned && pathname !== "/banned") {
      router.replace("/banned");
      return;
    }
    if (!banned && pathname === "/banned") {
      router.replace("/");
      return;
    }
    if (user && authGate && !stayOnPasswordLogin) {
      router.replace("/");
    }
  }, [ready, banned, admin, pathname, router, user, authGate, stayOnPasswordLogin]);

  return (
    <PhoneShell>
      <SafetyWatch />
      <View style={{ flex: 1, backgroundColor: "#0B0B0E", overflow: "hidden" }}>
        <View style={{ flex: 1, overflow: "hidden" }}>
          <DesirePinGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0B0B0E", flex: 1 },
              animation: "fade",
              gestureEnabled: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="create" />
            <Stack.Screen name="join" />
            <Stack.Screen name="check-email" />
            <Stack.Screen name="waiting" />
            <Stack.Screen name="how-to" />
            <Stack.Screen name="legal" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="hub" />
            <Stack.Screen name="game" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="banned" />
          </Stack>
          </DesirePinGate>
        </View>
        {admin ||
        pathname === "/banned" ||
        pathname === "/check-email" ||
        pathname === "/login" ? null : (
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
