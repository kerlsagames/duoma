import { groupUsageItems, usageForProfile, type UsageGroup } from "@/lib/account-usage";
import {
  EXAMPLE_COUPLE,
  EXAMPLE_PROFILES,
  exampleUsage,
  isDemoPair,
  isExampleAccount,
} from "@/lib/admin-example";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import type { MiniState } from "@/lib/mini-content";
import { useMiniApps } from "@/lib/mini-apps";
import { resolveSexyVaultSrc, type SexyVaultItem } from "@/lib/sexy-vault";
import { useApp } from "@/lib/store";
import type { Couple, Profile } from "@/lib/types";
import { createElement, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

const COL = {
  code: 88,
  a: 130,
  b: 130,
  last: 120,
  loc: 140,
  time: 80,
  status: 88,
  age: 48,
} as const;

type SheetRow = {
  couple: Couple;
  a: Profile | null;
  b: Profile | null;
  example: boolean;
};

function statusOf(row: SheetRow): string {
  if (row.a?.bannedAt || row.b?.bannedAt) return "Banned";
  if (row.example || isDemoPair(row.a, row.b)) return "Demo";
  if (!row.b) return "Waiting";
  return "Live";
}

function latestSeen(row: SheetRow): string | null {
  const stamps = [row.a?.lastSeenAt, row.b?.lastSeenAt].filter(Boolean) as string[];
  if (!stamps.length) return null;
  return stamps.sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function Cell({
  width,
  children,
  bold,
  color,
}: {
  width: number;
  children: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <Text
      numberOfLines={1}
      style={{
        width,
        paddingHorizontal: 8,
        paddingVertical: 9,
        color: color ?? "#F4F4F6",
        fontSize: 12,
        fontWeight: bold ? "800" : "500",
        fontFamily: bold ? undefined : "SpaceMono",
      }}
    >
      {children}
    </Text>
  );
}

export function UsersSpreadsheet() {
  const {
    allProfiles,
    allCouples,
    adminDb,
    banAccount,
    unbanAccount,
    canUseDemo,
    ensureDemoPair,
    user,
    partner,
  } = useApp();
  const { data: mini } = useMiniApps();
  const { width } = useWindowDimensions();
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState("Used inappropriately");
  const [exampleBanned, setExampleBanned] = useState<Record<string, string | null>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!canUseDemo) return;
    void ensureDemoPair();
  }, [canUseDemo, ensureDemoPair]);

  const hasLiveDemo = useMemo(
    () =>
      allCouples.some((couple) => {
        const a = allProfiles.find((profile) => profile.id === couple.partnerA);
        const b = allProfiles.find((profile) => profile.id === couple.partnerB);
        return isDemoPair(a ?? null, b ?? null);
      }),
    [allCouples, allProfiles]
  );

  const profiles = useMemo(() => {
    const live = allProfiles.filter((profile) => !isExampleAccount(profile.id));
    if (hasLiveDemo) return live;
    return [
      ...EXAMPLE_PROFILES.map((profile) => ({
        ...profile,
        bannedAt: exampleBanned[profile.id] ? profile.createdAt : null,
        bannedReason: exampleBanned[profile.id] ?? null,
      })),
      ...live,
    ];
  }, [allProfiles, exampleBanned, hasLiveDemo]);

  const rows = useMemo(() => {
    const couples = hasLiveDemo
      ? allCouples.filter((couple) => !isExampleAccount(couple.id))
      : [
          EXAMPLE_COUPLE,
          ...allCouples.filter((couple) => !isExampleAccount(couple.id)),
        ];
    const find = (id: string | null) =>
      id ? profiles.find((profile) => profile.id === id) ?? null : null;
    const list: SheetRow[] = couples.map((couple) => ({
      couple,
      a: find(couple.partnerA),
      b: find(couple.partnerB),
      example: isExampleAccount(couple.id),
    }));
    const lone = profiles.filter(
      (profile) =>
        !couples.some((couple) => couple.partnerA === profile.id || couple.partnerB === profile.id)
    );
    for (const profile of lone) {
      list.push({
        couple: {
          id: `solo-${profile.id}`,
          inviteCode: "—",
          partnerA: profile.id,
          partnerB: null,
          createdAt: profile.createdAt,
          pairedAt: null,
        },
        a: profile,
        b: null,
        example: isExampleAccount(profile.id),
      });
    }
    const ranked = [...list].sort((left, right) => {
      const demoLeft = isDemoPair(left.a, left.b) || left.example ? 0 : 1;
      const demoRight = isDemoPair(right.a, right.b) || right.example ? 0 : 1;
      return demoLeft - demoRight;
    });
    const needle = query.trim().toLowerCase();
    if (!needle) return ranked;
    return ranked.filter((row) =>
      [row.couple.inviteCode, row.a?.displayName, row.b?.displayName, row.a?.email, row.b?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [allCouples, hasLiveDemo, profiles, query]);

  const open = rows.find((row) => row.couple.id === openId) ?? null;
  const stacked = width < 720;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 20, fontWeight: "800" }}>
          Users · {rows.length} pairs
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 13, lineHeight: 18 }}>
          Spreadsheet of couples. Craig × Riley is the demo pair at the top — play in demo
          and the record fills in. Click a row for activity. Location is timezone, not GPS.
        </Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, email, code"
          placeholderTextColor="rgba(244,244,246,0.35)"
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 8,
            color: "#F4F4F6",
            fontSize: 13,
          }}
        />
      </View>
      <ScrollView horizontal>
        <View>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.18)",
              backgroundColor: "#14141A",
            }}
          >
            <Cell width={COL.code} children="CODE" bold color="rgba(244,244,246,0.45)" />
            <Cell width={COL.a} children="USER A" bold color="rgba(244,244,246,0.45)" />
            <Cell width={COL.b} children="USER B" bold color="rgba(244,244,246,0.45)" />
            <Cell width={COL.last} children="LAST LOGIN" bold color="rgba(244,244,246,0.45)" />
            <Cell width={COL.loc} children="LOCATION" bold color="rgba(244,244,246,0.45)" />
            <Cell width={COL.time} children="IN APP" bold color="rgba(244,244,246,0.45)" />
            <Cell width={COL.status} children="STATUS" bold color="rgba(244,244,246,0.45)" />
            <Cell width={COL.age} children="18+" bold color="rgba(244,244,246,0.45)" />
          </View>
          <ScrollView>
            {rows.map((row) => {
              const selected = openId === row.couple.id;
              const banned = statusOf(row) === "Banned";
              return (
                <Pressable
                  key={row.couple.id}
                  onPress={() => setOpenId(selected ? null : row.couple.id)}
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.06)",
                    backgroundColor: selected
                      ? "rgba(255,0,127,0.16)"
                      : banned
                        ? "rgba(230,0,57,0.08)"
                        : "transparent",
                  }}
                >
                  <Cell width={COL.code} children={row.couple.inviteCode} color="#FF007F" />
                  <Cell width={COL.a} children={row.a?.displayName ?? "—"} />
                  <Cell width={COL.b} children={row.b?.displayName ?? "waiting"} />
                  <Cell width={COL.last} children={formatWhen(latestSeen(row))} />
                  <Cell
                    width={COL.loc}
                    children={row.a?.timezone || row.b?.timezone || "—"}
                  />
                  <Cell
                    width={COL.time}
                    children={formatActiveTime(
                      (row.a?.activeSeconds ?? 0) + (row.b?.activeSeconds ?? 0)
                    )}
                  />
                  <Cell
                    width={COL.status}
                    children={statusOf(row)}
                    color={
                      banned
                        ? "#FF8A8A"
                        : statusOf(row) === "Waiting"
                          ? "#E4C37A"
                          : statusOf(row) === "Demo"
                            ? "#FF007F"
                            : "#3ECFBF"
                    }
                  />
                  <Cell
                    width={COL.age}
                    children={row.a?.over18At || row.b?.over18At ? "yes" : "—"}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
      {open ? (
        <CoupleRecord
          row={open}
          db={adminDb}
          stacked={stacked}
          reason={reason}
          onReason={setReason}
          mini={mini}
          sessionUser={user}
          sessionPartner={partner}
          onClose={() => setOpenId(null)}
          onBan={(id) =>
            open.example
              ? setExampleBanned((row) => ({ ...row, [id]: reason }))
              : void banAccount(id, reason)
          }
          onUnban={(id) =>
            open.example
              ? setExampleBanned((row) => ({ ...row, [id]: null }))
              : void unbanAccount(id)
          }
        />
      ) : null}
    </View>
  );
}

function sameEmail(left?: string | null, right?: string | null) {
  return Boolean(left && right && left.trim().toLowerCase() === right.trim().toLowerCase());
}

function itemBelongsTo(
  itemUserId: string,
  profile: Profile | null,
  slot: "a" | "b",
  sessionUser: Profile | null,
  sessionPartner: Profile | null,
  row: SheetRow
) {
  if (!profile || !itemUserId) return false;
  if (itemUserId === profile.id) return true;
  const demoRow = row.example || isDemoPair(row.a, row.b);
  if (!demoRow) return false;
  if (slot === "a") {
    if (sessionUser && itemUserId === sessionUser.id) {
      return sameEmail(profile.email, sessionUser.email) || isExampleAccount(profile.id);
    }
  }
  if (slot === "b") {
    if (sessionPartner && itemUserId === sessionPartner.id) return true;
    if (profile.isDemo && sessionPartner?.isDemo && itemUserId === sessionPartner.id) {
      return true;
    }
  }
  return false;
}

type AdminUpload = {
  id: string;
  label: string;
  kind: "photo" | "video";
  uri?: string | null;
  vault?: SexyVaultItem;
};

function uploadsForPerson(
  profile: Profile | null,
  slot: "a" | "b",
  row: SheetRow,
  mini: MiniState,
  sessionUser: Profile | null,
  sessionPartner: Profile | null
): AdminUpload[] {
  if (!profile) return [];
  const mine = (id: string) =>
    itemBelongsTo(id, profile, slot, sessionUser, sessionPartner, row);
  const photos: AdminUpload[] = mini.photos
    .filter((photo) => mine(photo.userId))
    .map((photo) => ({
      id: photo.id,
      label: photo.caption?.trim() || "Photo Memory",
      kind: "photo" as const,
      uri: photo.imageData,
    }));
  const vault: AdminUpload[] = mini.sexyVault
    .filter((item) => mine(item.fromId))
    .map((item) => ({
      id: item.id,
      label: item.note?.trim() || (item.kind === "video" ? "Sexy Vault clip" : "Sexy Vault"),
      kind: item.kind,
      uri: item.uri,
      vault: item,
    }));
  return [...photos, ...vault];
}

function CoupleRecord({
  row,
  db,
  stacked,
  reason,
  onReason,
  mini,
  sessionUser,
  sessionPartner,
  onClose,
  onBan,
  onUnban,
}: {
  row: SheetRow;
  db: ReturnType<typeof useApp>["adminDb"];
  stacked: boolean;
  reason: string;
  onReason: (value: string) => void;
  mini: MiniState;
  sessionUser: Profile | null;
  sessionPartner: Profile | null;
  onClose: () => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
}) {
  const usageA = row.example && row.a ? exampleUsage(row.a.id) : row.a ? usageForProfile(db, row.a) : null;
  const usageB = row.example && row.b ? exampleUsage(row.b.id) : row.b ? usageForProfile(db, row.b) : null;
  const uploadsA = uploadsForPerson(row.a, "a", row, mini, sessionUser, sessionPartner);
  const uploadsB = uploadsForPerson(row.b, "b", row, mini, sessionUser, sessionPartner);

  return (
    <View
      style={{
        position: stacked ? "relative" : "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: stacked ? "100%" : 420,
        backgroundColor: "#0F0F14",
        borderLeftWidth: stacked ? 0 : 1,
        borderLeftColor: "rgba(255,255,255,0.1)",
        borderTopWidth: stacked ? 1 : 0,
        borderTopColor: "rgba(255,255,255,0.1)",
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Pressable onPress={onClose}>
          <Text style={{ color: "#FF007F", fontWeight: "700", fontSize: 12 }}>Close record</Text>
        </Pressable>
        <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800", marginTop: 8 }}>
          {row.couple.inviteCode}
          {row.example || isDemoPair(row.a, row.b) ? " · demo" : ""}
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 4, fontSize: 12 }}>
          {row.a?.displayName ?? "—"} × {row.b?.displayName ?? "waiting"} · paired{" "}
          {formatWhen(row.couple.pairedAt)}
        </Text>
        <PersonBlock
          label="User A"
          profile={row.a}
          usage={usageA}
          reason={reason}
          onReason={onReason}
          onBan={onBan}
          onUnban={onUnban}
          locked={row.example || isDemoPair(row.a, row.b)}
        />
        <PersonBlock
          label="User B"
          profile={row.b}
          usage={usageB}
          reason={reason}
          onReason={onReason}
          onBan={onBan}
          onUnban={onUnban}
          locked={row.example || isDemoPair(row.a, row.b)}
        />
        <UploadBlock name={row.a?.displayName ?? "User A"} items={uploadsA} />
        <UploadBlock name={row.b?.displayName ?? "User B"} items={uploadsB} hidden={!row.b} />
      </ScrollView>
    </View>
  );
}

function UploadBlock({
  name,
  items,
  hidden = false,
}: {
  name: string;
  items: AdminUpload[];
  hidden?: boolean;
}) {
  const [looking, setLooking] = useState<AdminUpload | null>(null);
  if (hidden) return null;
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", fontSize: 16 }}>
        {name}’s uploads
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 12, lineHeight: 18 }}>
        Photo Memory and Sexy Vault on this browser. Tap a tile to open it.
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {items.length === 0 ? (
          <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 12 }}>
            Nothing stored here yet.
          </Text>
        ) : (
          items.map((item) => (
            <Pressable key={item.id} onPress={() => setLooking(item)} style={{ width: 150 }}>
              <UploadThumb item={item} size={150} />
              <Text
                style={{ color: "rgba(244,244,246,0.55)", fontSize: 11, marginTop: 4 }}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </Pressable>
          ))
        )}
      </View>
      <Modal
        visible={Boolean(looking)}
        transparent
        animationType="fade"
        onRequestClose={() => setLooking(null)}
      >
        <Pressable
          onPress={() => setLooking(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(8,8,12,0.88)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {looking ? (
            <Pressable onPress={(event) => event.stopPropagation?.()}>
              <UploadThumb item={looking} size={320} />
              <Text style={{ color: "#F4F4F6", marginTop: 10, fontWeight: "700" }}>
                {looking.label}
              </Text>
              <Text style={{ color: "#FF007F", marginTop: 8, fontWeight: "700" }}>Close</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

function UploadThumb({ item, size }: { item: AdminUpload; size: number }) {
  const [src, setSrc] = useState<string | null>(item.uri ?? null);

  useEffect(() => {
    if (!item.vault) {
      setSrc(item.uri ?? null);
      return;
    }
    setSrc(item.vault.uri ?? item.uri ?? null);
    let dead = false;
    let created: string | null = null;
    void resolveSexyVaultSrc(item.vault).then((url) => {
      if (dead) {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      created = url && url.startsWith("blob:") ? url : null;
      setSrc(url);
    });
    return () => {
      dead = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [item.id, item.kind, item.uri, item.vault?.id]);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundColor: "#1A1A22",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src && item.kind === "video" && Platform.OS === "web"
        ? createElement("video", {
            src,
            muted: true,
            playsInline: true,
            controls: size > 200,
            preload: "metadata",
            style: { width: "100%", height: "100%", objectFit: "cover" },
          })
        : src ? (
            <Image
              source={{ uri: src }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 11 }}>
              {item.kind === "video" ? "Clip" : "Photo"}
            </Text>
          )}
    </View>
  );
}

function ActivityFold({ usage }: { usage: ReturnType<typeof usageForProfile> | null }) {
  const groups = groupUsageItems(usage);
  const [openId, setOpenId] = useState<string | null>(null);
  if (!groups.length) {
    return (
      <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 8, fontSize: 12 }}>
        No app use yet
      </Text>
    );
  }
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 11, letterSpacing: 1.2 }}>
        ACTIVITY · tap a row
      </Text>
      {groups.map((group) => (
        <ActivityGroupRow
          key={group.id}
          group={group}
          open={openId === group.id}
          onToggle={() => setOpenId(openId === group.id ? null : group.id)}
        />
      ))}
    </View>
  );
}

function ActivityGroupRow({
  group,
  open,
  onToggle,
}: {
  group: UsageGroup;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View
      style={{
        marginTop: 6,
        borderWidth: 1,
        borderColor: open ? "rgba(255,0,127,0.35)" : "rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 8,
          backgroundColor: open ? "rgba(255,0,127,0.08)" : "rgba(255,255,255,0.03)",
        }}
      >
        <Text style={{ flex: 1, color: "#F4F4F6", fontSize: 13, fontWeight: "700" }}>
          {group.label}
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 12, fontFamily: "SpaceMono" }}>
          {group.count}
        </Text>
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
          {group.items.length === 0 ? (
            <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 12, marginTop: 6 }}>
              Count only — no titles stored for this app yet.
            </Text>
          ) : (
            group.items.map((item, index) => (
              <Text
                key={`${item.label}-${index}`}
                style={{ color: "rgba(244,244,246,0.7)", fontSize: 12, marginTop: 6, lineHeight: 16 }}
              >
                {item.label}
                <Text style={{ color: "rgba(244,244,246,0.38)" }}>{`  ·  ${item.detail}`}</Text>
              </Text>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

function PersonBlock({
  label,
  profile,
  usage,
  reason,
  onReason,
  onBan,
  onUnban,
  locked = false,
}: {
  label: string;
  profile: Profile | null;
  usage: ReturnType<typeof usageForProfile> | null;
  reason: string;
  onReason: (value: string) => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
  locked?: boolean;
}) {
  if (!profile) {
    return (
      <Text style={{ color: "rgba(244,244,246,0.4)", marginTop: 16, fontSize: 13 }}>
        {label} · waiting to join
      </Text>
    );
  }
  const banned = Boolean(profile.bannedAt);
  return (
    <View
      style={{
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: banned ? "rgba(255,138,138,0.45)" : "rgba(255,255,255,0.1)",
      }}
    >
      <Text style={{ color: "#F4F4F6", fontWeight: "800", fontSize: 16 }}>
        {label} · {profile.displayName}
        {banned ? " · BANNED" : ""}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 6, fontSize: 12 }}>
        {profile.email || "no email"} · {profile.gender ?? "unset"}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 2, fontSize: 12 }}>
        last login {formatWhen(profile.lastSeenAt)} · {profile.timezone || "no region"} ·{" "}
        {formatActiveTime(profile.activeSeconds)} in app
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 2, fontSize: 11 }}>
        18+ {profile.over18At ? formatWhen(profile.over18At) : "no"} · privacy{" "}
        {profile.privacyConsentAt ? "yes" : "no"} · image review{" "}
        {profile.moderationConsentAt ? "yes" : "no"}
      </Text>
      <ActivityFold usage={usage} />
      {locked ? (
        <Text style={{ color: "rgba(244,244,246,0.4)", marginTop: 10, fontSize: 12 }}>
          Demo pair — cannot be banned.
        </Text>
      ) : banned ? (
        <Pressable onPress={() => onUnban(profile.id)} style={{ marginTop: 10 }}>
          <Text style={{ color: "#3ECFBF", fontWeight: "700", fontSize: 12 }}>Unban</Text>
        </Pressable>
      ) : (
        <View style={{ marginTop: 10 }}>
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
