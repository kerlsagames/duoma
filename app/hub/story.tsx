import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { STORY_TRUNKS, storyById } from "@/lib/couple-story";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#1A1014";
const PAGE = "#F3E6D0";
const INK = "#2A1814";
const WINE = "#7A2030";

export default function StoryScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const them = partner?.displayName || "them";
  const trunk = data.story ? storyById(data.story.trunkId) : null;
  const last = data.story?.chapters.at(-1) ?? null;
  const yourTurn = !last || last.authorId !== user?.id;

  const start = async (trunkId: string) => {
    const chosen = storyById(trunkId);
    if (!chosen || !user) return;
    await patch((state) => ({
      ...state,
      story: {
        trunkId,
        chapters: [
          {
            id: createId(),
            authorId: "narrator",
            body: chosen.opening,
            choiceId: null,
            createdAt: nowIso(),
          },
        ],
      },
    }));
  };

  const choose = async (choiceId: string) => {
    if (!trunk || !user || !data.story) return;
    const choice = trunk.choices.find((row) => row.id === choiceId);
    if (!choice) return;
    await patch((state) => ({
      ...state,
      story: state.story
        ? {
            ...state.story,
            chapters: [
              ...state.story.chapters,
              {
                id: createId(),
                authorId: user.id,
                body: choice.continuation,
                choiceId,
                createdAt: nowIso(),
              },
            ],
          }
        : state.story,
    }));
  };

  const write = async () => {
    if (!user || !data.story) return;
    if (!draft.trim()) {
      setError("A chapter needs ink.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      story: state.story
        ? {
            ...state.story,
            chapters: [
              ...state.story.chapters,
              {
                id: createId(),
                authorId: user.id,
                body: draft.trim(),
                choiceId: null,
                createdAt: nowIso(),
              },
            ],
          }
        : state.story,
    }));
    setDraft("");
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/play" as Href} accent={PAGE}>
        {!data.story ? (
          <View>
            <Text
              style={{
                textAlign: "center",
                fontFamily: SERIF,
                fontSize: 36,
                color: PAGE,
              }}
            >
              Open a book
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontFamily: HANDWRITING,
                fontSize: 18,
                color: "rgba(243,230,208,0.65)",
                marginBottom: 16,
              }}
            >
              {them} writes the next page
            </Text>
            {STORY_TRUNKS.map((row) => (
              <Pressable
                key={row.id}
                onPress={() => void start(row.id)}
                style={{
                  marginBottom: 14,
                  backgroundColor: PAGE,
                  padding: 16,
                  transform: [{ rotate: row.id === "cabin-key" ? "1deg" : "-1deg" }],
                }}
              >
                <Text style={{ color: WINE, fontFamily: "SpaceMono", fontSize: 10 }}>
                  {row.kicker.toUpperCase()}
                </Text>
                <Text style={{ fontFamily: SERIF, fontSize: 26, color: INK }}>{row.title}</Text>
                <Text
                  numberOfLines={3}
                  style={{ marginTop: 8, color: "rgba(42,24,20,0.7)", lineHeight: 20 }}
                >
                  {row.opening}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View
            style={{
              backgroundColor: PAGE,
              padding: 18,
              minHeight: 520,
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 28, color: INK }}>{trunk?.title}</Text>
            <View style={{ height: 1, backgroundColor: WINE, marginVertical: 10 }} />
            {data.story.chapters.map((chapter, i) => (
              <View key={chapter.id} style={{ marginBottom: 14 }}>
                <Text style={{ color: WINE, fontFamily: "SpaceMono", fontSize: 10 }}>
                  {chapter.authorId === "narrator"
                    ? "NARRATOR"
                    : chapter.authorId === user?.id
                      ? "YOU"
                      : them.toUpperCase()}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: i === 0 ? SERIF : HANDWRITING,
                    fontSize: i === 0 ? 16 : 18,
                    lineHeight: 24,
                    color: INK,
                  }}
                >
                  {chapter.body}
                </Text>
              </View>
            ))}
            {data.story.chapters.length === 1 && trunk ? (
              <View style={{ gap: 8, marginTop: 8 }}>
                {trunk.choices.map((choice) => (
                  <Pressable
                    key={choice.id}
                    onPress={() => void choose(choice.id)}
                    style={{ borderBottomWidth: 1, borderBottomColor: WINE, paddingVertical: 8 }}
                  >
                    <Text style={{ color: WINE, fontFamily: SERIF, fontSize: 18 }}>
                      ✦ {choice.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: "rgba(42,24,20,0.5)", fontFamily: HANDWRITING, fontSize: 16 }}>
                  {yourTurn ? "Your turn. Don’t waste the page." : `Waiting on ${them} — or steal the pen.`}
                </Text>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                  placeholder="The next sentence changes the weather…"
                  style={{
                    marginTop: 8,
                    minHeight: 90,
                    fontFamily: HANDWRITING,
                    fontSize: 18,
                    color: INK,
                  }}
                />
                <Pressable
                  onPress={() => void write()}
                  style={{
                    height: 44,
                    backgroundColor: WINE,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: PAGE, fontWeight: "800" }}>Turn the page</Text>
                </Pressable>
                {error ? <Text style={{ marginTop: 6, color: WINE }}>{error}</Text> : null}
              </View>
            )}
            <Pressable
              onPress={() => void patch((s) => ({ ...s, story: null }))}
              style={{ marginTop: 16 }}
            >
              <Text style={{ color: "rgba(42,24,20,0.4)" }}>Close the book</Text>
            </Pressable>
          </View>
        )}
        {!ready ? <Text style={{ color: PAGE }}>Finding the spine…</Text> : null}
      </Stage>
    </Screen>
  );
}
