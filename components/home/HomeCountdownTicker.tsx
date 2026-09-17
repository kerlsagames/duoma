import { useAppLook } from "@/lib/app-prefs";
import { tickerLine } from "@/lib/countdown-ticker";
import { useApp } from "@/lib/store";
import { FlowingTape } from "@/components/ui/FlowingTape";
import { useRouter, type Href } from "expo-router";
import { useMemo } from "react";

const GAP = "   ·   ";
const PINK = "#FF8AB8";

export function HomeCountdownTicker() {
  const router = useRouter();
  const { milestones, couple } = useApp();
  const look = useAppLook("milestones", "#FF007F", {
    hidePast: false,
    asWeeks: false,
    tickerAll: false,
  });
  const line = useMemo(
    () =>
      tickerLine(milestones, {
        tickerAll: look.prefs.tickerAll,
        asWeeks: look.prefs.asWeeks,
      }),
    [look.prefs.asWeeks, look.prefs.tickerAll, milestones]
  );

  if (!couple || !line) return null;

  return (
    <FlowingTape
      text={`${line}${GAP}`}
      color={PINK}
      height={28}
      fontSize={12}
      fontWeight="700"
      letterSpacing={0.3}
      onPress={() => router.push("/hub/milestones" as Href)}
      accessibilityLabel={`Countdown ticker. ${line}`}
      style={{ marginLeft: 10, marginRight: 10, marginBottom: 6 }}
    />
  );
}
