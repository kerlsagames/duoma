import { JAR_TONE, SERIF } from "@/lib/app-themes";
import { jarFillRatio } from "@/lib/jarNotes";
import { useMemo } from "react";
import { Text, View } from "react-native";

const T = JAR_TONE;

type PaperSpec = {
  id: string;
  left: `${number}%`;
  bottom: number;
  width: number;
  height: number;
  rotate: string;
  color: string;
  fold: boolean;
};

function paperLayout(count: number): PaperSpec[] {
  const colors = [T.paper, T.paperAlt, T.paperDeep, "#EFE0B8", "#E2CFA0"];
  const slots: Omit<PaperSpec, "id" | "color">[] = [
    { left: "18%", bottom: 10, width: 54, height: 28, rotate: "-18deg", fold: true },
    { left: "48%", bottom: 8, width: 48, height: 26, rotate: "12deg", fold: false },
    { left: "28%", bottom: 28, width: 52, height: 24, rotate: "8deg", fold: true },
    { left: "55%", bottom: 30, width: 46, height: 22, rotate: "-22deg", fold: false },
    { left: "14%", bottom: 46, width: 50, height: 24, rotate: "16deg", fold: true },
    { left: "42%", bottom: 50, width: 56, height: 26, rotate: "-8deg", fold: false },
    { left: "60%", bottom: 58, width: 44, height: 22, rotate: "20deg", fold: true },
    { left: "22%", bottom: 68, width: 48, height: 24, rotate: "-14deg", fold: false },
    { left: "50%", bottom: 74, width: 50, height: 24, rotate: "6deg", fold: true },
    { left: "34%", bottom: 90, width: 46, height: 22, rotate: "-20deg", fold: false },
    { left: "16%", bottom: 102, width: 52, height: 24, rotate: "10deg", fold: true },
    { left: "52%", bottom: 108, width: 48, height: 22, rotate: "-6deg", fold: false },
  ];
  const visible = Math.min(count, slots.length);
  return slots.slice(0, visible).map((slot, index) => ({
    ...slot,
    id: `paper-${index}`,
    color: colors[index % colors.length],
  }));
}

export function AppreciationJar({ sealedCount }: { sealedCount: number }) {
  const fill = jarFillRatio(sealedCount);
  const papers = useMemo(() => paperLayout(sealedCount), [sealedCount]);
  const fillHeight = 36 + fill * 150;

  return (
    <View style={{ alignItems: "center", paddingVertical: 8 }}>
      <View
        style={{
          width: 92,
          height: 22,
          borderRadius: 8,
          backgroundColor: T.cork,
          borderWidth: 1,
          borderColor: T.corkLight,
          zIndex: 4,
        }}
      />
      <View
        style={{
          width: 78,
          height: 14,
          marginTop: -2,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          backgroundColor: T.corkLight,
          zIndex: 3,
        }}
      />

      <View
        style={{
          width: 70,
          height: 36,
          marginTop: -2,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderColor: T.glassBorder,
          backgroundColor: T.glass,
          zIndex: 2,
        }}
      />

      <View
        style={{
          width: 220,
          height: 260,
          marginTop: -4,
          borderRadius: 36,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderWidth: 2.5,
          borderColor: T.glassBorder,
          backgroundColor: "rgba(140, 170, 160, 0.1)",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 14,
            width: 18,
            height: 150,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />

        <View
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 8,
            height: fillHeight,
            borderRadius: 28,
            backgroundColor:
              fill > 0.55
                ? "rgba(212,163,90,0.22)"
                : fill > 0.2
                  ? "rgba(212,163,90,0.12)"
                  : "transparent",
          }}
        />

        {papers.map((paper) => (
          <View
            key={paper.id}
            style={{
              position: "absolute",
              left: paper.left,
              bottom: paper.bottom,
              width: paper.width,
              height: paper.height,
              borderRadius: paper.fold ? 4 : 3,
              backgroundColor: paper.color,
              transform: [{ rotate: paper.rotate }],
              borderWidth: 1,
              borderColor: "rgba(120,90,40,0.18)",
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            {paper.fold ? (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: paper.width * 0.38,
                  height: paper.height,
                  backgroundColor: "rgba(90,60,20,0.12)",
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }}
              />
            ) : (
              <View
                style={{
                  marginTop: 6,
                  marginHorizontal: 6,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: "rgba(120,90,40,0.2)",
                }}
              />
            )}
          </View>
        ))}

        {sealedCount === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 22,
                color: "rgba(246,239,226,0.45)",
              }}
            >
              Empty for now. Drop the first note.
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={{
          width: 200,
          height: 14,
          marginTop: -6,
          borderRadius: 10,
          backgroundColor: "rgba(168,196,188,0.18)",
          borderWidth: 1,
          borderColor: T.glassBorder,
        }}
      />

      <Text
        style={{
          marginTop: 14,
          fontFamily: "SpaceMono",
          fontSize: 11,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: T.accent,
        }}
      >
        {sealedCount === 0
          ? "Jar empty"
          : sealedCount === 1
            ? "1 sealed note"
            : `${sealedCount} sealed notes`}
      </Text>
    </View>
  );
}
