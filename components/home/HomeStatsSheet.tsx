import { SERIF } from "@/lib/app-themes";
import { evaluateBadges } from "@/lib/badges";
import { buildCoupleStats, type CoupleStatInput } from "@/lib/couple-stats";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Tab = "stats" | "badges";

export function HomeStatsSheet({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [tab, setTab] = useState<Tab>("stats");
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

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        justifyContent: "flex-end",
        paddingBottom: 70,
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
          backgroundColor: "rgba(8,8,12,0.72)",
        }}
      />
      <View
        style={{
          width: "100%",
          maxHeight: "88%",
          backgroundColor: "#14141A",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 18,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: "#FF007F",
              }}
            >
              The two of you
            </Text>
            <Text style={{ marginTop: 4, fontFamily: SERIF, fontSize: 22, color: "#F4F4F6" }}>
              {app.partner ? `${app.user?.displayName ?? "You"} × ${app.partner.displayName}` : "Stats"}
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Ionicons name="close" size={22} color="#F4F4F6" />
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#1A1A22",
            borderRadius: 14,
            padding: 4,
            marginBottom: 12,
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
                  borderRadius: 11,
                  backgroundColor: on ? "#FF007F" : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: on ? "#0B0B0E" : "rgba(244,244,246,0.6)",
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

        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {tab === "stats" ? (
            sections.map((section) => (
              <View key={section.id} style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    color: section.accent,
                    marginBottom: 4,
                  }}
                >
                  {section.label.toUpperCase()}
                </Text>
                <Text
                  style={{
                    color: "rgba(244,244,246,0.45)",
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  {section.hint}
                </Text>
                <View
                  style={{
                    borderRadius: 14,
                    backgroundColor: "#1A1A22",
                    overflow: "hidden",
                  }}
                >
                  {section.rows.map((row, index) => (
                    <View
                      key={row.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderTopWidth: index === 0 ? 0 : 1,
                        borderTopColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Text style={{ flex: 1, color: "#F4F4F6", fontSize: 14 }}>
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          color: section.accent,
                          fontFamily: "SpaceMono",
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                      >
                        {row.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {badges.map((badge) => (
                <View
                  key={badge.id}
                  style={{
                    width: "48.5%",
                    marginBottom: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: badge.unlocked
                      ? "rgba(255,0,127,0.55)"
                      : "rgba(255,255,255,0.08)",
                    backgroundColor: badge.unlocked
                      ? "rgba(255,0,127,0.12)"
                      : "#1A1A22",
                    padding: 12,
                    opacity: badge.unlocked ? 1 : 0.55,
                  }}
                >
                  <Ionicons
                    name={badge.icon}
                    size={22}
                    color={badge.unlocked ? "#FF007F" : "rgba(244,244,246,0.45)"}
                  />
                  <Text
                    style={{
                      marginTop: 8,
                      color: "#F4F4F6",
                      fontSize: 14,
                      fontWeight: "800",
                    }}
                  >
                    {badge.title}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      color: "rgba(244,244,246,0.55)",
                      fontSize: 11,
                      lineHeight: 15,
                    }}
                  >
                    {badge.blurb}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      color: badge.unlocked ? "#3ECFBF" : "rgba(244,244,246,0.4)",
                    }}
                  >
                    {badge.unlocked
                      ? "Unlocked"
                      : `${Math.min(badge.count, badge.target)} / ${badge.target}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
