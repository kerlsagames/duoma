import type { AppDB, Profile } from "@/lib/types";

export type AppUseRow = {
  id: string;
  label: string;
  count: number;
};

export type UsageItem = {
  label: string;
  detail: string;
  group: string;
};

export type UsageGroup = {
  id: string;
  label: string;
  count: number;
  items: UsageItem[];
};

export type ProfileUsage = {
  profileId: string;
  apps: AppUseRow[];
  cards: UsageItem[];
};

export function groupUsageItems(usage: ProfileUsage | null | undefined): UsageGroup[] {
  if (!usage) return [];
  const map = new Map<string, UsageGroup>();
  for (const item of usage.cards) {
    const label = item.group || item.detail.split("·")[0]?.trim() || "Other";
    const current = map.get(label) ?? { id: label, label, count: 0, items: [] };
    current.items.push(item);
    current.count += 1;
    map.set(label, current);
  }
  for (const app of usage.apps) {
    const label = app.label.replace(/ nights$| swipes$| dares$/i, "").trim();
    if (!map.has(label) && !map.has(app.label)) {
      map.set(app.label, { id: app.id, label: app.label, count: app.count, items: [] });
    } else {
      const match = map.get(label) ?? map.get(app.label);
      if (match && match.count < app.count) match.count = app.count;
    }
  }
  return [...map.values()].sort((left, right) => right.count - left.count);
}

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

  const cards: UsageItem[] = [];
  const push = (group: string, label: string, detail: string) => {
    cards.push({ group, label, detail });
  };
  for (const row of spicyCards.slice(0, 80)) {
    const card = db.cards.find((item) => item.id === row.cardId);
    if (card) push("Get Spicy", card.title, row.status);
  }
  for (const row of chicken.slice(0, 80)) {
    push("Chicken", row.text.slice(0, 100), row.status);
  }
  for (const row of dares.slice(0, 80)) {
    push("Dare Me", row.text.slice(0, 100), row.status);
  }
  for (const row of fantasy.filter((item) => item.liked).slice(0, 80)) {
    push("Fantasy Matcher", row.fantasyId, "liked");
  }
  for (const row of dates.slice(0, 40)) {
    const bucket = db.bucketItems.find((item) => item.id === row.bucketId);
    push("Date Night", bucket?.title ?? row.bucketId, row.status);
  }
  for (const row of db.positionSaves.filter((item) => involved(item.coupleId, coupleIds)).slice(0, 40)) {
    push("Positions", row.positionId, row.doneAt ? "done" : "to-do");
  }
  for (const row of db.positionInvites
    .filter((item) => mine(item.fromUserId) || mine(item.toUserId))
    .slice(0, 40)) {
    push("Positions", row.positionId, row.status);
  }
  for (const row of talk.slice(0, 40)) {
    push("Talk", row.questionId, row.answeredAt ? "answered" : "drawn");
  }
  for (const row of jar.slice(0, 40)) {
    push("Gratitude jar", row.body.slice(0, 100), row.openedAt ? "opened" : "sealed");
  }

  return { profileId: profile.id, apps, cards };
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
