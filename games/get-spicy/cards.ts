import preForeplay from "./cards/pre-foreplay.json";
import preForeplay2 from "./cards/pre-foreplay-2.json";
import foreplay from "./cards/foreplay.json";
import foreplay2 from "./cards/foreplay-2.json";
import stepItUp from "./cards/step-it-up.json";
import stepItUp2 from "./cards/step-it-up-2.json";
import finishOff from "./cards/finish-off.json";
import finishOff2 from "./cards/finish-off-2.json";
import afterglow from "./cards/afterglow.json";
import type { Card, DefaultCardSeed } from "@/lib/types";
import { createId, nowIso } from "@/lib/ids";

export const GET_SPICY_SEEDS = [
  ...(preForeplay as DefaultCardSeed[]),
  ...(preForeplay2 as DefaultCardSeed[]),
  ...(foreplay as DefaultCardSeed[]),
  ...(foreplay2 as DefaultCardSeed[]),
  ...(stepItUp as DefaultCardSeed[]),
  ...(stepItUp2 as DefaultCardSeed[]),
  ...(finishOff as DefaultCardSeed[]),
  ...(finishOff2 as DefaultCardSeed[]),
  ...(afterglow as DefaultCardSeed[]),
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
