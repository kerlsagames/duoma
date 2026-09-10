import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useApp } from "@/lib/store";
import { useRouter } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";

export function GameInvitationModal() {
  const router = useRouter();
  const { incomingInvite, acceptInvite, declineInvite, user } = useApp();
  const visible = Boolean(incomingInvite && user);

  const accept = async () => {
    await acceptInvite();
    router.push("/game/setup");
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/80 px-6">
        <View className="w-full max-w-[400px] rounded-[28px] border border-neon/40 bg-night p-6">
          <Text className="text-center text-[12px] font-semibold uppercase tracking-[3px] text-neon">
            Incoming
          </Text>
          <Text className="mt-3 text-center text-[28px] font-bold text-mist">
            The Spicy Game. Tonight?
          </Text>
          <Text className="mt-3 text-center text-[15px] leading-6 text-mist/70">
            Your partner sent tonight's game — not a new pair code. Accept to
            pick a mode, or decline and stay as you are.
          </Text>
          <View className="mt-6 gap-3">
            <PrimaryButton label="Accept" onPress={() => void accept()} />
            <PrimaryButton
              label="Decline"
              tone="ghost"
              onPress={() => void declineInvite()}
            />
          </View>
          <Pressable className="mt-4 items-center" onPress={() => void declineInvite()}>
            <Text className="text-[12px] text-mist/40">Not tonight</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
