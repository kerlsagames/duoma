import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C1014";
const STEEL = "#C5D0DA";

export default function EmergencyVaultScreen() {
  const { data, ready, patch } = useMiniApps();
  const [pinDraft, setPinDraft] = useState("");
  const [gate, setGate] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (ready) setOpen(!data.vaultPin);
  }, [data.vaultPin, ready]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const setPin = async () => {
    if (!/^\d{4}$/.test(pinDraft)) {
      setError("Four digits. Something you’ll both remember at 2am.");
      return;
    }
    setError(null);
    await patch((state) => ({ ...state, vaultPin: pinDraft }));
    setPinDraft("");
    setOpen(true);
  };

  const unlock = () => {
    if (gate === data.vaultPin) {
      setOpen(true);
      setError(null);
      setGate("");
      return;
    }
    setError("The tumblers didn’t like that.");
  };

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent={STEEL}>
        {!data.vaultPin ? (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: SERIF, fontSize: 32, color: STEEL }}>Cut a key</Text>
            <Text style={{ fontFamily: HANDWRITING, fontSize: 18, color: "rgba(197,208,218,0.6)" }}>
              four digits, shared
            </Text>
            <TextInput
              value={pinDraft}
              onChangeText={setPinDraft}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="••••"
              placeholderTextColor="rgba(197,208,218,0.3)"
              style={pinStyle}
            />
            <Pressable onPress={() => void setPin()} style={btn}>
              <Text style={{ color: "#0C1014", fontWeight: "800" }}>Set combination</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          </View>
        ) : !open ? (
          <View style={{ alignItems: "center", marginTop: 12 }}>
            <View
              style={{
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: "#1A222A",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 10,
                borderColor: "#3A4650",
              }}
            >
              <Animated.View
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 85,
                  borderWidth: 8,
                  borderColor: STEEL,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ rotate }],
                }}
              >
                <Ionicons name="lock-closed" size={42} color={STEEL} />
              </Animated.View>
            </View>
            <Text
              style={{
                marginTop: 16,
                fontFamily: SERIF,
                fontSize: 28,
                color: STEEL,
              }}
            >
              Vault
            </Text>
            <TextInput
              value={gate}
              onChangeText={setGate}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="combination"
              placeholderTextColor="rgba(197,208,218,0.3)"
              style={pinStyle}
            />
            <Pressable onPress={unlock} style={btn}>
              <Text style={{ color: "#0C1014", fontWeight: "800" }}>Turn the wheel</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          </View>
        ) : (
          <View>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={{ color: STEEL, fontFamily: HANDWRITING, fontSize: 18 }}>
                slam it shut
              </Text>
            </Pressable>
            <View style={{ marginTop: 12, gap: 10 }}>
              {data.vault.map((row, i) => (
                <View
                  key={row.id}
                  style={{
                    backgroundColor: i % 2 ? "#E8D7B0" : "#F3E6C4",
                    padding: 14,
                    transform: [{ rotate: i % 2 ? "0.6deg" : "-0.6deg" }],
                  }}
                >
                  <Text style={{ color: "#6A4A20", fontFamily: "SpaceMono", fontSize: 10 }}>
                    {row.label.toUpperCase()}
                  </Text>
                  {editing === row.id ? (
                    <View>
                      <TextInput
                        value={value}
                        onChangeText={setValue}
                        autoFocus
                        style={{ color: "#2A1C10", fontFamily: HANDWRITING, fontSize: 20 }}
                      />
                      <Pressable
                        onPress={() => {
                          void patch((state) => ({
                            ...state,
                            vault: state.vault.map((item) =>
                              item.id === row.id ? { ...item, value } : item
                            ),
                          }));
                          setEditing(null);
                        }}
                      >
                        <Text style={{ color: "#6A4A20" }}>file it</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => {
                        setEditing(row.id);
                        setValue(row.value);
                      }}
                    >
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: HANDWRITING,
                          fontSize: 20,
                          color: row.value ? "#2A1C10" : "rgba(42,28,16,0.35)",
                        }}
                      >
                        {row.value || "tap the folder"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TextInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="new folder"
                placeholderTextColor="rgba(197,208,218,0.3)"
                style={{ flex: 1, color: STEEL, borderBottomWidth: 1, borderBottomColor: STEEL }}
              />
              <Pressable
                onPress={() => {
                  if (!newLabel.trim()) return;
                  void patch((state) => ({
                    ...state,
                    vault: [
                      ...state.vault,
                      { id: createId(), label: newLabel.trim(), value: "", icon: "document" },
                    ],
                  }));
                  setNewLabel("");
                }}
              >
                <Text style={{ color: STEEL }}>add</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Stage>
    </Screen>
  );
}

const pinStyle = {
  marginTop: 16,
  width: "100%" as const,
  textAlign: "center" as const,
  letterSpacing: 14,
  fontSize: 32,
  color: STEEL,
  padding: 10,
};

const btn = {
  marginTop: 14,
  height: 48,
  width: "100%" as const,
  backgroundColor: STEEL,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
