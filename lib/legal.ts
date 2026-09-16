export const AGE_CONSENT_LABEL = "I am 18 or older.";

export const PRIVACY_CONSENT_LABEL =
  "I agree to the privacy notice. Duoma may review my account and images I upload to stop abuse.";

export const PRIVACY_NOTICE = `Duoma is a private couples app for adults.

By creating an account you confirm:
• You are 18 or over. Anyone under 18 is not allowed.
• You will only upload photos or video of adults who agreed to be in them.
• The pair code links two people. Your email is the account (sign-in, a new phone, bans).

Safety and abuse
The people who run Duoma may look at account details, activity, and images or clips you upload, but only to keep the service safe, investigate reports, or close accounts that break these rules. That is not a public gallery. Partners still only see what you share with them.

What we store
Name, email, Male/Female, pair code, last time you opened the app, timezone from your device (not GPS), time spent in the app, and the play you do here. Photos and vault clips stay on your phones unless we later sync them for safety review you already agreed to.

Your choices
You can sign out any time. Sign out does not unpair you. To close the account, email kerlsagameshq@gmail.com. We can refuse or remove an account that is under 18, non-consensual, or abusive.

This notice is how Duoma works. It is not personal legal advice.`;

export function deviceTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export function formatActiveTime(seconds: number | null | undefined): string {
  const total = Math.max(0, Math.floor(seconds ?? 0));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 48) return rest ? `${hours}h ${rest}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const hourRest = hours % 24;
  return hourRest ? `${days}d ${hourRest}h` : `${days}d`;
}

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "—";
  return new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
