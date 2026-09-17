import { LOVEBETZ_SCRIPT } from "@/lib/app-themes";
import { formatRelativeWhen } from "@/lib/dates";
import { useMiniApps } from "@/lib/mini-apps";
import { PING_KINDS } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function seenKey(userId: string) {
  return `duoma:homePingOpened:${userId}`;
}

async function readSeen(userId: string): Promise<string | null> {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      return localStorage.getItem(seenKey(userId));
    }
    return await AsyncStorage.getItem(seenKey(userId));
  } catch {
    return null;
  }
}

async function writeSeen(userId: string, pingId: string) {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      localStorage.setItem(seenKey(userId), pingId);
      return;
    }
    await AsyncStorage.setItem(seenKey(userId), pingId);
  } catch {
    // Keep the in-memory open even if disk fails.
  }
}

/** Tiny Home cue when they sent you a Thought of You ping. */
export function HomePingNudge() {
  const router = useRouter();
  const { user, partner, couple } = useApp();
  const { data } = useMiniApps();
  const [seenId, setSeenId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const ping = useMemo(() => {
    const them = partner?.id;
    if (!them) return null;
    const rows = (data.pings ?? []).filter((row) => row.fromId === them);
    if (!rows.length) return null;
    return [...rows].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    )[0];
  }, [data.pings, partner?.id]);
  const meta = ping
    ? (PING_KINDS.find((row) => row.id === ping.kind) ?? PING_KINDS[0]!)
    : null;

  useEffect(() => {
    if (!user?.id) return;
    void readSeen(user.id).then(setSeenId);
  }, [user?.id, ping?.id]);

  const close = useCallback(async () => {
    setOpen(false);
    if (!user?.id || !ping) return;
    setSeenId(ping.id);
    await writeSeen(user.id, ping.id);
  }, [ping, user?.id]);

  if (!couple || !ping || !meta || seenId === ping.id) return null;

  const when = formatRelativeWhen(ping.createdAt);
  const them = partner?.displayName || "Them";

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        elevation: 50,
      }}
    >
      {open ? (
        <Pressable
          onPress={() => void close()}
          accessibilityRole="button"
          accessibilityLabel="Close ping"
          style={{
            flex: 1,
            backgroundColor: "rgba(8,4,12,0.62)",
            justifyContent: "flex-start",
            paddingTop: 72,
            paddingHorizontal: 18,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation?.()}
            style={{
              borderRadius: 22,
              backgroundColor: "#120814",
              borderWidth: 1,
              borderColor: meta.color,
              padding: 18,
            }}
          >
            <Text
              style={{
                fontFamily: "SpaceMono",
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: meta.color,
              }}
            >
              {them} pinged you
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: LOVEBETZ_SCRIPT,
                fontSize: 34,
                lineHeight: 40,
                color: meta.color,
              }}
            >
              {meta.label}
            </Text>
            <Text style={{ marginTop: 8, color: "rgba(255,230,240,0.7)", fontSize: 14 }}>
              {meta.blurb}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily: "SpaceMono",
                fontSize: 12,
                color: "rgba(255,230,240,0.5)",
              }}
            >
              {when}
            </Text>
            <Pressable
              onPress={() => {
                void close();
                router.push("/hub/thought-pings" as Href);
              }}
              style={{
                marginTop: 16,
                height: 44,
                borderRadius: 14,
                backgroundColor: meta.color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#1A0810", fontWeight: "800" }}>Open Thought pings</Text>
            </Pressable>
            <Pressable
              onPress={() => void close()}
              hitSlop={8}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <Text style={{ color: "rgba(255,230,240,0.55)", fontSize: 13 }}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Click me. ${them} sent ${meta.label}`}
          hitSlop={10}
          style={{
            position: "absolute",
            left: 16,
            top: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 7,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: meta.color,
            maxWidth: 118,
          }}
        >
          <Ionicons name={meta.icon} size={14} color="#1A0810" />
          <Text
            style={{
              color: "#1A0810",
              fontSize: 12,
              fontWeight: "800",
            }}
            numberOfLines={1}
          >
            Click me
          </Text>
        </Pressable>
      )}
    </View>
  );
}
