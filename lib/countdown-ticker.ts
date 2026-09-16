import { daysUntil } from "@/lib/dates";
import type { Milestone } from "@/lib/types";

export type CountdownTickerPrefs = {
  tickerAll?: boolean;
  asWeeks?: boolean;
  hidePast?: boolean;
};

export function formatCountdownPhrase(
  item: Milestone,
  asWeeks = false,
  from = new Date()
): string {
  const days = daysUntil(item.date, from);
  const title = item.title.trim() || "that date";
  if (days < 0) {
    const ago = Math.abs(days);
    return ago === 1 ? `${title} was yesterday` : `${title} was ${ago} days ago`;
  }
  if (days === 0) return `${title} is today`;
  if (asWeeks && days >= 14) {
    const weeks = Math.round(days / 7);
    return weeks === 1
      ? `1 week until ${title}`
      : `${weeks} weeks until ${title}`;
  }
  return days === 1 ? `1 day until ${title}` : `${days} days until ${title}`;
}

export function upcomingCountdowns(
  milestones: Milestone[],
  hidePast = false
): Milestone[] {
  return [...milestones]
    .filter((item) => !hidePast || daysUntil(item.date) >= 0)
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

export function tickerMilestones(
  milestones: Milestone[],
  prefs: CountdownTickerPrefs = {}
): Milestone[] {
  const upcoming = upcomingCountdowns(milestones, true);
  if (upcoming.length === 0) return [];
  if (prefs.tickerAll) return upcoming;
  const featured = upcoming.find((item) => item.featured);
  return [featured ?? upcoming[0]!];
}

export function tickerLine(
  milestones: Milestone[],
  prefs: CountdownTickerPrefs = {}
): string {
  return tickerMilestones(milestones, prefs)
    .map((item) => formatCountdownPhrase(item, Boolean(prefs.asWeeks)))
    .join(" · ");
}
