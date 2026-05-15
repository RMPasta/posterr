import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output, zodSchema } from "ai";

import { gatherWebResearch } from "@/lib/ai/gather-research";
import { posterrSystemPrompt } from "@/lib/ai/posterr-system-prompt";
import {
  GeneratedPostSchema,
  type GeneratorInputParsed,
  type GeneratedPostParsed,
} from "@/lib/ai/schemas";
import { clampPostStringsForX, type LengthOption } from "@/lib/ai/x-platform-text";

function buildUserPrompt(input: GeneratorInputParsed, mergedResearch: string): string {
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

Research context:
${mergedResearch.trim() || "(none)"}

Things to avoid:
${input.avoidList?.trim() || "(none)"}

CTA style:
${input.ctaStyle ?? "none"}
${
  input.platform === "x"
    ? `
X layout for this run:
- In mainDraft, shortVersion, and alternateVersion, prefer extra line breaks over dense paragraphs: short lines, newlines between thoughts, blank lines between distinct beats.
`
    : ""
}
Hard bans for this run:
- No em dash (—) or "--" as punctuation.
- No "not just X, it's Y" style framing.
${
  input.requireCitations
    ? `
Citation mode (required for this run):
- In mainDraft, shortVersion, and alternateVersion, cite sources for substantive factual claims that rest on the research context (not on the raw idea alone).
- Use a compact style: outlet or site name plus the page URL in parentheses when length allows; on very tight limits (for example X), put the outlet name in the sentence and add the URL on the next short line or in platformNotes if the body cannot fit.
- Only cite sources that appear in the research context above. Do not invent URLs or outlets.
- If the research context does not support a claim, soften or remove the claim instead of fabricating a citation.
`
    : ""
}
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

  const notes = input.researchNotes?.trim() ?? "";
  let mergedResearch: string;
  if (input.doResearch) {
    const webBlock = await gatherWebResearch({
      rawIdea: input.rawIdea,
      platform: input.platform,
      audience: input.audience,
    });
    mergedResearch = [webBlock, notes].filter((s) => s.length > 0).join("\n\n---\n\n");
  } else {
    mergedResearch =
      notes ||
      "Automated web research was turned off for this run. Rely on the raw idea and cautious language; do not invent outlets, stats, or URLs.";
  }

  const modelName = process.env.POSTERR_MODEL ?? "gpt-4.1-mini";
  const openai = createOpenAI({ apiKey });
  const model = openai(modelName);

  const { output: result } = await generateText({
    model,
    system: posterrSystemPrompt,
    prompt: buildUserPrompt(input, mergedResearch),
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

  const parsed = GeneratedPostSchema.parse(result);
  const clamped = clampPostStringsForX(
    { mainDraft: parsed.mainDraft, shortVersion: parsed.shortVersion },
    { platform: input.platform, length: input.length as LengthOption },
  );

  return GeneratedPostSchema.parse({
    ...parsed,
    mainDraft: clamped.mainDraft,
    shortVersion: clamped.shortVersion,
  });
}
