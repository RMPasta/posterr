"use server";

import { revalidatePath } from "next/cache";

import { generatePost } from "@/lib/ai/generate-post";
import {
  GeneratorInputSchema,
  SaveDraftInputSchema,
  GeneratedPostSchema,
} from "@/lib/ai/schemas";
import { assertUnderDailyLimit, logGeneration } from "@/lib/db/generation-logs";
import { createClient } from "@/lib/supabase/server";
import type { GeneratedPost } from "@/types/post";

export type GenerateActionResult =
  | { ok: true; data: GeneratedPost }
  | { ok: false; error: string };

export async function generateDraftAction(
  formData: FormData,
): Promise<GenerateActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Your session expired. Sign in again." };
  }

  const doResearchRaw = formData.get("doResearch");
  const doResearch =
    doResearchRaw === null || doResearchRaw === undefined
      ? true
      : !["0", "false", "off", "no"].includes(String(doResearchRaw).trim().toLowerCase());

  const requireCitationsRaw = formData.get("requireCitations");
  const requireCitations =
    requireCitationsRaw === null || requireCitationsRaw === undefined
      ? false
      : !["0", "false", "off", "no"].includes(String(requireCitationsRaw).trim().toLowerCase());

  const parsed = GeneratorInputSchema.safeParse({
    rawIdea: String(formData.get("rawIdea") ?? ""),
    platform: String(formData.get("platform") ?? ""),
    contentType: String(formData.get("contentType") ?? ""),
    audience: String(formData.get("audience") ?? ""),
    writingLevel: String(formData.get("writingLevel") ?? ""),
    tone: String(formData.get("tone") ?? ""),
    length: String(formData.get("length") ?? ""),
    doResearch,
    requireCitations,
    researchNotes: String(formData.get("researchNotes") ?? "") || undefined,
    avoidList: String(formData.get("avoidList") ?? "") || undefined,
    ctaStyle: String(formData.get("ctaStyle") ?? "") || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { ok: false, error: msg };
  }

  try {
    await assertUnderDailyLimit(supabase, user.id);
    const data = await generatePost(parsed.data);
    const checked = GeneratedPostSchema.safeParse(data);
    if (!checked.success) {
      return { ok: false, error: "AI returned an unexpected shape. Try again." };
    }
    await logGeneration(supabase, user.id);
    return { ok: true, data: checked.data };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed.";
    return { ok: false, error: message };
  }
}

export type SaveDraftResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveDraftFromGeneratorAction(
  formData: FormData,
): Promise<SaveDraftResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Your session expired. Sign in again." };
  }

  const anti = String(formData.get("antiAiChecklistJson") ?? "[]");
  const edits = String(formData.get("suggestedEditsJson") ?? "[]");
  let antiList: string[] = [];
  let editList: string[] = [];
  try {
    antiList = JSON.parse(anti) as string[];
    editList = JSON.parse(edits) as string[];
    if (!Array.isArray(antiList) || !Array.isArray(editList)) throw new Error();
  } catch {
    return { ok: false, error: "Could not read checklist or edits." };
  }

  const parsed = SaveDraftInputSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    rawIdea: String(formData.get("rawIdea") ?? ""),
    platform: String(formData.get("platform") ?? ""),
    contentType: String(formData.get("contentType") ?? ""),
    audience: String(formData.get("audience") ?? ""),
    writingLevel: String(formData.get("writingLevel") ?? ""),
    tone: String(formData.get("tone") ?? ""),
    length: String(formData.get("length") ?? ""),
    researchNotes: String(formData.get("researchNotes") ?? "") || null,
    avoidList: String(formData.get("avoidList") ?? "") || null,
    ctaStyle: String(formData.get("ctaStyle") ?? "") || null,
    mainDraft: String(formData.get("mainDraft") ?? ""),
    shortVersion: String(formData.get("shortVersion") ?? "") || null,
    alternateVersion: String(formData.get("alternateVersion") ?? "") || null,
    platformNotes: String(formData.get("platformNotes") ?? "") || null,
    antiAiChecklist: antiList,
    suggestedEdits: editList,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid draft.";
    return { ok: false, error: msg };
  }

  const row = {
    user_id: user.id,
    title: parsed.data.title,
    raw_idea: parsed.data.rawIdea,
    platform: parsed.data.platform,
    content_type: parsed.data.contentType,
    audience: parsed.data.audience,
    writing_level: parsed.data.writingLevel,
    tone: parsed.data.tone,
    length: parsed.data.length,
    research_notes: parsed.data.researchNotes,
    avoid_list: parsed.data.avoidList,
    cta_style: parsed.data.ctaStyle,
    main_draft: parsed.data.mainDraft,
    short_version: parsed.data.shortVersion,
    alternate_version: parsed.data.alternateVersion,
    platform_notes: parsed.data.platformNotes,
    anti_ai_checklist: parsed.data.antiAiChecklist,
    suggested_edits: parsed.data.suggestedEdits,
  };

  const { data, error } = await supabase.from("drafts").insert(row).select("id").single();

  if (error) {
    return { ok: false, error: "Save failed. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/drafts");
  return { ok: true, id: data.id as string };
}
