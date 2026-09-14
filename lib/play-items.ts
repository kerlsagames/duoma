import type {
  DateNightAsk,
  PlayItemRating,
  PositionInvite,
  PositionSave,
  RoleplayInvite,
  RoleplaySave,
} from "@/lib/types";

export function dateAskForBucket(
  asks: DateNightAsk[],
  bucketId: string,
  nightKey: string
): DateNightAsk | null {
  return (
    asks.find(
      (row) =>
        row.bucketId === bucketId &&
        row.nightKey === nightKey &&
        (row.status === "offered" || row.status === "accepted")
    ) ?? null
  );
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
  kind: "date" | "position" | "roleplay"
): string {
  const thing =
    kind === "date" ? "date" : kind === "position" ? "pose" : "scene";
  if (!status || status === "done") {
    return `Send ${partnerLabel} “try this tonight?” They answer yes or no.`;
  }
  if (status === "offered") {
    return mine
      ? `Sent. Waiting on ${partnerLabel} to say yes or not tonight.`
      : `${partnerLabel} asked. Yes means this ${thing} is on tonight.`;
  }
  if (status === "accepted") {
    return `It’s a go. ${partnerLabel} said yes — tonight’s on.`;
  }
  return mine
    ? `${partnerLabel} said not tonight.`
    : `You said not tonight.`;
}
