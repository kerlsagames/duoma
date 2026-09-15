import type { AppDB, Profile } from "@/lib/types";

export type AppUseRow = {
  id: string;
  label: string;
  count: number;
};

export type ProfileUsage = {
  profileId: string;
  apps: AppUseRow[];
  cards: { label: string; detail: string }[];
};

function count(n: number, id: string, label: string): AppUseRow | null {
  if (n <= 0) return null;
  return { id, label, count: n };
}

function involved(coupleId: string | null | undefined, coupleIds: Set<string>) {
  return Boolean(coupleId && coupleIds.has(coupleId));
}

export function usageForProfile(db: AppDB, profile: Profile): ProfileUsage {
  const coupleIds = new Set(
    db.couples
      .filter((row) => row.partnerA === profile.id || row.partnerB === profile.id)
      .map((row) => row.id)
  );
  const mine = (userId: string | null | undefined) => userId === profile.id;

  const spicyNights = db.games.filter(
    (row) => involved(row.coupleId, coupleIds) && row.gameKey === "get-spicy"
  ).length;
  const spicyCards = db.deck.filter((row) => {
    const game = db.games.find((item) => item.id === row.gameId);
    return game && involved(game.coupleId, coupleIds);
  });
  const chicken = db.chickenPlays.filter(
    (row) => mine(row.fromUserId) || mine(row.toUserId)
  );
  const dares = db.spicyDares.filter(
    (row) => mine(row.fromUserId) || mine(row.toUserId)
  );
  const fantasy = db.fantasySwipes.filter((row) => mine(row.userId));
  const checkIns = db.checkIns.filter((row) => mine(row.userId));
  const dates = db.dateNightAsks.filter(
    (row) => mine(row.fromUserId) || involved(row.coupleId, coupleIds)
  );
  const coupons = db.coupons.filter(
    (row) => mine(row.fromUserId) || mine(row.toUserId)
  );
  const positions = [
    ...db.positionSaves.filter((row) => involved(row.coupleId, coupleIds)),
    ...db.positionInvites.filter(
      (row) => mine(row.fromUserId) || mine(row.toUserId)
    ),
  ];
  const roleplays = [
    ...db.roleplaySaves.filter((row) => involved(row.coupleId, coupleIds)),
    ...db.roleplayInvites.filter(
      (row) => mine(row.fromUserId) || mine(row.toUserId)
    ),
  ];
  const discover = db.curiosityAnswers.filter((row) => mine(row.userId));
  const talk = db.talkDraws.filter((row) => mine(row.userId) || involved(row.coupleId, coupleIds));
  const jar = db.jarNotes.filter((row) => mine(row.fromUserId));
  const lists = db.listEntries.filter((row) => involved(row.coupleId, coupleIds));

  const apps = [
    count(spicyNights, "get-spicy", "Get Spicy nights"),
    count(chicken.length, "chicken", "Chicken dares"),
    count(dares.length, "dare-me", "Dare Me"),
    count(fantasy.length, "fantasy", "Fantasy Matcher swipes"),
    count(checkIns.length, "check-in", "Check-ins"),
    count(dates.length, "dates", "Date Night"),
    count(coupons.length, "coupons", "Coupons"),
    count(positions.length, "positions", "Positions"),
    count(roleplays.length, "roleplays", "Roleplays"),
    count(discover.length, "discover", "Discover / Curiosity"),
    count(talk.length, "talk", "Talk"),
    count(jar.length, "jar", "Gratitude jar"),
    count(lists.length, "lists", "Lists"),
  ].filter((row): row is AppUseRow => Boolean(row));

  const cards: { label: string; detail: string }[] = [];
  for (const row of spicyCards.slice(0, 12)) {
    const card = db.cards.find((item) => item.id === row.cardId);
    if (card) {
      cards.push({
        label: card.title,
        detail: `Get Spicy · ${row.status}`,
      });
    }
  }
  for (const row of chicken.slice(0, 8)) {
    cards.push({
      label: row.text.slice(0, 80),
      detail: `Chicken · ${row.status}`,
    });
  }
  for (const row of dares.slice(0, 8)) {
    cards.push({
      label: row.text.slice(0, 80),
      detail: `Dare Me · ${row.status}`,
    });
  }
  for (const row of fantasy.filter((item) => item.liked).slice(0, 8)) {
    cards.push({
      label: row.fantasyId,
      detail: "Fantasy Matcher · liked",
    });
  }

  return { profileId: profile.id, apps, cards: cards.slice(0, 24) };
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
