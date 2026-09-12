import { Stage } from "@/components/hub/Stage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Screen } from "@/components/ui/Screen";
import { PERIOD_TONE as T, SERIF } from "@/lib/app-themes";
import {
  addMonths,
  daysUntil,
  formatLongDate,
  formatMonthYear,
  localDateKey,
  monthGrid,
} from "@/lib/dates";
import { useMiniApps } from "@/lib/mini-apps";
import {
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  cycleForDate,
  endPeriodOn,
  historyRows,
  logForDate,
  markForDate,
  removeCycle,
  snapshot,
  startPeriodOn,
  updateSettings,
  upsertLog,
  type DayMark,
  type PeriodFlow,
  type PeriodMood,
  type PeriodSymptom,
} from "@/lib/period";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function PeriodScreen() {
  const { partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const them = partner?.displayName || "your pair";
  const today = localDateKey();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const period = data.period;
  const snap = useMemo(() => snapshot(period, today), [period, today]);
  const cells = useMemo(
    () => monthGrid(cursor.year, cursor.month),
    [cursor.month, cursor.year]
  );
  const selectedLog = logForDate(period, selected);
  const selectedCycle = cycleForDate(
    period.cycles,
    selected,
    period.settings.typicalPeriod
  );
  const history = historyRows(period).slice(0, 6);

  const save = async (next: typeof period) => {
    setError(null);
    try {
      await patch((state) => ({ ...state, period: next }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  };

  const heading = !ready
    ? "Loading the cycle…"
    : !snap.last
      ? "No cycle logged yet"
      : snap.inPeriod
        ? `Period · day ${snap.periodDay}`
        : snap.isOvulation
          ? "Around ovulation"
          : snap.inFertile
            ? "Fertile window"
            : snap.inPredicted
              ? "Period expected"
              : snap.cycleDay
                ? `Day ${snap.cycleDay} of ~${snap.averageLength}`
                : "Cycle";

  const sub =
    !snap.last
      ? "Log the first day. We’ll learn the rhythm from there."
      : snap.nextStart
        ? snap.inPeriod
          ? `Expected to ease in ${Math.max(0, period.settings.typicalPeriod - (snap.periodDay ?? 1))} day${period.settings.typicalPeriod - (snap.periodDay ?? 1) === 1 ? "" : "s"}.`
          : daysUntil(snap.nextStart) === 0
            ? "Next period is due today."
            : daysUntil(snap.nextStart) > 0
              ? `Next period in ${daysUntil(snap.nextStart)} day${daysUntil(snap.nextStart) === 1 ? "" : "s"}.`
              : `Period was due ${Math.abs(daysUntil(snap.nextStart))} day${Math.abs(daysUntil(snap.nextStart)) === 1 ? "" : "s"} ago.`
        : "Keep logging starts and the prediction tightens.";

  return (
    <Screen scroll background={T.background}>
      <Stage background={T.background} fallback={"/hub/home-base" as Href} accent={T.rose}>
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: T.rose,
          }}
        >
          HOME BASE · SHARED
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 40,
            color: T.ink,
          }}
        >
          Period tracker
        </Text>
        <Text style={{ marginTop: 8, fontSize: 15, lineHeight: 22, color: T.muted }}>
          Both of you can see this — for planning, not a diagnosis. Estimates only.
        </Text>

        <View
          style={{
            marginTop: 18,
            backgroundColor: T.surface,
            borderWidth: 1,
            borderColor: T.border,
            padding: 16,
          }}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 24, lineHeight: 30, color: T.ink }}>
            {heading}
          </Text>
          <Text style={{ marginTop: 6, fontSize: 15, lineHeight: 22, color: T.muted }}>
            {sub}
          </Text>
          {snap.last && snap.nextStart ? (
            <Text style={{ marginTop: 10, fontSize: 13, color: T.rose }}>
              Average cycle ~{snap.averageLength} days · next start {formatLongDate(snap.nextStart)}
            </Text>
          ) : null}
          {!snap.inPeriod ? (
            <Pressable
              onPress={() => void save(startPeriodOn(period, today))}
              style={primaryBtn}
            >
              <Text style={primaryBtnText}>Period started today</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => void save(endPeriodOn(period, today))}
              style={ghostBtn}
            >
              <Text style={ghostBtnText}>Period ended today</Text>
            </Pressable>
          )}
        </View>

        <View
          style={{
            marginTop: 18,
            backgroundColor: T.surface,
            borderWidth: 1,
            borderColor: T.border,
            padding: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={() => setCursor(addMonths(cursor.year, cursor.month, -1))}
              hitSlop={12}
              style={{ padding: 6 }}
            >
              <Ionicons name="chevron-back" size={20} color={T.rose} />
            </Pressable>
            <Text style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>
              {formatMonthYear(cursor.year, cursor.month)}
            </Text>
            <Pressable
              onPress={() => setCursor(addMonths(cursor.year, cursor.month, 1))}
              hitSlop={12}
              style={{ padding: 6 }}
            >
              <Ionicons name="chevron-forward" size={20} color={T.rose} />
            </Pressable>
          </View>
          <View style={{ marginTop: 10, flexDirection: "row" }}>
            {WEEKDAYS.map((day, i) => (
              <Text
                key={`${day}-${i}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: "700",
                  color: T.dim,
                }}
              >
                {day}
              </Text>
            ))}
          </View>
          <View style={{ marginTop: 6, flexDirection: "row", flexWrap: "wrap" }}>
            {cells.map((cell, i) => {
              if (!cell) {
                return <View key={`e-${i}`} style={{ width: "14.285%", height: 44 }} />;
              }
              const mark = markForDate(period, cell.date, snap);
              const isToday = cell.date === today;
              const isSel = cell.date === selected;
              const logged = Boolean(logForDate(period, cell.date));
              return (
                <Pressable
                  key={cell.date}
                  onPress={() => setSelected(cell.date)}
                  style={{
                    width: "14.285%",
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: fillFor(mark),
                      borderWidth: isToday || isSel || mark === "predicted" ? 1.5 : 0,
                      borderColor: isSel ? T.ink : isToday ? T.rose : T.rose,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: mark === "period" ? "800" : "600",
                        color: mark === "period" ? T.paper : T.ink,
                      }}
                    >
                      {cell.day}
                    </Text>
                  </View>
                  {logged ? (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: T.roseDeep,
                        marginTop: -2,
                      }}
                    />
                  ) : (
                    <View style={{ height: 4 }} />
                  )}
                </Pressable>
              );
            })}
          </View>
          <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Legend color={T.rose} label="Period" />
            <Legend color={T.fertile} label="Fertile" />
            <Legend color={T.ovule} label="Ovulation" />
            <Legend color="transparent" border={T.rose} label="Predicted" />
          </View>
        </View>

        <DayEditor
          date={selected}
          cycle={selectedCycle}
          flow={selectedLog?.flow ?? null}
          mood={selectedLog?.mood ?? null}
          symptoms={selectedLog?.symptoms ?? []}
          note={selectedLog?.note ?? ""}
          onStart={() => void save(startPeriodOn(period, selected))}
          onEnd={() => void save(endPeriodOn(period, selected))}
          onRemove={() => selectedCycle && setRemoveId(selectedCycle.id)}
          onFlow={(flow) => void save(upsertLog(period, selected, { flow }))}
          onMood={(mood) => void save(upsertLog(period, selected, { mood }))}
          onSymptoms={(symptoms) => void save(upsertLog(period, selected, { symptoms }))}
          onNote={(note) => void save(upsertLog(period, selected, { note }))}
        />

        {error ? (
          <Text style={{ marginTop: 12, color: T.roseDeep, fontSize: 14 }}>{error}</Text>
        ) : null}

        <View style={{ marginTop: 22 }}>
          <Text style={sectionLabel}>Typical rhythm</Text>
          <View
            style={{
              marginTop: 10,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              padding: 14,
              gap: 12,
            }}
          >
            <Stepper
              label="Cycle length"
              value={period.settings.typicalLength}
              unit="days"
              min={21}
              max={45}
              onChange={(typicalLength) =>
                void save(updateSettings(period, { typicalLength }))
              }
            />
            <Stepper
              label="Period length"
              value={period.settings.typicalPeriod}
              unit="days"
              min={2}
              max={10}
              onChange={(typicalPeriod) =>
                void save(updateSettings(period, { typicalPeriod }))
              }
            />
            <Text style={{ fontSize: 13, lineHeight: 18, color: T.dim }}>
              Predictions use your logged starts when we have them, then these defaults.
              Shared with {them}.
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 22, marginBottom: 8 }}>
          <Text style={sectionLabel}>Past cycles</Text>
          {!ready || history.length === 0 ? (
            <Text style={{ marginTop: 10, fontSize: 15, color: T.muted }}>
              Starts you log land here, oldest at the bottom.
            </Text>
          ) : (
            <View style={{ marginTop: 10, gap: 8 }}>
              {history.map((row) => (
                <View
                  key={row.cycle.id}
                  style={{
                    backgroundColor: T.surface,
                    borderWidth: 1,
                    borderColor: T.border,
                    padding: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>
                      {formatLongDate(row.cycle.start)}
                      {row.cycle.end ? ` – ${formatLongDate(row.cycle.end)}` : " · open"}
                    </Text>
                    <Text style={{ marginTop: 3, fontSize: 13, color: T.muted }}>
                      {row.bleed ? `${row.bleed}-day period` : "Length unknown"}
                      {row.length ? ` · ${row.length}-day cycle` : ""}
                    </Text>
                  </View>
                  <Pressable onPress={() => setRemoveId(row.cycle.id)} hitSlop={8}>
                    <Text style={{ color: T.rose, fontSize: 13 }}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </Stage>

      <ConfirmDialog
        open={Boolean(removeId)}
        title="Remove this cycle?"
        body="The start date and its predicted follow-on come off the calendar. Daily notes stay."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) void save(removeCycle(period, removeId));
          setRemoveId(null);
        }}
      />
    </Screen>
  );
}

function DayEditor({
  date,
  cycle,
  flow,
  mood,
  symptoms,
  note,
  onStart,
  onEnd,
  onRemove,
  onFlow,
  onMood,
  onSymptoms,
  onNote,
}: {
  date: string;
  cycle: ReturnType<typeof cycleForDate>;
  flow: PeriodFlow | null;
  mood: PeriodMood | null;
  symptoms: PeriodSymptom[];
  note: string;
  onStart: () => void;
  onEnd: () => void;
  onRemove: () => void;
  onFlow: (flow: PeriodFlow | null) => void;
  onMood: (mood: PeriodMood | null) => void;
  onSymptoms: (symptoms: PeriodSymptom[]) => void;
  onNote: (note: string) => void;
}) {
  const toggleSymptom = (id: PeriodSymptom) => {
    onSymptoms(
      symptoms.includes(id) ? symptoms.filter((item) => item !== id) : [...symptoms, id]
    );
  };

  return (
    <View
      style={{
        marginTop: 18,
        backgroundColor: T.surface,
        borderWidth: 1,
        borderColor: T.border,
        padding: 14,
      }}
    >
      <Text style={sectionLabel}>{formatLongDate(date)}</Text>
      <Text style={{ marginTop: 6, fontSize: 14, color: T.muted }}>
        {cycle
          ? cycle.start === date
            ? "Period started this day."
            : "This day is in a logged period."
          : "Not marked as a period day."}
      </Text>
      <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {!cycle || cycle.start !== date ? (
          <Pressable onPress={onStart} style={chip(true)}>
            <Text style={chipText(true)}>Started here</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onEnd} style={chip(Boolean(cycle))}>
          <Text style={chipText(Boolean(cycle))}>Ended here</Text>
        </Pressable>
        {cycle ? (
          <Pressable onPress={onRemove} style={chip(false)}>
            <Text style={chipText(false)}>Remove cycle</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={{ marginTop: 16, ...sectionLabel }}>Flow</Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FLOW_OPTIONS.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => onFlow(flow === row.id ? null : row.id)}
            style={chip(flow === row.id)}
          >
            <Text style={chipText(flow === row.id)}>{row.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ marginTop: 16, ...sectionLabel }}>How it felt</Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {MOOD_OPTIONS.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => onMood(mood === row.id ? null : row.id)}
            style={chip(mood === row.id)}
          >
            <Text style={chipText(mood === row.id)}>{row.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ marginTop: 16, ...sectionLabel }}>Symptoms</Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {SYMPTOM_OPTIONS.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => toggleSymptom(row.id)}
            style={chip(symptoms.includes(row.id))}
          >
            <Text style={chipText(symptoms.includes(row.id))}>{row.label}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={note}
        onChangeText={onNote}
        placeholder="A note for this day"
        placeholderTextColor={T.dim}
        style={{
          marginTop: 14,
          borderBottomWidth: 1,
          borderBottomColor: T.border,
          paddingVertical: 8,
          fontFamily: SERIF,
          fontSize: 16,
          color: T.ink,
        }}
      />
    </View>
  );
}

function Stepper({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          style={stepBtn}
        >
          <Text style={{ color: T.rose, fontSize: 18, fontWeight: "700" }}>–</Text>
        </Pressable>
        <Text style={{ minWidth: 72, textAlign: "center", color: T.ink, fontSize: 15 }}>
          {value} {unit}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          style={stepBtn}
        >
          <Text style={{ color: T.rose, fontSize: 18, fontWeight: "700" }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Legend({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          borderWidth: border ? 1.5 : 0,
          borderColor: border,
        }}
      />
      <Text style={{ fontSize: 12, color: T.muted }}>{label}</Text>
    </View>
  );
}

function fillFor(mark: DayMark): string {
  if (mark === "period") return T.rose;
  if (mark === "fertile") return T.fertileSoft;
  if (mark === "ovulation") return "rgba(111,143,110,0.28)";
  return "transparent";
}

function chip(on: boolean) {
  return {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: on ? T.rose : T.border,
    backgroundColor: on ? T.roseSoft : T.paper,
  };
}

function chipText(on: boolean) {
  return { fontSize: 13, color: on ? T.roseDeep : T.ink, fontWeight: "600" as const };
}

const sectionLabel = {
  fontSize: 11,
  fontWeight: "700" as const,
  letterSpacing: 1.6,
  textTransform: "uppercase" as const,
  color: T.rose,
};

const primaryBtn = {
  marginTop: 14,
  height: 44,
  backgroundColor: T.rose,
  justifyContent: "center" as const,
};

const primaryBtnText = {
  textAlign: "center" as const,
  color: T.paper,
  fontWeight: "800" as const,
  letterSpacing: 0.4,
};

const ghostBtn = {
  marginTop: 14,
  height: 44,
  borderWidth: 1,
  borderColor: T.rose,
  justifyContent: "center" as const,
};

const ghostBtnText = {
  textAlign: "center" as const,
  color: T.roseDeep,
  fontWeight: "700" as const,
};

const stepBtn = {
  width: 32,
  height: 32,
  borderWidth: 1,
  borderColor: T.border,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
