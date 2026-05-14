"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteDraftAction } from "@/app/dashboard/drafts/actions";
import { Button } from "@/components/ui/button";

export function DeleteDraftButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    if (!window.confirm("Delete this draft?")) return;
    setError(null);
    start(async () => {
      const res = await deleteDraftAction(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/dashboard/drafts");
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <Button type="button" variant="danger" disabled={pending} onClick={onDelete}>
        {pending ? "Deleting..." : "Delete draft"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
