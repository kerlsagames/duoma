import { useApp } from "@/lib/store";
import { Text, View } from "react-native";

export function PartnerConnectionBanner() {
  const { couple, partner, user } = useApp();

  if (!couple) return null;

  const paired = Boolean(couple.partnerB && partner);

  return (
    <View className="mb-5 flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <View
        className={`mr-3 h-2.5 w-2.5 rounded-full ${paired ? "bg-neon" : "bg-crimson/70"}`}
      />
      <View className="flex-1">
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-mist/50">
          {paired ? "Live connection" : "Waiting to pair"}
        </Text>
        <Text className="mt-0.5 text-[15px] font-semibold text-mist">
          {paired
            ? `${user?.displayName ?? "You"} × ${partner?.displayName}`
            : `Code ${couple.inviteCode} · share to connect`}
        </Text>
      </View>
    </View>
  );
}
