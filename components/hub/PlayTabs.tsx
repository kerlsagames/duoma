import { Pressable, Text, View } from "react-native";

export function PlayTabs<T extends string>({
  tabs,
  current,
  onChange,
  accent,
  ink = "#F4F4F6",
}: {
  tabs: { id: T; label: string }[];
  current: T;
  onChange: (id: T) => void;
  accent: string;
  ink?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
      }}
    >
      {tabs.map((tab) => {
        const on = tab.id === current;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: on ? accent : ink,
              backgroundColor: on ? `${accent}22` : "transparent",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 6,
              opacity: on ? 1 : 0.45,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: ink,
                textAlign: "center",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PlayRatingsToggle({
  on,
  onToggle,
  accent,
  ink = "#F4F4F6",
}: {
  on: boolean;
  onToggle: () => void;
  accent: string;
  ink?: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: on ? accent : "rgba(255,255,255,0.12)",
        backgroundColor: on ? `${accent}22` : "rgba(255,255,255,0.04)",
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: ink }}>
          Rating sliders
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 13,
            lineHeight: 18,
            color: "rgba(244,244,246,0.55)",
          }}
        >
          {on
            ? "On. Score completed items from 0 to 10."
            : "Off. Turn on if you want scores after you tick something off."}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: on ? accent : "rgba(244,244,246,0.4)",
        }}
      >
        {on ? "On" : "Off"}
      </Text>
    </Pressable>
  );
}
