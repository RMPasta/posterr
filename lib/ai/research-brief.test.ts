import { describe, expect, it } from "vitest";

import { formatResearchBriefForPrompt, ResearchBriefSchema } from "@/lib/ai/research-brief";

describe("ResearchBriefSchema", () => {
  it("parses minimal brief", () => {
    const v = ResearchBriefSchema.parse({
      summary: "Two sentences.",
      bullets: ["Point A"],
      sources: [{ title: "Reuters", url: "https://example.com/a" }],
    });
    expect(v.sources).toHaveLength(1);
  });
});

describe("formatResearchBriefForPrompt", () => {
  it("includes outlet names and URLs", () => {
    const s = formatResearchBriefForPrompt({
      summary: "S",
      bullets: ["B1"],
      sources: [{ title: "BBC", url: "https://bbc.com/news" }],
    });
    expect(s).toContain("BBC");
    expect(s).toContain("https://bbc.com/news");
  });
});
