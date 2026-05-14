import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function LandingExamples() {
  return (
    <section id="examples" className="mt-20 scroll-mt-24">
      <h2 className="text-center text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Example comparison
      </h2>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="border-amber-200/80 dark:border-amber-900/50">
          <CardTitle>Typical AI polish</CardTitle>
          <CardDescription className="mt-2 text-zinc-700 dark:text-zinc-300">
            In today&apos;s fast-paced developer landscape, AI tools are revolutionizing how teams
            unlock productivity...
          </CardDescription>
        </Card>
        <Card className="border-sky-200/80 dark:border-sky-900/50">
          <CardTitle>Posterr-style draft</CardTitle>
          <CardDescription className="mt-2 text-zinc-700 dark:text-zinc-300">
            AI coding tools are useful, but I think there is a tradeoff we are not talking about
            enough. If the tool writes most of the code, developers may get fewer reps with the
            basics.
          </CardDescription>
        </Card>
      </div>
    </section>
  );
}
