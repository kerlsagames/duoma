import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { POSITIONS_TONE, SERIF } from "@/lib/app-themes";
import {
  categoryMeta,
  pickRandomPosition,
  positionById,
  positionsInCategories,
  POSITION_CATEGORIES,
  type PositionCategoryId,
  type SexPosition,
} from "@/lib/sex-positions";
import { useApp } from "@/lib/store";
import type { PositionInvite } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const T = POSITIONS_TONE;

export default function PositionsScreen() {
  const {
    user,
    partner,
    positionInvites,
    sendPositionInvite,
    respondPositionInvite,
    completePositionInvite,
  } = useApp();
  const partnerName = partner?.displayName ?? "them";

  const [enabled, setEnabled] = useState<PositionCategoryId[]>(
    POSITION_CATEGORIES.map((row) => row.id)
  );
  const [current, setCurrent] = useState<SexPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);

  const poolSize = useMemo(
    () => positionsInCategories(enabled).length,
    [enabled]
  );

  const incoming = useMemo(
    () =>
      positionInvites.filter(
        (row) =>
          Boolean(user) &&
          row.toUserId === user!.id &&
          (row.status === "offered" || row.status === "accepted")
      ),
    [positionInvites, user]
  );

  const outgoing = useMemo(
    () =>
      positionInvites.filter(
        (row) =>
          Boolean(user) &&
          row.fromUserId === user!.id &&
          (row.status === "offered" || row.status === "accepted")
      ),
    [positionInvites, user]
  );

  const toggleCategory = (id: PositionCategoryId) => {
    setEnabled((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const pick = () => {
    setError(null);
    setSentFlash(false);
    const next = pickRandomPosition(enabled, current?.id ?? null);
    if (!next) {
      setError("Turn on at least one category.");
      return;
    }
    setCurrent(next);
  };

  // Show a pose immediately so the flat art is visible on open.
  useEffect(() => {
    if (current) return;
    const next = pickRandomPosition(enabled, null);
    if (next) setCurrent(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- first paint only
  }, []);

  const skip = () => {
    setSentFlash(false);
    const next = pickRandomPosition(enabled, current?.id ?? null);
    if (!next) {
      setError("Turn on at least one category.");
      return;
    }
    setCurrent(next);
  };

  const send = async () => {
    if (!current) return;
    setError(null);
    setSending(true);
    try {
      await sendPositionInvite(current.id);
      setSentFlash(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen scroll background={T.background}>
      <View className="pt-4 pb-10">
        <BackButton color={T.accent} style={{ marginBottom: 12 }} />

        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Sex Positions
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 40,
            color: T.ink,
          }}
        >
          Pick a pose
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 24,
            color: T.muted,
          }}
        >
          Toggle categories, spin one up, skip or send it to {partnerName}.
        </Text>

        <Text
          style={{
            marginTop: 22,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: T.muted,
          }}
        >
          Categories in the pool · {poolSize}
        </Text>
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {POSITION_CATEGORIES.map((cat) => {
            const on = enabled.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: on ? T.accent : "rgba(255,255,255,0.12)",
                  backgroundColor: on ? T.accentSoft : T.surface,
                  minWidth: "47%",
                  flexGrow: 1,
                }}
              >
                <Text
                  style={{
                    color: on ? T.accent : T.ink,
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  {cat.label}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    color: T.muted,
                    fontSize: 12,
                    lineHeight: 16,
                  }}
                  numberOfLines={1}
                >
                  {cat.detail}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 20 }}>
          <PrimaryButton
            label="Pick me a Position"
            tone="crimson"
            onPress={pick}
          />
        </View>

        {error ? (
          <Text
            style={{
              marginTop: 12,
              color: "#FF6B7A",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        ) : null}

        {current ? (
          <View
            style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 28,
              backgroundColor: T.frame,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                lineHeight: 32,
                color: T.ink,
                textAlign: "center",
              }}
            >
              {current.name}
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: T.accent,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {categoryMeta(current.category)?.label}
            </Text>
            <Text
              style={{
                marginTop: 12,
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 22,
                color: T.muted,
                textAlign: "center",
              }}
            >
              {current.blurb}
            </Text>

            {sentFlash ? (
              <Text
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  color: T.warm,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Sent to {partnerName}.
              </Text>
            ) : null}

            <View style={{ marginTop: 16, gap: 10 }}>
              <PrimaryButton
                label={`Send to ${partnerName}`}
                tone="crimson"
                loading={sending}
                onPress={() => void send()}
              />
              <PrimaryButton label="Skip" tone="ghost" onPress={skip} />
            </View>
          </View>
        ) : (
          <View
            style={{
              marginTop: 22,
              height: 220,
              borderRadius: 28,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "rgba(255,255,255,0.14)",
              backgroundColor: T.surface,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <Ionicons name="body-outline" size={36} color={T.accent} />
            <Text
              style={{
                marginTop: 12,
                fontFamily: SERIF,
                fontSize: 16,
                color: T.muted,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Your next position lands here — flat pink / blue pose guide.
            </Text>
          </View>
        )}

        {incoming.length ? (
          <InviteSection
            title={`From ${partnerName}`}
            rows={incoming}
            partnerName={partnerName}
            outgoing={false}
            onRespond={(id, status) => void respondPositionInvite(id, status)}
            onDone={(id) => void completePositionInvite(id)}
          />
        ) : null}

        {outgoing.length ? (
          <InviteSection
            title={`Sent to ${partnerName}`}
            rows={outgoing}
            partnerName={partnerName}
            outgoing
            onRespond={() => undefined}
            onDone={(id) => void completePositionInvite(id)}
          />
        ) : null}
      </View>
    </Screen>
  );
}

function InviteSection({
  title,
  rows,
  partnerName,
  outgoing,
  onRespond,
  onDone,
}: {
  title: string;
  rows: PositionInvite[];
  partnerName: string;
  outgoing: boolean;
  onRespond: (id: string, status: "accepted" | "declined") => void;
  onDone: (id: string) => void;
}) {
  return (
    <View style={{ marginTop: 28 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          color: T.muted,
        }}
      >
        {title}
      </Text>
      <View style={{ marginTop: 12, gap: 12 }}>
        {rows.map((row) => {
          const position = positionById(row.positionId);
          if (!position) return null;
          return (
            <View
              key={row.id}
              style={{
                padding: 14,
                borderRadius: 20,
                backgroundColor: T.surfaceRaised,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  color: T.ink,
                }}
              >
                {position.name}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: T.accent,
                  fontWeight: "600",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {row.status}
                {outgoing ? ` · to ${partnerName}` : ` · from ${partnerName}`}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 20,
                  color: T.muted,
                }}
              >
                {position.blurb}
              </Text>
              {!outgoing && row.status === "offered" ? (
                <View style={{ marginTop: 12, gap: 8 }}>
                  <PrimaryButton
                    label="I'm into it"
                    tone="crimson"
                    onPress={() => onRespond(row.id, "accepted")}
                  />
                  <PrimaryButton
                    label="Pass"
                    tone="ghost"
                    onPress={() => onRespond(row.id, "declined")}
                  />
                </View>
              ) : null}
              {row.status === "accepted" ? (
                <View style={{ marginTop: 12 }}>
                  <PrimaryButton
                    label="Mark done"
                    tone="ghost"
                    onPress={() => onDone(row.id)}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
