import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs, zodSchema } from "ai";

import { formatResearchBriefForPrompt, ResearchBriefSchema } from "@/lib/ai/research-brief";

export async function gatherWebResearch(args: {
  rawIdea: string;
  platform: string;
  audience: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const openai = createOpenAI({ apiKey });
  const modelName = process.env.POSTERR_RESEARCH_MODEL ?? "gpt-4o-mini";

  const { output } = await generateText({
    model: openai(modelName),
    tools: {
      web_search: openai.tools.webSearch(),
    },
    stopWhen: stepCountIs(10),
    output: Output.object({
      schema: zodSchema(ResearchBriefSchema),
      name: "posterr_research_brief",
      description: "Brief factual research with real URLs",
    }),
    system: `You are a careful research assistant. The current calendar year is 2026. Use the web_search tool to find recent, credible reporting or primary sources relevant to the user's idea. Prefer 2025–2026 material when applicable. Return structured data matching the schema: a short summary, tight bullets, and up to 6 sources with real https URLs and recognizable outlet names. Do not invent URLs.`,
    prompt: `User raw idea:\n${args.rawIdea}\n\nPlatform: ${args.platform}\nAudience: ${args.audience}\n\nSearch the web, then output only the structured brief.`,
  });

  if (!output) {
    throw new Error("Research step returned no structured output.");
  }

  const brief = ResearchBriefSchema.parse(output);
  return formatResearchBriefForPrompt(brief);
}
