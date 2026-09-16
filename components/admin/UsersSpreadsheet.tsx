import { usageForProfile } from "@/lib/account-usage";
import {
  EXAMPLE_COUPLE,
  EXAMPLE_PROFILES,
  exampleUsage,
  isExampleAccount,
} from "@/lib/admin-example";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Couple, Profile } from "@/lib/types";
import { useMemo, useState } from "react";
import {
  Image,
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
  const { allProfiles, allCouples, adminDb, banAccount, unbanAccount } = useApp();
  const { data: mini } = useMiniApps();
  const { width } = useWindowDimensions();
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState("Used inappropriately");
  const [exampleBanned, setExampleBanned] = useState<Record<string, string | null>>({});
  const [query, setQuery] = useState("");

  const profiles = useMemo(() => {
    return [
      ...EXAMPLE_PROFILES.map((profile) => ({
        ...profile,
        bannedAt: exampleBanned[profile.id] ? profile.createdAt : null,
        bannedReason: exampleBanned[profile.id] ?? null,
      })),
      ...allProfiles.filter((profile) => !isExampleAccount(profile.id)),
    ];
  }, [allProfiles, exampleBanned]);

  const rows = useMemo(() => {
    const couples = [
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
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((row) =>
      [row.couple.inviteCode, row.a?.displayName, row.b?.displayName, row.a?.email, row.b?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [allCouples, profiles, query]);

  const open = rows.find((row) => row.couple.id === openId) ?? null;
  const stacked = width < 720;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 20, fontWeight: "800" }}>
          Users · {rows.length} pairs
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 13, lineHeight: 18 }}>
          Spreadsheet of couples. Click a row for the full record. Location is timezone from
          their phone — not GPS. Images only if they agreed at signup and the photos are on
          this browser or later synced.
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
                      banned ? "#FF8A8A" : statusOf(row) === "Waiting" ? "#E4C37A" : "#3ECFBF"
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
          photos={
            open.example
              ? [
                  { id: "ex-1", label: "Example · Photo Memory", color: "#5B2A4A" },
                  { id: "ex-2", label: "Example · Sexy Vault", color: "#2A3A5B" },
                ]
              : mini.photos
                  .filter(
                    (photo) =>
                      photo.userId === open.a?.id || photo.userId === open.b?.id
                  )
                  .map((photo) => ({
                    id: photo.id,
                    label: photo.caption || "Photo Memory",
                    uri: photo.imageData,
                  }))
          }
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

function CoupleRecord({
  row,
  db,
  stacked,
  reason,
  onReason,
  photos,
  onClose,
  onBan,
  onUnban,
}: {
  row: SheetRow;
  db: ReturnType<typeof useApp>["adminDb"];
  stacked: boolean;
  reason: string;
  onReason: (value: string) => void;
  photos: { id: string; label: string; uri?: string | null; color?: string }[];
  onClose: () => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
}) {
  const usageA = row.example && row.a ? exampleUsage(row.a.id) : row.a ? usageForProfile(db, row.a) : null;
  const usageB = row.example && row.b ? exampleUsage(row.b.id) : row.b ? usageForProfile(db, row.b) : null;

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
          {row.example ? " · example" : ""}
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
        />
        <PersonBlock
          label="User B"
          profile={row.b}
          usage={usageB}
          reason={reason}
          onReason={onReason}
          onBan={onBan}
          onUnban={onUnban}
        />
        <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 22, fontSize: 16 }}>
          Images
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 12, lineHeight: 18 }}>
          Review is allowed only because they ticked 18+ and the privacy notice. Photos on
          this browser show here. Vault clips on their phones do not upload until they
          agree and we sync them.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {photos.length === 0 ? (
            <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 12 }}>
              No images on this browser for this pair.
            </Text>
          ) : (
            photos.map((photo) => (
              <View key={photo.id} style={{ width: 150 }}>
                {photo.uri ? (
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: 150, height: 150, borderRadius: 8, backgroundColor: "#1A1A22" }}
                  />
                ) : (
                  <View
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 8,
                      backgroundColor: photo.color ?? "#1A1A22",
                    }}
                  />
                )}
                <Text style={{ color: "rgba(244,244,246,0.55)", fontSize: 11, marginTop: 4 }}>
                  {photo.label}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
}: {
  label: string;
  profile: Profile | null;
  usage: ReturnType<typeof usageForProfile> | null;
  reason: string;
  onReason: (value: string) => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
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
      <Text style={{ color: "rgba(244,244,246,0.7)", marginTop: 8, fontSize: 12 }}>
        {usage?.apps.length
          ? usage.apps.map((item) => `${item.label} ${item.count}`).join(" · ")
          : "No app use yet"}
      </Text>
      {usage?.cards.slice(0, 8).map((item, index) => (
        <Text key={`${item.label}-${index}`} style={{ color: "rgba(244,244,246,0.5)", fontSize: 12, marginTop: 4 }}>
          {item.label}
          {"\n"}
          <Text style={{ color: "rgba(244,244,246,0.35)" }}>{item.detail}</Text>
        </Text>
      ))}
      {banned ? (
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
