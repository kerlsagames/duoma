import { FortuneWheel } from "@/components/hub/FortuneWheel";
import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#0A1218";
const SKY = "#5B8CFF";

export default function WhereWheelScreen() {
  const { data, ready, patch } = useMiniApps();
  const rotation = useRef(new Animated.Value(0)).current;
  const angle = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const slices = data.spots.map((spot) => ({
    label: spot.label,
    color: spot.color,
  }));

  const spin = () => {
    if (spinning || slices.length === 0) return;
    setSpinning(true);
    setLanded(null);
    const extra = 360 * 6 + Math.random() * 360;
    const next = angle.current + extra;
    angle.current = next;
    Animated.timing(rotation, {
      toValue: next,
      duration: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const slice = 360 / slices.length;
      const deg = ((360 - (next % 360)) % 360);
      const index = Math.floor(deg / slice) % slices.length;
      const spot = data.spots[index];
      setLanded(spot?.label ?? null);
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
      <MiniChrome
        accent={SKY}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · compass"
        title="Where are we going?"
        body="A wheel for when 'I don't mind' has been said three times. The pointer is the grown-up in the room."
        ready={ready}
      >
        <View style={{ marginTop: 12 }}>
          <FortuneWheel slices={slices} rotation={rotation} size={300} />
        </View>
        <Pressable
          onPress={spin}
          disabled={spinning}
          style={{
            marginTop: 8,
            height: 52,
            borderRadius: 16,
            backgroundColor: SKY,
            alignItems: "center",
            justifyContent: "center",
            opacity: spinning ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#081018", fontWeight: "800" }}>
            {spinning ? "Spinning…" : "Spin the night"}
          </Text>
        </Pressable>
        {landed ? (
          <View
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 18,
              backgroundColor: "#121A24",
              alignItems: "center",
            }}
          >
            <Text style={{ color: SKY, fontFamily: "SpaceMono", fontSize: 11 }}>YOU'RE GOING</Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                fontSize: 26,
                color: "#F4F4F6",
                textAlign: "center",
              }}
            >
              {landed}
            </Text>
          </View>
        ) : null}
        <View style={{ marginTop: 16, flexDirection: "row", gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a local spot"
            placeholderTextColor="rgba(244,244,246,0.3)"
            style={{
              flex: 1,
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#121A24",
              color: "#F4F4F6",
            }}
          />
          <Pressable onPress={() => void add()} style={{ justifyContent: "center" }}>
            <Text style={{ color: SKY, fontWeight: "700" }}>Add</Text>
          </Pressable>
        </View>
      </MiniChrome>
    </Screen>
  );
}
