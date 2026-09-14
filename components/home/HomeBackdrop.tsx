import {
  HOME_WALLPAPERS,
  loadHomeWallpaper,
  type HomeWallpaperId,
} from "@/lib/home-wallpaper";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode, useEffect, useState } from "react";
import { Image, View } from "react-native";

export function HomeBackdrop({
  children,
  wallpaperId,
}: {
  children: ReactNode;
  wallpaperId?: HomeWallpaperId;
}) {
  const [stored, setStored] = useState<HomeWallpaperId>("black");

  useEffect(() => {
    if (wallpaperId) return;
    let alive = true;
    void loadHomeWallpaper().then((id) => {
      if (alive) setStored(id);
    });
    return () => {
      alive = false;
    };
  }, [wallpaperId]);

  const paper = HOME_WALLPAPERS[wallpaperId ?? stored] ?? HOME_WALLPAPERS.black;

  return (
    <View style={{ flex: 1, backgroundColor: paper.color }}>
      {paper.gradient ? (
        <LinearGradient
          colors={paper.gradient}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />
      ) : null}
      {paper.source ? (
        <Image
          source={paper.source}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          resizeMode="cover"
        />
      ) : null}
      {paper.scrim !== "transparent" ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: paper.scrim,
          }}
        />
      ) : null}
      {children}
    </View>
  );
}
