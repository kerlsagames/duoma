import type { Couple, Profile } from "@/lib/types";

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

export function isExampleAccount(id: string): boolean {
  return id === CRAIG_ID || id === RILEY_ID || id === COUPLE_ID;
}

export function isDemoPair(a: Profile | null, b: Profile | null): boolean {
  return Boolean(a?.isDemo || b?.isDemo || isExampleAccount(a?.id ?? "") || isExampleAccount(b?.id ?? ""));
}
