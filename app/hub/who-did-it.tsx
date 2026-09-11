import { MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

const BG = "#0E1214";
const YOU_C = "#3ECFBF";
const THEM_C = "#FF6B9A";

export default function WhoDidItScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "You";
  const them = partner?.displayName || "Them";

  const lastFor = (taskId: string) => data.whoLast.find((row) => row.taskId === taskId);

  const claim = async (taskId: string) => {
    if (!user) return;
    await patch((state) => ({
      ...state,
      whoLast: [
        { taskId, userId: user.id, at: nowIso() },
        ...state.whoLast.filter((row) => row.taskId !== taskId),
      ],
    }));
  };

  const score = (id: string) => data.whoLast.filter((row) => row.userId === id).length;
  const yours = user ? score(user.id) : 0;
  const theirs = partner ? score(partner.id) : 0;
  const total = Math.max(1, yours + theirs);

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={YOU_C}
        fallback={"/hub/home-base" as Href}
        kicker="Home Base · tally"
        title="Who did it last?"
        body="A petty, useful scoreboard. Tap when you did the thing. No judges, just receipts."
        ready={ready}
      >
        <View
          style={{
            marginTop: 16,
            height: 18,
            borderRadius: 999,
            overflow: "hidden",
            flexDirection: "row",
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <View style={{ width: `${(yours / total) * 100}%`, backgroundColor: YOU_C }} />
          <View style={{ width: `${(theirs / total) * 100}%`, backgroundColor: THEM_C }} />
        </View>
        <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: YOU_C }}>{you} · {yours}</Text>
          <Text style={{ color: THEM_C }}>{them} · {theirs}</Text>
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          {data.whoTasks.map((task) => {
            const last = lastFor(task.id);
            const mine = last?.userId === user?.id;
            const name = !last ? "Nobody yet" : mine ? you : them;
            const color = !last ? "rgba(244,244,246,0.4)" : mine ? YOU_C : THEM_C;
            return (
              <Pressable
                key={task.id}
                onPress={() => void claim(task.id)}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: "#161C20",
                  borderWidth: 1,
                  borderColor: `${color}55`,
                }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#F4F4F6" }}>
                  {task.label}
                </Text>
                <Text style={{ marginTop: 4, color }}>
                  Last: {name}
                  {last
                    ? ` · ${new Date(last.at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}`
                    : ""}
                </Text>
                <Text style={{ marginTop: 6, color: "rgba(244,244,246,0.35)", fontSize: 12 }}>
                  Tap to claim it
                </Text>
              </Pressable>
            );
          })}
        </View>
      </MiniChrome>
    </Screen>
  );
}
