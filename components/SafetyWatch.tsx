import { writeMediaCoupleId } from "@/lib/safety";
import { useApp } from "@/lib/store";
import { useEffect } from "react";

/**
 * Remember which pair this phone is showing. Switching into the Riley demo,
 * signing out, or opening another pair must not wipe photos or vaults —
 * those stay under each couple’s own keys. Unpair / delete still wipe on
 * purpose from those actions.
 */
export function SafetyWatch() {
  const { couple, ready } = useApp();

  useEffect(() => {
    if (!ready) return;
    const current = couple?.id ?? null;
    if (current) void writeMediaCoupleId(current);
  }, [ready, couple?.id]);

  return null;
}
