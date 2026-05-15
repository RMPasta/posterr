import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output, zodSchema } from "ai";

import { posterrSystemPrompt } from "@/lib/ai/posterr-system-prompt";
import {
  GeneratedPostSchema,
  type GeneratorInputParsed,
  type GeneratedPostParsed,
} from "@/lib/ai/schemas";

function buildUserPrompt(input: GeneratorInputParsed): string {
  return `Create a post using the following inputs:

Raw idea:
${input.rawIdea}

Platform:
${input.platform}

Content type:
${input.contentType}

Audience:
${input.audience}

Writing level:
${input.writingLevel}

Tone:
${input.tone}

Length:
${input.length}

Research notes:
${input.researchNotes?.trim() || "(none)"}

Things to avoid:
${input.avoidList?.trim() || "(none)"}

CTA style:
${input.ctaStyle ?? "none"}

Hard bans for this run:
- No em dash (—) or "--" as punctuation.
- No "not just X, it's Y" style framing.

Generate:
1. title
2. mainDraft
3. shortVersion
4. alternateVersion
5. platformNotes
6. antiAiChecklist (short bullets the writer should verify)
7. suggestedEdits (concrete tweaks to sound more human)`;
}

export async function generatePost(
  input: GeneratorInputParsed,
): Promise<GeneratedPostParsed> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const modelName = process.env.POSTERR_MODEL ?? "gpt-4.1-mini";
  const openai = createOpenAI({ apiKey });
  const model = openai(modelName);

  const { output: result } = await generateText({
    model,
    system: posterrSystemPrompt,
    prompt: buildUserPrompt(input),
    output: Output.object({
      schema: zodSchema(GeneratedPostSchema),
      name: "posterr_draft",
      description: "Structured plain-language post draft",
    }),
    temperature: 0.7,
  });

  if (!result) {
    throw new Error("Model returned no structured output.");
  }

  return GeneratedPostSchema.parse(result);
}
