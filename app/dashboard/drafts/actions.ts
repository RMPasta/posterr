"use server";

import { revalidatePath } from "next/cache";

import { UpdateDraftBodySchema } from "@/lib/ai/schemas";
import { createClient } from "@/lib/supabase/server";

export type SimpleResult = { ok: true } | { ok: false; error: string };

export async function updateDraftAction(formData: FormData): Promise<SimpleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Your session expired. Sign in again." };
  }

  const parsed = UpdateDraftBodySchema.safeParse({
    id: String(formData.get("id") ?? ""),
    mainDraft: String(formData.get("mainDraft") ?? ""),
    shortVersion: String(formData.get("shortVersion") ?? "") || null,
    alternateVersion: String(formData.get("alternateVersion") ?? "") || null,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("drafts")
    .update({
      main_draft: parsed.data.mainDraft,
      short_version: parsed.data.shortVersion,
      alternate_version: parsed.data.alternateVersion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not save changes." };
  }

  revalidatePath("/dashboard/drafts");
  revalidatePath(`/dashboard/drafts/${parsed.data.id}`);
  return { ok: true };
}

export async function deleteDraftAction(id: string): Promise<SimpleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Your session expired. Sign in again." };
  }

  const { error } = await supabase.from("drafts").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not delete draft." };
  }

  revalidatePath("/dashboard/drafts");
  revalidatePath("/dashboard");
  return { ok: true };
}
