import { getSpicyGame } from "@/games/get-spicy";
import { letsTalkGame } from "@/games/lets-talk";
import type { GameModule } from "@/lib/types";

export const GAME_REGISTRY: GameModule[] = [getSpicyGame, letsTalkGame];

export function getGame(key: string): GameModule | undefined {
  return GAME_REGISTRY.find((game) => game.key === key);
}
