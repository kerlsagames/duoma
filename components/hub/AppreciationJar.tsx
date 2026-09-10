import { JAR_TONE, SERIF } from "@/lib/app-themes";
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
  // Compact stack for the shorter jar body.
  const slots: Omit<PaperSpec, "id" | "color">[] = [
    { left: "16%", bottom: 10, width: 58, height: 28, rotate: "-18deg", fold: true },
    { left: "48%", bottom: 8, width: 52, height: 26, rotate: "12deg", fold: false },
    { left: "26%", bottom: 30, width: 56, height: 26, rotate: "8deg", fold: true },
    { left: "54%", bottom: 34, width: 50, height: 24, rotate: "-22deg", fold: false },
    { left: "12%", bottom: 50, width: 54, height: 26, rotate: "16deg", fold: true },
    { left: "40%", bottom: 54, width: 60, height: 28, rotate: "-8deg", fold: false },
    { left: "58%", bottom: 68, width: 46, height: 24, rotate: "20deg", fold: true },
    { left: "20%", bottom: 78, width: 52, height: 26, rotate: "-14deg", fold: false },
    { left: "48%", bottom: 88, width: 54, height: 26, rotate: "6deg", fold: true },
    { left: "32%", bottom: 104, width: 50, height: 24, rotate: "-20deg", fold: false },
    { left: "14%", bottom: 118, width: 56, height: 26, rotate: "10deg", fold: true },
    { left: "50%", bottom: 126, width: 52, height: 24, rotate: "-6deg", fold: false },
  ];
  const visible = Math.min(count, slots.length);
  return slots.slice(0, visible).map((slot, index) => ({
    ...slot,
    id: `paper-${index}`,
    color: colors[index % colors.length],
  }));
}

/** Mason jar — glass stays the same as notes pile in; only the papers change. */
export function AppreciationJar({ sealedCount }: { sealedCount: number }) {
  const papers = useMemo(() => paperLayout(sealedCount), [sealedCount]);

  return (
    <View style={{ alignItems: "center", paddingVertical: 2 }}>
      <View
        style={{
          width: 92,
          height: 20,
          borderRadius: 8,
          backgroundColor: T.cork,
          borderWidth: 1,
          borderColor: T.corkLight,
          zIndex: 4,
        }}
      />
      <View
        style={{
          width: 76,
          height: 12,
          marginTop: -2,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          backgroundColor: T.corkLight,
          zIndex: 3,
        }}
      />

      <View
        style={{
          width: 68,
          height: 28,
          marginTop: -2,
          borderLeftWidth: 2.5,
          borderRightWidth: 2.5,
          borderColor: T.glassBorder,
          backgroundColor: T.glass,
          zIndex: 2,
        }}
      />

      <View
        style={{
          width: 220,
          height: 210,
          marginTop: -4,
          borderRadius: 36,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          borderWidth: 2.5,
          borderColor: T.glassBorder,
          backgroundColor: T.glass,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 14,
            height: 110,
            borderRadius: 10,
            backgroundColor: "rgba(255,245,230,0.06)",
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
                  marginTop: 5,
                  marginHorizontal: 5,
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
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: SERIF,
                fontSize: 14,
                lineHeight: 20,
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
          width: 196,
          height: 12,
          marginTop: -5,
          borderRadius: 10,
          backgroundColor: "rgba(255,245,230,0.06)",
          borderWidth: 1,
          borderColor: T.glassBorder,
        }}
      />

      <Text
        style={{
          marginTop: 8,
          fontFamily: "SpaceMono",
          fontSize: 10,
          letterSpacing: 1.3,
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
