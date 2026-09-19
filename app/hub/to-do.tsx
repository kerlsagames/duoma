import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
import { useMiniApps } from "@/lib/mini-apps";
import { themLabel } from "@/lib/names";
import { useApp } from "@/lib/store";
import { buildToDoInbox, type ToDoItem } from "@/lib/to-do";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const ACCENT = "#FF7A9A";
type Lane = "request" | "todo";

function laneFromParam(value?: string | string[]): Lane | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "request" || raw === "requests") return "request";
  if (raw === "todo") return "todo";
  return null;
}

export default function ToDoScreen() {
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const opened = laneFromParam(params.tab);
  const [lane, setLane] = useState<Lane>(opened ?? "request");
  const look = useAppLook("to-do", ACCENT, {});
  const router = useRouter();
  const { data: mini } = useMiniApps();
  const {
    user,
    partner,
    positionInvites,
    roleplayInvites,
    dateNightAsks,
    bucketItems,
    fantasyTonightAsks,
    spicyDares,
    chickenPlays,
    coupons,
    incomingCheckInRequest,
    respondPositionInvite,
    completePositionInvite,
    respondRoleplayInvite,
    completeRoleplayInvite,
    respondDateNightAsk,
    respondFantasyTonight,
    completeFantasyMatch,
    respondSpicyDare,
    completeSpicyDare,
    respondChickenDare,
    completeChickenDare,
    acceptCoupon,
    redeemCoupon,
  } = useApp();
  const partnerName = themLabel(partner);

  useEffect(() => {
    if (opened) setLane(opened);
  }, [opened]);

  const inbox = useMemo(
    () =>
      buildToDoInbox({
        user,
        partner,
        positionInvites,
        roleplayInvites,
        dateNightAsks,
        bucketItems,
        fantasyTonightAsks,
        spicyDares,
        chickenPlays,
        coupons,
        incomingCheckInRequest,
        sparkAsks: mini.spark.asks,
        predictions: mini.predictions,
      }),
    [
      bucketItems,
      chickenPlays,
      coupons,
      dateNightAsks,
      fantasyTonightAsks,
      incomingCheckInRequest,
      mini.predictions,
      mini.spark.asks,
      partner,
      positionInvites,
      roleplayInvites,
      spicyDares,
      user,
    ]
  );

  const rows = lane === "request" ? inbox.requests : inbox.todos;

  const act = async (item: ToDoItem, action: "yes" | "no" | "done") => {
    if (action === "yes") {
      if (item.kind === "position") await respondPositionInvite(item.id, "accepted");
      if (item.kind === "roleplay") await respondRoleplayInvite(item.id, "accepted");
      if (item.kind === "date") await respondDateNightAsk(item.id, "accepted");
      if (item.kind === "fantasy") await respondFantasyTonight(item.id, "accepted");
      if (item.kind === "dare") await respondSpicyDare(item.id, "accepted");
      if (item.kind === "chicken") await respondChickenDare(item.id, "accepted");
      if (item.kind === "coupon") await acceptCoupon(item.id);
      return;
    }
    if (action === "no") {
      if (item.kind === "position") await respondPositionInvite(item.id, "declined");
      if (item.kind === "roleplay") await respondRoleplayInvite(item.id, "declined");
      if (item.kind === "date") await respondDateNightAsk(item.id, "declined");
      if (item.kind === "fantasy") await respondFantasyTonight(item.id, "declined");
      if (item.kind === "dare") await respondSpicyDare(item.id, "declined");
      if (item.kind === "chicken") await respondChickenDare(item.id, "declined");
      return;
    }
    if (item.kind === "position") await completePositionInvite(item.id);
    if (item.kind === "roleplay") await completeRoleplayInvite(item.id);
    if (item.kind === "dare") await completeSpicyDare(item.id);
    if (item.kind === "chicken") await completeChickenDare(item.id);
    if (item.kind === "coupon") await redeemCoupon(item.id);
    if (item.kind === "fantasy") {
      const ask = fantasyTonightAsks.find((row) => row.id === item.id);
      if (ask) await completeFantasyMatch(ask.fantasyId);
    }
  };

  return (
    <HubScreen
      kicker="Daily rhythm"
      title="To Do"
      body={`Requests ${partnerName} sent you, and the yeses that are still open.`}
      accent={look.accent}
      look={look}
    >
      <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
        <LaneButton
          label={
            inbox.requests.length
              ? `Requests · ${inbox.requests.length}`
              : "Requests"
          }
          on={lane === "request"}
          hot={inbox.requests.length > 0}
          accent={look.accent}
          onPress={() => setLane("request")}
        />
        <LaneButton
          label={inbox.todos.length ? `To Do · ${inbox.todos.length}` : "To Do"}
          on={lane === "todo"}
          hot={inbox.todos.length > 0}
          accent={look.accent}
          onPress={() => setLane("todo")}
        />
      </View>

      {rows.length === 0 ? (
        <View
          style={{
            marginTop: 22,
            padding: 20,
            borderRadius: 22,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              lineHeight: 28,
              color: "#F4F4F6",
            }}
          >
            {lane === "request" ? "Nothing waiting on you" : "You’re caught up"}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 15,
              lineHeight: 22,
              color: "rgba(244,244,246,0.58)",
            }}
          >
            {lane === "request"
              ? `When ${partnerName} asks a dare, date, pose, coupon, or scene, it lands here first.`
              : "Accepted dares, dates, poses, coupons, and scenes sit here until you tick them off."}
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 18, gap: 12 }}>
          {rows.map((item) => (
            <View
              key={`${item.kind}-${item.id}`}
              style={{
                padding: 16,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: `${item.accent}55`,
              }}
            >
              <Text
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: item.accent,
                }}
              >
                {item.app}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontSize: 22,
                  lineHeight: 28,
                  color: "#F4F4F6",
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 20,
                  color: "rgba(244,244,246,0.58)",
                }}
              >
                {item.detail}
              </Text>
              <View style={{ marginTop: 14, gap: 8 }}>
                {item.yesLabel ? (
                  <PrimaryButton
                    label={item.yesLabel}
                    tone="crimson"
                    onPress={() => void act(item, "yes")}
                  />
                ) : null}
                {item.noLabel ? (
                  <PrimaryButton
                    label={item.noLabel}
                    tone="ghost"
                    onPress={() => void act(item, "no")}
                  />
                ) : null}
                {item.doneLabel ? (
                  <PrimaryButton
                    label={item.doneLabel}
                    tone="crimson"
                    onPress={() => void act(item, "done")}
                  />
                ) : null}
                <PrimaryButton
                  label={`Open ${item.app}`}
                  tone="ghost"
                  onPress={() => router.push(item.href)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </HubScreen>
  );
}

function LaneButton({
  label,
  on,
  hot,
  accent,
  onPress,
}: {
  label: string;
  on: boolean;
  hot: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        minHeight: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: on || hot ? accent : "rgba(255,255,255,0.14)",
        backgroundColor: on ? `${accent}22` : "rgba(255,255,255,0.04)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
      }}
    >
      <Text
        style={{
          color: "#F4F4F6",
          fontWeight: "800",
          fontSize: 14,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
