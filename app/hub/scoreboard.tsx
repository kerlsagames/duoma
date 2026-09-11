import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import {
  CROSSWORD_PUZZLES,
  isPuzzleComplete,
} from "@/lib/couple-crossword";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const BG = "#100E08";
const GOLD = "#F0C75E";

type Badge = {
  id: string;
  label: string;
  detail: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  earned: boolean;
};

export default function ScoreboardScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "You";
  const them = partner?.displayName || "Them";
  const [cheer, setCheer] = useState<string | null>(null);

  const crosswordWon = data.crossword.some((save) => {
    const puzzle = CROSSWORD_PUZZLES.find((p) => p.id === save.puzzleId);
    return puzzle ? isPuzzleComplete(puzzle, save.letters) : false;
  });

  const badges: Badge[] = useMemo(
    () => [
      {
        id: "ping",
        label: "Ghost in the pocket",
        detail: "Sent a thought-of-you ping",
        icon: "heart",
        earned: data.pings.length > 0,
      },
      {
        id: "fire",
        label: "Kindling",
        detail: "Logged a closeness day",
        icon: "flame",
        earned: data.intimacy.length > 0,
      },
      {
        id: "quiz",
        label: "Know-it-all",
        detail: "Finished How Well Do You Know Me",
        icon: "help-circle",
        earned: data.triviaAttempts.length > 0,
      },
      {
        id: "bet",
        label: "Market maker",
        detail: "Settled a prediction",
        icon: "trending-up",
        earned: data.predictions.some((p) => p.resolved),
      },
      {
        id: "grid",
        label: "Sunday ink",
        detail: "Finished a couple crossword",
        icon: "grid",
        earned: crosswordWon,
      },
      {
        id: "story",
        label: "Co-author",
        detail: "Wrote a chapter together",
        icon: "book",
        earned: (data.story?.chapters.length ?? 0) > 0,
      },
      {
        id: "time",
        label: "Time traveler",
        detail: "Sealed a scrapbook capsule",
        icon: "hourglass",
        earned: data.capsules.length > 0,
      },
      {
        id: "draw",
        label: "Fridge artist",
        detail: "Left a mark on the canvas",
        icon: "brush",
        earned: data.doodle.strokes.length > 0,
      },
      {
        id: "dinner",
        label: "The kitchen has spoken",
        detail: "Let the eliminator pick dinner",
        icon: "restaurant",
        earned: data.meals.some((m) => m.eliminated),
      },
      {
        id: "fair",
        label: "Wheel of chores",
        detail: "Spun the fair-share wheel",
        icon: "sync",
        earned: data.fairSpins.length > 0,
      },
    ],
    [crosswordWon, data]
  );

  const earned = badges.filter((b) => b.earned).length;
  const cheers = ["MVP of the dishes", "Softest landing", "Plot twist", "Clutch snack run"];

  const sendCheer = async (label: string) => {
    if (!user) return;
    await patch((state) => ({
      ...state,
      cheers: [
        { id: createId(), fromId: user.id, label, createdAt: nowIso() },
        ...state.cheers,
      ].slice(0, 20),
    }));
    setCheer(label);
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={GOLD}
        fallback={"/hub/play" as Href}
        kicker="Fun · trophy case"
        title="Partner scoreboard"
        body={`${you} vs the week — not vs ${them}. Badges for the tiny legends.`}
        ready={ready}
      >
        <View
          style={{
            marginTop: 16,
            padding: 18,
            borderRadius: 22,
            backgroundColor: "#1A160C",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(240,199,94,0.3)",
          }}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 56, color: GOLD }}>{earned}</Text>
          <Text style={{ color: "rgba(244,244,246,0.6)" }}>
            of {badges.length} badges unlocked
          </Text>
        </View>

        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {badges.map((badge) => (
            <View
              key={badge.id}
              style={{
                width: "47%",
                padding: 12,
                borderRadius: 16,
                backgroundColor: badge.earned ? "rgba(240,199,94,0.14)" : "#16130C",
                opacity: badge.earned ? 1 : 0.45,
                minHeight: 110,
              }}
            >
              <Ionicons name={badge.icon} size={22} color={GOLD} />
              <Text style={{ marginTop: 8, color: "#F4F4F6", fontWeight: "700" }}>
                {badge.label}
              </Text>
              <Text style={{ marginTop: 4, color: "rgba(244,244,246,0.5)", fontSize: 12 }}>
                {badge.detail}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(240,199,94,0.7)",
          }}
        >
          SEND A CHEER
        </Text>
        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {cheers.map((label) => (
            <Pressable
              key={label}
              onPress={() => void sendCheer(label)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: GOLD,
              }}
            >
              <Text style={{ color: GOLD }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {cheer ? (
          <Text style={{ marginTop: 10, color: GOLD }}>Pinned: {cheer}</Text>
        ) : null}
        {data.cheers.length > 0 ? (
          <View style={{ marginTop: 12, gap: 6 }}>
            {data.cheers.slice(0, 6).map((row) => (
              <Text key={row.id} style={{ color: "rgba(244,244,246,0.5)" }}>
                ★ {row.label}
              </Text>
            ))}
          </View>
        ) : null}
      </MiniChrome>
    </Screen>
  );
}
