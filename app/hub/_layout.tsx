import { Stack } from "expo-router";

export default function HubLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0B0B0E" },
        animation: "fade",
      }}
    />
  );
}
