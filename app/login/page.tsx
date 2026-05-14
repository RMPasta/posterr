import Link from "next/link";

import { signInWithGoogle } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next?.trim() && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/dashboard";

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <Card>
        <CardTitle className="text-lg">Sign in to Posterr</CardTitle>
        <CardDescription className="mt-1">
          Continue with your Google account. No separate Posterr password.
        </CardDescription>

        {sp.error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
            {sp.message
              ? decodeURIComponent(sp.message)
              : sp.error === "auth"
                ? "Authentication failed. Try signing in again."
                : "Something went wrong. Try again."}
          </p>
        ) : null}

        <form action={signInWithGoogle} className="mt-6">
          <input type="hidden" name="next" value={next} />
          <Button type="submit" variant="primary" className="w-full">
            Continue with Google
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
