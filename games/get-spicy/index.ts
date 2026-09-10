import type { GameModule } from "@/lib/types";

export const getSpicyGame: GameModule = {
  key: "get-spicy",
  title: "The Spicy Game",
  tagline: "A whole day leading to a steamy conclusion.",
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
export {
  SPICY_FLAVOR_TAGS,
  ALL_FLAVOR_TAG_IDS,
  flavorTagsForStage,
  defaultEnabledFlavorTags,
  normalizeFlavorTags,
  cardAllowedByFlavorTags,
  summarizeFlavorSelection,
} from "./flavor-tags";
