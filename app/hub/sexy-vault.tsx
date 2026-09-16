import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { sectionAccent } from "@/lib/hub-theme";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import {
  deleteSexyVaultBlob,
  isSexyVaultLocked,
  persistSexyVaultMedia,
  pickSexyMedia,
  resolveSexyVaultSrc,
  sexyVaultUnlockLabel,
  type SexyVaultItem,
  type SexyVaultKind,
} from "@/lib/sexy-vault";
import { useApp } from "@/lib/store";
import { digitsOnly, isVaultPin, VAULT_PIN_MAX, vaultPinHint } from "@/lib/vault-pin";
import {
  defaultCustomDateTime,
  formatExactWhen,
  parseLocalDateTime,
  toLocalDateTimeValue,
} from "@/lib/useTiming";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { createElement, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const BG = "#10060A";
const gold = () => sectionAccent("desire", "#E4B56A");
const ROSE = "#FF6B8A";
const INK = "#F6E7DC";

export default function SexyVaultScreen() {
  const { user, partner, notifyPartner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const [gate, setGate] = useState("");
  const look = useAppLook("sexy-vault", gold(), {
    blurLocked: true,
    twoCol: false,
  });
  const [pinDraft, setPinDraft] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [open, setOpen] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "compose" | "view">("list");
  const [viewId, setViewId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [hideUntil, setHideUntil] = useState(false);
  const [revealLocal, setRevealLocal] = useState(defaultCustomDateTime());
  const [pending, setPending] = useState<{
    kind: SexyVaultKind;
    blob: Blob;
    mimeType: string;
    preview: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const them = partner?.displayName || "them";

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (ready) setOpen(!data.sexyVaultPin);
  }, [data.sexyVaultPin, ready]);

  const items = useMemo(
    () =>
      [...data.sexyVault].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.sexyVault]
  );
  const viewing = items.find((row) => row.id === viewId) ?? null;

  const setPin = async (next: string) => {
    if (!isVaultPin(next)) {
      setError(vaultPinHint());
      return false;
    }
    setError(null);
    await patch((state) => ({ ...state, sexyVaultPin: next }));
    setPinDraft("");
    setPinConfirm("");
    setChangingPin(false);
    setOpen(true);
    return true;
  };

  const unlock = () => {
    if (gate === data.sexyVaultPin) {
      setOpen(true);
      setError(null);
      setGate("");
      return;
    }
    setError("Wrong pin.");
  };

  const pickFile = async () => {
    setError(null);
    try {
      const picked = await pickSexyMedia();
      if (!picked) return;
      if (pending?.preview.startsWith("blob:")) URL.revokeObjectURL(pending.preview);
      setPending({
        ...picked,
        preview: URL.createObjectURL(picked.blob),
      });
      setMode("compose");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    }
  };

  const leaveItem = async () => {
    if (!user) {
      setError("Sign in first.");
      return;
    }
    if (!pending) {
      setError("Add a photo or a clip first.");
      return;
    }
    let revealAt: string | null = null;
    if (hideUntil) {
      const parsed = parseLocalDateTime(revealLocal);
      if (!parsed || parsed.getTime() <= Date.now()) {
        setError("Pick a time in the future, or turn hide-until off.");
        return;
      }
      revealAt = parsed.toISOString();
    }
    setBusy(true);
    setError(null);
    const id = createId();
    try {
      const stored = await persistSexyVaultMedia(id, pending.blob);
      const item: SexyVaultItem = {
        id,
        fromId: user.id,
        kind: pending.kind,
        note: note.trim(),
        createdAt: nowIso(),
        revealAt,
        seenAt: null,
        mimeType: stored.mimeType,
        uri: stored.uri,
      };
      await patch((state) => ({
        ...state,
        sexyVault: [item, ...state.sexyVault],
      }));
      notifyPartner({
        title: "Sexy Vault",
        body: revealAt
          ? `Something sexy is waiting. Hidden until ${formatExactWhen(revealAt)}.`
          : "They left something sexy in the vault.",
        url: "/hub/sexy-vault",
      });
      if (pending.preview.startsWith("blob:")) URL.revokeObjectURL(pending.preview);
      setPending(null);
      setNote("");
      setHideUntil(false);
      setRevealLocal(defaultCustomDateTime());
      setMode("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not lock that away.");
    } finally {
      setBusy(false);
    }
  };

  const openItem = async (item: SexyVaultItem) => {
    if (isSexyVaultLocked(item, user?.id, now)) return;
    setViewId(item.id);
    setMode("view");
    if (user && item.fromId !== user.id && !item.seenAt) {
      await patch((state) => ({
        ...state,
        sexyVault: state.sexyVault.map((row) =>
          row.id === item.id ? { ...row, seenAt: nowIso() } : row
        ),
      }));
    }
  };

  const removeItem = async (id: string) => {
    await deleteSexyVaultBlob(id);
    await patch((state) => ({
      ...state,
      sexyVault: state.sexyVault.filter((row) => row.id !== id),
    }));
    if (viewId === id) {
      setViewId(null);
      setMode("list");
    }
  };

  return (
    <Screen scroll background={BG}>
      <Stage
        background={BG}
        fallback={"/hub/desire" as Href}
        accent={look.accent}
        settingsLabel="Sexy vault"
        settings={
          <LookPanel
            look={look}
            ink={INK}
            muted="rgba(246,231,220,0.6)"
            toggles={[
              {
                key: "blurLocked",
                label: "Blur hidden clips",
                hint: "Until the time you set, keep a frost over the thumb.",
              },
              {
                key: "twoCol",
                label: "Two-column grid",
                hint: "More tiles on the page.",
              },
            ]}
          />
        }
      >
        {!data.sexyVaultPin ? (
          <PinSetup
            pinDraft={pinDraft}
            pinConfirm={pinConfirm}
            error={error}
            onDraft={setPinDraft}
            onConfirm={setPinConfirm}
            onSave={() => {
              if (pinDraft !== pinConfirm) {
                setError("Those pins don’t match.");
                return;
              }
              void setPin(pinDraft);
            }}
          />
        ) : !open ? (
          <PinGate
            gate={gate}
            error={error}
            onGate={setGate}
            onUnlock={unlock}
          />
        ) : mode === "compose" ? (
          <Compose
            them={them}
            pending={pending}
            note={note}
            hideUntil={hideUntil}
            revealLocal={revealLocal}
            busy={busy}
            error={error}
            onNote={setNote}
            onHide={setHideUntil}
            onReveal={setRevealLocal}
            onPick={() => void pickFile()}
            onCancel={() => {
              if (pending?.preview.startsWith("blob:")) {
                URL.revokeObjectURL(pending.preview);
              }
              setPending(null);
              setError(null);
              setMode("list");
            }}
            onLeave={() => void leaveItem()}
          />
        ) : mode === "view" && viewing ? (
          <Viewer
            item={viewing}
            mine={viewing.fromId === user?.id}
            them={them}
            onBack={() => {
              setViewId(null);
              setMode("list");
            }}
            onRemove={() => setRemoveId(viewing.id)}
          />
        ) : (
          <VaultHome
            items={items}
            userId={user?.id}
            them={them}
            now={now}
            changingPin={changingPin}
            pinDraft={pinDraft}
            pinConfirm={pinConfirm}
            error={error}
            onLeave={() => {
              setError(null);
              setMode("compose");
            }}
            onOpen={(item) => void openItem(item)}
            onRemove={setRemoveId}
            onLock={() => {
              setOpen(false);
              setChangingPin(false);
              setMode("list");
            }}
            onTogglePin={() => {
              setChangingPin((value) => !value);
              setPinDraft("");
              setPinConfirm("");
              setError(null);
            }}
            onDraft={setPinDraft}
            onConfirm={setPinConfirm}
            onSavePin={() => {
              if (pinDraft !== pinConfirm) {
                setError("Those pins don’t match.");
                return;
              }
              void setPin(pinDraft);
            }}
          />
        )}
      </Stage>

      <ConfirmDialog
        open={Boolean(removeId)}
        title="Remove this?"
        body="It leaves the vault for both of you."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) void removeItem(removeId);
          setRemoveId(null);
        }}
      />
    </Screen>
  );
}

function PinSetup({
  pinDraft,
  pinConfirm,
  error,
  onDraft,
  onConfirm,
  onSave,
}: {
  pinDraft: string;
  pinConfirm: string;
  error: string | null;
  onDraft: (value: string) => void;
  onConfirm: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <View style={{ alignItems: "center", paddingTop: 12 }}>
      <Text style={{ fontFamily: SERIF, fontSize: 34, color: gold() }}>The Sexy Vault</Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: HANDWRITING,
          fontSize: 20,
          color: "rgba(228,181,106,0.72)",
          textAlign: "center",
        }}
      >
        one pin, both of you
      </Text>
      <Text style={lede}>
        Cut a four- or six-digit key. Photos and clips live here. You can hide one until
        a time you pick — they still get told something is waiting.
      </Text>
      <TextInput
        value={pinDraft}
        onChangeText={(value) => onDraft(digitsOnly(value))}
        keyboardType="number-pad"
        maxLength={VAULT_PIN_MAX}
        secureTextEntry
        placeholder="••••"
        placeholderTextColor="rgba(228,181,106,0.28)"
        style={pinStyle()}
      />
      <TextInput
        value={pinConfirm}
        onChangeText={(value) => onConfirm(digitsOnly(value))}
        keyboardType="number-pad"
        maxLength={VAULT_PIN_MAX}
        secureTextEntry
        placeholder="again"
        placeholderTextColor="rgba(228,181,106,0.28)"
        style={pinStyle()}
      />
      <Pressable onPress={onSave} style={goldBtn()}>
        <Text style={goldBtnText}>Set the pin</Text>
      </Pressable>
      {error ? <Text style={errText}>{error}</Text> : null}
    </View>
  );
}

function PinGate({
  gate,
  error,
  onGate,
  onUnlock,
}: {
  gate: string;
  error: string | null;
  onGate: (value: string) => void;
  onUnlock: () => void;
}) {
  return (
    <View style={{ alignItems: "center", paddingTop: 18 }}>
      <View
        style={{
          width: 148,
          height: 148,
          borderRadius: 74,
          borderWidth: 2,
          borderColor: "rgba(228,181,106,0.45)",
          backgroundColor: "#1A0C12",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="lock-closed" size={42} color={gold()} />
      </View>
      <Text style={{ marginTop: 18, fontFamily: SERIF, fontSize: 28, color: gold() }}>
        Locked
      </Text>
      <Text style={{ marginTop: 6, fontFamily: HANDWRITING, fontSize: 18, color: ROSE }}>
        enter the shared pin
      </Text>
      <TextInput
        value={gate}
        onChangeText={(value) => onGate(digitsOnly(value))}
        keyboardType="number-pad"
        maxLength={VAULT_PIN_MAX}
        secureTextEntry
        placeholder="••••"
        placeholderTextColor="rgba(228,181,106,0.28)"
        style={pinStyle()}
        onSubmitEditing={onUnlock}
      />
      <Pressable onPress={onUnlock} style={goldBtn()}>
        <Text style={goldBtnText}>Open the vault</Text>
      </Pressable>
      {error ? <Text style={errText}>{error}</Text> : null}
    </View>
  );
}

function VaultHome({
  items,
  userId,
  them,
  now,
  changingPin,
  pinDraft,
  pinConfirm,
  error,
  onLeave,
  onOpen,
  onRemove,
  onLock,
  onTogglePin,
  onDraft,
  onConfirm,
  onSavePin,
}: {
  items: SexyVaultItem[];
  userId?: string;
  them: string;
  now: number;
  changingPin: boolean;
  pinDraft: string;
  pinConfirm: string;
  error: string | null;
  onLeave: () => void;
  onOpen: (item: SexyVaultItem) => void;
  onRemove: (id: string) => void;
  onLock: () => void;
  onTogglePin: () => void;
  onDraft: (value: string) => void;
  onConfirm: (value: string) => void;
  onSavePin: () => void;
}) {
  return (
    <View>
      <Text style={{ fontFamily: SERIF, fontSize: 34, color: gold() }}>The Sexy Vault</Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: HANDWRITING,
          fontSize: 20,
          color: ROSE,
        }}
      >
        just the two of you
      </Text>
      <Pressable onPress={onLeave} style={[goldBtn(), { marginTop: 22 }]}>
        <Text style={goldBtnText}>Leave a photo or clip</Text>
      </Pressable>
      <View style={{ marginTop: 18, flexDirection: "row", gap: 8 }}>
        <Pressable onPress={onLock} style={ghostBtn}>
          <Text style={ghostBtnText}>Lock</Text>
        </Pressable>
        <Pressable onPress={onTogglePin} style={ghostBtn}>
          <Text style={ghostBtnText}>{changingPin ? "Cancel" : "Change pin"}</Text>
        </Pressable>
      </View>
      {changingPin ? (
        <View style={{ marginTop: 12 }}>
          <TextInput
            value={pinDraft}
            onChangeText={(value) => onDraft(digitsOnly(value))}
            keyboardType="number-pad"
            maxLength={VAULT_PIN_MAX}
            secureTextEntry
            placeholder="new pin"
            placeholderTextColor="rgba(228,181,106,0.28)"
            style={pinStyle()}
          />
          <TextInput
            value={pinConfirm}
            onChangeText={(value) => onConfirm(digitsOnly(value))}
            keyboardType="number-pad"
            maxLength={VAULT_PIN_MAX}
            secureTextEntry
            placeholder="again"
            placeholderTextColor="rgba(228,181,106,0.28)"
            style={pinStyle()}
          />
          <Pressable onPress={onSavePin} style={goldBtn()}>
            <Text style={goldBtnText}>Save new pin</Text>
          </Pressable>
        </View>
      ) : null}
      {error ? <Text style={errText}>{error}</Text> : null}

      {items.length === 0 ? (
        <Text style={[lede, { marginTop: 28 }]}>
          Empty. Leave {them} something, or wait for them to.
        </Text>
      ) : (
        <View style={{ marginTop: 22, gap: 10 }}>
          {items.map((item) => {
            const mine = item.fromId === userId;
            const locked = isSexyVaultLocked(item, userId, now);
            return (
              <Pressable
                key={item.id}
                onPress={() => onOpen(item)}
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: locked
                    ? "rgba(228,181,106,0.22)"
                    : "rgba(255,107,138,0.28)",
                  backgroundColor: locked ? "#160A0E" : "#1C0C12",
                  padding: 14,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  {!locked && item.uri && item.kind === "photo" ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        backgroundColor: "#1A0C12",
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name={
                        locked
                          ? "lock-closed"
                          : item.kind === "video"
                            ? "videocam"
                            : "image"
                      }
                      size={22}
                      color={locked ? gold() : ROSE}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: INK, fontWeight: "700", fontSize: 15 }}>
                      {locked
                        ? `Hidden until ${sexyVaultUnlockLabel(item)}`
                        : mine
                          ? item.kind === "video"
                            ? "Your clip"
                            : "Your photo"
                          : item.kind === "video"
                            ? `A clip from ${them}`
                            : `A photo from ${them}`}
                    </Text>
                    <Text style={{ marginTop: 3, color: "rgba(246,231,220,0.55)", fontSize: 13 }}>
                      {locked
                        ? "They’ll know it’s here. They can’t open it yet."
                        : item.note
                          ? item.note
                          : mine
                            ? item.revealAt
                              ? `Hidden from them until ${sexyVaultUnlockLabel(item)}`
                              : "Open now"
                            : item.seenAt
                              ? "Opened"
                              : "Waiting for you"}
                    </Text>
                  </View>
                  {mine ? (
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        onRemove(item.id);
                      }}
                      hitSlop={8}
                      style={iconBtn}
                    >
                      <Ionicons name="close" size={16} color="rgba(246,231,220,0.55)" />
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function Compose({
  them,
  pending,
  note,
  hideUntil,
  revealLocal,
  busy,
  error,
  onNote,
  onHide,
  onReveal,
  onPick,
  onCancel,
  onLeave,
}: {
  them: string;
  pending: { kind: SexyVaultKind; preview: string } | null;
  note: string;
  hideUntil: boolean;
  revealLocal: string;
  busy: boolean;
  error: string | null;
  onNote: (value: string) => void;
  onHide: (value: boolean) => void;
  onReveal: (value: string) => void;
  onPick: () => void;
  onCancel: () => void;
  onLeave: () => void;
}) {
  return (
    <View>
      <Text style={{ fontFamily: SERIF, fontSize: 30, color: gold() }}>Leave something</Text>
      <Text style={{ marginTop: 6, fontFamily: HANDWRITING, fontSize: 18, color: ROSE }}>
        for {them}
      </Text>
      <Pressable onPress={onPick} style={[goldBtn(), { marginTop: 18, height: 64 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="cloud-upload-outline" size={22} color="#1A1008" />
          <Text style={[goldBtnText, { fontSize: 16 }]}>
            {pending ? "Swap the file" : "Choose a photo or video"}
          </Text>
        </View>
      </Pressable>
      {pending ? <MediaPreview kind={pending.kind} src={pending.preview} /> : null}
      <TextInput
        value={note}
        onChangeText={onNote}
        placeholder="Optional note"
        placeholderTextColor="rgba(246,231,220,0.32)"
        multiline
        style={{
          marginTop: 14,
          minHeight: 88,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "rgba(228,181,106,0.28)",
          backgroundColor: "#1A0C12",
          color: INK,
          padding: 14,
          fontSize: 16,
          textAlignVertical: "top",
        }}
      />
      <Pressable
        onPress={() => onHide(!hideUntil)}
        style={{
          marginTop: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: hideUntil ? "rgba(228,181,106,0.5)" : "rgba(255,255,255,0.08)",
          backgroundColor: hideUntil ? "rgba(228,181,106,0.1)" : "#160A0E",
          padding: 14,
        }}
      >
        <Ionicons
          name={hideUntil ? "time" : "time-outline"}
          size={20}
          color={hideUntil ? gold() : "rgba(246,231,220,0.5)"}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: INK, fontWeight: "700" }}>Stay hidden until a time</Text>
          <Text style={{ marginTop: 3, color: "rgba(246,231,220,0.55)", fontSize: 13 }}>
            They get told it’s here. They can’t open it yet.
          </Text>
        </View>
      </Pressable>
      {hideUntil ? (
        <DateTimeField
          value={revealLocal}
          min={toLocalDateTimeValue(new Date())}
          onChange={onReveal}
          accent={gold()}
          background="#1A0C12"
          ink={INK}
          border="rgba(228,181,106,0.32)"
        />
      ) : null}
      <Pressable
        onPress={onLeave}
        disabled={busy}
        style={[goldBtn(), { opacity: busy ? 0.6 : 1 }]}
      >
        <Text style={goldBtnText}>{busy ? "Locking it away…" : "Lock it in the vault"}</Text>
      </Pressable>
      <Pressable onPress={onCancel} style={[ghostBtn, { marginTop: 10 }]}>
        <Text style={ghostBtnText}>Back</Text>
      </Pressable>
      {error ? <Text style={errText}>{error}</Text> : null}
    </View>
  );
}

function Viewer({
  item,
  mine,
  them,
  onBack,
  onRemove,
}: {
  item: SexyVaultItem;
  mine: boolean;
  them: string;
  onBack: () => void;
  onRemove: () => void;
}) {
  const [src, setSrc] = useState<string | null>(item.uri ?? null);

  useEffect(() => {
    let dead = false;
    let created: string | null = null;
    void resolveSexyVaultSrc(item).then((url) => {
      if (dead) return;
      created = url && url.startsWith("blob:") ? url : null;
      setSrc(url);
    });
    return () => {
      dead = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [item]);

  return (
    <View>
      <Text style={{ fontFamily: SERIF, fontSize: 28, color: gold() }}>
        {mine ? "You left this" : `From ${them}`}
      </Text>
      {src ? (
        <MediaPreview kind={item.kind} src={src} />
      ) : (
        <Text style={lede}>Finding the file…</Text>
      )}
      {item.note ? (
        <Text
          style={{
            marginTop: 16,
            fontFamily: HANDWRITING,
            fontSize: 22,
            color: INK,
            lineHeight: 30,
          }}
        >
          {item.note}
        </Text>
      ) : null}
      <Pressable onPress={onBack} style={[goldBtn(), { marginTop: 22 }]}>
        <Text style={goldBtnText}>Back to the vault</Text>
      </Pressable>
      {mine ? (
        <Pressable onPress={onRemove} style={[ghostBtn, { marginTop: 10 }]}>
          <Text style={ghostBtnText}>Remove</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MediaPreview({
  kind,
  src,
  tappable = true,
}: {
  kind: SexyVaultKind;
  src: string;
  tappable?: boolean;
}) {
  const [full, setFull] = useState(false);
  const body =
    kind === "video" && Platform.OS === "web" ? (
      createElement("video", {
        src,
        controls: true,
        playsInline: true,
        style: {
          width: "100%",
          marginTop: 14,
          borderRadius: 18,
          backgroundColor: "#000",
          maxHeight: 420,
        },
      })
    ) : (
      <Image
        source={{ uri: src }}
        style={{
          width: "100%",
          height: 320,
          marginTop: 14,
          borderRadius: 18,
          backgroundColor: "#1A0C12",
        }}
        resizeMode="cover"
      />
    );

  return (
    <View>
      <Pressable disabled={!tappable} onPress={() => tappable && setFull(true)}>
        {body}
        {tappable && kind !== "video" ? (
          <Text
            style={{
              marginTop: 6,
              textAlign: "center",
              color: "rgba(246,231,220,0.5)",
              fontSize: 12,
            }}
          >
            Tap to see full screen
          </Text>
        ) : null}
      </Pressable>
      <Modal visible={full} transparent animationType="fade" onRequestClose={() => setFull(false)}>
        <Pressable
          onPress={() => setFull(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.94)",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {kind === "video" && Platform.OS === "web" ? (
            createElement("video", {
              src,
              controls: true,
              autoPlay: true,
              playsInline: true,
              style: {
                width: "100%",
                maxHeight: "90%",
                backgroundColor: "#000",
              },
            })
          ) : (
            <Image
              source={{ uri: src }}
              style={{ width: "100%", height: "90%" }}
              resizeMode="contain"
            />
          )}
          <Text
            style={{
              marginTop: 12,
              color: "rgba(246,231,220,0.7)",
              fontSize: 13,
            }}
          >
            Tap anywhere to close
          </Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const lede = {
  marginTop: 14,
  fontSize: 15,
  lineHeight: 22,
  color: "rgba(246,231,220,0.62)",
  textAlign: "center" as const,
};

const pinStyle = () => ({
  marginTop: 12,
  width: "100%" as const,
  height: 56,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(228,181,106,0.35)",
  backgroundColor: "#1A0C12",
  color: gold(),
  textAlign: "center" as const,
  fontSize: 28,
  letterSpacing: 10,
});

const goldBtn = () => ({
  marginTop: 16,
  height: 52,
  borderRadius: 16,
  backgroundColor: gold(),
  alignItems: "center" as const,
  justifyContent: "center" as const,
});

const goldBtnText = {
  color: "#1A1008",
  fontWeight: "800" as const,
  fontSize: 15,
};

const ghostBtn = {
  flex: 1,
  height: 44,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "rgba(246,231,220,0.16)",
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const ghostBtnText = {
  color: INK,
  fontWeight: "700" as const,
  fontSize: 13,
};

const iconBtn = {
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: "rgba(255,255,255,0.06)",
};

const errText = { marginTop: 10, color: ROSE, textAlign: "center" as const };
