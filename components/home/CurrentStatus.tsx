import { buildHomeAlerts, gameResumeHref } from "@/lib/home-status";
import { useApp } from "@/lib/store";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function CurrentStatus({
  onStartSpicy,
}: {
  onStartSpicy: () => void;
}) {
  const router = useRouter();
  const {
    user,
    partner,
    game,
    checkIns,
    incomingCheckInRequest,
    coupons,
    jarNotes,
    curiosityAnswers,
    milestones,
  } = useApp();

  const rows = buildHomeAlerts({
    user,
    partner,
    game,
    checkIns,
    incomingCheckInRequest,
    coupons,
    jarNotes,
    curiosityAnswers,
    milestones,
  });

  if (rows.length === 0) return null;

  const openGame = () => {
    const href = gameResumeHref(game);
    if (href) {
      router.push(href);
      return;
    }
    if (game?.status === "inviting") return;
    onStartSpicy();
  };

  return (
    <View className="mb-2 overflow-hidden rounded-2xl border border-neon/30 bg-neon/10">
      {rows.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => {
            if (item.id === "game") {
              openGame();
              return;
            }
            router.push(item.href as Href);
          }}
          className={`px-3 py-2 ${index === rows.length - 1 ? "" : "border-b border-white/10"}`}
        >
          <Text className="text-[13px] font-semibold leading-4 text-mist" numberOfLines={1}>
            {item.line}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
