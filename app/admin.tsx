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
import { FeedbackPane } from "@/components/admin/FeedbackPane";
import { DemoPane } from "@/components/admin/DemoPane";
import { ReportsPane } from "@/components/admin/ReportsPane";
import { UsersSpreadsheet } from "@/components/admin/UsersSpreadsheet";
import { WrittenPane } from "@/components/admin/WrittenPane";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { useCatalogRevision } from "@/lib/catalog-overlay";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

type Tab = "setup" | "users" | "reports" | "feedback" | "written" | "demo" | CatalogKey | "spicyLive";

const NAV: { id: Tab; label: string }[] = [
  { id: "setup", label: "Setup" },
  { id: "demo", label: "Demo" },
  { id: "users", label: "Users" },
  { id: "reports", label: "Reports" },
  { id: "feedback", label: "Feedback" },
  { id: "written", label: "Written" },
  { id: "spicyLive", label: "Copies" },
  { id: "fantasy", label: "Fantasy" },
  { id: "spicyDares", label: "Dare Me" },
  { id: "chicken", label: "Chicken" },
  { id: "bets", label: "Bets" },
  { id: "roleplays", label: "Roleplays" },
  { id: "positions", label: "Positions" },
  { id: "dates", label: "Dates" },
  { id: "coupons", label: "Coupons" },
  { id: "discover", label: "Discover" },
  { id: "curiosity", label: "Curiosity" },
  { id: "how", label: "The How" },
  { id: "spicySeeds", label: "Spicy seeds" },
  { id: "photo", label: "Photos" },
  { id: "spark", label: "Spark" },
];

export default function AdminScreen() {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [pass, setPass] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [q, setQ] = useState("");
  const rev = useCatalogRevision();
  void rev;
  const {
    allProfiles,
    allCouples,
    allCards,
    ready,
    usingCloud,
    canUseDemo,
    refreshCloudAccounts,
  } = useApp();
  const { width } = useWindowDimensions();
  const stacked = width < 720;

  useEffect(() => {
    if (!unlocked || !usingCloud || !ready) return;
    void refreshCloudAccounts();
  }, [unlocked, usingCloud, ready, refreshCloudAccounts]);

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
        {NAV.filter((row) => row.id !== "demo" || canUseDemo).map((row) => {
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
          <UsersSpreadsheet />
        ) : tab === "reports" ? (
          <ReportsPane />
        ) : tab === "feedback" ? (
          <FeedbackPane />
        ) : tab === "written" ? (
          <WrittenPane />
        ) : tab === "demo" ? (
          <DemoPane />
        ) : tab === "spicyLive" ? (
          <LiveSpicyPane cards={allCards} profiles={allProfiles} couples={allCouples} />
        ) : (
          <CatalogPane key={tab} catalog={tab} query={q} onQuery={setQ} />
        )}
      </View>
    </View>
  );
}

function SetupPane() {
  const cloud = isSupabaseConfigured;
  const { user, usingCloud } = useApp();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>How this scales</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 8, lineHeight: 20 }}>
        Pairing and catalog edits now live in Supabase when the keys are set. Each couple
        gets their own email accounts and a six-character code. Hub play (jar, calendar,
        games) still caches on the phone until that sync lands.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 20 }}>Right now (no Supabase)</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        One browser. Effectively one couple (two people) on this computer. Not 100. Not
        two real phones.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 16 }}>Supabase Free · $0</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        50,000 monthly active users. 500 MB database. 1 GB file storage. 5 GB bandwidth.
        Project pauses after a week of no traffic. For Duoma text (accounts, cards, play)
        that is thousands of couples. Vault video and private photos stay on the
        phone, so they do not eat the 1 GB.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 16 }}>Supabase Pro · $25 / month</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        100,000 monthly active users, then about $0.003 each. 8 GB database. 100 GB files.
        250 GB bandwidth. Daily backups. Does not pause. One live project is usually just
        the $25 — Pro includes $10 of compute credit that covers the default server.
      </Text>
      <Text style={{ color: "#F4F4F6", fontWeight: "800", marginTop: 16 }}>Best free path</Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 6, lineHeight: 20 }}>
        Vercel Hobby + Supabase Free. Same app, same /admin. Flip the project to Pro when
        you need backups, it would otherwise pause, or photos outgrow 1 GB. No rewrite.
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
        {usingCloud && user?.email ? ` · signed in as ${user.email}` : usingCloud ? " · not signed in" : ""}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.6)", marginTop: 8, lineHeight: 20 }}>
        {cloud
          ? "URL and anon key are in the env. Pairing uses email + the six-character code. If Feedback is empty or In app is 0m after a refresh, paste SQL 018 in the Supabase SQL editor and Run it. That is the passphrase — you do not sign in a second time. 015 lists every pair. 016 is Written homemade cards. 018 reads Feedback, birthdays in a pair’s backup, reports, bans, and catalog writes. 011 is Help → Feedback. 012 is two-phone check-ins. 013 is lists and games for a new phone. In-app minutes only move after someone keeps the live app open."
          : "Create a project at supabase.com. In the SQL editor run 001 through 018. Turn on Auth → Email. Put EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY on Vercel."}
      </Text>
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
  const rev = useCatalogRevision();
  const rows = catalogRows(catalog);
  const groupChips = catalogGroupChips(catalog);
  const chips = [{ id: "all", label: "All" }, ...groupChips];
  const groups = catalogGroups(catalog);
  const hidden = new Set(hiddenIds(catalog));
  const [group, setGroup] = useState("all");
  void rev;
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editGroup, setEditGroup] = useState(groups[0] || "");
  const [adding, setAdding] = useState(false);

  const needle = query.trim().toLowerCase();
  const inCategory =
    group === "all" ? rows : rows.filter((row) => rowInGroup(row, group));
  const matched = inCategory.filter((row) => {
    if (!needle) return true;
    return `${row.title} ${row.body} ${row.group} ${row.id}`.toLowerCase().includes(needle);
  });
  const hiddenCount = matched.filter((row) => hidden.has(row.id)).length;

  const open = (row: { id: string; title: string; body: string; group: string }) => {
    setAdding(false);
    setDraftId(row.id);
    setTitle(row.title);
    setBody(row.body);
    setEditGroup(
      row.group.split(",")[0]?.trim() || (group === "all" ? groups[0] : group) || groups[0] || ""
    );
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
          {hiddenCount ? ` · ${hiddenCount} hidden` : ""}
        </Text>
        <ChipRow
          chips={chips}
          selected={group}
          counts={Object.fromEntries(
            chips.map((chip) => [
              chip.id,
              chip.id === "all"
                ? rows.length
                : rows.filter((row) => rowInGroup(row, chip.id)).length,
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
          placeholder={group === "all" ? "Search all cards" : "Search this category"}
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
              setEditGroup(group === "all" ? groups[0] || "" : group || groups[0] || "");
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

        {matched.length === 0 ? (
          <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 8 }}>
            {needle ? "No cards match that search." : "No cards in this category."}
          </Text>
        ) : null}

        {matched.map((row) => {
          const isHidden = hidden.has(row.id);
          return (
            <CardLine
              key={row.id}
              title={row.title}
              detail={detailOf(row)}
              hidden={isHidden}
              onEdit={() => open(row)}
              onHide={() => void hideCatalogRow(catalog, row.id)}
              onRestore={() => void restoreCatalogRow(catalog, row.id)}
            />
          );
        })}
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
      {hidden ? (
        <Text style={{ color: "rgba(244,244,246,0.4)", fontSize: 11, marginTop: 2 }}>
          Hidden from the game
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={{ color: "#FF007F", fontSize: 11, fontWeight: "700" }}>Edit</Text>
        </Pressable>
        {hidden ? (
          <Pressable onPress={onRestore} hitSlop={8}>
            <Text style={{ color: "#3ECFBF", fontSize: 11, fontWeight: "700" }}>Show</Text>
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
