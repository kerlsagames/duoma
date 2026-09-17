export const DUOMA_SITE = "https://duoma.vercel.app";

export function joinUrl(code: string) {
  const trimmed = code.trim().toUpperCase();
  return `${DUOMA_SITE}/join?code=${encodeURIComponent(trimmed)}`;
}

export function inviteShareMessage(code: string) {
  return `Join me on Duoma — the couples app. My invite code is ${code}\n\n${joinUrl(code)}`;
}

export function normalizeInviteCode(
  raw: string | string[] | undefined | null
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "";
  return String(value)
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
}
