import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import {
  applyDoodleScore,
  categoryForPrompt,
  chooseDoodlePrompt,
  DEFAULT_DOODLE_CATEGORIES,
  dealDoodleOptions,
  DOODLE_CATEGORIES,
  doodleCategoryLabel,
  leaveDoodleDrawing,
  recentPrompts,
  startDoodleRound,
  submitDoodleGuess,
  toggleDoodleCategory,
  type DoodlePoint,
  type DoodleRound,
  type DoodleStroke,
} from "@/lib/doodle-game";
import { PokeThem } from "@/components/ui/PokeThem";
import { nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Line, Path } from "react-native-svg";

const BG = "#2A241C";
const PAPER = "#F3E6C4";
const INK = "#2A1C12";
const MUTED = "rgba(243,230,196,0.62)";
const PALETTE = ["#2A1C12", "#C23B3B", "#1F6B5A", "#2A4A8B", "#D4A017", "#7A3E8B"];

function toPath(points: DoodlePoint[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")}`;
}

function seatFor(
  round: DoodleRound | null,
  youId: string
): "drawer" | "guesser" | "none" {
  if (!round) return "none";
  if (round.guesserId && youId === round.guesserId) return "guesser";
  if (round.drawerId && youId === round.drawerId) return "drawer";
  return "none";
}

export default function DoodleScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const youId = user?.id ?? "you";
  const themId = partner?.id ?? "partner";
  const youName = user?.displayName || "You";
  const themName = partner?.displayName || "Partner";
  const [color, setColor] = useState(PALETTE[0]!);
  const [width, setWidth] = useState(3);
  const [live, setLive] = useState<DoodleStroke | null>(null);
  const [guess, setGuess] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const look = useAppLook("doodle", PAPER, {});

  const board = data.doodle;
  const round = board.round;
  const seat = seatFor(round, youId);

  useEffect(() => {
    setGuess("");
    setError(null);
  }, [round?.id, round?.status]);

  const colorRef = useRef(color);
  const widthRef = useRef(width);
  const canDrawRef = useRef(false);
  colorRef.current = color;
  widthRef.current = width;
  canDrawRef.current =
    ready && !settingsOpen && round?.status === "draw" && seat === "drawer";

  const commitStroke = (stroke: DoodleStroke) => {
    void patch((state) => {
      const current = state.doodle.round;
      if (!current || current.status !== "draw") return state;
      const strokes = [...current.strokes, stroke].slice(-80);
      return {
        ...state,
        doodle: {
          ...state.doodle,
          strokes,
          round: { ...current, strokes },
          updatedAt: nowIso(),
          updatedBy: youId,
        },
      };
    });
  };

  const commitRef = useRef(commitStroke);
  commitRef.current = commitStroke;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canDrawRef.current,
      onMoveShouldSetPanResponder: () => canDrawRef.current,
      onPanResponderGrant: (e) => {
        if (!canDrawRef.current) return;
        const { locationX, locationY } = e.nativeEvent;
        setLive({
          color: colorRef.current,
          width: widthRef.current,
          points: [{ x: locationX, y: locationY }],
        });
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setLive((prev) =>
          prev ? { ...prev, points: [...prev.points, { x: locationX, y: locationY }] } : prev
        );
      },
      onPanResponderRelease: () => {
        setLive((prev) => {
          if (prev && prev.points.length > 1) commitRef.current(prev);
          return null;
        });
      },
    })
  ).current;

  const nameFor = (id: string) => {
    if (id === youId) return youName;
    if (id === themId) return themName;
    return id === "partner" ? themName : youName;
  };

  const youScore = board.scores[youId] ?? 0;
  const themScore = board.scores[themId] ?? 0;
  const drawingStrokes = round?.strokes?.length ? round.strokes : board.strokes;
  const strokes = live ? [...drawingStrokes, live] : drawingStrokes;
  const drawing = ready && round?.status === "draw" && seat === "drawer";

  const updateBoard = (
    next: (current: typeof board) => typeof board | void
  ) => {
    void patch((state) => {
      const changed = next(state.doodle);
      if (!changed) return state;
      return { ...state, doodle: changed };
    });
  };

  const dealRound = (drawerId: string, guesserId: string) => {
    updateBoard((current) => ({
      ...current,
      round: startDoodleRound(
        drawerId,
        guesserId,
        current.enabledCategories,
        recentPrompts(current.history, current.round)
      ),
      strokes: [],
      updatedAt: nowIso(),
      updatedBy: youId,
    }));
    setSettingsOpen(false);
  };

  const pickPrompt = (prompt: string) => {
    if (!round) return;
    updateBoard((current) => {
      if (!current.round) return current;
      return {
        ...current,
        round: chooseDoodlePrompt(current.round, prompt),
        updatedAt: nowIso(),
        updatedBy: youId,
      };
    });
  };

  const skipOptions = () => {
    if (!round) return;
    updateBoard((current) => {
      if (!current.round) return current;
      const deal = dealDoodleOptions(current.enabledCategories, [
        ...recentPrompts(current.history, current.round),
        ...current.round.options,
      ]);
      return {
        ...current,
        round: {
          ...current.round,
          options: deal.options,
          category: deal.category,
          prompt: null,
        },
        updatedAt: nowIso(),
        updatedBy: youId,
      };
    });
  };

  const undoStroke = () => {
    updateBoard((current) => {
      if (!current.round || current.round.status !== "draw") return current;
      const strokesNext = current.round.strokes.slice(0, -1);
      return {
        ...current,
        strokes: strokesNext,
        round: { ...current.round, strokes: strokesNext },
        updatedAt: nowIso(),
        updatedBy: youId,
      };
    });
  };

  const clearPage = () => {
    updateBoard((current) => {
      if (!current.round || current.round.status !== "draw") return current;
      return {
        ...current,
        strokes: [],
        round: { ...current.round, strokes: [] },
        updatedAt: nowIso(),
        updatedBy: youId,
      };
    });
  };

  const leaveOnFridge = () => {
    if (!round) return;
    if (round.strokes.length === 0) {
      setError("Draw something first. Stick figures count.");
      return;
    }
    updateBoard((current) => {
      if (!current.round) return current;
      const sent = leaveDoodleDrawing(current.round, current.round.strokes);
      if (sent.status !== "wait") return current;
      return {
        ...current,
        strokes: sent.strokes,
        round: sent,
        updatedAt: nowIso(),
        updatedBy: youId,
      };
    });
    setError(null);
  };

  const sendGuess = () => {
    if (!round) return;
    if (!guess.trim()) {
      setError("Have a stab. One guess.");
      return;
    }
    updateBoard((current) => {
      if (!current.round) return current;
      const revealed = submitDoodleGuess(current.round, guess);
      if (revealed.status !== "revealed") return current;
      return {
        ...current,
        scores: applyDoodleScore(current.scores, revealed),
        history: [revealed, ...current.history].slice(0, 20),
        round: revealed,
        updatedAt: nowIso(),
        updatedBy: youId,
      };
    });
    setError(null);
  };

  const nextRound = () => {
    if (!round) return;
    dealRound(round.guesserId || themId, round.drawerId || youId);
  };

  const title =
    !round
      ? "Draw It"
      : round.status === "pick"
        ? "Pick one"
        : round.status === "draw"
          ? "Draw it"
          : round.status === "wait"
            ? "Guess it"
            : round.correct
              ? "Got it"
              : "So close";

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
    <Screen
      scroll
      background={BG}
      density={look.prefs.density}
      typeface={look.prefs.typeface}
      wash={look.wash}
    >
      <Stage background={BG} fallback={"/hub/play" as Href} accent={look.accent}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                color: MUTED,
              }}
            >
              FRIDGE · DRAW IT
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontFamily: HANDWRITING,
                fontSize: 32,
                color: PAPER,
              }}
            >
              {title}
            </Text>
          </View>
          <Pressable
            onPress={() => setSettingsOpen((open) => !open)}
            accessibilityLabel="Draw It settings"
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(243,230,196,0.28)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={settingsOpen ? "close" : "settings-outline"}
              size={20}
              color={PAPER}
            />
          </Pressable>
        </View>

        {drawing ? (
          <Text
            style={{
              marginTop: 8,
              fontFamily: HANDWRITING,
              fontSize: 18,
              color: MUTED,
            }}
          >
            {youName} {youScore}  ·  {themName} {themScore}
          </Text>
        ) : (
          <Scorecard
            youName={youName}
            themName={themName}
            youScore={youScore}
            themScore={themScore}
            history={board.history}
          />
        )}

        {!round ? (
          <IdleBlock
            youName={youName}
            themName={themName}
            onYou={() => dealRound(youId, themId)}
            onThem={() => dealRound(themId, youId)}
          />
        ) : null}

        {round?.status === "pick" && seat === "drawer" ? (
          <PickBlock
            options={round.options}
            onPick={pickPrompt}
            onSkip={skipOptions}
          />
        ) : null}

        {round?.status === "pick" && seat !== "drawer" ? (
          <Note>
            {nameFor(round.drawerId)} is picking from three prompts. Hide your eyes or
            hand over the phone.
          </Note>
        ) : null}

        {round?.status === "draw" && seat === "drawer" ? (
          <Text
            style={{
              marginTop: 14,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 22,
              color: PAPER,
            }}
          >
            Draw: {round.prompt}
          </Text>
        ) : null}

        {round?.status === "draw" && seat !== "drawer" ? (
          <View>
            <Note>
              {nameFor(round.drawerId)} is still drawing. No peeking at the prompt.
            </Note>
            <View style={{ alignItems: "center" }}>
              <PokeThem appId="doodle" targetId={round.id} color={PAPER} />
            </View>
          </View>
        ) : null}

        {round && (round.status === "draw" || round.status === "wait" || round.status === "revealed") ? (
          <Paper
            strokes={strokes}
            height={drawing ? 210 : 280}
            emptyLabel={
              round.status === "draw"
                ? "stick figures welcome"
                : "waiting on a doodle"
            }
            panHandlers={drawing ? pan.panHandlers : undefined}
          />
        ) : null}

        {drawing ? (
          <View>
            <Pressable
              onPress={leaveOnFridge}
              style={{
                marginTop: 12,
                backgroundColor: PAPER,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: SERIF, fontSize: 17, color: INK }}>
                Drawing is ready for guessing
              </Text>
            </Pressable>
            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 7 }}>
              {PALETTE.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 22,
                    height: 28,
                    backgroundColor: c,
                    borderRadius: 3,
                    borderWidth: color === c ? 2 : 0,
                    borderColor: PAPER,
                  }}
                />
              ))}
              <Pressable onPress={() => setWidth(width === 3 ? 7 : 3)}>
                <Text style={{ color: PAPER, fontFamily: HANDWRITING, fontSize: 16 }}>
                  {width === 3 ? "pencil" : "crayon"}
                </Text>
              </Pressable>
              <Pressable onPress={undoStroke}>
                <Text style={{ color: PAPER }}>undo</Text>
              </Pressable>
              <Pressable onPress={clearPage}>
                <Text style={{ color: "#C23B3B" }}>rip</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {round?.status === "wait" ? (
          <GuessBox
            guess={guess}
            guesserName={nameFor(round.guesserId)}
            forPartner={seat === "drawer"}
            roundId={round.id}
            error={error}
            onChange={(value) => {
              setGuess(value);
              setError(null);
            }}
            onSubmit={sendGuess}
          />
        ) : null}

        {round?.status === "revealed" ? (
          <RevealBlock
            round={round}
            drawerName={nameFor(round.drawerId)}
            guesserName={nameFor(round.guesserId)}
            onNext={nextRound}
          />
        ) : null}

        {error && round?.status !== "wait" ? (
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              fontFamily: HANDWRITING,
              fontSize: 18,
              color: "#E8A0A0",
            }}
          >
            {error}
          </Text>
        ) : null}
        <View style={{ height: 36 }} />
      </Stage>
    </Screen>
    {settingsOpen ? (
      <SettingsSheet
        look={look}
        enabled={board.enabledCategories}
        onClose={() => setSettingsOpen(false)}
        onToggle={(id) =>
          updateBoard((current) => ({
            ...current,
            enabledCategories: toggleDoodleCategory(current.enabledCategories, id),
            updatedAt: nowIso(),
            updatedBy: youId,
          }))
        }
        onReset={() =>
          updateBoard((current) => ({
            ...current,
            enabledCategories: [...DEFAULT_DOODLE_CATEGORIES],
            updatedAt: nowIso(),
            updatedBy: youId,
          }))
        }
      />
    ) : null}
    </View>
  );
}

function Scorecard({
  youName,
  themName,
  youScore,
  themScore,
  history,
}: {
  youName: string;
  themName: string;
  youScore: number;
  themScore: number;
  history: DoodleRound[];
}) {
  const recent = history.slice(0, 4);
  return (
    <View
      style={{
        marginTop: 14,
        backgroundColor: "#1C1812",
        borderWidth: 1,
        borderColor: "rgba(243,230,196,0.16)",
        padding: 12,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 2,
          color: MUTED,
        }}
      >
        SCORECARD
      </Text>
      <View style={{ marginTop: 8, flexDirection: "row", gap: 10 }}>
        <ScoreSeat name={youName} score={youScore} lean="-1.2deg" />
        <ScoreSeat name={themName} score={themScore} lean="1.4deg" />
      </View>
      {recent.length ? (
        <Text
          style={{
            marginTop: 10,
            fontFamily: HANDWRITING,
            fontSize: 16,
            color: MUTED,
          }}
        >
          {recent
            .map((row) => `${row.prompt ?? "?"} ${row.correct ? "✓" : "✗"}`)
            .join("   ·   ")}
        </Text>
      ) : (
        <Text
          style={{
            marginTop: 10,
            fontFamily: HANDWRITING,
            fontSize: 16,
            color: MUTED,
          }}
        >
          First point wins bragging rights on the fridge.
        </Text>
      )}
    </View>
  );
}

function ScoreSeat({
  name,
  score,
  lean,
}: {
  name: string;
  score: number;
  lean: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PAPER,
        paddingVertical: 10,
        paddingHorizontal: 10,
        transform: [{ rotate: lean }],
      }}
    >
      <Text
        numberOfLines={1}
        style={{ fontFamily: SERIF, fontSize: 14, color: INK }}
      >
        {name}
      </Text>
      <Text style={{ fontFamily: HANDWRITING, fontSize: 34, color: INK, marginTop: -4 }}>
        {score}
      </Text>
      <Text style={{ color: "rgba(42,28,18,0.45)", letterSpacing: 2 }}>
        {"★".repeat(Math.min(score, 8)) || "☆"}
      </Text>
    </View>
  );
}

function SettingsSheet({
  look,
  enabled,
  onToggle,
  onClose,
  onReset,
}: {
  look: ComponentProps<typeof LookPanel>["look"];
  enabled: string[];
  onToggle: (id: (typeof DOODLE_CATEGORIES)[number]["id"]) => void;
  onClose: () => void;
  onReset: () => void;
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
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close Draw It settings"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(12,8,6,0.78)",
        }}
      />
      <View
        style={{
          width: "100%",
          maxHeight: "88%",
          backgroundColor: "#1C1812",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 18,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: 1,
          borderColor: "rgba(243,230,196,0.2)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                color: MUTED,
              }}
            >
              DRAW FROM
            </Text>
            <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 22, color: PAPER }}>
              Categories
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close settings">
            <Ionicons name="close" size={22} color={PAPER} />
          </Pressable>
        </View>
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          style={{ maxHeight: 420 }}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          <LookPanel
            look={{
              ...look,
              reset: () => {
                look.reset();
                onReset();
              },
            }}
            ink={PAPER}
            muted={MUTED}
            pageColor={BG}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 15, color: MUTED, marginBottom: 10 }}>
              Prompts come from the categories you leave on. Naughty stays off until you flip it.
            </Text>
            <View style={{ gap: 8 }}>
          {DOODLE_CATEGORIES.map((category) => {
            const on = enabled.includes(category.id);
            const naughty = category.id === "naughty";
            return (
              <Pressable
                key={category.id}
                onPress={() => onToggle(category.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderWidth: 1,
                  borderColor: naughty
                    ? on
                      ? "rgba(194,59,59,0.7)"
                      : "rgba(194,59,59,0.28)"
                    : on
                      ? "rgba(243,230,196,0.45)"
                      : "rgba(243,230,196,0.16)",
                  backgroundColor: naughty && on ? "rgba(194,59,59,0.16)" : "transparent",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 16,
                      color: naughty ? "#E8A0A0" : PAPER,
                    }}
                  >
                    {category.label}
                    {naughty ? "  xxx" : ""}
                  </Text>
                  <Text style={{ marginTop: 2, fontFamily: HANDWRITING, fontSize: 15, color: MUTED }}>
                    {category.detail}
                  </Text>
                </View>
                <Ionicons
                  name={on ? "checkbox" : "square-outline"}
                  size={22}
                  color={on ? (naughty ? "#E8A0A0" : PAPER) : MUTED}
                />
              </Pressable>
            );
          })}
            </View>
          </LookPanel>
        </ScrollView>
      </View>
    </View>
  );
}

function GuessBox({
  guess,
  guesserName,
  forPartner,
  roundId,
  error,
  onChange,
  onSubmit,
}: {
  guess: string;
  guesserName: string;
  forPartner: boolean;
  roundId: string;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={{ marginTop: 16, marginBottom: 24 }}>
      <Text
        style={{
          fontFamily: HANDWRITING,
          fontSize: 22,
          color: PAPER,
          textAlign: "center",
        }}
      >
        {forPartner ? `Hand the phone to ${guesserName}` : "What is it?"}
      </Text>
      <Text
        style={{
          marginTop: 4,
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: 15,
          color: MUTED,
        }}
      >
        {forPartner
          ? `This box is for ${guesserName}. Don't type the answer.`
          : "Type your guess. One shot."}
      </Text>
      {forPartner ? (
        <View style={{ alignItems: "center" }}>
          <PokeThem appId="doodle" targetId={roundId} color={PAPER} />
        </View>
      ) : null}
      <TextInput
        value={guess}
        onChangeText={onChange}
        placeholder={`${guesserName}'s guess…`}
        placeholderTextColor="rgba(42,28,18,0.35)"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={onSubmit}
        style={{
          marginTop: 12,
          backgroundColor: PAPER,
          color: INK,
          fontFamily: SERIF,
          fontSize: 20,
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
      />
      <Pressable
        onPress={onSubmit}
        style={{
          marginTop: 12,
          backgroundColor: "#C23B3B",
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: SERIF, fontSize: 18, color: PAPER }}>Lock it in</Text>
      </Pressable>
      {error ? (
        <Text
          style={{
            marginTop: 10,
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 18,
            color: "#E8A0A0",
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function IdleBlock({
  youName,
  themName,
  onYou,
  onThem,
}: {
  youName: string;
  themName: string;
  onYou: () => void;
  onThem: () => void;
}) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          textAlign: "center",
          fontFamily: HANDWRITING,
          fontSize: 22,
          color: PAPER,
        }}
      >
        Three things. Draw one. Leave it. They guess.
      </Text>
      <Text
        style={{
          marginTop: 8,
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: 15,
          color: MUTED,
        }}
      >
        A correct guess scores both of you. Then they draw.
      </Text>
      <Pressable
        onPress={onYou}
        style={{
          marginTop: 18,
          backgroundColor: PAPER,
          paddingVertical: 16,
          alignItems: "center",
          transform: [{ rotate: "-0.8deg" }],
        }}
      >
        <Text style={{ fontFamily: SERIF, fontSize: 18, color: INK }}>
          {youName} draws first
        </Text>
      </Pressable>
      <Pressable
        onPress={onThem}
        style={{
          marginTop: 12,
          borderWidth: 1,
          borderColor: "rgba(243,230,196,0.35)",
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: SERIF, fontSize: 16, color: PAPER }}>
          {themName} draws first
        </Text>
      </Pressable>
    </View>
  );
}

function PickBlock({
  options,
  onPick,
  onSkip,
}: {
  options: [string, string, string];
  onPick: (prompt: string) => void;
  onSkip: () => void;
}) {
  const leans = ["-1.6deg", "1.2deg", "-0.4deg"];
  return (
    <View style={{ marginTop: 16, gap: 10 }}>
      <Text
        style={{
          textAlign: "center",
          fontFamily: HANDWRITING,
          fontSize: 20,
          color: MUTED,
        }}
      >
        Tap the one you can actually draw.
      </Text>
      {options.map((prompt, index) => {
        const category = categoryForPrompt(prompt);
        return (
          <Pressable
            key={`${prompt}-${index}`}
            onPress={() => onPick(prompt)}
            style={{
              backgroundColor: PAPER,
              paddingVertical: 16,
              paddingHorizontal: 16,
              transform: [{ rotate: leans[index] ?? "0deg" }],
            }}
          >
            {category ? (
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 10,
                  letterSpacing: 1.4,
                  color: "rgba(42,28,18,0.45)",
                }}
              >
                {doodleCategoryLabel(category).toUpperCase()}
              </Text>
            ) : null}
            <Text style={{ fontFamily: SERIF, fontSize: 22, color: INK, marginTop: 2 }}>
              {prompt}
            </Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onSkip} style={{ paddingVertical: 10, alignItems: "center" }}>
        <Text style={{ color: MUTED, fontFamily: HANDWRITING, fontSize: 18 }}>
          none of these — three more
        </Text>
      </Pressable>
    </View>
  );
}

function Paper({
  strokes,
  emptyLabel,
  panHandlers,
  height = 280,
}: {
  strokes: DoodleStroke[];
  emptyLabel: string;
  panHandlers?: object;
  height?: number;
}) {
  return (
    <View
      {...(panHandlers ?? {})}
      style={{
        marginTop: 14,
        height,
        backgroundColor: PAPER,
        borderRadius: 2,
        overflow: "hidden",
        transform: [{ rotate: "-0.8deg" }],
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 16,
      }}
    >
      <Svg width="100%" height="100%">
        {Array.from({ length: 14 }, (_, i) => (
          <Line
            key={i}
            x1={0}
            x2={400}
            y1={24 + i * 24}
            y2={24 + i * 24}
            stroke="rgba(42,28,18,0.08)"
            strokeWidth={1}
          />
        ))}
        {strokes.map((stroke, i) => (
          <Path
            key={i}
            d={toPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.width ?? 3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
      {strokes.length === 0 ? (
        <Text
          style={{
            position: "absolute",
            top: 40,
            left: 24,
            fontFamily: HANDWRITING,
            fontSize: 22,
            color: "rgba(42,28,18,0.25)",
          }}
        >
          {emptyLabel}
        </Text>
      ) : null}
    </View>
  );
}

function RevealBlock({
  round,
  drawerName,
  guesserName,
  onNext,
}: {
  round: DoodleRound;
  drawerName: string;
  guesserName: string;
  onNext: () => void;
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text
        style={{
          textAlign: "center",
          fontFamily: HANDWRITING,
          fontSize: 26,
          color: round.correct ? "#C8E6C0" : "#E8A0A0",
        }}
      >
        {round.correct ? "Both of you score." : "No points this time."}
      </Text>
      <Text
        style={{
          marginTop: 8,
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: 20,
          color: PAPER,
        }}
      >
        {drawerName} drew {round.prompt}
      </Text>
      <Text
        style={{
          marginTop: 4,
          textAlign: "center",
          fontFamily: HANDWRITING,
          fontSize: 20,
          color: MUTED,
        }}
      >
        {guesserName} guessed “{round.guess}”
      </Text>
      <Pressable
        onPress={onNext}
        style={{
          marginTop: 16,
          backgroundColor: PAPER,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: SERIF, fontSize: 18, color: INK }}>
          {guesserName} draws next
        </Text>
      </Pressable>
    </View>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        marginTop: 16,
        textAlign: "center",
        fontFamily: HANDWRITING,
        fontSize: 20,
        color: MUTED,
      }}
    >
      {children}
    </Text>
  );
}
