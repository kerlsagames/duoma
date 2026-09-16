export const AGE_CONSENT_LABEL = "I am 18 or older.";

export const PRIVACY_CONSENT_LABEL =
  "I agree to the Terms of Use and Privacy Policy, including that I am responsible if someone else uses my email or sign-in code.";

export const LEGAL_EFFECTIVE = "16 September 2026";
export const LEGAL_OPERATOR = "Kerlsagames / Duoma";
export const LEGAL_CONTACT = "kerlsagameshq@gmail.com";

export const TERMS_OF_USE = `Duoma Terms of Use
Effective ${LEGAL_EFFECTIVE}

These Terms are a contract between you and ${LEGAL_OPERATOR} (“we”, “us”). They apply when you create a pair, sign in, or use Duoma. If you do not agree, do not use the app.

This is a standard consumer-app contract. It is not personal legal advice. Australian Consumer Law still applies and cannot be signed away.

1. Adults only
You must be 18 or over. You must not let a child use your account. Intimate content in Duoma is for consenting adults only.

2. The account is your email
Duoma does not use a password you invent. Sign-in is a link or a 6-digit code sent to your email. That email inbox is the key to the pair. Anyone who can open that inbox can open Duoma as you.

3. You are responsible for your sign-in
You must keep your email account, phone, and sign-in codes under your control. You must not share your pair code except with the partner you mean to link. If your email is hacked, your phone is stolen, a sign-in code is forwarded, or someone uses a device you left unlocked, that access is treated as you, until you tell us and we can close or pause the account.

We are not liable for loss, embarrassment, leaked photos, messages, or anything else that happens because someone else used your email, codes, or a logged-in device. That includes a hacked password on your email provider, a shared inbox, or a stolen phone.

If you think someone else is in your account, email ${LEGAL_CONTACT} at once and use Forgot password only from a device you trust.

4. What you must not do
You must not: use Duoma if you are under 18; upload photos or video of anyone who did not agree, or of anyone under 18; harass, blackmail, or impersonate; try to break into other accounts; scrape or copy the catalog; or use the app to break the law.

We may pause or close an account, without a refund (Duoma is free unless we later say otherwise), if we reasonably believe these rules were broken.

5. Content you add
You keep whatever rights you already have in photos, notes, and other things you add. You give us a limited right to store them and — only as you already agreed — to review them to stop abuse or respond to a report. We do not sell your intimate images.

6. The service is as-is
Duoma is provided as-is. It can go down, lose a local cache, or change. We do not promise it will be error-free or always available. Email delivery (magic links and codes) depends on your inbox. Links expire. Type the 6-digit code if a link fails.

7. Limitation of liability
To the maximum extent the law allows, we are not liable for:
• someone else using your account after they got into your email, codes, or device
• intimate content being seen by a person you linked, or a person who used your sign-in
• loss of data on a phone, a cleared browser, or a failed sync
• indirect or consequential loss, including distress, reputation, or lost chance

Where we cannot exclude liability (including under the Australian Consumer Law), our liability is limited, at our option, to supplying the service again or the cost of having it supplied again. For a free service that is often nothing you can claim in money.

This does not limit liability for fraud, or for death or personal injury caused by negligence, where the law does not allow that limit.

8. Indemnity
You will cover us for claims that arise from your content, your breach of these Terms, or another person using your account because you did not protect your email or device.

9. Privacy
The Privacy Policy below is part of these Terms.

10. Changes and contact
We may update these Terms. The date at the top will change. Continued use after a change means you accept the new Terms. Questions: ${LEGAL_CONTACT}.

11. Law
These Terms are governed by the laws of New South Wales, Australia. Courts of NSW have jurisdiction, except where a mandatory consumer law says otherwise.`;

export const PRIVACY_NOTICE = `Duoma Privacy Policy
Effective ${LEGAL_EFFECTIVE}

Who we are
${LEGAL_OPERATOR} runs Duoma. Contact: ${LEGAL_CONTACT}.

What we collect
• Account: name, email, Male/Female, pair code, 18+ and policy ticks, last sign-in, timezone from the device (not GPS), time spent in the app
• Play: cards, lists, check-ins, and other things you do in the hubs
• Images and clips you upload (Photo Memory, Sexy Vault, and similar). These often stay on your phones. If they sync, we may store them to run the feature and — if you agreed — to review reports of abuse
• Device basics needed to send a sign-in email or a lock-screen ping (if you turn notifications on)

We do not sell your personal information. We do not buy advertising profiles of you.

Why we collect it
To run the pair, sign you in, show the app, keep people safe, investigate abuse, and close accounts that break the Terms.

Account security
Sign-in codes and links go to your email. We cannot see your email password. If that inbox is hacked, the attacker can open Duoma. Protect your email. We are not responsible for access we did not grant.

Who can see what
Your partner sees what you share in the pair. The people who run Duoma may see account fields and, where you agreed, images and activity, only to operate the service or investigate a problem. We may share information if the law requires it, or with a host (for example Vercel or Supabase) that stores the app under a contract.

How long
We keep account records while the pair exists and a short time after you ask us to close it, unless we must keep a record of a ban or a legal request. You can ask us to delete an account at ${LEGAL_CONTACT}.

Your rights
You can ask for a copy of the account we hold, ask us to correct it, or ask us to delete it, subject to what we must keep. If you are in Australia this sits with the Australian Privacy Principles as they apply to a small app. If you are in the UK/EU, extra rights may apply; email us.

Safety review of images
We only review intimate images to stop abuse, under-18 use, or a report, and only after you ticked that you agree. That is not a public feed.

This policy can change. The date at the top will change.`;

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
