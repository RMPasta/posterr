import { z } from "zod";

export const ResearchBriefSchema = z.object({
  summary: z.string().min(1),
  bullets: z.array(z.string()).max(8),
  sources: z
    .array(
      z.object({
        title: z.string().min(1),
        // Plain string: z.string().url() becomes JSON Schema format "uri", which OpenAI rejects for structured outputs.
        url: z.string().min(1),
      }),
    )
    .max(6),
});

export type ResearchBrief = z.infer<typeof ResearchBriefSchema>;

export function formatResearchBriefForPrompt(b: ResearchBrief): string {
  const lines = [
    "WEB RESEARCH (use only for factual grounding; paraphrase; no fabricated quotes):",
    `Summary: ${b.summary}`,
    "Bullets:",
    ...b.bullets.map((x) => `- ${x}`),
    "Sources (name these in the post when you rely on them):",
    ...b.sources.map((s) => `- ${s.title}: ${s.url}`),
  ];
  return lines.join("\n");
}
