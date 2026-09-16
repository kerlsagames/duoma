import preForeplay from "./cards/pre-foreplay.json";
import preForeplay2 from "./cards/pre-foreplay-2.json";
import preForeplay3 from "./cards/pre-foreplay-3.json";
import preForeplay4 from "./cards/pre-foreplay-4.json";
import foreplay from "./cards/foreplay.json";
import foreplay2 from "./cards/foreplay-2.json";
import foreplay3 from "./cards/foreplay-3.json";
import foreplay4 from "./cards/foreplay-4.json";
import stepItUp from "./cards/step-it-up.json";
import stepItUp2 from "./cards/step-it-up-2.json";
import stepItUp3 from "./cards/step-it-up-3.json";
import stepItUp4 from "./cards/step-it-up-4.json";
import finishOff from "./cards/finish-off.json";
import finishOff2 from "./cards/finish-off-2.json";
import finishOff3 from "./cards/finish-off-3.json";
import finishOff4 from "./cards/finish-off-4.json";
import afterglow from "./cards/afterglow.json";
import afterglow2 from "./cards/afterglow-2.json";
import afterglow3 from "./cards/afterglow-3.json";
import { applyOverlay } from "@/lib/catalog-overlay";
import type { Card, DefaultCardSeed } from "@/lib/types";
import { createId, nowIso } from "@/lib/ids";
import { climaxHintForCard } from "@/games/get-spicy/finish-climax";

export const GET_SPICY_SEEDS = [
  ...(preForeplay as DefaultCardSeed[]),
  ...(preForeplay2 as DefaultCardSeed[]),
  ...(preForeplay3 as DefaultCardSeed[]),
  ...(preForeplay4 as DefaultCardSeed[]),
  ...(foreplay as DefaultCardSeed[]),
  ...(foreplay2 as DefaultCardSeed[]),
  ...(foreplay3 as DefaultCardSeed[]),
  ...(foreplay4 as DefaultCardSeed[]),
  ...(stepItUp as DefaultCardSeed[]),
  ...(stepItUp2 as DefaultCardSeed[]),
  ...(stepItUp3 as DefaultCardSeed[]),
  ...(stepItUp4 as DefaultCardSeed[]),
  ...(finishOff as DefaultCardSeed[]),
  ...(finishOff2 as DefaultCardSeed[]),
  ...(finishOff3 as DefaultCardSeed[]),
  ...(finishOff4 as DefaultCardSeed[]),
  ...(afterglow as DefaultCardSeed[]),
  ...(afterglow2 as DefaultCardSeed[]),
  ...(afterglow3 as DefaultCardSeed[]),
].map((seed, index) => ({
  ...seed,
  id: `gs-${seed.category}-${seed.order}-${index}`,
}));

type SpicySeed = DefaultCardSeed & { id: string };

export function getSpicySeeds(includeHidden = false): SpicySeed[] {
  return applyOverlay(
    "spicySeeds",
    GET_SPICY_SEEDS as SpicySeed[],
    (row, edit) => ({
      ...row,
      title: edit.title?.trim() || row.title,
      description: edit.body?.trim() || row.description,
      category: (edit.group as DefaultCardSeed["category"]) || row.category,
    }),
    (row) => ({
      id: row.id,
      category: (row.group as DefaultCardSeed["category"]) || "foreplay",
      title: row.title.trim() || "Untitled",
      description: row.body.trim() || row.title,
      order: 9000,
    }),
    includeHidden
  );
}

export function cloneDefaultDeck(coupleId: string, createdBy: string): Card[] {
  const createdAt = nowIso();
  return getSpicySeeds().map((seed) => ({
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
    climax:
      seed.climax ??
      (seed.category === "finish_off"
        ? climaxHintForCard({ title: seed.title, body: seed.description })
        : undefined),
  }));
}
