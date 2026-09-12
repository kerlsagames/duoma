import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  DATE_COST_FILTERS,
  DATE_LOCATION_FILTERS,
  DATE_TIME_FILTERS,
  DATE_VIBE_FILTERS,
  DEFAULT_DATE_FILTERS,
  filterDateIdeas,
  pickRandomDateIdea,
  type DateCostTag,
  type DateIdea,
  type DateIdeaFilters,
  type DateLocationTag,
  type DateTimeTag,
  type DateVibeTag,
} from "@/lib/dateIdeas";
import { formatLongDate } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { BucketKind } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const ACCENT = "#FF6B9A";
const KINDS: BucketKind[] = ["place", "meal", "trip", "other"];

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
                borderColor: on ? ACCENT : "rgba(255,255,255,0.12)",
                backgroundColor: on ? "rgba(255,107,154,0.18)" : "rgba(255,255,255,0.04)",
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
  const { bucketItems, addBucketItem, spinDateNight, markBucketDone } = useApp();
  const [filters, setFilters] = useState<DateIdeaFilters>(DEFAULT_DATE_FILTERS);
  const [picked, setPicked] = useState<DateIdea | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<BucketKind>("place");
  const [notes, setNotes] = useState("");
  const [scheduledOn, setScheduledOn] = useState("");
  const [spunId, setSpunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBucket, setShowBucket] = useState(false);

  const pool = useMemo(() => filterDateIdeas(filters), [filters]);
  const open = bucketItems.filter((row) => !row.doneAt);

  const spinIdea = () => {
    const next = pickRandomDateIdea(filters, picked?.id ?? null);
    setPicked(next);
  };

  const saveIdeaToBucket = async () => {
    if (!picked) return;
    setError(null);
    try {
      await addBucketItem({
        title: picked.title,
        kind: picked.location === "home" ? "other" : "place",
        notes: `${picked.blurb} · ${LOC_LABEL[picked.location]} · ${COST_LABEL[picked.cost]} · ${VIBE_LABEL[picked.vibe]}`,
        scheduledOn: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
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
      body="Spin a date, then narrow the pot with filters."
    >
      <Text
        style={{
          marginBottom: 12,
          fontSize: 13,
          color: "rgba(244,244,246,0.5)",
        }}
      >
        {pool.length} idea{pool.length === 1 ? "" : "s"} match these filters
      </Text>

      <PrimaryButton
        label={picked ? "Spin again" : "Spin a date night"}
        onPress={spinIdea}
        disabled={pool.length === 0}
      />

      {pool.length === 0 ? (
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
              color: ACCENT,
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
          <Pressable
            onPress={() => void saveIdeaToBucket()}
            style={{
              marginTop: 16,
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="bookmark-outline" size={16} color={ACCENT} />
            <Text style={{ color: ACCENT, fontWeight: "700", fontSize: 14 }}>
              Save to our list
            </Text>
          </Pressable>
        </View>
      ) : null}

      {error ? (
        <Text style={{ marginTop: 10, color: "#FB7185", fontSize: 13 }}>
          {error}
        </Text>
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
        onChange={(location) => setFilters((f) => ({ ...f, location }))}
      />
      <FilterRow
        label="Time of day"
        options={DATE_TIME_FILTERS}
        value={filters.time}
        onChange={(time) => setFilters((f) => ({ ...f, time }))}
      />
      <FilterRow
        label="Budget"
        options={DATE_COST_FILTERS}
        value={filters.cost}
        onChange={(cost) => setFilters((f) => ({ ...f, cost }))}
      />
      <FilterRow
        label="Vibe / energy"
        options={DATE_VIBE_FILTERS}
        value={filters.vibe}
        onChange={(vibe) => setFilters((f) => ({ ...f, vibe }))}
      />

      <Pressable
        onPress={() => setShowBucket((v) => !v)}
        style={{
          marginTop: 28,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(244,244,246,0.45)",
          }}
        >
          Your saved list ({open.length})
        </Text>
        <Ionicons
          name={showBucket ? "chevron-up" : "chevron-down"}
          size={18}
          color="rgba(244,244,246,0.45)"
        />
      </Pressable>

      {showBucket ? (
        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            label="Spin from saved list"
            tone="ghost"
            onPress={() => void spinBucket()}
          />
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
              <Text style={{ color: ACCENT, fontSize: 11, fontWeight: "700" }}>
                SAVED SPIN
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  color: "#F4F4F6",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {bucketItems.find((row) => row.id === spunId)?.title}
              </Text>
            </View>
          ) : null}

          <View style={{ marginTop: 12, gap: 10 }}>
            {open.length === 0 ? (
              <Text style={{ color: "rgba(244,244,246,0.5)", fontSize: 14 }}>
                Nothing saved yet. Spin an idea above and bookmark it.
              </Text>
            ) : (
              open.map((item) => (
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
                    {item.scheduledOn
                      ? ` · ${formatLongDate(item.scheduledOn)}`
                      : ""}
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
                  <Pressable onPress={() => void markBucketDone(item.id)}>
                    <Text style={{ marginTop: 10, color: ACCENT, fontSize: 13 }}>
                      Mark done
                    </Text>
                  </Pressable>
                </View>
              ))
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
            Add custom idea
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Night market tacos"
            placeholderTextColor="rgba(244,244,246,0.35)"
            className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
          />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional)"
            placeholderTextColor="rgba(244,244,246,0.35)"
            className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
          />
          <TextInput
            value={scheduledOn}
            onChangeText={setScheduledOn}
            placeholder="Optional date YYYY-MM-DD"
            placeholderTextColor="rgba(244,244,246,0.35)"
            className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
          />
          <View className="mt-3 flex-row flex-wrap gap-2">
            {KINDS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setKind(item)}
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
              label="Add to list"
              tone="ghost"
              onPress={() => void saveCustom()}
              disabled={!title.trim()}
            />
          </View>
        </View>
      ) : null}
    </HubScreen>
  );
}
