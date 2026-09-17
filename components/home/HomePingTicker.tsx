import { LOVEBETZ_SCRIPT } from "@/lib/app-themes";
import { formatRelativeWhen } from "@/lib/dates";
import { useMiniApps } from "@/lib/mini-apps";
import { PING_KINDS } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import { FlowingTape } from "@/components/ui/FlowingTape";
import { useRouter, type Href } from "expo-router";
import { useMemo } from "react";

const GAP = "        ";

export function HomePingTicker() {
  const router = useRouter();
  const { couple } = useApp();
  const { data } = useMiniApps();
  const ping = useMemo(() => {
    const rows = data.pings ?? [];
    if (!rows.length) return null;
    return [...rows].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    )[0];
  }, [data.pings]);
  const meta = ping
    ? (PING_KINDS.find((row) => row.id === ping.kind) ?? PING_KINDS[0]!)
    : null;

  if (!couple || !ping || !meta) return null;

  const when = formatRelativeWhen(ping.createdAt);
  const line = `${meta.emoji}  ${meta.label}   ${when}`;

  return (
    <FlowingTape
      text={`${line}${GAP}`}
      color={meta.color}
      height={42}
      fontSize={22}
      fontFamily={LOVEBETZ_SCRIPT}
      fontWeight="400"
      letterSpacing={0.2}
      speed={26}
      onPress={() => router.push("/hub/thought-pings" as Href)}
      accessibilityLabel={`Thought of you ping. ${meta.label}, ${when}`}
      style={{ marginLeft: 10, marginRight: 10, marginBottom: 2 }}
    />
  );
}
