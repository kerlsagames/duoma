import { AppreciationJar } from "@/components/hub/AppreciationJar";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { JAR_TONE, SERIF } from "@/lib/app-themes";
import { isSunday } from "@/lib/dates";
import {
  JAR_OPEN_OPTIONS,
  formatJarOpenAt,
  jarOpenOptionLabel,
  openAtForJarOption,
  type JarOpenOptionId,
} from "@/lib/jarNotes";
import { useApp } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const T = JAR_TONE;

export default function JarScreen() {
  const { jarNotes, jarOpenVotes, user, partner, addJarNote, voteOpenJar } =
    useApp();
  const [body, setBody] = useState("");
  const [openOption, setOpenOption] = useState<JarOpenOptionId>("together");
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropY = useRef(new Animated.Value(-20)).current;
  const dropX = useRef(new Animated.Value(0)).current;
  const dropRotate = useRef(new Animated.Value(0)).current;
  const dropScale = useRef(new Animated.Value(1)).current;
  const dropOpacity = useRef(new Animated.Value(0)).current;

  const sealed = jarNotes.filter((note) => !note.openedAt);
  const opened = jarNotes
    .filter((note) => note.openedAt)
    .sort((a, b) => (b.openedAt ?? "").localeCompare(a.openedAt ?? ""));
  const iVoted = jarOpenVotes.some((row) => row.userId === user?.id);
  const theyVoted = jarOpenVotes.some((row) => row.userId === partner?.id);

  useEffect(() => {
    dropY.setValue(-20);
    dropOpacity.setValue(0);
  }, [dropOpacity, dropY]);

  const runDropAnimation = () =>
    new Promise<void>((resolve) => {
      dropY.setValue(-36);
      dropX.setValue(0);
      dropRotate.setValue(0);
      dropScale.setValue(1.05);
      dropOpacity.setValue(1);
      setDropping(true);

      Animated.parallel([
        Animated.timing(dropY, {
          toValue: 250,
          duration: 920,
          easing: Easing.bezier(0.22, 0.61, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(dropX, {
            toValue: 18,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(dropX, {
            toValue: -12,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(dropX, {
            toValue: 6,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(dropRotate, {
          toValue: 1,
          duration: 920,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(dropScale, {
            toValue: 0.82,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dropScale, {
            toValue: 0.55,
            duration: 420,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(700),
          Animated.timing(dropOpacity, {
            toValue: 0,
            duration: 220,
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

  return (
    <Screen scroll background={T.background}>
      <View className="pt-4 pb-8">
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Appreciation jar
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
          Fold it. Drop it in.
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
          {isSunday()
            ? "Sunday — open together when you're both ready."
            : "Write something specific. Pick when it can open. Watch it fall in."}
        </Text>

        <View style={{ marginTop: 18, position: "relative", alignItems: "center" }}>
          <AppreciationJar sealedCount={sealed.length} />

          {dropping ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 48,
                width: 56,
                height: 36,
                borderRadius: 6,
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
                  width: 18,
                  height: 36,
                  backgroundColor: "rgba(90,60,20,0.14)",
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                }}
              />
              <View
                style={{
                  marginTop: 10,
                  marginLeft: 8,
                  width: 22,
                  height: 2,
                  backgroundColor: "rgba(120,90,40,0.25)",
                }}
              />
            </Animated.View>
          ) : null}
        </View>

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
            marginTop: 10,
            minHeight: 96,
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
          When to open
        </Text>
        <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
          {JAR_OPEN_OPTIONS.map((opt) => {
            const on = openOption === opt.id;
            return (
              <Pressable
                key={opt.id}
                disabled={dropping || loading}
                onPress={() => setOpenOption(opt.id)}
                style={{
                  width: "48%",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: on ? T.accent : "rgba(246,239,226,0.1)",
                  backgroundColor: on ? T.accentSoft : T.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>
                  {opt.label}
                </Text>
                <Text style={{ marginTop: 3, fontSize: 12, color: T.muted }}>
                  {opt.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text style={{ marginTop: 12, color: T.seal, fontFamily: SERIF }}>{error}</Text>
        ) : null}

        <View className="mt-5">
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
            marginTop: 28,
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
            {iVoted
              ? theyVoted || partner?.isDemo
                ? "Jar is opening."
                : `Waiting on ${partner?.displayName ?? "them"} to say they're ready.`
              : "Both of you tap ready before anything is read out loud."}
          </Text>
          <View className="mt-4">
            <PrimaryButton
              label={iVoted ? "You're ready" : "I'm ready to open"}
              tone="ghost"
              onPress={() => void voteOpenJar()}
            />
          </View>
        </View>

        {sealed.length ? (
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
                      : ` · from ${partner?.displayName ?? "them"}`}
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

        {opened.length ? (
          <View className="mt-8 gap-3">
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: T.accent,
              }}
            >
              Opened together
            </Text>
            {opened.map((note) => (
              <View
                key={note.id}
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: T.border,
                  backgroundColor: T.surfaceRaised,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: T.seal,
                  }}
                >
                  {note.fromUserId === user?.id
                    ? "You"
                    : partner?.displayName ?? "Partner"}
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: SERIF,
                    fontSize: 17,
                    lineHeight: 24,
                    color: T.ink,
                  }}
                >
                  {note.body}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
