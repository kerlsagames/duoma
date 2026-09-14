import {
  dueCalendarReminders,
  markReminderFired,
  reminderAlreadyFired,
} from "@/lib/calendar-reminders";
import { useCalendarReminderItems } from "@/lib/useCalendarPrefs";
import { showLocalPush } from "@/lib/push";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

/** Fires a local notification when a General calendar reminder comes due. */
export function CalendarReminderWatch() {
  const reminders = useCalendarReminderItems();
  const ticking = useRef(false);

  useEffect(() => {
    const tick = async () => {
      if (ticking.current) return;
      ticking.current = true;
      try {
        const due = dueCalendarReminders(reminders);
        for (const row of due) {
          if (reminderAlreadyFired(row.id)) continue;
          markReminderFired(row.id);
          try {
            await showLocalPush({
              title: "Duoma",
              body: row.body,
              url: String(row.href),
            });
          } catch {
            // Permission off or unsupported — the home bell still shows it.
          }
        }
      } finally {
        ticking.current = false;
      }
    };

    void tick();
    const interval = setInterval(() => void tick(), 30000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void tick();
    });

    const onVisible = () => {
      if (Platform.OS === "web" && typeof document !== "undefined") {
        if (document.visibilityState === "visible") void tick();
      }
    };
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      clearInterval(interval);
      sub.remove();
      if (Platform.OS === "web" && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [reminders]);

  return null;
}
