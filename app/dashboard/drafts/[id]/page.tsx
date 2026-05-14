import { notFound } from "next/navigation";
import Link from "next/link";

import { DeleteDraftButton } from "@/components/drafts/delete-draft-button";
import { DraftEditor } from "@/components/drafts/draft-editor";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getDraftById } from "@/lib/db/drafts";
import { createClient } from "@/lib/supabase/server";

export default async function DraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const draft = await getDraftById(supabase, user.id, id);
  if (!draft) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/drafts" className="text-sm text-sky-700 hover:underline dark:text-sky-400">
            ← Back to drafts
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{draft.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{draft.platform}</Badge>
            <Badge>{draft.content_type}</Badge>
            <Badge>{draft.tone}</Badge>
          </div>
        </div>
        <DeleteDraftButton id={draft.id} />
      </div>

      <Card>
        <CardTitle className="text-base">Meta</CardTitle>
        <CardDescription className="mt-2 whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Raw idea</span>
          {"\n"}
          {draft.raw_idea}
        </CardDescription>
      </Card>

      {draft.platform_notes ? (
        <Card>
          <CardTitle className="text-base">Platform notes</CardTitle>
          <CardDescription className="mt-2 whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
            {draft.platform_notes}
          </CardDescription>
        </Card>
      ) : null}

      <DraftEditor draft={draft} />
    </div>
  );
}
