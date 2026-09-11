import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { STORY_TRUNKS, storyById } from "@/lib/couple-story";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#100A0C";
const WINE = "#E08A8A";

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
      setError("A chapter needs at least one sentence.");
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

  const reset = async () => {
    await patch((state) => ({ ...state, story: null }));
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={WINE}
        fallback={"/hub/play" as Href}
        kicker="Fun · novella"
        title="Choose-your-own"
        body={`You take turns steering. ${them} writes the next scene. Nobody gets to skip the embarrassing paragraph.`}
        ready={ready}
      >
        {!data.story ? (
          <View style={{ marginTop: 16, gap: 12 }}>
            {STORY_TRUNKS.map((row) => (
              <Pressable
                key={row.id}
                onPress={() => void start(row.id)}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  backgroundColor: "#1A1014",
                  borderWidth: 1,
                  borderColor: "rgba(224,138,138,0.28)",
                }}
              >
                <Text style={{ color: WINE, fontSize: 12 }}>{row.kicker}</Text>
                <Text style={{ marginTop: 6, fontFamily: SERIF, fontSize: 24, color: "#F8E8E8" }}>
                  {row.title}
                </Text>
                <Text
                  numberOfLines={3}
                  style={{ marginTop: 8, color: "rgba(244,244,246,0.55)", lineHeight: 20 }}
                >
                  {row.opening}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: WINE, fontFamily: SERIF, fontSize: 22 }}>{trunk?.title}</Text>
            <View style={{ marginTop: 12, gap: 12 }}>
              {data.story.chapters.map((chapter) => (
                <View
                  key={chapter.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    backgroundColor:
                      chapter.authorId === "narrator" ? "#1A1014" : "rgba(224,138,138,0.1)",
                  }}
                >
                  <Text style={{ color: WINE, fontSize: 11, letterSpacing: 1 }}>
                    {chapter.authorId === "narrator"
                      ? "NARRATOR"
                      : chapter.authorId === user?.id
                        ? "YOU"
                        : them.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      fontFamily: SERIF,
                      fontSize: 17,
                      lineHeight: 26,
                      color: "#F6EDED",
                    }}
                  >
                    {chapter.body}
                  </Text>
                </View>
              ))}
            </View>

            {data.story.chapters.length === 1 && trunk ? (
              <View style={{ marginTop: 16, gap: 8 }}>
                {trunk.choices.map((choice) => (
                  <Pressable
                    key={choice.id}
                    onPress={() => void choose(choice.id)}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: WINE,
                    }}
                  >
                    <Text style={{ color: WINE, fontWeight: "700" }}>{choice.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: "rgba(244,244,246,0.5)", marginBottom: 8 }}>
                  {yourTurn
                    ? "Your turn to write the next beat."
                    : `Waiting on ${them} — or write anyway if they're asleep.`}
                </Text>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="The next sentence changes everything…"
                  placeholderTextColor="rgba(244,244,246,0.3)"
                  multiline
                  style={{
                    minHeight: 100,
                    borderRadius: 16,
                    padding: 12,
                    backgroundColor: "#1A1014",
                    color: "#F4F4F6",
                    fontFamily: SERIF,
                    fontSize: 16,
                  }}
                />
                <Pressable
                  onPress={() => void write()}
                  style={{
                    marginTop: 10,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: WINE,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#1A0808", fontWeight: "800" }}>Add the scene</Text>
                </Pressable>
                {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
              </View>
            )}
            <Pressable onPress={() => void reset()} style={{ marginTop: 18 }}>
              <Text style={{ color: "rgba(244,244,246,0.35)" }}>Abandon this story</Text>
            </Pressable>
          </View>
        )}
      </MiniChrome>
    </Screen>
  );
}
