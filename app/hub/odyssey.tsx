import { WorldShell } from "@/components/worlds/WorldShell";
import { SERIF } from "@/lib/app-themes";
import { useWorldProgress } from "@/lib/use-world-progress";
import { ScrollView, Text, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

const WAYS = [
  { km: 0, name: "Home dock", x: 28, y: 150 },
  { km: 100, name: "Whispering Forest", x: 86, y: 108 },
  { km: 500, name: "Crystal Bay", x: 160, y: 128 },
  { km: 1500, name: "Sunset Peaks", x: 232, y: 72 },
  { km: 4000, name: "Uncharted Reach", x: 310, y: 96 },
];

export default function OdysseyScreen() {
  const { snapshot, extras } = useWorldProgress();
  const km = snapshot.totalEP;
  const reached = WAYS.filter((row) => km >= row.km);
  const next = WAYS.find((row) => km < row.km);

  return (
    <WorldShell
      worldId="odyssey"
      background="#10141C"
      footer={
        <Text style={{ color: "rgba(200,214,230,0.45)", fontSize: 12, marginBottom: 8 }}>
          {km} fuel km · {reached.length} waypoint{reached.length === 1 ? "" : "s"}
        </Text>
      }
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
      <View
        style={{
          borderRadius: 16,
          backgroundColor: "#1A2430",
          borderWidth: 1,
          borderColor: "rgba(143,168,200,0.3)",
          padding: 8,
        }}
      >
        <Svg width={340} height={200} viewBox="0 0 340 190">
          <Path
            d="M28 150 C 70 150, 70 108, 86 108 S 140 140, 160 128 S 210 70, 232 72 S 290 110, 310 96"
            stroke="#8FA8C8"
            strokeWidth={2}
            fill="none"
            strokeDasharray="5 5"
          />
          {WAYS.map((row) => {
            const on = km >= row.km;
            return (
              <Circle
                key={row.name}
                cx={row.x}
                cy={row.y}
                r={on ? 7 : 5}
                fill={on ? "#F0C75E" : "#3A4A5C"}
                stroke="#C8D6E4"
                strokeWidth={1}
              />
            );
          })}
          <SvgText x={18} y={24} fill="#8FA8C8" fontSize="11" fontFamily="SpaceMono">
            THE CHART
          </SvgText>
        </Svg>
      </View>
      <Text style={{ marginTop: 14, color: "#C8D6E4", fontFamily: SERIF, fontSize: 20 }}>
        {next
          ? `${next.km - km} km to ${next.name}`
          : "The chart is open. You have sailed the known rim."}
      </Text>
      <View style={{ marginTop: 12, gap: 8 }}>
        {WAYS.map((row) => {
          const on = km >= row.km;
          return (
            <View
              key={row.name}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: on ? "rgba(240,199,94,0.12)" : "#161C24",
                borderWidth: 1,
                borderColor: on ? "rgba(240,199,94,0.4)" : "rgba(255,255,255,0.06)",
              }}
            >
              <Text style={{ color: "#F0C75E", fontFamily: "SpaceMono", fontSize: 10 }}>
                {row.km} KM · {on ? "LANDED" : "AHEAD"}
              </Text>
              <Text style={{ marginTop: 4, color: "#E8EEF4", fontFamily: SERIF, fontSize: 18 }}>
                {row.name}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={{ marginTop: 12, color: "rgba(200,214,230,0.5)", fontSize: 13 }}>
        Travel log: {extras.photos.length} photos, {extras.notes.length} notes,{" "}
        {extras.dates} marked nights.
      </Text>
      </ScrollView>
    </WorldShell>
  );
}
