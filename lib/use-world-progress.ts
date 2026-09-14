import { buildEdenSnapshot, type EdenSnapshot } from "@/lib/eden";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { AudioNote, PhotoMemory, Prediction } from "@/lib/mini-content";
import type { Coupon } from "@/lib/types";
import { listWhiteFlags } from "@/lib/white-flag";
import { useEffect, useMemo, useState } from "react";

export type WorldExtras = {
  photos: PhotoMemory[];
  notes: AudioNote[];
  bets: Prediction[];
  coupons: Coupon[];
  curiosity: number;
  dates: number;
};

export function useWorldProgress(): {
  snapshot: EdenSnapshot;
  extras: WorldExtras;
  ready: boolean;
} {
  const {
    nights,
    checkIns,
    curiosityAnswers,
    jarNotes,
    talkDraws,
    spicyDares,
    positionInvites,
    roleplayInvites,
    fantasySwipes,
    calendarEvents,
    coupons,
  } = useApp();
  const { data, ready } = useMiniApps();
  const [flags, setFlags] = useState<{ createdAt: string }[]>([]);

  useEffect(() => {
    let alive = true;
    listWhiteFlags().then((rows) => {
      if (alive) setFlags(rows);
    });
    return () => {
      alive = false;
    };
  }, []);

  const snapshot = useMemo(
    () =>
      buildEdenSnapshot({
        pings: data.pings,
        audioNotes: data.audioNotes,
        jarNotes,
        curiosityAnswers,
        talkDraws,
        whiteFlags: flags,
        checkIns,
        photos: data.photos,
        nights,
        dares: spicyDares,
        positions: positionInvites,
        roleplays: roleplayInvites,
        fantasySwipes,
        dateEvents: calendarEvents,
      }),
    [
      data.pings,
      data.audioNotes,
      data.photos,
      jarNotes,
      curiosityAnswers,
      talkDraws,
      flags,
      checkIns,
      nights,
      spicyDares,
      positionInvites,
      roleplayInvites,
      fantasySwipes,
      calendarEvents,
    ]
  );

  return {
    snapshot,
    extras: {
      photos: data.photos,
      notes: data.audioNotes,
      bets: data.predictions.filter((row) => row.status === "settled"),
      coupons,
      curiosity: curiosityAnswers.length,
      dates: calendarEvents.length,
    },
    ready,
  };
}
