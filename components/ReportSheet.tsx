import {
  REPORT_CONFIRM,
  REPORT_REASONS,
  type ContentReport,
  type ReportReasonId,
} from "@/lib/reports";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

export function ReportSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { reason: ReportReasonId; details: string }) => Promise<void> | void;
}) {
  const [reason, setReason] = useState<ReportReasonId>("non-consensual");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setReason("non-consensual");
    setDetails("");
    setBusy(false);
    setDone(false);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ reason, details });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that report.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(8,6,10,0.78)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 380,
            borderRadius: 22,
            backgroundColor: "#161018",
            borderWidth: 1,
            borderColor: "rgba(255,0,127,0.35)",
            padding: 22,
          }}
        >
          {done ? (
            <>
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#F6EDE4" }}>
                Report sent
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 15,
                  lineHeight: 22,
                  color: "rgba(246,237,228,0.72)",
                }}
              >
                {REPORT_CONFIRM}
              </Text>
              <Pressable
                onPress={close}
                style={{
                  marginTop: 20,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "#FF007F",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "800", color: "#1A1008" }}>OK</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#F6EDE4" }}>
                Report content / abuse
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 20,
                  color: "rgba(246,237,228,0.62)",
                }}
              >
                This goes to the people who run Duoma, not your partner. Illegal
                sexual content involving anyone under 18 is a zero-tolerance report.
              </Text>
              <View style={{ marginTop: 14, gap: 8 }}>
                {REPORT_REASONS.map((row) => {
                  const on = reason === row.id;
                  return (
                    <Pressable
                      key={row.id}
                      onPress={() => setReason(row.id)}
                      style={{
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: on ? "#FF007F" : "rgba(255,255,255,0.12)",
                        backgroundColor: on ? "rgba(255,0,127,0.12)" : "transparent",
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Text style={{ color: "#F6EDE4", fontWeight: "700", fontSize: 14 }}>
                        {row.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Optional detail"
                placeholderTextColor="rgba(246,237,228,0.32)"
                multiline
                style={{
                  marginTop: 12,
                  minHeight: 72,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                  padding: 12,
                  color: "#F6EDE4",
                  textAlignVertical: "top",
                }}
              />
              {error ? (
                <Text style={{ marginTop: 8, color: "#FF6B7A", fontSize: 13 }}>{error}</Text>
              ) : null}
              <View style={{ marginTop: 16, gap: 8 }}>
                <Pressable
                  onPress={() => void send()}
                  disabled={busy}
                  style={{
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: "#FF007F",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: busy ? 0.5 : 1,
                  }}
                >
                  <Text style={{ fontWeight: "800", color: "#1A1008" }}>
                    {busy ? "Sending…" : "Send report"}
                  </Text>
                </Pressable>
                <Pressable onPress={close} style={{ height: 44, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "rgba(246,237,228,0.65)", fontWeight: "700" }}>Cancel</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export function ReportTextButton({
  label = "Report",
  onPress,
}: {
  label?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityLabel="Report content">
      <Text style={{ color: "#FF6B7A", fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export type { ContentReport };
