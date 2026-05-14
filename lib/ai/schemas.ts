import { z } from "zod";

import {
  audiences,
  contentTypes,
  ctaStyles,
  lengths,
  platforms,
  tones,
  writingLevels,
} from "@/lib/constants/options";

const platformValues = platforms.map((p) => p.value) as [string, ...string[]];
const contentTypeValues = contentTypes.map((c) => c.value) as [string, ...string[]];
const audienceValues = audiences.map((a) => a.value) as [string, ...string[]];
const writingLevelValues = writingLevels.map((w) => w.value) as [string, ...string[]];
const toneValues = tones.map((t) => t.value) as [string, ...string[]];
const lengthValues = lengths.map((l) => l.value) as [string, ...string[]];
const ctaValues = ctaStyles.map((c) => c.value) as [string, ...string[]];

export const GeneratedPostSchema = z.object({
  title: z.string(),
  mainDraft: z.string(),
  shortVersion: z.string(),
  alternateVersion: z.string(),
  platformNotes: z.string(),
  antiAiChecklist: z.array(z.string()),
  suggestedEdits: z.array(z.string()),
});

export const GeneratorInputSchema = z.object({
  rawIdea: z.string().min(1, "Add a raw idea first."),
  platform: z.enum(platformValues),
  contentType: z.enum(contentTypeValues),
  audience: z.enum(audienceValues),
  writingLevel: z.enum(writingLevelValues),
  tone: z.enum(toneValues),
  length: z.enum(lengthValues),
  researchNotes: z.string().optional(),
  avoidList: z.string().optional(),
  ctaStyle: z.enum(ctaValues).optional(),
});

export const SaveDraftInputSchema = z.object({
  title: z.string().min(1),
  rawIdea: z.string().min(1),
  platform: z.enum(platformValues),
  contentType: z.enum(contentTypeValues),
  audience: z.enum(audienceValues),
  writingLevel: z.enum(writingLevelValues),
  tone: z.enum(toneValues),
  length: z.enum(lengthValues),
  researchNotes: z.string().optional().nullable(),
  avoidList: z.string().optional().nullable(),
  ctaStyle: z.string().optional().nullable(),
  mainDraft: z.string().min(1),
  shortVersion: z.string().optional().nullable(),
  alternateVersion: z.string().optional().nullable(),
  platformNotes: z.string().optional().nullable(),
  antiAiChecklist: z.array(z.string()).optional().nullable(),
  suggestedEdits: z.array(z.string()).optional().nullable(),
});

export const UpdateDraftBodySchema = z.object({
  id: z.string().uuid(),
  mainDraft: z.string().min(1),
  shortVersion: z.string().optional().nullable(),
  alternateVersion: z.string().optional().nullable(),
});

export const SettingsUpdateSchema = z.object({
  default_platform: z.enum(platformValues),
  default_tone: z.enum(toneValues),
  default_writing_level: z.enum(writingLevelValues),
  default_length: z.enum(lengthValues),
});

export type GeneratorInputParsed = z.infer<typeof GeneratorInputSchema>;
export type SaveDraftInputParsed = z.infer<typeof SaveDraftInputSchema>;
export type GeneratedPostParsed = z.infer<typeof GeneratedPostSchema>;
