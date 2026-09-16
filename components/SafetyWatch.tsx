import { emptyMiniState } from "@/lib/mini-content";
import {
  readMediaCoupleId,
  wipeLocalMediaCaches,
  writeMediaCoupleId,
} from "@/lib/safety";
import { useApp } from "@/lib/store";
import { useMiniApps } from "@/lib/mini-apps";
import { useEffect, useRef } from "react";

/**
 * If the pairing id changed (unpair on this phone or the other), drop local
 * vaults, voice clips, and photo memory without needing a restart.
 */
export function SafetyWatch() {
  const { couple, ready } = useApp();
  const { patch } = useMiniApps();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    void (async () => {
      const stored = await readMediaCoupleId();
      if (!alive) return;
      const current = couple?.id ?? null;
      last.current = stored;
      if (stored && current && stored !== current) {
        await wipeLocalMediaCaches();
        await patch(() => emptyMiniState());
      }
      if (current) await writeMediaCoupleId(current);
    })();
    return () => {
      alive = false;
    };
  }, [ready, couple?.id, patch]);

  return null;
}
