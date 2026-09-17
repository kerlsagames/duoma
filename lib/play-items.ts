import { formatLongDate } from "@/lib/dates";
import type {
  DateNightAsk,
  DareSave,
  PlayItemRating,
  PositionInvite,
  PositionSave,
  RoleplayInvite,
  RoleplaySave,
} from "@/lib/types";

export function dateAskForBucket(
  asks: DateNightAsk[],
  bucketId: string,
  nightKey?: string
): DateNightAsk | null {
  const live = asks.filter(
    (row) =>
      row.bucketId === bucketId &&
      (row.status === "offered" || row.status === "accepted")
  );
  if (nightKey) {
    return live.find((row) => row.nightKey === nightKey) ?? live[0] ?? null;
  }
  return live[0] ?? null;
}

export function positionAskForPose(
  invites: PositionInvite[],
  positionId: string
): PositionInvite | null {
  return (
    invites.find(
      (row) =>
        row.positionId === positionId &&
        (row.status === "offered" || row.status === "accepted")
    ) ?? null
  );
}

export function openPositionSave(
  saves: PositionSave[],
  positionId: string
): PositionSave | null {
  return saves.find((row) => row.positionId === positionId && !row.doneAt) ?? null;
}

export function roleplayAskForScene(
  invites: RoleplayInvite[],
  roleplayId: string
): RoleplayInvite | null {
  return (
    invites.find(
      (row) =>
        row.roleplayId === roleplayId &&
        (row.status === "offered" || row.status === "accepted")
    ) ?? null
  );
}

export function openRoleplaySave(
  saves: RoleplaySave[],
  roleplayId: string
): RoleplaySave | null {
  return saves.find((row) => row.roleplayId === roleplayId && !row.doneAt) ?? null;
}

export function openDareSave(
  saves: DareSave[],
  dareId: string
): DareSave | null {
  return saves.find((row) => row.dareId === dareId && !row.doneAt) ?? null;
}

export function ratingsForTarget(
  ratings: PlayItemRating[],
  kind: PlayItemRating["kind"],
  targetId: string
): PlayItemRating[] {
  return ratings.filter((row) => row.kind === kind && row.targetId === targetId);
}

export function myPlayRating(
  ratings: PlayItemRating[],
  kind: PlayItemRating["kind"],
  targetId: string,
  userId: string | null | undefined
): PlayItemRating | null {
  if (!userId) return null;
  return (
    ratingsForTarget(ratings, kind, targetId).find((row) => row.userId === userId) ??
    null
  );
}

export function tonightAskCopy(
  status: "offered" | "accepted" | "declined" | "done" | null,
  mine: boolean,
  partnerLabel: string,
  kind: "date" | "position" | "roleplay",
  nightKey?: string | null
): string {
  const thing =
    kind === "date" ? "date" : kind === "position" ? "pose" : "scene";
  const when =
    kind === "date" && nightKey && /^\d{4}-\d{2}-\d{2}$/.test(nightKey)
      ? formatLongDate(nightKey)
      : kind === "date"
        ? "that night"
        : "tonight";
  if (!status || status === "done") {
    return kind === "date"
      ? `Pick a night, then send ${partnerLabel} the ask. If they say yes, it lands on the calendar.`
      : `Send ${partnerLabel} “try this tonight?” They answer yes or no.`;
  }
  if (status === "offered") {
    return mine
      ? `Sent for ${when}. Waiting on ${partnerLabel} to say yes or not.`
      : `${partnerLabel} asked for ${when}. Yes puts this ${thing} on the calendar.`;
  }
  if (status === "accepted") {
    return `It’s a go — ${when} is on the calendar.`;
  }
  return mine
    ? `${partnerLabel} said not ${when}.`
    : `You said not ${when}.`;
}
