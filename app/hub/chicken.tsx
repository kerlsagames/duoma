import { SheetOverlay } from "@/components/hub/SheetOverlay";
import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import {
  CHICKEN_DISPLAY as DISPLAY,
  CHICKEN_TONE as T,
  CHICKEN_TONE_BASE,
  SERIF,
} from "@/lib/app-themes";
import {
  CHICKEN_BADGES,
  CHICKEN_PACKS,
  CHICKEN_YARDS,
  chickenBoard,
  chickenDareById,
  chickenPackById,
  daresInPack,
  peckRandom,
  statusLine,
  type ChickenDare,
  type ChickenPackId,
  type ChickenPlay,
  type ChickenYardId,
} from "@/lib/chicken";
import { useApp } from "@/lib/store";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { Href } from "expo-router";

type Tab = "coop" | "peck" | "board";

export default function ChickenScreen() {
  const {
    user,
    partner,
    chickenPlays,
    sendChickenDare,
    respondChickenDare,
    completeChickenDare,
  } = useApp();
  const you = user?.displayName || "You";
  const them = partner?.displayName || "Them";
  const [tab, setTab] = useState<Tab>("coop");
  const [yardId, setYardId] = useState<ChickenYardId | null>(null);
  const [packId, setPackId] = useState<ChickenPackId | null>(null);
  const [picked, setPicked] = useState<ChickenDare | "custom" | null>(null);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incoming = useMemo(
    () =>
      chickenPlays
        .filter((row) => row.toUserId === user?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [chickenPlays, user?.id]
  );
  const outgoing = useMemo(
    () =>
      chickenPlays
        .filter((row) => row.fromUserId === user?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [chickenPlays, user?.id]
  );
  const liveIncoming = incoming.filter(
    (row) => row.status === "offered" || row.status === "accepted"
  );
  const liveOutgoing = outgoing.filter(
    (row) => row.status === "offered" || row.status === "accepted"
  );
  const youBoard = useMemo(
    () => chickenBoard(chickenPlays, user?.id ?? ""),
    [chickenPlays, user?.id]
  );
  const themBoard = useMemo(
    () => chickenBoard(chickenPlays, partner?.id ?? ""),
    [chickenPlays, partner?.id]
  );
  const pack = packId ? chickenPackById(packId) : null;
  const packDares = packId ? daresInPack(packId) : [];
  const packs = yardId ? CHICKEN_PACKS.filter((row) => row.yard === yardId) : [];

  const send = async (dare: ChickenDare | null, text: string) => {
    setBusy(true);
    setError(null);
    try {
      await sendChickenDare({
        dareId: dare?.id ?? null,
        text,
        packId: dare?.pack ?? packId,
      });
      setPicked(null);
      setCustom("");
      setTab("coop");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t send that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.background }}>
    <Screen scroll={!picked} background={T.background}>
      <Stage background={T.background} fallback={"/hub/play" as Href} accent={T.yolk}>
        <View
          style={{
            height: 10,
            borderRadius: 2,
            overflow: "hidden",
            flexDirection: "row",
          }}
        >
          {Array.from({ length: 18 }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: i % 2 === 0 ? T.yolk : T.cream,
              }}
            />
          ))}
        </View>
        <Text
          style={{
            marginTop: 14,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 2.4,
            color: T.yolk,
          }}
        >
          FUN · CHICKEN
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: DISPLAY,
            fontSize: 42,
            lineHeight: 44,
            color: T.yolk,
            letterSpacing: -0.6,
          }}
        >
          BUK BUK.
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 23,
            color: T.muted,
          }}
        >
          300 silly dares. Send one to {them}. They cluck out, or they do it.
          Eggs go on the board.
        </Text>

        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            padding: 4,
            borderRadius: 16,
            backgroundColor: T.barn,
            borderWidth: 1,
            borderColor: T.border,
          }}
        >
          {(
            [
              ["coop", "Coop"],
              ["peck", "Peck"],
              ["board", "Board"],
            ] as const
          ).map(([id, label]) => {
            const on = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  setTab(id);
                  if (id !== "peck") {
                    setYardId(null);
                    setPackId(null);
                  }
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 10,
                  backgroundColor: on ? T.yolk : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 16,
                    fontWeight: "700",
                    color: on ? T.creamInk : T.muted,
                  }}
                >
                  {label}
                  {id === "coop" && liveIncoming.length
                    ? ` · ${liveIncoming.length}`
                    : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "coop" ? (
          <View style={{ marginTop: 18, gap: 16 }}>
            <CoopSection
              kicker={`For ${you}`}
              empty="Nothing in the coop. Peck a dare and send it."
              rows={liveIncoming.length ? liveIncoming : incoming.slice(0, 6)}
              userId={user?.id ?? ""}
              partnerName={them}
              demo={Boolean(partner?.isDemo)}
              onIn={(id) => void respondChickenDare(id, "accepted")}
              onCluck={(id) => void respondChickenDare(id, "declined")}
              onDone={(id) => void completeChickenDare(id)}
            />
            <CoopSection
              kicker={`Sent to ${them}`}
              empty={`You haven’t dared ${them} yet.`}
              rows={liveOutgoing.length ? liveOutgoing : outgoing.slice(0, 6)}
              userId={user?.id ?? ""}
              partnerName={them}
              outgoing
              demo={Boolean(partner?.isDemo)}
              onIn={(id) => void respondChickenDare(id, "accepted")}
              onCluck={(id) => void respondChickenDare(id, "declined")}
              onDone={(id) => void completeChickenDare(id)}
            />
          </View>
        ) : null}

        {tab === "peck" ? (
          <View style={{ marginTop: 18 }}>
            {!yardId ? (
              <View style={{ gap: 12 }}>
                {CHICKEN_YARDS.map((yard) => (
                  <Pressable
                    key={yard.id}
                    onPress={() => setYardId(yard.id)}
                    style={{
                      borderRadius: 18,
                      backgroundColor: T.cream,
                      padding: 18,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{yard.emoji}</Text>
                    <Text
                      style={{
                        marginTop: 6,
                        fontFamily: DISPLAY,
                        fontSize: 26,
                        color: T.creamInk,
                      }}
                    >
                      {yard.label}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        fontFamily: SERIF,
                        fontSize: 14,
                        lineHeight: 20,
                        color: T.creamMuted,
                      }}
                    >
                      {yard.detail}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => {
                    const dare = peckRandom();
                    setYardId(dare.yard);
                    setPackId(dare.pack);
                    setPicked(dare);
                  }}
                  style={{
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: T.yolk,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 18,
                      color: T.yolk,
                    }}
                  >
                    Peck a random one
                  </Text>
                </Pressable>
              </View>
            ) : !packId ? (
              <View>
                <BackLink label="YARDS" onPress={() => setYardId(null)} />
                <Text
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 28,
                    color: T.yolk,
                  }}
                >
                  {CHICKEN_YARDS.find((row) => row.id === yardId)?.label}
                </Text>
                <View style={{ marginTop: 12, gap: 10 }}>
                  {packs.map((row) => (
                    <Pressable
                      key={row.id}
                      onPress={() => setPackId(row.id)}
                      style={{
                        borderRadius: 16,
                        backgroundColor: T.cream,
                        padding: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "SpaceMono",
                          fontSize: 10,
                          color: T.comb,
                          letterSpacing: 1.2,
                        }}
                      >
                        {row.range}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: DISPLAY,
                          fontSize: 20,
                          color: T.creamInk,
                        }}
                      >
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: SERIF,
                          fontSize: 13,
                          color: T.creamMuted,
                        }}
                      >
                        {row.detail}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View>
                <BackLink label="PACKS" onPress={() => setPackId(null)} />
                <Text
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 26,
                    color: T.yolk,
                  }}
                >
                  {pack?.label}
                </Text>
                <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => setPicked(peckRandom(packDares))}
                    style={chipStyle}
                  >
                    <Text style={chipText}>Random in here</Text>
                  </Pressable>
                  <Pressable onPress={() => setPicked("custom")} style={chipStyle}>
                    <Text style={chipText}>Write your own</Text>
                  </Pressable>
                </View>
                <View style={{ marginTop: 12, gap: 8 }}>
                  {packDares.map((dare) => (
                    <Pressable
                      key={dare.id}
                      onPress={() => setPicked(dare)}
                      style={{
                        borderRadius: 14,
                        backgroundColor: T.cream,
                        padding: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "SpaceMono",
                          fontSize: 10,
                          color: T.comb,
                        }}
                      >
                        #{dare.n}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: DISPLAY,
                          fontSize: 18,
                          color: T.creamInk,
                        }}
                      >
                        {dare.name}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: SERIF,
                          fontSize: 14,
                          lineHeight: 20,
                          color: T.creamMuted,
                        }}
                      >
                        {dare.body}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : null}

        {tab === "board" ? (
          <View style={{ marginTop: 18 }}>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              <EggCard name={you} board={youBoard} you />
              <EggCard name={them} board={themBoard} />
            </View>
            <Text
              style={{
                marginTop: 20,
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                color: T.yolk,
              }}
            >
              BADGES
            </Text>
            <View style={{ marginTop: 10, gap: 8 }}>
              {CHICKEN_BADGES.map((badge) => {
                const yours = youBoard.badges.includes(badge.id);
                const theirs = themBoard.badges.includes(badge.id);
                return (
                  <View
                    key={badge.id}
                    style={{
                      borderRadius: 14,
                      backgroundColor: yours || theirs ? T.cream : T.barn,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: yours || theirs ? T.yolk : T.border,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 18,
                        color: yours || theirs ? T.creamInk : T.ink,
                      }}
                    >
                      {badge.label}
                    </Text>
                    <Text
                      style={{
                        marginTop: 2,
                        fontFamily: SERIF,
                        fontSize: 13,
                        color: yours || theirs ? T.creamMuted : T.dim,
                      }}
                    >
                      {badge.detail}
                    </Text>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        fontWeight: "700",
                        color: T.comb,
                      }}
                    >
                      {yours && theirs
                        ? `Both of you`
                        : yours
                          ? you
                          : theirs
                            ? them
                            : "Nobody yet"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </Stage>
    </Screen>

      {picked ? (
        <SheetOverlay
          kicker="SEND A DARE"
          title={picked === "custom" ? "Write your own" : picked.name}
          onClose={() => {
            setPicked(null);
            setError(null);
          }}
          background={T.cream}
          ink={T.creamInk}
          muted={T.creamMuted}
        >
          {picked !== "custom" ? (
            <Text
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                lineHeight: 24,
                color: T.creamInk,
              }}
            >
              {picked.body}
            </Text>
          ) : (
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder="They have to… (keep it silly, keep it kind)"
              placeholderTextColor="rgba(42,20,8,0.35)"
              multiline
              style={{
                minHeight: 90,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(42,20,8,0.18)",
                backgroundColor: "#FFFBEA",
                padding: 12,
                fontFamily: SERIF,
                fontSize: 16,
                color: T.creamInk,
              }}
            />
          )}
          {error ? (
            <Text style={{ marginTop: 10, color: T.comb, fontWeight: "700" }}>
              {error}
            </Text>
          ) : null}
          <Pressable
            disabled={busy}
            onPress={() =>
              void send(
                picked === "custom" ? null : picked,
                picked === "custom" ? custom : picked.body
              )
            }
            style={{
              marginTop: 16,
              borderRadius: 14,
              backgroundColor: T.comb,
              paddingVertical: 14,
              alignItems: "center",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <Text style={{ color: T.cream, fontWeight: "800", fontSize: 15 }}>
              Dare {them}
            </Text>
          </Pressable>
        </SheetOverlay>
      ) : null}
    </View>
  );
}

function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: 8 }}>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
          color: T.yolk,
        }}
      >
        ← {label}
      </Text>
    </Pressable>
  );
}

const chipStyle = {
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: CHICKEN_TONE_BASE.barn,
  borderWidth: 1,
  borderColor: CHICKEN_TONE_BASE.border,
} as const;

const chipText = {
  fontFamily: DISPLAY,
  fontSize: 14,
  color: CHICKEN_TONE_BASE.yolk,
} as const;

function EggCard({
  name,
  board,
  you,
}: {
  name: string;
  board: ReturnType<typeof chickenBoard>;
  you?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 18,
        backgroundColor: you ? T.yolk : T.cream,
        padding: 14,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.2,
          color: T.creamInk,
        }}
      >
        {name.toUpperCase()}
      </Text>
      <Text
        style={{
          marginTop: 4,
          fontFamily: DISPLAY,
          fontSize: 48,
          lineHeight: 50,
          color: T.creamInk,
        }}
      >
        {board.done}
      </Text>
      <Text style={{ fontFamily: SERIF, fontSize: 13, color: T.creamMuted }}>
        eggs · {board.clucks} clucks · {board.sent} sent
      </Text>
    </View>
  );
}

function CoopSection({
  kicker,
  empty,
  rows,
  userId,
  partnerName,
  outgoing,
  demo,
  onIn,
  onCluck,
  onDone,
}: {
  kicker: string;
  empty: string;
  rows: ChickenPlay[];
  userId: string;
  partnerName: string;
  outgoing?: boolean;
  demo?: boolean;
  onIn: (id: string) => void;
  onCluck: (id: string) => void;
  onDone: (id: string) => void;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.6,
          color: T.yolk,
        }}
      >
        {kicker.toUpperCase()}
      </Text>
      {rows.length === 0 ? (
        <View
          style={{
            marginTop: 8,
            borderRadius: 16,
            backgroundColor: T.barn,
            padding: 16,
          }}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 15, color: T.muted }}>
            {empty}
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 8, gap: 8 }}>
          {rows.map((row) => {
            const catalog = chickenDareById(row.dareId);
            const mine = row.toUserId === userId;
            const canAct = mine || (Boolean(demo) && outgoing);
            return (
              <View
                key={row.id}
                style={{
                  borderRadius: 16,
                  backgroundColor: T.cream,
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 10,
                    letterSpacing: 1.1,
                    color: T.comb,
                  }}
                >
                  {statusLine(row.status).toUpperCase()}
                  {catalog ? ` · #${catalog.n}` : " · HOMEMADE"}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: DISPLAY,
                    fontSize: 18,
                    color: T.creamInk,
                  }}
                >
                  {catalog?.name ?? "Homemade dare"}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: SERIF,
                    fontSize: 14,
                    lineHeight: 20,
                    color: T.creamMuted,
                  }}
                >
                  {row.text}
                </Text>
                {row.status === "offered" && canAct ? (
                  <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                    <Pressable
                      onPress={() => onIn(row.id)}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        backgroundColor: T.yolk,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "800", color: T.creamInk }}>
                        I’m in
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onCluck(row.id)}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        backgroundColor: T.comb,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "800", color: T.cream }}>
                        Chicken!
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
                {row.status === "accepted" && canAct ? (
                  <Pressable
                    onPress={() => onDone(row.id)}
                    style={{
                      marginTop: 10,
                      borderRadius: 12,
                      backgroundColor: T.yolk,
                      paddingVertical: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "800", color: T.creamInk }}>
                      Did it
                    </Text>
                  </Pressable>
                ) : null}
                {outgoing && row.status === "declined" ? (
                  <Text style={{ marginTop: 8, fontSize: 12, color: T.comb }}>
                    {partnerName} chickened.
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
