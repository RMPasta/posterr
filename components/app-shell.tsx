import Link from "next/link";
import { type ReactNode } from "react";

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function AppShell({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Posterr
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <Link className="hover:text-zinc-900 dark:hover:text-white" href="/dashboard">
              Home
            </Link>
            <Link className="hover:text-zinc-900 dark:hover:text-white" href="/dashboard/new">
              New draft
            </Link>
            <Link className="hover:text-zinc-900 dark:hover:text-white" href="/dashboard/drafts">
              Drafts
            </Link>
            <Link className="hover:text-zinc-900 dark:hover:text-white" href="/dashboard/settings">
              Settings
            </Link>
            {user ? (
              <form action={signOut}>
                <Button type="submit" variant="ghost" className="h-8 px-2 text-sm">
                  Sign out
                </Button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
