const CREATOR_EMAILS = new Set(["craigmkerlin@gmail.com", "kerlsagameshq@gmail.com"]);

export function isCreatorEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return CREATOR_EMAILS.has(email.trim().toLowerCase());
}

export function creatorEmails(): string[] {
  return [...CREATOR_EMAILS];
}

export function pardonCreator<T extends { email?: string | null; bannedAt?: string | null; bannedReason?: string | null }>(
  profile: T
): T {
  if (!isCreatorEmail(profile.email)) return profile;
  if (!profile.bannedAt && !profile.bannedReason) return profile;
  return { ...profile, bannedAt: null, bannedReason: null };
}
