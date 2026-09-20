import { DuomaLogo } from "@/components/DuomaLogo";
import { InstallHomeScreenCard } from "@/components/InstallHomeScreenCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { looksLikeEmail } from "@/lib/account-usage";
import { SERIF } from "@/lib/app-themes";
import { HUBS } from "@/lib/hubs";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const {
    ready,
    user,
    savedPair,
    continueAsSaved,
    usingCloud,
    pairError,
    requestEmailCode,
    verifyEmailCode,
  } = useApp();
  const [forgot, setForgot] = useState(false);
  const [email, setEmail] = useState(savedPair?.user.email ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  if (ready && user) return <Redirect href="/" />;

  return (
    <Screen scroll>
      <View className="pt-10 pb-8">
        <Text className="text-[12px] font-semibold uppercase tracking-[4px] text-neon">
          Couples app
        </Text>
        <View className="mt-4 items-start">
          <DuomaLogo size={52} />
        </View>
        <Text className="mt-3 max-w-[320px] text-[22px] font-bold leading-7 text-mist">
          Two phones. One home.
        </Text>
        {pairError ? (
          <Text className="mt-3 text-[14px] leading-5 text-crimson">{pairError}</Text>
        ) : null}

        <View
          style={{
            marginTop: 22,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {HUBS.map((hub) => (
            <View
              key={hub.id}
              style={{
                width: "48%",
                marginBottom: 8,
                borderRadius: 18,
                paddingVertical: 10,
                paddingHorizontal: 10,
                backgroundColor: hub.tile,
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={hub.icon} size={28} color={hub.tileInk} />
              </View>
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: SERIF,
                    fontSize: 18,
                    lineHeight: 22,
                    color: hub.tileInk,
                    textAlign: "center",
                  }}
                >
                  {hub.label}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    color: hub.tileInk,
                    opacity: 0.72,
                    fontSize: 11,
                    lineHeight: 14,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {hub.tagline}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-6">
          <InstallHomeScreenCard />
        </View>

        <View className="mt-2 gap-3">
          {savedPair && !savedPair.user.bannedAt ? (
            <>
              <Text className="text-center text-[14px] leading-5 text-mist/60">
                {savedPair.partner
                  ? `${savedPair.user.displayName} is still paired with ${savedPair.partner.displayName}. Same code. No new invite.`
                  : `${savedPair.user.displayName} still has an open invite code.`}
              </Text>
              <PrimaryButton
                label={`Continue as ${savedPair.user.displayName}`}
                onPress={() => {
                  void continueAsSaved()
                    .then(() => router.replace("/"))
                    .catch((err: unknown) => {
                      if (
                        err instanceof Error &&
                        (err.message === "SIGN_IN" || err.message === "CHECK_EMAIL")
                      ) {
                        const savedEmail = savedPair?.user.email
                          ? `&email=${encodeURIComponent(savedPair.user.email)}`
                          : "";
                        router.replace(`/login?from=signin${savedEmail}` as Href);
                        return;
                      }
                      router.replace("/banned");
                    });
                }}
              />
            </>
          ) : null}
          <PrimaryButton
            label={savedPair && !savedPair.user.bannedAt ? "Start a new pair" : "Create your pair"}
            tone={savedPair && !savedPair.user.bannedAt ? "ghost" : "neon"}
            onPress={() => router.push("/create")}
          />
          <PrimaryButton
            label="I have a code"
            tone="ghost"
            onPress={() => router.push("/join")}
          />
          {usingCloud ? (
            <PrimaryButton
              label="Sign in"
              tone="ghost"
              onPress={() => router.push("/login?from=signin" as Href)}
            />
          ) : null}
          <PrimaryButton
            label="Terms and privacy"
            tone="ghost"
            onPress={() => router.push("/legal" as Href)}
          />
          {usingCloud ? (
            forgot ? (
              <View className="mt-2 gap-3">
                <Text className="text-center text-[14px] leading-5 text-mist/60">
                  We’ll email a reset code. Then set a new password in Home settings.
                </Text>
                <TextInput
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setError(null);
                  }}
                  placeholder="Email"
                  placeholderTextColor="rgba(244,244,246,0.35)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  className="h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
                />
                <TextInput
                  value={code}
                  onChangeText={(value) =>
                    setCode(value.replace(/[^\d]/g, "").slice(0, 8))
                  }
                  placeholder="Reset code"
                  placeholderTextColor="rgba(244,244,246,0.35)"
                  keyboardType="number-pad"
                  maxLength={8}
                  className="h-14 rounded-2xl border border-white/15 bg-white/5 px-4 text-[16px] text-mist"
                />
                {note ? (
                  <Text className="text-center text-[14px] leading-5 text-mist/70">
                    {note}
                  </Text>
                ) : null}
                {error ? (
                  <Text className="text-center text-[14px] leading-5 text-crimson">
                    {error}
                  </Text>
                ) : null}
                <PrimaryButton
                  label="Email me a reset code"
                  loading={loading && !code}
                  disabled={!looksLikeEmail(email.trim())}
                  onPress={() => {
                    void (async () => {
                      if (!looksLikeEmail(email.trim())) {
                        setError("That email does not look right.");
                        return;
                      }
                      setError(null);
                      setLoading(true);
                      try {
                        await requestEmailCode(email.trim());
                        setNote("Reset code sent. Type it below, then set a password in Home settings.");
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "Could not send a reset code."
                        );
                      } finally {
                        setLoading(false);
                      }
                    })();
                  }}
                />
                <PrimaryButton
                  label="Use reset code"
                  loading={loading && Boolean(code)}
                  disabled={code.length < 6}
                  onPress={() => {
                    void (async () => {
                      setError(null);
                      setLoading(true);
                      try {
                        await verifyEmailCode(code);
                        router.replace("/");
                      } catch (err) {
                        setError(
                          err instanceof Error
                            ? err.message
                            : "Could not confirm that code."
                        );
                      } finally {
                        setLoading(false);
                      }
                    })();
                  }}
                />
                <PrimaryButton
                  label="Cancel"
                  tone="ghost"
                  onPress={() => {
                    setForgot(false);
                    setCode("");
                    setError(null);
                    setNote(null);
                  }}
                />
              </View>
            ) : (
              <PrimaryButton
                label="I forgot my password"
                tone="ghost"
                onPress={() => {
                  setForgot(true);
                  setError(null);
                  setNote(null);
                  if (!email && savedPair?.user.email) {
                    setEmail(savedPair.user.email);
                  }
                }}
              />
            )
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
