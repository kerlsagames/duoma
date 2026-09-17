import { CoupleDossier } from "@/components/admin/CoupleDossier";
import { isDemoPair, isExampleAccount } from "@/lib/admin-example";
import { formatActiveTime, formatWhen } from "@/lib/legal";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Couple, Profile } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import {
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
  } = useApp();
  const { data: mini } = useMiniApps();
  const { width } = useWindowDimensions();
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState("Used inappropriately");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!canUseDemo) return;
    void ensureDemoPair();
  }, [canUseDemo, ensureDemoPair]);

  const profiles = useMemo(
    () => allProfiles.filter((profile) => !isExampleAccount(profile.id)),
    [allProfiles]
  );

  const rows = useMemo(() => {
    const couples = allCouples.filter((couple) => !isExampleAccount(couple.id));
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
          Pair → partner → hub → app. Location is timezone, not GPS. Vault stays off this screen.
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
        <CoupleDossier
          couple={open.couple}
          a={open.a}
          b={open.b}
          example={open.example}
          db={adminDb}
          mini={mini}
          stacked={stacked}
          reason={reason}
          onReason={setReason}
          onClose={() => setOpenId(null)}
          onBan={(id) => void banAccount(id, reason)}
          onUnban={(id) => void unbanAccount(id)}
        />
      ) : null}
    </View>
  );
}
