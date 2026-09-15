import { useApp } from "@/lib/store";
import { readAuthRedirectError } from "@/lib/cloud-pair";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function WaitingScreen() {
  const { ready, user } = useApp();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-night">
        <ActivityIndicator color="#FF007F" />
      </View>
    );
  }

  if (readAuthRedirectError() || !user) {
    return <Redirect href="/check-email" />;
  }
  return <Redirect href="/(tabs)" />;
}
