import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Screen } from "@/components/ui/Screen";
import { COUPONS_TONE, SERIF } from "@/lib/app-themes";
import {
  COUPON_CATEGORIES,
  COUPON_USE_OPTIONS,
  categoryMeta,
  defaultCustomDateTime,
  expiresAtForUseOption,
  formatExactWhen,
  ideasInCategory,
  parseLocalDateTime,
  toLocalDateTimeValue,
  useOptionLabel,
  type CouponCategoryId,
  type CouponIdea,
  type CouponUseOptionId,
} from "@/lib/couponIdeas";
import { useApp } from "@/lib/store";
import type { Coupon } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const T = COUPONS_TONE;

type Tab = "give" | "received" | "past";

function effectiveStatus(coupon: Coupon): Coupon["status"] {
  if (coupon.status === "redeemed") return "redeemed";
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) < Date.now()) {
    return "expired";
  }
  return coupon.status;
}

function stampLabel(status: Coupon["status"]) {
  if (status === "offered") return "NEW";
  if (status === "accepted") return "READY";
  if (status === "redeemed") return "USED";
  return "EXPIRED";
}

function formatExpiry(iso: string | null) {
  if (!iso) return "No expiry";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "No expiry";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function TicketCard({
  coupon,
  partnerName,
  onAccept,
  onRedeem,
  outgoing,
}: {
  coupon: Coupon;
  partnerName: string;
  onAccept?: () => void;
  onRedeem?: () => void;
  outgoing?: boolean;
}) {
  const status = effectiveStatus(coupon);
  const cat = categoryMeta(coupon.categoryId);
  const stampColor =
    status === "redeemed" || status === "expired" ? T.used : T.stamp;

  return (
    <View
      style={{
        marginBottom: 12,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.surfaceRaised,
        padding: 16,
        opacity: status === "expired" || status === "redeemed" ? 0.72 : 1,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: T.accent,
            }}
          >
            {cat?.label ?? "Coupon"}
            {coupon.useOption ? ` · ${useOptionLabel(coupon.useOption)}` : ""}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 20,
              lineHeight: 26,
              color: T.ink,
            }}
          >
            {coupon.title}
          </Text>
        </View>
        <View
          style={{
            borderWidth: 1.5,
            borderColor: stampColor,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            transform: [{ rotate: "8deg" }],
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceMono",
              fontSize: 11,
              letterSpacing: 1,
              color: stampColor,
            }}
          >
            {stampLabel(status)}
          </Text>
        </View>
      </View>

      {coupon.reason ? (
        <Text style={{ marginTop: 10, fontFamily: SERIF, fontSize: 15, color: T.muted }}>
          “{coupon.reason}”
        </Text>
      ) : null}

      <Text
        style={{
          marginTop: 12,
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 0.4,
          color: T.muted,
        }}
      >
        {outgoing ? `To ${partnerName}` : `From ${partnerName}`}
        {" · "}
        {status === "redeemed"
          ? `Used ${formatExpiry(coupon.redeemedAt)}`
          : coupon.expiresAt
            ? `Use by ${formatExpiry(coupon.expiresAt)}`
            : "No expiry"}
      </Text>

      {!outgoing && status === "offered" && onAccept ? (
        <View className="mt-4">
          <PrimaryButton label="Accept into wallet" tone="gold" onPress={onAccept} />
        </View>
      ) : null}
      {status === "accepted" && onRedeem ? (
        <View className="mt-4">
          <PrimaryButton
            label={outgoing ? `Redeem for ${partnerName}` : "Redeem now"}
            tone="gold"
            onPress={onRedeem}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function CouponsScreen() {
  const { coupons, user, partner, createCoupon, acceptCoupon, redeemCoupon } =
    useApp();
  const partnerName = partner?.displayName ?? "them";

  const [tab, setTab] = useState<Tab>("give");
  const [categoryId, setCategoryId] = useState<CouponCategoryId | null>(null);
  const [idea, setIdea] = useState<CouponIdea | null>(null);
  const [reason, setReason] = useState("");
  const [useOption, setUseOption] = useState<CouponUseOptionId>("7d");
  const [customWhen, setCustomWhen] = useState(defaultCustomDateTime);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);
  const minDateTime = useMemo(() => toLocalDateTimeValue(new Date()), []);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [tab, categoryId, idea]);

  const received = useMemo(
    () =>
      coupons
        .filter((row) => row.toUserId === user?.id)
        .map((row) => ({ ...row, status: effectiveStatus(row) }))
        .filter((row) => row.status === "offered" || row.status === "accepted"),
    [coupons, user?.id]
  );

  const sentLive = useMemo(
    () =>
      coupons
        .filter((row) => row.fromUserId === user?.id)
        .map((row) => ({ ...row, status: effectiveStatus(row) }))
        .filter((row) => row.status === "offered" || row.status === "accepted"),
    [coupons, user?.id]
  );

  const past = useMemo(
    () =>
      coupons
        .filter(
          (row) => row.toUserId === user?.id || row.fromUserId === user?.id
        )
        .map((row) => ({ ...row, status: effectiveStatus(row) }))
        .filter((row) => row.status === "redeemed" || row.status === "expired")
        .sort((a, b) =>
          (b.redeemedAt ?? b.expiresAt ?? b.createdAt).localeCompare(
            a.redeemedAt ?? a.expiresAt ?? a.createdAt
          )
        ),
    [coupons, user?.id]
  );

  const ideas = categoryId ? ideasInCategory(categoryId) : [];

  const send = async () => {
    if (!idea) {
      setError("Pick a coupon first.");
      return;
    }
    if (useOption === "custom") {
      const picked = parseLocalDateTime(customWhen);
      if (!picked) {
        setError("Pick a date and time on the calendar.");
        return;
      }
      if (picked.getTime() <= Date.now()) {
        setError("Pick a time in the future.");
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      await createCoupon({
        title: idea.title,
        reason,
        categoryId: idea.category,
        ideaId: idea.id,
        useOption,
        expiresAt: expiresAtForUseOption(useOption, customWhen),
      });
      setIdea(null);
      setReason("");
      setUseOption("7d");
      setCustomWhen(defaultCustomDateTime());
      setCategoryId(null);
      setSentFlash(true);
      setTimeout(() => setSentFlash(false), 2400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll background={T.background} scrollRef={scrollRef}>
      <View className="pt-4 pb-8">
        <BackButton color={T.accent} style={{ marginBottom: 12 }} />
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Coupons
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 40,
            color: T.ink,
          }}
        >
          Tear one off. Give it away.
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 24,
            color: T.muted,
          }}
        >
          Pick a favor, add why if you want, set when it expires. Their wallet keeps what you
          sent — and what they already used.
        </Text>

        <View
          style={{
            marginTop: 22,
            flexDirection: "row",
            borderRadius: 18,
            backgroundColor: T.surface,
            padding: 4,
            borderWidth: 1,
            borderColor: "rgba(247,241,227,0.08)",
          }}
        >
          {(
            [
              ["give", "Give"],
              ["received", "Received"],
              ["past", "Used / expired"],
            ] as const
          ).map(([id, label]) => {
            const on = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  setTab(id);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 14,
                  paddingVertical: 11,
                  backgroundColor: on ? T.accent : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: on ? "#14110A" : T.muted,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {sentFlash ? (
          <Text
            style={{
              marginTop: 14,
              fontFamily: SERIF,
              fontSize: 15,
              color: T.accent,
            }}
          >
            Sent to {partnerName}. It lands in their wallet.
          </Text>
        ) : null}

        {tab === "give" ? (
          <View className="mt-6">
            {!categoryId && !idea ? (
              <>
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    color: T.accent,
                  }}
                >
                  Categories
                </Text>
                <View className="mt-3 flex-row flex-wrap justify-between">
                  {COUPON_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={{
                        width: "48%",
                        marginBottom: 12,
                        borderRadius: 22,
                        borderWidth: 1,
                        borderColor: T.border,
                        backgroundColor: T.surfaceRaised,
                        paddingVertical: 18,
                        paddingHorizontal: 14,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: T.accentSoft,
                          borderWidth: 1,
                          borderColor: T.border,
                        }}
                      >
                        <Ionicons name={cat.icon} size={22} color={T.accent} />
                      </View>
                      <Text
                        style={{
                          marginTop: 12,
                          fontFamily: SERIF,
                          fontSize: 18,
                          color: T.ink,
                        }}
                      >
                        {cat.label}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          lineHeight: 17,
                          color: T.muted,
                        }}
                      >
                        {cat.detail}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            {categoryId && !idea ? (
              <>
                <Pressable
                  onPress={() => setCategoryId(null)}
                  className="mb-4 flex-row items-center"
                >
                  <Ionicons name="chevron-back" size={18} color={T.accent} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: T.accent,
                    }}
                  >
                    All categories
                  </Text>
                </Pressable>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 24,
                    color: T.ink,
                  }}
                >
                  {categoryMeta(categoryId)?.label}
                </Text>
                <View className="mt-4 gap-2">
                  {ideas.map((row) => (
                    <Pressable
                      key={row.id}
                      onPress={() => setIdea(row)}
                      style={{
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: "rgba(247,241,227,0.1)",
                        backgroundColor: T.surface,
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: SERIF,
                          fontSize: 16,
                          lineHeight: 22,
                          color: T.ink,
                        }}
                      >
                        {row.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            {idea ? (
              <>
                <Pressable
                  onPress={() => {
                    setIdea(null);
                    setError(null);
                  }}
                  className="mb-4 flex-row items-center"
                >
                  <Ionicons name="chevron-back" size={18} color={T.accent} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: T.accent,
                    }}
                  >
                    Back to list
                  </Text>
                </Pressable>

                <View
                  style={{
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: T.border,
                    backgroundColor: T.surfaceRaised,
                    padding: 18,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: T.accent,
                    }}
                  >
                    Giving {partnerName}
                  </Text>
                  <Text
                    style={{
                      marginTop: 10,
                      fontFamily: SERIF,
                      fontSize: 24,
                      lineHeight: 32,
                      color: T.ink,
                    }}
                  >
                    {idea.title}
                  </Text>
                </View>

                <Text
                  style={{
                    marginTop: 22,
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: T.accent,
                  }}
                >
                  Reason why (optional)
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g. Because you crushed this week"
                  placeholderTextColor="rgba(247,241,227,0.35)"
                  multiline
                  style={{
                    marginTop: 10,
                    minHeight: 88,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: T.border,
                    backgroundColor: T.surface,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: T.ink,
                    fontFamily: SERIF,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                />

                <Text
                  style={{
                    marginTop: 22,
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: T.accent,
                  }}
                >
                  Time to use
                </Text>
                <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
                  {COUPON_USE_OPTIONS.map((opt) => {
                    const on = useOption === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => setUseOption(opt.id)}
                        style={{
                          width: "48%",
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: on ? T.accent : "rgba(247,241,227,0.12)",
                          backgroundColor: on ? T.accentSoft : T.surface,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: SERIF,
                            fontSize: 16,
                            color: T.ink,
                          }}
                        >
                          {opt.label}
                        </Text>
                        <Text
                          style={{
                            marginTop: 3,
                            fontSize: 12,
                            color: T.muted,
                          }}
                        >
                          {opt.hint}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {useOption === "custom" ? (
                  <View className="mt-1">
                    <DateTimeField
                      value={customWhen}
                      min={minDateTime}
                      onChange={setCustomWhen}
                      accent={T.accent}
                      background={T.surface}
                      ink={T.ink}
                      border={T.border}
                    />
                    <Text style={{ marginTop: 8, fontSize: 13, color: T.muted }}>
                      Use by{" "}
                      {formatExactWhen(
                        parseLocalDateTime(customWhen)?.toISOString() ?? null
                      ) ?? "—"}
                    </Text>
                  </View>
                ) : null}

                {error ? (
                  <Text style={{ marginTop: 14, color: T.stamp, fontFamily: SERIF }}>
                    {error}
                  </Text>
                ) : null}
                <View className="mt-5">
                  <PrimaryButton
                    label={`Send to ${partnerName}`}
                    tone="gold"
                    loading={loading}
                    onPress={() => void send()}
                  />
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {tab === "received" ? (
          <View className="mt-6">
            <Text
              style={{
                marginBottom: 12,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: T.accent,
              }}
            >
              In your wallet
            </Text>
            {received.length === 0 ? (
              <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.muted }}>
                Nothing in your wallet yet. When they send one, it shows up here.
              </Text>
            ) : (
              received.map((coupon) => (
                <TicketCard
                  key={coupon.id}
                  coupon={coupon}
                  partnerName={partnerName}
                  onAccept={() => void acceptCoupon(coupon.id)}
                  onRedeem={() => void redeemCoupon(coupon.id)}
                />
              ))
            )}

            <Text
              style={{
                marginTop: 22,
                marginBottom: 12,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: T.accent,
              }}
            >
              You sent
            </Text>
            {sentLive.length === 0 ? (
              <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.muted }}>
                Live coupons you gave {partnerName} appear here until they use them.
              </Text>
            ) : (
              sentLive.map((coupon) => (
                <TicketCard
                  key={coupon.id}
                  coupon={coupon}
                  partnerName={partnerName}
                  outgoing
                  onRedeem={
                    partner?.isDemo && coupon.status === "accepted"
                      ? () => void redeemCoupon(coupon.id)
                      : undefined
                  }
                />
              ))
            )}
          </View>
        ) : null}

        {tab === "past" ? (
          <View className="mt-6">
            {past.length === 0 ? (
              <Text style={{ fontFamily: SERIF, fontSize: 16, color: T.muted }}>
                Used and expired coupons land here.
              </Text>
            ) : (
              past.map((coupon) => (
                <TicketCard
                  key={coupon.id}
                  coupon={coupon}
                  partnerName={partnerName}
                  outgoing={coupon.fromUserId === user?.id}
                />
              ))
            )}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
