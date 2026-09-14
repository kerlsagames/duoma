import { WorldShell } from "@/components/worlds/WorldShell";
import { SERIF } from "@/lib/app-themes";
import { useWorldProgress } from "@/lib/use-world-progress";
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function TownScreen() {
  const router = useRouter();
  const { snapshot, extras } = useWorldProgress();
  const buildings = [
    {
      id: "cinema",
      title: "Memory Cinema",
      open: extras.photos.length > 0 || snapshot.level >= 3,
      need: "Level 3, or one weekly photo.",
      href: "/hub/photo-challenges" as Href,
      detail: extras.photos.length
        ? `${extras.photos.length} reel${extras.photos.length === 1 ? "" : "s"} in the booth`
        : "The marquee is dark.",
    },
    {
      id: "arena",
      title: "Grand Arena",
      open: extras.bets.length > 0 || snapshot.level >= 5,
      need: "Level 5, or a settled LoveBetz slip.",
      href: "/hub/prediction" as Href,
      detail: extras.bets.length
        ? `${extras.bets.length} bout${extras.bets.length === 1 ? "" : "s"} on the board`
        : "No trophies yet.",
    },
    {
      id: "bakery",
      title: "Love Bakery",
      open: extras.coupons.length > 0 || snapshot.level >= 8,
      need: "Level 8, or a coupon in the tin.",
      href: "/hub/coupons" as Href,
      detail: extras.coupons.length
        ? `${extras.coupons.length} favor${extras.coupons.length === 1 ? "" : "s"} in the window`
        : "The oven is cold.",
    },
    {
      id: "lounge",
      title: "Velvet Lounge",
      open: snapshot.essences.find((row) => row.id === "desire")!.ep > 0 || snapshot.level >= 12,
      need: "Level 12, or anything from Desire.",
      href: "/hub/desire" as Href,
      detail: "Private door. Heat lives here.",
    },
  ];

  return (
    <WorldShell
      worldId="town"
      background="#1A120C"
      footer={
        <Text style={{ color: "rgba(246,237,228,0.4)", fontSize: 12, marginBottom: 8 }}>
          {snapshot.totalEP} blueprint credits · level {snapshot.level}
        </Text>
      }
    >
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 12 }}>
        <View
          style={{
            height: 148,
            borderRadius: 16,
            backgroundColor: "#2A1A12",
            borderWidth: 1,
            borderColor: "rgba(240,164,106,0.3)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-around",
              paddingHorizontal: 10,
              paddingBottom: 28,
            }}
          >
            {buildings.map((row, i) => (
              <View
                key={row.id}
                style={{
                  width: 58,
                  height: 48 + i * 10,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  backgroundColor: row.open ? "#C46A38" : "#3A2A22",
                  borderWidth: 1,
                  borderColor: row.open ? "#F0A46A" : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </View>
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 18, backgroundColor: "#4A3428" }} />
          <View style={{ position: "absolute", left: 12, bottom: 22 }}>
            <Text style={{ color: "#F0A46A", fontFamily: "SpaceMono", fontSize: 10 }}>
              MAIN STREET
            </Text>
            <Text style={{ color: "#F6EDE4", fontFamily: SERIF, fontSize: 16 }}>
              {buildings.filter((row) => row.open).length} of {buildings.length} lit
            </Text>
          </View>
        </View>
        {buildings.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => row.open && router.push(row.href)}
            style={{
              padding: 14,
              borderRadius: 14,
              backgroundColor: row.open ? "rgba(240,164,106,0.14)" : "#16100C",
              borderWidth: 1,
              borderColor: row.open ? "rgba(240,164,106,0.45)" : "rgba(255,255,255,0.06)",
              opacity: row.open ? 1 : 0.7,
            }}
          >
            <Text style={{ color: "#F0A46A", fontFamily: "SpaceMono", fontSize: 10 }}>
              {row.open ? "OPEN · TAP TO ENTER" : "LOCKED"}
            </Text>
            <Text style={{ marginTop: 4, color: "#F6EDE4", fontFamily: SERIF, fontSize: 22 }}>
              {row.title}
            </Text>
            <Text style={{ marginTop: 6, color: "rgba(246,237,228,0.65)" }}>{row.detail}</Text>
            {!row.open ? (
              <Text style={{ marginTop: 6, color: "rgba(240,164,106,0.7)", fontSize: 12 }}>
                {row.need}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </WorldShell>
  );
}
