import { LookPanel } from "@/components/hub/AppSettings";
import { Stage } from "@/components/hub/Stage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CalendarDateField } from "@/components/ui/CalendarDateField";
import { Screen } from "@/components/ui/Screen";
import { COUNTDOWN_TONE as T, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { upcomingCountdowns } from "@/lib/countdown-ticker";
import { daysUntil, formatLongDate } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { MilestoneKind } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
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
  const look = useAppLook("milestones", T.gold, {
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
    <Screen
      scroll
      background={T.background}
      density={look.prefs.density}
      typeface={look.prefs.typeface}
      accent={look.accent}
    >
      <Stage
        background={T.background}
        fallback={"/hub/home-base" as Href}
        accent={look.accent}
        settingsLabel="Countdowns"
        settings={
          <LookPanel
            look={look}
            ink={T.ink}
            muted={T.muted}
            toggles={[
              {
                key: "tickerAll",
                label: "Ticker: run them all",
                hint: "Home scrolls every upcoming countdown, one after another. Off: only the starred one.",
              },
              {
                key: "hidePast",
                label: "Hide what’s already happened",
                hint: "Only show dates still ahead.",
              },
              {
                key: "asWeeks",
                label: "Count in weeks",
                hint: "14 days becomes 2 weeks when it’s that far out.",
              },
            ]}
          />
        }
      >
        <View style={{ alignItems: "center", marginBottom: 18 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              borderWidth: 6,
              borderColor: look.accent,
              backgroundColor: T.face,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 3,
                height: 28,
                backgroundColor: T.hand,
                borderRadius: 2,
                marginBottom: 8,
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 22,
                height: 3,
                backgroundColor: look.accent,
                borderRadius: 2,
                transform: [{ translateX: 8 }, { rotate: "90deg" }],
              }}
            />
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: T.ink,
              }}
            />
          </View>
          <Text
            style={{
              marginTop: 14,
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 3,
              color: look.accent,
            }}
          >
            TICK TOCK
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontFamily: SERIF,
              fontSize: look.look.title,
              lineHeight: look.look.titleLine,
              color: T.ink,
              textAlign: "center",
            }}
          >
            Countdowns
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 22,
              color: T.muted,
              textAlign: "center",
            }}
          >
            Save the dates that matter. Star one for the Home ticker. Gold hands, midnight face.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {visible.length === 0 ? (
            <Text style={{ color: T.muted, fontSize: 15, lineHeight: 22 }}>
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
                  style={{
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: starred ? look.accent : T.border,
                    backgroundColor: starred ? T.goldSoft : T.surface,
                    padding: 16,
                  }}
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
                      <Text
                        style={{
                          fontFamily: "SpaceMono",
                          fontSize: 11,
                          letterSpacing: 1.6,
                          color: T.hand,
                        }}
                      >
                        {item.kind.toUpperCase()} · {countdown}
                        {starred && !look.prefs.tickerAll ? " · home ticker" : ""}
                      </Text>
                      <Text
                        style={{
                          marginTop: 6,
                          fontFamily: SERIF,
                          fontSize: 20,
                          color: T.ink,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text style={{ marginTop: 4, fontSize: 13, color: T.muted }}>
                        {formatLongDate(item.date)}
                      </Text>
                    </View>
                    <Ionicons
                      name={starred ? "star" : "star-outline"}
                      size={22}
                      color={starred ? look.accent : T.muted}
                    />
                  </View>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation?.();
                      void removeMilestone(item.id);
                    }}
                    hitSlop={8}
                  >
                    <Text style={{ marginTop: 12, fontSize: 13, color: T.muted }}>
                      Remove
                    </Text>
                  </Pressable>
                </Pressable>
              );
            })
          )}
        </View>

        <Text
          style={{
            marginTop: 28,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: T.muted,
          }}
        >
          SAVE A COUNTDOWN
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Weekend getaway"
          placeholderTextColor={T.muted}
          style={{
            marginTop: 12,
            height: 48,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: T.border,
            backgroundColor: T.surface,
            paddingHorizontal: 16,
            fontSize: 16,
            color: T.ink,
          }}
        />
        <CalendarDateField
          label="Date"
          value={date}
          onChange={setDate}
          accent={look.accent}
          ink={T.ink}
          muted={T.muted}
          background={T.face}
          allowClear
        />
        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {KINDS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setKind(item)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: kind === item ? look.accent : T.surfaceRaised,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: kind === item ? T.background : T.muted,
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        {error ? (
          <Text style={{ marginTop: 12, color: "#FB7185", fontSize: 14 }}>{error}</Text>
        ) : null}
        <View style={{ marginTop: 16 }}>
          <PrimaryButton label="Save countdown" onPress={() => void save()} />
        </View>
      </Stage>
    </Screen>
  );
}
