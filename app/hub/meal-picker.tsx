import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { DEFAULT_MEALS } from "@/lib/mini-content";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const PAPER = "#EFE4C4";
const INK = "#2A1C10";
const STAMP = "#B42318";

export default function MealPickerScreen() {
  const { data, ready, patch } = useMiniApps();
  const [draft, setDraft] = useState("");
  const alive = data.meals.filter((row) => !row.eliminated);
  const winner = alive.length === 1 ? alive[0] : null;

  const add = async () => {
    if (!draft.trim()) return;
    await patch((state) => ({
      ...state,
      meals: [...state.meals, { id: createId(), label: draft.trim(), tag: "special", eliminated: false }],
    }));
    setDraft("");
  };

  const eliminate = async (id: string) => {
    if (winner) return;
    await patch((state) => ({
      ...state,
      meals: state.meals.map((row) => (row.id === id ? { ...row, eliminated: true } : row)),
    }));
  };

  const suddenDeath = async () => {
    if (alive.length <= 1) return;
    const keep = alive[Math.floor(Math.random() * alive.length)]!;
    await patch((state) => ({
      ...state,
      meals: state.meals.map((row) =>
        row.eliminated || row.id === keep.id ? row : { ...row, eliminated: true }
      ),
    }));
  };

  const reset = async () => {
    await patch((state) => ({
      ...state,
      meals: DEFAULT_MEALS.map((row) => ({
        id: createId(),
        label: row.label,
        tag: row.tag,
        eliminated: false,
      })),
    }));
  };

  return (
    <Screen scroll background="#2A1C10">
      <Stage background="#2A1C10" fallback={"/hub/home-base" as Href} accent={PAPER}>
        <View style={{ backgroundColor: PAPER, padding: 18, transform: [{ rotate: "-0.5deg" }] }}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "SpaceMono",
              fontSize: 11,
              color: INK,
              letterSpacing: 3,
            }}
          >
            TONIGHT’S BOARD
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 36,
              color: INK,
            }}
          >
            The kitchen
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontFamily: HANDWRITING,
              fontSize: 18,
              color: STAMP,
            }}
          >
            cross it off like you mean it
          </Text>

          {winner ? (
            <View style={{ marginTop: 16, alignItems: "center" }}>
              <Text style={{ fontFamily: "SpaceMono", color: STAMP, fontSize: 11 }}>
                THE SPECIAL
              </Text>
              <Text style={{ fontFamily: SERIF, fontSize: 32, color: INK, textAlign: "center" }}>
                {winner.label}
              </Text>
              <Pressable onPress={() => void reset()} style={{ marginTop: 8 }}>
                <Text style={{ fontFamily: HANDWRITING, fontSize: 18, color: STAMP }}>
                  reprint the menu
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={{ marginTop: 16, gap: 10 }}>
            {data.meals.map((row, i) => (
              <Pressable
                key={row.id}
                onPress={() => void eliminate(row.id)}
                style={{ paddingVertical: 6 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: i % 2 ? HANDWRITING : SERIF,
                      fontSize: 22,
                      color: INK,
                      textDecorationLine: row.eliminated ? "line-through" : "none",
                      opacity: row.eliminated ? 0.4 : 1,
                    }}
                  >
                    {row.label}
                  </Text>
                  {row.eliminated ? (
                    <Text
                      style={{
                        fontFamily: SERIF,
                        fontSize: 28,
                        color: STAMP,
                        transform: [{ rotate: "-12deg" }],
                      }}
                    >
                      NO
                    </Text>
                  ) : (
                    <Text style={{ color: "rgba(42,28,16,0.3)" }}>····</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {!winner ? (
            <Pressable
              onPress={() => void suddenDeath()}
              style={{
                marginTop: 16,
                borderWidth: 2,
                borderColor: STAMP,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: STAMP,
                  fontFamily: SERIF,
                  fontSize: 18,
                }}
              >
                Cleaver · {alive.length} left
              </Text>
            </Pressable>
          ) : null}

          <View style={{ marginTop: 14, flexDirection: "row", gap: 8 }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="add a special"
              style={{
                flex: 1,
                fontFamily: HANDWRITING,
                fontSize: 18,
                color: INK,
                borderBottomWidth: 1,
                borderBottomColor: INK,
              }}
            />
            <Pressable onPress={() => void add()}>
              <Text style={{ fontFamily: HANDWRITING, fontSize: 18, color: STAMP }}>add</Text>
            </Pressable>
          </View>
          {!ready ? <Text style={{ color: INK }}>Chalking the board…</Text> : null}
        </View>
      </Stage>
    </Screen>
  );
}
