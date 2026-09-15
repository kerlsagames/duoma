import type { Couple, Profile } from "@/lib/types";
import type { ProfileUsage } from "@/lib/account-usage";

const MAYA_ID = "example-maya";
const JORDAN_ID = "example-jordan";
const COUPLE_ID = "example-couple";

export const EXAMPLE_PROFILES: Profile[] = [
  {
    id: MAYA_ID,
    displayName: "Maya",
    gender: "female",
    email: "maya.example@duoma.app",
    lastSeenAt: "2026-09-14T21:12:00.000Z",
    createdAt: "2026-08-02T10:00:00.000Z",
  },
  {
    id: JORDAN_ID,
    displayName: "Jordan",
    gender: "male",
    email: "jordan.example@duoma.app",
    lastSeenAt: "2026-09-14T21:18:00.000Z",
    createdAt: "2026-08-02T10:04:00.000Z",
  },
];

export const EXAMPLE_COUPLE: Couple = {
  id: COUPLE_ID,
  inviteCode: "M7K2QH",
  partnerA: MAYA_ID,
  partnerB: JORDAN_ID,
  createdAt: "2026-08-02T10:00:00.000Z",
  pairedAt: "2026-08-02T10:04:00.000Z",
};

const MAYA_USAGE: ProfileUsage = {
  profileId: MAYA_ID,
  apps: [
    { id: "get-spicy", label: "Get Spicy nights", count: 6 },
    { id: "fantasy", label: "Fantasy Matcher swipes", count: 41 },
    { id: "chicken", label: "Chicken dares", count: 9 },
    { id: "dare-me", label: "Dare Me", count: 4 },
    { id: "check-in", label: "Check-ins", count: 18 },
    { id: "dates", label: "Date Night", count: 5 },
    { id: "coupons", label: "Coupons", count: 3 },
    { id: "positions", label: "Positions", count: 7 },
  ],
  cards: [
    { label: "Slow kiss down her stomach", detail: "Get Spicy · played" },
    { label: "Hold a vibe on F while M fucks her", detail: "Fantasy Matcher · liked" },
    { label: "The Whisper Order", detail: "Chicken · done" },
    { label: "Write a dare on their thigh", detail: "Dare Me · accepted" },
    { label: "The Living Room Fort", detail: "Date Night · saved" },
    { label: "Face to Face · Lotus", detail: "Positions · to-do" },
  ],
};

const JORDAN_USAGE: ProfileUsage = {
  profileId: JORDAN_ID,
  apps: [
    { id: "get-spicy", label: "Get Spicy nights", count: 6 },
    { id: "fantasy", label: "Fantasy Matcher swipes", count: 38 },
    { id: "chicken", label: "Chicken dares", count: 9 },
    { id: "dare-me", label: "Dare Me", count: 4 },
    { id: "check-in", label: "Check-ins", count: 16 },
    { id: "talk", label: "Talk", count: 11 },
    { id: "jar", label: "Gratitude jar", count: 8 },
  ],
  cards: [
    { label: "Warm oil on his back first", detail: "Get Spicy · played" },
    { label: "Go down on F", detail: "Fantasy Matcher · liked" },
    { label: "Sing Happy Birthday to a houseplant", detail: "Chicken · homemade · done" },
    { label: "What is a secret you have never said out loud?", detail: "Talk · answered" },
    { label: "You made coffee without being asked", detail: "Jar · opened" },
  ],
};

const USAGE: Record<string, ProfileUsage> = {
  [MAYA_ID]: MAYA_USAGE,
  [JORDAN_ID]: JORDAN_USAGE,
};

export function isExampleAccount(id: string): boolean {
  return id === MAYA_ID || id === JORDAN_ID || id === COUPLE_ID;
}

export function exampleUsage(profileId: string): ProfileUsage | null {
  return USAGE[profileId] ?? null;
}
