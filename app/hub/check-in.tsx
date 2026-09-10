import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { localDateKey } from "@/lib/dates";
import {
  batteryLabel,
  CHECK_IN_METRIC_META,
  checkInLines,
  DESIRE_GAUGE,
  loveTankLabel,
  MOODS,
  partnerHint,
  TONIGHT_SEX,
  SOCIAL_BATTERY,
  TODAY_NEEDS,
} from "@/lib/hub";
import { useApp } from "@/lib/store";
import type {
  CheckInMetricKey,
  DesireGauge,
  MoodWeather,
  SocialBattery,
  TodayNeed,
  TonightSex,
} from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { Pressable, Switch, Text, View } from "react-native";

function Gauge({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View className="mt-2 flex-row gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          className={`h-6 flex-1 rounded-md ${n <= value ? "bg-neon" : "bg-white/10"}`}
        />
      ))}
    </View>
  );
}

function Choice<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { id: T; title: string; detail: string }[];
  value: T | null;
  onChange: (id: T) => void;
  columns?: 1 | 2;
}) {
  return (
    <View className={`mt-2 flex-row flex-wrap ${columns === 2 ? "justify-between" : ""}`}>
      {options.map((item) => {
        const on = item.id === value;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            className={`${columns === 2 ? "mb-2 w-[48%]" : "mb-2 w-full"} rounded-xl border p-2.5 ${
              on ? "border-neon bg-neon/20" : "border-white/10 bg-white/5"
            }`}
          >
            <Text className={`text-[12px] font-semibold ${on ? "text-mist" : "text-mist/80"}`}>
              {item.title}
            </Text>
            <Text className="mt-0.5 text-[11px] leading-4 text-mist/55">{item.detail}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MetricCard({
  icon,
  title,
  enabled,
  onToggle,
  children,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  enabled: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View
      className={`mb-3 rounded-2xl border p-4 ${
        enabled ? "border-neon/40 bg-night" : "border-white/10 bg-white/5 opacity-60"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center pr-3">
          <Ionicons name={icon} size={20} color="#FF007F" />
          <Text className="ml-2 text-[15px] font-semibold text-mist">{title}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: "#2A2A30", true: "#FF007F" }}
          thumbColor="#F4F4F6"
        />
      </View>
      {enabled ? <View className="mt-2">{children}</View> : null}
    </View>
  );
}

export default function CheckInScreen() {
  const {
    user,
    partner,
    checkIns,
    submitCheckIn,
    requestCheckIn,
    incomingCheckInRequest,
  } = useApp();
  const today = localDateKey();
  const myCheckIn = checkIns.find(
    (row) => row.userId === user?.id && row.date === today
  );
  const partnerCheckIn = checkIns.find(
    (row) => row.userId === partner?.id && row.date === today
  );

  const [mode, setMode] = useState<"checkin" | "request">("checkin");
  const [simple, setSimple] = useState(true);
  const [tonight, setTonight] = useState<TonightSex | null>(null);
  const [batteryOn, setBatteryOn] = useState(false);
  const [moodOn, setMoodOn] = useState(false);
  const [loveOn, setLoveOn] = useState(false);
  const [socialOn, setSocialOn] = useState(false);
  const [needOn, setNeedOn] = useState(false);
  const [spicyOn, setSpicyOn] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [mood, setMood] = useState<MoodWeather | null>(null);
  const [loveTank, setLoveTank] = useState(0);
  const [socialBattery, setSocialBattery] = useState<SocialBattery | null>(null);
  const [todayNeed, setTodayNeed] = useState<TodayNeed | null>(null);
  const [desireGauge, setDesireGauge] = useState<DesireGauge | null>(null);
  const [requested, setRequested] = useState<CheckInMetricKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!myCheckIn) return;
    setBatteryOn(myCheckIn.energy != null);
    setMoodOn(myCheckIn.mood != null);
    setLoveOn(myCheckIn.loveTank != null);
    setSocialOn(myCheckIn.socialBattery != null);
    setNeedOn(myCheckIn.todayNeed != null);
    setSpicyOn(myCheckIn.desireGauge != null);
    setTonight(myCheckIn.tonight);
    const extras =
      myCheckIn.energy != null ||
      myCheckIn.mood != null ||
      myCheckIn.loveTank != null ||
      myCheckIn.socialBattery != null ||
      myCheckIn.todayNeed != null ||
      myCheckIn.desireGauge != null;
    setSimple(!extras);
    if (myCheckIn.energy != null) setEnergy(myCheckIn.energy);
    if (myCheckIn.mood) setMood(myCheckIn.mood === "bright" ? "sunny" : myCheckIn.mood);
    if (myCheckIn.loveTank != null) setLoveTank(myCheckIn.loveTank);
    if (myCheckIn.socialBattery) setSocialBattery(myCheckIn.socialBattery);
    if (myCheckIn.todayNeed) setTodayNeed(myCheckIn.todayNeed);
    if (myCheckIn.desireGauge) setDesireGauge(myCheckIn.desireGauge);
  }, [myCheckIn]);

  useEffect(() => {
    if (!incomingCheckInRequest || myCheckIn) return;
    const keys = new Set(incomingCheckInRequest.metrics);
    if (keys.has("battery")) setBatteryOn(true);
    if (keys.has("mood")) setMoodOn(true);
    if (keys.has("loveTank")) setLoveOn(true);
    if (keys.has("socialBattery")) setSocialOn(true);
    if (keys.has("todayNeed")) setNeedOn(true);
    if (keys.has("desireGauge")) setSpicyOn(true);
    const wantsDetail = incomingCheckInRequest.metrics.some((key) => key !== "tonight");
    if (wantsDetail) setSimple(false);
  }, [incomingCheckInRequest, myCheckIn]);

  const requestedLabels = useMemo(() => {
    if (!incomingCheckInRequest) return [];
    return incomingCheckInRequest.metrics.map(
      (key) => CHECK_IN_METRIC_META.find((item) => item.key === key)?.label ?? key
    );
  }, [incomingCheckInRequest]);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await submitCheckIn({
        energy: !simple && batteryOn && energy > 0 ? energy : null,
        mood: !simple && moodOn ? mood : null,
        loveTank: !simple && loveOn && loveTank > 0 ? loveTank : null,
        socialBattery: !simple && socialOn ? socialBattery : null,
        todayNeed: !simple && needOn ? todayNeed : null,
        desireGauge: !simple && spicyOn ? desireGauge : null,
        tonight,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share");
    } finally {
      setSaving(false);
    }
  };

  const sendRequest = async () => {
    setError(null);
    setSending(true);
    try {
      await requestCheckIn(requested);
      setSent(true);
      setTimeout(() => setSent(false), 2800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  };

  const toggleRequest = (key: CheckInMetricKey) => {
    setRequested((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  return (
    <HubScreen
      kicker="Check-in"
      title="Are we fucking today?"
      body="Hell yeh or nah. Keep it simple, or add how you're actually doing."
    >
      <View className="mb-5 flex-row rounded-2xl bg-white/5 p-1">
        <Pressable
          onPress={() => setMode("checkin")}
          className={`flex-1 items-center rounded-xl py-2.5 ${mode === "checkin" ? "bg-neon" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <Text
            className={`text-[13px] font-semibold ${
              mode === "checkin" ? "text-night" : "text-mist/55"
            }`}
          >
            Check in
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("request")}
          className={`flex-1 items-center rounded-xl py-2.5 ${mode === "request" ? "bg-neon" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <Text
            className={`text-[13px] font-semibold ${
              mode === "request" ? "text-night" : "text-mist/55"
            }`}
          >
            Request update
          </Text>
        </Pressable>
      </View>

      {mode === "checkin" ? (
        <View>
          {incomingCheckInRequest && !myCheckIn ? (
            <View className="mb-4 rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3">
              <Text className="text-[12px] font-bold uppercase tracking-[2px] text-crimson">
                They asked
              </Text>
              <Text className="mt-1 text-[14px] leading-5 text-mist">
                {requestedLabels.join(" · ")}
              </Text>
            </View>
          ) : null}

          <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-white/5 p-1">
            <Pressable
              onPress={() => setSimple(true)}
              className={`flex-1 items-center rounded-xl py-2.5 ${simple ? "bg-neon" : ""}`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  simple ? "text-night" : "text-mist/55"
                }`}
              >
                Keep it simple
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSimple(false)}
              className={`flex-1 items-center rounded-xl py-2.5 ${!simple ? "bg-neon" : ""}`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  !simple ? "text-night" : "text-mist/55"
                }`}
              >
                More detail
              </Text>
            </Pressable>
          </View>

          <View className="mb-4 flex-row gap-2">
            {TONIGHT_SEX.map((option) => {
              const on = tonight === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setTonight(option.id)}
                  className={`flex-1 rounded-3xl border px-3 py-5 ${
                    on
                      ? option.id === "yes"
                        ? "border-neon bg-neon"
                        : "border-white/30 bg-white/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <Text
                    className={`text-center text-[18px] font-bold ${
                      on && option.id === "yes" ? "text-night" : "text-mist"
                    }`}
                  >
                    {option.title}
                  </Text>
                  <Text
                    className={`mt-1 text-center text-[12px] leading-4 ${
                      on && option.id === "yes" ? "text-night/70" : "text-mist/55"
                    }`}
                  >
                    {option.detail}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!simple ? (
            <>
          <Text className="mb-3 text-center text-[12px] text-mist/50">
            Toggle on only the areas you want to share right now.
          </Text>

          <MetricCard
            icon="heart-outline"
            title={`Love tank${loveOn && loveTank > 0 ? ` (${loveTank}/10)` : ""}`}
            enabled={loveOn}
            onToggle={() => setLoveOn((v) => !v)}
          >
            <Gauge value={loveTank} onChange={setLoveTank} />
            {loveTank > 0 ? (
              <Text className="mt-2 text-[12px] italic leading-5 text-mist/60">
                {loveTankLabel(loveTank)}
              </Text>
            ) : null}
          </MetricCard>

          <MetricCard
            icon="battery-charging-outline"
            title={`Battery / energy${batteryOn && energy > 0 ? ` (${energy}/10)` : ""}`}
            enabled={batteryOn}
            onToggle={() => setBatteryOn((v) => !v)}
          >
            <Gauge value={energy} onChange={setEnergy} />
            {energy > 0 ? (
              <Text className="mt-2 text-[12px] italic leading-5 text-mist/60">
                {batteryLabel(energy)}
              </Text>
            ) : null}
          </MetricCard>

          <MetricCard
            icon="partly-sunny-outline"
            title="Mood forecast"
            enabled={moodOn}
            onToggle={() => setMoodOn((v) => !v)}
          >
            <Choice
              options={MOODS.map((item) => ({
                id: item.id,
                title: item.label,
                detail: item.sky,
              }))}
              value={mood}
              onChange={setMood}
            />
          </MetricCard>

          <MetricCard
            icon="people-outline"
            title="Social battery"
            enabled={socialOn}
            onToggle={() => setSocialOn((v) => !v)}
          >
            <Choice
              options={SOCIAL_BATTERY.map((item) => ({
                id: item.id,
                title: item.title,
                detail: item.detail,
              }))}
              value={socialBattery}
              onChange={setSocialBattery}
              columns={1}
            />
          </MetricCard>

          <MetricCard
            icon="compass-outline"
            title="What I need most today"
            enabled={needOn}
            onToggle={() => setNeedOn((v) => !v)}
          >
            <Choice
              options={TODAY_NEEDS.map((item) => ({
                id: item.id,
                title: item.title,
                detail: item.detail,
              }))}
              value={todayNeed}
              onChange={setTodayNeed}
            />
          </MetricCard>

          <MetricCard
            icon="flame-outline"
            title="Spicy gauge"
            enabled={spicyOn}
            onToggle={() => setSpicyOn((v) => !v)}
          >
            <Choice
              options={DESIRE_GAUGE.map((item) => ({
                id: item.id,
                title: item.title,
                detail: item.detail,
              }))}
              value={desireGauge}
              onChange={setDesireGauge}
            />
          </MetricCard>
            </>
          ) : null}

          {error && mode === "checkin" ? (
            <Text className="mb-3 text-center text-[13px] text-crimson">{error}</Text>
          ) : null}

          <PrimaryButton
            label={myCheckIn ? "Update my check-in" : "Share my check-in"}
            loading={saving}
            disabled={tonight == null}
            onPress={() => void save()}
          />
        </View>
      ) : (
        <View>
          <Text className="mb-3 text-center text-[12px] text-mist/50">
            Nudge them to share specific updates if you feel out of the loop.
          </Text>
          {CHECK_IN_METRIC_META.map((item) => {
            const on = requested.includes(item.key);
            return (
              <Pressable
                key={item.key}
                onPress={() => toggleRequest(item.key)}
                className={`mb-3 flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                  on ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"
                }`}
              >
                <View className="flex-1 flex-row items-center pr-3">
                  <Ionicons name={item.icon} size={20} color="#FF007F" />
                  <Text className="ml-3 text-[15px] font-semibold text-mist">{item.label}</Text>
                </View>
                <Text
                  className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
                    on
                      ? "border-neon bg-neon text-night"
                      : "border-white/15 text-mist/55"
                  }`}
                >
                  {on ? "Requested" : "+ Select"}
                </Text>
              </Pressable>
            );
          })}
          {error && mode === "request" ? (
            <Text className="mb-3 text-center text-[13px] text-crimson">{error}</Text>
          ) : null}
          <PrimaryButton
            label="Send request"
            tone="crimson"
            loading={sending}
            disabled={requested.length === 0}
            onPress={() => void sendRequest()}
          />
          {sent ? (
            <Text className="mt-3 text-center text-[13px] text-neon">
              Request sent. It'll ping their lock screen if notifications are on.
            </Text>
          ) : null}
        </View>
      )}

      {partnerCheckIn ? (
        <View className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-neon">
            What they shared
          </Text>
          {checkInLines(partnerCheckIn).map((line) => (
            <Text key={line} className="mt-1.5 text-[15px] text-mist">
              {line}
            </Text>
          ))}
          <Text className="mt-3 text-[13px] leading-5 text-mist/60">
            {partnerHint(partnerCheckIn)}
          </Text>
        </View>
      ) : partner ? (
        <Text className="mt-5 text-[14px] leading-5 text-mist/60">
          Nothing from them yet today. Request an update if you need it.
        </Text>
      ) : null}
    </HubScreen>
  );
}
