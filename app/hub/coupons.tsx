import { LookPanel, SettingsDock } from "@/components/hub/AppSettings";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Screen } from "@/components/ui/Screen";
import { COUPONS_TONE, SERIF } from "@/lib/app-themes";
import { useAppLook } from "@/lib/app-prefs";
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
  if (status === "accepted") return "VALID";
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

function BindingHoles() {
  return (
    <View
      style={{
        width: 18,
        justifyContent: "space-evenly",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: T.spine,
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: T.background,
            borderWidth: 1,
            borderColor: "rgba(247,231,200,0.25)",
          }}
        />
      ))}
    </View>
  );
}

function Perforation() {
  return (
    <View
      style={{
        width: 14,
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: 6,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "rgba(26,18,12,0.12)",
        borderStyle: "dashed",
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: T.paperEdge,
            marginVertical: 2,
          }}
        />
      ))}
    </View>
  );
}

function BookletTicket({
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
  const spent = status === "redeemed" || status === "expired";
  const stampColor = spent ? T.used : T.stamp;

  return (
    <View
      style={{
        marginBottom: 14,
        borderRadius: 4,
        overflow: "hidden",
        flexDirection: "row",
        backgroundColor: T.paper,
        borderWidth: 1,
        borderColor: T.paperEdge,
        opacity: spent ? 0.72 : 1,
        shadowColor: "#1A120C",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      }}
    >
      <BindingHoles />
      <View
        style={{
          width: 52,
          paddingVertical: 14,
          paddingHorizontal: 6,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: T.surfaceRaised,
        }}
      >
        <Text
          style={{
            fontFamily: "SpaceMono",
            fontSize: 9,
            letterSpacing: 2,
            color: T.spine,
            transform: [{ rotate: "-90deg" }],
            width: 70,
            textAlign: "center",
          }}
        >
          STUB
        </Text>
      </View>
      <Perforation />
      <View style={{ flex: 1, padding: 14 }}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 10,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: T.spine,
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
              borderWidth: 2,
              borderColor: stampColor,
              borderRadius: 4,
              paddingHorizontal: 7,
              paddingVertical: 4,
              transform: [{ rotate: "7deg" }],
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1,
                color: stampColor,
                fontWeight: "700",
              }}
            >
              {stampLabel(status)}
            </Text>
          </View>
        </View>

        {coupon.reason ? (
          <Text
            style={{
              marginTop: 10,
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 21,
              color: T.muted,
              fontStyle: "italic",
            }}
          >
            “{coupon.reason}”
          </Text>
        ) : null}

        <Text
          style={{
            marginTop: 12,
            fontFamily: "SpaceMono",
            fontSize: 10,
            letterSpacing: 0.4,
            color: T.fine,
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
            <PrimaryButton
              label="Clip into booklet"
              tone="gold"
              onPress={onAccept}
            />
          </View>
        ) : null}
        {status === "accepted" && onRedeem ? (
          <View className="mt-4">
            <PrimaryButton
              label={outgoing ? `Redeem for ${partnerName}` : "Tear & redeem"}
              tone="gold"
              onPress={onRedeem}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PageTabs({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (next: Tab) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 18,
        gap: 6,
      }}
    >
      {(
        [
          ["give", "Tear one"],
          ["received", "Booklet"],
          ["past", "Stubs"],
        ] as const
      ).map(([id, label]) => {
        const on = tab === id;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 11,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              backgroundColor: on ? T.paper : T.cover,
              borderWidth: 1,
              borderBottomWidth: on ? 0 : 1,
              borderColor: on ? T.paperEdge : "rgba(247,231,200,0.16)",
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 0.6,
                fontWeight: "700",
                color: on ? T.ink : T.onCoverMuted,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
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
  const [writingOwn, setWritingOwn] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [writeOrigin, setWriteOrigin] = useState<"sections" | "category">(
    "sections"
  );
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
  }, [tab, categoryId, idea, writingOwn]);

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
  const composing = Boolean(idea || writingOwn);
  const focused = tab === "give" && Boolean(categoryId || composing);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const look = useAppLook("coupons", T.accent, {
    hidePast: false,
    compactCover: false,
  });

  const startWriting = (
    from: "sections" | "category",
    cat: CouponCategoryId | null
  ) => {
    setWriteOrigin(from);
    setWritingOwn(true);
    setIdea(null);
    setCustomTitle("");
    setCategoryId(cat ?? "wildcard");
    setError(null);
  };

  const send = async () => {
    const title = (writingOwn ? customTitle : idea?.title ?? "").trim();
    if (!title) {
      setError(
        writingOwn ? "Write what the coupon is for." : "Pick a coupon first."
      );
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
        title,
        reason,
        categoryId: idea?.category ?? categoryId,
        ideaId: idea?.id ?? null,
        useOption,
        expiresAt: expiresAtForUseOption(useOption, customWhen),
      });
      setIdea(null);
      setWritingOwn(false);
      setCustomTitle("");
      setWriteOrigin("sections");
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
    <Screen scroll background={T.background} scrollRef={scrollRef} density={look.prefs.density} typeface={look.prefs.typeface} accent={look.accent}>
      <View className="pt-4 pb-10">
        <SettingsDock
          accent={look.accent}
          open={settingsOpen}
          onToggle={() => setSettingsOpen((open) => !open)}
          label="Coupons"
        />
        {settingsOpen ? (
          <LookPanel
            look={look}
            ink={T.onCover}
            muted={T.onCoverMuted}
            toggles={[
              {
                key: "hidePast",
                label: "Hide used tickets",
                hint: "Keep the booklet to what’s still valid.",
              },
              {
                key: "compactCover",
                label: "Compact cover",
                hint: "Less booklet chrome at the top.",
              },
            ]}
          />
        ) : null}

        {!focused ? (
          <View
            style={{
              borderRadius: 6,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(247,231,200,0.18)",
              backgroundColor: T.cover,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: 14, backgroundColor: T.spine }} />
              <View style={{ flex: 1, padding: 18 }}>
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 11,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: T.accent,
                  }}
                >
                  Coupon booklet
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: SERIF,
                    fontSize: 32,
                    lineHeight: 38,
                    color: T.onCover,
                  }}
                >
                  Tear one off. Gift it.
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: SERIF,
                    fontSize: 15,
                    lineHeight: 22,
                    color: T.onCoverMuted,
                  }}
                >
                  Pick a favor, write your own, scribble why if you want, set
                  when it expires. Their booklet keeps the live ones — stubs
                  hold the used.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {!composing ? (
          <PageTabs
            tab={tab}
            onChange={(next) => {
              setTab(next);
              setCategoryId(null);
              setIdea(null);
              setWritingOwn(false);
              setCustomTitle("");
              setError(null);
            }}
          />
        ) : null}

        <View
          style={{
            backgroundColor: composing ? "transparent" : T.paper,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderTopRightRadius: composing ? 8 : 0,
            borderTopLeftRadius: composing ? 8 : 0,
            padding: composing ? 0 : 14,
            borderWidth: composing ? 0 : 1,
            borderTopWidth: composing ? 0 : 0,
            borderColor: T.paperEdge,
            marginTop: composing ? 12 : 0,
          }}
        >
          {sentFlash ? (
            <Text
              style={{
                marginBottom: 12,
                fontFamily: SERIF,
                fontSize: 15,
                color: T.spine,
              }}
            >
              Sent to {partnerName}. It lands in their booklet.
            </Text>
          ) : null}

          {tab === "give" ? (
            <View>
              {!categoryId && !composing ? (
                <>
                  <Pressable
                    onPress={() => startWriting("sections", null)}
                    accessibilityLabel="Write your own coupon"
                    style={{
                      marginBottom: 16,
                      borderRadius: 4,
                      borderWidth: 1.5,
                      borderStyle: "dashed",
                      borderColor: "rgba(201,162,74,0.55)",
                      backgroundColor: T.accentSoft,
                      paddingVertical: 16,
                      paddingHorizontal: 14,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: T.paper,
                        borderWidth: 1,
                        borderColor: "rgba(201,162,74,0.35)",
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color={T.spine} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        style={{
                          fontFamily: SERIF,
                          fontSize: 18,
                          color: T.ink,
                        }}
                      >
                        Write your own
                      </Text>
                      <Text
                        style={{
                          marginTop: 3,
                          fontSize: 13,
                          lineHeight: 18,
                          color: T.muted,
                        }}
                      >
                        Skip the booklet. Tear a blank and fill it in.
                      </Text>
                    </View>
                  </Pressable>
                  <Text
                    style={{
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: T.spine,
                    }}
                  >
                    Sections
                  </Text>
                  <View className="mt-3 flex-row flex-wrap justify-between">
                    {COUPON_CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => setCategoryId(cat.id)}
                        style={{
                          width: "48%",
                          marginBottom: 12,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: T.border,
                          backgroundColor: T.surfaceRaised,
                          paddingVertical: 16,
                          paddingHorizontal: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 4,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: T.accentSoft,
                            borderWidth: 1,
                            borderColor: "rgba(201,162,74,0.35)",
                          }}
                        >
                          <Ionicons name={cat.icon} size={20} color={T.spine} />
                        </View>
                        <Text
                          style={{
                            marginTop: 10,
                            fontFamily: SERIF,
                            fontSize: 17,
                            color: T.ink,
                          }}
                        >
                          {cat.label}
                        </Text>
                        <Text
                          style={{
                            marginTop: 3,
                            fontSize: 12,
                            lineHeight: 16,
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

              {categoryId && !composing ? (
                <>
                  <Pressable
                    onPress={() => setCategoryId(null)}
                    className="mb-4 flex-row items-center"
                  >
                    <Ionicons name="chevron-back" size={18} color={T.spine} />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        color: T.spine,
                      }}
                    >
                      All sections
                    </Text>
                  </Pressable>
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 26,
                      color: T.ink,
                    }}
                  >
                    {categoryMeta(categoryId)?.label}
                  </Text>
                  <View className="mt-4 gap-2">
                    <Pressable
                      onPress={() => startWriting("category", categoryId)}
                      accessibilityLabel="Write your own coupon"
                      style={{
                        borderRadius: 4,
                        borderWidth: 1.5,
                        borderStyle: "dashed",
                        borderColor: "rgba(201,162,74,0.55)",
                        backgroundColor: T.accentSoft,
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Ionicons name="create-outline" size={18} color={T.spine} />
                      <Text
                        style={{
                          flex: 1,
                          fontFamily: SERIF,
                          fontSize: 16,
                          lineHeight: 22,
                          color: T.ink,
                        }}
                      >
                        Write your own
                      </Text>
                    </Pressable>
                    {ideas.map((row) => (
                      <Pressable
                        key={row.id}
                        onPress={() => setIdea(row)}
                        style={{
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: T.border,
                          borderStyle: "dashed",
                          backgroundColor: T.surfaceRaised,
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

              {composing ? (
                <>
                  <Pressable
                    onPress={() => {
                      setIdea(null);
                      setWritingOwn(false);
                      setCustomTitle("");
                      setError(null);
                      if (writeOrigin === "sections") setCategoryId(null);
                    }}
                    className="mb-4 flex-row items-center"
                  >
                    <Ionicons name="chevron-back" size={18} color={T.onCover} />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        color: T.onCover,
                      }}
                    >
                      {writeOrigin === "sections" && writingOwn
                        ? "All sections"
                        : "Back to list"}
                    </Text>
                  </Pressable>

                  <View
                    style={{
                      borderRadius: 4,
                      overflow: "hidden",
                      flexDirection: "row",
                      backgroundColor: T.paper,
                      borderWidth: 1,
                      borderColor: T.paperEdge,
                    }}
                  >
                    <BindingHoles />
                    <View style={{ flex: 1, padding: 16 }}>
                      <Text
                        style={{
                          fontFamily: "SpaceMono",
                          fontSize: 10,
                          letterSpacing: 1.6,
                          textTransform: "uppercase",
                          color: T.spine,
                        }}
                      >
                        Giving {partnerName}
                      </Text>
                      {writingOwn ? (
                        <TextInput
                          value={customTitle}
                          onChangeText={setCustomTitle}
                          placeholder="One free breakfast in bed…"
                          placeholderTextColor="rgba(26,18,12,0.35)"
                          multiline
                          autoFocus
                          style={{
                            marginTop: 10,
                            fontFamily: SERIF,
                            fontSize: 24,
                            lineHeight: 30,
                            color: T.ink,
                            padding: 0,
                            minHeight: 64,
                          }}
                        />
                      ) : (
                        <Text
                          style={{
                            marginTop: 10,
                            fontFamily: SERIF,
                            fontSize: 24,
                            lineHeight: 30,
                            color: T.ink,
                          }}
                        >
                          {idea?.title}
                        </Text>
                      )}
                    </View>
                  </View>

                  {writingOwn ? (
                    <>
                      <Text
                        style={{
                          marginTop: 22,
                          fontFamily: "SpaceMono",
                          fontSize: 11,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: T.onCover,
                        }}
                      >
                        File under
                      </Text>
                      <View
                        className="mt-3 flex-row flex-wrap"
                        style={{ gap: 8 }}
                      >
                        {COUPON_CATEGORIES.map((cat) => {
                          const on = categoryId === cat.id;
                          return (
                            <Pressable
                              key={cat.id}
                              onPress={() => setCategoryId(cat.id)}
                              style={{
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: on
                                  ? T.accent
                                  : "rgba(247,231,200,0.18)",
                                backgroundColor: on ? T.accentSoft : T.cover,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: SERIF,
                                  fontSize: 14,
                                  color: T.onCover,
                                }}
                              >
                                {cat.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </>
                  ) : null}

                  <Text
                    style={{
                      marginTop: 22,
                      fontFamily: "SpaceMono",
                      fontSize: 11,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: T.onCover,
                    }}
                  >
                    Note on the back (optional)
                  </Text>
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="e.g. Because you crushed this week"
                    placeholderTextColor="rgba(247,231,200,0.35)"
                    multiline
                    style={{
                      marginTop: 10,
                      minHeight: 88,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: "rgba(247,231,200,0.2)",
                      backgroundColor: T.cover,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      color: T.onCover,
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
                      color: T.onCover,
                    }}
                  >
                    Use by
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
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: on
                              ? T.accent
                              : "rgba(247,231,200,0.18)",
                            backgroundColor: on ? T.accentSoft : T.cover,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: SERIF,
                              fontSize: 16,
                              color: T.onCover,
                            }}
                          >
                            {opt.label}
                          </Text>
                          <Text
                            style={{
                              marginTop: 3,
                              fontSize: 12,
                              color: T.onCoverMuted,
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
                        background={T.cover}
                        ink={T.onCover}
                        border="rgba(247,231,200,0.22)"
                      />
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          color: T.onCoverMuted,
                        }}
                      >
                        Use by{" "}
                        {formatExactWhen(
                          parseLocalDateTime(customWhen)?.toISOString() ?? null
                        ) ?? "—"}
                      </Text>
                    </View>
                  ) : null}

                  {error ? (
                    <Text
                      style={{
                        marginTop: 14,
                        color: "#FF8A9A",
                        fontFamily: SERIF,
                      }}
                    >
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
            <View>
              <Text
                style={{
                  marginBottom: 12,
                  fontFamily: "SpaceMono",
                  fontSize: 11,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: T.spine,
                }}
              >
                In your booklet
              </Text>
              {received.length === 0 ? (
                <Text
                  style={{ fontFamily: SERIF, fontSize: 16, color: T.muted }}
                >
                  Empty pages for now. When they tear one off for you, it lands
                  here.
                </Text>
              ) : (
                received.map((coupon) => (
                  <BookletTicket
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
                  color: T.spine,
                }}
              >
                You gifted
              </Text>
              {sentLive.length === 0 ? (
                <Text
                  style={{ fontFamily: SERIF, fontSize: 16, color: T.muted }}
                >
                  Coupons you sent {partnerName} stay here until they redeem
                  them.
                </Text>
              ) : (
                sentLive.map((coupon) => (
                  <BookletTicket
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
            <View>
              {past.length === 0 ? (
                <Text
                  style={{ fontFamily: SERIF, fontSize: 16, color: T.muted }}
                >
                  Used and expired stubs collect here.
                </Text>
              ) : (
                past.map((coupon) => (
                  <BookletTicket
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
      </View>
    </Screen>
  );
}
