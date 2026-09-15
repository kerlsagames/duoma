import { HowPlainToggle } from "@/components/hub/HowPlainToggle";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HOW_TONE as T, SERIF } from "@/lib/app-themes";
import { formatWeekRange } from "@/lib/dates";
import {
  chapterMeta,
  forLabel,
  HOW_BODY_WORDS,
  HOW_CHAPTERS,
  HOW_TECHNIQUES,
  HOW_WORDS,
  howVoice,
  keptTechniques,
  noteFor,
  padHowNumber,
  routineMinutes,
  statusLabel,
  techniquesInChapter,
  thisWeekKey,
  weekTechnique,
  type HowChapterId,
} from "@/lib/the-how";
import { useMiniApps } from "@/lib/mini-apps";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Tab = "studio" | "kept" | "words";

export default function TheHowScreen() {
  const router = useRouter();
  const { data, patch } = useMiniApps();
  const [tab, setTab] = useState<Tab>("studio");
  const [chapterId, setChapterId] = useState<HowChapterId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const weekKey = thisWeekKey();
  const week = useMemo(
    () => weekTechnique(data.howNotes, weekKey),
    [data.howNotes, weekKey]
  );
  const kept = useMemo(
    () => keptTechniques(data.howNotes),
    [data.howNotes]
  );
  const chapter = chapterId ? chapterMeta(chapterId) : null;
  const inChapter = chapterId ? techniquesInChapter(chapterId) : [];
  const keepCount = data.howNotes.filter((row) => row.status === "keep").length;
  const wantCount = data.howNotes.filter((row) => row.status === "want").length;

  const toggleWord = async (id: string) => {
    await patch((state) => {
      const on = state.howWordsOn.includes(id);
      return {
        ...state,
        howWordsOn: on
          ? state.howWordsOn.filter((item) => item !== id)
          : [...state.howWordsOn, id],
      };
    });
  };

  const togglePlain = async () => {
    await patch((state) => ({ ...state, howPlainOn: !state.howPlainOn }));
  };

  const weekVoice = howVoice(week, data.howPlainOn);

  return (
    <Screen scroll background={T.background}>
      <Stage
        background={T.background}
        fallback={"/hub/desire" as Href}
        accent={T.rose}
        right={
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
        }
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: T.rose,
          }}
        >
          Desire · The How
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 40,
            color: T.ink,
          }}
        >
          The book. A timed try.
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
          {HOW_TECHNIQUES.length} techniques. Each card says who does what, on
          which part of the body, then a timed try. Body words like hood and
          mons are translated on the card.
        </Text>

        {settingsOpen ? (
          <View style={{ marginTop: 22, gap: 14 }}>
            <HowPlainToggle on={data.howPlainOn} onToggle={() => void togglePlain()} />
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                lineHeight: 21,
                color: T.dim,
              }}
            >
              The try itself does not change — only the reading. Open Words for
              the full body map.
            </Text>
          </View>
        ) : null}

        {!settingsOpen ? (
        <>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            padding: 4,
            borderRadius: 16,
            backgroundColor: T.surface,
            borderWidth: 1,
            borderColor: T.border,
          }}
        >
          {(
            [
              ["studio", "Studio"],
              ["kept", "Kept"],
              ["words", "Words"],
            ] as const
          ).map(([id, label]) => {
            const on = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  setTab(id);
                  setChapterId(null);
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 10,
                  backgroundColor: on ? T.rose : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 15,
                    fontWeight: "700",
                    color: on ? T.paper : T.muted,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "studio" && !chapter ? (
          <View style={{ marginTop: 18 }}>
            <Pressable
              onPress={() => router.push(`/hub/the-how/${week.id}` as Href)}
              style={{
                borderRadius: 20,
                backgroundColor: T.paper,
                padding: 18,
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 10,
                  letterSpacing: 1.6,
                  color: T.roseDeep,
                }}
              >
                THIS WEEK · {formatWeekRange(weekKey).toUpperCase()}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontSize: 24,
                  lineHeight: 30,
                  color: T.paperInk,
                }}
              >
                {padHowNumber(week.number)}. {week.name}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: SERIF,
                  fontSize: 15,
                  lineHeight: 22,
                  color: T.paperMuted,
                }}
              >
                {weekVoice.promise}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  fontWeight: "700",
                  color: T.roseDeep,
                }}
              >
                {forLabel(week.for)} · {chapterMeta(week.chapter).label} ·{" "}
                {routineMinutes(week)}-min try →
              </Text>
            </Pressable>

            <Text
              style={{
                marginTop: 22,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: T.rose,
              }}
            >
              PARTS
            </Text>
            <View style={{ marginTop: 10, gap: 12 }}>
              {HOW_CHAPTERS.map((row) => {
                const count = techniquesInChapter(row.id).length;
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => setChapterId(row.id)}
                    style={{
                      borderRadius: 16,
                      backgroundColor: T.surfaceRaised,
                      borderWidth: 1,
                      borderColor: T.border,
                      padding: 16,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: SERIF,
                          fontSize: 22,
                          color: T.ink,
                        }}
                      >
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "SpaceMono",
                          fontSize: 11,
                          letterSpacing: 1.2,
                          color: T.rose,
                        }}
                      >
                        {row.range}
                      </Text>
                    </View>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        lineHeight: 19,
                        color: T.dim,
                      }}
                    >
                      {row.detail}
                    </Text>
                    <Text
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        color: T.rose,
                        fontWeight: "700",
                      }}
                    >
                      {count} techniques
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                fontSize: 13,
                color: T.dim,
              }}
            >
              {keepCount} kept · {wantCount} queued to try
            </Text>
          </View>
        ) : null}

        {tab === "studio" && chapter ? (
          <View style={{ marginTop: 18 }}>
            <Pressable
              onPress={() => setChapterId(null)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
            >
              <Ionicons name="chevron-back" size={18} color={T.rose} />
              <Text
                style={{
                  marginLeft: 4,
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.2,
                  color: T.rose,
                }}
              >
                ALL PARTS
              </Text>
            </Pressable>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 28,
                color: T.ink,
              }}
            >
              {chapter.label}
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 22,
                color: T.muted,
              }}
            >
              Techniques {chapter.range}. {chapter.detail}
            </Text>
            <View style={{ marginTop: 16, gap: 10 }}>
              {inChapter.map((row) => {
                const note = noteFor(data.howNotes, row.id);
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => router.push(`/hub/the-how/${row.id}` as Href)}
                    style={{
                      borderRadius: 16,
                      backgroundColor: T.paper,
                      padding: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "SpaceMono",
                        fontSize: 10,
                        letterSpacing: 1.2,
                        color: T.roseDeep,
                      }}
                    >
                      {padHowNumber(row.number)} · {forLabel(row.for).toUpperCase()}
                      {note?.status ? ` · ${statusLabel(note.status).toUpperCase()}` : ""}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: SERIF,
                        fontSize: 18,
                        color: T.paperInk,
                      }}
                    >
                      {row.name}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: SERIF,
                        fontSize: 14,
                        lineHeight: 20,
                        color: T.paperMuted,
                      }}
                    >
                      {howVoice(row, data.howPlainOn).promise}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {tab === "kept" ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            {kept.length === 0 ? (
              <View
                style={{
                  borderRadius: 18,
                  backgroundColor: T.paper,
                  padding: 18,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 18, color: T.paperInk }}>
                  Nothing kept yet.
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: SERIF,
                    fontSize: 14,
                    lineHeight: 20,
                    color: T.paperMuted,
                  }}
                >
                  Open this week’s card, or a part. Run the timed try. Mark Want
                  to try or Keep this — they land here so you are not starting
                  from zero next time.
                </Text>
              </View>
            ) : (
              kept.map((row) => {
                const note = noteFor(data.howNotes, row.id);
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => router.push(`/hub/the-how/${row.id}` as Href)}
                    style={{
                      borderRadius: 16,
                      backgroundColor: T.paper,
                      padding: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "SpaceMono",
                        fontSize: 10,
                        color: T.roseDeep,
                        letterSpacing: 1.2,
                      }}
                    >
                      {padHowNumber(row.number)} ·{" "}
                      {statusLabel(note?.status ?? null).toUpperCase()} ·{" "}
                      {chapterMeta(row.chapter).label.toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: SERIF,
                        fontSize: 18,
                        color: T.paperInk,
                      }}
                    >
                      {row.name}
                    </Text>
                    {note?.note ? (
                      <Text
                        style={{
                          marginTop: 6,
                          fontFamily: SERIF,
                          fontSize: 14,
                          color: T.paperMuted,
                        }}
                      >
                        {note.note}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </View>
        ) : null}

        {tab === "words" ? (
          <View style={{ marginTop: 18 }}>
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                lineHeight: 24,
                color: T.muted,
              }}
            >
              Pin the sentences you will actually say. Below that, the body
              map — hood, mons, and the rest.
            </Text>
            <Text
              style={{
                marginTop: 18,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: T.rose,
              }}
            >
              BODY WORDS
            </Text>
            <View style={{ marginTop: 10, gap: 10 }}>
              {HOW_BODY_WORDS.map((row) => (
                <View
                  key={row.id}
                  style={{
                    borderRadius: 16,
                    backgroundColor: T.surfaceRaised,
                    borderWidth: 1,
                    borderColor: T.border,
                    padding: 14,
                  }}
                >
                  <Text style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>
                    {row.word}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: SERIF,
                      fontSize: 14,
                      lineHeight: 21,
                      color: T.dim,
                    }}
                  >
                    {row.meaning}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              style={{
                marginTop: 22,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: T.rose,
              }}
            >
              SAY THIS
            </Text>
            <View style={{ marginTop: 10, gap: 10 }}>
              {HOW_WORDS.map((row) => {
                const on = data.howWordsOn.includes(row.id);
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => void toggleWord(row.id)}
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: on ? T.rose : T.border,
                      backgroundColor: on ? T.paper : T.surfaceRaised,
                      padding: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: SERIF,
                        fontSize: 20,
                        color: on ? T.paperInk : T.ink,
                      }}
                    >
                      “{row.word}”
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: SERIF,
                        fontSize: 14,
                        lineHeight: 20,
                        color: on ? T.paperMuted : T.dim,
                      }}
                    >
                      {row.meaning}
                    </Text>
                    <Text
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        fontWeight: "700",
                        color: on ? T.roseDeep : T.rose,
                      }}
                    >
                      {on ? "Pinned as ours" : "Pin for us"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
        </>
        ) : null}
      </Stage>
    </Screen>
  );
}
