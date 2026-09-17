import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { AdultAttest, MediaShield, useScanUpload } from "@/components/MediaShield";
import { ReportSheet, ReportTextButton } from "@/components/ReportSheet";
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
import {
  downloadVaultBackup,
  parseVaultBackup,
  pickVaultBackupFile,
  restoreVaultBackup,
} from "@/lib/vault-backup";
import { themLabel } from "@/lib/names";
import { useApp } from "@/lib/store";
import { ComboPad } from "@/components/ui/ComboPad";
import { isVaultPin, vaultPinHint } from "@/lib/vault-pin";
import {
  defaultCustomDateTime,
  formatExactWhen,
  parseLocalDateTime,
  toLocalDateTimeValue,
} from "@/lib/useTiming";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { createElement, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  PanResponder,
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
const STEEL = "#C5D0DA";
const SAFE = "#0C1014";

export default function SexyVaultScreen() {
  const { user, partner, notifyPartner, submitContentReport } = useApp();
  const { data, ready, patch } = useMiniApps();
  const scanUpload = useScanUpload();
  const [gate, setGate] = useState("");
  const look = useAppLook("sexy-vault", gold(), {
    blurLocked: true,
    twoCol: true,
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
  const [attested, setAttested] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [copyBusy, setCopyBusy] = useState(false);
  const [copyNote, setCopyNote] = useState<string | null>(null);
  const them = themLabel(partner);

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
  const album = useMemo(
    () => items.filter((row) => !isSexyVaultLocked(row, user?.id, now)),
    [items, user?.id, now]
  );

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

  const unlock = (next = gate) => {
    if (next === data.sexyVaultPin) {
      setOpen(true);
      setError(null);
      setGate("");
      return;
    }
    if (data.sexyVaultPin && next.length >= data.sexyVaultPin.length) {
      setError("The tumblers didn’t like that.");
      setGate("");
      return;
    }
    setGate(next);
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
      setAttested(false);
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
      const scan = await scanUpload({
        mimeType: pending.mimeType || pending.blob.type || "application/octet-stream",
        byteSize: pending.blob.size,
        attestedAdults: attested,
      });
      if (!scan.ok) {
        setError(scan.reason);
        return;
      }
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
      setAttested(false);
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

  const stepView = (dir: number) => {
    if (!viewId) return;
    const index = album.findIndex((row) => row.id === viewId);
    const next = album[index + dir];
    if (next) void openItem(next);
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

  const saveVaultCopy = async () => {
    setCopyBusy(true);
    setError(null);
    setCopyNote(null);
    try {
      const count = await downloadVaultBackup(data.sexyVault);
      setCopyNote(
        `${count} ${count === 1 ? "file" : "files"} saved on this phone. AirDrop it or copy it with a cable onto the new one. Duoma never uploaded it.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save a copy.");
    } finally {
      setCopyBusy(false);
    }
  };

  const restoreVaultCopy = async () => {
    setCopyBusy(true);
    setError(null);
    setCopyNote(null);
    try {
      const raw = await pickVaultBackupFile();
      if (!raw) return;
      const backup = parseVaultBackup(raw);
      const next = await restoreVaultBackup(backup, data.sexyVault);
      await patch((state) => ({ ...state, sexyVault: next }));
      setCopyNote(
        `${backup.items.length} ${
          backup.items.length === 1 ? "clip is" : "clips are"
        } back in the vault. Still only on this phone.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restore that file.");
    } finally {
      setCopyBusy(false);
    }
  };

  return (
    <MediaShield>
    <Screen scroll={mode !== "view"} background={BG} density={look.prefs.density} typeface={look.prefs.typeface} wash={look.wash}>
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
            pageColor={BG}
            toggles={[
              {
                key: "blurLocked",
                label: "Blur hidden clips",
                hint: "Until the time you set, keep a frost over the thumb.",
              },
              {
                key: "twoCol",
                label: "Two-column grid",
                hint: "Thumbnails in a tile grid.",
              },
            ]}
          >
            <VaultCopyPanel
              busy={copyBusy}
              note={copyNote}
              error={error}
              onSave={() => void saveVaultCopy()}
              onRestore={() => void restoreVaultCopy()}
            />
          </LookPanel>
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
            onGate={(value) => unlock(value)}
            expectedLength={data.sexyVaultPin.length}
            onUnlock={() => unlock()}
          />
        ) : mode === "compose" ? (
          <Compose
            them={them}
            pending={pending}
            note={note}
            hideUntil={hideUntil}
            revealLocal={revealLocal}
            busy={busy}
            attested={attested}
            error={error}
            onNote={setNote}
            onHide={setHideUntil}
            onReveal={setRevealLocal}
            onAttest={setAttested}
            onPick={() => void pickFile()}
            onCancel={() => {
              if (pending?.preview.startsWith("blob:")) {
                URL.revokeObjectURL(pending.preview);
              }
              setPending(null);
              setAttested(false);
              setError(null);
              setMode("list");
            }}
            onLeave={() => void leaveItem()}
          />
        ) : mode === "view" && viewing ? (
          <Viewer
            item={viewing}
            album={album}
            mine={viewing.fromId === user?.id}
            them={them}
            onStep={stepView}
            onBack={() => {
              setViewId(null);
              setMode("list");
            }}
            onRemove={() => setRemoveId(viewing.id)}
            onReport={() => setReportOpen(true)}
          />
        ) : (
          <VaultHome
            items={items}
            userId={user?.id}
            them={them}
            now={now}
            twoCol={look.prefs.twoCol}
            blurLocked={look.prefs.blurLocked}
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
            copyBusy={copyBusy}
            copyNote={copyNote}
            onSaveCopy={() => void saveVaultCopy()}
            onRestoreCopy={() => void restoreVaultCopy()}
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
      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={async ({ reason, details }) => {
          if (!viewing) throw new Error("Open a clip first.");
          await submitContentReport({
            reason,
            details,
            mediaId: viewing.id,
            mediaKind: "sexy-vault",
            reportedUserId:
              viewing.fromId === user?.id ? partner?.id ?? null : viewing.fromId,
          });
        }}
      />
    </Screen>
    </MediaShield>
  );
}

function SafeDial({ spinning = true }: { spinning?: boolean }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!spinning) return;
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
  }, [spin, spinning]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
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
        shadowColor: "#000",
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
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
          backgroundColor: "#151C22",
          transform: spinning ? [{ rotate }] : undefined,
        }}
      >
        <View
          style={{
            width: 86,
            height: 86,
            borderRadius: 43,
            backgroundColor: "#2A333C",
            borderWidth: 3,
            borderColor: "#5A6772",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="lock-closed" size={36} color={STEEL} />
        </View>
      </Animated.View>
    </View>
  );
}

function VaultCopyPanel({
  busy,
  note,
  error,
  onSave,
  onRestore,
}: {
  busy: boolean;
  note: string | null;
  error: string | null;
  onSave: () => void;
  onRestore: () => void;
}) {
  return (
    <View style={{ marginTop: 18, gap: 10 }}>
      <Text style={{ fontSize: 12, fontWeight: "800", letterSpacing: 1.2, color: INK }}>
        KEEP IT ON THIS PHONE
      </Text>
      <Text style={{ fontSize: 13, lineHeight: 19, color: "rgba(246,231,220,0.62)" }}>
        There is no cloud backup for the vault. Save a .duoma file, then AirDrop
        it or copy it with a cable onto the new phone. Open the vault there and
        tap Restore from a file. Duoma never uploads that file.
      </Text>
      <Pressable
        onPress={onSave}
        disabled={busy}
        style={[goldBtn(), { marginTop: 4, opacity: busy ? 0.55 : 1 }]}
      >
        <Text style={goldBtnText}>{busy ? "Working…" : "Save a copy on this phone"}</Text>
      </Pressable>
      <Pressable
        onPress={onRestore}
        disabled={busy}
        style={[ghostBtn, { flex: undefined, marginTop: 0, opacity: busy ? 0.55 : 1 }]}
      >
        <Text style={ghostBtnText}>Restore from a file</Text>
      </Pressable>
      {note ? (
        <Text style={{ fontSize: 13, lineHeight: 19, color: gold() }}>{note}</Text>
      ) : null}
      {error ? <Text style={errText}>{error}</Text> : null}
    </View>
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
    <View style={{ alignItems: "center", paddingTop: 8 }}>
      <SafeDial spinning={false} />
      <Text style={{ marginTop: 18, fontFamily: SERIF, fontSize: 32, color: STEEL }}>
        Cut a combination
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: HANDWRITING,
          fontSize: 20,
          color: "rgba(197,208,218,0.68)",
          textAlign: "center",
        }}
      >
        four or six digits, shared
      </Text>
      <Text
        style={{
          marginTop: 12,
          fontSize: 15,
          lineHeight: 22,
          color: "rgba(197,208,218,0.58)",
          textAlign: "center",
        }}
      >
        A grey safe for the two of you. Photos and clips live behind this
        wheel. Use the 0–9 pad — the phone will not offer to save a
        passcode. You can hide one until a time you pick — they still get
        told something is waiting.
      </Text>
      <ComboPad
        value={pinDraft}
        onChange={onDraft}
        accent={STEEL}
        ink={STEEL}
        keyBg="#151C22"
        keyBorder="rgba(197,208,218,0.28)"
      />
      <Text
        style={{
          marginTop: 18,
          fontFamily: HANDWRITING,
          fontSize: 18,
          color: "rgba(197,208,218,0.62)",
        }}
      >
        again
      </Text>
      <ComboPad
        value={pinConfirm}
        onChange={onConfirm}
        accent={STEEL}
        ink={STEEL}
        keyBg="#151C22"
        keyBorder="rgba(197,208,218,0.28)"
      />
      <Pressable onPress={onSave} style={steelBtn()}>
        <Text style={{ color: SAFE, fontWeight: "800", fontSize: 15 }}>
          Set combination
        </Text>
      </Pressable>
      {error ? <Text style={steelErr}>{error}</Text> : null}
    </View>
  );
}

function PinGate({
  gate,
  error,
  onGate,
  onUnlock,
  expectedLength,
}: {
  gate: string;
  error: string | null;
  onGate: (value: string) => void;
  onUnlock: () => void;
  expectedLength?: number;
}) {
  return (
    <View style={{ alignItems: "center", paddingTop: 12 }}>
      <SafeDial />
      <Text style={{ marginTop: 18, fontFamily: SERIF, fontSize: 28, color: STEEL }}>
        Vault
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: HANDWRITING,
          fontSize: 18,
          color: "rgba(197,208,218,0.62)",
        }}
      >
        enter the combination
      </Text>
      <ComboPad
        value={gate}
        onChange={onGate}
        maxLength={expectedLength === 4 ? 4 : 6}
        accent={STEEL}
        ink={STEEL}
        keyBg="#151C22"
        keyBorder="rgba(197,208,218,0.28)"
      />
      <Pressable onPress={onUnlock} style={steelBtn()}>
        <Text style={{ color: SAFE, fontWeight: "800", fontSize: 15 }}>
          Turn the wheel
        </Text>
      </Pressable>
      {error ? <Text style={steelErr}>{error}</Text> : null}
    </View>
  );
}

function VaultHome({
  items,
  userId,
  them,
  now,
  twoCol,
  blurLocked,
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
  copyBusy,
  copyNote,
  onSaveCopy,
  onRestoreCopy,
}: {
  items: SexyVaultItem[];
  userId?: string;
  them: string;
  now: number;
  twoCol: boolean;
  blurLocked: boolean;
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
  copyBusy: boolean;
  copyNote: string | null;
  onSaveCopy: () => void;
  onRestoreCopy: () => void;
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
          <Text style={ghostBtnText}>{changingPin ? "Cancel" : "Change combination"}</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={onSaveCopy}
          disabled={copyBusy}
          style={[ghostBtn, { opacity: copyBusy ? 0.55 : 1 }]}
        >
          <Text style={ghostBtnText}>{copyBusy ? "Working…" : "Save a copy"}</Text>
        </Pressable>
        <Pressable
          onPress={onRestoreCopy}
          disabled={copyBusy}
          style={[ghostBtn, { opacity: copyBusy ? 0.55 : 1 }]}
        >
          <Text style={ghostBtnText}>Restore from a file</Text>
        </Pressable>
      </View>
      <Text
        style={{
          marginTop: 8,
          color: "rgba(246,231,220,0.5)",
          fontSize: 13,
          lineHeight: 18,
        }}
      >
        Stays on this phone. Never uploaded. AirDrop the file or copy it with a
        cable when you change phones.
      </Text>
      {copyNote ? (
        <Text style={{ marginTop: 8, color: gold(), fontSize: 13, lineHeight: 18 }}>
          {copyNote}
        </Text>
      ) : null}
      {changingPin ? (
        <View style={{ marginTop: 12 }}>
          <ComboPad
            value={pinDraft}
            onChange={onDraft}
            accent={gold()}
            ink={gold()}
            keyBg="#1A0C12"
            keyBorder="rgba(228,181,106,0.35)"
          />
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              fontFamily: HANDWRITING,
              fontSize: 18,
              color: ROSE,
            }}
          >
            again
          </Text>
          <ComboPad
            value={pinConfirm}
            onChange={onConfirm}
            accent={gold()}
            ink={gold()}
            keyBg="#1A0C12"
            keyBorder="rgba(228,181,106,0.35)"
          />
          <Pressable onPress={onSavePin} style={goldBtn()}>
            <Text style={goldBtnText}>Save new combination</Text>
          </Pressable>
        </View>
      ) : null}
      {error ? <Text style={errText}>{error}</Text> : null}

      {items.length === 0 ? (
        <Text style={[lede, { marginTop: 28 }]}>
          Empty. Leave {them} something, or wait for them to.
        </Text>
      ) : twoCol ? (
        <View
          style={{
            marginTop: 22,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {items.map((item) => {
            const mine = item.fromId === userId;
            const locked = isSexyVaultLocked(item, userId, now);
            return (
              <Pressable
                key={item.id}
                onPress={() => onOpen(item)}
                onLongPress={mine ? () => onRemove(item.id) : undefined}
                style={{
                  width: "48%",
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: "#1C0C12",
                  borderWidth: 1,
                  borderColor: locked
                    ? "rgba(228,181,106,0.22)"
                    : "rgba(255,107,138,0.28)",
                }}
              >
                <VaultThumb
                  item={item}
                  locked={locked}
                  blurLocked={blurLocked}
                  size={168}
                  square
                />
                <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                  <Text
                    style={{ color: INK, fontWeight: "700", fontSize: 13 }}
                    numberOfLines={1}
                  >
                    {locked
                      ? "Hidden"
                      : mine
                        ? item.kind === "video"
                          ? "Your clip"
                          : "Your photo"
                        : item.kind === "video"
                          ? `${them}’s clip`
                          : `${them}’s photo`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
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
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <VaultThumb
                    item={item}
                    locked={locked}
                    blurLocked={blurLocked}
                    size={88}
                  />
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
  attested,
  error,
  onNote,
  onHide,
  onReveal,
  onAttest,
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
  attested: boolean;
  error: string | null;
  onNote: (value: string) => void;
  onHide: (value: boolean) => void;
  onReveal: (value: string) => void;
  onAttest: (value: boolean) => void;
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
      <Text style={{ marginTop: 8, color: "rgba(246,231,220,0.5)", fontSize: 13 }}>
        Stays in Duoma’s sandbox. Never auto-saved to the Camera Roll.
      </Text>
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
      {pending ? <AdultAttest checked={attested} onChange={onAttest} /> : null}
      <Pressable
        onPress={onLeave}
        disabled={busy || !pending || !attested}
        style={[goldBtn(), { opacity: busy || !pending || !attested ? 0.6 : 1 }]}
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

function useVaultSrc(item: SexyVaultItem | null) {
  const [src, setSrc] = useState<string | null>(item?.uri ?? null);

  useEffect(() => {
    if (!item) {
      setSrc(null);
      return;
    }
    setSrc(item.uri ?? null);
    let dead = false;
    let created: string | null = null;
    void resolveSexyVaultSrc(item).then((url) => {
      if (dead) {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      created = url && url.startsWith("blob:") ? url : null;
      setSrc(url);
    });
    return () => {
      dead = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [item?.id]);

  return src;
}

function VaultThumb({
  item,
  locked,
  blurLocked,
  size,
  square = false,
}: {
  item: SexyVaultItem;
  locked: boolean;
  blurLocked: boolean;
  size: number;
  square?: boolean;
}) {
  const src = useVaultSrc(locked && !blurLocked ? null : item);
  const frost = locked && Boolean(src);
  const box = square
    ? {
        width: "100%" as const,
        aspectRatio: 1,
        borderRadius: 0,
        backgroundColor: "#1A0C12",
        overflow: "hidden" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      }
    : {
        width: size,
        height: size,
        borderRadius: 14,
        backgroundColor: "#1A0C12",
        overflow: "hidden" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      };

  return (
    <View style={box}>
      {src && item.kind === "video" && Platform.OS === "web"
        ? createElement("video", {
            src,
            muted: true,
            playsInline: true,
            preload: "metadata",
            style: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: frost ? "blur(14px)" : undefined,
            },
          })
        : src ? (
            <Image
              source={{ uri: src }}
              style={{
                width: "100%",
                height: "100%",
                opacity: frost ? 0.45 : 1,
              }}
              blurRadius={frost ? 16 : 0}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name={
                locked ? "lock-closed" : item.kind === "video" ? "videocam" : "image"
              }
              size={22}
              color={locked ? gold() : ROSE}
            />
          )}
      {item.kind === "video" && !locked ? (
        <View
          style={{
            position: "absolute",
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "rgba(0,0,0,0.55)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="play" size={14} color={INK} />
        </View>
      ) : null}
      {locked ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: frost ? "rgba(16,6,10,0.28)" : "transparent",
          }}
        >
          <Ionicons name="lock-closed" size={20} color={gold()} />
        </View>
      ) : null}
    </View>
  );
}

function Viewer({
  item,
  album,
  mine,
  them,
  onStep,
  onBack,
  onRemove,
  onReport,
}: {
  item: SexyVaultItem;
  album: SexyVaultItem[];
  mine: boolean;
  them: string;
  onStep: (dir: number) => void;
  onBack: () => void;
  onRemove: () => void;
  onReport: () => void;
}) {
  const src = useVaultSrc(item);
  const [full, setFull] = useState(false);
  const index = album.findIndex((row) => row.id === item.id);
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < album.length - 1;
  const pan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pan.setValue(0);
  }, [item.id, pan]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderMove: Animated.event([null, { dx: pan }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -56 && hasNext) onStep(1);
          else if (gesture.dx > 56 && hasPrev) onStep(-1);
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            useNativeDriver: false,
          }).start();
        },
      }),
    [hasNext, hasPrev, item.id, onStep, pan]
  );

  const frame = (
    <Animated.View
      {...responder.panHandlers}
      style={{ transform: [{ translateX: pan }] }}
    >
      {src ? (
        <Pressable onPress={() => setFull(true)}>
          <MediaPreview kind={item.kind} src={src} tappable={false} />
          {item.kind !== "video" ? (
            <Text
              style={{
                marginTop: 6,
                textAlign: "center",
                color: "rgba(246,231,220,0.5)",
                fontSize: 12,
              }}
            >
              Tap for full screen · swipe for the next
            </Text>
          ) : (
            <Text
              style={{
                marginTop: 6,
                textAlign: "center",
                color: "rgba(246,231,220,0.5)",
                fontSize: 12,
              }}
            >
              Swipe for the next clip
            </Text>
          )}
        </Pressable>
      ) : (
        <Text style={lede}>Finding the file…</Text>
      )}
    </Animated.View>
  );

  return (
    <View>
      <Text style={{ fontFamily: SERIF, fontSize: 28, color: gold() }}>
        {mine ? "You left this" : `From ${them}`}
      </Text>
      {album.length > 1 ? (
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => hasPrev && onStep(-1)}
            disabled={!hasPrev}
            hitSlop={10}
            style={{ opacity: hasPrev ? 1 : 0.25, padding: 6 }}
          >
            <Ionicons name="chevron-back" size={22} color={gold()} />
          </Pressable>
          <Text style={{ color: "rgba(246,231,220,0.6)", fontSize: 13 }}>
            {index + 1} of {album.length}
          </Text>
          <Pressable
            onPress={() => hasNext && onStep(1)}
            disabled={!hasNext}
            hitSlop={10}
            style={{ opacity: hasNext ? 1 : 0.25, padding: 6 }}
          >
            <Ionicons name="chevron-forward" size={22} color={gold()} />
          </Pressable>
        </View>
      ) : null}
      {frame}
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
      <View style={{ marginTop: 12, alignItems: "flex-start" }}>
        <ReportTextButton onPress={onReport} />
      </View>
      {mine ? (
        <Pressable onPress={onRemove} style={[ghostBtn, { marginTop: 10 }]}>
          <Text style={ghostBtnText}>Remove</Text>
        </Pressable>
      ) : null}

      <Modal visible={full} transparent animationType="fade" onRequestClose={() => setFull(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.94)" }}>
          <Animated.View
            {...responder.panHandlers}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              transform: [{ translateX: pan }],
            }}
          >
            <Pressable
              onPress={() => setFull(false)}
              style={{ width: "100%", flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              {src && item.kind === "video" && Platform.OS === "web"
                ? createElement("video", {
                    src,
                    controls: true,
                    autoPlay: true,
                    playsInline: true,
                    style: {
                      width: "100%",
                      maxHeight: "82%",
                      backgroundColor: "#000",
                    },
                  })
                : src ? (
                    <Image
                      source={{ uri: src }}
                      style={{ width: "100%", height: "82%" }}
                      resizeMode="contain"
                    />
                  ) : null}
            </Pressable>
            {album.length > 1 ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  paddingHorizontal: 8,
                }}
              >
                <Pressable
                  onPress={() => hasPrev && onStep(-1)}
                  disabled={!hasPrev}
                  hitSlop={12}
                  style={{ opacity: hasPrev ? 1 : 0.25, padding: 8 }}
                >
                  <Ionicons name="chevron-back" size={28} color="#F6E7DC" />
                </Pressable>
                <Text style={{ color: "rgba(246,231,220,0.7)", fontSize: 13 }}>
                  {index + 1} of {album.length} · swipe or tap to close
                </Text>
                <Pressable
                  onPress={() => hasNext && onStep(1)}
                  disabled={!hasNext}
                  hitSlop={12}
                  style={{ opacity: hasNext ? 1 : 0.25, padding: 8 }}
                >
                  <Ionicons name="chevron-forward" size={28} color="#F6E7DC" />
                </Pressable>
              </View>
            ) : (
              <Text style={{ color: "rgba(246,231,220,0.7)", fontSize: 13 }}>
                Tap to close
              </Text>
            )}
          </Animated.View>
        </View>
      </Modal>
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

const steelBtn = () => ({
  marginTop: 16,
  height: 52,
  width: "100%" as const,
  borderRadius: 16,
  backgroundColor: STEEL,
  alignItems: "center" as const,
  justifyContent: "center" as const,
});

const steelErr = { marginTop: 10, color: "#FF8A8A", textAlign: "center" as const };

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
