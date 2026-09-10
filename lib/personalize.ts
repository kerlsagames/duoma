import type { Gender } from "@/lib/types";

export type NamePair = {
  player: string;
  partner: string;
};

export type GenderPair = {
  player: Gender;
  partner: Gender;
};

export function resolveCardNames(input: {
  userName: string | null | undefined;
  partnerName: string | null | undefined;
  userId?: string | null;
  partnerId?: string | null;
  playedById?: string | null;
}): NamePair {
  const userName = input.userName?.trim() || "You";
  const partnerName = input.partnerName?.trim() || "your partner";
  if (input.playedById && input.partnerId && input.playedById === input.partnerId) {
    return { player: partnerName, partner: userName };
  }
  return { player: userName, partner: partnerName };
}

export function resolveCardGenders(input: {
  userGender: Gender | null | undefined;
  partnerGender: Gender | null | undefined;
  userId?: string | null;
  partnerId?: string | null;
  playedById?: string | null;
}): GenderPair | null {
  if (!input.userGender || !input.partnerGender) return null;
  if (input.playedById && input.partnerId && input.playedById === input.partnerId) {
    return { player: input.partnerGender, partner: input.userGender };
  }
  return { player: input.userGender, partner: input.partnerGender };
}

const ANATOMY_PARTS = [
  "cock",
  "dick",
  "pussy",
  "tits",
  "breasts",
  "chest",
  "clit",
  "prostate",
  "balls",
  "nipples",
  "cum",
  "he",
  "him",
  "his",
  "himself",
] as const;

type AnatomyPart = (typeof ANATOMY_PARTS)[number];

function anatomy(gender: Gender, part: AnatomyPart): string {
  const male = gender === "male";
  switch (part) {
    case "cock":
    case "dick":
      return male ? part : "pussy";
    case "pussy":
      return male ? "cock" : "pussy";
    case "tits":
    case "breasts":
      return male ? "chest" : part;
    case "chest":
      return male ? "chest" : "tits";
    case "clit":
      return male ? "prostate" : "clit";
    case "prostate":
      return male ? "prostate" : "clit";
    case "balls":
      return male ? "balls" : "lips";
    case "nipples":
      return "nipples";
    case "cum":
      return "cum";
    case "he":
      return male ? "he" : "she";
    case "him":
      return male ? "him" : "her";
    case "his":
      return male ? "his" : "her";
    case "himself":
      return male ? "himself" : "herself";
    default:
      return part;
  }
}

function applyGenderTokens(text: string, who: "player" | "partner", gender: Gender) {
  let next = text;
  for (const part of ANATOMY_PARTS) {
    next = next.replaceAll(`{${who}_${part}}`, anatomy(gender, part));
  }
  return next;
}

export function personalize(
  text: string,
  names: NamePair,
  genders?: GenderPair | null
): string {
  if (!text) return text;
  let out = text
    .replaceAll("{player}", names.player)
    .replaceAll("{partner}", names.partner)
    .replace(/\byour partner[’']s\b/gi, `${names.partner}'s`)
    .replace(/\byour partner\b/gi, names.partner);

  if (genders) {
    out = applyGenderTokens(out, "player", genders.player);
    out = applyGenderTokens(out, "partner", genders.partner);
    // Dual wording in older cards → pick by the person being touched (partner).
    out = out.replace(/clitoral\/prostate/gi, () =>
      genders.partner === "female" ? "clitoral" : "prostate"
    );
    out = out.replace(/prostate\/clitoral/gi, () =>
      genders.partner === "male" ? "prostate" : "clitoral"
    );
    out = out.replace(/beautiful\/handsome/gi, () =>
      genders.partner === "female" ? "beautiful" : "handsome"
    );
    out = out.replace(/handsome\/beautiful/gi, () =>
      genders.partner === "male" ? "handsome" : "beautiful"
    );
  }

  return out;
}

export function personalizeCard(
  card: { title: string; body: string },
  names: NamePair,
  genders?: GenderPair | null
) {
  return {
    title: personalize(card.title, names, genders),
    body: personalize(card.body, names, genders),
  };
}
