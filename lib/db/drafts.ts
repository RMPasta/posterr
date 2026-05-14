import type { SupabaseClient } from "@supabase/supabase-js";

import type { DraftRow } from "@/types/database";

export async function listDraftsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<DraftRow[]> {
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DraftRow[];
}

export async function getDraftById(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<DraftRow | null> {
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as DraftRow | null) ?? null;
}
