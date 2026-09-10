import { MonthGrid } from "@/components/hub/MonthGrid";
import { HubScreen } from "@/components/hub/HubScreen";
import { formatLongDate, localDateKey, monthGrid, addMonths } from "@/lib/dates";
import { useApp } from "@/lib/store";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function CalendarScreen() {
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selected, setSelected] = useState(localDateKey());
  const {
    nights,
    checkIns,
    milestones,
    bucketItems,
    ritualChecks,
    partner,
  } = useApp();

  const cells = monthGrid(cursor.year, cursor.month);
  const marks = useMemo(() => {
    const map: Record<string, string[]> = {};
    const add = (date: string | null | undefined, kind: string) => {
      if (!date) return;
      const list = map[date] ?? [];
      if (!list.includes(kind)) list.push(kind);
      map[date] = list;
    };
    nights.forEach((night) =>
      add(night.playedDate ?? night.updatedAt.slice(0, 10), "play")
    );
    checkIns.forEach((row) => add(row.date, "checkin"));
    milestones.forEach((row) => add(row.date, "milestone"));
    bucketItems.forEach((row) => {
      if (row.scheduledOn) add(row.scheduledOn, "date");
    });
    ritualChecks.forEach((row) => add(row.date, "ritual"));
    return map;
  }, [bucketItems, checkIns, milestones, nights, ritualChecks]);

  const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const dayNights = nights.filter(
    (night) => (night.playedDate ?? night.updatedAt.slice(0, 10)) === selected
  );
  const dayDates = bucketItems.filter((row) => row.scheduledOn === selected);
  const dayMarks = milestones.filter((row) => row.date === selected);
  const dayChecks = checkIns.filter((row) => row.date === selected);

  return (
    <HubScreen
      kicker="Shared calendar"
      title="Guard the 1-on-1"
      body="Play nights, planned dates, check-ins, and rituals on one month. This is how you keep couple time from disappearing into the week."
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => setCursor(addMonths(cursor.year, cursor.month, -1))}
        >
          <Text className="text-[16px] text-neon">←</Text>
        </Pressable>
        <Text className="text-[16px] font-semibold text-mist">{label}</Text>
        <Pressable
          onPress={() => setCursor(addMonths(cursor.year, cursor.month, 1))}
        >
          <Text className="text-[16px] text-neon">→</Text>
        </Pressable>
      </View>
      <MonthGrid
        cells={cells}
        marks={marks}
        selected={selected}
        onSelect={setSelected}
      />
      <Text className="mt-5 text-[12px] uppercase tracking-widest text-mist/40">
        {formatLongDate(selected)}
      </Text>
      <View className="mt-3 gap-2">
        {dayNights.map((night) => (
          <Text key={night.id} className="text-[15px] text-mist">
            Played {night.gameKey === "lets-talk" ? "Let's Talk" : "Get Spicy"}
          </Text>
        ))}
        {dayDates.map((item) => (
          <Text key={item.id} className="text-[15px] text-mist">
            Date night · {item.title}
          </Text>
        ))}
        {dayMarks.map((item) => (
          <Text key={item.id} className="text-[15px] text-mist">
            {item.kind} · {item.title}
          </Text>
        ))}
        {dayChecks.map((item) => (
          <Text key={item.id} className="text-[15px] text-mist">
            Check-in logged
            {item.userId === partner?.id ? ` by ${partner.displayName}` : ""}
          </Text>
        ))}
        {!dayNights.length &&
        !dayDates.length &&
        !dayMarks.length &&
        !dayChecks.length ? (
          <Text className="text-[15px] text-mist/55">
            Nothing on this day yet. Spin a date or play a night and it lands
            here.
          </Text>
        ) : null}
      </View>
    </HubScreen>
  );
}
