import { EmptyHint, MiniChrome } from "@/components/hub/MiniChrome";
import { Screen } from "@/components/ui/Screen";
import { SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { PHOTO_PROMPTS, POLAROID_TINTS } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#120E0A";
const AMBER = "#E4C37A";
const STICKERS = ["✦", "♡", "☼", "♪", "❀", "✓"];

export default function PhotoChallengesScreen() {
  const { user } = useApp();
  const { data, ready, patch } = useMiniApps();
  const week = useMemo(() => {
    const i = Math.floor(Date.now() / 86400000 / 7) % PHOTO_PROMPTS.length;
    return PHOTO_PROMPTS[i]!;
  }, []);
  const [promptId, setPromptId] = useState(week.id);
  const [caption, setCaption] = useState("");
  const [tint, setTint] = useState(POLAROID_TINTS[0]!);
  const [sticker, setSticker] = useState(STICKERS[0]!);
  const [error, setError] = useState<string | null>(null);
  const prompt = PHOTO_PROMPTS.find((row) => row.id === promptId) ?? week;

  const add = async () => {
    if (!user) return;
    if (!caption.trim()) {
      setError("A polaroid still needs a sentence.");
      return;
    }
    setError(null);
    await patch((state) => ({
      ...state,
      photos: [
        {
          id: createId(),
          userId: user.id,
          promptId,
          caption: caption.trim(),
          tint,
          sticker,
          createdAt: nowIso(),
        },
        ...state.photos,
      ],
    }));
    setCaption("");
  };

  return (
    <Screen scroll background={BG}>
      <MiniChrome
        accent={AMBER}
        fallback={"/hub/play" as Href}
        kicker="Fun · darkroom"
        title="Memory polaroids"
        body="Weekly prompts. No camera required — describe the frame like you're writing on the back of a photo."
        ready={ready}
      >
        <View
          style={{
            marginTop: 18,
            alignSelf: "center",
            width: 260,
            backgroundColor: "#F6EFE2",
            padding: 12,
            paddingBottom: 36,
            transform: [{ rotate: "-2deg" }],
          }}
        >
          <View style={{ height: 180, backgroundColor: tint, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 42 }}>{sticker}</Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                color: "#3A2A18",
                fontSize: 16,
                textAlign: "center",
                paddingHorizontal: 12,
              }}
            >
              {prompt.label}
            </Text>
          </View>
          <Text
            style={{
              marginTop: 10,
              fontFamily: SERIF,
              color: "#3A2A18",
              fontSize: 14,
            }}
          >
            {caption || "this week’s frame…"}
          </Text>
        </View>

        <Text style={{ marginTop: 20, color: AMBER, fontFamily: "SpaceMono", fontSize: 11 }}>
          THIS WEEK · {week.label.toUpperCase()}
        </Text>
        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PHOTO_PROMPTS.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => setPromptId(row.id)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: promptId === row.id ? `${AMBER}33` : "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: promptId === row.id ? AMBER : "#F4F4F6", fontSize: 12 }}>
                {row.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
          {POLAROID_TINTS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setTint(color)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: color,
                borderWidth: tint === color ? 2 : 0,
                borderColor: "#fff",
              }}
            />
          ))}
        </View>
        <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
          {STICKERS.map((s) => (
            <Pressable key={s} onPress={() => setSticker(s)}>
              <Text style={{ fontSize: 22, opacity: sticker === s ? 1 : 0.4 }}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Write on the back of the photo"
          placeholderTextColor="rgba(244,244,246,0.3)"
          style={{
            marginTop: 12,
            borderRadius: 14,
            padding: 12,
            backgroundColor: "#1C160F",
            color: "#F4F4F6",
          }}
        />
        <Pressable
          onPress={() => void add()}
          style={{
            marginTop: 10,
            height: 48,
            borderRadius: 14,
            backgroundColor: AMBER,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A1408", fontWeight: "800" }}>Pin it to the wall</Text>
        </Pressable>
        {error ? <Text style={{ marginTop: 8, color: "#FF8A8A" }}>{error}</Text> : null}

        {data.photos.length === 0 ? (
          <EmptyHint text="The wall is empty. First polaroid is always a little crooked. That's correct." />
        ) : (
          <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {data.photos.map((photo, i) => {
              const p = PHOTO_PROMPTS.find((row) => row.id === photo.promptId);
              return (
                <View
                  key={photo.id}
                  style={{
                    width: "47%",
                    backgroundColor: "#F6EFE2",
                    padding: 8,
                    paddingBottom: 20,
                    transform: [{ rotate: i % 2 === 0 ? "1.5deg" : "-2deg" }],
                  }}
                >
                  <View
                    style={{
                      height: 90,
                      backgroundColor: photo.tint,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{photo.sticker}</Text>
                  </View>
                  <Text
                    style={{ marginTop: 6, color: "#3A2A18", fontSize: 11, fontFamily: SERIF }}
                    numberOfLines={3}
                  >
                    {photo.caption}
                  </Text>
                  <Text style={{ color: "rgba(58,42,24,0.5)", fontSize: 10 }}>{p?.label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </MiniChrome>
    </Screen>
  );
}
