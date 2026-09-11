import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C1014";
const STEEL = "#8FA8C8";

export default function EmergencyVaultScreen() {
  const { data, ready, patch } = useMiniApps();
  const [pinDraft, setPinDraft] = useState("");
  const [gate, setGate] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready) setOpen(!data.vaultPin);
  }, [data.vaultPin, ready]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const setPin = async () => {
    if (!/^\d{4}$/.test(pinDraft)) {
      setError("Four digits. Something you'll both remember.");
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
    setError("Wrong combination.");
  };

  const saveEntry = async (id: string) => {
    await patch((state) => ({
      ...state,
      vault: state.vault.map((row) =>
        row.id === id ? { ...row, value } : row
      ),
    }));
    setEditing(null);
    setValue("");
  };

  const addEntry = async () => {
    if (!newLabel.trim()) return;
    await patch((state) => ({
      ...state,
      vault: [
        ...state.vault,
        {
          id: createId(),
          label: newLabel.trim(),
          value: "",
          icon: "document",
        },
      ],
    }));
    setNewLabel("");
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={STEEL}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · safe"
        title="Emergency vault"
        body="Wi-Fi, gate codes, allergies, the folder with the papers. Locked with a 4-digit couple PIN on this device — not bank-grade, just out of sight."
        ready={ready}
      >
        {!data.vaultPin ? (
          <View style={{ marginTop: 18 }}>
            <Text style={{ color: "rgba(244,244,246,0.6)" }}>
              Set a shared 4-digit combination.
            </Text>
            <TextInput
              value={pinDraft}
              onChangeText={setPinDraft}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="••••"
              placeholderTextColor="rgba(244,244,246,0.3)"
              style={pinStyle}
            />
            <Pressable onPress={() => void setPin()} style={btn}>
              <Text style={{ color: "#0C1014", fontWeight: "800" }}>Set combination</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          </View>
        ) : !open ? (
          <View style={{ marginTop: 24, alignItems: "center" }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 6,
                borderColor: STEEL,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="lock-closed" size={42} color={STEEL} />
            </View>
            <TextInput
              value={gate}
              onChangeText={setGate}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="Combination"
              placeholderTextColor="rgba(244,244,246,0.3)"
              secureTextEntry
              style={pinStyle}
            />
            <Pressable onPress={unlock} style={btn}>
              <Text style={{ color: "#0C1014", fontWeight: "800" }}>Open the vault</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          </View>
        ) : (
          <View style={{ marginTop: 16, gap: 10 }}>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={{ color: STEEL }}>Lock it again</Text>
            </Pressable>
            {data.vault.map((row) => (
              <View
                key={row.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: "#161C22",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name={row.icon as never} size={16} color={STEEL} />
                  <Text style={{ color: STEEL, fontWeight: "700" }}>{row.label}</Text>
                </View>
                {editing === row.id ? (
                  <View>
                    <TextInput
                      value={value}
                      onChangeText={setValue}
                      autoFocus
                      style={{
                        marginTop: 8,
                        color: "#F4F4F6",
                        borderBottomWidth: 1,
                        borderBottomColor: STEEL,
                        paddingVertical: 6,
                      }}
                    />
                    <Pressable onPress={() => void saveEntry(row.id)}>
                      <Text style={{ marginTop: 8, color: STEEL }}>Save</Text>
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
                        marginTop: 8,
                        fontFamily: SERIF,
                        fontSize: 16,
                        color: row.value ? "#F4F4F6" : "rgba(244,244,246,0.35)",
                      }}
                    >
                      {row.value || "Tap to fill"}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <TextInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Add a slot"
                placeholderTextColor="rgba(244,244,246,0.3)"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: "#161C22",
                  color: "#F4F4F6",
                }}
              />
              <Pressable onPress={() => void addEntry()} style={{ justifyContent: "center" }}>
                <Text style={{ color: STEEL }}>Add</Text>
              </Pressable>
            </View>
          </View>
        )}
      </MiniChrome>
    </Screen>
  );
}

const pinStyle = {
  marginTop: 16,
  width: "100%" as const,
  textAlign: "center" as const,
  letterSpacing: 12,
  fontSize: 28,
  color: "#F4F4F6",
  padding: 12,
  borderRadius: 12,
  backgroundColor: "#161C22",
};

const btn = {
  marginTop: 14,
  height: 48,
  borderRadius: 14,
  backgroundColor: STEEL,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
