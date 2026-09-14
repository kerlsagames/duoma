import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import {
  applyGuess,
  emptyWordle,
  ensureWordleDay,
  finished,
  KEY_ROWS,
  keyMarks,
  playerFor,
  scoreGuess,
  themeFor,
  winnerOf,
  wordleDay,
  WORDLE_THEMES,
  type LetterMark,
  type WordlePlayer,
  type WordleTheme,
} from "@/lib/daily-word";
import { formatClockTime, formatLongDate, localDateKey } from "@/lib/dates";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function DailyWordScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const youId = user?.id ?? "you";
  const themId = partner?.id ?? "partner";
  const youName = user?.displayName || "You";
  const themName = partner?.displayName || "Partner";
  const dateKey = localDateKey();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    void patch((state) => {
      const current = state.wordle ?? emptyWordle();
      const next = ensureWordleDay(current, dateKey);
      if (next === current) return state;
      return { ...state, wordle: next };
    });
  }, [ready, dateKey, patch]);

  const wordle = data.wordle ?? emptyWordle();
  const day = wordleDay(wordle, dateKey);
  const mine = playerFor(day, youId);
  const theirs = playerFor(day, themId);
  const theme = themeFor(wordle.prefs);
  const keys = useMemo(() => keyMarks(mine.guesses, day.word), [mine.guesses, day.word]);
  const done = finished(mine);
  const winner = winnerOf(day);
  const showAnswer = done;
  const showTheirGrid = done || finished(theirs);

  const typeLetter = (ch: string) => {
    if (done) return;
    setError(null);
    setDraft((prev) => (prev.length >= 5 ? prev : prev + ch));
  };

  const del = () => {
    setError(null);
    setDraft((prev) => prev.slice(0, -1));
  };

  const enter = () => {
    const result = applyGuess(wordle, youId, draft, dateKey);
    if (result.error) {
      setError(result.error);
      return;
    }
    void patch((state) => ({
      ...state,
      wordle: applyGuess(state.wordle ?? emptyWordle(), youId, draft, dateKey).state,
    }));
    setDraft("");
    setError(null);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (event: KeyboardEvent) => {
      if (settingsOpen || done) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (key === "Enter") {
        event.preventDefault();
        enter();
      } else if (key === "Backspace") {
        event.preventDefault();
        del();
      } else if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        typeLetter(key.toUpperCase());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, done, draft, wordle, youId, dateKey]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen scroll background={theme.bg}>
        <Stage background={theme.bg} fallback={"/hub/play" as Href} accent={theme.accent}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 2,
                  color: theme.muted,
                }}
              >
                {formatLongDate(dateKey).toUpperCase()}
              </Text>
              <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 32, color: theme.text }}>
                Daily Word
              </Text>
              <Text style={{ marginTop: 4, color: theme.muted, fontFamily: SERIF, fontSize: 16 }}>
                Same five-letter word. Six tries. First to land it wins.
              </Text>
            </View>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              accessibilityLabel="Daily Word settings"
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="settings-outline" size={20} color={theme.text} />
            </Pressable>
          </View>

          <RaceCard
            theme={theme}
            youName={youName}
            themName={themName}
            mine={mine}
            theirs={theirs}
            winnerId={winner?.userId ?? null}
          />

          <Board
            theme={theme}
            guesses={mine.guesses}
            draft={done ? "" : draft}
            answer={day.word}
          />

          {error ? (
            <Text style={{ marginTop: 10, textAlign: "center", color: theme.accent, fontFamily: SERIF }}>
              {error}
            </Text>
          ) : null}

          {showAnswer ? (
            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                fontFamily: SERIF,
                fontSize: 18,
                color: theme.text,
              }}
            >
              {mine.solvedAt
                ? `You got ${day.word} in ${mine.guesses.length}.`
                : `It was ${day.word}.`}
            </Text>
          ) : null}

          {!done ? (
            <Keyboard theme={theme} marks={keys} onLetter={typeLetter} onEnter={enter} onDelete={del} />
          ) : (
            <PartnerBoard
              theme={theme}
              name={themName}
              player={theirs}
              answer={day.word}
              reveal={showTheirGrid}
            />
          )}
          <View style={{ height: 24 }} />
        </Stage>
      </Screen>

      {settingsOpen ? (
        <SettingsSheet
          theme={theme}
          themeId={wordle.prefs.themeId}
          colorBlind={wordle.prefs.colorBlind}
          hardMode={wordle.prefs.hardMode}
          onClose={() => setSettingsOpen(false)}
          onTheme={(themeId) =>
            void patch((state) => {
              const current = state.wordle ?? emptyWordle();
              return {
                ...state,
                wordle: { ...current, prefs: { ...current.prefs, themeId } },
              };
            })
          }
          onColorBlind={(colorBlind) =>
            void patch((state) => {
              const current = state.wordle ?? emptyWordle();
              return {
                ...state,
                wordle: { ...current, prefs: { ...current.prefs, colorBlind } },
              };
            })
          }
          onHard={(hardMode) =>
            void patch((state) => {
              const current = state.wordle ?? emptyWordle();
              return {
                ...state,
                wordle: { ...current, prefs: { ...current.prefs, hardMode } },
              };
            })
          }
        />
      ) : null}
    </View>
  );
}

function RaceCard({
  theme,
  youName,
  themName,
  mine,
  theirs,
  winnerId,
}: {
  theme: WordleTheme;
  youName: string;
  themName: string;
  mine: WordlePlayer;
  theirs: WordlePlayer;
  winnerId: string | null;
}) {
  return (
    <View
      style={{
        marginTop: 12,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 12,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 2,
          color: theme.muted,
        }}
      >
        WHO FIRST
      </Text>
      <View style={{ marginTop: 8, flexDirection: "row", gap: 10 }}>
        <Seat theme={theme} name={youName} player={mine} won={winnerId === mine.userId} />
        <Seat theme={theme} name={themName} player={theirs} won={winnerId === theirs.userId} />
      </View>
    </View>
  );
}

function Seat({
  theme,
  name,
  player,
  won,
}: {
  theme: WordleTheme;
  name: string;
  player: WordlePlayer;
  won: boolean;
}) {
  const line = player.solvedAt
    ? `${player.guesses.length}/6 · ${formatClockTime(player.solvedAt)}`
    : player.guesses.length >= 6
      ? "Missed"
      : player.guesses.length
        ? `${player.guesses.length}/6 going`
        : "Not started";
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: won ? theme.accent : theme.border,
        backgroundColor: won ? `${theme.accent}22` : "transparent",
      }}
    >
      <Text style={{ fontFamily: SERIF, fontSize: 15, color: theme.text }} numberOfLines={1}>
        {name}
        {won ? " · first" : ""}
      </Text>
      <Text style={{ marginTop: 4, color: theme.muted, fontSize: 12 }}>{line}</Text>
    </View>
  );
}

function Board({
  theme,
  guesses,
  draft,
  answer,
}: {
  theme: WordleTheme;
  guesses: string[];
  draft: string;
  answer: string;
}) {
  const rows = Array.from({ length: 6 }, (_, i) => {
    if (guesses[i]) return { word: guesses[i]!, marks: scoreGuess(guesses[i]!, answer) };
    if (i === guesses.length) return { word: draft.padEnd(5, " "), marks: null };
    return { word: "     ", marks: null };
  });
  return (
    <View style={{ marginTop: 14, alignItems: "center", gap: 6 }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: "row", gap: 6 }}>
          {row.word.split("").map((ch, c) => {
            const mark = row.marks?.[c] ?? null;
            const filled = ch.trim().length > 0 && !mark;
            return (
              <View
                key={`${r}-${c}`}
                style={{
                  width: 48,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: mark ? theme[mark] : theme.empty,
                  borderWidth: 2,
                  borderColor: mark ? theme[mark] : filled ? theme.text : theme.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 22,
                    fontWeight: "800",
                    color: mark ? "#FFFFFF" : theme.text,
                  }}
                >
                  {ch.trim()}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Keyboard({
  theme,
  marks,
  onLetter,
  onEnter,
  onDelete,
}: {
  theme: WordleTheme;
  marks: Record<string, LetterMark>;
  onLetter: (ch: string) => void;
  onEnter: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={{ marginTop: 16, gap: 6 }}>
      {KEY_ROWS.map((row, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
          {row.map((key) => {
            const wide = key === "ENTER" || key === "DEL";
            const mark = marks[key];
            return (
              <Pressable
                key={key}
                onPress={() => {
                  if (key === "ENTER") onEnter();
                  else if (key === "DEL") onDelete();
                  else onLetter(key);
                }}
                style={{
                  flex: wide ? 1.45 : 1,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: mark ? theme[mark] : theme.key,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    color: mark ? "#FFFFFF" : theme.keyText,
                    fontSize: wide ? 11 : 13,
                    fontWeight: "800",
                  }}
                >
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function PartnerBoard({
  theme,
  name,
  player,
  answer,
  reveal,
}: {
  theme: WordleTheme;
  name: string;
  player: WordlePlayer;
  answer: string;
  reveal: boolean;
}) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          textAlign: "center",
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2,
          color: theme.muted,
        }}
      >
        {name.toUpperCase()}
      </Text>
      {reveal && player.guesses.length > 0 ? (
        <Board theme={theme} guesses={player.guesses} draft="" answer={answer} />
      ) : (
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            color: theme.muted,
            fontFamily: SERIF,
          }}
        >
          {player.guesses.length
            ? `${name} is on guess ${player.guesses.length}. Their grid unlocks when you finish.`
            : `${name} hasn’t started today.`}
        </Text>
      )}
    </View>
  );
}

function SettingsSheet({
  theme,
  themeId,
  colorBlind,
  hardMode,
  onClose,
  onTheme,
  onColorBlind,
  onHard,
}: {
  theme: WordleTheme;
  themeId: string;
  colorBlind: boolean;
  hardMode: boolean;
  onClose: () => void;
  onTheme: (id: (typeof WORDLE_THEMES)[number]["id"]) => void;
  onColorBlind: (on: boolean) => void;
  onHard: (on: boolean) => void;
}) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        justifyContent: "flex-end",
        paddingBottom: 70,
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close Daily Word settings"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(8,8,12,0.72)",
        }}
      />
      <View
        style={{
          width: "100%",
          maxHeight: "88%",
          backgroundColor: theme.surface,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 18,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: 1,
          borderColor: theme.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                color: theme.muted,
              }}
            >
              LOOK
            </Text>
            <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 22, color: theme.text }}>
              Settings
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={theme.text} />
          </Pressable>
        </View>
        <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: 28 }}>
          <Text style={{ color: theme.muted, fontSize: 13, marginBottom: 10 }}>
            Same word for both of you today. Six tries. Green stays, gold moves, grey is out.
          </Text>
          {WORDLE_THEMES.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onTheme(item.id)}
              style={{
                marginBottom: 8,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: themeId === item.id ? theme.accent : theme.border,
                backgroundColor: themeId === item.id ? `${theme.accent}22` : "transparent",
              }}
            >
              <Text style={{ color: theme.text, fontFamily: SERIF, fontSize: 16 }}>{item.label}</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => onColorBlind(!colorBlind)}
            style={{
              marginTop: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
            }}
          >
            <View>
              <Text style={{ color: theme.text, fontSize: 16 }}>Colour-blind marks</Text>
              <Text style={{ marginTop: 2, color: theme.muted, fontSize: 12 }}>
                Orange for right place, blue for in the word.
              </Text>
            </View>
            <Ionicons
              name={colorBlind ? "checkbox" : "square-outline"}
              size={22}
              color={colorBlind ? theme.accent : theme.muted}
            />
          </Pressable>
          <Pressable
            onPress={() => onHard(!hardMode)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: theme.text, fontSize: 16 }}>Hard mode</Text>
              <Text style={{ marginTop: 2, color: theme.muted, fontSize: 12 }}>
                Revealed hints must be used in the next guess.
              </Text>
            </View>
            <Ionicons
              name={hardMode ? "checkbox" : "square-outline"}
              size={22}
              color={hardMode ? theme.accent : theme.muted}
            />
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}
