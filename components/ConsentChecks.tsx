import {
  AGE_CONSENT_LABEL,
  PRIVACY_CONSENT_LABEL,
  PRIVACY_NOTICE,
} from "@/lib/legal";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  over18: boolean;
  privacy: boolean;
  onOver18: (value: boolean) => void;
  onPrivacy: (value: boolean) => void;
};

function Box({
  checked,
  label,
  onPress,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 12 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: checked ? "#FF007F" : "rgba(244,244,246,0.35)",
          backgroundColor: checked ? "#FF007F" : "transparent",
          marginTop: 1,
        }}
      />
      <Text style={{ flex: 1, color: "#F4F4F6", fontSize: 14, lineHeight: 20 }}>{label}</Text>
    </Pressable>
  );
}

export function ConsentChecks({ over18, privacy, onOver18, onPrivacy }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 2,
          color: "rgba(244,244,246,0.45)",
        }}
      >
        LEGAL
      </Text>
      <Box checked={over18} label={AGE_CONSENT_LABEL} onPress={() => onOver18(!over18)} />
      <Box checked={privacy} label={PRIVACY_CONSENT_LABEL} onPress={() => onPrivacy(!privacy)} />
      <Pressable onPress={() => setOpen((value) => !value)} style={{ marginTop: 10 }}>
        <Text style={{ color: "#FF007F", fontSize: 13, fontWeight: "700" }}>
          {open ? "Hide the notice" : "Read the privacy notice"}
        </Text>
      </Pressable>
      {open ? (
        <Text
          style={{
            marginTop: 10,
            color: "rgba(244,244,246,0.62)",
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          {PRIVACY_NOTICE}
        </Text>
      ) : null}
    </View>
  );
}
