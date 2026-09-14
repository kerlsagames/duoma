import { WorldShell } from "@/components/worlds/WorldShell";
import { SERIF } from "@/lib/app-themes";
import { useWorldProgress } from "@/lib/use-world-progress";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

type Star = { id: string; x: number; y: number; r: number; label: string };

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export default function ConstellationScreen() {
  const { snapshot, extras } = useWorldProgress();
  const starCount = Math.min(
    48,
    4 +
      extras.photos.length +
      extras.notes.length +
      extras.dates +
      Math.floor(snapshot.totalEP / 40)
  );
  const stars: Star[] = Array.from({ length: starCount }, (_, i) => ({
    id: `s${i}`,
    x: 12 + hash(i + 3) * 310,
    y: 16 + hash(i + 11) * 200,
    r: 1.4 + hash(i + 19) * 2.4,
    label: i === 0 ? "First spark" : `Star ${i + 1}`,
  }));
  const clusters = [
    {
      name: "The First Date",
      ready: extras.dates >= 1 || extras.photos.length >= 1,
      ids: [0, 2, 5, 8],
    },
    {
      name: "The Weekly Light",
      ready: extras.photos.length >= 3,
      ids: [4, 7, 10, 14],
    },
    {
      name: "The Long Night",
      ready: snapshot.essences.find((row) => row.id === "desire")!.ep > 0,
      ids: [3, 6, 9, 12, 16],
    },
  ];
  const nebula = snapshot.essences.find((row) => row.id === "desire")!.ep > 0;

  return (
    <WorldShell
      worldId="constellation"
      background="#07060F"
      footer={
        <Text style={{ color: "rgba(201,160,220,0.5)", fontSize: 12, marginBottom: 8 }}>
          {starCount} stars · {snapshot.totalEP} starlight
        </Text>
      }
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
      <Pressable
        style={{
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(201,160,220,0.28)",
          backgroundColor: nebula ? "#12081A" : "#0A0814",
        }}
      >
        <Svg width={340} height={240} viewBox="0 0 340 240">
          {nebula ? (
            <Circle cx={220} cy={80} r={70} fill="rgba(180,60,140,0.16)" />
          ) : null}
          {clusters
            .filter((row) => row.ready)
            .flatMap((row) =>
              row.ids.slice(0, -1).map((id, i) => {
                const a = stars[id];
                const b = stars[row.ids[i + 1]!];
                if (!a || !b) return null;
                return (
                  <Line
                    key={`${row.name}-${id}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(201,160,220,0.55)"
                    strokeWidth={1}
                  />
                );
              })
            )}
          {stars.map((star) => (
            <Circle
              key={star.id}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="#F4F0FF"
            />
          ))}
        </Svg>
      </Pressable>
      <View style={{ marginTop: 14, gap: 8 }}>
        {clusters.map((row) => (
          <View
            key={row.name}
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: row.ready ? "rgba(201,160,220,0.12)" : "#100E18",
              borderWidth: 1,
              borderColor: row.ready ? "rgba(201,160,220,0.4)" : "rgba(255,255,255,0.06)",
            }}
          >
            <Text style={{ color: "#C9A0DC", fontFamily: "SpaceMono", fontSize: 10 }}>
              {row.ready ? "NAMED" : "STILL DARK"}
            </Text>
            <Text style={{ marginTop: 4, color: "#F4F0FF", fontFamily: SERIF, fontSize: 18 }}>
              {row.name}
            </Text>
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 12, color: "rgba(201,160,220,0.5)", fontSize: 12 }}>
        Export as a print is coming — the sky is already yours.
      </Text>
      </ScrollView>
    </WorldShell>
  );
}
