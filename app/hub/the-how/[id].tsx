import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HOW_TONE as T, SERIF } from "@/lib/app-themes";
import {
  chapterMeta,
  forLabel,
  noteFor,
  statusLabel,
  techniqueById,
  upsertHowNote,
  type HowStatus,
} from "@/lib/the-how";
import { useMiniApps } from "@/lib/mini-apps";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const STATUSES: { id: HowStatus; label: string }[] = [
  { id: "want", label: "Want to try" },
  { id: "keep", label: "Keep this" },
  { id: "skip", label: "Not for us" },
];

export default function HowTechniqueScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, patch } = useMiniApps();
  const technique = id ? techniqueById(id) : null;
  const saved = technique ? noteFor(data.howNotes, technique.id) : null;
  const [draft, setDraft] = useState(saved?.note ?? "");

  useEffect(() => {
    setDraft(saved?.note ?? "");
  }, [technique?.id]);

  const setStatus = async (status: HowStatus) => {
    if (!technique) return;
    const next = saved?.status === status ? null : status;
    await patch((state) => ({
      ...state,
      howNotes: upsertHowNote(state.howNotes, technique.id, { status: next }),
    }));
  };

  const saveNote = async () => {
    if (!technique) return;
    await patch((state) => ({
      ...state,
      howNotes: upsertHowNote(state.howNotes, technique.id, { note: draft }),
    }));
  };

  if (!technique) {
    return (
      <Screen scroll background={T.background}>
        <Stage
          background={T.background}
          fallback={"/hub/the-how" as Href}
          accent={T.rose}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 24, color: T.ink }}>
            That technique isn’t in the book.
          </Text>
          <Pressable onPress={() => router.replace("/hub/the-how" as Href)}>
            <Text style={{ marginTop: 12, color: T.rose, fontWeight: "700" }}>
              Back to The How
            </Text>
          </Pressable>
        </Stage>
      </Screen>
    );
  }

  const chapter = chapterMeta(technique.chapter);

  return (
    <Screen scroll background={T.background}>
      <Stage
        background={T.background}
        fallback={"/hub/the-how" as Href}
        accent={T.rose}
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.8,
            color: T.rose,
          }}
        >
          {chapter.label.toUpperCase()} · {forLabel(technique.for).toUpperCase()}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 32,
            lineHeight: 38,
            color: T.ink,
          }}
        >
          {technique.name}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 17,
            lineHeight: 24,
            color: T.muted,
          }}
        >
          {technique.promise}
        </Text>

        <View
          style={{
            marginTop: 20,
            borderRadius: 20,
            backgroundColor: T.paper,
            padding: 18,
            gap: 16,
          }}
        >
          <Block kicker="How" body={technique.how} />
          <Block kicker="First try" body={technique.firstTry} />
          <Block kicker="If you need to adjust" body={technique.adjust} />
          <View>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 10,
                letterSpacing: 1.4,
                color: T.roseDeep,
              }}
            >
              SAY THIS
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontSize: 20,
                lineHeight: 28,
                color: T.paperInk,
              }}
            >
              “{technique.sayThis}”
            </Text>
          </View>
          <Block kicker="Notice" body={technique.notice} />
        </View>

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.4,
            color: T.rose,
          }}
        >
          FOR THE TWO OF YOU
        </Text>
        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {STATUSES.map((row) => {
            const on = saved?.status === row.id;
            return (
              <Pressable
                key={row.id}
                onPress={() => void setStatus(row.id)}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: on ? T.rose : T.surfaceRaised,
                  borderWidth: 1,
                  borderColor: on ? T.rose : T.border,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 13,
                    color: on ? T.paper : T.ink,
                  }}
                >
                  {row.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ marginTop: 8, fontSize: 12, color: T.dim }}>
          {saved?.status
            ? `Marked: ${statusLabel(saved.status)}. Tap again to clear.`
            : "Untried. Mark it after you talk, or after you try."}
        </Text>

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.4,
            color: T.rose,
          }}
        >
          NOTE
        </Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={() => void saveNote()}
          placeholder="What to repeat. What to skip. A word that worked."
          placeholderTextColor={T.dim}
          multiline
          style={{
            marginTop: 8,
            minHeight: 96,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: T.border,
            backgroundColor: T.surfaceRaised,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: T.ink,
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 22,
          }}
        />
        {draft !== (saved?.note ?? "") ? (
          <Pressable onPress={() => void saveNote()} style={{ marginTop: 10 }}>
            <Text style={{ color: T.rose, fontWeight: "700" }}>Save note</Text>
          </Pressable>
        ) : null}
      </Stage>
    </Screen>
  );
}

function Block({ kicker, body }: { kicker: string; body: string }) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.4,
          color: T.roseDeep,
        }}
      >
        {kicker.toUpperCase()}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 16,
          lineHeight: 24,
          color: T.paperInk,
        }}
      >
        {body}
      </Text>
    </View>
  );
}
