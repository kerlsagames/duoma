import { pokeReady, latestPokeAt } from "@/lib/partner-poke";
import { useApp } from "@/lib/store";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function PokeThem({
  appId,
  targetId,
  color = "rgba(244,244,246,0.72)",
}: {
  appId: string;
  targetId: string;
  color?: string;
}) {
  const { user, partnerPokes, pokePartner } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAt = user
    ? latestPokeAt(partnerPokes ?? [], {
        fromUserId: user.id,
        appId,
        targetId,
      })
    : null;
  const state = pokeReady(lastAt);

  const fill = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)
    ? `${color}22`
    : "rgba(255,255,255,0.1)";

  const send = async () => {
    if (!state.ready || busy) return;
    setError(null);
    setBusy(true);
    try {
      await pokePartner(appId, targetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not poke.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginTop: 12, alignItems: "center", width: "100%" }}>
      <Pressable
        onPress={() => void send()}
        disabled={!state.ready || busy}
        accessibilityRole="button"
        accessibilityLabel={state.label}
        hitSlop={8}
        style={{
          minWidth: 160,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 999,
          borderWidth: 1.5,
          borderColor: color,
          backgroundColor: state.ready ? fill : "transparent",
          opacity: !state.ready || busy ? 0.7 : 1,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color,
            fontSize: 16,
            fontWeight: "800",
            letterSpacing: 0.3,
          }}
        >
          {busy ? "Poking…" : state.label}
        </Text>
      </Pressable>
      {error ? (
        <Text style={{ marginTop: 6, color, fontSize: 13, opacity: 0.8 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
