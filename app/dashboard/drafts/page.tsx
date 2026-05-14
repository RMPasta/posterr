import { DraftLibrary } from "@/components/drafts/draft-library";
import { listDraftsForUser } from "@/lib/db/drafts";
import { createClient } from "@/lib/supabase/server";

export default async function DraftsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const drafts = await listDraftsForUser(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Draft library</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Newest first. Search by title or raw idea, filter by platform.
        </p>
      </div>
      <DraftLibrary drafts={drafts} />
    </div>
  );
}
