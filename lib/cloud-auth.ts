import { supabase } from "@/lib/supabase";

/** Magic link is the recovery path. Pairing still uses the 6-character code. */
export async function sendMagicLink(email: string, displayName: string): Promise<void> {
  if (!supabase) {
    throw new Error("Cloud accounts are not connected yet. Email is saved on this device for now.");
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
      data: { display_name: displayName.trim() || "Player" },
    },
  });
  if (error) throw error;
}
