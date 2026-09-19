import type { GameSession } from "@/lib/types";

export function spicyGameStampMs(game: GameSession): number {
  return Date.parse(game.updatedAt || game.completedAt || game.createdAt) || 0;
}

export function spicyGameStarted(game: GameSession): boolean {
  if (game.status === "rating") return true;
  return Boolean(
    game.currentStage ||
      game.activeCardId ||
      (Array.isArray(game.handCardIds) && game.handCardIds.length > 0)
  );
}

/** Setup leftovers stay reusable. Mid-game only counts if they actually dealt. */
export function isLiveSpicyGame(game: GameSession, now = Date.now()): boolean {
  if (["cancelled", "declined", "completed"].includes(game.status)) return false;
  if (game.status === "setup" || game.status === "inviting") return true;
  if (!spicyGameStarted(game)) return false;
  const age = now - spicyGameStampMs(game);
  if (game.status === "rating") return age < 36 * 60 * 60 * 1000;
  return age < 12 * 60 * 60 * 1000;
}
