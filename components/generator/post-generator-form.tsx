"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  generateDraftAction,
  saveDraftFromGeneratorAction,
} from "@/app/dashboard/new/actions";
import { GeneratedOutput } from "@/components/generator/generated-output";
import { FieldLabel, OptionSelect } from "@/components/generator/option-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  audiences,
  contentTypes,
  ctaStyles,
  lengths,
  platforms,
  tones,
  writingLevels,
} from "@/lib/constants/options";
import type { GeneratedPost } from "@/types/post";

const loadingMessages = [
  "Writing a plain draft...",
  "Removing AI polish...",
  "Checking for marketing fluff...",
];

type PostGeneratorFormProps = {
  defaults: {
    platform: string;
    tone: string;
    writingLevel: string;
    length: string;
  };
};

export function PostGeneratorForm({ defaults }: PostGeneratorFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [savePending, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedPost | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  const mergedDefaults = useMemo(() => {
    const p = searchParams.get("platform") ?? defaults.platform;
    const t = searchParams.get("tone") ?? defaults.tone;
    const w = searchParams.get("writing_level") ?? defaults.writingLevel;
    const l = searchParams.get("length") ?? defaults.length;
    const c = searchParams.get("content_type") ?? "discussion";
    const a = searchParams.get("audience") ?? "general_tech";
    const raw = searchParams.get("raw") ?? "";
    return { platform: p, tone: t, writingLevel: w, length: l, contentType: c, audience: a, raw };
  }, [searchParams, defaults]);

  useEffect(() => {
    if (!pending) return;
    const id = window.setInterval(() => {
      setMsgIdx((i) => (i + 1) % loadingMessages.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [pending]);

  function runGenerate() {
    setError(null);
    const fd = new FormData(formRef.current ?? undefined);
    startTransition(async () => {
      const res = await generateDraftAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setGenerated(res.data);
    });
  }

  function runSave() {
    setError(null);
    if (!generated || !formRef.current) {
      setError("Generate a draft before saving.");
      return;
    }
    const fd = new FormData(formRef.current);
    fd.set("title", generated.title);
    fd.set("mainDraft", generated.mainDraft);
    fd.set("shortVersion", generated.shortVersion);
    fd.set("alternateVersion", generated.alternateVersion);
    fd.set("platformNotes", generated.platformNotes);
    fd.set("antiAiChecklistJson", JSON.stringify(generated.antiAiChecklist));
    fd.set("suggestedEditsJson", JSON.stringify(generated.suggestedEdits));
    startSave(async () => {
      const res = await saveDraftFromGeneratorAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/dashboard/drafts/${res.id}`);
    });
  }

  function clearAll() {
    setGenerated(null);
    setError(null);
    formRef.current?.reset();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <form ref={formRef} className="space-y-4">
        <div className="space-y-1">
          <FieldLabel htmlFor="rawIdea">Raw idea</FieldLabel>
          <Textarea
            id="rawIdea"
            name="rawIdea"
            key={mergedDefaults.raw ? `raw-${mergedDefaults.raw.slice(0, 20)}` : "raw-empty"}
            defaultValue={mergedDefaults.raw}
            required
            placeholder="Rough notes, bullet points, half-formed take..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <OptionSelect
            id="platform"
            label="Platform"
            name="platform"
            options={platforms}
            defaultValue={mergedDefaults.platform}
          />
          <OptionSelect
            id="contentType"
            label="Content type"
            name="contentType"
            options={contentTypes}
            defaultValue={mergedDefaults.contentType}
          />
          <OptionSelect
            id="audience"
            label="Audience"
            name="audience"
            options={audiences}
            defaultValue={mergedDefaults.audience}
          />
          <OptionSelect
            id="writingLevel"
            label="Writing level"
            name="writingLevel"
            options={writingLevels}
            defaultValue={mergedDefaults.writingLevel}
          />
          <OptionSelect
            id="tone"
            label="Tone"
            name="tone"
            options={tones}
            defaultValue={mergedDefaults.tone}
          />
          <OptionSelect
            id="length"
            label="Length"
            name="length"
            options={lengths}
            defaultValue={mergedDefaults.length}
          />
        </div>

        <div className="space-y-1">
          <FieldLabel htmlFor="researchNotes">Research notes (optional)</FieldLabel>
          <Textarea id="researchNotes" name="researchNotes" placeholder="Facts you want respected, no invented citations." />
        </div>
        <div className="space-y-1">
          <FieldLabel htmlFor="avoidList">Things to avoid (optional)</FieldLabel>
          <Textarea id="avoidList" name="avoidList" placeholder="Words, topics, or angles to skip." />
        </div>
        <OptionSelect
          id="ctaStyle"
          label="CTA style"
          name="ctaStyle"
          options={ctaStyles}
          defaultValue="none"
        />

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" disabled={pending} onClick={runGenerate}>
            {pending ? loadingMessages[msgIdx] : "Generate draft"}
          </Button>
          <Button type="button" variant="secondary" disabled={savePending} onClick={runSave}>
            {savePending ? "Saving..." : "Save draft"}
          </Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={runGenerate}>
            Regenerate
          </Button>
          <Button type="button" variant="ghost" onClick={clearAll}>
            Clear
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          This is a draft. Review before posting. Posterr aims for normal writing, not fake
          virality.
        </p>
        {generated ? (
          <GeneratedOutput value={generated} onChange={setGenerated} />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
            <p>Your draft will appear here.</p>
            <p className="mt-2">
              Posterr tries to keep things plain, believable, and useful.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
