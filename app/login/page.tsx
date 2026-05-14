import Link from "next/link";

import { sendMagicLink } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string; message?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <Card>
        <CardTitle className="text-lg">Sign in to Posterr</CardTitle>
        <CardDescription className="mt-1">
          Magic link login. No password to forget.
        </CardDescription>

        {sp.check_email ? (
          <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-100">
            Check your email for the sign-in link.
          </p>
        ) : null}

        {sp.error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
            {sp.error === "missing_email"
              ? "Enter an email address."
              : sp.error === "auth"
                ? "Authentication failed. Request a new link."
                : sp.message
                  ? decodeURIComponent(sp.message)
                  : "Something went wrong. Try again."}
          </p>
        ) : null}

        <form action={sendMagicLink} className="mt-6 space-y-3">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
          <Button type="submit" variant="primary" className="w-full">
            Email me a link
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          <Link href="/" className="text-sky-700 hover:underline dark:text-sky-400">
            Back to home
          </Link>
        </p>
      </Card>
    </div>
  );
}
