import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { COUPON_TEMPLATES } from "@/lib/hub";
import { useApp } from "@/lib/store";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function CouponsScreen() {
  const { coupons, user, partner, createCoupon, acceptCoupon, redeemCoupon } =
    useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const incoming = coupons.filter((row) => row.toUserId === user?.id);
  const outgoing = coupons.filter((row) => row.fromUserId === user?.id);

  const send = async (nextTitle: string, nextBody: string) => {
    setError(null);
    try {
      await createCoupon({ title: nextTitle, body: nextBody });
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    }
  };

  return (
    <HubScreen
      kicker="Favor coupons"
      title="Give one. Accept. Redeem."
      body={`${partner?.displayName ?? "Your partner"} has to accept before a coupon can be redeemed. No surprise IOUs.`}
    >
      <Text className="text-[12px] uppercase tracking-widest text-mist/40">
        For you
      </Text>
      <View className="mt-3 gap-3">
        {incoming.length === 0 ? (
          <Text className="text-[15px] text-mist/60">
            No coupons in your wallet yet.
          </Text>
        ) : (
          incoming.map((coupon) => (
            <View
              key={coupon.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <Text className="text-[12px] uppercase tracking-widest text-crimson">
                {coupon.status}
              </Text>
              <Text className="mt-1 text-[18px] font-semibold text-mist">
                {coupon.title}
              </Text>
              {coupon.body ? (
                <Text className="mt-1 text-[14px] text-mist/65">{coupon.body}</Text>
              ) : null}
              {coupon.status === "offered" ? (
                <View className="mt-3">
                  <PrimaryButton
                    label="Accept"
                    onPress={() => void acceptCoupon(coupon.id)}
                  />
                </View>
              ) : null}
              {coupon.status === "accepted" ? (
                <View className="mt-3">
                  <PrimaryButton
                    label="Redeem now"
                    tone="crimson"
                    onPress={() => void redeemCoupon(coupon.id)}
                  />
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>

      <Text className="mt-8 text-[12px] uppercase tracking-widest text-mist/40">
        You sent
      </Text>
      <View className="mt-3 gap-2">
        {outgoing.map((coupon) => (
          <View key={coupon.id} className="mt-2">
            <Text className="text-[15px] text-mist/70">
              {coupon.title} · {coupon.status}
            </Text>
            {coupon.status === "accepted" && partner?.isDemo ? (
              <Pressable onPress={() => void redeemCoupon(coupon.id)}>
                <Text className="mt-1 text-[13px] text-neon">
                  Honor / redeem for {partner.displayName}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <Text className="mt-8 text-[12px] uppercase tracking-widest text-mist/40">
        Quick issue
      </Text>
      <View className="mt-3 gap-2">
        {COUPON_TEMPLATES.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => void send(item.title, item.body)}
            className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <Text className="text-[15px] font-semibold text-mist">{item.title}</Text>
            <Text className="mt-1 text-[13px] text-mist/55">{item.body}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="mt-8 text-[12px] uppercase tracking-widest text-mist/40">
        Custom
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="The fine print"
        placeholderTextColor="rgba(244,244,246,0.35)"
        className="mt-3 h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
      />
      {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}
      <View className="mt-4">
        <PrimaryButton
          label="Send coupon"
          onPress={() => void send(title, body)}
        />
      </View>
    </HubScreen>
  );
}
