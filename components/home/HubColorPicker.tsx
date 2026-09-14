import { SERIF } from "@/lib/app-themes";
import {
  HUB_COLOR_ORDER,
  HUB_COLOR_SWATCHES,
  setHubColor,
  type HubThemes,
} from "@/lib/hub-theme";
import { hubById, type HubId } from "@/lib/hubs";
import { Pressable, Text, View } from "react-native";

export function HubColorPicker({ themes }: { themes: HubThemes }) {
  return (
    <View>
      {HUB_COLOR_ORDER.map((hubId) => (
        <HubColorRow key={hubId} hubId={hubId} hex={themes[hubId].hex} />
      ))}
    </View>
  );
}

function HubColorRow({ hubId, hex }: { hubId: HubId; hex: string }) {
  const hub = hubById(hubId);
  if (!hub) return null;
  return (
    <View
      style={{
        marginBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: "#1A1A22",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 8,
            backgroundColor: hex,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#F4F4F6", fontSize: 15, fontWeight: "700" }}>
            {hub.label}
          </Text>
          <Text style={{ marginTop: 2, color: "rgba(244,244,246,0.5)", fontSize: 12 }}>
            Apps in this hub follow this colour.
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {HUB_COLOR_SWATCHES.map((swatch) => {
          const on = swatch.hex.toUpperCase() === hex.toUpperCase();
          return (
            <Pressable
              key={swatch.id}
              onPress={() => void setHubColor(hubId, swatch.hex)}
              accessibilityLabel={`${hub.label} ${swatch.label}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: swatch.hex,
                borderWidth: on ? 2 : 1,
                borderColor: on ? "#F4F4F6" : "rgba(255,255,255,0.18)",
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export function HubColorSectionLabel() {
  return (
    <>
      <Text
        style={{
          marginTop: 18,
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          color: "rgba(244,244,246,0.45)",
          marginBottom: 8,
        }}
      >
        APP COLOURS
      </Text>
      <Text
        style={{
          marginBottom: 10,
          color: "rgba(244,244,246,0.55)",
          fontSize: 13,
          lineHeight: 18,
          fontFamily: SERIF,
        }}
      >
        Pick a colour for each hub. Home tiles change, and every app in that section uses it.
      </Text>
    </>
  );
}
