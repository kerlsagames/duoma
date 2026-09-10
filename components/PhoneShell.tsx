import { ReactNode } from "react";
import { Platform, Text, View, useWindowDimensions } from "react-native";

type Props = { children: ReactNode };

export function PhoneShell({ children }: Props) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "web" || width < 560) {
    return (
      <View style={{ flex: 1, width: "100%", backgroundColor: "#0B0B0E" }}>
        {children}
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#050507",
        paddingVertical: 24,
      }}
    >
      <Text
        style={{
          color: "rgba(244,244,246,0.45)",
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 14,
          fontWeight: "600",
        }}
      >
        Phone preview
      </Text>
      <View
        style={{
          width: 390,
          height: 844,
          maxHeight: "92%",
          borderRadius: 44,
          borderWidth: 10,
          borderColor: "#1A1A20",
          backgroundColor: "#0B0B0E",
          overflow: "hidden",
          shadowColor: "#FF007F",
          shadowOpacity: 0.28,
          shadowRadius: 48,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        <View
          style={{
            height: 28,
            alignItems: "center",
            justifyContent: "flex-end",
            backgroundColor: "#0B0B0E",
          }}
        >
          <View
            style={{
              width: 120,
              height: 22,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              backgroundColor: "#050507",
            }}
          />
        </View>
        <View style={{ flex: 1, backgroundColor: "#0B0B0E" }}>{children}</View>
        <View
          style={{
            height: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0B0B0E",
          }}
        >
          <View
            style={{
              width: 128,
              height: 5,
              borderRadius: 99,
              backgroundColor: "rgba(244,244,246,0.22)",
            }}
          />
        </View>
      </View>
    </View>
  );
}
