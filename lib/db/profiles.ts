import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileRow } from "@/types/database";

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<ProfileRow> {
  const existing = await getProfile(supabase, user.id);
  if (existing) return existing;

  const email =
    typeof user.email === "string" && user.email.length > 0
      ? user.email
      : null;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    email,
  });

  if (error && error.code !== "23505") {
    throw error;
  }

  const created = await getProfile(supabase, user.id);
  if (!created) {
    throw new Error("Could not create profile.");
  }
  return created;
}
