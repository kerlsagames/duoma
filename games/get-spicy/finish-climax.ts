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
  "Edge of the Bed": "F",
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
  "Dirty Talk Finale": "F",
  "Restrained Climax": "F",
  "Butter Churner Angle": "FM",
  "Side-by-Side Angle": "FM",
  "Lapside Rider": "FM",
  "Chest Praise": "F",
  "Edge On Demand": "F",
  "Shower / Water Finish": "FM",
  "Deep Hug Finish": "FM",
  "Kneeling Angle": "FM",
  "The Arch": "FM",
  "Hands-Free Focus": "FM",
  "Sensory Blindfold Finish": "F",
  "Rhythm Switch": "FM",
  "Over-the-Legs Doggy": "FM",
  "Thigh Squeeze": "FM",
  "Neck Biting Finish": "FM",
  "Mutual Manual": "FM",
  "Full Weight Lock": "FM",
  "Double Angle Shift": "FM",
  "Deep Breathing Release": "FM",
  "Explicit Order": "M",
  "Forehead-to-Forehead": "FM",
  "Elevated Missionary": "FM",
  "Guided Rear Entry": "F",
  "Top Control Rider": "F",
  "Close Spooning": "FM",
  "Chest Lotus": "FM",
  "Standing Bed Edge": "FM",
  "Full-Contact Prone": "F",
  "Reverse Top": "FM",
  "Floor & Bed Edge": "F",
  "Over-Shoulder X": "FM",
  "Synced Climax": "FM",
  "Finish off with oral — stay there": "M",
  "Max Sprint Tempo": "FM",
  "Ultra Slow Penetration": "FM",
  "Penetration Plus Touch": "FM",
  "Vibrating Finale": "F",
  "Verbal Climax Drive": "F",
  "Commanded Release": "F",
  "Pinned Wrists Release": "F",
  "Pause & Permission": "F",
  "Hands to finish": "M",
  "Oral for you": "M",
  "Finish from behind": "M",
  "On top to finish": "M",
  "Mouth then hands": "M",
  "Eye contact oral": "M",
  "Slow oral finish": "M",
  "Cum on tits": "M",
  "Stroke and finish on chest": "M",
  "Mouth then cum on body": "M",
  "Guide their hand": "M",
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
  "Thigh Trap": "FM",
  "Tongue Until She Breaks": "F",
  "Fingers Only for Her": "F",
  "Wand Until She Cums": "F",
  "Sit on His Face": "F",
  "Slow Strokes, Thumb on Clit": "F",
  "Grind His Thigh": "F",
  "Oral from Behind": "F",
  "Vibe While He Holds Her": "F",
  "Nipples and Fingers": "F",
  "Kneeling Oral for Her": "F",
  "Crooked Two Fingers": "F",
  "Shower Head on Her": "F",
  "Kiss Her Through It": "F",
  "Prone Clit Rub": "F",
  "Ride His Hand": "F",
  "Leg Over His Shoulder": "F",
  "Bullet During Missionary": "F",
  "Talk Her Over": "F",
  "Wall, His Mouth": "F",
  "Fingers from Behind Her": "F",
  "She Sits on the Wand": "F",
  "Tongue and a Finger Inside": "F",
  "She Rubs, He Watches": "F",
  "Wrapped Up Clit Finish": "F",
  "Over His Lap": "F",
  "Standing, Back to His Chest": "F",
  "Pillow Under Her, Mouth On": "F",
  "She Cums on His Cock": "F",
  "Blindfold and a Vibe": "F",
  "Suck Her Clit Through It": "F",
  "Handjob Against His Stomach": "M",
  "Between Her Tits": "M",
  "Foot of the Bed Blowjob": "M",
  "He Fucks Her Mouth": "M",
  "Cowgirl Until He Fills Her": "M",
  "Pull Out on Her Stomach": "M",
  "She Edges Him Then Lets Him": "M",
  "Tight Fist Finish": "M",
  "Missionary and Stay In": "M",
  "She Sucks the Tip": "M",
  "Against the Wall, He Finishes": "M",
  "From Behind, Pull Out on Her Back": "M",
  "She Looks Up While He Cums": "M",
  "Lube and a Slow Stroke": "M",
  "He Comes in Her Ass": "M",
  "Straddle His Hips, Hands Off": "M",
  "Two Hands and Her Mouth": "M",
  "He Comes on Her Ass Cheeks": "M",
  "Deep Throat, Swallow": "M",
  "Spoons Until He Fills Her": "M",
  "She Strokes Him onto Her Tits": "M",
  "Balls in Her Mouth, Hand on Shaft": "M",
  "He Comes While She Sits Still": "M",
  "Shower, Her Hand": "M",
  "Bent Over the Bed": "M",
  "She Finishes Him with Her Feet": "M",
  "Hair in His Fist, Mouth on Him": "M",
  "He Pulls Out onto Her Pussy": "M",
  "Lotus, He Comes Inside": "M",
  "She Talks Him Through It": "M",
  "Vibe on Her, Cum Inside": "FM",
  "Pull Out into a 69": "FM",
  "She Cums on His Tongue, He Cums in Hers": "FM",
  "Ride Him Through Hers, Then His": "FM",
  "Fingers for Her, Mouth for Him": "FM",
  "Wand on Her, He Fucks Through It": "FM",
  "Doggy, Clit Rub, Stay In": "FM",
  "She Comes First, Then He Fills Her": "FM",
  "Mutual Hands, Foreheads Together": "FM",
  "Mirror 69": "FM",
  "Bullet on Her, He Comes on Her Tits": "FM",
  "Standing Shower, Both Finish": "FM",
  "She Grinds His Face, Then Rides": "FM",
  "Edge Each Other, Then Let Go": "FM",
  "Prone Bone Plus a Vibe": "FM",
  "Lap, Clit, Then His Lap": "FM",
  "Pull Out, 69, Swap Ends": "FM",
  "Her Orgasm on His Cock, His on Her Tongue": "FM",
  "Two Toys, Same Time": "FM",
  "Spoons, His Hand on Her Clit": "FM",
  "She Comes on His Fingers, He Comes on Her Ass": "FM",
  "Cowgirl with a Wand Between You": "FM",
  "Oral Relay": "FM",
  "Against the Dresser, Both": "FM",
  "She Cums Riding His Thigh, Then His Cock": "FM",
  "Kissing, Hands, Same Time": "FM",
  "From Behind, Then Her Mouth": "FM",
  "Blindfold Her, Then Him": "FM",
  "Hold the Vibe, Hold the Base": "FM",
  "After She Cums, 69 Anyway": "FM",
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
  return resolved === "M";
}

export function maleFollowUpCopy(climax: FinishClimax): string | null {
  if (climax !== "F") return null;
  return "M — your turn is coming…";
}
