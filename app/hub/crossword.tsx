import { Stage } from "@/components/hub/Stage";
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

const PAPER = "#E7DFC8";
const INK = "#1A140C";

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
      return {
        ...state,
        crossword: [
          { puzzleId: puzzle.id, letters: nextLetters },
          ...state.crossword.filter((row) => row.puzzleId !== puzzle.id),
        ],
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
    <Screen scroll background={PAPER}>
      <Stage background={PAPER} fallback={"/hub/play" as Href} accent="#8B1E1E">
        <View style={{ borderBottomWidth: 3, borderBottomColor: INK, paddingBottom: 8 }}>
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 40,
              color: INK,
              textAlign: "center",
            }}
          >
            The Us Times
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SpaceMono",
              fontSize: 10,
              color: INK,
              letterSpacing: 2,
            }}
          >
            SUNDAY MINI · VOL. 2 · LATE CITY
          </Text>
        </View>
        <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "center", gap: 12 }}>
          {CROSSWORD_PUZZLES.map((row) => (
            <Pressable key={row.id} onPress={() => setPuzzleId(row.id)}>
              <Text
                style={{
                  color: puzzleId === row.id ? "#8B1E1E" : INK,
                  fontFamily: SERIF,
                  fontSize: 16,
                  textDecorationLine: puzzleId === row.id ? "underline" : "none",
                }}
              >
                {row.title}
              </Text>
            </Pressable>
          ))}
        </View>
        {done ? (
          <Text
            style={{
              marginTop: 10,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 20,
              color: "#8B1E1E",
            }}
          >
            Solved over coffee. You’re dangerous.
          </Text>
        ) : null}

        <View
          style={{
            marginTop: 14,
            alignSelf: "center",
            transform: [{ rotate: "-0.4deg" }],
          }}
        >
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
                      style={{ width: 42, height: 42, backgroundColor: INK }}
                    />
                  );
                }
                return (
                  <View
                    key={key}
                    style={{
                      width: 42,
                      height: 42,
                      backgroundColor: active === key ? "#FFF6D6" : "#FAF4E6",
                      borderWidth: 1,
                      borderColor: INK,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {num ? (
                      <Text style={{ position: "absolute", top: 1, left: 3, fontSize: 8, color: INK }}>
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
                        color: INK,
                        textAlign: "center",
                        width: 36,
                      }}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ marginTop: 18, gap: 8 }}>
          {puzzle.entries.map((entry) => (
            <Text key={entry.id} style={{ color: INK, fontSize: 14, lineHeight: 20 }}>
              <Text style={{ fontWeight: "800" }}>
                {entry.num} {entry.dir}.{" "}
              </Text>
              {entry.clue}
            </Text>
          ))}
        </View>
        <Pressable onPress={() => void reveal()} style={{ marginTop: 14 }}>
          <Text style={{ color: "#8B1E1E", fontStyle: "italic" }}>
            Peek at the answers (the editor won’t tell)
          </Text>
        </Pressable>
        {!ready ? <Text style={{ color: INK }}>Setting type…</Text> : null}
      </Stage>
    </Screen>
  );
}
