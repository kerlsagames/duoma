import { lockAdmin, isAdminUnlocked, unlockAdmin } from "@/lib/admin-gate";
import {
  addCatalogRow,
  CATALOG_KEYS,
  editCatalogRow,
  hideCatalogRow,
  restoreCatalogRow,
  type CatalogKey,
} from "@/lib/catalog-overlay";
import {
  catalogGroupChips,
  catalogGroups,
  catalogRows,
  hiddenIds,
  newCatalogId,
  rowInGroup,
} from "@/lib/catalog-rows";
import { STAGE_META, STAGE_ORDER } from "@/games/get-spicy/engine";
import { usageForProfile } from "@/lib/account-usage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { useCatalogRevision } from "@/lib/catalog-overlay";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

type Tab = "setup" | "users" | CatalogKey | "spicyLive";

const NAV: { id: Tab; label: string }[] = [
  { id: "setup", label: "Setup" },
  { id: "users", label: "Users" },
  { id: "spicyLive", label: "Copies" },
  { id: "fantasy", label: "Fantasy" },
  { id: "spicyDares", label: "Dare Me" },
  { id: "chicken", label: "Chicken" },
  { id: "roleplays", label: "Roleplays" },
  { id: "positions", label: "Positions" },
  { id: "dates", label: "Dates" },
  { id: "coupons", label: "Coupons" },
  { id: "discover", label: "Discover" },
  { id: "curiosity", label: "Curiosity" },
  { id: "how", label: "The How" },
  { id: "spicySeeds", label: "Spicy seeds" },
  { id: "photo", label: "Photos" },
];

export default function AdminScreen() {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [pass, setPass] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("setup");
  const [q, setQ] = useState("");
  const rev = useCatalogRevision();
  const { allProfiles, allCouples, allCards, adminDb, ready, banAccount, unbanAccount } = useApp();
  const { width } = useWindowDimensions();
  const stacked = width < 720;

  if (!unlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0B0E", padding: 24, justifyContent: "center" }}>
        <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", letterSpacing: 2, fontSize: 12 }}>
          CREATOR ONLY
        </Text>
        <Text style={{ color: "#F4F4F6", fontSize: 28, fontWeight: "800", marginTop: 8 }}>
          Backstage
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 8, lineHeight: 20 }}>
          Not in the app. Passphrase is yours. Partners never see this screen.
        </Text>
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="Passphrase"
          placeholderTextColor="rgba(244,244,246,0.35)"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={() => {
            if (unlockAdmin(pass)) setUnlocked(true);
            else setGateError("Wrong passphrase.");
          }}
          style={{
            marginTop: 20,
            borderWidth: 1,
            borderColor: "rgba(255,0,127,0.4)",
            borderRadius: 10,
            padding: 14,
            color: "#F4F4F6",
            fontSize: 16,
          }}
        />
        {gateError ? (
          <Text style={{ color: "#FF8A8A", marginTop: 8 }}>{gateError}</Text>
        ) : null}
        <Pressable
          onPress={() => {
            if (unlockAdmin(pass)) setUnlocked(true);
            else setGateError("Wrong passphrase.");
          }}
          style={{
            marginTop: 14,
            backgroundColor: "#FF007F",
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#0B0B0E", fontWeight: "800" }}>Unlock</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: stacked ? "column" : "row",
        backgroundColor: "#0B0B0E",
      }}
    >
      <ScrollView
        horizontal={stacked}
        style={
          stacked
            ? { maxHeight: 56, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" }
            : { width: 128, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.08)" }
        }
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingTop: 10,
          paddingBottom: stacked ? 8 : 32,
          flexDirection: stacked ? "row" : "column",
          alignItems: stacked ? "center" : "stretch",
          gap: stacked ? 2 : 0,
        }}
      >
        <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", fontSize: 9, letterSpacing: 1.4, paddingHorizontal: 6 }}>
          BACKSTAGE
        </Text>
        {NAV.map((row) => {
          const on = tab === row.id;
          return (
            <Pressable
              key={row.id}
              onPress={() => {
                setTab(row.id);
                setQ("");
              }}
              style={{
                marginTop: stacked ? 0 : 2,
                paddingVertical: 6,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor: on ? "rgba(255,0,127,0.18)" : "transparent",
              }}
            >
              <Text
                numberOfLines={1}
                style={{ color: on ? "#FF007F" : "#F4F4F6", fontSize: 12, fontWeight: "700" }}
              >
                {row.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => {
            lockAdmin();
            setUnlocked(false);
            setPass("");
          }}
          style={{ marginTop: stacked ? 0 : 16, padding: 8 }}
        >
          <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 11 }}>Lock</Text>
        </Pressable>
      </ScrollView>

      <View style={{ flex: 1 }}>
        {!ready ? (
          <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
            <Text style={{ color: "rgba(244,244,246,0.55)" }}>Loading store…</Text>
          </View>
        ) : tab === "setup" ? (
          <SetupPane />
        ) : tab === "users" ? (
          <UsersPane
            profiles={allProfiles}
            couples={allCouples}
            db={adminDb}
            onBan={banAccount}
            onUnban={unbanAccount}
          />
        ) : tab === "spicyLive" ? (
          <LiveSpicyPane cards={allCards} profiles={allProfiles} couples={allCouples} />
        ) : (
          <CatalogPane key={`${tab}-${rev}`} catalog={tab} query={q} onQuery={setQ} />
        )}
      </View>
    </View>
  );
}

function SetupPane() {
  const cloud = isSupabaseConfigured;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>How this scales</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 8, lineHeight: 20 }}>
        Right now every couple on duoma.vercel.app still shares this browser’s local store.
        That is fine for you poking at cards. It is not 100 people on two phones each.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 20 }}>100 users</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        Yes. Vercel + a free Supabase project holds accounts, pairs, play, and your global
        card overlay. Photos later use a Storage bucket.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 16 }}>1,000 users</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        Still yes. Same database. Move to Supabase Pro when the free row/storage limits get
        tight — usually photos and vault video, not the card text.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 16 }}>Where data lives</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        Postgres on Supabase: profiles, emails, pair codes, bans, which apps they opened,
        which cards they played. Catalog edits you make in Backstage write to a single
        overlay row so every couple gets them. Phones keep a cache. You keep this /admin.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 16 }}>Email + code</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        Keep the six-character code — that is how two people become a pair. Add email as
        the account (magic link, no password to forget). New phone? Same email. Ban? You
        shut the email, not a random device id.
      </Text>
      <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", marginTop: 22, fontSize: 12 }}>
        CLOUD KEYS · {cloud ? "present" : "missing"}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 8, lineHeight: 20 }}>
        {cloud
          ? "URL and anon key are in the env. Couple play is still local until the live sync is switched on. Run SQL 001–006, then mark your profile is_admin."
          : "Create a project at supabase.com. In the SQL editor run supabase/migrations/001_init.sql through 006_accounts.sql. Turn on Auth → Email (magic link). Put EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY on Vercel. Then: update profiles set is_admin = true where lower(email) = 'kerlsagameshq@gmail.com';"}
      </Text>
    </ScrollView>
  );
}

function UsersPane({
  profiles,
  couples,
  db,
  onBan,
  onUnban,
}: {
  profiles: ReturnType<typeof useApp>["allProfiles"];
  couples: ReturnType<typeof useApp>["allCouples"];
  db: ReturnType<typeof useApp>["adminDb"];
  onBan: ReturnType<typeof useApp>["banAccount"];
  onUnban: ReturnType<typeof useApp>["unbanAccount"];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState("Used inappropriately");
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>
        Users · {profiles.length}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4 }}>
        {isSupabaseConfigured
          ? "Once live sync is on, this list is every couple in Postgres. Today it is this site’s store."
          : "This site’s store only until Supabase is connected. Ban still locks them out of the app."}
      </Text>
      {profiles.length === 0 ? (
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 16 }}>
          No profiles yet. Create a pair in the app and they show up here.
        </Text>
      ) : null}
      {profiles.map((profile) => {
        const couple = couples.find(
          (row) => row.partnerA === profile.id || row.partnerB === profile.id
        );
        const otherId =
          couple?.partnerA === profile.id ? couple.partnerB : couple?.partnerA ?? null;
        const other = profiles.find((row) => row.id === otherId);
        const usage = usageForProfile(db, profile);
        const open = openId === profile.id;
        const banned = Boolean(profile.bannedAt);
        return (
          <View
            key={profile.id}
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: banned ? "rgba(255,138,138,0.5)" : "rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text style={{ color: "#F4F4F6", fontWeight: "800", fontSize: 16 }}>
              {profile.displayName}
              {profile.isDemo ? " · demo" : ""}
              {banned ? " · BANNED" : ""}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 4, fontSize: 12 }}>
              {profile.email || "no email"} · {profile.gender ?? "unset"}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 2, fontSize: 12 }}>
              couple {couple?.inviteCode ?? "none"} · partner {other?.displayName ?? "waiting"}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 2, fontSize: 11 }}>
              last seen {profile.lastSeenAt ?? "never"} · id {profile.id}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.7)", marginTop: 8, fontSize: 12 }}>
              {usage.apps.length
                ? usage.apps.map((row) => `${row.label} ${row.count}`).join(" · ")
                : "No app use yet"}
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Pressable onPress={() => setOpenId(open ? null : profile.id)}>
                <Text style={{ color: "#FF007F", fontWeight: "700", fontSize: 12 }}>
                  {open ? "Hide detail" : "See apps & cards"}
                </Text>
              </Pressable>
              {banned ? (
                <Pressable onPress={() => void onUnban(profile.id)}>
                  <Text style={{ color: "#3ECFBF", fontWeight: "700", fontSize: 12 }}>Unban</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => void onBan(profile.id, reason)}>
                  <Text style={{ color: "#FF8A8A", fontWeight: "700", fontSize: 12 }}>Ban</Text>
                </Pressable>
              )}
            </View>
            {open ? (
              <View style={{ marginTop: 10 }}>
                {usage.apps.map((row) => (
                  <Text key={row.id} style={{ color: "rgba(244,244,246,0.75)", fontSize: 12, marginTop: 2 }}>
                    {row.label} · {row.count}
                  </Text>
                ))}
                {usage.cards.length ? (
                  <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 11, marginTop: 10 }}>
                    CARDS
                  </Text>
                ) : null}
                {usage.cards.map((row, index) => (
                  <Text
                    key={`${row.label}-${index}`}
                    style={{ color: "rgba(244,244,246,0.7)", fontSize: 12, marginTop: 4 }}
                  >
                    {row.label}
                    {"\n"}
                    <Text style={{ color: "rgba(244,244,246,0.4)" }}>{row.detail}</Text>
                  </Text>
                ))}
                {!banned ? (
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Ban reason"
                    placeholderTextColor="rgba(244,244,246,0.35)"
                    style={field}
                  />
                ) : (
                  <Text style={{ color: "#FF8A8A", marginTop: 8, fontSize: 12 }}>
                    {profile.bannedReason}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        );
      })}
      <Text style={{ color: "#F4F4F6", fontSize: 18, fontWeight: "800", marginTop: 28 }}>
        Couples · {couples.length}
      </Text>
      {couples.length === 0 ? (
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 12 }}>
          No couples in this store yet.
        </Text>
      ) : null}
      {couples.map((couple) => (
        <View
          key={couple.id}
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: "#FF007F", fontFamily: "SpaceMono" }}>{couple.inviteCode}</Text>
          <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 4, fontSize: 12 }}>
            {couple.id}
          </Text>
          <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 2, fontSize: 12 }}>
            A {couple.partnerA} · B {couple.partnerB ?? "empty"} · paired {couple.pairedAt ?? "no"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function LiveSpicyPane({
  cards,
  profiles,
  couples,
}: {
  cards: ReturnType<typeof useApp>["allCards"];
  profiles: ReturnType<typeof useApp>["allProfiles"];
  couples: ReturnType<typeof useApp>["allCouples"];
}) {
  const [stage, setStage] = useState<(typeof STAGE_ORDER)[number] | "all">("all");
  const name = (id: string | null) =>
    profiles.find((row) => row.id === id)?.displayName ?? id ?? "—";
  const chips = [
    { id: "all" as const, label: "All" },
    ...STAGE_ORDER.map((id) => ({ id, label: STAGE_META[id].short })),
  ];
  const visible = cards.filter((card) => stage === "all" || card.stage === stage);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 20, fontWeight: "800" }}>
          Get Spicy copies · {visible.length}
        </Text>
        <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, marginBottom: 8, fontSize: 13 }}>
          Copies in play. Edit the seed catalog to change everyone’s deck.
        </Text>
        <ChipRow
          chips={chips}
          selected={stage}
          onSelect={(id) => setStage(id as typeof stage)}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}>
        {visible.length === 0 ? (
          <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 8 }}>
            No Get Spicy copies in this stage yet.
          </Text>
        ) : null}
        {visible.map((card) => {
          const couple = couples.find((row) => row.id === card.coupleId);
          return (
            <View key={card.id} style={cardRow}>
              <Text numberOfLines={1} style={cardTitle}>
                {card.title}
              </Text>
              <Text numberOfLines={1} style={cardDetail}>
                {card.body}
              </Text>
              <Text style={cardMeta}>
                {STAGE_META[card.stage]?.short ?? card.stage} · {card.isActive ? "on" : "off"} ·{" "}
                {couple?.inviteCode ?? card.coupleId} · {name(couple?.partnerA ?? null)} /{" "}
                {name(couple?.partnerB ?? null)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function CatalogPane({
  catalog,
  query,
  onQuery,
}: {
  catalog: CatalogKey;
  query: string;
  onQuery: (value: string) => void;
}) {
  const meta = CATALOG_KEYS.find((row) => row.id === catalog)!;
  const rows = catalogRows(catalog);
  const chips = catalogGroupChips(catalog);
  const groups = catalogGroups(catalog);
  const hidden = new Set(hiddenIds(catalog));
  const [group, setGroup] = useState(chips[0]?.id ?? "");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editGroup, setEditGroup] = useState(chips[0]?.id ?? "");
  const [adding, setAdding] = useState(false);

  const needle = query.trim().toLowerCase();
  const inCategory = rows.filter((row) => rowInGroup(row, group));
  const matched = inCategory.filter((row) => {
    if (!needle) return true;
    return `${row.title} ${row.body} ${row.group} ${row.id}`.toLowerCase().includes(needle);
  });
  const live = matched.filter((row) => !hidden.has(row.id));
  const tucked = matched.filter((row) => hidden.has(row.id));

  const open = (row: { id: string; title: string; body: string; group: string }) => {
    setAdding(false);
    setDraftId(row.id);
    setTitle(row.title);
    setBody(row.body);
    setEditGroup(row.group.split(",")[0]?.trim() || group);
  };

  const detailOf = (row: { title: string; body: string }) => {
    const text = row.body.trim();
    if (!text || text === row.title) return "";
    if (text.startsWith(row.title)) return text.slice(row.title.length).replace(/^[·\s-]+/, "");
    return text;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{ color: "#F4F4F6", fontSize: 20, fontWeight: "800" }}>
          {meta.label} · {matched.length}
        </Text>
        <ChipRow
          chips={chips}
          selected={group}
          counts={Object.fromEntries(
            chips.map((chip) => [
              chip.id,
              rows.filter((row) => rowInGroup(row, chip.id)).length,
            ])
          )}
          onSelect={(id) => {
            setGroup(id);
            setAdding(false);
            setDraftId(null);
            onQuery("");
          }}
        />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Search this category"
          placeholderTextColor="rgba(244,244,246,0.35)"
          style={field}
        />
        {meta.add ? (
          <Pressable
            onPress={() => {
              setAdding(true);
              setDraftId(null);
              setTitle("");
              setBody("");
              setEditGroup(group || groups[0] || "");
            }}
            style={{
              marginTop: 10,
              alignSelf: "flex-start",
              backgroundColor: "#FF007F",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#0B0B0E", fontWeight: "800", fontSize: 12 }}>Add card</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        {adding || draftId ? (
          <View
            style={{
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#FF007F",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", fontSize: 11 }}>
              {adding ? "NEW" : draftId}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="rgba(244,244,246,0.35)"
              style={field}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Detail / prompt / options (one per line for Curiosity)"
              placeholderTextColor="rgba(244,244,246,0.35)"
              multiline
              style={{ ...field, minHeight: 90, textAlignVertical: "top" }}
            />
            <TextInput
              value={editGroup}
              onChangeText={setEditGroup}
              placeholder={`Category (${chips.map((chip) => chip.label).slice(0, 5).join(", ")})`}
              placeholderTextColor="rgba(244,244,246,0.35)"
              style={field}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Pressable
                onPress={() =>
                  void (async () => {
                    if (adding) {
                      await addCatalogRow(catalog, {
                        id: newCatalogId(catalog),
                        title: title.trim() || "Untitled",
                        body: body.trim(),
                        group: editGroup.trim() || group || groups[0] || "misc",
                      });
                      setAdding(false);
                    } else if (draftId) {
                      await editCatalogRow(catalog, draftId, {
                        title: title.trim(),
                        body: body.trim(),
                        group: editGroup.trim(),
                      });
                      setDraftId(null);
                    }
                  })()
                }
                style={{
                  backgroundColor: "#FF007F",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#0B0B0E", fontWeight: "800", fontSize: 12 }}>
                  Save — everyone gets this
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAdding(false);
                  setDraftId(null);
                }}
                style={{ padding: 8 }}
              >
                <Text style={{ color: "rgba(244,244,246,0.6)" }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {live.length === 0 && tucked.length === 0 ? (
          <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 8 }}>
            {needle ? "No cards match that search." : "No cards in this category."}
          </Text>
        ) : null}

        {live.map((row) => (
          <CardLine
            key={row.id}
            title={row.title}
            detail={detailOf(row)}
            hidden={false}
            onEdit={() => open(row)}
            onHide={() => void hideCatalogRow(catalog, row.id)}
          />
        ))}

        {tucked.length ? (
          <Text
            style={{
              color: "rgba(244,244,246,0.4)",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.2,
              marginTop: 22,
              marginBottom: 4,
            }}
          >
            HIDDEN · {tucked.length}
          </Text>
        ) : null}

        {tucked.map((row) => (
          <CardLine
            key={row.id}
            title={row.title}
            detail={detailOf(row)}
            hidden
            onEdit={() => open(row)}
            onRestore={() => void restoreCatalogRow(catalog, row.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ChipRow({
  chips,
  selected,
  onSelect,
  counts,
}: {
  chips: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {chips.map((chip) => {
        const on = selected === chip.id;
        const count = counts?.[chip.id];
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelect(chip.id)}
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
              {chip.label}
              {typeof count === "number" ? ` ${count}` : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function CardLine({
  title,
  detail,
  hidden,
  onEdit,
  onHide,
  onRestore,
}: {
  title: string;
  detail: string;
  hidden: boolean;
  onEdit: () => void;
  onHide?: () => void;
  onRestore?: () => void;
}) {
  return (
    <View style={{ ...cardRow, opacity: hidden ? 0.55 : 1 }}>
      <Text numberOfLines={1} style={cardTitle}>
        {title}
      </Text>
      {detail ? (
        <Text numberOfLines={1} style={cardDetail}>
          {detail}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={{ color: "#FF007F", fontSize: 11, fontWeight: "700" }}>Edit</Text>
        </Pressable>
        {hidden ? (
          <Pressable onPress={onRestore} hitSlop={8}>
            <Text style={{ color: "#3ECFBF", fontSize: 11, fontWeight: "700" }}>Restore</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onHide} hitSlop={8}>
            <Text style={{ color: "rgba(255,138,138,0.9)", fontSize: 11, fontWeight: "700" }}>
              Hide
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const cardRow = {
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(255,255,255,0.08)",
};

const cardTitle = {
  color: "#F4F4F6",
  fontWeight: "700" as const,
  fontSize: 14,
};

const cardDetail = {
  color: "rgba(244,244,246,0.62)",
  fontSize: 12,
  marginTop: 2,
};

const cardMeta = {
  color: "rgba(244,244,246,0.4)",
  fontSize: 11,
  marginTop: 2,
};

const field = {
  marginTop: 10,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
  borderRadius: 8,
  padding: 10,
  color: "#F4F4F6",
  fontSize: 14,
} as const;
