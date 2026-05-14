import { Suspense } from "react";

import { PostGeneratorForm } from "@/components/generator/post-generator-form";
import { getProfile } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function NewDraftPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(supabase, user.id);

  const defaults = {
    platform: profile?.default_platform ?? "reddit",
    tone: profile?.default_tone ?? "boring_credible",
    writingLevel: profile?.default_writing_level ?? "normal_adult",
    length: profile?.default_length ?? "medium",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New draft</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Plain-language, platform-aware generation. You stay in control.
        </p>
      </div>
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Loading generator...</p>}
      >
        <PostGeneratorForm defaults={defaults} />
      </Suspense>
    </div>
  );
}
