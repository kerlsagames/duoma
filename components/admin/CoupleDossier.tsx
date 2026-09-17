import { HubGlyph } from "@/components/hub/HubGlyph";
import {
  buildPartnerDossier,
  type AppInsight,
  type HubInsight,
  type PartnerDossier,
  type StatFact,
} from "@/lib/admin-partner-stats";
import { isDemoPair, isExampleAccount } from "@/lib/admin-example";
import { mergeCoupleDb, pullCoupleState } from "@/lib/couple-backup";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import { emptyMiniState, type MiniState } from "@/lib/mini-content";
import { SERIF } from "@/lib/app-themes";
import { useApp } from "@/lib/store";
import type { AppDB, Couple, Profile } from "@/lib/types";
import { listWhiteFlags, type WhiteFlag } from "@/lib/white-flag";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

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
  pairFooter,
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
  pairFooter?: ReactNode;
}) {
  const { couple: sessionCouple } = useApp();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [hubId, setHubId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [remoteSlice, setRemoteSlice] = useState<Partial<AppDB> | null>(null);
  const [remoteMini, setRemoteMini] = useState<MiniState | null>(null);
  const [flags, setFlags] = useState<WhiteFlag[]>([]);
  const [pulling, setPulling] = useState(false);

  useEffect(() => {
    setPartnerId(null);
    setHubId(null);
    setAppId(null);
    setRemoteSlice(null);
    setRemoteMini(null);
    let alive = true;
    setPulling(true);
    void pullCoupleState(couple.id)
      .then((remote) => {
        if (!alive || !remote) return;
        setRemoteSlice(remote.db);
        setRemoteMini(remote.mini);
      })
      .finally(() => {
        if (alive) setPulling(false);
      });
    void listWhiteFlags().then((rows) => {
      if (alive) setFlags(rows);
    });
    return () => {
      alive = false;
    };
  }, [couple.id]);

  const statsDb = useMemo(
    () => (remoteSlice ? mergeCoupleDb(db, couple.id, remoteSlice) : db),
    [couple.id, db, remoteSlice]
  );
  const sameCouple = sessionCouple?.id === couple.id;
  const statsMini = sameCouple ? mini : remoteMini ?? emptyMiniState();

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
        width: stacked ? "100%" : 460,
        backgroundColor: "#0F0F14",
        borderLeftWidth: stacked ? 0 : 1,
        borderLeftColor: "rgba(255,255,255,0.1)",
        borderTopWidth: stacked ? 1 : 0,
        borderTopColor: "rgba(255,255,255,0.1)",
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 56 }}>
        <Pressable
          onPress={() => {
            if (app) setAppId(null);
            else if (hub) setHubId(null);
            else if (partner) setPartnerId(null);
            else onClose();
          }}
        >
          <Text style={{ color: "#FF007F", fontWeight: "700", fontSize: 12 }}>
            {app ? "Back to hub" : hub ? "Back to partner" : partner ? "Back to pair" : "Close record"}
          </Text>
        </Pressable>
        <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800", marginTop: 8 }}>
          {couple.inviteCode}
          {demo ? " · demo" : ""}
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 4, fontSize: 12 }}>
          {a?.displayName ?? "—"} × {b?.displayName ?? "waiting"} · paired {formatWhen(couple.pairedAt)}
          {pulling ? " · loading backup" : ""}
        </Text>

        {!partner ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 13, lineHeight: 18 }}>
              Pick a partner. General stats first, then the four hubs, then each app.
            </Text>
            <PartnerPick
              label="Partner A"
              profile={a}
              onOpen={() => a && setPartnerId(a.id)}
            />
            <PartnerPick
              label="Partner B"
              profile={b}
              onOpen={() => b && setPartnerId(b.id)}
            />
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

        {!partner ? pairFooter : null}
      </ScrollView>
    </View>
  );
}

function PartnerPick({
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
      <View
        style={{
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 14 }}>{label} · waiting to join</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onOpen}
      style={{
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 11, letterSpacing: 1.2 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ color: "#F4F4F6", fontSize: 18, fontWeight: "800", marginTop: 4 }}>
        {profile.displayName}
        {profile.bannedAt ? " · BANNED" : ""}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 6, fontSize: 12 }}>
        last login {formatWhen(profile.lastSeenAt)} · {formatActiveTime(profile.activeSeconds)} in app
      </Text>
      <Text style={{ color: "#FF007F", marginTop: 8, fontWeight: "700", fontSize: 12 }}>
        Open stats
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
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 20, fontWeight: "800" }}>
        {profile.displayName}
        {banned ? " · BANNED" : ""}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 12 }}>
        {profile.email || "no email"}
      </Text>
      <View style={{ marginTop: 14, gap: 6 }}>
        {dossier.facts.map((row) => (
          <FactRow key={row.id} fact={row} />
        ))}
      </View>

      <Text
        style={{
          marginTop: 22,
          color: "rgba(244,244,246,0.45)",
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
        }}
      >
        HOME SCREEN
      </Text>
      <HubTile hub={dossier.home} onPress={() => onHub("home")} />

      <Text
        style={{
          marginTop: 18,
          color: "rgba(244,244,246,0.45)",
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
        }}
      >
        HUBS
      </Text>
      <View
        style={{
          marginTop: 8,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {dossier.hubs.map((hub) => (
          <HubSquare key={hub.id} hub={hub} onPress={() => onHub(hub.id)} />
        ))}
      </View>

      {locked ? (
        <Text style={{ color: "rgba(244,244,246,0.4)", marginTop: 18, fontSize: 12 }}>
          Demo pair — cannot be banned.
        </Text>
      ) : banned ? (
        <Pressable onPress={() => onUnban(profile.id)} style={{ marginTop: 18 }}>
          <Text style={{ color: "#3ECFBF", fontWeight: "700", fontSize: 12 }}>Unban</Text>
        </Pressable>
      ) : (
        <View style={{ marginTop: 18 }}>
          <TextInput
            value={reason}
            onChangeText={onReason}
            placeholder="Ban reason"
            placeholderTextColor="rgba(244,244,246,0.35)"
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: 8,
              color: "#F4F4F6",
              fontSize: 12,
            }}
          />
          <Pressable onPress={() => onBan(profile.id)} style={{ marginTop: 8 }}>
            <Text style={{ color: "#FF8A8A", fontWeight: "700", fontSize: 12 }}>Ban</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function HubHome({ hub, onApp }: { hub: HubInsight; onApp: (id: string) => void }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>{hub.label}</Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 13 }}>
        {hub.tagline} · {hub.usedApps}/{hub.totalApps} apps used · {formatActiveTime(hub.seconds)} in
        hub
      </Text>
      <View style={{ marginTop: 14, gap: 8 }}>
        {hub.apps.map((app) => (
          <Pressable
            key={app.id}
            onPress={() => onApp(app.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 10,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: app.events.length || app.seconds ? "rgba(255,0,127,0.28)" : "rgba(255,255,255,0.08)",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: hub.tile,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HubGlyph icon={app.icon} mark={app.mark} size={20} color={hub.tileInk} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#F4F4F6", fontWeight: "700", fontSize: 14 }}>{app.label}</Text>
              <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 11, marginTop: 2 }}>
                {app.events.length ? `${app.events.length} events` : "no events yet"}
                {app.lastAt ? ` · ${formatWhen(app.lastAt)}` : ""}
                {app.seconds ? ` · ${formatActiveTime(app.seconds)}` : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(244,244,246,0.35)" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AppHome({ app }: { app: AppInsight }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>{app.label}</Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 13, lineHeight: 18 }}>
        {app.detail}
      </Text>
      <View style={{ marginTop: 14, gap: 6 }}>
        {app.facts.map((row) => (
          <FactRow key={row.id} fact={row} />
        ))}
      </View>
      <Text
        style={{
          marginTop: 20,
          color: "rgba(244,244,246,0.45)",
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
        }}
      >
        DETAIL
      </Text>
      {app.events.length === 0 ? (
        <Text style={{ color: "rgba(244,244,246,0.4)", marginTop: 10, fontSize: 13 }}>
          Nothing logged in this app yet. Empty is useful — it tells you they never opened it, or
          the phone never synced it here.
        </Text>
      ) : (
        app.events.map((row) => (
          <View
            key={row.id}
            style={{
              marginTop: 10,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Text style={{ color: "#F4F4F6", fontSize: 13, lineHeight: 18 }}>{row.title}</Text>
            <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 11, marginTop: 3 }}>
              {row.at ? formatWhen(row.at) : "no time"}
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
    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <Text style={{ flex: 1, color: "rgba(244,244,246,0.55)", fontSize: 12 }}>{fact.label}</Text>
      <Text
        style={{
          maxWidth: "52%",
          color: "#F4F4F6",
          fontSize: 12,
          fontWeight: "700",
          textAlign: "right",
        }}
      >
        {fact.value}
      </Text>
    </View>
  );
}

function HubSquare({ hub, onPress }: { hub: HubInsight; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "48%",
        marginBottom: 8,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: hub.tile,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.22)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={hub.icon} size={28} color={hub.tileInk} />
      </View>
      <View style={{ width: "100%", alignItems: "center" }}>
        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            lineHeight: 22,
            color: hub.tileInk,
            textAlign: "center",
          }}
        >
          {hub.label}
        </Text>
        <Text
          style={{
            marginTop: 2,
            color: hub.tileInk,
            opacity: 0.72,
            fontSize: 11,
            lineHeight: 14,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {hub.usedApps}/{hub.totalApps} apps · {formatActiveTime(hub.seconds)}
        </Text>
      </View>
    </Pressable>
  );
}

function HubTile({ hub, onPress }: { hub: HubInsight; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: 8,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: hub.tile,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.22)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={hub.icon} size={22} color={hub.tileInk} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 18, color: hub.tileInk }}>{hub.label}</Text>
        <Text style={{ marginTop: 2, color: hub.tileInk, opacity: 0.72, fontSize: 11 }}>
          {hub.usedApps}/{hub.totalApps} used · last {formatWhen(hub.lastAt)}
        </Text>
      </View>
    </Pressable>
  );
}
