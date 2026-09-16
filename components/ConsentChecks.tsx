import {
  AGE_PRIVACY_CONSENT_LABEL,
  PRIVACY_NOTICE,
  TERMS_OF_USE,
} from "@/lib/legal";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  agreed: boolean;
  onAgreed: (value: boolean) => void;
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

export function ConsentChecks({ agreed, onAgreed }: Props) {
  const router = useRouter();
  const [which, setWhich] = useState<"terms" | "privacy" | null>(null);

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
      <Box
        checked={agreed}
        label={AGE_PRIVACY_CONSENT_LABEL}
        onPress={() => onAgreed(!agreed)}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
        <Pressable onPress={() => setWhich(which === "terms" ? null : "terms")}>
          <Text style={{ color: "#FF007F", fontSize: 13, fontWeight: "700" }}>
            {which === "terms" ? "Hide Terms" : "Read Terms of Use"}
          </Text>
        </Pressable>
        <Pressable onPress={() => setWhich(which === "privacy" ? null : "privacy")}>
          <Text style={{ color: "#FF007F", fontSize: 13, fontWeight: "700" }}>
            {which === "privacy" ? "Hide Privacy" : "Read Privacy Policy"}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push("/legal")}>
          <Text style={{ color: "#FF007F", fontSize: 13, fontWeight: "700" }}>Full page</Text>
        </Pressable>
      </View>
      {which ? (
        <Text
          style={{
            marginTop: 10,
            color: "rgba(244,244,246,0.62)",
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          {which === "terms" ? TERMS_OF_USE : PRIVACY_NOTICE}
        </Text>
      ) : null}
    </View>
  );
}
