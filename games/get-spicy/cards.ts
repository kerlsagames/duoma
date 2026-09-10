import preForeplay from "./cards/pre-foreplay.json";
import foreplay from "./cards/foreplay.json";
import stepItUp from "./cards/step-it-up.json";
import finishOff from "./cards/finish-off.json";
import type { Card, DefaultCardSeed } from "@/lib/types";
import { createId, nowIso } from "@/lib/ids";

export const GET_SPICY_SEEDS = [
  ...(preForeplay as DefaultCardSeed[]),
  ...(foreplay as DefaultCardSeed[]),
  ...(stepItUp as DefaultCardSeed[]),
  ...(finishOff as DefaultCardSeed[]),
];

export function cloneDefaultDeck(coupleId: string, createdBy: string): Card[] {
  const createdAt = nowIso();
  return GET_SPICY_SEEDS.map((seed) => ({
    id: createId(),
    coupleId,
    stage: seed.category,
    title: seed.title,
    body: seed.description,
    isDefault: true,
    isActive: true,
    sortOrder: seed.order,
    createdBy,
    createdAt,
  }));
}
