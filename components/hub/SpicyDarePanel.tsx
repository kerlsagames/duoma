import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { SERIF, WILDCARD_TONE } from "@/lib/app-themes";
import {
  SPICY_DARE_CATEGORIES,
  SPICY_DARE_CATEGORY_META,
  defaultDareDateTime,
  directionLabel,
  formatDareDueAt,
  isSpicyDareDeck,
  parseLocalDateTime,
  spicyCategoryMeta,
  timeframeLabel,
  toLocalDateTimeValue,
  withPlayStatus,
  type SpicyDare,
  type SpicyDareCategory,
} from "@/lib/spicy-dares";
import { useApp } from "@/lib/store";
import type { DareDirection, DareTimeframe, SpicyDarePlay } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = WILDCARD_TONE;

type ViewMode = "home" | "category" | "compose";

type Compose = {
  dareId: string | null;
  text: string;
  categories: string[];
};

const TIMEFRAMES: { id: DareTimeframe; label: string }[] = [
  { id: "tonight", label: "Tonight" },
  { id: "24h", label: "24 hours" },
  { id: "custom", label: "Calendar" },
];

function dareWhen(play: SpicyDarePlay): string {
  return timeframeLabel(play.timeframe, play.customWhen, play.dueAt);
}

function pickRandom<T>(items: T[], avoid?: T | null): T | null {
  if (!items.length) return null;
  if (items.length === 1) return items[0];
  let next = items[Math.floor(Math.random() * items.length)];
  let guard = 0;
  while (avoid != null && next === avoid && guard < 8) {
    next = items[Math.floor(Math.random() * items.length)];
    guard += 1;
  }
  return next;
}

export function SpicyDarePanel({
  onClose,
  mode = "sheet",
}: {
  onClose?: () => void;
  mode?: "sheet" | "page";
}) {
  const {
    user,
    partner,
    talkDecks,
    spicyDares,
    sendSpicyDare,
    respondSpicyDare,
    completeSpicyDare,
  } = useApp();

  const [view, setView] = useState<ViewMode>("home");
  const [category, setCategory] = useState<SpicyDareCategory | null>(null);
  const [picked, setPicked] = useState<SpicyDare | null>(null);
  const [flashText, setFlashText] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [compose, setCompose] = useState<Compose | null>(null);
  const [direction, setDirection] = useState<DareDirection | null>(null);
  const [timeframe, setTimeframe] = useState<DareTimeframe>("tonight");
  const [customWhen, setCustomWhen] = useState(defaultDareDateTime);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const spinTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const minDateTime = useMemo(() => toLocalDateTimeValue(new Date()), []);

  const playedIds = useMemo(() => {
    const deck = talkDecks.find(
      (row) => row.userId === user?.id && isSpicyDareDeck(row.categoryId)
    );
    return deck?.played ?? [];
  }, [talkDecks, user?.id]);

  const catalog = useMemo(() => {
    if (!category) return [] as SpicyDare[];
    const tagged = withPlayStatus(playedIds).filter((row) =>
      row.categories.includes(category)
    );
    return [...tagged].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "unplayed" ? -1 : 1;
    });
  }, [category, playedIds]);

  const live = useMemo(
    () => spicyDares.filter((row) => row.status === "offered" || row.status === "accepted"),
    [spicyDares]
  );

  useEffect(() => {
    return () => {
      spinTimers.current.forEach(clearTimeout);
      spinTimers.current = [];
    };
  }, []);

  const clearSpin = () => {
    spinTimers.current.forEach(clearTimeout);
    spinTimers.current = [];
  };

  const openCategory = (id: SpicyDareCategory) => {
    clearSpin();
    setCategory(id);
    setPicked(null);
    setFlashText(null);
    setSpinning(false);
    setView("category");
    setError(null);
  };

  const openCompose = (dare: SpicyDare | null, presetCategory?: SpicyDareCategory | null) => {
    clearSpin();
    setSpinning(false);
    setFlashText(null);
    setError(null);
    setDirection(null);
    setTimeframe("tonight");
    setCustomWhen(defaultDareDateTime());
    setCompose(
      dare
        ? { dareId: dare.id, text: dare.text, categories: [...dare.categories] }
        : {
            dareId: null,
            text: "",
            categories: presetCategory ? [presetCategory] : [],
          }
    );
    setView("compose");
  };

  const runRandom = () => {
    if (!catalog.length || spinning) return;
    clearSpin();
    setSpinning(true);
    setError(null);

    const pool = catalog;
    const ticks = 10 + Math.floor(Math.random() * 4);
    let last: SpicyDare | null = picked;

    for (let i = 0; i < ticks; i += 1) {
      const delay = 55 + i * i * 9;
      const timer = setTimeout(() => {
        const next = pickRandom(pool, last);
        if (!next) return;
        last = next;
        setFlashText(next.text);
        if (i === ticks - 1) {
          setPicked(next);
          setFlashText(null);
          setSpinning(false);
        }
      }, delay);
      spinTimers.current.push(timer);
    }
  };

  const send = async () => {
    if (!compose) return;
    if (!direction) {
      setError("Pick who does this.");
      return;
    }
    if (timeframe === "custom") {
      const picked = parseLocalDateTime(customWhen);
      if (!picked) {
        setError("Pick a date and time on the calendar.");
        return;
      }
      if (picked.getTime() <= Date.now()) {
        setError("Pick a time in the future.");
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      await sendSpicyDare({
        dareId: compose.dareId,
        text: compose.text,
        categories: compose.categories,
        direction,
        timeframe,
        customWhen: timeframe === "custom" ? customWhen : null,
      });
      setCompose(null);
      setDirection(null);
      setPicked(null);
      setCategory(null);
      setView("home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the dare.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomTag = (tag: SpicyDareCategory) => {
    if (!compose) return;
    const has = compose.categories.includes(tag);
    setCompose({
      ...compose,
      categories: has
        ? compose.categories.filter((item) => item !== tag)
        : [...compose.categories, tag],
    });
  };

  const goHome = () => {
    clearSpin();
    setSpinning(false);
    setFlashText(null);
    setCompose(null);
    setCategory(null);
    setPicked(null);
    setView("home");
    setError(null);
  };

  const catMeta = category ? spicyCategoryMeta(category) : null;
  const heroText = flashText ?? picked?.text ?? null;

  if (view === "compose" && compose) {
    return (
      <View>
        <Pressable onPress={() => {
          if (category) {
            setCompose(null);
            setView("category");
          } else {
            goHome();
          }
          setError(null);
        }} className="mb-4 flex-row items-center">
          <Ionicons name="chevron-back" size={18} color={T.accent} />
          <Text
            style={{
              marginLeft: 4,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: T.accent,
            }}
          >
            Back
          </Text>
        </Pressable>

        <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 34, color: T.ink }}>
          {compose.dareId ? "Send it" : "Write your own"}
        </Text>

        <TextInput
          value={compose.text}
          onChangeText={(text) => setCompose({ ...compose, text })}
          placeholder="The dare, in your words"
          placeholderTextColor="rgba(232,244,241,0.32)"
          multiline
          style={{
            marginTop: 16,
            minHeight: 108,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: T.border,
            backgroundColor: T.surfaceRaised,
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: T.ink,
            fontFamily: SERIF,
            fontSize: 17,
            lineHeight: 24,
          }}
        />

        {compose.dareId === null ? (
          <View className="mt-4 flex-row flex-wrap" style={{ gap: 8 }}>
            {SPICY_DARE_CATEGORIES.map((tag) => {
              const on = compose.categories.includes(tag);
              const meta = spicyCategoryMeta(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleCustomTag(tag)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: on ? T.accent : "rgba(232,244,241,0.12)",
                    backgroundColor: on ? T.accentSoft : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      color: on ? T.accent : T.muted,
                    }}
                  >
                    {meta?.label ?? tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Who
        </Text>
        <View className="mt-3" style={{ gap: 8 }}>
          {(["i-do-you", "you-do-me"] as DareDirection[]).map((id) => {
            const active = direction === id;
            return (
              <Pressable
                key={id}
                onPress={() => setDirection(id)}
                style={{
                  borderRadius: 18,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: active ? T.accent : "rgba(232,244,241,0.12)",
                  backgroundColor: active ? T.accentSoft : T.surface,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>
                  {directionLabel(id)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            marginTop: 20,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Expires
        </Text>
        <View className="mt-3 flex-row" style={{ gap: 8 }}>
          {TIMEFRAMES.map((item) => {
            const active = timeframe === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTimeframe(item.id)}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: active ? T.accent : "rgba(232,244,241,0.12)",
                  backgroundColor: active ? T.accentSoft : T.surface,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: SERIF,
                    fontSize: 14,
                    color: T.ink,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {timeframe === "custom" ? (
          <View className="mt-1">
            <DateTimeField
              value={customWhen}
              min={minDateTime}
              onChange={setCustomWhen}
              accent={T.accent}
              background={T.surface}
              ink={T.ink}
              border={T.border}
            />
            <Text style={{ marginTop: 8, fontSize: 13, color: T.muted }}>
              Expires exactly{" "}
              {formatDareDueAt(parseLocalDateTime(customWhen)?.toISOString() ?? null) ??
                "—"}
            </Text>
          </View>
        ) : (
          <Text style={{ marginTop: 10, fontSize: 13, color: T.muted }}>
            {timeframe === "tonight"
              ? `Expires tonight at ${formatDareDueAt(
                  new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
                )}`
              : `Expires ${formatDareDueAt(
                  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                )}`}
          </Text>
        )}

        {error ? (
          <Text style={{ marginTop: 14, color: T.hot, fontFamily: SERIF }}>{error}</Text>
        ) : null}
        <View className="mt-5">
          <PrimaryButton
            label="Send this dare"
            tone="teal"
            loading={loading}
            onPress={() => void send()}
          />
        </View>
      </View>
    );
  }

  if (view === "category" && category) {
    return (
      <View>
        <Pressable onPress={goHome} className="mb-4 flex-row items-center">
          <Ionicons name="chevron-back" size={18} color={T.accent} />
          <Text
            style={{
              marginLeft: 4,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: T.accent,
            }}
          >
            All categories
          </Text>
        </Pressable>

        <View className="flex-row items-center">
          {catMeta ? (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: T.accentSoft,
                borderWidth: 1,
                borderColor: T.border,
                marginRight: 12,
              }}
            >
              <Ionicons name={catMeta.icon} size={22} color={T.accent} />
            </View>
          ) : null}
          <View className="flex-1">
            <Text style={{ fontFamily: SERIF, fontSize: 28, color: T.ink }}>
              {catMeta?.label ?? category}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 13, color: T.muted }}>
              {catalog.length} dares
            </Text>
          </View>
        </View>

        <Pressable
          onPress={runRandom}
          disabled={spinning || catalog.length === 0}
          style={{
            marginTop: 18,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: spinning ? T.flash : T.accent,
            backgroundColor: spinning ? "rgba(124,255,178,0.12)" : T.accentSoft,
            paddingVertical: 16,
            paddingHorizontal: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: catalog.length === 0 ? 0.45 : 1,
          }}
        >
          <Ionicons
            name={spinning ? "sync" : "shuffle"}
            size={20}
            color={spinning ? T.flash : T.accent}
          />
          <Text
            style={{
              marginLeft: 10,
              fontFamily: SERIF,
              fontSize: 20,
              color: spinning ? T.flash : T.ink,
            }}
          >
            {spinning ? "Spinning…" : picked ? "Random again" : "Random"}
          </Text>
        </Pressable>

        <View
          style={{
            marginTop: 14,
            minHeight: 150,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: spinning ? T.flash : T.border,
            backgroundColor: T.surfaceRaised,
            padding: 18,
            justifyContent: "center",
          }}
        >
          {heroText ? (
            <>
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: spinning ? T.flash : T.accent,
                }}
              >
                {spinning ? "Shuffling" : "This one"}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: SERIF,
                  fontSize: spinning ? 18 : 20,
                  lineHeight: spinning ? 26 : 28,
                  color: spinning ? T.flash : T.ink,
                  opacity: spinning ? 0.92 : 1,
                }}
              >
                {heroText}
              </Text>
              {!spinning && picked ? (
                <View className="mt-4">
                  <PrimaryButton
                    label="Use this"
                    tone="teal"
                    onPress={() => openCompose(picked)}
                  />
                </View>
              ) : null}
            </>
          ) : (
            <Text style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 24, color: T.muted }}>
              Hit Random for a pick — or scroll the list below.
            </Text>
          )}
        </View>

        <Text
          style={{
            marginTop: 22,
            marginBottom: 10,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Or browse
        </Text>
        <View style={{ gap: 8 }}>
          {catalog.map((dare) => {
            const played = dare.status === "played";
            const selected = picked?.id === dare.id && !spinning;
            return (
              <Pressable
                key={dare.id}
                onPress={() => {
                  setPicked(dare);
                  setFlashText(null);
                }}
                onLongPress={() => openCompose(dare)}
                style={{
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: selected
                    ? T.accent
                    : played
                      ? "rgba(232,244,241,0.08)"
                      : "rgba(232,244,241,0.1)",
                  backgroundColor: selected ? T.accentSoft : T.surface,
                  opacity: played && !selected ? 0.65 : 1,
                }}
              >
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 15,
                    lineHeight: 22,
                    color: T.ink,
                  }}
                >
                  {dare.text}
                </Text>
                {played ? (
                  <Text
                    style={{
                      marginTop: 6,
                      fontFamily: "SpaceMono",
                      fontSize: 10,
                      color: T.muted,
                    }}
                  >
                    Sent before
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        {picked && !spinning ? (
          <View className="mt-4 mb-2">
            <PrimaryButton
              label="Use this dare"
              tone="teal"
              onPress={() => openCompose(picked)}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View>
      {mode === "sheet" ? (
        <View className="mb-4 flex-row items-center justify-between">
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: T.accent,
            }}
          >
            Wildcard
          </Text>
          {onClose ? (
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={T.muted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {live.length ? (
        <View className="mb-5" style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: T.hot,
            }}
          >
            Live
          </Text>
          {live.map((play) => (
            <LiveDareCard
              key={play.id}
              play={play}
              userId={user?.id}
              partnerName={partner?.displayName ?? "them"}
              onRespond={(status) => void respondSpicyDare(play.id, status)}
              onDone={() => void completeSpicyDare(play.id)}
            />
          ))}
        </View>
      ) : null}

      <View className="flex-row flex-wrap justify-between">
        {SPICY_DARE_CATEGORY_META.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => openCategory(cat.id)}
            style={{
              width: "48%",
              marginBottom: 12,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.surfaceRaised,
              paddingVertical: 18,
              paddingHorizontal: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: T.accentSoft,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Ionicons name={cat.icon} size={22} color={T.accent} />
            </View>
            <Text
              style={{
                marginTop: 12,
                fontFamily: SERIF,
                fontSize: 18,
                color: T.ink,
              }}
            >
              {cat.label}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                lineHeight: 17,
                color: T.muted,
              }}
            >
              {cat.detail}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => openCompose(null)}
        style={{
          marginTop: 4,
          borderRadius: 22,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: "rgba(61,224,197,0.45)",
          backgroundColor: T.surface,
          paddingVertical: 18,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: T.accentSoft,
            borderWidth: 1,
            borderColor: T.border,
          }}
        >
          <Ionicons name="create-outline" size={22} color={T.accent} />
        </View>
        <View className="ml-3 flex-1">
          <Text style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>
            Write your own
          </Text>
          <Text style={{ marginTop: 3, fontSize: 13, color: T.muted }}>
            Skip the deck. Make one up.
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function LiveDareCard({
  play,
  userId,
  partnerName,
  onRespond,
  onDone,
}: {
  play: SpicyDarePlay;
  userId?: string;
  partnerName: string;
  onRespond: (status: "accepted" | "declined") => void;
  onDone: () => void;
}) {
  const mineIncoming = play.toUserId === userId && play.status === "offered";
  const waitingOnThem = play.fromUserId === userId && play.status === "offered";
  const accepted = play.status === "accepted";
  const heading = play.direction === "i-do-you" ? "I'll do this to you" : "You do this to me";

  return (
    <View
      style={{
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,90,122,0.4)",
        backgroundColor: "rgba(255,90,122,0.1)",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: T.hot,
        }}
      >
        {heading} · {dareWhen(play)}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 16,
          lineHeight: 23,
          color: T.ink,
        }}
      >
        {play.text}
      </Text>
      {mineIncoming ? (
        <View className="mt-3 flex-row" style={{ gap: 8 }}>
          <View className="flex-1">
            <PrimaryButton
              label="I'm up for it"
              tone="teal"
              onPress={() => onRespond("accepted")}
            />
          </View>
          <View className="flex-1">
            <PrimaryButton
              tone="ghost"
              label="Not this one"
              onPress={() => onRespond("declined")}
            />
          </View>
        </View>
      ) : null}
      {waitingOnThem ? (
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontStyle: "italic",
            color: T.muted,
          }}
        >
          Waiting on {partnerName}.
        </Text>
      ) : null}
      {accepted ? (
        <View className="mt-3">
          <PrimaryButton label="Mark it done" tone="teal" onPress={onDone} />
        </View>
      ) : null}
    </View>
  );
}
