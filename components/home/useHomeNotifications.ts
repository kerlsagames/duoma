import {
  buildHomeNotifications,
  gameResumeHref,
} from "@/lib/home-status";
import {
  defaultNotificationPrefs,
  dismissNotificationIds,
  prefsShowStatusId,
  readNotificationPrefs,
  subscribeNotificationPrefs,
  writeNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs";
import { useCalendarReminderItems } from "@/lib/useCalendarPrefs";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useHomeNotifications(onStartSpicy: () => void) {
  const router = useRouter();
  const {
    user,
    partner,
    game,
    checkIns,
    incomingCheckInRequest,
    coupons,
    jarNotes,
    curiosityAnswers,
    milestones,
    bucketItems,
    talkDraws,
    listEntries,
    spicyDares,
    partnerPokes,
    chickenPlays,
    fantasySwipes,
    fantasyTonightAsks,
    dateNightAsks,
    positionInvites,
    roleplayInvites,
  } = useApp();
  const { data: mini } = useMiniApps();
  const calendarReminders = useCalendarReminderItems();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs());

  useFocusEffect(
    useCallback(() => {
      void readNotificationPrefs().then(setPrefs);
    }, [])
  );

  useEffect(() => subscribeNotificationPrefs(setPrefs), []);

  const rows = useMemo(
    () =>
      buildHomeNotifications({
        user,
        partner,
        game,
        checkIns,
        incomingCheckInRequest,
        coupons,
        jarNotes,
        curiosityAnswers,
        milestones,
        bucketItems,
        talkDraws,
        listEntries,
        spicyDares,
        partnerPokes,
        chickenPlays,
        fantasySwipes,
        fantasyTonightAsks,
        dateNightAsks,
        positionInvites,
        roleplayInvites,
        sexyVault: mini.sexyVault,
        calendarReminders,
        whiteFlags: mini.whiteFlags,
      }).filter((item) => prefsShowStatusId(prefs, item.id)),
    [
      user,
      partner,
      game,
      checkIns,
      incomingCheckInRequest,
      coupons,
      jarNotes,
      curiosityAnswers,
      milestones,
      bucketItems,
      talkDraws,
      listEntries,
      spicyDares,
      partnerPokes,
      chickenPlays,
      fantasySwipes,
      fantasyTonightAsks,
      dateNightAsks,
      positionInvites,
      roleplayInvites,
      mini.sexyVault,
      mini.whiteFlags,
      mini.spark?.asks,
      calendarReminders,
      prefs,
    ]
  );

  const persist = (next: NotificationPrefs) => {
    setPrefs(next);
    void writeNotificationPrefs(next);
  };

  const openGame = () => {
    const href = gameResumeHref(game);
    if (href) {
      router.push(href);
      return;
    }
    if (game?.status === "inviting") return;
    onStartSpicy();
  };

  const goTo = (id: string, href: Href) => {
    persist(dismissNotificationIds(prefs, [id]));
    if (id === "game" || id.startsWith("game")) {
      openGame();
      return;
    }
    router.push(href);
  };

  return { rows, prefs, persist, goTo, inbox: prefs.inbox };
}
