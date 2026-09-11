import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HIDDEN = new Set(["/welcome", "/create", "/join", "/waiting"]);

function isHomePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/index" ||
    pathname === "/(tabs)" ||
    pathname === "/(tabs)/index"
  );
}

export function HomeBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const atHome = isHomePath(pathname);

  if (HIDDEN.has(pathname)) return null;

  return (
    <View
      style={{
        backgroundColor: "#07070A",
        borderTopColor: "rgba(255,0,127,0.35)",
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        shadowColor: "#FF007F",
        shadowOpacity: 0.35,
        shadowRadius: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
        }}
      >
        {!atHome ? (
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/");
            }}
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 2,
              minWidth: 64,
            }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={24} color="#FF007F" />
            <Text
              style={{
                marginTop: 2,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.4,
                color: "#FF007F",
              }}
            >
              Back
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => router.replace("/")}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 2,
            minWidth: 64,
          }}
          accessibilityRole="button"
          accessibilityLabel="Home"
        >
          <Ionicons name="home" size={24} color="#FF007F" />
          <Text
            style={{
              marginTop: 2,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 0.4,
              color: "#FF007F",
            }}
          >
            Home
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
