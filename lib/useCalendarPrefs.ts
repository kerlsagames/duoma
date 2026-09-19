import {
  defaultCalendarPrefs,
  readCalendarPrefs,
  writeCalendarPrefs,
  type CalendarPrefs,
} from "@/lib/calendar-prefs";
import { buildCalendarReminders } from "@/lib/calendar-reminders";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useCalendarPrefs() {
  const [prefs, setPrefs] = useState<CalendarPrefs>(defaultCalendarPrefs);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () => {
      void readCalendarPrefs().then((next) => {
        if (!live) return;
        setPrefs(next);
        setReady(true);
      });
    };
    load();
    if (typeof window !== "undefined") {
      window.addEventListener("duoma:calendar-prefs", load);
      window.addEventListener("storage", load);
    }
    return () => {
      live = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("duoma:calendar-prefs", load);
        window.removeEventListener("storage", load);
      }
    };
  }, []);

  const save = useCallback((next: CalendarPrefs) => {
    setPrefs(next);
    void writeCalendarPrefs(next);
  }, []);

  return { prefs, save, ready };
}

export function useCalendarReminderItems() {
  const { calendarEvents, user } = useApp();
  const { data } = useMiniApps();
  const { prefs, ready } = useCalendarPrefs();
  return useMemo(() => {
    if (!ready) return [];
    const viewerId = user?.id;
    return buildCalendarReminders({
      birthdays: data.birthdays,
      trips: data.trips,
      jobs: data.maintenance,
      events: calendarEvents,
      prefs,
    }).filter((row) => !viewerId || !row.createdBy || row.createdBy !== viewerId);
  }, [
    ready,
    user?.id,
    data.birthdays,
    data.trips,
    data.maintenance,
    calendarEvents,
    prefs,
  ]);
}
