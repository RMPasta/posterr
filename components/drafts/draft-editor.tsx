"use client";

import { useState, useTransition } from "react";

import { updateDraftAction } from "@/app/dashboard/drafts/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/generator/option-select";
import { Textarea } from "@/components/ui/textarea";
import type { DraftRow } from "@/types/database";

export function DraftEditor({ draft }: { draft: DraftRow }) {
  const [mainDraft, setMainDraft] = useState(draft.main_draft);
  const [shortVersion, setShortVersion] = useState(draft.short_version ?? "");
  const [alternateVersion, setAlternateVersion] = useState(draft.alternate_version ?? "");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setMessage(null);
    setError(null);
    const fd = new FormData();
    fd.set("id", draft.id);
    fd.set("mainDraft", mainDraft);
    fd.set("shortVersion", shortVersion);
    fd.set("alternateVersion", alternateVersion);
    start(async () => {
      const res = await updateDraftAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage("Saved.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <CopyButton text={mainDraft} label="Copy main" />
        <CopyButton text={shortVersion} label="Copy short" />
        <CopyButton text={alternateVersion} label="Copy alternate" />
        <Button type="button" variant="primary" disabled={pending} onClick={save}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
      {message ? <p className="text-sm text-sky-700 dark:text-sky-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-1">
        <FieldLabel htmlFor="main">Main draft</FieldLabel>
        <Textarea id="main" value={mainDraft} onChange={(e) => setMainDraft(e.target.value)} className="min-h-[260px]" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor="short">Short version</FieldLabel>
        <Textarea id="short" value={shortVersion} onChange={(e) => setShortVersion(e.target.value)} className="min-h-[160px]" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor="alt">Alternate version</FieldLabel>
        <Textarea id="alt" value={alternateVersion} onChange={(e) => setAlternateVersion(e.target.value)} className="min-h-[160px]" />
      </div>
    </div>
  );
}
