import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TALK_PACKS, type TalkPackId } from "@/lib/talk";
import { useApp } from "@/lib/store";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function TalkScreen() {
  const { partner } = useApp();
  const [packId, setPackId] = useState<TalkPackId>("heat");
  const pack = TALK_PACKS.find((item) => item.id === packId) ?? TALK_PACKS[0];
  const [index, setIndex] = useState(0);
  const prompt = pack.prompts[index % pack.prompts.length];
  const who = partner?.displayName ?? "them";

  const hint = useMemo(() => {
    if (packId === "heat") return `Ask ${who}. Stay in it. No scrolling away.`;
    if (packId === "dare") return `One honest answer. No performing.`;
    return `Same question, both of you. Then keep going.`;
  }, [packId, who]);

  return (
    <HubScreen
      kicker="Talk to me"
      title="Put the phones face-up."
      body="Pick a pack. Read it out loud. The point is the look you give each other after."
    >
      <View className="flex-row gap-2">
        {TALK_PACKS.map((item) => {
          const on = item.id === packId;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setPackId(item.id);
                setIndex(0);
              }}
              className={`flex-1 rounded-2xl py-3 ${on ? "bg-neon" : "bg-white/10"}`}
            >
              <Text
                className={`text-center text-[13px] font-bold ${
                  on ? "text-night" : "text-mist/70"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-5 rounded-[28px] border border-neon/40 bg-neon/10 p-6">
        <Text className="text-[12px] font-bold uppercase tracking-[3px] text-neon">
          {pack.label} · {index + 1}/{pack.prompts.length}
        </Text>
        <Text className="mt-4 text-[26px] font-bold leading-8 text-mist">
          {prompt}
        </Text>
        <Text className="mt-4 text-[14px] leading-6 text-mist/70">{hint}</Text>
      </View>

      <View className="mt-5">
        <PrimaryButton
          label="Next spark"
          onPress={() => setIndex((value) => value + 1)}
        />
      </View>
    </HubScreen>
  );
}
