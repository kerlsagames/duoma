import { LookPanel } from "@/components/hub/AppSettings";
import { PlayRatingsToggle, PlayTabs } from "@/components/hub/PlayTabs";
import { ScoreSlider } from "@/components/ScoreSlider";
import { BackButton } from "@/components/ui/BackButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { POSITIONS_TONE, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { addDaysToDateKey, localDateKey, upcomingWeekday } from "@/lib/dates";
import {
  categoryMeta,
  pickRandomPosition,
  positionById,
  POSITION_CATEGORIES,
  POSITION_COUNT,
  positionsInCategory,
  searchPositions,
  type PositionCategoryId,
  type SexPosition,
} from "@/lib/sex-positions";
import { useApp } from "@/lib/store";
import {
  myPlayRating,
  positionAskForPose,
  ratingsForTarget,
  tonightAskCopy,
} from "@/lib/play-items";
import {
  POSITIONS_PREFS_KEY,
  usePlayRatingsPrefs,
} from "@/lib/play-prefs";
import type { PositionInvite, PositionSave } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const T = POSITIONS_TONE;
type Tab = "pick" | "todo" | "done";

export default function PositionsScreen() {
  const {
    user,
    partner,
    positionInvites,
    positionSaves,
    playItemRatings,
    sendPositionInvite,
    respondPositionInvite,
    completePositionInvite,
    savePosition,
    markPositionSaveDone,
    ratePlayItem,
  } = useApp();
  const { prefs, save: savePrefs } = usePlayRatingsPrefs(POSITIONS_PREFS_KEY);
  const look = useAppLook("positions", T.accent, {});
  const partnerName = partner?.displayName ?? "them";
  const [tab, setTab] = useState<Tab>("pick");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [enabled, setEnabled] = useState<PositionCategoryId[]>(
    POSITION_CATEGORIES.map((row) => row.id)
  );
  const [current, setCurrent] = useState<SexPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [scheduledFlash, setScheduledFlash] = useState<string | null>(null);
  const [askWhen, setAskWhen] = useState<{ dateKey: string; label: string } | null>(
    null
  );
  const [showBrowse, setShowBrowse] = useState(false);
  const [query, setQuery] = useState("");

  const poolSize = useMemo(() => searchPositions(enabled, "").length, [enabled]);
  const browse = useMemo(() => searchPositions(enabled, query), [enabled, query]);

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

  const openSaves = useMemo(
    () => positionSaves.filter((row) => !row.doneAt),
    [positionSaves]
  );
  const doneSaves = useMemo(
    () => positionSaves.filter((row) => row.doneAt),
    [positionSaves]
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
    setSavedFlash(false);
    setScheduledFlash(null);
    setAskWhen(null);
    const next = pickRandomPosition(enabled, current?.id ?? null);
    if (!next) {
      setError("Turn on at least one category.");
      return;
    }
    setCurrent(next);
  };

  // Show a pose immediately so the card isn't empty on open.
  useEffect(() => {
    if (current) return;
    const next = pickRandomPosition(enabled, null);
    if (next) setCurrent(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- first paint only
  }, []);

  const skip = () => {
    setSentFlash(false);
    setSavedFlash(false);
    setScheduledFlash(null);
    setAskWhen(null);
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
      await savePosition(current.id);
      await sendPositionInvite(current.id);
      setSentFlash(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  const saveCurrent = async () => {
    if (!current) return;
    setError(null);
    try {
      await savePosition(current.id);
      setSavedFlash(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  };

  const scheduleOn = async (dateKey: string, label: string) => {
    if (!current) return;
    setError(null);
    setSending(true);
    try {
      await savePosition(current.id);
      await sendPositionInvite(current.id, { dateKey, label });
      setSentFlash(true);
      setScheduledFlash(label);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not ask them.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen
      scroll
      background={T.background}
      density={look.prefs.density}
      typeface={look.prefs.typeface}
      wash={look.wash}
    >
      <View className="pt-4 pb-10">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <BackButton color={look.accent} />
          <Pressable
            onPress={() => setSettingsOpen((value) => !value)}
            hitSlop={10}
            accessibilityLabel="Positions settings"
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
              color={look.accent}
            />
          </Pressable>
        </View>

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
          Save poses to To-do. Tick them off when you try them. Tap one to ask{" "}
          {partnerName} tonight.
        </Text>

        {settingsOpen ? (
          <View style={{ marginTop: 22 }}>
            <LookPanel look={look} ink={T.ink} muted={T.muted} pageColor={T.background}>
              <PlayRatingsToggle
                on={prefs.ratingsOn}
                accent={look.accent}
                ink={T.ink}
                onToggle={() => void savePrefs({ ratingsOn: !prefs.ratingsOn })}
              />
            </LookPanel>
          </View>
        ) : (
          <>
            <View style={{ marginTop: 20 }}>
              <PlayTabs
                tabs={[
                  { id: "pick" as const, label: "Pick" },
                  {
                    id: "todo" as const,
                    label: `To-do${openSaves.length ? ` · ${openSaves.length}` : ""}`,
                  },
                  { id: "done" as const, label: "Completed" },
                ]}
                current={tab}
                onChange={setTab}
                accent={T.accent}
                ink={T.ink}
              />
            </View>

            {tab === "pick" ? (
              <>
        <View style={{ marginTop: 4 }}>
          <PrimaryButton
            label="Pick me a Position"
            tone="crimson"
            onPress={pick}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <PrimaryButton
            label={showBrowse ? "Hide the list" : `Search all ${POSITION_COUNT}`}
            tone="ghost"
            onPress={() => setShowBrowse((value) => !value)}
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
                marginTop: 10,
                fontFamily: SERIF,
                fontSize: 34,
                lineHeight: 40,
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
                fontSize: 18,
                lineHeight: 26,
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
                  color: T.accent,
                  fontSize: 16,
                  fontWeight: "600",
                  lineHeight: 22,
                }}
              >
                Asked {partnerName} to confirm
                {scheduledFlash ? ` ${scheduledFlash}` : " tonight"}.
              </Text>
            ) : null}
            {savedFlash ? (
              <Text
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  color: T.accent,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Saved to To-do.
              </Text>
            ) : null}

            {scheduledFlash && !sentFlash ? (
              <Text
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  color: T.accent,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Waiting on {partnerName} for {scheduledFlash}.
              </Text>
            ) : null}

            <View style={{ marginTop: 16, gap: 10 }}>
              <PrimaryButton
                label="Save to to-do"
                tone="ghost"
                onPress={() => void saveCurrent()}
              />
              <PrimaryButton
                label="Try this tonight?"
                tone="crimson"
                loading={sending}
                onPress={() => void send()}
              />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {(
                  [
                    { dateKey: localDateKey(), label: "tonight", title: "Tonight" },
                    {
                      dateKey: upcomingWeekday(6),
                      label: "this Saturday",
                      title: "This Saturday",
                    },
                    {
                      dateKey: addDaysToDateKey(upcomingWeekday(6), 7),
                      label: "next Saturday",
                      title: "Next Saturday",
                    },
                  ] as const
                ).map((chip) => {
                  const on =
                    askWhen?.label === chip.label || scheduledFlash === chip.label;
                  return (
                    <Pressable
                      key={chip.label}
                      onPress={() => setAskWhen({ dateKey: chip.dateKey, label: chip.label })}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: on ? T.accent : "rgba(255,255,255,0.16)",
                        backgroundColor: on ? "rgba(255,0,127,0.18)" : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: T.accent,
                          fontWeight: "700",
                          fontSize: 16,
                        }}
                      >
                        {chip.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
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
              Your next position lands here. Spin one, or search the list.
            </Text>
          </View>
        )}

        <Text
          style={{
            marginTop: 28,
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
                  {cat.label} · {positionsInCategory(cat.id).length}
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

        {showBrowse ? (
          <View style={{ marginTop: 22 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search names and notes"
              placeholderTextColor="rgba(246,238,242,0.35)"
              style={{
                height: 48,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
                backgroundColor: T.surface,
                paddingHorizontal: 16,
                color: T.ink,
                fontSize: 16,
              }}
            />
            <Text
              style={{
                marginTop: 10,
                marginBottom: 8,
                fontSize: 13,
                color: T.muted,
              }}
            >
              {browse.length} match{browse.length === 1 ? "" : "es"}
            </Text>
            {browse.length === 0 ? (
              <Text style={{ color: T.muted, fontSize: 14, lineHeight: 20 }}>
                Nothing matches. Try a different word or turn a category back on.
              </Text>
            ) : (
              <View style={{ gap: 8 }}>
                {browse.map((pose) => {
                  const on = current?.id === pose.id;
                  return (
                    <Pressable
                      key={pose.id}
                      onPress={() => {
                        setSentFlash(false);
                        setSavedFlash(false);
                        setError(null);
                        setCurrent(pose);
                      }}
                      style={{
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: on ? T.border : "rgba(255,255,255,0.1)",
                        backgroundColor: on ? T.accentSoft : T.surface,
                        padding: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: SERIF,
                          fontSize: 18,
                          color: T.ink,
                        }}
                      >
                        {pose.name}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 13,
                          lineHeight: 18,
                          color: T.muted,
                        }}
                        numberOfLines={2}
                      >
                        {pose.blurb}
                      </Text>
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                          color: T.accent,
                          fontWeight: "600",
                        }}
                      >
                        {categoryMeta(pose.category)?.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        {incoming.length ? (
          <InviteSection
            title={`Tonight? · from ${partnerName}`}
            rows={incoming}
            partnerName={partnerName}
            outgoing={false}
            onRespond={(id, status) => void respondPositionInvite(id, status)}
            onDone={(id) => void completePositionInvite(id)}
          />
        ) : null}

        {outgoing.length ? (
          <InviteSection
            title={`Asked ${partnerName}`}
            rows={outgoing}
            partnerName={partnerName}
            outgoing
            onRespond={() => undefined}
            onDone={(id) => void completePositionInvite(id)}
          />
        ) : null}
              </>
            ) : null}

            {tab === "todo" ? (
              <PositionTodo
                saves={openSaves}
                invites={positionInvites}
                userId={user?.id ?? null}
                partnerName={partnerName}
                onAsk={(positionId) =>
                  void sendPositionInvite(positionId).catch((err) =>
                    setError(err instanceof Error ? err.message : "Could not send.")
                  )
                }
                onDone={(id) => void markPositionSaveDone(id)}
                incoming={incoming}
                onRespond={(id, status) => void respondPositionInvite(id, status)}
                onInviteDone={(id) => void completePositionInvite(id)}
              />
            ) : null}

            {tab === "done" ? (
              <PositionDone
                saves={doneSaves}
                ratingsOn={prefs.ratingsOn}
                ratings={playItemRatings}
                userId={user?.id ?? null}
                partnerName={partnerName}
                onRate={(id, stars) => void ratePlayItem("position", id, stars)}
              />
            ) : null}
          </>
        )}
      </View>
      <ConfirmDialog
        open={Boolean(askWhen)}
        title={`Ask ${partnerName} to confirm?`}
        body={`${askWhen?.label === "tonight" ? "Tonight" : askWhen?.label === "this Saturday" ? "This Saturday" : "Next Saturday"} stays off the calendar until they say yes.`}
        confirmLabel="Ask them"
        cancelLabel="Not now"
        onCancel={() => setAskWhen(null)}
        onConfirm={() => {
          const next = askWhen;
          setAskWhen(null);
          if (next) void scheduleOn(next.dateKey, next.label);
        }}
      />
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
                  {row.status === "offered"
                    ? outgoing
                      ? `Waiting on ${partnerName}${row.whenLabel ? ` · ${row.whenLabel}` : ""}`
                      : `${partnerName} asked · ${row.whenLabel ?? "tonight"}?`
                    : row.status === "accepted"
                      ? `${row.whenLabel ?? "Tonight"}'s on`
                      : row.status}
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
                    label={row.whenLabel ? `Yes — ${row.whenLabel}` : "Yes — tonight"}
                    tone="crimson"
                    onPress={() => onRespond(row.id, "accepted")}
                  />
                  <PrimaryButton
                    label="Not tonight"
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

function PositionTodo({
  saves,
  invites,
  userId,
  partnerName,
  onAsk,
  onDone,
  incoming,
  onRespond,
  onInviteDone,
}: {
  saves: PositionSave[];
  invites: PositionInvite[];
  userId: string | null;
  partnerName: string;
  onAsk: (positionId: string) => void;
  onDone: (id: string) => void;
  incoming: PositionInvite[];
  onRespond: (id: string, status: "accepted" | "declined") => void;
  onInviteDone: (id: string) => void;
}) {
  return (
    <View>
      {incoming.length ? (
        <InviteSection
          title={`Tonight? · from ${partnerName}`}
          rows={incoming}
          partnerName={partnerName}
          outgoing={false}
          onRespond={onRespond}
          onDone={onInviteDone}
        />
      ) : null}
      <Text
        style={{
          marginTop: incoming.length ? 8 : 0,
          fontSize: 13,
          lineHeight: 20,
          color: T.muted,
        }}
      >
        {saves.length
          ? "Tick one off after you try it. Or send try this tonight?"
          : "Save a pose from Pick. It waits here until you tick it off."}
      </Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        {saves.map((row) => {
          const position = positionById(row.positionId);
          if (!position) return null;
          const ask = positionAskForPose(invites, row.positionId);
          const mine = ask ? ask.fromUserId === userId : true;
          return (
            <View
              key={row.id}
              style={{
                padding: 14,
                borderRadius: 20,
                backgroundColor: T.surface,
                borderWidth: 1,
                borderColor: T.border,
              }}
            >
              <Text style={{ fontFamily: SERIF, fontSize: 20, color: T.ink }}>
                {position.name}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 18,
                  color: T.muted,
                }}
              >
                {tonightAskCopy(ask?.status ?? null, mine, partnerName, "position")}
              </Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                {ask?.status === "offered" && !mine ? (
                  <>
                    <PrimaryButton
                      label={ask.whenLabel ? `Yes — ${ask.whenLabel}` : "Yes — tonight"}
                      tone="crimson"
                      onPress={() => onRespond(ask.id, "accepted")}
                    />
                    <PrimaryButton
                      label="Not tonight"
                      tone="ghost"
                      onPress={() => onRespond(ask.id, "declined")}
                    />
                  </>
                ) : !ask ? (
                  <PrimaryButton
                    label="Try this tonight?"
                    tone="crimson"
                    onPress={() => onAsk(row.positionId)}
                  />
                ) : null}
                <PrimaryButton
                  label="Mark done"
                  tone="ghost"
                  onPress={() => onDone(row.id)}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PositionDone({
  saves,
  ratingsOn,
  ratings,
  userId,
  partnerName,
  onRate,
}: {
  saves: PositionSave[];
  ratingsOn: boolean;
  ratings: import("@/lib/types").PlayItemRating[];
  userId: string | null;
  partnerName: string;
  onRate: (id: string, stars: number) => void;
}) {
  if (!saves.length) {
    return (
      <Text style={{ color: T.muted, fontSize: 14, lineHeight: 20 }}>
        Tick a pose off To-do and it lands here.
      </Text>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {saves.map((row) => {
        const position = positionById(row.positionId);
        if (!position) return null;
        const mine = myPlayRating(ratings, "position", row.id, userId);
        const theirs = ratingsForTarget(ratings, "position", row.id).find(
          (item) => item.userId !== userId
        );
        return (
          <View
            key={row.id}
            style={{
              padding: 14,
              borderRadius: 20,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 20, color: T.ink }}>
              {position.name}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 12, color: T.muted }}>Done</Text>
            {ratingsOn ? (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>
                  You {mine ? mine.stars.toFixed(1) : "—"} · {partnerName}{" "}
                  {theirs ? theirs.stars.toFixed(1) : "—"}
                </Text>
                <ScoreSlider
                  value={mine?.stars ?? 7.5}
                  onChange={(stars) => onRate(row.id, stars)}
                  accent={T.accent}
                  labelColor={T.ink}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
