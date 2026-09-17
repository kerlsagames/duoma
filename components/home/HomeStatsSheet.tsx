import { SERIF } from "@/lib/app-themes";
import { BADGE_LEVEL_MARK, badgeFamilies, evaluateBadges } from "@/lib/badges";
import {
  buildCoupleStats,
  type CoupleStatInput,
  type StatSectionId,
} from "@/lib/couple-stats";
import { useThemedHubs } from "@/lib/hub-theme";
import { personalizeCard, resolveCardGenders, resolveCardNames } from "@/lib/personalize";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Tab = "stats" | "badges";

const PAPER = {
  sheet: "#F6E8D4",
  card: "#FFF6E8",
  ink: "#2C1812",
  muted: "rgba(44,24,18,0.62)",
  fine: "rgba(44,24,18,0.4)",
  line: "rgba(122,46,58,0.16)",
  wine: "#8B3A4A",
  wineFill: "#C45C6A",
} as const;

const LANES: { id: StatSectionId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "connect", label: "Connect" },
  { id: "desire", label: "Desire" },
  { id: "fun", label: "Fun" },
  { id: "home", label: "Home" },
];

export function HomeStatsSheet({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const hubs = useThemedHubs();
  const [tab, setTab] = useState<Tab>("stats");
  const [lane, setLane] = useState<StatSectionId>("general");
  const [areaH, setAreaH] = useState(0);
  const sheetH = areaH > 0 ? Math.max(280, areaH - 20) : undefined;
  const input: CoupleStatInput = useMemo(
    () => ({
      user: app.user,
      partner: app.partner,
      couple: app.couple,
      nights: app.nights,
      deck: app.deck,
      ratings: app.ratings,
      checkIns: app.checkIns,
      dateNightAsks: app.dateNightAsks,
      jarNotes: app.jarNotes,
      talkDraws: app.talkDraws,
      listEntries: app.listEntries,
      curiosityAnswers: app.curiosityAnswers,
      spicyDares: app.spicyDares,
      chickenPlays: app.chickenPlays,
      coupons: app.coupons,
      fantasySwipes: app.fantasySwipes,
      fantasyCompletions: app.fantasyCompletions,
      positionSaves: app.positionSaves,
      positionInvites: app.positionInvites,
      roleplaySaves: app.roleplaySaves,
      roleplayInvites: app.roleplayInvites,
      desireToggles: app.desireToggles,
      bucketItems: app.bucketItems,
      calendarEvents: app.calendarEvents,
      errandItems: app.errandItems,
      mealRounds: app.mealRounds,
      ritualChecks: app.ritualChecks,
    }),
    [app]
  );
  const sections = useMemo(() => buildCoupleStats(input), [input]);
  const badges = useMemo(() => evaluateBadges(input), [input]);
  const unlocked = badges.filter((row) => row.unlocked).length;
  const section = sections.find((row) => row.id === lane) ?? sections[0]!;
  const laneBadges = badges.filter((row) => row.lane === lane);
  const families = useMemo(() => badgeFamilies(laneBadges), [laneBadges]);
  const bestCards = app.bestCards;
  const names = resolveCardNames({
    userName: app.user?.displayName,
    partnerName: app.partner?.displayName,
  });
  const genders = resolveCardGenders({
    userGender: app.user?.gender,
    partnerGender: app.partner?.gender,
  });
  const accentFor = (id: StatSectionId) => {
    if (id === "general") return PAPER.wine;
    if (id === "connect") return hubs.find((hub) => hub.id === "connect")?.tile ?? "#FF6B9A";
    if (id === "desire") return hubs.find((hub) => hub.id === "desire")?.tile ?? "#FF007F";
    if (id === "fun") return hubs.find((hub) => hub.id === "play")?.tile ?? "#E09A4A";
    return hubs.find((hub) => hub.id === "home-base")?.tile ?? "#3ECFBF";
  };
  const inkFor = (id: StatSectionId, on: boolean) => {
    if (!on) return PAPER.ink;
    if (id === "general") return "#F8E7D6";
    const hubId = id === "fun" ? "play" : id === "home" ? "home-base" : id;
    return hubs.find((hub) => hub.id === hubId)?.tileInk ?? PAPER.ink;
  };

  return (
    <View
      pointerEvents="box-none"
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.height);
        if (next !== areaH) setAreaH(next);
      }}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        justifyContent: "flex-end",
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityLabel="Close stats"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(80,36,42,0.38)",
        }}
      />
      <View
        style={{
          width: "100%",
          height: sheetH,
          maxHeight: sheetH ?? "92%",
          overflow: "hidden",
          backgroundColor: PAPER.sheet,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 18,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          borderTopWidth: 2,
          borderColor: "rgba(196,92,106,0.35)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            flexShrink: 0,
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: PAPER.wine,
              }}
            >
              The two of you
            </Text>
            <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 24, color: PAPER.ink }}>
              {app.partner ? `${app.user?.displayName ?? "You"} × ${app.partner.displayName}` : "Stats"}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityLabel="Close"
            style={{
              width: 40,
              height: 40,
              borderRadius: 16,
              backgroundColor: PAPER.card,
              borderWidth: 1,
              borderColor: PAPER.line,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={22} color={PAPER.ink} />
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: PAPER.card,
            borderRadius: 16,
            padding: 4,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: PAPER.line,
          }}
        >
          {(["stats", "badges"] as const).map((id) => {
            const on = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: on ? PAPER.wineFill : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: on ? "#F8E7D6" : PAPER.muted,
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  {id === "stats" ? "Stats" : `Badges · ${unlocked}`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {LANES.map((row) => {
            const on = lane === row.id;
            const fill = accentFor(row.id);
            return (
              <Pressable
                key={row.id}
                onPress={() => setLane(row.id)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: on ? fill : PAPER.card,
                  borderWidth: 1,
                  borderColor: on ? fill : PAPER.line,
                }}
              >
                <Text
                  style={{
                    color: inkFor(row.id, on),
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  {row.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {tab === "stats" ? (
            <View>
              <Text
                style={{
                  fontFamily: SERIF,
                  fontSize: 22,
                  color: PAPER.ink,
                }}
              >
                {section.label}
              </Text>
              <Text
                style={{
                  color: PAPER.muted,
                  fontSize: 13,
                  lineHeight: 18,
                  marginTop: 4,
                  marginBottom: 12,
                }}
              >
                {section.hint}
              </Text>
              <View
                style={{
                  borderRadius: 18,
                  backgroundColor: PAPER.card,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: PAPER.line,
                }}
              >
                {section.rows.map((row, index) => (
                  <View
                    key={row.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: PAPER.line,
                    }}
                  >
                    <Text style={{ flex: 1, color: PAPER.ink, fontSize: 15 }}>
                      {row.label}
                    </Text>
                    <Text
                      style={{
                        color: accentFor(section.id),
                        fontFamily: "SpaceMono",
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
              {lane === "desire" ? (
                <View style={{ marginTop: 18 }}>
                  <Text style={{ fontFamily: SERIF, fontSize: 20, color: PAPER.ink }}>
                    Best cards
                  </Text>
                  <Text
                    style={{
                      color: PAPER.muted,
                      fontSize: 13,
                      lineHeight: 18,
                      marginTop: 4,
                      marginBottom: 10,
                    }}
                  >
                    Highest rated Get Spicy cards after a night.
                  </Text>
                  <View
                    style={{
                      borderRadius: 18,
                      backgroundColor: PAPER.card,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: PAPER.line,
                    }}
                  >
                    {bestCards.length === 0 ? (
                      <Text
                        style={{
                          padding: 14,
                          color: PAPER.muted,
                          fontSize: 14,
                          lineHeight: 20,
                        }}
                      >
                        After a night, rate what you played. Keepers show up here.
                      </Text>
                    ) : (
                      bestCards.slice(0, 8).map((row, index) => {
                        const copy = personalizeCard(row.card, names, genders);
                        return (
                          <View
                            key={row.card.id}
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 14,
                              borderTopWidth: index === 0 ? 0 : 1,
                              borderTopColor: PAPER.line,
                            }}
                          >
                            <Text
                              style={{
                                color: accentFor("desire"),
                                fontFamily: "SpaceMono",
                                fontSize: 12,
                                fontWeight: "700",
                              }}
                            >
                              {row.average.toFixed(1)}/10
                            </Text>
                            <Text
                              style={{
                                marginTop: 4,
                                color: PAPER.ink,
                                fontSize: 14,
                                lineHeight: 20,
                              }}
                            >
                              {copy.body}
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View>
              <Text style={{ fontFamily: SERIF, fontSize: 22, color: PAPER.ink }}>
                {LANES.find((row) => row.id === lane)?.label} badges
              </Text>
              <Text
                style={{
                  color: PAPER.muted,
                  fontSize: 13,
                  marginTop: 4,
                  marginBottom: 12,
                }}
              >
                {laneBadges.filter((row) => row.unlocked).length} unlocked here
              </Text>
              <View style={{ gap: 12 }}>
                {families.map((rows) => {
                  const head = rows[0]!;
                  return (
                    <View
                      key={head.family}
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: PAPER.line,
                        backgroundColor: PAPER.card,
                        padding: 12,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name={head.icon} size={18} color={accentFor(lane)} />
                        <Text style={{ color: PAPER.ink, fontSize: 15, fontWeight: "800" }}>
                          {head.familyTitle}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                        {rows.map((badge) => (
                          <View
                            key={badge.id}
                            style={{
                              flex: 1,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: badge.unlocked ? accentFor(lane) : PAPER.line,
                              backgroundColor: badge.unlocked
                                ? "rgba(196,92,106,0.08)"
                                : "rgba(255,246,232,0.55)",
                              paddingVertical: 10,
                              paddingHorizontal: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "SpaceMono",
                                fontSize: 13,
                                fontWeight: "700",
                                color: badge.unlocked ? accentFor(lane) : PAPER.fine,
                              }}
                            >
                              {BADGE_LEVEL_MARK[badge.level]}
                            </Text>
                            <Text
                              style={{
                                marginTop: 4,
                                color: PAPER.ink,
                                fontSize: 12,
                                fontWeight: "800",
                              }}
                            >
                              {badge.title}
                            </Text>
                            <Text
                              style={{
                                marginTop: 4,
                                color: PAPER.muted,
                                fontSize: 10,
                                lineHeight: 13,
                              }}
                            >
                              {badge.blurb}
                            </Text>
                            <Text
                              style={{
                                marginTop: 6,
                                fontFamily: "SpaceMono",
                                fontSize: 10,
                                color: badge.unlocked ? PAPER.wine : PAPER.fine,
                              }}
                            >
                              {badge.unlocked
                                ? "Unlocked"
                                : `${Math.min(badge.count, badge.target)} / ${badge.target}`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
