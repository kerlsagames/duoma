import type { GameModule } from "@/lib/types";

export const getSpicyGame: GameModule = {
  key: "get-spicy",
  title: "Get Spicy",
  tagline: "Five stages. One night. Cards you play together.",
  available: true,
};

export { cloneDefaultDeck, GET_SPICY_SEEDS } from "./cards";
export {
  STAGE_META,
  STAGE_ORDER,
  DEFAULT_STAGE_COUNTS,
  buildRandomDeck,
  replacementCard,
  totalCards,
  normalizeStageCounts,
} from "./engine";
