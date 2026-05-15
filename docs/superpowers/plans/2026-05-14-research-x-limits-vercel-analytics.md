# Research-backed drafts, X length caps, style bans, and Vercel Analytics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an automatic web-research pass (current-year aware, cite real outlets), tighten prompts to ban em dashes and “not just X, it’s X” style tropes, enforce X free-tier character limits for generated text, and ship Vercel Web Analytics.

**Architecture:** Split generation into (1) a **research** `generateText` call using OpenAI’s hosted **`web_search`** tool via `createOpenAI(...).tools.webSearch()` so the model can pull recent web context; (2) the existing **structured** `generateText` + `Output.object` pass that consumes a formatted research block plus user `researchNotes`. Post-process X outputs with a small **pure** clamping helper covered by Vitest. Mount **`<Analytics />`** from `@vercel/analytics/react` in the root layout.

**Tech Stack:** Next.js 16 App Router, Vercel AI SDK (`ai`, `generateText`, `Output.object`), `@ai-sdk/openai` (tools), Zod 4, Vitest, `@vercel/analytics`, existing Supabase + dashboard generator.

**Note:** The writing-plans skill suggests a brainstorming worktree; if you use one, branch from `main` and implement there. Not required for correctness.

---

## File map (create / modify)

| Path | Responsibility |
|------|----------------|
| `vitest.config.ts` | Vitest + `@` path alias to repo root |
| `package.json` | `devDependencies`: `vitest`; `scripts`: `test`, `test:watch` |
| `lib/ai/x-platform-text.ts` | `glyphCount`, `clampTextToMax`, X free-tier constants |
| `lib/ai/x-platform-text.test.ts` | Unit tests for counting + clamping |
| `lib/ai/research-brief.ts` | Zod `ResearchBriefSchema`, `formatResearchBriefForPrompt(brief)` |
| `lib/ai/research-brief.test.ts` | Tests for formatter (no network) |
| `lib/ai/gather-research.ts` | `gatherWebResearch(input): Promise<string>` — `generateText` + `web_search` tool |
| `lib/ai/posterr-system-prompt.ts` | Global bans: no em dash / en dash as sentence glue; no “not just … it’s …”; reinforce real citations only |
| `lib/ai/generate-post.ts` | Call `gatherWebResearch` before structured generation; inject brief; apply X clamp after parse |
| `lib/ai/schemas.ts` | Optional: no schema change if brief stays string-only; if you add `sourcesUsed` to output, extend `GeneratedPostSchema` + save path |
| `app/dashboard/new/actions.ts` | No change unless schema adds persisted fields |
| `components/generator/post-generator-form.tsx` | Optional helper text under research field (“Auto web research runs on generate”) |
| `components/generator/generated-output.tsx` | For platform `x`, show glyph counts vs 280 under main/short |
| `app/layout.tsx` | Import and render `<Analytics />` inside `<body>` |
| `package.json` | Add `@vercel/analytics` dependency |
| `docs/setup-and-deployment.md` | Short subsection: enable Analytics in Vercel project; env not required for Web Analytics |

---

### Task 0: Vitest harness

**Files:**

- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add `vitest.config.ts`**

```typescript
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 3: Add npm scripts in `package.json`**

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

(merge with existing `scripts`; keep `dev`, `build`, `lint`.)

- [ ] **Step 4: Smoke test file**

Create `lib/ai/_vitest-smoke.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm run test`  
Expected: PASS (1 file, 1 test).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/ai/_vitest-smoke.test.ts
git commit -m "chore: add vitest for lib unit tests"
```

---

### Task 1: X / Twitter glyph limits and clamp helper

**Files:**

- Create: `lib/ai/x-platform-text.ts`
- Create: `lib/ai/x-platform-text.test.ts`

**Constants (free X tier, 2026):** treat **280** as max glyphs per post (standard post). Reserve headroom so the model rarely trips the wire: e.g. `mainDraft` max **260**, `shortVersion` max **275** when `platform === "x"` and `length === "short"`; for `medium`/`long` on X, cap **both** fields at **280** (single-post mode; no thread in MVP).

- [ ] **Step 1: Write failing tests** — `lib/ai/x-platform-text.test.ts`

```typescript
import { describe, it, expect } from "vitest";

import { clampPostStringsForX, glyphCount, X_FREE_MAX_GLYPHS } from "@/lib/ai/x-platform-text";

describe("glyphCount", () => {
  it("counts astral plane code points as single glyphs", () => {
    expect(glyphCount("A🙂B")).toBe(3);
  });
});

describe("clampPostStringsForX", () => {
  it("short length tightens main and short below 280", () => {
    const main = "x".repeat(400);
    const short = "y".repeat(400);
    const out = clampPostStringsForX(
      { mainDraft: main, shortVersion: short },
      { platform: "x", length: "short" },
    );
    expect(glyphCount(out.mainDraft)).toBeLessThanOrEqual(260);
    expect(glyphCount(out.shortVersion)).toBeLessThanOrEqual(275);
  });

  it("does not change reddit posts", () => {
    const long = "z".repeat(500);
    const out = clampPostStringsForX(
      { mainDraft: long, shortVersion: long },
      { platform: "reddit", length: "short" },
    );
    expect(out.mainDraft).toBe(long);
  });
});
```

Run: `npm run test`  
Expected: **FAIL** (module missing).

- [ ] **Step 2: Implement `lib/ai/x-platform-text.ts`**

```typescript
export const X_FREE_MAX_GLYPHS = 280;

export type LengthOption = "short" | "medium" | "long";

export function glyphCount(s: string): number {
  return [...s].length;
}

export function clampTextToMax(s: string, max: number): string {
  if (glyphCount(s) <= max) return s;
  const chars = [...s];
  return chars.slice(0, max).join("");
}

export function clampPostStringsForX(
  post: { mainDraft: string; shortVersion: string },
  ctx: { platform: string; length: LengthOption },
): { mainDraft: string; shortVersion: string } {
  if (ctx.platform !== "x") return post;

  const mainMax =
    ctx.length === "short" ? 260 : X_FREE_MAX_GLYPHS;
  const shortMax =
    ctx.length === "short" ? 275 : X_FREE_MAX_GLYPHS;

  return {
    mainDraft: clampTextToMax(post.mainDraft, mainMax),
    shortVersion: clampTextToMax(post.shortVersion, shortMax),
  };
}
```

Run: `npm run test`  
Expected: **PASS**.

- [ ] **Step 3: Commit**

```bash
git add lib/ai/x-platform-text.ts lib/ai/x-platform-text.test.ts
git commit -m "feat(ai): clamp X drafts to free-tier glyph limits"
```

---

### Task 2: Prompt bans — em dash and “not just X, it’s X”

**Files:**

- Modify: `lib/ai/posterr-system-prompt.ts`
- Modify: `lib/ai/generate-post.ts` (`buildUserPrompt` tail)

- [ ] **Step 1: Extend system prompt** — in `posterrSystemPrompt` string, add explicit bullets (exact wording for the model):

```
- Never use an em dash (—) or a double hyphen (--) as punctuation. Use commas, periods, or parentheses instead.
- Never use the rhetorical pattern "It's not just X, it's Y" or close variants ("not only X but Y" used as a LinkedIn-style pivot). Say the point plainly in one sentence.
- When you cite web or media, name the outlet and keep the claim tied to what the sources actually say; do not fabricate quotes or URLs.
```

Remove or soften the vague line “Avoid excessive em dashes” (replace with the hard ban above).

- [ ] **Step 2: Extend user prompt footer** — append to `buildUserPrompt` return value:

```
Hard bans for this run:
- No em dash (—) or "--" as punctuation.
- No "not just X, it's Y" style framing.
```

- [ ] **Step 3: Manual check** — `npm run build`  
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add lib/ai/posterr-system-prompt.ts lib/ai/generate-post.ts
git commit -m "fix(ai): ban em-dash glue and not-just-X tropes in prompts"
```

---

### Task 3: Research brief formatter (testable, no network)

**Files:**

- Create: `lib/ai/research-brief.ts`
- Create: `lib/ai/research-brief.test.ts`

- [ ] **Step 1: Failing tests**

```typescript
import { describe, it, expect } from "vitest";

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
```

Run: `npm run test`  
Expected: FAIL (missing module).

- [ ] **Step 2: Implement `lib/ai/research-brief.ts`**

```typescript
import { z } from "zod";

export const ResearchBriefSchema = z.object({
  summary: z.string().min(1),
  bullets: z.array(z.string()).max(8),
  sources: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().url(),
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
```

Run: `npm run test`  
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/ai/research-brief.ts lib/ai/research-brief.test.ts
git commit -m "feat(ai): add research brief schema and prompt formatter"
```

---

### Task 4: Web research gather step (OpenAI tool)

**Files:**

- Create: `lib/ai/gather-research.ts`
- Modify: `lib/ai/generate-post.ts`
- Modify: `docs/setup-and-deployment.md` (note: research uses OpenAI web search; may need eligible model / billing)

- [ ] **Step 1: Implement `gatherWebResearch`**

```typescript
import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

import { formatResearchBriefForPrompt, ResearchBriefSchema } from "@/lib/ai/research-brief";

const ResearchOutputSchema = ResearchBriefSchema;

export async function gatherWebResearch(args: {
  rawIdea: string;
  platform: string;
  audience: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");

  const openai = createOpenAI({ apiKey });
  const modelName = process.env.POSTERR_RESEARCH_MODEL ?? process.env.POSTERR_MODEL ?? "gpt-4.1-mini";

  const { output } = await generateText({
    model: openai(modelName),
    tools: {
      web_search: openai.tools.webSearch(),
    },
    maxSteps: 10,
    output: Output.object({
      schema: ResearchOutputSchema,
      name: "posterr_research_brief",
      description: "Brief factual research with real URLs",
    }),
    system: `You are a careful research assistant. Current calendar year is 2026. Use web_search to find recent, credible reporting or primary sources relevant to the user's idea. Prefer 2025–2026 dates when applicable. Return JSON matching the schema: short summary, tight bullets, and up to 6 sources with real https URLs and recognizable outlet names. Do not invent URLs.`,
    prompt: `User raw idea:\n${args.rawIdea}\n\nPlatform: ${args.platform}\nAudience: ${args.audience}\n\nSearch the web, then output only the structured brief.`,
  });

  if (!output) throw new Error("Research step returned no structured output.");
  const brief = ResearchBriefSchema.parse(output);
  return formatResearchBriefForPrompt(brief);
}
```

**Important:** If `generateText` rejects `tools` + `Output.object` together for your model, split into two calls: (1) `generateText` with tools only, parse text manually; (2) second `generateText` with `Output.object` to normalize into `ResearchBriefSchema`. The implementer must run one real request and adjust.

- [ ] **Step 2: Wire into `generatePost`** — at top of `generatePost`, after parsing `input`:

```typescript
const autoResearch = await gatherWebResearch({
  rawIdea: input.rawIdea,
  platform: input.platform,
  audience: input.audience,
});

const mergedResearch = [autoResearch, input.researchNotes?.trim() || ""]
  .filter(Boolean)
  .join("\n\n---\n\n");
```

Pass `mergedResearch` into `buildUserPrompt` instead of only `input.researchNotes`.

- [ ] **Step 3: Run build**

Run: `npm run build`  
Expected: PASS.

- [ ] **Step 4: Document env** — in `docs/setup-and-deployment.md` env table add optional `POSTERR_RESEARCH_MODEL` (model id that supports hosted web search).

- [ ] **Step 5: Commit**

```bash
git add lib/ai/gather-research.ts lib/ai/generate-post.ts docs/setup-and-deployment.md
git commit -m "feat(ai): web research pass with structured brief for generation"
```

---

### Task 5: Apply X clamp after structured generation

**Files:**

- Modify: `lib/ai/generate-post.ts`
- Modify: `lib/ai/x-platform-text.test.ts` (integration-style case for `clampPostStringsForX` with real-shaped object if needed — optional)

- [ ] **Step 1: Import and apply**

After `GeneratedPostSchema.parse(result)` (or parse once and mutate):

```typescript
import { clampPostStringsForX } from "@/lib/ai/x-platform-text";

const clamped = clampPostStringsForX(
  { mainDraft: result.mainDraft, shortVersion: result.shortVersion },
  { platform: input.platform, length: input.length },
);

return GeneratedPostSchema.parse({
  ...result,
  mainDraft: clamped.mainDraft,
  shortVersion: clamped.shortVersion,
});
```

- [ ] **Step 2: Run tests + build**

Run: `npm run test && npm run build`  
Expected: both PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/ai/generate-post.ts
git commit -m "feat(ai): enforce X glyph limits on generated drafts"
```

---

### Task 6: UI — X character meter (optional but recommended)

**Files:**

- Modify: `components/generator/generated-output.tsx`

- [ ] **Step 1:** When `platform === "x"` (pass platform as prop from `PostGeneratorForm` from form `platform` select or from `mergedDefaults`), show under `mainDraft` / `shortVersion`:

`{glyphCount(text)} / 280` using the same `glyphCount` import from `@/lib/ai/x-platform-text`.

- [ ] **Step 2:** `npm run build`  
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/generator/generated-output.tsx components/generator/post-generator-form.tsx
git commit -m "feat(ui): show X glyph counts for generated drafts"
```

---

### Task 7: Vercel Web Analytics

**Files:**

- Modify: `package.json` / lockfile
- Modify: `app/layout.tsx`
- Modify: `docs/setup-and-deployment.md`

- [ ] **Step 1: Install**

```bash
npm install @vercel/analytics
```

- [ ] **Step 2: Edit `app/layout.tsx`**

```tsx
import { Analytics } from "@vercel/analytics/react";
```

Inside `<body>` after `{children}`:

```tsx
<Analytics />
```

- [ ] **Step 3: Docs** — In `docs/setup-and-deployment.md`, add **§ Vercel Web Analytics**: In Vercel project → Analytics → enable Web Analytics for the project; redeploy; no env var required for default Web Analytics.

- [ ] **Step 4: Build**

Run: `npm run build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app/layout.tsx docs/setup-and-deployment.md
git commit -m "feat: add Vercel Web Analytics"
```

---

## Self-review

**1. Spec coverage**

| Requirement | Task |
|-------------|------|
| AI research + real media citations | Task 3–4 (`gatherWebResearch`, schema with URLs, 2026 in system prompt) |
| Ban em dash / `--` | Task 2 |
| Ban “not just X, it’s X” | Task 2 |
| X free tier length | Task 1, 5, optional 6 |
| Vercel Analytics | Task 7 |
| TDD + small commits | Tasks 0–7 |
| Frequent commits | Each task ends with commit step |

**2. Placeholder scan** — No `TBD` / vague “handle edge cases” without code; model compatibility caveat is explicit in Task 4.

**3. Type consistency** — `LengthOption` matches `GeneratorInputParsed["length"]` (`short` | `medium` | `long`). If `gatherWebResearch` uses `input.length` later, types align.

**Gaps (optional follow-ups, not in this plan):** Persist `sources` JSON on `drafts` table; second `logGeneration` for research token billing; Playwright E2E for login + generate.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-14-research-x-limits-vercel-analytics.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration. **REQUIRED SUB-SKILL:** superpowers:subagent-driven-development.

2. **Inline Execution** — Run tasks in this session using superpowers:executing-plans with checkpoints between tasks.

**Which approach?**
