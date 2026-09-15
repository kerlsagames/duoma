import { HOW_TONE as T, SERIF } from "@/lib/app-themes";
import { Pressable, Text, View } from "react-native";

export function HowPlainToggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: on ? T.rose : T.border,
        backgroundColor: on ? T.paper : T.surfaceRaised,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 17,
            color: on ? T.paperInk : T.ink,
          }}
        >
          Turn off science speak
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: SERIF,
            fontSize: 13,
            lineHeight: 19,
            color: on ? T.paperMuted : T.dim,
          }}
        >
          {on
            ? "On. Everyday words. Hood, mons, and the rest get a translation on the card."
            : "Off. You’ll see the physiology version — still short, more nerves and blood flow."}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: on ? T.roseDeep : T.rose,
        }}
      >
        {on ? "On" : "Off"}
      </Text>
    </Pressable>
  );
}
