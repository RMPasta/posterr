import { OptionSelect } from "@/components/generator/option-select";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  lengths,
  platforms,
  tones,
  writingLevels,
} from "@/lib/constants/options";
import { getProfile } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";

import { updateSettingsAction } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(supabase, user.id);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Defaults apply when you open the generator.
        </p>
      </div>

      {sp.saved ? (
        <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-100">
          Settings saved.
        </p>
      ) : null}
      {sp.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {sp.error === "save"
            ? "Could not save settings."
            : decodeURIComponent(sp.error)}
        </p>
      ) : null}

      <Card>
        <CardTitle className="text-base">Account</CardTitle>
        <CardDescription className="mt-2">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Email</span>
          <br />
          {user.email ?? profile?.email ?? "—"}
        </CardDescription>
      </Card>

      <form action={updateSettingsAction} className="space-y-4">
        <OptionSelect
          id="default_platform"
          label="Default platform"
          name="default_platform"
          options={platforms}
          defaultValue={profile?.default_platform ?? "reddit"}
        />
        <OptionSelect
          id="default_tone"
          label="Default tone"
          name="default_tone"
          options={tones}
          defaultValue={profile?.default_tone ?? "boring_credible"}
        />
        <OptionSelect
          id="default_writing_level"
          label="Default writing level"
          name="default_writing_level"
          options={writingLevels}
          defaultValue={profile?.default_writing_level ?? "normal_adult"}
        />
        <OptionSelect
          id="default_length"
          label="Default length"
          name="default_length"
          options={lengths}
          defaultValue={profile?.default_length ?? "medium"}
        />
        <Button type="submit" variant="primary">
          Save settings
        </Button>
      </form>
    </div>
  );
}
