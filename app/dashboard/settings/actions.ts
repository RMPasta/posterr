"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { SettingsUpdateSchema } from "@/lib/ai/schemas";
import { createClient } from "@/lib/supabase/server";

export async function updateSettingsAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=session");
  }

  const parsed = SettingsUpdateSchema.safeParse({
    default_platform: String(formData.get("default_platform") ?? ""),
    default_tone: String(formData.get("default_tone") ?? ""),
    default_writing_level: String(formData.get("default_writing_level") ?? ""),
    default_length: String(formData.get("default_length") ?? ""),
  });

  if (!parsed.success) {
    const msg = encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid settings.");
    redirect(`/dashboard/settings?error=${msg}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect("/dashboard/settings?error=save");
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/new");
  revalidatePath("/dashboard");
  redirect("/dashboard/settings?saved=1");
}
