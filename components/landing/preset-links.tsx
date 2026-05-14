import Link from "next/link";

import { examplePresets } from "@/lib/constants/presets";

function exampleHref(p: (typeof examplePresets)[number]) {
  const params = new URLSearchParams({
    platform: p.platform,
    content_type: p.contentType,
    tone: p.tone,
    audience: p.audience,
    raw: p.rawIdea,
  });
  const next = `/dashboard/new?${params.toString()}`;
  return `/login?next=${encodeURIComponent(next)}`;
}

export function LandingPresetLinks() {
  return (
    <section className="mt-16">
      <h2 className="text-center text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Example starters
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-300">
        Sign in, then open a preset with fields pre-filled.
      </p>
      <ul className="mx-auto mt-6 max-w-2xl space-y-2 text-sm">
        {examplePresets.map((p) => (
          <li key={p.id}>
            <Link
              href={exampleHref(p)}
              className="block rounded-lg border border-zinc-200 px-3 py-2 text-zinc-800 hover:border-sky-300 hover:bg-sky-50/50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-sky-700 dark:hover:bg-sky-950/30"
            >
              <span className="font-medium">{p.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
