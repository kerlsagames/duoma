import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { DEFAULT_MEALS } from "@/lib/mini-content";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#0A1410";
const TEAL = "#3ECFBF";

export default function MealPickerScreen() {
  const { data, ready, patch } = useMiniApps();
  const [draft, setDraft] = useState("");
  const alive = data.meals.filter((row) => !row.eliminated);
  const winner = alive.length === 1 ? alive[0] : null;
  const remaining = useMemo(() => alive, [alive]);

  const add = async () => {
    if (!draft.trim()) return;
    await patch((state) => ({
      ...state,
      meals: [
        ...state.meals,
        { id: createId(), label: draft.trim(), tag: "custom", eliminated: false },
      ],
    }));
    setDraft("");
  };

  const eliminate = async (id: string) => {
    if (winner) return;
    await patch((state) => ({
      ...state,
      meals: state.meals.map((row) =>
        row.id === id ? { ...row, eliminated: true } : row
      ),
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
    <Screen scroll background={BG}>
      <MiniChrome
        accent={TEAL}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · kitchen"
        title="Meal eliminator"
        body="Neither of you can pick. Cross dinners off like a murder board until the kitchen has spoken."
        ready={ready}
      >
        {winner ? (
          <View
            style={{
              marginTop: 18,
              padding: 22,
              borderRadius: 24,
              backgroundColor: "#10241C",
              borderWidth: 1,
              borderColor: TEAL,
              alignItems: "center",
            }}
          >
            <Text style={{ color: TEAL, fontFamily: "SpaceMono", fontSize: 11 }}>
              THE KITCHEN HAS SPOKEN
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 32,
                color: "#E8FFF8",
                textAlign: "center",
              }}
            >
              {winner.label}
            </Text>
            <Pressable onPress={() => void reset()} style={{ marginTop: 12 }}>
              <Text style={{ color: TEAL }}>Reset the board</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={{ marginTop: 16, gap: 8 }}>
          {data.meals.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => void eliminate(row.id)}
              disabled={row.eliminated || Boolean(winner)}
              style={{
                padding: 14,
                borderRadius: 16,
                backgroundColor: row.eliminated ? "#0C1814" : "#10241C",
                opacity: row.eliminated ? 0.45 : 1,
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  color: row.eliminated ? "rgba(244,244,246,0.35)" : "#F4F4F6",
                  textDecorationLine: row.eliminated ? "line-through" : "none",
                }}
              >
                {row.eliminated ? "✕  " : ""}
                {row.label}
              </Text>
              <Text style={{ color: TEAL, fontSize: 11, marginTop: 4 }}>{row.tag}</Text>
            </Pressable>
          ))}
        </View>

        {!winner ? (
          <Pressable
            onPress={() => void suddenDeath()}
            style={{
              marginTop: 14,
              height: 48,
              borderRadius: 14,
              backgroundColor: TEAL,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#06201C", fontWeight: "800" }}>
              Sudden death · {remaining.length} left
            </Text>
          </Pressable>
        ) : null}

        <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a contender"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={{
              flex: 1,
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#10241C",
              color: "#F4F4F6",
            }}
          />
          <Pressable onPress={() => void add()} style={{ justifyContent: "center" }}>
            <Text style={{ color: TEAL, fontWeight: "700" }}>Add</Text>
          </Pressable>
        </View>
        {data.meals.length === 0 ? (
          <EmptyHint text="Add a few dinners, then start crossing them off with prejudice." />
        ) : null}
      </MiniChrome>
    </Screen>
  );
}
