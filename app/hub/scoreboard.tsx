import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { CROSSWORD_PUZZLES, isPuzzleComplete } from "@/lib/couple-crossword";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const BG = "#0A0C10";
const AMBER = "#FFB000";

type Icon = ComponentProps<typeof Ionicons>["name"];

export default function ScoreboardScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "YOU";
  const them = partner?.displayName || "THEM";
  const [cheer, setCheer] = useState<string | null>(null);
  const crosswordWon = data.crossword.some((save) => {
    const puzzle = CROSSWORD_PUZZLES.find((p) => p.id === save.puzzleId);
    return puzzle ? isPuzzleComplete(puzzle, save.letters) : false;
  });

  const badges: { id: string; label: string; icon: Icon; earned: boolean }[] = useMemo(
    () => [
      { id: "ping", label: "GHOST PING", icon: "heart", earned: data.pings.length > 0 },
      { id: "fire", label: "KINDLING", icon: "flame", earned: data.intimacy.length > 0 },
      { id: "quiz", label: "BOOTH ACE", icon: "help-circle", earned: data.triviaAttempts.length > 0 },
      { id: "bet", label: "MARKET", icon: "trending-up", earned: data.predictions.some((p) => p.resolved) },
      { id: "grid", label: "INK", icon: "grid", earned: crosswordWon },
      { id: "story", label: "CO-AUTHOR", icon: "book", earned: (data.story?.chapters.length ?? 0) > 0 },
      { id: "time", label: "CAPSULE", icon: "hourglass", earned: data.capsules.length > 0 },
      { id: "draw", label: "FRIDGE", icon: "brush", earned: data.doodle.strokes.length > 0 },
      { id: "dinner", label: "KITCHEN", icon: "restaurant", earned: data.meals.some((m) => m.eliminated) },
      { id: "fair", label: "WHEEL", icon: "sync", earned: data.fairSpins.length > 0 },
    ],
    [crosswordWon, data]
  );
  const earned = badges.filter((b) => b.earned).length;
  const cheers = ["MVP OF DISHES", "SOFTEST LANDING", "PLOT TWIST", "CLUTCH SNACK"];

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/play" as Href} accent={AMBER}>
        <View
          style={{
            backgroundColor: "#11140A",
            borderWidth: 8,
            borderColor: "#2A2A20",
            padding: 14,
          }}
        >
          <Text style={{ color: AMBER, fontFamily: "SpaceMono", fontSize: 11, textAlign: "center" }}>
            {you}  vs  THE WEEK  vs  {them}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SpaceMono",
              fontSize: 72,
              color: AMBER,
              letterSpacing: 4,
            }}
          >
            {ready ? String(earned).padStart(2, "0") : "--"}
          </Text>
          <Text style={{ textAlign: "center", color: "rgba(255,176,0,0.55)", fontFamily: "SpaceMono" }}>
            BADGES ON THE BOARD
          </Text>
        </View>

        <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {badges.map((badge) => (
            <View
              key={badge.id}
              style={{
                width: "48%",
                height: 72,
                backgroundColor: badge.earned ? "#1A1608" : "#0E1014",
                borderWidth: 1,
                borderColor: badge.earned ? AMBER : "#222",
                alignItems: "center",
                justifyContent: "center",
                opacity: badge.earned ? 1 : 0.35,
              }}
            >
              <Ionicons name={badge.icon} size={18} color={AMBER} />
              <Text style={{ marginTop: 4, color: AMBER, fontFamily: "SpaceMono", fontSize: 11 }}>
                {badge.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ marginTop: 20, color: AMBER, fontFamily: SERIF, fontSize: 22 }}>
          Send a cheer from the stands
        </Text>
        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {cheers.map((label) => (
            <Pressable
              key={label}
              onPress={() => {
                if (!user) return;
                setCheer(label);
                void patch((state) => ({
                  ...state,
                  cheers: [
                    { id: createId(), fromId: user.id, label, createdAt: nowIso() },
                    ...state.cheers,
                  ].slice(0, 20),
                }));
              }}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: AMBER,
              }}
            >
              <Text style={{ color: AMBER, fontFamily: "SpaceMono", fontSize: 11 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {cheer ? (
          <Text style={{ marginTop: 10, color: AMBER, fontFamily: "SpaceMono" }}>
            NOW SHOWING: {cheer}
          </Text>
        ) : null}
      </Stage>
    </Screen>
  );
}
