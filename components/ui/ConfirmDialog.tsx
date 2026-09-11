import { Modal, Pressable, Text, View } from "react-native";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Remove",
  cancelLabel = "Keep it",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
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
          maxWidth: 360,
          borderRadius: 22,
          backgroundColor: "#221810",
          borderWidth: 1,
          borderColor: "rgba(242,92,58,0.35)",
          padding: 22,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#F6EDE4",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontSize: 15,
            lineHeight: 22,
            color: "rgba(246,237,228,0.72)",
          }}
        >
          {body}
        </Text>
        <View style={{ marginTop: 20, gap: 10 }}>
          <Pressable
            onPress={onConfirm}
            style={{
              height: 48,
              borderRadius: 14,
              backgroundColor: "#F25C3A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontWeight: "800", color: "#1A1008" }}>
              {confirmLabel}
            </Text>
          </Pressable>
          <Pressable
            onPress={onCancel}
            style={{
              height: 48,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.16)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontWeight: "700", color: "#F6EDE4" }}>
              {cancelLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
    </Modal>
  );
}
