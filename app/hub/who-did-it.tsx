import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

const BG = "#0A0C12";
const YOU_C = "#3ECFBF";
const THEM_C = "#FF4D6A";

export default function WhoDidItScreen() {
  const { user, partner } = useApp();
  const { data, ready, patch } = useMiniApps();
  const you = user?.displayName || "YOU";
  const them = partner?.displayName || "THEM";
  const lastFor = (taskId: string) => data.whoLast.find((row) => row.taskId === taskId);
  const score = (id: string) => data.whoLast.filter((row) => row.userId === id).length;
  const yours = user ? score(user.id) : 0;
  const theirs = partner ? score(partner.id) : 0;

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

  return (
    <Screen scroll background={BG}>
      <Stage background={BG} fallback={"/hub/home-base" as Href} accent={YOU_C}>
        <View style={{ flexDirection: "row", height: 120 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#0C2420",
              alignItems: "center",
              justifyContent: "center",
              borderRightWidth: 3,
              borderRightColor: "#F4F4F6",
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 28, color: YOU_C }}>{you}</Text>
            <Text style={{ fontFamily: "SpaceMono", fontSize: 36, color: YOU_C }}>{yours}</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#241018",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: SERIF, fontSize: 28, color: THEM_C }}>{them}</Text>
            <Text style={{ fontFamily: "SpaceMono", fontSize: 36, color: THEM_C }}>{theirs}</Text>
          </View>
        </View>
        <Text
          style={{
            textAlign: "center",
            marginTop: 12,
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: "#F4F4F6",
          }}
        >
          tap a row to steal the credit
        </Text>

        <View style={{ marginTop: 14, gap: 8 }}>
          {data.whoTasks.map((task) => {
            const last = lastFor(task.id);
            const mine = last?.userId === user?.id;
            const name = !last ? "unclaimed" : mine ? you : them;
            const color = !last ? "#666" : mine ? YOU_C : THEM_C;
            return (
              <Pressable
                key={task.id}
                onPress={() => void claim(task.id)}
                style={{
                  flexDirection: "row",
                  overflow: "hidden",
                  height: 64,
                }}
              >
                <View
                  style={{
                    width: 8,
                    backgroundColor: color,
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#12161C",
                    paddingHorizontal: 12,
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: SERIF, fontSize: 20, color: "#F4F4F6" }}>
                    {task.label}
                  </Text>
                  <Text style={{ color, fontFamily: "SpaceMono", fontSize: 11 }}>
                    LAST · {name}
                    {last
                      ? ` · ${new Date(last.at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}`
                      : ""}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {!ready ? <Text style={{ color: YOU_C }}>Queuing the broadcast…</Text> : null}
      </Stage>
    </Screen>
  );
}
