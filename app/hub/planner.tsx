import { HubScreen } from "@/components/hub/HubScreen";
import { PlayRatingsToggle, PlayTabs } from "@/components/hub/PlayTabs";
import { ScoreSlider } from "@/components/ScoreSlider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  DATE_COST_FILTERS,
  DATE_LOCATION_FILTERS,
  DATE_TIME_FILTERS,
  DATE_VIBE_FILTERS,
  DEFAULT_DATE_FILTERS,
  filterDateIdeas,
  pickRandomDateIdea,
  searchDateIdeas,
  type DateCostTag,
  type DateIdea,
  type DateIdeaFilters,
  type DateLocationTag,
  type DateTimeTag,
  type DateVibeTag,
} from "@/lib/dateIdeas";
import { formatLongDate, localDateKey } from "@/lib/dates";
import { sectionAccent } from "@/lib/hub-theme";
import {
  dateAskForBucket,
  myPlayRating,
  ratingsForTarget,
  tonightAskCopy,
} from "@/lib/play-items";
import {
  DATE_NIGHT_PREFS_KEY,
  usePlayRatingsPrefs,
} from "@/lib/play-prefs";
import { useApp } from "@/lib/store";
import type {
  BucketItem,
  BucketKind,
  DateNightAsk,
  PlayItemRating,
} from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const accent = () => sectionAccent("connect", "#FF6B9A");
const KINDS: BucketKind[] = ["place", "meal", "trip", "other"];
type Tab = "ideas" | "todo" | "done";

const COST_LABEL: Record<DateCostTag, string> = {
  free: "Free",
  low: "Under $30",
  splurge: "Splurge",
};
const TIME_LABEL: Record<DateTimeTag, string> = {
  day: "Daytime",
  night: "Night",
  anytime: "Anytime",
};
const LOC_LABEL: Record<DateLocationTag, string> = {
  home: "At-home",
  out: "Out",
};
const VIBE_LABEL: Record<DateVibeTag, string> = {
  cozy: "Cozy",
  active: "Active",
  spicy: "Spicy",
  creative: "Creative",
  social: "Social",
  relaxed: "Relaxed",
};

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          marginBottom: 8,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: "rgba(244,244,246,0.45)",
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const on = opt.id === value;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: on ? accent() : "rgba(255,255,255,0.12)",
                backgroundColor: on
                  ? "rgba(255,107,154,0.18)"
                  : "rgba(255,255,255,0.04)",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: on ? "#FFB3CB" : "rgba(244,244,246,0.7)",
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function PlannerScreen() {
  const {
    user,
    partner,
    bucketItems,
    dateNightAsks,
    playItemRatings,
    addBucketItem,
    spinDateNight,
    markBucketDone,
    sendDateNightAsk,
    respondDateNightAsk,
    ratePlayItem,
  } = useApp();
  const { prefs, save: savePrefs } = usePlayRatingsPrefs(DATE_NIGHT_PREFS_KEY);
  const partnerName = partner?.displayName ?? "them";
  const today = localDateKey();

  const [tab, setTab] = useState<Tab>("ideas");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<DateIdeaFilters>(DEFAULT_DATE_FILTERS);
  const [picked, setPicked] = useState<DateIdea | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<BucketKind>("place");
  const [notes, setNotes] = useState("");
  const [scheduledOn, setScheduledOn] = useState("");
  const [spunId, setSpunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBrowse, setShowBrowse] = useState(false);
  const [query, setQuery] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const pool = useMemo(() => filterDateIdeas(filters), [filters]);
  const browse = useMemo(
    () => searchDateIdeas(filters, query),
    [filters, query]
  );
  const open = bucketItems.filter((row) => !row.doneAt);
  const done = bucketItems.filter((row) => row.doneAt);
  const incomingAsks = dateNightAsks.filter(
    (row) =>
      user &&
      row.toUserId === user.id &&
      row.nightKey === today &&
      (row.status === "offered" || row.status === "accepted")
  );

  const ideaNotes = (idea: DateIdea) =>
    `${idea.blurb} · ${LOC_LABEL[idea.location]} · ${COST_LABEL[idea.cost]} · ${VIBE_LABEL[idea.vibe]}`;

  const saveIdea = async (idea: DateIdea) => {
    return addBucketItem({
      title: idea.title,
      kind: idea.location === "home" ? "other" : "place",
      notes: ideaNotes(idea),
      scheduledOn: null,
      sourceId: idea.id,
    });
  };

  const saveIdeaToTodo = async () => {
    if (!picked) return;
    setError(null);
    try {
      await saveIdea(picked);
      setSavedFlash(true);
      setTab("todo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  const askFromIdea = async () => {
    if (!picked) return;
    setError(null);
    try {
      const row = await saveIdea(picked);
      await sendDateNightAsk(row.id);
      setTab("todo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    }
  };

  const saveCustom = async () => {
    setError(null);
    try {
      await addBucketItem({
        title,
        kind,
        notes,
        scheduledOn: scheduledOn || null,
      });
      setTitle("");
      setNotes("");
      setScheduledOn("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  const spinBucket = async () => {
    const item = await spinDateNight();
    setSpunId(item?.id ?? null);
  };

  return (
    <HubScreen
      kicker="Connect · Date night"
      title="Date Night Generator"
      body="Spin or search, save it to To-do, then tick it off. Tap one to ask them tonight."
      accent={accent()}
      headerRight={
        <Pressable
          onPress={() => setSettingsOpen((value) => !value)}
          hitSlop={10}
          accessibilityLabel="Date night settings"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        >
          <Ionicons
            name={settingsOpen ? "close" : "settings-outline"}
            size={20}
            color={accent()}
          />
        </Pressable>
      }
    >
      {settingsOpen ? (
        <View>
          <Text
            style={{
              marginBottom: 12,
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(244,244,246,0.45)",
            }}
          >
            Settings
          </Text>
          <PlayRatingsToggle
            on={prefs.ratingsOn}
            accent={accent()}
            onToggle={() => void savePrefs({ ratingsOn: !prefs.ratingsOn })}
          />
        </View>
      ) : (
        <>
          <PlayTabs
            tabs={[
              { id: "ideas" as const, label: "Ideas" },
              { id: "todo" as const, label: `To-do${open.length ? ` · ${open.length}` : ""}` },
              { id: "done" as const, label: "Completed" },
            ]}
            current={tab}
            onChange={setTab}
            accent={accent()}
          />

          {error ? (
            <Text style={{ marginBottom: 10, color: "#FB7185", fontSize: 13 }}>
              {error}
            </Text>
          ) : null}

          {tab === "ideas" ? (
            <IdeasTab
              poolCount={pool.length}
              picked={picked}
              showBrowse={showBrowse}
              query={query}
              browse={browse}
              filters={filters}
              savedFlash={savedFlash}
              onSpin={() => {
                setSavedFlash(false);
                setPicked(pickRandomDateIdea(filters, picked?.id ?? null));
              }}
              onToggleBrowse={() => setShowBrowse((value) => !value)}
              onQuery={setQuery}
              onFilters={setFilters}
              onPick={(idea) => {
                setSavedFlash(false);
                setPicked(idea);
              }}
              onSave={() => void saveIdeaToTodo()}
              onAsk={() => void askFromIdea()}
            />
          ) : null}

          {tab === "todo" ? (
            <TodoTab
              open={open}
              incoming={incomingAsks}
              asks={dateNightAsks}
              today={today}
              userId={user?.id ?? null}
              partnerName={partnerName}
              spunId={spunId}
              title={title}
              notes={notes}
              scheduledOn={scheduledOn}
              kind={kind}
              onTitle={setTitle}
              onNotes={setNotes}
              onScheduledOn={setScheduledOn}
              onKind={setKind}
              onSpin={() => void spinBucket()}
              onDone={(id) => void markBucketDone(id)}
              onAsk={(id) =>
                void sendDateNightAsk(id).catch((err) =>
                  setError(err instanceof Error ? err.message : "Could not send")
                )
              }
              onRespond={(id, status) => void respondDateNightAsk(id, status)}
              onAdd={() => void saveCustom()}
              bucketById={(id) => bucketItems.find((row) => row.id === id) ?? null}
            />
          ) : null}

          {tab === "done" ? (
            <DoneTab
              done={done}
              ratingsOn={prefs.ratingsOn}
              ratings={playItemRatings}
              userId={user?.id ?? null}
              partnerName={partnerName}
              onRate={(id, stars) => void ratePlayItem("date", id, stars)}
            />
          ) : null}
        </>
      )}
    </HubScreen>
  );
}

function IdeasTab({
  poolCount,
  picked,
  showBrowse,
  query,
  browse,
  filters,
  savedFlash,
  onSpin,
  onToggleBrowse,
  onQuery,
  onFilters,
  onPick,
  onSave,
  onAsk,
}: {
  poolCount: number;
  picked: DateIdea | null;
  showBrowse: boolean;
  query: string;
  browse: DateIdea[];
  filters: DateIdeaFilters;
  savedFlash: boolean;
  onSpin: () => void;
  onToggleBrowse: () => void;
  onQuery: (value: string) => void;
  onFilters: (next: DateIdeaFilters) => void;
  onPick: (idea: DateIdea) => void;
  onSave: () => void;
  onAsk: () => void;
}) {
  return (
    <>
      <Text
        style={{
          marginBottom: 12,
          fontSize: 13,
          color: "rgba(244,244,246,0.5)",
        }}
      >
        {poolCount} idea{poolCount === 1 ? "" : "s"} match these filters
      </Text>

      <PrimaryButton
        label={picked ? "Spin again" : "Spin a date night"}
        onPress={onSpin}
        disabled={poolCount === 0}
      />
      <View style={{ marginTop: 10 }}>
        <PrimaryButton
          label={showBrowse ? "Hide the list" : "Search all 400"}
          tone="ghost"
          onPress={onToggleBrowse}
        />
      </View>

      {poolCount === 0 ? (
        <Text
          style={{
            marginTop: 12,
            color: "#FB7185",
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          No ideas match. Loosen a filter and try again.
        </Text>
      ) : null}

      {picked ? (
        <View
          style={{
            marginTop: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "rgba(255,107,154,0.45)",
            backgroundColor: "rgba(255,107,154,0.12)",
            padding: 18,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: accent(),
            }}
          >
            Tonight&apos;s pick
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 24,
              fontWeight: "700",
              color: "#F4F4F6",
              lineHeight: 30,
            }}
          >
            {picked.title}
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 22,
              color: "rgba(244,244,246,0.72)",
            }}
          >
            {picked.blurb}
          </Text>
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {[
              LOC_LABEL[picked.location],
              TIME_LABEL[picked.time],
              COST_LABEL[picked.cost],
              VIBE_LABEL[picked.vibe],
            ].map((tag) => (
              <View
                key={tag}
                style={{
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Text style={{ fontSize: 12, color: "rgba(244,244,246,0.7)" }}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
          {savedFlash ? (
            <Text style={{ marginTop: 12, color: accent(), fontWeight: "600" }}>
              Saved to To-do.
            </Text>
          ) : null}
          <View style={{ marginTop: 14, gap: 10 }}>
            <PrimaryButton label="Save to to-do" tone="ghost" onPress={onSave} />
            <PrimaryButton label="Try this tonight?" onPress={onAsk} />
          </View>
        </View>
      ) : null}

      <Text
        style={{
          marginTop: 28,
          marginBottom: 12,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(244,244,246,0.45)",
        }}
      >
        Filters
      </Text>
      <FilterRow
        label="Location"
        options={DATE_LOCATION_FILTERS}
        value={filters.location}
        onChange={(location) => onFilters({ ...filters, location })}
      />
      <FilterRow
        label="Time of day"
        options={DATE_TIME_FILTERS}
        value={filters.time}
        onChange={(time) => onFilters({ ...filters, time })}
      />
      <FilterRow
        label="Budget"
        options={DATE_COST_FILTERS}
        value={filters.cost}
        onChange={(cost) => onFilters({ ...filters, cost })}
      />
      <FilterRow
        label="Vibe / energy"
        options={DATE_VIBE_FILTERS}
        value={filters.vibe}
        onChange={(vibe) => onFilters({ ...filters, vibe })}
      />

      {showBrowse ? (
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <TextInput
            value={query}
            onChangeText={onQuery}
            placeholder="Search titles and notes"
            placeholderTextColor="rgba(244,244,246,0.35)"
            className="h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
          />
          <Text
            style={{
              marginTop: 10,
              marginBottom: 8,
              fontSize: 13,
              color: "rgba(244,244,246,0.5)",
            }}
          >
            {browse.length} match{browse.length === 1 ? "" : "es"}
          </Text>
          {browse.length === 0 ? (
            <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 14 }}>
              Nothing matches. Try a different word or loosen a filter.
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {browse.map((idea) => {
                const on = picked?.id === idea.id;
                return (
                  <Pressable
                    key={idea.id}
                    onPress={() => onPick(idea)}
                    style={{
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: on
                        ? "rgba(255,107,154,0.45)"
                        : "rgba(255,255,255,0.1)",
                      backgroundColor: on
                        ? "rgba(255,107,154,0.12)"
                        : "rgba(255,255,255,0.04)",
                      padding: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#F4F4F6",
                      }}
                    >
                      {idea.title}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        lineHeight: 18,
                        color: "rgba(244,244,246,0.58)",
                      }}
                      numberOfLines={2}
                    >
                      {idea.blurb}
                    </Text>
                    <Text
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        letterSpacing: 0.4,
                        color: "rgba(255,107,154,0.8)",
                      }}
                    >
                      {LOC_LABEL[idea.location]} · {COST_LABEL[idea.cost]} ·{" "}
                      {VIBE_LABEL[idea.vibe]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ) : null}
    </>
  );
}

function TodoTab({
  open,
  incoming,
  asks,
  today,
  userId,
  partnerName,
  spunId,
  title,
  notes,
  scheduledOn,
  kind,
  onTitle,
  onNotes,
  onScheduledOn,
  onKind,
  onSpin,
  onDone,
  onAsk,
  onRespond,
  onAdd,
  bucketById,
}: {
  open: BucketItem[];
  incoming: DateNightAsk[];
  asks: DateNightAsk[];
  today: string;
  userId: string | null;
  partnerName: string;
  spunId: string | null;
  title: string;
  notes: string;
  scheduledOn: string;
  kind: BucketKind;
  onTitle: (value: string) => void;
  onNotes: (value: string) => void;
  onScheduledOn: (value: string) => void;
  onKind: (value: BucketKind) => void;
  onSpin: () => void;
  onDone: (id: string) => void;
  onAsk: (id: string) => void;
  onRespond: (id: string, status: "accepted" | "declined") => void;
  onAdd: () => void;
  bucketById: (id: string) => BucketItem | null;
}) {
  return (
    <View>
      {incoming.length ? (
        <View style={{ marginBottom: 18, gap: 10 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(244,244,246,0.45)",
            }}
          >
            Tonight?
          </Text>
          {incoming.map((ask) => {
            const item = bucketById(ask.bucketId);
            if (!item) return null;
            const mine = ask.fromUserId === userId;
            return (
              <View
                key={ask.id}
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "rgba(255,107,154,0.45)",
                  backgroundColor: "rgba(255,107,154,0.12)",
                  padding: 14,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#F4F4F6" }}>
                  {item.title}
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "rgba(244,244,246,0.62)",
                    lineHeight: 18,
                  }}
                >
                  {tonightAskCopy(ask.status, mine, partnerName, "date")}
                </Text>
                {ask.status === "offered" && !mine ? (
                  <View style={{ marginTop: 12, gap: 8 }}>
                    <PrimaryButton
                      label="Yes — tonight"
                      onPress={() => onRespond(ask.id, "accepted")}
                    />
                    <PrimaryButton
                      label="Not tonight"
                      tone="ghost"
                      onPress={() => onRespond(ask.id, "declined")}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      <PrimaryButton label="Spin from to-do" tone="ghost" onPress={onSpin} />
      {spunId ? (
        <View
          style={{
            marginTop: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,107,154,0.35)",
            backgroundColor: "rgba(255,107,154,0.1)",
            padding: 14,
          }}
        >
          <Text style={{ color: accent(), fontSize: 11, fontWeight: "700" }}>
            TO-DO SPIN
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: "#F4F4F6",
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            {bucketById(spunId)?.title}
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: 14, gap: 10 }}>
        {open.length === 0 ? (
          <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 14, lineHeight: 20 }}>
            Nothing on the list yet. Save a date from Ideas, then tick it off
            when you do it.
          </Text>
        ) : (
          open.map((item) => {
            const ask = dateAskForBucket(asks, item.id, today);
            const mine = ask ? ask.fromUserId === userId : true;
            return (
              <View
                key={item.id}
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor:
                    item.id === spunId
                      ? "rgba(255,107,154,0.45)"
                      : "rgba(255,255,255,0.1)",
                  backgroundColor:
                    item.id === spunId
                      ? "rgba(255,107,154,0.12)"
                      : "rgba(255,255,255,0.04)",
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: "rgba(244,244,246,0.45)",
                  }}
                >
                  {item.kind}
                  {item.scheduledOn ? ` · ${formatLongDate(item.scheduledOn)}` : ""}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#F4F4F6",
                  }}
                >
                  {item.title}
                </Text>
                {item.notes ? (
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: "rgba(244,244,246,0.55)",
                    }}
                    numberOfLines={2}
                  >
                    {item.notes}
                  </Text>
                ) : null}
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    lineHeight: 18,
                    color: "rgba(244,244,246,0.5)",
                  }}
                >
                  {tonightAskCopy(ask?.status ?? null, mine, partnerName, "date")}
                </Text>
                <View style={{ marginTop: 12, gap: 8 }}>
                  {ask?.status === "offered" && !mine ? (
                    <>
                      <PrimaryButton
                        label="Yes — tonight"
                        onPress={() => onRespond(ask.id, "accepted")}
                      />
                      <PrimaryButton
                        label="Not tonight"
                        tone="ghost"
                        onPress={() => onRespond(ask.id, "declined")}
                      />
                    </>
                  ) : !ask ? (
                    <PrimaryButton
                      label="Try this tonight?"
                      onPress={() => onAsk(item.id)}
                    />
                  ) : null}
                  <PrimaryButton
                    label="Mark done"
                    tone="ghost"
                    onPress={() => onDone(item.id)}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      <Text
        style={{
          marginTop: 20,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(244,244,246,0.45)",
        }}
      >
        Add your own
      </Text>
      <TextInput
        value={title}
        onChangeText={onTitle}
        placeholder="Night market tacos"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <TextInput
        value={notes}
        onChangeText={onNotes}
        placeholder="Notes (optional)"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <TextInput
        value={scheduledOn}
        onChangeText={onScheduledOn}
        placeholder="Optional date YYYY-MM-DD"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <View className="mt-3 flex-row flex-wrap gap-2">
        {KINDS.map((item) => (
          <Pressable
            key={item}
            onPress={() => onKind(item)}
            className={`rounded-full border px-3 py-2 ${
              kind === item
                ? "border-neon bg-neon/20"
                : "border-white/15 bg-white/5"
            }`}
          >
            <Text className="text-[13px] capitalize text-mist">{item}</Text>
          </Pressable>
        ))}
      </View>
      <View className="mt-3">
        <PrimaryButton
          label="Add to to-do"
          tone="ghost"
          onPress={onAdd}
          disabled={!title.trim()}
        />
      </View>
    </View>
  );
}

function DoneTab({
  done,
  ratingsOn,
  ratings,
  userId,
  partnerName,
  onRate,
}: {
  done: BucketItem[];
  ratingsOn: boolean;
  ratings: PlayItemRating[];
  userId: string | null;
  partnerName: string;
  onRate: (id: string, stars: number) => void;
}) {
  if (!done.length) {
    return (
      <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 14, lineHeight: 20 }}>
        Tick something off To-do and it lands here.
      </Text>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {done.map((item) => {
        const mine = myPlayRating(ratings, "date", item.id, userId);
        const theirs = ratingsForTarget(ratings, "date", item.id).find(
          (row) => row.userId !== userId
        );
        return (
          <View
            key={item.id}
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.04)",
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#F4F4F6" }}>
              {item.title}
            </Text>
            {item.doneAt ? (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "rgba(244,244,246,0.45)",
                }}
              >
                Done
              </Text>
            ) : null}
            {ratingsOn ? (
              <View style={{ marginTop: 12 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(244,244,246,0.5)",
                    marginBottom: 8,
                  }}
                >
                  You {mine ? mine.stars.toFixed(1) : "—"} · {partnerName}{" "}
                  {theirs ? theirs.stars.toFixed(1) : "—"}
                </Text>
                <ScoreSlider
                  value={mine?.stars ?? 7.5}
                  onChange={(stars) => onRate(item.id, stars)}
                  accent={accent()}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
