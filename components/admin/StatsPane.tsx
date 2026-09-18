import { buildGlobalStats, type GlobalAppStats, type GlobalHubStats } from "@/lib/admin-global-stats";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import { emptyMiniState } from "@/lib/mini-content";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const INK = "#F4F4F6";
const MUTED = "rgba(244,244,246,0.55)";
const DIM = "rgba(244,244,246,0.38)";
const PINK = "#FF007F";

export function StatsPane() {
  const {
    adminDb,
    adminMinis,
    allProfiles,
    allCouples,
    couple,
    ready,
    usingCloud,
    refreshCloudAccounts,
  } = useApp();
  const { data: liveMini } = useMiniApps();
  const [hubId, setHubId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !usingCloud) return;
    void refreshCloudAccounts();
  }, [ready, usingCloud, refreshCloudAccounts]);

  const stats = useMemo(() => {
    const minis = { ...adminMinis };
    if (couple?.id) minis[couple.id] = liveMini ?? minis[couple.id] ?? emptyMiniState();
    return buildGlobalStats({
      db: adminDb,
      minis,
      profiles: allProfiles,
      couples: allCouples,
    });
  }, [adminDb, adminMinis, allCouples, allProfiles, couple?.id, liveMini]);

  const hubs = [stats.home, ...stats.hubs];
  const hub = hubs.find((row) => row.id === hubId) ?? null;
  const app = hub?.apps.find((row) => row.id === appId) ?? null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Pressable
        onPress={() => {
          if (app) setAppId(null);
          else if (hub) setHubId(null);
        }}
      >
        {hub ? (
          <Text style={{ color: PINK, fontSize: 12 }}>{app ? "Back" : "All hubs"}</Text>
        ) : null}
      </Pressable>
      <Text style={{ color: INK, fontSize: 22, fontWeight: "800", marginTop: hub ? 8 : 0 }}>
        {app ? app.label : hub ? hub.label : "Stats"}
      </Text>
      <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20, fontSize: 14 }}>
        {app
          ? app.detail
          : hub
            ? hub.tagline
            : "Every live pair. Open a hub, then an app. Rankings show what people actually save, play, and rate."}
      </Text>

      {!hub ? (
        <Overview stats={stats} hubs={hubs} onHub={setHubId} />
      ) : !app ? (
        <HubView hub={hub} onApp={setAppId} />
      ) : (
        <AppView app={app} />
      )}
    </ScrollView>
  );
}

function Overview({
  stats,
  hubs,
  onHub,
}: {
  stats: ReturnType<typeof buildGlobalStats>;
  hubs: GlobalHubStats[];
  onHub: (id: string) => void;
}) {
  return (
    <View>
      <View style={{ marginTop: 18, gap: 4 }}>
        <Fact label="Pairs" value={String(stats.pairs)} />
        <Fact label="Live" value={String(stats.livePairs)} />
        <Fact label="Waiting" value={String(stats.waiting)} />
        <Fact label="People" value={String(stats.people)} />
        <Fact
          label="Total time"
          value={stats.totalSeconds ? formatActiveTime(stats.totalSeconds) : "—"}
        />
        <Fact label="Last activity" value={stats.lastAt ? formatWhen(stats.lastAt) : "—"} />
      </View>
      {hubs.every((hub) => hub.eventCount === 0 && hub.seconds === 0) ? (
        <Text style={{ color: DIM, marginTop: 20, lineHeight: 20 }}>
          No play uploaded yet. Open Duoma signed in so hubs reach the cloud, then refresh.
        </Text>
      ) : (
        <View style={{ marginTop: 22 }}>
          {hubs.map((hub) => (
            <Row
              key={hub.id}
              label={hub.label}
              hint={`${hub.usedApps}/${hub.totalApps} apps · ${hub.eventCount} events${
                hub.seconds ? ` · ${formatActiveTime(hub.seconds)}` : ""
              }`}
              onPress={() => onHub(hub.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function HubView({ hub, onApp }: { hub: GlobalHubStats; onApp: (id: string) => void }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: MUTED, fontSize: 12 }}>
        {hub.usedApps}/{hub.totalApps} apps used · {hub.eventCount} events
        {hub.seconds ? ` · ${formatActiveTime(hub.seconds)}` : ""}
      </Text>
      <View style={{ marginTop: 10 }}>
        {hub.apps.map((app) => (
          <Row
            key={app.id}
            label={app.label}
            hint={
              app.eventCount || app.seconds
                ? `${app.eventCount} events${app.lastAt ? ` · ${formatWhen(app.lastAt)}` : ""}${
                    app.seconds ? ` · ${formatActiveTime(app.seconds)}` : ""
                  }`
                : "no use"
            }
            onPress={() => onApp(app.id)}
          />
        ))}
      </View>
    </View>
  );
}

function AppView({ app }: { app: GlobalAppStats }) {
  return (
    <View style={{ marginTop: 16 }}>
      {app.facts.map((row) => (
        <Fact key={row.id} label={row.label} value={row.value} />
      ))}
      <Text style={{ color: DIM, fontSize: 11, marginTop: 18, marginBottom: 6 }}>
        {app.rankedLabel}
      </Text>
      {app.ranked.length === 0 ? (
        <Text style={{ color: DIM, fontSize: 12, lineHeight: 18 }}>
          {app.eventCount
            ? "Use is counted, but this app has no ranked cards yet."
            : "Nobody has used this yet."}
        </Text>
      ) : (
        app.ranked.map((row, index) => (
          <View
            key={row.id}
            style={{
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Text style={{ color: INK, fontSize: 13, lineHeight: 18 }}>
              {index + 1}. {row.title}
            </Text>
            <Text style={{ color: DIM, fontSize: 11, marginTop: 2 }}>{row.detail}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
      <Text style={{ flex: 1, color: MUTED, fontSize: 13 }}>{label}</Text>
      <Text style={{ maxWidth: "55%", color: INK, fontSize: 13, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function Row({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
      }}
    >
      <Text style={{ color: INK, fontSize: 15, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: DIM, fontSize: 12, marginTop: 2 }}>{hint}</Text>
    </Pressable>
  );
}
