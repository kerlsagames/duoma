import { AppreciationJar } from "@/components/hub/AppreciationJar";
import { EnvelopeReveal } from "@/components/hub/EnvelopeReveal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { JAR_TONE, SERIF } from "@/lib/app-themes";
import { localDateKey } from "@/lib/dates";
import {
  JAR_OPEN_OPTIONS,
  formatJarOpenAt,
  jarNoteIsDue,
  jarOpenOptionLabel,
  openAtForJarOption,
  type JarOpenOptionId,
} from "@/lib/jarNotes";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const T = JAR_TONE;

export default function JarScreen() {
  const router = useRouter();
  const {
    jarNotes,
    jarOpenVotes,
    user,
    partner,
    addJarNote,
    voteOpenJar,
    openJarNote,
  } = useApp();
  const [body, setBody] = useState("");
  const [openOption, setOpenOption] = useState<JarOpenOptionId>("together");
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const dropY = useRef(new Animated.Value(-20)).current;
  const dropX = useRef(new Animated.Value(0)).current;
  const dropRotate = useRef(new Animated.Value(0)).current;
  const dropScale = useRef(new Animated.Value(1)).current;
  const dropOpacity = useRef(new Animated.Value(0)).current;

  const today = localDateKey();
  const iVoted = jarOpenVotes.some(
    (row) => row.userId === user?.id && row.date === today
  );
  const theyVoted =
    jarOpenVotes.some(
      (row) => row.userId === partner?.id && row.date === today
    ) || Boolean(partner?.isDemo && iVoted);
  const unlocked = iVoted && (theyVoted || !partner);

  const sealed = jarNotes.filter((note) => !note.openedAt);
  const readyToOpen = useMemo(
    () =>
      sealed
        .filter((note) => jarNoteIsDue(note))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [sealed]
  );
  const nextNote = unlocked ? readyToOpen[0] ?? null : null;

  const openedFromYou = jarNotes.filter(
    (note) => note.openedAt && note.fromUserId === user?.id
  ).length;
  const openedFromPartner = jarNotes.filter(
    (note) => note.openedAt && note.fromUserId === partner?.id
  ).length;

  useEffect(() => {
    dropY.setValue(-20);
    dropOpacity.setValue(0);
  }, [dropOpacity, dropY]);

  const runDropAnimation = () =>
    new Promise<void>((resolve) => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      dropY.setValue(-28);
      dropX.setValue(0);
      dropRotate.setValue(0);
      dropScale.setValue(1.05);
      dropOpacity.setValue(1);
      setDropping(true);

      Animated.parallel([
        Animated.timing(dropY, {
          toValue: 168,
          duration: 860,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(dropX, {
            toValue: 14,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(dropX, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dropX, {
            toValue: 5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(dropRotate, {
          toValue: 1,
          duration: 860,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(dropScale, {
            toValue: 0.82,
            duration: 460,
            useNativeDriver: true,
          }),
          Animated.timing(dropScale, {
            toValue: 0.55,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(640),
          Animated.timing(dropOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        dropOpacity.setValue(0);
        setDropping(false);
        resolve();
      });
    });

  const drop = async () => {
    if (dropping || loading) return;
    setError(null);
    const text = body.trim();
    if (!text) {
      setError("Write a note first.");
      return;
    }
    setLoading(true);
    try {
      await runDropAnimation();
      await addJarNote({
        body: text,
        openOption,
        openAt: openAtForJarOption(openOption),
      });
      setBody("");
      setOpenOption("together");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  };

  const rotate = dropRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-8deg", "118deg"],
  });

  const youName = user?.displayName ?? "You";
  const partnerName = partner?.displayName ?? "Partner";
  const nextFromLabel =
    nextNote?.fromUserId === user?.id ? youName : partnerName;

  return (
    <Screen scroll background={T.background} scrollRef={scrollRef}>
      <View className="pt-2 pb-8">
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Appreciation jar
        </Text>

        <View style={{ marginTop: 8, position: "relative", alignItems: "center" }}>
          <AppreciationJar sealedCount={sealed.length} />

          {dropping ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 28,
                width: 48,
                height: 30,
                borderRadius: 5,
                backgroundColor: T.paper,
                borderWidth: 1,
                borderColor: "rgba(120,90,40,0.25)",
                opacity: dropOpacity,
                transform: [
                  { translateY: dropY },
                  { translateX: dropX },
                  { rotate },
                  { scale: dropScale },
                ],
                zIndex: 20,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 15,
                  height: 30,
                  backgroundColor: "rgba(90,60,20,0.14)",
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                }}
              />
              <View
                style={{
                  marginTop: 8,
                  marginLeft: 7,
                  width: 18,
                  height: 2,
                  backgroundColor: "rgba(120,90,40,0.25)",
                }}
              />
            </Animated.View>
          ) : null}
        </View>

        <Text
          style={{
            marginTop: 12,
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Your note
        </Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Something specific they did"
          placeholderTextColor="rgba(246,239,226,0.32)"
          multiline
          editable={!dropping && !loading}
          style={{
            marginTop: 6,
            minHeight: 64,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: T.border,
            backgroundColor: T.surfaceRaised,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: T.ink,
            fontFamily: SERIF,
            fontSize: 15,
            lineHeight: 21,
          }}
        />

        <Text
          style={{
            marginTop: 12,
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 1.3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          When to open
        </Text>
        <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
          {JAR_OPEN_OPTIONS.map((opt) => {
            const on = openOption === opt.id;
            return (
              <Pressable
                key={opt.id}
                disabled={dropping || loading}
                onPress={() => setOpenOption(opt.id)}
                style={{
                  width: "48%",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: on ? T.accent : "rgba(246,239,226,0.1)",
                  backgroundColor: on ? T.accentSoft : T.surface,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 13, color: T.ink }}>
                  {opt.label}
                </Text>
                <Text style={{ marginTop: 1, fontSize: 11, color: T.muted }}>
                  {opt.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text
            style={{
              marginTop: 8,
              color: T.seal,
              fontFamily: SERIF,
              fontSize: 14,
            }}
          >
            {error}
          </Text>
        ) : null}

        <View className="mt-3">
          <PrimaryButton
            label={dropping ? "Dropping…" : "Drop it in the jar"}
            tone="gold"
            loading={loading && !dropping}
            disabled={dropping}
            onPress={() => void drop()}
          />
        </View>

        <View
          style={{
            marginTop: 22,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: T.border,
            backgroundColor: T.surface,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: T.accent,
            }}
          >
            Open together
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 22,
              color: T.muted,
            }}
          >
            {unlocked
              ? readyToOpen.length
                ? "You're both ready — open the next envelope."
                : sealed.length
                  ? "You're ready, but some notes are still waiting on their date."
                  : "Nothing sealed right now. Drop a note for next time."
              : iVoted
                ? `Waiting on ${partnerName} to say they're ready.`
                : "Both of you tap ready before anything is read out loud."}
          </Text>
          {!unlocked ? (
            <View className="mt-4">
              <PrimaryButton
                label={iVoted ? "You're ready" : "I'm ready to open"}
                tone="ghost"
                onPress={() => void voteOpenJar()}
              />
            </View>
          ) : null}
        </View>

        {nextNote ? (
          <EnvelopeReveal
            key={nextNote.id}
            fromLabel={nextFromLabel}
            body={nextNote.body}
            remaining={readyToOpen.length}
            onKeep={() => openJarNote(nextNote.id)}
          />
        ) : null}

        {sealed.length && !nextNote ? (
          <View className="mt-8 gap-2">
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: T.accent,
              }}
            >
              Sealed inside
            </Text>
            {sealed.map((note) => (
              <View
                key={note.id}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(246,239,226,0.1)",
                  backgroundColor: T.surfaceRaised,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 20,
                    borderRadius: 3,
                    backgroundColor: T.paper,
                    transform: [{ rotate: "-12deg" }],
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: "rgba(120,90,40,0.2)",
                  }}
                />
                <View className="flex-1">
                  <Text style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>
                    Folded note
                    {note.fromUserId === user?.id
                      ? " · from you"
                      : ` · from ${partnerName}`}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: T.muted }}>
                    Opens {formatJarOpenAt(note.openAt)}
                    {note.openOption
                      ? ` · ${jarOpenOptionLabel(note.openOption)}`
                      : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View
          style={{
            marginTop: 32,
            flexDirection: "row",
            gap: 12,
          }}
        >
          <Pressable
            onPress={() =>
              router.push(
                `/hub/jar-notes?from=${encodeURIComponent(user?.id ?? "")}&name=${encodeURIComponent(youName)}` as Href
              )
            }
            style={{
              flex: 1,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.surface,
              paddingVertical: 18,
              paddingHorizontal: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                backgroundColor: T.accentSoft,
                borderWidth: 1,
                borderColor: T.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="mail-open-outline" size={26} color={T.accent} />
            </View>
            <Text
              style={{
                marginTop: 12,
                fontFamily: SERIF,
                fontSize: 16,
                color: T.ink,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {youName}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: T.muted,
              }}
            >
              {openedFromYou} note{openedFromYou === 1 ? "" : "s"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                `/hub/jar-notes?from=${encodeURIComponent(partner?.id ?? "")}&name=${encodeURIComponent(partnerName)}` as Href
              )
            }
            style={{
              flex: 1,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: T.border,
              backgroundColor: T.surface,
              paddingVertical: 18,
              paddingHorizontal: 12,
              alignItems: "center",
              opacity: partner ? 1 : 0.45,
            }}
            disabled={!partner}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                backgroundColor: T.accentSoft,
                borderWidth: 1,
                borderColor: T.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="mail-outline" size={26} color={T.accent} />
            </View>
            <Text
              style={{
                marginTop: 12,
                fontFamily: SERIF,
                fontSize: 16,
                color: T.ink,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {partnerName}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: T.muted,
              }}
            >
              {openedFromPartner} note{openedFromPartner === 1 ? "" : "s"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
