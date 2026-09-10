import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#07070A",
          borderTopColor: "rgba(255,0,127,0.35)",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: "#FF007F",
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: "#FF007F",
        tabBarInactiveTintColor: "rgba(244,244,246,0.38)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.4,
        },
        tabBarItemStyle: {
          flex: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="us"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
