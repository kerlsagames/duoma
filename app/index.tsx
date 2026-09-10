import { useApp } from "@/lib/store";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { ready, user, couple } = useApp();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-night">
        <ActivityIndicator color="#FF007F" />
      </View>
    );
  }

  if (!user) return <Redirect href="/welcome" />;
  if (!couple?.partnerB) return <Redirect href="/waiting" />;
  return <Redirect href="/(tabs)" />;
}
