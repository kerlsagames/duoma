import { Stage } from "@/components/hub/Stage";
import { Screen } from "@/components/ui/Screen";
import { HANDWRITING, SERIF } from "@/lib/app-themes";
import { createId, nowIso } from "@/lib/ids";
import { useMiniApps } from "@/lib/mini-apps";
import { PHOTO_PROMPTS, POLAROID_TINTS } from "@/lib/mini-content";
import { useApp } from "@/lib/store";
import type { Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const BG = "#1A0A0A";
const RED = "#C23B3B";
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
      setError("Write on the back. That’s the whole point.");
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
      <Stage background={BG} fallback={"/hub/play" as Href} accent={RED}>
        <Text
          style={{
            textAlign: "center",
            color: RED,
            fontFamily: "SpaceMono",
            fontSize: 11,
            letterSpacing: 3,
          }}
        >
          DARKROOM · SAFE LIGHT ON
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 34,
            color: "#F6D6D6",
          }}
        >
          Clothesline
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: HANDWRITING,
            fontSize: 20,
            color: "rgba(246,214,214,0.65)",
          }}
        >
          this week: {week.label}
        </Text>

        <View style={{ marginTop: 16 }}>
          <View style={{ height: 2, backgroundColor: "#C4A484", marginBottom: -8 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {["│", "│", "│", "│"].map((pin, i) => (
              <Text key={i} style={{ color: "#C4A484", fontSize: 18 }}>
                {pin}
              </Text>
            ))}
          </View>
        </View>

        <View
          style={{
            alignSelf: "center",
            width: 250,
            backgroundColor: "#F6EFE2",
            padding: 12,
            paddingBottom: 40,
            transform: [{ rotate: "-3deg" }],
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 12,
          }}
        >
          <View
            style={{
              height: 170,
              backgroundColor: tint,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 48 }}>{sticker}</Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: SERIF,
                color: "#3A2A18",
                textAlign: "center",
                paddingHorizontal: 10,
              }}
            >
              {prompt.label}
            </Text>
          </View>
          <Text style={{ marginTop: 10, fontFamily: HANDWRITING, fontSize: 18, color: "#3A2A18" }}>
            {caption || "write on the back…"}
          </Text>
        </View>

        <View style={{ marginTop: 18, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {PHOTO_PROMPTS.map((row) => (
            <Pressable key={row.id} onPress={() => setPromptId(row.id)}>
              <Text
                style={{
                  color: promptId === row.id ? "#F6EFE2" : "rgba(246,214,214,0.4)",
                  fontSize: 12,
                }}
              >
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
                width: 26,
                height: 26,
                backgroundColor: color,
                borderWidth: tint === color ? 2 : 0,
                borderColor: "#fff",
              }}
            />
          ))}
        </View>
        <View style={{ marginTop: 8, flexDirection: "row", gap: 10 }}>
          {STICKERS.map((s) => (
            <Pressable key={s} onPress={() => setSticker(s)}>
              <Text style={{ fontSize: 22, opacity: sticker === s ? 1 : 0.35 }}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="the sentence on the back"
          placeholderTextColor="rgba(246,214,214,0.3)"
          style={{
            marginTop: 12,
            borderBottomWidth: 1,
            borderBottomColor: RED,
            color: "#F6D6D6",
            fontFamily: HANDWRITING,
            fontSize: 20,
            paddingVertical: 8,
          }}
        />
        <Pressable
          onPress={() => void add()}
          style={{
            marginTop: 12,
            height: 48,
            backgroundColor: RED,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#F6EFE2", fontWeight: "800" }}>Peg it to the line</Text>
        </Pressable>
        {error ? <Text style={{ marginTop: 8, color: "#FFB4B4" }}>{error}</Text> : null}

        <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {!ready || data.photos.length === 0 ? (
            <Text style={{ color: "rgba(246,214,214,0.4)", fontFamily: SERIF }}>
              The line is empty. First print is always a little crooked.
            </Text>
          ) : (
            data.photos.map((photo, i) => (
              <View
                key={photo.id}
                style={{
                  width: "46%",
                  backgroundColor: "#F6EFE2",
                  padding: 8,
                  paddingBottom: 22,
                  transform: [{ rotate: i % 2 ? "2deg" : "-2deg" }],
                }}
              >
                <View
                  style={{
                    height: 80,
                    backgroundColor: photo.tint,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{photo.sticker}</Text>
                </View>
                <Text
                  style={{ marginTop: 6, fontFamily: HANDWRITING, color: "#3A2A18", fontSize: 14 }}
                  numberOfLines={3}
                >
                  {photo.caption}
                </Text>
              </View>
            ))
          )}
        </View>
      </Stage>
    </Screen>
  );
}
