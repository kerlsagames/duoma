import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  curiositySynergy,
  dayMatchPoints,
  isCuriosityComplete,
  matchHeadline,
  optionLabel,
  partnerDisplayName,
} from "@/lib/curiosity";
import { dailyCuriosityQuestion } from "@/lib/curiosityQuestions";
import { localDateKey } from "@/lib/dates";
import { useApp } from "@/lib/store";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Step = "answer" | "guess" | "done";

function OptionList({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: number | null;
  onChange: (index: number) => void;
}) {
  return (
    <View className="mt-3 gap-2">
      {options.map((label, index) => {
        const on = value === index;
        return (
          <Pressable
            key={`${index}-${label}`}
            onPress={() => onChange(index)}
            className={`rounded-2xl border px-4 py-3.5 ${
              on ? "border-neon bg-neon/20" : "border-white/10 bg-white/5"
            }`}
          >
            <Text
              className={`text-[15px] leading-5 ${
                on ? "font-semibold text-mist" : "text-mist/80"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CuriosityScreen() {
  const {
    couple,
    user,
    partner,
    curiosityAnswers,
    curiosityMatchScore,
    submitCuriosity,
  } = useApp();
  const today = localDateKey();
  const partnerName = partnerDisplayName(partner);
  const question = couple ? dailyCuriosityQuestion(couple.id, today) : null;

  const mine = curiosityAnswers.find(
    (row) => row.userId === user?.id && row.date === today
  );
  const theirs = curiosityAnswers.find(
    (row) => row.userId === partner?.id && row.date === today
  );
  const iDone = isCuriosityComplete(mine);
  const theyDone = isCuriosityComplete(theirs);
  const revealed = iDone && theyDone;

  const [step, setStep] = useState<Step>(iDone ? "done" : "answer");
  const [answerIndex, setAnswerIndex] = useState<number | null>(
    mine?.answerIndex ?? null
  );
  const [guessIndex, setGuessIndex] = useState<number | null>(
    mine?.guessIndex ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const synergy = useMemo(
    () => curiosityMatchScore ?? curiositySynergy(curiosityAnswers),
    [curiosityAnswers, curiosityMatchScore]
  );

  const todayPoints = revealed ? dayMatchPoints(mine, theirs) : 0;
  const headline = revealed ? matchHeadline(todayPoints) : null;

  const lockIn = async () => {
    if (answerIndex == null || guessIndex == null) {
      setError("Pick your answer and your guess.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await submitCuriosity({ answerIndex, guessIndex });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not lock answers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HubScreen
      kicker="Curiosity"
      body="One question a day. Answer for yourself, then guess theirs. Points land when you both lock in."
    >
      {!couple || !question ? (
        <Text className="text-[15px] leading-6 text-mist/65">
          Pair up to receive today's question.
        </Text>
      ) : (
        <>
          <View className="rounded-[28px] border border-neon/30 bg-neon/10 p-5">
            <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-neon">
              Today · {question.category}
            </Text>
            <Text className="mt-3 text-[20px] font-bold leading-7 text-mist">
              {question.question}
            </Text>
          </View>

          {revealed && headline ? (
            <View className="mt-5 rounded-3xl border border-neon bg-neon/20 p-5">
              <Text className="text-[22px] font-bold text-mist">{headline.title}</Text>
              <Text className="mt-2 text-[15px] leading-6 text-mist/75">
                {headline.detail}
              </Text>

              <View className="mt-5 gap-3">
                <View className="rounded-2xl border border-white/10 bg-night/60 p-4">
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-neon">
                    {partnerName} answered
                  </Text>
                  <Text className="mt-2 text-[16px] font-semibold text-mist">
                    {optionLabel(question.id, theirs?.answerIndex)}
                  </Text>
                  <Text className="mt-3 text-[12px] uppercase tracking-widest text-mist/45">
                    Your guess
                  </Text>
                  <Text
                    className={`mt-1 text-[15px] ${
                      mine?.guessIndex === theirs?.answerIndex
                        ? "text-neon"
                        : "text-mist/70"
                    }`}
                  >
                    {optionLabel(question.id, mine?.guessIndex)}
                    {mine?.guessIndex === theirs?.answerIndex ? " · hit" : " · miss"}
                  </Text>
                </View>

                <View className="rounded-2xl border border-white/10 bg-night/60 p-4">
                  <Text className="text-[11px] font-bold uppercase tracking-[2px] text-neon">
                    You answered
                  </Text>
                  <Text className="mt-2 text-[16px] font-semibold text-mist">
                    {optionLabel(question.id, mine?.answerIndex)}
                  </Text>
                  <Text className="mt-3 text-[12px] uppercase tracking-widest text-mist/45">
                    {partnerName}'s guess
                  </Text>
                  <Text
                    className={`mt-1 text-[15px] ${
                      theirs?.guessIndex === mine?.answerIndex
                        ? "text-neon"
                        : "text-mist/70"
                    }`}
                  >
                    {optionLabel(question.id, theirs?.guessIndex)}
                    {theirs?.guessIndex === mine?.answerIndex ? " · hit" : " · miss"}
                  </Text>
                </View>
              </View>
            </View>
          ) : iDone && !theyDone ? (
            <View className="mt-5 rounded-3xl border border-white/15 bg-white/5 p-5">
              <Text className="text-[18px] font-bold text-mist">Answers locked!</Text>
              <Text className="mt-2 text-[15px] leading-6 text-mist/70">
                You’ll see the match results once {partnerName} answers today.
              </Text>
              <View className="mt-4 rounded-2xl border border-white/10 bg-night/50 p-4">
                <Text className="text-[12px] uppercase tracking-widest text-mist/45">
                  Your answer
                </Text>
                <Text className="mt-1 text-[15px] text-mist">
                  {optionLabel(question.id, mine?.answerIndex)}
                </Text>
                <Text className="mt-3 text-[12px] uppercase tracking-widest text-mist/45">
                  Your guess for them
                </Text>
                <Text className="mt-1 text-[15px] text-mist">
                  {optionLabel(question.id, mine?.guessIndex)}
                </Text>
              </View>
            </View>
          ) : (
            <View className="mt-5">
              {step === "answer" ? (
                <>
                  <Text className="text-[12px] font-bold uppercase tracking-[2px] text-neon">
                    Step 1 · Your answer
                  </Text>
                  <Text className="mt-1 text-[14px] text-mist/60">
                    What do you pick for yourself?
                  </Text>
                  <OptionList
                    options={question.options}
                    value={answerIndex}
                    onChange={setAnswerIndex}
                  />
                  <View className="mt-4">
                    <PrimaryButton
                      label="Next — guess theirs"
                      disabled={answerIndex == null}
                      onPress={() => {
                        setError(null);
                        setStep("guess");
                      }}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text className="text-[12px] font-bold uppercase tracking-[2px] text-neon">
                    Step 2 · Guess {partnerName}
                  </Text>
                  <Text className="mt-1 text-[14px] text-mist/60">
                    What do you think they picked?
                  </Text>
                  <OptionList
                    options={question.options}
                    value={guessIndex}
                    onChange={setGuessIndex}
                  />
                  {error ? (
                    <Text className="mt-3 text-[14px] text-crimson">{error}</Text>
                  ) : null}
                  <View className="mt-4 gap-2">
                    <PrimaryButton
                      label={theyDone ? "Lock in & reveal" : "Lock in answers"}
                      loading={loading}
                      disabled={guessIndex == null}
                      onPress={() => void lockIn()}
                    />
                    <PrimaryButton
                      tone="ghost"
                      label="Back"
                      onPress={() => setStep("answer")}
                    />
                  </View>
                </>
              )}
            </View>
          )}
        </>
      )}

      <View className="mt-8 rounded-3xl border border-neon/40 bg-neon/15 px-4 py-4">
        <Text className="text-[12px] font-bold uppercase tracking-[2px] text-neon">
          Curiosity Synergy
        </Text>
        <View className="mt-2 flex-row items-end justify-between">
          <Text className="text-[34px] font-bold text-mist">
            {synergy.matchScore} pts
          </Text>
          <Text className="pb-1 text-[14px] font-semibold text-mist/70">
            Match rate {synergy.matchRate}%
            {synergy.daysPlayed
              ? ` · ${synergy.daysPlayed} day${synergy.daysPlayed === 1 ? "" : "s"}`
              : ""}
          </Text>
        </View>
      </View>
    </HubScreen>
  );
}
