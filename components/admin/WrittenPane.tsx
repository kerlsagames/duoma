import { addCatalogRow, useCatalogRevision } from "@/lib/catalog-overlay";
import {
  gatherWritten,
  writtenAlreadyInCatalog,
  writtenKindMeta,
  writtenToCatalogRow,
  writtenWho,
  type WrittenItem,
  type WrittenKind,
} from "@/lib/admin-written";
import { useApp } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type Filter = "all" | WrittenKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "card", label: "Cards" },
  { id: "dare", label: "Dare Me" },
  { id: "chicken", label: "Chicken" },
  { id: "bet", label: "Bets" },
];

function whenLabel(iso: string): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  return new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WrittenPane() {
  const { adminDb, allCouples, allProfiles, usingCloud, ready } = useApp();
  const rev = useCatalogRevision();
  const [rows, setRows] = useState<WrittenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const stamp = `${allCouples.length}:${adminDb.cards.length}:${adminDb.spicyDares.length}:${adminDb.chickenPlays.length}`;

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    setLoading(true);
    void gatherWritten({ db: adminDb, couples: allCouples }).then((next) => {
      if (!alive) return;
      setRows(next);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // adminDb is a new object every render; stamp covers the homemade rows we care about.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, stamp, rev]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 2800);
    return () => clearTimeout(timer);
  }, [flash]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && row.kind !== filter) return false;
      if (!needle) return true;
      const who = writtenWho(row, allProfiles, allCouples);
      return `${row.title} ${row.body} ${who.pair} ${who.author} ${row.kind}`
        .toLowerCase()
        .includes(needle);
    });
  }, [rows, filter, query, allProfiles, allCouples]);

  const counts = useMemo(() => {
    const out: Record<Filter, number> = {
      all: rows.length,
      card: 0,
      dare: 0,
      chicken: 0,
      bet: 0,
    };
    for (const row of rows) out[row.kind] += 1;
    return out;
  }, [rows]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 20, fontWeight: "800" }}>
          Written · {visible.length}
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, fontSize: 13, lineHeight: 18 }}>
          Homemade Get Spicy cards, Dare Me, Chicken, and LoveBetz lines. Add a good one and
          everyone gets it.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {FILTERS.map((chip) => {
            const on = filter === chip.id;
            return (
              <Pressable
                key={chip.id}
                onPress={() => setFilter(chip.id)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 99,
                  backgroundColor: on ? "#FF007F" : "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: on ? "#FF007F" : "rgba(255,255,255,0.12)",
                }}
              >
                <Text style={{ color: on ? "#0B0B0E" : "#F4F4F6", fontSize: 12, fontWeight: "700" }}>
                  {chip.label} {counts[chip.id]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search text, pair, or name"
          placeholderTextColor="rgba(244,244,246,0.35)"
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.14)",
            borderRadius: 8,
            padding: 10,
            color: "#F4F4F6",
            fontSize: 14,
          }}
        />
        {flash ? (
          <Text style={{ color: "#3ECFBF", marginTop: 8, fontSize: 12 }}>{flash}</Text>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}>
        {loading ? (
          <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 8 }}>Loading…</Text>
        ) : visible.length === 0 ? (
          <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 8, lineHeight: 20 }}>
            {rows.length === 0
              ? usingCloud
                ? "Nobody has written their own yet. If this is live and you expect some, run SQL 016 in the Supabase SQL editor so the passphrase can read couple backups."
                : "Nobody has written their own yet on this browser."
              : "No writes match that filter."}
          </Text>
        ) : (
          visible.map((row) => {
            const meta = writtenKindMeta(row.kind);
            const who = writtenWho(row, allProfiles, allCouples);
            const added = writtenAlreadyInCatalog(row);
            const when = whenLabel(row.createdAt);
            return (
              <View
                key={row.id}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", fontSize: 11 }}>
                  {meta.label}
                  {who.demo ? " · demo" : ""}
                  {when ? ` · ${when}` : ""}
                </Text>
                <Text style={{ color: "#F4F4F6", fontWeight: "700", fontSize: 14, marginTop: 3 }}>
                  {row.title}
                </Text>
                {row.body && row.body !== row.title ? (
                  <Text
                    style={{
                      color: "rgba(244,244,246,0.62)",
                      fontSize: 12,
                      marginTop: 3,
                      lineHeight: 18,
                    }}
                  >
                    {row.body}
                  </Text>
                ) : null}
                <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 11, marginTop: 4 }}>
                  {who.author} · {who.pair}
                </Text>
                {added ? (
                  <Text style={{ color: "#3ECFBF", fontSize: 11, fontWeight: "700", marginTop: 6 }}>
                    In catalog
                  </Text>
                ) : (
                  <Pressable
                    disabled={busyId === row.id}
                    onPress={() =>
                      void (async () => {
                        setBusyId(row.id);
                        try {
                          const target = writtenToCatalogRow(row);
                          await addCatalogRow(target.key, target.row);
                          setFlash(`Added to ${meta.label}. Everyone gets this.`);
                        } finally {
                          setBusyId(null);
                        }
                      })()
                    }
                    style={{ alignSelf: "flex-start", marginTop: 8 }}
                  >
                    <Text style={{ color: "#FF007F", fontSize: 12, fontWeight: "800" }}>
                      {busyId === row.id ? "Adding…" : "Add to catalog"}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
