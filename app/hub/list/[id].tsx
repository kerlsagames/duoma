import { ScoreSlider } from "@/components/ScoreSlider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { LISTS_DISPLAY, LISTS_ROUNDED, LISTS_TONE } from "@/lib/app-themes";
import {
  averageScore,
  formatDoneDate,
  listFieldCopy,
  scoreLabel,
  starterDef,
} from "@/lib/lists";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const T = LISTS_TONE;

export default function ListDetailScreen() {
  const router = useRouter();
  const { id, section } = useLocalSearchParams<{
    id: string;
    section?: string;
  }>();
  const focusVault = section === "vault";
  const {
    user,
    partner,
    coupleLists,
    listEntries,
    listEntryRatings,
    ensureStarterLists,
    addListEntry,
    completeListEntry,
    rateListEntry,
    reopenListEntry,
  } = useApp();

  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rateEntryId, setRateEntryId] = useState<string | null>(null);
  const [pendingScore, setPendingScore] = useState(7.5);

  useEffect(() => {
    void ensureStarterLists();
  }, [ensureStarterLists]);

  const list = coupleLists.find((row) => row.id === id) ?? null;

  const copy = listFieldCopy({
    starterKey: list?.starterKey,
    title: list?.title,
  });

  const openItems = useMemo(
    () =>
      listEntries
        .filter((row) => row.listId === id && !row.completedAt)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [id, listEntries]
  );

  const doneItems = useMemo(
    () =>
      listEntries
        .filter((row) => row.listId === id && row.completedAt)
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    [id, listEntries]
  );

  const rateTarget =
    doneItems.find((row) => row.id === rateEntryId) ??
    openItems.find((row) => row.id === rateEntryId) ??
    null;

  const addItem = async () => {
    if (!list) return;
    setError(null);
    setSaving(true);
    try {
      await addListEntry({ listId: list.id, title, notes: "" });
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add");
    } finally {
      setSaving(false);
    }
  };

  const markDone = async (entryId: string) => {
    setError(null);
    try {
      await completeListEntry(entryId);
      setPendingScore(7.5);
      setRateEntryId(entryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete");
    }
  };

  const saveRating = async () => {
    if (!rateEntryId) return;
    setError(null);
    try {
      await rateListEntry(rateEntryId, pendingScore);
      setRateEntryId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rate");
    }
  };

  if (!list) {
    return (
      <Screen background={T.background}>
        <View className="flex-1 justify-center px-1">
          <Text
            style={{
              fontFamily: LISTS_DISPLAY,
              fontSize: 28,
              color: T.ink,
              fontWeight: "700",
            }}
          >
            List not found
          </Text>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label="Back to Lists"
              onPress={() => router.replace("/hub/lists" as Href)}
            />
          </View>
        </View>
      </Screen>
    );
  }

  const hint = starterDef(list.starterKey)?.hint;

  const openSection = (
    <>
      <Text
        style={{
          marginTop: focusVault ? 26 : 26,
          fontFamily: LISTS_DISPLAY,
          fontSize: 20,
          color: T.ink,
          fontWeight: "700",
        }}
      >
        Open · {openItems.length}
      </Text>
      <View style={{ marginTop: 10, gap: 10 }}>
        {openItems.length === 0 ? (
          <Text style={{ color: T.muted, fontFamily: LISTS_ROUNDED }}>
            Empty for now. Drop in the first idea.
          </Text>
        ) : (
          openItems.map((entry) => {
            const who =
              entry.createdBy === user?.id
                ? "You added"
                : entry.createdBy === partner?.id
                  ? `${partner?.displayName ?? "Partner"} added`
                  : "Added";
            return (
              <View
                key={entry.id}
                style={{
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: T.border,
                  backgroundColor: T.surface,
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    fontFamily: LISTS_ROUNDED,
                    fontSize: 11,
                    color: T.teal,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  {who}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: LISTS_DISPLAY,
                    fontSize: 20,
                    color: T.ink,
                    fontWeight: "700",
                  }}
                >
                  {entry.title}
                </Text>
                <Pressable
                  onPress={() => void markDone(entry.id)}
                  style={{
                    marginTop: 12,
                    alignSelf: "flex-start",
                    borderRadius: 999,
                    backgroundColor: T.accent,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: LISTS_ROUNDED,
                      fontWeight: "700",
                      color: "#1A120E",
                      fontSize: 13,
                    }}
                  >
                    {copy.doneLabel} ✓
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>
    </>
  );

  const vaultSection =
    doneItems.length > 0 || focusVault ? (
      <>
        <Text
          style={{
            marginTop: focusVault ? 18 : 28,
            fontFamily: LISTS_DISPLAY,
            fontSize: 20,
            color: T.sticky,
            fontWeight: "700",
          }}
        >
          {copy.vaultTitle} · {doneItems.length}
        </Text>
        <View style={{ marginTop: 10, gap: 10 }}>
          {doneItems.length === 0 ? (
            <Text style={{ color: T.muted, fontFamily: LISTS_ROUNDED }}>
              No memories here yet.
            </Text>
          ) : (
            doneItems.map((entry) => {
              const ratings = listEntryRatings.filter(
                (row) => row.entryId === entry.id
              );
              const mine = ratings.find((row) => row.userId === user?.id);
              const theirs = ratings.find(
                (row) => row.userId === partner?.id
              );
              const avg = averageScore(ratings);
              const doneOn = formatDoneDate(entry.completedAt);
              return (
                <View
                  key={entry.id}
                  style={{
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: "rgba(255,209,102,0.35)",
                    backgroundColor: T.sky,
                    padding: 14,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: LISTS_DISPLAY,
                      fontSize: 18,
                      color: T.ink,
                      fontWeight: "700",
                    }}
                  >
                    {entry.title}
                  </Text>
                  {doneOn ? (
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: LISTS_ROUNDED,
                        fontSize: 12,
                        color: T.teal,
                        fontWeight: "700",
                      }}
                    >
                      {copy.doneLabel} · {doneOn}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      marginTop: 6,
                      fontFamily: LISTS_ROUNDED,
                      fontSize: 13,
                      color: T.muted,
                    }}
                  >
                    Avg {scoreLabel(avg)} · You{" "}
                    {mine ? scoreLabel(mine.stars) : "rate me"} ·{" "}
                    {partner?.displayName ?? "Them"}{" "}
                    {theirs ? scoreLabel(theirs.stars) : "—"}
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setPendingScore(mine?.stars ?? 7.5);
                        setRateEntryId(entry.id);
                      }}
                    >
                      <Text
                        style={{
                          color: T.sticky,
                          fontFamily: LISTS_ROUNDED,
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {mine ? "Update my score" : "Add my score"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => void reopenListEntry(entry.id)}>
                      <Text
                        style={{
                          color: T.muted,
                          fontFamily: LISTS_ROUNDED,
                          fontSize: 13,
                        }}
                      >
                        Move back to open
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </>
    ) : null;

  return (
    <Screen scroll background={T.background}>
      <View className="pb-10 pt-2">
        <Pressable
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <Ionicons name="chevron-back" size={18} color={T.teal} />
          <Text style={{ color: T.teal, fontFamily: LISTS_ROUNDED, fontWeight: "700" }}>
            {focusVault ? "Vault" : "All lists"}
          </Text>
        </Pressable>

        <View
          style={{
            marginTop: 14,
            borderRadius: 26,
            borderWidth: 2,
            borderColor: list.accent,
            backgroundColor: T.surfaceRaised,
            padding: 18,
            transform: [{ rotate: "-0.8deg" }],
          }}
        >
          <Text style={{ fontSize: 34 }}>{list.emoji}</Text>
          <Text
            style={{
              marginTop: 6,
              fontFamily: LISTS_DISPLAY,
              fontSize: 32,
              lineHeight: 36,
              color: T.ink,
              fontWeight: "700",
            }}
          >
            {focusVault ? copy.vaultTitle : list.title}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: LISTS_ROUNDED,
              fontSize: 14,
              color: T.muted,
              lineHeight: 20,
            }}
          >
            {focusVault
              ? `Past ${copy.doneLabel.toLowerCase()} items with both of your scores.`
              : hint ??
                "Both of you can add ideas. When you do one, mark it done and rate it."}
          </Text>
        </View>

        {!focusVault ? (
          <>
            <Text
              style={{
                marginTop: 22,
                fontFamily: LISTS_DISPLAY,
                fontSize: 20,
                color: T.sticky,
                fontWeight: "700",
              }}
            >
              Add something
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={copy.itemPlaceholder}
              placeholderTextColor="rgba(243,255,251,0.35)"
              style={{
                marginTop: 10,
                height: 48,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: T.border,
                backgroundColor: T.surface,
                paddingHorizontal: 14,
                color: T.ink,
                fontFamily: LISTS_ROUNDED,
                fontSize: 16,
              }}
            />
            {error ? (
              <Text
                style={{
                  marginTop: 8,
                  color: T.accent,
                  fontFamily: LISTS_ROUNDED,
                }}
              >
                {error}
              </Text>
            ) : null}
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                label="Add to list"
                loading={saving}
                onPress={() => void addItem()}
              />
            </View>
          </>
        ) : null}

        {focusVault ? (
          <>
            {vaultSection}
            {openSection}
          </>
        ) : (
          <>
            {openSection}
            {vaultSection}
          </>
        )}
      </View>

      <Modal
        visible={Boolean(rateTarget)}
        animationType="fade"
        transparent
        onRequestClose={() => setRateEntryId(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.72)",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              borderRadius: 28,
              backgroundColor: T.sky,
              borderWidth: 1,
              borderColor: T.border,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontFamily: LISTS_ROUNDED,
                fontSize: 12,
                color: T.teal,
                fontWeight: "700",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Your score
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: LISTS_DISPLAY,
                fontSize: 26,
                color: T.ink,
                fontWeight: "700",
              }}
            >
              {rateTarget?.title}
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: LISTS_ROUNDED,
                fontSize: 14,
                color: T.muted,
              }}
            >
              Rate from 0 to 10 (decimals ok).{" "}
              {partner?.displayName ?? "Your partner"} can add theirs too.
            </Text>
            <View style={{ marginTop: 18 }}>
              <ScoreSlider
                value={pendingScore}
                onChange={setPendingScore}
                accent={list.accent}
                track="rgba(243,255,251,0.18)"
                labelColor={T.ink}
              />
            </View>
            <View style={{ marginTop: 18, gap: 10 }}>
              <PrimaryButton label="Save score" onPress={() => void saveRating()} />
              <PrimaryButton
                label="Skip for now"
                tone="ghost"
                onPress={() => setRateEntryId(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
