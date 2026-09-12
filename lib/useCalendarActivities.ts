import {
  buildCalendarActivities,
  type CalendarActivity,
} from "@/lib/calendar-activity";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { useMemo } from "react";

export function useCalendarActivities(): CalendarActivity[] {
  const {
    nights,
    checkIns,
    milestones,
    bucketItems,
    ritualChecks,
    talkDraws,
    listEntries,
    coupleLists,
    spicyDares,
    coupons,
    jarNotes,
    curiosityAnswers,
    scratches,
    calendarEvents,
    partner,
    user,
  } = useApp();
  const { data } = useMiniApps();

  return useMemo(
    () =>
      buildCalendarActivities({
        nights,
        checkIns,
        milestones,
        bucketItems,
        ritualChecks,
        talkDraws,
        listEntries,
        coupleLists,
        spicyDares,
        coupons,
        jarNotes,
        curiosityAnswers,
        scratches,
        calendarEvents,
        birthdays: data.birthdays,
        trips: data.trips,
        maintenance: data.maintenance,
        partner,
        user,
      }),
    [
      nights,
      checkIns,
      milestones,
      bucketItems,
      ritualChecks,
      talkDraws,
      listEntries,
      coupleLists,
      spicyDares,
      coupons,
      jarNotes,
      curiosityAnswers,
      scratches,
      calendarEvents,
      data.birthdays,
      data.trips,
      data.maintenance,
      partner,
      user,
    ]
  );
}
