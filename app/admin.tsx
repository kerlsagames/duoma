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
  catalogGroups,
  catalogRows,
  hiddenIds,
  newCatalogId,
} from "@/lib/catalog-rows";
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

type Tab = "users" | CatalogKey | "spicyLive";

const NAV: { id: Tab; label: string }[] = [
  { id: "users", label: "Users & couples" },
  { id: "spicyLive", label: "Get Spicy (in play)" },
  ...CATALOG_KEYS.map((row) => ({ id: row.id as Tab, label: row.label })),
];

export default function AdminScreen() {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [pass, setPass] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [q, setQ] = useState("");
  const rev = useCatalogRevision();
  const { allProfiles, allCouples, allCards, ready } = useApp();
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
            ? { maxHeight: 72, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" }
            : { width: 220, borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.08)" }
        }
        contentContainerStyle={{
          padding: 12,
          paddingBottom: stacked ? 12 : 40,
          flexDirection: stacked ? "row" : "column",
          alignItems: stacked ? "center" : "stretch",
          gap: stacked ? 4 : 0,
        }}
      >
        <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", fontSize: 11, letterSpacing: 1.6 }}>
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
                marginTop: 6,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: on ? "rgba(255,0,127,0.18)" : "transparent",
              }}
            >
              <Text style={{ color: on ? "#FF007F" : "#F4F4F6", fontSize: 13, fontWeight: "700" }}>
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
          style={{ marginTop: 24, padding: 10 }}
        >
          <Text style={{ color: "rgba(244,244,246,0.45)", fontSize: 12 }}>Lock</Text>
        </Pressable>
      </ScrollView>

      <View style={{ flex: 1 }}>
        {!ready ? (
          <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
            <Text style={{ color: "rgba(244,244,246,0.55)" }}>Loading store…</Text>
          </View>
        ) : tab === "users" ? (
          <UsersPane profiles={allProfiles} couples={allCouples} />
        ) : tab === "spicyLive" ? (
          <LiveSpicyPane cards={allCards} profiles={allProfiles} couples={allCouples} />
        ) : (
          <CatalogPane key={`${tab}-${rev}`} catalog={tab} query={q} onQuery={setQ} />
        )}
      </View>
    </View>
  );
}

function UsersPane({
  profiles,
  couples,
}: {
  profiles: ReturnType<typeof useApp>["allProfiles"];
  couples: ReturnType<typeof useApp>["allCouples"];
}) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>
        Users · {profiles.length}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4 }}>
        Everyone in this app’s local store. Two browser tabs are two partners sharing this list.
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
        return (
          <View
            key={profile.id}
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text style={{ color: "#F4F4F6", fontWeight: "800", fontSize: 16 }}>
              {profile.displayName}
              {profile.isDemo ? " · demo" : ""}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 4, fontSize: 12 }}>
              id {profile.id}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 2, fontSize: 12 }}>
              gender {profile.gender ?? "unset"} · created {profile.createdAt}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.55)", marginTop: 2, fontSize: 12 }}>
              couple {couple?.inviteCode ?? "none"} · partner {other?.displayName ?? "waiting"}
            </Text>
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
  const name = (id: string | null) =>
    profiles.find((row) => row.id === id)?.displayName ?? id ?? "—";
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>
        Get Spicy copies · {cards.length}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4, marginBottom: 12 }}>
        Each couple gets a copy of the seed deck. Edit the seed catalog to change everyone’s
        copies. This list is what’s actually in play.
      </Text>
      {cards.length === 0 ? (
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 8 }}>
          No Get Spicy copies yet. Pair an account and the seed deck lands here.
        </Text>
      ) : null}
      {cards.map((card) => {
        const couple = couples.find((row) => row.id === card.coupleId);
        return (
          <View
            key={card.id}
            style={{
              marginTop: 8,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.08)",
              paddingBottom: 8,
            }}
          >
            <Text style={{ color: "#F4F4F6", fontWeight: "700" }}>{card.title}</Text>
            <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 12, marginTop: 2 }}>
              {card.stage} · {card.isActive ? "on" : "off"} · couple {couple?.inviteCode ?? card.coupleId} · {name(couple?.partnerA ?? null)} / {name(couple?.partnerB ?? null)}
            </Text>
            <Text style={{ color: "rgba(244,244,246,0.7)", marginTop: 4, fontSize: 13 }}>
              {card.body}
            </Text>
          </View>
        );
      })}
    </ScrollView>
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
  const groups = catalogGroups(catalog);
  const hidden = new Set(hiddenIds(catalog));
  const needle = query.trim().toLowerCase();
  const visible = rows.filter((row) => {
    if (!needle) return true;
    return `${row.title} ${row.body} ${row.group} ${row.id}`.toLowerCase().includes(needle);
  });
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [group, setGroup] = useState(groups[0] ?? "");
  const [adding, setAdding] = useState(false);

  const open = (row: { id: string; title: string; body: string; group: string }) => {
    setAdding(false);
    setDraftId(row.id);
    setTitle(row.title);
    setBody(row.body);
    setGroup(row.group);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text style={{ color: "#F4F4F6", fontSize: 22, fontWeight: "800" }}>
        {meta.label} · {rows.length}
      </Text>
      <Text style={{ color: "rgba(244,244,246,0.5)", marginTop: 4 }}>
        Hide or edit here and every couple on this origin sees it. Hidden cards leave the live
        decks but stay here so you can restore them.
      </Text>
      <TextInput
        value={query}
        onChangeText={onQuery}
        placeholder="Search"
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
            setGroup(groups[0] ?? "");
          }}
          style={{
            marginTop: 12,
            alignSelf: "flex-start",
            backgroundColor: "#FF007F",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#0B0B0E", fontWeight: "800" }}>Add card</Text>
        </Pressable>
      ) : null}

      {adding || draftId ? (
        <View
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: "#FF007F",
            borderRadius: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: "#FF007F", fontFamily: "SpaceMono", fontSize: 11 }}>
            {adding ? "NEW" : draftId}
          </Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="rgba(244,244,246,0.35)" style={field} />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Body / prompt / options (one per line for Curiosity)"
            placeholderTextColor="rgba(244,244,246,0.35)"
            multiline
            style={{ ...field, minHeight: 90, textAlignVertical: "top" }}
          />
          <TextInput
            value={group}
            onChangeText={setGroup}
            placeholder={`Group (${groups.slice(0, 6).join(", ")})`}
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
                      group: group.trim() || groups[0] || "misc",
                    });
                    setAdding(false);
                  } else if (draftId) {
                    await editCatalogRow(catalog, draftId, {
                      title: title.trim(),
                      body: body.trim(),
                      group: group.trim(),
                    });
                    setDraftId(null);
                  }
                })()
              }
              style={{ backgroundColor: "#FF007F", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}
            >
              <Text style={{ color: "#0B0B0E", fontWeight: "800" }}>Save — everyone gets this</Text>
            </Pressable>
            <Pressable onPress={() => { setAdding(false); setDraftId(null); }} style={{ padding: 10 }}>
              <Text style={{ color: "rgba(244,244,246,0.6)" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {visible.length === 0 ? (
        <Text style={{ color: "rgba(244,244,246,0.45)", marginTop: 16 }}>
          {needle ? "No cards match that search." : "No cards in this catalog."}
        </Text>
      ) : null}

      {visible.map((row) => (
        <View
          key={row.id}
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: hidden.has(row.id) ? "rgba(255,138,138,0.45)" : "rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: 10,
            opacity: hidden.has(row.id) ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#F4F4F6", fontWeight: "700" }}>
            {row.title}
            {hidden.has(row.id) ? " · hidden" : ""}
          </Text>
          <Text style={{ color: "#FF007F", fontSize: 11, marginTop: 2 }}>{row.group}</Text>
          {row.body ? (
            <Text style={{ color: "rgba(244,244,246,0.7)", marginTop: 4, fontSize: 13 }}>
              {row.body}
            </Text>
          ) : null}
          <Text style={{ color: "rgba(244,244,246,0.35)", fontSize: 11, marginTop: 4 }}>{row.id}</Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <Pressable onPress={() => open(row)}>
              <Text style={{ color: "#FF007F", fontWeight: "700" }}>Edit</Text>
            </Pressable>
            {hidden.has(row.id) ? (
              <Pressable onPress={() => void restoreCatalogRow(catalog, row.id)}>
                <Text style={{ color: "#3ECFBF", fontWeight: "700" }}>Restore</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => void hideCatalogRow(catalog, row.id)}>
                <Text style={{ color: "#FF8A8A", fontWeight: "700" }}>Hide for everyone</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const field = {
  marginTop: 10,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
  borderRadius: 8,
  padding: 10,
  color: "#F4F4F6",
  fontSize: 14,
} as const;
