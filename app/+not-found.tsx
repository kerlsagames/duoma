import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Missing", headerShown: false }} />
      <View className="flex-1 items-center justify-center bg-night px-6">
        <Text className="text-[22px] font-bold text-mist">This screen is gone.</Text>
        <Link href="/" className="mt-4">
          <Text className="text-[16px] text-neon">Back to Duoma</Text>
        </Link>
      </View>
    </>
  );
}
