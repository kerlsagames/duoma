import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none", height: 0 },
        tabBarShowLabel: false,
      }}
      tabBar={() => null}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="us" options={{ href: null }} />
      <Tabs.Screen name="cards" options={{ href: null }} />
      <Tabs.Screen name="you" options={{ href: null }} />
    </Tabs>
  );
}
