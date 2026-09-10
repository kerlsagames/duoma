import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { isSunday, localDateKey } from "@/lib/dates";
import { MOODS, partnerHint, RITUALS } from "@/lib/hub";
import { useApp } from "@/lib/store";
import type { MoodWeather } from "@/lib/types";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

function Gauge({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View className="mt-4">
      <Text className="text-[12px] uppercase tracking-widest text-mist/45">
        {label} · {value}
      </Text>
      <View className="mt-2 flex-row gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            className={`h-7 flex-1 rounded-md ${
              n <= value ? "bg-neon" : "bg-white/10"
            }`}
          />
        ))}
      </View>
    </View>
  );
}

export default function CheckInScreen() {
  const {
    user,
    partner,
    checkIns,
    submitCheckIn,
    ritualChecks,
    toggleRitual,
  } = useApp();
  const today = localDateKey();
  const myCheckIn = checkIns.find(
    (row) => row.userId === user?.id && row.date === today
  );
  const partnerCheckIn = checkIns.find(
    (row) => row.userId === partner?.id && row.date === today
  );
  const [energy, setEnergy] = useState(6);
  const [mood, setMood] = useState<MoodWeather>("cloudy");
  const [loveTank, setLoveTank] = useState(6);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await submitCheckIn({ energy, mood, loveTank });
    } finally {
      setSaving(false);
    }
  };

  return (
    <HubScreen
      kicker="Check-in"
      title="How charged are you?"
      body="Ten seconds. Energy, weather, love tank. Their score tells you how to show up."
    >
      {myCheckIn ? (
        <View className="rounded-[28px] border border-neon/40 bg-neon/10 p-5">
          <Text className="text-[18px] font-bold text-mist">
            Logged · energy {myCheckIn.energy} · tank {myCheckIn.loveTank}
          </Text>
          <Text className="mt-1 text-[14px] text-mist/65">
            Forecast: {myCheckIn.mood}. You're in for today.
          </Text>
        </View>
      ) : (
        <View className="rounded-[28px] border border-neon/30 bg-neon/10 p-5">
          <Gauge label="Energy / battery" value={energy} onChange={setEnergy} />
          <Text className="mt-4 text-[12px] uppercase tracking-widest text-mist/45">
            Mood forecast
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {MOODS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setMood(item.id)}
                className={`rounded-full px-3 py-2 ${
                  mood === item.id ? "bg-neon" : "bg-white/10"
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold ${
                    mood === item.id ? "text-night" : "text-mist/70"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Gauge label="Love tank" value={loveTank} onChange={setLoveTank} />
          <View className="mt-5">
            <PrimaryButton
              label="Log it"
              loading={saving}
              onPress={() => void save()}
            />
          </View>
        </View>
      )}

      <Text className="mt-5 text-[15px] leading-6 text-mist">
        {partnerCheckIn
          ? partnerHint(partnerCheckIn, partner?.displayName ?? "Your partner")
          : partner
            ? `Waiting on ${partner.displayName}'s check-in.`
            : "Pair up so the check-ins can talk to each other."}
      </Text>

      <Text className="mt-8 text-[12px] font-bold uppercase tracking-[2px] text-neon">
        Rituals
      </Text>
      {isSunday() ? (
        <Text className="mt-2 text-[14px] text-mist/65">
          Sunday. Open the jar together tonight.
        </Text>
      ) : null}
      <View className="mt-3 gap-2">
        {RITUALS.map((ritual) => {
          const on = ritualChecks.some(
            (row) =>
              row.ritualId === ritual.id &&
              row.date === today &&
              row.userId === user?.id
          );
          return (
            <Pressable
              key={ritual.id}
              onPress={() => void toggleRitual(ritual.id)}
              className={`rounded-3xl border px-4 py-3 ${
                on ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"
              }`}
            >
              <Text className="text-[16px] font-semibold text-mist">
                {on ? "Done · " : ""}
                {ritual.title}
              </Text>
              <Text className="mt-1 text-[13px] text-mist/55">{ritual.detail}</Text>
            </Pressable>
          );
        })}
      </View>
    </HubScreen>
  );
}
