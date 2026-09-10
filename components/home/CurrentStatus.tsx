import {
  buildGameStatus,
  buildMoodStatus,
  buildTodoStatus,
  gameResumeHref,
  type StatusItem,
} from "@/lib/home-status";
import { useApp } from "@/lib/store";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

function StatusRow({
  item,
  onPress,
  last,
}: {
  item: StatusItem;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3.5 ${last ? "" : "border-b border-white/10"}`}
    >
      <Text className="text-[11px] font-bold uppercase tracking-[2px] text-neon">
        {item.kicker}
      </Text>
      <Text className="mt-1 text-[17px] font-bold text-mist">{item.title}</Text>
      <Text className="mt-0.5 text-[13px] leading-5 text-mist/65" numberOfLines={2}>
        {item.detail}
      </Text>
    </Pressable>
  );
}

export function CurrentStatus({
  onStartSpicy,
}: {
  onStartSpicy: () => void;
}) {
  const router = useRouter();
  const {
    user,
    partner,
    couple,
    game,
    checkIns,
    coupons,
    jarNotes,
    curiosityAnswers,
    milestones,
  } = useApp();

  const mood = buildMoodStatus({ user, partner, checkIns });
  const spicy = buildGameStatus({ game, user, partner });
  const todos = buildTodoStatus({
    user,
    partner,
    coupons,
    jarNotes,
    curiosityAnswers,
    milestones,
  });

  const paired = Boolean(couple?.partnerB && partner);
  const pairLine = paired
    ? `${user?.displayName ?? "You"} × ${partner?.displayName}`
    : couple
      ? `Code ${couple.inviteCode} · waiting to pair`
      : "Pair up to share a live status.";

  const openGame = () => {
    const href = gameResumeHref(game);
    if (href) {
      router.push(href);
      return;
    }
    if (game?.status === "inviting") return;
    onStartSpicy();
  };

  const open = (href: Href) => router.push(href);

  const rows: { item: StatusItem; onPress: () => void }[] = [
    { item: mood, onPress: () => open(mood.href) },
    { item: spicy, onPress: openGame },
    ...todos.map((item) => ({ item, onPress: () => open(item.href) })),
  ];

  return (
    <View className="mb-5 overflow-hidden rounded-[24px] border border-neon/35 bg-neon/10">
      <View className="border-b border-white/10 px-4 py-3">
        <View className="flex-row items-center">
          <View
            className={`mr-2 h-2.5 w-2.5 rounded-full ${paired ? "bg-neon" : "bg-crimson"}`}
          />
          <Text className="text-[11px] font-bold uppercase tracking-[3px] text-neon">
            Now
          </Text>
        </View>
        <Text className="mt-1 text-[15px] font-semibold text-mist">{pairLine}</Text>
      </View>
      {rows.map((row, index) => (
        <StatusRow
          key={row.item.id}
          item={row.item}
          onPress={row.onPress}
          last={index === rows.length - 1}
        />
      ))}
    </View>
  );
}
