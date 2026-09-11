import type { Roleplay } from "@/lib/roleplays";
import { Image, type ImageSourcePropType, View } from "react-native";

/** Static map so Metro can bundle every scenario illustration. */
const IMAGES: Record<string, ImageSourcePropType> = {
  "guilt-free-solo": require("../../assets/images/roleplays/guilt-free-solo.png"),
  "quiet-reading": require("../../assets/images/roleplays/quiet-reading.png"),
  "hobby-sprint": require("../../assets/images/roleplays/hobby-sprint.png"),
  "hot-shower-lockout": require("../../assets/images/roleplays/hot-shower-lockout.png"),
  "solo-drive-coffee": require("../../assets/images/roleplays/solo-drive-coffee.png"),
  "sleep-in": require("../../assets/images/roleplays/sleep-in.png"),
  "digital-fast": require("../../assets/images/roleplays/digital-fast.png"),
  "hammock-reset": require("../../assets/images/roleplays/hammock-reset.png"),
  "zero-decibel": require("../../assets/images/roleplays/zero-decibel.png"),
  "early-night": require("../../assets/images/roleplays/early-night.png"),
  "arcade-night": require("../../assets/images/roleplays/arcade-night.png"),
  "childhood-snacks": require("../../assets/images/roleplays/childhood-snacks.png"),
  "retro-movie": require("../../assets/images/roleplays/retro-movie.png"),
  "gaming-buddy": require("../../assets/images/roleplays/gaming-buddy.png"),
  "lego-puzzle": require("../../assets/images/roleplays/lego-puzzle.png"),
  "ice-cream-run": require("../../assets/images/roleplays/ice-cream-run.png"),
  "show-and-tell": require("../../assets/images/roleplays/show-and-tell.png"),
  "mini-golf-trivia": require("../../assets/images/roleplays/mini-golf-trivia.png"),
  "comfort-food": require("../../assets/images/roleplays/comfort-food.png"),
  "board-game-rematch": require("../../assets/images/roleplays/board-game-rematch.png"),
  "venting-vault": require("../../assets/images/roleplays/venting-vault.png"),
  "emergency-hug": require("../../assets/images/roleplays/emergency-hug.png"),
  "decision-free": require("../../assets/images/roleplays/decision-free.png"),
  "head-massage": require("../../assets/images/roleplays/head-massage.png"),
  "comfort-item": require("../../assets/images/roleplays/comfort-item.png"),
  "brainstorm": require("../../assets/images/roleplays/brainstorm.png"),
  "peace-quiet": require("../../assets/images/roleplays/peace-quiet.png"),
  "no-questions": require("../../assets/images/roleplays/no-questions.png"),
  "heavy-lifting": require("../../assets/images/roleplays/heavy-lifting.png"),
  "tea-cocoa": require("../../assets/images/roleplays/tea-cocoa.png"),
  "rp-hidden-notes": require("../../assets/images/roleplays/rp-hidden-notes.png"),
  "rp-surprise-treat": require("../../assets/images/roleplays/rp-surprise-treat.png"),
  "rp-playlist": require("../../assets/images/roleplays/rp-playlist.png"),
  "rp-morning-coffee": require("../../assets/images/roleplays/rp-morning-coffee.png"),
  "rp-gas-fill": require("../../assets/images/roleplays/rp-gas-fill.png"),
  "rp-desk-tidy": require("../../assets/images/roleplays/rp-desk-tidy.png"),
  "rp-fresh-sheets": require("../../assets/images/roleplays/rp-fresh-sheets.png"),
  "rp-snack-drop": require("../../assets/images/roleplays/rp-snack-drop.png"),
  "rp-midday-text": require("../../assets/images/roleplays/rp-midday-text.png"),
  "rp-flowers": require("../../assets/images/roleplays/rp-flowers.png"),
  "rp-deep-dive": require("../../assets/images/roleplays/rp-deep-dive.png"),
  "rp-sunset": require("../../assets/images/roleplays/rp-sunset.png"),
  "rp-dream-plan": require("../../assets/images/roleplays/rp-dream-plan.png"),
  "rp-porch-sit": require("../../assets/images/roleplays/rp-porch-sit.png"),
  "rp-gratitude": require("../../assets/images/roleplays/rp-gratitude.png"),
  "rp-memory-drive": require("../../assets/images/roleplays/rp-memory-drive.png"),
  "rp-podcast": require("../../assets/images/roleplays/rp-podcast.png"),
  "rp-cook-together": require("../../assets/images/roleplays/rp-cook-together.png"),
  "rp-stargaze": require("../../assets/images/roleplays/rp-stargaze.png"),
  "rp-photo-album": require("../../assets/images/roleplays/rp-photo-album.png"),
};

export function RoleplayArt({
  roleplay,
  size = 260,
}: {
  roleplay: Roleplay;
  size?: number;
}) {
  const source = IMAGES[roleplay.image];
  return (
    <View
      style={{
        width: size,
        height: size,
        alignSelf: "center",
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#0A1614",
      }}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="cover"
          accessibilityLabel={roleplay.name}
        />
      ) : null}
    </View>
  );
}
