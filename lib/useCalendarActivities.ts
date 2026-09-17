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
    talkDraws,
    listEntries,
    coupleLists,
    spicyDares,
    coupons,
    jarNotes,
    curiosityAnswers,
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
        talkDraws,
        listEntries,
        coupleLists,
        spicyDares,
        coupons,
        jarNotes,
        curiosityAnswers,
        calendarEvents,
        birthdays: data.birthdays,
        trips: data.trips,
        maintenance: data.maintenance,
        period: data.period,
        intimacy: data.intimacy,
        partner,
        user,
      }),
    [
      nights,
      checkIns,
      milestones,
      bucketItems,
      talkDraws,
      listEntries,
      coupleLists,
      spicyDares,
      coupons,
      jarNotes,
      curiosityAnswers,
      calendarEvents,
      data.birthdays,
      data.trips,
      data.maintenance,
      data.period,
      data.intimacy,
      partner,
      user,
    ]
  );
}
