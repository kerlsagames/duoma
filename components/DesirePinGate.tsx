import { ComboPad } from "@/components/ui/ComboPad";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import {
  desireVisitUnlocked,
  isDesireRoute,
  lockDesireVisit,
  markDesireUnlocked,
  subscribeDesireUnlock,
} from "@/lib/desire-pin";
import { useMiniApps } from "@/lib/mini-apps";
import { isVaultPin, vaultPinHint } from "@/lib/vault-pin";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const PINK = "#FF4D6A";
const INK = "#F6E7DC";
const BG = "#14060A";

export function DesirePinGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, ready } = useMiniApps();
  const [unlocked, setUnlocked] = useState(desireVisitUnlocked);
  const [gate, setGate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const onDesire = isDesireRoute(pathname);
  const locked = Boolean(ready && data.desirePinOn && data.desirePin);

  useEffect(() => subscribeDesireUnlock(() => setUnlocked(desireVisitUnlocked())), []);

  useEffect(() => {
    if (!onDesire) {
      lockDesireVisit();
      setGate("");
      setError(null);
    }
  }, [onDesire]);

  const unlock = (next = gate) => {
    if (next === data.desirePin) {
      markDesireUnlocked();
      setError(null);
      setGate("");
      return;
    }
    if (data.desirePin && next.length >= data.desirePin.length) {
      setError("The tumblers didn’t like that.");
      setGate("");
      return;
    }
    setGate(next);
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      {onDesire && locked && !unlocked ? (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        backgroundColor: BG,
        paddingHorizontal: 22,
        paddingTop: 28,
      }}
    >
      <Pressable
        onPress={() => router.replace("/")}
        hitSlop={10}
        style={{ alignSelf: "flex-start", marginBottom: 18 }}
      >
        <Text style={{ color: PINK, fontWeight: "700", fontSize: 15 }}>← Home</Text>
      </Pressable>
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            backgroundColor: "rgba(255,77,106,0.18)",
            borderWidth: 1,
            borderColor: "rgba(255,77,106,0.4)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="lock-closed" size={28} color={PINK} />
        </View>
        <Text style={{ marginTop: 18, fontFamily: SERIF, fontSize: 30, color: INK }}>
          Desire
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: "rgba(246,231,220,0.65)",
          }}
        >
          enter the combination
        </Text>
        <ComboPad
          value={gate}
          onChange={(value) => unlock(value)}
          maxLength={data.desirePin.length === 4 ? 4 : 6}
          accent={PINK}
          ink={INK}
          keyBg="#1A0A10"
          keyBorder="rgba(255,77,106,0.28)"
        />
        <Pressable
          onPress={() => unlock()}
          style={{
            marginTop: 18,
            height: 48,
            minWidth: 200,
            paddingHorizontal: 22,
            borderRadius: 16,
            backgroundColor: PINK,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A0508", fontWeight: "800", fontSize: 15 }}>
            Turn the wheel
          </Text>
        </Pressable>
        {error ? (
          <Text style={{ marginTop: 12, color: "#FF6B7A", textAlign: "center" }}>{error}</Text>
        ) : (
          <Text
            style={{
              marginTop: 14,
              textAlign: "center",
              color: "rgba(246,231,220,0.5)",
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            Shared pin for this Desire hub. Forgot it? Both of you reset it in Home settings.
          </Text>
        )}
      </View>
    </View>
      ) : null}
    </View>
  );
}

export function DesirePinSettings() {
  const { data, patch } = useMiniApps();
  const [draft, setDraft] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const on = Boolean(data.desirePinOn);
  const needsSetup = data.desirePinOn && !data.desirePin;

  const savePin = async () => {
    if (draft !== confirm) {
      setError("Those pins don’t match.");
      return;
    }
    if (!isVaultPin(draft)) {
      setError(vaultPinHint());
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      desirePin: draft,
      desirePinOn: true,
      desirePinResetVotes: [],
    }));
    markDesireUnlocked();
    setDraft("");
    setConfirm("");
  };

  const toggle = async () => {
    setError(null);
    if (on) {
      await patch((state) => ({ ...state, desirePinOn: false }));
      markDesireUnlocked();
      return;
    }
    if (data.desirePin) {
      await patch((state) => ({ ...state, desirePinOn: true }));
      markDesireUnlocked();
      return;
    }
    await patch((state) => ({ ...state, desirePinOn: true }));
  };

  return (
    <View
      style={{
        marginBottom: 20,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: "#1A1A22",
        borderWidth: 1,
        borderColor: on || needsSetup ? "rgba(255,77,106,0.45)" : "rgba(255,255,255,0.08)",
      }}
    >
      <Pressable
        onPress={() => void toggle()}
        style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
      >
        <Ionicons
          name={on ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={on ? "#FF4D6A" : "rgba(244,244,246,0.35)"}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#F4F4F6" }}>
            Lock Desire with a pin
          </Text>
          <Text style={{ marginTop: 3, fontSize: 13, color: "rgba(244,244,246,0.5)" }}>
            When you tap Desire, a combination screen opens first — same idea as
            the Sexy Vault. Shared four or six digits.
          </Text>
        </View>
      </Pressable>

      {needsSetup || (on && !data.desirePin) ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: "rgba(244,244,246,0.7)", fontSize: 13, marginBottom: 4 }}>
            Set the combination
          </Text>
          <ComboPad
            value={draft}
            onChange={setDraft}
            accent="#FF4D6A"
            ink="#F4F4F6"
            keyBg="#12080C"
            keyBorder="rgba(255,77,106,0.28)"
          />
          <Text
            style={{
              marginTop: 10,
              color: "rgba(244,244,246,0.55)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            again
          </Text>
          <ComboPad
            value={confirm}
            onChange={setConfirm}
            accent="#FF4D6A"
            ink="#F4F4F6"
            keyBg="#12080C"
            keyBorder="rgba(255,77,106,0.28)"
          />
          <Pressable
            onPress={() => void savePin()}
            style={{
              marginTop: 12,
              height: 44,
              borderRadius: 14,
              backgroundColor: "#FF4D6A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#1A0508", fontWeight: "800" }}>Set Desire pin</Text>
          </Pressable>
          {error ? (
            <Text style={{ marginTop: 8, color: "#FF6B7A", fontSize: 13 }}>{error}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
