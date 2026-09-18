import {
  buildPartnerDossier,
  type AppInsight,
  type HubInsight,
  type PartnerDossier,
  type StatFact,
} from "@/lib/admin-partner-stats";
import { isDemoPair, isExampleAccount } from "@/lib/admin-example";
import { mergeCoupleDb, mergeMiniStates, pullCoupleState } from "@/lib/couple-backup";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import { emptyMiniState, type MiniState } from "@/lib/mini-content";
import { peekMiniForCouple } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { AppDB, Couple, Profile } from "@/lib/types";
import { listWhiteFlags, type WhiteFlag } from "@/lib/white-flag";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const INK = "#F4F4F6";
const MUTED = "rgba(244,244,246,0.55)";
const DIM = "rgba(244,244,246,0.38)";
const PINK = "#FF007F";

export function CoupleDossier({
  couple,
  a,
  b,
  example,
  db,
  mini,
  stacked,
  reason,
  onReason,
  onClose,
  onBan,
  onUnban,
}: {
  couple: Couple;
  a: Profile | null;
  b: Profile | null;
  example: boolean;
  db: AppDB;
  mini: MiniState;
  stacked: boolean;
  reason: string;
  onReason: (value: string) => void;
  onClose: () => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
}) {
  const { couple: sessionCouple, adminDb, adminMinis } = useApp();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [hubId, setHubId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [remoteSlice, setRemoteSlice] = useState<Partial<AppDB> | null>(null);
  const [remoteMini, setRemoteMini] = useState<MiniState | null>(null);
  const [localMini, setLocalMini] = useState<MiniState | null>(null);
  const [flags, setFlags] = useState<WhiteFlag[]>([]);
  const [pulling, setPulling] = useState(false);

  useEffect(() => {
    setPartnerId(null);
    setHubId(null);
    setAppId(null);
    setRemoteSlice(null);
    setRemoteMini(null);
    setLocalMini(null);
    let alive = true;
    setPulling(true);
    const twinIds = [
      couple.id,
      ...adminDb.couples
        .filter((row) => row.inviteCode === couple.inviteCode)
        .map((row) => row.id),
    ].filter((id, index, all) => all.indexOf(id) === index);
    void Promise.all([
      Promise.all(twinIds.map((id) => pullCoupleState(id).catch(() => null))),
      Promise.all(twinIds.map((id) => peekMiniForCouple(id).catch(() => null))),
      listWhiteFlags().catch(() => [] as WhiteFlag[]),
    ]).then(([remotes, peeked, rows]) => {
      if (!alive) return;
      const remote = remotes.reduce<(typeof remotes)[number]>((acc, row) => {
        if (!row) return acc;
        if (!acc) return row;
        return {
          db: { ...acc.db, ...row.db },
          mini: mergeMiniStates(acc.mini, row.mini),
          media: row.media ?? acc.media,
          savedAt: row.savedAt > acc.savedAt ? row.savedAt : acc.savedAt,
        };
      }, null);
      if (remote) {
        setRemoteSlice(remote.db);
        setRemoteMini(remote.mini);
      }
      const peekedMini = peeked.reduce<MiniState | null>((acc, row) => {
        if (!row) return acc;
        return acc ? mergeMiniStates(acc, row) : row;
      }, null);
      if (peekedMini) setLocalMini(peekedMini);
      setFlags(rows ?? []);
      setPulling(false);
    });
    return () => {
      alive = false;
    };
  }, [adminDb.couples, couple.id, couple.inviteCode]);

  const statsDb = useMemo(
    () => (remoteSlice ? mergeCoupleDb(db, couple.id, remoteSlice) : db),
    [couple.id, db, remoteSlice]
  );
  const sameCouple =
    sessionCouple?.id === couple.id || sessionCouple?.inviteCode === couple.inviteCode;
  const statsMini = useMemo(() => {
    const twinIds = [
      couple.id,
      ...adminDb.couples
        .filter((row) => row.inviteCode === couple.inviteCode)
        .map((row) => row.id),
    ];
    const layers = [
      ...twinIds.map((id) => adminMinis[id]),
      remoteMini,
      localMini,
      sameCouple ? mini : null,
    ].filter((row): row is MiniState => Boolean(row));
    if (!layers.length) return emptyMiniState();
    return layers.reduce((acc, row) => mergeMiniStates(acc, row));
  }, [adminDb.couples, adminMinis, couple.id, couple.inviteCode, localMini, mini, remoteMini, sameCouple]);

  const partner = partnerId === a?.id ? a : partnerId === b?.id ? b : null;
  const dossier = useMemo(() => {
    if (!partner) return null;
    return buildPartnerDossier({
      db: statsDb,
      mini: statsMini,
      profile: partner,
      couple,
      flags,
    });
  }, [couple, flags, partner, statsDb, statsMini]);

  const hub =
    dossier && hubId
      ? hubId === "home"
        ? dossier.home
        : dossier.hubs.find((row) => row.id === hubId) ?? null
      : null;
  const app = hub && appId ? hub.apps.find((row) => row.id === appId) ?? null : null;
  const demo = example || isDemoPair(a, b);

  return (
    <View
      style={{
        position: stacked ? "relative" : "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: stacked ? "100%" : 340,
        backgroundColor: "#101014",
        borderLeftWidth: stacked ? 0 : 1,
        borderLeftColor: "rgba(255,255,255,0.12)",
        borderTopWidth: stacked ? 1 : 0,
        borderTopColor: "rgba(255,255,255,0.12)",
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
        <Pressable
          onPress={() => {
            if (app) setAppId(null);
            else if (hub) setHubId(null);
            else if (partner) setPartnerId(null);
            else onClose();
          }}
        >
          <Text style={{ color: PINK, fontSize: 12 }}>
            {app ? "Back" : hub ? "Back" : partner ? "Back" : "Close"}
          </Text>
        </Pressable>
        <Text style={{ color: INK, fontSize: 14, fontWeight: "700", marginTop: 8 }}>
          {couple.inviteCode}
          {demo ? " demo" : ""}
        </Text>
        <Text style={{ color: DIM, marginTop: 2, fontSize: 12 }}>
          {a?.displayName ?? "—"} / {b?.displayName ?? "waiting"} · {formatWhen(couple.pairedAt)}
          {pulling ? " · loading" : ""}
        </Text>
        <Text style={{ color: MUTED, marginTop: 6, fontSize: 12 }}>
          {statsMini.birthdays.length
            ? `${statsMini.birthdays.length} birthday${statsMini.birthdays.length === 1 ? "" : "s"} · ${statsMini.birthdays
                .map((row) => row.name)
                .slice(0, 6)
                .join(", ")}`
            : "No birthdays yet"}
        </Text>
        {!demo && !statsMini.birthdays.length && !pulling ? (
          <Text style={{ color: DIM, marginTop: 8, fontSize: 11, lineHeight: 16 }}>
            This pair’s hubs have not reached the cloud. Open Duoma signed in as{" "}
            {a?.displayName || "them"} (the real app, not this admin page), stay on a
            hub for a few seconds, then refresh Users.
          </Text>
        ) : null}
        {demo ? (
          <Text style={{ color: DIM, marginTop: 6, fontSize: 11, lineHeight: 15 }}>
            Riley sandbox on this browser. Seeded lists and anything you did in Demo are stored
            here.
          </Text>
        ) : null}

        {!partner ? (
          <View style={{ marginTop: 14 }}>
            <PersonLink label="A" profile={a} onOpen={() => a && setPartnerId(a.id)} />
            <PersonLink label="B" profile={b} onOpen={() => b && setPartnerId(b.id)} />
          </View>
        ) : !hub && dossier ? (
          <PartnerHome
            profile={partner}
            dossier={dossier}
            locked={demo || isExampleAccount(partner.id)}
            reason={reason}
            onReason={onReason}
            onBan={onBan}
            onUnban={onUnban}
            onHub={(id) => {
              setHubId(id);
              setAppId(null);
            }}
          />
        ) : hub && !app ? (
          <HubHome hub={hub} onApp={(id) => setAppId(id)} />
        ) : app ? (
          <AppHome app={app} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function PersonLink({
  label,
  profile,
  onOpen,
}: {
  label: string;
  profile: Profile | null;
  onOpen: () => void;
}) {
  if (!profile) {
    return (
      <Text style={{ color: DIM, fontSize: 13, marginTop: 8 }}>{label} waiting</Text>
    );
  }
  return (
    <Pressable onPress={onOpen} style={{ paddingVertical: 8 }}>
      <Text style={{ color: INK, fontSize: 13 }}>
        {label} {profile.displayName}
        {profile.bannedAt ? " banned" : ""}
      </Text>
      <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
        Signed up {formatWhen(profile.createdAt)}
      </Text>
      <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
        Last used {formatWhen(profile.lastSeenAt)}
      </Text>
    </Pressable>
  );
}

function PartnerHome({
  profile,
  dossier,
  locked,
  reason,
  onReason,
  onBan,
  onUnban,
  onHub,
}: {
  profile: Profile;
  dossier: PartnerDossier;
  locked: boolean;
  reason: string;
  onReason: (value: string) => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
  onHub: (id: string) => void;
}) {
  const banned = Boolean(profile.bannedAt);
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: INK, fontSize: 14, fontWeight: "700" }}>
        {profile.displayName}
        {banned ? " banned" : ""}
      </Text>
      <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
        {profile.email || "no email"}
      </Text>
      <View style={{ marginTop: 10 }}>
        {dossier.facts.map((row) => (
          <FactRow key={row.id} fact={row} />
        ))}
      </View>
      <Text style={{ color: DIM, fontSize: 11, marginTop: 14, marginBottom: 4 }}>Home</Text>
      <ListLink
        label={dossier.home.label}
        hint={`${dossier.home.usedApps}/${dossier.home.totalApps} · ${formatActiveTime(dossier.home.seconds)}`}
        onPress={() => onHub("home")}
      />
      <Text style={{ color: DIM, fontSize: 11, marginTop: 12, marginBottom: 4 }}>Hubs</Text>
      {dossier.hubs.map((hub) => (
        <ListLink
          key={hub.id}
          label={hub.label}
          hint={`${hub.usedApps}/${hub.totalApps} used · ${hub.eventCount} events`}
          onPress={() => onHub(hub.id)}
        />
      ))}
      {locked ? (
        <Text style={{ color: DIM, marginTop: 14, fontSize: 12 }}>Demo pair — cannot ban.</Text>
      ) : banned ? (
        <Pressable onPress={() => onUnban(profile.id)} style={{ marginTop: 14 }}>
          <Text style={{ color: "#3ECFBF", fontSize: 12 }}>Unban</Text>
        </Pressable>
      ) : (
        <View style={{ marginTop: 14 }}>
          <TextInput
            value={reason}
            onChangeText={onReason}
            placeholder="Ban reason"
            placeholderTextColor={DIM}
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              borderRadius: 4,
              padding: 6,
              color: INK,
              fontSize: 12,
            }}
          />
          <Pressable onPress={() => onBan(profile.id)} style={{ marginTop: 6 }}>
            <Text style={{ color: "#FF8A8A", fontSize: 12 }}>Ban</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function HubHome({ hub, onApp }: { hub: HubInsight; onApp: (id: string) => void }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: INK, fontSize: 14, fontWeight: "700" }}>{hub.label}</Text>
      <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
        {hub.usedApps}/{hub.totalApps} used · {hub.eventCount} events
        {hub.seconds ? ` · ${formatActiveTime(hub.seconds)}` : ""}
      </Text>
      <View style={{ marginTop: 8 }}>
        {hub.apps.map((app) => (
          <ListLink
            key={app.id}
            label={app.label}
            hint={
              app.events.length || app.seconds
                ? `${app.events.length} events${app.lastAt ? ` · ${formatWhen(app.lastAt)}` : ""}${app.seconds ? ` · ${formatActiveTime(app.seconds)}` : ""}`
                : "no use"
            }
            onPress={() => onApp(app.id)}
          />
        ))}
      </View>
    </View>
  );
}

function AppHome({ app }: { app: AppInsight }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: INK, fontSize: 14, fontWeight: "700" }}>{app.label}</Text>
      <View style={{ marginTop: 8 }}>
        {app.facts.map((row) => (
          <FactRow key={row.id} fact={row} />
        ))}
      </View>
      <Text style={{ color: DIM, fontSize: 11, marginTop: 12, marginBottom: 4 }}>Log</Text>
      {app.events.length === 0 ? (
        <Text style={{ color: DIM, fontSize: 12 }}>Nothing logged.</Text>
      ) : (
        app.events.map((row) => (
          <View key={row.id} style={{ paddingVertical: 5 }}>
            <Text style={{ color: INK, fontSize: 12, lineHeight: 16 }}>{row.title}</Text>
            <Text style={{ color: DIM, fontSize: 11, marginTop: 1 }}>
              {row.at ? formatWhen(row.at) : "—"}
              {row.detail ? ` · ${row.detail}` : ""}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function FactRow({ fact }: { fact: StatFact }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
      <Text style={{ flex: 1, color: MUTED, fontSize: 12 }}>{fact.label}</Text>
      <Text style={{ maxWidth: "50%", color: INK, fontSize: 12, textAlign: "right" }}>
        {fact.value}
      </Text>
    </View>
  );
}

function ListLink({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 6 }}>
      <Text style={{ color: INK, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: DIM, fontSize: 11, marginTop: 1 }}>{hint}</Text>
    </Pressable>
  );
}
