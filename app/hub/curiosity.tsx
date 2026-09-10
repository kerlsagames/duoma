import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { localDateKey } from "@/lib/dates";
import { curiosityFor } from "@/lib/hub";
import { useApp } from "@/lib/store";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function CuriosityScreen() {
  const { couple, user, partner, curiosityAnswers, submitCuriosity } = useApp();
  const today = localDateKey();
  const question = couple ? curiosityFor(couple.id, today) : null;
  const mine = curiosityAnswers.find(
    (row) => row.userId === user?.id && row.date === today
  );
  const theirs = curiosityAnswers.find(
    (row) => row.userId === partner?.id && row.date === today
  );
  const revealed = Boolean(mine && theirs);
  const [body, setBody] = useState(mine?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setError(null);
    setLoading(true);
    try {
      await submitCuriosity(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HubScreen
      kicker="Daily curiosity"
      title="One question. Both phones."
      body="Same prompt, sent to both of you. In this preview it lives here instead of a push notification. Answers stay hidden until you both submit."
    >
      <View className="rounded-[28px] border border-neon/30 bg-neon/10 p-5">
        <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
          Today
        </Text>
        <Text className="mt-3 text-[20px] font-bold leading-7 text-mist">
          {question?.prompt ?? "Pair up to receive today's question."}
        </Text>
      </View>

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Your answer"
        placeholderTextColor="rgba(244,244,246,0.35)"
        multiline
        editable={!revealed}
        className="mt-5 min-h-[120px] rounded-3xl border border-white/15 bg-white/5 px-4 py-3 text-[16px] text-mist"
      />
      {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}
      <View className="mt-4">
        <PrimaryButton
          label={mine ? "Update my answer" : "Submit my answer"}
          loading={loading}
          disabled={!question || revealed}
          onPress={() => void save()}
        />
      </View>

      <View className="mt-6 gap-3">
        <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <Text className="text-[12px] uppercase tracking-widest text-mist/40">
            You
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-mist">
            {mine?.body ?? "Not submitted yet."}
          </Text>
        </View>
        <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <Text className="text-[12px] uppercase tracking-widest text-mist/40">
            {partner?.displayName ?? "Partner"}
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-mist">
            {revealed
              ? theirs?.body
              : theirs
                ? "They've answered. Yours is still needed to reveal."
                : "Hidden until they submit too."}
          </Text>
        </View>
      </View>
    </HubScreen>
  );
}
