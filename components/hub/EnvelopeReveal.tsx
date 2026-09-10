import { HANDWRITING, JAR_TONE, SERIF } from "@/lib/app-themes";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";

const T = JAR_TONE;

type Props = {
  fromLabel: string;
  body: string;
  remaining: number;
  onKeep: () => void | Promise<void>;
};

/**
 * Interactive open: sealed envelope pops up → tap → letter slides out & unfolds
 * with handwriting. Then "Keep" archives it.
 */
export function EnvelopeReveal({ fromLabel, body, remaining, onKeep }: Props) {
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">("sealed");
  const [keeping, setKeeping] = useState(false);

  const pop = useRef(new Animated.Value(0)).current;
  const noteSlide = useRef(new Animated.Value(0)).current;
  const unfold = useRef(new Animated.Value(0)).current;
  const ink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPhase("sealed");
    noteSlide.setValue(0);
    unfold.setValue(0);
    ink.setValue(0);
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      friction: 7,
      tension: 58,
      useNativeDriver: true,
    }).start();
  }, [body, fromLabel, ink, noteSlide, unfold, pop]);

  const openEnvelope = () => {
    if (phase !== "sealed") return;
    setPhase("opening");
    Animated.sequence([
      Animated.timing(noteSlide, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(unfold, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ink, {
          toValue: 1,
          duration: 640,
          delay: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setPhase("open"));
  };

  const keep = async () => {
    if (keeping) return;
    setKeeping(true);
    try {
      await onKeep();
    } finally {
      setKeeping(false);
    }
  };

  const envelopeY = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 0],
  });
  const envelopeScale = pop.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1],
  });
  const letterY = noteSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [36, -78],
  });
  const letterScaleY = unfold.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 1],
  });

  return (
    <View
      style={{
        marginTop: 22,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surface,
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 16,
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: T.accent,
          textAlign: "center",
        }}
      >
        {phase === "sealed" ? "Tap the envelope" : "A note for you"}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontSize: 14,
          color: T.muted,
          textAlign: "center",
        }}
      >
        From {fromLabel}
        {remaining > 1 ? ` · ${remaining - 1} still sealed` : ""}
      </Text>

      <View
        style={{
          marginTop: 18,
          height: 280,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {/* Letter — slides up from behind envelope, then unfolds */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 72,
            width: 220,
            minHeight: 160,
            borderRadius: 4,
            backgroundColor: T.paper,
            borderWidth: 1,
            borderColor: "rgba(120,90,40,0.22)",
            paddingHorizontal: 18,
            paddingVertical: 20,
            opacity: noteSlide,
            transform: [
              { translateY: letterY },
              { scaleY: letterScaleY },
            ],
            shadowColor: "#000",
            shadowOpacity: 0.22,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            zIndex: 1,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              backgroundColor: "rgba(90,60,20,0.08)",
            }}
          />
          <Animated.Text
            style={{
              fontFamily: HANDWRITING,
              fontSize: 22,
              lineHeight: 32,
              color: T.handwriting,
              opacity: ink,
            }}
          >
            {body}
          </Animated.Text>
        </Animated.View>

        {/* Envelope back — pops up; tap to open */}
        <Animated.View
          style={{
            transform: [{ translateY: envelopeY }, { scale: envelopeScale }],
            zIndex: 2,
          }}
        >
          <Pressable onPress={openEnvelope} disabled={phase !== "sealed"}>
            <View
              style={{
                width: 236,
                height: 148,
                borderRadius: 6,
                backgroundColor: T.paperDeep,
                borderWidth: 1.5,
                borderColor: "rgba(120,90,40,0.35)",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.28,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              {/* Envelope back diamond seam */}
              <View
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  right: 18,
                  bottom: 18,
                  borderWidth: 1,
                  borderColor: "rgba(90,60,20,0.18)",
                  borderRadius: 2,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: "42%",
                  left: 24,
                  right: 24,
                  height: 1,
                  backgroundColor: "rgba(90,60,20,0.2)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 28,
                  bottom: 28,
                  left: "50%",
                  width: 1,
                  marginLeft: -0.5,
                  backgroundColor: "rgba(90,60,20,0.16)",
                }}
              />
              {/* Wax seal */}
              <View
                style={{
                  position: "absolute",
                  bottom: 22,
                  alignSelf: "center",
                  left: "50%",
                  marginLeft: -16,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: T.seal,
                  borderWidth: 1,
                  borderColor: "rgba(80,20,16,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 10,
                    color: "#F6EFE2",
                    letterSpacing: 0.5,
                  }}
                >
                  ♥
                </Text>
              </View>
              {phase === "sealed" ? (
                <Text
                  style={{
                    position: "absolute",
                    top: 12,
                    alignSelf: "center",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: "rgba(58,42,24,0.55)",
                  }}
                >
                  Tap to open
                </Text>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {phase === "open" ? (
        <Pressable
          onPress={() => void keep()}
          disabled={keeping}
          style={{
            marginTop: 8,
            height: 48,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: T.accentSoft,
            borderWidth: 1,
            borderColor: T.accent,
            opacity: keeping ? 0.6 : 1,
          }}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
            {keeping ? "Saving…" : "Keep this note"}
          </Text>
        </Pressable>
      ) : (
        <Text
          style={{
            marginTop: 10,
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 13,
            color: T.muted,
          }}
        >
          {phase === "sealed"
            ? "The back of the envelope is facing you."
            : "Watch it unfold…"}
        </Text>
      )}
    </View>
  );
}
