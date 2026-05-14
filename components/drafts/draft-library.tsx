"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DraftCard } from "@/components/drafts/draft-card";
import { Input } from "@/components/ui/input";
import { platforms } from "@/lib/constants/options";
import type { DraftRow } from "@/types/database";

type Props = {
  drafts: DraftRow[];
};

export function DraftLibrary({ drafts }: Props) {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return drafts
      .filter((d) => (platform === "all" ? true : d.platform === platform))
      .filter((d) => {
        if (!needle) return true;
        return (
          d.title.toLowerCase().includes(needle) ||
          d.raw_idea.toLowerCase().includes(needle) ||
          d.main_draft.toLowerCase().includes(needle)
        );
      });
  }, [drafts, q, platform]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor="search" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Search title or idea
          </label>
          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
          />
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="pf" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Platform
          </label>
          <select
            id="pf"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">All</option>
            {platforms.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
          No drafts yet. Start with a rough idea and Posterr will turn it into something usable.
        </p>
      ) : (
        <ul className="grid gap-4">
          {filtered.map((d) => (
            <li key={d.id}>
              <Link href={`/dashboard/drafts/${d.id}`}>
                <DraftCard draft={d} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
