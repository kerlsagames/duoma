import { ScoreSlider } from "@/components/ScoreSlider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import {
  HANDWRITING,
  LISTS_DISPLAY,
  LISTS_ROUNDED,
  LISTS_TONE,
} from "@/lib/app-themes";
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
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const T = LISTS_TONE;

const PAPER = "#F4E7C8";
const PAPER_LINE = "rgba(70, 120, 170, 0.28)";
const PAPER_MARGIN = "rgba(200, 70, 70, 0.55)";
const PAPER_INK = "#2A1F14";
const PAPER_MUTED = "rgba(42, 31, 20, 0.55)";
const ROW_HEIGHT = 46;

function Notepad({
  children,
  empty,
}: {
  children?: ReactNode;
  empty?: string | null;
}) {
  return (
    <View
      style={{
        marginTop: 10,
        borderRadius: 4,
        backgroundColor: PAPER,
        borderWidth: 1,
        borderColor: "rgba(255,209,102,0.35)",
        overflow: "hidden",
        transform: [{ rotate: "-0.4deg" }],
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 28,
          top: 0,
          bottom: 0,
          width: 1.5,
          backgroundColor: PAPER_MARGIN,
          zIndex: 2,
        }}
      />
      {empty ? (
        <View
          style={{
            minHeight: ROW_HEIGHT * 3,
            justifyContent: "center",
            paddingLeft: 40,
            paddingRight: 16,
            borderBottomWidth: 1,
            borderBottomColor: PAPER_LINE,
          }}
        >
          <Text
            style={{
              fontFamily: HANDWRITING,
              fontSize: 18,
              color: PAPER_MUTED,
            }}
          >
            {empty}
          </Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

function NotepadRow({
  title,
  action,
  onAction,
  subtitle,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  subtitle?: string | null;
}) {
  return (
    <View
      style={{
        minHeight: ROW_HEIGHT,
        paddingLeft: 40,
        paddingRight: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: PAPER_LINE,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontFamily: HANDWRITING,
            fontSize: 20,
            lineHeight: 26,
            color: PAPER_INK,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        {action && onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              paddingHorizontal: 6,
            }}
          >
            <Text
              style={{
                fontFamily: LISTS_ROUNDED,
                fontSize: 13,
                fontWeight: "700",
                color: T.stamp,
              }}
            >
              {action}
            </Text>
            <Ionicons name="checkmark" size={16} color={T.stamp} />
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <Text
          style={{
            marginTop: 2,
            fontFamily: LISTS_ROUNDED,
            fontSize: 11,
            color: PAPER_MUTED,
          }}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

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
        .sort((a, b) =>
          (b.completedAt ?? "").localeCompare(a.completedAt ?? "")
        ),
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
          marginTop: 22,
          fontFamily: LISTS_DISPLAY,
          fontSize: 20,
          color: T.ink,
          fontWeight: "700",
        }}
      >
        Open · {openItems.length}
      </Text>
      <Notepad
        empty={
          openItems.length === 0 ? "Blank page. Write the first one." : null
        }
      >
        {openItems.map((entry) => {
          const who =
            entry.createdBy === user?.id
              ? "you"
              : entry.createdBy === partner?.id
                ? partner?.displayName ?? "them"
                : null;
          return (
            <NotepadRow
              key={entry.id}
              title={entry.title}
              subtitle={who ? `added by ${who}` : null}
              action={copy.doneLabel}
              onAction={() => void markDone(entry.id)}
            />
          );
        })}
      </Notepad>
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
        <Notepad
          empty={
            doneItems.length === 0 ? "No memories on this page yet." : null
          }
        >
          {doneItems.map((entry) => {
            const ratings = listEntryRatings.filter(
              (row) => row.entryId === entry.id
            );
            const mine = ratings.find((row) => row.userId === user?.id);
            const theirs = ratings.find((row) => row.userId === partner?.id);
            const avg = averageScore(ratings);
            const doneOn = formatDoneDate(entry.completedAt);
            const scoreBits = [
              `Avg ${scoreLabel(avg)}`,
              `You ${mine ? scoreLabel(mine.stars) : "—"}`,
              `${partner?.displayName ?? "Them"} ${
                theirs ? scoreLabel(theirs.stars) : "—"
              }`,
            ].join(" · ");
            return (
              <View key={entry.id}>
                <NotepadRow
                  title={entry.title}
                  subtitle={
                    doneOn
                      ? `${copy.doneLabel} · ${doneOn} · ${scoreBits}`
                      : scoreBits
                  }
                />
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 14,
                    paddingLeft: 40,
                    paddingRight: 12,
                    paddingBottom: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: PAPER_LINE,
                    backgroundColor: PAPER,
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
                        fontFamily: LISTS_ROUNDED,
                        fontSize: 12,
                        fontWeight: "700",
                        color: T.stamp,
                      }}
                    >
                      {mine ? "Update score" : "Add score"}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => void reopenListEntry(entry.id)}>
                    <Text
                      style={{
                        fontFamily: LISTS_ROUNDED,
                        fontSize: 12,
                        color: PAPER_MUTED,
                      }}
                    >
                      Move back to open
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </Notepad>
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
          <Text
            style={{
              color: T.teal,
              fontFamily: LISTS_ROUNDED,
              fontWeight: "700",
            }}
          >
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
              <PrimaryButton
                label="Save score"
                onPress={() => void saveRating()}
              />
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
