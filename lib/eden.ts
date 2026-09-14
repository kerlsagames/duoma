import { localDateKey } from "@/lib/dates";

export type EdenEssence = "connection" | "action" | "desire" | "harmony";

export type EdenPhase = "dawn" | "day" | "golden" | "night";

export type EdenInputs = {
  pings: { createdAt: string }[];
  audioNotes: { createdAt: string }[];
  jarNotes: { createdAt: string }[];
  curiosityAnswers: { createdAt: string }[];
  talkDraws: { answeredAt: string | null; createdAt: string }[];
  whiteFlags: { createdAt: string }[];
  checkIns: { createdAt: string }[];
  photos: { createdAt: string; imageData: string | null }[];
  nights: { completedAt: string | null; createdAt: string }[];
  dares: { status: string; createdAt: string }[];
  positions: { status: string; completedAt: string | null; createdAt?: string }[];
  roleplays: { status: string; completedAt: string | null; createdAt?: string }[];
  fantasySwipes: { liked: boolean; userId: string; fantasyId: string; createdAt: string }[];
  dateEvents: { createdAt: string }[];
};

export type EdenEssenceRow = {
  id: EdenEssence;
  label: string;
  detail: string;
  count: number;
  ep: number;
};

export type EdenSnapshot = {
  level: number;
  totalEP: number;
  epIntoLevel: number;
  epForNext: number;
  progress: number;
  dormancy: boolean;
  hoursSince: number;
  phase: EdenPhase;
  biomes: {
    hearth: true;
    meadow: boolean;
    canopy: boolean;
    crimson: boolean;
    lagoon: boolean;
  };
  essences: EdenEssenceRow[];
  visuals: {
    shootingStars: number;
    echoBlossoms: number;
    pebbles: number;
    vineBlooms: number;
    frames: string[];
    emberLilies: number;
    fireflies: number;
    runes: number;
    pavilion: boolean;
    gazebo: boolean;
    rainbow: boolean;
  };
  lastAt: string | null;
};

const DORMANCY_HOURS = 96;

export const EDEN_ACTIONS = {
  ping: 6,
  voice: 18,
  jar: 14,
  curiosity: 12,
  talk: 12,
  apology: 22,
  checkIn: 10,
  photo: 24,
  date: 28,
  spicy: 20,
  dare: 16,
  fantasy: 16,
  position: 14,
  roleplay: 30,
} as const;

export function epForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(100 * level ** 1.8);
}

export function levelFromEP(totalEP: number): {
  level: number;
  epIntoLevel: number;
  epForNext: number;
  progress: number;
} {
  let level = 1;
  while (level < 100 && totalEP >= epForLevel(level + 1)) level += 1;
  const floor = epForLevel(level);
  const next = epForLevel(Math.min(100, level + 1));
  const span = Math.max(1, next - floor);
  const into = Math.max(0, totalEP - floor);
  return {
    level,
    epIntoLevel: into,
    epForNext: next,
    progress: level >= 100 ? 1 : Math.min(1, into / span),
  };
}

export function dayPhase(date = new Date()): EdenPhase {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 5.5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 19.5) return "golden";
  return "night";
}

export function fantasyMatchCount(
  swipes: { liked: boolean; userId: string; fantasyId: string }[]
): number {
  const yes = new Map<string, Set<string>>();
  for (const row of swipes) {
    if (!row.liked) continue;
    const set = yes.get(row.fantasyId) ?? new Set<string>();
    set.add(row.userId);
    yes.set(row.fantasyId, set);
  }
  let count = 0;
  yes.forEach((set) => {
    if (set.size >= 2) count += 1;
  });
  return count;
}

function latest(times: (string | null | undefined)[]): string | null {
  const valid = times.filter((row): row is string => Boolean(row)).sort();
  return valid[valid.length - 1] ?? null;
}

export function buildEdenSnapshot(input: EdenInputs, now = new Date()): EdenSnapshot {
  const talks = input.talkDraws.filter((row) => row.answeredAt);
  const nights = input.nights.filter((row) => row.completedAt);
  const dares = input.dares.filter((row) => row.status === "done" || row.status === "accepted");
  const positions = input.positions.filter(
    (row) => row.status === "done" || Boolean(row.completedAt)
  );
  const roleplays = input.roleplays.filter(
    (row) => row.status === "done" || Boolean(row.completedAt)
  );
  const matches = fantasyMatchCount(input.fantasySwipes);
  const photos = input.photos.filter((row) => row.imageData);

  const connectionCount =
    input.pings.length +
    input.audioNotes.length +
    input.jarNotes.length +
    input.curiosityAnswers.length +
    talks.length;
  const actionCount = photos.length + input.dateEvents.length;
  const desireCount = nights.length + dares.length + matches + positions.length + roleplays.length;
  const harmonyCount = input.whiteFlags.length + input.checkIns.length;

  const connectionEP =
    input.pings.length * EDEN_ACTIONS.ping +
    input.audioNotes.length * EDEN_ACTIONS.voice +
    input.jarNotes.length * EDEN_ACTIONS.jar +
    input.curiosityAnswers.length * EDEN_ACTIONS.curiosity +
    talks.length * EDEN_ACTIONS.talk;
  const actionEP =
    photos.length * EDEN_ACTIONS.photo + input.dateEvents.length * EDEN_ACTIONS.date;
  const desireEP =
    nights.length * EDEN_ACTIONS.spicy +
    dares.length * EDEN_ACTIONS.dare +
    matches * EDEN_ACTIONS.fantasy +
    positions.length * EDEN_ACTIONS.position +
    roleplays.length * EDEN_ACTIONS.roleplay;
  const harmonyEP =
    input.whiteFlags.length * EDEN_ACTIONS.apology +
    input.checkIns.length * EDEN_ACTIONS.checkIn;

  const totalEP = connectionEP + actionEP + desireEP + harmonyEP;
  const rung = levelFromEP(totalEP);
  const lastAt = latest([
    ...input.pings.map((row) => row.createdAt),
    ...input.audioNotes.map((row) => row.createdAt),
    ...input.jarNotes.map((row) => row.createdAt),
    ...input.curiosityAnswers.map((row) => row.createdAt),
    ...talks.map((row) => row.answeredAt),
    ...input.whiteFlags.map((row) => row.createdAt),
    ...input.checkIns.map((row) => row.createdAt),
    ...input.photos.map((row) => row.createdAt),
    ...nights.map((row) => row.completedAt),
    ...input.dares.map((row) => row.createdAt),
    ...input.dateEvents.map((row) => row.createdAt),
  ]);
  const hoursSince = lastAt
    ? Math.max(0, (now.getTime() - new Date(lastAt).getTime()) / 3600000)
    : 24 * 14;
  const dormancy = hoursSince >= DORMANCY_HOURS;

  return {
    ...rung,
    totalEP,
    dormancy,
    hoursSince,
    phase: dayPhase(now),
    biomes: {
      hearth: true,
      meadow: rung.level >= 6,
      canopy: rung.level >= 16,
      crimson: rung.level >= 31,
      lagoon: rung.level >= 51,
    },
    essences: [
      {
        id: "connection",
        label: "Connection",
        detail: "Voice, talk, gratitude, curiosity, pings",
        count: connectionCount,
        ep: connectionEP,
      },
      {
        id: "action",
        label: "Action",
        detail: "Dates and weekly photos",
        count: actionCount,
        ep: actionEP,
      },
      {
        id: "desire",
        label: "Desire",
        detail: "Spicy nights, dares, matches, poses",
        count: desireCount,
        ep: desireEP,
      },
      {
        id: "harmony",
        label: "Harmony",
        detail: "Check-ins and resets",
        count: harmonyCount,
        ep: harmonyEP,
      },
    ],
    visuals: {
      shootingStars: Math.min(8, input.pings.length),
      echoBlossoms: Math.min(14, input.audioNotes.length),
      pebbles: Math.min(22, input.jarNotes.length),
      vineBlooms: Math.min(8, Math.floor(input.curiosityAnswers.length / 5)),
      frames: photos
        .map((row) => row.imageData)
        .filter((row): row is string => Boolean(row))
        .slice(0, 5),
      emberLilies: Math.min(10, matches),
      fireflies: Math.min(40, 8 + nights.length * 4 + dares.length * 2),
      runes: Math.min(12, positions.length),
      pavilion: roleplays.length > 0 && rung.level >= 31,
      gazebo: (input.dateEvents.length > 0 || photos.length > 0) && rung.level >= 16,
      rainbow: input.whiteFlags.length > 0,
    },
    lastAt,
  };
}

export function biomeLabel(snapshot: EdenSnapshot): string {
  if (snapshot.biomes.lagoon) return "Serene Lagoon";
  if (snapshot.biomes.crimson) return "Crimson Grove";
  if (snapshot.biomes.canopy) return "Sunlit Canopy";
  if (snapshot.biomes.meadow) return "Meadow of Curiosity";
  return "Central Hearth";
}

export function todayKey(): string {
  return localDateKey();
}
