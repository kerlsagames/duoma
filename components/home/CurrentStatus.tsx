import { buildHomeNotifications, gameResumeHref } from "@/lib/home-status";
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
    bucketItems,
    talkDraws,
    scratches,
  } = useApp();

  const rows = buildHomeNotifications({
    user,
    partner,
    game,
    checkIns,
    incomingCheckInRequest,
    coupons,
    jarNotes,
    curiosityAnswers,
    milestones,
    bucketItems,
    talkDraws,
    scratches,
  });

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
    <View className="mt-5">
      <Text className="text-[12px] font-semibold uppercase tracking-[3px] text-neon">
        Notifications
      </Text>
      {rows.length === 0 ? (
        <Text className="mt-3 text-[14px] leading-5 text-mist/50">
          Quiet for now. The next happening lands here.
        </Text>
      ) : (
        <View className="mt-3 overflow-hidden rounded-2xl border border-neon/30 bg-neon/10">
          {rows.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.id === "game" || item.id.startsWith("game")) {
                  openGame();
                  return;
                }
                router.push(item.href as Href);
              }}
              className={`flex-row items-center gap-3 px-3 py-3 ${
                index === rows.length - 1 ? "" : "border-b border-white/10"
              }`}
            >
              <Text
                className="flex-1 text-[14px] font-semibold leading-5 text-mist"
                numberOfLines={2}
              >
                {item.line}
              </Text>
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-neon/80">
                {item.when}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
