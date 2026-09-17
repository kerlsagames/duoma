/** Live labels so unpaired copy says “them” and switches to their name after they connect. */

export function youLabel(
  user: { displayName?: string | null } | null | undefined,
  fallback = "You"
): string {
  return user?.displayName?.trim() || fallback;
}

export function themLabel(
  partner: { displayName?: string | null } | null | undefined,
  fallback = "them"
): string {
  return partner?.displayName?.trim() || fallback;
}

export function themLabelTitle(
  partner: { displayName?: string | null } | null | undefined,
  fallback = "Them"
): string {
  return partner?.displayName?.trim() || fallback;
}
