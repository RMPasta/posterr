import { Badge } from "@/components/ui/badge";
import type { DraftRow } from "@/types/database";

function preview(text: string, max = 120) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function DraftCard({ draft }: { draft: DraftRow }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{draft.title}</h3>
        <Badge>{draft.platform}</Badge>
        <Badge className="capitalize">{draft.tone.replace(/_/g, " ")}</Badge>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {new Date(draft.created_at).toLocaleString()}
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{preview(draft.main_draft)}</p>
    </article>
  );
}
