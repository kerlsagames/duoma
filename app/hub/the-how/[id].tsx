import { HowPlainToggle } from "@/components/hub/HowPlainToggle";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HOW_TONE as T, SERIF } from "@/lib/app-themes";
import {
  bodyWordsFor,
  chapterMeta,
  forLabel,
  formatClock,
  howVoice,
  noteFor,
  padHowNumber,
  routineMinutes,
  statusLabel,
  techniqueById,
  upsertHowNote,
  type HowStatus,
  type HowTechnique,
} from "@/lib/the-how";
import { useMiniApps } from "@/lib/mini-apps";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const STATUSES: { id: HowStatus; label: string }[] = [
  { id: "want", label: "Want to try" },
  { id: "keep", label: "Keep this" },
  { id: "skip", label: "Not for us" },
];

type Session = {
  stepIndex: number;
  remaining: number;
  paused: boolean;
  finished: boolean;
};

export default function HowTechniqueScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, patch } = useMiniApps();
  const technique = id ? techniqueById(id) : null;
  const saved = technique ? noteFor(data.howNotes, technique.id) : null;
  const [draft, setDraft] = useState(saved?.note ?? "");
  const [session, setSession] = useState<Session | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const togglePlain = async () => {
    await patch((state) => ({ ...state, howPlainOn: !state.howPlainOn }));
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
  const minutes = routineMinutes(technique);
  const voice = howVoice(technique, data.howPlainOn);
  const terms = bodyWordsFor(technique.terms);
  const settingsCog = (
    <Pressable
      onPress={() => setSettingsOpen((value) => !value)}
      hitSlop={10}
      accessibilityLabel={settingsOpen ? "Close The How settings" : "The How settings"}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.06)",
      }}
    >
      <Ionicons
        name={settingsOpen ? "close" : "settings-outline"}
        size={20}
        color={T.rose}
      />
    </Pressable>
  );

  if (session) {
    return (
      <SessionTry
        technique={technique}
        session={session}
        setSession={setSession}
        savedStatus={saved?.status ?? null}
        onStatus={(status) => void setStatus(status)}
      />
    );
  }

  return (
    <Screen scroll background={T.background}>
      <Stage
        background={T.background}
        fallback={"/hub/the-how" as Href}
        accent={T.rose}
        right={settingsCog}
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.8,
            color: T.rose,
          }}
        >
          {padHowNumber(technique.number)} · {chapter.label.toUpperCase()} ·{" "}
          {forLabel(technique.for).toUpperCase()}
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
          {voice.promise}
        </Text>

        {settingsOpen ? (
          <View style={{ marginTop: 20 }}>
            <HowPlainToggle on={data.howPlainOn} onToggle={() => void togglePlain()} />
          </View>
        ) : (
          <>
            <Pressable
              onPress={() =>
                setSession({
                  stepIndex: 0,
                  remaining: technique.routine[0]!.durationSec,
                  paused: false,
                  finished: false,
                })
              }
              style={{
                marginTop: 18,
                borderRadius: 18,
                backgroundColor: T.rose,
                paddingVertical: 16,
                paddingHorizontal: 18,
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 10,
                  letterSpacing: 1.6,
                  color: T.paper,
                }}
              >
                GUIDED TRY
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: SERIF,
                  fontSize: 20,
                  color: T.paper,
                }}
              >
                Start the {minutes}-minute try
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  lineHeight: 18,
                  color: "rgba(255,247,242,0.82)",
                }}
              >
                {technique.routine.length} steps, written out below. The phone
                holds the clock.
              </Text>
            </Pressable>

            <View
              style={{
                marginTop: 18,
                borderRadius: 20,
                backgroundColor: T.paper,
                padding: 18,
                gap: 14,
              }}
            >
              <Block kicker="Where this happens" body={technique.where} />
              <Block kicker="What" body={voice.what} />
              <Block kicker="Why" body={voice.why} />
            </View>

            {terms.length ? (
              <>
                <Text
                  style={{
                    marginTop: 20,
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.4,
                    color: T.rose,
                  }}
                >
                  BODY WORDS ON THIS CARD
                </Text>
                <View style={{ marginTop: 10, gap: 8 }}>
                  {terms.map((row) => (
                    <View
                      key={row.id}
                      style={{
                        borderRadius: 14,
                        backgroundColor: T.surfaceRaised,
                        borderWidth: 1,
                        borderColor: T.border,
                        padding: 12,
                      }}
                    >
                      <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                        {row.word}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: SERIF,
                          fontSize: 14,
                          lineHeight: 20,
                          color: T.muted,
                        }}
                      >
                        {row.meaning}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            <Text
              style={{
                marginTop: 20,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: T.rose,
              }}
            >
              {technique.typesLabel.toUpperCase()}
            </Text>
            <View style={{ marginTop: 10, gap: 8 }}>
              {technique.types.map((row) => (
                <View
                  key={row.name}
                  style={{
                    borderRadius: 14,
                    backgroundColor: T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: T.border,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                    {row.name}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: SERIF,
                      fontSize: 14,
                      lineHeight: 20,
                      color: T.muted,
                    }}
                  >
                    {row.line}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={{
                marginTop: 20,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: T.rose,
              }}
            >
              THE TRY · {technique.routineLabel.toUpperCase()}
            </Text>
            <View style={{ marginTop: 10, gap: 10 }}>
              {technique.routine.map((row, index) => (
                <View
                  key={`${row.title}-${index}`}
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    paddingVertical: 8,
                    borderBottomWidth:
                      index === technique.routine.length - 1 ? 0 : 1,
                    borderBottomColor: T.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      color: T.rose,
                      width: 48,
                      marginTop: 3,
                    }}
                  >
                    {row.minutes}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: SERIF,
                        fontSize: 16,
                        color: T.ink,
                      }}
                    >
                      {row.title}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: SERIF,
                        fontSize: 14,
                        lineHeight: 20,
                        color: T.muted,
                      }}
                    >
                      {row.body}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text
              style={{
                marginTop: 20,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                color: T.rose,
              }}
            >
              {technique.signsLabel.toUpperCase()}
            </Text>
            <View
              style={{
                marginTop: 10,
                borderRadius: 16,
                backgroundColor: T.paper,
                padding: 16,
                gap: 8,
              }}
            >
              {voice.signs.map((line) => (
                <Text
                  key={line}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 15,
                    lineHeight: 22,
                    color: T.paperInk,
                  }}
                >
                  · {line}
                </Text>
              ))}
            </View>

            <View
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: T.surfaceRaised,
                borderWidth: 1,
                borderColor: T.border,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 10,
                  letterSpacing: 1.4,
                  color: T.rose,
                }}
              >
                SAY THIS
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 22,
                  lineHeight: 30,
                  color: T.ink,
                }}
              >
                “{technique.sayThis}”
              </Text>
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
                : "Untried. Mark it after the try, or after you talk."}
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
          </>
        )}
      </Stage>
    </Screen>
  );
}

function SessionTry({
  technique,
  session,
  setSession,
  savedStatus,
  onStatus,
}: {
  technique: HowTechnique;
  session: Session;
  setSession: (next: Session | null | ((prev: Session | null) => Session | null)) => void;
  savedStatus: HowStatus | null;
  onStatus: (status: HowStatus) => void;
}) {
  const routine = technique.routine;
  const step = routine[session.stepIndex] ?? routine[routine.length - 1]!;
  const total = useMemo(
    () => routine.reduce((sum, row) => sum + row.durationSec, 0),
    [technique.id]
  );
  const elapsed = useMemo(() => {
    const before = routine
      .slice(0, session.stepIndex)
      .reduce((sum, row) => sum + row.durationSec, 0);
    const into = Math.max(0, step.durationSec - session.remaining);
    return before + into;
  }, [session.stepIndex, session.remaining, technique.id]);

  useEffect(() => {
    if (session.paused || session.finished) return;
    const id = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.paused || prev.finished) return prev;
        if (prev.remaining <= 1) {
          const nextIndex = prev.stepIndex + 1;
          if (nextIndex >= routine.length) {
            return { ...prev, remaining: 0, finished: true };
          }
          return {
            stepIndex: nextIndex,
            remaining: routine[nextIndex]!.durationSec,
            paused: false,
            finished: false,
          };
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session.paused, session.finished, session.stepIndex]);

  const goNext = () => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.stepIndex + 1;
      if (nextIndex >= routine.length) {
        return { ...prev, remaining: 0, finished: true };
      }
      return {
        stepIndex: nextIndex,
        remaining: routine[nextIndex]!.durationSec,
        paused: false,
        finished: false,
      };
    });
  };

  return (
    <Screen scroll background={T.background}>
      <Stage background={T.background} fallback={"/hub/the-how" as Href} accent={T.rose}>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.8,
            color: T.rose,
          }}
        >
          {padHowNumber(technique.number)} · {technique.routineLabel.toUpperCase()}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 28,
            lineHeight: 34,
            color: T.ink,
          }}
        >
          {technique.name}
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
          {technique.where}
        </Text>

        {session.finished ? (
          <View
            style={{
              marginTop: 18,
              borderRadius: 20,
              backgroundColor: T.paper,
              padding: 18,
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 10,
                letterSpacing: 1.4,
                color: T.roseDeep,
              }}
            >
              TRY COMPLETE
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                fontSize: 22,
                lineHeight: 28,
                color: T.paperInk,
              }}
            >
              How was that for the two of you?
            </Text>
            <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {STATUSES.map((row) => {
                const on = savedStatus === row.id;
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => onStatus(row.id)}
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      backgroundColor: on ? T.rose : "rgba(255,247,242,0.08)",
                      borderWidth: 1,
                      borderColor: on ? T.rose : "rgba(255,247,242,0.18)",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 13,
                        color: on ? T.paper : T.paperInk,
                      }}
                    >
                      {row.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => setSession(null)}
              style={{
                marginTop: 18,
                borderRadius: 14,
                backgroundColor: T.rose,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: T.paper, fontWeight: "700", fontSize: 15 }}>
                Back to the card
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View
              style={{
                marginTop: 16,
                height: 6,
                borderRadius: 99,
                backgroundColor: T.surface,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.min(100, (elapsed / Math.max(1, total)) * 100)}%`,
                  height: 6,
                  backgroundColor: T.rose,
                }}
              />
            </View>
            <Text style={{ marginTop: 8, fontSize: 12, color: T.dim }}>
              Step {session.stepIndex + 1} of {routine.length}
              {session.paused ? " · paused" : ""}
            </Text>

            <View
              style={{
                marginTop: 14,
                borderRadius: 24,
                backgroundColor: T.paper,
                padding: 22,
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.6,
                  color: T.roseDeep,
                  textAlign: "center",
                }}
              >
                {step.minutes.toUpperCase()}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 48,
                  lineHeight: 54,
                  color: T.paperInk,
                  textAlign: "center",
                }}
              >
                {formatClock(session.remaining)}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontSize: 24,
                  lineHeight: 30,
                  color: T.paperInk,
                  textAlign: "center",
                }}
              >
                {step.title}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: SERIF,
                  fontSize: 16,
                  lineHeight: 24,
                  color: T.paperMuted,
                }}
              >
                {step.body}
              </Text>
            </View>

            <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() =>
                  setSession((prev) =>
                    prev ? { ...prev, paused: !prev.paused } : prev
                  )
                }
                style={{
                  flex: 1,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: T.surfaceRaised,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <Text style={{ fontWeight: "700", color: T.ink }}>
                  {session.paused ? "Resume" : "Pause"}
                </Text>
              </Pressable>
              <Pressable
                onPress={goNext}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: T.rose,
                }}
              >
                <Text style={{ fontWeight: "700", color: T.paper }}>
                  {session.stepIndex + 1 >= routine.length ? "Finish" : "Next step"}
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setSession(null)} style={{ marginTop: 14 }}>
              <Text style={{ color: T.dim, fontWeight: "700", textAlign: "center" }}>
                Stop the try
              </Text>
            </Pressable>
          </>
        )}
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
