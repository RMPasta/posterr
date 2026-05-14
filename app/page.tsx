import Link from "next/link";

import { FeatureGrid } from "@/components/landing/feature-grid";
import { LandingExamples } from "@/components/landing/examples";
import { LandingHero } from "@/components/landing/hero";
import { LandingPresetLinks } from "@/components/landing/preset-links";
import { LandingProblem } from "@/components/landing/problem";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <LandingHero />
      <LandingProblem />
      <FeatureGrid />
      <LandingExamples />
      <LandingPresetLinks />
      <footer className="mt-20 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        <p>Posterr — AI writing workbench. Normal human writing, not engagement bait.</p>
        <p className="mt-2">
          <Link href="/login" className="text-sky-700 hover:underline dark:text-sky-400">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
}
