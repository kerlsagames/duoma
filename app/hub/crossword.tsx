import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import {
  CROSSWORD_PUZZLES,
  cellNumber,
  crosswordKey,
  isPuzzleComplete,
  letterAt,
  puzzleCells,
} from "@/lib/couple-crossword";
import { useMiniApps } from "@/lib/mini-apps";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#0E1116";
const INK = "#D7E4F2";
const NAVY = "#8FA8C8";

export default function CrosswordScreen() {
  const { data, ready, patch } = useMiniApps();
  const [puzzleId, setPuzzleId] = useState(CROSSWORD_PUZZLES[0]!.id);
  const [active, setActive] = useState<string | null>(null);
  const puzzle = CROSSWORD_PUZZLES.find((p) => p.id === puzzleId)!;
  const save = data.crossword.find((row) => row.puzzleId === puzzle.id);
  const letters = save?.letters ?? {};
  const cells = useMemo(() => puzzleCells(puzzle), [puzzle]);
  const done = isPuzzleComplete(puzzle, letters);

  const setLetter = async (key: string, value: string) => {
    const ch = value.replace(/[^a-zA-Z]/g, "").slice(-1).toUpperCase();
    await patch((state) => {
      const current = state.crossword.find((row) => row.puzzleId === puzzle.id);
      const nextLetters = { ...(current?.letters ?? {}), [key]: ch };
      if (!ch) delete nextLetters[key];
      const rest = state.crossword.filter((row) => row.puzzleId !== puzzle.id);
      return {
        ...state,
        crossword: [{ puzzleId: puzzle.id, letters: nextLetters }, ...rest],
      };
    });
  };

  const reveal = async () => {
    const next: Record<string, string> = {};
    for (const key of cells) {
      const [r, c] = key.split("-").map(Number);
      const letter = letterAt(puzzle, r, c);
      if (letter) next[key] = letter;
    }
    await patch((state) => ({
      ...state,
      crossword: [
        { puzzleId: puzzle.id, letters: next },
        ...state.crossword.filter((row) => row.puzzleId !== puzzle.id),
      ],
    }));
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={NAVY}
        fallback={"/hub/play" as Href}
        kicker="Fun · sunday"
        title="Couple crossword"
        body="Mini puzzles from the private mythology. Ink optional. Cheating encouraged if it ends in a kiss."
        ready={ready}
      >
        <View style={{ marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CROSSWORD_PUZZLES.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setPuzzleId(row.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: puzzleId === row.id ? `${NAVY}33` : "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: puzzleId === row.id ? INK : "#F4F4F6" }}>{row.title}</Text>
            </Pressable>
          ))}
        </View>

        {done ? (
          <Text
            style={{
              marginTop: 14,
              fontFamily: SERIF,
              fontSize: 22,
              color: "#7CFFB2",
              textAlign: "center",
            }}
          >
            Filled. You're dangerous together.
          </Text>
        ) : null}

        <View style={{ marginTop: 16, alignItems: "center" }}>
          {Array.from({ length: puzzle.size }, (_, r) => (
            <View key={r} style={{ flexDirection: "row" }}>
              {Array.from({ length: puzzle.size }, (_, c) => {
                const key = crosswordKey(r, c);
                const live = cells.has(key);
                const num = cellNumber(puzzle, r, c);
                if (!live) {
                  return (
                    <View
                      key={key}
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: "#07090C",
                        borderWidth: 0.5,
                        borderColor: "#11151C",
                      }}
                    />
                  );
                }
                return (
                  <Pressable
                    key={key}
                    onPress={() => setActive(key)}
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: active === key ? "#243044" : "#F4F1EA",
                      borderWidth: 1,
                      borderColor: "#C9C2B4",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {num ? (
                      <Text
                        style={{
                          position: "absolute",
                          top: 2,
                          left: 3,
                          fontSize: 9,
                          color: "#333",
                        }}
                      >
                        {num}
                      </Text>
                    ) : null}
                    <TextInput
                      value={letters[key] ?? ""}
                      onFocus={() => setActive(key)}
                      onChangeText={(t) => void setLetter(key, t)}
                      maxLength={1}
                      autoCapitalize="characters"
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: "#1A140C",
                        textAlign: "center",
                        width: 40,
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          {puzzle.entries.map((entry) => (
            <View key={entry.id}>
              <Text style={{ color: NAVY, fontWeight: "700" }}>
                {entry.num} {entry.dir}
              </Text>
              <Text style={{ color: "rgba(244,244,246,0.7)" }}>{entry.clue}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={() => void reveal()} style={{ marginTop: 16 }}>
          <Text style={{ color: "rgba(244,244,246,0.4)" }}>Reveal answers (no judgment)</Text>
        </Pressable>
      </MiniChrome>
    </Screen>
  );
}
