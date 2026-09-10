import { HubScreen } from "@/components/hub/HubScreen";
import { DESIRE_CATEGORIES } from "@/lib/hub";
import { useApp } from "@/lib/store";
import { Pressable, Text, View } from "react-native";

export default function DesireScreen() {
  const { user, partner, desireToggles, toggleDesire } = useApp();
  const mine = new Set(
    desireToggles.filter((row) => row.userId === user?.id).map((row) => row.optionId)
  );
  const theirs = new Set(
    desireToggles
      .filter((row) => row.userId === partner?.id)
      .map((row) => row.optionId)
  );
  const partnerHasAny = theirs.size > 0;

  return (
    <HubScreen
      kicker="Desire matrix"
      title="Matches only"
      body="Toggle what you actually want. Fuse highlights exact matches. Anything they did not also choose stays invisible — no guesswork, no pressure."
    >
      {DESIRE_CATEGORIES.map((category) => {
        const matches = category.options.filter(
          (option) => mine.has(option.id) && theirs.has(option.id)
        );
        return (
          <View key={category.id} className="mb-7">
            <Text className="text-[12px] uppercase tracking-widest text-mist/40">
              {category.label}
            </Text>
            {partnerHasAny ? (
              <View className="mt-2 rounded-3xl border border-neon/30 bg-neon/10 p-4">
                <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
                  You both want
                </Text>
                {matches.length === 0 ? (
                  <Text className="mt-2 text-[14px] text-mist/65">
                    No overlap in this lane yet.
                  </Text>
                ) : (
                  matches.map((option) => (
                    <Text
                      key={option.id}
                      className="mt-2 text-[16px] font-semibold text-mist"
                    >
                      {option.label}
                    </Text>
                  ))
                )}
              </View>
            ) : (
              <Text className="mt-2 text-[14px] text-mist/55">
                Matches appear once {partner?.displayName ?? "your partner"}{" "}
                answers. Their no's never show.
              </Text>
            )}
            <View className="mt-3 gap-2">
              {category.options.map((option) => {
                const on = mine.has(option.id);
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => void toggleDesire(option.id)}
                    className={`rounded-3xl border px-4 py-3 ${
                      on ? "border-neon bg-neon/15" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <Text className="text-[15px] font-semibold text-mist">
                      {on ? "On · " : ""}
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </HubScreen>
  );
}
