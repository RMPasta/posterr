import type {
  Audience,
  ContentType,
  CtaStyle,
  Length,
  Platform,
  Tone,
  WritingLevel,
} from "@/lib/constants/options";

export type QuickStartKey =
  | "reddit_discussion"
  | "blog_post"
  | "x_post"
  | "linkedin_post"
  | "devlog";

export type GeneratedPost = {
  title: string;
  mainDraft: string;
  shortVersion: string;
  alternateVersion: string;
  platformNotes: string;
  antiAiChecklist: string[];
  suggestedEdits: string[];
};

export type GeneratorInput = {
  rawIdea: string;
  platform: Platform;
  contentType: ContentType;
  audience: Audience;
  writingLevel: WritingLevel;
  tone: Tone;
  length: Length;
  doResearch?: boolean;
  researchNotes?: string;
  avoidList?: string;
  ctaStyle?: CtaStyle;
};
