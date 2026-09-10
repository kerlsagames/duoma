import { HubScreen } from "@/components/hub/HubScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { isSunday } from "@/lib/dates";
import { useApp } from "@/lib/store";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function JarScreen() {
  const { jarNotes, jarOpenVotes, user, partner, addJarNote, voteOpenJar } =
    useApp();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sealed = jarNotes.filter((note) => !note.openedAt);
  const opened = jarNotes.filter((note) => note.openedAt);
  const iVoted = jarOpenVotes.some((row) => row.userId === user?.id);
  const theyVoted = jarOpenVotes.some((row) => row.userId === partner?.id);

  const drop = async () => {
    setError(null);
    try {
      await addJarNote(body);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <HubScreen
      kicker="Appreciation jar"
      title="Drop a note. Open together."
      body={
        isSunday()
          ? "It's Sunday. Read them out loud tonight."
          : "Slip compliments in all week. They stay sealed until you both tap that you're ready."
      }
    >
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Something specific they did"
        placeholderTextColor="rgba(244,244,246,0.35)"
        multiline
        className="min-h-[100px] rounded-3xl border border-white/15 bg-white/5 px-4 py-3 text-[16px] text-mist"
      />
      {error ? <Text className="mt-3 text-[14px] text-crimson">{error}</Text> : null}
      <View className="mt-4">
        <PrimaryButton label="Drop it in the jar" onPress={() => void drop()} />
      </View>

      <Text className="mt-8 text-[15px] text-mist/70">
        {sealed.length} sealed {sealed.length === 1 ? "note" : "notes"}.
      </Text>
      <Text className="mt-1 text-[14px] text-mist/50">
        {iVoted
          ? theyVoted || partner?.isDemo
            ? "Jar is opening."
            : `Waiting on ${partner?.displayName ?? "them"} to say they're ready.`
          : "Both of you have to opt in before anything is read."}
      </Text>
      <View className="mt-4">
        <PrimaryButton
          label={iVoted ? "You're ready" : "I'm ready to open"}
          tone="crimson"
          onPress={() => void voteOpenJar()}
        />
      </View>

      {opened.length ? (
        <View className="mt-8 gap-3">
          <Text className="text-[12px] uppercase tracking-widest text-mist/40">
            Opened together
          </Text>
          {opened.map((note) => (
            <View
              key={note.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <Text className="text-[12px] uppercase tracking-widest text-crimson">
                {note.fromUserId === user?.id
                  ? "You"
                  : partner?.displayName ?? "Partner"}
              </Text>
              <Text className="mt-2 text-[16px] leading-6 text-mist">
                {note.body}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </HubScreen>
  );
}
