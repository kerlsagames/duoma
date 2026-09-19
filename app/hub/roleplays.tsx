import { AskNightBox } from "@/components/hub/AskNightBox";
import { LookPanel, SettingsDock } from "@/components/hub/AppSettings";
import { PlayTabs } from "@/components/hub/PlayTabs";
import { RoleplayArt } from "@/components/hub/RoleplayArt";
import { FavoriteHeart, favoriteHeartCorner } from "@/components/ui/FavoriteHeart";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PokeThem } from "@/components/ui/PokeThem";
import { ClearAllBar, SwipeClearRow } from "@/components/ui/SwipeClearRow";
import { Screen } from "@/components/ui/Screen";
import { useInboxClears } from "@/lib/inbox-clears";
import { ROLEPLAYS_TONE, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { roleplayAskForScene, tonightAskCopy, openRoleplaySave, nightAskLabel, nightWindowCopy } from "@/lib/play-items";
import { localDateKey } from "@/lib/dates";
import {
  ROLEPLAY_CATEGORIES,
  categoryMeta,
  personalizeRoleplayText,
  pickRandomRoleplay,
  roleplayById,
  roleplayCastNames,
  roleplaysInCategories,
  type Roleplay,
  type RoleplayCategoryId,
} from "@/lib/roleplays";
import { themLabel } from "@/lib/names";
import { useApp } from "@/lib/store";
import type { RoleplayInvite, RoleplaySave } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const T = ROLEPLAYS_TONE;
const ALL_IDS = ROLEPLAY_CATEGORIES.map((row) => row.id);

type Tab = "spin" | "todo" | "done" | "requests" | "asked";

function tabFromParam(value?: string | string[]): Tab | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === "spin" ||
    raw === "todo" ||
    raw === "done" ||
    raw === "requests" ||
    raw === "asked"
  ) {
    return raw;
  }
  return null;
}

export default function RoleplaysScreen() {
  const {
    user,
    partner,
    roleplayInvites,
    roleplaySaves,
    sendRoleplayInvite,
    respondRoleplayInvite,
    completeRoleplayInvite,
    saveRoleplay,
    unsaveRoleplay,
    markRoleplaySaveDone,
  } = useApp();

  const partnerName = themLabel(partner);
  const clears = useInboxClears(user?.id);
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const openedTab = tabFromParam(params.tab);
  const cast = useMemo(
    () => roleplayCastNames(user, partner),
    [partner, user]
  );

  const [tab, setTab] = useState<Tab>(openedTab ?? "spin");
  const [enabled, setEnabled] = useState<RoleplayCategoryId[]>(ALL_IDS);
  const [current, setCurrent] = useState<Roleplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [askOn, setAskOn] = useState(localDateKey);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const look = useAppLook("roleplays", T.accent, {
    hideBlurb: false,
    autoSpin: false,
  });

  useEffect(() => {
    if (!look.prefs.autoSpin) return;
    setCurrent((current) => current ?? pickRandomRoleplay(enabled));
  }, [enabled, look.prefs.autoSpin]);

  useEffect(() => {
    if (openedTab) setTab(openedTab);
  }, [openedTab]);

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
      clears.visible(
        roleplayInvites.filter(
          (row) =>
            Boolean(user) &&
            row.fromUserId === user!.id &&
            (row.status === "offered" ||
              row.status === "accepted" ||
              row.status === "declined")
        )
      ),
    [clears, roleplayInvites, user]
  );

  const openSaves = useMemo(
    () => roleplaySaves.filter((row) => !row.doneAt),
    [roleplaySaves]
  );
  const doneSaves = useMemo(
    () => roleplaySaves.filter((row) => row.doneAt),
    [roleplaySaves]
  );

  const spin = (excludeId?: string | null) => {
    setError(null);
    setSentFlash(false);
    setSavedFlash(false);
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
    const next = pickRandomRoleplay(enabled, null);
    setCurrent(next);
    setError(
      !next && enabled.length === 0
        ? "Turn on at least one category to spin."
        : null
    );
    setSentFlash(false);
    setSavedFlash(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-roll when pool changes
  }, [enabled.join("|")]);

  const toggleCategory = (id: RoleplayCategoryId) => {
    setEnabled((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => setEnabled(allOn ? [] : ALL_IDS);

  const toggleFav = async () => {
    if (!current) return;
    setError(null);
    const fav = openRoleplaySave(roleplaySaves, current.id);
    try {
      if (fav) await unsaveRoleplay(current.id);
      else {
        await saveRoleplay(current.id);
        setSavedFlash(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update favourites.");
    }
  };

  const sendCurrent = async (dateKey = askOn) => {
    if (!current) return;
    const night = /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : localDateKey();
    if (night < localDateKey()) {
      setError("Pick today or a day still ahead.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await saveRoleplay(current.id);
      await sendRoleplayInvite(current.id, {
        dateKey: night,
        label: nightAskLabel(night),
      });
      setSentFlash(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  const sendSaved = async (roleplayId: string, dateKey: string) => {
    const night = /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : localDateKey();
    if (night < localDateKey()) {
      setError("Pick today or a day still ahead.");
      return;
    }
    setError(null);
    try {
      await saveRoleplay(roleplayId);
      await sendRoleplayInvite(roleplayId, {
        dateKey: night,
        label: nightAskLabel(night),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    }
  };

  const blurb = current
    ? personalizeRoleplayText(current.blurb, cast)
    : null;

  return (
    <Screen scroll background={T.background} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
      <View className="pt-4 pb-10">
        <SettingsDock
          accent={look.accent}
          open={settingsOpen}
          onToggle={() => setSettingsOpen((open) => !open)}
          label="Roleplays"
        />
        {settingsOpen ? (
          <LookPanel
            look={look}
            ink={T.ink}
            muted={T.muted}
            pageColor={T.background}
            toggles={[
              {
                key: "hideBlurb",
                label: "Hide scene blurbs",
                hint: "Title only when you spin.",
              },
              {
                key: "autoSpin",
                label: "Spin on open",
                hint: "Land a scene as soon as you arrive.",
              },
            ]}
          />
        ) : null}

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
          Try a roleplay scene by spinning the random button or searching through
        </Text>

        <View style={{ marginTop: 20, flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => setTab("requests")}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 14,
              borderWidth: 1,
              borderColor:
                tab === "requests" || incoming.some((row) => row.status === "offered")
                  ? T.accent
                  : "rgba(255,255,255,0.14)",
              backgroundColor: tab === "requests" ? T.accentSoft : T.surface,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                color: T.ink,
                fontWeight: "800",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {incoming.length ? `Requests · ${incoming.length}` : "Requests"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("asked")}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: tab === "asked" ? T.accent : "rgba(255,255,255,0.14)",
              backgroundColor: tab === "asked" ? T.accentSoft : T.surface,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                color: T.ink,
                fontWeight: "800",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {outgoing.length
                ? `Asked ${partnerName} · ${outgoing.length}`
                : `Asked ${partnerName}`}
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 12 }}>
          <PlayTabs
            tabs={[
              { id: "spin" as const, label: "Spin" },
              {
                id: "todo" as const,
                label: `Favourites${openSaves.length ? ` · ${openSaves.length}` : ""}`,
              },
              { id: "done" as const, label: "Completed" },
            ]}
            current={tab}
            onChange={setTab}
            accent={T.accent}
            ink={T.ink}
          />
        </View>

        {tab === "requests" ? (
          incoming.length ? (
            <InviteSection
              title={`From ${partnerName}`}
              rows={incoming}
              partnerName={partnerName}
              cast={cast}
              outgoing={false}
              onRespond={(id, status) => void respondRoleplayInvite(id, status)}
              onDone={(id) => void completeRoleplayInvite(id)}
            />
          ) : (
            <Text
              style={{
                marginTop: 18,
                fontFamily: SERIF,
                fontSize: 16,
                lineHeight: 24,
                color: T.muted,
              }}
            >
              Nothing waiting. When {partnerName} asks you to try a scene, it
              lands here.
            </Text>
          )
        ) : null}

        {tab === "asked" ? (
          outgoing.length ? (
            <>
              <ClearAllBar
                count={outgoing.length}
                ink={T.ink}
                muted={T.muted}
                onClear={() => clears.hideAll(outgoing.map((row) => row.id))}
              />
              <InviteSection
                title={`Asked ${partnerName}`}
                rows={outgoing}
                partnerName={partnerName}
                cast={cast}
                outgoing
                onRespond={() => undefined}
                onDone={(id) => void completeRoleplayInvite(id)}
                onClear={(id) => clears.hide(id)}
              />
            </>
          ) : (
            <Text
              style={{
                marginTop: 18,
                fontFamily: SERIF,
                fontSize: 16,
                lineHeight: 24,
                color: T.muted,
              }}
            >
              Ask {partnerName} a scene from Spin. Their yes or no comes back
              here.
            </Text>
          )
        ) : null}

        {tab === "spin" ? (
          <>
            {current && blurb && !look.prefs.hideBlurb ? (
              <View
                style={{
                  marginTop: 6,
                  padding: 18,
                  paddingTop: 20,
                  borderRadius: 28,
                  backgroundColor: T.frame,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <FavoriteHeart
                  on={Boolean(openRoleplaySave(roleplaySaves, current.id))}
                  color={T.accent}
                  onToggle={() => void toggleFav()}
                  style={favoriteHeartCorner}
                />
                <Text
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: T.accent,
                    fontWeight: "700",
                    textAlign: "center",
                    paddingHorizontal: 28,
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
                <RoleplayArt
                  roleplayId={current.id}
                  category={current.category}
                />
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
                  {blurb}
                </Text>

                {savedFlash && !sentFlash ? (
                  <Text
                    style={{
                      marginTop: 14,
                      textAlign: "center",
                      color: T.warm,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Saved to Favourites.
                  </Text>
                ) : null}

                <View style={{ marginTop: 16, gap: 10 }}>
                  <PrimaryButton
                    label="Spin again"
                    tone="crimson"
                    onPress={() => spin(current.id)}
                    disabled={poolSize === 0}
                  />
                  {sentFlash ? (
                    <Text
                      style={{
                        textAlign: "center",
                        color: T.accent,
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      Asked {partnerName} to confirm {nightAskLabel(askOn)}.
                    </Text>
                  ) : null}
                  <AskNightBox
                    dateKey={askOn}
                    onChangeDate={setAskOn}
                    partnerName={partnerName}
                    sending={sending}
                    onSend={() => void sendCurrent()}
                    accent={T.accent}
                    ink={T.ink}
                    muted={T.muted}
                    background={T.surface}
                  />
                </View>
              </View>
            ) : (
              <View
                style={{
                  marginTop: 6,
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
                    ? "All categories are off. Turn some on below to spin."
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
                  backgroundColor: allOn
                    ? T.accentSoft
                    : "rgba(255,255,255,0.04)",
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

          </>
        ) : null}

        {tab === "todo" ? (
          <RoleplayTodo
            saves={openSaves}
            invites={roleplayInvites}
            userId={user?.id ?? null}
            partnerName={partnerName}
            cast={cast}
            incoming={incoming}
            onAsk={(roleplayId, dateKey) => void sendSaved(roleplayId, dateKey)}
            onDone={(id) => void markRoleplaySaveDone(id)}
            onRespond={(id, status) => void respondRoleplayInvite(id, status)}
            onInviteDone={(id) => void completeRoleplayInvite(id)}
          />
        ) : null}

        {tab === "done" ? (
          <RoleplayDone saves={doneSaves} cast={cast} />
        ) : null}

        {error && tab !== "spin" ? (
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
  onClear,
}: {
  title: string;
  rows: RoleplayInvite[];
  partnerName: string;
  cast: { f: string; m: string };
  outgoing: boolean;
  onRespond: (id: string, status: "accepted" | "declined") => void;
  onDone: (id: string) => void;
  onClear?: (id: string) => void;
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
          const card = (
            <View
              style={{
                padding: 14,
                borderRadius: 20,
                backgroundColor: T.surfaceRaised,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ fontFamily: SERIF, fontSize: 20, color: T.ink }}>
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
                {row.status === "offered"
                  ? outgoing
                    ? `Waiting on ${partnerName} · ${row.whenLabel ?? nightAskLabel(row.dateKey)}`
                    : `${partnerName} asked · ${row.whenLabel ?? nightAskLabel(row.dateKey)}?`
                  : row.status === "accepted"
                    ? `${row.whenLabel ?? nightAskLabel(row.dateKey)} is on`
                    : row.status === "declined"
                      ? `${partnerName} said no · ${row.whenLabel ?? nightAskLabel(row.dateKey)}`
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
                {personalizeRoleplayText(roleplay.blurb, cast)}
              </Text>
              {!outgoing && row.status === "offered" ? (
                <View style={{ marginTop: 12, gap: 8 }}>
                  <PrimaryButton
                    label={
                      row.whenLabel
                        ? `Yes — ${row.whenLabel}`
                        : `Yes — ${nightAskLabel(row.dateKey)}`
                    }
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
              {outgoing && row.status === "offered" ? (
                <PokeThem appId="roleplays" targetId={row.id} color={T.accent} />
              ) : null}
              {row.status === "accepted" ? (
                <View style={{ marginTop: 12, gap: 8 }}>
                  <Text style={{ fontSize: 13, lineHeight: 19, color: T.muted }}>
                    {nightWindowCopy(row.dateKey)} Either of you can tap Complete.
                  </Text>
                  <PrimaryButton
                    label="Complete"
                    tone="ghost"
                    onPress={() => onDone(row.id)}
                  />
                </View>
              ) : null}
            </View>
          );
          return onClear ? (
            <SwipeClearRow key={row.id} onClear={() => onClear(row.id)} ink={T.ink}>
              {card}
            </SwipeClearRow>
          ) : (
            <View key={row.id}>{card}</View>
          );
        })}
      </View>
    </View>
  );
}

function RoleplayTodo({
  saves,
  invites,
  userId,
  partnerName,
  cast,
  incoming,
  onAsk,
  onDone,
  onRespond,
  onInviteDone,
}: {
  saves: RoleplaySave[];
  invites: RoleplayInvite[];
  userId: string | null;
  partnerName: string;
  cast: { f: string; m: string };
  incoming: RoleplayInvite[];
  onAsk: (roleplayId: string, dateKey: string) => void;
  onDone: (id: string) => void;
  onRespond: (id: string, status: "accepted" | "declined") => void;
  onInviteDone: (id: string) => void;
}) {
  const [askingId, setAskingId] = useState<string | null>(null);
  const [todoOn, setTodoOn] = useState(localDateKey);
  return (
    <View>
      {incoming.length ? (
        <InviteSection
          title={`From ${partnerName}`}
          rows={incoming}
          partnerName={partnerName}
          cast={cast}
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
          ? "Heart a scene, pick a night, then ask. If they say yes, it lands on the calendar."
          : "Save a scene from Spin. It waits here until you tick it off."}
      </Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        {saves.map((row) => {
          const roleplay = roleplayById(row.roleplayId);
          if (!roleplay) return null;
          const ask = roleplayAskForScene(invites, row.roleplayId);
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
                {roleplay.name}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 18,
                  color: T.muted,
                }}
              >
                {tonightAskCopy(
                  ask?.status ?? null,
                  mine,
                  partnerName,
                  "roleplay",
                  ask?.dateKey
                )}
              </Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                {ask?.status === "offered" && !mine ? (
                  <>
                    <PrimaryButton
                      label={
                        ask.whenLabel
                          ? `Yes — ${ask.whenLabel}`
                          : `Yes — ${nightAskLabel(ask.dateKey)}`
                      }
                      tone="crimson"
                      onPress={() => onRespond(ask.id, "accepted")}
                    />
                    <PrimaryButton
                      label="Pass"
                      tone="ghost"
                      onPress={() => onRespond(ask.id, "declined")}
                    />
                  </>
                ) : !ask ? (
                  askingId === row.roleplayId ? (
                    <AskNightBox
                      dateKey={todoOn}
                      onChangeDate={setTodoOn}
                      partnerName={partnerName}
                      onSend={() => {
                        onAsk(row.roleplayId, todoOn);
                        setAskingId(null);
                      }}
                      accent={T.accent}
                      ink={T.ink}
                      muted={T.muted}
                      background={T.surfaceRaised}
                    />
                  ) : (
                    <PrimaryButton
                      label={`Ask ${partnerName}`}
                      tone="crimson"
                      onPress={() => {
                        setAskingId(row.roleplayId);
                        setTodoOn(localDateKey());
                      }}
                    />
                  )
                ) : ask.status === "accepted" ? (
                  <Text style={{ fontSize: 13, lineHeight: 19, color: T.muted }}>
                    {nightWindowCopy(ask.dateKey)}
                  </Text>
                ) : null}
                <PrimaryButton
                  label="Complete"
                  tone="ghost"
                  onPress={() =>
                    ask?.status === "accepted" ? onInviteDone(ask.id) : onDone(row.id)
                  }
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RoleplayDone({
  saves,
  cast,
}: {
  saves: RoleplaySave[];
  cast: { f: string; m: string };
}) {
  if (!saves.length) {
    return (
      <Text style={{ color: T.muted, fontSize: 14, lineHeight: 20 }}>
        Tick a scene off Favourites and it lands here.
      </Text>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {saves.map((row) => {
        const roleplay = roleplayById(row.roleplayId);
        if (!roleplay) return null;
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
              {roleplay.name}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 12, color: T.muted }}>
              Done
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
          </View>
        );
      })}
    </View>
  );
}
