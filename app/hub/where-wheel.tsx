import { CarnivalWheel } from "@/components/hub/CarnivalWheel";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#140810";

export default function WhereWheelScreen() {
  const { data, ready, patch } = useMiniApps();
  const rotation = useRef(new Animated.Value(0)).current;
  const angle = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const slices = data.spots.map((spot) => ({ label: spot.label, color: spot.color }));

  const spin = () => {
    if (spinning || slices.length === 0) return;
    setSpinning(true);
    setLanded(null);
    const extra = 360 * 7 + Math.random() * 360;
    const next = angle.current + extra;
    angle.current = next;
    Animated.timing(rotation, {
      toValue: next,
      duration: 3400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const slice = 360 / slices.length;
      const deg = (360 - (next % 360)) % 360;
      const index = Math.floor(deg / slice) % slices.length;
      setLanded(data.spots[index]?.label ?? null);
      setSpinning(false);
      try {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* web */
      }
    });
  };

  const add = async () => {
    if (!draft.trim()) return;
    const colors = ["#3ECFBF", "#FF6B9A", "#F0C75E", "#C9A0DC", "#5B8CFF"];
    await patch((state) => ({
      ...state,
      spots: [
        ...state.spots,
        {
          id: createId(),
          label: draft.trim(),
          vibe: "custom",
          color: colors[state.spots.length % colors.length]!,
        },
      ],
    }));
    setDraft("");
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent="#F0C75E">
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: "#F0C75E",
          }}
        >
          carnival after dark
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 34,
            color: "#F6E7C5",
          }}
        >
          Where to?
        </Text>
        <View style={{ marginTop: 8 }}>
          <CarnivalWheel slices={slices} rotation={rotation} size={300} />
        </View>
        <Pressable
          onPress={spin}
          disabled={spinning}
          style={{
            marginTop: 12,
            alignSelf: "center",
            paddingHorizontal: 28,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#C9A24A",
            alignItems: "center",
            justifyContent: "center",
            opacity: spinning ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#1A1008", fontWeight: "900" }}>
            {spinning ? "the lights are running…" : "pull the lever"}
          </Text>
        </Pressable>
        {landed ? (
          <View
            style={{
              marginTop: 16,
              alignSelf: "center",
              backgroundColor: "#F6E7C5",
              paddingVertical: 14,
              paddingHorizontal: 18,
              transform: [{ rotate: "-2deg" }],
            }}
          >
            <Text style={{ fontFamily: "SpaceMono", fontSize: 10, color: "#8B1E1E" }}>
              ADMIT ONE
            </Text>
            <Text style={{ fontFamily: SERIF, fontSize: 24, color: "#1A1008" }}>{landed}</Text>
          </View>
        ) : null}
        <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="add a local stop"
            placeholderTextColor="rgba(246,231,197,0.3)"
            style={{
              flex: 1,
              borderBottomWidth: 1,
              borderBottomColor: "#C9A24A",
              color: "#F6E7C5",
              fontFamily: HANDWRITING,
              fontSize: 18,
            }}
          />
          <Pressable onPress={() => void add()}>
            <Text style={{ color: "#F0C75E" }}>add</Text>
          </Pressable>
        </View>
        {!ready ? <Text style={{ color: "#F0C75E" }}>Warming the bulbs…</Text> : null}
      </Stage>
    </Screen>
  );
}
