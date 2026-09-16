import { Platform, type TextInputProps } from "react-native";

export const VAULT_PIN_MAX = 6;

/** OTP-style fields so iOS/Android/web do not offer to save the PIN. */
export function vaultPinFieldProps(): TextInputProps {
  return {
    keyboardType: "number-pad",
    secureTextEntry: true,
    maxLength: VAULT_PIN_MAX,
    autoComplete: "one-time-code",
    textContentType: "oneTimeCode",
    importantForAutofill: "no",
    autoCorrect: false,
    autoCapitalize: "none",
    spellCheck: false,
    ...(Platform.OS === "web"
      ? ({
          nativeID: "duoma-vault-otp",
          dataSet: {
            lpignore: "true",
            "1pIgnore": "true",
            formType: "other",
            bwignore: "true",
          },
        } as TextInputProps)
      : {}),
  };
}

export function isVaultPin(value: string): boolean {
  return /^\d{4}$/.test(value) || /^\d{6}$/.test(value);
}

export function vaultPinHint(value = ""): string {
  if (value.length === 6) return "Six digits. Something you’ll both remember.";
  return "Four or six digits. Something you’ll both remember.";
}

export function digitsOnly(value: string, max = VAULT_PIN_MAX): string {
  return value.replace(/\D/g, "").slice(0, max);
}

export function hydrateVoteIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (typeof row !== "string" || !row || seen.has(row)) continue;
    seen.add(row);
    ids.push(row);
  }
  return ids;
}

export function votePinReset(input: {
  votes: string[];
  userId: string;
  partnerId?: string | null;
  partnerIsDemo?: boolean;
}): { votes: string[]; reset: boolean; waiting: boolean } {
  const next = new Set(input.votes);
  next.add(input.userId);
  if (input.partnerIsDemo && input.partnerId) next.add(input.partnerId);
  const votes = [...next];
  const partnerId = input.partnerId ?? null;
  const reset = partnerId
    ? votes.includes(input.userId) && votes.includes(partnerId)
    : false;
  return { votes, reset, waiting: Boolean(partnerId) && !reset };
}
