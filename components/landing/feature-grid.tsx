import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Platform-aware",
    body: "Tone and shape tuned for Reddit, blogs, X, LinkedIn, devlogs, and product updates.",
  },
  {
    title: "Readability controls",
    body: "Pick audience and writing level so the draft matches who will read it.",
  },
  {
    title: "Anti-hype writing",
    body: "Defaults away from viral hooks, fake authority, and obvious AI cadence.",
  },
  {
    title: "Research-note support",
    body: "Paste notes and keep claims grounded. No invented citations.",
  },
  {
    title: "Draft library",
    body: "Save, search, and revisit drafts without leaving the workbench.",
  },
  {
    title: "Copy-ready outputs",
    body: "Main draft plus shorter and alternate versions with practical notes.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mt-20">
      <h2 className="text-center text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        What you get
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardTitle>{f.title}</CardTitle>
            <CardDescription>{f.body}</CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
