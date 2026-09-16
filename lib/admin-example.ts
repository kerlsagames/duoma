import type { Couple, Profile } from "@/lib/types";
import type { ProfileUsage } from "@/lib/account-usage";

const CRAIG_ID = "example-craig";
const RILEY_ID = "example-riley";
const COUPLE_ID = "example-couple";

export const EXAMPLE_PROFILES: Profile[] = [
  {
    id: CRAIG_ID,
    displayName: "Craig",
    gender: "male",
    email: "craigmkerlin@gmail.com",
    lastSeenAt: "2026-09-16T00:40:00.000Z",
    over18At: "2026-09-10T10:00:00.000Z",
    privacyConsentAt: "2026-09-10T10:00:00.000Z",
    moderationConsentAt: "2026-09-10T10:00:00.000Z",
    timezone: "Australia/Sydney",
    activeSeconds: 9_600,
    createdAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: RILEY_ID,
    displayName: "Riley",
    gender: "female",
    email: "riley.demo@duoma.app",
    isDemo: true,
    lastSeenAt: "2026-09-16T00:38:00.000Z",
    over18At: "2026-09-10T10:00:00.000Z",
    privacyConsentAt: "2026-09-10T10:00:00.000Z",
    moderationConsentAt: "2026-09-10T10:00:00.000Z",
    timezone: "Australia/Sydney",
    activeSeconds: 7_200,
    createdAt: "2026-09-10T10:01:00.000Z",
  },
];

export const EXAMPLE_COUPLE: Couple = {
  id: COUPLE_ID,
  inviteCode: "DEMO01",
  partnerA: CRAIG_ID,
  partnerB: RILEY_ID,
  createdAt: "2026-09-10T10:00:00.000Z",
  pairedAt: "2026-09-10T10:01:00.000Z",
};

const CRAIG_USAGE: ProfileUsage = {
  profileId: CRAIG_ID,
  apps: [
    { id: "check-in", label: "Check-ins", count: 1 },
    { id: "chicken", label: "Chicken dares", count: 1 },
    { id: "lists", label: "Lists", count: 4 },
    { id: "jar", label: "Gratitude jar", count: 1 },
    { id: "dates", label: "Date Night", count: 2 },
  ],
  cards: [
    { group: "Chicken", label: "Send me a photo of the weirdest thing in the fridge.", detail: "waiting" },
    { group: "Lists", label: "Past Lives", detail: "movies" },
    { group: "Lists", label: "Night market noodles", detail: "eaten" },
    { group: "Date Night", label: "Oyster night at the market", detail: "to-do" },
    { group: "Date Night", label: "Coast overnight", detail: "to-do" },
  ],
};

const RILEY_USAGE: ProfileUsage = {
  profileId: RILEY_ID,
  apps: [
    { id: "check-in", label: "Check-ins", count: 1 },
    { id: "chicken", label: "Chicken dares", count: 1 },
    { id: "lists", label: "Lists", count: 4 },
    { id: "jar", label: "Gratitude jar", count: 1 },
    { id: "desire", label: "Desire", count: 8 },
  ],
  cards: [
    { group: "Check-in", label: "Rain · comfort · not tonight", detail: "today" },
    { group: "Gratitude jar", label: "Thank you for making coffee before I asked.", detail: "waiting" },
    { group: "Lists", label: "Before Sunrise", detail: "watched" },
    { group: "Lists", label: "The Grand Budapest Hotel", detail: "watched" },
    { group: "Chicken", label: "Send me a photo of the weirdest thing in the fridge.", detail: "sent" },
  ],
};

const USAGE: Record<string, ProfileUsage> = {
  [CRAIG_ID]: CRAIG_USAGE,
  [RILEY_ID]: RILEY_USAGE,
};

export function isExampleAccount(id: string): boolean {
  return id === CRAIG_ID || id === RILEY_ID || id === COUPLE_ID;
}

export function exampleUsage(profileId: string): ProfileUsage | null {
  return USAGE[profileId] ?? null;
}

export function isDemoPair(a: Profile | null, b: Profile | null): boolean {
  return Boolean(a?.isDemo || b?.isDemo || isExampleAccount(a?.id ?? "") || isExampleAccount(b?.id ?? ""));
}
