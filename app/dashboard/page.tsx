import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { quickStartPresets } from "@/lib/constants/presets";
import { listDraftsForUser } from "@/lib/db/drafts";
import { getProfile } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";
import type { DraftRow } from "@/types/database";

function buildNewUrl(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `/dashboard/new?${q.toString()}`;
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, drafts] = await Promise.all([
    getProfile(supabase, user.id),
    listDraftsForUser(supabase, user.id),
  ]);

  const recent = drafts.slice(0, 5) as DraftRow[];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Defaults: {profile?.default_platform ?? "reddit"} · {profile?.default_tone ?? "boring_credible"} ·{" "}
            {profile?.default_writing_level ?? "normal_adult"} · {profile?.default_length ?? "medium"}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          New draft
        </Link>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Quick start
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(quickStartPresets) as Array<keyof typeof quickStartPresets>).map((key) => {
            const p = quickStartPresets[key];
            return (
              <Link key={key} href={buildNewUrl(p.params)}>
                <Card className="h-full transition-colors hover:border-sky-300 dark:hover:border-sky-700">
                  <CardTitle>{p.label}</CardTitle>
                  <CardDescription>{p.description}</CardDescription>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Recent drafts
          </h2>
          <Link href="/dashboard/drafts" className="text-sm text-sky-700 hover:underline dark:text-sky-400">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No drafts yet. Start with a rough idea and Posterr will turn it into something usable.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {recent.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dashboard/drafts/${d.id}`}
                  className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{d.title}</span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {d.platform} · {new Date(d.created_at).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
