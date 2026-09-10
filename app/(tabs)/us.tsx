import { PartnerConnectionBanner } from "@/components/PartnerConnectionBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { daysUntil, formatLongDate, isSunday, localDateKey } from "@/lib/dates";
import { curiosityFor, MOODS, partnerHint, RITUALS } from "@/lib/hub";
import { useApp } from "@/lib/store";
import type { MoodWeather } from "@/lib/types";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const TILES = [
  { href: "/hub/calendar", kicker: "Calendar", title: "Nights, dates, rituals" },
  { href: "/hub/curiosity", kicker: "Daily", title: "Curiosity question" },
  { href: "/hub/milestones", kicker: "Widgets", title: "Shared countdowns" },
  { href: "/hub/desire", kicker: "Private", title: "Desire matrix" },
  { href: "/hub/coupons", kicker: "Favors", title: "Intimacy coupons" },
  { href: "/hub/scratch", kicker: "Play", title: "Scratch-offs" },
  { href: "/hub/jar", kicker: "Gratitude", title: "Appreciation jar" },
  { href: "/hub/planner", kicker: "Plans", title: "Date night + bucket list" },
] as const;

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

export default function UsScreen() {
  const router = useRouter();
  const {
    user,
    partner,
    couple,
    checkIns,
    curiosityAnswers,
    milestones,
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
  const question = couple ? curiosityFor(couple.id, today) : null;
  const myCuriosity = curiosityAnswers.find(
    (row) => row.userId === user?.id && row.date === today
  );
  const partnerCuriosity = curiosityAnswers.find(
    (row) => row.userId === partner?.id && row.date === today
  );

  const [energy, setEnergy] = useState(6);
  const [mood, setMood] = useState<MoodWeather>("cloudy");
  const [loveTank, setLoveTank] = useState(6);
  const [saving, setSaving] = useState(false);

  const upcoming = useMemo(
    () =>
      milestones
        .filter((row) => daysUntil(row.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3),
    [milestones]
  );

  const saveCheckIn = async () => {
    setSaving(true);
    try {
      await submitCheckIn({ energy, mood, loveTank });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <View className="pt-4 pb-10">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Couple account
        </Text>
        <Text className="mt-2 text-[32px] font-bold text-mist">Us</Text>
        <PartnerConnectionBanner />

        <View className="rounded-[28px] border border-neon/30 bg-neon/10 p-5">
          <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
            Daily check-in
          </Text>
          {myCheckIn ? (
            <>
              <Text className="mt-2 text-[18px] font-semibold text-mist">
                You're in · energy {myCheckIn.energy} · tank {myCheckIn.loveTank}
              </Text>
              <Text className="mt-1 text-[14px] text-mist/65">
                Forecast: {myCheckIn.mood}. Ten seconds, done for today.
              </Text>
            </>
          ) : (
            <>
              <Text className="mt-2 text-[16px] leading-6 text-mist/80">
                Ten seconds. Log energy, weather, and how full your love tank is.
              </Text>
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
                  label="Log today's weather"
                  loading={saving}
                  onPress={() => void saveCheckIn()}
                />
              </View>
            </>
          )}
          {partnerCheckIn ? (
            <Text className="mt-4 text-[15px] leading-6 text-mist">
              {partnerHint(partnerCheckIn, partner?.displayName ?? "Your partner")}
            </Text>
          ) : (
            <Text className="mt-4 text-[14px] text-mist/55">
              {partner
                ? `Waiting on ${partner.displayName}'s check-in for a hint.`
                : "Pair up so check-ins can talk to each other."}
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => router.push("/hub/curiosity" as Href)}
          className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-5"
        >
          <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-crimson">
            Today's curiosity
          </Text>
          <Text className="mt-2 text-[18px] font-semibold text-mist">
            {question?.prompt ?? "Pair up to get today's question."}
          </Text>
          <Text className="mt-2 text-[14px] text-mist/60">
            {myCuriosity && partnerCuriosity
              ? "Both answers are in. Tap to compare."
              : myCuriosity
                ? `${partner?.displayName ?? "Partner"} hasn't answered yet. Theirs stays hidden.`
                : "Answers stay hidden until you both submit."}
          </Text>
        </Pressable>

        <View className="mt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-semibold uppercase tracking-widest text-mist/40">
              Countdown widgets
            </Text>
            <Pressable onPress={() => router.push("/hub/milestones" as Href)}>
              <Text className="text-[13px] font-semibold text-neon">Edit</Text>
            </Pressable>
          </View>
          {upcoming.length === 0 ? (
            <Text className="mt-3 text-[14px] text-mist/60">
              Add an anniversary, getaway, or date night. They live here until
              we ship home-screen widgets.
            </Text>
          ) : (
            <View className="mt-3 gap-2">
              {upcoming.map((item) => {
                const days = daysUntil(item.date);
                return (
                  <View
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <Text className="text-[12px] uppercase tracking-widest text-crimson">
                      {days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`}
                    </Text>
                    <Text className="mt-1 text-[16px] font-semibold text-mist">
                      {item.title}
                    </Text>
                    <Text className="text-[13px] text-mist/50">
                      {formatLongDate(item.date)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View className="mt-6">
          <Text className="text-[12px] font-semibold uppercase tracking-widest text-mist/40">
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
                  <Text className="mt-1 text-[13px] text-mist/55">
                    {ritual.detail}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6 gap-2">
          {TILES.map((tile) => (
            <Pressable
              key={tile.href}
              onPress={() => router.push(tile.href as Href)}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-crimson">
                {tile.kicker}
              </Text>
              <Text className="mt-1 text-[18px] font-semibold text-mist">
                {tile.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
