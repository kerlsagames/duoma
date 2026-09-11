import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { SERIF, UP_FOR_IT_TONE } from "@/lib/app-themes";
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
import { USE_TIMING_OPTIONS, expiresAtForTiming, type UseTimingId } from "@/lib/useTiming";
import { useApp } from "@/lib/store";
import type { DareDirection, DareTimeframe, SpicyDarePlay } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = UP_FOR_IT_TONE;

type ViewMode = "hub" | "send" | "sent" | "received" | "category" | "compose";

const STATUS_RANK: Record<SpicyDarePlay["status"], number> = {
  offered: 0,
  accepted: 1,
  done: 2,
  declined: 3,
};

function sortDares(rows: SpicyDarePlay[]): SpicyDarePlay[] {
  return [...rows].sort((a, b) => {
    const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (rank !== 0) return rank;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

type Compose = {
  dareId: string | null;
  text: string;
  categories: string[];
};

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
  onNavigate,
  onViewChange,
  onBindBack,
}: {
  onClose?: () => void;
  mode?: "sheet" | "page";
  /** Called when the panel switches views (hub, send, lists, compose). */
  onNavigate?: () => void;
  /** Lets the page hide titles while browsing, listing, or composing. */
  onViewChange?: (view: ViewMode) => void;
  /** Page Back should step inside the panel instead of leaving Challenges. */
  onBindBack?: (handler: (() => boolean) | null) => void;
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

  const [view, setView] = useState<ViewMode>("hub");
  const [category, setCategory] = useState<SpicyDareCategory | null>(null);
  const [picked, setPicked] = useState<SpicyDare | null>(null);
  const [flashText, setFlashText] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [compose, setCompose] = useState<Compose | null>(null);
  const [direction, setDirection] = useState<DareDirection | null>(null);
  const [timeframe, setTimeframe] = useState<UseTimingId>("tonight");
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

  const sent = useMemo(
    () =>
      sortDares(spicyDares.filter((row) => row.fromUserId === user?.id)),
    [spicyDares, user?.id]
  );

  const received = useMemo(
    () =>
      sortDares(spicyDares.filter((row) => row.toUserId === user?.id)),
    [spicyDares, user?.id]
  );

  const sentOpenCount = sent.filter(
    (row) => row.status === "offered" || row.status === "accepted"
  ).length;
  const receivedWaitingCount = received.filter((row) => row.status === "offered").length;

  useEffect(() => {
    return () => {
      spinTimers.current.forEach(clearTimeout);
      spinTimers.current = [];
    };
  }, []);

  useEffect(() => {
    onNavigate?.();
    onViewChange?.(view);
  }, [view, onNavigate, onViewChange]);

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
        timeframe: timeframe as DareTimeframe,
        customWhen: timeframe === "custom" ? customWhen : null,
      });
      setCompose(null);
      setDirection(null);
      setPicked(null);
      setCategory(null);
      setView("sent");
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

  const goHub = () => {
    clearSpin();
    setSpinning(false);
    setFlashText(null);
    setCompose(null);
    setCategory(null);
    setPicked(null);
    setView("hub");
    setError(null);
  };

  const goSend = () => {
    clearSpin();
    setSpinning(false);
    setFlashText(null);
    setCompose(null);
    setCategory(null);
    setPicked(null);
    setView("send");
    setError(null);
  };

  useEffect(() => {
    if (!onBindBack) return;
    onBindBack(() => {
      if (view === "hub") return false;
      if (view === "compose") {
        if (category) {
          setCompose(null);
          setView("category");
          setError(null);
        } else {
          goSend();
        }
        return true;
      }
      if (view === "category") {
        goSend();
        return true;
      }
      goHub();
      return true;
    });
    return () => onBindBack(null);
  }, [onBindBack, view, category]);

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
            goSend();
          }
          setError(null);
        }} className="mb-3 flex-row items-center">
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

        {compose.dareId ? (
          <View
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.surfaceRaised,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                lineHeight: 28,
                color: T.ink,
              }}
            >
              {compose.text}
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 34, color: T.ink }}>
              Write your own
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
          </>
        )}

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
            marginTop: compose.dareId ? 18 : 22,
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
          Time to use
        </Text>
        <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
          {USE_TIMING_OPTIONS.map((opt) => {
            const active = timeframe === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setTimeframe(opt.id)}
                style={{
                  width: "48%",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: active ? T.accent : "rgba(232,244,241,0.12)",
                  backgroundColor: active ? T.accentSoft : T.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                  {opt.label}
                </Text>
                <Text style={{ marginTop: 3, fontSize: 12, color: T.muted }}>
                  {opt.hint}
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
        ) : timeframe === "none" ? (
          <Text style={{ marginTop: 10, fontSize: 13, color: T.muted }}>
            No expiry — stays open until you mark it done.
          </Text>
        ) : (
          <Text style={{ marginTop: 10, fontSize: 13, color: T.muted }}>
            Expires{" "}
            {formatDareDueAt(expiresAtForTiming(timeframe, customWhen)) ?? "—"}
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
        <Pressable onPress={goSend} className="mb-4 flex-row items-center">
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
            Send a dare
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

  if (view === "sent" || view === "received") {
    const isSent = view === "sent";
    const rows = isSent ? sent : received;
    return (
      <View>
        <BackLink label="Challenges & Dares" onPress={goHub} />
        <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 34, color: T.ink }}>
          {isSent ? "Sent dares" : "Dares received"}
        </Text>
        <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 15, lineHeight: 22, color: T.muted }}>
          {isSent
            ? "Everything you've thrown their way."
            : `What ${partner?.displayName ?? "they"} sent you.`}
        </Text>
        {rows.length ? (
          <View className="mt-5" style={{ gap: 10 }}>
            {rows.map((play) => (
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
        ) : (
          <View
            style={{
              marginTop: 22,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.surface,
              padding: 20,
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 24, color: T.ink }}>
              {isSent ? "Nothing sent yet." : "Nothing waiting for you."}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 14, lineHeight: 21, color: T.muted }}>
              {isSent
                ? "Pick a vibe and send the first one."
                : "When they dare you, it lands here."}
            </Text>
            {isSent ? (
              <View className="mt-4">
                <PrimaryButton label="Send a dare" tone="teal" onPress={goSend} />
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  if (view === "send") {
    return (
      <View>
        <BackLink label="Challenges & Dares" onPress={goHub} />
        <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 34, color: T.ink }}>
          Send a dare
        </Text>
        <Text style={{ marginTop: 8, fontFamily: SERIF, fontSize: 15, lineHeight: 22, color: T.muted }}>
          Pick a vibe. Spin one. Or write your own.
        </Text>

        <View className="mt-5 flex-row flex-wrap justify-between">
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
            Up for it
          </Text>
          {onClose ? (
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={T.muted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={{ gap: 12 }}>
        <HubDoor
          icon="flash-outline"
          title="Send a dare"
          detail="Pick a vibe, spin one, or write your own."
          onPress={goSend}
        />
        <HubDoor
          icon="paper-plane-outline"
          title="See sent dares"
          detail={
            sentOpenCount
              ? `${sentOpenCount} still live`
              : sent.length
                ? `${sent.length} sent`
                : "Nothing sent yet"
          }
          badge={sentOpenCount || undefined}
          onPress={() => setView("sent")}
        />
        <HubDoor
          icon="mail-unread-outline"
          title="Dares received"
          detail={
            receivedWaitingCount
              ? `${receivedWaitingCount} waiting on you`
              : received.length
                ? `${received.length} received`
                : "Nothing waiting for you"
          }
          badge={receivedWaitingCount || undefined}
          hot
          onPress={() => setView("received")}
        />
      </View>
    </View>
  );
}

function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="mb-4 flex-row items-center">
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
        {label}
      </Text>
    </Pressable>
  );
}

function HubDoor({
  icon,
  title,
  detail,
  badge,
  hot,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  badge?: number;
  hot?: boolean;
  onPress: () => void;
}) {
  const accent = hot ? T.hot : T.accent;
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: hot ? "rgba(255,90,122,0.4)" : T.border,
        backgroundColor: T.surfaceRaised,
        paddingVertical: 20,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: hot ? "rgba(255,90,122,0.12)" : T.accentSoft,
          borderWidth: 1,
          borderColor: hot ? "rgba(255,90,122,0.35)" : T.border,
        }}
      >
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View className="ml-3 flex-1">
        <Text style={{ fontFamily: SERIF, fontSize: 22, color: T.ink }}>{title}</Text>
        <Text style={{ marginTop: 4, fontSize: 14, lineHeight: 20, color: T.muted }}>
          {detail}
        </Text>
      </View>
      {badge ? (
        <View
          style={{
            minWidth: 28,
            height: 28,
            paddingHorizontal: 8,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: hot ? T.hot : T.accent,
            marginLeft: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 12,
              color: "#070B10",
            }}
          >
            {badge}
          </Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={T.muted} />
      )}
    </Pressable>
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
  const declined = play.status === "declined";
  const done = play.status === "done";
  const heading = play.direction === "i-do-you" ? "I'll do this to you" : "You do this to me";
  const live = play.status === "offered" || play.status === "accepted";

  return (
    <View
      style={{
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: live ? "rgba(255,90,122,0.4)" : T.border,
        backgroundColor: live ? "rgba(255,90,122,0.1)" : T.surface,
        opacity: declined || done ? 0.78 : 1,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: live ? T.hot : T.muted,
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
      {declined ? (
        <Text
          style={{
            marginTop: 10,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: T.muted,
          }}
        >
          Passed
        </Text>
      ) : null}
      {done ? (
        <Text
          style={{
            marginTop: 10,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Done
        </Text>
      ) : null}
    </View>
  );
}
