import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useApp } from "@/lib/store";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Share, Text, View } from "react-native";

export function HomeConnectButton() {
  const { couple, partner, demoMode } = useApp();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (demoMode || !couple || couple.partnerB || partner) return null;

  const share = async () => {
    const message = `Join me on Duoma — the couples app. My invite code is ${couple.inviteCode}`;
    try {
      await Share.share({ message });
    } catch {
      await Clipboard.setStringAsync(couple.inviteCode);
      setCopied(true);
    }
  };

  const copy = async () => {
    await Clipboard.setStringAsync(couple.inviteCode);
    setCopied(true);
  };

  if (!open) {
    return (
      <View style={{ marginBottom: 16 }}>
        <PrimaryButton label="Connect" onPress={() => setOpen(true)} />
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            color: "rgba(244,244,246,0.5)",
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          Send them the pair code. This button leaves when they join.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        marginBottom: 16,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,0,127,0.4)",
        backgroundColor: "rgba(255,0,127,0.08)",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(244,244,246,0.45)",
          textAlign: "center",
        }}
      >
        Pair code
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: "SpaceMono",
          fontSize: 36,
          letterSpacing: 8,
          fontWeight: "700",
          color: "#F4F4F6",
          textAlign: "center",
        }}
      >
        {couple.inviteCode}
      </Text>
      <Text
        style={{
          marginTop: 8,
          textAlign: "center",
          color: "rgba(244,244,246,0.6)",
          fontSize: 13,
          lineHeight: 18,
        }}
      >
        They tap I have a code, enter this, then type the 6-digit email code.
      </Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        <PrimaryButton label="Send the code" onPress={() => void share()} />
        <PrimaryButton
          label={copied ? "Copied" : "Copy code"}
          tone="ghost"
          onPress={() => void copy()}
        />
        <PrimaryButton label="Hide" tone="ghost" onPress={() => setOpen(false)} />
      </View>
    </View>
  );
}
