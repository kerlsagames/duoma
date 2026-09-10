export type NamePair = {
  player: string;
  partner: string;
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

export function personalize(text: string, names: NamePair): string {
  if (!text) return text;
  return text
    .replaceAll("{player}", names.player)
    .replaceAll("{partner}", names.partner)
    .replace(/\byour partner[’']s\b/gi, `${names.partner}'s`)
    .replace(/\byour partner\b/gi, names.partner);
}

export function personalizeCard(
  card: { title: string; body: string },
  names: NamePair
) {
  return {
    title: personalize(card.title, names),
    body: personalize(card.body, names),
  };
}
