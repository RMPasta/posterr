"use client";

import { useMemo, useState } from "react";

import { FieldLabel } from "@/components/generator/option-select";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { glyphCount, X_FREE_MAX_GLYPHS } from "@/lib/ai/x-platform-text";
import type { GeneratedPost } from "@/types/post";

const tabs = [
  { id: "main", label: "Main draft" },
  { id: "short", label: "Short version" },
  { id: "alt", label: "Alternate" },
  { id: "notes", label: "Notes" },
  { id: "checklist", label: "Anti-AI checklist" },
  { id: "edits", label: "Suggested edits" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type GeneratedOutputProps = {
  value: GeneratedPost;
  onChange: (next: GeneratedPost) => void;
  platform?: string;
};

export function GeneratedOutput({ value, onChange, platform }: GeneratedOutputProps) {
  const [tab, setTab] = useState<TabId>("main");
  const [flash, setFlash] = useState<string | null>(null);

  const checklistText = useMemo(
    () => value.antiAiChecklist.join("\n"),
    [value.antiAiChecklist],
  );
  const editsText = useMemo(
    () => value.suggestedEdits.join("\n"),
    [value.suggestedEdits],
  );

  function flashSave(label: string) {
    setFlash(label);
    setTimeout(() => setFlash(null), 1200);
  }

  function persistMainDraft() {
    flashSave("Main draft saved in this session");
  }

  function persistShort() {
    flashSave("Short version saved in this session");
  }

  function persistAlt() {
    flashSave("Alternate saved in this session");
  }

  return (
    <Card className="flex min-h-[420px] flex-col">
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      {flash ? (
        <p className="mt-2 text-xs text-sky-700 dark:text-sky-300">{flash}</p>
      ) : null}

      <div className="mt-4 flex-1 space-y-3">
        {tab === "main" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <CopyButton text={value.mainDraft} />
              <Button type="button" variant="secondary" onClick={persistMainDraft}>
                Save
              </Button>
            </div>
            <FieldLabel htmlFor="out-main">Main draft</FieldLabel>
            {platform === "x" ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {glyphCount(value.mainDraft)} / {X_FREE_MAX_GLYPHS} characters (X free tier max)
              </p>
            ) : null}
            <Textarea
              id="out-main"
              value={value.mainDraft}
              onChange={(e) => onChange({ ...value, mainDraft: e.target.value })}
              className="min-h-[240px]"
            />
          </div>
        ) : null}

        {tab === "short" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <CopyButton text={value.shortVersion} />
              <Button type="button" variant="secondary" onClick={persistShort}>
                Save
              </Button>
            </div>
            <FieldLabel htmlFor="out-short">Short version</FieldLabel>
            {platform === "x" ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {glyphCount(value.shortVersion)} / {X_FREE_MAX_GLYPHS} characters (X free tier max)
              </p>
            ) : null}
            <Textarea
              id="out-short"
              value={value.shortVersion}
              onChange={(e) => onChange({ ...value, shortVersion: e.target.value })}
              className="min-h-[200px]"
            />
          </div>
        ) : null}

        {tab === "alt" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <CopyButton text={value.alternateVersion} />
              <Button type="button" variant="secondary" onClick={persistAlt}>
                Save
              </Button>
            </div>
            <FieldLabel htmlFor="out-alt">Alternate version</FieldLabel>
            <Textarea
              id="out-alt"
              value={value.alternateVersion}
              onChange={(e) => onChange({ ...value, alternateVersion: e.target.value })}
              className="min-h-[200px]"
            />
          </div>
        ) : null}

        {tab === "notes" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <CopyButton text={value.platformNotes} />
            </div>
            <FieldLabel htmlFor="out-notes">Platform notes</FieldLabel>
            <Textarea
              id="out-notes"
              value={value.platformNotes}
              onChange={(e) => onChange({ ...value, platformNotes: e.target.value })}
              className="min-h-[200px]"
            />
          </div>
        ) : null}

        {tab === "checklist" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <CopyButton text={checklistText} label="Copy checklist" />
            </div>
            <FieldLabel htmlFor="out-check">One item per line</FieldLabel>
            <Textarea
              id="out-check"
              value={checklistText}
              onChange={(e) =>
                onChange({
                  ...value,
                  antiAiChecklist: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="min-h-[220px] font-mono text-xs"
            />
          </div>
        ) : null}

        {tab === "edits" ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <CopyButton text={editsText} label="Copy suggestions" />
            </div>
            <FieldLabel htmlFor="out-edits">One suggestion per line</FieldLabel>
            <Textarea
              id="out-edits"
              value={editsText}
              onChange={(e) =>
                onChange({
                  ...value,
                  suggestedEdits: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="min-h-[220px] font-mono text-xs"
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
