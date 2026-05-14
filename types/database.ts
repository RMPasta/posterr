export type ProfileRow = {
  id: string;
  email: string | null;
  default_platform: string;
  default_tone: string;
  default_writing_level: string;
  default_length: string;
  created_at: string;
  updated_at: string;
};

export type DraftRow = {
  id: string;
  user_id: string;
  title: string;
  raw_idea: string;
  platform: string;
  content_type: string;
  audience: string;
  writing_level: string;
  tone: string;
  length: string;
  research_notes: string | null;
  avoid_list: string | null;
  cta_style: string | null;
  main_draft: string;
  short_version: string | null;
  alternate_version: string | null;
  platform_notes: string | null;
  anti_ai_checklist: string[] | null;
  suggested_edits: string[] | null;
  created_at: string;
  updated_at: string;
};
