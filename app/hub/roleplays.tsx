import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { ROLEPLAYS_TONE, SERIF } from "@/lib/app-themes";
import {
  categoryMeta,
  personalizeRoleplayText,
  pickRandomRoleplay,
  roleplayById,
  roleplayCastNames,
  roleplaysInCategories,
  ROLEPLAY_CATEGORIES,
  type Roleplay,
  type RoleplayCategoryId,
} from "@/lib/roleplays";
import { useApp } from "@/lib/store";
import type { RoleplayInvite } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const T = ROLEPLAYS_TONE;
const ALL_CATEGORY_IDS = ROLEPLAY_CATEGORIES.map((row) => row.id);

export default function RoleplaysScreen() {
  const {
    user,
    partner,
    roleplayInvites,
    sendRoleplayInvite,
    respondRoleplayInvite,
    completeRoleplayInvite,
  } = useApp();
  const partnerName = partner?.displayName ?? "them";
  const cast = useMemo(
    () => roleplayCastNames(user, partner),
    [user, partner]
  );

  const [enabled, setEnabled] =
    useState<RoleplayCategoryId[]>(ALL_CATEGORY_IDS);
  const [current, setCurrent] = useState<Roleplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);

  const poolSize = useMemo(
    () => roleplaysInCategories(enabled).length,
    [enabled]
  );
  const allOn = enabled.length === ROLEPLAY_CATEGORIES.length;
  const allOff = enabled.length === 0;

  const incoming = useMemo(
    () =>
      roleplayInvites.filter(
        (row) =>
          Boolean(user) &&
          row.toUserId === user!.id &&
          (row.status === "offered" || row.status === "accepted")
      ),
    [roleplayInvites, user]
  );

  const outgoing = useMemo(
    () =>
      roleplayInvites.filter(
        (row) =>
          Boolean(user) &&
          row.fromUserId === user!.id &&
          (row.status === "offered" || row.status === "accepted")
      ),
    [roleplayInvites, user]
  );

  const spin = (excludeId?: string | null) => {
    setError(null);
    setSentFlash(false);
    const next = pickRandomRoleplay(enabled, excludeId);
    if (!next) {
      setCurrent(null);
      setError(
        allOff
          ? "Turn on at least one category to spin."
          : "No scenarios in this pool."
      );
      return;
    }
    setCurrent(next);
  };

  useEffect(() => {
    // Land on a random scenario as soon as the screen opens / pool changes.
    const next = pickRandomRoleplay(enabled, null);
    setCurrent(next);
    if (!next && enabled.length === 0) {
      setError("Turn on at least one category to spin.");
    } else {
      setError(null);
    }
    setSentFlash(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-roll when the enabled set identity changes
  }, [enabled.join("|")]);

  const toggleCategory = (id: RoleplayCategoryId) => {
    setEnabled((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const toggleAll = () => {
    setEnabled(allOn ? [] : ALL_CATEGORY_IDS);
  };

  const send = async () => {
    if (!current) return;
    setError(null);
    setSending(true);
    try {
      await sendRoleplayInvite(current.id);
      setSentFlash(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  const personalizedBlurb = current
    ? personalizeRoleplayText(current.blurb, cast)
    : null;

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
          Desire · Spicy Roleplays
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
          Tonight&apos;s scene
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
          Spin a scenario for {cast.f} & {cast.m}, then tune the category pool
          below.
        </Text>

        {current && personalizedBlurb ? (
          <View
            style={{
              marginTop: 22,
              padding: 18,
              borderRadius: 28,
              backgroundColor: T.frame,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: T.accent,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {categoryMeta(current.category)?.label}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 28,
                lineHeight: 34,
                color: T.ink,
                textAlign: "center",
              }}
            >
              {current.name}
            </Text>
            <Text
              style={{
                marginTop: 14,
                fontFamily: SERIF,
                fontSize: 16,
                lineHeight: 24,
                color: T.muted,
                textAlign: "center",
              }}
            >
              {personalizedBlurb}
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
                label="Spin again"
                tone="crimson"
                onPress={() => spin(current.id)}
                disabled={poolSize === 0}
              />
              <PrimaryButton
                label={`Send to ${partnerName}`}
                tone="ghost"
                loading={sending}
                onPress={() => void send()}
              />
            </View>
          </View>
        ) : (
          <View
            style={{
              marginTop: 22,
              minHeight: 180,
              borderRadius: 28,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "rgba(255,255,255,0.14)",
              backgroundColor: T.surface,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 28,
            }}
          >
            <Ionicons name="sparkles-outline" size={36} color={T.accent} />
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
              {allOff
                ? "All categories are off. Turn some on below to spin a scene."
                : "No scenario in the pool yet."}
            </Text>
            {!allOff ? (
              <View style={{ marginTop: 16, alignSelf: "stretch" }}>
                <PrimaryButton
                  label="Spin a roleplay"
                  tone="crimson"
                  onPress={() => spin(null)}
                />
              </View>
            ) : null}
          </View>
        )}

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

        <View
          style={{
            marginTop: 28,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: T.muted,
            }}
          >
            Categories · {poolSize}
          </Text>
          <Pressable
            onPress={toggleAll}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: allOn ? T.accent : "rgba(255,255,255,0.18)",
              backgroundColor: allOn ? T.accentSoft : "rgba(255,255,255,0.04)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: allOn ? T.accent : T.ink,
              }}
            >
              {allOn ? "Turn all off" : "Turn all on"}
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {ROLEPLAY_CATEGORIES.map((cat) => {
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

        {incoming.length ? (
          <InviteSection
            title={`From ${partnerName}`}
            rows={incoming}
            partnerName={partnerName}
            cast={cast}
            outgoing={false}
            onRespond={(id, status) => void respondRoleplayInvite(id, status)}
            onDone={(id) => void completeRoleplayInvite(id)}
          />
        ) : null}

        {outgoing.length ? (
          <InviteSection
            title={`Sent to ${partnerName}`}
            rows={outgoing}
            partnerName={partnerName}
            cast={cast}
            outgoing
            onRespond={() => undefined}
            onDone={(id) => void completeRoleplayInvite(id)}
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
  cast,
  outgoing,
  onRespond,
  onDone,
}: {
  title: string;
  rows: RoleplayInvite[];
  partnerName: string;
  cast: { f: string; m: string };
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
          const roleplay = roleplayById(row.roleplayId);
          if (!roleplay) return null;
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
                {roleplay.name}
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
                {personalizeRoleplayText(roleplay.blurb, cast)}
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
