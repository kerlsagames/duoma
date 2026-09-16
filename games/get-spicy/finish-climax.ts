import type { Card, Gender } from "@/lib/types";
import type { GenderPair } from "@/lib/personalize";

/** Who the card is written to finish — resolved to F / M / FM at deal time. */
export type FinishClimaxHint = "F" | "M" | "FM" | "partner" | "player";
export type FinishClimax = "F" | "M" | "FM";

export function climaxLabel(climax: FinishClimax): string {
  if (climax === "F") return "F cums";
  if (climax === "M") return "M cums";
  return "Both cum";
}

export function climaxChip(climax: FinishClimax): string {
  if (climax === "F") return "F";
  if (climax === "M") return "M";
  return "FM";
}

/**
 * Title map for Finish Off. partner/player resolve from who is playing
 * and Male/Female. F generally goes first; FM is a full finish on one card.
 */
const BY_TITLE: Record<string, FinishClimaxHint> = {
  "Classic Reimagined": "FM",
  "Edge of the Bed": "partner",
  "Cowgirl / Rider Control": "FM",
  "Spoons Position": "FM",
  "Doggy Style Focus": "FM",
  "Lotus Hold": "FM",
  "Standing Intimacy": "FM",
  "Prone Bone": "FM",
  "Climax Together": "FM",
  "Finish off with oral": "M",
  "Reverse Cowgirl": "FM",
  "The Bridge": "FM",
  "Speed Finish": "FM",
  "Agonizingly Slow Finish": "FM",
  "Manual Assistance": "FM",
  "Toy Finish": "F",
  "Mirror View Finish": "FM",
  "X-Mark Position": "FM",
  "Dirty Talk Finale": "partner",
  "Restrained Climax": "partner",
  "Butter Churner Angle": "FM",
  "Side-by-Side Angle": "FM",
  "Lapside Rider": "FM",
  "Chest Praise": "partner",
  "Edge On Demand": "partner",
  "Shower / Water Finish": "FM",
  "Deep Hug Finish": "FM",
  "Kneeling Angle": "FM",
  "The Arch": "FM",
  "Hands-Free Focus": "FM",
  "Sensory Blindfold Finish": "partner",
  "Rhythm Switch": "FM",
  "Over-the-Legs Doggy": "FM",
  "Thigh Squeeze": "player",
  "Neck Biting Finish": "FM",
  "Mutual Manual": "FM",
  "Full Weight Lock": "FM",
  "Double Angle Shift": "FM",
  "Deep Breathing Release": "FM",
  "Explicit Order": "partner",
  "Forehead-to-Forehead": "FM",
  "Elevated Missionary": "FM",
  "Guided Rear Entry": "partner",
  "Top Control Rider": "partner",
  "Close Spooning": "partner",
  "Chest Lotus": "partner",
  "Standing Bed Edge": "FM",
  "Full-Contact Prone": "partner",
  "Reverse Top": "partner",
  "Floor & Bed Edge": "partner",
  "Over-Shoulder X": "FM",
  "Synced Climax": "FM",
  "Finish off with oral — stay there": "M",
  "Max Sprint Tempo": "FM",
  "Ultra Slow Penetration": "FM",
  "Penetration Plus Touch": "FM",
  "Vibrating Finale": "F",
  "Verbal Climax Drive": "partner",
  "Commanded Release": "partner",
  "Pinned Wrists Release": "partner",
  "Pause & Permission": "partner",
  "Hands to finish": "M",
  "Oral for you": "player",
  "Finish from behind": "partner",
  "On top to finish": "M",
  "Mouth then hands": "M",
  "Eye contact oral": "M",
  "Slow oral finish": "M",
  "Cum on tits": "M",
  "Stroke and finish on chest": "M",
  "Mouth then cum on body": "M",
  "Guide their hand": "player",
  "Mouth Finish": "M",
  "Chest & Throat Paint": "M",
  "Face Tribute": "M",
  "Lower Back Paint": "M",
  "Full Swallow": "M",
  "Creampie Hold": "M",
  "Stomach Splash": "M",
  "Ass Finish": "M",
  "Anal Creampie": "M",
  "Ass-to-Mouth": "M",
  "Gag & Swallow": "M",
  "Anal Pull-Out Splash": "M",
  "Double Stain": "M",
  "Orgasm Sync": "FM",
  "Throat & Hair Finish": "M",
  "Vibrator Edge & Release": "F",
  "Controlled Climax": "FM",
  "Oral Orgasm First": "F",
  "Overwhelming Speed": "FM",
  "The Cold Finish": "FM",
  "Face-Down Creampie": "M",
  "Thigh Trap": "M",
};

function inferHint(title: string, body: string): FinishClimaxHint {
  const text = `${title} ${body}`.toLowerCase();
  if (
    /both finish|simultaneous|each other finish|together to (push|aim)|watching each other/.test(
      text
    )
  ) {
    return "FM";
  }
  if (
    /partner_cock|player_cock|swallow|cum on|cum across|pull out|creampie|finish on their|finish in \{partner\}'s mouth/.test(
      text
    )
  ) {
    return "M";
  }
  if (/partner_clit|vibrator|bullet toy|wand/.test(text) && !/before you finish|as you (hit|cum)/.test(text)) {
    return "F";
  }
  if (/finish \{partner\}|until they finish|as they (climax|reach)/.test(text)) {
    return "partner";
  }
  if (/finish you|as you (reach|hit|cum)|you finish/.test(text)) {
    return "player";
  }
  return "FM";
}

export function climaxHintForCard(card: {
  title: string;
  body?: string;
  climax?: FinishClimaxHint | null;
}): FinishClimaxHint {
  if (card.climax) return card.climax;
  return BY_TITLE[card.title] ?? inferHint(card.title, card.body ?? "");
}

export function resolveFinishClimax(
  hint: FinishClimaxHint,
  genders: GenderPair | null | undefined
): FinishClimax {
  if (hint === "F" || hint === "M" || hint === "FM") return hint;
  const gender: Gender | null =
    hint === "partner" ? genders?.partner ?? null : genders?.player ?? null;
  if (gender === "male") return "M";
  if (gender === "female") return "F";
  return hint === "player" ? "M" : "F";
}

export function cardFinishClimax(
  card: { title: string; body?: string; climax?: FinishClimaxHint | null },
  genders: GenderPair | null | undefined
): FinishClimax {
  return resolveFinishClimax(climaxHintForCard(card), genders);
}

export function finishCardFitsBeat(
  card: { title: string; body?: string; climax?: FinishClimaxHint | null; stage?: string },
  beat: "F" | "M",
  genders: GenderPair | null | undefined
): boolean {
  const resolved = cardFinishClimax(card, genders);
  if (beat === "F") return resolved === "F" || resolved === "FM";
  return resolved === "M" || resolved === "FM";
}

export function maleFollowUpCopy(climax: FinishClimax): string | null {
  if (climax !== "F") return null;
  return "M — your turn is coming…";
}
