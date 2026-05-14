export const platforms = [
  { value: "reddit", label: "Reddit" },
  { value: "blog", label: "Blog" },
  { value: "x", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "devlog", label: "Devlog" },
  { value: "product_update", label: "Product Update" },
] as const;

export const contentTypes = [
  { value: "discussion", label: "Discussion post" },
  { value: "educational", label: "Educational post" },
  { value: "product_explanation", label: "Product explanation" },
  { value: "founder_update", label: "Founder update" },
  { value: "research_opinion", label: "Research-backed opinion" },
  { value: "feature_announcement", label: "Feature announcement" },
] as const;

export const audiences = [
  { value: "solo_devs", label: "Solo developers" },
  { value: "junior_devs", label: "Junior developers" },
  { value: "ai_assisted_devs", label: "AI-assisted developers" },
  { value: "engineering_managers", label: "Engineering managers" },
  { value: "startup_founders", label: "Startup founders" },
  { value: "general_tech", label: "General tech audience" },
] as const;

export const writingLevels = [
  { value: "middle_school_simple", label: "Middle school simple" },
  { value: "high_school", label: "High school" },
  { value: "normal_adult", label: "Normal adult" },
  { value: "technical_readable", label: "Technical but readable" },
  { value: "expert", label: "Expert" },
] as const;

export const tones = [
  { value: "boring_credible", label: "Boring but credible" },
  { value: "casual_developer", label: "Casual developer" },
  { value: "skeptical_reddit", label: "Skeptical Reddit user" },
  { value: "calm_founder", label: "Calm founder" },
  { value: "practical_educational", label: "Practical educational" },
  { value: "lightly_opinionated", label: "Lightly opinionated" },
] as const;

export const lengths = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const;

export const ctaStyles = [
  { value: "none", label: "None" },
  { value: "soft", label: "Soft (only if it fits)" },
  { value: "direct", label: "Direct ask" },
] as const;

export type Platform = (typeof platforms)[number]["value"];
export type ContentType = (typeof contentTypes)[number]["value"];
export type Audience = (typeof audiences)[number]["value"];
export type WritingLevel = (typeof writingLevels)[number]["value"];
export type Tone = (typeof tones)[number]["value"];
export type Length = (typeof lengths)[number]["value"];
export type CtaStyle = (typeof ctaStyles)[number]["value"];
