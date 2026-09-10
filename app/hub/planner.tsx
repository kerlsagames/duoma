import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { formatLongDate } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { BucketKind } from "@/lib/types";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const KINDS: BucketKind[] = ["place", "meal", "trip", "other"];

export default function PlannerScreen() {
  const { bucketItems, addBucketItem, spinDateNight, markBucketDone } = useApp();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<BucketKind>("place");
  const [notes, setNotes] = useState("");
  const [scheduledOn, setScheduledOn] = useState("");
  const [spunId, setSpunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const open = bucketItems.filter((row) => !row.doneAt);
  const done = bucketItems.filter((row) => row.doneAt);

  const save = async () => {
    setError(null);
    try {
      await addBucketItem({
        title,
        kind,
        notes,
        scheduledOn: scheduledOn || null,
      });
      setTitle("");
      setNotes("");
      setScheduledOn("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  const spin = async () => {
    const item = await spinDateNight();
    setSpunId(item?.id ?? null);
  };

  return (
    <HubScreen
      kicker="Date night planner"
      title="Bucket list + spin"
      body="Bookmark places, meals, trips. When indecision hits, spin. The pick lands on the shared calendar if it didn't already have a day."
    >
      <PrimaryButton label="Spin for date night" onPress={() => void spin()} />
      {spunId ? (
        <View className="mt-4 rounded-[28px] border border-neon/40 bg-neon/10 p-5">
          <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
            Tonight's spin
          </Text>
          <Text className="mt-2 text-[22px] font-bold text-mist">
            {bucketItems.find((row) => row.id === spunId)?.title}
          </Text>
        </View>
      ) : null}

      <View className="mt-6 gap-3">
        {open.length === 0 ? (
          <Text className="text-[15px] text-mist/60">
            The list is empty. Add the next place, meal, or trip.
          </Text>
        ) : (
          open.map((item) => (
            <View
              key={item.id}
              className={`rounded-3xl border p-4 ${
                item.id === spunId
                  ? "border-neon bg-neon/15"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <Text className="text-[12px] uppercase tracking-widest text-crimson">
                {item.kind}
                {item.scheduledOn ? ` · ${formatLongDate(item.scheduledOn)}` : ""}
              </Text>
              <Text className="mt-1 text-[17px] font-semibold text-mist">
                {item.title}
              </Text>
              {item.notes ? (
                <Text className="mt-1 text-[14px] text-mist/60">{item.notes}</Text>
              ) : null}
              <Pressable onPress={() => void markBucketDone(item.id)}>
                <Text className="mt-3 text-[13px] text-neon">Mark done</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Text className="mt-8 text-[12px] uppercase tracking-widest text-mist/40">
        Add to the canvas
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Night market tacos"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (optional)"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <TextInput
        value={scheduledOn}
        onChangeText={setScheduledOn}
        placeholder="Optional date YYYY-MM-DD"
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
        <PrimaryButton label="Save to the list" onPress={() => void save()} />
      </View>

      {done.length ? (
        <Text className="mt-6 text-[13px] text-mist/40">
          Done: {done.map((row) => row.title).join(" · ")}
        </Text>
      ) : null}
    </HubScreen>
  );
}
