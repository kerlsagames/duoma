import { FoilScratch } from "@/components/hub/FoilScratch";
import { HubScreen } from "@/components/hub/HubScreen";
import { useApp } from "@/lib/store";
import type { ScratchKind } from "@/lib/types";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const KINDS: { id: ScratchKind; label: string; foil: string }[] = [
  { id: "date", label: "Date night", foil: "Where are we going?" },
  { id: "evening", label: "Low-prep evening", foil: "Stay in, still a plan" },
  { id: "dare", label: "Playful dare", foil: "Do this in the next hour" },
];

export default function ScratchScreen() {
  const { scratchCard, scratches } = useApp();
  const [kind, setKind] = useState<ScratchKind>("date");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const current = scratches.find((row) => row.id === currentId) ?? null;
  const recent = [...scratches].reverse().slice(0, 6);

  const start = async () => {
    setReady(false);
    const row = await scratchCard(kind);
    setCurrentId(row?.id ?? null);
  };

  const meta = KINDS.find((item) => item.id === kind)!;

  return (
    <HubScreen
      kicker="Scratch-offs"
      title="Break the foil"
      body="Quick date nights, low-prep evenings, or a dare. Tap through the foil. No debate until it's showing."
    >
      <View className="flex-row flex-wrap gap-2">
        {KINDS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              setKind(item.id);
              setCurrentId(null);
              setReady(false);
            }}
            className={`rounded-full px-3 py-2 ${
              kind === item.id ? "bg-neon" : "bg-white/10"
            }`}
          >
            <Text
              className={`text-[12px] font-semibold ${
                kind === item.id ? "text-night" : "text-mist/70"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-5">
        {current ? (
          <FoilScratch
            key={current.id}
            foilLabel={meta.foil}
            revealed={ready}
            title={current.title}
            body={current.body}
            onReveal={() => setReady(true)}
          />
        ) : (
          <Pressable
            onPress={() => void start()}
            className="min-h-[180px] items-center justify-center rounded-[28px] border border-dashed border-white/20"
          >
            <Text className="text-[16px] font-semibold text-mist">
              Draw a {meta.label.toLowerCase()} card
            </Text>
          </Pressable>
        )}
      </View>

      {current && ready ? (
        <Pressable onPress={() => void start()} className="mt-4">
          <Text className="text-center text-[14px] font-semibold text-neon">
            Scratch another
          </Text>
        </Pressable>
      ) : null}

      {recent.length ? (
        <View className="mt-8">
          <Text className="text-[12px] uppercase tracking-widest text-mist/40">
            Recent reveals
          </Text>
          {recent.map((row) => (
            <Text key={row.id} className="mt-2 text-[14px] text-mist/70">
              {row.kind} · {row.title}
            </Text>
          ))}
        </View>
      ) : null}
    </HubScreen>
  );
}
