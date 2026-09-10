import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, JAR_TONE, SERIF } from "@/lib/app-themes";
import { useApp } from "@/lib/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

const T = JAR_TONE;

export default function JarNotesListScreen() {
  const router = useRouter();
  const { jarNotes } = useApp();
  const params = useLocalSearchParams<{ from?: string; name?: string }>();
  const fromId = typeof params.from === "string" ? params.from : "";
  const name =
    (typeof params.name === "string" && params.name.trim()) || "Notes";

  const notes = useMemo(
    () =>
      jarNotes
        .filter((note) => note.fromUserId === fromId && note.openedAt)
        .sort((a, b) =>
          (b.openedAt ?? b.createdAt).localeCompare(a.openedAt ?? a.createdAt)
        ),
    [fromId, jarNotes]
  );

  return (
    <Screen scroll background={T.background}>
      <View className="pt-4 pb-10">
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Opened notes
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 32,
            lineHeight: 38,
            color: T.ink,
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 15,
            lineHeight: 22,
            color: T.muted,
          }}
        >
          Newest received at the top.
        </Text>

        <View className="mt-6 gap-3">
          {notes.length === 0 ? (
            <View
              style={{
                borderRadius: 22,
                borderWidth: 1,
                borderColor: T.border,
                backgroundColor: T.surface,
                padding: 20,
              }}
            >
              <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.muted }}>
                No opened notes from {name} yet. When you open the jar together,
                kept notes land here.
              </Text>
            </View>
          ) : (
            notes.map((note) => (
              <View
                key={note.id}
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "rgba(120,90,40,0.22)",
                  backgroundColor: T.paper,
                  paddingHorizontal: 18,
                  paddingVertical: 18,
                }}
              >
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 10,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: "rgba(58,42,24,0.45)",
                  }}
                >
                  {note.openedAt
                    ? new Date(note.openedAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Opened"}
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: HANDWRITING,
                    fontSize: 22,
                    lineHeight: 32,
                    color: T.handwriting,
                  }}
                >
                  {note.body}
                </Text>
              </View>
            ))
          )}
        </View>

        <View className="mt-8">
          <PrimaryButton
            label="Back to the jar"
            tone="ghost"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </Screen>
  );
}
