import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { HUB_TONES, SERIF } from "@/lib/app-themes";
import {
  SPICY_DARE_CATEGORIES,
  directionLabel,
  isSpicyDareDeck,
  timeframeLabel,
  withPlayStatus,
  type SpicyDare,
  type SpicyDareCategory,
} from "@/lib/spicy-dares";
import { useApp } from "@/lib/store";
import type { DareDirection, DareTimeframe, SpicyDarePlay } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const THEME = HUB_TONES.talk;
const ROSE = "#C97B8A";

type Filter = "all" | SpicyDareCategory;
type Compose = {
  dareId: string | null;
  text: string;
  categories: string[];
};

const TIMEFRAMES: { id: DareTimeframe; label: string; hint: string }[] = [
  { id: "tonight", label: "Tonight", hint: "Before bed" },
  { id: "24h", label: "24 hours", hint: "A day from now" },
  { id: "custom", label: "Custom", hint: "You name it" },
];

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? ROSE : "rgba(244,237,224,0.16)",
        backgroundColor: active ? "rgba(201,123,138,0.22)" : "transparent",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 0.4,
          color: active ? THEME.ink : "rgba(244,237,224,0.62)",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function dareWhen(play: SpicyDarePlay): string {
  return timeframeLabel(play.timeframe, play.customWhen);
}

export function SpicyDarePanel({ onClose }: { onClose: () => void }) {
  const {
    user,
    partner,
    talkDecks,
    spicyDares,
    sendSpicyDare,
    respondSpicyDare,
    completeSpicyDare,
  } = useApp();

  const [filter, setFilter] = useState<Filter>("all");
  const [compose, setCompose] = useState<Compose | null>(null);
  const [direction, setDirection] = useState<DareDirection | null>(null);
  const [timeframe, setTimeframe] = useState<DareTimeframe>("tonight");
  const [customWhen, setCustomWhen] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const playedIds = useMemo(() => {
    const deck = talkDecks.find(
      (row) => row.userId === user?.id && isSpicyDareDeck(row.categoryId)
    );
    return deck?.played ?? [];
  }, [talkDecks, user?.id]);

  const catalog = useMemo(() => {
    const tagged = withPlayStatus(playedIds);
    const subset =
      filter === "all" ? tagged : tagged.filter((row) => row.categories.includes(filter));
    return [...subset].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "unplayed" ? -1 : 1;
    });
  }, [filter, playedIds]);

  const live = useMemo(
    () => spicyDares.filter((row) => row.status === "offered" || row.status === "accepted"),
    [spicyDares]
  );
  const recentDone = useMemo(
    () =>
      spicyDares
        .filter((row) => row.status === "done" || row.status === "declined")
        .sort((a, b) => (b.completedAt ?? b.answeredAt ?? b.createdAt).localeCompare(
          a.completedAt ?? a.answeredAt ?? a.createdAt
        ))
        .slice(0, 4),
    [spicyDares]
  );

  const openCompose = (dare: SpicyDare | null) => {
    setError(null);
    setDirection(null);
    setTimeframe("tonight");
    setCustomWhen("");
    setCompose(
      dare
        ? { dareId: dare.id, text: dare.text, categories: [...dare.categories] }
        : { dareId: null, text: "", categories: [] }
    );
  };

  const send = async () => {
    if (!compose) return;
    if (!direction) {
      setError("Pick who does this.");
      return;
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
        customWhen,
      });
      setCompose(null);
      setDirection(null);
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

  if (compose) {
    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              setCompose(null);
              setError(null);
            }}
            hitSlop={12}
            className="flex-row items-center"
          >
            <Ionicons name="chevron-back" size={20} color={ROSE} />
            <Text
              style={{
                marginLeft: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: ROSE,
              }}
            >
              Back to dares
            </Text>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color="rgba(244,237,224,0.7)" />
          </Pressable>
        </View>

        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 26,
            lineHeight: 34,
            color: THEME.ink,
          }}
        >
          {compose.dareId ? "Tweak it, then send." : "Write your own."}
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 15,
            lineHeight: 22,
            fontStyle: "italic",
            color: THEME.muted,
          }}
        >
          Edit the dare, pick who does it, and name a window. They still have to be up for it.
        </Text>

        <TextInput
          value={compose.text}
          onChangeText={(text) => setCompose({ ...compose, text })}
          placeholder="The dare, in your words"
          placeholderTextColor="rgba(244,237,224,0.35)"
          multiline
          style={{
            marginTop: 18,
            minHeight: 110,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(201,123,138,0.35)",
            backgroundColor: "#12100C",
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: THEME.ink,
            fontFamily: SERIF,
            fontSize: 17,
            lineHeight: 24,
          }}
        />

        {compose.dareId === null ? (
          <View className="mt-4" style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: ROSE,
              }}
            >
              Tag it
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {SPICY_DARE_CATEGORIES.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  active={compose.categories.includes(tag)}
                  onPress={() => toggleCustomTag(tag)}
                />
              ))}
            </View>
          </View>
        ) : compose.categories.length ? (
          <Text
            style={{
              marginTop: 10,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 0.4,
              color: "rgba(244,237,224,0.5)",
            }}
          >
            {compose.categories.join(" · ")}
          </Text>
        ) : null}

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: ROSE,
          }}
        >
          Who starts it
        </Text>
        <View className="mt-3" style={{ gap: 10 }}>
          {(["i-do-you", "you-do-me"] as DareDirection[]).map((id) => {
            const active = direction === id;
            return (
              <Pressable
                key={id}
                onPress={() => setDirection(id)}
                style={{
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: active ? ROSE : "rgba(244,237,224,0.14)",
                  backgroundColor: active ? "rgba(201,123,138,0.18)" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 18,
                    color: THEME.ink,
                  }}
                >
                  {directionLabel(id)}
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: SERIF,
                    fontSize: 14,
                    lineHeight: 20,
                    color: THEME.muted,
                  }}
                >
                  {id === "i-do-you"
                    ? "You do it to them, in the window you set. They still have to say yes."
                    : "They do it to you — if they're up for it — in the window you set."}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            marginTop: 22,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: ROSE,
          }}
        >
          When
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
                  borderRadius: 18,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderWidth: 1,
                  borderColor: active ? ROSE : "rgba(244,237,224,0.14)",
                  backgroundColor: active ? "rgba(201,123,138,0.18)" : "transparent",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: SERIF,
                    fontSize: 15,
                    color: THEME.ink,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    textAlign: "center",
                    fontFamily: "SpaceMono",
                    fontSize: 10,
                    color: "rgba(244,237,224,0.5)",
                  }}
                >
                  {item.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {timeframe === "custom" ? (
          <TextInput
            value={customWhen}
            onChangeText={setCustomWhen}
            placeholder="Saturday after dinner, or 'this weekend'"
            placeholderTextColor="rgba(244,237,224,0.35)"
            style={{
              marginTop: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "rgba(201,123,138,0.35)",
              backgroundColor: "#12100C",
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: THEME.ink,
              fontFamily: SERIF,
              fontSize: 16,
            }}
          />
        ) : null}

        {error ? (
          <Text style={{ marginTop: 14, color: "#E8A090", fontFamily: SERIF }}>{error}</Text>
        ) : null}
        <View className="mt-5">
          <PrimaryButton
            tone="gold"
            label="Send this dare"
            loading={loading}
            onPress={() => void send()}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View className="mb-4 flex-row items-center justify-between">
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: ROSE,
          }}
        >
          Spicy Challenges & Dares
        </Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={22} color="rgba(244,237,224,0.7)" />
        </Pressable>
      </View>
      <Text
        style={{
          fontFamily: SERIF,
          fontSize: 26,
          lineHeight: 34,
          color: THEME.ink,
        }}
      >
        Pick a dare, or write your own.
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 15,
          lineHeight: 22,
          fontStyle: "italic",
          color: THEME.muted,
        }}
      >
        Filter the deck, tweak the wording, then choose who does it and when.
      </Text>

      {live.length ? (
        <View className="mt-5" style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: ROSE,
            }}
          >
            Live dares
          </Text>
          {live.map((play) => (
            <LiveDareCard
              key={play.id}
              play={play}
              userId={user?.id}
              partnerName={partner?.displayName ?? "them"}
              demoPartner={Boolean(partner?.isDemo && play.toUserId === partner.id)}
              onRespond={(status) => void respondSpicyDare(play.id, status)}
              onDone={() => void completeSpicyDare(play.id)}
            />
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={() => openCompose(null)}
        style={{
          marginTop: 18,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: "rgba(201,123,138,0.45)",
        }}
      >
        <Text style={{ fontFamily: SERIF, fontSize: 18, color: THEME.ink }}>
          Write your own dare
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: SERIF,
            fontSize: 14,
            color: THEME.muted,
          }}
        >
          A custom line, tagged however you want.
        </Text>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16, marginHorizontal: -6 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 6 }}
      >
        <Chip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
        {SPICY_DARE_CATEGORIES.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            active={filter === tag}
            onPress={() => setFilter(tag)}
          />
        ))}
      </ScrollView>

      <Text
        style={{
          marginTop: 16,
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 0.6,
          color: "rgba(244,237,224,0.45)",
        }}
      >
        {filter === "all"
          ? `${catalog.length} dares`
          : `${catalog.length} in ${filter}`}
        {playedIds.length ? ` · ${playedIds.length} already sent` : ""}
      </Text>

      <View className="mt-3" style={{ gap: 10 }}>
        {catalog.map((dare) => {
          const played = dare.status === "played";
          return (
            <Pressable
              key={dare.id}
              onPress={() => openCompose(dare)}
              style={{
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: played ? "rgba(244,237,224,0.08)" : "rgba(201,123,138,0.28)",
                backgroundColor: played ? "rgba(255,255,255,0.03)" : "rgba(201,123,138,0.08)",
                opacity: played ? 0.72 : 1,
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  lineHeight: 24,
                  color: THEME.ink,
                }}
              >
                {dare.text}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 0.3,
                  color: "rgba(244,237,224,0.5)",
                }}
              >
                {dare.categories.join(" · ")}
                {played ? " · sent" : ""}
              </Text>
            </Pressable>
          );
        })}
        {catalog.length === 0 ? (
          <Text style={{ fontFamily: SERIF, fontSize: 15, color: THEME.muted }}>
            Nothing in this filter yet. Write your own, or pick All.
          </Text>
        ) : null}
      </View>

      {recentDone.length ? (
        <View className="mt-6" style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "rgba(244,237,224,0.45)",
            }}
          >
            Recently closed
          </Text>
          {recentDone.map((play) => (
            <Text
              key={play.id}
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                lineHeight: 20,
                color: "rgba(244,237,224,0.45)",
              }}
            >
              {play.status === "done" ? "Done" : "Passed"} · {play.text}
            </Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function LiveDareCard({
  play,
  userId,
  partnerName,
  demoPartner,
  onRespond,
  onDone,
}: {
  play: SpicyDarePlay;
  userId?: string;
  partnerName: string;
  demoPartner: boolean;
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
        borderColor: "rgba(201,123,138,0.4)",
        backgroundColor: "rgba(201,123,138,0.12)",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: ROSE,
        }}
      >
        {heading} · {dareWhen(play)}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontSize: 17,
          lineHeight: 24,
          color: THEME.ink,
        }}
      >
        {play.text}
      </Text>
      {mineIncoming ? (
        <View className="mt-3 flex-row" style={{ gap: 8 }}>
          <View className="flex-1">
            <PrimaryButton tone="gold" label="I'm up for it" onPress={() => onRespond("accepted")} />
          </View>
          <View className="flex-1">
            <PrimaryButton tone="ghost" label="Not this one" onPress={() => onRespond("declined")} />
          </View>
        </View>
      ) : null}
      {waitingOnThem ? (
        <>
          <Text
            style={{
              marginTop: 10,
              fontFamily: SERIF,
              fontStyle: "italic",
              color: THEME.muted,
            }}
          >
            Waiting on {partnerName} to accept.
          </Text>
          {demoPartner ? (
            <View className="mt-3 flex-row" style={{ gap: 8 }}>
              <View className="flex-1">
                <PrimaryButton
                  tone="gold"
                  label={`${partnerName} says yes`}
                  onPress={() => onRespond("accepted")}
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  tone="ghost"
                  label="They pass"
                  onPress={() => onRespond("declined")}
                />
              </View>
            </View>
          ) : null}
        </>
      ) : null}
      {accepted ? (
        <View className="mt-3">
          <PrimaryButton tone="gold" label="Mark it done" onPress={onDone} />
        </View>
      ) : null}
    </View>
  );
}
