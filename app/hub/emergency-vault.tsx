import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { sectionAccent } from "@/lib/hub-theme";
import { createId } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import type { VaultEntry } from "@/lib/mini-content";
import { digitsOnly, isVaultPin, VAULT_PIN_MAX, vaultPinHint } from "@/lib/vault-pin";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, TextInput, View } from "react-native";

const BG = "#0C1014";
const CARD = "#151C22";
const steel = () => sectionAccent("home-base", "#C5D0DA");

const FOLDER_ICONS = [
  "wifi",
  "key",
  "shield-checkmark",
  "medkit",
  "call",
  "folder",
  "paw",
  "flash",
  "home",
  "document",
] as const;

export default function EmergencyVaultScreen() {
  const { data, ready, patch } = useMiniApps();
  const [pinDraft, setPinDraft] = useState("");
  const [gate, setGate] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");
  const [compose, setCompose] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newIcon, setNewIcon] = useState<string>("document");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pinChange, setPinChange] = useState("");
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

  const pending = data.vault.find((row) => row.id === removeId) ?? null;

  const setPin = async () => {
    if (!isVaultPin(pinDraft)) {
      setError(vaultPinHint());
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

  const startEdit = (row: VaultEntry) => {
    setEditing(row.id);
    setEditLabel(row.label);
    setEditValue(row.value);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const label = editLabel.trim();
    if (!label) {
      setError("Give the folder a name.");
      return;
    }
    await patch((state) => ({
      ...state,
      vault: state.vault.map((item) =>
        item.id === editing ? { ...item, label, value: editValue.trim() } : item
      ),
    }));
    setEditing(null);
    setError(null);
  };

  const addFolder = async () => {
    const label = newLabel.trim();
    if (!label) {
      setError("Name what you’re filing.");
      return;
    }
    await patch((state) => ({
      ...state,
      vault: [
        ...state.vault,
        {
          id: createId(),
          label,
          value: newValue.trim(),
          icon: newIcon,
        },
      ],
    }));
    setCompose(false);
    setNewLabel("");
    setNewValue("");
    setNewIcon("document");
    setError(null);
  };

  const confirmRemove = async () => {
    const id = removeId;
    setRemoveId(null);
    if (!id) return;
    if (editing === id) setEditing(null);
    await patch((state) => ({
      ...state,
      vault: state.vault.filter((item) => item.id !== id),
    }));
  };

  const changePin = async () => {
    if (!isVaultPin(pinChange)) {
      setError(vaultPinHint());
      return;
    }
    setError(null);
    await patch((state) => ({ ...state, vaultPin: pinChange }));
    setPinChange("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
    <Screen scroll={!compose} background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent={steel()}>
        {!data.vaultPin ? (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: SERIF, fontSize: 32, color: steel() }}>Cut a key</Text>
            <Text style={{ fontFamily: HANDWRITING, fontSize: 18, color: "rgba(197,208,218,0.6)" }}>
              four or six digits, shared
            </Text>
            <TextInput
              value={pinDraft}
              onChangeText={(value) => setPinDraft(digitsOnly(value))}
              keyboardType="number-pad"
              maxLength={VAULT_PIN_MAX}
              placeholder="••••"
              placeholderTextColor="rgba(197,208,218,0.3)"
              style={pinStyle()}
            />
            <Pressable onPress={() => void setPin()} style={btn()}>
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
                  borderColor: steel(),
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ rotate }],
                }}
              >
                <Ionicons name="lock-closed" size={42} color={steel()} />
              </Animated.View>
            </View>
            <Text
              style={{
                marginTop: 16,
                fontFamily: SERIF,
                fontSize: 28,
                color: steel(),
              }}
            >
              Vault
            </Text>
            <TextInput
              value={gate}
              onChangeText={(value) => setGate(digitsOnly(value))}
              keyboardType="number-pad"
              maxLength={VAULT_PIN_MAX}
              secureTextEntry
              placeholder="combination"
              placeholderTextColor="rgba(197,208,218,0.3)"
              style={pinStyle()}
            />
            <Pressable onPress={unlock} style={btn()}>
              <Text style={{ color: "#0C1014", fontWeight: "800" }}>Turn the wheel</Text>
            </Pressable>
            {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
          </View>
        ) : (
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Pressable
                  onPress={() => {
                    if (settingsOpen) {
                      setSettingsOpen(false);
                      setError(null);
                      return;
                    }
                    setOpen(false);
                  }}
                  hitSlop={8}
                >
                  <Text style={{ color: steel(), fontFamily: HANDWRITING, fontSize: 18 }}>
                    {settingsOpen ? "back to folders" : "slam it shut"}
                  </Text>
                </Pressable>
                <Text
                  style={{
                    marginTop: 14,
                    fontFamily: SERIF,
                    fontSize: 32,
                    color: steel(),
                  }}
                >
                  {settingsOpen ? "Vault settings" : "Emergency info"}
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: SERIF,
                    fontSize: 16,
                    lineHeight: 22,
                    color: "rgba(197,208,218,0.62)",
                  }}
                >
                  {settingsOpen
                    ? "Pull folders you don’t use. Change the combination if you need to."
                    : "Codes, contacts, where the papers live. The cog manages folders."}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setSettingsOpen((on) => !on);
                  setCompose(false);
                  setEditing(null);
                  setError(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  settingsOpen ? "Close vault settings" : "Vault settings"
                }
                style={{
                  height: 44,
                  width: 44,
                  borderRadius: 16,
                  backgroundColor: steel(),
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 4,
                }}
              >
                <Ionicons
                  name={settingsOpen ? "close" : "settings-outline"}
                  size={22}
                  color="#0C1014"
                />
              </Pressable>
            </View>

            {settingsOpen ? (
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    color: steel(),
                  }}
                >
                  FOLDERS
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: SERIF,
                    fontSize: 14,
                    lineHeight: 20,
                    color: "rgba(197,208,218,0.55)",
                  }}
                >
                  {data.vault.length} in the safe. Pull the starter ones you don’t need.
                </Text>
                <View style={{ marginTop: 12, gap: 10 }}>
                  {data.vault.length === 0 ? (
                    <Text style={{ color: "rgba(197,208,218,0.5)", fontFamily: HANDWRITING, fontSize: 18 }}>
                      Nothing left to pull.
                    </Text>
                  ) : (
                    data.vault.map((row) => (
                      <View
                        key={row.id}
                        style={{
                          borderRadius: 14,
                          backgroundColor: CARD,
                          borderWidth: 1,
                          borderColor: "rgba(197,208,218,0.16)",
                          padding: 14,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Ionicons
                          name={(row.icon as keyof typeof Ionicons.glyphMap) || "folder"}
                          size={20}
                          color={steel()}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontFamily: SERIF,
                              fontSize: 16,
                              color: steel(),
                            }}
                          >
                            {row.label}
                          </Text>
                          <Text
                            style={{
                              marginTop: 2,
                              fontSize: 12,
                              color: "rgba(197,208,218,0.45)",
                            }}
                          >
                            {row.value.trim() ? "Has a note" : "Empty"}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => setRemoveId(row.id)}
                          accessibilityLabel={`Remove ${row.label}`}
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            backgroundColor: "rgba(139,58,42,0.22)",
                          }}
                        >
                          <Text style={{ color: "#FF8A8A", fontWeight: "800", fontSize: 12 }}>
                            Remove
                          </Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>

                <Text
                  style={{
                    marginTop: 24,
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    color: steel(),
                  }}
                >
                  COMBINATION
                </Text>
                <TextInput
                  value={pinChange}
                  onChangeText={(value) => setPinChange(digitsOnly(value))}
                  keyboardType="number-pad"
                  maxLength={VAULT_PIN_MAX}
                  placeholder="New 4 or 6 digits"
                  placeholderTextColor="rgba(197,208,218,0.3)"
                  style={pinStyle()}
                />
                <Pressable onPress={() => void changePin()} style={btn()}>
                  <Text style={{ color: "#0C1014", fontWeight: "800" }}>
                    Change combination
                  </Text>
                </Pressable>
                {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}
              </View>
            ) : (
            <>
            <Pressable
              onPress={() => {
                setError(null);
                setCompose(true);
              }}
              accessibilityLabel="Add a folder"
              style={{
                marginTop: 18,
                height: 52,
                borderRadius: 16,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: steel(),
                backgroundColor: "rgba(197,208,218,0.08)",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Ionicons name="add" size={22} color={steel()} />
              <Text style={{ color: steel(), fontWeight: "800", fontSize: 16 }}>
                Add a folder
              </Text>
            </Pressable>

            <View style={{ marginTop: 14, gap: 10 }}>
              {data.vault.length === 0 ? (
                <Text
                  style={{
                    marginTop: 12,
                    textAlign: "center",
                    color: "rgba(197,208,218,0.5)",
                    fontFamily: HANDWRITING,
                    fontSize: 20,
                  }}
                >
                  Empty safe. File the stuff you’d need at 2am.
                </Text>
              ) : (
                data.vault.map((row, i) => {
                  const on = editing === row.id;
                  return (
                    <View
                      key={row.id}
                      style={{
                        backgroundColor: i % 2 ? "#E8D7B0" : "#F3E6C4",
                        padding: 14,
                        borderRadius: 4,
                        transform: [{ rotate: i % 2 ? "0.5deg" : "-0.5deg" }],
                      }}
                    >
                      {on ? (
                        <View>
                          <TextInput
                            value={editLabel}
                            onChangeText={setEditLabel}
                            placeholder="Folder name"
                            placeholderTextColor="rgba(42,28,16,0.35)"
                            style={{
                              color: "#6A4A20",
                              fontFamily: "SpaceMono",
                              fontSize: 12,
                              letterSpacing: 0.8,
                            }}
                          />
                          <TextInput
                            value={editValue}
                            onChangeText={setEditValue}
                            autoFocus
                            multiline
                            placeholder="The number, code, or note"
                            placeholderTextColor="rgba(42,28,16,0.35)"
                            style={{
                              marginTop: 6,
                              color: "#2A1C10",
                              fontFamily: HANDWRITING,
                              fontSize: 20,
                              minHeight: 48,
                            }}
                          />
                          <View
                            style={{
                              marginTop: 10,
                              flexDirection: "row",
                              gap: 8,
                            }}
                          >
                            <Pressable
                              onPress={() => void saveEdit()}
                              style={{
                                flex: 1,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: "#2A1C10",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text style={{ color: "#F3E6C4", fontWeight: "800" }}>
                                Save
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => setRemoveId(row.id)}
                              accessibilityLabel={`Remove ${row.label}`}
                              style={{
                                height: 40,
                                paddingHorizontal: 14,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: "#8B3A2A",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text style={{ color: "#8B3A2A", fontWeight: "700" }}>
                                Remove
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <Pressable onPress={() => startEdit(row)} style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: "#6A4A20",
                                  fontFamily: "SpaceMono",
                                  fontSize: 10,
                                  letterSpacing: 0.8,
                                }}
                              >
                                {row.label.toUpperCase()}
                              </Text>
                              <Text
                                style={{
                                  marginTop: 4,
                                  fontFamily: HANDWRITING,
                                  fontSize: 20,
                                  color: row.value ? "#2A1C10" : "rgba(42,28,16,0.35)",
                                }}
                              >
                                {row.value || "Tap to write"}
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => setRemoveId(row.id)}
                              hitSlop={8}
                              accessibilityLabel={`Remove ${row.label}`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(42,28,16,0.08)",
                              }}
                            >
                              <Ionicons name="trash-outline" size={18} color="#8B3A2A" />
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
            {error && !compose ? (
              <Text style={{ marginTop: 10, color: "#FF8A8A" }}>{error}</Text>
            ) : null}
            </>
            )}
          </View>
        )}
      </Stage>
    </Screen>

      {compose ? (
        <SheetOverlay
          kicker="NEW FOLDER"
          title="Add to the vault"
          onClose={() => {
            setCompose(false);
            setError(null);
          }}
          background={CARD}
          ink={steel()}
          muted="rgba(197,208,218,0.55)"
        >
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 22,
              color: "rgba(197,208,218,0.62)",
            }}
          >
            A label and whatever you’d need to find at 2am.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {FOLDER_ICONS.map((icon) => {
              const on = newIcon === icon;
              return (
                <Pressable
                  key={icon}
                  onPress={() => setNewIcon(icon)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: on ? steel() : "#0F161C",
                  }}
                >
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={on ? "#0C1014" : steel()}
                  />
                </Pressable>
              );
            })}
          </View>
          <Field
            label="Folder name"
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="Spare key, GP, landlord…"
          />
          <Field
            label="The details"
            value={newValue}
            onChangeText={setNewValue}
            placeholder="Code, number, or where it lives"
            multiline
          />
          {error ? <Text style={{ marginTop: 10, color: "#FF8A8A" }}>{error}</Text> : null}
          <Pressable
            onPress={() => void addFolder()}
            style={{
              marginTop: 16,
              height: 52,
              borderRadius: 16,
              backgroundColor: steel(),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#0C1014", fontWeight: "800" }}>File it</Text>
          </Pressable>
        </SheetOverlay>
      ) : null}

      <ConfirmDialog
        open={Boolean(removeId)}
        title={pending ? `Pull “${pending.label}”?` : "Pull this folder?"}
        body="It leaves the vault for both of you. You can always file a new one."
        confirmLabel="Pull folder"
        cancelLabel="Keep it"
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveId(null)}
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.2,
          color: "rgba(197,208,218,0.55)",
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(197,208,218,0.28)"
        multiline={multiline}
        style={{
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 12 : 12,
          minHeight: multiline ? 88 : 48,
          backgroundColor: "#0F161C",
          color: steel(),
          fontSize: 16,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

const pinStyle = () => ({
  marginTop: 16,
  width: "100%" as const,
  textAlign: "center" as const,
  letterSpacing: 14,
  fontSize: 32,
  color: steel(),
  padding: 10,
});

const btn = () => ({
  marginTop: 14,
  height: 48,
  width: "100%" as const,
  backgroundColor: steel(),
  alignItems: "center" as const,
  justifyContent: "center" as const,
});
