import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useApp } from "@/lib/store";
import {
  FLAG_TONES,
  PEACE_OFFERS,
  listWhiteFlags,
  offerLabel,
  raiseWhiteFlag,
  resolveWhiteFlag,
  toneLabel,
  type FlagToneId,
  type PeaceOfferId,
  type WhiteFlag,
} from "@/lib/white-flag";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

/** Soft olive / parchment — peace, not punishment. */
const C = {
  bg: "#10140F",
  ink: "#F3F0E7",
  muted: "rgba(243,240,231,0.62)",
  sage: "#8FAE7E",
  sageSoft: "rgba(143,174,126,0.18)",
  cream: "#E8E0CF",
  creamSoft: "rgba(232,224,207,0.14)",
  flag: "#F7F4EC",
  pole: "#C4B79A",
} as const;

function FlagVisual({ waving }: { waving: boolean }) {
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!waving) {
      sway.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sway, waving]);

  const rotate = sway.interpolate({
    inputRange: [0, 1],
    outputRange: ["-6deg", "7deg"],
  });

  return (
    <View
      style={{
        alignItems: "center",
        height: 150,
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: 8,
          height: 140,
          borderRadius: 4,
          backgroundColor: C.pole,
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          bottom: 78,
          left: "50%",
          marginLeft: 4,
          width: 92,
          height: 58,
          borderRadius: 6,
          backgroundColor: C.flag,
          transform: [{ rotate }],
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 22 }}>🕊️</Text>
      </Animated.View>
      <View
        style={{
          width: 64,
          height: 10,
          borderRadius: 20,
          backgroundColor: C.creamSoft,
          marginBottom: 2,
        }}
      />
    </View>
  );
}

function ToneChip({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: selected ? C.sageSoft : C.creamSoft,
        borderWidth: 1,
        borderColor: selected ? C.sage : "rgba(232,224,207,0.18)",
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          color: selected ? C.sage : C.ink,
          fontSize: 15,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
      {detail ? (
        <Text
          style={{ marginTop: 3, color: C.muted, fontSize: 12, lineHeight: 17 }}
        >
          {detail}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function ApologyScreen() {
  const { user, partner } = useApp();
  const [flags, setFlags] = useState<WhiteFlag[]>([]);
  const [tone, setTone] = useState<FlagToneId>("can-we-reset");
  const [offer, setOffer] = useState<PeaceOfferId | null>("big-hug");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setFlags(await listWhiteFlags());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const incoming = useMemo(
    () =>
      flags.filter(
        (row) => row.status === "raised" && user && row.toUserId === user.id
      ),
    [flags, user]
  );
  const outgoing = useMemo(
    () =>
      flags.filter(
        (row) => row.status === "raised" && user && row.fromUserId === user.id
      ),
    [flags, user]
  );
  const recent = useMemo(
    () => flags.filter((row) => row.status !== "raised").slice(0, 4),
    [flags]
  );

  const send = async () => {
    if (!user || !partner) {
      setFlash("Pair up first — a white flag needs someone to catch it.");
      return;
    }
    setBusy(true);
    setFlash(null);
    try {
      await raiseWhiteFlag({
        fromUserId: user.id,
        toUserId: partner.id,
        tone,
        offer,
        note,
      });
      setNote("");
      setFlash("White flag raised. The hard part was starting.");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (id: string, status: "accepted" | "held") => {
    setBusy(true);
    try {
      await resolveWhiteFlag(id, status);
      await refresh();
      setFlash(
        status === "accepted"
          ? "Reset accepted. Soft landing unlocked."
          : "Noted. Take the beat you need."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll background={C.bg}>
      <View className="pt-4 pb-12">
        <BackButton
          color={C.sage}
          fallback={"/hub/connect" as Href}
          style={{ marginBottom: 10 }}
        />

        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.sage,
            marginBottom: 8,
          }}
        >
          Apology & Reset
        </Text>
        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 32,
            lineHeight: 38,
            color: C.ink,
          }}
        >
          Raise the white flag
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontSize: 15,
            lineHeight: 22,
            color: C.muted,
          }}
        >
          Not a scoreboard. A soft signal that says: I want us more than I want
          to win this moment.
        </Text>

        <View style={{ marginTop: 22, marginBottom: 8 }}>
          <FlagVisual waving={outgoing.length > 0 || incoming.length > 0} />
        </View>

        {incoming.length > 0 ? (
          <View
            style={{
              marginTop: 8,
              marginBottom: 18,
              padding: 16,
              borderRadius: 20,
              backgroundColor: C.sageSoft,
              borderWidth: 1,
              borderColor: C.sage,
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: C.sage,
                marginBottom: 10,
              }}
            >
              They raised a flag
            </Text>
            {incoming.map((row) => (
              <View key={row.id} style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 20,
                    color: C.ink,
                    marginBottom: 4,
                  }}
                >
                  {toneLabel(row.tone)}
                </Text>
                {row.note ? (
                  <Text
                    style={{
                      fontFamily: HANDWRITING,
                      fontSize: 24,
                      lineHeight: 30,
                      color: C.cream,
                      marginBottom: 8,
                    }}
                  >
                    {row.note}
                  </Text>
                ) : null}
                {row.offer ? (
                  <Text
                    style={{ color: C.muted, marginBottom: 12, fontSize: 13 }}
                  >
                    Offering: {offerLabel(row.offer)}
                  </Text>
                ) : null}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => void resolve(row.id, "accepted")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: C.sage,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#10200E", fontWeight: "800" }}>
                      Accept & reset
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void resolve(row.id, "held")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: C.creamSoft,
                      borderWidth: 1,
                      borderColor: "rgba(232,224,207,0.25)",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: C.ink, fontWeight: "700" }}>
                      Need a beat
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {outgoing.length > 0 ? (
          <View
            style={{
              marginBottom: 18,
              padding: 14,
              borderRadius: 16,
              backgroundColor: C.creamSoft,
            }}
          >
            <Text style={{ color: C.muted, fontSize: 13, lineHeight: 19 }}>
              Your flag is up
              {partner ? ` for ${partner.displayName}` : ""}. Waiting doesn’t mean
              failing — it means you already chose peace.
            </Text>
          </View>
        ) : null}

        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 20,
            color: C.ink,
            marginBottom: 10,
          }}
        >
          What do you want to say?
        </Text>
        {FLAG_TONES.map((row) => (
          <ToneChip
            key={row.id}
            label={row.label}
            detail={row.detail}
            selected={tone === row.id}
            onPress={() => setTone(row.id)}
          />
        ))}

        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 20,
            color: C.ink,
            marginTop: 16,
            marginBottom: 10,
          }}
        >
          Peace offering
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PEACE_OFFERS.map((row) => {
            const selected = offer === row.id;
            return (
              <Pressable
                key={row.id}
                onPress={() => setOffer(selected ? null : row.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: selected ? C.sageSoft : C.creamSoft,
                  borderWidth: 1,
                  borderColor: selected ? C.sage : "transparent",
                }}
              >
                <Ionicons
                  name={row.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={selected ? C.sage : C.muted}
                />
                <Text
                  style={{
                    color: selected ? C.sage : C.ink,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {row.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 20,
            color: C.ink,
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          A short note
        </Text>
        <TextInput
          value={note}
          onChangeText={(value) => setNote(value.slice(0, 160))}
          placeholder="Keep it short. Soft lands better."
          placeholderTextColor="rgba(243,240,231,0.35)"
          multiline
          style={{
            minHeight: 88,
            borderRadius: 16,
            padding: 14,
            backgroundColor: C.creamSoft,
            color: C.ink,
            fontSize: 16,
            lineHeight: 22,
            textAlignVertical: "top",
            borderWidth: 1,
            borderColor: "rgba(232,224,207,0.18)",
          }}
        />
        <Text
          style={{
            marginTop: 6,
            color: C.muted,
            fontSize: 11,
            textAlign: "right",
          }}
        >
          {note.length}/160
        </Text>

        {flash ? (
          <Text
            style={{
              marginTop: 12,
              color: C.sage,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {flash}
          </Text>
        ) : null}

        <View style={{ marginTop: 18, gap: 10 }}>
          <PrimaryButton
            label={busy ? "Raising…" : "Raise white flag"}
            tone="teal"
            loading={busy}
            disabled={busy}
            onPress={() => void send()}
          />
          {partner?.isDemo ? (
            <PrimaryButton
              label="Practice: receive a flag"
              tone="ghost"
              disabled={busy}
              onPress={() => {
                if (!user || !partner) return;
                void (async () => {
                  setBusy(true);
                  try {
                    await raiseWhiteFlag({
                      fromUserId: partner.id,
                      toUserId: user.id,
                      tone: "i-was-wrong",
                      offer: "tea",
                      note: "I got defensive. Want a soft reset with me?",
                    });
                    setFlash("Demo flag received — try Accept & reset.");
                    await refresh();
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            />
          ) : null}
        </View>

        {recent.length > 0 ? (
          <View style={{ marginTop: 28 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 10,
              }}
            >
              Recent resets
            </Text>
            {recent.map((row) => (
              <View
                key={row.id}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(232,224,207,0.12)",
                }}
              >
                <Text style={{ color: C.ink, fontWeight: "700" }}>
                  {toneLabel(row.tone)}
                </Text>
                <Text style={{ marginTop: 2, color: C.muted, fontSize: 12 }}>
                  {row.status === "accepted" ? "Accepted" : "Held for a beat"}
                  {row.note
                    ? ` · “${row.note.slice(0, 42)}${row.note.length > 42 ? "…" : ""}”`
                    : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
