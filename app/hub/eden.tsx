import { EdenWorld } from "@/components/eden/EdenWorld";
import { BackButton } from "@/components/ui/BackButton";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { biomeLabel, buildEdenSnapshot, type EdenSnapshot } from "@/lib/eden";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import { listWhiteFlags } from "@/lib/white-flag";
import type { Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const INK = "#F4F0E8";

export default function EdenScreen() {
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

  useEffect(() => {
    let alive = true;
    listWhiteFlags().then((rows) => {
      if (alive) setFlags(rows);
    });
    return () => {
      alive = false;
    };
  }, []);

  const snapshot = useMemo(
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

  return (
    <Screen background="#0B1020">
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 4, paddingTop: 4, zIndex: 4 }}>
          <BackButton color="#9FE8C4" fallback={"/(tabs)" as Href} />
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
        <Hud snapshot={snapshot} onOpen={() => setStatsOpen(true)} />
        {statsOpen ? (
          <StatsSheet snapshot={snapshot} onClose={() => setStatsOpen(false)} />
        ) : null}
      </View>
    </Screen>
  );
}

function Hud({
  snapshot,
  onOpen,
}: {
  snapshot: EdenSnapshot;
  onOpen: () => void;
}) {
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
        {snapshot.dormancy ? "DORMANT" : biomeLabel(snapshot).toUpperCase()}
      </Text>
      <Text style={{ marginTop: 4, color: INK, fontFamily: SERIF, fontSize: 22 }}>
        Level {snapshot.level}
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
        {snapshot.dormancy
          ? "Twilight fog. Any ping, note, or night wakes it."
          : `${snapshot.totalEP} EP · drag to orbit · tap the hearth`}
      </Text>
    </Pressable>
  );
}

function StatsSheet({
  snapshot,
  onClose,
}: {
  snapshot: EdenSnapshot;
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
          Level {snapshot.level} · {snapshot.totalEP} ecosystem points
        </Text>
        <View style={{ marginTop: 14, gap: 10 }}>
          {snapshot.essences.map((row) => (
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
        <Text
          style={{
            marginTop: 14,
            color: "rgba(244,240,232,0.45)",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          Nothing dies here. If you go quiet the island only sleeps. Voice notes,
          gratitude, dates, photos, and spicy nights all feed a different biome.
        </Text>
        <Pressable
          onPress={onClose}
          style={{
            marginTop: 16,
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
