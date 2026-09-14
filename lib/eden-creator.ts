import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  emptyEdenCreator,
  type EdenCreator,
  type EdenPhase,
  type EdenStageId,
} from "@/lib/eden";

const KEY = "duoma:edenCreator:v1";

const STAGES: EdenStageId[] = [
  "live",
  "hearth",
  "meadow",
  "canopy",
  "crimson",
  "lagoon",
  "full",
];
const PHASES: Array<EdenPhase | "auto"> = ["auto", "dawn", "day", "golden", "night"];
const SLEEP = ["auto", "awake", "sleep"] as const;

export function hydrateEdenCreator(raw: unknown): EdenCreator {
  const base = emptyEdenCreator();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<EdenCreator>;
  return {
    enabled: Boolean(row.enabled),
    stage: STAGES.includes(row.stage as EdenStageId) ? (row.stage as EdenStageId) : "live",
    phase: PHASES.includes(row.phase as EdenPhase | "auto")
      ? (row.phase as EdenPhase | "auto")
      : "auto",
    dormancy: SLEEP.includes(row.dormancy as (typeof SLEEP)[number])
      ? (row.dormancy as EdenCreator["dormancy"])
      : "auto",
  };
}

export async function loadEdenCreator(): Promise<EdenCreator> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? hydrateEdenCreator(JSON.parse(raw)) : emptyEdenCreator();
  } catch {
    return emptyEdenCreator();
  }
}

export async function saveEdenCreator(next: EdenCreator): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
