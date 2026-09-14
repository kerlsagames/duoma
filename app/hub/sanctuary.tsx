import { WorldShell } from "@/components/worlds/WorldShell";
import { SERIF } from "@/lib/app-themes";
import { useWorldProgress } from "@/lib/use-world-progress";
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function SanctuaryScreen() {
  const router = useRouter();
  const { snapshot, extras, ready } = useWorldProgress();
  const living = true;
  const terrace = extras.dates >= 3 && extras.photos.length >= 2;
  const observatory = snapshot.essences.find((row) => row.id === "desire")!.ep > 0;
  const rooms = [
    {
      id: "living",
      title: "Living room & porch",
      open: living,
      need: "Answer 5 curiosity questions, or just start together.",
      body: "The cabin is lit. The porch faces the garden you haven't planted yet.",
    },
    {
      id: "terrace",
      title: "Outdoor terrace & garden",
      open: terrace,
      need: "3 date-night marks and 2 weekly photos.",
      body: terrace
        ? "Stone underfoot. The garden takes the shape of nights you actually left the house."
        : `${extras.dates}/3 dates · ${extras.photos.length}/2 photos.`,
    },
    {
      id: "spa",
      title: "Observatory & spa deck",
      open: observatory,
      need: "Anything from Desire — a night, a dare, a match.",
      body: observatory
        ? "The private deck is warm. Desire built the glass, not the other way around."
        : "Desire is still a rumor on this estate.",
    },
  ];

  return (
    <WorldShell
      worldId="sanctuary"
      background="#1A140E"
      footer={
        <Text style={{ color: "rgba(244,240,232,0.4)", fontSize: 12, marginBottom: 8 }}>
          {ready ? `${snapshot.totalEP} action points · level ${snapshot.level}` : "…"}
        </Text>
      }
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        <EstateSketch
          living={living}
          terrace={terrace}
          observatory={observatory}
        />
        {rooms.map((room) => (
          <View
            key={room.id}
            style={{
              padding: 14,
              borderRadius: 14,
              backgroundColor: room.open ? "rgba(232,184,109,0.14)" : "#18120C",
              borderWidth: 1,
              borderColor: room.open ? "rgba(232,184,109,0.45)" : "rgba(255,255,255,0.06)",
            }}
          >
            <Text style={{ color: "#E8B86D", fontFamily: "SpaceMono", fontSize: 10 }}>
              {room.open ? "OPEN" : "LOCKED"}
            </Text>
            <Text style={{ marginTop: 4, color: "#F6EDE4", fontFamily: SERIF, fontSize: 20 }}>
              {room.title}
            </Text>
            <Text style={{ marginTop: 6, color: "rgba(246,237,228,0.65)", lineHeight: 20 }}>
              {room.body}
            </Text>
            {!room.open ? (
              <Text style={{ marginTop: 6, color: "rgba(232,184,109,0.7)", fontSize: 12 }}>
                {room.need}
              </Text>
            ) : null}
          </View>
        ))}

        <Pressable
          onPress={() => router.push("/hub/photo-challenges" as Href)}
          style={tile}
        >
          <Text style={kicker}>MEMORY WALL</Text>
          <Text style={title}>
            {extras.photos.length
              ? `${extras.photos.length} print${extras.photos.length === 1 ? "" : "s"} on the wall`
              : "No photos hung yet"}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push("/hub/prediction" as Href)} style={tile}>
          <Text style={kicker}>TROPHY CABINET</Text>
          <Text style={title}>
            {extras.bets.length
              ? `${extras.bets.length} settled slip${extras.bets.length === 1 ? "" : "s"}`
              : "Win a LoveBetz slip for a trophy"}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push("/hub/audio-vault" as Href)} style={tile}>
          <Text style={kicker}>VOICE RECORD PLAYER</Text>
          <Text style={title}>
            {extras.notes.filter((row) => row.hasAudio).length
              ? "The turntable has your takes"
              : "Record a voice note to drop a record"}
          </Text>
        </Pressable>
      </ScrollView>
    </WorldShell>
  );
}

function EstateSketch({
  living,
  terrace,
  observatory,
}: {
  living: boolean;
  terrace: boolean;
  observatory: boolean;
}) {
  return (
    <View
      style={{
        height: 168,
        borderRadius: 16,
        backgroundColor: "#2A1C12",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(232,184,109,0.25)",
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 24,
          bottom: 28,
          width: 88,
          height: 72,
          backgroundColor: living ? "#C4844A" : "#3A2A1C",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 18,
          bottom: 88,
          width: 100,
          height: 36,
          backgroundColor: living ? "#8B3A2A" : "#2A2018",
          transform: [{ rotate: "-8deg" }],
        }}
      />
      {terrace ? (
        <View
          style={{
            position: "absolute",
            left: 120,
            bottom: 28,
            width: 110,
            height: 18,
            backgroundColor: "#6A8A4A",
            borderRadius: 4,
          }}
        />
      ) : null}
      {observatory ? (
        <View
          style={{
            position: "absolute",
            right: 28,
            bottom: 52,
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: "rgba(140,180,220,0.35)",
            borderWidth: 2,
            borderColor: "#C8D8E8",
          }}
        />
      ) : null}
    </View>
  );
}

const tile = {
  padding: 14,
  borderRadius: 14,
  backgroundColor: "#18120C",
  borderWidth: 1,
  borderColor: "rgba(232,184,109,0.2)",
} as const;
const kicker = {
  color: "#E8B86D",
  fontFamily: "SpaceMono" as const,
  fontSize: 10,
  letterSpacing: 1,
};
const title = { marginTop: 4, color: "#F6EDE4", fontFamily: SERIF, fontSize: 17 };
