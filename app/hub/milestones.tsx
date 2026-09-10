import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { daysUntil, formatLongDate } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { MilestoneKind } from "@/lib/types";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const KINDS: MilestoneKind[] = ["anniversary", "date", "trip", "other"];

export default function MilestonesScreen() {
  const { milestones, addMilestone, removeMilestone } = useApp();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<MilestoneKind>("date");
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    try {
      await addMilestone({ title, kind, date });
      setTitle("");
      setDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <HubScreen
      kicker="Shared countdowns"
      title="What you're counting to"
      body="Anniversaries, getaways, date nights. They show as widgets on Us. Home-screen widgets come later — the countdown is already shared."
    >
      <View className="gap-3">
        {milestones.length === 0 ? (
          <Text className="text-[15px] text-mist/60">
            Nothing on the clock yet. Add the next thing that matters.
          </Text>
        ) : (
          milestones.map((item) => {
            const days = daysUntil(item.date);
            return (
              <View
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <Text className="text-[12px] uppercase tracking-widest text-crimson">
                  {item.kind} ·{" "}
                  {days < 0
                    ? `${Math.abs(days)} days ago`
                    : days === 0
                      ? "today"
                      : `${days} days`}
                </Text>
                <Text className="mt-1 text-[18px] font-semibold text-mist">
                  {item.title}
                </Text>
                <Text className="mt-1 text-[13px] text-mist/50">
                  {formatLongDate(item.date)}
                </Text>
                <Pressable onPress={() => void removeMilestone(item.id)}>
                  <Text className="mt-3 text-[13px] text-mist/40">Remove</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <Text className="mt-8 text-[12px] uppercase tracking-widest text-mist/40">
        Add a countdown
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Weekend getaway"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <View className="mt-3 flex-row flex-wrap gap-2">
        {KINDS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setKind(item)}
            className={`rounded-full px-3 py-2 ${
              kind === item ? "bg-neon" : "bg-white/10"
            }`}
          >
            <Text
              className={`text-[12px] font-semibold ${
                kind === item ? "text-night" : "text-mist/70"
              }`}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}
      <View className="mt-4">
        <PrimaryButton label="Save countdown" onPress={() => void save()} />
      </View>
    </HubScreen>
  );
}
