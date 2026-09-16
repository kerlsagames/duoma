import { AppSettingsPanel, PrefSection, PrefToggle, lookPanelProps } from "@/components/hub/AppSettings";
import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CalendarDateField } from "@/components/ui/CalendarDateField";
import { useAppLook } from "@/lib/app-prefs";
import { upcomingCountdowns } from "@/lib/countdown-ticker";
import { daysUntil, formatLongDate } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { MilestoneKind } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const KINDS: MilestoneKind[] = ["anniversary", "date", "trip", "other"];

export default function MilestonesScreen() {
  const { milestones, addMilestone, removeMilestone, setFeaturedMilestone } =
    useApp();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<MilestoneKind>("date");
  const [error, setError] = useState<string | null>(null);
  const look = useAppLook("milestones", "#FF007F", {
    hidePast: false,
    asWeeks: false,
    tickerAll: false,
  });

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

  const visible = upcomingCountdowns(milestones, look.prefs.hidePast);

  return (
    <HubScreen
      kicker="Home Base · Countdowns"
      title="What you're counting to"
      body="Save the dates that matter. Tap the most important one — that countdown runs on Home, just above Settings. The cog can send every countdown across the ticker, one after another."
      accent={look.accent}
      settingsLabel="Countdown settings"
      settings={
        <AppSettingsPanel {...lookPanelProps(look, "#F4F4F6", "rgba(244,244,246,0.6)")}>
          <PrefSection
            label="This app"
            ink="#F4F4F6"
            muted="rgba(244,244,246,0.6)"
          >
            <View style={{ gap: 8 }}>
              <PrefToggle
                on={look.prefs.tickerAll}
                label="Ticker: run them all"
                hint="Home scrolls every upcoming countdown, one after another. Off: only the starred one."
                accent={look.accent}
                ink="#F4F4F6"
                muted="rgba(244,244,246,0.6)"
                onToggle={() => look.patch({ tickerAll: !look.prefs.tickerAll })}
              />
              <PrefToggle
                on={look.prefs.hidePast}
                label="Hide what’s already happened"
                hint="Only show dates still ahead."
                accent={look.accent}
                ink="#F4F4F6"
                muted="rgba(244,244,246,0.6)"
                onToggle={() => look.patch({ hidePast: !look.prefs.hidePast })}
              />
              <PrefToggle
                on={look.prefs.asWeeks}
                label="Count in weeks"
                hint="14 days becomes 2 weeks when it’s that far out."
                accent={look.accent}
                ink="#F4F4F6"
                muted="rgba(244,244,246,0.6)"
                onToggle={() => look.patch({ asWeeks: !look.prefs.asWeeks })}
              />
            </View>
          </PrefSection>
        </AppSettingsPanel>
      }
    >
      <View className="gap-3">
          {visible.length === 0 ? (
          <Text className="text-[15px] text-mist/60">
            Nothing on the clock yet. Add the next thing that matters, then tap it so Home knows which one to count.
          </Text>
        ) : (
          visible.map((item) => {
            const days = daysUntil(item.date);
            const countdown =
              days < 0
                ? `${Math.abs(days)} days ago`
                : days === 0
                  ? "today"
                  : look.prefs.asWeeks && days >= 14
                    ? `${Math.round(days / 7)} weeks`
                    : `${days} days`;
            const starred = Boolean(item.featured);
            return (
              <Pressable
                key={item.id}
                onPress={() => void setFeaturedMilestone(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${starred ? "On the home ticker" : "Tap to put on the home ticker"}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
                style={
                  starred
                    ? {
                        borderColor: `${look.accent}99`,
                        backgroundColor: `${look.accent}18`,
                      }
                    : undefined
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text className="text-[12px] uppercase tracking-widest text-crimson">
                      {item.kind} · {countdown}
                      {starred && !look.prefs.tickerAll ? " · home ticker" : ""}
                    </Text>
                    <Text className="mt-1 text-[18px] font-semibold text-mist">
                      {item.title}
                    </Text>
                    <Text className="mt-1 text-[13px] text-mist/50">
                      {formatLongDate(item.date)}
                    </Text>
                  </View>
                  <Ionicons
                    name={starred ? "star" : "star-outline"}
                    size={22}
                    color={starred ? look.accent : "rgba(244,244,246,0.35)"}
                  />
                </View>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation?.();
                    void removeMilestone(item.id);
                  }}
                  hitSlop={8}
                >
                  <Text className="mt-3 text-[13px] text-mist/40">Remove</Text>
                </Pressable>
              </Pressable>
            );
          })
        )}
      </View>

      <Text className="mt-8 text-[12px] uppercase tracking-widest text-mist/40">
        Save a countdown
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Weekend getaway"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <CalendarDateField
        label="Date"
        value={date}
        onChange={setDate}
        accent={look.accent}
        ink="#F4F4F6"
        muted="rgba(244,244,246,0.55)"
        background="#14141A"
        allowClear
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
