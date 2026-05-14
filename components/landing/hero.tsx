import Link from "next/link";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-sky-800 dark:text-sky-300">
        Posterr — AI writing for people who hate AI writing
      </p>
      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        AI writing that does not sound like AI marketing.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-zinc-600 dark:text-zinc-300">
        Posterr turns rough ideas into plain, believable posts for Reddit, blogs, X,
        LinkedIn, devlogs, and product updates.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          Start writing
        </Link>
        <Link
          href="#examples"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          See examples
        </Link>
      </div>
    </section>
  );
}
