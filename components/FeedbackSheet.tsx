import { SERIF } from "@/lib/app-themes";
import { FEEDBACK_PROMPT } from "@/lib/feedback";
import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export function FeedbackSheet({
  open,
  source,
  onClose,
}: {
  open: boolean;
  source: string;
  onClose: () => void;
}) {
  const { sendFeedback } = useApp();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBody("");
    setError(null);
    setFlash(null);
    setSending(false);
  }, [open, source]);

  const send = async () => {
    setSending(true);
    setError(null);
    setFlash(null);
    try {
      await sendFeedback(body, source);
      setBody("");
      setFlash("Sent. Duoma Admin will see it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(8,8,12,0.72)",
          justifyContent: "center",
          paddingHorizontal: 18,
        }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation?.()}
          style={{
            borderRadius: 22,
            backgroundColor: "#14141A",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
            padding: 18,
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: "#FF007F",
            }}
          >
            Duoma Admin
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 16,
              lineHeight: 24,
              color: "rgba(244,244,246,0.78)",
            }}
          >
            {FEEDBACK_PROMPT}
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write it here."
            placeholderTextColor="rgba(244,244,246,0.35)"
            multiline
            style={{
              marginTop: 14,
              minHeight: 140,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              backgroundColor: "#1A1A22",
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: "#F4F4F6",
              fontSize: 16,
              lineHeight: 22,
              textAlignVertical: "top",
            }}
          />
          {error ? (
            <Text style={{ marginTop: 10, color: "#FF8A8A", fontSize: 13 }}>{error}</Text>
          ) : null}
          {flash ? (
            <Text style={{ marginTop: 10, color: "#7CFFB2", fontSize: 13 }}>{flash}</Text>
          ) : null}
          <View style={{ marginTop: 14, flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Text style={{ color: "#F4F4F6", fontWeight: "700" }}>Close</Text>
            </Pressable>
            <Pressable
              onPress={() => void send()}
              disabled={sending}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FF007F",
                opacity: sending ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {sending ? "Sending…" : "Send"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
