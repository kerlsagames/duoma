import { EdenWorld } from "@/components/eden/EdenWorld";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { loadEdenCreator, saveEdenCreator } from "@/lib/eden-creator";
import {
  applyEdenCreator,
  biomeLabel,
  buildEdenSnapshot,
  EDEN_PHASES,
  EDEN_STAGES,
  emptyEdenCreator,
  type EdenCreator,
  type EdenSnapshot,
} from "@/lib/eden";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { listWhiteFlags } from "@/lib/white-flag";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const INK = "#F4F0E8";

export default function EdenScreen() {
  const router = useRouter();
  const {
    nights,
    checkIns,
    curiosityAnswers,
    jarNotes,
    talkDraws,
    spicyDares,
    positionInvites,
    roleplayInvites,
    fantasySwipes,
    calendarEvents,
  } = useApp();
  const { data, ready } = useMiniApps();
  const [flags, setFlags] = useState<{ createdAt: string }[]>([]);
  const [statsOpen, setStatsOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creator, setCreator] = useState<EdenCreator>(emptyEdenCreator());

  useEffect(() => {
    let alive = true;
    listWhiteFlags().then((rows) => {
      if (alive) setFlags(rows);
    });
    loadEdenCreator().then((row) => {
      if (alive) setCreator(row);
    });
    return () => {
      alive = false;
    };
  }, []);

  const persistCreator = (next: EdenCreator) => {
    setCreator(next);
    void saveEdenCreator(next);
  };

  const live = useMemo(
    () =>
      buildEdenSnapshot({
        pings: data.pings,
        audioNotes: data.audioNotes,
        jarNotes,
        curiosityAnswers,
        talkDraws,
        whiteFlags: flags,
        checkIns,
        photos: data.photos,
        nights,
        dares: spicyDares,
        positions: positionInvites,
        roleplays: roleplayInvites,
        fantasySwipes,
        dateEvents: calendarEvents,
      }),
    [
      data.pings,
      data.audioNotes,
      data.photos,
      jarNotes,
      curiosityAnswers,
      talkDraws,
      flags,
      checkIns,
      nights,
      spicyDares,
      positionInvites,
      roleplayInvites,
      fantasySwipes,
      calendarEvents,
    ]
  );
  const snapshot = useMemo(() => applyEdenCreator(live, creator), [live, creator]);

  const openCreator = () => {
    setStatsOpen(false);
    setCreatorOpen(true);
    if (!creator.enabled) {
      persistCreator({ enabled: true, stage: "full", phase: "auto", dormancy: "awake" });
    }
  };

  return (
    <Screen background="#0B1020">
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 4,
            paddingTop: 4,
            zIndex: 4,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BackButton color="#9FE8C4" fallback={"/(tabs)" as Href} />
          <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => router.push("/hub/worlds" as Href)}
            accessibilityLabel="Change shared world"
            style={{
              height: 44,
              paddingHorizontal: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(159,232,196,0.28)",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <Ionicons name="swap-horizontal" size={16} color="#9FE8C4" />
            <Text style={{ color: "#9FE8C4", fontSize: 12, fontWeight: "700" }}>Worlds</Text>
          </Pressable>
          <Pressable
            onPress={() => (creatorOpen ? setCreatorOpen(false) : openCreator())}
            accessibilityLabel="Eden creator"
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: creator.enabled
                ? "rgba(124,255,178,0.55)"
                : "rgba(159,232,196,0.28)",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: creator.enabled ? "rgba(124,255,178,0.12)" : "transparent",
            }}
          >
            <Ionicons
              name={creatorOpen ? "close" : "color-wand-outline"}
              size={20}
              color="#9FE8C4"
            />
          </Pressable>
          </View>
        </View>
        <View style={{ flex: 1, marginTop: -8 }}>
          {ready ? (
            <EdenWorld snapshot={snapshot} onHearth={() => setStatsOpen(true)} />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: INK, fontFamily: SERIF, fontSize: 22 }}>
                Growing the terrace…
              </Text>
            </View>
          )}
        </View>
        {!creatorOpen && !statsOpen ? (
          <Hud
            snapshot={snapshot}
            creator={creator}
            onOpen={() => setStatsOpen(true)}
          />
        ) : null}
        {statsOpen ? (
          <StatsSheet
            snapshot={snapshot}
            live={live}
            creator={creator}
            onClose={() => setStatsOpen(false)}
            onCreator={openCreator}
          />
        ) : null}
        {creatorOpen ? (
          <CreatorSheet
            live={live}
            creator={creator}
            onChange={persistCreator}
            onClose={() => setCreatorOpen(false)}
          />
        ) : null}
      </View>
    </Screen>
  );
}

function Hud({
  snapshot,
  creator,
  onOpen,
}: {
  snapshot: EdenSnapshot;
  creator: EdenCreator;
  onOpen: () => void;
}) {
  const previewing = creator.enabled && creator.stage !== "live";
  return (
    <Pressable
      onPress={onOpen}
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 18,
        padding: 12,
        borderRadius: 16,
        backgroundColor: "rgba(8,12,20,0.72)",
        borderWidth: 1,
        borderColor: "rgba(159,232,196,0.28)",
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 2,
          color: "rgba(159,232,196,0.7)",
        }}
      >
        {previewing ? "CREATOR" : snapshot.dormancy ? "DORMANT" : biomeLabel(snapshot).toUpperCase()}
      </Text>
      <Text style={{ marginTop: 4, color: INK, fontFamily: SERIF, fontSize: 22 }}>
        {previewing ? EDEN_STAGES.find((row) => row.id === creator.stage)?.label : `Level ${snapshot.level}`}
      </Text>
      <View
        style={{
          marginTop: 8,
          height: 6,
          borderRadius: 3,
          backgroundColor: "rgba(255,255,255,0.12)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.round(snapshot.progress * 100)}%`,
            height: "100%",
            backgroundColor: snapshot.dormancy ? "#8AA0B4" : "#7CFFB2",
          }}
        />
      </View>
      <Text style={{ marginTop: 6, color: "rgba(244,240,232,0.55)", fontSize: 12 }}>
        {previewing
          ? "Preview only — your live couple is unchanged. Wand to edit."
          : snapshot.dormancy
            ? "Twilight fog. Any ping, note, or night wakes it."
            : `${snapshot.totalEP} bio-essence · drag to orbit · tap the hearth`}
      </Text>
    </Pressable>
  );
}

function StatsSheet({
  snapshot,
  live,
  creator,
  onClose,
  onCreator,
}: {
  snapshot: EdenSnapshot;
  live: EdenSnapshot;
  creator: EdenCreator;
  onClose: () => void;
  onCreator: () => void;
}) {
  const previewing = creator.enabled && creator.stage !== "live";
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
        justifyContent: "flex-end",
      }}
    >
      <Pressable
        onPress={onClose}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(6,8,14,0.55)",
        }}
      />
      <View
        style={{
          padding: 18,
          paddingBottom: 28,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          backgroundColor: "#121820",
          borderTopWidth: 1,
          borderColor: "rgba(159,232,196,0.25)",
        }}
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2,
            color: "rgba(159,232,196,0.7)",
          }}
        >
          THE HEARTH
        </Text>
        <Text style={{ marginTop: 6, color: INK, fontFamily: SERIF, fontSize: 26 }}>
          {biomeLabel(snapshot)}
        </Text>
        <Text style={{ marginTop: 4, color: "rgba(244,240,232,0.55)" }}>
          {previewing
            ? `Creator view · live couple is still level ${live.level} / ${live.totalEP} EP`
            : `Level ${snapshot.level} · ${snapshot.totalEP} bio-essence`}
        </Text>
        <View style={{ marginTop: 14, gap: 10 }}>
          {live.essences.map((row) => (
            <View
              key={row.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: INK, fontWeight: "700" }}>{row.label}</Text>
                <Text style={{ color: "rgba(244,240,232,0.5)", fontSize: 12 }}>
                  {row.detail}
                </Text>
              </View>
              <Text style={{ color: "#7CFFB2", fontFamily: "SpaceMono" }}>
                {row.ep} EP
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={onCreator}
          style={{
            marginTop: 16,
            height: 46,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(124,255,178,0.4)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#7CFFB2", fontWeight: "800" }}>Open creator</Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{
            marginTop: 10,
            height: 46,
            borderRadius: 12,
            backgroundColor: "#7CFFB2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#102018", fontWeight: "800" }}>Back to the island</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CreatorSheet({
  live,
  creator,
  onChange,
  onClose,
}: {
  live: EdenSnapshot;
  creator: EdenCreator;
  onChange: (next: EdenCreator) => void;
  onClose: () => void;
}) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 24,
        justifyContent: "flex-end",
      }}
    >
      <Pressable
        onPress={onClose}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(6,8,14,0.45)",
        }}
      />
      <View
        style={{
          maxHeight: "78%",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          backgroundColor: "#121820",
          borderTopWidth: 1,
          borderColor: "rgba(159,232,196,0.25)",
        }}
      >
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 16,
            paddingBottom: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 2,
                color: "rgba(159,232,196,0.7)",
              }}
            >
              CREATOR
            </Text>
            <Text style={{ marginTop: 4, color: INK, fontFamily: SERIF, fontSize: 24 }}>
              See the whole island
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={INK} />
          </Pressable>
        </View>
        <ScrollView
          style={{ maxHeight: 460 }}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
        >
          <Text style={{ color: "rgba(244,240,232,0.55)", fontSize: 13, lineHeight: 19 }}>
            This is only on this phone. Live couple stays at level {live.level}. Use it to
            judge biomes and lighting before you change the real world.
          </Text>

          <ChipRow
            label="Stage"
            options={EDEN_STAGES.map((row) => ({
              id: row.id,
              label: row.label,
              hint: row.hint,
            }))}
            value={creator.stage}
            onPick={(stage) =>
              onChange({
                ...creator,
                enabled: true,
                stage,
                dormancy: stage === "live" ? creator.dormancy : "awake",
              })
            }
          />
          <ChipRow
            label="Light"
            options={EDEN_PHASES.map((row) => ({ id: row.id, label: row.label }))}
            value={creator.phase}
            onPick={(phase) => onChange({ ...creator, enabled: true, phase })}
          />
          <ChipRow
            label="Sleep"
            options={[
              { id: "auto", label: "From usage" },
              { id: "awake", label: "Awake" },
              { id: "sleep", label: "Dormant fog" },
            ]}
            value={creator.dormancy}
            onPick={(dormancy) => onChange({ ...creator, enabled: true, dormancy })}
          />

          <Pressable
            onPress={() =>
              onChange({ enabled: true, stage: "full", phase: "day", dormancy: "awake" })
            }
            style={{
              marginTop: 16,
              height: 46,
              borderRadius: 12,
              backgroundColor: "#7CFFB2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#102018", fontWeight: "800" }}>
              Show everything, daytime
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onChange(emptyEdenCreator())}
            style={{
              marginTop: 10,
              height: 46,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(244,240,232,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: INK, fontWeight: "700" }}>Back to live couple</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onPick: (id: T) => void;
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 2,
          color: "rgba(159,232,196,0.65)",
        }}
      >
        {label.toUpperCase()}
      </Text>
      <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((row) => {
          const on = value === row.id;
          return (
            <Pressable
              key={row.id}
              onPress={() => onPick(row.id)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: on ? "#7CFFB2" : "rgba(244,240,232,0.16)",
                backgroundColor: on ? "rgba(124,255,178,0.14)" : "transparent",
              }}
            >
              <Text style={{ color: on ? "#7CFFB2" : INK, fontWeight: "700", fontSize: 13 }}>
                {row.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
