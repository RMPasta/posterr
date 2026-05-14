import type { SupabaseClient } from "@supabase/supabase-js";

const DAILY_LIMIT = 10;

function startOfUtcDayIso(): string {
  const d = new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  ).toISOString();
}

export async function countGenerationsToday(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const since = startOfUtcDayIso();
  const { count, error } = await supabase
    .from("generation_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  if (error) throw error;
  return count ?? 0;
}

export async function assertUnderDailyLimit(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const n = await countGenerationsToday(supabase, userId);
  if (n >= DAILY_LIMIT) {
    throw new Error(
      "Daily generation limit reached (10 per day). Try again tomorrow.",
    );
  }
}

export async function logGeneration(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("generation_logs").insert({
    user_id: userId,
  });
  if (error) throw error;
}

export { DAILY_LIMIT };
